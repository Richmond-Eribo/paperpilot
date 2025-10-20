"use client"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Users, FileText } from "lucide-react"
import { PdfViewerModal } from "./pdf-viewer-modal"
import { useState } from "react"

interface Paper {
  id: string
  title: string
  summary: string
  authors: Array<{ name: string; affiliation?: string }>
  published: string
  updated: string
  categories: string[]
  pdfLink: string
  htmlLink: string
  doi?: string
  journalRef?: string
  comment?: string
}

interface PaperResultsProps {
  papers: Paper[]
  selectedPapers: string[]
  onTogglePaper: (paperId: string) => void
}

export function PaperResults({ papers, selectedPapers, onTogglePaper }: PaperResultsProps) {
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const handleViewPdf = (pdfUrl: string, title: string) => {
    setSelectedPdf({ url: pdfUrl, title })
    setPdfModalOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Search Results</h2>
          <span className="text-sm text-muted-foreground">
            {papers.length} paper{papers.length !== 1 ? "s" : ""} found
          </span>
        </div>

        <div className="space-y-3">
          {papers.map((paper) => (
            <Card
              key={paper.id}
              className={`p-4 transition-colors ${selectedPapers.includes(paper.id) ? "border-primary bg-accent/5" : ""}`}
            >
              <div className="flex gap-4">
                <div className="pt-1">
                  <Checkbox
                    checked={selectedPapers.includes(paper.id)}
                    onCheckedChange={() => onTogglePaper(paper.id)}
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-lg leading-tight text-balance">{paper.title}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewPdf(paper.pdfLink, paper.title)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="View PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <a
                        href={paper.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center justify-center h-8 w-8"
                        title="View on ArXiv"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{paper.authors.map((a) => a.name).join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(paper.published)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{paper.summary}</p>

                  <div className="flex gap-2 flex-wrap">
                    {paper.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>

                  {(paper.doi || paper.journalRef) && (
                    <div className="text-xs text-muted-foreground space-y-1 pt-1">
                      {paper.doi && (
                        <div>
                          <span className="font-medium">DOI:</span> {paper.doi}
                        </div>
                      )}
                      {paper.journalRef && (
                        <div>
                          <span className="font-medium">Published in:</span> {paper.journalRef}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedPdf && (
        <PdfViewerModal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          pdfUrl={selectedPdf.url}
          title={selectedPdf.title}
        />
      )}
    </>
  )
}
