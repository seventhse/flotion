import { ElementManage } from "@llm-flow/elements";
import { RenderStaticSceneOpts } from "./interface";
import { bootstrapCanvas, strokeGrid } from "./helpers";
import { throttleRAF } from "@llm-flow/utils";

let elementManage: ElementManage | null = null



function _renderStaticScene(
  {
    canvas,
    rc,
    elementsMap,
    visibleElements,
    scale,
    state
  }: RenderStaticSceneOpts
) {
  if (!canvas) {
    return
  }

  if (!elementManage) {
    elementManage = new ElementManage(rc)
  }

  const { context, normalizedWidth, normalizedHeight } = bootstrapCanvas(canvas, scale, state)

  context.scale(state.zoom, state.zoom)

  if (state.enableGrid) {
    strokeGrid(
      context,
      state.gridSize,
      state.gridStep,
      state.scrollX,
      state.scrollY,
      state.zoom,
      normalizedWidth,
      normalizedHeight
    )
  }


  visibleElements.forEach(element => {
    elementManage?.draw(element, {
      context,
      elementsMap: elementsMap,
      zoom: state.zoom,
      scrollX: state.scrollX,
      scrollY: state.scrollY
    })
  })

  // TEST: position draw have some gap
  // context.save()

  // context.strokeStyle = "#000"
  // context.rect(100, 100, 200, 200)
  // context.fill()
  // context.restore()
}

export const renderStaticSceneThrottled = throttleRAF(
  (config: RenderStaticSceneOpts) => {
    _renderStaticScene(config);
  },
  { trailing: true },
);

export const renderStaticScene = (
  renderConfig: RenderStaticSceneOpts,
  throttle?: boolean,
) => {
  if (throttle) {
    renderStaticSceneThrottled(renderConfig);
    return;
  }

  _renderStaticScene(renderConfig);
};


export function destroyRenderStaticScene() {
  if (elementManage) {
    elementManage.destroy()
    elementManage = null
  }
  renderStaticSceneThrottled.cancel()
}