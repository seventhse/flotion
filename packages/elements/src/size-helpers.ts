import { getElementBounds } from "./element-bounds";
import { FlotionElement, FlotionElementsMap } from "./interface";
import { viewportCoordsToSceneCoords, ViewportOpts } from "@llm-flow/common";


export function isElementInViewport(
  element: FlotionElement,
  width: number, height: number,
  viewTransformations: ViewportOpts,
  elementsMap: FlotionElementsMap
) {
  const [x1, y1, x2, y2] = getElementBounds(element, elementsMap)

  const topLeftSceneCoords = viewportCoordsToSceneCoords(
    {
      clientX: viewTransformations.offsetLeft,
      clientY: viewTransformations.offsetTop
    },
    viewTransformations
  )

  const bottomRightSceneCoords = viewportCoordsToSceneCoords(
    {
      clientX: viewTransformations.offsetLeft + width,
      clientY: viewTransformations.offsetTop + height
    },
    viewTransformations
  )

  return (
    topLeftSceneCoords.x <= x2 &&
    topLeftSceneCoords.y <= y2 &&
    bottomRightSceneCoords.x >= x1 &&
    bottomRightSceneCoords.x >= y1
  )
}

export function getPerfectElementSize(
  elementType: FlotionElement['type'],
  width: number,
  height: number,
): { width: number; height: number } {
  const absWidth = Math.abs(width);

  if (elementType !== "selection") {
    height = absWidth * Math.sign(height);
  }
  return { width, height };
};