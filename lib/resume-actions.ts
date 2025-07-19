"use server";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function saveResume(data: {
  resumeData: any;
  templateId: string;
  layout: string;
  columnCount: number;
  columnWidth: number[];
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

    const { error } = await supabase.from("resumes").insert({
      user_id: user.id,
      content: data.resumeData,
      template_id: data.templateId,
      layout_config: {
        layout: data.layout,
        columnCount: data.columnCount,
        columnWidth: data.columnWidth,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getUserResumes() {
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
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching resumes:", error);
    throw new Error("Failed to fetch resumes");
  }
}

export async function generateAISuggestions(
  section: string,
  content: string,
  resumeData: any
): Promise<string[]> {
  const prompt = `As a professional resume writer, analyze the following ${section} section and provide 3-5 specific, actionable suggestions to improve it:

Content: "${content}"

Context: This is for a resume in the ${section} section. The person's background includes:
- Name: ${resumeData.personalInfo?.fullName || "Not provided"}
- Experience: ${resumeData.experience?.length || 0} positions
- Skills: ${resumeData.skills?.join(", ") || "Not provided"}

Provide suggestions that are:
1. Specific and actionable
2. Professional and industry-appropriate
3. Focused on impact and results
4. Tailored to modern resume best practices

Return only the suggestions as a JSON array of strings.`;

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
      temperature: 0.7,
    });

    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
    const suggestions: string[] = JSON.parse(cleanedText);
    return suggestions;
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return [];
  }
}

export async function createPublicLink(
  resumeData: any,
  templateId: string
): Promise<string> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Generate a unique ID for the public link
    const publicId = Math.random().toString(36).substring(2, 15);

    const { error } = await supabase.from("public_resumes").insert({
      public_id: publicId,
      resume_data: resumeData,
      template_id: templateId,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;

    return `${process.env.NEXT_PUBLIC_APP_URL}/resume/${publicId}`;
  } catch (error) {
    console.error("Error creating public link:", error);
    throw new Error("Failed to create public link");
  }
}

export async function exportToGoogleDocs(resumeData: any) {
  // Generate formatted text content
  const content = formatResumeForExport(resumeData);

  // Create a Google Docs URL with the content
  const encodedContent = encodeURIComponent(content);
  const googleDocsUrl = `https://docs.google.com/document/create?title=Resume&body=${encodedContent}`;

  // Open in new window
  if (typeof window !== "undefined") {
    window.open(googleDocsUrl, "_blank");
  }
}

function formatResumeForExport(resumeData: any): string {
  let content = "";

  // Header
  content += `${resumeData.personalInfo.fullName}\n`;
  content += `${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}\n`;
  if (resumeData.personalInfo.website)
    content += `${resumeData.personalInfo.website}\n`;
  content += "\n";

  // Summary
  if (resumeData.summary) {
    content += "PROFESSIONAL SUMMARY\n";
    content += `${resumeData.summary}\n\n`;
  }

  // Experience
  if (resumeData.experience.length > 0) {
    content += "EXPERIENCE\n";
    resumeData.experience.forEach((exp: any) => {
      content += `${exp.position} | ${exp.company}\n`;
      content += `${exp.startDate} - ${
        exp.current ? "Present" : exp.endDate
      }\n`;
      if (exp.description) content += `${exp.description}\n`;
      content += "\n";
    });
  }

  // Education
  if (resumeData.education.length > 0) {
    content += "EDUCATION\n";
    resumeData.education.forEach((edu: any) => {
      content += `${edu.degree} in ${edu.field} | ${edu.institution}\n`;
      if (edu.gpa) content += `GPA: ${edu.gpa}\n`;
      content += "\n";
    });
  }

  // Skills
  if (resumeData.skills.length > 0) {
    content += "SKILLS\n";
    content += resumeData.skills.join(", ") + "\n";
  }

  return content;
}
