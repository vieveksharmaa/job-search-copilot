'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import './landing.css'

// ── Step types ────────────────────────────────────────────────────────────────
type StepState = 'pending' | 'active' | 'done'

interface Step {
  id: number
  icon: string
  label: string
  state: StepState
  statusText: string
}

const INITIAL_STEPS: Step[] = [
  { id: 1, icon: '🌐', label: 'Research Company',         state: 'pending', statusText: 'Pending' },
  { id: 2, icon: '🔍', label: 'Analyze Job Description',  state: 'pending', statusText: 'Pending' },
  { id: 3, icon: '✏️', label: 'Rewrite Resume Bullets',   state: 'pending', statusText: 'Pending' },
  { id: 4, icon: '📝', label: 'Draft Cover Letter',        state: 'pending', statusText: 'Pending' },
  { id: 5, icon: '💬', label: 'Generate Interview Questions', state: 'pending', statusText: 'Pending' },
]

const STEP_DELAYS = [1800, 1400, 2200, 2000, 1600]

export default function LandingPage() {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS)
  const [demoRunning, setDemoRunning] = useState(false)
  const [demoLive, setDemoLive] = useState(false)
  const [demoDone, setDemoDone] = useState(false)
  const atsBarRef = useRef<HTMLDivElement>(null)
  const demoRunRef = useRef(false)

  // ── Scroll reveal ────────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('lp-visible')
            if (atsBarRef.current && e.target.contains(atsBarRef.current)) {
              setTimeout(() => {
                if (atsBarRef.current) atsBarRef.current.style.width = '92%'
              }, 400)
            }
          }
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('.lp-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // ── Demo animation ────────────────────────────────────────────────────────
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  const runDemo = useCallback(async () => {
    if (demoRunRef.current) return
    demoRunRef.current = true
    setDemoRunning(true)
    setDemoDone(false)
    setDemoLive(true)
    setSteps(INITIAL_STEPS)

    for (let i = 0; i < 5; i++) {
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, state: 'active', statusText: 'Running' } : s
        )
      )
      await sleep(STEP_DELAYS[i])
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, state: 'done', statusText: 'Done' } : s
        )
      )
      await sleep(180)
    }

    setDemoLive(false)
    setDemoDone(true)
    setDemoRunning(false)
    demoRunRef.current = false
  }, [])

  return (
    <div style={{ background: 'var(--zinc-950)', minHeight: '100vh' }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-container">
          <div className="lp-nav-inner">
            <div className="lp-nav-logo">
              <div className="lp-nav-logo-icon">
                <BriefcaseIcon />
              </div>
              <span className="lp-nav-logo-text">Job Co-Pilot</span>
            </div>
            <ul className="lp-nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#outputs">Outputs</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
            <div className="lp-nav-cta">
              <Link href="/copilot" className="lp-btn-primary">Launch app →</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-grid" />
        <div className="lp-hero-glow" />
        <div className="lp-container">
          <div className="lp-hero-content">
            <div className="lp-hero-badge">
              <span className="lp-hero-badge-dot" />
              Powered by Vercel AI SDK + multi-provider LLMs
            </div>
            <h1 className="lp-hero-title">
              Land the job<br />with your own<br /><span className="lp-grad">AI Co-Pilot</span>
            </h1>
            <p className="lp-hero-sub">
              Paste a job description and your resume. In seconds, get a tailored resume rewrite,
              personalized cover letter, and smart interview questions — powered by a 5-step AI agent.
            </p>
            <div className="lp-hero-actions">
              <Link href="/copilot" className="lp-btn-hero-primary">
                <PlayIcon />
                Run the agent free
              </Link>
              <a href="#how-it-works" className="lp-btn-hero-secondary">
                See how it works ↓
              </a>
            </div>
            <div className="lp-hero-proof">
              <div className="lp-proof-stat">
                <span className="lp-proof-stat-value">5</span>
                <span className="lp-proof-stat-label">AI steps per run</span>
              </div>
              <div className="lp-proof-divider" />
              <div className="lp-proof-stat">
                <span className="lp-proof-stat-value">&lt;30s</span>
                <span className="lp-proof-stat-label">Time to results</span>
              </div>
              <div className="lp-proof-divider" />
              <div className="lp-proof-stat">
                <span className="lp-proof-stat-value">4</span>
                <span className="lp-proof-stat-label">AI providers supported</span>
              </div>
              <div className="lp-proof-divider" />
              <div className="lp-proof-stat">
                <span className="lp-proof-stat-value">100%</span>
                <span className="lp-proof-stat-label">Client-side PDF parsing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO CARD ───────────────────────────────────────────────────── */}
      <section className="lp-demo-section">
        <div className="lp-container">
          <div className="lp-demo-card lp-reveal">
            <div className="lp-demo-header">
              <div className="lp-demo-dot" style={{ background: '#ef4444' }} />
              <div className="lp-demo-dot" style={{ background: '#f59e0b' }} />
              <div className="lp-demo-dot" style={{ background: '#22c55e' }} />
              <div className="lp-demo-tab-bar">
                <div className="lp-demo-tab lp-active">Job Co-Pilot</div>
                <div className="lp-demo-tab">localhost:3000</div>
              </div>
            </div>
            <div className="lp-demo-body">
              {/* Left: inputs */}
              <div className="lp-demo-left">
                <div className="lp-field-label">Your Name</div>
                <input className="lp-demo-input" placeholder="Jane Doe" readOnly style={{ height: 36 }} />
                <div className="lp-field-label">Job Description</div>
                <textarea className="lp-demo-input" rows={4} readOnly defaultValue={`Senior Frontend Engineer at Vercel\nWe're building the future of web development. We're looking for a senior frontend engineer with experience in React, TypeScript, and Next.js. You'll own critical features, collaborate with design, and push the boundaries of what's possible on the web.`} />
                <div className="lp-field-label">Your Resume</div>
                <textarea className="lp-demo-input" rows={3} readOnly defaultValue="Software Engineer, 5 years experience. Worked with React, JavaScript, CSS. Led projects, shipped features." />
                <button className="lp-demo-run-btn" onClick={runDemo} disabled={demoRunning}>
                  <PlayIcon />
                  {demoRunning ? 'Running…' : 'Run Agent'}
                </button>
              </div>
              {/* Right: trace */}
              <div className="lp-demo-right">
                <div style={{ fontSize: 12, fontWeight: 600, color: 'white', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Agent Trace
                  {demoLive && (
                    <span className="lp-live-badge">
                      <span className="lp-live-dot" />
                      Live
                    </span>
                  )}
                </div>
                {steps.map((step) => (
                  <div key={step.id} className={`lp-step-card lp-${step.state}`}>
                    <div className={`lp-step-bubble lp-${step.state}`}>
                      {step.state === 'done' ? '✓' : step.id}
                    </div>
                    <span className="lp-step-icon">{step.icon}</span>
                    <span className={`lp-step-label${step.state === 'pending' ? ' lp-pending' : ''}`}>
                      {step.label}
                    </span>
                    {step.state === 'done' && <span className="lp-step-status-done">Done</span>}
                    {step.state === 'active' && <span className="lp-step-spinner" />}
                    {step.state === 'pending' && <span style={{ fontSize: 11, color: 'var(--lp-zinc-700)' }}>Pending</span>}
                  </div>
                ))}
                {demoDone && (
                  <div style={{ marginTop: 12, padding: '10px 13px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10 }}>
                    <p style={{ fontSize: 12, color: 'var(--lp-green-400)', fontWeight: 500 }}>✓ All 5 steps complete — outputs ready</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="lp-features-section" id="features">
        <div className="lp-container">
          <div className="lp-reveal">
            <div className="lp-section-label">Features</div>
            <h2 className="lp-section-title">Everything you need to<br />stand out in the job hunt</h2>
            <p className="lp-section-sub">A five-step AI agent does the heavy lifting — from researching the company to crafting every line of your application.</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="lp-feature-card lp-reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                <div className="lp-feature-icon" style={{ background: f.iconBg, border: `1px solid ${f.iconBorder}` }}>{f.icon}</div>
                <div className="lp-feature-title">{f.title}</div>
                <div className="lp-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="lp-how-section" id="how-it-works">
        <div className="lp-container">
          <div className="lp-reveal" style={{ textAlign: 'center' }}>
            <div className="lp-section-label">How it works</div>
            <h2 className="lp-section-title">Three steps to your application package</h2>
          </div>
          <div className="lp-how-steps lp-reveal">
            <div className="lp-how-step">
              <div className="lp-how-step-number">1</div>
              <div className="lp-how-step-title">Paste your inputs</div>
              <div className="lp-how-step-desc">Drop in the job description (include the company URL for best results) and paste or upload your resume PDF.</div>
            </div>
            <div className="lp-how-step">
              <div className="lp-how-step-number">2</div>
              <div className="lp-how-step-title">Agent runs 5 steps</div>
              <div className="lp-how-step-desc">Watch the agent stream through company research, JD analysis, resume rewrite, cover letter, and interview questions — live.</div>
            </div>
            <div className="lp-how-step">
              <div className="lp-how-step-number">3</div>
              <div className="lp-how-step-title">Copy and apply</div>
              <div className="lp-how-step-desc">Review the tabbed outputs, copy your tailored resume bullets and cover letter, then hit send with confidence.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUTPUTS ─────────────────────────────────────────────────────── */}
      <section className="lp-output-section" id="outputs">
        <div className="lp-container">
          <div className="lp-reveal">
            <div className="lp-section-label">Outputs</div>
            <h2 className="lp-section-title">Three deliverables,<br />one run</h2>
            <p className="lp-section-sub">Every output is structured, copy-ready, and tailored to your specific job description.</p>
          </div>
          <div className="lp-output-grid">
            {/* Resume card */}
            <div className="lp-output-card lp-reveal" style={{ transitionDelay: '0.05s' }}>
              <div className="lp-output-card-header">
                <span>✏️</span>
                <span className="lp-output-card-title">Rewritten Resume</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--lp-green-400)', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>92/100</span>
              </div>
              <div className="lp-output-card-body">
                <div className="lp-ats-bar-wrap">
                  <div className="lp-ats-bar-row">
                    <span style={{ fontSize: 11, color: 'var(--lp-zinc-600)' }}>ATS Match Score</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--lp-green-400)' }}>92/100</span>
                  </div>
                  <div className="lp-ats-bar-track">
                    <div className="lp-ats-bar-fill" ref={atsBarRef} />
                  </div>
                </div>
                <p style={{ fontSize: 10, color: 'var(--lp-zinc-600)', marginBottom: 8 }}>Keywords added:</p>
                <div className="lp-kw-wrap">
                  {['React 18', 'Next.js App Router', 'TypeScript', 'Web Vitals', 'Edge Runtime'].map((kw) => (
                    <span key={kw} className="lp-kw-chip">{kw}</span>
                  ))}
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--lp-zinc-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Work Experience</p>
                <div className="lp-bullet-row">
                  <span className="lp-bullet-dot">•</span>
                  <span className="lp-bullet-text">Led frontend architecture for 3 Next.js App Router migrations, improving Core Web Vitals scores by 38% and reducing time-to-interactive by 1.2s.</span>
                </div>
                <div className="lp-bullet-row">
                  <span className="lp-bullet-dot">•</span>
                  <span className="lp-bullet-text">Engineered reusable TypeScript component library used across 6 product teams, cutting UI development time by 40%.</span>
                </div>
              </div>
            </div>
            {/* Cover letter */}
            <div className="lp-output-card lp-reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="lp-output-card-header">
                <span>📝</span>
                <span className="lp-output-card-title">Cover Letter</span>
              </div>
              <div className="lp-output-card-body">
                <div className="lp-cover-subject">
                  <span>Subject line</span>
                  Senior Frontend Engineer — Jane Doe Application
                </div>
                <div className="lp-cover-body">
                  <p>Dear Hiring Manager,</p>
                  <p>I&apos;m writing to express my enthusiasm for the Senior Frontend Engineer role at Vercel. Having spent five years building production React and TypeScript applications, I&apos;ve long admired how Vercel&apos;s platform has redefined the developer experience — and I&apos;d love to contribute to that mission.</p>
                  <p>In my current role, I led the migration of our core product to Next.js App Router, achieving a 38% improvement in Core Web Vitals. I thrive at the intersection of performance and developer tooling — exactly the problems Vercel is solving at scale…</p>
                </div>
              </div>
            </div>
            {/* Interview questions */}
            <div className="lp-output-card lp-full lp-reveal" style={{ transitionDelay: '0.15s' }}>
              <div className="lp-output-card-header">
                <span>💬</span>
                <span className="lp-output-card-title">Interview Questions to Ask</span>
              </div>
              <div className="lp-output-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <div>
                  {QUESTIONS_LEFT.map((q, i) => (
                    <div key={i} className="lp-question-card">
                      <div className="lp-question-text">{q.text}</div>
                      <div className="lp-question-meta">
                        <span className="lp-question-cat" style={{ background: q.catBg, color: q.catColor, border: `1px solid ${q.catBorder}` }}>{q.cat}</span>
                        <span className="lp-question-why">{q.why}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  {QUESTIONS_RIGHT.map((q, i) => (
                    <div key={i} className="lp-question-card">
                      <div className="lp-question-text">{q.text}</div>
                      <div className="lp-question-meta">
                        <span className="lp-question-cat" style={{ background: q.catBg, color: q.catColor, border: `1px solid ${q.catBorder}` }}>{q.cat}</span>
                        <span className="lp-question-why">{q.why}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECH STACK ──────────────────────────────────────────────────── */}
      <section className="lp-tech-section">
        <div className="lp-container">
          <div className="lp-tech-inner lp-reveal">
            {TECH.map((t) => (
              <div key={t.label} className="lp-tech-item">
                <div className="lp-tech-icon">{t.icon}</div>
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section className="lp-pricing-section" id="pricing">
        <div className="lp-container">
          <div className="lp-reveal" style={{ textAlign: 'center' }}>
            <div className="lp-section-label">Pricing</div>
            <h2 className="lp-section-title">Start free, scale when you&apos;re ready</h2>
            <p className="lp-section-sub" style={{ margin: '0 auto' }}>Every tier includes the full 5-step agent. Pay more only for volume and priority processing.</p>
          </div>
          <div className="lp-pricing-grid">
            {PLANS.map((plan, i) => (
              <div key={i} className={`lp-pricing-card lp-reveal${plan.featured ? ' lp-featured' : ''}`} style={{ transitionDelay: `${i * 0.05}s` }}>
                {plan.featured && <div className="lp-pricing-badge">Most popular</div>}
                <div>
                  <div className="lp-pricing-tier" style={plan.featured ? { color: 'var(--lp-purple-400)' } : {}}>{plan.tier}</div>
                  <div className="lp-pricing-price">
                    <span className="lp-pricing-amount">{plan.price}</span>
                    <span className="lp-pricing-period">/mo</span>
                  </div>
                </div>
                <p className="lp-pricing-desc">{plan.desc}</p>
                <ul className="lp-pricing-features">
                  {plan.features.map((f, j) => (
                    <li key={j}>
                      {f.included ? <span className="lp-check">✓</span> : <span className="lp-dash">—</span>}
                      {f.label}
                    </li>
                  ))}
                </ul>
                <Link href="/copilot" className={`lp-pricing-btn ${plan.featured ? 'lp-pricing-btn-solid' : 'lp-pricing-btn-outline'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="lp-cta-section">
        <div className="lp-container">
          <div className="lp-cta-card lp-reveal">
            <div className="lp-cta-glow" />
            <p className="lp-section-label" style={{ marginBottom: 16 }}>Get started today</p>
            <h2 className="lp-cta-title">Your next job starts<br />with a better application</h2>
            <p className="lp-cta-sub">
              Paste a job description. Watch 5 AI steps run live.<br />
              Walk away with a tailored resume, cover letter, and interview prep.
            </p>
            <div className="lp-cta-actions">
              <Link href="/copilot" className="lp-btn-hero-primary">
                <PlayIcon />
                Launch the app — it&apos;s free
              </Link>
              <a href="https://github.com/vivekjangiir/job-search-copilot" target="_blank" rel="noreferrer" className="lp-btn-hero-secondary">
                View source on GitHub ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-inner">
            <div className="lp-footer-logo">
              <div className="lp-nav-logo-icon" style={{ width: 26, height: 26 }}>
                <BriefcaseIconSm />
              </div>
              Job Application Co-Pilot
            </div>
            <ul className="lp-footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="https://github.com/vivekjangiir/job-search-copilot" target="_blank" rel="noreferrer">GitHub ↗</a></li>
            </ul>
            <p className="lp-footer-copy">Built with Vercel AI SDK &amp; Next.js</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function BriefcaseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  )
}

function BriefcaseIconSm() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21"/>
    </svg>
  )
}

// ── Static data ───────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '🌐', iconBg: 'rgba(96,165,250,0.1)',  iconBorder: 'rgba(96,165,250,0.2)',  title: 'Live Company Research', desc: 'The agent fetches the company website in real time, extracting mission, culture, and values to personalize every output.' },
  { icon: '🔍', iconBg: 'rgba(124,58,237,0.1)', iconBorder: 'rgba(124,58,237,0.2)', title: 'Deep JD Analysis',        desc: 'Extracts required skills, experience level, key responsibilities, and cultural signals from any job description.' },
  { icon: '✏️', iconBg: 'rgba(251,191,36,0.1)', iconBorder: 'rgba(251,191,36,0.2)', title: 'ATS-Optimized Resume',    desc: 'Every bullet is rewritten with job-relevant keywords, strong action verbs, and quantifiable impact. Includes an ATS match score.' },
  { icon: '📝', iconBg: 'rgba(74,222,128,0.1)', iconBorder: 'rgba(74,222,128,0.2)', title: 'Personalized Cover Letter', desc: 'A complete 3–4 paragraph cover letter tailored to the role and company, with a ready-to-use email subject line.' },
  { icon: '💬', iconBg: 'rgba(196,181,253,0.1)',iconBorder: 'rgba(196,181,253,0.2)',title: 'Smart Interview Questions', desc: '6–8 insightful questions to ask the interviewer, categorized by topic and explained with why they signal genuine interest.' },
  { icon: '📄', iconBg: 'rgba(34,197,94,0.1)',  iconBorder: 'rgba(34,197,94,0.2)',  title: 'PDF Upload, No Server',  desc: 'Drag-and-drop your PDF resume. Text is extracted entirely in the browser — your file never leaves your device.' },
]

const QUESTIONS_LEFT = [
  { text: 'How does the frontend platform team collaborate with product and design on new feature development?', cat: 'team', catBg: 'rgba(96,165,250,0.1)', catColor: '#60a5fa', catBorder: 'rgba(96,165,250,0.25)', why: 'Shows interest in cross-functional collaboration' },
  { text: 'What does the roadmap look like for Next.js and the Edge Runtime over the next 12 months?', cat: 'technical', catBg: 'rgba(124,58,237,0.1)', catColor: 'var(--lp-purple-300)', catBorder: 'rgba(124,58,237,0.25)', why: 'Signals deep product knowledge and long-term thinking' },
]
const QUESTIONS_RIGHT = [
  { text: 'How does Vercel measure engineering success — what does a great quarter look like for this team?', cat: 'growth', catBg: 'rgba(251,191,36,0.1)', catColor: 'var(--lp-amber-400)', catBorder: 'rgba(251,191,36,0.25)', why: 'Demonstrates results-orientation' },
  { text: "What's the biggest technical challenge the frontend team is working through right now?", cat: 'role', catBg: 'rgba(74,222,128,0.1)', catColor: 'var(--lp-green-400)', catBorder: 'rgba(74,222,128,0.25)', why: "Shows you're ready to contribute immediately" },
]

const TECH = [
  { icon: '▲', label: 'Vercel AI SDK' },
  { icon: '🔲', label: 'Next.js 14' },
  { icon: '🤖', label: 'Claude (Anthropic)' },
  { icon: '🧠', label: 'GPT-4o mini' },
  { icon: '♊', label: 'Gemini Flash' },
  { icon: '⚡', label: 'Groq (Llama)' },
  { icon: 'Z',  label: 'Zod' },
]

const PLANS = [
  {
    tier: 'Free', price: '$0', featured: false,
    desc: 'Bring your own API key. Run the full agent locally with no limits.',
    cta: 'Self-host on GitHub →',
    features: [
      { label: 'Unlimited runs (self-hosted)', included: true },
      { label: 'All 5 agent steps',            included: true },
      { label: 'PDF upload & parsing',          included: true },
      { label: '4 AI providers',                included: true },
      { label: 'Saved applications',            included: false },
      { label: 'Priority processing',           included: false },
    ],
  },
  {
    tier: 'Pro', price: '$12', featured: true,
    desc: 'Full-managed cloud. No API key needed — just paste and run.',
    cta: 'Get started →',
    features: [
      { label: '100 runs / month',   included: true },
      { label: 'All 5 agent steps',  included: true },
      { label: 'PDF upload & parsing', included: true },
      { label: 'All 4 AI providers', included: true },
      { label: 'Saved applications', included: true },
      { label: 'Priority processing', included: false },
    ],
  },
  {
    tier: 'Power', price: '$29', featured: false,
    desc: 'For serious job seekers in active search mode.',
    cta: 'Get started →',
    features: [
      { label: 'Unlimited runs',     included: true },
      { label: 'All 5 agent steps',  included: true },
      { label: 'PDF upload & parsing', included: true },
      { label: 'All 4 AI providers', included: true },
      { label: 'Saved applications', included: true },
      { label: 'Priority processing', included: true },
    ],
  },
]
