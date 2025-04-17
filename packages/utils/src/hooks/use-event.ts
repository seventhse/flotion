import { useCallback, useRef } from "react"
import type { Fn } from "../types"

export const useEvent = <T extends Fn>(callback: T) => {
  const fnRef = useRef<T>(null)
  fnRef.current = callback

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return useCallback<T>(((...args: any) => fnRef.current?.(...args)) as any, [])
}
