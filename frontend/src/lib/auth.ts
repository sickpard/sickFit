import { requireSupabase } from './supabase'
import { normalizeUsername } from './workout'

export async function requestPasswordRecovery(email: string) {
  return requireSupabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}${window.location.pathname}?recovery=1`,
  })
}

export async function updateRecoveredPassword(password: string) {
  return requireSupabase().auth.updateUser({ password })
}

export async function signInWithUsername(input: {
  username: string
  email: string
  password: string
}) {
  const client = requireSupabase()
  const invalidCredentials = 'Accesso non riuscito. Controlla i dati e riprova.'
  const { data, error } = await client.auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  })
  if (error || !data.user || !data.session) throw new Error(invalidCredentials)

  try {
    // Only read the authenticated user's profile through its RLS policy.
    const { data: profile, error: profileError } = await client.from('profiles')
      .select('username_normalized')
      .eq('id', data.user.id)
      .single()
    if (profileError || profile?.username_normalized !== normalizeUsername(input.username)) {
      throw new Error(invalidCredentials)
    }
    return data
  } catch {
    try {
      const { error: signOutError } = await client.auth.signOut({ scope: 'local' })
      if (signOutError) await client.auth.signOut({ scope: 'local' })
    } catch {
      await client.auth.signOut({ scope: 'local' }).catch(() => undefined)
    }
    throw new Error(invalidCredentials)
  }
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
