import type { CSSProperties, PropsWithChildren, RefObject } from 'react'
import { useRef } from 'react'
import { useCanvasStyle } from '~/store/canvas.store'
import { CanvasResize } from './canvas-resize'
import { CanvasTools } from './canvas-tools'
import { CanvasWrapperProvide } from './context'
import { cn } from '~/utils/utils'

interface WrapperProps extends PropsWithChildren {
}

interface WrapperInnerProps extends WrapperProps {
  ref?: RefObject<HTMLDivElement | null>
  canvasStyle: CSSProperties
}

function CanvasWrapperInner({ canvasStyle, ref, children }: WrapperInnerProps) {
  return (
    <div
      className="size-full relative overflow-hidden"
    >
      <CanvasTools />
      <div
        ref={ref}
        className="relative cursor-auto"
        style={{
          ...canvasStyle,
          backgroundColor: 'unset',
        }}
      >
        <CanvasResize />
        <div
          className={cn(
            'shadow-[0_0_4px_2px_var(--tw-shadow-color)] shadow-black/5 dark:shadow-accent/40',
            'rounded-md overflow-hidden'
          )}
          style={{
            ...canvasStyle,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function CanvasWrapper({ children }: WrapperProps) {
  const contentWrapperRef = useRef<HTMLDivElement | null>(null)
  const canvasStyle = useCanvasStyle()

  return (
    <CanvasWrapperProvide
      targetEl={contentWrapperRef}
      step={0.1}
      maxScale={10}
      minScale={0.1}
      animate
      canvas
    >
      <CanvasWrapperInner
        ref={contentWrapperRef}
        canvasStyle={canvasStyle}
      >
        {children}
      </CanvasWrapperInner>
    </CanvasWrapperProvide>
  )
}
