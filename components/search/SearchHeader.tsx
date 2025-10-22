"use client"

import { ArrowUp, Loader2, Paperclip, Plus } from "lucide-react"
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
        <div className="relative flex-1">
          {/* Left icon */}
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Paperclip className="h-5 w-5" />
          </span>
          {/* Main input */}
          <Input
            placeholder="Ask a question…"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSearch()}
            className="h-14 rounded-xl pl-12 pr-40 text-base"
          />
          {/* Right-side inline actions */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={onSearch}
              disabled={isSearching}
              aria-label="Submit query"
            >
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </Button>
          </div>
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
