# Job Application Co-Pilot

Paste a job description and your resume. In under 30 seconds, get a tailored resume rewrite, personalized cover letter, and smart interview questions — powered by a 5-step AI agent.

**[🚀 Live Demo →](https://job-search-copilot-git-main-ispaceified-9530s-projects.vercel.app/)**

---

## Screenshot
<img width="1166" height="697" alt="image" src="https://github.com/user-attachments/assets/950303b1-aeac-4795-83ee-012e3cd20cb0" />

---

## Supported providers

> ⚠️ **Only Anthropic, OpenAI, and Google Gemini are supported.**
> Groq and NVIDIA NIM are intentionally excluded — their hosted APIs do not
> reliably support `toolChoice: 'required'` with multi-tool streaming agents,
> which this app depends on.

| `ACTIVE_PROVIDER` | Model | Cost |
|-------------------|-------|------|
| `anthropic` *(recommended)* | claude-haiku-4-5 | ~$0.002/run · free $5 on signup |
| `anthropic-sonnet` | claude-sonnet-4-5 | ~$0.015/run |
| `openai` | gpt-4o-mini | ~$0.003/run |
| `openai-gpt4o` | gpt-4o | ~$0.02/run |
| `google` | gemini-2.0-flash | free tier available |
| `google-pro` | gemini-1.5-pro | pay-as-you-go |

---

## What it does

Runs a five-step agentic pipeline on every submission:

| Step | Tool | Output |
|------|------|--------|
| 1 | `fetchCompanyInfo` | Fetches the company website live |
| 2 | `analyzeJobDescription` | Extracts skills, responsibilities, culture signals |
| 3 | `rewriteResumeBullets` | Rewrites every bullet with JD keywords + ATS score |
| 4 | `draftCoverLetter` | Full 3–4 paragraph cover letter with subject line |
| 5 | `suggestInterviewQuestions` | 6–8 smart questions to ask the interviewer |

All steps stream in real time.

---

## Tech stack

- **[Vercel AI SDK](https://sdk.vercel.ai)** — `streamText` + `toolChoice: 'required'` for reliable multi-step tool calling
- **Next.js 14** (App Router) · **TypeScript** · **Zod** · **Tailwind CSS**
- **pdfjs-dist** — PDF parsing runs entirely in the browser

---

## Getting started

```bash
git clone https://github.com/vieveksharmaa/job-search-copilot.git
cd job-search-copilot
npm install
```

Copy `.env.example` to `.env.local` and fill in one API key:

```bash
cp .env.example .env.local
```

```env
# Recommended — ~$0.002 per run, free $5 credit on signup
ACTIVE_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-key-here

# Or use OpenAI
# ACTIVE_PROVIDER=openai
# OPENAI_API_KEY=your-key-here

# Or use Google Gemini (free tier available)
# ACTIVE_PROVIDER=google
# GOOGLE_GENERATIVE_AI_API_KEY=your-key-here
```

Get keys:
- Anthropic → [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
- OpenAI → [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Google → [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add `ACTIVE_PROVIDER` + the matching API key as environment variables
4. Deploy

---

## Project structure

```
app/
  page.tsx              # Landing page
  copilot/page.tsx      # Main app
  api/agent/route.ts    # Streaming agent (all 5 tools + provider config)
components/
  LeftPanel.tsx         # Inputs (name, JD, resume, PDF upload)
  RightPanel.tsx        # Agent trace / step progress
  OutputTabs.tsx        # Tabbed output view
  ToolCard.tsx          # Individual tool result card
```
