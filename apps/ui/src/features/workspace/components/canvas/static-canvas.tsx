import { useEffect, useRef } from 'react'

export function StaticCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isComponentMounted = useRef(false)

  useEffect(() => {
    const wrapper = wrapperRef.current

    if (!wrapper) {

    }
  })

  return (
    <div className="size-full"></div>
  )
}
