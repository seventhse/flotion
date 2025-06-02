import { MaybeTransformHandleType, NonDeletedFlotionElement, NonDeletedFlotionElementsMap } from "@llm-flow/elements";
import { isOverScrollBars } from "../render/scrollbars";
import { PointObj } from "@llm-flow/common";
import { throttleRAF } from "@llm-flow/utils";


export interface PointerDownState {
  origin: PointObj
  originInGrid: PointObj
  scrollbars: ReturnType<typeof isOverScrollBars>
  lastCoords: PointObj
  originalElements: NonDeletedFlotionElementsMap,
  resize: {
    handleType: MaybeTransformHandleType
    isResizing: boolean
    offset: PointObj
    arrowDirection: 'origin' | 'end',
    center: PointObj
  },
  hit: {
    element: NonDeletedFlotionElement | null,
    allHitElements: NonDeletedFlotionElement[]
    wasAddedToSelection: boolean
    hasBeenDuplicated: boolean
    hasHitCommonBoundingBoxOfSelectedElements: boolean
  }
  withCmdOrCtrl: boolean
  drag: {
    // Might change during the pointer interaction
    hasOccurred: boolean;
    // Might change during the pointer interaction
    offset: { x: number; y: number } | null;
  };
  // We need to have these in the state so that we can unsubscribe them
  eventListeners: {
    // It's defined on the initial pointer down event
    onMove: null | ReturnType<typeof throttleRAF>;
    // It's defined on the initial pointer down event
    onUp: null | ((event: PointerEvent) => void);
    // It's defined on the initial pointer down event
    onKeyDown: null | ((event: KeyboardEvent) => void);
    // It's defined on the initial pointer down event
    onKeyUp: null | ((event: KeyboardEvent) => void);
  }
  boxSelection: {
    hasOccurred: boolean;
  };
}