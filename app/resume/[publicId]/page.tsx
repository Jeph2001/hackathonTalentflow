import { createServerClient } from "@/lib/supabase"
import { ResumePreview } from "@/components/resume-preview"
import { notFound } from "next/navigation"

interface PublicResumePageProps {
  params: {
    publicId: string
  }
}

import { cookies } from "next/headers"

export default async function PublicResumePage({ params }: PublicResumePageProps) {
  const supabase = createServerClient(cookies())

  const { data: resume, error } = await supabase
    .from("public_resumes")
    .select("*")
    .eq("public_id", params.publicId)
    .single()

  if (error || !resume) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Resume</h1>
          <p className="text-gray-600">Shared via TalentFlow</p>
        </div>

        <ResumePreview
          resumeData={resume.resume_data}
          template={resume.template_id}
          layout="left"
          columnCount={2}
          columnWidth={[60, 40]}
        />
      </div>
    </div>
  )
}
