import { describe, expect, it } from 'vitest'
import { appendEmptySet, createEmptySet, isToday, validatePlanImport } from './workout'

describe('importazione delle schede', () => {
  it('valida una scheda JSON e ne restituisce l’anteprima normalizzata', () => {
    expect(validatePlanImport({ name: 'Forza', days: [{ name: 'A', exercises: [{ name: 'Squat', min: 3, max: 5 }] }] })).toEqual({
      ok: true,
      plan: { name: 'Forza', days: [{ name: 'A', exercises: [{ name: 'Squat', min: 3, max: 5, optional: false, notes: '', alternatives: [] }] }] },
    })
  })
  it('rifiuta strutture malformate e intervalli serie impossibili', () => {
    expect(validatePlanImport({ name: '', days: [] }).ok).toBe(false)
    expect(validatePlanImport({ name: 'A', days: [{ name: 'B', exercises: [{ name: 'C', min: 5, max: 2 }] }] }).ok).toBe(false)
  })
})

describe('scorciatoia allenamento di oggi', () => {
  it('riconosce solo la data locale corrente', () => {
    const date = new Date(2025, 0, 2, 14)
    expect(isToday(date.toISOString(), date)).toBe(true)
    expect(isToday(new Date(2025, 0, 1, 23).toISOString(), date)).toBe(false)
  })
})

describe('serie dell’allenamento', () => {
  it('consente di aggiungere serie oltre il target della scheda', () => {
    const plannedSets = 2
    const sets = [createEmptySet(1), createEmptySet(2)]

    const next = appendEmptySet(sets)

    expect(plannedSets).toBe(2)
    expect(next).toHaveLength(3)
    expect(next[2]).toMatchObject({ position: 3, loadBasis: 'per_side' })
  })

  it('crea una serie vuota con carico per lato come default', () => {
    expect(createEmptySet(1)).toEqual({
      position: 1,
      reps: '',
      weightKg: '',
      durationSeconds: '',
      loadBasis: 'per_side',
      notes: [''],
    })
  })
})
