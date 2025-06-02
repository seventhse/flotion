import { DEFAULT_TRANSFORM_HANDLE_SPACING, pointRotateRads } from "@llm-flow/common";
import { Bounds } from "./element-bounds";
import { FlotionElement, FlotionElementsMap, NonDeletedFlotionElement, PointerType } from "./interface";
import { getElementAbsoluteCoords } from "./element-helpers";

export type TransformHandleDirection = "n" | "s" | "w" | "e" | "nw" | "ne" | "sw" | "se"

export type TransformHandleType = TransformHandleDirection | 'rotation'
export type TransformHandle = Bounds
export type TransformHandles = Partial<{ [T in TransformHandleType]: TransformHandle }>
export type MaybeTransformHandleType = TransformHandleType | false

const transformHandleSizes: { [k in PointerType]: number } = {
  mouse: 8,
  pen: 16,
  touch: 28,
};

const ROTATION_RESIZE_HANDLE_GAP = 16;

export const DEFAULT_OMIT_SIDES = {
  e: true,
  s: true,
  n: true,
  w: true,
};

export const OMIT_SIDES_FOR_MULTIPLE_ELEMENTS = {
  e: true,
  s: true,
  n: true,
  w: true,
};


function generateTransformHandle(
  x: number,
  y: number,
  width: number,
  height: number,
  cx: number,
  cy: number,
  angle: number,
): TransformHandle {
  const [xx, yy] = pointRotateRads(
    [x + width / 2, y + height / 2],
    [cx, cy],
    angle,
  );
  return [xx - width / 2, yy - height / 2, width, height];
};


export function canResizeFromSides() {
  // if (device.viewport.isMobile) {
  //   return false;
  // }

  // if (device.isTouchScreen && (isAndroid || isIOS)) {
  //   return false;
  // }
  return true;
};

export function getTransformHandlesFromCoords(
  [x1, y1, x2, y2, cx, cy]: number[],
  angle: number,
  zoom: number,
  pointerType: PointerType,
  omitSides: { [T in TransformHandleType]?: boolean } = {},
  margin = 4,
  spacing = DEFAULT_TRANSFORM_HANDLE_SPACING,
): TransformHandles {
  const size = transformHandleSizes[pointerType]
  const handleWidth = size / zoom
  const handleHeight = size / zoom
  const handleMarginX = size / zoom
  const handleMarginY = size / zoom

  const width = x2 - x1
  const height = y2 - y1
  const dashedLineMargin = margin / zoom
  const centeringOffset = (size - spacing * 2) / (2 * zoom)

  const transformHandles: TransformHandles = {
    nw: omitSides.nw
      ? undefined
      : generateTransformHandle(
        x1 - dashedLineMargin - handleMarginX + centeringOffset,
        y1 - dashedLineMargin - handleMarginY + centeringOffset,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      ),
    ne: omitSides.ne
      ? undefined
      : generateTransformHandle(
        x2 + dashedLineMargin - centeringOffset,
        y1 - dashedLineMargin - handleMarginY + centeringOffset,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      ),
    sw: omitSides.sw
      ? undefined
      : generateTransformHandle(
        x1 - dashedLineMargin - handleMarginX + centeringOffset,
        y2 + dashedLineMargin - centeringOffset,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      ),
    se: omitSides.se
      ? undefined
      : generateTransformHandle(
        x2 + dashedLineMargin - centeringOffset,
        y2 + dashedLineMargin - centeringOffset,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      ),
    rotation: omitSides.rotation
      ? undefined
      : generateTransformHandle(
        x1 + width / 2 - handleWidth / 2,
        y1 -
        dashedLineMargin -
        handleMarginY +
        centeringOffset -
        ROTATION_RESIZE_HANDLE_GAP / zoom,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      ),
  };

  const minimumSizeForEightHandles =
    (5 * transformHandleSizes.mouse) / zoom;

  if (Math.abs(width) > minimumSizeForEightHandles) {
    if (!omitSides.n) {
      transformHandles.n = generateTransformHandle(
        x1 + width / 2 - handleWidth / 2,
        y1 - dashedLineMargin - handleMarginY + centeringOffset,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      );
    }
    if (!omitSides.s) {
      transformHandles.s = generateTransformHandle(
        x1 + width / 2 - handleWidth / 2,
        y2 + dashedLineMargin - centeringOffset,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      );
    }
  }

  if (Math.abs(height) > minimumSizeForEightHandles) {
    if (!omitSides.w) {
      transformHandles.w = generateTransformHandle(
        x1 - dashedLineMargin - handleMarginX + centeringOffset,
        y1 + height / 2 - handleHeight / 2,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      );
    }
    if (!omitSides.e) {
      transformHandles.e = generateTransformHandle(
        x2 + dashedLineMargin - centeringOffset,
        y1 + height / 2 - handleHeight / 2,
        handleWidth,
        handleHeight,
        cx,
        cy,
        angle,
      );
    }
  }

  return transformHandles;
}

export function getTransformHandlers(
  element: FlotionElement,
  zoom: number,
  _elementsMap: FlotionElementsMap,
  pointerType: PointerType = 'mouse',
  omitSides: { [T in TransformHandleType]?: boolean } = DEFAULT_OMIT_SIDES
): TransformHandles {
  if (element.locked) {
    return {}
  }

  const margin = DEFAULT_TRANSFORM_HANDLE_SPACING

  return getTransformHandlesFromCoords(
    getElementAbsoluteCoords(element),
    element.angle,
    zoom,
    pointerType,
    omitSides,
    margin,
  )
}

export function shouldShowBoundingBox(elements: NonDeletedFlotionElement[]) {

  if (elements.length > 1) {
    return true
  }

  if (elements.length === 1) {
    return true
  }

  return true
}