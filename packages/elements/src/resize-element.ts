import { pointRotateRads } from "@llm-flow/common";
import { getCommonBounds } from "./element-bounds";
import { getElementAbsoluteCoords } from "./element-helpers";
import { FlotionElementsMap, NonDeletedFlotionElement } from "./interface";
import { MaybeTransformHandleType } from "./transform-handlers";

export function getResizeOffsetXY(
  transformHandleType: MaybeTransformHandleType,
  selectedElements: NonDeletedFlotionElement[],
  _elementsMap: FlotionElementsMap,
  x: number,
  y: number
): [number, number] {
  const [x1, y1, x2, y2] =
    selectedElements.length === 1
      ? getElementAbsoluteCoords(selectedElements[0])
      : getCommonBounds(selectedElements);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const angle = (
    selectedElements.length === 1 ? selectedElements[0].angle : 0
  );
  [x, y] = pointRotateRads(
    [x, y],
    [cx, cy],
    -angle,
  );
  switch (transformHandleType) {
    case "n":
      return pointRotateRads(
        [x - (x1 + x2) / 2, y - y1],
        [0, 0],
        angle,
      );
    case "s":
      return pointRotateRads(
        [x - (x1 + x2) / 2, y - y2],
        [0, 0],
        angle,
      );
    case "w":
      return pointRotateRads(
        [x - x1, y - (y1 + y2) / 2],
        [0, 0],
        angle,
      );
    case "e":
      return pointRotateRads(
        [x - x2, y - (y1 + y2) / 2],
        [0, 0],
        angle,
      );
    case "nw":
      return pointRotateRads([x - x1, y - y1], [0, 0], angle);
    case "ne":
      return pointRotateRads([x - x2, y - y1], [0, 0], angle);
    case "sw":
      return pointRotateRads([x - x1, y - y2], [0, 0], angle);
    case "se":
      return pointRotateRads([x - x2, y - y2], [0, 0], angle);
    default:
      return [0, 0];
  }
}