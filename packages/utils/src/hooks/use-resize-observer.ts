import { useRef } from "react";
import { Fn } from "../types";
import { useEffectWithTarget } from "./use-effect-with-target";
import { BasicTarget, getTargetElement } from "./utils";
import { useLatest } from "./use-latest";


export function useResizeObserver<T extends HTMLElement>(
  callback: Fn,
  options: { target: BasicTarget<T> } & ResizeObserverOptions = { target: null }
) {
  const latestFn = useLatest(callback)
  const observer = useRef<ResizeObserver>(null)

  const dispose = () => {
    if (observer.current) {
      observer.current.disconnect()
      observer.current = null
    }
  }

  useEffectWithTarget(() => {
    const { target, ...observerOptions } = options
    if (!target) {
      return
    }
    const el = getTargetElement(target)
    if (!el) {
      return
    }

    const instance = new ResizeObserver(latestFn.current)

    instance.observe(el, observerOptions)

    return () => {
      dispose()
    }
  }, [], [options.target])

  return {
    observer,
    dispose
  }
}
