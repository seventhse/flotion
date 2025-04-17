"use client"

import type { Fn } from ".."
import { useEffectWithTarget } from "./use-effect-with-target"
import { useLatest } from "./use-latest"
import type { BasicTarget } from "./utils"
import { getTargetElement } from "./utils"

export type Target = BasicTarget<HTMLElement | Element | Window | Document>

interface Options<T extends Target = Target> {
  target?: T
  capture?: boolean
  once?: boolean
  passive?: boolean
}

export function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
  options?: Options<HTMLElement>
): void
export function useEventListener<K extends keyof ElementEventMap>(
  eventName: K,
  handler: (ev: ElementEventMap[K]) => void,
  options?: Options<Element>
): void
export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (ev: DocumentEventMap[K]) => void,
  options?: Options<Document>
): void
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (ev: WindowEventMap[K]) => void,
  options?: Options<Window>
): void
export function useEventListener(eventName: string, handler: Fn, options: Options): void
export function useEventListener(eventName: string, handler: Fn, options: Options = {}) {
  const handlerRef = useLatest(handler)

  const eventListener = (event: Event) => {
    return handlerRef.current(event)
  }

  useEffectWithTarget(
    () => {
      const targetElement = getTargetElement(options.target, window)
      if (!targetElement?.addEventListener) return

      targetElement.addEventListener(eventName, eventListener, {
        capture: options.capture,
        once: options.once,
        passive: options.passive
      })

      return () => {
        targetElement.removeEventListener(eventName, eventListener, {
          capture: options.capture
        })
      }
    },
    [eventName, options.capture, options.once, options.passive],
    options.target
  )
}
