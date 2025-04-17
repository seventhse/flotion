import { useMemo } from 'react'
import { useShallow } from 'zustand/shallow'
import { useCanvasStore } from '~/store/canvas.store'
import type { CanvasWrapperContextValue } from '../context'
import { calculateFitScale } from './canvas-helper'
import { getTargetElement } from '@llm-flow/utils'

export function usePanzoomScale({ panzoom, centered, targetEl }: CanvasWrapperContextValue) {
  const [scale] = useCanvasStore(useShallow(state =>
    [
      state.zoom,
    ]
  ))

  const displayScale = useMemo(() => {
    return `${(scale * 100).toFixed(0)}%`
  }, [scale])

  const disabledZoomIn = useMemo(() => {
    return scale >= (panzoom.current?.getOptions()?.maxScale || 10)
  }, [scale, panzoom])

  const disabledZoomOut = useMemo(() => {
    return scale <= (panzoom.current?.getOptions()?.minScale || 0.1)
  }, [scale, panzoom])

  const onFitScale = () => {
    const targetElm = getTargetElement(targetEl)
    if (!targetElm) {
      return
    }
    const containerRect = targetElm.parentElement?.getBoundingClientRect()
    if (!containerRect) {
      return
    }
    const newScale = calculateFitScale(containerRect, {
      width: targetElm.offsetWidth,
      height: targetElm.offsetHeight
    })
    panzoom.current?.zoom(newScale)

    const handleTransitionEnd = () => {
      centered()
      targetElm.removeEventListener('transitionend', handleTransitionEnd);
    };
    targetElm.addEventListener('transitionend', handleTransitionEnd);
  }

  const onResetZoom = () => {
    panzoom.current?.zoom(1)
    centered()
  }

  const onZoomIn = () => {
    if (disabledZoomIn) {
      return
    }
    panzoom.current?.zoomIn()
    centered()
  }

  const onZoomOut = () => {
    if (disabledZoomOut) {
      return
    }
    panzoom.current?.zoomOut()
    centered()
  }

  return {
    scale,
    displayScale,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    onFitScale,
    disabledZoomIn,
    disabledZoomOut,
  }
}

