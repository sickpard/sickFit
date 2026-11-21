import { useCallback, useEffect, useState } from 'react'
import { Alert, Text, View } from 'react-native'
import { domain, type Plan, type PlanDay, type SessionSummary } from '../lib/domain'
import { Button, Busy, Notice, Page, message, styles } from '../ui'

export const dateLabel = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })
}
export function HistoryScreen({ onDetail, onResume }: { onDetail: (sessionId: string) => void; onResume: (plan: Plan, day: PlanDay, sessionId: string) => void }) {
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    setBusy(true); setError(null)
    try {
      setSessions(await domain('history.list', {}))
      try { setPlans(await domain('plans.list', {})) }
      catch { setPlans([]); setError('Storico caricato; non riesco a verificare le versioni delle schede per la ripresa.') }
    } catch (cause) { setError(message(cause)) } finally { setBusy(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const cancel = (session: SessionSummary) => Alert.alert('Annulla sessione', 'Questa sessione è incompleta. Annullarla?', [
    { text: 'Indietro', style: 'cancel' }, { text: 'Annulla sessione', style: 'destructive', onPress: () => { void (async () => {
      setBusy(true); setError(null)
      try { await domain('workouts.cancel', { sessionId: session.id }); await load() } catch (cause) { setError(message(cause)) } finally { setBusy(false) }
    })() } },
  ])
  const resume = async (session: SessionSummary, plan: Plan, day: PlanDay) => {
    setBusy(true); setError(null)
    try {
      const detail = await domain('history.detail', { sessionId: session.id })
      if (detail.status !== 'in_progress' || detail.exercises.length > 0) throw new Error('Questa sessione non può essere ripresa. Puoi annullarla dallo storico.')
      onResume(plan, day, session.id)
    } catch (cause) { setError(message(cause)) } finally { setBusy(false) }
  }
  return <Page refresh={() => { void load() }} refreshing={busy}>
    <Text style={styles.heading}>Storico</Text><Text style={styles.sub}>Le sessioni restano collegate alla versione della scheda usata.</Text>
    <Notice message={error} />{busy && <Busy />}
    {!busy && !error && sessions.length === 0 && <Text style={styles.small}>Non hai ancora sessioni registrate.</Text>}
    {sessions.map(session => <View key={session.id} style={styles.card}>
      <Text style={styles.title}>{session.dayName}</Text><Text style={styles.text}>{session.planName}</Text>
      <Text style={styles.small}>{dateLabel(session.started_at)} · {session.status === 'completed' ? 'Completata' : 'In corso'}</Text>
      {session.status === 'completed' ? <Button title={`Dettagli ${session.dayName} del ${dateLabel(session.started_at)}`} secondary onPress={() => onDetail(session.id)} disabled={busy} /> : <>
        {(() => {
          const plan = plans.find(value => value.versionId === session.plan_version_id)
          const day = plan?.days.find(value => value.id === session.plan_day_id)
          return plan && day ? <Button title={`Riprendi ${session.dayName}`} secondary onPress={() => { void resume(session, plan, day) }} disabled={busy} /> : <Text style={styles.small}>La versione originale non è disponibile tra le schede attive: puoi solo annullare questa sessione.</Text>
        })()}
        <Button title={`Annulla sessione incompleta ${session.dayName}`} danger onPress={() => cancel(session)} disabled={busy} />
      </>}
    </View>)}
  </Page>
}
