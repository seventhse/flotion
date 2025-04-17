import { type DebouncedFunc, debounce, isFunction } from "lodash-es"
import { useEffect, useMemo, useState } from "react"
import type { Fn } from "../types"
import { useLatest } from "./use-latest"

/**
 * useDebounce hook for debouncing a value
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * useDebounceCallback hook for debouncing a function
 * @param callback - The function to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns The debounced function
 */
export function useDebounceCallback<T extends Fn>(callback: T, delay: number): DebouncedFunc<T> {
  const callbackFn = useLatest(callback)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const debouncedCallback = useMemo(() => {
    return debounce((...args: Parameters<T>) => {
      if (!isFunction(callbackFn.current) && process.env.MODE === "development") {
        throw new Error("UseDebounce callback first value must is function.")
      }
      callbackFn.current?.(...args)
    }, delay)
  }, [delay])

  useEffect(() => {
    return () => {
      debouncedCallback.cancel()
    }
  }, [debouncedCallback])

  return debouncedCallback
}
