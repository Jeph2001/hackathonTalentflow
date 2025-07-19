"use client"
import { Calendar, FileText, CheckSquare, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const tabs = [
        { id: "overview", label: "Overview", icon: BarChart3 },
        { id: "calendar", label: "Calendar", icon: Calendar },
        { id: "notes", label: "Notes", icon: FileText },
        { id: "todos", label: "To-do's", icon: CheckSquare },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
            {/* Curved background */}
            <div className="relative w-full max-w-[475px]">
                <svg viewBox="0 0 375 80" className="w-full h-20 fill-white drop-shadow-lg" preserveAspectRatio="none">
                    <path d="M0,20 Q187.5,0 375,20 L375,80 L0,80 Z" />
                </svg>

                {/* Navigation items */}
                <div className="absolute inset-0 flex items-center justify-center px-12 pb-2 gap-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={cn(
                                    "flex flex-col items-center gap-1 px-3 py-2 transition-all duration-200",
                                    isActive ? "bg-gray-900 text-white shadow-md rounded-[100px]" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-xs font-medium">{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
