import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Job Application Co-Pilot — AI-powered resume, cover letters & interview prep',
  description:
    'Paste a job description and resume. An AI agent researches the company, rewrites your resume bullets, drafts a cover letter, and generates smart interview questions in under 30 seconds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
