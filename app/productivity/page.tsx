"use client"

import { useState } from "react"
import { BottomNav } from "@/components/navigation/bottom-nav"
import { OverviewPage } from "@/components/overview/overview-page"
import { CalendarPage } from "@/components/calendar/calendar-page"
import { NotesPage } from "@/components/notes/notes-page"
import { TodosPage } from "@/components/todos/todos-page"

export default function ProductivityApp() {
    const [activeTab, setActiveTab] = useState("overview")

    const renderPage = () => {
        switch (activeTab) {
            case "overview":
                return <OverviewPage />
            case "calendar":
                return <CalendarPage />
            case "notes":
                return <NotesPage />
            case "todos":
                return <TodosPage />
            default:
                return <OverviewPage />
        }
    }

    return (
        <div className="relative min-h-screen bg-gray-50">
            {renderPage()}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    )
}
