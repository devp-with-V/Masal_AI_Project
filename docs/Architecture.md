# Architecture

```
Browser → Vercel (Next.js App Router) → Render (FastAPI) → Gemini 2.0 Flash
            └ localStorage mirror            └ in-memory leads[]
```

## Frontend (`/frontend`)
- `app/page.tsx` — intake form (left) + lead list with sort/filter (right)
- `app/leads/[id]/page.tsx` — detail: lead facts, AI cards, chat, Action Kit
- `lib/api.ts` — fetch wrapper using `NEXT_PUBLIC_API_URL`
- `components/` — ScoreBar, TierPill, CopyButton, ChatBox, ActionKitCard
- No AI key here. Handles warm-up skeleton, error banners, empty states.

## Backend (`/backend`)
- `main.py` — FastAPI app, CORS, 5 routes, seed load on startup
- `schemas.py` — Pydantic: `LeadIn`, `Analysis`, `Lead`, `ChatReq`, `ChatRes`, `ActionKit`
- `ai.py` — `analyze_lead()`, `chat_with_lead()`, `generate_action_kit()`; strict-JSON prompt, temp 0.3, 1 retry
- `scoring.py` — guardrails + tier map (see database_spec)
- `seed_leads.json` — 3 demo leads (hot buyer / warm browser / cold query)
- `requirements.txt` — pinned: fastapi, uvicorn, pydantic v2, google-generativeai, python-dotenv

## Endpoints
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/analyze` | Create + analyze + score + store, returns Lead |
| GET | `/api/leads?sort=score` | Ranked list |
| GET | `/api/leads/{id}` | Detail + analysis |
| POST | `/api/leads/{id}/chat` | Grounded follow-up Q&A |
| POST | `/api/leads/{id}/action-kit` | Talk-track + WhatsApp + task |
| GET | `/api/health` | Warm-up ping + key check (no secret leak) |

## AI Prompting
- **Analyze:** system "You are a real-estate sales analyst. Return STRICT JSON matching schema." + lead fields. `response_mime_type=application/json`.
- **Chat:** system = lead JSON + analysis JSON + "Answer ONLY from this context. If unknown, say so."
- **Action-Kit:** system = analysis JSON + "Generate talk_track (5 lines), whatsapp (<500ch), follow_up title + due offset."

## Key Decisions (for interview)
1. Server-side AI → protects key, enables Pydantic validation.
2. In-memory over Postgres → zero ops risk, brief-allowed, localStorage covers cold-start.
3. Strict JSON + fallback parser → demo never breaks on model drift.
