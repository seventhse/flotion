import { NonDeletedFlotionElement } from "./interface";


export function renderSelectionElement(
  element: NonDeletedFlotionElement,
  context: CanvasRenderingContext2D,
  state: {
    zoom: number,
    scrollX: number,
    scrollY: number
  },
  selectionColor: string
) {
  context.save()
  context.translate(element.x + state.scrollX, element.y + state.scrollY)
  context.fillStyle = 'rgba(0,0,200,0.04)'
  const offset = 0.5 / state.zoom

  context.fillRect(offset, offset, element.width, element.height)
  context.lineWidth = 1 / state.zoom
  context.strokeStyle = selectionColor
  context.strokeRect(offset, offset, element.width, element.height)

  context.restore()
}




