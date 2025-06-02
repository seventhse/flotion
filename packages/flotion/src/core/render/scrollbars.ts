import { type FlotionElement, getCommonBounds, NonDeletedFlotionElement } from "@llm-flow/elements";
import { RenderInteractiveSceneState, ScrollBars } from "./interface";
import { roundRect } from "./round-react";

export const SCROLLBAR_MARGIN = 4;
export const SCROLLBAR_WIDTH = 6;
export const SCROLLBAR_COLOR = "rgba(0,0,0,0.3)";

export interface RenderScrollBarsState {
  renderScrollbars: RenderInteractiveSceneState['renderScrollbars']
  zoom: RenderInteractiveSceneState['zoom']
  scrollX: RenderInteractiveSceneState['scrollX']
  scrollY: RenderInteractiveSceneState['scrollY']
}

export function getScrollBars(
  elements: FlotionElement[],
  viewportWidth: number,
  viewportHeight: number,
  state: RenderScrollBarsState
): ScrollBars {
  if (!elements.length) {
    return {
      horizontal: null,
      vertical: null
    }
  }

  const [elementsMinX, elementsMinY, elementsMaxX, elementsMaxY] =
    getCommonBounds(elements);

  const viewportWidthWithZoom = viewportWidth / state.zoom
  const viewportHeightWithZoom = viewportHeight / state.zoom

  const viewportWidthDiff = viewportWidth - viewportWidthWithZoom
  const viewportHeightDiff = viewportHeight - viewportHeightWithZoom

  const safeArea = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }

  const isRTL = false

  const viewportMinX = -state.scrollX + viewportWidthDiff / 2 + safeArea.left
  const viewportMinY = -state.scrollY + viewportHeightDiff / 2 + safeArea.top
  const viewportMaxX = viewportMinX + viewportWidthWithZoom - safeArea.right;
  const viewportMaxY = viewportMinY + viewportHeightWithZoom - safeArea.bottom;

  const sceneMinX = Math.min(elementsMinX, viewportMinX);
  const sceneMinY = Math.min(elementsMinY, viewportMinY);
  const sceneMaxX = Math.max(elementsMaxX, viewportMaxX);
  const sceneMaxY = Math.max(elementsMaxY, viewportMaxY);

  return {
    horizontal:
      viewportMinX === sceneMinX && viewportMaxX === sceneMaxX
        ? null
        : {
          x:
            Math.max(safeArea.left, SCROLLBAR_MARGIN) +
            ((viewportMinX - sceneMinX) / (sceneMaxX - sceneMinX)) *
            viewportWidth,
          y:
            viewportHeight -
            SCROLLBAR_WIDTH -
            Math.max(SCROLLBAR_MARGIN, safeArea.bottom),
          width:
            ((viewportMaxX - viewportMinX) / (sceneMaxX - sceneMinX)) *
            viewportWidth -
            Math.max(SCROLLBAR_MARGIN * 2, safeArea.left + safeArea.right),
          height: SCROLLBAR_WIDTH,
        },
    vertical:
      viewportMinY === sceneMinY && viewportMaxY === sceneMaxY
        ? null
        : {
          x: isRTL
            ? Math.max(safeArea.left, SCROLLBAR_MARGIN)
            : viewportWidth -
            SCROLLBAR_WIDTH -
            Math.max(safeArea.right, SCROLLBAR_MARGIN),
          y:
            ((viewportMinY - sceneMinY) / (sceneMaxY - sceneMinY)) *
            viewportHeight +
            Math.max(safeArea.top, SCROLLBAR_MARGIN),
          width: SCROLLBAR_WIDTH,
          height:
            ((viewportMaxY - viewportMinY) / (sceneMaxY - sceneMinY)) *
            viewportHeight -
            Math.max(SCROLLBAR_MARGIN * 2, safeArea.top + safeArea.bottom),
        },
  };
}


export function renderScrollbars(
  context: CanvasRenderingContext2D,
  visibleElements: NonDeletedFlotionElement[],
  normalizedWidth: number,
  normalizedHeight: number,
  state: RenderScrollBarsState
) {
  let scrollBars
  if (state.renderScrollbars) {
    scrollBars = getScrollBars(visibleElements, normalizedWidth, normalizedHeight, state)

    context.save()
    context.fillStyle = SCROLLBAR_COLOR
    context.strokeStyle = 'rgba(255,255,255,0.8)';
    [scrollBars.horizontal, scrollBars.vertical].forEach((scrollBar) => {
      if (scrollBar) {
        roundRect(
          context,
          scrollBar.x,
          scrollBar.y,
          scrollBar.width,
          scrollBar.height,
          SCROLLBAR_WIDTH / 2
        )
      }
    })
    context.restore()
  }

  return scrollBars
}


export function isOverScrollBars(scrollBars: ScrollBars, x: number, y: number) {
  const [isOverHorizontal, isOverVertical] = [
    scrollBars.horizontal,
    scrollBars.vertical,
  ].map((scrollBar) => {
    return (
      scrollBar != null &&
      scrollBar.x <= x &&
      x <= scrollBar.x + scrollBar.width &&
      scrollBar.y <= y &&
      y <= scrollBar.y + scrollBar.height
    );
  });
  const isOverEither = isOverHorizontal || isOverVertical;
  return { isOverEither, isOverHorizontal, isOverVertical }
}