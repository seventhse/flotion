import {
  FlotionElement,
  getElementShape,
  getSelectionBoxShape,
  hitElementItself,
  isPointOnShape,
  NonDeletedFlotionElement,
  shouldShowBoundingBox
} from "@llm-flow/elements";
import { FlotionAppState } from "../interface";
import { getElementHitThreshold } from "./pointer-event";
import { pointFrom } from "@llm-flow/common";


export function getElementsAtPosition(
  x: number,
  y: number,
  state: FlotionAppState,
  _includeBoundTextElement: boolean = false,
  _includeLockedElements: boolean = false
) {

  let elements = state.scene.getNonDeletedElements()
  // TODO: include filter
  return elements.filter(el => hitElement(x, y, el, state))
}

export function getElementAtPosition(x: number, y: number, state: FlotionAppState, opts?: {
  preferSelected?: boolean
  includeBoundTextElement?: boolean;
  includeLockedElements?: boolean;
}) {
  const allHitElements = getElementsAtPosition(x, y, state, opts?.includeBoundTextElement, opts?.includeLockedElements)

  if (allHitElements.length > 1) {
    if (opts?.preferSelected) {
      for (let index = allHitElements.length - 1; index > -1; index--) {
        if (state.selectedElementIds[allHitElements[index].id]) {
          return allHitElements[index]
        }
      }
    }

    const elementWithHighestZIndex = allHitElements[allHitElements.length - 1]

    return hitElementItself({
      x,
      y,
      element: elementWithHighestZIndex,
      shape: getElementShape(elementWithHighestZIndex, state.scene.getNonDeletedElementsMap()),
      threshold: getElementHitThreshold(state.zoom) / 2
    }) ? elementWithHighestZIndex : allHitElements[allHitElements.length - 2]
  }

  if (allHitElements.length === 1) {
    return allHitElements[0]
  }

  return null
}


export function hitElement(
  x: number,
  y: number,
  element: FlotionElement,
  state: FlotionAppState,
  considerBoundingBox = true
) {
  if (
    considerBoundingBox &&
    state.selectedElementIds[element.id] &&
    shouldShowBoundingBox([element] as NonDeletedFlotionElement[])
  ) {
    const selectionShape = getSelectionBoxShape(
      element,
      state.scene.getNonDeletedElementsMap(),
      getElementHitThreshold(state.zoom)
    )

    if (isPointOnShape(pointFrom(x, y), selectionShape)) {
      return true
    }
  }

  return hitElementItself({
    x,
    y,
    element,
    shape: getElementShape(element, state.scene.getNonDeletedElementsMap()),
    threshold: getElementHitThreshold(state.zoom),
  })
}