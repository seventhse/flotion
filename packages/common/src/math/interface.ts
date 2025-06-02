
export type Point = [number, number]
export type Vector = [number, number]
export type PointObj = { x: number, y: number }


export type LineSegment = [a: Point, b: Point]
export type Polygon = Point[]
export type Polyline = LineSegment[]
export type Curve = [Point, Point, Point, Point]

export type PolarCoords = [
  radius: number,
  angle: number
]

export type Ellipse = {
  center: Point
  angle: number
  halfWidth: number
  halfHeight: number
}