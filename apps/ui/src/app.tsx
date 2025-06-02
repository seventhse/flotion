import { FlotionApp } from '@llm-flow/flotion'
import { useOnMount } from '@llm-flow/utils'
import { StrictMode } from 'react'
import { useThemeStore } from './store/theme.store'

export function App() {
  const theme = useThemeStore()

  useOnMount(() => {
    theme.initTheme()
  })

  return (
    <StrictMode>
      <FlotionApp
        theme={theme.systemTheme}
      />
    </StrictMode>
  )
}
