# NeuralCV — AI Resume Intelligence

> Paste your resume and a job description. Get your ATS score, skills gaps, missing keywords, and rewrite suggestions in seconds.

**Live Demo:** https://neuralcv.vercel.app
**npm CLI:** `npm install -g neuralcv`
**Built for:** LovHack Season 2

---

## What It Does

NeuralCV analyzes your resume against any job description and returns:

| Output | Description |
|--------|-------------|
| **ATS Score** | 0–100 compatibility score |
| **Skills Match %** | Percentage alignment with role requirements |
| **Missing Keywords** | Top 5 terms the ATS is looking for |
| **Strengths** | What your resume already does well |
| **Weaknesses** | Critical gaps for this specific role |
| **Rewrite Suggestions** | Before/after rewrites with reasoning |

---

## Web App

**Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Framer Motion · OpenAI GPT-4o-mini

### Run locally

```bash
git clone https://github.com/yourusername/neuralcv
cd neuralcv-web
npm install
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000

---

## CLI

```bash
npm install -g neuralcv
neuralcv analyze
```

Follow the prompts to paste your resume and job description. Results appear in your terminal with color-coded output.

### Run without installing

```bash
npx neuralcv analyze
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `OPENAI_BASE_URL` | No | Override to use Featherless AI or other OpenAI-compatible API |

---

## Deployment

Deploy to Vercel in one click:

1. Push to GitHub
2. Import repo in Vercel
3. Add `OPENAI_API_KEY` environment variable
4. Deploy

---

## License

MIT
