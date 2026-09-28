# Rules — Masal AI FDE Assignment

## Stack (locked)
- Frontend: Next.js 14 App Router + TypeScript + Tailwind, Node 20.x
- Backend: Python 3.11 + FastAPI + Pydantic v2
- AI: Google Gemini 3.1 Flash Lite (`gemini-3.1-flash-lite`) and Gemini 3.6 Flash (`gemini-3.6-flash`), server-side only
- Store: In-memory dict + `seed_leads.json`, localStorage mirror
- Deploy: Frontend Vercel, Backend Render Free, GitHub public

## Hard Constraints
- At least one real AI API call. No hardcoded/canned AI output.
- Free-tier only. No credit card, no paid DB, no Docker.
- Live URL must work with no setup. All links public.
- Deadline: submit by 30th.

## Coding Rules
- Backend validates all AI JSON with Pydantic, regex-extract fallback + 1 retry.
- Frontend never holds `GEMINI_API_KEY`. Only `NEXT_PUBLIC_API_URL`.
- CORS allowlist: `http://localhost:3000` + Vercel URL. No `*` in prod.
- `requirements.txt` pinned. `package.json` pinned. Node 20, Python 3.11.
- No secrets in repo. `.env.example` committed, `.env` gitignored.
- Every AI error surfaces as UI banner, never silent, never fake data.

## Workflow Rules
- Monorepo: `/frontend`, `/backend`, `/docs` at repo root.
- 5 endpoints only: analyze, list leads, get lead, chat, action-kit.
- Score 0-100 + HOT/WARM/COLD + urgency. Always show reasoning.
- Chat must inject full lead JSON into system prompt (grounded).
- Mobile-responsive, scannable in seconds.

## Definition of Done
- `POST /api/analyze` returns valid Analysis in <15s
- List sorts by score, chat cites lead facts, Action Kit copies work
- Live Vercel + Render URLs pass incognito test with no setup
