import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'

export interface PanPosition {
  x: number
  y: number
}

export interface CanvasState {
  width: number
  height: number
  backgroundColor: string
  updateWidth: (width: number) => void
  updateHeight: (height: number) => void
  updateSize: (width: number, height: number) => void
  updateBackgroundColor: (background: string) => void

  zoom: number
  pan: PanPosition | null
  disabledPan: boolean
  updateZoom: (zoom: number) => void
  updatePan: (pan: PanPosition | null) => void
  toggleDisabledPan: (enablePan?: boolean) => void

  reset: () => void
}

const defaultCanvasState = {
  width: 1024,
  height: 768,
  zoom: 1,
  pan: null,
  disabledPan: true,
  backgroundColor: 'transparent',
}

export const useCanvasStore = create<CanvasState>()(
  persist((set, get) => {
    return {
      ...defaultCanvasState,
      updateWidth: (width: number) => {
        set({ width })
      },
      updateHeight: (height: number) => {
        set({ height })
      },
      updateSize: (width: number, height: number) => {
        set({ width, height })
      },
      updateBackgroundColor: (backgroundColor: string) => {
        set({ backgroundColor })
      },
      updateZoom: (zoom: number) => {
        set({ zoom })
      },
      updatePan: (pan: PanPosition | null) => {
        set({ pan })
      },
      toggleDisabledPan: (disabledPan?: boolean) => {
        set({ disabledPan: disabledPan ?? !get().disabledPan })
      },
      reset: () => {
        set({ ...defaultCanvasState })
      },
    }
  }, {
    name: 'CANVAS_STORE',
    storage: createJSONStorage(() => localStorage),
  }),
)

export function useCanvasStyle() {
  const { width, height, backgroundColor } = useCanvasStore(useShallow((state) => {
    return {
      width: state.width,
      height: state.height,
      backgroundColor: state.backgroundColor,
    }
  }))

  return {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor,
    willChange: 'transform',
  }
}

export function useCanvasValue() {
  return useCanvasStore(useShallow(state => ({
    width: state.width,
    height: state.height,
    backgroundColor: state.backgroundColor,
    zoom: state.zoom,
    disabledPan: state.disabledPan,
  })))
}

export type CanvasValue = ReturnType<typeof useCanvasValue>
