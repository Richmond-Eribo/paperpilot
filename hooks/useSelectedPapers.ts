"use client"

import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs"
import type { ArxivPaper } from "@/lib/arxiv"

export type SelectedPaper = {
  id: string
  title: string
  pdfLink: string
  htmlLink: string
  authors: string[]
  published: string
}

export function useSelectedPapers() {
  const [selectedIds, setSelectedIds] = useQueryState(
    "sel",
    parseAsArrayOf(parseAsString).withDefault([])
  )
  const [selectedMeta, setSelectedMeta] = useQueryState(
    "meta",
    parseAsString.withDefault("")
  )

  const getMetaMap = (): Record<string, SelectedPaper> => {
    if (!selectedMeta) return {}
    try {
      return JSON.parse(decodeURIComponent(selectedMeta)) as Record<
        string,
        SelectedPaper
      >
    } catch {
      return {}
    }
  }

  const setMetaMap = (map: Record<string, SelectedPaper>) => {
    setSelectedMeta(encodeURIComponent(JSON.stringify(map)))
  }

  const togglePaper = (paperId: string, results: ArxivPaper[]) => {
    setSelectedIds(prev => {
      const exists = prev.includes(paperId)
      const nextIds = exists
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]

      const map = getMetaMap()
      if (exists) {
        delete map[paperId]
      } else {
        const src = results.find(p => p.id === paperId)
        if (src) {
          map[paperId] = {
            id: src.id,
            title: src.title,
            pdfLink: src.pdfLink,
            htmlLink: src.htmlLink,
            authors: src.authors.map(a => a.name),
            published: src.published,
          }
        }
      }
      setMetaMap(map)

      return nextIds
    })
  }

  const selectAll = (results: ArxivPaper[]) => {
    const allIds = results.map(p => p.id)
    setSelectedIds(allIds)
    const map: Record<string, SelectedPaper> = {}
    for (const src of results) {
      map[src.id] = {
        id: src.id,
        title: src.title,
        pdfLink: src.pdfLink,
        htmlLink: src.htmlLink,
        authors: src.authors.map(a => a.name),
        published: src.published,
      }
    }
    setMetaMap(map)
  }

  const clearAll = () => {
    setSelectedIds([])
    setSelectedMeta("")
  }

  return {
    selectedIds,
    togglePaper,
    selectAll,
    clearAll,
  }
}
