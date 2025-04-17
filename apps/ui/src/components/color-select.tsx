import type { HTMLAttributes } from 'react'
import { cn } from '~/utils/utils'
import { ColorWrite } from './color-write'

const defaultPresetColors: string[] = [
  'transparent',
  '#ffffff',
  '#f8f9fa',
  '#f5faff',
  '#fffce8',
]

export interface ColorSelectProps {
  value?: string
  presetColors?: string[]
  onChange?: (value: string) => void
}

function ColorBlock({ color, className, active, ...restProps }: HTMLAttributes<HTMLDivElement> & { color: string, active?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center p-[2px] border-1 border-transparent  justify-center rounded-[4px] cursor-pointer',
        'data-[active=\'true\']:border-primary',
      )}
      data-active={active}
      {...restProps}
    >
      <span
        className={cn(
          'inline-block size-8 rounded-[4px] border-border border-[1px]',
          color === 'transparent' && 'bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)]',
        )}
        style={{ background: color === 'transparent' ? 'transparent' : color }}
      >
      </span>
    </div>
  )
}

export function ColorSelect({ value = defaultPresetColors[0], onChange, presetColors = defaultPresetColors }: ColorSelectProps) {
  return (
    <div className="flex gap-x-2 items-center">
      {presetColors.map(color => (
        <ColorBlock
          key={color}
          title={color}
          color={color}
          active={value === color}
          onClick={() => {
            onChange?.(color)
          }}
        />
      ))}
      <div className="inline-block w-[1px] h-8 bg-accent" />
      <ColorWrite value={value} onChange={onChange}>
        <ColorBlock color={value} active={!presetColors.includes(value)} />
      </ColorWrite>
    </div>
  )
}
