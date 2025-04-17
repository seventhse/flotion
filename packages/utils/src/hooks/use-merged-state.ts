import { isFunction, noop } from "lodash-es"
import { useState } from "react"
import { useEvent } from "./use-event"
import { useLayoutUpdateEffect } from "./use-layout-effect"

type Updater<T> = (updater: T | ((origin: T) => T)) => void

function hasValue(val: unknown) {
  return val !== undefined
}

export const useMergedState = <T, R = T>(
  defaultStateValue: T,
  options?: {
    defaultValue?: T | (() => T)
    value?: T
    onChange?: (value: T, prevValue: T) => void
    postState?: (value: T) => T
  }
): [R, Updater<T>] => {
  const { defaultValue, value, onChange, postState } = options || {}

  const [innerValue, setInnerValue] = useState<T>(() => {
    if (hasValue(value)) {
      return value
    }
    if (hasValue(defaultValue)) {
      return isFunction(defaultValue) ? defaultValue() : defaultValue
    }
    return isFunction(defaultStateValue) ? defaultStateValue() : defaultStateValue
  })

  const mergedValue = hasValue(value) ? value : innerValue
  const postMergedValue = postState ? postState(mergedValue) : mergedValue

  const onChangeFn = useEvent(onChange || noop)

  const [prevValue, setPrevValue] = useState<[T]>([mergedValue])

  useLayoutUpdateEffect(() => {
    const prev = prevValue[0]
    if (innerValue !== prev) {
      onChangeFn(innerValue, prev)
    }
  }, [prevValue])

  useLayoutUpdateEffect(() => {
    if (hasValue(value)) {
      setInnerValue(value as T)
    }
  }, [value])

  const triggerChange: Updater<T> = useEvent((updater) => {
    setInnerValue(updater)
    setPrevValue([mergedValue])
  })

  return [postMergedValue as unknown as R, triggerChange]
}
