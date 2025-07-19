"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Check, X, Loader2 } from "lucide-react"

interface AISuggestionCardProps {
  suggestions: string[]
  isLoading: boolean
  onApplySuggestion: (suggestion: string) => void
}

export function AISuggestionCard({ suggestions, isLoading, onApplySuggestion }: AISuggestionCardProps) {
  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-700">Generating AI suggestions...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          AI Suggestions
          <Badge variant="secondary" className="text-xs">
            {suggestions.length} suggestions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
            <p className="text-sm text-gray-700 mb-2">{suggestion}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApplySuggestion(suggestion)}
                className="gap-1 text-xs"
              >
                <Check className="w-3 h-3" />
                Apply
              </Button>
              <Button size="sm" variant="ghost" className="gap-1 text-xs">
                <X className="w-3 h-3" />
                Dismiss
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
