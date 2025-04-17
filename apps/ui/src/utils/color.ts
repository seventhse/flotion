export const HEX_REG = /^#([a-f0-9]{3}|[a-f0-9]{6})$/

export function isTransparent(value: string) {
  return value === 'transparent'
}

export function validateHex(value: string) {
  return isTransparent(value) || HEX_REG.test(value)
}
