import { ROUGHNESS, STROKE_WIDTH } from "./constant"

export type PointerType = "mouse" | "pen" | "touch"



export type ElementROUGHNESS = typeof ROUGHNESS[keyof typeof ROUGHNESS]
export type ElementStrokeWidth = typeof STROKE_WIDTH[keyof typeof STROKE_WIDTH]
export type StrokeStyle = 'solid' | 'dashed' | 'dotted'
export type FillStyle = 'hachure' | 'cross-hatch' | 'solid' | 'zigzag'


interface _FlotionElementBase {
  id: string

  x: number
  y: number

  width: number
  height: number

  opacity: number
  angle: number

  fillStyle: FillStyle
  backgroundColor: string

  // border
  strokeColor: string // Stroke color, default black
  strokeWidth: ElementStrokeWidth // Stroke width, default 1
  strokeStyle: StrokeStyle // Stroke style: solid/dashed/dotted

  seed: number
  roughness: ElementROUGHNESS

  version: number

  locked: boolean
  isDeleted: boolean
}


export type FlotionRectangleElement = _FlotionElementBase & {
  type: 'rectangle'
}

export type FlotionDiamondElement = _FlotionElementBase & {
  type: 'diamond'
}

export type FlotionEllipseElement = _FlotionElementBase & {
  type: 'ellipse'
}

export type FlotionSelectionElement = _FlotionElementBase & {
  type: 'selection'
}

export type FlotionGenericElement =
  | FlotionRectangleElement
  | FlotionDiamondElement
  | FlotionEllipseElement

export type FlotionElement = FlotionGenericElement | FlotionSelectionElement
export type FlotionElements = FlotionElement[]

export type NonDeleted<T> = T & { isDeleted: false }
export type NonDeletedFlotionElement = NonDeleted<FlotionElement>

export type FlotionElementsMap = Map<FlotionElement['id'], FlotionElement>
export type NonDeletedFlotionElementsMap = Map<FlotionElement['id'], NonDeleted<FlotionElement>>
export type FlotionElementsArrayOrMap = FlotionElementsMap | FlotionElement[]


export type ElementsMapOrArray = FlotionElements | FlotionElementsMap 