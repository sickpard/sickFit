import { requireSupabase } from './supabase'

export type Alternative = { id: string; name: string }
export type PlanExercise = {
  id: string
  name: string
  position: number
  target_sets_min: number
  target_sets_max: number
  is_optional: boolean
  prescription_notes: string | null
  alternatives: Alternative[]
}
export type PlanDay = { id: string; name: string; position: number; exercises: PlanExercise[] }
export type PlanCard = { id: string; name: string; versionId: string; versionNumber: number; days: PlanDay[] }
export type PlanInput = {
  name: string
  planId?: string
  days: { name: string; exercises: { name: string; min: number; max: number; optional: boolean; notes: string; alternatives: string[] }[] }[]
}
export type WorkoutInput = {
  sessionId: string
  exercises: {
    planExerciseId: string
    selectedAlternativeId?: string
    actualName: string
    status: 'completed' | 'skipped'
    sets: { reps?: number; weightKg?: number; durationSeconds?: number; loadBasis: 'per_side' | 'total'; notes: string[] }[]
  }[]
}
export type HistoryEntry = {
  id: string
  started_at: string
  status: 'in_progress' | 'completed'
  plan_day_id: string
  plan_version_id: string
  planName: string
  dayName: string
}
export type HistoryDetail = HistoryEntry & {
  exercises: {
    id: string
    actual_name: string
    status: 'completed' | 'skipped'
    position: number
    notes: string | null
    sets: {
      id: string
      position: number
      reps: number | null
      weight_kg: number | null
      load_basis: 'per_side' | 'total'
      duration_seconds: number | null
      notes: { text: string; position: number }[]
    }[]
  }[]
}

type Operations = {
  'plans.list': { payload: Record<string, never>; result: PlanCard[] }
  'plans.save': { payload: PlanInput; result: { id: string } }
  'plans.archive': { payload: { planId: string }; result: { id: string } }
  'workouts.start': { payload: { planVersionId: string; planDayId: string }; result: { id: string } }
  'workouts.complete': { payload: WorkoutInput; result: { id: string } }
  'workouts.cancel': { payload: { sessionId: string }; result: { id: string } }
  'history.list': { payload: Record<string, never>; result: HistoryEntry[] }
  'history.detail': { payload: { sessionId: string }; result: HistoryDetail }
}

export class DomainError extends Error {
  constructor(readonly code: string, message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

// The function uses an envelope even for failures. Supabase may instead surface
// a non-2xx response as a FunctionsHttpError; read its response when available.
export async function domain<A extends keyof Operations>(action: A, payload: Operations[A]['payload']): Promise<Operations[A]['result']> {
  const { data, error } = await requireSupabase().functions.invoke('domain', { body: { action, payload } })
  let envelope: unknown = data
  if (error && 'context' in error && error.context instanceof Response) {
    try { envelope = await error.context.clone().json() } catch { /* Keep the transport error below. */ }
  }
  if (envelope && typeof envelope === 'object') {
    const result = envelope as { data?: unknown; error?: { code?: unknown; message?: unknown } }
    if (result.error && typeof result.error.code === 'string' && typeof result.error.message === 'string') {
      throw new DomainError(result.error.code, result.error.message)
    }
    if (!error && Object.prototype.hasOwnProperty.call(result, 'data')) {
      return result.data as Operations[A]['result']
    }
  }
  throw new DomainError('DOMAIN_UNAVAILABLE', 'Servizio non disponibile. Riprova più tardi.')
}
