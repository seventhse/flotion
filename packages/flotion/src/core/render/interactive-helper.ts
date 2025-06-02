import { COLOR_PATTER, DEFAULT_TRANSFORM_HANDLE_SPACING } from "@llm-flow/common";
import {
  arrayToMap,
  getCommonBounds,
  getElementAbsoluteCoords,
  getTransformHandlers,
  getTransformHandlesFromCoords,
  NonDeletedFlotionElement,
  NonDeletedFlotionElementsMap,
  shouldShowBoundingBox,
  TransformHandles,
  TransformHandleType
} from "@llm-flow/elements";
import { fillCircle } from "./helpers";
import { RenderInteractiveSceneState } from "./interface";

export type ViewportState = { zoom: number, scrollX: number, scrollY: number }

export type ElementSelectionBorder = {
  angle: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  selectionColors: string[];
  dashed?: boolean;
  cx: number;
  cy: number;
  activeEmbeddable: boolean;
  padding?: number;
}

export function strokeRectWithRotation(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  cx: number,
  cy: number,
  angle: number,
  fill: boolean = false,
  /** should account for zoom */
  radius: number = 0,
) {
  context.save();
  context.translate(cx, cy);
  context.rotate(angle);
  if (fill) {
    context.fillRect(x - cx, y - cy, width, height);
  }
  if (radius && context.roundRect) {
    context.beginPath();
    context.roundRect(x - cx, y - cy, width, height, radius);
    context.stroke();
    context.closePath();
  } else {
    context.strokeRect(x - cx, y - cy, width, height);
  }
  context.restore();
};

export function renderSelectionBorder(
  context: CanvasRenderingContext2D,
  state: ViewportState,
  elementProperties: ElementSelectionBorder
) {
  const { angle, cx, cy, x1, y1, x2, y2, selectionColors, dashed } = elementProperties

  const elementWidth = x2 - x1
  const elementHeight = y2 - y1

  const padding = elementProperties?.padding ?? DEFAULT_TRANSFORM_HANDLE_SPACING * 2

  const linePadding = padding / state.zoom
  const lineWidth = 8 / state.zoom
  const spaceWidth = 4 / state.zoom

  context.save()
  context.translate(state.scrollX, state.scrollY)
  context.lineWidth = (elementProperties.activeEmbeddable ? 4 : 1) / state.zoom
  const count = selectionColors.length
  for (let index = 0; index < count; ++index) {
    context.strokeStyle = selectionColors[index]
    if (dashed) {
      context.setLineDash([lineWidth, spaceWidth + (lineWidth + spaceWidth) * (count - 1)])
    }
    context.lineDashOffset = (lineWidth + spaceWidth) * index
    strokeRectWithRotation(
      context,
      x1 - linePadding,
      y1 - linePadding,
      elementWidth + linePadding * 2,
      elementHeight + linePadding * 2,
      cx,
      cy,
      angle
    )
  }
  context.restore()
}


export function renderTransformHandles(
  context: CanvasRenderingContext2D,
  transformHandles: TransformHandles,
  angle: number,
  state: {
    zoom: number,
    selectionColor?: string
  }
) {
  Object.keys(transformHandles).forEach((key) => {
    const transformHandle = transformHandles[key as TransformHandleType];
    if (transformHandle !== undefined) {
      const [x, y, width, height] = transformHandle;

      context.save();
      context.lineWidth = 1 / state.zoom;
      if (state.selectionColor) {
        context.strokeStyle = state.selectionColor;
      }
      if (key === "rotation") {
        fillCircle(context, x + width / 2, y + height / 2, width / 2);
        // prefer round corners if roundRect API is available
      } else if (context.roundRect) {
        context.beginPath();
        context.roundRect(x, y, width, height, 2 / state.zoom);
        context.fill();
        context.stroke();
      } else {
        strokeRectWithRotation(
          context,
          x,
          y,
          width,
          height,
          x + width / 2,
          y + height / 2,
          angle,
          true, // fill before stroke
        );
      }
      context.restore();
    }
  });
};


export function drawSelectionElementBorder(
  context: CanvasRenderingContext2D,
  selectedElements: NonDeletedFlotionElement[],
  elementsMap: NonDeletedFlotionElementsMap,
  { isRotating, ...viewportState }: ViewportState & { isRotating: RenderInteractiveSceneState['isRotating'] },
  selectionColor: string
) {

  // Check is display multi element compose box
  const showBoundingBox = shouldShowBoundingBox(selectedElements)
  if (showBoundingBox) {
    const locallySelectedIds = arrayToMap(selectedElements)
    const selections: ElementSelectionBorder[] = []

    for (const element of elementsMap.values()) {
      const selectionColors = []
      if (locallySelectedIds.has(element.id)) {
        selectionColors.push(selectionColor)
      }

      if (selectionColors.length) {
        const [x1, y1, x2, y2, cx, cy] = getElementAbsoluteCoords(element)
        selections.push({
          angle: element.angle,
          x1,
          y1,
          x2,
          y2,
          selectionColors,
          dashed: false,
          cx,
          cy,
          activeEmbeddable: false,
          padding: undefined
        })
      }
    }

    selections.forEach((selection) => {
      renderSelectionBorder(context, viewportState, selection)
    })
  }

  context.save()
  context.translate(viewportState.scrollX, viewportState.scrollY)

  if (selectedElements.length === 1) {
    context.fillStyle = COLOR_PATTER.white
    const transformHandles = getTransformHandlers(selectedElements[0], viewportState.zoom, elementsMap, 'mouse')

    if (showBoundingBox) {
      renderTransformHandles(context, transformHandles, selectedElements[0].angle, { zoom: viewportState.zoom, selectionColor })
    }
  } else if (selectedElements.length > 1 && !isRotating) {
    const dashedLinePadding = (DEFAULT_TRANSFORM_HANDLE_SPACING * 2) / viewportState.zoom
    context.fillStyle = COLOR_PATTER.white
    const [x1, y1, x2, y2] = getCommonBounds(selectedElements, elementsMap)
    const initialLineDash = context.getLineDash()
    context.setLineDash([2 / viewportState.zoom])
    const lineWidth = context.lineWidth
    context.lineWidth = 1 / viewportState.zoom
    context.strokeStyle = selectionColor
    strokeRectWithRotation(
      context,
      x1 - dashedLinePadding,
      y1 - dashedLinePadding,
      x2 - x1 + dashedLinePadding * 2,
      y2 - y1 + dashedLinePadding * 2,
      (x1 + y2) / 2,
      (y1 + y2) / 2,
      0
    )
    context.lineWidth = lineWidth
    context.setLineDash(initialLineDash)
    const transformHandles = getTransformHandlesFromCoords(
      [x1, y1, x2, y2, (x1 + x2) / 2, (y1 + y2) / 2],
      0,
      viewportState.zoom,
      'mouse'
    )

    if (selectedElements.some((element => !element.locked))) {
      renderTransformHandles(context, transformHandles, 0, { zoom: viewportState.zoom, selectionColor })
    }
  }
  context.restore()
}