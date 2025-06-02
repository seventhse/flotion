import { Curve, Point, pointFrom, pointOnLineSegment, Polyline } from "@llm-flow/common"

function cubicBezierEquation(curve: Curve) {
  const [p0, p1, p2, p3] = curve;
  // B(t) = p0 * (1-t)^3 + 3p1 * t * (1-t)^2 + 3p2 * t^2 * (1-t) + p3 * t^3
  return (t: number, idx: number) =>
    Math.pow(1 - t, 3) * p3[idx] +
    3 * t * Math.pow(1 - t, 2) * p2[idx] +
    3 * Math.pow(t, 2) * (1 - t) * p1[idx] +
    p0[idx] * Math.pow(t, 3);
}
function polyLineFromCurve(curve: Curve, segments = 10) {
  const equation = cubicBezierEquation(curve);
  let startingPoint = [equation(0, 0), equation(0, 1)] as Point;
  const lineSegments: Polyline = [];
  let t = 0;
  const increment = 1 / segments;

  for (let i = 0; i < segments; i++) {
    t += increment;
    if (t <= 1) {
      const nextPoint: Point = pointFrom(equation(t, 0), equation(t, 1));
      lineSegments.push([startingPoint, nextPoint]);
      startingPoint = nextPoint;
    }
  }

  return lineSegments;
}

export function pointOnPolyline(point: Point, polyline: Polyline, threshold = 10e-5) {
  return polyline.some(line => pointOnLineSegment(point, line, threshold))
}

export function pointOnCurve(point: Point, curve: Curve, threshold: number) {
  return pointOnPolyline(point, polyLineFromCurve(curve), threshold)
}