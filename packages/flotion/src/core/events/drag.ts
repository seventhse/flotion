import { calculateOffset, FlotionElement, getCommonBounds, getPerfectElementSize, mutateElement, NonDeletedFlotionElement } from "@llm-flow/elements";
import { PointerDownState } from "./interface";
import { distance, getGridPoint, PointObj } from "@llm-flow/common";
import { Scene } from "../scene";
import { ActiveTool, FlotionAppState, SetFlotionState } from "../interface";
import { KEYS } from "./keys";
import { getEffectiveGridSize } from "./pointer-event";
import { maybeCacheReferenceSnapPoints, snapNewElement } from "./snapping";


function updateElementCoords(
  pointerDownState: PointerDownState,
  element: NonDeletedFlotionElement,
  dragOffset: PointObj,
  scene: Scene
) {

  const originalElement = pointerDownState.originalElements.get(element.id) ?? element

  const nextX = originalElement.x + dragOffset.x
  const nextY = originalElement.y + dragOffset.y


  mutateElement(element, {
    x: nextX,
    y: nextY
  }, scene.triggerUpdate)
}

export function dragSelectedElements(
  pointerDownState: PointerDownState,
  selectedElements: NonDeletedFlotionElement[],
  offset: PointObj,
  scene: Scene,
  snapOffset: PointObj,
  gridSize: number | null
) {

  const elementsTpUpdate = new Set<NonDeletedFlotionElement>(selectedElements)

  const origElements: FlotionElement[] = []

  for (const element of elementsTpUpdate) {
    const origElement = pointerDownState.originalElements.get(element.id)

    if (!origElement) {
      return
    }
    origElements.push(origElement)
  }

  const adjustedOffset = calculateOffset(
    getCommonBounds(origElements),
    offset,
    snapOffset,
    gridSize
  )

  elementsTpUpdate.forEach(element => {
    updateElementCoords(pointerDownState, element, adjustedOffset, scene)
  })

}

export function dragNewElement(
  {
    newElement,
    elementType,
    originX,
    originY,
    x,
    y,
    width,
    height,
    shouldMaintainAspectRatio,
    shouldResizeFromCenter,
    zoom,
    widthAspectRatio = null,
    originOffset = null,
    informMutation = true,
  }: {
    newElement: NonDeletedFlotionElement;
    elementType: ActiveTool['type'];
    originX: number;
    originY: number;
    x: number;
    y: number;
    width: number;
    height: number;
    shouldMaintainAspectRatio: boolean;
    shouldResizeFromCenter: boolean;
    zoom: number;
    /** whether to keep given aspect ratio when `isResizeWithSidesSameLength` is
        true */
    widthAspectRatio?: number | null;
    originOffset?: {
      x: number;
      y: number;
    } | null;
    informMutation?: boolean;
  },
  scene: Scene
) {
  if (shouldMaintainAspectRatio && newElement.type !== "selection") {
    if (widthAspectRatio) {
      height = width / widthAspectRatio;
    } else {
      // Depending on where the cursor is at (x, y) relative to where the starting point is
      // (originX, originY), we use ONLY width or height to control size increase.
      // This allows the cursor to always "stick" to one of the sides of the bounding box.
      if (Math.abs(y - originY) > Math.abs(x - originX)) {
        ({ width, height } = getPerfectElementSize(
          elementType as FlotionElement['type'],
          height,
          x < originX ? -width : width,
        ));
      } else {
        ({ width, height } = getPerfectElementSize(
          elementType as FlotionElement['type'],
          width,
          y < originY ? -height : height,
        ));
      }

      if (height < 0) {
        height = -height;
      }
    }
  }

  let newX = x < originX ? originX - width : originX;
  let newY = y < originY ? originY - height : originY;

  if (shouldResizeFromCenter) {
    width += width;
    height += height;
    newX = originX - width / 2;
    newY = originY - height / 2;
  }


  if (width !== 0 && height !== 0) {
    mutateElement(
      newElement,
      {
        x: newX + (originOffset?.x ?? 0),
        y: newY + (originOffset?.y ?? 0),
        width,
        height,
      },
      () => {
        scene.triggerUpdate()
      },
      informMutation,
    );
  }
}


export function maybeDragNewGenericElement(
  pointerDownState: PointerDownState,
  e: MouseEvent | KeyboardEvent,
  state: FlotionAppState,
  setState: SetFlotionState,
  informMutation = true,
) {
  const selectionElement = state.selectionElement
  const pointerCoords = pointerDownState.lastCoords
  if (selectionElement) {
    dragNewElement({
      newElement: selectionElement,
      elementType: state.activeTool.type,
      originX: pointerDownState.origin.x,
      originY: pointerDownState.origin.y,
      x: pointerCoords.x,
      y: pointerCoords.y,
      width: distance(pointerDownState.origin.x, pointerCoords.x),
      height: distance(pointerDownState.origin.y, pointerCoords.y),
      shouldMaintainAspectRatio: e.shiftKey,
      shouldResizeFromCenter: false,
      zoom: state.zoom,
      informMutation,
    }, state.scene)

    return
  }


  const newElement = state.newElement

  if (!newElement) {
    return
  }

  let [gridX, gridY] = getGridPoint(
    pointerCoords.x,
    pointerCoords.y,
    e[KEYS.CTRL_OR_CMD] ? null : getEffectiveGridSize(state)
  )

  maybeCacheReferenceSnapPoints()

  const { snapOffset, snapLines } = snapNewElement(
    newElement,
    state,
    e,
    {
      x:
        pointerDownState.originInGrid.x +
        (state.originSnapOffset?.x ?? 0),
      y:
        pointerDownState.originInGrid.y +
        (state.originSnapOffset?.y ?? 0),
    },
    {
      x: gridX - pointerDownState.originInGrid.x,
      y: gridY - pointerDownState.originInGrid.y,
    },
    state.scene.getNonDeletedElementsMap(),
  )

  gridX += snapOffset.x
  gridY += snapOffset.y

  setState({
    snapLines
  }, 'action')

  dragNewElement({
    newElement,
    elementType: state.activeTool.type,
    originX: pointerDownState.originInGrid.x,
    originY: pointerDownState.originInGrid.y,
    x: gridX,
    y: gridY,
    width: distance(pointerDownState.originInGrid.x, gridX),
    height: distance(pointerDownState.originInGrid.y, gridY),
    shouldMaintainAspectRatio: e.shiftKey,
    shouldResizeFromCenter: e.altKey,
    zoom: state.zoom,
    widthAspectRatio: null,
    originOffset: state.originSnapOffset,
    informMutation,
  }, state.scene)

  setState({
    newElement
  }, 'action')
}