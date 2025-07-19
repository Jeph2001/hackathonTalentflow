"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, FileText, Download, Edit, Sparkles } from "lucide-react"
import { generateCoverLetter, saveCoverLetter } from "@/lib/cover-letter-actions"

interface CoverLetterGeneratorProps {
  onBack: () => void
}

export function CoverLetterGenerator({ onBack }: CoverLetterGeneratorProps) {
  const [formData, setFormData] = useState({
    coverLetterType: "",
    companyName: "",
    jobDesignation: "",
    content: "",
  })
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedLetter, setEditedLetter] = useState("")

  const handleGenerate = async () => {
    if (!formData.companyName || !formData.jobDesignation || !formData.content) return

    setIsGenerating(true)
    try {
      const letter = await generateCoverLetter(formData)
      setGeneratedLetter(letter)
      setEditedLetter(letter)
    } catch (error) {
      console.error("Error generating cover letter:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    try {
      await saveCoverLetter({
        ...formData,
        generatedContent: isEditing ? editedLetter : generatedLetter,
      })
      alert("Cover letter saved successfully!")
    } catch (error) {
      console.error("Error saving cover letter:", error)
    }
  }

  const handleDownloadPDF = () => {
    const content = isEditing ? editedLetter : generatedLetter
    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `cover-letter-${formData.companyName}-${formData.jobDesignation}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold">Cover Letter Generator</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Cover Letter Details
            </CardTitle>
            <CardDescription>Provide your information to generate a professional cover letter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="coverLetterType">Cover Letter Type</Label>
              <Select
                value={formData.coverLetterType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, coverLetterType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cover letter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traditional">Traditional</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="e.g., Google, Microsoft, Apple"
                value={formData.companyName}
                onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="jobDesignation">Job Designation</Label>
              <Input
                id="jobDesignation"
                placeholder="e.g., Senior Software Engineer"
                value={formData.jobDesignation}
                onChange={(e) => setFormData((prev) => ({ ...prev, jobDesignation: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="content">Your Background & Experience</Label>
              <Textarea
                id="content"
                placeholder="Describe your relevant experience, skills, and why you're interested in this position..."
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.companyName || !formData.jobDesignation || !formData.content}
              className="w-full gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "Generating Cover Letter..." : "Generate Cover Letter"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Cover Letter</CardTitle>
                <CardDescription>
                  {generatedLetter ? "Your AI-generated cover letter" : "Your cover letter will appear here"}
                </CardDescription>
              </div>
              {generatedLetter && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-2">
                    <Edit className="w-4 h-4" />
                    {isEditing ? "Preview" : "Edit"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-2 bg-transparent">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!generatedLetter ? (
              <div className="text-center text-muted-foreground py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Fill out the form and click "Generate Cover Letter" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {isEditing ? (
                  <Textarea
                    value={editedLetter}
                    onChange={(e) => setEditedLetter(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {isEditing ? editedLetter : generatedLetter}
                    </pre>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleSave} variant="outline" className="flex-1 bg-transparent">
                    Save to Database
                  </Button>
                  <Button onClick={handleDownloadPDF} className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    Download as PDF
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
