import type { PropsWithChildren } from 'react'

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {children}
    </div>
  )
}
