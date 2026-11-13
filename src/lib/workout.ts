export type LoadBasis = 'per_side' | 'total'

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
