import { NonDeletedFlotionElement, NonDeletedFlotionElementsMap } from "@llm-flow/elements"
import { RoughCanvas } from "roughjs/bin/canvas"
import { FlotionActionState, FlotionCanvasState } from "../interface";

export type CommonRenderState = Omit<FlotionCanvasState, 'minZoom' | 'maxZoom' | 'isLoading'>

export interface RenderStaticSceneOpts {
  canvas: HTMLCanvasElement,
  rc: RoughCanvas,
  scale: number,
  elementsMap: NonDeletedFlotionElementsMap,
  visibleElements: NonDeletedFlotionElement[],
  state: CommonRenderState
}

export interface NewElementSceneRenderConfig {
  canvas: HTMLCanvasElement,
  rc: RoughCanvas,
  newElement: NonDeletedFlotionElement
  elementsMap: NonDeletedFlotionElementsMap
  scale: number,
  state: CommonRenderState
}
export type ScrollBars = {
  horizontal: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  vertical: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
};

export type RenderInteractiveSceneCallbackData = {
  atLeastOneVisibleElement: boolean
  elementsMap: NonDeletedFlotionElementsMap
  scrollBars?: ScrollBars
}

export type RenderInteractiveSceneState = CommonRenderState & FlotionActionState & {
  renderScrollbars?: boolean
}

export interface RenderInteractiveSceneConfig {
  canvas: HTMLCanvasElement,
  elementsMap: NonDeletedFlotionElementsMap
  visibleElements: NonDeletedFlotionElement[]
  selectedElements: NonDeletedFlotionElement[]
  scale: number,
  state: RenderInteractiveSceneState
  callback: (data: RenderInteractiveSceneCallbackData) => void
}