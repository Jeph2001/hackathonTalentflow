"use client"

interface ResumePreviewProps {
  resumeData: any
  template: string
  layout: string
  columnCount: number
  columnWidth: number[]
}

export function ResumePreview({ resumeData, template, layout, columnCount, columnWidth }: ResumePreviewProps) {
  const renderModernTemplate = () => (
    <div className="bg-white p-8 shadow-lg min-h-[800px] max-w-[210mm] mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{resumeData.personalInfo.fullName || "Your Name"}</h1>
        <div className="text-gray-600 space-y-1">
          <p>{resumeData.personalInfo.email}</p>
          <p>
            {resumeData.personalInfo.phone} • {resumeData.personalInfo.location}
          </p>
          {resumeData.personalInfo.website && <p>{resumeData.personalInfo.website}</p>}
        </div>
      </div>

      {/* Summary */}
      {resumeData.summary && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
        </div>
      )}

      <div className={`grid ${columnCount === 2 ? "grid-cols-5" : "grid-cols-1"} gap-8`}>
        {/* Main Content */}
        <div className={columnCount === 2 ? "col-span-3" : "col-span-1"}>
          {/* Experience */}
          {resumeData.experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-600 pb-1">Experience</h2>
              <div className="space-y-6">
                {resumeData.experience.map((exp: any) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                        <p className="text-blue-600 font-medium">{exp.company}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                      </p>
                    </div>
                    {exp.description && <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-600 pb-1">Education</h2>
              <div className="space-y-4">
                {resumeData.education.map((edu: any) => (
                  <div key={edu.id}>
                    <h3 className="font-semibold text-gray-900">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-blue-600">{edu.institution}</p>
                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b-2 border-blue-600 pb-1">Skills</h2>
              <div className="space-y-4">
                {resumeData.skills.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <p className="text-gray-900">{skill}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        {columnCount === 2 && (
          <div className="col-span-2">
            {/* Skills */}
            {resumeData.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
                <div className="space-y-2">
                  {resumeData.skills.map((skill: string) => (
                    <div key={skill} className="text-sm text-gray-700">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderClassicTemplate = () => (
    <div className="bg-white p-8 shadow-lg min-h-[800px] max-w-[210mm] mx-auto">
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{resumeData.personalInfo.fullName || "Your Name"}</h1>
        <div className="text-gray-600 text-sm">
          {resumeData.personalInfo.email} • {resumeData.personalInfo.phone} • {resumeData.personalInfo.location}
        </div>
      </div>

      {/* Content sections similar to modern but with classic styling */}
      {resumeData.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">Objective</h2>
          <p className="text-gray-700">{resumeData.summary}</p>
        </div>
      )}

      {/* Rest of the classic template content */}
    </div>
  )

  const renderCreativeTemplate = () => (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 shadow-lg min-h-[800px] max-w-[210mm] mx-auto">
      {/* Creative template with colorful design */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {resumeData.personalInfo.fullName || "Your Name"}
          </h1>
          <div className="text-gray-600">
            {resumeData.personalInfo.email} • {resumeData.personalInfo.phone}
          </div>
        </div>
        {/* Rest of creative template */}
      </div>
    </div>
  )

  const renderTemplate = () => {
    switch (template) {
      case "classic":
        return renderClassicTemplate()
      case "creative":
        return renderCreativeTemplate()
      case "modern":
      default:
        return renderModernTemplate()
    }
  }

  return <div className="w-full h-full overflow-auto bg-gray-100 p-4">{renderTemplate()}</div>
}
