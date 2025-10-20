import { SearchInterface } from "@/components/search-interface"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4 py-12">
            <h1 className="text-5xl md:text-6xl font-bold text-balance tracking-tight">
              Research Paper Synthesis Agent
            </h1>
            <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
              Search and synthesize academic papers from arXiv using AI. Get comprehensive analysis with proper
              citations in seconds.
            </p>
          </div>

          <SearchInterface />
        </div>
      </main>
    </div>
  )
}
