# Plan — 28th Eve → 30th Submit

## Tonight 28th (3–4h) — Backend + AI live
- [ ] Scaffold `/frontend` (Next.js + TS + Tailwind) + `/backend` (FastAPI)
- [ ] Get `GEMINI_API_KEY` from aistudio.google.com (2 min, free, no card)
- [ ] Implement `POST /api/analyze` with Gemini 2.0 Flash JSON mode
- [ ] In-memory store + `seed_leads.json` (3 seeds: hot/warm/cold)
- [ ] Local test: `uvicorn main:app --reload` + `npm run dev`
- [ ] Push to public GitHub repo

## 29th AM (3h) — Frontend core
- [ ] Intake form with validation (all 6 fields, message textarea)
- [ ] Lead list: score bar, HOT/WARM/COLD pill, urgency flag, sort + filter
- [ ] Detail page: AI cards + copy buttons + loading/empty states
- [ ] `POST /api/leads/{id}/chat` grounded in lead JSON

## 29th PM (3h) — Action Kit + Deploy
- [ ] `POST /api/leads/{id}/action-kit` (talk-track + whatsapp + task)
- [ ] localStorage mirror (`masal-leads-v1`) for Render cold-start
- [ ] Deploy backend → Render (Root `backend`, `pip install -r requirements.txt`, `uvicorn main:app --host 0.0.0.0 --port $PORT`)
- [ ] Deploy frontend → Vercel (Root `frontend`, env `NEXT_PUBLIC_API_URL`)
- [ ] E2E test on live URL with a fresh lead, fix CORS

## 30th AM (2h buffer) — Submit
- [ ] README (what, arch, model + how called, local run, decisions, limits)
- [ ] AI usage disclosure section
- [ ] 3-min Loom: workflow + Action Kit + 1 tech decision (JSON validation fallback)
- [ ] Google Form submit — verify all links public (incognito check)

## Env Checklist
- Render: `GEMINI_API_KEY`, `FRONTEND_URL=https://<vercel-app>.vercel.app`
- Vercel: `NEXT_PUBLIC_API_URL=https://<render-app>.onrender.com`
- Local: `backend/.env`, `frontend/.env.local` (gitignored; commit `.example` files)

## Exit Criteria
Live URL loads, analyze works, no CORS errors, repo public, video ≤3 min.
