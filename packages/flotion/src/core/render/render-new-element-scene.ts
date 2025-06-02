import { ElementManage } from "@llm-flow/elements";
import { bootstrapCanvas } from "./helpers";
import { NewElementSceneRenderConfig } from "./interface";
import { throttleRAF } from "@llm-flow/utils";

let elementManage: ElementManage | null = null

function _renderNewElementScene({
  canvas,
  rc,
  newElement,
  elementsMap,
  scale,
  state
}: NewElementSceneRenderConfig) {
  if (!canvas) {
    return
  }

  if (!elementManage) {
    elementManage = new ElementManage(rc)
  }


  const { context, normalizedWidth, normalizedHeight } = bootstrapCanvas(canvas, scale, {})

  context.save()
  context.scale(state.zoom, state.zoom)


  if (newElement && newElement.type !== 'selection') {
    elementManage.draw(newElement, {
      context,
      elementsMap: elementsMap,
      zoom: state.zoom,
      scrollX: state.scrollX,
      scrollY: state.scrollY
    })
  } else {
    context.clearRect(0, 0, normalizedWidth, normalizedHeight)
  }
  context.restore()
}

export const renderNewElementSceneThrottled = throttleRAF(
  (config: NewElementSceneRenderConfig) => {
    _renderNewElementScene(config);
  },
  { trailing: true },
);

export const renderNewElementScene = (
  renderConfig: NewElementSceneRenderConfig,
  throttle?: boolean,
) => {
  if (throttle) {
    renderNewElementSceneThrottled(renderConfig);
    return;
  }

  _renderNewElementScene(renderConfig);
};



export function destroyNewElementScene() {
  if (elementManage) {
    elementManage.destroy()
    elementManage = null
  }
  renderNewElementSceneThrottled.cancel()
}
