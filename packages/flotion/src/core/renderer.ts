import { memoize } from "@llm-flow/utils";
import { Scene } from "./scene";
import { FlotionActionState, FlotionCanvasState } from "./interface";
import { isElementInViewport, NonDeletedFlotionElement, NonDeletedFlotionElementsMap } from "@llm-flow/elements";
import { destroyRenderStaticScene } from "./render/render-static-scene";
import { renderInteractiveSceneThrottled } from "./render/render-interactive-scene";

type GetVisibleCanvasElementsOpts = Pick<FlotionCanvasState, 'zoom' | 'offsetLeft' | 'offsetTop' | 'scrollX' | 'scrollY'> & {
  width: number
  height: number
}


export class Renderer {
  private scene: Scene

  constructor(scene: Scene) {
    this.scene = scene
  }


  getRenderableElements = (() => {

    const getVisibleCanvasElements = (
      { elementsMap, width, height, ...viewportOpts }:
        GetVisibleCanvasElementsOpts & { elementsMap: NonDeletedFlotionElementsMap }
    ) => {
      const visibleElements: NonDeletedFlotionElement[] = []

      for (const element of elementsMap.values()) {
        if (isElementInViewport(element, width, height, viewportOpts, elementsMap)) {
          visibleElements.push(element)
        }
      }

      return visibleElements
    }

    const getRenderableElements = (opts: { elements: NonDeletedFlotionElement[], newElementId: FlotionActionState['newElementId'] }) => {
      const elementsMap = new Map()
      for (const element of opts.elements) {
        if (opts.newElementId === element.id) {
          continue
        }

        elementsMap.set(element.id, element)
      }
      return elementsMap
    }

    return memoize((opts: GetVisibleCanvasElementsOpts & {
      newElementId: FlotionActionState['newElementId']
      sceneNonce: ReturnType<InstanceType<typeof Scene>['getSceneNonce']>
    }) => {
      const { zoom, offsetLeft, offsetTop, scrollX, scrollY, width, height, newElementId } = opts

      const elements = this.scene.getNonDeletedElements()

      const elementsMap = getRenderableElements({
        elements,
        newElementId
      })

      const visibleElements = getVisibleCanvasElements({
        elementsMap,
        zoom,
        offsetLeft,
        offsetTop,
        scrollX,
        scrollY,
        width,
        height,
      })

      return {
        elementsMap, visibleElements
      }
    })
  })()

  destroy() {
    destroyRenderStaticScene()
    renderInteractiveSceneThrottled.cancel()
    this.getRenderableElements.clear()
  }
}