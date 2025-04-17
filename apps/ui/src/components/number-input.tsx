import { ChevronDown, ChevronUp } from 'lucide-react'
import * as React from 'react'
import { Input } from '~/components/input'
import { cn } from '~/utils/utils'
import { Button } from './button'

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  suffix?: string
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number) => void
}

function NumberInput({ ref, className, suffix, min, max, step = 1, onValueChange, onChange, ...props }: NumberInputProps & { ref?: React.RefObject<HTMLInputElement | null> }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e)
    }

    let value = e.target.value === '' ? Number.NaN : Number.parseFloat(e.target.value)
    if (!Number.isNaN(value) && onValueChange) {
      if (max !== undefined && value > max) {
        value = max
      }
      if (min !== undefined && value < min) {
        value = min
      }
      onValueChange(value)
    }
  }

  const increment = () => {
    const currentValue = Number.parseFloat(props.value as string) || 0
    const newValue = Math.min(max ?? Infinity, currentValue + step)
    onValueChange?.(newValue)
  }

  const decrement = () => {
    const currentValue = Number.parseFloat(props.value as string) || 0
    const newValue = Math.max(min ?? -Infinity, currentValue - step)
    onValueChange?.(newValue)
  }

  return (
    <div className="relative flex items-center">
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        className={cn(
          // 隐藏默认的上下箭头
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          // 如果有后缀或控制按钮，添加右边距
          suffix ? 'pr-8' : 'pr-6',
          className,
        )}
        onChange={handleChange}
        ref={ref}
        {...props}
      />

      <div className="absolute right-3 flex flex-col">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-4 w-4 px-0 hover:bg-accent hover:text-accent-foreground"
          onClick={increment}
          disabled={max !== undefined && Number.parseFloat(props.value as string) >= max}
        >
          <ChevronUp className="h-3 w-3" />
          <span className="sr-only">Increase</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-4 w-4 px-0 hover:bg-accent hover:text-accent-foreground"
          onClick={decrement}
          disabled={min !== undefined && Number.parseFloat(props.value as string) <= min}
        >
          <ChevronDown className="h-3 w-3" />
          <span className="sr-only">Decrease</span>
        </Button>
      </div>

      {suffix && (
        <div className="absolute right-7 inset-y-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
          {suffix}
        </div>
      )}
    </div>
  )
}
NumberInput.displayName = 'NumberInput'

export { NumberInput }
