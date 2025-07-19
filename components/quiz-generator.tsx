"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, CheckCircle, XCircle, RotateCcw } from "lucide-react"
import { generateQuiz, submitQuizFeedback } from "@/lib/quiz-actions"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizGeneratorProps {
  onBack: () => void
}

export function QuizGenerator({ onBack }: QuizGeneratorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [quizParams, setQuizParams] = useState({
    jobRole: "",
    companyName: "",
    questionCount: "5",
  })

  const handleGenerateQuiz = async () => {
    if (!quizParams.jobRole || !quizParams.companyName) return

    setIsGenerating(true)
    try {
      const generatedQuiz = await generateQuiz(
        quizParams.jobRole,
        quizParams.companyName,
        Number.parseInt(quizParams.questionCount),
      )
      setQuiz(generatedQuiz)
      setUserAnswers(new Array(generatedQuiz.length).fill(-1))
      setIsDialogOpen(false)
      setCurrentQuestion(0)
      setShowResults(false)
    } catch (error) {
      console.error("Error generating quiz:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestion] = answerIndex
    setUserAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleFinishQuiz()
    }
  }

  const handleFinishQuiz = async () => {
    const score = userAnswers.reduce((acc, answer, index) => {
      return acc + (answer === quiz[index].correctAnswer ? 1 : 0)
    }, 0)

    // Submit feedback to Supabase
    await submitQuizFeedback({
      jobRole: quizParams.jobRole,
      companyName: quizParams.companyName,
      score,
      totalQuestions: quiz.length,
      userAnswers,
      correctAnswers: quiz.map((q) => q.correctAnswer),
    })

    setShowResults(true)
  }

  const resetQuiz = () => {
    setQuiz([])
    setUserAnswers([])
    setCurrentQuestion(0)
    setShowResults(false)
    setQuizParams({ jobRole: "", companyName: "", questionCount: "5" })
  }

  const score = userAnswers.reduce((acc, answer, index) => {
    return acc + (answer === quiz[index]?.correctAnswer ? 1 : 0)
  }, 0)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h2 className="text-2xl font-bold">AI Quiz Generator</h2>
      </div>

      {quiz.length === 0 && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create Your Custom Quiz</CardTitle>
            <CardDescription>
              Generate personalized interview questions based on your target role and company
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Play className="w-4 h-4" />
                  Generate Quiz
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Quiz Configuration</DialogTitle>
                  <DialogDescription>Provide details to generate your personalized quiz</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jobRole">Job Role</Label>
                    <Input
                      id="jobRole"
                      placeholder="e.g., Software Engineer, Product Manager"
                      value={quizParams.jobRole}
                      onChange={(e) => setQuizParams((prev) => ({ ...prev, jobRole: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g., Google, Microsoft, Apple"
                      value={quizParams.companyName}
                      onChange={(e) => setQuizParams((prev) => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="questionCount">Number of Questions</Label>
                    <Select
                      value={quizParams.questionCount}
                      onValueChange={(value) => setQuizParams((prev) => ({ ...prev, questionCount: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Questions</SelectItem>
                        <SelectItem value="10">10 Questions</SelectItem>
                        <SelectItem value="15">15 Questions</SelectItem>
                        <SelectItem value="20">20 Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={isGenerating || !quizParams.jobRole || !quizParams.companyName}
                    className="w-full"
                  >
                    {isGenerating ? "Generating Quiz..." : "Generate Quiz"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {quiz.length > 0 && !showResults && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  Question {currentQuestion + 1} of {quiz.length}
                </CardTitle>
                <CardDescription>
                  {quizParams.jobRole} at {quizParams.companyName}
                </CardDescription>
              </div>
              <Badge variant="outline">
                Progress: {currentQuestion + 1}/{quiz.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium">{quiz[currentQuestion]?.question}</div>
            <RadioGroup
              value={userAnswers[currentQuestion]?.toString()}
              onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
            >
              {quiz[currentQuestion]?.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button onClick={handleNextQuestion} disabled={userAnswers[currentQuestion] === -1}>
                {currentQuestion === quiz.length - 1 ? "Finish Quiz" : "Next Question"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Quiz Results</CardTitle>
              <CardDescription>
                Your performance on the {quizParams.jobRole} quiz for {quizParams.companyName}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold mb-2">
                {score}/{quiz.length}
              </div>
              <div className="text-lg text-muted-foreground mb-4">{Math.round((score / quiz.length) * 100)}% Score</div>
              <Button onClick={resetQuiz} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Take Another Quiz
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Results & Explanations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {quiz.map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {userAnswers[index] === question.correctAnswer ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium mb-2">
                        Question {index + 1}: {question.question}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Your answer: {question.options[userAnswers[index]]}
                      </div>
                      {userAnswers[index] !== question.correctAnswer && (
                        <div className="text-sm text-green-600 mb-2">
                          Correct answer: {question.options[question.correctAnswer]}
                        </div>
                      )}
                      <div className="text-sm bg-blue-50 p-3 rounded">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
