"use client"

import { isFunction } from "lodash-es"
import { useEffect } from "react"
import type { Fn } from "../"
import { useLatest } from "./use-latest"

export function useUnMount(fn: Fn) {
  if (!isFunction(fn)) {
    throw new Error("The argument passed to useUnMount must be a function.")
  }

  const latestFn = useLatest(fn)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    return () => {
      latestFn?.current?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
