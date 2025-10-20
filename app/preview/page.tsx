"use client"

import { useMemo } from "react"
import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

type SelectedPaper = {
  id: string
  title: string
  pdfLink: string
  htmlLink: string
  authors: string[]
  published: string
}

export default function PreviewPage() {
  const router = useRouter()

  // URL state: selected IDs, optional metadata map, mode (preview|synth)
  const [selectedIds, setSelectedIds] = useQueryState(
    "sel",
    parseAsArrayOf(parseAsString).withDefault([])
  )
  const [meta] = useQueryState("meta", parseAsString.withDefault(""))
  const [mode] = useQueryState("mode", parseAsString.withDefault("preview"))

  const metaMap = useMemo(() => {
    if (!meta) return {} as Record<string, SelectedPaper>
    try {
      return JSON.parse(decodeURIComponent(meta)) as Record<
        string,
        SelectedPaper
      >
    } catch {
      return {} as Record<string, SelectedPaper>
    }
  }, [meta])

  const papers = useMemo(() => {
    const isUrl = (s: string) => {
      try {
        const u = new URL(s)
        return u.protocol === "http:" || u.protocol === "https:"
      } catch {
        return false
      }
    }

    return selectedIds.map(id => {
      const m = metaMap[id]
      if (m) return m
      // Fallback: if the id itself looks like a URL, treat it as a direct pdf URL
      if (isUrl(id)) {
        return {
          id,
          title: id,
          pdfLink: id,
          htmlLink: "",
          authors: [],
          published: "",
        }
      }
      // Unknown: show placeholder without a URL
      return {
        id,
        title: id,
        pdfLink: "",
        htmlLink: "",
        authors: [],
        published: "",
      }
    })
  }, [selectedIds, metaMap])

  const clearSelection = () => {
    setSelectedIds([])
    // Clear metadata by setting meta to empty string using URL API
    const params = new URLSearchParams(window.location.search)
    params.delete("meta")
    params.delete("mode")
    const qs = params.toString()
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}`
    // Replace to avoid history spam
    window.history.replaceState(null, "", next)
  }

  const heading = mode === "synth" ? "Synthesize" : "Preview"

  return (
    <div className="h-[calc(100vh-2rem)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-lg font-semibold">
            {heading} ({papers.length})
          </h1>
        </div>
        <div className="text-sm text-muted-foreground">
          Selection synced in URL via Nuqs
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="rounded-md border">
        <ResizablePanel defaultSize={60} minSize={35}>
          <div className="h-full overflow-auto p-2">
            {papers.length === 0 ? (
              <Card className="p-6 text-sm text-muted-foreground">
                No documents selected.
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {papers.map(p => (
                  <Card key={p.id} className="h-[60vh] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                      <div className="text-sm font-medium truncate pr-2">
                        {p.title || p.id}
                      </div>
                      {p.pdfLink && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={p.pdfLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Open
                          </a>
                        </Button>
                      )}
                    </div>
                    {p.pdfLink ? (
                      <iframe
                        src={p.pdfLink}
                        className="w-full h-full border-0"
                        title={`PDF ${p.title || p.id}`}
                      />
                    ) : (
                      <div className="p-6 text-sm text-muted-foreground">
                        No PDF link available for this item.
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={25}>
          <div className="h-full p-3 space-y-3 overflow-auto">
            <h2 className="text-base font-semibold">
              {mode === "synth" ? "Synthesis" : "AI Notes"}
            </h2>
            <Card className="p-4 text-sm space-y-3">
              <p className="text-muted-foreground">
                {mode === "synth"
                  ? "This panel will combine insights across selected papers to generate a synthesis. Hook up your server action or AWS Bedrock endpoint here."
                  : "This panel is a placeholder for AI-generated notes. Trigger your server action or API route here to generate content based on the selected PDFs."}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    alert(
                      `Generate ${
                        mode === "synth" ? "synthesis" : "summary"
                      } for ${papers.length} docs`
                    )
                  }
                >
                  Generate {mode === "synth" ? "Synthesis" : "Summary"}
                </Button>
                <Button variant="outline" onClick={clearSelection}>
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
