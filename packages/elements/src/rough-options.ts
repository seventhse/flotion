import type { Options } from 'roughjs/bin/core'
import type { FlotionElement } from './interface'
import { ROUGHNESS } from './constant'

const getDashArrayDashed = (strokeWidth: number) => [8, 8 + strokeWidth]

const getDashArrayDotted = (strokeWidth: number) => [1.5, 6 + strokeWidth]

function adjustRoughness(element: FlotionElement): number {
  const roughness = element.roughness

  const maxSize = Math.max(element.width, element.height)
  const minSize = Math.min(element.width, element.height)

  // don't reduce roughness if
  if (
    // both sides relatively big
    (minSize >= 20 && maxSize >= 50)
    // is round & both sides above 15px
    // TODO
  ) {
    return roughness
  }

  return Math.min(roughness / (maxSize < 10 ? 3 : 2), 2.5)
}

export function generatorOptionsImpl(element: FlotionElement, continuousPath = false): Options {
  const options: Options = {
    seed: element.seed,
    strokeLineDash:
      element.strokeStyle === 'dashed'
        ? getDashArrayDashed(element.strokeWidth)
        : element.strokeStyle === 'dotted'
          ? getDashArrayDotted(element.strokeWidth)
          : undefined,
    // for non-solid strokes, disable multiStroke because it tends to make
    // dashes/dots overlay each other
    disableMultiStroke: element.strokeStyle !== 'solid',
    // for non-solid strokes, increase the width a bit to make it visually
    // similar to solid strokes, because we're also disabling multiStroke
    strokeWidth:
      element.strokeStyle !== 'solid'
        ? element.strokeWidth + 0.5
        : element.strokeWidth,
    // when increasing strokeWidth, we must explicitly set fillWeight and
    // hachureGap because if not specified, roughjs uses strokeWidth to
    // calculate them (and we don't want the fills to be modified)
    fillWeight: element.strokeWidth / 2,
    hachureGap: element.strokeWidth * 4,
    roughness: adjustRoughness(element),
    stroke: element.strokeColor,
    preserveVertices:
      continuousPath || element.roughness < ROUGHNESS.cartoonist,
  }

  switch (element.type) {
    case 'rectangle':
    case 'diamond':
    case 'ellipse': {
      options.fillStyle = element.fillStyle
      // options.fill = isTransparent(element.backgroundColor)
      options.fill = element.backgroundColor === 'transparent'
        ? undefined
        : element.backgroundColor
      if (element.type === 'ellipse') {
        options.curveFitting = 1
      }
      return options
    }
    // case "line": {
    //   if (isPathALoop(element.points)) {
    //     options.fillStyle = element.fillStyle;
    //     options.fill =
    //       element.backgroundColor === "transparent"
    //         ? undefined
    //         : element.backgroundColor;
    //   }
    //   return options;
    // }
    default:
      throw new Error(`Unimplemented type ${element.type}`)
  }
}
