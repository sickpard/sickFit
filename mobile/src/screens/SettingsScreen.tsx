import { useState } from 'react'
import { Text } from 'react-native'
import { requireSupabase } from '../lib/supabase'
import { Button, Busy, Notice, Page, message, styles } from '../ui'

export function SettingsScreen({ username }: { username: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logout = async () => {
    setBusy(true); setError(null)
    try {
      const { error: failure } = await requireSupabase().auth.signOut({ scope: 'local' })
      if (failure) throw failure
    } catch (cause) { setError(message(cause)) } finally { setBusy(false) }
  }
  return <Page><Text style={styles.heading}>Impostazioni</Text>
    <Text style={styles.text}>Account: {username}</Text>
    <Text style={styles.small}>Allenamenti online, carichi in kg. Nessun dato delle sessioni viene salvato per uso offline.</Text>
    <Notice message={error} />{busy && <Busy />}
    <Button title="Esci dall’account" danger disabled={busy} onPress={() => { void logout() }} />
  </Page>
}
