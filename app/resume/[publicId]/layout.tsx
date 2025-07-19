import React from 'react'

export default function PublicResumeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <main className="max-w-4xl mx-auto py-8">{children}</main>
        </div>
    )
}
