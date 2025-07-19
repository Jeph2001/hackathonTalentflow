"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, RotateCcw, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface CalendarEvent {
    id: string
    title: string
    subject: string
    time: string
    duration: string
    color: string
    type: "homework" | "exam" | "lecture" | "study"
}

const hardcodedEvents: CalendarEvent[] = [
    {
        id: "1",
        title: "Math",
        subject: "Mr. Miller",
        time: "9:00",
        duration: "1h",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        type: "lecture",
    },
    {
        id: "2",
        title: "Politics-economics",
        subject: "Fr. Stark",
        time: "10:15",
        duration: "1h 30m",
        color: "bg-green-100 text-green-800 border-green-200",
        type: "homework",
    },
    {
        id: "3",
        title: "Deutsch",
        subject: "Dr. Schmidt",
        time: "14:00",
        duration: "45m",
        color: "bg-green-100 text-green-800 border-green-200",
        type: "exam",
    },
    {
        id: "4",
        title: "Physics",
        subject: "Mr. Johnson",
        time: "15:00",
        duration: "1h 15m",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        type: "homework",
    },
    {
        id: "5",
        title: "Chemistry",
        subject: "Ms. Wilson",
        time: "16:30",
        duration: "1h",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        type: "lecture",
    },
    {
        id: "6",
        title: "Learning",
        subject: "Self study",
        time: "19:00",
        duration: "2h",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        type: "study",
    },
    {
        id: "7",
        title: "Book return",
        subject: "Library",
        time: "12:30",
        duration: "30m",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        type: "homework",
    },
]

const timeSlots = [
    "8:00",
    "9:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
]

export function CalendarPage() {
    const [currentDate, setCurrentDate] = useState("Sep 20")
    const [viewMode, setViewMode] = useState<"Day" | "Week">("Day")

    const getEventPosition = (time: string) => {
        const hour = Number.parseInt(time.split(":")[0])
        const minute = Number.parseInt(time.split(":")[1])
        const baseHour = 8
        return ((hour - baseHour) * 60 + minute) * (60 / 60) // 60px per hour
    }

    const getEventHeight = (duration: string) => {
        const parts = duration.split(" ")
        let totalMinutes = 0

        parts.forEach((part) => {
            if (part.includes("h")) {
                totalMinutes += Number.parseInt(part) * 60
            } else if (part.includes("m")) {
                totalMinutes += Number.parseInt(part)
            }
        })

        return (totalMinutes / 60) * 60 // 60px per hour
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
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

                {/* Date Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === "Day" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                Day
                            </button>
                            <button
                                className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === "Week" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                Week
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <ChevronLeft className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                            <span className="text-lg font-semibold text-gray-900">{currentDate}</span>
                            <ChevronRight className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                        </div>
                    </div>

                    <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create event
                    </Button>
                </div>
            </div>

            {/* Calendar Content */}
            <div className="flex-1 overflow-auto">
                <div className="relative">
                    {/* Time Grid */}
                    <div className="flex">
                        {/* Time Labels */}
                        <div className="w-16 flex-shrink-0">
                            {timeSlots.map((time, index) => (
                                <div key={time} className="h-15 flex items-start justify-end pr-2 text-xs text-gray-500">
                                    {index === 0 ? "" : time}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="flex-1 relative border-l border-gray-200">
                            {/* Grid Lines */}
                            {timeSlots.map((time, index) => (
                                <div key={time} className="h-15 border-b border-gray-100" />
                            ))}

                            {/* Events */}
                            {hardcodedEvents.map((event) => {
                                const top = getEventPosition(event.time)
                                const height = getEventHeight(event.duration)

                                return (
                                    <div
                                        key={event.id}
                                        className={`absolute left-2 right-2 rounded-lg border p-2 ${event.color}`}
                                        style={{
                                            top: `${top}px`,
                                            height: `${height}px`,
                                            minHeight: "40px",
                                        }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{event.title}</div>
                                                <div className="text-xs opacity-75 truncate">{event.subject}</div>
                                                <div className="text-xs opacity-75">
                                                    {event.time} - {event.duration}
                                                </div>
                                            </div>
                                            {event.type === "homework" && (
                                                <Badge variant="secondary" className="ml-2 text-xs bg-green-200 text-green-800">
                                                    Homework
                                                </Badge>
                                            )}
                                            {event.type === "exam" && (
                                                <Badge variant="secondary" className="ml-2 text-xs bg-red-200 text-red-800">
                                                    Exam
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Current Time Indicator */}
                            <div
                                className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
                                style={{ top: `${getEventPosition("14:30")}px` }}
                            >
                                <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 -mt-0.5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
