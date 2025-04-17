import { PanelLeft, PanelRight } from 'lucide-react'
import { Button } from '~/components/button'
import { ThemeSwitch } from '~/layout/theme-switch'
import { useWorkspaceStore } from '~/store/workspace.store'
import { Input } from '~/components/input'

export function WorkspaceHeader() {
  const workspaceState = useWorkspaceStore()

  return (
    <div className="flex-auto z-50 top-0 left-0 w-full p-3 bg-background flex items-center border-b border-border">
      <div className="mr-auto flex items-center gap-x-3">
        <Button
          className="data-[active=true]:text-primary"
          variant="outline"
          size="icon"
          data-active={workspaceState.showNodeConfigPanel}
          onClick={workspaceState.toggleNodeConfigPanel}
          title='Open node config panel'
        >
          <PanelLeft />
        </Button>
        <Input
          value={workspaceState.name}
          onValueChange={workspaceState.updateName}
        />
      </div>
      <div className="ml-auto flex items-center gap-x-3">
        <ThemeSwitch />
        <Button
          className="data-[active=true]:text-primary"
          variant="outline"
          size="icon"
          data-active={workspaceState.showConfigPanel}
          onClick={workspaceState.toggleConfigPanel}
          title='Open canvas config panel'
        >
          <PanelRight />
        </Button>
      </div>
    </div>
  )
}
