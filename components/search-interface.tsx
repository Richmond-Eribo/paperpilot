"use client"

import { useState } from "react"
import { Search, Sparkles } from "lucide-react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { PaperResults } from "@/components/paper-results"
import { SynthesisView } from "@/components/synthesis-view"
import { DemoScenarios } from "@/components/demo-scenarios"

interface ArxivPaper {
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

function parseArxivXML(xmlText: string): ArxivPaper[] {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, "text/xml")
  const entries = xmlDoc.getElementsByTagName("entry")
  const papers: ArxivPaper[] = []

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]

    // Extract basic info
    const id = entry.getElementsByTagName("id")[0]?.textContent || ""
    const title = entry.getElementsByTagName("title")[0]?.textContent?.trim() || ""
    const summary = entry.getElementsByTagName("summary")[0]?.textContent?.trim() || ""
    const published = entry.getElementsByTagName("published")[0]?.textContent || ""
    const updated = entry.getElementsByTagName("updated")[0]?.textContent || ""

    // Extract authors
    const authorElements = entry.getElementsByTagName("author")
    const authors: Array<{ name: string; affiliation?: string }> = []
    for (let j = 0; j < authorElements.length; j++) {
      const name = authorElements[j].getElementsByTagName("name")[0]?.textContent || ""
      const affiliationEl = authorElements[j].getElementsByTagNameNS("http://arxiv.org/schemas/atom", "affiliation")[0]
      const affiliation = affiliationEl?.textContent || undefined
      authors.push({ name, affiliation })
    }

    // Extract categories
    const categoryElements = entry.getElementsByTagName("category")
    const categories: string[] = []
    for (let j = 0; j < categoryElements.length; j++) {
      const term = categoryElements[j].getAttribute("term")
      if (term) categories.push(term)
    }

    // Extract links
    const linkElements = entry.getElementsByTagName("link")
    let pdfLink = ""
    let htmlLink = ""
    for (let j = 0; j < linkElements.length; j++) {
      const title = linkElements[j].getAttribute("title")
      const href = linkElements[j].getAttribute("href") || ""
      if (title === "pdf") {
        pdfLink = href
      } else if (linkElements[j].getAttribute("rel") === "alternate") {
        htmlLink = href
      }
    }

    // Extract optional fields
    const doiEl = entry.getElementsByTagNameNS("http://arxiv.org/schemas/atom", "doi")[0]
    const doi = doiEl?.textContent || undefined

    const journalRefEl = entry.getElementsByTagNameNS("http://arxiv.org/schemas/atom", "journal_ref")[0]
    const journalRef = journalRefEl?.textContent || undefined

    const commentEl = entry.getElementsByTagNameNS("http://arxiv.org/schemas/atom", "comment")[0]
    const comment = commentEl?.textContent || undefined

    papers.push({
      id,
      title,
      summary,
      authors,
      published,
      updated,
      categories,
      pdfLink,
      htmlLink,
      doi,
      journalRef,
      comment,
    })
  }

  return papers
}

async function fetchArxivPapers(query: string): Promise<ArxivPaper[]> {
  const response = await fetch(
    `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=300`,
  )

  if (!response.ok) {
    throw new Error("Failed to search papers")
  }

  const xmlText = await response.text()
  return parseArxivXML(xmlText)
}

async function synthesizePapers(paperIds: string[]): Promise<any> {
  const response = await fetch("/api/synthesize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paperIds }),
  })

  if (!response.ok) {
    throw new Error("Failed to synthesize papers")
  }

  return response.json()
}

export function SearchInterface() {
  const [query, setQuery] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPapers, setSelectedPapers] = useState<string[]>([])

  const {
    data: searchResults = [],
    isLoading: isSearching,
    error: searchError,
  } = useQuery({
    queryKey: ["arxiv-search", searchQuery],
    queryFn: () => fetchArxivPapers(searchQuery),
    enabled: searchQuery.length > 0,
  })

  const {
    mutate: synthesize,
    data: synthesisData,
    isPending: isSynthesizing,
    error: synthesisError,
  } = useMutation({
    mutationFn: synthesizePapers,
  })

  const handleSearch = () => {
    if (!query.trim()) return
    setSearchQuery(query)
  }

  const handleSynthesize = () => {
    if (selectedPapers.length === 0) return
    synthesize(selectedPapers)
  }

  const handleDemoScenario = (scenario: string) => {
    setQuery(scenario)
    setSearchQuery(scenario)
  }

  const error = searchError || synthesisError

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search ArXiv papers... (e.g., 'transformer architecture', 'quantum computing')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          <DemoScenarios onSelectScenario={handleDemoScenario} />

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error instanceof Error ? error.message : "An error occurred"}
            </div>
          )}
        </div>
      </Card>

      {searchResults.length > 0 && (
        <>
          <PaperResults
            papers={searchResults}
            selectedPapers={selectedPapers}
            onTogglePaper={(paperId) => {
              setSelectedPapers((prev) =>
                prev.includes(paperId) ? prev.filter((id) => id !== paperId) : [...prev, paperId],
              )
            }}
          />

          {selectedPapers.length > 0 && (
            <div className="flex justify-center">
              <Button size="lg" onClick={handleSynthesize} disabled={isSynthesizing} className="gap-2">
                <Sparkles className="w-4 h-4" />
                {isSynthesizing
                  ? "Synthesizing..."
                  : `Synthesize ${selectedPapers.length} Paper${selectedPapers.length > 1 ? "s" : ""}`}
              </Button>
            </div>
          )}
        </>
      )}

      {synthesisData && <SynthesisView synthesis={synthesisData.synthesis} />}
    </div>
  )
}
