"use client"

import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs"
import { useEffect, useMemo, useState } from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PreviewPage() {
  const router = useRouter()
  const [selected, setSelected] = useQueryState(
    "sel",
    parseAsArrayOf(parseAsString).withDefault([])
  )

  // Helper to derive PDF URLs if `sel` already contains full pdf URLs. If IDs, user may adapt to map IDs to URLs.
  const pdfs = useMemo(() => {
    return selected.map(v => ({ id: v, url: v }))
  }, [selected])

  return (
    <div className="h-[calc(100vh-2rem)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-lg font-semibold">Preview ({pdfs.length})</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          Selection synced in URL via nuqs
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="rounded-md border">
        <ResizablePanel defaultSize={60} minSize={35}>
          <div className="h-full overflow-auto p-2">
            {pdfs.length === 0 ? (
              <Card className="p-6 text-sm text-muted-foreground">
                No documents selected.
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {pdfs.map(p => (
                  <Card key={p.id} className="h-[60vh] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                      <div className="text-sm font-medium truncate pr-2">
                        {p.id}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Open
                        </a>
                      </Button>
                    </div>
                    <iframe
                      src={p.url}
                      className="w-full h-full border-0"
                      title={`PDF ${p.id}`}
                    />
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={25}>
          <div className="h-full p-3 space-y-3 overflow-auto">
            <h2 className="text-base font-semibold">AI Notes</h2>
            <Card className="p-4 text-sm space-y-3">
              <p className="text-muted-foreground">
                This panel is a placeholder for AI-generated synthesis or notes.
                Trigger your server action or API route here to generate content
                based on the selected PDFs.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    alert(`Generate AI summary for ${selected.length} docs`)
                  }
                >
                  Generate Summary
                </Button>
                <Button variant="outline" onClick={() => setSelected([])}>
                  Clear Selection
                </Button>
              </div>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
