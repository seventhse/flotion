import { ElementsMapOrArray, FlotionElement, FlotionElementsMap, isElementInViewport, isNonDeletedElement, NonDeletedFlotionElement, NonDeletedFlotionElementsMap } from "@llm-flow/elements";
import { FlotionAppState } from "./interface";

export function getNonDeletedElements<T extends FlotionElement>(allElements: T[]) {
  const elementsMap: NonDeletedFlotionElementsMap = new Map()
  const elements: NonDeletedFlotionElement[] = []

  for (let element of allElements) {
    if (isNonDeletedElement(element)) {
      elements.push(element as NonDeletedFlotionElement)
      elementsMap.set(element.id, element as NonDeletedFlotionElement)
    }
  }

  return {
    elementsMap, elements
  }
}

export function getSelectedElements(elements: ElementsMapOrArray, selectedElementIds: FlotionAppState['selectedElementIds']) {
  const selectedElements: FlotionElement[] = []

  for (const element of elements.values()) {
    if (selectedElementIds[element.id]) {
      selectedElements.push(element)
      continue
    }
  }

  return selectedElements as NonDeletedFlotionElement[]
}

export function getVisibleAndNonSelectedElements(
  elements: NonDeletedFlotionElement[],
  selectedElements: NonDeletedFlotionElement[],
  state: FlotionAppState,
  elementsMap: FlotionElementsMap
) {
  const selectedElementsSet = new Set(selectedElements.map(element => element.id))

  return elements.filter(element => {
    const isVisible = isElementInViewport(
      element,
      state.width,
      state.height,
      state,
      elementsMap
    )

    return !selectedElementsSet.has(element.id) && isVisible
  })
}