import { hasTransparent, THEME_FILTER } from "@llm-flow/common";
import { RenderStaticSceneOpts } from "./render-static-scene";

export function fillCircle(
  context: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  stroke = true,
) {
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.fill();
  if (stroke) {
    context.stroke();
  }
}

export function getNormalizedCanvasDimensions(canvas: HTMLCanvasElement, scale: number) {
  return [canvas.width / scale, canvas.height / scale]
}

export function bootstrapCanvas(
  canvas: HTMLCanvasElement,
  scale: number,
  { backgroundColor: viewBackgroundColor, theme }: Partial<RenderStaticSceneOpts['state']>
) {
  const [normalizedWidth, normalizedHeight] = getNormalizedCanvasDimensions(canvas, scale)
  const context = canvas.getContext('2d')!

  context.resetTransform()
  context.scale(scale, scale)

  if (theme === 'dark') {
    context.filter = THEME_FILTER;
  }

  if (viewBackgroundColor === 'string') {
    if (hasTransparent(viewBackgroundColor)) {
      context.clearRect(0, 0, normalizedWidth, normalizedHeight)
    }
    context.save()

    context.fillStyle = viewBackgroundColor
    context.fillRect(0, 0, normalizedWidth, normalizedHeight)
    context.restore()
  } else {
    context.clearRect(0, 0, normalizedWidth, normalizedHeight)
  }

  return {
    context,
    normalizedWidth,
    normalizedHeight
  }
}

const GridLineColor = {
  Bold: "#dddddd",
  Regular: "#e5e5e5",
} as const;

export function strokeGrid(
  context: CanvasRenderingContext2D,
  gridSize: number,
  gridStep: number,
  scrollX: number,
  scrollY: number,
  zoom: number,
  width: number,
  height: number
) {
  const offsetX = (scrollX % gridSize) - gridSize
  const offsetY = (scrollY % gridSize) - gridSize

  const actualGridSize = gridSize * zoom
  const spaceWidth = 1 / zoom

  context.save()

  if (zoom === 1) {
    context.translate(offsetX % 1 ? 0 : 0.5, offsetY % 1 ? 0 : 0.5)
  }

  for (let x = offsetX; x < offsetX + width + gridSize * 2; x += gridSize) {
    const isBold = gridStep > 1 && Math.round(x - scrollX) % (gridStep * gridSize) === 0

    if (!isBold && actualGridSize < 10) {
      continue
    }

    const lineWidth = Math.min(1 / zoom, isBold ? 4 : 1);
    context.lineWidth = lineWidth;
    const lineDash = [lineWidth * 3, spaceWidth + (lineWidth + spaceWidth)];

    context.beginPath();
    context.setLineDash(isBold ? [] : lineDash);
    context.strokeStyle = isBold ? GridLineColor.Bold : GridLineColor.Regular;
    context.moveTo(x, offsetY - gridSize);
    context.lineTo(x, Math.ceil(offsetY + height + gridSize * 2));
    context.stroke();
  }

  for (let y = offsetY; y < offsetY + height + gridSize * 2; y += gridSize) {
    const isBold =
      gridStep > 1 && Math.round(y - scrollY) % (gridStep * gridSize) === 0;
    if (!isBold && actualGridSize < 10) {
      continue;
    }

    const lineWidth = Math.min(1 / zoom, isBold ? 4 : 1);
    context.lineWidth = lineWidth;
    const lineDash = [lineWidth * 3, spaceWidth + (lineWidth + spaceWidth)];

    context.beginPath();
    context.setLineDash(isBold ? [] : lineDash);
    context.strokeStyle = isBold ? GridLineColor.Bold : GridLineColor.Regular;
    context.moveTo(offsetX - gridSize, y);
    context.lineTo(Math.ceil(offsetX + width + gridSize * 2), y);
    context.stroke();
  }


  context.restore()
}