import { createContext, Dispatch, PropsWithChildren, SetStateAction, use, useMemo, useState } from "react"
import { DEFAULT_CANVAS_STATE, FlotionCanvasState } from "../core";
import { createUseContextValue } from "@llm-flow/utils";

export const CanvasStateContext = createContext<{
  value: FlotionCanvasState
  update: Dispatch<SetStateAction<FlotionCanvasState>>
}>({
  value: DEFAULT_CANVAS_STATE,
  update: () => {
    throw new Error('CanvasStateContext is no init.')
  }
})


export function CanvasStateProvider({ children, ...restProps }: PropsWithChildren<Partial<FlotionCanvasState>>) {
  const [canvasState, setCanvasState] = useState({
    ...DEFAULT_CANVAS_STATE,
    ...restProps
  })

  const state = useMemo(() => {
    return {
      value: canvasState,
      update: setCanvasState
    }
  }, [canvasState, setCanvasState])

  return (
    <CanvasStateContext.Provider value={state}>
      {children}
    </CanvasStateContext.Provider>
  )
}


export function useCanvasState() {
  const context = use(CanvasStateContext)
  if (!context) {
    throw new Error("useCanvasState must be used within a CanvasStateProvider");
  }
  return context
}

export const useCanvasStateValue = createUseContextValue<FlotionCanvasState>(() => {
  return useCanvasState().value
})

export function useCanvasStateUpdate() {
  const context = useCanvasState()
  return useMemo(() => context.update, [context.update])
}