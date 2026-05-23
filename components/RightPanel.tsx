'use client'

import type { Message } from 'ai'
import ToolCard from './ToolCard'
import OutputTabs from './OutputTabs'

interface Props {
  message: Message | undefined
  isLoading: boolean
  hasStarted: boolean
  error: Error | undefined
}

const TOOL_ORDER = [
  'fetchCompanyInfo',
  'analyzeJobDescription',
  'rewriteResumeBullets',
  'draftCoverLetter',
  'suggestInterviewQuestions',
]

export default function RightPanel({ message, isLoading, hasStarted, error }: Props) {
  const toolInvocations = message?.toolInvocations ?? []
  const finalText = message?.content ?? ''

  const doneCount = toolInvocations.filter((t) => t.state === 'result').length
  const hasToolResults = doneCount > 0
  const showOutputs = !isLoading && hasStarted
  const isDone = showOutputs && (hasToolResults || !!finalText.trim())

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--zinc-950)',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: '28px 24px 16px',
          borderBottom: '1px solid var(--zinc-800)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'white',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Agent Trace
          </h2>
          <p
            style={{
              fontSize: '11px',
              color: 'var(--zinc-600)',
              marginTop: '2px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {isLoading
              ? `Running… ${doneCount}/5 steps complete`
              : isDone
              ? `${doneCount} step${doneCount !== 1 ? 's' : ''} completed — outputs ready`
              : hasStarted
              ? 'Completed'
              : 'Waiting for input'}
          </p>
        </div>

        {isLoading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              color: 'var(--purple-400)',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
            }}
          >
            <span
              className="pulse-glow"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--purple-500)',
                display: 'inline-block',
              }}
            />
            Live
          </div>
        )}

        {!isLoading && hasStarted && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--green-400)',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Ready
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!hasStarted && !error ? (
          <EmptyState />
        ) : error ? (
          <ErrorState error={error} />
        ) : (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 5 step cards */}
            {TOOL_ORDER.map((toolName, i) => {
              const invocation = toolInvocations.find((t) => t.toolName === toolName)
              return (
                <ToolCard
                  key={toolName}
                  toolName={toolName}
                  invocation={invocation}
                  isLoading={isLoading}
                  stepNumber={i + 1}
                />
              )
            })}

            {/* Agent summary text */}
            {finalText && !isLoading && hasToolResults && (
              <div
                style={{
                  marginTop: '4px',
                  padding: '12px 16px',
                  background: 'var(--zinc-900)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--zinc-800)',
                }}
              >
                <p style={{ fontSize: '12px', color: 'var(--zinc-600)', fontStyle: 'italic' }}>{finalText}</p>
              </div>
            )}

            {/* Fallback */}
            {!isLoading && hasStarted && !hasToolResults && finalText.trim() && (
              <FallbackTextOutput text={finalText} />
            )}

            {/* Output tabs */}
            {showOutputs && (
              <OutputTabs toolInvocations={toolInvocations} fallbackText={finalText} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Fallback ──────────────────────────────────────────────────────────────────

function FallbackTextOutput({ text }: { text: string }) {
  return (
    <div
      style={{
        marginTop: '4px',
        padding: '16px',
        background: 'var(--zinc-900)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(251,191,36,0.2)',
      }}
    >
      <p style={{ fontSize: '11px', color: 'var(--amber-400)', fontWeight: 500, marginBottom: '8px' }}>
        ⚠️ Agent returned text instead of structured tool calls. Raw output:
      </p>
      <pre style={{ fontSize: '11px', color: 'var(--zinc-500)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {text}
      </pre>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  const steps = [
    { icon: '🌐', label: 'Research company website', color: '#60a5fa' },
    { icon: '🔍', label: 'Analyze job requirements', color: 'var(--purple-400)' },
    { icon: '✏️', label: 'Rewrite resume bullets', color: 'var(--amber-400)' },
    { icon: '📝', label: 'Draft cover letter', color: 'var(--green-400)' },
    { icon: '💬', label: 'Generate interview questions', color: 'var(--purple-300)' },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px',
        textAlign: 'center',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, var(--purple-600)22, var(--purple-400)11)',
          border: '1px solid var(--purple-600)40',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '26px',
          marginBottom: '20px',
        }}
      >
        🤖
      </div>

      <h3
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'white',
          marginBottom: '6px',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Ready to co-pilot
      </h3>
      <p
        style={{
          fontSize: '12px',
          color: 'var(--zinc-600)',
          maxWidth: '260px',
          lineHeight: 1.6,
          marginBottom: '32px',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Fill in the job description and resume on the left. The agent will run 5 steps automatically.
      </p>

      <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--zinc-900)',
              border: '1px solid var(--zinc-800)',
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-sm)',
                background: step.color + '18',
                border: `1px solid ${step.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                flexShrink: 0,
              }}
            >
              {step.icon}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--zinc-500)', textAlign: 'left', flex: 1 }}>
              {step.label}
            </span>
            <span
              style={{
                fontSize: '10px',
                color: 'var(--zinc-700)',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {i + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Error state ────────────────────────────────────────────────────────────────

function ErrorState({ error }: { error: Error }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          marginBottom: '16px',
        }}
      >
        ⚠️
      </div>
      <h3
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'white',
          marginBottom: '8px',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Something went wrong
      </h3>
      <p
        style={{
          fontSize: '12px',
          color: 'var(--zinc-500)',
          maxWidth: '300px',
          lineHeight: 1.6,
          fontFamily: 'var(--font-sans)',
        }}
      >
        {error.message}
      </p>
    </div>
  )
}
