"use client"

import { Bell, RotateCcw, TrendingUp, Calendar, CheckSquare, FileText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { EnhancedDashboard } from "../enhanced-dashboard"
import { QuickToolsGrid } from "../quick-tools/quick-tools-grid"

export function OverviewPage() {
    const stats = {
        totalTasks: 32,
        completedTasks: 14,
        inProgress: 5,
        upcomingEvents: 6,
        totalNotes: 12,
    }

    const recentActivity = [
        { type: "task", title: "Completed Math homework", time: "2 hours ago", color: "text-green-600" },
        { type: "note", title: "Added Chemistry notes", time: "4 hours ago", color: "text-blue-600" },
        { type: "event", title: "Physics class scheduled", time: "1 day ago", color: "text-purple-600" },
    ]

    const upcomingDeadlines = [
        { title: "Math presentation", subject: "Mathematics", dueDate: "Tomorrow", priority: "high" },
        { title: "Chemistry report", subject: "Chemistry", dueDate: "2 days", priority: "medium" },
        { title: "History essay", subject: "History", dueDate: "1 week", priority: "low" },
    ]

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-900">Overview</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-orange-600 font-medium">Refund deadline in 26m</span>
                        <RotateCcw className="w-4 h-4 text-gray-400" />
                        <Bell className="w-4 h-4 text-gray-400" />
                        <Avatar className="w-8 h-8">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-row gap-4 p-4">
                {/* Left Content Section */}
                <div className="flex-1 overflow-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Stats Cards */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                                <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.completedTasks}</div>
                                <p className="text-xs text-muted-foreground">
                                    {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completion rate
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Events Today</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                                <p className="text-xs text-muted-foreground">3 more than yesterday</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Notes</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalNotes}</div>
                                <p className="text-xs text-muted-foreground">+1 from yesterday</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                        {/* Progress Overview */}
                        <QuickToolsGrid onNavigate={() => { }} />
                    </div>
                </div>
            </div>
        </div>
    )
}
