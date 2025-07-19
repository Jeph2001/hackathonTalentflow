"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export async function generateQuiz(
  jobRole: string,
  companyName: string,
  questionCount: number
): Promise<QuizQuestion[]> {
  const prompt = `Generate ${questionCount} multiple-choice interview questions for a ${jobRole} position at ${companyName}. 
  
  For each question, provide:
  1. The question text
  2. 4 multiple choice options (A, B, C, D)
  3. The correct answer (0-3 index)
  4. A detailed explanation of why the answer is correct
  
  Focus on:
  - Technical skills relevant to the role
  - Company-specific knowledge about ${companyName}
  - Industry best practices
  - Problem-solving scenarios
  
  Return the response as a JSON array with this structure:
  [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation here"
    }
  ]`;

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
      temperature: 0.7,
    });

    // Parse the JSON response
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
    const questions: QuizQuestion[] = JSON.parse(cleanedText);

    return questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz");
  }
}

export async function submitQuizFeedback(data: {
  jobRole: string;
  companyName: string;
  score: number;
  totalQuestions: number;
  userAnswers: number[];
  correctAnswers: number[];
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase.from("quiz_feedback").insert({
      user_id: user.id,
      job_role: data.jobRole,
      company_name: data.companyName,
      score: data.score,
      total_questions: data.totalQuestions,
      user_answers: data.userAnswers,
      correct_answers: data.correctAnswers,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error submitting quiz feedback:", error);
    throw new Error("Failed to submit quiz feedback");
  }
}

export async function getUserQuizHistory() {
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

    const { data, error } = await supabase
      .from("quiz_feedback")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    throw new Error("Failed to fetch quiz history");
  }
}
