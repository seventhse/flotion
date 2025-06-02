import {
  renderSelectionElement,
} from "@llm-flow/elements";
import { bootstrapCanvas } from "./helpers";
import { RenderInteractiveSceneConfig } from "./interface";
import { renderScrollbars } from "./scrollbars";
import { drawSelectionElementBorder } from "./interactive-helper";
import { throttleRAF } from "@llm-flow/utils";
import { renderSnaps } from "./render-snaps";

const selectionColor = "#6965db"

function _renderInteractiveScene({
  canvas,
  elementsMap,
  visibleElements,
  selectedElements,
  scale,
  state
}: RenderInteractiveSceneConfig) {

  if (!canvas === null) {
    return {
      atLeastOneVisibleElement: false, elementsMap
    }
  }

  const viewportState = {
    zoom: state.zoom,
    scrollX: state.scrollX,
    scrollY: state.scrollY
  }

  const { context, normalizedWidth, normalizedHeight } = bootstrapCanvas(canvas, scale, {})

  context.save()
  context.scale(state.zoom, state.zoom)


  // Paint selection element
  if (state.selectionElement) {
    try {
      renderSelectionElement(
        state.selectionElement,
        context,
        viewportState,
        selectionColor
      )
    } catch (error) {
      console.error('renderSelectionElement error:', error)
    }
  }

  // TODO: In update line or other action cannot draw
  drawSelectionElementBorder(
    context,
    selectedElements,
    elementsMap,
    {
      isRotating: state.isRotating,
      ...viewportState
    },
    selectionColor
  )

  renderSnaps(context, state)

  context.restore();

  // render scrollbars
  const scrollBars = renderScrollbars(context, visibleElements, normalizedWidth, normalizedHeight, {
    renderScrollbars: state.renderScrollbars,
    ...viewportState
  })


  return {
    scrollBars,
    atLeastOneVisibleElement: visibleElements.length > 0,
    elementsMap,
  }
}


export const renderInteractiveSceneThrottled = throttleRAF(
  (config: RenderInteractiveSceneConfig) => {
    const ret = _renderInteractiveScene(config);
    config.callback?.(ret);
  },
  { trailing: true },
);

/**
 * Interactive scene is the ui-canvas where we render bounding boxes, selections
 * and other ui stuff.
 */
export const renderInteractiveScene = <
  U extends typeof _renderInteractiveScene,
  T extends boolean = false,
>(
  renderConfig: RenderInteractiveSceneConfig,
  throttle?: T,
): T extends true ? void : ReturnType<U> => {
  if (throttle) {
    renderInteractiveSceneThrottled(renderConfig);
    return undefined as T extends true ? void : ReturnType<U>;
  }
  const ret = _renderInteractiveScene(renderConfig);
  renderConfig.callback(ret);
  return ret as T extends true ? void : ReturnType<U>;
};