# Job Application Co-Pilot

> Paste a job description and your resume. In under 30 seconds, get a tailored resume rewrite, personalized cover letter, and smart interview questions — powered by a 5-step AI agent.

**[🚀 Live Demo →](https://job-search-copilot-rho.vercel.app/)**

---

## What it does

The app runs a five-step agentic pipeline on every submission:

| Step | Tool | Output |
|------|------|--------|
| 1 | `fetchCompanyInfo` | Fetches the company website live to extract mission, values, and culture |
| 2 | `analyzeJobDescription` | Extracts required skills, responsibilities, experience level, and cultural signals |
| 3 | `rewriteResumeBullets` | Rewrites every resume bullet with JD keywords, action verbs, and an ATS match score |
| 4 | `draftCoverLetter` | Writes a full 3–4 paragraph cover letter with a ready-to-send subject line |
| 5 | `suggestInterviewQuestions` | Generates 6–8 smart questions to ask the interviewer, with reasoning per question |

All steps stream in real time — you watch each one light up as it completes.

---

## Tech stack

- **[Vercel AI SDK](https://sdk.vercel.ai)** — `streamText` with `maxSteps: 10` for multi-step tool calling
- **Next.js 14** (App Router)
- **TypeScript** + **Zod** for end-to-end type safety on every tool schema
- **Tailwind CSS**
- **pdfjs-dist** — PDF parsing runs entirely in the browser; your file never leaves your device

### Supported AI providers

Switch providers via a single env variable — no code changes needed.

| Provider | Model | Env variable |
|----------|-------|-------------|
| **Anthropic** *(recommended)* | `claude-haiku-4-5` | `ANTHROPIC_API_KEY` |
| OpenAI | `gpt-4o-mini` | `OPENAI_API_KEY` |
| Google | `gemini-2.0-flash` | `GOOGLE_GENERATIVE_AI_API_KEY` |
| Groq | `llama-3.3-70b-versatile` | `GROQ_API_KEY` |

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/vivekjangiir/job-search-copilot.git
cd job-search-copilot
npm install
```

### 2. Add your API key

Create a `.env.local` file in the project root. Pick any one provider:

```env
# Recommended — ~$0.002 per run, free $5 credit on signup
ANTHROPIC_API_KEY=your-key-here
ACTIVE_PROVIDER=anthropic

# Or use any other supported provider
# OPENAI_API_KEY=your-key-here
# ACTIVE_PROVIDER=openai

# GOOGLE_GENERATIVE_AI_API_KEY=your-key-here
# ACTIVE_PROVIDER=google

# GROQ_API_KEY=your-key-here
# ACTIVE_PROVIDER=groq
```

Get an Anthropic key at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How to use

1. **Paste the job description** — include the company URL for best results (the agent will fetch the site live)
2. **Add your resume** — paste the text directly or drag-and-drop a PDF (parsed client-side)
3. **Hit Run Agent** — watch the 5-step trace stream in real time
4. **Copy and apply** — review resume bullets, cover letter, and interview questions across the output tabs

---

## Project structure

```
app/
  page.tsx              # Landing page
  copilot/page.tsx      # Main app
  api/agent/route.ts    # Streaming agent endpoint (all 5 tools defined here)
components/
  LeftPanel.tsx         # Inputs (name, JD, resume, PDF upload)
  RightPanel.tsx        # Agent trace / step progress
  OutputTabs.tsx        # Tabbed output view
  ToolCard.tsx          # Individual tool result card
```

---

## Deployment

The app is deployed on Vercel. To deploy your own fork:

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add your API key(s) and `ACTIVE_PROVIDER` as environment variables in the Vercel dashboard
4. Deploy

---

## Notes

- Groq's free tier (12k TPM) is often too limited for the full 5-step agent. Anthropic or OpenAI are more reliable for production use.
- The `maxDuration` on the API route is set to 90 seconds to accommodate longer streamed runs.
- PDF text extraction runs entirely in the browser via `pdfjs-dist` — no file is uploaded to any server.

---

Built with [Vercel AI SDK](https://sdk.vercel.ai) + [Next.js](https://nextjs.org).
