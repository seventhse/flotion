import { Point, Vector } from "./interface"
import { PRECISION } from "./utils";

/**
 * Create a properly typed Point instance from the X and Y coordinates.
 *
 * @param x The X coordinate
 * @param y The Y coordinate
 * @returns The branded and created point
 */
export function pointFrom(
  x: number,
  y: number,
): Point {
  return [x, y] as Point;
}


/**
 * Calculate the distance between two points.
 *
 * @param a First point
 * @param b Second point
 * @returns The euclidean distance between the two points.
 */
export function pointDistance(
  a: Point,
  b: Point,
): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

/**
 * Compare two points coordinate-by-coordinate and if
 * they are closer than INVERSE_PRECISION it returns TRUE.
 *
 * @param a Point The first point to compare
 * @param b Point The second point to compare
 * @returns TRUE if the points are sufficiently close to each other
 */
export function pointsEqual(
  a: Point,
  b: Point,
): boolean {
  const abs = Math.abs;
  return abs(a[0] - b[0]) < PRECISION && abs(a[1] - b[1]) < PRECISION;
}

/**
 * Rotate a point by [angle] radians.
 *
 * @param point The point to rotate
 * @param center The point to rotate around, the center point
 * @param angle The radians to rotate the point by
 * @returns The rotated point
 */
export function pointRotateRads<P extends Point>(
  [x, y]: P,
  [cx, cy]: P,
  angle: number,
): Point {
  return [
    (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle) + cx,
    (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle) + cy,
  ];
}

export function getGridPoint(x: number, y: number, gridSize: number | null) {
  if (gridSize) {
    return [Math.round(x / gridSize) * gridSize, Math.round(x / gridSize) * gridSize]
  }
  return [x, y]
}

/**
 * Convert a vector to a point.
 *
 * @param v The vector to convert
 * @returns The point the vector points at with origin 0,0
 */
export function pointFromVector(
  v: Vector,
  offset: Point = [0, 0],
): Point {
  return [offset[0] + v[0], offset[1] + v[1]]
}