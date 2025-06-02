import { Point, Polygon } from "./interface";
import { PRECISION } from "./utils"
import { pointOnLineSegment } from "./segment"
import { pointsEqual } from "./point";

export function polygon(...points: Point[]) {
  return polygonClose(points)
}

export function polygonFromPoint(points: Point[]) {
  return polygonClose(points)
}

export function pointOnPolygon(p: Point, poly: Polygon, threshold = PRECISION) {
  let on = false

  for (let i = 0, l = poly.length - 1; i < l; i++) {
    if (pointOnLineSegment(p, [poly[i], poly[i + 1]], threshold)) {
      on = true;
      break;
    }
  }

  return on
}



function polygonClose(polygon: Point[]) {
  return polygonIsClosed(polygon) ? polygon : [...polygon, polygon[0]]
}

function polygonIsClosed(polygon: Point[]) {
  return pointsEqual(polygon[0], polygon[polygon.length - 1])
}