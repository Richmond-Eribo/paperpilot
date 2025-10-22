"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { SearchHeader } from "@/components/search/SearchHeader"
import { FloatingActions } from "@/components/search/FloatingActions"
import { fetchArxivPapers, type ArxivPaper } from "@/lib/arxiv"
import { useSelectedPapers } from "@/hooks/useSelectedPapers"
import AgentResponse from "@/components/agent-response"

export function SearchInterface() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [agentText, setAgentText] = useState("")
  const [agentLoading, setAgentLoading] = useState(false)
  const [agentError, setAgentError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const {
    data: searchResults = [],
    isLoading: isSearching,
    error: searchError,
  } = useQuery<ArxivPaper[]>({
    queryKey: ["arxiv-search", searchQuery],
    queryFn: () => fetchArxivPapers(searchQuery),
    enabled: searchQuery.length > 0,
  })

  const { selectedIds, togglePaper, selectAll, clearAll } = useSelectedPapers()

  const handleSearch = async (prompt?: string) => {
    const finalPrompt = (prompt ?? query).trim()
    if (!finalPrompt) return
    // Stop any ongoing stream
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setAgentText("")
    setAgentError(null)
    setAgentLoading(true)

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
        signal: ac.signal,
      })

      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => "Failed to connect to agent")
        throw new Error(msg || `Request failed: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        setAgentText(prev => prev + decoder.decode(value, { stream: true }))
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setAgentError(e?.message ?? "Agent request failed")
      }
    } finally {
      setAgentLoading(false)
    }
  }

  const handlePreview = () => {
    if (selectedIds.length === 0) return
    const qs = typeof window !== "undefined" ? window.location.search : ""
    router.push(`/preview${qs}`)
  }

  const handleSynthesize = () => {
    if (selectedIds.length === 0) return
    const qs = typeof window !== "undefined" ? window.location.search : ""
    router.push(`/preview${qs}${qs ? "&" : "?"}mode=synth`)
  }

  const handleDemoScenario = (scenario: string) => {
    setQuery(scenario)
    // kick off the same request flow as pressing the Search button
    handleSearch(scenario)
  }

  return (
    <>
      <div className="space-y-6">
        <SearchHeader
          query={query}
          isSearching={isSearching}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          onSelectScenario={handleDemoScenario}
          error={searchError}
        />

        {/* If you still want to show local ArXiv results, leave this; otherwise you can remove it. */}
        {/* {searchResults.length > 0 && (
          <PaperResults
            papers={searchResults}
            selectedPapers={selectedIds}
            onTogglePaper={paperId => togglePaper(paperId, searchResults)}
            onSelectAll={() => selectAll(searchResults)}
            onClearAll={clearAll}
          />
        )} */}

        {/* Agent response panel */}
        {(agentLoading || agentText || agentError) && (
          <AgentResponse
            markdown={agentText}
            loading={agentLoading}
            error={agentError}
          />
        )}
      </div>

      <FloatingActions
        count={selectedIds.length}
        onPreview={handlePreview}
        onSynthesize={handleSynthesize}
      />
    </>
  )
}

