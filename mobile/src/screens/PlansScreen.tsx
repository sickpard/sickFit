import { useCallback, useEffect, useState } from 'react'
import { Alert, Text, View } from 'react-native'
import { domain, type Plan, type PlanDay } from '../lib/domain'
import { Button, Busy, Notice, Page, message, styles } from '../ui'

export function PlansScreen({ onEdit, onStart }: { onEdit: (plan: Plan | null) => void; onStart: (plan: Plan, day: PlanDay) => void }) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    setBusy(true); setError(null)
    try { setPlans(await domain('plans.list', {})) } catch (cause) { setError(message(cause)) } finally { setBusy(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const archive = (plan: Plan) => Alert.alert('Archivia scheda', `Archiviare “${plan.name}”? Lo storico rimarrà disponibile.`, [
    { text: 'Annulla', style: 'cancel' }, { text: 'Archivia', style: 'destructive', onPress: () => { void (async () => {
      setBusy(true); setError(null)
      try { await domain('plans.archive', { planId: plan.id }); await load() } catch (cause) { setError(message(cause)) } finally { setBusy(false) }
    })() } },
  ])
  return <Page refresh={() => { void load() }} refreshing={busy}>
    <Text style={styles.heading}>Le tue schede</Text>
    <Text style={styles.sub}>Scegli un giorno per iniziare oppure crea una nuova scheda.</Text>
    <Button title="Nuova scheda" onPress={() => onEdit(null)} disabled={busy} />
    <Notice message={error} />{busy && <Busy />}
    {!busy && !error && plans.length === 0 && <Text style={styles.small}>Non ci sono schede attive.</Text>}
    {plans.map(plan => <View key={plan.id} style={styles.card}>
      <Text style={styles.title}>{plan.name}</Text><Text style={styles.small}>Versione {plan.versionNumber}</Text>
      {[...plan.days].sort((a, b) => a.position - b.position).map(day => <View key={day.id} style={styles.card}>
        <Text style={styles.text}>{day.name}</Text><Text style={styles.small}>{day.exercises.length} esercizi</Text>
        <Button title={`Inizia ${day.name}`} onPress={() => onStart(plan, day)} disabled={busy} />
      </View>)}
      <Button title={`Modifica ${plan.name}`} secondary onPress={() => onEdit(plan)} disabled={busy} />
      <Button title={`Archivia ${plan.name}`} danger onPress={() => archive(plan)} disabled={busy} />
    </View>)}
  </Page>
}
