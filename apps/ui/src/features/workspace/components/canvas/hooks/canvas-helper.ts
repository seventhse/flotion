interface ContainerSize {
  width: number
  height: number
}

interface CanvasSize {
  width: number
  height: number
}

interface Position {
  x: number
  y: number
}


/**
 * 计算画布适应容器的缩放比例
 */
export function calculateFitScale(
  containerSize: ContainerSize,
  canvasSize: CanvasSize,
  padding = 0.2 // 边距百分比，默认0.2表示20%
): number {
  padding = 100 - padding * 100
  const availableWidth = (containerSize.width * padding) / 100
  const availableHeight = (containerSize.height * padding) / 100

  const scaleX = availableWidth / canvasSize.width
  const scaleY = availableHeight / canvasSize.height

  return Math.min(scaleX, scaleY)
}

/**
 * 计算画布居中位置
 */
export function calculateCenterPosition(
  targetEl: HTMLElement,
  scale: number
): Position | null {
  const containerRect = targetEl.parentElement?.getBoundingClientRect()
  const targetRect = targetEl.getBoundingClientRect()
  if (!containerRect || !targetRect) {
    return null
  }
  const containerCenterX = containerRect.left + containerRect.width / 2;
  const containerCenterY = containerRect.top + containerRect.height / 2;
  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;
  const deltaX_viewport = containerCenterX - targetCenterX;
  const deltaY_viewport = containerCenterY - targetCenterY;
  const panX = deltaX_viewport / scale;
  const panY = deltaY_viewport / scale;
  return {
    x: panX,
    y: panY,
  }
}

/**
 * 检查是否需要更新平移位置
 */
export function shouldUpdatePan(
  currentPan: Position,
  targetPan: Position,
  threshold = 10
): boolean {
  return Math.abs(currentPan.x - targetPan.x) >= threshold ||
    Math.abs(currentPan.y - targetPan.y) >= threshold
}

