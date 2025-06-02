import { memo, useEffect, useRef } from "react";
import { useScene } from "../context/scene-context";
import { renderStaticScene } from "../core";
import { NonDeletedFlotionElement, NonDeletedFlotionElementsMap } from "@llm-flow/elements";
import { RenderStaticSceneOpts } from "src/core/render/interface";


export interface StaticCanvasProps {
  scale: number
  width: number
  height: number
  elementsMap: NonDeletedFlotionElementsMap
  visibleElements: NonDeletedFlotionElement[]
  state: RenderStaticSceneOpts['state']
}

function StaticCanvas({ scale, width, height, elementsMap, visibleElements, state }: StaticCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isMounted = useRef(false)

  const sceneContext = useScene()

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const canvas = sceneContext.canvas

    if (!isMounted.current) {
      canvas.classList.add('flotion__canvas')
      containerRef.current.replaceChildren(canvas)
      isMounted.current = true
    }

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const scaleWidth = scale * width
    const scaleHeight = scale * height

    if (scaleWidth !== canvas.width) {
      canvas.width = scaleWidth
    }
    if (scaleHeight !== canvas.height) {
      canvas.height = scaleHeight
    }


    renderStaticScene({
      canvas,
      rc: sceneContext.rc,
      scale,
      elementsMap,
      visibleElements,
      state
    })
  })


  return (
    <div ref={containerRef} className="flotion__canvas-wrapper"></div>
  )
}


export default memo(StaticCanvas)