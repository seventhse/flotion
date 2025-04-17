'use client'

import type { MouseEvent as ReactMouseEvent } from 'react'
import { throttleRAF, useEvent, useEventListener, useLatest } from '@llm-flow/utils'
import { useCallback, useRef } from 'react'

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export const borderDirection = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const
export type BorderDirection = typeof borderDirection[number]
export const normalDirection = ['top', 'right', 'bottom', 'left'] as const
export type NormalDirection = typeof normalDirection[number]
export const directions = [...borderDirection, ...normalDirection] as const
export type Direction = BorderDirection | NormalDirection

export interface UseCanvasResizeOptions {
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  onResize?: (size: Size) => void
  onStop?: () => void
}

export function useCanvasResize(options: UseCanvasResizeOptions = {}) {
  const {
    minWidth = 200,
    minHeight = 200,
    maxWidth = Infinity,
    maxHeight = Infinity,
    onResize,
    onStop,
  } = options

  const resizeFn = useLatest(onResize)
  const stopFn = useLatest(onStop)

  const isResizing = useRef(false)
  const currentDirection = useRef<Direction | null>(null)
  const startPosition = useRef<Position>({ x: 0, y: 0 })
  const originalSize = useRef<Size>({ width: 0, height: 0 })
  const aspectRatio = useRef<number>(0)

  const handleResizeStart = useCallback((e: ReactMouseEvent<HTMLElement>, direction: Direction, initWidth: number, initHeight: number) => {
    isResizing.current = true
    currentDirection.current = direction
    startPosition.current = { x: e.clientX, y: e.clientY }
    originalSize.current = { width: initWidth, height: initHeight }
    aspectRatio.current = initWidth / initHeight
    e.preventDefault()
  }, [])

  const handleResizing = useEvent(throttleRAF((e: MouseEvent) => {
    if (!isResizing.current || !currentDirection.current)
      return

    const { width, height } = calcNewSize(
      e,
      startPosition.current,
      aspectRatio.current,
      originalSize.current,
      currentDirection.current,
      {
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
      },
    )

    resizeFn.current?.({ width, height })
  }))

  const handleResizeEnd = useEvent(() => {
    if (isResizing.current) {
      stopFn.current?.()
    }
    isResizing.current = false
    currentDirection.current = null
  })

  useEventListener('mousemove', handleResizing)
  useEventListener('mouseup', handleResizeEnd)

  return {
    handleResizeStart,
  }
}

function calcNewSize(
  e: MouseEvent,
  startPosition: Position,
  aspectRatio: number,
  originalSize: Size,
  direction: Direction,
  {
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  }: Required<Pick<UseCanvasResizeOptions, 'minWidth' | 'minHeight' | 'maxWidth' | 'maxHeight'>>,
): Size {
  const deltaX = e.clientX - startPosition.x
  const deltaY = e.clientY - startPosition.y
  let newWidth = originalSize.width
  let newHeight = originalSize.height

  const isCornerResize = borderDirection.includes(direction as BorderDirection)

  if (isCornerResize) {
    // For corner resizing, maintain aspect ratio
    const ratio = aspectRatio

    switch (direction) {
      case 'topLeft':
        newWidth -= deltaX
        newHeight = newWidth / ratio
        break
      case 'topRight':
        newWidth += deltaX
        newHeight = newWidth / ratio
        break
      case 'bottomLeft':
        newWidth -= deltaX
        newHeight = newWidth / ratio
        break
      case 'bottomRight':
        newWidth += deltaX
        newHeight = newWidth / ratio
        break
    }
  }
  else {
    // For edge resizing, allow independent dimension changes
    switch (direction) {
      case 'right':
        newWidth += deltaX
        break
      case 'left':
        newWidth -= deltaX
        break
      case 'bottom':
        newHeight += deltaY
        break
      case 'top':
        newHeight -= deltaY
        break
    }
  }

  // Apply min/max constraints
  newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
  newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))

  if (isCornerResize) {
    const constrainedRatio = newWidth / newHeight
    if (constrainedRatio > aspectRatio) {
      newWidth = newHeight * aspectRatio
    }
    else {
      newHeight = newWidth / aspectRatio
    }
  }

  return {
    width: Number.parseInt(newWidth.toFixed(0)),
    height: Number.parseInt(newHeight.toFixed(0)),
  }
}
