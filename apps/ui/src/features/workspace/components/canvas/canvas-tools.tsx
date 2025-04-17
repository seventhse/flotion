import { Minus, Frame, AlignCenter, Plus, RotateCcw, Grab } from 'lucide-react'
import { Button } from '~/components/button'
import { useCanvasWrapperContext } from './context'
import { usePanzoomScale } from './hooks/use-panzoom-scale'
import { useCanvasStore } from '~/store/canvas.store'
import { useShallow } from 'zustand/shallow'

const zoomButtonVariants = `
  size-8 inline-flex items-center justify-center text-accent-foreground cursor-pointer hover:bg-primary 
  data-[disabled=true]:opacity-30 data-[disabled=true]:cursor-not-allowed
`

export function CanvasTools() {
  const canvasContext = useCanvasWrapperContext()
  const [disabledPan, toggleDisabledPan, reset] = useCanvasStore(useShallow(
    state =>
      [state.disabledPan, state.toggleDisabledPan, state.reset]
  ))
  const {
    displayScale,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    onFitScale,
    disabledZoomIn,
    disabledZoomOut,
  } = usePanzoomScale(canvasContext)

  const onReset = () => {
    reset()
    canvasContext.centered()
  }

  return (
    <div className="absolute top-3 left-3 z-40 flex items-center gap-x-3">
      <div className="flex items-center justify-between bg-accent rounded-md gap-x-3 select-none overflow-hidden">
        <span
          className={zoomButtonVariants}
          data-disabled={disabledZoomOut}
          onClick={onZoomOut}
          title="Zoom out canvas"
        >
          <Minus size={16}></Minus>
        </span>
        <span
          className="text-sm w-[32px] text-center cursor-pointer"
          onClick={onResetZoom}
          title="Reset canvas zoom"
        >
          {displayScale}
        </span>
        <span
          className={zoomButtonVariants}
          onClick={onZoomIn}
          data-disabled={disabledZoomIn}
          title="Zoom in canvas"
        >
          <Plus size={16}></Plus>
        </span>
      </div>
      <Button
        title="Fit canvas to screen"
        variant="outline"
        size="icon"
        onClick={onFitScale}
      >
        <Frame size={16} />
      </Button>
      <Button
        title="Center canvas"
        variant="outline"
        size="icon"
        onClick={canvasContext.centered}
      >
        <AlignCenter size={16} />
      </Button>
      <Button
        title="Toggle pan mode"
        className="data-[active=true]:text-primary"
        variant="outline"
        size="icon"
        data-active={!disabledPan}
        onClick={() => toggleDisabledPan()}
      >
        <Grab size={16} />
      </Button>
      <Button
        title="Reset canvas position and zoom"
        variant="outline"
        size="icon"
        onClick={onReset}
      >
        <RotateCcw size={16} />
      </Button>
    </div>
  )
}
