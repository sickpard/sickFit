import { describe, expect, it } from 'vitest'
import { getInitialTheme } from './theme'

describe('preferenza del tema', () => {
  it('rispetta il tema salvato quando è valido', () => {
    expect(getInitialTheme('light', true)).toBe('light')
    expect(getInitialTheme('dark', false)).toBe('dark')
  })

  it('usa la preferenza di sistema se non esiste un valore valido', () => {
    expect(getInitialTheme(null, true)).toBe('dark')
    expect(getInitialTheme('unknown', false)).toBe('light')
  })
})
