import { createContext, PropsWithChildren, use, useMemo, useRef } from "react";
import { Renderer, Scene } from "../core";
import { useOnMount, useUnMount } from "@llm-flow/utils";
import roughjs from "roughjs"
import { RoughCanvas } from "roughjs/bin/canvas";
import { setLocalCache, getLocalCache } from "@llm-flow/utils";
import { FlotionElements } from "@llm-flow/elements";

export interface SceneContextState {
  scene: Scene,
  renderer: Renderer
  canvas: HTMLCanvasElement
  rc: RoughCanvas
}

const CacheKey = 'FlotionElementsKey'

export const SceneContext = createContext<SceneContextState | null>(null)

export function SceneProvider({ children }: PropsWithChildren) {
  const scene = useRef(new Scene())
  const renderer = useRef(new Renderer(scene.current))
  const canvas = useRef(document.createElement('canvas'))
  const rc = useRef(roughjs.canvas(canvas.current))

  const state = useMemo<SceneContextState>(() => {
    return {
      scene: scene.current,
      renderer: renderer.current,
      canvas: canvas.current,
      rc: rc.current
    }
  }, [])

  useOnMount(() => {
    const cache = getLocalCache<FlotionElements>(CacheKey)
    if (cache) {
      scene.current.insertElements(cache)
    }
  })

  useUnMount(() => {
    const elements = scene.current.getElements()
    setLocalCache(CacheKey, elements)
    scene.current?.destroy?.()
    renderer.current?.destroy?.()
  })

  return (
    <SceneContext.Provider value={state}>
      {children}
    </SceneContext.Provider>
  )
}

export function useScene() {
  const context = use(SceneContext)
  if (!context) {
    throw new Error("useScene be used within a SceneProvider")
  }
  return context
}