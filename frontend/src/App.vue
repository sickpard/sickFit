<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { requestPasswordRecovery, signInWithUsername, signUpWithUsername, updateRecoveredPassword } from './lib/auth'
import { domain, type HistoryDetail, type HistoryEntry, type PlanCard, type PlanDay, type WorkoutInput } from './lib/domain'
import { appendEmptySet, createEmptySet, validatePlanImport, type EditableSet } from './lib/workout'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { getInitialTheme, getSavedTheme, saveTheme, type Theme } from './lib/theme'

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

const authMode = ref<'login' | 'signup'>('login')
const authFlow = ref<'normal' | 'forgot' | 'reset'>('normal')
const recoveryPassword = ref('')
const recoveryConfirm = ref('')
const theme = ref<Theme>('dark')
const form = reactive({ username: '', email: '', password: '', confirmPassword: '' })
const busy = ref(false)
const loginVerifying = ref(false)
const authError = ref('')
const authMessage = ref('')
const user = ref<User | null>(null)
const page = ref<'home' | 'plans' | 'history' | 'session'>('home')
const plans = ref<PlanCard[]>([])
const history = ref<HistoryEntry[]>([])
const historyReady = ref(false)
const historyDetail = ref<HistoryDetail | null>(null)
const detailLoading = ref(false)
const saveUncertain = ref(false)
const discardVerified = ref(false)
const startUncertain = ref(false)
const planSaveUncertain = ref(false)
const historyFilter = ref('')
const dataError = ref('')
const saving = ref(false)
const workout = ref<WorkoutDraft | null>(null)
const draftPlanName = ref('')
const draftDays = ref<DayDraft[]>([newDayDraft()])
const planModalOpen = ref(false)
const importFeedback = ref('')
const editingPlan = ref<PlanCard | null>(null)
let planRequestId = 0
let historyRequestId = 0

function newExerciseDraft(): ExercisePlanDraft {
  return { name: '', min: 2, max: 2, optional: false, notes: '', alternatives: '' }
}
function newDayDraft(): DayDraft {
  return { name: '', exercises: [newExerciseDraft()] }
}

const isSignedIn = computed(() => Boolean(user.value) && !loginVerifying.value && authFlow.value !== 'reset')
const pendingSession = computed(() => history.value.find((entry) => entry.status === 'in_progress'))
const resumableSession = computed(() => {
  const entry = pendingSession.value
  if (!entry) return null
  for (const plan of plans.value) {
    if (plan.versionId !== entry.plan_version_id) continue
    const day = plan.days.find((item) => item.id === entry.plan_day_id)
    if (day) return { entry, plan, day }
  }
  return null
})
const filteredHistory = computed(() => {
  const term = historyFilter.value.trim().toLocaleLowerCase('it-IT')
  if (!term) return history.value
  return history.value.filter((entry) => `${entry.planName} ${entry.dayName}`.toLocaleLowerCase('it-IT').includes(term))
})
const todayShortcuts = computed(() => {
  const weekday = new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(new Date()).toLocaleLowerCase('it-IT')
  return plans.value.flatMap((plan) => plan.days
    .filter((day) => day.name.toLocaleLowerCase('it-IT').includes(weekday))
    .map((day) => ({ plan, day })))
})

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.value === 'dark' ? '#0b100e' : '#f5f5f7')
  saveTheme(theme.value)
}

function changeAuthMode(mode: 'login' | 'signup') {
  authMode.value = mode
  authFlow.value = 'normal'
  authError.value = ''
  authMessage.value = ''
}

async function sendRecoveryEmail() {
  if (busy.value) return
  authError.value = ''
  authMessage.value = ''
  if (!form.email.trim()) {
    authError.value = 'Inserisci l’email associata al tuo account.'
    return
  }
  busy.value = true
  try {
    const { error } = await requestPasswordRecovery(form.email)
    if (error) throw error
    authMessage.value = 'Se l’indirizzo è registrato, riceverai un link per reimpostare la password.'
  } catch {
    authError.value = 'Non è stato possibile richiedere il reset. Riprova più tardi.'
  } finally {
    busy.value = false
  }
}

async function saveRecoveredPassword() {
  if (busy.value) return
  authError.value = ''
  authMessage.value = ''
  if (recoveryPassword.value.length < 8 || recoveryPassword.value !== recoveryConfirm.value) {
    authError.value = 'Inserisci due password uguali di almeno 8 caratteri.'
    return
  }
  busy.value = true
  try {
    const { error } = await updateRecoveredPassword(recoveryPassword.value)
    if (error) throw error
    authMessage.value = 'Password aggiornata. Ora puoi accedere.'
    recoveryPassword.value = ''
    recoveryConfirm.value = ''
    authFlow.value = 'normal'
    await supabase?.auth.signOut()
    user.value = null
  } catch {
    authError.value = 'Non è stato possibile aggiornare la password. Richiedi un nuovo link e riprova.'
  } finally {
    busy.value = false
  }
}

async function submitAuth() {
  if (busy.value) return
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
      loginVerifying.value = true
      const result = await signInWithUsername(form)
      user.value = result.user
      loginVerifying.value = false
      void loadPlans()
      void loadHistory()
    }
  } catch (error) {
    if (loginVerifying.value) user.value = null
    authError.value = error instanceof Error ? error.message : 'Operazione non riuscita. Riprova.'
  } finally {
    loginVerifying.value = false
    busy.value = false
  }
}

async function loadPlans() {
  if (!user.value) return false
  const requestId = ++planRequestId
  const userId = user.value.id
  try {
    const loaded = await domain('plans.list', {})
    if (requestId !== planRequestId || user.value?.id !== userId) return false
    if (!Array.isArray(loaded)) throw new Error('Risposta schede non valida')
    plans.value = loaded.map((plan) => ({ ...plan, days: [...plan.days]
      .sort((a, b) => a.position - b.position)
      .map((day) => ({ ...day, exercises: [...day.exercises].sort((a, b) => a.position - b.position) })) }))
    return true
  } catch {
    if (requestId !== planRequestId || user.value?.id !== userId) return false
    dataError.value = 'Non riesco a caricare le schede. Riprova più tardi.'
    return false
  }
}

async function refreshPlans() {
  if (saving.value) return
  if (await loadPlans()) planSaveUncertain.value = false
}

function openPlanForm() {
  if (planSaveUncertain.value || saving.value) return
  editingPlan.value = null
  draftPlanName.value = ''
  draftDays.value = [newDayDraft()]
  importFeedback.value = ''
  planModalOpen.value = true
}
function openPlanEditor(plan: PlanCard) {
  if (planSaveUncertain.value || saving.value) return
  editingPlan.value = plan
  draftPlanName.value = plan.name
  draftDays.value = plan.days.map((day) => ({
    name: day.name,
    exercises: day.exercises.map((exercise) => ({
      name: exercise.name,
      min: exercise.target_sets_min,
      max: exercise.target_sets_max,
      optional: exercise.is_optional,
      notes: exercise.prescription_notes ?? '',
      alternatives: exercise.alternatives.map((item) => item.name).join(', '),
    })),
  }))
  importFeedback.value = ''
  planModalOpen.value = true
}
async function previewPlanImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  importFeedback.value = ''
  if (!file) return
  if (file.size > 1_000_000) {
    importFeedback.value = 'Il file supera il limite di 1 MB.'
    return
  }
  try {
    const parsed: unknown = JSON.parse(await file.text())
    const result = validatePlanImport(parsed)
    if (!result.ok) {
      importFeedback.value = result.error
      return
    }
    draftPlanName.value = result.plan.name
    draftDays.value = result.plan.days.map((day) => ({
      name: day.name,
      exercises: day.exercises.map((exercise) => ({
        name: exercise.name,
        min: exercise.min,
        max: exercise.max,
        optional: exercise.optional,
        notes: exercise.notes,
        alternatives: exercise.alternatives.join(', '),
      })),
    }))
    importFeedback.value = `Anteprima caricata: ${result.plan.days.length} giorni. Controlla i dati e conferma con “Crea scheda”.`
  } catch {
    importFeedback.value = 'Il file non contiene JSON valido.'
  }
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
  if (saving.value || planSaveUncertain.value) return
  dataError.value = ''
  if (!user.value) return
  if (!draftPlanName.value.trim() || !draftDays.value.length || draftDays.value.some((day) => !day.name.trim() || !day.exercises.length || day.exercises.some((exercise) => !exercise.name.trim() || !Number.isInteger(Number(exercise.min)) || !Number.isInteger(Number(exercise.max)) || Number(exercise.min) < 0 || Number(exercise.max) < Number(exercise.min) || Number(exercise.max) > 30))) {
    dataError.value = 'Inserisci il nome della scheda, almeno un giorno e un esercizio per ogni giorno.'
    return
  }
  saving.value = true
  try {
    const saved = await domain('plans.save', {
      name: draftPlanName.value.trim(),
      ...(editingPlan.value ? { planId: editingPlan.value.id } : {}),
      days: draftDays.value.map((day) => ({
        name: day.name.trim(),
        exercises: day.exercises.map((exercise) => ({
          name: exercise.name.trim(), min: Number(exercise.min), max: Number(exercise.max),
          optional: exercise.optional, notes: exercise.notes.trim(),
          alternatives: exercise.alternatives.split(',').map((name) => name.trim()).filter(Boolean),
        })),
      })),
    })
    if (!saved?.id) throw new Error('Risposta salvataggio non valida')
    planModalOpen.value = false
    editingPlan.value = null
    if (!(await loadPlans())) planSaveUncertain.value = true
  } catch {
    planSaveUncertain.value = true
    dataError.value = 'Salvataggio non confermato. Aggiorna le schede e controlla prima di riprovare per evitare duplicati.'
    planModalOpen.value = false
  } finally {
    saving.value = false
  }
}

async function archivePlan(plan: PlanCard) {
  if (saving.value || planSaveUncertain.value || !historyReady.value || pendingSession.value || workout.value || !window.confirm(`Archiviare “${plan.name}”? Lo storico resterà disponibile.`)) return
  saving.value = true
  dataError.value = ''
  try {
    await domain('plans.archive', { planId: plan.id })
    if (!(await loadPlans())) planSaveUncertain.value = true
  } catch {
    planSaveUncertain.value = true
    dataError.value = 'Archiviazione non confermata. Aggiorna le schede prima di riprovare.'
  } finally {
    saving.value = false
  }
}

async function startWorkout(plan: PlanCard, day: PlanDay) {
  if (saving.value || startUncertain.value || workout.value) return
  dataError.value = ''
  if (!user.value) return
  if (!historyReady.value) {
    dataError.value = 'Aggiorna lo storico prima di aprire un allenamento.'
    return
  }
  if (pendingSession.value) {
    dataError.value = 'Hai già una sessione in corso: riprendila o scartala prima di iniziarne un’altra.'
    return
  }
  saving.value = true
  try {
    const started = await domain('workouts.start', { planVersionId: plan.versionId, planDayId: day.id })
    if (!started?.id) throw new Error('Risposta sessione non valida')
    workout.value = makeWorkoutDraft(started.id, plan, day)
    discardVerified.value = false
    // Do not allow another start until the server-side session is reconciled.
    historyRequestId += 1
    historyReady.value = false
    page.value = 'session'
  } catch {
    startUncertain.value = true
    historyReady.value = false
    dataError.value = 'Apertura non confermata. Aggiorna lo storico prima di riprovare per evitare duplicati.'
  } finally {
    saving.value = false
  }
}

function makeWorkoutDraft(id: string, plan: PlanCard, day: PlanDay): WorkoutDraft {
  return {
    id, plan, day,
    exercises: day.exercises.map((exercise): ExerciseDraft => {
      const initialCount = exercise.is_optional ? 0 : Math.max(1, exercise.target_sets_min)
      return {
        planExerciseId: exercise.id, actualName: exercise.name,
        selectedAlternativeId: null, status: 'completed',
        sets: Array.from({ length: Math.min(initialCount, 12) }, (_, index) => createEmptySet(index + 1)),
      }
    }),
  }
}

async function resumeWorkout() {
  if (saving.value || !historyReady.value || !resumableSession.value) return
  const { entry, plan, day } = resumableSession.value
  if (workout.value?.id === entry.id) { page.value = 'session'; return }
  if (workout.value) return
  saving.value = true
  try {
    const detail = await domain('history.detail', { sessionId: entry.id })
    if (detail.status !== 'in_progress' || detail.exercises.length) {
      dataError.value = 'La sessione è cambiata: aggiorna lo storico prima di continuare.'
      await loadHistory()
      return
    }
    workout.value = makeWorkoutDraft(entry.id, plan, day)
    saveUncertain.value = false
    discardVerified.value = false
    page.value = 'session'
  } catch {
    dataError.value = 'Non riesco a verificare la sessione da riprendere.'
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
  if (saving.value || saveUncertain.value || !workout.value || !user.value) return
  const current = workout.value
  dataError.value = ''
  const exercises: WorkoutInput['exercises'] = []
  for (const exercise of current.exercises) {
    const actualName = exercise.actualName.trim()
    if (!actualName) {
      dataError.value = 'Indica il nome di ogni esercizio, anche se saltato.'
      return
    }
    const sets: WorkoutInput['exercises'][number]['sets'] = []
    if (exercise.status === 'completed') {
      for (const set of exercise.sets) {
        const reps = set.reps.trim() ? Number(set.reps) : undefined
        const weightKg = set.weightKg.trim() ? Number(set.weightKg.replace(',', '.')) : undefined
        const durationSeconds = set.durationSeconds.trim() ? Number(set.durationSeconds) : undefined
        if ((reps !== undefined && (!Number.isInteger(reps) || reps <= 0)) || (weightKg !== undefined && (!Number.isFinite(weightKg) || weightKg < 0)) || (durationSeconds !== undefined && (!Number.isInteger(durationSeconds) || durationSeconds <= 0))) {
          dataError.value = 'Controlla ripetizioni, carico e durata delle serie prima di salvare.'
          return
        }
        sets.push({ ...(reps === undefined ? {} : { reps }), ...(weightKg === undefined ? {} : { weightKg }), ...(durationSeconds === undefined ? {} : { durationSeconds }),
          loadBasis: set.loadBasis, notes: set.notes.map((note) => note.trim()).filter(Boolean) })
      }
    }
    exercises.push({ planExerciseId: exercise.planExerciseId,
      ...(exercise.selectedAlternativeId ? { selectedAlternativeId: exercise.selectedAlternativeId } : {}),
      actualName, status: exercise.status, sets })
  }
  saving.value = true
  try {
    const completed = await domain('workouts.complete', { sessionId: current.id, exercises })
    if (!completed?.id) throw new Error('Risposta salvataggio non valida')
    workout.value = null
    page.value = 'history'
    historyReady.value = false
    await loadHistory()
  } catch {
    saveUncertain.value = true
    discardVerified.value = false
    dataError.value = 'Salvataggio non confermato. Verifica lo stato prima di riprovare: non invieremo due volte le serie.'
  } finally {
    saving.value = false
  }
}

async function verifyWorkout() {
  if (!workout.value || saving.value) return
  saving.value = true
  try {
    const detail = await domain('history.detail', { sessionId: workout.value.id })
    if (detail.status === 'completed') {
      workout.value = null
      saveUncertain.value = false
      discardVerified.value = false
      page.value = 'history'
      await loadHistory()
    } else if (detail.exercises.length === 0) {
      saveUncertain.value = false
      discardVerified.value = false
      dataError.value = 'La sessione è ancora in corso e non contiene esercizi salvati. Puoi riprovare.'
    } else {
      discardVerified.value = true
      dataError.value = 'La sessione contiene già esercizi salvati. Non riprovare: rischieresti duplicati. Puoi scartarla oppure consultare lo storico.'
    }
  } catch {
    discardVerified.value = false
    dataError.value = 'Non riesco a verificare la sessione. Non riprovare il salvataggio finché non è disponibile.'
  } finally {
    saving.value = false
  }
}

async function cancelWorkout(sessionId?: string) {
  if (saving.value) return
  if (!workout.value && !historyReady.value) return
  const id = sessionId ?? workout.value?.id
  if (workout.value?.id === id && saveUncertain.value && !discardVerified.value) {
    dataError.value = 'Verifica prima se la sessione è stata completata.'
    return
  }
  if (!id || !window.confirm('Scartare questa sessione? I dati non salvati andranno persi.')) return
  saving.value = true
  try {
    await domain('workouts.cancel', { sessionId: id })
    if (workout.value?.id === id) workout.value = null
    saveUncertain.value = false
    discardVerified.value = false
    page.value = 'home'
    await loadHistory()
  } catch {
    historyReady.value = false
    dataError.value = 'Annullamento non confermato. Aggiorna lo storico prima di riprovare.'
  } finally {
    saving.value = false
  }
}

async function loadHistory() {
  if (!user.value) return false
  const requestId = ++historyRequestId
  const userId = user.value.id
  historyReady.value = false
  try {
    const entries = await domain('history.list', {})
    if (requestId !== historyRequestId || user.value?.id !== userId) return false
    if (!Array.isArray(entries)) throw new Error('Risposta storico non valida')
    history.value = entries
    historyDetail.value = null
    historyReady.value = true
    startUncertain.value = false
    return true
  } catch {
    if (requestId !== historyRequestId || user.value?.id !== userId) return false
    dataError.value = 'Non riesco a caricare lo storico.'
    return false
  }
}

async function showHistoryDetail(entry: HistoryEntry) {
  if (detailLoading.value) return
  if (historyDetail.value?.id === entry.id) { historyDetail.value = null; return }
  detailLoading.value = true
  historyDetail.value = null
  const userId = user.value?.id
  try {
    const detail = await domain('history.detail', { sessionId: entry.id })
    if (user.value?.id !== userId) return
    if (detail.id !== entry.id || !Array.isArray(detail.exercises)) throw new Error('Dettaglio non valido')
    historyDetail.value = detail
  } catch {
    dataError.value = 'Non riesco a caricare i dettagli della sessione.'
  } finally {
    detailLoading.value = false
  }
}

async function signOut() {
  if (!supabase || saving.value || busy.value) return
  if (workout.value && !window.confirm('Uscire? La sessione resta in corso, ma le modifiche non salvate andranno perse.')) return
  busy.value = true
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    plans.value = []
    history.value = []
    historyDetail.value = null
    workout.value = null
    historyReady.value = false
    planSaveUncertain.value = false
    startUncertain.value = false
    saveUncertain.value = false
    discardVerified.value = false
    planRequestId += 1
    historyRequestId += 1
    page.value = 'home'
  } catch {
    dataError.value = 'Impossibile uscire. Riprova.'
  } finally {
    busy.value = false
  }
}

let authSubscription: { unsubscribe: () => void } | undefined
onMounted(async () => {
  theme.value = getInitialTheme(getSavedTheme(), window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (!supabase) return
  const { data } = await supabase.auth.getSession()
  user.value = data.session?.user ?? null
  if (user.value) {
    await loadPlans()
    await loadHistory()
  }
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') authFlow.value = 'reset'
    if (loginVerifying.value) return
    if ((user.value?.id ?? null) !== (session?.user.id ?? null)) {
      planRequestId += 1
      historyRequestId += 1
      plans.value = []
      history.value = []
      historyReady.value = false
      planSaveUncertain.value = false
      startUncertain.value = false
      saveUncertain.value = false
      discardVerified.value = false
    }
    user.value = session?.user ?? null
    if (!session) {
      plans.value = []
      history.value = []
      historyDetail.value = null
      workout.value = null
      historyReady.value = false
    } else if (authFlow.value !== 'reset') window.setTimeout(() => { void loadPlans(); void loadHistory() }, 0)
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
        <div class="pitch-note"><span class="live-dot"></span> Accedi per gestire le schede e registrare il tuo percorso.</div>
      </div>
      <span class="aside-foot">SICKFIT · ALLENATI CON INTENZIONE</span>
    </section>
    <section class="auth-main">
      <button class="theme-toggle auth-theme-toggle" type="button" :aria-label="theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'" :title="theme === 'dark' ? 'Tema chiaro' : 'Tema scuro'" @click="toggleTheme"><span aria-hidden="true">{{ theme === 'dark' ? '☼' : '☾' }}</span><span>{{ theme === 'dark' ? 'Chiaro' : 'Scuro' }}</span></button>
      <div class="auth-card">
        <div class="auth-mobile-brand"><span class="brand-mark">S</span><span>SickFit</span></div>
        <span class="eyebrow">{{ authFlow === 'reset' ? 'AGGIORNA LE CREDENZIALI' : authFlow === 'forgot' ? 'RECUPERO ACCOUNT' : 'BENTORNATO' }}</span>
        <h2>{{ authFlow === 'reset' ? 'Scegli una nuova password' : authFlow === 'forgot' ? 'Recupera la password' : authMode === 'login' ? 'Accedi al tuo spazio' : 'Crea il tuo account' }}</h2>
        <p class="subcopy">{{ authFlow === 'reset' ? 'Imposta una password nuova per il tuo account.' : authFlow === 'forgot' ? 'Ti invieremo un link sicuro all’indirizzo associato.' : authMode === 'login' ? 'Riprendi da dove avevi lasciato.' : 'Inizia a costruire il tuo storico.' }}</p>
        <div v-if="authFlow === 'normal'" class="auth-switch" role="tablist" aria-label="Tipo di accesso">
          <button :class="{ active: authMode === 'login' }" type="button" @click="changeAuthMode('login')">Accedi</button>
          <button :class="{ active: authMode === 'signup' }" type="button" @click="changeAuthMode('signup')">Registrati</button>
        </div>
        <form v-if="authFlow === 'normal'" class="auth-form" @submit.prevent="submitAuth">
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
          <button class="button primary full" type="submit" :disabled="busy">{{ busy ? 'Attendi…' : authMode === 'login' ? 'Accedi' : 'Crea account' }} <span aria-hidden="true">↗</span></button>
        </form>
        <form v-else-if="authFlow === 'forgot'" class="auth-form" @submit.prevent="sendRecoveryEmail">
          <label>Email<input v-model="form.email" type="email" autocomplete="email" required placeholder="nome@email.com" /></label>
          <p v-if="authError" class="form-message error" role="alert">{{ authError }}</p><p v-if="authMessage" class="form-message success" role="status">{{ authMessage }}</p>
          <button class="button primary full" type="submit" :disabled="busy">{{ busy ? 'Invio…' : 'Invia link di recupero' }}</button>
          <button type="button" class="text-button" @click="authFlow = 'normal'; authError = ''; authMessage = ''">← Torna all’accesso</button>
        </form>
        <form v-else class="auth-form" @submit.prevent="saveRecoveredPassword">
          <label>Nuova password<input v-model="recoveryPassword" type="password" autocomplete="new-password" required minlength="8" /></label>
          <label>Conferma password<input v-model="recoveryConfirm" type="password" autocomplete="new-password" required minlength="8" /></label>
          <p v-if="authError" class="form-message error" role="alert">{{ authError }}</p><p v-if="authMessage" class="form-message success" role="status">{{ authMessage }}</p>
          <button class="button primary full" type="submit" :disabled="busy">{{ busy ? 'Aggiornamento…' : 'Aggiorna password' }}</button>
        </form>
        <button v-if="authFlow === 'normal' && authMode === 'login'" type="button" class="text-button" @click="authFlow = 'forgot'; authError = ''; authMessage = ''">Password dimenticata?</button>
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
        <div class="topbar-right"><span class="online-pill"><i></i> Online</span><button class="theme-toggle" type="button" :aria-label="theme === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'" :title="theme === 'dark' ? 'Tema chiaro' : 'Tema scuro'" @click="toggleTheme"><span aria-hidden="true">{{ theme === 'dark' ? '☼' : '☾' }}</span><span>{{ theme === 'dark' ? 'Chiaro' : 'Scuro' }}</span></button><button class="avatar top-avatar" :aria-label="`Account ${user?.email ?? ''}`">{{ (user?.email?.[0] ?? 'S').toUpperCase() }}</button></div>
      </header>

      <div v-if="dataError" class="toast-error" role="alert"><span>{{ dataError }}</span><button aria-label="Chiudi" @click="dataError = ''">×</button></div>

      <section v-if="page === 'home' || page === 'plans'" class="page-content">
        <div class="page-heading">
          <div><span class="eyebrow">{{ page === 'plans' ? 'STRUTTURA IL TUO PERCORSO' : 'IL TUO SPAZIO DI LAVORO' }}</span><h1>{{ page === 'plans' ? 'Le tue schede' : 'Ogni sessione conta.' }}</h1><p>{{ page === 'plans' ? 'Organizza le tue routine e mantieni intatto lo storico.' : 'Scegli una scheda e il giorno da cui vuoi partire.' }}</p></div>
          <button class="button primary" :disabled="saving || planSaveUncertain" @click="openPlanForm">＋ <span>Nuova scheda</span></button>
        </div>
        <div v-if="planSaveUncertain" class="today-shortcut pending-shortcut"><div><strong>Verifica le schede prima di un altro salvataggio</strong><small>L’ultimo risultato non è confermato: controlla l’elenco per evitare duplicati.</small></div><button class="button outline" :disabled="saving" @click="refreshPlans">Aggiorna schede</button></div>
        <div v-if="workout || pendingSession || !historyReady" class="today-shortcut pending-shortcut">
          <div><span class="eyebrow">SESSIONE</span><strong>{{ workout ? 'Allenamento in corso' : pendingSession ? `${pendingSession.planName} · ${pendingSession.dayName}` : 'Storico da aggiornare' }}</strong><small v-if="pendingSession && !resumableSession && !workout">Questa versione non è disponibile tra le schede attive: puoi scartare la sessione, ma non riprenderla.</small><small v-else-if="pendingSession && !workout">Riprendendo dopo una chiusura, le serie non salvate vanno reinserite.</small></div>
          <div class="pending-actions">
            <button v-if="workout" class="button outline" @click="page = 'session'">Continua →</button>
            <button v-else-if="resumableSession" class="button outline" :disabled="saving || !historyReady" @click="resumeWorkout">Riprendi →</button>
            <button v-if="pendingSession && !workout" class="text-button remove-day" :disabled="saving || !historyReady" @click="cancelWorkout(pendingSession.id)">Scarta</button>
            <button v-if="!historyReady" class="text-button" :disabled="saving" @click="loadHistory">Aggiorna storico</button>
          </div>
        </div>
        <div v-if="page === 'home' && todayShortcuts.length" class="today-shortcut">
          <div><span class="eyebrow">OGGI · {{ new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(new Date()) }}</span><strong>Allenamento previsto</strong></div>
          <button class="button outline" :disabled="saving || !historyReady || Boolean(pendingSession) || Boolean(workout)" @click="startWorkout(todayShortcuts[0].plan, todayShortcuts[0].day)">{{ todayShortcuts[0].plan.name }} · {{ todayShortcuts[0].day.name }} <span>→</span></button>
        </div>
        <div class="stats-row">
          <div class="stat-card"><span class="stat-label">SCHEDE ATTIVE</span><strong>{{ plans.length.toString().padStart(2, '0') }}</strong><small>Routine personali</small></div>
          <div class="stat-card"><span class="stat-label">ALLENAMENTI REGISTRATI</span><strong>{{ history.filter((entry) => entry.status === 'completed').length.toString().padStart(2, '0') }}</strong><small>Sessioni completate</small></div>
          <div class="stat-card accent-stat"><span class="stat-label">SICKFIT</span><strong class="stat-word">Il tuo ritmo.</strong><small>Online · dati sincronizzati</small></div>
        </div>
        <div class="section-title"><div><span class="eyebrow">PERCORSI</span><h2>Le tue schede</h2></div><button class="text-button" @click="page === 'plans' ? refreshPlans() : page = 'plans'">{{ page === 'plans' ? 'Aggiorna schede' : 'Vedi tutte' }} <span>→</span></button></div>
        <div v-if="!plans.length" class="empty-card"><div class="empty-icon">↗</div><div><h3>La tua prima scheda parte da qui</h3><p>Crea una scheda, aggiungi i giorni e gli esercizi previsti. Potrai registrare quello che fai davvero, anche quando cambia.</p></div><button class="button outline" :disabled="saving || planSaveUncertain" @click="openPlanForm">Crea la prima scheda</button></div>
        <div v-else class="plan-grid">
          <article v-for="(plan, planIndex) in plans" :key="plan.id" class="plan-card" :style="{ '--plan-index': planIndex }">
            <div class="plan-card-head"><span class="plan-kicker">SCHEDA {{ String(planIndex + 1).padStart(2, '0') }}</span><div class="plan-card-actions"><span class="version-pill">v{{ plan.versionNumber }}</span><button class="text-button small-text" :disabled="saving || planSaveUncertain" @click="openPlanEditor(plan)">Modifica</button><button class="text-button small-text remove-day" :disabled="saving || planSaveUncertain || !historyReady || Boolean(pendingSession) || Boolean(workout)" @click="archivePlan(plan)">Archivia</button></div></div>
            <h3>{{ plan.name }}</h3>
            <p class="plan-meta">{{ plan.days.length }} {{ plan.days.length === 1 ? 'giorno' : 'giorni' }} · {{ plan.days.reduce((sum, day) => sum + day.exercises.length, 0) }} esercizi</p>
            <div class="day-list"><button v-for="day in plan.days" :key="day.id" class="day-button" :disabled="saving || !historyReady || Boolean(pendingSession) || Boolean(workout)" @click="startWorkout(plan, day)"><span><i class="day-dot"></i>{{ day.name }}</span><span class="day-arrow">→</span></button></div>
          </article>
        </div>
        <div class="footnote"><span>✳</span> Le schede vengono versionate: i cambiamenti futuri non riscrivono gli allenamenti passati.</div>
      </section>

      <section v-else-if="page === 'session' && workout" class="page-content session-content">
        <button class="back-link" @click="page = 'plans'">← Torna alle schede (sessione in corso)</button>
        <div class="page-heading session-heading"><div><span class="eyebrow">{{ workout.plan.name }} · {{ workout.day.name }}</span><h1>La sessione di oggi.</h1><p>Registra ciò che hai svolto. Il numero di serie è libero.</p></div><button class="button primary" :disabled="saving || saveUncertain" @click="finishWorkout">{{ saving ? 'Salvataggio…' : 'Salva sessione' }} <span>✓</span></button></div>
        <div class="session-controls"><button class="text-button remove-day" :disabled="saving || (saveUncertain && !discardVerified)" @click="cancelWorkout()">Scarta sessione</button><button v-if="saveUncertain" class="button outline" :disabled="saving" @click="verifyWorkout">Verifica stato del salvataggio</button></div>
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
                <label>Durata (secondi)<input v-model="set.durationSeconds" inputmode="numeric" type="number" min="1" step="1" placeholder="—" /></label>
                <label>Modalità<select v-model="set.loadBasis"><option value="per_side">Per lato</option><option value="total">Totale</option></select></label>
                <button class="icon-button remove-set" aria-label="Rimuovi serie" @click="removeSet(exercise, setIndex)">−</button>
                <div class="set-notes"><label v-for="(_, noteIndex) in set.notes" :key="noteIndex">Nota serie<input v-model="set.notes[noteIndex]" maxlength="500" placeholder="Facoltativa — testo originale" /><button v-if="set.notes.length > 1" type="button" class="text-button small-text" @click="removeSetNote(set, noteIndex)">Rimuovi nota</button></label><button class="text-button small-text" @click="addSetNote(set)">＋ Aggiungi nota</button></div>
              </div>
              <button class="add-set" @click="addSet(exercise)"><span>＋</span> Aggiungi serie</button>
            </div>
            <p v-else class="skipped-note">Esercizio registrato come saltato; nessuna serie richiesta.</p>
          </article>
        </div>
        <div class="session-save-bottom"><button class="button primary" :disabled="saving || saveUncertain" @click="finishWorkout">{{ saving ? 'Salvataggio…' : 'Salva sessione' }} <span>✓</span></button></div>
      </section>

      <section v-else-if="page === 'history'" class="page-content">
        <div class="page-heading"><div><span class="eyebrow">IL TUO PERCORSO NEL TEMPO</span><h1>Storico allenamenti.</h1><p>Ogni sessione resta associata alla scheda e al giorno selezionati.</p></div></div>
        <label class="history-search"><span>⌕</span><input v-model="historyFilter" placeholder="Filtra per scheda o giorno…" /></label>
        <button class="text-button history-refresh" :disabled="saving" @click="loadHistory">Aggiorna storico</button>
        <div v-if="!filteredHistory.length" class="empty-card history-empty"><div class="empty-icon">◷</div><div><h3>Nessuna sessione da mostrare</h3><p>Quando registri un allenamento completato, lo troverai qui.</p></div><button class="button outline" @click="page = 'home'">Vai alle schede</button></div>
        <div v-else class="history-list">
          <article v-for="entry in filteredHistory" :key="entry.id" class="history-card history-record">
            <div class="history-summary"><div class="history-date"><strong>{{ new Date(entry.started_at).toLocaleDateString('it-IT', { day: '2-digit' }) }}</strong><span>{{ new Date(entry.started_at).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }) }}</span></div><div class="history-main"><span class="eyebrow">{{ entry.planName }}</span><h3>{{ entry.dayName }}</h3><small>{{ new Date(entry.started_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) }}</small></div><span class="status-pill" :class="entry.status">{{ entry.status === 'completed' ? 'Completato' : 'In corso' }}</span></div>
            <div class="history-actions"><button class="text-button small-text" :disabled="detailLoading" :aria-expanded="historyDetail?.id === entry.id" @click="showHistoryDetail(entry)">{{ historyDetail?.id === entry.id ? 'Nascondi dettagli' : 'Vedi dettagli' }}</button><template v-if="entry.status === 'in_progress'"><button v-if="resumableSession?.entry.id === entry.id" class="text-button small-text" :disabled="saving || !historyReady" @click="resumeWorkout">Riprendi</button><button class="text-button small-text remove-day" :disabled="saving || !historyReady" @click="cancelWorkout(entry.id)">Scarta</button></template></div>
            <div v-if="historyDetail && historyDetail.id === entry.id" class="history-detail">
              <p v-if="!historyDetail.exercises.length" class="form-message">Nessun esercizio registrato per questa sessione.</p>
              <div v-for="exercise in [...historyDetail.exercises].sort((a, b) => a.position - b.position)" :key="exercise.id" class="history-exercise"><strong>{{ exercise.actual_name }}</strong><span class="status-pill" :class="exercise.status">{{ exercise.status === 'skipped' ? 'Saltato' : 'Svolto' }}</span><p v-if="exercise.notes">{{ exercise.notes }}</p>
                <ol v-if="exercise.sets.length"><li v-for="set in [...exercise.sets].sort((a, b) => a.position - b.position)" :key="set.id">Serie {{ set.position }} · {{ set.reps ?? '—' }} rip. · {{ set.weight_kg ?? '—' }} kg ({{ set.load_basis === 'per_side' ? 'per lato' : 'totale' }})<span v-if="set.duration_seconds"> · {{ set.duration_seconds }} s</span><ul v-if="set.notes.length"><li v-for="(note, index) in [...set.notes].sort((a, b) => a.position - b.position)" :key="index">{{ note.text }}</li></ul></li></ol>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>

    <nav class="mobile-nav" aria-label="Navigazione mobile"><button :class="{ selected: page === 'home' || page === 'session' }" @click="page = 'home'"><span>⌂</span>Home</button><button :class="{ selected: page === 'plans' }" @click="page = 'plans'"><span>▤</span>Schede</button><button :class="{ selected: page === 'history' }" @click="page = 'history'; loadHistory()"><span>◷</span>Storico</button></nav>

    <div v-if="planModalOpen" class="modal-backdrop" @click.self="planModalOpen = false">
      <section class="plan-modal" role="dialog" aria-modal="true" aria-labelledby="new-plan-title">
        <div class="modal-header"><div><span class="eyebrow">{{ editingPlan ? 'NUOVA VERSIONE' : 'NUOVA ROUTINE' }}</span><h2 id="new-plan-title">{{ editingPlan ? 'Modifica scheda' : 'Crea una scheda' }}</h2></div><button class="icon-button" aria-label="Chiudi" @click="planModalOpen = false">×</button></div>
        <label class="field">Importa una scheda JSON (max 1 MB)<input type="file" accept="application/json,.json" @change="previewPlanImport" /></label>
        <p v-if="importFeedback" class="form-message" role="status">{{ importFeedback }}</p>
        <form @submit.prevent="createPlan">
          <label class="field">Nome scheda<input v-model="draftPlanName" required maxlength="100" :disabled="Boolean(editingPlan)" placeholder="Es. PPL + Upper" /></label>
          <p v-if="editingPlan" class="form-message">Il nome resta invariato per non modificare le etichette nello storico. Salveremo i contenuti come versione {{ editingPlan.versionNumber + 1 }}.</p>
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
          <div class="modal-actions"><button type="button" class="button ghost" @click="planModalOpen = false">Annulla</button><button class="button primary" :disabled="saving">{{ saving ? 'Salvataggio…' : editingPlan ? 'Crea nuova versione' : 'Crea scheda' }}</button></div>
        </form>
      </section>
    </div>
  </main>
</template>
