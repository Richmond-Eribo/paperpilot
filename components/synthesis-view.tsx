"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check } from "lucide-react"
import { useState } from "react"

interface SynthesisViewProps {
  synthesis: {
    summary: string
    themes: Array<{
      title: string
      description: string
      papers: string[]
    }>
    citations: string[]
  }
}

export function SynthesisView({ synthesis }: SynthesisViewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const text = `
Summary:
${synthesis.summary}

Key Themes:
${synthesis.themes.map((theme) => `\n${theme.title}\n${theme.description}`).join("\n")}

Citations:
${synthesis.citations.join("\n")}
    `.trim()

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const text = `
Research Synthesis Report
========================

Summary:
${synthesis.summary}

Key Themes:
${synthesis.themes.map((theme) => `\n${theme.title}\n${"-".repeat(theme.title.length)}\n${theme.description}`).join("\n\n")}

Citations:
${synthesis.citations.map((c, i) => `${i + 1}. ${c}`).join("\n")}
    `.trim()

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "synthesis-report.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Synthesis Results</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <p className="text-muted-foreground leading-relaxed">{synthesis.summary}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Key Themes</h3>
          <div className="space-y-4">
            {synthesis.themes.map((theme, index) => (
              <Card key={index} className="p-4 bg-muted/30">
                <h4 className="font-semibold mb-2">{theme.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{theme.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {theme.papers.map((paperId) => (
                    <span key={paperId} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                      {paperId}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Citations (APA)</h3>
          <div className="space-y-2 font-mono text-sm">
            {synthesis.citations.map((citation, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded border border-border">
                {citation}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
