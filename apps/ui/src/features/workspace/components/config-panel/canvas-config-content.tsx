import { useShallow } from 'zustand/shallow'
import { ColorSelect } from '~/components/color-select'
import { Label } from '~/components/label'
import { NumberInput } from '~/components/number-input'
import { useCanvasStore } from '~/store/canvas.store'

export function CanvasConfigContent() {
  const { width, height, backgroundColor, updateWidth, updateHeight, updateBackgroundColor } = useCanvasStore(
    useShallow(state => ({
      width: state.width,
      height: state.height,
      backgroundColor: state.backgroundColor,
      updateWidth: state.updateWidth,
      updateHeight: state.updateHeight,
      updateBackgroundColor: state.updateBackgroundColor,
      reset: state.reset,
    })),
  )

  return (
    <div className="flex flex-col gap-y-3 mt-3">
      <div className="flex flex-col gap-y-1">
        <Label htmlFor="CanvasWidth">Canvas Width</Label>
        <NumberInput
          id="CanvasWidth"
          value={width}
          onValueChange={updateWidth}
          suffix="px"
          min={0}
        />
      </div>
      <div className="flex flex-col gap-y-1">
        <Label htmlFor="CanvasHeight">Canvas Height</Label>
        <NumberInput
          id="CanvasHeight"
          value={height}
          onValueChange={updateHeight}
          suffix="px"
          min={0}
        />
      </div>
      <div className="flex flex-col gap-y-1">
        <Label htmlFor="CanvasBackground">Canvas Background Color</Label>
        <ColorSelect value={backgroundColor} onChange={updateBackgroundColor} />
      </div>
    </div>
  )
}
