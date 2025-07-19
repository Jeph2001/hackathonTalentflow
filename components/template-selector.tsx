"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TemplateSelectorProps {
  selectedTemplate: string
  onTemplateSelect: (template: string) => void
}

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and professional design",
    preview: "/images/resume_1.jpeg",
    category: "Professional",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional resume format",
    preview: "/images/resume_2.jpeg",
    category: "Traditional",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Colorful and unique design",
    preview: "/images/resume_3.jpeg",
    category: "Creative",
  },
]

export function TemplateSelector({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${selectedTemplate === template.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
              }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            <CardContent className="p-3">
              <div className="aspect-[4/5] bg-gray-100 rounded mb-2 flex items-center justify-center">
                <img
                  src={template.preview || "/placeholder.svg"}
                  alt={template.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{template.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{template.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
