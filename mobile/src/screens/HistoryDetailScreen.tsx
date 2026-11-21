import { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { domain, type SessionDetail } from '../lib/domain'
import { Button, Busy, Notice, Page, message, styles } from '../ui'
import { dateLabel } from './HistoryScreen'

export function HistoryDetailScreen({ sessionId, onBack }: { sessionId: string; onBack: () => void }) {
  const [detail, setDetail] = useState<SessionDetail | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => { setBusy(true); setError(null); try { setDetail(await domain('history.detail', { sessionId })) } catch (cause) { setError(message(cause)) } finally { setBusy(false) } }, [sessionId])
  useEffect(() => { void load() }, [load])
  return <Page refresh={() => { void load() }} refreshing={busy}>
    <Button title="Torna allo storico" secondary onPress={onBack} />
    <Text style={styles.heading}>Dettaglio allenamento</Text><Notice message={error} />{busy && <Busy />}
    {detail && <>
      <Text style={styles.title}>{detail.dayName} · {detail.planName}</Text>
      <Text style={styles.small}>{dateLabel(detail.started_at)} · {detail.status === 'completed' ? 'Completato' : 'In corso'}</Text>
      {[...detail.exercises].sort((a, b) => a.position - b.position).map(ex => <View key={ex.id} style={styles.card}>
        <Text style={styles.title}>{ex.actual_name}</Text>
        <Text style={styles.small}>{ex.status === 'skipped' ? 'Saltato' : 'Svolto'}</Text>
        {!!ex.notes && <Text style={styles.text}>{ex.notes}</Text>}
        {[...ex.sets].sort((a, b) => a.position - b.position).map(set => <View key={set.id} style={styles.card}>
          <Text style={styles.text}>Serie {set.position}</Text>
          {set.reps != null && <Text style={styles.small}>Ripetizioni: {set.reps}</Text>}
          {set.weight_kg != null && <Text style={styles.small}>Carico: {set.weight_kg} kg {set.load_basis === 'per_side' ? 'per lato' : 'totale'}</Text>}
          {set.duration_seconds != null && <Text style={styles.small}>Durata: {set.duration_seconds} s</Text>}
          {[...set.notes].sort((a, b) => a.position - b.position).map((note, i) => <Text key={`${note.position}-${i}`} style={styles.small}>Nota: {note.text}</Text>)}
        </View>)}
      </View>)}
    </>}
  </Page>
}
