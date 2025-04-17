import type { DependencyList } from "react"
import { useEffect, useLayoutEffect, useRef } from "react"

function canUseDom() {
  return !!(typeof window !== "undefined" && window.document && window.document.createElement)
}

const useInternalLayoutEffect = canUseDom() ? useLayoutEffect : useEffect

export const useCustomLayoutEffect = (
  callback: (mount: boolean) => undefined | VoidFunction,
  deps?: DependencyList
) => {
  const firstMountRef = useRef(true)

  useInternalLayoutEffect(() => {
    return callback(firstMountRef.current)
  }, deps)

  useInternalLayoutEffect(() => {
    firstMountRef.current = false
    return () => {
      firstMountRef.current = true
    }
  }, [])
}

export const useLayoutUpdateEffect: typeof useEffect = (callback, deps) => {
  useCustomLayoutEffect((firstMount) => {
    if (!firstMount) {
      return callback()
    }
  }, deps)
}
