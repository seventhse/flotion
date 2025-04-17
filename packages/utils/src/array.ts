import { isArray } from "lodash-es"

export function safeArray<T>(val: T | T[] | null | undefined): T[] {
  if (val == null) {
    return []
  }
  return isArray(val) ? val : [val]
}
