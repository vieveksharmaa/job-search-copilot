'use client'

import { useChat } from 'ai/react'
import { useState } from 'react'
import LeftPanel from '@/components/LeftPanel'
import RightPanel from '@/components/RightPanel'

export default function Home() {
  const [userName, setUserName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [hasStarted, setHasStarted] = useState(false)

  const { messages, append, isLoading, error } = useChat({
    api: '/api/agent',
  })

  const handleRun = async () => {
    if (!jobDescription.trim() || !resumeText.trim()) return
    setHasStarted(true)

    await append({
      role: 'user',
      content: [
        `APPLICANT NAME: ${userName || 'Job Applicant'}`,
        '',
        '=== JOB DESCRIPTION ===',
        jobDescription.trim(),
        '',
        '=== MY RESUME ===',
        resumeText.trim(),
      ].join('\n'),
    })
  }

  // Get the latest assistant message (the one accumulating tool calls)
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--zinc-950)' }}>
      <LeftPanel
        userName={userName}
        setUserName={setUserName}
        jobDescription={jobDescription}
        setJobDescription={setJobDescription}
        resumeText={resumeText}
        setResumeText={setResumeText}
        onRun={handleRun}
        isLoading={isLoading}
        hasStarted={hasStarted}
      />
      <RightPanel
        message={latestAssistantMessage}
        isLoading={isLoading}
        hasStarted={hasStarted}
        error={error}
      />
    </div>
  )
}
