export const COLOR_PATTER = {
  transparent: "transparent",
  black: "#1e1e1e",
  white: "#ffffff",
}


export function isTransparent(color: string) {
  return color === COLOR_PATTER.transparent
    || (color.length === 9 && color.substring(7, 9) === '00')
    || (color.length === 5 && color[5] === '00')
    || (/rgba\(/.test(color) && color[color.length - 1] === '0')
}

export function hasTransparent(color: string) {
  return isTransparent(color)
    || color.length === 5  // #RGBA
    || color.length === 9  // #RRGGBBA
    || /(hsla | rgba)\(/.test(color);
}