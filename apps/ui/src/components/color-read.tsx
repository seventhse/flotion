import { Pipette } from 'lucide-react'
import { useCallback } from 'react'
import { Button } from './button'

interface ColorReadProps {
  onRead?: (color: string) => void
}

export function ColorRead({ onRead }: ColorReadProps) {
  const handleColorRead = useCallback(async () => {
    // 检查浏览器是否支持 EyeDropper API
    if (!('EyeDropper' in window)) {
      console.warn('EyeDropper API is not supported in this browser')
      return
    }

    try {
      const eyeDropper = new (window as any).EyeDropper()
      const result = await eyeDropper.open()
      // 转换为小写的hex格式
      const hexColor = result.sRGBHex.toLowerCase()
      onRead?.(hexColor)
    }
    catch (e) {
      // 用户取消或其他错误
      console.warn('Color picking was cancelled or failed:', e)
    }
  }, [onRead])

  return (
    <div>
      <Button
        size="icon"
        variant="outline"
        onClick={handleColorRead}
        title="Pick color from screen"
      >
        <Pipette size={16} />
      </Button>
    </div>
  )
}
