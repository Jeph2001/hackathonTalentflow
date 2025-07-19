"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { EnhancedDashboard } from "@/components/enhanced-dashboard"

function ProductivityPlatform() {
  const [activeModule, setActiveModule] = useState<"quiz" | "cover-letter" | "resume" | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6">
        <EnhancedDashboard />
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <ProtectedRoute>
      <ProductivityPlatform />
    </ProtectedRoute>
  )
}
