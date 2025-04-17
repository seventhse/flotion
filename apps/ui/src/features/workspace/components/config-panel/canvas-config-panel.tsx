import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/tabs'
import { CanvasConfigContent } from './canvas-config-content'

export function CanvasConfigPanel() {
  return (
    <Tabs defaultValue="canvas">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="canvas">Canvas Config</TabsTrigger>
        <TabsTrigger value="animate">Animate Config</TabsTrigger>
      </TabsList>
      <TabsContent value="canvas">
        <CanvasConfigContent />
      </TabsContent>
      <TabsContent value="animate">
        animate
      </TabsContent>
    </Tabs>
  )
}
