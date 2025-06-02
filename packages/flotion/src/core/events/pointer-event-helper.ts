import { isShallowEqual } from "@llm-flow/utils";
import { FlotionAppState, SetFlotionState } from "../interface";
import { FlotionElement } from "@llm-flow/elements";



export function makeNextSelectedElementIds(
  nextSelectedElementIds: FlotionAppState['selectedElementIds'],
  prevState: Pick<FlotionAppState, 'selectedElementIds'>
) {
  if (isShallowEqual(prevState.selectedElementIds, nextSelectedElementIds)) {
    return prevState.selectedElementIds
  }
  return nextSelectedElementIds
}

export function isASelectedElement(hitElement: FlotionElement | null, selectedElementIds: FlotionAppState['selectedElementIds']) {
  return hitElement !== null && selectedElementIds[hitElement.id]
}

export function clearSelection(hitElement: FlotionElement | null, state: FlotionAppState, setState: SetFlotionState) {
  setState(prev => {
    return {
      selectedElementIds: makeNextSelectedElementIds({}, prev)
    }
  }, 'action')

  setState({
    selectedElementIds: makeNextSelectedElementIds({}, state),
    prevSelectedElementIds: state.selectedElementIds
  }, 'action')
}