import { requireSupabase } from './supabase'

export type Alternative = { id: string; name: string }
export type PlanExercise = { id: string; name: string; position: number; target_sets_min: number; target_sets_max: number; is_optional: boolean; prescription_notes: string | null; alternatives: Alternative[] }
export type PlanDay = { id: string; name: string; position: number; exercises: PlanExercise[] }
export type Plan = { id: string; name: string; versionId: string; versionNumber: number; days: PlanDay[] }
export type SaveExercise = { name: string; min: number; max: number; optional: boolean; notes: string; alternatives: string[] }
export type SaveDay = { name: string; exercises: SaveExercise[] }
export type SetEntry = { reps?: number; weightKg?: number; durationSeconds?: number; loadBasis: 'per_side' | 'total'; notes: string[] }
export type CompletedExercise = { planExerciseId: string; selectedAlternativeId?: string; actualName: string; status: 'completed' | 'skipped'; sets: SetEntry[] }
export type SessionSummary = { id: string; started_at: string; status: 'in_progress' | 'completed'; plan_day_id: string; plan_version_id: string; planName: string; dayName: string }
export type SessionDetail = SessionSummary & { exercises: { id: string; actual_name: string; status: 'completed' | 'skipped'; position: number; notes: string | null; sets: { id: string; position: number; reps: number | null; weight_kg: number | null; load_basis: 'per_side' | 'total'; duration_seconds: number | null; notes: { text: string; position: number }[] }[] }[] }

export type Actions = {
  'plans.list': { payload: Record<string, never>; data: Plan[] }
  'plans.save': { payload: { name: string; planId?: string; days: SaveDay[] }; data: { id: string } }
  'plans.archive': { payload: { planId: string }; data: { id: string } }
  'workouts.start': { payload: { planVersionId: string; planDayId: string }; data: { id: string } }
  'workouts.complete': { payload: { sessionId: string; exercises: CompletedExercise[] }; data: { id: string } }
  'workouts.cancel': { payload: { sessionId: string }; data: { id: string } }
  'history.list': { payload: Record<string, never>; data: SessionSummary[] }
  'history.detail': { payload: { sessionId: string }; data: SessionDetail }
}

export class DomainError extends Error {
  constructor(public code: string, message: string) { super(message); this.name = 'DomainError' }
}

export async function domain<A extends keyof Actions>(action: A, payload: Actions[A]['payload']): Promise<Actions[A]['data']> {
  const client = requireSupabase()
  const { data: { session }, error } = await client.auth.getSession()
  if (error || !session?.access_token) throw new DomainError('UNAUTHORIZED', 'Sessione scaduta. Accedi di nuovo.')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL!.replace(/\/$/, '')}/functions/v1/domain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, apikey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
      body: JSON.stringify({ action, payload }), signal: controller.signal,
    })
    let body: unknown
    try { body = await response.json() }
    catch { throw new DomainError(String(response.status), response.status === 401 ? 'Sessione scaduta. Accedi di nuovo.' : 'Risposta del servizio non valida.') }
    if (!body || typeof body !== 'object') throw new DomainError('INVALID_RESPONSE', 'Risposta del servizio non valida.')
    if ('error' in body && body.error && typeof body.error === 'object') {
      const problem = body.error as { code?: unknown; message?: unknown }
      throw new DomainError(typeof problem.code === 'string' ? problem.code : 'API_ERROR', typeof problem.message === 'string' ? problem.message : 'Operazione non riuscita.')
    }
    if (!response.ok) throw new DomainError(String(response.status), 'Operazione non riuscita. Riprova.')
    if (!('data' in body)) throw new DomainError('INVALID_RESPONSE', 'Risposta del servizio non valida.')
    return body.data as Actions[A]['data']
  } catch (cause) {
    if (cause instanceof DomainError) throw cause
    throw new DomainError('NETWORK', 'Connessione non disponibile. Verifica la rete e riprova.')
  } finally { clearTimeout(timer) }
}
