import { DEFAULT_COLLISION_THRESHOLD, getGridPoint, PointObj, viewportCoordsToSceneCoords } from "@llm-flow/common";
import { PointerEvent } from "react";
import { FlotionAppState, SetFlotionState } from "../interface";
import { FlotionElement, getCommonBounds, getElementWithTransformHandleType, getResizeOffsetXY, getTransformHandleTypeFromCoords, NonDeletedFlotionElementsMap } from "@llm-flow/elements";
import { KEYS } from "./keys";
import { isOverScrollBars } from "../render/scrollbars";
import { currentScrollBars } from "./event-local-variable";
import { cloneDeep } from "lodash-es";
import { PointerDownState } from "./interface";
import { getElementAtPosition, getElementsAtPosition } from "./position";
import { clearSelection, isASelectedElement, makeNextSelectedElementIds } from "./pointer-event-helper";

export function initPointerDownState(
  e: PointerEvent<HTMLElement>,
  state: FlotionAppState
): PointerDownState {
  const origin = viewportCoordsToSceneCoords(e, state)
  const selectedElements = state.scene.getSelectedElements({
    selectedIds: state.selectedElementIds
  })
  const [minX, minY, maxX, maxY] = getCommonBounds(selectedElements)

  const gridPoint = getGridPoint(origin.x, origin.y, e[KEYS.CTRL_OR_CMD] ? null : getEffectiveGridSize(state))

  return {
    origin,
    withCmdOrCtrl: e[KEYS.CTRL_OR_CMD],
    originInGrid: {
      x: gridPoint[0],
      y: gridPoint[1]
    },
    scrollbars: isOverScrollBars(currentScrollBars.get(), e.clientX - state.offsetLeft, e.clientY - state.offsetTop),
    lastCoords: { ...origin },
    originalElements: state.scene
      .getNonDeletedElements().reduce((acc, element) => {
        acc.set(element.id, cloneDeep(element))
        return acc
      }, new Map() as NonDeletedFlotionElementsMap),
    resize: {
      handleType: false,
      isResizing: false,
      arrowDirection: 'origin',
      offset: { x: 0, y: 0 },
      center: { x: (maxX + minX) / 2, y: (maxY + minY) / 2 }
    },
    hit: {
      element: null,
      allHitElements: [],
      wasAddedToSelection: false,
      hasBeenDuplicated: false,
      hasHitCommonBoundingBoxOfSelectedElements: isHittingCommonBoundingBoxOfSelectedElements(origin, selectedElements, state.zoom),
    },
    drag: {
      hasOccurred: false,
      offset: null
    },
    eventListeners: {
      onMove: null,
      onUp: null,
      onKeyUp: null,
      onKeyDown: null
    },
    boxSelection: {
      hasOccurred: false
    }
  }
}

export function handleDraggingScrollbar(e: PointerEvent<HTMLElement>, pointerDownState: PointerDownState, state: FlotionAppState) {
  if (!pointerDownState.scrollbars.isOverEither) {
    return false
  }
  // TODO: move scrollbar
}

export function isGridModeEnable(state: FlotionAppState) {
  return !!state.enableGrid
}

export function getEffectiveGridSize(state: FlotionAppState) {
  return isGridModeEnable(state) ? state.gridSize : null
}

export function getElementHitThreshold(zoom: number) {
  return DEFAULT_COLLISION_THRESHOLD / zoom
}

export function isHittingCommonBoundingBoxOfSelectedElements(point: PointObj, selectedElements: FlotionElement[], zoom: number) {
  if (selectedElements.length < 2) {
    return false
  }

  const threshold = getElementHitThreshold(zoom)
  const [x1, y1, x2, y2] = getCommonBounds(selectedElements)

  return (
    point.x > x1 - threshold &&
    point.x < x2 + threshold &&
    point.y > y1 - threshold &&
    point.y < y2 + threshold
  )
}


export function handleSelectionOnPointerDown(
  e: PointerEvent<HTMLElement>,
  pointerDownState: PointerDownState,
  state: FlotionAppState,
  setState: SetFlotionState
) {
  if (state.activeTool.type !== 'selection') {
    return false
  }
  const elements = state.scene.getNonDeletedElements()
  const elementsMap = state.scene.getNonDeletedElementsMap()
  const selectedElements = state.scene.getSelectedElements({
    selectedIds: state.selectedElementIds
  })


  if (selectedElements.length === 1) {
    const elementWithTransformHandleType = getElementWithTransformHandleType(
      elements,
      state.selectedElementIds,
      pointerDownState.origin.x,
      pointerDownState.origin.y,
      state.zoom,
      e.pointerType,
      elementsMap
    )

    if (elementWithTransformHandleType === null) {
      return
    }

    setState({
      resizingElement: elementWithTransformHandleType.element
    }, 'action')
    pointerDownState.resize.handleType = elementWithTransformHandleType.transformHandleType;

  } else if (selectedElements.length > 1) {
    pointerDownState.resize.handleType = getTransformHandleTypeFromCoords(
      getCommonBounds(selectedElements),
      pointerDownState.origin.x,
      pointerDownState.origin.y,
      state.zoom,
      e.pointerType,
    )
  }

  if (pointerDownState.resize.handleType) {
    pointerDownState.resize.isResizing = true
    const offsetXY = getResizeOffsetXY(
      pointerDownState.resize.handleType,
      selectedElements,
      elementsMap,
      pointerDownState.origin.x,
      pointerDownState.origin.y
    )
    pointerDownState.resize.offset = {
      x: offsetXY[0],
      y: offsetXY[1]
    }

  } else {
    pointerDownState.hit.element = pointerDownState.hit.element ??
      getElementAtPosition(pointerDownState.origin.x, pointerDownState.origin.y, state)

    pointerDownState.hit.allHitElements = getElementsAtPosition(
      pointerDownState.origin.x,
      pointerDownState.origin.y,
      state
    )

    const hitElement = pointerDownState.hit.element;
    const someHitElementIsSelected = pointerDownState.hit.allHitElements.some(element => isASelectedElement(element, state.selectedElementIds))

    if (
      (hitElement === null || !someHitElementIsSelected) &&
      e.shiftKey &&
      !pointerDownState.hit.hasHitCommonBoundingBoxOfSelectedElements
    ) {
      clearSelection(hitElement, state, setState)
    }

    if (hitElement !== null) {
      if (e[KEYS.CTRL_OR_CMD]) {
        if (!state.selectedElementIds[hitElement.id]) {
          pointerDownState.hit.wasAddedToSelection = true
        }
        setState(() => {
          return {
            selectedElementIds: {
              [hitElement.id]: true
            },
            prevSelectedElementIds: state.selectedElementIds
          }
        }, 'action')
        return false
      }


      if (!state.selectedElementIds[hitElement.id]) {
        if (!someHitElementIsSelected && !pointerDownState.hit.hasHitCommonBoundingBoxOfSelectedElements) {
          setState(prev => {
            const nextSelectedElementIds: { [id: string]: true } = {
              ...prev.selectedElementIds,
              [hitElement.id]: true
            }

            const previouslySelectedElements: FlotionElement[] = [];

            Object.keys(prev.selectedElementIds).forEach((id) => {
              const element = state.scene.getElement(id);
              element && previouslySelectedElements.push(element);
            });

            const selectedElements = state.scene.getSelectedElements({
              selectedIds: nextSelectedElementIds,
              elements: state.scene.getNonDeletedElements()
            })

            if (selectedElements.length) {
              return {
                selectedElementIds: makeNextSelectedElementIds(nextSelectedElementIds, prev),
                selectedElements: selectedElements
              }
            }

            return {}
          }, 'action')
          pointerDownState.hit.wasAddedToSelection = true
        }
      }
    }

    setState({
      prevSelectedElementIds: state.selectedElementIds
    }, 'action')
  }
  return false
}
