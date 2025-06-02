import type { ThemeMode } from '~/utils/theme-helper'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getSystemTheme, THEME_MODE_KEY, updateTheme } from '~/utils/theme-helper'

export interface ThemeState {
  currentTheme: ThemeMode
  systemTheme: 'dark' | 'light'
  switchTheme: (mode?: ThemeMode) => void
  initTheme: () => void
}

const useThemeStore = create<ThemeState>()(
  persist((set, get) => {
    return {
      currentTheme: 'system',
      systemTheme: 'light',
      switchTheme: (mode?: ThemeMode) => {
        mode = mode ?? 'system'
        updateTheme(mode)
        set({ currentTheme: mode, systemTheme: getSystemTheme() })
      },
      initTheme: () => {
        updateTheme(get().currentTheme)
      },
    }
  }, {
    name: THEME_MODE_KEY,
    storage: createJSONStorage(() => localStorage),
  }),
)

export { useThemeStore }
