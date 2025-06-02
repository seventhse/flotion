
export function memoize<T extends Record<string, any>, R extends any>(func: (opts: T) => R) {
  let lastArgs: Map<string, any> | undefined
  let lastResult: R | undefined

  const ret = function (opts: T) {
    const currentArgs = Object.entries(opts)

    if (lastArgs) {
      let argsAreEqual = true
      for (const [key, value] of currentArgs) {
        if (lastArgs.get(key) !== value) {
          argsAreEqual = false
          break
        }
      }

      if (argsAreEqual) {
        return lastResult
      }
    }

    const result = func(opts)

    lastArgs = new Map(currentArgs)
    lastResult = result

    return result
  }

  ret.clear = () => {
    lastArgs = undefined
    lastResult = undefined
  }

  return ret as typeof func & { clear: () => void }
}