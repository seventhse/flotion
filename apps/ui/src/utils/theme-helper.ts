export type ThemeMode = 'light' | 'dark' | 'system'

export const THEME_MODE_KEY = 'APP_THEME'

export function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function updateTheme(mode: ThemeMode) {
  if (mode === 'system') {
    mode = getSystemTheme()
  }
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(mode)
}

export function initTheme() {
  const theme = localStorage.getItem(THEME_MODE_KEY) as ThemeMode
  updateTheme(theme ?? 'system')
}
