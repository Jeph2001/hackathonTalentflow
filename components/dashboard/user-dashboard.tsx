"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, BookOpen, User, TrendingUp } from "lucide-react"
import { getUserResumes } from "@/lib/resume-actions"
import { getUserCoverLetters } from "@/lib/cover-letter-actions"
import { getUserQuizHistory } from "@/lib/quiz-actions"
import { useAuth } from "@/lib/auth-context"

export function UserDashboard() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState<any[]>([])
  const [coverLetters, setCoverLetters] = useState<any[]>([])
  const [quizHistory, setQuizHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [resumesData, coverLettersData, quizData] = await Promise.all([
          getUserResumes(),
          getUserCoverLetters(),
          getUserQuizHistory(),
        ])

        setResumes(resumesData || [])
        setCoverLetters(coverLettersData || [])
        setQuizHistory(quizData || [])
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return <div className="p-6">Loading your dashboard...</div>
  }

  const averageQuizScore =
    quizHistory.length > 0
      ? Math.round(
          quizHistory.reduce((acc, quiz) => acc + (quiz.score / quiz.total_questions) * 100, 0) / quizHistory.length,
        )
      : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.user_metadata?.full_name || "User"}!</h1>
          <p className="text-muted-foreground">Here's your productivity overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cover Letters</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coverLetters.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizHistory.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quiz Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageQuizScore}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Tabs defaultValue="resumes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumes">Recent Resumes</TabsTrigger>
          <TabsTrigger value="cover-letters">Cover Letters</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz History</TabsTrigger>
        </TabsList>

        <TabsContent value="resumes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Resumes</CardTitle>
              <CardDescription>Manage and edit your saved resumes</CardDescription>
            </CardHeader>
            <CardContent>
              {resumes.length === 0 ? (
                <p className="text-muted-foreground">No resumes created yet. Start building your first resume!</p>
              ) : (
                <div className="space-y-3">
                  {resumes.slice(0, 5).map((resume) => (
                    <div key={resume.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{resume.title || "Untitled Resume"}</h4>
                        <p className="text-sm text-muted-foreground">
                          Updated {new Date(resume.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{resume.template_id}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cover-letters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Cover Letters</CardTitle>
              <CardDescription>View and manage your generated cover letters</CardDescription>
            </CardHeader>
            <CardContent>
              {coverLetters.length === 0 ? (
                <p className="text-muted-foreground">No cover letters created yet. Generate your first cover letter!</p>
              ) : (
                <div className="space-y-3">
                  {coverLetters.slice(0, 5).map((letter) => (
                    <div key={letter.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">
                          {letter.job_designation} at {letter.company_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(letter.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{letter.cover_letter_type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz History</CardTitle>
              <CardDescription>Track your interview preparation progress</CardDescription>
            </CardHeader>
            <CardContent>
              {quizHistory.length === 0 ? (
                <p className="text-muted-foreground">
                  No quizzes taken yet. Start practicing with AI-generated quizzes!
                </p>
              ) : (
                <div className="space-y-3">
                  {quizHistory.slice(0, 5).map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">
                          {quiz.job_role} at {quiz.company_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Taken {new Date(quiz.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={quiz.score / quiz.total_questions >= 0.7 ? "default" : "secondary"}>
                        {quiz.score}/{quiz.total_questions} ({Math.round((quiz.score / quiz.total_questions) * 100)}%)
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
