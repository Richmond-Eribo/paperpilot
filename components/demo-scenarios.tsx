"use client"

import type { ComponentType } from "react"
import { Button } from "@/components/ui/button"
import { Figma, Image, LayoutPanelTop, Upload, UserRound } from "lucide-react"

interface DemoScenariosProps {
  onSelectScenario: (scenario: string) => void
}

export function DemoScenarios({ onSelectScenario }: DemoScenariosProps) {
  const scenarios: {
    label: string
  }[] = [
    { label: "Machine Learning" },
    { label: "Data Analysis" },
    { label: "Cancer Research" },
    { label: "Clinical Trials" },
    { label: "AI Ethics" },
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {scenarios.map(({ label }) => (
        <Button
          key={label}
          variant="outline"
          size="sm"
          onClick={() => onSelectScenario(label)}
          className="text-xs rounded-full"
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
