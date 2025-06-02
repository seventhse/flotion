import {
  Ellipse,
  Point,
  vectorAdd,
  vectorFromPoint,
  vectorScale,
  pointRotateRads,
  pointFromVector,
  pointDistance,
  pointFrom,
  PRECISION,
} from "@llm-flow/common";


function distanceToEllipse(p: Point, ellipse: Ellipse) {
  const { angle, halfWidth, halfHeight, center } = ellipse;
  const a = halfWidth;
  const b = halfHeight;
  const translatedPoint = vectorAdd(
    vectorFromPoint(p),
    vectorScale(vectorFromPoint(center), -1),
  );
  const [rotatedPointX, rotatedPointY] = pointRotateRads(
    pointFromVector(translatedPoint),
    pointFrom(0, 0),
    -angle,
  );

  const px = Math.abs(rotatedPointX);
  const py = Math.abs(rotatedPointY);

  let tx = 0.707;
  let ty = 0.707;

  for (let i = 0; i < 3; i++) {
    const x = a * tx;
    const y = b * ty;

    const ex = ((a * a - b * b) * tx ** 3) / a;
    const ey = ((b * b - a * a) * ty ** 3) / b;

    const rx = x - ex;
    const ry = y - ey;

    const qx = px - ex;
    const qy = py - ey;

    const r = Math.hypot(ry, rx);
    const q = Math.hypot(qy, qx);

    tx = Math.min(1, Math.max(0, ((qx * r) / q + ex) / a));
    ty = Math.min(1, Math.max(0, ((qy * r) / q + ey) / b));
    const t = Math.hypot(ty, tx);
    tx /= t;
    ty /= t;
  }

  const [minX, minY] = [
    a * tx * Math.sign(rotatedPointX),
    b * ty * Math.sign(rotatedPointY),
  ];

  return pointDistance(
    pointFrom(rotatedPointX, rotatedPointY),
    pointFrom(minX, minY),
  );
}


export function pointOnEllipse(point: Point, ellipse: Ellipse, threshold = PRECISION) {
  return distanceToEllipse(point, ellipse) <= threshold
}