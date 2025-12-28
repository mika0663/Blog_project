import { Suspense } from "react"
import HomeContent from "./home-content"

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="font-serif text-2xl font-bold tracking-tight">Editorial</div>
          </div>
        </div>
        <main className="flex-1 container py-12 md:py-20">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="space-y-4 animate-pulse">
              <div className="h-16 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/2" />
            </div>
            <div className="grid gap-12 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-video bg-muted rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
