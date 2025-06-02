import { getGridPoint, PointObj } from "@llm-flow/common";
import { Bounds, getCommonBounds } from "./element-bounds";
import { NonDeletedFlotionElement } from "./interface";


export function getDragOffsetXY(
  selectedElements: NonDeletedFlotionElement[],
  x: number,
  y: number
) {
  const [x1, y1] = getCommonBounds(selectedElements)
  return [x - x1, y - y1]
}


export function calculateOffset(
  commonBounds: Bounds,
  dragOffset: PointObj,
  snapOffset: PointObj,
  gridSize: number | null
): PointObj {
  const [x, y] = commonBounds;
  let nextX = x + dragOffset.x + snapOffset.x;
  let nextY = y + dragOffset.y + snapOffset.y;

  if (snapOffset.x === 0 || snapOffset.y === 0) {
    const [nextGridX, nextGridY] = getGridPoint(
      x + dragOffset.x,
      y + dragOffset.y,
      gridSize,
    );

    if (snapOffset.x === 0) {
      nextX = nextGridX;
    }

    if (snapOffset.y === 0) {
      nextY = nextGridY;
    }
  }
  return {
    x: nextX - x,
    y: nextY - y,
  };
}