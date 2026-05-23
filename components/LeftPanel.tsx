'use client'

import { useRef, useState } from 'react'

interface Props {
  userName: string
  setUserName: (v: string) => void
  jobDescription: string
  setJobDescription: (v: string) => void
  resumeText: string
  setResumeText: (v: string) => void
  onRun: () => void
  isLoading: boolean
  hasStarted: boolean
}

export default function LeftPanel({
  userName,
  setUserName,
  jobDescription,
  setJobDescription,
  resumeText,
  setResumeText,
  onRun,
  isLoading,
  hasStarted,
}: Props) {
  const [resumeTab, setResumeTab] = useState<'paste' | 'upload'>('paste')
  const [isParsing, setIsParsing] = useState(false)
  const [pdfFileName, setPdfFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePdfUpload = async (file: File) => {
    if (file.type !== 'application/pdf') return
    setIsParsing(true)
    setPdfFileName(file.name)
    setResumeText('')

    try {
      const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
      GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs'

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await getDocument({ data: arrayBuffer }).promise

      let fullText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
        fullText += pageText + '\n'
      }

      setResumeText(fullText.trim())
    } catch (err) {
      console.error('PDF parse error:', err)
      alert('Could not parse this PDF. Please try pasting the text instead.')
      setResumeTab('paste')
      setPdfFileName('')
    } finally {
      setIsParsing(false)
    }
  }

  const canRun = !isLoading && jobDescription.trim().length > 50 && resumeText.trim().length > 50

  return (
    <div
      className="w-[42%] min-w-[340px] flex flex-col h-full"
      style={{
        background: 'var(--zinc-900)',
        borderRight: '1px solid var(--zinc-800)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="px-6 pt-7 pb-5"
        style={{ borderBottom: '1px solid var(--zinc-800)' }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--purple-600), var(--purple-400))',
              boxShadow: '0 0 0 1px rgba(124,58,237,0.3), 0 4px 12px rgba(124,58,237,0.2)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div>
            <h1
              className="text-[15px] font-semibold leading-tight"
              style={{ color: 'white', fontFamily: 'var(--font-sans)' }}
            >
              Job Application Co-Pilot
            </h1>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--zinc-500)' }}>
              AI-powered resume &amp; cover letter in seconds
            </p>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Your name */}
        <Field label="Your Name" hint="Used in the cover letter">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. Jane Doe"
            style={{
              width: '100%',
              background: 'var(--zinc-800)',
              border: '1px solid var(--zinc-700)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              fontSize: '13px',
              color: 'white',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--purple-500)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--zinc-700)')}
          />
        </Field>

        {/* Job description */}
        <Field label="Job Description" required hint="Include the company URL for deeper research">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job posting here, including the company URL if visible…"
            rows={9}
            style={{
              width: '100%',
              background: 'var(--zinc-800)',
              border: '1px solid var(--zinc-700)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              fontSize: '13px',
              color: 'white',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              resize: 'none',
              lineHeight: '1.6',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--purple-500)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--zinc-700)')}
          />
          <CharCount value={jobDescription} />
        </Field>

        {/* Resume */}
        <Field label="Your Resume" required>
          {/* Tab toggle */}
          <div
            className="flex mb-2.5 p-1 gap-1"
            style={{
              background: 'var(--zinc-800)',
              border: '1px solid var(--zinc-700)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {(['paste', 'upload'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setResumeTab(tab)}
                style={{
                  flex: 1,
                  fontSize: '12px',
                  padding: '7px 0',
                  borderRadius: '7px',
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.15s',
                  background: resumeTab === tab ? 'var(--purple-600)' : 'transparent',
                  color: resumeTab === tab ? 'white' : 'var(--zinc-500)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: resumeTab === tab ? '0 1px 4px rgba(124,58,237,0.3)' : 'none',
                }}
              >
                {tab === 'paste' ? '✏️  Paste Text' : '📄  Upload PDF'}
              </button>
            ))}
          </div>

          {resumeTab === 'paste' ? (
            <>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here (plain text works best)…"
                rows={10}
                style={{
                  width: '100%',
                  background: 'var(--zinc-800)',
                  border: '1px solid var(--zinc-700)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: 'white',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  resize: 'none',
                  lineHeight: '1.6',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--purple-500)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--zinc-700)')}
              />
              <CharCount value={resumeText} />
            </>
          ) : (
            <DropZone
              fileInputRef={fileInputRef}
              isParsing={isParsing}
              fileName={pdfFileName}
              hasText={!!resumeText}
              charCount={resumeText.length}
              onFile={handlePdfUpload}
              onClear={() => {
                setResumeText('')
                setPdfFileName('')
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
            />
          )}
        </Field>
      </div>

      {/* ── Run button ── */}
      <div
        className="px-6 pb-6 pt-4"
        style={{ borderTop: '1px solid var(--zinc-800)' }}
      >
        <button
          onClick={onRun}
          disabled={!canRun}
          style={{
            width: '100%',
            padding: '13px 0',
            borderRadius: 'var(--radius-lg)',
            fontWeight: 600,
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 'none',
            cursor: canRun ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            background: canRun
              ? 'linear-gradient(135deg, var(--purple-600), var(--purple-500))'
              : 'var(--zinc-800)',
            color: canRun ? 'white' : 'var(--zinc-600)',
            boxShadow: canRun ? '0 4px 16px rgba(124,58,237,0.25)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (canRun) {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)'
              ;(e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(124,58,237,0.35)'
            }
          }}
          onMouseLeave={(e) => {
            if (canRun) {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
              ;(e.target as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(124,58,237,0.25)'
            }
          }}
        >
          {isLoading ? (
            <>
              <span
                className="spin"
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  display: 'inline-block',
                }}
              />
              Agent working…
            </>
          ) : hasStarted ? (
            '↺  Run Again'
          ) : (
            '⚡  Run Agent'
          )}
        </button>
        {!canRun && !isLoading && (
          <p
            className="text-center mt-2"
            style={{ fontSize: '11px', color: 'var(--zinc-600)' }}
          >
            {!jobDescription.trim() && !resumeText.trim()
              ? 'Fill in the job description and resume to start'
              : !jobDescription.trim()
              ? 'Add a job description'
              : 'Add your resume'}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline gap-1.5 mb-1.5">
        <label
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--zinc-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {label}
        </label>
        {required && (
          <span style={{ color: 'var(--purple-400)', fontSize: '10px' }}>required</span>
        )}
        {hint && (
          <span style={{ fontSize: '10px', color: 'var(--zinc-700)', marginLeft: 'auto' }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function CharCount({ value }: { value: string }) {
  if (!value) return null
  return (
    <p
      className="text-right mt-1"
      style={{ fontSize: '10px', color: 'var(--zinc-700)' }}
    >
      {value.length.toLocaleString()} chars
    </p>
  )
}

function DropZone({
  fileInputRef,
  isParsing,
  fileName,
  hasText,
  charCount,
  onFile,
  onClear,
}: {
  fileInputRef: React.RefObject<HTMLInputElement>
  isParsing: boolean
  fileName: string
  hasText: boolean
  charCount: number
  onFile: (f: File) => void
  onClear: () => void
}) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div
      onClick={() => !hasText && fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragging ? 'var(--purple-500)' : hasText ? 'rgba(34,197,94,0.3)' : 'var(--zinc-700)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '28px 20px',
        textAlign: 'center',
        transition: 'all 0.2s',
        background: isDragging
          ? 'rgba(124,58,237,0.05)'
          : hasText
          ? 'rgba(34,197,94,0.04)'
          : 'transparent',
        cursor: hasText ? 'default' : 'pointer',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
      />

      {isParsing ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div
            className="spin"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '2px solid var(--purple-800)',
              borderTopColor: 'var(--purple-500)',
            }}
          />
          <div>
            <p style={{ fontSize: '13px', color: 'var(--zinc-400)', fontWeight: 500 }}>Extracting text…</p>
            <p style={{ fontSize: '11px', color: 'var(--zinc-600)', marginTop: '2px' }}>{fileName}</p>
          </div>
        </div>
      ) : hasText ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(34,197,94,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            ✅
          </div>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--green-400)' }}>PDF extracted</p>
          <p style={{ fontSize: '11px', color: 'var(--zinc-500)' }}>{fileName}</p>
          <p style={{ fontSize: '11px', color: 'var(--zinc-600)' }}>{charCount.toLocaleString()} characters</p>
          <button
            onClick={(e) => { e.stopPropagation(); onClear() }}
            style={{
              marginTop: '4px',
              fontSize: '11px',
              color: 'var(--purple-400)',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Remove &amp; upload different file
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--zinc-800)',
              border: '1px solid var(--zinc-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
          >
            📄
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--zinc-400)' }}>Drop PDF here</p>
            <p style={{ fontSize: '11px', color: 'var(--zinc-600)', marginTop: '2px' }}>or click to browse</p>
          </div>
          <p style={{ fontSize: '10px', color: 'var(--zinc-700)' }}>
            Text extracted client-side — file never leaves your browser
          </p>
        </div>
      )}
    </div>
  )
}
