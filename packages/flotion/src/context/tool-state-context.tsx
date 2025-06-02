import { createUseContextValue } from "@llm-flow/utils";
import { createContext, Dispatch, PropsWithChildren, SetStateAction, use, useMemo, useState } from "react";
import { ActiveToolState, DEFAULT_ACTIVE_TOOL_STATE } from "../core";


export const ToolStateContext = createContext<{
  value: ActiveToolState,
  update: Dispatch<SetStateAction<ActiveToolState>>
}>({
  value: DEFAULT_ACTIVE_TOOL_STATE,
  update: () => {
    throw new Error('ToolContext is no init.')
  }
})

export function ToolStateProvider({ children, ...restProps }: PropsWithChildren<Partial<ActiveToolState>>) {

  const [activeToolState, setActiveToolState] = useState<ActiveToolState>({
    ...DEFAULT_ACTIVE_TOOL_STATE,
    ...restProps
  })

  const state = useMemo(() => {
    return {
      value: activeToolState,
      update: setActiveToolState
    }
  }, [activeToolState, setActiveToolState])


  return (
    <ToolStateContext value={state}>
      {children}
    </ToolStateContext>
  )
}


export function useToolState() {
  const context = use(ToolStateContext)
  if (!context) {
    throw new Error("useTool must be used within a ToolProvider");
  }
  return context
}

export const useToolStateValue = createUseContextValue<ActiveToolState>(() => {
  return useToolState().value
})

export function useToolStateUpdate() {
  const context = useToolState()
  return useMemo(() => context.update, [context.update])
}