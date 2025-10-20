"use client"

import { Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DemoScenarios } from "@/components/demo-scenarios"
import { useStickyTop } from "@/hooks/useStickyTop"

type Props = {
  query: string
  isSearching: boolean
  onQueryChange: (v: string) => void
  onSearch: () => void
  onSelectScenario: (scenario: string) => void
  error?: unknown
}

export function SearchHeader({
  query,
  isSearching,
  onQueryChange,
  onSearch,
  onSelectScenario,
  error,
}: Props) {
  const { ref, stuck } = useStickyTop()

  return (
    <Card
      ref={ref}
      className={`p-6 sticky top-0 z-10 ${
        stuck ? "rounded-none border-b shadow-sm" : ""
      }`}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search ArXiv papers... (e.g., 'transformer architecture', 'quantum computing')"
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={onSearch} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        <DemoScenarios onSelectScenario={onSelectScenario} />

        {error ? (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error instanceof Error ? error.message : "An error occurred"}
          </div>
        ) : null}
      </div>
    </Card>
  )
}
