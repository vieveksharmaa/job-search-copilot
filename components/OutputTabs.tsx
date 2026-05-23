'use client'

import { useState } from 'react'
import type { ToolInvocation } from 'ai'

interface Props {
  toolInvocations: ToolInvocation[]
  fallbackText?: string
}

const TABS = [
  { id: 'resume', label: '✏️  Resume', toolName: 'rewriteResumeBullets' },
  { id: 'cover', label: '📝  Cover Letter', toolName: 'draftCoverLetter' },
  { id: 'questions', label: '💬  Questions', toolName: 'suggestInterviewQuestions' },
]

export default function OutputTabs({ toolInvocations, fallbackText }: Props) {
  function getResult(toolName: string): Record<string, unknown> | undefined {
    const inv = toolInvocations.find(
      (t) => t.toolName === toolName && t.state === 'result'
    )
    if (!inv || !('result' in inv)) return undefined
    return inv.result as Record<string, unknown>
  }

  const resumeResult = getResult('rewriteResumeBullets')
  const coverResult = getResult('draftCoverLetter')
  const questionsResult = getResult('suggestInterviewQuestions')

  const defaultTab =
    resumeResult ? 'resume' : coverResult ? 'cover' : questionsResult ? 'questions' : 'resume'
  const [activeTab, setActiveTab] = useState(defaultTab)

  if (!resumeResult && !coverResult && !questionsResult) return null

  return (
    <div
      style={{
        marginTop: '20px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--zinc-800)',
        overflow: 'hidden',
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          background: 'var(--zinc-900)',
          borderBottom: '1px solid var(--zinc-800)',
        }}
      >
        {TABS.map((tab) => {
          const hasData =
            tab.id === 'resume' ? !!resumeResult
            : tab.id === 'cover' ? !!coverResult
            : !!questionsResult
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => hasData && setActiveTab(tab.id)}
              disabled={!hasData}
              style={{
                flex: 1,
                fontSize: '12px',
                padding: '11px 0',
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--purple-500)' : '2px solid transparent',
                background: isActive ? 'var(--zinc-950)' : 'transparent',
                color: isActive ? 'white' : hasData ? 'var(--zinc-500)' : 'var(--zinc-800)',
                cursor: hasData ? 'pointer' : 'default',
                position: 'relative',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
              {hasData && !isActive && (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: 'var(--purple-500)',
                    opacity: 0.6,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div style={{ background: 'var(--zinc-950)', padding: '20px' }}>
        {activeTab === 'resume' && resumeResult && (
          <ResumeOutput result={resumeResult} />
        )}
        {activeTab === 'cover' && coverResult && (
          <CoverLetterOutput result={coverResult} />
        )}
        {activeTab === 'questions' && questionsResult && (
          <QuestionsOutput result={questionsResult} />
        )}
      </div>
    </div>
  )
}

// ── Resume Output ─────────────────────────────────────────────────────────────

function ResumeOutput({ result }: { result: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false)

  const sections = result.sections as Array<{
    sectionTitle: string
    originalBullets: string[]
    rewrittenBullets: string[]
  }> | undefined

  const keywords = result.keywordsAdded as string[] | undefined
  const atsTips = result.atsTips as string[] | undefined
  const atsScore = result.atsScore as number | undefined

  const allText =
    sections
      ?.map(
        (s) =>
          `${s.sectionTitle}:\n${s.rewrittenBullets?.map((b) => `• ${b}`).join('\n')}`
      )
      .join('\n\n') ?? ''

  const handleCopy = () => {
    navigator.clipboard.writeText(allText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ATS score bar */}
      <div
        style={{
          padding: '12px 14px',
          background: 'var(--zinc-900)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--zinc-800)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--zinc-600)' }}>ATS Match Score</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green-400)' }}>
              {atsScore}/100
            </span>
          </div>
          <div style={{ height: '5px', background: 'var(--zinc-800)', borderRadius: '99px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${atsScore ?? 0}%`,
                borderRadius: '99px',
                background: 'linear-gradient(90deg, var(--purple-600), var(--green-400))',
                transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
              }}
            />
          </div>
        </div>
        <button
          onClick={handleCopy}
          style={{
            fontSize: '11px',
            color: copied ? 'var(--green-400)' : 'var(--purple-400)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            flexShrink: 0,
            transition: 'color 0.15s',
          }}
        >
          {copied ? '✓ Copied' : 'Copy all'}
        </button>
      </div>

      {/* Keywords */}
      {keywords && keywords.length > 0 && (
        <div>
          <p style={{ fontSize: '11px', color: 'var(--zinc-600)', marginBottom: '8px' }}>Keywords added:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {keywords.map((kw, i) => (
              <span
                key={i}
                style={{
                  fontSize: '11px',
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(124,58,237,0.1)',
                  color: 'var(--purple-300)',
                  border: '1px solid rgba(124,58,237,0.25)',
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      {sections?.map((section, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--zinc-600)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {section.sectionTitle}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {section.rewrittenBullets?.map((bullet, j) => (
              <div key={j} style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: 'var(--purple-400)', fontSize: '13px', lineHeight: 1.6, flexShrink: 0, marginTop: '1px' }}>
                  •
                </span>
                <p style={{ fontSize: '12px', color: 'var(--zinc-300)', lineHeight: 1.7 }}>{bullet}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ATS tips */}
      {atsTips && atsTips.length > 0 && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--zinc-900)',
            border: '1px solid var(--zinc-800)',
          }}
        >
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--zinc-500)', marginBottom: '8px' }}>
            💡 ATS Tips
          </p>
          {atsTips.map((tip, i) => (
            <p key={i} style={{ fontSize: '11px', color: 'var(--zinc-600)', lineHeight: 1.6, marginBottom: '4px' }}>
              • {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Cover Letter Output ───────────────────────────────────────────────────────

// ── Cover Letter Output ───────────────────────────────────────────────────────

function CoverLetterOutput({ result }: { result: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false)
  
  // Extract values with proper type checking
  const coverLetter = result.coverLetter as string | undefined ?? ''
  const subject = result.subject as string | undefined ?? ''
  const toneNotes = result.toneNotes as string | undefined

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Subject line */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 14px',
          background: 'var(--zinc-900)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--zinc-800)',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: '10px', color: 'var(--zinc-600)', display: 'block', marginBottom: '2px' }}>
            Subject line
          </span>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--zinc-300)',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subject}
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            fontSize: '11px',
            color: copied ? 'var(--green-400)' : 'var(--purple-400)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            flexShrink: 0,
            transition: 'color 0.15s',
          }}
        >
          {copied ? '✓ Copied' : 'Copy letter'}
        </button>
      </div>

      {/* Letter body */}
      <div
        style={{
          background: 'var(--zinc-900)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--zinc-800)',
          padding: '16px',
        }}
      >
        <pre
          style={{
            fontSize: '12px',
            color: 'var(--zinc-300)',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {coverLetter}
        </pre>
      </div>

      {/* Tone note */}
      {toneNotes && (
        <p
          style={{
            fontSize: '11px',
            color: 'var(--zinc-700)',
            fontStyle: 'italic',
            paddingLeft: '12px',
            borderLeft: '2px solid var(--zinc-800)',
          }}
        >
          {toneNotes}
        </p>
      )}
    </div>
  )
}

// ── Interview Questions Output ────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  role:      { bg: 'rgba(124,58,237,0.1)',  color: 'var(--purple-300)', border: 'rgba(124,58,237,0.25)' },
  team:      { bg: 'rgba(167,139,250,0.1)', color: 'var(--purple-400)', border: 'rgba(167,139,250,0.25)' },
  company:   { bg: 'rgba(96,165,250,0.1)',  color: '#60a5fa',           border: 'rgba(96,165,250,0.25)' },
  growth:    { bg: 'rgba(74,222,128,0.1)',  color: 'var(--green-400)',  border: 'rgba(74,222,128,0.25)' },
  culture:   { bg: 'rgba(251,191,36,0.1)',  color: 'var(--amber-400)',  border: 'rgba(251,191,36,0.25)' },
  technical: { bg: 'rgba(248,113,113,0.1)', color: '#f87171',           border: 'rgba(248,113,113,0.25)' },
}

function QuestionsOutput({ result }: { result: Record<string, unknown> }) {
  const questions = result.questions as Array<{
    question: string
    whyAsk: string
    category: string
  }> | undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {questions?.map((q, i) => {
        const style = CATEGORY_STYLE[q.category] ?? CATEGORY_STYLE.role
        return (
          <div
            key={i}
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--zinc-900)',
              border: '1px solid var(--zinc-800)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--purple-400)',
                  marginTop: '1px',
                  flexShrink: 0,
                  width: '16px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {i + 1}.
              </span>
              <p style={{ fontSize: '12px', color: 'var(--zinc-300)', lineHeight: 1.6, fontWeight: 500 }}>
                {q.question}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '26px' }}>
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '99px',
                  background: style.bg,
                  color: style.color,
                  border: `1px solid ${style.border}`,
                  textTransform: 'capitalize',
                  flexShrink: 0,
                }}
              >
                {q.category}
              </span>
              <p style={{ fontSize: '11px', color: 'var(--zinc-600)', fontStyle: 'italic', lineHeight: 1.5 }}>
                {q.whyAsk}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
