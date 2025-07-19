"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface CoverLetterData {
  coverLetterType: string;
  companyName: string;
  jobDesignation: string;
  content: string;
}

export async function generateCoverLetter(
  data: CoverLetterData
): Promise<string> {
  const prompt = `Generate a professional ${data.coverLetterType} cover letter for a ${data.jobDesignation} position at ${data.companyName}.

  User's background and experience:
  ${data.content}

  Requirements:
  - Professional tone appropriate for ${data.coverLetterType} style
  - Tailored specifically to ${data.companyName} and the ${data.jobDesignation} role
  - Include proper formatting with date, company address, salutation, body paragraphs, and closing
  - Highlight relevant skills and experiences from the user's background
  - Show enthusiasm for the company and role
  - Keep it concise but impactful (3-4 paragraphs)
  - Use industry-appropriate language

  Format the letter as a complete, ready-to-send cover letter.`;

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
      temperature: 0.7,
    });

    return text;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error("Failed to generate cover letter");
  }
}

export async function saveCoverLetter(
  data: CoverLetterData & { generatedContent: string }
) {
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

    const { error } = await supabase.from("cover_letters").insert({
      user_id: user.id,
      cover_letter_type: data.coverLetterType,
      company_name: data.companyName,
      job_designation: data.jobDesignation,
      user_content: data.content,
      generated_content: data.generatedContent,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error saving cover letter:", error);
    throw new Error("Failed to save cover letter");
  }
}

export async function getUserCoverLetters() {
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
      .from("cover_letters")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching cover letters:", error);
    throw new Error("Failed to fetch cover letters");
  }
}
