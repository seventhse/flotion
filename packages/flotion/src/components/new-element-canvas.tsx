import { NonDeletedFlotionElement, NonDeletedFlotionElementsMap, newElement } from "@llm-flow/elements"
import { useEffect, useRef } from "react"
import { useScene } from "../context/scene-context"
import { CommonRenderState, renderNewElementScene } from "../core"

export interface NewElementCanvasProps {
  width: number
  height: number
  scale: number
  newElement: NonDeletedFlotionElement
  elementsMap: NonDeletedFlotionElementsMap
  state: CommonRenderState
}

function NewElementCanvas({
  width,
  height,
  scale,
  newElement,
  elementsMap,
  state
}: NewElementCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneContext = useScene()

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }

    renderNewElementScene({
      canvas: canvasRef.current,
      scale,
      elementsMap,
      newElement,
      rc: sceneContext.rc,
      state
    }, true)
  })


  return (
    <canvas
      ref={canvasRef}
      className="flotion__canvas"
      width={width * scale}
      height={height * scale}
      style={{
        width: `${width}px`,
        height: `${height}px`
      }}
    />
  )
}

export default NewElementCanvas
