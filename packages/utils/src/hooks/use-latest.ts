"use client"
import type { RefObject } from "react"
import { useRef } from "react"

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function useLatest<T = (...args: any) => any>(fn: T): RefObject<T> {
  const fnRef = useRef(fn)

  fnRef.current = fn

  return fnRef
}
