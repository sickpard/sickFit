import { useEffect, useRef, useState } from 'react'
import { Alert, Text, View } from 'react-native'
import { DomainError, domain, type CompletedExercise, type Plan, type PlanDay, type PlanExercise, type SetEntry } from '../lib/domain'
import { Button, Busy, Field, Notice, Page, color, message, styles } from '../ui'

type DraftSet = { reps: string; weight: string; duration: string; basis: 'per_side' | 'total'; notes: string }
type DraftExercise = { status: 'completed' | 'skipped'; alternativeId?: string; sets: DraftSet[] }
const emptySet = (): DraftSet => ({ reps: '', weight: '', duration: '', basis: 'per_side', notes: '' })
const initial = (day: PlanDay) => Object.fromEntries(day.exercises.map(ex => [ex.id, { status: 'completed', sets: [emptySet()] }])) as Record<string, DraftExercise>

export function WorkoutScreen({ plan, day, existingSessionId, onDone, onExit }: { plan: Plan; day: PlanDay; existingSessionId?: string; onDone: () => void; onExit: () => void }) {
  const [sessionId, setSessionId] = useState<string | null>(existingSessionId ?? null)
  const [draft, setDraft] = useState(() => initial(day))
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const startPromise = useRef<Promise<{ id: string }> | null>(null)
  useEffect(() => {
    if (existingSessionId) { setBusy(false); return }
    let mounted = true
    const request = startPromise.current ?? domain('workouts.start', { planVersionId: plan.versionId, planDayId: day.id })
    startPromise.current = request
    request.then(result => { if (mounted) setSessionId(result.id) })
      .catch(cause => { if (mounted) setError(message(cause)) })
      .finally(() => { if (mounted) setBusy(false) })
    return () => { mounted = false }
  }, [plan.versionId, day.id, existingSessionId])
  const change = (id: string, fn: (value: DraftExercise) => DraftExercise) => setDraft(current => ({ ...current, [id]: fn(current[id]) }))
  const updateSet = (id: string, index: number, field: keyof DraftSet, value: string) => change(id, item => ({ ...item, sets: item.sets.map((set, i) => i === index ? { ...set, [field]: value } : set) }))
  const cancel = () => {
    if (busy) return
    if (!sessionId) { onExit(); return }
    Alert.alert('Annulla allenamento', 'La registrazione non verrà salvata. Vuoi annullare?', [
      { text: 'Continua ad allenarti', style: 'cancel' }, { text: 'Annulla allenamento', style: 'destructive', onPress: () => { void (async () => {
        setBusy(true); setError(null)
        try { await domain('workouts.cancel', { sessionId }); onExit() }
        catch (cause) {
          if (cause instanceof DomainError && cause.code === 'NETWORK') {
            try { await domain('history.detail', { sessionId }) }
            catch (probe) { if (probe instanceof DomainError && probe.code === 'NOT_FOUND') { onExit(); return } }
          }
          setError(message(cause))
        } finally { setBusy(false) }
      })() } },
    ])
  }
  const normalize = (ex: PlanExercise): CompletedExercise => {
    const item = draft[ex.id]
    const alternative = ex.alternatives.find(alt => alt.id === item.alternativeId)
    if (item.status === 'skipped') return { planExerciseId: ex.id, actualName: ex.name, status: 'skipped', sets: [] }
    if (!item.sets.length || item.sets.length > 100) throw new Error(`Aggiungi da 1 a 100 serie o salta “${ex.name}”.`)
    const sets: SetEntry[] = item.sets.map((set, index) => {
      const repsText = set.reps.trim(), weightText = set.weight.trim().replace(',', '.')
      const reps = repsText ? Number(repsText) : undefined
      const weightKg = weightText ? Number(weightText) : undefined
      const durationText = set.duration.trim()
      const durationSeconds = durationText ? Number(durationText) : undefined
      if (repsText && (!/^\d+$/.test(repsText) || !Number.isSafeInteger(Number(repsText)) || reps! <= 0 || reps! > 1_000_000)) throw new Error(`Serie ${index + 1} di “${ex.name}”: ripetizioni da 1 a 1000000.`)
      if (weightText && (!/^\d+(\.\d+)?$/.test(weightText) || !Number.isFinite(Number(weightText)) || weightKg! < 0 || weightKg! > 1_000_000)) throw new Error(`Serie ${index + 1} di “${ex.name}”: carico in kg da 0 a 1000000.`)
      if (durationText && (!/^\d+$/.test(durationText) || !Number.isSafeInteger(durationSeconds) || durationSeconds! <= 0)) throw new Error(`Serie ${index + 1} di “${ex.name}”: durata in secondi maggiore di zero.`)
      const notes = set.notes.split('\n').map(s => s.trim()).filter(Boolean)
      if (notes.length > 20 || notes.some(note => note.length > 2000)) throw new Error(`Serie ${index + 1} di “${ex.name}”: massimo 20 note da 2000 caratteri.`)
      if (reps === undefined && weightKg === undefined && durationSeconds === undefined && notes.length === 0) throw new Error(`Compila o elimina la serie ${index + 1} di “${ex.name}”.`)
      return { ...(reps === undefined ? {} : { reps }), ...(weightKg === undefined ? {} : { weightKg }), ...(durationSeconds === undefined ? {} : { durationSeconds }), loadBasis: set.basis, notes }
    })
    return { planExerciseId: ex.id, ...(alternative ? { selectedAlternativeId: alternative.id } : {}), actualName: alternative?.name ?? ex.name, status: 'completed', sets }
  }
  const complete = async () => {
    if (!sessionId || busy) return
    setError(null)
    let exercises: CompletedExercise[]
    try { exercises = [...day.exercises].sort((a, b) => a.position - b.position).map(normalize) }
    catch (cause) { setError(message(cause)); return }
    setBusy(true)
    try { await domain('workouts.complete', { sessionId, exercises }); onDone() }
    catch (cause) {
      // If a response was lost after commit, inspect the session before inviting a retry.
      try { const detail = await domain('history.detail', { sessionId }); if (detail.status === 'completed') { onDone(); return } } catch { /* original error remains */ }
      setError(message(cause))
    } finally { setBusy(false) }
  }
  return <Page>
    <Button title="Annulla allenamento" danger onPress={cancel} disabled={busy} />
    <Text style={styles.heading}>{day.name}</Text><Text style={styles.sub}>{plan.name} · Versione {plan.versionNumber}. Serie indicative: puoi registrarne di più o di meno.</Text>
    <Notice message={error} />{busy && <Busy />}
    {!sessionId && !busy && <Button title="Torna alle schede" secondary onPress={onExit} />}
    {sessionId && [...day.exercises].sort((a, b) => a.position - b.position).map(ex => {
      const item = draft[ex.id]
      return <View key={ex.id} style={styles.card}>
        <Text style={styles.title}>{ex.name}</Text>
        <Text style={styles.small}>{ex.target_sets_min}–{ex.target_sets_max} serie indicative{ex.is_optional ? ' · Facoltativo' : ''}</Text>
        {!!ex.prescription_notes && <Text style={styles.small}>{ex.prescription_notes}</Text>}
        <Button title={item.status === 'skipped' ? `Registra ${ex.name}` : `Salta ${ex.name}`} secondary disabled={busy} onPress={() => change(ex.id, current => ({ ...current, status: current.status === 'skipped' ? 'completed' : 'skipped' }))} />
        {item.status === 'skipped' ? <Text style={styles.small}>Esercizio saltato</Text> : <>
          {ex.alternatives.length > 0 && <View style={{ gap: 8 }}>
            <Text style={styles.text}>Esercizio svolto</Text>
            {[{ id: '', name: ex.name }, ...ex.alternatives].map(alt => <Button key={alt.id} title={`${item.alternativeId === (alt.id || undefined) ? '● ' : '○ '}${alt.name}`} secondary disabled={busy} onPress={() => change(ex.id, current => ({ ...current, alternativeId: alt.id || undefined }))} />)}
          </View>}
          {item.sets.map((set, i) => <View key={`${ex.id}-${i}`} style={{ padding: 12, gap: 10, borderWidth: 1, borderRadius: 10, borderColor: color.border }}>
            <Text style={styles.text}>Serie {i + 1}</Text>
            <Field label={`Ripetizioni serie ${i + 1} ${ex.name}`} value={set.reps} onChangeText={value => updateSet(ex.id, i, 'reps', value)} keyboardType="number-pad" editable={!busy} />
            <Field label={`Carico kg serie ${i + 1} ${ex.name}`} value={set.weight} onChangeText={value => updateSet(ex.id, i, 'weight', value)} keyboardType="decimal-pad" editable={!busy} />
            <Field label={`Durata in secondi serie ${i + 1} ${ex.name}`} value={set.duration} onChangeText={value => updateSet(ex.id, i, 'duration', value)} keyboardType="number-pad" editable={!busy} />
            <Button title={`Carico: ${set.basis === 'per_side' ? 'per lato' : 'totale'} (cambia)`} secondary disabled={busy} onPress={() => updateSet(ex.id, i, 'basis', set.basis === 'per_side' ? 'total' : 'per_side')} />
            <Field label={`Note serie ${i + 1} (una per riga)`} value={set.notes} onChangeText={value => updateSet(ex.id, i, 'notes', value)} multiline editable={!busy} />
            <Button title={`Elimina serie ${i + 1} di ${ex.name}`} danger disabled={busy} onPress={() => change(ex.id, current => ({ ...current, sets: current.sets.filter((_, index) => index !== i) }))} />
          </View>)}
          <Button title={`Aggiungi serie a ${ex.name}`} secondary disabled={busy} onPress={() => change(ex.id, current => ({ ...current, sets: [...current.sets, emptySet()] }))} />
        </>}
      </View>
    })}
    {!!sessionId && <Button title="Termina allenamento" onPress={() => { void complete() }} disabled={busy} />}
  </Page>
}
