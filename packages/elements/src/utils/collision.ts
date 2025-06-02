import { Point, pointOnLineSegment, pointOnPolygon } from "@llm-flow/common"
import { GeometricShape } from "./shape"
import { pointOnEllipse } from "./ellipse"
import { pointOnCurve, pointOnPolyline } from "./collision-helper"



export function isPointOnShape(point: Point, shape: GeometricShape, tolerance = 0) {
  switch (shape.type) {
    case "polygon":
      return pointOnPolygon(point, shape.data, tolerance)
    case "ellipse":
      return pointOnEllipse(point, shape.data, tolerance)
    case "polyline":
      return pointOnPolyline(point, shape.data, tolerance)
    case "curve":
      return pointOnCurve(point, shape.data, tolerance)
    case "line":
      return pointOnLineSegment(point, shape.data, tolerance)
    default:
      throw new Error(`shape ${shape} is not implemented`)
  }
}






