"use client"

import { useState } from "react"
import { QuickToolsGrid } from "@/components/quick-tools/quick-tools-grid"
import { UserDashboard } from "@/components/dashboard/user-dashboard"
import { QuizGenerator } from "@/components/quiz-generator"
import { CoverLetterGenerator } from "@/components/cover-letter-generator"
import { ResumeBuilder } from "@/components/resume-builder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, Zap, BarChart3 } from "lucide-react"

export function EnhancedDashboard() {
    const [activeModule, setActiveModule] = useState<"quiz" | "cover-letter" | "resume" | null>(null)

    const handleNavigate = (module: "quiz" | "cover-letter" | "resume") => {
        setActiveModule(module)
    }

    const handleBack = () => {
        setActiveModule(null)
    }

    if (activeModule) {
        switch (activeModule) {
            case "quiz":
                return <QuizGenerator onBack={handleBack} />
            case "cover-letter":
                return <CoverLetterGenerator onBack={handleBack} />
            case "resume":
                return <ResumeBuilder onBack={handleBack} />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto p-6">
                <Tabs defaultValue="quick-tools" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="quick-tools" className="gap-2">
                            <Zap className="w-4 h-4" />
                            Quick Tools
                        </TabsTrigger>
                        <TabsTrigger value="dashboard" className="gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="quick-tools" className="space-y-6">
                        <QuickToolsGrid onNavigate={handleNavigate} />
                    </TabsContent>

                    <TabsContent value="dashboard" className="space-y-6">
                        <UserDashboard />
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <div className="text-center py-12">
                            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Analytics Coming Soon</h3>
                            <p className="text-gray-500">Detailed insights and performance analytics will be available soon.</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
