import type { HTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '~/utils/utils'

export interface PanelWrapperProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  visible: boolean
}

export function PanelWrapper({ visible, className, children, ...restProps }: PanelWrapperProps) {
  return (
    <div
      className={cn(
        'bg-background h-full overflow-hidden border-border border-r border-l',
        'transition-transform duration-200',
        'data-[show=true]:translate-x-0 data-[show=true]:min-w-[320px]',
        'data-[show=false]:translate-x-[100%] data-[show=false]:w-0 data-[show=true]:p-3',
        className,
      )}
      data-show={visible}
      {...restProps}
    >
      {children}
    </div>
  )
}
