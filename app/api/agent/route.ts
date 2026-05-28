import { streamText, tool, type LanguageModel } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 90

// ─── Provider selection ────────────────────────────────────────────────────────
// Set ACTIVE_PROVIDER in .env.local to switch between providers.
//
// Valid values:
//   anthropic          → claude-haiku-4-5      (recommended, ~$0.002/run)
//   anthropic-sonnet   → claude-sonnet-4-5
//   openai             → gpt-4o-mini
//   openai-gpt4o       → gpt-4o
//   google             → gemini-2.0-flash
//   google-pro         → gemini-1.5-pro
//
// Get keys:
//   Anthropic → https://console.anthropic.com/settings/keys
//   OpenAI    → https://platform.openai.com/api-keys
//   Google    → https://aistudio.google.com/app/apikey

const PROVIDERS: Record<string, LanguageModel> = {
  // ── Anthropic ──────────────────────────────────────────────────────────────
  'anthropic':        anthropic('claude-haiku-4-5-20251001'),
  'anthropic-sonnet': anthropic('claude-sonnet-4-5-20251001'),

  // ── OpenAI ─────────────────────────────────────────────────────────────────
  'openai':           openai('gpt-4o-mini'),
  'openai-gpt4o':     openai('gpt-4o'),

  // ── Google Gemini ──────────────────────────────────────────────────────────
  'google':           google('gemini-2.0-flash'),
  'google-pro':       google('gemini-1.5-pro'),
}

const REQUIRED_KEYS: Record<string, string> = {
  'anthropic':        'ANTHROPIC_API_KEY',
  'anthropic-sonnet': 'ANTHROPIC_API_KEY',
  'openai':           'OPENAI_API_KEY',
  'openai-gpt4o':     'OPENAI_API_KEY',
  'google':           'GOOGLE_GENERATIVE_AI_API_KEY',
  'google-pro':       'GOOGLE_GENERATIVE_AI_API_KEY',
}

// ─── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert Job Application Co-Pilot. You ONLY communicate by calling tools — never write prose or explanations outside of tool arguments.

Call all 5 tools in this exact order, one at a time:
1. fetchCompanyInfo — extract company name + URL from the job description
2. analyzeJobDescription — extract role, skills, responsibilities, culture signals
3. rewriteResumeBullets — rewrite every resume bullet with JD keywords; include ALL sections; give ATS score
4. draftCoverLetter — write a complete 3-4 paragraph cover letter
5. suggestInterviewQuestions — generate 6-8 smart questions to ask

Never skip a tool. Never output plain text — only call tools.`

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const { messages: allMessages } = await req.json()

  // Stateless agent — only the latest user message is needed.
  // Passing full history accumulates tokens across retries.
  const lastUser = [...allMessages].reverse().find((m: { role: string }) => m.role === 'user')
  const messages = lastUser ? [lastUser] : allMessages

  const provider = (process.env.ACTIVE_PROVIDER ?? 'anthropic').toLowerCase()
  const model = PROVIDERS[provider]

  if (!model) {
    return new Response(
      JSON.stringify({
        error: `Unknown provider "${provider}". Valid values: ${Object.keys(PROVIDERS).join(' | ')}`,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const requiredKey = REQUIRED_KEYS[provider]
  if (!process.env[requiredKey]) {
    return new Response(
      JSON.stringify({
        error: `${requiredKey} is not set in .env.local. Get a key at: ${
          provider.startsWith('anthropic') ? 'https://console.anthropic.com/settings/keys' :
          provider.startsWith('openai')    ? 'https://platform.openai.com/api-keys' :
                                             'https://aistudio.google.com/app/apikey'
        }`,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const result = await streamText({
    model,
    system: SYSTEM_PROMPT,
    messages,
    maxSteps: 10,
    // Forces the model to always call a tool — never return plain text.
    // Supported by Anthropic, OpenAI, and Google Gemini via the Vercel AI SDK.
    toolChoice: 'required',
    tools: {
      // ─── Tool 1: Fetch Company Info ───────────────────────────────────────────
      fetchCompanyInfo: tool({
        description: 'Fetch live company website content to understand their mission, values, and culture',
        parameters: z.object({
          companyName: z.string().describe('Company name from the job description'),
          websiteUrl: z.string().describe('Company website URL from the job description'),
        }),
        execute: async ({ companyName, websiteUrl }) => {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 8000)
            const res = await fetch(websiteUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; JobCopilot/1.0)',
                Accept: 'text/html,application/xhtml+xml',
              },
              signal: controller.signal,
            })
            clearTimeout(timeoutId)
            const html = await res.text()
            const text = html
              .replace(/<script[\s\S]*?<\/script>/gi, '')
              .replace(/<style[\s\S]*?<\/style>/gi, '')
              .replace(/<nav[\s\S]*?<\/nav>/gi, '')
              .replace(/<footer[\s\S]*?<\/footer>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 1500)
            return { companyName, fetched: true, websiteContent: text }
          } catch {
            return {
              companyName,
              fetched: false,
              websiteContent: `Could not fetch website — proceeding with general knowledge about ${companyName}.`,
            }
          }
        },
      }),

      // ─── Tool 2: Analyze Job Description ─────────────────────────────────────
      analyzeJobDescription: tool({
        description: 'Extract and structure key requirements, skills, and culture signals from the job description',
        parameters: z.object({
          roleTitle: z.string().describe('Job title'),
          companyName: z.string().describe('Company name'),
          experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
          requiredSkills: z.array(z.string()).describe('Must-have technical and soft skills'),
          niceToHaveSkills: z.array(z.string()).describe('Bonus or preferred skills'),
          keyResponsibilities: z.array(z.string()).describe('Top 5 responsibilities from the JD'),
          culturalSignals: z.array(z.string()).describe('Culture, values, and work style signals from the JD'),
        }),
        execute: async (analysis) => analysis,
      }),

      // ─── Tool 3: Rewrite Resume Bullets ──────────────────────────────────────
      rewriteResumeBullets: tool({
        description: 'Rewrite every resume bullet point to align with the JD using strong action verbs and keywords',
        parameters: z.object({
          sections: z.array(
            z.object({
              sectionTitle: z.string().describe('Section name, e.g. Work Experience, Projects'),
              originalBullets: z.array(z.string()).describe('Original bullets from the resume'),
              rewrittenBullets: z.array(z.string()).describe('Rewritten bullets with JD keywords, metrics, and strong verbs'),
            })
          ).describe('One entry per resume section — include ALL sections'),
          keywordsAdded: z.array(z.string()).describe('JD keywords woven into the rewritten bullets'),
          atsScore: z.number().min(0).max(100).describe('Estimated ATS match score 0-100 after rewrite'),
          atsTips: z.array(z.string()).describe('2-3 additional tips to improve ATS compatibility'),
        }),
        execute: async (result) => result,
      }),

      // ─── Tool 4: Draft Cover Letter ───────────────────────────────────────────
      draftCoverLetter: tool({
        description: 'Write a complete, personalized cover letter for this specific role and company',
        parameters: z.object({
          subject: z.string().describe('Email subject line for the application'),
          coverLetter: z.string().describe('Full cover letter, 3-4 paragraphs. Use [Hiring Manager] as placeholder.'),
          toneNotes: z.string().describe('One sentence on the tone strategy used'),
        }),
        execute: async (result) => result,
      }),

      // ─── Tool 5: Suggest Interview Questions ─────────────────────────────────
      suggestInterviewQuestions: tool({
        description: 'Generate smart, research-backed questions for the applicant to ask the interviewer',
        parameters: z.object({
          questions: z.array(
            z.object({
              question: z.string().describe('The question to ask'),
              whyAsk: z.string().describe('Why this question signals genuine interest and preparation'),
              category: z.enum(['role', 'team', 'company', 'growth', 'culture', 'technical']),
            })
          ).describe('6-8 insightful questions across different categories'),
        }),
        execute: async (result) => result,
      }),
    },
  })

  return result.toDataStreamResponse()
}
