import { createClient } from 'npm:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const publicKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const allowedOrigins = new Set([
  'http://localhost:5173',
  ...(Deno.env.get('SICKFIT_ALLOWED_ORIGINS') ?? '').split(',').map((origin) => origin.trim()).filter(Boolean),
])

const genericFailure = 'Username, email o password non validi.'

function response(body: unknown, status: number, origin: string) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin',
      'Cache-Control': 'no-store',
    },
  })
}

Deno.serve(async (request) => {
  const requestOrigin = request.headers.get('origin') ?? ''
  const origin = requestOrigin || 'http://localhost:5173'
  if (requestOrigin && !allowedOrigins.has(requestOrigin)) {
    return response({ error: 'Origine non consentita.' }, 403, 'null')
  }
  if (request.method === 'OPTIONS') return response(null, 204, origin)
  if (request.method !== 'POST') return response({ error: 'Metodo non consentito.' }, 405, origin)
  if (!supabaseUrl || !publicKey || !serviceKey) {
    return response({ error: 'Servizio di accesso non configurato.' }, 500, origin)
  }

  try {
    const body = await request.json()
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    if (!username || !email || !password) return response({ error: genericFailure }, 401, origin)

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const auth = createClient(supabaseUrl, publicKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id')
      .eq('username_normalized', username)
      .maybeSingle()
    if (profileError || !profile) return response({ error: genericFailure }, 401, origin)

    const { data: userData, error: userError } = await admin.auth.admin.getUserById(profile.id)
    const accountEmail = userData.user?.email?.trim().toLowerCase()
    if (userError || !accountEmail || accountEmail !== email) {
      return response({ error: genericFailure }, 401, origin)
    }

    const { data: authData, error: authError } = await auth.auth.signInWithPassword({ email, password })
    if (authError || !authData.session) return response({ error: genericFailure }, 401, origin)

    return response({
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      },
    }, 200, origin)
  } catch {
    return response({ error: genericFailure }, 401, origin)
  }
})
