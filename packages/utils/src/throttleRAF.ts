export type ThrottleRAFFn = ReturnType<typeof throttleRAF>

export function throttleRAF<T extends any[]>(
  fn: (...args: T) => void,
  opts?: { trailing?: boolean }
) {
  let timerId: number | null = null
  let lastArgs: T | null = null
  let lastArgsTrailing: T | null = null

  const scheduleFunc = (args: T) => {
    timerId = requestAnimationFrame(() => {
      timerId = null
      fn(...args)
      timerId = null
      if (lastArgsTrailing) {
        lastArgs = lastArgsTrailing
        lastArgsTrailing = null
        scheduleFunc(lastArgs)
      }
    })
  }

  const ret = (...args: T) => {
    lastArgs = args;
    if (timerId === null) {
      scheduleFunc(args)
    } else if (opts?.trailing) {
      lastArgsTrailing = args
    }
  }

  ret.flush = () => {
    if (timerId !== null) {
      cancelAnimationFrame(timerId)
      timerId = null
    }
    if (lastArgs) {
      fn(...(lastArgsTrailing || lastArgs))
      lastArgs = lastArgsTrailing = null
    }
  }

  ret.cancel = () => {
    lastArgs = lastArgsTrailing = null
    if (timerId !== null) {
      cancelAnimationFrame(timerId)
      timerId = null
    }
  }

  return ret
}