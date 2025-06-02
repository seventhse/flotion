import { LineSegment, Point, pointOnLineSegment, pointRotateRads, SIDE_RESIZING_THRESHOLD } from "@llm-flow/common";
import { Bounds } from "./element-bounds";
import { FlotionElementsMap, NonDeletedFlotionElement, PointerType } from "./interface";
import { getTransformHandlesFromCoords, TransformHandleType, TransformHandle, MaybeTransformHandleType, canResizeFromSides, getTransformHandlers } from "./transform-handlers";
import { getElementAbsoluteCoords } from "./element-helpers";

function isInsideTransformHandle(
  transformHandle: TransformHandle,
  x: number,
  y: number,
) {
  return (
    x >= transformHandle[0] &&
    x <= transformHandle[0] + transformHandle[2] &&
    y >= transformHandle[1] &&
    y <= transformHandle[1] + transformHandle[3]
  )
}

function getSelectionBorders([x1, y1]: Point, [x2, y2]: Point, center: Point, angle: number) {
  const topLeft = pointRotateRads([x1, y1], center, angle);
  const topRight = pointRotateRads([x2, y1], center, angle);
  const bottomLeft = pointRotateRads([x1, y2], center, angle);
  const bottomRight = pointRotateRads([x2, y2], center, angle);

  return {
    n: [topLeft, topRight],
    e: [topRight, bottomRight],
    s: [bottomRight, bottomLeft],
    w: [bottomLeft, topLeft],
  };
}

function resizeTest(
  element: NonDeletedFlotionElement,
  elementsMap: FlotionElementsMap,
  selectedElementIds: { [id: string]: true },
  x: number,
  y: number,
  zoom: number,
  pointerType: PointerType
) {
  if (selectedElementIds[element.id]) {
    return false
  }

  const { rotation: rotationTransformHandle, ...transformHandles } = getTransformHandlers(element, zoom, elementsMap, pointerType)

  if (rotationTransformHandle && isInsideTransformHandle(rotationTransformHandle, x, y)) {
    return "rotation" as TransformHandleType
  }

  const filter = Object.keys(transformHandles).filter(key => {
    const transformHandle =
      transformHandles[key as Exclude<TransformHandleType, "rotation">]!;
    if (!transformHandle) {
      return false
    }
    return isInsideTransformHandle(transformHandle, x, y)
  })

  if (filter.length > 0) {
    return filter[0] as TransformHandleType
  }

  if (canResizeFromSides()) {
    const [x1, y1, x2, y2, cx, cy] = getElementAbsoluteCoords(
      element,
    );

    const SPACING = SIDE_RESIZING_THRESHOLD / zoom
    const ZOOMED_SIDE_RESIZING_THRESHOLD =
      SIDE_RESIZING_THRESHOLD / zoom;
    const sides = getSelectionBorders(
      [x1 - SPACING, y1 - SPACING],
      [x2 + SPACING, y2 + SPACING],
      [cx, cy],
      element.angle,
    );



    for (const [dir, side] of Object.entries(sides)) {
      // test to see if x, y are on the line segment
      if (
        pointOnLineSegment(
          [x, y],
          side as LineSegment,
          ZOOMED_SIDE_RESIZING_THRESHOLD,
        )
      ) {
        return dir as TransformHandleType;
      }
    }

  }

  return false
}


export function getElementWithTransformHandleType(
  elements: NonDeletedFlotionElement[],
  selectedElementIds: { [id: string]: true },
  scenePointerX: number,
  scenePointerY: number,
  zoom: number,
  pointerType: PointerType,
  elementsMap: FlotionElementsMap,
) {
  return elements.reduce((result, element) => {
    if (result) {
      return result;
    }
    const transformHandleType = resizeTest(
      element,
      elementsMap,
      selectedElementIds,
      scenePointerX,
      scenePointerY,
      zoom,
      pointerType,
    );
    return transformHandleType ? { element, transformHandleType } : null;
  }, null as { element: NonDeletedFlotionElement; transformHandleType: MaybeTransformHandleType } | null);
};

export function getTransformHandleTypeFromCoords(
  [x1, y1, x2, y2]: Bounds,
  scenePointerX: number,
  scenePointerY: number,
  zoom: number,
  pointerType: PointerType
) {
  const transformHandles = getTransformHandlesFromCoords(
    [x1, y1, x2, y2, (x1 + x2) / 2, (y1 + y2) / 2],
    0,
    zoom,
    pointerType,
  );

  const found = Object.keys(transformHandles).find((key) => {
    const transformHandle =
      transformHandles[key as Exclude<TransformHandleType, "rotation">]!;
    return (
      transformHandle &&
      isInsideTransformHandle(transformHandle, scenePointerX, scenePointerY)
    );
  });

  if (found) {
    return found as MaybeTransformHandleType
  }

  if (!canResizeFromSides()) {
    const cx = (x1 + x2) / 2
    const cy = (y1 + y2) / 2
    const SPACING = SIDE_RESIZING_THRESHOLD / zoom
    const sides = getSelectionBorders([x1 - SPACING, y1 - SPACING], [x2 - SPACING, y2 - SPACING], [cx, cy], 0)

    for (const [dir, side] of Object.entries(sides)) {
      if (pointOnLineSegment([scenePointerX, scenePointerY], side as LineSegment, SPACING)) {
        return dir as TransformHandleType
      }
    }

  }
  return false
}