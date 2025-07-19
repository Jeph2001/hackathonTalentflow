"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Save, Share2, Plus, Trash2, Eye, ExternalLink } from "lucide-react"
import { ResumePreview } from "./resume-preview"
import { AISuggestionCard } from "./ai-suggestion-card"
import { TemplateSelector } from "./template-selector"
import { saveResume, generateAISuggestions, createPublicLink, exportToGoogleDocs } from "@/lib/resume-actions"

interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa?: string
}

interface ResumeData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    website?: string
    linkedin?: string
  }
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
  certifications: string[]
  languages: string[]
}

interface ResumeBuilderProps {
  onBack: () => void
  resumeId?: string
}

export function ResumeBuilder({ onBack, resumeId }: ResumeBuilderProps) {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
  })

  const [selectedTemplate, setSelectedTemplate] = useState("modern")
  const [layout, setLayout] = useState("left")
  const [columnCount, setColumnCount] = useState(2)
  const [columnWidth, setColumnWidth] = useState([60, 40])
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [publicLink, setPublicLink] = useState("")
  const [activeSection, setActiveSection] = useState("personal")

  const handlePersonalInfoChange = (field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }))
  }

  const handleSummaryChange = (value: string) => {
    setResumeData((prev) => ({ ...prev, summary: value }))
    generateSuggestions("summary", value)
  }

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    }
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }))
  }

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }))
  }

  const removeExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }))
  }

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
    }
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }))
  }

  const updateEducation = (id: string, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }))
  }

  const removeEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }))
  }

  const addSkill = (skill: string) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill.trim()],
      }))
    }
  }

  const removeSkill = (skill: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const generateSuggestions = async (section: string, content: string) => {
    if (!content.trim()) return

    setIsGeneratingSuggestions(true)
    try {
      const suggestions = await generateAISuggestions(section, content, resumeData)
      setAiSuggestions(suggestions)
    } catch (error) {
      console.error("Error generating suggestions:", error)
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  const handleSaveResume = async () => {
    setIsSaving(true)
    try {
      await saveResume({
        resumeData,
        templateId: selectedTemplate,
        layout,
        columnCount,
        columnWidth,
      })
      alert("Resume saved successfully!")
    } catch (error) {
      console.error("Error saving resume:", error)
      alert("Failed to save resume")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreatePublicLink = async () => {
    try {
      const link = await createPublicLink(resumeData, selectedTemplate)
      setPublicLink(link)
      navigator.clipboard.writeText(link)
      alert("Public link created and copied to clipboard!")
    } catch (error) {
      console.error("Error creating public link:", error)
    }
  }

  const handleExportToGoogleDocs = async () => {
    try {
      await exportToGoogleDocs(resumeData)
    } catch (error) {
      console.error("Error exporting to Google Docs:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Resume Builder</h1>
              <p className="text-sm text-gray-600">Create your professional resume</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCreatePublicLink} className="gap-2 bg-transparent">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="outline" onClick={handleExportToGoogleDocs} className="gap-2 bg-transparent">
              <ExternalLink className="w-4 h-4" />
              Export to Google Docs
            </Button>
            <Button onClick={handleSaveResume} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Resume"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Editor */}
          <div className="lg:col-span-2 space-y-4 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customize</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pages" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pages">Pages</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pages" className="space-y-6">
                    {/* Layout Section */}
                    <div>
                      <h3 className="font-medium mb-3">Layout</h3>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={layout === "top" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLayout("top")}
                          className="h-16 flex-col"
                        >
                          <div className="w-6 h-4 bg-current opacity-20 mb-1"></div>
                          <span className="text-xs">Top</span>
                        </Button>
                        <Button
                          variant={layout === "left" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLayout("left")}
                          className="h-16 flex-col"
                        >
                          <div className="flex gap-1">
                            <div className="w-2 h-4 bg-current opacity-20"></div>
                            <div className="w-3 h-4 bg-current opacity-20"></div>
                          </div>
                          <span className="text-xs mt-1">Left</span>
                        </Button>
                        <Button
                          variant={layout === "right" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLayout("right")}
                          className="h-16 flex-col"
                        >
                          <div className="flex gap-1">
                            <div className="w-3 h-4 bg-current opacity-20"></div>
                            <div className="w-2 h-4 bg-current opacity-20"></div>
                          </div>
                          <span className="text-xs mt-1">Right</span>
                        </Button>
                      </div>
                    </div>

                    {/* Column Section */}
                    <div>
                      <h3 className="font-medium mb-3">Column</h3>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <Button
                          variant={columnCount === 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setColumnCount(1)}
                        >
                          1 Column
                        </Button>
                        <Button
                          variant={columnCount === 2 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setColumnCount(2)}
                        >
                          2 Column
                        </Button>
                      </div>

                      {columnCount === 2 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Column Width</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Left</span>
                              <span>Right</span>
                            </div>
                            <Slider
                              value={columnWidth}
                              onValueChange={setColumnWidth}
                              max={100}
                              min={0}
                              step={5}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>{columnWidth[0]}%</span>
                              <span>{100 - columnWidth[0]}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="templates">
                    <TemplateSelector selectedTemplate={selectedTemplate} onTemplateSelect={setSelectedTemplate} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Resume Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resume Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeSection} onValueChange={setActiveSection}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={resumeData.personalInfo.fullName}
                          onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={resumeData.personalInfo.location}
                          onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={resumeData.personalInfo.website}
                          onChange={(e) => handlePersonalInfoChange("website", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={resumeData.personalInfo.linkedin}
                          onChange={(e) => handlePersonalInfoChange("linkedin", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea
                        id="summary"
                        rows={4}
                        value={resumeData.summary}
                        onChange={(e) => handleSummaryChange(e.target.value)}
                        placeholder="Write a brief professional summary..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Work Experience</h3>
                      <Button onClick={addExperience} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Experience
                      </Button>
                    </div>

                    {resumeData.experience.map((exp, index) => (
                      <Card key={exp.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Experience {index + 1}</h4>
                          <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Position</Label>
                            <Input
                              value={exp.position}
                              onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                              disabled={exp.current}
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <Label>Description</Label>
                          <Textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                            placeholder="Describe your responsibilities and achievements..."
                          />
                        </div>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="education" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Education</h3>
                      <Button onClick={addEducation} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Education
                      </Button>
                    </div>

                    {resumeData.education.map((edu, index) => (
                      <Card key={edu.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Education {index + 1}</h4>
                          <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Institution</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Field of Study</Label>
                            <Input
                              value={edu.field}
                              onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>GPA (Optional)</Label>
                            <Input value={edu.gpa} onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)} />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-4">
                    <div>
                      <Label>Skills</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Add a skill and press Enter"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              addSkill(e.currentTarget.value)
                              e.currentTarget.value = ""
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="gap-1">
                            {skill}
                            <button onClick={() => removeSkill(skill)}>
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <AISuggestionCard
                suggestions={aiSuggestions}
                isLoading={isGeneratingSuggestions}
                onApplySuggestion={(suggestion) => {
                  // Apply suggestion logic here
                  console.log("Applying suggestion:", suggestion)
                }}
              />
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Resume Preview
                </CardTitle>
                <Badge variant="outline">{selectedTemplate} template</Badge>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
                <ResumePreview
                  resumeData={resumeData}
                  template={selectedTemplate}
                  layout={layout}
                  columnCount={columnCount}
                  columnWidth={columnWidth}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
