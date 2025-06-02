

export function createPrivateVariable<T = any>(val: T) {
  return {
    get(): T {
      return val
    },
    set(val: T) {
      val = val
    }
  }
}