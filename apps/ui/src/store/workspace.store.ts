import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface WorkspaceState {
  name: string,
  showConfigPanel: boolean
  showNodeConfigPanel: boolean
  updateName: (name: string) => void
  toggleConfigPanel: () => void
  toggleNodeConfigPanel: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist((set, get) => {
    return {
      name: 'Undefined',
      showConfigPanel: true,
      showNodeConfigPanel: false,
      updateName: (name: string) => {
        set({ name })
      },
      toggleConfigPanel: () => {
        set({ showConfigPanel: !get().showConfigPanel })
      },
      toggleNodeConfigPanel: () => {
        set({ showNodeConfigPanel: !get().showNodeConfigPanel })
      },
    }
  }, {
    name: 'WORKSPACE_STORE',
    storage: createJSONStorage(() => localStorage),
  }),
)
