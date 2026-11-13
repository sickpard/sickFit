import { requireSupabase } from './supabase'
import { normalizeUsername } from './workout'

export async function signInWithUsername(input: {
  username: string
  email: string
  password: string
}) {
  const client = requireSupabase()
  const { data, error } = await client.functions.invoke('login-with-username', {
    body: {
      username: normalizeUsername(input.username),
      email: input.email.trim().toLowerCase(),
      password: input.password,
    },
  })

  if (error) throw new Error('Accesso non riuscito. Controlla i dati e riprova.')

  const session = data?.session ?? data
  if (!session?.access_token || !session?.refresh_token) {
    throw new Error('Il servizio di accesso non ha restituito una sessione valida.')
  }

  const { data: sessionData, error: sessionError } = await client.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  })

  if (sessionError) throw new Error('Non è stato possibile avviare la sessione.')
  return sessionData
}

export async function signUpWithUsername(input: {
  username: string
  email: string
  password: string
}) {
  const client = requireSupabase()
  return client.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: { username: input.username.trim() },
    },
  })
}
