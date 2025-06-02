import { NonDeletedFlotionElement, NonDeletedFlotionElementsMap } from "@llm-flow/elements"
import { memo, MouseEvent, PointerEvent, useEffect, useRef } from "react"
import { renderInteractiveScene, RenderInteractiveSceneConfig } from "../core"

type PointerCallback = (e: PointerEvent<HTMLCanvasElement>) => void

export interface InteractiveCanvasProps {
  width: number
  height: number
  scale: number
  elementsMap: NonDeletedFlotionElementsMap
  visibleElements: NonDeletedFlotionElement[]
  selectedElements: NonDeletedFlotionElement[]
  state: RenderInteractiveSceneConfig['state']
  sceneNonce?: number
  callback: RenderInteractiveSceneConfig['callback']
  onContextMenu?: (e: MouseEvent<HTMLCanvasElement>) => void
  onDoubleClick?: (e: MouseEvent<HTMLCanvasElement>) => void
  onPointerDown?: PointerCallback
  onPointerUp?: PointerCallback
  onPointerMove?: PointerCallback
  onPointerCancel?: PointerCallback
}

function InteractiveCanvas({
  width,
  height,
  scale,
  elementsMap,
  visibleElements,
  selectedElements,
  state,
  callback,
  ...restProps
}: InteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMounted = useRef(false)

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }

    if (!isMounted.current) {
      isMounted.current = true
    }

    renderInteractiveScene({
      canvas: canvasRef.current,
      elementsMap,
      visibleElements,
      selectedElements,
      scale,
      state,
      callback: callback
    }, true)
  })

  return (
    <canvas
      ref={canvasRef}
      className="flotion__canvas flotion__interactive-canvas"
      width={width * scale}
      height={height * scale}
      style={{
        width: `${width}px`,
        height: `${height}px`
      }}
      {...restProps}
    >
      Draw Canvas
    </canvas>
  )
}

export default memo(InteractiveCanvas)