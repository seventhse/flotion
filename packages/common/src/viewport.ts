
export interface ViewportOpts {
  zoom: number;
  offsetLeft: number;
  offsetTop: number;
  scrollX: number;
  scrollY: number
}


export function viewportCoordsToSceneCoords(
  { clientX, clientY }: { clientX: number; clientY: number },
  { zoom, offsetLeft, offsetTop, scrollX, scrollY }: ViewportOpts
) {
  const x = (clientX - offsetLeft) / zoom - scrollX
  const y = (clientY - offsetTop) / zoom - scrollY

  return { x, y }
}

export function sceneCoordsToViewportCoords(
  { sceneX, sceneY }: { sceneX: number; sceneY: number },
  { zoom, offsetLeft, offsetTop, scrollX, scrollY }: ViewportOpts
) {
  const x = (sceneX + scrollX) * zoom + offsetLeft
  const y = (sceneY + scrollY) * zoom + offsetTop

  return { x, y }
}