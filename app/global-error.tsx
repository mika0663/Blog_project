"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Something went wrong!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    An unexpected error occurred. Please try again.
                  </p>
                  {error.digest && (
                    <p className="text-xs text-muted-foreground font-mono">
                      Error ID: {error.digest}
                    </p>
                  )}
                  <Button onClick={reset} className="w-full">
                    Try again
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

