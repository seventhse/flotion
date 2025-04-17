import type { BasicTarget } from '@llm-flow/utils'
import type { PanzoomObject, PanzoomOptions } from '@panzoom/panzoom'
import {
  getTargetElement,
  throttleRAF,
  useEvent,
  useEventListener,
  useOnMount,
  useUnMount,
  useResizeObserver,
} from '@llm-flow/utils'
import Panzoom from '@panzoom/panzoom'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { useCanvasStore } from '~/store/canvas.store'
import { calculateCenterPosition } from './canvas-helper'


export function usePanzoom<T extends HTMLElement>(
  target: BasicTarget<T>,
  options: PanzoomOptions = {},
) {
  const panzoom = useRef<PanzoomObject | null>(null)
  const [needToCenter, setNeedToCenter] = useState(false);
  const [disabledPan, scale, setScale, pan, setPan] = useCanvasStore(useShallow(
    state => [state.disabledPan, state.zoom, state.updateZoom, state.pan, state.updatePan]
  ))

  const centeredExecute = throttleRAF((animate = true) => {
    const panzoomInstance = panzoom.current;

    const targetEl = getTargetElement(target)
    if (!targetEl || !panzoomInstance) {
      return
    }

    const zoomOptions = {
      force: true, animate, relative: true
    }
    const scale = panzoomInstance.getScale();
    const panPosition = calculateCenterPosition(targetEl, scale)

    if (!panPosition) {
      return
    }

    const currentPan = panzoomInstance.getPan()
    if (currentPan.x === panPosition.x && currentPan.y === panPosition.y) {
      return
    }

    panzoomInstance.pan(panPosition.x, panPosition.y, zoomOptions);
  }, { trailing: false })

  const centered = () => {
    setNeedToCenter(true)
  }

  const watchPanCallback = useEvent(() => {
    const pan = panzoom.current?.getPan()
    const zoom = panzoom.current?.getScale()
    if (pan) {
      setPan(pan)
    }
    if (zoom) {
      setScale(zoom)
    }
  })

  const destroy = () => {
    if (!panzoom.current) {
      return
    }
    panzoom.current.destroy()
    panzoom.current = null
    const el = getTargetElement(target)
    if (el) {
      el.removeEventListener('panzoomchange', watchPanCallback)
    }
  }

  const init = () => {
    const el = getTargetElement(target)
    if (!el) {
      return
    }

    const instance = Panzoom(el, {
      disablePan: disabledPan,
      startScale: scale,
      roundPixels: true,
      ...options
    })
    instance.setStyle('cursor', disabledPan ? 'auto' : 'grab')
    panzoom.current = instance

    el.addEventListener('panzoomchange', watchPanCallback)
    centered()
  }

  const throttleWheel = useEvent(throttleRAF((e) => {
    if (!panzoom.current) {
      return
    }
    const panzoomInstance = panzoom.current
    panzoomInstance.zoomWithWheel(e, {
      localPoint: true
    })
    setScale(panzoomInstance.getScale())
  }))

  useOnMount(init)
  useUnMount(destroy)

  useLayoutEffect(() => {
    if (needToCenter) {
      setNeedToCenter(false)
      centeredExecute()
    }
  }, [needToCenter])

  useEffect(() => {
    if (panzoom.current) {
      panzoom.current.setOptions({
        disablePan: disabledPan,
      })
      panzoom.current.setStyle('cursor', disabledPan ? 'auto' : 'grab')
    }
  }, [disabledPan])

  useEventListener('wheel', throttleWheel, {
    target: getTargetElement(target)?.parentElement,
    passive: false
  })
  useEventListener('resize', centered, {
    target: getTargetElement(target)?.parentElement?.parentElement
  })
  useResizeObserver(centered, {
    target: getTargetElement(target)?.parentElement?.parentElement
  })


  return {
    panzoom,
    centered
  }
}
