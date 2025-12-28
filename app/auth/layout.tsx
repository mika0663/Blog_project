import type React from "react"

// Auth layout - marks all auth routes as dynamic to prevent static generation
export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

