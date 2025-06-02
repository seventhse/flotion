import { Point, pointFrom } from "@llm-flow/common";
import { PointSnapLine } from "../events/snapping";
import { RenderInteractiveSceneState } from "./interface";


const SNAP_COLOR_LIGHT = "#ff6b6b";
const SNAP_COLOR_DARK = "#ff0000";
const SNAP_WIDTH = 1;
const SNAP_CROSS_SIZE = 2;

function drawLine(
  from: Point,
  to: Point,
  context: CanvasRenderingContext2D,
) {
  context.beginPath();
  context.lineTo(from[0], from[1]);
  context.lineTo(to[0], to[1]);
  context.stroke();
};

function drawCross(
  [x, y]: Point,
  appState: RenderInteractiveSceneState,
  context: CanvasRenderingContext2D,
) {
  context.save();
  const size = SNAP_CROSS_SIZE / appState.zoom;
  context.beginPath();

  context.moveTo(x - size, y - size);
  context.lineTo(x + size, y + size);

  context.moveTo(x + size, y - size);
  context.lineTo(x - size, y + size);

  context.stroke();
  context.restore();
};

export function drawPointsSnapLine(
  pointSnapLine: PointSnapLine,
  context: CanvasRenderingContext2D,
  state: RenderInteractiveSceneState
) {
  const firstPoint = pointSnapLine.points[0];
  const lastPoint = pointSnapLine.points[pointSnapLine.points.length - 1];

  drawLine(firstPoint, lastPoint, context);

  for (const point of pointSnapLine.points) {
    drawCross(point, state, context);
  }

}

function drawGapLine(
  from: Point,
  to: Point,
  direction: "horizontal" | "vertical",
  appState: RenderInteractiveSceneState,
  context: CanvasRenderingContext2D,
) {
  // a horizontal gap snap line
  // |–––––––||–––––––|
  // ^    ^   ^       ^
  // \    \   \       \
  // (1)  (2) (3)     (4)

  const FULL = 8 / appState.zoom;
  const HALF = FULL / 2;
  const QUARTER = FULL / 4;

  if (direction === "horizontal") {
    const halfPoint = [(from[0] + to[0]) / 2, from[1]];
    // (1)
    drawLine(
      pointFrom(from[0], from[1] - FULL),
      pointFrom(from[0], from[1] + FULL),
      context,
    );

    // (3)
    drawLine(
      pointFrom(halfPoint[0] - QUARTER, halfPoint[1] - HALF),
      pointFrom(halfPoint[0] - QUARTER, halfPoint[1] + HALF),
      context,
    );
    drawLine(
      pointFrom(halfPoint[0] + QUARTER, halfPoint[1] - HALF),
      pointFrom(halfPoint[0] + QUARTER, halfPoint[1] + HALF),
      context,
    );

    // (4)
    drawLine(
      pointFrom(to[0], to[1] - FULL),
      pointFrom(to[0], to[1] + FULL),
      context,
    );

    // (2)
    drawLine(from, to, context);
  } else {
    const halfPoint = [from[0], (from[1] + to[1]) / 2];
    // (1)
    drawLine(
      pointFrom(from[0] - FULL, from[1]),
      pointFrom(from[0] + FULL, from[1]),
      context,
    );

    // (3)
    drawLine(
      pointFrom(halfPoint[0] - HALF, halfPoint[1] - QUARTER),
      pointFrom(halfPoint[0] + HALF, halfPoint[1] - QUARTER),
      context,
    );
    drawLine(
      pointFrom(halfPoint[0] - HALF, halfPoint[1] + QUARTER),
      pointFrom(halfPoint[0] + HALF, halfPoint[1] + QUARTER),
      context,
    );

    // (4)
    drawLine(
      pointFrom(to[0] - FULL, to[1]),
      pointFrom(to[0] + FULL, to[1]),
      context,
    );

    // (2)
    drawLine(from, to, context);
  }
};

function drawPointerSnapLine(
  pointerSnapLine: PointSnapLine,
  context: CanvasRenderingContext2D,
  appState: RenderInteractiveSceneState,
) {
  drawCross(pointerSnapLine.points[0], appState, context);
  drawLine(pointerSnapLine.points[0], pointerSnapLine.points[1], context);
};

export function renderSnaps(
  context: CanvasRenderingContext2D,
  state: RenderInteractiveSceneState
) {
  if (!state.snapLines.length) {
    return
  }


  const snapColor = state.theme === 'light' ? SNAP_COLOR_LIGHT : SNAP_COLOR_DARK;
  // in zen mode make the cross more visible since we don't draw the lines
  const snapWidth = (SNAP_WIDTH) / state.zoom;

  context.save();
  context.translate(state.scrollX, state.scrollY);

  for (const snapLine of state.snapLines) {
    if (snapLine.type === "pointer") {
      context.lineWidth = snapWidth;
      context.strokeStyle = snapColor;

      drawPointerSnapLine(snapLine as unknown as PointSnapLine, context, state);
    } else if (snapLine.type === "gap") {
      context.lineWidth = snapWidth;
      context.strokeStyle = snapColor;

      drawGapLine(
        snapLine.points[0],
        snapLine.points[1],
        snapLine.direction,
        state,
        context,
      );
    } else if (snapLine.type === "points") {
      context.lineWidth = snapWidth;
      context.strokeStyle = snapColor;
      drawPointsSnapLine(snapLine, context, state);
    }
  }

  context.restore();
}