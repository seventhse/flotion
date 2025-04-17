import { useShallow } from 'zustand/shallow'
import { useWorkspaceStore } from '~/store/workspace.store'
import { CanvasWrapper } from './components/canvas/canvas-wrapper'
import { PanelWrapper } from './components/common/panel-wrapper'
import { CanvasConfigPanel } from './components/config-panel/canvas-config-panel'
import { NodeConfigPanel } from './components/resource-panel/node-config-panel'
import { WorkspaceHeader } from './components/workspace-header'

export function Workspace() {

  const { showConfigPanel, showNodeConfigPanel } = useWorkspaceStore(useShallow(state => ({
    showConfigPanel: state.showConfigPanel,
    showNodeConfigPanel: state.showNodeConfigPanel,
  })))

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <WorkspaceHeader />
      <main className="h-full flex-auto overflow-hidden flex">
        <PanelWrapper
          visible={showNodeConfigPanel}
        >
          <NodeConfigPanel />
        </PanelWrapper>
        <main className="flex-auto h-full overflow-auto grid-bg relative">
          <CanvasWrapper>

          </CanvasWrapper>
        </main>
        <PanelWrapper
          visible={showConfigPanel}
        >
          <CanvasConfigPanel />
        </PanelWrapper>
      </main>
    </div>
  )
}
