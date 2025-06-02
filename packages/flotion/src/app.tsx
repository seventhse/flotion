import "./app.css"
import { SceneProvider } from "./context/scene-context"
import { CanvasStateProvider } from "./context/canvas-state-context"
import { ActionStateProvider } from "./context/action-state-context"
import { ToolStateProvider } from "./context/tool-state-context"
import { PointerEvent, ReactNode, useEffect } from "react"
import StaticCanvas from "./components/static-canvas"
import InteractiveCanvas from "./components/interactive-canvas"
import NewElementCanvas from "./components/new-element-canvas"
import {
  EVENT,
  POINTER_BUTTON,
  handleDraggingScrollbar,
  handleSelectionOnPointerDown,
  initPointerDownState,
  makeNextSelectedElementIds,
  onPointerMoveForPointerDownHandler,
  onPointerUpFromPointerDownHandler
} from "./core"
import { createGenericElementOnPointerDown } from "./core/events/create-element"
import { useFlotionState } from "./hooks/use-flotion-state"

export interface FlotionProps {
  theme?: 'light' | 'dark',
  UIComponent?: ReactNode
}

function FlotionInner({ UIComponent, theme }: FlotionProps) {
  const {
    appState,
    setState,
    canvasStateContext,
    actionStateContext,
    toolStateContext,
    wrapperRef,
    renderableElements,
    lastPointerDownEvent
  } = useFlotionState()

  const clearSelectionIfNotUsingSelection = () => {
    if (toolStateContext.type !== 'selection') {
      setState(pre => {
        return {
          ...pre,
          selectedElementIds: makeNextSelectedElementIds({}, appState.current),
        }
      }, 'action')
    }
  }

  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const target = e.target as HTMLCanvasElement

    if (target.setPointerCapture) {
      target.setPointerCapture(e.pointerId)
    }

    const selection = document.getSelection()
    if (selection?.anchorNode) {
      selection.removeAllRanges()
    }

    if (actionStateContext.isPanning) {
      return
    }

    lastPointerDownEvent.current = e

    if (
      e.button !== POINTER_BUTTON.MAIN &&
      e.button !== POINTER_BUTTON.TOUCH &&
      e.button !== POINTER_BUTTON.ERASER
    ) {
      return
    }

    const pointerDownState = initPointerDownState(e, appState.current)

    setState(pre => {
      return {
        ...pre,
        selectedElementsAreBeingDragged: false
      }
    }, 'action')

    if (handleDraggingScrollbar(e, pointerDownState, appState.current)) {
      return
    }

    clearSelectionIfNotUsingSelection()

    if (handleSelectionOnPointerDown(e, pointerDownState, appState.current, setState)) {
      return
    }

    const allowOnPointerDown = e.pointerType !== 'touch' || appState.current.activeTool.type === 'selection'

    if (!allowOnPointerDown) {
      return
    }

    if (appState.current.activeTool.type !== 'grab') {
      createGenericElementOnPointerDown(appState.current.activeTool.type, pointerDownState, appState.current, setState)
    }

    const onPointerUp = onPointerUpFromPointerDownHandler(pointerDownState, appState, setState)
    const onPointerMove = onPointerMoveForPointerDownHandler(pointerDownState, appState, setState)

    window.addEventListener(EVENT.POINTER_UP, onPointerUp)
    window.addEventListener(EVENT.POINTER_MOVE, onPointerMove)
    pointerDownState.eventListeners.onMove = onPointerMove
    pointerDownState.eventListeners.onUp = onPointerUp
  }

  const handlePointerUp = () => {
  }

  const handlePointerMove = () => {

  }

  const handlePointerCancel = () => {

  }



  useEffect(() => {
    if (!theme) {
      return
    }
    setState(prev => {
      return {
        ...prev,
        theme: theme
      }
    }, 'canvas')
  }, [theme])


  return (
    <div className="flotion-wrapper">
      <div ref={wrapperRef} className="flotion">
        <div className="flotion-ui-wrapper">
          {UIComponent}
        </div>
        <StaticCanvas
          scale={window.devicePixelRatio}
          width={appState.current.width}
          height={appState.current.height}
          elementsMap={renderableElements.elementsMap}
          visibleElements={renderableElements.visibleElements}
          state={canvasStateContext}
        />
        {
          actionStateContext.newElement && (
            <NewElementCanvas
              width={appState.current.width}
              height={appState.current.height}
              scale={window.devicePixelRatio}
              newElement={actionStateContext.newElement}
              elementsMap={renderableElements.elementsMap}
              state={canvasStateContext}
            />
          )
        }
        <InteractiveCanvas
          scale={window.devicePixelRatio}
          width={appState.current.width}
          height={appState.current.height}
          elementsMap={renderableElements.elementsMap}
          visibleElements={renderableElements.visibleElements}
          selectedElements={appState.current.selectedElements}
          state={{
            ...canvasStateContext,
            ...actionStateContext
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          onPointerCancel={handlePointerCancel}
          callback={() => {

          }}
        />
      </div>
    </div>
  )
}

export function FlotionApp(props: FlotionProps) {
  return (
    <SceneProvider>
      <CanvasStateProvider>
        <ToolStateProvider>
          <ActionStateProvider>
            <FlotionInner {...props} />
          </ActionStateProvider>
        </ToolStateProvider>
      </CanvasStateProvider>
    </SceneProvider>
  )
}
