import { RoughCanvas } from "roughjs/bin/canvas";
import { FlotionElement } from "./interface";
import { DrawElementOpts } from "./element-manage";
import { createOffScreenEnv, getElementAbsoluteCoords } from "./element-helpers";
import { ElementWithCanvasValue, getElementWithCanvasCache } from "./element-cache";
import { Drawable } from "roughjs/bin/core";

type GeneratorElementWithCanvasExecute = (context: CanvasRenderingContext2D, rc: RoughCanvas) => void

export abstract class Element<T extends FlotionElement = FlotionElement> {
  element: T
  rc: RoughCanvas

  constructor(rc: RoughCanvas, element: T) {
    this.rc = rc
    this.element = element
  }

  generatorElementWithCanvas({ zoom }: Required<DrawElementOpts>, execute: GeneratorElementWithCanvasExecute): ElementWithCanvasValue | null {
    const element = this.element
    const offScreenEnv = createOffScreenEnv(element, zoom)

    if (!offScreenEnv) {
      return null
    }

    const { context, rc, canvas, padding } = offScreenEnv

    execute(context, rc)
    context.restore()

    return {
      canvas,
      rc,
      zoom,
      scale: offScreenEnv.scale,
      angle: element.angle,
      element,
      padding,
      version: element.version
    }
  }

  drawElementFromCanvas({ context, scrollX, scrollY }: Required<DrawElementOpts>) {
    const elementWithCanvas = getElementWithCanvasCache(this.element)
    if (!elementWithCanvas) {
      return
    }
    const element = elementWithCanvas.element
    const padding = elementWithCanvas.padding

    const [x1, y1, x2, y2] = getElementAbsoluteCoords(element)
    const cx = ((x1 + x2) / 2) * window.devicePixelRatio
    const cy = ((y1 + y2) / 2) * window.devicePixelRatio
    context.save()

    context.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio)

    context.translate(cx, cy)
    context.rotate(element.angle)

    context.translate(-cx, -cy)

    context.drawImage(
      elementWithCanvas.canvas,
      (x1 + scrollX) * window.devicePixelRatio - (padding * 2 * elementWithCanvas.scale) / elementWithCanvas.scale,
      (y1 + scrollY) * window.devicePixelRatio - (padding * 2 * elementWithCanvas.scale) / elementWithCanvas.scale,
      elementWithCanvas.canvas.width / elementWithCanvas.scale,
      elementWithCanvas.canvas.height / elementWithCanvas.scale
    )

    context.restore()
  }

  abstract getShape(shouldRegenerator: boolean): Drawable | Drawable[] | null
  abstract draw(opts: Required<DrawElementOpts>): void
  abstract animateDraw(opts: Required<DrawElementOpts>): void
}
