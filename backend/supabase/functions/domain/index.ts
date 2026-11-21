import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

// Protocol v1. Every client is created inside the request to keep JWT/RLS isolated.
const url = Deno.env.get('SUPABASE_URL') ?? ''
const key = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const origins = new Set([
  'http://localhost:5173',
  ...(Deno.env.get('SICKFIT_ALLOWED_ORIGINS') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
])
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_BODY = 256_000

type ObjectValue = Record<string, unknown>
class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message) }
}
const invalid = () => { throw new ApiError(400, 'INVALID_INPUT', 'Dati non validi.') }
const object = (v: unknown): ObjectValue => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return invalid()
  return v as ObjectValue
}
const fields = (v: ObjectValue, allowed: string[]) => {
  if (Object.keys(v).some((k) => !allowed.includes(k))) invalid()
}
const text = (v: unknown, limit = 160): string => {
  if (typeof v !== 'string' || !v.trim() || v.trim().length > limit) return invalid()
  return v.trim()
}
const optionalText = (v: unknown, limit = 2000): string | null => {
  if (v === undefined || v === null || v === '') return null
  if (typeof v !== 'string' || v.trim().length > limit) return invalid()
  return v.trim() || null
}
const id = (v: unknown): string => typeof v === 'string' && uuid.test(v) ? v : invalid()
const list = (v: unknown, min: number, max: number): unknown[] =>
  Array.isArray(v) && v.length >= min && v.length <= max ? v : invalid()
const integer = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : invalid()
const empty = (v: ObjectValue) => { fields(v, []); return {} }

function input(action: string, raw: ObjectValue): ObjectValue {
  switch (action) {
    case 'plans.list': case 'history.list': return empty(raw)
    case 'plans.archive': fields(raw, ['planId']); return { planId: id(raw.planId) }
    case 'workouts.start':
      fields(raw, ['planVersionId', 'planDayId'])
      return { planVersionId: id(raw.planVersionId), planDayId: id(raw.planDayId) }
    case 'workouts.cancel': case 'history.detail':
      fields(raw, ['sessionId']); return { sessionId: id(raw.sessionId) }
    case 'plans.save': {
      fields(raw, ['name', 'planId', 'days'])
      const days = list(raw.days, 1, 31).map((value) => {
        const day = object(value); fields(day, ['name', 'exercises'])
        return {
          name: text(day.name),
          exercises: list(day.exercises, 1, 100).map((value) => {
            const exercise = object(value)
            fields(exercise, ['name', 'min', 'max', 'optional', 'notes', 'alternatives'])
            const min = integer(exercise.min, 0, 9999)
            const max = integer(exercise.max, min, 9999)
            if (typeof exercise.optional !== 'boolean') invalid()
            return {
              name: text(exercise.name), min, max, optional: exercise.optional,
              notes: optionalText(exercise.notes),
              alternatives: list(exercise.alternatives, 0, 20).map((v) => text(v)),
            }
          }),
        }
      })
      return { name: text(raw.name), planId: raw.planId == null ? null : id(raw.planId), days }
    }
    case 'workouts.complete': {
      fields(raw, ['sessionId', 'exercises'])
      const seen = new Set<string>()
      const exercises = list(raw.exercises, 1, 100).map((value) => {
        const exercise = object(value)
        fields(exercise, ['planExerciseId', 'selectedAlternativeId', 'actualName', 'status', 'sets'])
        const planExerciseId = id(exercise.planExerciseId)
        if (seen.has(planExerciseId)) invalid()
        seen.add(planExerciseId)
        if (exercise.status !== 'completed' && exercise.status !== 'skipped') invalid()
        const sets = list(exercise.sets, 0, 100).map((value) => {
          const set = object(value)
          fields(set, ['reps', 'weightKg', 'durationSeconds', 'loadBasis', 'notes'])
          if (set.loadBasis !== 'per_side' && set.loadBasis !== 'total') invalid()
          if (set.weightKg != null &&
              (typeof set.weightKg !== 'number' || !Number.isFinite(set.weightKg) ||
               set.weightKg < 0 || set.weightKg > 1_000_000)) invalid()
          return {
            reps: set.reps == null ? null : integer(set.reps, 1, 1_000_000),
            weightKg: set.weightKg ?? null,
            durationSeconds: set.durationSeconds == null ? null : integer(set.durationSeconds, 1, 2_147_483_647),
            loadBasis: set.loadBasis,
            notes: list(set.notes, 0, 20).map((v) => text(v, 2000)),
          }
        })
        if (exercise.status === 'skipped' && sets.length) invalid()
        return {
          planExerciseId, selectedAlternativeId: exercise.selectedAlternativeId == null ? null : id(exercise.selectedAlternativeId),
          actualName: text(exercise.actualName), status: exercise.status, sets,
        }
      })
      return { sessionId: id(raw.sessionId), exercises }
    }
    default: throw new ApiError(400, 'UNKNOWN_ACTION', 'Azione non riconosciuta.')
  }
}

function result(body: unknown, status: number, origin: string | null): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin',
  }
  if (origin && origins.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'authorization, apikey, content-type, x-client-info'
  }
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers })
}
const failure = (status: number, code: string, message: string, origin: string | null) =>
  result({ error: { code, message } }, status, origin)

function dbError(error: { code?: string; message?: string }): never {
  if (error.code === 'P0001') {
    switch (error.message) {
      case 'INVALID_INPUT': return invalid()
      case 'NOT_FOUND': throw new ApiError(404, 'NOT_FOUND', 'Risorsa non trovata.')
      case 'CONFLICT': throw new ApiError(409, 'CONFLICT', 'Stato non compatibile con l’operazione.')
      case 'UNAUTHORIZED': throw new ApiError(401, 'UNAUTHORIZED', 'Accesso richiesto.')
    }
  }
  // Never echo database diagnostics, SQL, tokens or user data.
  throw new ApiError(500, 'DATA_ERROR', 'Operazione non riuscita.')
}
function checked<T>(response: { data: T; error: { code?: string; message?: string } | null }): T {
  if (response.error) dbError(response.error)
  return response.data
}
type Client = SupabaseClient

// Page by a stable primary key: PostgREST projects may cap a response at 1000 rows.
async function rows(client: Client, table: string, columns: string, userId: string, filter?: [string, string[]], onlyActive = false): Promise<ObjectValue[]> {
  if (filter && !filter[1].length) return []
  const all: ObjectValue[] = []
  const batches = filter ? Array.from({ length: Math.ceil(filter[1].length / 50) }, (_, i) => filter[1].slice(i * 50, i * 50 + 50)) : [null]
  for (const batch of batches) {
    for (let offset = 0; ; offset += 500) {
      let query = client.from(table).select(columns).eq('user_id', userId).order('id').range(offset, offset + 499)
      if (batch && filter) query = query.in(filter[0], batch)
      if (onlyActive) query = query.is('archived_at', null)
      const part = checked(await query) as unknown as ObjectValue[]
      all.push(...part)
      if (part.length < 500) break
    }
  }
  return all
}
const order = (a: ObjectValue, b: ObjectValue) => Number(a.position) - Number(b.position)
const ids = (items: ObjectValue[]) => items.map((v) => String(v.id))

async function plans(client: Client, userId: string) {
  const active = (await rows(client, 'training_plans', 'id,name,created_at', userId, undefined, true))
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  if (!active.length) return []
  const versions = await rows(client, 'plan_versions', 'id,training_plan_id,version_number', userId, ['training_plan_id', ids(active)])
  const latest = new Map<string, ObjectValue>()
  for (const version of versions) {
    const planId = String(version.training_plan_id)
    if (!latest.has(planId) || Number(version.version_number) > Number(latest.get(planId)!.version_number)) latest.set(planId, version)
  }
  if (latest.size !== active.length) throw new ApiError(500, 'DATA_ERROR', 'Schede non leggibili con le policy correnti.')
  const days = await rows(client, 'plan_days', 'id,plan_version_id,name,position', userId, ['plan_version_id', ids([...latest.values()])])
  const exercises = await rows(client, 'plan_exercises', 'id,plan_day_id,name,position,target_sets_min,target_sets_max,is_optional,prescription_notes', userId, ['plan_day_id', ids(days)])
  const alternatives = await rows(client, 'plan_exercise_alternatives', 'id,plan_exercise_id,name,position', userId, ['plan_exercise_id', ids(exercises)])
  return active.filter((p) => latest.has(String(p.id))).map((plan) => {
    const version = latest.get(String(plan.id))!
    return {
      id: plan.id, name: plan.name, versionId: version.id, versionNumber: version.version_number,
      days: days.filter((d) => d.plan_version_id === version.id).sort(order).map((day) => ({
        id: day.id, name: day.name, position: day.position,
        exercises: exercises.filter((e) => e.plan_day_id === day.id).sort(order).map((exercise) => ({
          id: exercise.id, name: exercise.name, position: exercise.position,
          target_sets_min: exercise.target_sets_min, target_sets_max: exercise.target_sets_max,
          is_optional: exercise.is_optional, prescription_notes: exercise.prescription_notes,
          alternatives: alternatives.filter((a) => a.plan_exercise_id === exercise.id).sort(order)
            .map((a) => ({ id: a.id, name: a.name })),
        })),
      })),
    }
  })
}

async function historyName(client: Client, userId: string, sessions: ObjectValue[]) {
  if (!sessions.length) return []
  const days = await rows(client, 'plan_days', 'id,name', userId, ['id', [...new Set(sessions.map((s) => String(s.plan_day_id)))]])
  const versions = await rows(client, 'plan_versions', 'id,training_plan_id', userId, ['id', [...new Set(sessions.map((s) => String(s.plan_version_id)))]])
  const planIds = [...new Set(versions.map((v) => String(v.training_plan_id)))]
  const planRows = await rows(client, 'training_plans', 'id,name', userId, ['id', planIds])
  const dayMap = new Map(days.map((d) => [d.id, d.name]))
  const versionMap = new Map(versions.map((v) => [v.id, v.training_plan_id]))
  const planMap = new Map(planRows.map((p) => [p.id, p.name]))
  return sessions.map((session) => {
    const dayName = dayMap.get(session.plan_day_id)
    const planName = planMap.get(versionMap.get(session.plan_version_id))
    if (!dayName || !planName) throw new ApiError(500, 'DATA_ERROR', 'Storico non leggibile con le policy correnti.')
    return {
      id: session.id, started_at: session.started_at, status: session.status,
      plan_day_id: session.plan_day_id, plan_version_id: session.plan_version_id,
      dayName, planName,
    }
  })
}
async function history(client: Client, userId: string) {
  const recent = checked(await client.from('workout_sessions')
    .select('id,started_at,status,plan_day_id,plan_version_id').eq('user_id', userId)
    .order('started_at', { ascending: false }).order('id', { ascending: false }).limit(50)) as unknown as ObjectValue[]
  const active = await rows(client, 'workout_sessions', 'id,started_at,status,plan_day_id,plan_version_id', userId, ['status', ['in_progress']])
  const byId = new Map([...recent, ...active].map((session) => [String(session.id), session]))
  const sessions = [...byId.values()].sort((a, b) =>
    String(b.started_at).localeCompare(String(a.started_at)) || String(b.id).localeCompare(String(a.id)))
  return historyName(client, userId, sessions)
}
async function detail(client: Client, userId: string, sessionId: string) {
  const session = checked(await client.from('workout_sessions')
    .select('id,started_at,status,plan_day_id,plan_version_id').eq('user_id', userId).eq('id', sessionId).maybeSingle()) as ObjectValue | null
  if (!session) throw new ApiError(404, 'NOT_FOUND', 'Risorsa non trovata.')
  const [named] = await historyName(client, userId, [session])
  const exercises = (await rows(client, 'workout_exercises', 'id,workout_session_id,actual_name,status,position,notes', userId, ['workout_session_id', [sessionId]])).sort(order)
  const sets = await rows(client, 'exercise_sets', 'id,workout_exercise_id,position,reps,weight_kg,load_basis,duration_seconds', userId, ['workout_exercise_id', ids(exercises)])
  const notes = await rows(client, 'set_notes', 'id,exercise_set_id,text,position', userId, ['exercise_set_id', ids(sets)])
  return {
    ...named,
    exercises: exercises.map((e) => ({
      id: e.id, actual_name: e.actual_name, status: e.status, position: e.position, notes: e.notes,
      sets: sets.filter((s) => s.workout_exercise_id === e.id).sort(order).map((s) => ({
        id: s.id, position: s.position, reps: s.reps, weight_kg: s.weight_kg,
        load_basis: s.load_basis, duration_seconds: s.duration_seconds,
        notes: notes.filter((n) => n.exercise_set_id === s.id).sort(order)
          .map((n) => ({ text: n.text, position: n.position })),
      })),
    })),
  }
}

async function limitedBody(request: Request): Promise<string> {
  const length = request.headers.get('content-length')
  if (length && Number(length) > MAX_BODY) invalid()
  if (!request.body) return invalid()
  const reader = request.body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let bytes = 0
  let body = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > MAX_BODY) invalid()
      try { body += decoder.decode(value, { stream: true }) } catch { return invalid() }
    }
    try { return body + decoder.decode() } catch { return invalid() }
  } finally {
    reader.releaseLock()
    if (bytes > MAX_BODY) await request.body.cancel().catch(() => {})
  }
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin')
  if (origin && !origins.has(origin)) return failure(403, 'FORBIDDEN_ORIGIN', 'Origine non consentita.', origin)
  if (request.method === 'OPTIONS') return result(null, 204, origin)
  if (request.method !== 'POST') return failure(405, 'METHOD_NOT_ALLOWED', 'Metodo non consentito.', origin)
  if (!url || !key) return failure(503, 'NOT_CONFIGURED', 'Servizio non configurato.', origin)
  try {
    const authorization = request.headers.get('authorization') ?? ''
    const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(authorization)
    if (!match) throw new ApiError(401, 'UNAUTHORIZED', 'Accesso richiesto.')
    const token = match[1]
    const client = createClient(url, key, {
      global: { headers: { Authorization: 'Bearer ' + token } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
    const { data: { user }, error: authError } = await client.auth.getUser(token)
    if (authError || !user) throw new ApiError(401, 'UNAUTHORIZED', 'Accesso richiesto.')
    const source = await limitedBody(request)
    let parsed: unknown
    try { parsed = JSON.parse(source) } catch { return invalid() }
    const body = object(parsed); fields(body, ['action', 'payload'])
    const action = text(body.action, 64)
    const payload = input(action, object(body.payload))
    let data: unknown
    switch (action) {
      case 'plans.list': data = await plans(client, user.id); break
      case 'history.list': data = await history(client, user.id); break
      case 'history.detail': data = await detail(client, user.id, String(payload.sessionId)); break
      case 'plans.save': data = { id: checked(await client.rpc('sickfit_plan_save', {
        p_name: payload.name, p_plan_id: payload.planId, p_days: payload.days,
      })) }; break
      case 'plans.archive': data = { id: checked(await client.rpc('sickfit_plan_archive', { p_plan_id: payload.planId })) }; break
      case 'workouts.start': data = { id: checked(await client.rpc('sickfit_workout_start', {
        p_version_id: payload.planVersionId, p_day_id: payload.planDayId,
      })) }; break
      case 'workouts.complete': data = { id: checked(await client.rpc('sickfit_workout_complete', {
        p_session_id: payload.sessionId, p_exercises: payload.exercises,
      })) }; break
      case 'workouts.cancel': data = { id: checked(await client.rpc('sickfit_workout_cancel', { p_session_id: payload.sessionId })) }; break
    }
    return result({ data }, 200, origin)
  } catch (error) {
    if (error instanceof ApiError) return failure(error.status, error.code, error.message, origin)
    return failure(500, 'INTERNAL_ERROR', 'Operazione non riuscita.', origin)
  }
})
