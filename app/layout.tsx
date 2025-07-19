import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google" // Import Poppins font
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Header } from "@/components/layout/header"

// Import Poppins with the desired weight and subsets
const poppins = Poppins({
  subsets: ["latin"], // Add other subsets if needed
  weight: ["400", "500", "600", "700"], // Add other weights you need
})

export const metadata: Metadata = {
  title: "TalentFlow - AI-Powered Career Tools",
  description: "Enhance your career preparation with intelligent tools",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}> {/* Apply Poppins font class to body */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
