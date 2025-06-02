import { FlotionRectangleElement } from "./interface";
import { Element } from "./element";
import { getElementRoughCache, getElementWithCanvasCache, setElementWithCanvasCache } from "./element-cache";
import { DrawElementOpts, ElementManage } from "./element-manage";
import { generatorOptionsImpl } from "./rough-options";
import { Drawable } from "roughjs/bin/core";

export class RectangleElement extends Element<FlotionRectangleElement> implements Element {

  getShape(shouldRegenerator: boolean = false): Drawable | Drawable[] | null {
    const element = this.element
    return getElementRoughCache(element, () => {
      return ElementManage.generator.rectangle(0, 0, element.width, element.height, {
        ...generatorOptionsImpl(element, true),
      })
    }, shouldRegenerator)
  }

  draw(opts: Required<DrawElementOpts>): void {
    const element = this.element
    // 缓存rough Drawable数据
    const elementRough = this.getShape(opts.shouldRegenerator) as Drawable

    // 获取离屏渲染的缓存，如果没有则新建
    let elementWithCache = getElementWithCanvasCache(element)
    if (!elementWithCache || opts.zoom !== elementWithCache?.zoom || opts.shouldRegenerator || elementWithCache.version !== element.version) {
      elementWithCache = this.generatorElementWithCanvas(opts, (context, rc) => {
        context.lineJoin = 'round'
        context.lineCap = 'round'
        rc.draw(elementRough)
      })!

      if (!elementWithCache) {
        return
      }

      setElementWithCanvasCache(element, elementWithCache)
    }

    this.drawElementFromCanvas(opts)
  }

  animateDraw(_opts: Required<DrawElementOpts>): void {
    throw new Error('[animateDraw] not impl')
  }
}
