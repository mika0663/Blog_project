"use client"

import { PageTransition } from "./page-transition"

export function ClientPageTransition({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}

