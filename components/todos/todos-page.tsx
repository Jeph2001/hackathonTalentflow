"use client"

import { useState } from "react"
import { Plus, MoreHorizontal, Bell, RotateCcw, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"

interface TodoItem {
    id: string
    title: string
    subject: string
    dueDate: string
    priority: "high" | "medium" | "low"
    progress?: string
    color: string
}

interface TodoColumn {
    id: string
    title: string
    count: number
    items: TodoItem[]
}

const initialTodos: TodoColumn[] = [
    {
        id: "todo",
        title: "To-do",
        count: 4,
        items: [
            {
                id: "1",
                title: "Presentation",
                subject: "Chemistry",
                dueDate: "25",
                priority: "high",
                color: "bg-green-100 text-green-800",
            },
            {
                id: "2",
                title: "Solve the equations",
                subject: "Math",
                dueDate: "26",
                priority: "medium",
                color: "bg-red-100 text-red-800",
            },
            {
                id: "3",
                title: "Read chapter 4",
                subject: "History",
                dueDate: "Ad",
                priority: "low",
                color: "bg-yellow-100 text-yellow-800",
            },
            {
                id: "4",
                title: "Presentation",
                subject: "Chemistry",
                dueDate: "30",
                priority: "medium",
                color: "bg-green-100 text-green-800",
            },
        ],
    },
    {
        id: "doing",
        title: "Doing",
        count: 5,
        items: [
            {
                id: "5",
                title: "Presentation",
                subject: "Chemistry",
                dueDate: "26",
                priority: "high",
                progress: "6/10",
                color: "bg-green-100 text-green-800",
            },
            {
                id: "6",
                title: "Study the materials",
                subject: "History",
                dueDate: "30",
                priority: "medium",
                progress: "1/3",
                color: "bg-yellow-100 text-yellow-800",
            },
            {
                id: "7",
                title: "Study the materials",
                subject: "Chemistry",
                dueDate: "Ad",
                priority: "low",
                progress: "4/6",
                color: "bg-green-100 text-green-800",
            },
            {
                id: "8",
                title: "Solve the equations",
                subject: "Math",
                dueDate: "1d",
                priority: "high",
                progress: "2/5",
                color: "bg-red-100 text-red-800",
            },
            {
                id: "9",
                title: "Read chapter 3",
                subject: "Research",
                dueDate: "1d",
                priority: "medium",
                color: "bg-blue-100 text-blue-800",
            },
        ],
    },
    {
        id: "done",
        title: "Done",
        count: 14,
        items: [
            {
                id: "10",
                title: "Read chapter 2",
                subject: "Chemistry",
                dueDate: "Completed",
                priority: "medium",
                color: "bg-green-100 text-green-800",
            },
            {
                id: "11",
                title: "Presentation",
                subject: "History",
                dueDate: "Completed",
                priority: "high",
                color: "bg-yellow-100 text-yellow-800",
            },
        ],
    },
]

export function TodosPage() {
    const [todos, setTodos] = useState(initialTodos)
    const [filter, setFilter] = useState("All tasks")

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result

        if (!destination) return

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return
        }

        const sourceColumn = todos.find((col) => col.id === source.droppableId)
        const destColumn = todos.find((col) => col.id === destination.droppableId)

        if (!sourceColumn || !destColumn) return

        const sourceItems = Array.from(sourceColumn.items)
        const destItems = sourceColumn === destColumn ? sourceItems : Array.from(destColumn.items)

        const [movedItem] = sourceItems.splice(source.index, 1)

        if (sourceColumn === destColumn) {
            sourceItems.splice(destination.index, 0, movedItem)
        } else {
            destItems.splice(destination.index, 0, movedItem)
        }

        const newTodos = todos.map((column) => {
            if (column.id === source.droppableId) {
                return {
                    ...column,
                    items: sourceItems,
                    count: sourceItems.length,
                }
            }
            if (column.id === destination.droppableId && column !== sourceColumn) {
                return {
                    ...column,
                    items: destItems,
                    count: destItems.length,
                }
            }
            return column
        })

        setTodos(newTodos)
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-500"
            case "medium":
                return "bg-yellow-500"
            case "low":
                return "bg-green-500"
            default:
                return "bg-gray-500"
        }
    }

    const getColumnColor = (columnId: string) => {
        switch (columnId) {
            case "todo":
                return "bg-blue-50 border-blue-200"
            case "doing":
                return "bg-yellow-50 border-yellow-200"
            case "done":
                return "bg-green-50 border-green-200"
            default:
                return "bg-gray-50 border-gray-200"
        }
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold text-gray-900">To-do's</h1>
                        <span className="text-sm text-gray-500">32 tasks</span>
                    </div>
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

                {/* Filters and Create */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                            {filter}
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create task
                    </Button>
                </div>
            </div>

            {/* Todo Columns */}
            <div className="flex-1 overflow-auto p-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="flex gap-6 h-full">
                        {todos.map((column) => (
                            <div key={column.id} className="flex-1 min-w-80">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-gray-900">{column.title}</h3>
                                        <Badge variant="secondary" className="text-xs">
                                            {column.count}
                                        </Badge>
                                    </div>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`rounded-lg border-2 border-dashed p-4 min-h-96 transition-colors ${snapshot.isDraggingOver ? "border-blue-400 bg-blue-50" : getColumnColor(column.id)
                                                }`}
                                        >
                                            <div className="space-y-3">
                                                {column.items.map((item, index) => (
                                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <Card
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`cursor-move transition-shadow ${snapshot.isDragging ? "shadow-lg rotate-2" : "hover:shadow-md"
                                                                    }`}
                                                            >
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
                                                                            <Badge className={`text-xs ${item.color} border-0`}>{item.subject}</Badge>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs text-gray-500">{item.dueDate}</span>
                                                                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                                                        </div>
                                                                    </div>

                                                                    <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>

                                                                    {item.progress && (
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                                                <div
                                                                                    className="bg-blue-500 h-1.5 rounded-full transition-all"
                                                                                    style={{
                                                                                        width: `${(Number.parseInt(item.progress.split("/")[0]) / Number.parseInt(item.progress.split("/")[1])) * 100}%`,
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <span className="text-xs text-gray-500">{item.progress}</span>
                                                                        </div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            </div>
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </div>
    )
}
