import type { MouseEvent } from 'react'
import type { Direction } from '~/hooks/use-canvas-resize'
import { cva } from 'class-variance-authority'
import { memo, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { directions, useCanvasResize } from '~/hooks/use-canvas-resize'
import { useCanvasStore } from '~/store/canvas.store'

const resizeCursorVariant = cva('panzoom-exclude fixed inset-0 z-[9999]', {
  variants: {
    direction: {
      top: 'cursor-ns-resize',
      right: 'cursor-ew-resize',
      bottom: 'cursor-ns-resize',
      left: 'cursor-ew-resize',
      topLeft: 'cursor-nwse-resize',
      topRight: 'cursor-nesw-resize',
      bottomLeft: 'cursor-nesw-resize',
      bottomRight: 'cursor-nwse-resize',
    },
  },
})

const resizeVariant = cva('panzoom-exclude absolute z-10', {
  variants: {
    high: {
      normal: 'bg-accent hover:bg-primary',
      border: 'w-[24px] h-[24px] hover:border-primary',
    },
    move: {
      '': '',
      'normal': 'bg-primary',
      'border': 'border-primary',
    },
    direction: {
      top: '-top-[10px] left-[calc(50%-16px)] w-[32px] h-[2px] cursor-ns-resize',
      right: '-right-[10px] top-[calc(50%-16px)] w-[2px] h-[32px] cursor-ew-resize',
      bottom: '-bottom-[10px] left-[calc(50%-16px)] w-[32px] h-[2px] cursor-ns-resize',
      left: '-left-[10px] top-[calc(50%-16px)] w-[2px] h-[32px] cursor-ew-resize',
      topLeft: '-top-[12px] -left-[12px] rounded-tl-full border-l-2 border-t-2  cursor-nwse-resize',
      topRight: '-top-[12px] -right-[12px] rounded-tr-full border-r-2 border-t-2  cursor-nesw-resize',
      bottomLeft: '-bottom-[12px] -left-[12px] rounded-bl-full border-l-2 border-b-2 cursor-nesw-resize',
      bottomRight: '-bottom-[12px] -right-[12px] rounded-br-full border-r-2 border-b-2 cursor-nwse-resize',
    },
  },
})

const ResizeHandle = memo(({
  direction,
  onResizeStart,
  isActive,
}: {
  direction: Direction
  isActive?: boolean
  onResizeStart: (e: React.MouseEvent<HTMLDivElement>, direction: Direction) => void
}) => {
  const isBorder = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(direction)

  return (
    <div
      className={resizeVariant({
        high: isBorder ? 'border' : 'normal',
        direction,
        move: isActive ? (isBorder ? 'border' : 'normal') : '',
      })}
      onMouseDown={e => onResizeStart(e, direction)}
    />
  )
})

export function CanvasResize() {
  const [activeDirection, setActiveDirection] = useState<Direction | null>(null)
  const { width, height, updateSize } = useCanvasStore(useShallow(state => ({
    width: state.width,
    height: state.height,
    updateSize: state.updateSize,
  })))

  const { handleResizeStart } = useCanvasResize({
    minWidth: 100,
    minHeight: 100,
    onResize: (size) => {
      updateSize(size.width, size.height)
    },
    onStop: () => {
      setActiveDirection(null)
    },
  })

  const onMouseDown = (e: MouseEvent<HTMLDivElement>, direction: Direction) => {
    setActiveDirection(direction)
    handleResizeStart(e, direction, width, height)
  }

  return (
    <div className="resize-handler">
      {directions.map(direction => (
        <ResizeHandle
          key={direction}
          direction={direction}
          onResizeStart={e => onMouseDown(e, direction)}
          isActive={activeDirection === direction}
        />
      ))}
      {activeDirection && (
        <div
          className={resizeCursorVariant({ direction: activeDirection })}
        />
      )}
    </div>
  )
}
