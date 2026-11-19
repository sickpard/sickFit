export type Theme = 'light' | 'dark'

export function getInitialTheme(saved: string | null, prefersDark: boolean): Theme {
  if (saved === 'light' || saved === 'dark') return saved
  return prefersDark ? 'dark' : 'light'
}

export function getSavedTheme(): string | null {
  try {
    return window.localStorage.getItem('sickfit-theme')
  } catch {
    return null
  }
}

export function saveTheme(theme: Theme): void {
  try {
    window.localStorage.setItem('sickfit-theme', theme)
  } catch {
    // La preferenza resta applicata per la sessione anche se lo storage è indisponibile.
  }
}
