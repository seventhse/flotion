import { PointObj, pointRotateRads } from "@llm-flow/common";
import { getElementAbsoluteCoords } from "./element-helpers";
import { FlotionElement, FlotionElementsMap } from "./interface";
import { isDiamondElement, isEllipseElement } from "./type-check";
import { arrayToMap } from "./utils";

export type Bounds = readonly [
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
];

export class ElementBounds {
  private static boundsCache = new WeakMap<FlotionElement, {
    bounds: Bounds
    version: FlotionElement['version']
  }>

  static getBounds(element: FlotionElement, elementsMap: FlotionElementsMap): Bounds {
    const cached = ElementBounds.boundsCache.get(element)

    if (cached?.version && cached.version === element.version) {
      return cached.bounds
    }

    const bounds = ElementBounds.calculateBoundsImpl(element, elementsMap)

    ElementBounds.boundsCache.set(element, {
      version: element.version,
      bounds
    })

    return bounds
  }

  static calculateBoundsImpl(element: FlotionElement, _elementsMap: FlotionElementsMap): Bounds {
    return calculateBoundsImpl(element)
  }
}


function calculateBoundsImpl(element: FlotionElement) {
  let bounds: Bounds
  const [x1, y1, x2, y2, cx, cy] = getElementAbsoluteCoords(element)

  if (isDiamondElement(element)) {
    const [x11, y11] = pointRotateRads([cx, y1], [cx, cy], element.angle)
    const [x12, y12] = pointRotateRads([cx, y2], [cx, cy], element.angle)
    const [x22, y22] = pointRotateRads([x1, cy], [cx, cy], element.angle)
    const [x21, y21] = pointRotateRads([x2, cy], [cx, cy], element.angle)

    const minX = Math.min(x11, x12, x22, x21)
    const minY = Math.min(y11, y12, y22, y21)
    const maxX = Math.max(x11, x12, x22, x21)
    const maxY = Math.max(y11, y12, y22, y21)
    bounds = [minX, minY, maxX, maxY]
  } else if (isEllipseElement(element)) {
    const w = (x2 - x1) / 2;
    const h = (y2 - y1) / 2;
    const cos = Math.cos(element.angle);
    const sin = Math.sin(element.angle);
    const ww = Math.hypot(w * cos, h * sin);
    const hh = Math.hypot(h * cos, w * sin);
    bounds = [cx - ww, cy - hh, cx + ww, cy + hh];
  } else {
    const [x11, y11] = pointRotateRads(
      [x1, y1],
      [cx, cy],
      element.angle,
    );
    const [x12, y12] = pointRotateRads(
      [x1, y2],
      [cx, cy],
      element.angle,
    );
    const [x22, y22] = pointRotateRads(
      [x2, y2],
      [cx, cy],
      element.angle,
    );
    const [x21, y21] = pointRotateRads(
      [x2, y1],
      [cx, cy],
      element.angle,
    );

    const minX = Math.min(x11, x12, x22, x21);
    const minY = Math.min(y11, y12, y22, y21);
    const maxX = Math.max(x11, x12, x22, x21);
    const maxY = Math.max(y11, y12, y22, y21);
    bounds = [minX, minY, maxX, maxY];
  }

  return bounds
}

export const getElementBounds = (
  element: FlotionElement,
  elementsMap: FlotionElementsMap,
): Bounds => {
  return ElementBounds.getBounds(element, elementsMap);
};


export function getCommonBounds(elements: FlotionElement[], elementsMap?: FlotionElementsMap): Bounds {
  if (!elements.length) {
    return [0, 0, 0, 0]
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity


  const _elementsMap = elementsMap || arrayToMap(elements)

  elements.forEach(element => {
    const [x1, y1, x2, y2] = getElementBounds(element, _elementsMap)
    minX = Math.min(minX, x1)
    minY = Math.min(minY, y1)
    maxX = Math.max(maxY, x2)
    maxY = Math.max(maxY, y2)
  })

  return [minX, minY, maxX, maxX]
}

export function getDraggedElementsBounds(elements: FlotionElement[], dragOffset: PointObj) {
  const [minX, minY, maxX, maxY] = getCommonBounds(elements);
  return [
    minX + dragOffset.x,
    minY + dragOffset.y,
    maxX + dragOffset.x,
    maxY + dragOffset.y,
  ];
}