import * as Linking from 'expo-linking'
import { requireSupabase } from './supabase'

export const redirectTo = 'sickfit://auth/callback'
const confirmationRedirect = `${redirectTo}?flow=confirm`
const recoveryRedirect = `${redirectTo}?flow=recovery`
export const validUsername = (value: string) => /^[A-Za-z0-9._-]{3,32}$/.test(value.trim())
export const emailAddress = (value: string) => value.trim().toLowerCase()

// The username comparison is made against the signed-in user's RLS-protected profile,
// not against untrusted user_metadata or a public username lookup.
export async function verifyProfile(userId: string, username?: string) {
  const { data, error } = await requireSupabase().from('profiles').select('username').eq('id', userId).single()
  if (error || !data?.username) throw new Error('Profilo non disponibile. Verifica la connessione e riprova.')
  if (username && data.username.toLowerCase() !== username.trim().toLowerCase()) {
    await requireSupabase().auth.signOut({ scope: 'local' })
    throw new Error('Accesso non riuscito. Controlla i dati e riprova.')
  }
  return data.username as string
}

export async function signIn(username: string, email: string, password: string) {
  const client = requireSupabase()
  const { data, error } = await client.auth.signInWithPassword({ email: emailAddress(email), password })
  if (error || !data.user) throw new Error('Accesso non riuscito. Controlla i dati e riprova.')
  try { return await verifyProfile(data.user.id, username) }
  catch (cause) { await client.auth.signOut({ scope: 'local' }); throw cause }
}

export async function signUp(username: string, email: string, password: string) {
  const client = requireSupabase()
  const { data, error } = await client.auth.signUp({
    email: emailAddress(email), password,
    options: { data: { username: username.trim() }, emailRedirectTo: confirmationRedirect },
  })
  if (error) throw error
  if (!data.session || !data.user) return null
  try { return await verifyProfile(data.user.id, username) }
  catch { await client.auth.signOut({ scope: 'local' }); return null }
}

export async function requestRecovery(email: string) {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(emailAddress(email), { redirectTo: recoveryRedirect })
  if (error) throw error
}

// Only accept callbacks on our exact registered route. Never print a URL: it may contain tokens.
export async function handleAuthUrl(raw: string): Promise<'recovery' | 'confirmed' | null> {
  const url = Linking.unwrapDevLaunchURL(raw)
  if (!/^sickfit:\/\/auth\/callback(?:[?#]|$)/.test(url)) return null
  const query = url.split('?')[1]?.split('#')[0] ?? ''
  const hash = url.split('#')[1] ?? ''
  const params = new URLSearchParams(`${query}&${hash}`)
  if (params.get('error') || params.get('error_code')) throw new Error('Link scaduto o non valido. Richiedine uno nuovo.')
  const client = requireSupabase()
  const type = params.get('type')
  const code = params.get('code')
  const access = params.get('access_token')
  const refresh = params.get('refresh_token')
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code)
    if (error) throw new Error('Link scaduto o già utilizzato. Richiedine uno nuovo.')
  } else if (access && refresh) {
    const { error } = await client.auth.setSession({ access_token: access, refresh_token: refresh })
    if (error) throw new Error('Link scaduto o già utilizzato. Richiedine uno nuovo.')
  } else throw new Error('Link di accesso non valido.')
  return type === 'recovery' || params.get('flow') === 'recovery' ? 'recovery' : 'confirmed'
}
