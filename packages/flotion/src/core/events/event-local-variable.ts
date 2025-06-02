import { createPrivateVariable } from "@llm-flow/utils";
import { ScrollBars } from "../render/interface";
import { PointObj } from "@llm-flow/common";


let _currentScrollBars: ScrollBars = {
  horizontal: null,
  vertical: null
}
export const currentScrollBars = createPrivateVariable(_currentScrollBars)


let _lastPointerCoords: null | PointObj = null

export const lastPointerCoords = createPrivateVariable<PointObj | null>(_lastPointerCoords)