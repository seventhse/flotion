import { isFunction } from "lodash-es"
import type { RefObject } from "react"

type TargetValue<T> = T | undefined | null

type TargetType = HTMLElement | Element | Document | Window

export type BasicTarget<T extends TargetType = Element> =
  | (() => TargetValue<T>)
  | TargetValue<T>
  | RefObject<TargetValue<T>>

export function getTargetElement<T extends TargetType>(target: BasicTarget<T>, defaultTarget?: T) {
  if (!target) return defaultTarget

  let targetElement: TargetValue<T>
  if (isFunction(target)) targetElement = target()
  else if ("current" in target) targetElement = target.current
  else targetElement = target

  return targetElement
}
