"use client"

import type { DependencyList, EffectCallback } from "react"
import { useEffect, useRef } from "react"
import type { Arrayable } from "../"
import { safeArray } from "../"
import { useUnMount } from "./use-un-mount"
import type { BasicTarget } from "./utils"
import { getTargetElement } from "./utils"

function depsAreSame(oldDeps: DependencyList, deps: DependencyList) {
  if (oldDeps === deps) return true
  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], deps[i])) return false
  }

  return true
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function useEffectWithTarget(effect: EffectCallback, deps: DependencyList, target: Arrayable<BasicTarget<any>>) {
  const hasInitRef = useRef(false)
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const lastElementRef = useRef<BasicTarget<any>[]>([])
  const lastDepsRef = useRef<DependencyList>([])

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const unLoadRef = useRef<any>(undefined)

  useEffect(() => {
    const els = safeArray<BasicTarget>(target).map((target) => getTargetElement(target))

    if (!hasInitRef.current) {
      hasInitRef.current = true
      lastElementRef.current = els
      lastDepsRef.current = deps
      unLoadRef.current = effect?.()

      return
    }

    if (
      els.length !== lastElementRef.current.length ||
      !depsAreSame(els, lastElementRef.current) ||
      !depsAreSame(deps, lastDepsRef.current)
    ) {
      unLoadRef.current?.()

      lastElementRef.current = els
      lastDepsRef.current = deps
      unLoadRef.current = effect()
    }
  })

  useUnMount(() => {
    unLoadRef.current?.()
    hasInitRef.current = false
  })
}
