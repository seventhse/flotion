import { RoughCanvas } from "roughjs/bin/canvas"
import { FlotionElement } from "./interface"

const AREA_LINE = 16777216
const WIDTH_HEIGHT_LIMIT = 32767

function getCanvasPadding(_element: FlotionElement) {
  // TODO: other element type need other padding
  return 20
}

export function getElementAbsoluteCoords(element: FlotionElement) {
  return [
    element.x, // x
    element.y, // y
    element.x + element.width, // x1
    element.y + element.height, // y1
    element.x + element.width / 2, // x center
    element.y + element.height / 2, // y center
  ]
}

export function cappedElementCanvasSize(element: FlotionElement, zoom: number) {
  const padding = getCanvasPadding(element)

  const elementWidth = element.width
  const elementHeight = element.height

  let width = elementWidth * window.devicePixelRatio + padding * 2
  let height = elementHeight * window.devicePixelRatio + padding * 2

  let scale = zoom

  if (width * scale > WIDTH_HEIGHT_LIMIT || height * scale > WIDTH_HEIGHT_LIMIT) {
    scale = Math.min(WIDTH_HEIGHT_LIMIT / width, WIDTH_HEIGHT_LIMIT / height)
  }

  if (width * height * scale * scale > AREA_LINE) {
    scale = Math.sqrt(AREA_LINE / (width * height))
  }

  width = Math.floor(width * scale)
  height = Math.floor(height * scale)

  return {
    width,
    height,
    scale,
  }
}

export function createOffScreenEnv(element: FlotionElement, zoom: number) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Cannot create canvas.')
  }

  const padding = getCanvasPadding(element)

  const { width, height, scale } = cappedElementCanvasSize(element, zoom)

  if (!width || !height) {
    return null
  }

  canvas.width = width
  canvas.height = height
  context.scale(window.devicePixelRatio * scale, window.devicePixelRatio * scale)
  context.translate(padding * scale, padding * scale)
  const rc = new RoughCanvas(canvas)

  context.restore()

  return {
    canvas,
    context,
    rc,
    zoom,
    scale,
    element,
    padding
  }
}
