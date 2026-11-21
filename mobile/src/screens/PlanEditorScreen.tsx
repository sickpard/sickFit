import { useState } from 'react'
import { Alert, Switch, Text, View } from 'react-native'
import { domain, type Plan, type SaveDay, type SaveExercise } from '../lib/domain'
import { Button, Busy, Field, Notice, Page, color, message, styles } from '../ui'

const blankExercise = (): SaveExercise => ({ name: '', min: 1, max: 1, optional: false, notes: '', alternatives: [] })
const blankDay = (): SaveDay => ({ name: '', exercises: [blankExercise()] })
type DraftExercise = Omit<SaveExercise, 'min' | 'max' | 'alternatives'> & { min: string; max: string; alternatives: string }
type DraftDay = { name: string; exercises: DraftExercise[] }
const toDraft = (exercise: SaveExercise): DraftExercise => ({ ...exercise, min: String(exercise.min), max: String(exercise.max), alternatives: exercise.alternatives.join('\n') })

export function PlanEditorScreen({ plan, onSaved, onBack }: { plan: Plan | null; onSaved: () => void; onBack: () => void }) {
  const [name, setName] = useState(plan?.name ?? '')
  const [days, setDays] = useState<DraftDay[]>(() => plan ? [...plan.days].sort((a, b) => a.position - b.position).map(day => ({
    name: day.name, exercises: [...day.exercises].sort((a, b) => a.position - b.position).map(ex => toDraft({ name: ex.name, min: ex.target_sets_min, max: ex.target_sets_max, optional: ex.is_optional, notes: ex.prescription_notes ?? '', alternatives: ex.alternatives.map(alt => alt.name) })),
  })) : [{ name: '', exercises: [toDraft(blankExercise())] }])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const updateDay = (i: number, fn: (day: DraftDay) => DraftDay) => setDays(current => current.map((day, index) => index === i ? fn(day) : day))
  const updateExercise = (i: number, j: number, field: keyof DraftExercise, value: string | boolean) => updateDay(i, day => ({ ...day, exercises: day.exercises.map((exercise, index) => index === j ? { ...exercise, [field]: value } : exercise) }))
  const move = <T,>(list: T[], from: number, to: number) => { const next = [...list]; next.splice(to, 0, next.splice(from, 1)[0]); return next }
  const save = async () => {
    setError(null)
    if (!name.trim() || name.trim().length > 160) { setError('Il nome della scheda deve contenere da 1 a 160 caratteri.'); return }
    if (!days.length || days.length > 31 || days.some(day => !day.name.trim() || day.name.trim().length > 160 || !day.exercises.length || day.exercises.length > 100)) { setError('Controlla i giorni: da 1 a 31, con nome valido e da 1 a 100 esercizi.'); return }
    const payload: SaveDay[] = []
    for (const day of days) {
      const exercises: SaveExercise[] = []
      for (const ex of day.exercises) {
        const min = Number(ex.min), max = Number(ex.max)
        const alternatives = ex.alternatives.split('\n').map(s => s.trim()).filter(Boolean)
        if (!ex.name.trim() || ex.name.trim().length > 160 || ex.notes.trim().length > 2000 || alternatives.length > 20 || alternatives.some(value => value.length > 160) || !/^\d+$/.test(ex.min) || !/^\d+$/.test(ex.max) || !Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > 9999 || max > 9999 || max < min) {
          setError('Controlla esercizi, note, alternative e serie (0–9999; massimo ≥ minimo).'); return
        }
        exercises.push({ name: ex.name.trim(), min, max, optional: ex.optional, notes: ex.notes.trim(), alternatives })
      }
      payload.push({ name: day.name.trim(), exercises })
    }
    setBusy(true)
    try { await domain('plans.save', { name: name.trim(), ...(plan ? { planId: plan.id } : {}), days: payload }); onSaved() }
    catch (cause) { setError(message(cause)) } finally { setBusy(false) }
  }
  const confirmRemove = (title: string, remove: () => void) => Alert.alert('Conferma eliminazione', title, [{ text: 'Annulla', style: 'cancel' }, { text: 'Elimina', style: 'destructive', onPress: remove }])
  return <Page>
    <Button title="Indietro" secondary onPress={onBack} disabled={busy} />
    <Text style={styles.heading}>{plan ? 'Modifica scheda' : 'Nuova scheda'}</Text>
    <Text style={styles.sub}>Le modifiche creano una nuova versione e non cambiano le sessioni passate.</Text>
    <Notice message={error} />
    <Field label="Nome scheda" value={name} onChangeText={setName} editable={!busy && !plan} />
    {plan && <Text style={styles.small}>Il nome resta invariato per preservare le etichette dello storico.</Text>}
    {days.map((day, i) => <View key={`day-${i}`} style={styles.card}>
      <Text style={styles.title}>Giorno {i + 1}</Text>
      <Field label={`Nome giorno ${i + 1}`} value={day.name} onChangeText={value => updateDay(i, current => ({ ...current, name: value }))} editable={!busy} />
      <View style={styles.row}>
        {i > 0 && <Button title={`Sposta giorno ${i + 1} su`} secondary disabled={busy} onPress={() => setDays(current => move(current, i, i - 1))} />}
        {i < days.length - 1 && <Button title={`Sposta giorno ${i + 1} giù`} secondary disabled={busy} onPress={() => setDays(current => move(current, i, i + 1))} />}
      </View>
      {day.exercises.map((ex, j) => <View key={`ex-${i}-${j}`} style={{ gap: 10, padding: 12, borderWidth: 1, borderColor: color.border, borderRadius: 10 }}>
        <Text style={styles.title}>Esercizio {j + 1}</Text>
        <Field label={`Nome esercizio ${j + 1}`} value={ex.name} onChangeText={value => updateExercise(i, j, 'name', value)} editable={!busy} />
        <Field label="Serie minime indicative" value={ex.min} onChangeText={value => updateExercise(i, j, 'min', value)} keyboardType="number-pad" editable={!busy} />
        <Field label="Serie massime indicative" value={ex.max} onChangeText={value => updateExercise(i, j, 'max', value)} keyboardType="number-pad" editable={!busy} />
        <View style={styles.row}><Text style={styles.text}>Facoltativo</Text><Switch accessibilityLabel={`Esercizio ${j + 1} facoltativo`} value={ex.optional} onValueChange={value => updateExercise(i, j, 'optional', value)} disabled={busy} /></View>
        <Field label="Note prescrizione" value={ex.notes} onChangeText={value => updateExercise(i, j, 'notes', value)} multiline editable={!busy} />
        <Field label="Alternative (una per riga)" value={ex.alternatives} onChangeText={value => updateExercise(i, j, 'alternatives', value)} multiline editable={!busy} />
        <View style={styles.row}>
          {j > 0 && <Button title={`Sposta esercizio ${j + 1} su`} secondary disabled={busy} onPress={() => updateDay(i, d => ({ ...d, exercises: move(d.exercises, j, j - 1) }))} />}
          {j < day.exercises.length - 1 && <Button title={`Sposta esercizio ${j + 1} giù`} secondary disabled={busy} onPress={() => updateDay(i, d => ({ ...d, exercises: move(d.exercises, j, j + 1) }))} />}
        </View>
        <Button title={`Elimina esercizio ${j + 1}`} danger disabled={busy} onPress={() => confirmRemove('Eliminare questo esercizio?', () => updateDay(i, d => ({ ...d, exercises: d.exercises.filter((_, index) => index !== j) })))} />
      </View>)}
      <Button title={`Aggiungi esercizio al giorno ${i + 1}`} secondary disabled={busy} onPress={() => updateDay(i, d => ({ ...d, exercises: [...d.exercises, toDraft(blankExercise())] }))} />
      <Button title={`Elimina giorno ${i + 1}`} danger disabled={busy} onPress={() => confirmRemove('Eliminare il giorno e tutti i suoi esercizi?', () => setDays(current => current.filter((_, index) => index !== i)))} />
    </View>)}
    <Button title="Aggiungi giorno" secondary disabled={busy} onPress={() => setDays(current => [...current, { ...blankDay(), exercises: [toDraft(blankExercise())] }])} />
    {busy && <Busy />}<Button title={plan ? 'Salva nuova versione' : 'Crea scheda'} disabled={busy} onPress={() => { void save() }} />
  </Page>
}
