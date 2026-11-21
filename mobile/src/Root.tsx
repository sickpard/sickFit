import { useEffect, useRef, useState } from 'react'
import * as Linking from 'expo-linking'
import { Alert, BackHandler, SafeAreaView, StatusBar, Text, View } from 'react-native'
import { handleAuthUrl, verifyProfile } from './lib/auth'
import { configured, requireSupabase, supabase } from './lib/supabase'
import type { Plan, PlanDay } from './lib/domain'
import { AuthScreen } from './screens/AuthScreen'
import { PlansScreen } from './screens/PlansScreen'
import { PlanEditorScreen } from './screens/PlanEditorScreen'
import { WorkoutScreen } from './screens/WorkoutScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { HistoryDetailScreen } from './screens/HistoryDetailScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { Button, Busy, Notice, color, message, styles } from './ui'

type Screen = { name: 'plans' } | { name: 'editor'; plan: Plan | null } | { name: 'workout'; plan: Plan; day: PlanDay; sessionId?: string } | { name: 'history' } | { name: 'detail'; id: string } | { name: 'settings' }

export default function Root() {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string | null>(null)
  const [recovery, setRecovery] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [screen, setScreen] = useState<Screen>({ name: 'plans' })
  const [revision, setRevision] = useState(0)
  const authCallback = useRef<{ url: string; promise: ReturnType<typeof handleAuthUrl> } | null>(null)
  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return
      if (event === 'SIGNED_OUT') { setUsername(null); setRecovery(false); setScreen({ name: 'plans' }) }
      if (event === 'PASSWORD_RECOVERY') { setRecovery(true); setUsername(null) }
      // SIGNED_IN alone does not authorize access: login must verify username via RLS.
    })
    const processUrl = async (url: string) => {
      if (authCallback.current?.url !== url) authCallback.current = { url, promise: handleAuthUrl(url) }
      try {
        const outcome = await authCallback.current.promise
        if (!active || !outcome) return
        setError(null)
        if (outcome === 'recovery') { setRecovery(true); setUsername(null); setScreen({ name: 'plans' }); return }
        const { data: { user }, error: failure } = await requireSupabase().auth.getUser()
        if (failure || !user) throw new Error('Conferma non riuscita. Accedi di nuovo.')
        const name = await verifyProfile(user.id)
        if (active) { setUsername(name); setRecovery(false) }
      } catch (cause) { if (active) setError(message(cause)) }
    }
    const listener = Linking.addEventListener('url', event => { void processUrl(event.url) })
    void (async () => {
      try {
        const url = await Linking.getInitialURL()
        if (url && /^sickfit:\/\/auth\/callback/.test(Linking.unwrapDevLaunchURL(url))) await processUrl(url)
        else {
          const { data: { session }, error: failure } = await requireSupabase().auth.getSession()
          if (failure) throw failure
          if (session?.user && active) {
            const name = await verifyProfile(session.user.id)
            if (active) setUsername(name)
          }
        }
      } catch (cause) { if (active) setError(message(cause)) }
      finally { if (active) setLoading(false) }
    })()
    return () => { active = false; subscription.unsubscribe(); listener.remove() }
  }, [])
  const back = () => {
    if (screen.name === 'workout') { Alert.alert('Allenamento in corso', 'Usa “Annulla allenamento” per uscire senza lasciare una sessione aperta.'); return true }
    if (screen.name === 'editor') { Alert.alert('Scartare le modifiche?', 'Le modifiche non salvate andranno perse.', [{ text: 'Continua a modificare', style: 'cancel' }, { text: 'Scarta', style: 'destructive', onPress: () => setScreen({ name: 'plans' }) }]); return true }
    if (screen.name === 'detail') { setScreen({ name: 'history' }); return true }
    if (screen.name !== 'plans') { setScreen({ name: 'plans' }); return true }
    return false
  }
  useEffect(() => { const subscription = BackHandler.addEventListener('hardwareBackPress', back); return () => subscription.remove() })
  const showPlans = () => { setRevision(current => current + 1); setScreen({ name: 'plans' }) }
  const showHistory = () => { setRevision(current => current + 1); setScreen({ name: 'history' }) }
  return <SafeAreaView style={styles.page}>
    <StatusBar backgroundColor={color.bg} barStyle="light-content" />
    {loading ? <View style={{ flex: 1, justifyContent: 'center' }}><Busy /></View> : !configured ?
      <View style={styles.content}><Text style={styles.heading}>SickFit</Text><Notice message="Configura EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY per collegare l’app." /></View> :
      !username || recovery ? <View style={{ flex: 1 }}><View style={{ paddingHorizontal: 20 }}><Notice message={error} /></View>
        <AuthScreen recovery={recovery} onVerified={name => { setUsername(name); setRecovery(false); setError(null); showPlans() }} />
      </View> : <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: color.border }}>
          <Text accessibilityRole="header" style={styles.title}>SickFit</Text>
        </View>
        <View style={{ flex: 1 }}>
          {screen.name === 'plans' && <PlansScreen key={`plans-${revision}`} onEdit={plan => setScreen({ name: 'editor', plan })} onStart={(plan, day) => setScreen({ name: 'workout', plan, day })} />}
          {screen.name === 'editor' && <PlanEditorScreen plan={screen.plan} onSaved={showPlans} onBack={() => { back() }} />}
          {screen.name === 'workout' && <WorkoutScreen plan={screen.plan} day={screen.day} existingSessionId={screen.sessionId} onDone={showHistory} onExit={showPlans} />}
          {screen.name === 'history' && <HistoryScreen key={`history-${revision}`} onDetail={id => setScreen({ name: 'detail', id })} onResume={(plan, day, sessionId) => setScreen({ name: 'workout', plan, day, sessionId })} />}
          {screen.name === 'detail' && <HistoryDetailScreen sessionId={screen.id} onBack={showHistory} />}
          {screen.name === 'settings' && <SettingsScreen username={username} />}
        </View>
        {screen.name !== 'workout' && screen.name !== 'editor' && screen.name !== 'detail' &&
          <View style={{ flexDirection: 'row', padding: 8, gap: 6, borderTopWidth: 1, borderTopColor: color.border }}>
            <View style={{ flex: 1 }}><Button title="Schede" secondary={screen.name !== 'plans'} onPress={showPlans} /></View>
            <View style={{ flex: 1 }}><Button title="Storico" secondary={screen.name !== 'history'} onPress={showHistory} /></View>
            <View style={{ flex: 1 }}><Button title="Profilo" secondary={screen.name !== 'settings'} onPress={() => setScreen({ name: 'settings' })} /></View>
          </View>}
      </View>}
  </SafeAreaView>
}
