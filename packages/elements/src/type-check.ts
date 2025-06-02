import { FlotionDiamondElement, FlotionElement, FlotionEllipseElement, FlotionGenericElement, FlotionRectangleElement, NonDeleted } from "./interface";


export function isNonDeletedElement<T extends FlotionElement>(val: T): val is NonDeleted<T> {
  return val.isDeleted === false
}

export function isRectangleElement(val: FlotionElement | null): val is FlotionRectangleElement {
  return !!val && val.type === 'rectangle'
}
export function isDiamondElement(val: FlotionElement | null): val is FlotionDiamondElement {
  return !!val && val.type === 'diamond'
}
export function isEllipseElement(val: FlotionElement | null): val is FlotionEllipseElement {
  return !!val && val.type === 'ellipse'
}
export function isGenericElement(val: FlotionElement | null): val is FlotionGenericElement {
  return isRectangleElement(val) || isDiamondElement(val) || isEllipseElement(val)
}