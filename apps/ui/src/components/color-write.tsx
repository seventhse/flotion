import type { ChangeEvent, PropsWithChildren } from 'react'
import { useDebounceCallback, useMergedState } from '@llm-flow/utils'
import { validateHex } from '~/utils/color'
import { ColorRead } from './color-read'
import { Input } from './input'
import { Label } from './label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover'

export interface ColorWriteProps extends PropsWithChildren {
  value?: string
  onChange?: (value: string) => void
}

export function ColorWrite({ value, onChange, children }: ColorWriteProps) {
  const [mergedValue, setMergedValue] = useMergedState('transparent', {
    value,
    onChange,
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    if (validateHex(value)) {
      setMergedValue(value)
    }
  }

  const handleColorRead = (color: string) => {
    setMergedValue(color)
  }

  const debounceChange = useDebounceCallback(handleChange, 500)

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[240px]">
        <div className="flex flex-col gap-y-2">
          <Label htmlFor="hex-write">Hex</Label>
          <div className="flex gap-x-2 items-center">
            <Input
              id="hex-write"
              value={mergedValue}
              onInput={(e) => {
                setMergedValue((e.target as HTMLInputElement).value)
              }}
              onChange={debounceChange}
              onBlur={(e) => {
                handleChange(e)
              }}
            />
            <span className="w-[1px] h-8 bg-accent" />
            <ColorRead onRead={handleColorRead} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
