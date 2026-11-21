import { useState } from 'react'
import { Text, View } from 'react-native'
import { emailAddress, requestRecovery, signIn, signUp, validUsername } from '../lib/auth'
import { requireSupabase } from '../lib/supabase'
import { Button, Field, Notice, Page, message, styles } from '../ui'

type Mode = 'login' | 'register' | 'forgot' | 'reset'
export function AuthScreen({ recovery, onVerified }: { recovery: boolean; onVerified: (username: string) => void }) {
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState('')
  const current = recovery ? 'reset' : mode
  const changeMode = (next: Mode) => { setMode(next); setError(null); setInfo(''); setPassword(''); setConfirm('') }
  const submit = async () => {
    setError(null); setInfo('')
    if (current === 'login' || current === 'register') {
      if (!validUsername(username) || !emailAddress(email) || !password) { setError('Inserisci username valido (3–32 caratteri: lettere, numeri, . _ -), email e password.'); return }
    }
    if (current === 'register' && password.length < 8) { setError('La password deve avere almeno 8 caratteri.'); return }
    if (current === 'reset' && (password.length < 8 || password !== confirm)) { setError('Inserisci e conferma una nuova password di almeno 8 caratteri.'); return }
    if (current === 'forgot' && !emailAddress(email)) { setError('Inserisci la tua email.'); return }
    setBusy(true)
    try {
      if (current === 'login') { const verified = await signIn(username, email, password); onVerified(verified) }
      if (current === 'register') {
        const verified = await signUp(username, email, password)
        if (verified) onVerified(verified)
        else { changeMode('login'); setInfo('Controlla la posta se è richiesta una conferma, poi prova ad accedere.') }
      }
      if (current === 'forgot') { await requestRecovery(email); setInfo('Se l’indirizzo esiste, riceverai un link per reimpostare la password.') }
      if (current === 'reset') {
        const { error: failure } = await requireSupabase().auth.updateUser({ password })
        if (failure) throw failure
        setPassword(''); setConfirm(''); setInfo('Password aggiornata. Ora puoi accedere.')
        // Recovery grants a session; require a fresh three-field login.
        await requireSupabase().auth.signOut({ scope: 'local' })
        changeMode('login')
        setInfo('Password aggiornata. Ora accedi con username, email e nuova password.')
      }
    } catch (cause) { setError(message(cause)) } finally { setBusy(false) }
  }
  return <Page>
    <Text style={styles.heading}>SickFit</Text>
    <Text style={styles.sub}>{current === 'login' ? 'Accedi ai tuoi allenamenti' : current === 'register' ? 'Crea il tuo account' : current === 'forgot' ? 'Recupera la password' : 'Scegli una nuova password'}</Text>
    <Notice message={error} />{info ? <Text accessibilityRole="alert" style={styles.text}>{info}</Text> : null}
    {(current === 'login' || current === 'register') && <Field label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" autoComplete="username" maxLength={32} />}
    {current !== 'reset' && <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />}
    {current !== 'forgot' && <Field label={current === 'reset' ? 'Nuova password' : 'Password'} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete={current === 'login' ? 'current-password' : 'new-password'} />}
    {current === 'reset' && <Field label="Conferma nuova password" value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" />}
    <Button title={busy ? 'Attendi…' : current === 'login' ? 'Accedi' : current === 'register' ? 'Registrati' : current === 'forgot' ? 'Invia link' : 'Aggiorna password'} onPress={() => { void submit() }} disabled={busy} />
    {!recovery && <View style={{ gap: 10 }}>
      {mode !== 'login' && <Button title="Torna all’accesso" secondary onPress={() => changeMode('login')} />}
      {mode === 'login' && <><Button title="Crea account" secondary onPress={() => changeMode('register')} /><Button title="Password dimenticata?" secondary onPress={() => changeMode('forgot')} /></>}
    </View>}
  </Page>
}
