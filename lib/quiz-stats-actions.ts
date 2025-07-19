"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  recentQuizDate?: string;
}

export async function getUserQuizStats(): Promise<QuizStats> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Fetch all quiz feedback for the user
    const { data: quizData, error } = await supabase
      .from("quiz_feedback")
      .select("score, total_questions, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching quiz stats:", error);
      throw error;
    }

    if (!quizData || quizData.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      };
    }

    // Calculate statistics
    const totalQuizzes = quizData.length;
    const totalQuestions = quizData.reduce(
      (sum, quiz) => sum + quiz.total_questions,
      0
    );
    const correctAnswers = quizData.reduce((sum, quiz) => sum + quiz.score, 0);
    const averageScore =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const recentQuizDate = quizData[0]?.created_at;

    return {
      totalQuizzes,
      averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
      totalQuestions,
      correctAnswers,
      recentQuizDate,
    };
  } catch (error) {
    console.error("Error in getUserQuizStats:", error);
    throw new Error("Failed to fetch quiz statistics");
  }
}

export async function getUserQuizTrend(
  days = 30
): Promise<Array<{ date: string; score: number }>> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: quizData, error } = await supabase
      .from("quiz_feedback")
      .select("score, total_questions, created_at")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching quiz trend:", error);
      throw error;
    }

    if (!quizData || quizData.length === 0) {
      return [];
    }

    // Group by date and calculate average score per day
    const dailyScores = quizData.reduce((acc, quiz) => {
      const date = new Date(quiz.created_at).toISOString().split("T")[0];
      const scorePercentage = (quiz.score / quiz.total_questions) * 100;

      if (!acc[date]) {
        acc[date] = { total: 0, count: 0 };
      }

      acc[date].total += scorePercentage;
      acc[date].count += 1;

      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(dailyScores).map(([date, data]) => ({
      date,
      score: Math.round((data.total / data.count) * 100) / 100,
    }));
  } catch (error) {
    console.error("Error in getUserQuizTrend:", error);
    throw new Error("Failed to fetch quiz trend");
  }
}
