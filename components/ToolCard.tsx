'use client'

import { useState } from 'react'
import type { ToolInvocation } from 'ai'

// ── Config ───────────────────────────────────────────────────────────────────

const TOOL_CONFIG: Record<
  string,
  { icon: string; label: string; color: string; glow: string }
> = {
  fetchCompanyInfo: {
    icon: '🌐',
    label: 'Research Company',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.15)',
  },
  analyzeJobDescription: {
    icon: '🔍',
    label: 'Analyze Job Description',
    color: 'var(--purple-400)',
    glow: 'rgba(167,139,250,0.15)',
  },
  rewriteResumeBullets: {
    icon: '✏️',
    label: 'Rewrite Resume Bullets',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.12)',
  },
  draftCoverLetter: {
    icon: '📝',
    label: 'Draft Cover Letter',
    color: 'var(--green-400)',
    glow: 'rgba(74,222,128,0.12)',
  },
  suggestInterviewQuestions: {
    icon: '💬',
    label: 'Generate Interview Questions',
    color: 'var(--purple-300)',
    glow: 'rgba(196,181,253,0.12)',
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  toolName: string
  invocation: ToolInvocation | undefined
  isLoading: boolean
  stepNumber: number
}

export default function ToolCard({ toolName, invocation, isLoading, stepNumber }: Props) {
  const [expanded, setExpanded] = useState(false)
  const config = TOOL_CONFIG[toolName] ?? {
    icon: '⚙️',
    label: toolName,
    color: 'var(--purple-400)',
    glow: 'rgba(167,139,250,0.12)',
  }

  const state = invocation?.state
  const isDone = state === 'result'
  const isActive = (state === 'call' || state === 'partial-call') && isLoading

  const result =
    invocation?.state === 'result' && 'result' in invocation
      ? (invocation.result as Record<string, unknown>)
      : undefined

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        border: isDone
          ? '1px solid var(--zinc-800)'
          : isActive
          ? `1px solid ${config.glow.replace('0.12', '0.35').replace('0.15', '0.35')}`
          : '1px solid var(--zinc-800)',
        background: isDone
          ? 'var(--zinc-900)'
          : isActive
          ? `linear-gradient(135deg, var(--zinc-900), ${config.glow})`
          : 'var(--zinc-900)',
        opacity: !isDone && !isActive ? 0.35 : 1,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: isActive ? `0 0 16px ${config.glow}` : 'none',
      }}
    >
      {/* Header row */}
      <div
        onClick={() => isDone && setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          cursor: isDone ? 'pointer' : 'default',
        }}
      >
        {/* Step bubble */}
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 700,
            flexShrink: 0,
            transition: 'all 0.3s',
            background: isDone
              ? config.glow
              : isActive
              ? config.glow
              : 'var(--zinc-800)',
            color: isDone || isActive ? config.color : 'var(--zinc-600)',
            border: isDone || isActive ? `1px solid ${config.color}40` : '1px solid var(--zinc-700)',
          }}
        >
          {isDone ? (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : stepNumber}
        </div>

        <span style={{ fontSize: '15px', lineHeight: 1, flexShrink: 0 }}>{config.icon}</span>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: isDone ? 'white' : isActive ? 'var(--zinc-300)' : 'var(--zinc-500)',
            flex: 1,
            fontFamily: 'var(--font-sans)',
            transition: 'color 0.2s',
          }}
        >
          {config.label}
        </span>

        {/* Status */}
        {isDone ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--green-400)', fontWeight: 500 }}>Done</span>
            <span style={{ color: 'var(--zinc-600)', fontSize: '10px' }}>{expanded ? '▲' : '▼'}</span>
          </div>
        ) : isActive ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: config.color }}>
            <span
              className="spin"
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: `1.5px solid ${config.color}40`,
                borderTopColor: config.color,
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '11px', fontWeight: 500 }}>Running</span>
          </div>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--zinc-700)' }}>Pending</span>
        )}
      </div>

      {/* Active pulsing bar */}
      {isActive && (
        <div style={{ height: '2px', background: 'var(--zinc-800)', overflow: 'hidden' }}>
          <div
            className="shimmer"
            style={{ height: '100%', background: `linear-gradient(90deg, transparent, ${config.color}, transparent)` }}
          />
        </div>
      )}

      {/* Expanded result */}
      {isDone && expanded && result && (
        <div style={{ borderTop: '1px solid var(--zinc-800)', padding: '16px', paddingTop: '14px' }}>
          <ToolResult toolName={toolName} result={result} config={config} />
        </div>
      )}
    </div>
  )
}

// ── Result renderers ──────────────────────────────────────────────────────────

function ToolResult({
  toolName,
  result,
  config,
}: {
  toolName: string
  result: unknown
  config: { color: string; glow: string }
}) {
  const r = result as Record<string, unknown>

  if (toolName === 'fetchCompanyInfo') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <KV k="Company" v={String(r.companyName ?? '')} />
        <KV
          k="Status"
          v={r.fetched ? 'Website fetched ✓' : 'Used general knowledge'}
          valueColor={r.fetched ? 'var(--green-400)' : 'var(--amber-400)'}
        />
        {r.websiteContent && (
          <p style={{ fontSize: '11px', color: 'var(--zinc-600)', marginTop: '4px', lineHeight: 1.6 }}>
            {String(r.websiteContent).slice(0, 220)}…
          </p>
        )}
      </div>
    )
  }

  if (toolName === 'analyzeJobDescription') {
    const skills = r.requiredSkills as string[] | undefined
    const culture = r.culturalSignals as string[] | undefined
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <KV k="Role" v={String(r.roleTitle ?? '')} />
        <KV k="Level" v={String(r.experienceLevel ?? '')} />
        {skills && <Tags k="Required Skills" tags={skills.slice(0, 6)} color="#60a5fa" />}
        {culture && <Tags k="Culture" tags={culture.slice(0, 3)} color="var(--purple-400)" />}
      </div>
    )
  }

  if (toolName === 'rewriteResumeBullets') {
    const sections = r.sections as Array<{ sectionTitle: string }> | undefined
    const keywords = r.keywordsAdded as string[] | undefined
    const atsScore = r.atsScore as number | undefined
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'var(--zinc-500)' }}>ATS Score</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green-400)' }}>
              {atsScore ?? 0}/100
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
        {keywords && <Tags k="Keywords" tags={keywords.slice(0, 5)} color="var(--amber-400)" />}
        <KV k="Sections" v={`${sections?.length ?? 0} rewritten`} />
      </div>
    )
  }

  if (toolName === 'draftCoverLetter') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <KV k="Subject" v={String(r.subject ?? '')} />
        <KV k="Tone" v={String(r.toneNotes ?? '')} />
        <p style={{ fontSize: '11px', color: 'var(--zinc-600)', marginTop: '4px', lineHeight: 1.6 }}>
          {String(r.coverLetter ?? '').slice(0, 200)}…
        </p>
      </div>
    )
  }

  if (toolName === 'suggestInterviewQuestions') {
    const questions = r.questions as Array<{ question: string }> | undefined
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <KV k="Generated" v={`${questions?.length ?? 0} questions`} />
        {questions?.slice(0, 2).map((q, i) => (
          <p
            key={i}
            style={{
              fontSize: '11px',
              color: 'var(--zinc-500)',
              paddingLeft: '10px',
              borderLeft: '2px solid var(--zinc-700)',
              lineHeight: 1.5,
            }}
          >
            {q.question}
          </p>
        ))}
      </div>
    )
  }

  return (
    <pre style={{ fontSize: '10px', color: 'var(--zinc-500)', overflow: 'auto', maxHeight: '128px', marginTop: '8px' }}>
      {JSON.stringify(result, null, 2)}
    </pre>
  )
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function KV({ k, v, valueColor }: { k: string; v: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      <span style={{ fontSize: '11px', color: 'var(--zinc-600)', flexShrink: 0, width: '78px' }}>{k}:</span>
      <span style={{ fontSize: '11px', color: valueColor ?? 'var(--zinc-400)' }}>{v}</span>
    </div>
  )
}

function Tags({ k, tags, color }: { k: string; tags: string[]; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      <span style={{ fontSize: '11px', color: 'var(--zinc-600)', flexShrink: 0, width: '78px', paddingTop: '2px' }}>
        {k}:
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {tags.map((tag, i) => (
          <span
            key={i}
            style={{
              fontSize: '10px',
              padding: '2px 7px',
              borderRadius: '5px',
              background: color + '18',
              color: color,
              border: `1px solid ${color}30`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
