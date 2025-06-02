import { Bounds, FlotionElement, FlotionElementsMap, getDraggedElementsBounds, getElementAbsoluteCoords, NonDeletedFlotionElement } from "@llm-flow/elements";
import { KeyboardModifiersObject, KEYS } from "./keys";
import { FlotionAppState } from "../interface";
import { isGridModeEnable } from "./pointer-event";
import { Point, pointFrom, PointObj, pointRotateRads, rangeIntersection, rangesOverlap, Vector } from "@llm-flow/common";
import { getSelectedElements, getVisibleAndNonSelectedElements } from "../scene-helper";

export type PointPair = [Point, Point]

export type PointSnap = {
  type: "point";
  points: PointPair;
  offset: number;
};

export type Gap = {
  //  start side ↓     length
  // ┌───────────┐◄───────────────►
  // │           │-----------------┌───────────┐
  // │  start    │       ↑         │           │
  // │  element  │    overlap      │  end      │
  // │           │       ↓         │  element  │
  // └───────────┘-----------------│           │
  //                               └───────────┘
  //                               ↑ end side
  startBounds: Bounds;
  endBounds: Bounds;
  startSide: [Point, Point];
  endSide: [Point, Point];
  overlap: Point;
  length: number;
};

export type GapSnap = {
  type: "gap";
  direction:
  | "center_horizontal"
  | "center_vertical"
  | "side_left"
  | "side_right"
  | "side_top"
  | "side_bottom";
  gap: Gap;
  offset: number;
}

export type Snap = GapSnap | PointSnap
export type Snaps = Snap[]

export type PointSnapLine = {
  type: "points";
  points: Point[];
};

export type PointerSnapLine = {
  type: "pointer";
  points: PointPair;
  direction: "horizontal" | "vertical";
};

export type GapSnapLine = {
  type: "gap";
  direction: "horizontal" | "vertical";
  points: PointPair;
};

export type SnapLine = PointSnapLine | GapSnapLine | PointerSnapLine;

const SNAP_DISTANCE = 8


function round(x: number) {
  const decimalPlaces = 6;
  return Math.round(x * 10 ** decimalPlaces) / 10 ** decimalPlaces;
};

function dedupePoints(points: Point[]): Point[] {
  const map = new Map<string, Point>();

  for (const point of points) {
    const key = point.join(",");

    if (!map.has(key)) {
      map.set(key, point);
    }
  }

  return Array.from(map.values());
};


function createPointSnapLines(
  nearestSnapsX: Snaps,
  nearestSnapsY: Snaps,
): PointSnapLine[] {
  const snapsX = {} as { [key: string]: Point[] };
  const snapsY = {} as { [key: string]: Point[] };

  if (nearestSnapsX.length > 0) {
    for (const snap of nearestSnapsX) {
      if (snap.type === "point") {
        // key = thisPoint.x
        const key = round(snap.points[0][0]);
        if (!snapsX[key]) {
          snapsX[key] = [];
        }
        snapsX[key].push(
          ...snap.points.map((p) =>
            pointFrom(round(p[0]), round(p[1])),
          ),
        );
      }
    }
  }

  if (nearestSnapsY.length > 0) {
    for (const snap of nearestSnapsY) {
      if (snap.type === "point") {
        // key = thisPoint.y
        const key = round(snap.points[0][1]);
        if (!snapsY[key]) {
          snapsY[key] = [];
        }
        snapsY[key].push(
          ...snap.points.map((p) =>
            pointFrom(round(p[0]), round(p[1])),
          ),
        );
      }
    }
  }

  return Object.entries(snapsX)
    .map(([key, points]) => {
      return {
        type: "points",
        points: dedupePoints(
          points
            .map((p) => {
              return pointFrom(Number(key), p[1]);
            })
            .sort((a, b) => a[1] - b[1]),
        ),
      } as PointSnapLine;
    })
    .concat(
      Object.entries(snapsY).map(([key, points]) => {
        return {
          type: "points",
          points: dedupePoints(
            points
              .map((p) => {
                return pointFrom(p[0], Number(key));
              })
              .sort((a, b) => a[0] - b[0]),
          ),
        } as PointSnapLine;
      }),
    );
};

function dedupeGapSnapLines(gapSnapLines: GapSnapLine[]) {
  const map = new Map<string, GapSnapLine>();

  for (const gapSnapLine of gapSnapLines) {
    const key = gapSnapLine.points
      .flat()
      .map((point) => [round(point)])
      .join(",");

    if (!map.has(key)) {
      map.set(key, gapSnapLine);
    }
  }

  return Array.from(map.values());
};

function createGapSnapLines(
  selectedElements: FlotionElement[],
  dragOffset: PointObj,
  gapSnaps: GapSnap[],
): GapSnapLine[] {
  const [minX, minY, maxX, maxY] = getDraggedElementsBounds(
    selectedElements,
    dragOffset,
  );

  const gapSnapLines: GapSnapLine[] = [];

  for (const gapSnap of gapSnaps) {
    const [startMinX, startMinY, startMaxX, startMaxY] =
      gapSnap.gap.startBounds;
    const [endMinX, endMinY, endMaxX, endMaxY] = gapSnap.gap.endBounds;

    const verticalIntersection = rangeIntersection(
      pointFrom(minY, maxY),
      gapSnap.gap.overlap,
    );

    const horizontalGapIntersection = rangeIntersection(
      pointFrom(minX, maxX),
      gapSnap.gap.overlap,
    );

    switch (gapSnap.direction) {
      case "center_horizontal": {
        if (verticalIntersection) {
          const gapLineY =
            (verticalIntersection[0] + verticalIntersection[1]) / 2;

          gapSnapLines.push(
            {
              type: "gap",
              direction: "horizontal",
              points: [
                pointFrom(gapSnap.gap.startSide[0][0], gapLineY),
                pointFrom(minX, gapLineY),
              ],
            },
            {
              type: "gap",
              direction: "horizontal",
              points: [
                pointFrom(maxX, gapLineY),
                pointFrom(gapSnap.gap.endSide[0][0], gapLineY),
              ],
            },
          );
        }
        break;
      }
      case "center_vertical": {
        if (horizontalGapIntersection) {
          const gapLineX =
            (horizontalGapIntersection[0] + horizontalGapIntersection[1]) / 2;

          gapSnapLines.push(
            {
              type: "gap",
              direction: "vertical",
              points: [
                pointFrom(gapLineX, gapSnap.gap.startSide[0][1]),
                pointFrom(gapLineX, minY),
              ],
            },
            {
              type: "gap",
              direction: "vertical",
              points: [
                pointFrom(gapLineX, maxY),
                pointFrom(gapLineX, gapSnap.gap.endSide[0][1]),
              ],
            },
          );
        }
        break;
      }
      case "side_right": {
        if (verticalIntersection) {
          const gapLineY =
            (verticalIntersection[0] + verticalIntersection[1]) / 2;

          gapSnapLines.push(
            {
              type: "gap",
              direction: "horizontal",
              points: [
                pointFrom(startMaxX, gapLineY),
                pointFrom(endMinX, gapLineY),
              ],
            },
            {
              type: "gap",
              direction: "horizontal",
              points: [pointFrom(endMaxX, gapLineY), pointFrom(minX, gapLineY)],
            },
          );
        }
        break;
      }
      case "side_left": {
        if (verticalIntersection) {
          const gapLineY =
            (verticalIntersection[0] + verticalIntersection[1]) / 2;

          gapSnapLines.push(
            {
              type: "gap",
              direction: "horizontal",
              points: [
                pointFrom(maxX, gapLineY),
                pointFrom(startMinX, gapLineY),
              ],
            },
            {
              type: "gap",
              direction: "horizontal",
              points: [
                pointFrom(startMaxX, gapLineY),
                pointFrom(endMinX, gapLineY),
              ],
            },
          );
        }
        break;
      }
      case "side_top": {
        if (horizontalGapIntersection) {
          const gapLineX =
            (horizontalGapIntersection[0] + horizontalGapIntersection[1]) / 2;

          gapSnapLines.push(
            {
              type: "gap",
              direction: "vertical",
              points: [
                pointFrom(gapLineX, maxY),
                pointFrom(gapLineX, startMinY),
              ],
            },
            {
              type: "gap",
              direction: "vertical",
              points: [
                pointFrom(gapLineX, startMaxY),
                pointFrom(gapLineX, endMinY),
              ],
            },
          );
        }
        break;
      }
      case "side_bottom": {
        if (horizontalGapIntersection) {
          const gapLineX =
            (horizontalGapIntersection[0] + horizontalGapIntersection[1]) / 2;

          gapSnapLines.push(
            {
              type: "gap",
              direction: "vertical",
              points: [
                pointFrom(gapLineX, startMaxY),
                pointFrom(gapLineX, endMinY),
              ],
            },
            {
              type: "gap",
              direction: "vertical",
              points: [pointFrom(gapLineX, endMaxY), pointFrom(gapLineX, minY)],
            },
          );
        }
        break;
      }
    }
  }

  return dedupeGapSnapLines(
    gapSnapLines.map((gapSnapLine) => {
      return {
        ...gapSnapLine,
        points: gapSnapLine.points.map((p) =>
          pointFrom(round(p[0]), round(p[1])),
        ) as PointPair,
      };
    }),
  );
};

export function getSnapDistance(zoom: number) {
  return SNAP_DISTANCE / zoom
}

export class SnapCache {
  private static referenceSnapPoints: Point[] | null = null

  private static visibleGaps: {
    verticalGaps: Gap[]
    horizontalGaps: Gap[]
  } | null = null

  public static setReferenceSnapPoints = (snapPoints: Point[] | null) => {
    SnapCache.referenceSnapPoints = snapPoints
  }

  public static getReferenceSnapPoints = () => {
    return SnapCache.referenceSnapPoints
  }

  public static setVisibleGaps = (
    gaps: {
      verticalGaps: Gap[];
      horizontalGaps: Gap[];
    } | null,
  ) => {
    SnapCache.visibleGaps = gaps;
  };

  public static getVisibleGaps = () => {
    return SnapCache.visibleGaps;
  };

  public static destroy = () => {
    SnapCache.referenceSnapPoints = null;
    SnapCache.visibleGaps = null;
  };
}


export function getElementsCorners(
  elements: FlotionElement[],
  elementsMap: FlotionElementsMap,
  {
    omitCenter,
    boundingBoxCorners,
    dragOffset,
  }: {
    omitCenter?: boolean;
    boundingBoxCorners?: boolean;
    dragOffset?: PointObj;
  } = {
      omitCenter: false,
      boundingBoxCorners: false,
    },
) {
  let result: Point[] = []

  if (elements.length === 1) {
    const element = elements[0]
    let [x1, y1, x2, y2, cx, cy] = getElementAbsoluteCoords(element)
    if (dragOffset) {
      x1 += dragOffset.x;
      x2 += dragOffset.x;
      cx += dragOffset.x;

      y1 += dragOffset.y;
      y2 += dragOffset.y;
      cy += dragOffset.y;
    }

    const halfWidth = (x2 - x1) / 2;
    const halfHeight = (y2 - y1) / 2;

    if ((element.type === 'diamond' || element.type === 'ellipse') && !boundingBoxCorners) {
      const leftMid = pointRotateRads(
        pointFrom(x1, y1 + halfHeight),
        pointFrom(cx, cy),
        element.angle,
      );
      const topMid = pointRotateRads(
        pointFrom(x1 + halfWidth, y1),
        pointFrom(cx, cy),
        element.angle,
      );
      const rightMid = pointRotateRads(
        pointFrom(x2, y1 + halfHeight),
        pointFrom(cx, cy),
        element.angle,
      );
      const bottomMid = pointRotateRads(
        pointFrom(x1 + halfWidth, y2),
        pointFrom(cx, cy),
        element.angle,
      );
      const center = pointFrom(cx, cy);

      result = omitCenter
        ? [leftMid, topMid, rightMid, bottomMid]
        : [leftMid, topMid, rightMid, bottomMid, center];
    } else {
      const topLeft = pointRotateRads(
        pointFrom(x1, y1),
        pointFrom(cx, cy),
        element.angle,
      );
      const topRight = pointRotateRads(
        pointFrom(x2, y1),
        pointFrom(cx, cy),
        element.angle,
      );
      const bottomLeft = pointRotateRads(
        pointFrom(x1, y2),
        pointFrom(cx, cy),
        element.angle,
      );
      const bottomRight = pointRotateRads(
        pointFrom(x2, y2),
        pointFrom(cx, cy),
        element.angle,
      );
      const center = pointFrom(cx, cy);

      result = omitCenter
        ? [topLeft, topRight, bottomLeft, bottomRight]
        : [topLeft, topRight, bottomLeft, bottomRight, center];
    }

  } else if (elements.length > 1) {
    const [minX, minY, maxX, maxY] = getDraggedElementsBounds(
      elements,
      dragOffset ?? { x: 0, y: 0 },
    );
    const width = maxX - minX;
    const height = maxY - minY;

    const topLeft = pointFrom(minX, minY);
    const topRight = pointFrom(maxX, minY);
    const bottomLeft = pointFrom(minX, maxY);
    const bottomRight = pointFrom(maxX, maxY);
    const center = pointFrom(minX + width / 2, minY + height / 2);

    result = omitCenter
      ? [topLeft, topRight, bottomLeft, bottomRight]
      : [topLeft, topRight, bottomLeft, bottomRight, center]
  }

  return result.map(p => pointFrom(round(p[0]), round(p[1])))
}

export function getReferenceElements(
  elements: NonDeletedFlotionElement[],
  selectedElements: NonDeletedFlotionElement[],
  state: FlotionAppState,
  elementsMap: FlotionElementsMap
) {
  return getVisibleAndNonSelectedElements(elements, selectedElements, state, elementsMap)
}

export function getVisibleGaps(
  elements: NonDeletedFlotionElement[],
  selectedElements: NonDeletedFlotionElement[],
  state: FlotionAppState,
  elementsMap: FlotionElementsMap
) {
  const referenceElements = getReferenceElements(elements, selectedElements, state, elementsMap)

  // const referenceBounds = 
}

export function isSnappingEnabled({
  event,
  state,
  selectedElements
}: {
  event: KeyboardModifiersObject,
  state: FlotionAppState,
  selectedElements: NonDeletedFlotionElement[]
}) {
  if (event) {
    return (state.objectsSnapModeEnabled && !event[KEYS.CTRL_OR_CMD])
      || (!state.objectsSnapModeEnabled && event[KEYS.CTRL_OR_CMD] && isGridModeEnable(state))
  }

  return state.objectsSnapModeEnabled
}

export function getPointSnaps(
  selectedElements: NonDeletedFlotionElement[],
  selectionSnapPoints: Point[],
  state: FlotionAppState,
  event: KeyboardModifiersObject,
  nearestSnapsX: Snaps,
  nearestSnapsY: Snaps,
  minOffset: PointObj,
) {
  if (
    !isSnappingEnabled({ state, event, selectedElements }) ||
    (selectedElements.length === 0 && selectionSnapPoints.length === 0)
  ) {
    return []
  }

  const referenceSnapPoints = SnapCache.getReferenceSnapPoints()

  if (referenceSnapPoints) {
    for (const thisSnapPoint of selectionSnapPoints) {
      for (const otherSnapPoint of referenceSnapPoints) {
        const offsetX = otherSnapPoint[0] - thisSnapPoint[0];
        const offsetY = otherSnapPoint[1] - thisSnapPoint[1];

        if (Math.abs(offsetX) <= minOffset.x) {
          if (Math.abs(offsetX) < minOffset.x) {
            nearestSnapsX.length = 0;
          }

          nearestSnapsX.push({
            type: "point",
            points: [thisSnapPoint, otherSnapPoint],
            offset: offsetX,
          });

          minOffset.x = Math.abs(offsetX);
        }

        if (Math.abs(offsetY) <= minOffset.y) {
          if (Math.abs(offsetY) < minOffset.y) {
            nearestSnapsY.length = 0;
          }

          nearestSnapsY.push({
            type: "point",
            points: [thisSnapPoint, otherSnapPoint],
            offset: offsetY,
          });

          minOffset.y = Math.abs(offsetY);
        }
      }
    }
  }
}

export function getGapSnaps(
  selectedElements: NonDeletedFlotionElement[],
  dragOffset: PointObj,
  state: FlotionAppState,
  event: KeyboardModifiersObject,
  nearestSnapsX: Snaps,
  nearestSnapsY: Snaps,
  minOffset: PointObj,
) {
  if (!isSnappingEnabled({ state, event, selectedElements })) {
    return [];
  }

  if (selectedElements.length === 0) {
    return [];
  }

  const visibleGaps = SnapCache.getVisibleGaps();

  if (visibleGaps) {
    const { horizontalGaps, verticalGaps } = visibleGaps;

    const [minX, minY, maxX, maxY] = getDraggedElementsBounds(
      selectedElements,
      dragOffset,
    ).map((bound) => round(bound));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    for (const gap of horizontalGaps) {
      if (!rangesOverlap(pointFrom(minY, maxY), gap.overlap)) {
        continue;
      }

      // center gap
      const gapMidX = gap.startSide[0][0] + gap.length / 2;
      const centerOffset = round(gapMidX - centerX);
      const gapIsLargerThanSelection = gap.length > maxX - minX;

      if (gapIsLargerThanSelection && Math.abs(centerOffset) <= minOffset.x) {
        if (Math.abs(centerOffset) < minOffset.x) {
          nearestSnapsX.length = 0;
        }
        minOffset.x = Math.abs(centerOffset);

        const snap: GapSnap = {
          type: "gap",
          direction: "center_horizontal",
          gap,
          offset: centerOffset,
        };

        nearestSnapsX.push(snap);
        continue;
      }

      // side gap, from the right
      const [, , endMaxX] = gap.endBounds;
      const distanceToEndElementX = minX - endMaxX;
      const sideOffsetRight = round(gap.length - distanceToEndElementX);

      if (Math.abs(sideOffsetRight) <= minOffset.x) {
        if (Math.abs(sideOffsetRight) < minOffset.x) {
          nearestSnapsX.length = 0;
        }
        minOffset.x = Math.abs(sideOffsetRight);

        const snap: GapSnap = {
          type: "gap",
          direction: "side_right",
          gap,
          offset: sideOffsetRight,
        };
        nearestSnapsX.push(snap);
        continue;
      }

      // side gap, from the left
      const [startMinX, , ,] = gap.startBounds;
      const distanceToStartElementX = startMinX - maxX;
      const sideOffsetLeft = round(distanceToStartElementX - gap.length);

      if (Math.abs(sideOffsetLeft) <= minOffset.x) {
        if (Math.abs(sideOffsetLeft) < minOffset.x) {
          nearestSnapsX.length = 0;
        }
        minOffset.x = Math.abs(sideOffsetLeft);

        const snap: GapSnap = {
          type: "gap",
          direction: "side_left",
          gap,
          offset: sideOffsetLeft,
        };
        nearestSnapsX.push(snap);
        continue;
      }
    }
    for (const gap of verticalGaps) {
      if (!rangesOverlap(pointFrom(minX, maxX), gap.overlap)) {
        continue;
      }

      // center gap
      const gapMidY = gap.startSide[0][1] + gap.length / 2;
      const centerOffset = round(gapMidY - centerY);
      const gapIsLargerThanSelection = gap.length > maxY - minY;

      if (gapIsLargerThanSelection && Math.abs(centerOffset) <= minOffset.y) {
        if (Math.abs(centerOffset) < minOffset.y) {
          nearestSnapsY.length = 0;
        }
        minOffset.y = Math.abs(centerOffset);

        const snap: GapSnap = {
          type: "gap",
          direction: "center_vertical",
          gap,
          offset: centerOffset,
        };

        nearestSnapsY.push(snap);
        continue;
      }

      // side gap, from the top
      const [, startMinY, ,] = gap.startBounds;
      const distanceToStartElementY = startMinY - maxY;
      const sideOffsetTop = round(distanceToStartElementY - gap.length);

      if (Math.abs(sideOffsetTop) <= minOffset.y) {
        if (Math.abs(sideOffsetTop) < minOffset.y) {
          nearestSnapsY.length = 0;
        }
        minOffset.y = Math.abs(sideOffsetTop);

        const snap: GapSnap = {
          type: "gap",
          direction: "side_top",
          gap,
          offset: sideOffsetTop,
        };
        nearestSnapsY.push(snap);
        continue;
      }

      // side gap, from the bottom
      const [, , , endMaxY] = gap.endBounds;
      const distanceToEndElementY = round(minY - endMaxY);
      const sideOffsetBottom = gap.length - distanceToEndElementY;

      if (Math.abs(sideOffsetBottom) <= minOffset.y) {
        if (Math.abs(sideOffsetBottom) < minOffset.y) {
          nearestSnapsY.length = 0;
        }
        minOffset.y = Math.abs(sideOffsetBottom);

        const snap: GapSnap = {
          type: "gap",
          direction: "side_bottom",
          gap,
          offset: sideOffsetBottom,
        };
        nearestSnapsY.push(snap);
        continue;
      }
    }
  }
}

export function snapDraggedElements(
  elements: FlotionElement[],
  dragOffset: PointObj,
  state: FlotionAppState,
  event: KeyboardModifiersObject,
  elementsMap: FlotionElementsMap
) {
  const selectedElements = getSelectedElements(elements, state.selectedElementIds)
  if (!isSnappingEnabled({ event, state, selectedElements }) || selectedElements.length === 0) {
    return {
      snapOffset: {
        x: 0,
        y: 0
      },
      snapLines: []
    }
  }

  dragOffset.x = round(dragOffset.x)
  dragOffset.y = round(dragOffset.y)

  const nearestSnapsX: Snaps = []
  const nearestSnapsY: Snaps = []
  const snapDistance = getSnapDistance(state.zoom)
  const minOffset = {
    x: snapDistance,
    y: snapDistance
  }
  const selectionPoints = getElementsCorners(selectedElements, elementsMap, {
    dragOffset
  })

  getPointSnaps(selectedElements, selectionPoints, state, event, nearestSnapsX, nearestSnapsY, minOffset)
  getGapSnaps(selectedElements, dragOffset, state, event, nearestSnapsX, nearestSnapsY, minOffset)

  const snapOffset = {
    x: nearestSnapsX[0]?.offset ?? 0,
    y: nearestSnapsY[0]?.offset ?? 0
  }

  minOffset.x = 0
  minOffset.y = 0
  nearestSnapsX.length = 0
  nearestSnapsY.length = 0
  const newDragOffset = {
    x: round(dragOffset.x + snapOffset.x),
    y: round(dragOffset.y + snapOffset.x)
  }

  getPointSnaps(
    selectedElements,
    getElementsCorners(selectedElements, elementsMap, {
      dragOffset: newDragOffset
    }),
    state,
    event,
    nearestSnapsX,
    nearestSnapsY,
    minOffset
  )

  getGapSnaps(
    selectedElements,
    newDragOffset,
    state,
    event,
    nearestSnapsX,
    nearestSnapsY,
    minOffset
  )

  const pointSnapLines = createPointSnapLines(nearestSnapsX, nearestSnapsY)
  const gapSnapLines = createGapSnapLines(selectedElements, newDragOffset, [...nearestSnapsX, ...nearestSnapsY].filter(snap => snap.type === 'gap'))

  return {
    snapOffset,
    snapLines: [...pointSnapLines, ...gapSnapLines]
  }
}

export const snapNewElement = (
  newElement: NonDeletedFlotionElement,
  state: FlotionAppState,
  event: KeyboardModifiersObject,
  origin: PointObj,
  dragOffset: PointObj,
  elementsMap: FlotionElementsMap,
) => {
  if (!isSnappingEnabled({ event, selectedElements: [newElement], state })) {
    return {
      snapOffset: { x: 0, y: 0 },
      snapLines: [],
    };
  }

  const selectionSnapPoints: Point[] = [
    pointFrom(origin.x + dragOffset.x, origin.y + dragOffset.y),
  ];

  const snapDistance = getSnapDistance(state.zoom);

  const minOffset = {
    x: snapDistance,
    y: snapDistance,
  };

  const nearestSnapsX: Snaps = [];
  const nearestSnapsY: Snaps = [];

  getPointSnaps(
    [newElement],
    selectionSnapPoints,
    state,
    event,
    nearestSnapsX,
    nearestSnapsY,
    minOffset,
  );

  const snapOffset = {
    x: nearestSnapsX[0]?.offset ?? 0,
    y: nearestSnapsY[0]?.offset ?? 0,
  };

  minOffset.x = 0;
  minOffset.y = 0;
  nearestSnapsX.length = 0;
  nearestSnapsY.length = 0;

  const corners = getElementsCorners([newElement], elementsMap, {
    boundingBoxCorners: true,
    omitCenter: true,
  });

  getPointSnaps(
    [newElement],
    corners,
    state,
    event,
    nearestSnapsX,
    nearestSnapsY,
    minOffset,
  );

  const pointSnapLines = createPointSnapLines(nearestSnapsX, nearestSnapsY);

  return {
    snapOffset,
    snapLines: pointSnapLines,
  };
};

export function maybeCacheVisibleGaps(
  event: KeyboardModifiersObject,
  selectedElements: NonDeletedFlotionElement[],
  recomputeAnyways: boolean = false,
  state: FlotionAppState
) {
  if (isSnappingEnabled({ event, state, selectedElements }) && (recomputeAnyways || !SnapCache.getVisibleGaps())) {
    // SnapCache.setVisibleGaps()
  }
}

export function maybeCacheReferenceSnapPoints() {

}