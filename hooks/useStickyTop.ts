"use client"

import { useEffect, useRef, useState } from "react"

export function useStickyTop() {
  const ref = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const top = ref.current?.getBoundingClientRect().top ?? 1
      setStuck(top <= 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return { ref, stuck }
}
