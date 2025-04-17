export function randomId() {
  return (Date.now() + Math.random()).toString(36).slice(0, 8)
}

export function randomIdWithAny(val: unknown) {
  return randomId() + String(val)
}

export function stringToHash(val: string) {
  let hash = 0
  for (let i = 0; i < val.length; i++) {
    hash = (hash << 5) - hash + val.charCodeAt(i)
    hash |= 0 // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}
