import { isUndefined } from "lodash-es"
import { useState } from "react"

export function useToggle(): [
  boolean,
  {
    toggle: (val?: boolean) => void
    open: () => void
    close: () => void
  }
] {
  const [state, setState] = useState<boolean>(false)

  const toggle = (val?: boolean) => {
    setState((pre) => (isUndefined(val) ? !pre : val))
  }

  const open = () => {
    setState(true)
  }

  const close = () => {
    setState(false)
  }

  return [
    state,
    {
      toggle,
      open,
      close
    }
  ]
}
