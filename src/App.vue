<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { signInWithUsername, signUpWithUsername } from './lib/auth'
import { appendEmptySet, createEmptySet, type EditableSet, type LoadBasis } from './lib/workout'
import { isSupabaseConfigured, requireSupabase, supabase } from './lib/supabase'

type Alternative = { id: string; name: string }
type PlanExercise = {
  id: string
  name: string
  position: number
  target_sets_min: number
  target_sets_max: number
  is_optional: boolean
  prescription_notes: string | null
  alternatives: Alternative[]
}
type PlanDay = { id: string; name: string; position: number; exercises: PlanExercise[] }
type PlanCard = { id: string; name: string; versionId: string; versionNumber: number; days: PlanDay[] }
type DayDraft = { name: string; exercises: ExercisePlanDraft[] }
type ExercisePlanDraft = { name: string; min: number; max: number; optional: boolean; notes: string; alternatives: string }
type ExerciseDraft = {
  planExerciseId: string
  actualName: string
  selectedAlternativeId: string | null
  status: 'completed' | 'skipped'
  sets: EditableSet[]
}
type WorkoutDraft = { id: string; plan: PlanCard; day: PlanDay; exercises: ExerciseDraft[] }
type HistoryEntry = { id: string; started_at: string; status: string; plan_day_id: string; plan_version_id: string; planName: string; dayName: string }

const authMode = ref<'login' | 'signup'>('login')
const form = reactive({ username: '', email: '', password: '', confirmPassword: '' })
const busy = ref(false)
const authError = ref('')
const authMessage = ref('')
const user = ref<User | null>(null)
const page = ref<'home' | 'plans' | 'history' | 'session'>('home')
const plans = ref<PlanCard[]>([])
const history = ref<HistoryEntry[]>([])
const historyFilter = ref('')
const dataError = ref('')
const saving = ref(false)
const workout = ref<WorkoutDraft | null>(null)
const draftPlanName = ref('')
const draftDays = ref<DayDraft[]>([newDayDraft()])
const planModalOpen = ref(false)

function newExerciseDraft(): ExercisePlanDraft {
  return { name: '', min: 2, max: 2, optional: false, notes: '', alternatives: '' }
}
function newDayDraft(): DayDraft {
  return { name: '', exercises: [newExerciseDraft()] }
}

const isSignedIn = computed(() => Boolean(user.value))
const filteredHistory = computed(() => {
  const term = historyFilter.value.trim().toLocaleLowerCase('it-IT')
  if (!term) return history.value
  return history.value.filter((entry) => `${entry.planName} ${entry.dayName}`.toLocaleLowerCase('it-IT').includes(term))
})

function changeAuthMode(mode: 'login' | 'signup') {
  authMode.value = mode
  authError.value = ''
  authMessage.value = ''
}

async function submitAuth() {
  authError.value = ''
  authMessage.value = ''
  if (!isSupabaseConfigured) {
    authError.value = 'Collegamento Supabase da configurare prima di accedere.'
    return
  }
  if (authMode.value === 'signup' && form.password !== form.confirmPassword) {
    authError.value = 'Le password non corrispondono.'
    return
  }
  busy.value = true
  try {
    if (authMode.value === 'signup') {
      const { data, error } = await signUpWithUsername(form)
      if (error) throw error
      if (data.session) user.value = data.session.user
      else authMessage.value = 'Controlla la tua email per confermare la registrazione.'
    } else {
      const result = await signInWithUsername(form)
      if (result.user) user.value = result.user
    }
  } catch (error) {
    authError.value = error instanceof Error ? error.message : 'Operazione non riuscita. Riprova.'
  } finally {
    busy.value = false
  }
}

async function loadPlans() {
  if (!user.value || !supabase) return
  dataError.value = ''
  try {
    const { data, error } = await supabase.from('training_plans')
      .select('id,name,created_at')
      .is('archived_at', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    const rows = (data ?? []) as Array<{ id: string; name: string }>
    const loaded: PlanCard[] = []
    for (const plan of rows) {
      const { data: version, error: versionError } = await supabase.from('plan_versions')
        .select('id,version_number')
        .eq('training_plan_id', plan.id)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (versionError) throw versionError
      if (!version) continue
      const { data: dayRows, error: dayError } = await supabase.from('plan_days')
        .select('id,name,position')
        .eq('plan_version_id', version.id)
        .order('position')
      if (dayError) throw dayError
      const days: PlanDay[] = []
      for (const day of (dayRows ?? []) as Array<{ id: string; name: string; position: number }>) {
        const { data: exerciseRows, error: exerciseError } = await supabase.from('plan_exercises')
          .select('id,name,position,target_sets_min,target_sets_max,is_optional,prescription_notes')
          .eq('plan_day_id', day.id)
          .order('position')
        if (exerciseError) throw exerciseError
        const exercises: PlanExercise[] = []
        for (const exercise of (exerciseRows ?? []) as Omit<PlanExercise, 'alternatives'>[]) {
          const { data: alternatives, error: alternativeError } = await supabase.from('plan_exercise_alternatives')
            .select('id,name')
            .eq('plan_exercise_id', exercise.id)
            .order('position')
          if (alternativeError) throw alternativeError
          exercises.push({ ...exercise, alternatives: (alternatives ?? []) as Alternative[] })
        }
        days.push({ ...day, exercises })
      }
      loaded.push({ id: plan.id, name: plan.name, versionId: version.id, versionNumber: version.version_number, days })
    }
    plans.value = loaded
  } catch {
    dataError.value = 'Non riesco a caricare le schede. Verifica che le policy RLS siano configurate.'
  }
}

function openPlanForm() {
  draftPlanName.value = ''
  draftDays.value = [newDayDraft()]
  planModalOpen.value = true
}
function addDayDraft() { draftDays.value.push(newDayDraft()) }
function removeDayDraft(index: number) {
  if (draftDays.value.length > 1) draftDays.value.splice(index, 1)
}
function addExerciseDraft(day: DayDraft) { day.exercises.push(newExerciseDraft()) }
function removeExerciseDraft(day: DayDraft, index: number) {
  if (day.exercises.length > 1) day.exercises.splice(index, 1)
}

async function createPlan() {
  dataError.value = ''
  if (!user.value) return
  const validDays = draftDays.value.filter((day) => day.name.trim())
  if (!draftPlanName.value.trim() || !validDays.length || validDays.some((day) => !day.exercises.some((exercise) => exercise.name.trim()))) {
    dataError.value = 'Inserisci il nome della scheda, almeno un giorno e un esercizio per ogni giorno.'
    return
  }
  saving.value = true
  try {
    const client = requireSupabase()
    const { data: plan, error: planError } = await client.from('training_plans')
      .insert({ user_id: user.value.id, name: draftPlanName.value.trim() })
      .select('id').single()
    if (planError) throw planError
    const planId = (plan as { id: string }).id
    const { data: version, error: versionError } = await client.from('plan_versions')
      .insert({ user_id: user.value.id, training_plan_id: planId, version_number: 1 })
      .select('id').single()
    if (versionError) throw versionError
    const versionId = (version as { id: string }).id
    for (let dayIndex = 0; dayIndex < validDays.length; dayIndex += 1) {
      const dayDraft = validDays[dayIndex]
      const { data: day, error: dayError } = await client.from('plan_days')
        .insert({ user_id: user.value.id, plan_version_id: versionId, name: dayDraft.name.trim(), position: dayIndex + 1 })
        .select('id').single()
      if (dayError) throw dayError
      const dayId = (day as { id: string }).id
      const exercises = dayDraft.exercises.filter((exercise) => exercise.name.trim())
      for (let index = 0; index < exercises.length; index += 1) {
        const draft = exercises[index]
        const minimum = Math.max(0, Number(draft.min) || 0)
        const maximum = Math.max(minimum, Number(draft.max) || minimum)
        const { data: exercise, error: exerciseError } = await client.from('plan_exercises')
          .insert({
            user_id: user.value.id,
            plan_day_id: dayId,
            name: draft.name.trim(),
            position: index + 1,
            target_sets_min: minimum,
            target_sets_max: maximum,
            is_optional: draft.optional,
            prescription_notes: draft.notes.trim() || null,
          })
          .select('id').single()
        if (exerciseError) throw exerciseError
        const alternativeNames = draft.alternatives.split(',').map((name) => name.trim()).filter(Boolean)
        if (alternativeNames.length) {
          const exerciseId = (exercise as { id: string }).id
          const { error: alternativesError } = await client.from('plan_exercise_alternatives').insert(
            alternativeNames.map((name, alternativeIndex) => ({
              user_id: user.value!.id,
              plan_exercise_id: exerciseId,
              name,
              position: alternativeIndex + 1,
            })),
          )
          if (alternativesError) throw alternativesError
        }
      }
    }
    planModalOpen.value = false
    await loadPlans()
  } catch {
    dataError.value = 'Non sono riuscito a salvare la scheda. Ricarica e controlla prima di riprovare per evitare duplicati.'
  } finally {
    saving.value = false
  }
}

async function startWorkout(plan: PlanCard, day: PlanDay) {
  dataError.value = ''
  if (!user.value) return
  saving.value = true
  try {
    const client = requireSupabase()
    const { data, error } = await client.from('workout_sessions')
      .insert({ user_id: user.value.id, plan_version_id: plan.versionId, plan_day_id: day.id })
      .select('id').single()
    if (error) throw error
    const id = (data as { id: string }).id
    workout.value = {
      id,
      plan,
      day,
      exercises: day.exercises.map((exercise) => {
        const initialCount = exercise.is_optional ? 0 : Math.max(1, exercise.target_sets_min)
        return {
          planExerciseId: exercise.id,
          actualName: exercise.name,
          selectedAlternativeId: null,
          status: 'completed',
          sets: Array.from({ length: Math.min(initialCount, 12) }, (_, index) => createEmptySet(index + 1)),
        }
      }),
    }
    page.value = 'session'
  } catch {
    dataError.value = 'Non sono riuscito ad aprire l’allenamento. Riprova.'
  } finally {
    saving.value = false
  }
}

function planExerciseFor(draft: ExerciseDraft) {
  return workout.value?.day.exercises.find((exercise) => exercise.id === draft.planExerciseId)
}
function chooseAlternative(draft: ExerciseDraft, alternativeId: string) {
  draft.selectedAlternativeId = alternativeId || null
  const alternative = planExerciseFor(draft)?.alternatives.find((item) => item.id === alternativeId)
  if (alternative) draft.actualName = alternative.name
}
function addSet(exercise: ExerciseDraft) {
  exercise.sets = appendEmptySet(exercise.sets)
}
function removeSet(exercise: ExerciseDraft, index: number) {
  exercise.sets.splice(index, 1)
  exercise.sets.forEach((set, setIndex) => { set.position = setIndex + 1 })
}
function addSetNote(set: EditableSet) { set.notes.push('') }
function removeSetNote(set: EditableSet, index: number) {
  if (set.notes.length > 1) set.notes.splice(index, 1)
}

async function finishWorkout() {
  if (!workout.value || !user.value) return
  const current = workout.value
  dataError.value = ''
  saving.value = true
  try {
    const client = requireSupabase()
    for (let index = 0; index < current.exercises.length; index += 1) {
      const exercise = current.exercises[index]
      const { data, error } = await client.from('workout_exercises').insert({
        user_id: user.value.id,
        workout_session_id: current.id,
        plan_day_id: current.day.id,
        plan_exercise_id: exercise.planExerciseId,
        selected_alternative_id: exercise.selectedAlternativeId,
        actual_name: exercise.actualName.trim(),
        status: exercise.status,
        position: index + 1,
      }).select('id').single()
      if (error) throw error
      if (exercise.status === 'skipped' || !exercise.sets.length) continue
      const workoutExerciseId = (data as { id: string }).id
      for (const set of exercise.sets) {
        const { data: insertedSet, error: setError } = await client.from('exercise_sets').insert({
          user_id: user.value.id,
          workout_exercise_id: workoutExerciseId,
          position: set.position,
          reps: set.reps.trim() ? Number(set.reps) : null,
          weight_kg: set.weightKg.trim() ? Number(set.weightKg) : null,
          load_basis: set.loadBasis as LoadBasis,
        }).select('id').single()
        if (setError) throw setError
        const notes = set.notes.map((text) => text.trim()).filter(Boolean)
        if (notes.length) {
          const { error: notesError } = await client.from('set_notes').insert(
            notes.map((text, noteIndex) => ({
              user_id: user.value!.id,
              exercise_set_id: (insertedSet as { id: string }).id,
              text,
              position: noteIndex + 1,
            })),
          )
          if (notesError) throw notesError
        }
      }
    }
    const { error: completeError } = await client.from('workout_sessions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', current.id)
    if (completeError) throw completeError
    workout.value = null
    page.value = 'history'
    await loadHistory()
  } catch {
    dataError.value = 'Salvataggio interrotto. La sessione resta in corso; controlla lo storico prima di ripetere il salvataggio.'
  } finally {
    saving.value = false
  }
}

async function cancelWorkout() {
  if (!workout.value) return
  const current = workout.value
  const { error } = await requireSupabase().from('workout_sessions').delete().eq('id', current.id)
  if (error) {
    dataError.value = 'Non sono riuscito ad annullare la sessione.'
    return
  }
  workout.value = null
  page.value = 'home'
}

async function loadHistory() {
  if (!user.value || !supabase) return
  const { data, error } = await supabase.from('workout_sessions')
    .select('id,started_at,status,plan_day_id,plan_version_id')
    .order('started_at', { ascending: false })
    .limit(50)
  if (error) {
    dataError.value = 'Non riesco a caricare lo storico.'
    return
  }
  const entries: HistoryEntry[] = []
  for (const row of (data ?? []) as Array<Omit<HistoryEntry, 'planName' | 'dayName'>>) {
    const { data: day } = await supabase.from('plan_days').select('name').eq('id', row.plan_day_id).maybeSingle()
    const { data: version } = await supabase.from('plan_versions').select('training_plan_id').eq('id', row.plan_version_id).maybeSingle()
    const { data: plan } = version
      ? await supabase.from('training_plans').select('name').eq('id', version.training_plan_id).maybeSingle()
      : { data: null }
    entries.push({ ...row, dayName: (day as { name?: string } | null)?.name ?? 'Giorno', planName: (plan as { name?: string } | null)?.name ?? 'Scheda' })
  }
  history.value = entries
}

async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
  user.value = null
  plans.value = []
  history.value = []
  page.value = 'home'
}

let authSubscription: { unsubscribe: () => void } | undefined
onMounted(async () => {
  if (!supabase) return
  const { data } = await supabase.auth.getSession()
  user.value = data.session?.user ?? null
  if (user.value) {
    await loadPlans()
    await loadHistory()
  }
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
    if (session) window.setTimeout(() => { void loadPlans(); void loadHistory() }, 0)
  })
  authSubscription = listener.subscription
})
onUnmounted(() => authSubscription?.unsubscribe())
</script>

<template>
  <main v-if="!isSignedIn" class="auth-layout">
    <section class="auth-aside">
      <a class="brand" href="#" aria-label="SickFit home"><span class="brand-mark">S</span><span>SickFit</span></a>
      <div class="auth-pitch">
        <span class="eyebrow">IL TUO ALLENAMENTO, SENZA ATTRITO</span>
        <h1>Costanza<br /><em>in movimento.</em></h1>
        <p>Le tue schede, le tue serie, il tuo percorso. Tutto in un posto solo.</p>
        <div class="pitch-note"><span class="live-dot"></span> I tuoi dati restano privati e separati per account.</div>
      </div>
      <span class="aside-foot">SICKFIT · ALLENATI CON INTENZIONE</span>
    </section>
    <section class="auth-main">
      <div class="auth-card">
        <div class="auth-mobile-brand"><span class="brand-mark">S</span><span>SickFit</span></div>
        <span class="eyebrow">BENTORNATO</span>
        <h2>{{ authMode === 'login' ? 'Accedi al tuo spazio' : 'Crea il tuo account' }}</h2>
        <p class="subcopy">{{ authMode === 'login' ? 'Riprendi da dove avevi lasciato.' : 'Inizia a costruire il tuo storico.' }}</p>
        <div class="auth-switch" role="tablist" aria-label="Tipo di accesso">
          <button :class="{ active: authMode === 'login' }" type="button" @click="changeAuthMode('login')">Accedi</button>
          <button :class="{ active: authMode === 'signup' }" type="button" @click="changeAuthMode('signup')">Registrati</button>
        </div>
        <form class="auth-form" @submit.prevent="submitAuth">
          <label>Username
            <input v-model="form.username" autocomplete="username" required minlength="3" maxlength="32" placeholder="Il tuo username" />
          </label>
          <label>Email
            <input v-model="form.email" type="email" autocomplete="email" required placeholder="nome@email.com" />
          </label>
          <label>Password
            <input v-model="form.password" type="password" :autocomplete="authMode === 'login' ? 'current-password' : 'new-password'" required minlength="8" placeholder="Almeno 8 caratteri" />
          </label>
          <label v-if="authMode === 'signup'">Conferma password
            <input v-model="form.confirmPassword" type="password" autocomplete="new-password" required minlength="8" placeholder="Ripeti la password" />
          </label>
          <p v-if="authError" class="form-message error" role="alert">{{ authError }}</p>
          <p v-if="authMessage" class="form-message success" role="status">{{ authMessage }}</p>
          <button class="button primary full" type="submit" :disabled="busy">
            {{ busy ? 'Attendi…' : authMode === 'login' ? 'Accedi' : 'Crea account' }} <span aria-hidden="true">↗</span>
          </button>
        </form>
        <p v-if="!isSupabaseConfigured" class="setup-note">Collegamento Supabase da configurare prima di usare l’accesso.</p>
        <p class="privacy-note">Accedendo, i tuoi allenamenti rimangono associati al tuo account.</p>
      </div>
    </section>
  </main>

  <main v-else class="app-shell">
    <aside class="sidebar">
      <a class="brand" href="#" @click.prevent="page = 'home'"><span class="brand-mark">S</span><span>SickFit</span></a>
      <span class="nav-caption">IL TUO SPAZIO</span>
      <nav class="side-nav" aria-label="Navigazione principale">
        <button :class="{ selected: page === 'home' }" @click="page = 'home'"><span>⌂</span> Panoramica</button>
        <button :class="{ selected: page === 'plans' }" @click="page = 'plans'"><span>▤</span> Schede</button>
        <button :class="{ selected: page === 'history' }" @click="page = 'history'; loadHistory()"><span>◷</span> Storico</button>
      </nav>
      <div class="sidebar-bottom">
        <div class="user-chip"><span class="avatar">{{ (user?.email?.[0] ?? 'S').toUpperCase() }}</span><span class="user-text"><strong>{{ user?.email }}</strong><small>Account personale</small></span></div>
        <button class="signout-button" @click="signOut">Esci <span>↗</span></button>
      </div>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div><span class="breadcrumb">SICKFIT <span>/</span> {{ page === 'history' ? 'STORICO' : page === 'plans' ? 'SCHEDE' : page === 'session' ? 'ALLENAMENTO' : 'PANORAMICA' }}</span></div>
        <div class="topbar-right"><span class="online-pill"><i></i> Online</span><button class="avatar top-avatar" :aria-label="`Account ${user?.email ?? ''}`">{{ (user?.email?.[0] ?? 'S').toUpperCase() }}</button></div>
      </header>

      <div v-if="dataError" class="toast-error" role="alert"><span>{{ dataError }}</span><button aria-label="Chiudi" @click="dataError = ''">×</button></div>

      <section v-if="page === 'home' || page === 'plans'" class="page-content">
        <div class="page-heading">
          <div><span class="eyebrow">{{ page === 'plans' ? 'STRUTTURA IL TUO PERCORSO' : 'IL TUO SPAZIO DI LAVORO' }}</span><h1>{{ page === 'plans' ? 'Le tue schede' : 'Ogni sessione conta.' }}</h1><p>{{ page === 'plans' ? 'Organizza le tue routine e mantieni intatto lo storico.' : 'Scegli una scheda e il giorno da cui vuoi partire.' }}</p></div>
          <button class="button primary" @click="openPlanForm">＋ <span>Nuova scheda</span></button>
        </div>
        <div class="stats-row">
          <div class="stat-card"><span class="stat-label">SCHEDE ATTIVE</span><strong>{{ plans.length.toString().padStart(2, '0') }}</strong><small>Routine personali</small></div>
          <div class="stat-card"><span class="stat-label">ALLENAMENTI REGISTRATI</span><strong>{{ history.length.toString().padStart(2, '0') }}</strong><small>Sessioni nello storico</small></div>
          <div class="stat-card accent-stat"><span class="stat-label">SICKFIT</span><strong class="stat-word">Il tuo ritmo.</strong><small>Online · dati sincronizzati</small></div>
        </div>
        <div class="section-title"><div><span class="eyebrow">PERCORSI</span><h2>Le tue schede</h2></div><button class="text-button" @click="page = 'plans'">Vedi tutte <span>→</span></button></div>
        <div v-if="!plans.length" class="empty-card"><div class="empty-icon">↗</div><div><h3>La tua prima scheda parte da qui</h3><p>Crea una scheda, aggiungi i giorni e gli esercizi previsti. Potrai registrare quello che fai davvero, anche quando cambia.</p></div><button class="button outline" @click="openPlanForm">Crea la prima scheda</button></div>
        <div v-else class="plan-grid">
          <article v-for="(plan, planIndex) in plans" :key="plan.id" class="plan-card" :style="{ '--plan-index': planIndex }">
            <div class="plan-card-head"><span class="plan-kicker">SCHEDA {{ String(planIndex + 1).padStart(2, '0') }}</span><span class="version-pill">v{{ plan.versionNumber }}</span></div>
            <h3>{{ plan.name }}</h3>
            <p class="plan-meta">{{ plan.days.length }} {{ plan.days.length === 1 ? 'giorno' : 'giorni' }} · {{ plan.days.reduce((sum, day) => sum + day.exercises.length, 0) }} esercizi</p>
            <div class="day-list"><button v-for="day in plan.days" :key="day.id" class="day-button" :disabled="saving" @click="startWorkout(plan, day)"><span><i class="day-dot"></i>{{ day.name }}</span><span class="day-arrow">→</span></button></div>
          </article>
        </div>
        <div class="footnote"><span>✳</span> Le schede vengono versionate: i cambiamenti futuri non riscrivono gli allenamenti passati.</div>
      </section>

      <section v-else-if="page === 'session' && workout" class="page-content session-content">
        <button class="back-link" @click="cancelWorkout">← Torna alle schede</button>
        <div class="page-heading session-heading"><div><span class="eyebrow">{{ workout.plan.name }} · {{ workout.day.name }}</span><h1>La sessione di oggi.</h1><p>Registra ciò che hai svolto. Il numero di serie è libero.</p></div><button class="button primary" :disabled="saving" @click="finishWorkout">{{ saving ? 'Salvataggio…' : 'Salva sessione' }} <span>✓</span></button></div>
        <div class="exercise-list">
          <article v-for="(exercise, exerciseIndex) in workout.exercises" :key="exercise.planExerciseId" class="exercise-card">
            <div class="exercise-head"><span class="exercise-index">{{ String(exerciseIndex + 1).padStart(2, '0') }}</span><div class="exercise-title"><h3>{{ planExerciseFor(exercise)?.name }}</h3><p>{{ planExerciseFor(exercise)?.target_sets_min }}–{{ planExerciseFor(exercise)?.target_sets_max }} serie suggerite<span v-if="planExerciseFor(exercise)?.is_optional"> · opzionale</span></p></div><label class="skip-toggle"><input v-model="exercise.status" true-value="skipped" false-value="completed" type="checkbox" /><span>Saltato</span></label></div>
            <div v-if="exercise.status !== 'skipped'" class="exercise-body">
              <label v-if="planExerciseFor(exercise)?.alternatives.length" class="field alternative-field">Sostituzione prevista
                <select :value="exercise.selectedAlternativeId ?? ''" @change="chooseAlternative(exercise, ($event.target as HTMLSelectElement).value)"><option value="">Mantieni {{ planExerciseFor(exercise)?.name }}</option><option v-for="alternative in planExerciseFor(exercise)?.alternatives" :key="alternative.id" :value="alternative.id">{{ alternative.name }}</option></select>
              </label>
              <label class="field actual-field">Esercizio svolto<input v-model="exercise.actualName" required /></label>
              <p v-if="planExerciseFor(exercise)?.prescription_notes" class="prescription">{{ planExerciseFor(exercise)?.prescription_notes }}</p>
              <div v-for="(set, setIndex) in exercise.sets" :key="set.position" class="set-row">
                <span class="set-number">{{ String(setIndex + 1).padStart(2, '0') }}</span>
                <label>Ripetizioni<input v-model="set.reps" inputmode="numeric" type="number" min="1" placeholder="—" /></label>
                <label>Carico (kg)<input v-model="set.weightKg" inputmode="decimal" type="number" min="0" step="0.25" placeholder="—" /></label>
                <label>Modalità<select v-model="set.loadBasis"><option value="per_side">Per lato</option><option value="total">Totale</option></select></label>
                <button class="icon-button remove-set" aria-label="Rimuovi serie" @click="removeSet(exercise, setIndex)">−</button>
                <div class="set-notes"><label v-for="(note, noteIndex) in set.notes" :key="noteIndex">Nota serie<input v-model="set.notes[noteIndex]" maxlength="500" placeholder="Facoltativa — testo originale" /></label><button class="text-button small-text" @click="addSetNote(set)">＋ Aggiungi nota</button></div>
              </div>
              <button class="add-set" @click="addSet(exercise)"><span>＋</span> Aggiungi serie</button>
            </div>
            <p v-else class="skipped-note">Esercizio registrato come saltato; nessuna serie richiesta.</p>
          </article>
        </div>
        <div class="session-save-bottom"><button class="button primary" :disabled="saving" @click="finishWorkout">{{ saving ? 'Salvataggio…' : 'Salva sessione' }} <span>✓</span></button></div>
      </section>

      <section v-else-if="page === 'history'" class="page-content">
        <div class="page-heading"><div><span class="eyebrow">IL TUO PERCORSO NEL TEMPO</span><h1>Storico allenamenti.</h1><p>Ogni sessione resta associata alla scheda e al giorno selezionati.</p></div></div>
        <label class="history-search"><span>⌕</span><input v-model="historyFilter" placeholder="Filtra per scheda o giorno…" /></label>
        <div v-if="!filteredHistory.length" class="empty-card history-empty"><div class="empty-icon">◷</div><div><h3>Nessuna sessione da mostrare</h3><p>Quando registri un allenamento completato, lo troverai qui.</p></div><button class="button outline" @click="page = 'home'">Vai alle schede</button></div>
        <div v-else class="history-list"><article v-for="entry in filteredHistory" :key="entry.id" class="history-card"><div class="history-date"><strong>{{ new Date(entry.started_at).toLocaleDateString('it-IT', { day: '2-digit' }) }}</strong><span>{{ new Date(entry.started_at).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }) }}</span></div><div class="history-main"><span class="eyebrow">{{ entry.planName }}</span><h3>{{ entry.dayName }}</h3><small>{{ new Date(entry.started_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) }}</small></div><span class="status-pill" :class="entry.status">{{ entry.status === 'completed' ? 'Completato' : 'In corso' }}</span></article></div>
      </section>
    </section>

    <nav class="mobile-nav" aria-label="Navigazione mobile"><button :class="{ selected: page === 'home' || page === 'session' }" @click="page = 'home'"><span>⌂</span>Home</button><button :class="{ selected: page === 'plans' }" @click="page = 'plans'"><span>▤</span>Schede</button><button :class="{ selected: page === 'history' }" @click="page = 'history'; loadHistory()"><span>◷</span>Storico</button></nav>

    <div v-if="planModalOpen" class="modal-backdrop" @click.self="planModalOpen = false">
      <section class="plan-modal" role="dialog" aria-modal="true" aria-labelledby="new-plan-title">
        <div class="modal-header"><div><span class="eyebrow">NUOVA ROUTINE</span><h2 id="new-plan-title">Crea una scheda</h2></div><button class="icon-button" aria-label="Chiudi" @click="planModalOpen = false">×</button></div>
        <form @submit.prevent="createPlan">
          <label class="field">Nome scheda<input v-model="draftPlanName" required maxlength="100" placeholder="Es. PPL + Upper" /></label>
          <div v-for="(day, dayIndex) in draftDays" :key="dayIndex" class="draft-day">
            <div class="draft-day-head"><label class="field">Giorno {{ dayIndex + 1 }}<input v-model="day.name" required maxlength="100" placeholder="Es. Lunedì · Gambe" /></label><button v-if="draftDays.length > 1" type="button" class="text-button remove-day" @click="removeDayDraft(dayIndex)">Rimuovi giorno</button></div>
            <div v-for="(exercise, exerciseIndex) in day.exercises" :key="exerciseIndex" class="draft-exercise">
              <label class="field">Esercizio {{ exerciseIndex + 1 }}<input v-model="exercise.name" required maxlength="120" placeholder="Nome esercizio / macchina" /></label>
              <div class="draft-targets"><label class="field">Serie min<input v-model.number="exercise.min" type="number" min="0" max="30" /></label><label class="field">Serie max<input v-model.number="exercise.max" type="number" min="0" max="30" /></label><label class="optional-check"><input v-model="exercise.optional" type="checkbox" /> Opzionale</label></div>
              <label class="field">Alternative, separate da virgola<input v-model="exercise.alternatives" placeholder="Es. Leg curl, Back extension" /></label>
              <label class="field">Prescrizione / note<input v-model="exercise.notes" placeholder="Es. serie pesanti" /></label>
              <button v-if="day.exercises.length > 1" type="button" class="text-button remove-day" @click="removeExerciseDraft(day, exerciseIndex)">Rimuovi esercizio</button>
            </div>
            <button type="button" class="text-button" @click="addExerciseDraft(day)">＋ Aggiungi esercizio</button>
          </div>
          <button type="button" class="button outline add-day-button" @click="addDayDraft">＋ Aggiungi giorno</button>
          <div class="modal-actions"><button type="button" class="button ghost" @click="planModalOpen = false">Annulla</button><button class="button primary" :disabled="saving">{{ saving ? 'Salvataggio…' : 'Crea scheda' }}</button></div>
        </form>
      </section>
    </div>
  </main>
</template>
