import { describe, expect, it } from 'vitest'
import { appendEmptySet, createEmptySet } from './workout'

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
      loadBasis: 'per_side',
      notes: [''],
    })
  })
})
