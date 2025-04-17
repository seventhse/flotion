import { useOnMount } from '@llm-flow/utils'
import { cva } from 'class-variance-authority'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useThemeStore } from '~/store/theme.store'
import { cn } from '~/utils/utils'

const themeButtonVariants = cva('size-4 cursor-pointer transition-all duration-200', {
  variants: {
    active: {
      true: 'opacity-100',
      false: 'opacity-50 hover:opacity-70',
    },
  },
})

const activeIndicatorVariants = cva(
  'absolute size-4 transition-transform duration-200 ease-in-out bg-accent/10',
  {
    variants: {
      position: {
        light: 'translate-x-0',
        system: 'translate-x-6',
        dark: 'translate-x-12',
      },
    },
  },
)

export function ThemeSwitch() {
  const theme = useThemeStore()

  useOnMount(() => {
    theme.initTheme()
    return () => { }
  })

  return (
    <button
      type="button"
      className="flex p-1.5 gap-x-2 border-border border-[1px] rounded-sm relative"
      aria-label="Toggle theme"
    >
      <span title="Light mode" onClick={() => theme.switchTheme('light')}>
        <Sun
          className={cn(themeButtonVariants({ active: theme.currentTheme === 'light' }))}
          aria-label="Light"
        />
      </span>
      <span title="System mode" onClick={() => theme.switchTheme('system')}>
        <Monitor
          className={cn(themeButtonVariants({ active: theme.currentTheme === 'system' }))}
          aria-label="System"
        />
      </span>
      <span title="Dark mode" onClick={() => theme.switchTheme('dark')}>
        <Moon
          className={cn(themeButtonVariants({ active: theme.currentTheme === 'dark' }))}
          aria-label="Dark"
        />
      </span>
      <span
        className={cn(
          activeIndicatorVariants({
            position: theme.currentTheme,
          }),
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
