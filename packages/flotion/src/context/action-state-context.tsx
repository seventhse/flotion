import { createUseContextValue } from "@llm-flow/utils";
import { createContext, Dispatch, PropsWithChildren, SetStateAction, use, useMemo, useState } from "react";
import { DEFAULT_ACTION_STATE, FlotionActionState } from "../core";

export const ActionStateContext = createContext<{
  value: FlotionActionState,
  update: Dispatch<SetStateAction<FlotionActionState>>
}>({
  value: DEFAULT_ACTION_STATE,
  update: () => {
    throw new Error("ActionStateContext is no init.")
  }
})


export function ActionStateProvider({ children, ...restProps }: PropsWithChildren<Partial<FlotionActionState>>) {

  const [actionState, setActionState] = useState({
    ...DEFAULT_ACTION_STATE,
    ...restProps
  })

  const state = useMemo(() => {
    return {
      value: actionState,
      update: setActionState
    }
  }, [actionState, setActionState])

  return (
    <ActionStateContext.Provider value={state}>
      {children}
    </ActionStateContext.Provider>
  )
}

export function useActionState() {
  const context = use(ActionStateContext)
  if (!context) {
    throw new Error("useTool must be used within a ActionStateProvider");
  }
  return context
}

export const useActionStateValue = createUseContextValue<FlotionActionState>(() => {
  return useActionState().value
})

export function useActionStateUpdate() {
  const context = useActionState()
  return useMemo(() => context.update, [context.update])
}