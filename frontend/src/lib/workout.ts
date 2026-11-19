export type LoadBasis = 'per_side' | 'total'

export type ImportedPlan = { name: string; days: { name: string; exercises: { name: string; min: number; max: number; optional: boolean; notes: string; alternatives: string[] }[] }[] }

export function validatePlanImport(value: unknown): { ok: true; plan: ImportedPlan } | { ok: false; error: string } {
  const fail = () => ({ ok: false as const, error: 'Formato scheda non valido.' })
  if (!value || typeof value !== 'object') return fail()
  const input = value as Record<string, unknown>
  if (typeof input.name !== 'string' || !input.name.trim() || !Array.isArray(input.days) || !input.days.length) return fail()
  const days: ImportedPlan['days'] = []
  for (const rawDay of input.days) {
    if (!rawDay || typeof rawDay !== 'object') return fail()
    const day = rawDay as Record<string, unknown>
    if (typeof day.name !== 'string' || !day.name.trim() || !Array.isArray(day.exercises) || !day.exercises.length) return fail()
    const exercises: ImportedPlan['days'][number]['exercises'] = []
    for (const rawExercise of day.exercises) {
      if (!rawExercise || typeof rawExercise !== 'object') return fail()
      const exercise = rawExercise as Record<string, unknown>
      const min = exercise.min ?? exercise.target_sets_min ?? 2
      const max = exercise.max ?? exercise.target_sets_max ?? min
      if (typeof exercise.name !== 'string' || !exercise.name.trim() || !Number.isInteger(min) || !Number.isInteger(max) || (min as number) < 0 || (max as number) < (min as number) || (max as number) > 30) return fail()
      exercises.push({ name: exercise.name.trim(), min: min as number, max: max as number, optional: exercise.optional === true || exercise.is_optional === true, notes: String(exercise.notes ?? exercise.prescription_notes ?? ''), alternatives: Array.isArray(exercise.alternatives) ? exercise.alternatives.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean) : [] })
    }
    days.push({ name: day.name.trim(), exercises })
  }
  return { ok: true, plan: { name: input.name.trim(), days } }
}

export function isToday(timestamp: string, now = new Date()): boolean {
  const date = new Date(timestamp)
  return !Number.isNaN(date.getTime()) && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
}

export interface EditableSet {
  position: number
  reps: string
  weightKg: string
  loadBasis: LoadBasis
  notes: string[]
}

export function createEmptySet(position: number): EditableSet {
  return {
    position,
    reps: '',
    weightKg: '',
    loadBasis: 'per_side',
    notes: [''],
  }
}

export function appendEmptySet(sets: readonly EditableSet[]): EditableSet[] {
  return [...sets, createEmptySet(sets.length + 1)]
}

export function normalizeUsername(value: string): string {
  return value.trim().toLocaleLowerCase('en-US')
}
