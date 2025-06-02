import { isTransparent, pointFrom } from "@llm-flow/common"
import { FlotionElement } from "./interface"
import { isPointOnShape, GeometricShape } from "./utils"

export interface HitTestArgs {
  x: number
  y: number
  element: FlotionElement
  shape: GeometricShape
  threshold?: number
}

export function shouldTestInside(element: FlotionElement) {

  const isDraggableFromInside = !isTransparent(element.backgroundColor)

  return isDraggableFromInside
}

export function hitElementItself({
  x,
  y,
  element,
  shape,
  threshold = 10,
}: HitTestArgs) {
  let hit = shouldTestInside(element)
    ? isPointOnShape(pointFrom(x, y), shape) || isPointOnShape(pointFrom(x, y), shape, threshold)
    : isPointOnShape(pointFrom(x, y), shape, threshold)

  return hit
}

