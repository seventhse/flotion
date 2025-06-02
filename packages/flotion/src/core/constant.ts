import { COLOR_PATTER, DEFAULT_GRID_SIZE, DEFAULT_GRID_STEP } from "@llm-flow/common";
import { ActiveToolState, FlotionActionState, FlotionCanvasState } from "./interface";


export const DEFAULT_ACTIVE_TOOL_STATE: ActiveToolState = {
  type: 'selection',
  lastActiveTool: null,
  locked: false,
  fromSelection: false
}

export const DEFAULT_CANVAS_STATE: FlotionCanvasState = {
  zoom: 1,
  minZoom: 0.1,
  maxZoom: 30,
  offsetLeft: 0,
  offsetTop: 0,
  scrollX: 0,
  scrollY: 0,
  enableGrid: false,
  gridSize: DEFAULT_GRID_SIZE,
  gridStep: DEFAULT_GRID_STEP,
  backgroundColor: COLOR_PATTER.white,

  isLoading: false,
  theme: 'light'
}


export const DEFAULT_ACTION_STATE: FlotionActionState = {
  newElementId: null,
  newElement: null,
  selectionElement: null,
  selectedElementsAreBeingDragged: false,

  // Selected element record
  selectedElements: [],
  selectedElementIds: {},
  prevSelectedElementIds: {},
  hoveredElementIds: {},
  objectsSnapModeEnabled: false,
  snapLines: [],

  // Edit element
  resizingElement: null,
  isPanning: false,
  isResizing: false,
  isRotating: false,

  originSnapOffset: null
}