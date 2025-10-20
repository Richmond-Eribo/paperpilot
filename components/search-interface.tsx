"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { PaperResults } from "@/components/paper-results"
import { SearchHeader } from "@/components/search/SearchHeader"
import { FloatingActions } from "@/components/search/FloatingActions"
import { fetchArxivPapers, type ArxivPaper } from "@/lib/arxiv"
import { useSelectedPapers } from "@/hooks/useSelectedPapers"

export function SearchInterface() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

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

  const handleSearch = () => {
    if (!query.trim()) return
    setSearchQuery(query)
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
    setSearchQuery(scenario)
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

        {searchResults.length > 0 && (
          <PaperResults
            papers={searchResults}
            selectedPapers={selectedIds}
            onTogglePaper={paperId => togglePaper(paperId, searchResults)}
            onSelectAll={() => selectAll(searchResults)}
            onClearAll={clearAll}
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

