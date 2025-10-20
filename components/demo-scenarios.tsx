"use client"

import { Button } from "@/components/ui/button"
import { Lightbulb } from "lucide-react"

interface DemoScenariosProps {
  onSelectScenario: (scenario: string) => void
}

export function DemoScenarios({ onSelectScenario }: DemoScenariosProps) {
  const scenarios = ["transformer architecture", "quantum computing algorithms", "reinforcement learning applications"]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Lightbulb className="w-4 h-4" />
        <span>Try:</span>
      </div>
      {scenarios.map((scenario) => (
        <Button
          key={scenario}
          variant="outline"
          size="sm"
          onClick={() => onSelectScenario(scenario)}
          className="text-xs"
        >
          {scenario}
        </Button>
      ))}
    </div>
  )
}
