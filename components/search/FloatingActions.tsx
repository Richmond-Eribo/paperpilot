"use client"

import { Button } from "@/components/ui/button"

type Props = {
  count: number
  onPreview: () => void
  onSynthesize: () => void
}

export function FloatingActions({ count, onPreview, onSynthesize }: Props) {
  if (count <= 0) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex justify-center gap-3">
        {/* <Button
          variant="secondary"
          size="lg"
          onClick={onPreview}
          className="gap-2"
        >
          Preview {count}
        </Button> */}
        <Button size="lg" onClick={onSynthesize} className="gap-2">
          Synthesize {count}
        </Button>
      </div>
    </div>
  )
}
