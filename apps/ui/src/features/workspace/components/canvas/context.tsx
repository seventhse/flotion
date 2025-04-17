/* eslint-disable react-refresh/only-export-components */
import type { BasicTarget, Fn } from '@llm-flow/utils'
import type { PanzoomObject, PanzoomOptions } from '@panzoom/panzoom'
import type { PropsWithChildren, RefObject } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { usePanzoom } from './hooks/use-panzoom'
import { noop } from 'lodash-es'

export interface CanvasWrapperContextValue {
  panzoom: RefObject<PanzoomObject | null>
  centered: Fn
  targetEl: BasicTarget<HTMLElement>
}

export const CanvasWrapperContext = createContext<CanvasWrapperContextValue>({
  panzoom: { current: null },
  centered: noop,
  targetEl: null
})

export interface CanvasWrapperProvideProps extends PanzoomOptions {
  targetEl: BasicTarget<HTMLElement>
}

export function CanvasWrapperProvide({ children, targetEl, ...options }: PropsWithChildren<CanvasWrapperProvideProps>) {
  const { panzoom, centered } = usePanzoom(targetEl, options)

  const value = useMemo(() => {
    return {
      panzoom,
      centered,
      targetEl
    }
  }, [panzoom, centered, targetEl])

  return (
    <CanvasWrapperContext.Provider
      value={value}
    >
      {children}
    </CanvasWrapperContext.Provider>
  )
}

export function useCanvasWrapperContext() {
  return useContext(CanvasWrapperContext)
}
