import { FlotionElement, NonDeletedFlotionElementsMap } from "./interface";
import { Element } from "./element";
import { RoughCanvas } from "roughjs/bin/canvas";
import { RoughGenerator } from "roughjs/bin/generator";
import { RectangleElement } from "./rectangle-element";
import { clearElementRoughCache } from "./element-cache";

export interface DrawElementOpts {
  context: CanvasRenderingContext2D
  elementsMap: NonDeletedFlotionElementsMap
  scrollX: number
  scrollY: number
  zoom?: number
  shouldRegenerator?: boolean
}

const generator = new RoughGenerator()

const defaultDrawElementOpts: Required<Omit<DrawElementOpts, 'context' | 'elementsMap'>> = {
  scrollX: 0,
  scrollY: 0,
  zoom: 1,
  shouldRegenerator: false
}

function ElementFactory<T extends FlotionElement>(rc: RoughCanvas, element: T): Element {
  switch (element.type) {
    case "rectangle":
      return new RectangleElement(rc, element)
    case "diamond":
    case "ellipse":
    default:
      throw new Error(`[ElementFactory]: Element type ${element.type} is no defined.`)
  }
}

export class ElementManage {
  static cache: WeakMap<FlotionElement, Element> = new WeakMap()
  static generator: RoughGenerator = generator
  rc: RoughCanvas
  constructor(rc: RoughCanvas) {
    this.rc = rc
  }

  getElementInstance(element: FlotionElement): Element {
    let instance = ElementManage.cache.get(element)

    if (!instance) {
      instance = ElementFactory(this.rc, element)
      ElementManage.cache.set(element, instance)
    }

    return instance
  }

  draw(element: FlotionElement, opts: DrawElementOpts) {
    const instance = this.getElementInstance(element)
    instance.draw({
      ...defaultDrawElementOpts,
      ...opts
    })
  }

  animateDraw(element: FlotionElement, opts: DrawElementOpts) {
    const instance = this.getElementInstance(element)
    instance.animateDraw({
      ...defaultDrawElementOpts,
      ...opts
    })
  }

  destroy() {
    ElementManage.cache = new WeakMap()
    clearElementRoughCache()
  }
}


