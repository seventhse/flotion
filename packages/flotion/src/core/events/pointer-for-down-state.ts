import { withBatchedUpdates, withBatchedUpdatesThrottled } from "@llm-flow/utils"
import { PointerDownState } from "./interface"
import { FlotionAppState, SetFlotionState } from "../interface"
import { EVENT } from "./constant"
import { lastPointerCoords } from "./event-local-variable"
import { getDragOffsetXY, newElementWith, NonDeletedFlotionElement, randomInteger } from "@llm-flow/elements"
import { getGridPoint, viewportCoordsToSceneCoords } from "@llm-flow/common"
import { KEYS } from "./keys"
import { getEffectiveGridSize } from "./pointer-event"
import { maybeHandleResize } from "./resize"
import { isASelectedElement } from "./pointer-event-helper"
import { snapDraggedElements } from "./snapping"
import { dragSelectedElements, maybeDragNewGenericElement } from "./drag"
import { duplicateElements } from "./duplicate-element"
import { RefObject } from "react"


export function onPointerUpFromPointerDownHandler(
  pointerDownState: PointerDownState,
  stateRef: RefObject<FlotionAppState>,
  setState: SetFlotionState
) {
  return withBatchedUpdates((e: PointerEvent) => {



    window.removeEventListener(EVENT.POINTER_MOVE, pointerDownState.eventListeners.onMove!)
    window.removeEventListener(EVENT.POINTER_UP, pointerDownState.eventListeners.onUp!)
  })
}

export function onPointerMoveForPointerDownHandler(
  pointerDownState: PointerDownState,
  stateRef: RefObject<FlotionAppState>,
  setState: SetFlotionState
) {
  return withBatchedUpdatesThrottled((e: PointerEvent) => {
    const state = stateRef.current

    const pointerCoords = viewportCoordsToSceneCoords(e, state)

    const _lastPointerMoveCoords = lastPointerCoords.get() ?? pointerDownState.origin
    lastPointerCoords.set(_lastPointerMoveCoords)

    if (pointerDownState.drag.offset === null) {
      const dragOffsetXY = getDragOffsetXY(
        state.scene.getSelectedElements({
          selectedIds: state.selectedElementIds
        }),
        pointerDownState.origin.x,
        pointerDownState.origin.y
      )
      pointerDownState.drag.offset = {
        x: dragOffsetXY[0],
        y: dragOffsetXY[1]
      }
    }


    const target = e?.target
    if (!(target instanceof HTMLElement)) {
      return
    }


    const [gridX, gridY] = getGridPoint(
      pointerCoords.x,
      pointerCoords.y,
      e[KEYS.CTRL_OR_CMD] ? null : getEffectiveGridSize(state)
    )


    if (pointerDownState.resize.isResizing) {
      pointerDownState.lastCoords.x = pointerCoords.x
      pointerDownState.lastCoords.y = pointerCoords.y
      if (maybeHandleResize(pointerDownState, e, state, setState)) {
        return true
      }
    }

    const elementsMap = state.scene.getNonDeletedElementsMap()

    const hasHitASelectedElement = pointerDownState.hit.allHitElements.some(element =>
      isASelectedElement(element, state.selectedElementIds)
    )


    if (hasHitASelectedElement || pointerDownState.hit.hasHitCommonBoundingBoxOfSelectedElements) {
      const selectedElements = state.scene.getSelectedElements({
        selectedIds: state.selectedElementIds
      })
      if (selectedElements.every(element => element.locked)) {
        return
      }

      pointerDownState.drag.hasOccurred = true

      if (selectedElements.length > 0 && !pointerDownState.withCmdOrCtrl) {
        const dragOffset = {
          x: pointerCoords.x - pointerDownState.origin.x,
          y: pointerCoords.y - pointerDownState.origin.y
        }

        const originalElements = [
          ...pointerDownState.originalElements.values()
        ]

        const lockDirection = e.shiftKey

        if (lockDirection) {
          const distanceX = Math.abs(dragOffset.x)
          const distanceY = Math.abs(dragOffset.y)

          const lockX = lockDirection && distanceX < distanceY
          const lockY = lockDirection && distanceX > distanceY

          if (lockX) {
            dragOffset.x = 0
          }

          if (lockY) {
            dragOffset.y = 0
          }
        }

        const { snapOffset, snapLines } = snapDraggedElements(
          originalElements,
          dragOffset,
          state,
          e,
          state.scene.getNonDeletedElementsMap()
        )

        setState({
          snapLines
        }, 'action')

        dragSelectedElements(
          pointerDownState,
          selectedElements,
          dragOffset,
          state.scene,
          snapOffset,
          e[KEYS.CTRL_OR_CMD] ? null : getEffectiveGridSize(state)
        )

        setState({
          selectedElementsAreBeingDragged: true,
          selectionElement: null
        }, 'action')


        if (e.altKey && !pointerDownState.hit.hasBeenDuplicated) {

          pointerDownState.hit.hasBeenDuplicated = true

          const elements = state.scene.getElements()
          const hitElement = pointerDownState.hit.element
          const selectedElements = state.scene.getSelectedElements({
            selectedIds: state.selectedElementIds
          })

          if (
            hitElement
            && pointerDownState.hit.wasAddedToSelection
            && !selectedElements.find(el => el.id === hitElement.id)
          ) {
            selectedElements.push(hitElement)
          }

          const idsOfElementsToDuplicate = new Map(selectedElements.map(el => [el.id, el]))

          const { newElements: clonedElements, elementsWithClones } = duplicateElements({
            type: 'in-place',
            elements,
            randomizeSeed: true,
            idsOfElementsToDuplicate,
            overrides: (el) => {
              const origEl = pointerDownState.originalElements.get(el.id);

              if (origEl) {
                return {
                  x: origEl.x,
                  y: origEl.y,
                  seed: origEl.seed,
                };
              }

              return {};
            },
            reverseOrder: true
          })

          clonedElements.forEach(element => {
            pointerDownState.originalElements.set(element.id, element as NonDeletedFlotionElement)
          })

          const nextSceneElements = elementsWithClones.map(element => {
            if (idsOfElementsToDuplicate.has(element.id)) {
              return newElementWith(element, {
                seed: randomInteger()
              })
            }
            return element
          })

          state.scene.replaceAllElements(nextSceneElements)

          return
        }

        return
      }
    }

    if (state.selectionElement) {
      pointerDownState.lastCoords.x = pointerCoords.x;
      pointerDownState.lastCoords.y = pointerCoords.y
      maybeDragNewGenericElement(pointerDownState, e, state, setState)
    } else {
      const newElement = state.newElement

      if (!newElement) {
        return
      }

      pointerDownState.lastCoords.x = pointerCoords.x
      pointerDownState.lastCoords.y = pointerCoords.y
      maybeDragNewGenericElement(pointerDownState, e, state, setState, false)
    }

    if (state.activeTool.type === 'selection') {
      pointerDownState.boxSelection.hasOccurred = true

      const elements = state.scene.getNonDeletedElements()

      let shouldReuseSelection = true

    }

  })
}
