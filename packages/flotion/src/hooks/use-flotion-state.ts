import { useScene } from "../context/scene-context"
import { useCanvasStateUpdate, useCanvasStateValue } from "../context/canvas-state-context"
import { useActionStateUpdate, useActionStateValue } from "../context/action-state-context"
import { useToolStateUpdate, useToolStateValue } from "../context/tool-state-context"
import { PointerEvent, useMemo, useRef, useState } from "react"
import { useLatest, useOnMount } from "@llm-flow/utils"
import { FlotionAppState, SetFlotionState } from "../core"
import { isFunction } from "lodash-es"
import { newElement } from "@llm-flow/elements"


export function useFlotionState() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [wrapperSize, setWrapperSize] = useState({
    width: 0,
    height: 0
  })
  const sceneContext = useScene()
  const canvasStateContext = useCanvasStateValue()
  const actionStateContext = useActionStateValue()
  const toolStateContext = useToolStateValue()

  const lastPointerDownEvent = useRef<PointerEvent<HTMLElement>>(null)

  const updateCanvasState = useCanvasStateUpdate()
  const updateActionState = useActionStateUpdate()
  const updateToolState = useToolStateUpdate()


  const appState = useLatest<FlotionAppState>({
    ...canvasStateContext,
    ...actionStateContext,
    activeTool: toolStateContext,
    scene: sceneContext.scene,
    lastPointerDownEvent: lastPointerDownEvent.current,
    width: wrapperSize.width,
    height: wrapperSize.height,
  })


  const setState: SetFlotionState = (state, type) => {
    state = isFunction(state) ? state(appState.current) : state
    switch (type) {
      case "action":
        updateActionState(pre => {
          return {
            ...pre,
            ...state
          }
        })
        break
      case "canvas":
        updateCanvasState(pre => {
          return {
            ...pre,
            ...state
          }
        })
        break
      case "tool":
        updateToolState(pre => {
          return {
            ...pre,
            ...state
          }
        })
        break
    }
  }

  const renderableElements = useMemo(() => {
    const { elementsMap, visibleElements } = sceneContext.renderer.getRenderableElements({
      ...canvasStateContext,
      width: wrapperSize.width,
      height: wrapperSize.height,
      newElementId: actionStateContext.newElementId,
      sceneNonce: sceneContext.scene.getSceneNonce()
    })
    return {
      elementsMap,
      visibleElements
    }
  }, [wrapperSize, sceneContext, canvasStateContext])

  useOnMount(() => {
    if (wrapperRef.current) {
      const { width, height, top, left } = wrapperRef.current.getBoundingClientRect()
      setWrapperSize(() => ({ width, height }))
      updateCanvasState((pre) => ({
        ...pre,
        offsetTop: top,
        offsetLeft: left,
      }))
    }
    console.log(newElement('rectangle', { width: 200, height: 200, x: 100, y: 100 }))
    sceneContext.scene.insertElement(newElement('rectangle', { width: 200, height: 200, x: 100, y: 100 }))
  })


  return {
    appState,
    setState,
    toolStateContext,
    canvasStateContext,
    actionStateContext,
    renderableElements,
    wrapperRef,
    lastPointerDownEvent,
    setWrapperSize
  }
}