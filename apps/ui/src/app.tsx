import { StrictMode } from 'react'
import { Workspace } from './features/workspace/workspace'
import { AppLayout } from './layout/app-layout'

export function App() {
  return (
    <StrictMode>
      <AppLayout>
        <Workspace />
      </AppLayout>
    </StrictMode>
  )
}
