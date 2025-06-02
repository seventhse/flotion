import { FlotionElement, FlotionElementsMap } from "../interface";
import { getElementAbsoluteCoords } from "../element-helpers";
import { Curve, Ellipse, LineSegment, Polygon, Polyline, pointFrom, pointRotateRads, polygon } from "@llm-flow/common"

export type GeometricShape =
  | {
    type: "polygon",
    data: Polygon
  }
  | {
    type: 'polyline',
    data: Polyline
  }
  | {
    type: 'line',
    data: LineSegment
  }
  | {
    type: 'ellipse',
    data: Ellipse
  }
  | {
    type: 'curve',
    data: Curve
  };

export function getSelectionBoxShape(
  element: FlotionElement,
  _elementsMap: FlotionElementsMap,
  padding = 10
) {
  let [x1, y1, x2, y2, cx, cy] = getElementAbsoluteCoords(element)

  x1 -= padding;
  x2 += padding;
  y1 -= padding;
  y2 += padding;

  //const angleInDegrees = angleToDegrees(element.angle);
  const center = pointFrom(cx, cy);
  const topLeft = pointRotateRads(pointFrom(x1, y1), center, element.angle);
  const topRight = pointRotateRads(pointFrom(x2, y1), center, element.angle);
  const bottomLeft = pointRotateRads(pointFrom(x1, y2), center, element.angle);
  const bottomRight = pointRotateRads(pointFrom(x2, y2), center, element.angle);

  return {
    type: "polygon",
    data: [topLeft, topRight, bottomRight, bottomLeft],
  } as GeometricShape
}


export function getPolygonShape(element: FlotionElement): GeometricShape {
  const { angle, width, height, x, y } = element

  const cx = x + width / 2
  const cy = y + height / 2

  const center = pointFrom(cx, cy)

  let data: Polygon

  if (element.type === "diamond") {
    data = polygon(
      pointRotateRads(pointFrom(cx, y), center, angle),
      pointRotateRads(pointFrom(x + width, cy), center, angle),
      pointRotateRads(pointFrom(cx, y + height), center, angle),
      pointRotateRads(pointFrom(x, cy), center, angle),
    );
  } else {
    data = polygon(
      pointRotateRads(pointFrom(x, y), center, angle),
      pointRotateRads(pointFrom(x + width, y), center, angle),
      pointRotateRads(pointFrom(x + width, y + height), center, angle),
      pointRotateRads(pointFrom(x, y + height), center, angle),
    );
  }

  return {
    type: "polygon",
    data
  }
}