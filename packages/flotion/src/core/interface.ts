import { FlotionElement, NonDeletedFlotionElement } from "@llm-flow/elements"
import { PointerEvent } from "react"
import { Scene } from "./scene"
import { PointObj } from "@llm-flow/common"
import { SnapLine } from "./events/snapping"

export type FlotionTools = FlotionElement['type'] | 'grab'

export type ActiveTool = {
  type: FlotionTools
  customType: null
} | {
  type: 'custom'
  customType: string
}

export interface ActiveToolState {
  type: FlotionTools
  lastActiveTool: ActiveTool | null
  locked: boolean
  fromSelection: boolean
}

export interface ElementStyleState {
  backgroundColor: FlotionElement['backgroundColor']
  fillStyle: FlotionElement['fillStyle']
  strokeColor: FlotionElement['strokeColor']
  strokeWith: FlotionElement['strokeWidth']
  strokeStyle: FlotionElement['strokeStyle']
  roughness: FlotionElement['roughness']
  opacity: FlotionElement['opacity']
}

export interface FlotionCanvasState {
  zoom: number
  minZoom: number
  maxZoom: number
  offsetLeft: number
  offsetTop: number
  scrollX: number
  scrollY: number
  enableGrid: boolean
  gridSize: number
  gridStep: number
  backgroundColor: string

  // Status state
  isLoading: boolean
  theme: 'light' | 'dark'
}

export interface FlotionActionState {
  // New Element record
  newElementId: FlotionElement['id'] | null
  newElement: NonDeletedFlotionElement | null
  selectionElement: NonDeletedFlotionElement | null

  // Selected element record
  selectedElements: NonDeletedFlotionElement[]
  selectedElementIds: { [id: string]: true }
  selectedElementsAreBeingDragged: boolean
  prevSelectedElementIds: { [id: string]: true }
  hoveredElementIds: { [id: string]: true }
  objectsSnapModeEnabled: boolean

  // Edit element
  resizingElement: NonDeletedFlotionElement | null
  isPanning: boolean
  isResizing: boolean
  isRotating: boolean

  snapLines: SnapLine[]

  originSnapOffset: PointObj | null
}


export type FlotionAppState = FlotionCanvasState & FlotionActionState & {
  scene: Scene,
  activeTool: ActiveToolState
  lastPointerDownEvent: PointerEvent<HTMLElement> | null
  width: number
  height: number
}

type CanUpdateState = Exclude<FlotionAppState, 'scene' | 'lastPointerDownEvent'>
export type SetFlotionState = (nextState: Partial<CanUpdateState> | ((prev: CanUpdateState) => Partial<CanUpdateState>), type: 'action' | 'canvas' | 'tool') => void