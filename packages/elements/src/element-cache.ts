import { Drawable } from "roughjs/bin/core";
import { FlotionElement } from "./interface";
import { RoughCanvas } from "roughjs/bin/canvas";

type ElementRoughValue = Drawable | Drawable[] | null
let elementRoughCache: WeakMap<FlotionElement, ElementRoughValue> = new WeakMap()

export function getElementRoughCache(element: FlotionElement, createCache: () => ElementRoughValue, shouldRegenerator = false) {
  let cache = elementRoughCache.get(element)

  if (!cache || shouldRegenerator) {
    cache = createCache()
    elementRoughCache.delete(element)
    elementRoughCache.set(element, cache)
  }

  return cache
}

export function removeElementRoughCache(element: FlotionElement) {
  elementRoughCache.delete(element)
}

export function clearElementRoughCache() {
  elementRoughCache = new WeakMap()
}

export interface ElementWithCanvasValue {
  canvas: HTMLCanvasElement
  rc: RoughCanvas
  zoom: number
  scale: number
  angle: number
  padding: number
  element: FlotionElement
  version: number
}

let elementWithCanvasCache: WeakMap<FlotionElement, ElementWithCanvasValue> = new WeakMap()

export function getElementWithCanvasCache(element: FlotionElement) {
  return elementWithCanvasCache.get(element)
}

export function setElementWithCanvasCache(element: FlotionElement, val: ElementWithCanvasValue) {
  elementWithCanvasCache.set(element, val)
}

export function removeElementWithCanvasCache(element: FlotionElement) {
  elementWithCanvasCache.delete(element)
}

export function clearElementWithCanvasCache() {
  elementWithCanvasCache = new WeakMap()
}
