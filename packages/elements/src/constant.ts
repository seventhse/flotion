import { COLOR_PATTER } from "@llm-flow/common"
import { FlotionElement } from "./interface"

// line style in roughjs draw
export const ROUGHNESS = {
  architect: 0, //
  artist: 1, //
  cartoonist: 2, //
} as const


// line size
export const STROKE_WIDTH = {
  thin: 1,
  bold: 2,
  extraBold: 4
} as const


export const DEFAULT_ELEMENT: {
  opacity: FlotionElement['opacity'],
  angle: FlotionElement['angle'],
  fillStyle: FlotionElement['fillStyle'],
  backgroundColor: FlotionElement['backgroundColor'],
  strokeColor: FlotionElement['strokeColor'],
  strokeWidth: FlotionElement['strokeWidth'],
  strokeStyle: FlotionElement['strokeStyle']
  roughness: FlotionElement['roughness']
} = {
  opacity: 100,
  angle: 0,

  fillStyle: 'solid',
  backgroundColor: COLOR_PATTER.transparent,

  // border
  strokeColor: COLOR_PATTER.black,
  strokeStyle: 'solid',
  strokeWidth: STROKE_WIDTH.thin,

  roughness: ROUGHNESS.artist
}