# Job Application Co-Pilot — Setup

## 1. Install dependencies

```bash
npm install
```

## 2. Get a Google AI API key

Go to → https://aistudio.google.com/app/apikey → Create API Key

## 3. Add your key

Create `.env.local` in the project root:

```
GOOGLE_GENERATIVE_AI_API_KEY=your-key-here
```

## 4. Run

```bash
npm run dev
```

Open http://localhost:3000

---

## How it works

The agent runs 5 tools in sequence on the server (`streamText` with `maxSteps: 10`):

| Step | Tool | What it does |
|------|------|-------------|
| 1 | `fetchCompanyInfo` | Fetches the company website live |
| 2 | `analyzeJobDescription` | Extracts skills, responsibilities, culture signals |
| 3 | `rewriteResumeBullets` | Rewrites every bullet with JD keywords + ATS score |
| 4 | `draftCoverLetter` | Writes a full personalized cover letter |
| 5 | `suggestInterviewQuestions` | Generates 6-8 research-backed questions |

All tool calls stream in real time — you see each step light up as it completes.
