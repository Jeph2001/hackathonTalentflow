"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, FileText, Mail, BookOpen, Trophy, ExternalLink, TrendingUp, Calendar, Target } from "lucide-react"
import { motion, useAnimation } from "framer-motion"
import { getUserQuizStats } from "@/lib/quiz-stats-actions"
import { useAuth } from "@/lib/auth-context"

interface QuizStats {
    totalQuizzes: number
    averageScore: number
    totalQuestions: number
    correctAnswers: number
    recentQuizDate?: string
}

interface QuickToolCardProps {
    title: string
    description: string
    icon: React.ReactNode
    gradient: string
    textColor?: string
    onClick: () => void
    badge?: string
    external?: boolean
    children?: React.ReactNode
}

function QuickToolCard({
    title,
    description,
    icon,
    gradient,
    textColor = "text-white",
    onClick,
    badge,
    external = false,
    children,
}: QuickToolCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <Card
                className={`relative overflow-hidden cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${gradient}`}
                onClick={onClick}
            >
                <CardContent className="p-6 h-full flex flex-col justify-between min-h-[160px]">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 rounded-lg bg-white/20 backdrop-blur-sm ${textColor}`}>{icon}</div>
                        {badge && (
                            <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                                {badge}
                            </Badge>
                        )}
                        {external && <ExternalLink className={`w-4 h-4 ${textColor} opacity-70`} />}
                    </div>

                    <div>
                        <h3 className={`font-semibold text-lg mb-2 ${textColor}`}>{title}</h3>
                        <p className={`text-sm opacity-90 ${textColor} leading-relaxed`}>{description}</p>
                    </div>

                    {children}
                </CardContent>
            </Card>
        </motion.div>
    )
}

function QuizScoreCard() {
    const [stats, setStats] = useState<QuizStats | null>(null)
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const controls = useAnimation()

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return

            try {
                const quizStats = await getUserQuizStats()
                setStats(quizStats)

                // Trigger animation when data loads
                controls.start({
                    scale: [1, 1.1, 1],
                    transition: { duration: 0.6, ease: "easeInOut" },
                })
            } catch (error) {
                console.error("Error fetching quiz stats:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [user, controls])

    const scorePercentage = stats ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0
    const daysAgo = stats?.recentQuizDate
        ? Math.floor((Date.now() - new Date(stats.recentQuizDate).getTime()) / (1000 * 60 * 60 * 24))
        : null

    return (
        <QuickToolCard
            title="Quiz Scoring"
            description=""
            icon={<Trophy className="w-6 h-6" />}
            gradient="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600"
            onClick={() => { }}
        >
            <div className="mt-4 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    </div>
                ) : stats && stats.totalQuizzes > 0 ? (
                    <>
                        {/* Score Display */}
                        <motion.div className="flex items-center justify-between" animate={controls}>
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-white">
                                    {stats.correctAnswers}/{stats.totalQuestions}
                                </div>
                                <div className="text-sm text-white/80">({scorePercentage}%)</div>
                            </div>
                            <div className="flex items-center gap-1 text-white/80">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm">
                                    {stats.averageScore > 70 ? "+" : ""}
                                    {Math.round(stats.averageScore - 70)}%
                                </span>
                            </div>
                        </motion.div>

                        {/* Progress Bar */}
                        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                            <motion.div
                                className="h-full bg-white rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${scorePercentage}%` }}
                                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            />
                        </div>

                        {/* Stats */}
                        <div className="flex justify-between text-xs text-white/80">
                            <span>{stats.totalQuizzes} quizzes taken</span>
                            {daysAgo !== null && <span>{daysAgo === 0 ? "Today" : `${daysAgo} days ago`}</span>}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <Target className="w-8 h-8 text-white/60 mx-auto mb-2" />
                        <p className="text-sm text-white/80">No quizzes taken yet</p>
                        <p className="text-xs text-white/60">Start practicing to see your progress!</p>
                    </div>
                )}
            </div>
        </QuickToolCard>
    )
}

interface QuickToolsGridProps {
    onNavigate: (module: "quiz" | "cover-letter" | "resume") => void
}

export function QuickToolsGrid({ onNavigate }: QuickToolsGridProps) {
    const handleExternalLink = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer")
    }

    return (
        <div className="w-full">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Tools</h2>
                <p className="text-gray-600">Access your favorite productivity tools instantly</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* AI Mock Interview Card */}
                <QuickToolCard
                    title="AI Mock Interview"
                    description="Practice with AI-powered mock interviews tailored to your target role and company"
                    icon={<Brain className="w-6 h-6" />}
                    gradient="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600"
                    onClick={() => handleExternalLink("https://ireme-ai.vercel.app")}
                    badge="External"
                    external={true}
                />

                {/* Resume Builder Card */}
                <QuickToolCard
                    title="Resume Builder"
                    description="Create professional resumes with AI-powered suggestions and multiple templates"
                    icon={<FileText className="w-6 h-6" />}
                    gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600"
                    onClick={() => onNavigate("resume")}
                    badge="Popular"
                />

                {/* Cover Letter Generator Card */}
                <QuickToolCard
                    title="Cover Letter Generator"
                    description="Generate personalized cover letters that complement your resume perfectly"
                    icon={<Mail className="w-6 h-6" />}
                    gradient="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600"
                    onClick={() => onNavigate("cover-letter")}
                />

                {/* Quiz Prep Card */}
                <QuickToolCard
                    title="Quiz Prep"
                    description="Prepare for interviews with customized quizzes based on your target role"
                    icon={<BookOpen className="w-6 h-6" />}
                    gradient="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500"
                    onClick={() => onNavigate("quiz")}
                    badge="AI-Powered"
                />

                {/* Quiz Scoring Card */}
                <QuizScoreCard />
            </div>
        </div>
    )
}
