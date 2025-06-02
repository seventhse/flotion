import { FlotionElement, newElement } from "@llm-flow/elements";
import { PointerDownState } from "./interface";
import { FlotionAppState, SetFlotionState } from "../interface";
import { getGridPoint } from "@llm-flow/common";
import { KEYS } from "./keys";
import { getEffectiveGridSize } from "./pointer-event";


export function createGenericElementOnPointerDown(
  elementType: FlotionElement['type'],
  pointerDownState: PointerDownState,
  state: FlotionAppState,
  setState: SetFlotionState
) {

  const [gridX, gridY] = getGridPoint(
    pointerDownState.origin.x,
    pointerDownState.origin.y,
    state.lastPointerDownEvent?.[KEYS.CTRL_OR_CMD] ? null : getEffectiveGridSize(state)
  )


  let element = newElement(elementType, {
    x: gridX,
    y: gridY
  })

  if (element.type === 'selection') {
    setState({
      selectionElement: element
    }, 'action')
  } else {
    state.scene.insertElement(element)
    setState({
      newElement: element
    }, 'action')
  }
}