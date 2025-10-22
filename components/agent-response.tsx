"use client"

import { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Loader2 } from "lucide-react"

type Props = {
  markdown: string
  loading?: boolean
  error?: string | null
}

type Section = { title: string | null; content: string }

function splitSections(md: string): Section[] {
  const text = md?.trim() ?? ""
  if (!text) return []

  const lines = text.split(/\r?\n/)
  const sections: Section[] = []
  let currentTitle: string | null = null
  let current: string[] = []
  let inFence = false

  const push = () => {
    if (current.length > 0) {
      sections.push({ title: currentTitle, content: current.join("\n").trim() })
    }
    current = []
  }

  for (const line of lines) {
    const fenceMatch = line.match(/^```/)
    if (fenceMatch) inFence = !inFence

    if (!inFence && /^(#{1,3})\s+/.test(line)) {
      // new section
      push()
      currentTitle = line.replace(/^#{1,3}\s+/, "").trim()
      continue
    }
    current.push(line)
  }
  push()

  // If all sections have null titles, just return one unnamed section
  const hasTitled = sections.some(s => s.title)
  if (!hasTitled) return [{ title: null, content: text }]
  return sections
}

export function AgentResponse({ markdown, loading, error }: Props) {
  const sections = useMemo(() => splitSections(markdown), [markdown])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
    } catch (e) {
      // no-op
    }
  }

  if (error) {
    return (
      <Card className="p-4 border-destructive/30 bg-destructive/5">
        <div className="text-sm text-destructive">{error}</div>
      </Card>
    )
  }

  if (loading && !markdown) {
    return (
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating…</span>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-2/3 rounded bg-muted/60" />
          <div className="h-4 w-5/6 rounded bg-muted/50" />
          <div className="h-4 w-3/5 rounded bg-muted/40" />
        </div>
      </Card>
    )
  }

  if (!markdown) return null

  return (
    <div className="space-y-4">
      {/* Outline + actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            {sections.length > 1 ? (
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex items-center gap-2 pr-2">
                  {sections
                    .filter(s => !!s.title)
                    .map((s, i) => (
                      <Badge
                        key={`${s.title}-${i}`}
                        variant="secondary"
                        className="shrink-0"
                      >
                        {s.title}
                      </Badge>
                    ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-sm text-muted-foreground">Response</div>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-2" /> Copy
          </Button>
        </div>
      </Card>

      {/* Section cards */}
      {sections.map((sec, idx) => (
        <Card key={idx} className="p-5">
          {sec.title ? (
            <>
              <h3 className="text-base font-semibold leading-6">{sec.title}</h3>
              <Separator className="my-3" />
            </>
          ) : null}
          <div className="prose prose-invert max-w-none prose-pre:mt-3 prose-pre:border prose-pre:border-border">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {sec.content}
            </ReactMarkdown>
            {loading && idx === sections.length - 1 ? (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Streaming…</span>
              </div>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default AgentResponse
