"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Bell, RotateCcw, X, Calendar, Clock, ToggleLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Note {
    id: string
    title: string
    subject: string
    teacher: string
    date: string
    time: string
    content: string
    color: string
    hasReminder: boolean
    materials: string[]
}

const hardcodedNotes: Note[] = [
    {
        id: "1",
        title: "Math",
        subject: "Additional Mathematics",
        teacher: "Mr. Miller",
        date: "Sep 20, 2023",
        time: "09:00",
        content: "In this lesson we will solve inequalities of different degrees",
        color: "bg-red-500",
        hasReminder: true,
        materials: ["Math notebook", "Calculator", "Additional Mathematics book"],
    },
    {
        id: "2",
        title: "Physics",
        subject: "Quantum Mechanics",
        teacher: "Dr. Johnson",
        date: "Sep 21, 2023",
        time: "14:00",
        content: "Introduction to wave-particle duality and quantum states",
        color: "bg-blue-500",
        hasReminder: false,
        materials: ["Physics textbook", "Lab notebook", "Scientific calculator"],
    },
    {
        id: "3",
        title: "Chemistry",
        subject: "Organic Chemistry",
        teacher: "Ms. Wilson",
        date: "Sep 22, 2023",
        time: "10:30",
        content: "Study of carbon compounds and their reactions",
        color: "bg-green-500",
        hasReminder: true,
        materials: ["Chemistry set", "Periodic table", "Lab safety equipment"],
    },
]

export function NotesPage() {
    const [notes, setNotes] = useState(hardcodedNotes)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedNote, setSelectedNote] = useState<Note | null>(null)
    const [newNote, setNewNote] = useState({
        title: "",
        subject: "",
        teacher: "",
        content: "",
        date: "",
        time: "",
        hasReminder: false,
    })

    const handleCreateNote = () => {
        if (newNote.title && newNote.content) {
            const note: Note = {
                id: Date.now().toString(),
                title: newNote.title,
                subject: newNote.subject,
                teacher: newNote.teacher,
                date: newNote.date || new Date().toLocaleDateString(),
                time: newNote.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                content: newNote.content,
                color: "bg-purple-500",
                hasReminder: newNote.hasReminder,
                materials: [],
            }
            setNotes([...notes, note])
            setNewNote({
                title: "",
                subject: "",
                teacher: "",
                content: "",
                date: "",
                time: "",
                hasReminder: false,
            })
            setIsDialogOpen(false)
        }
    }

    const openNoteDetail = (note: Note) => {
        setSelectedNote(note)
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold text-gray-900">Notes</h1>
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

                {/* Search and Create */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input placeholder="Search notes..." className="pl-10 bg-gray-50 border-gray-200" />
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Quick Note
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create Quick Note</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Note title"
                                    value={newNote.title}
                                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                />
                                <Input
                                    placeholder="Subject"
                                    value={newNote.subject}
                                    onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                                />
                                <Input
                                    placeholder="Teacher"
                                    value={newNote.teacher}
                                    onChange={(e) => setNewNote({ ...newNote, teacher: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        value={newNote.date}
                                        onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                                    />
                                    <Input
                                        type="time"
                                        value={newNote.time}
                                        onChange={(e) => setNewNote({ ...newNote, time: e.target.value })}
                                    />
                                </div>
                                <Textarea
                                    placeholder="Write your note here..."
                                    value={newNote.content}
                                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                    rows={4}
                                />
                                <div className="flex items-center gap-2">
                                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-600">Set reminder</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateNote} className="bg-gray-900 hover:bg-gray-800">
                                        Create Note
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Notes Grid */}
            <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => openNoteDetail(note)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${note.color}`} />
                                    <span className="font-medium text-gray-900">{note.title}</span>
                                </div>
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </div>

                            <div className="space-y-2 mb-3">
                                <p className="text-sm text-gray-600">{note.subject}</p>
                                <p className="text-xs text-gray-500">{note.teacher}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {note.date}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {note.time}
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-700 line-clamp-3 mb-3">{note.content}</p>

                            {note.hasReminder && (
                                <Badge variant="secondary" className="text-xs">
                                    <Bell className="w-3 h-3 mr-1" />
                                    Reminder set
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Note Detail Dialog */}
            {selectedNote && (
                <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full ${selectedNote.color}`} />
                                    <DialogTitle>{selectedNote.title}</DialogTitle>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedNote(null)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{selectedNote.teacher}</span>
                                <span>•</span>
                                <span>{selectedNote.date}</span>
                                <span>•</span>
                                <span>{selectedNote.time}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <ToggleLeft className={`w-5 h-5 ${selectedNote.hasReminder ? "text-blue-500" : "text-gray-400"}`} />
                                <span className="text-sm text-gray-600">Reminder</span>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-700">{selectedNote.content}</p>
                            </div>

                            {selectedNote.materials.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Materials needed:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedNote.materials.map((material, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {material}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
