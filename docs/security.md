# Security

## Secrets
- `GEMINI_API_KEY` lives ONLY in Render env + local `backend/.env` (gitignored). Never in frontend, repo, logs, or demo video.
- Frontend exposes only `NEXT_PUBLIC_API_URL` (public, safe).
- Commit `.env.example` with dummy values; verify `.env` + `.env.local` gitignored.

## API Hardening
- CORS allowlist: `http://localhost:3000` + `https://<vercel-app>.vercel.app`. No wildcard in prod.
- Naive rate limit: 30 req/min per IP (middleware) — prevents abuse while link is public.
- Input caps via Pydantic `max_length`: message ≤2000, name/location/requirement/budget/timeline ≤200.
- `GET /api/health` returns `{ ok, has_key: bool }` — never leaks key value.

## Data & Privacy
- Demo data only. UI banner: "Demo — do not enter real PII."
- Backend logs `id + score + latency` only, not full messages.
- Frontend `localStorage` stays on device; provide "Clear demo data" button.
- No auth (interview demo) — call out in README as known limitation + prod path (JWT + per-user store).

## Pre-submit Audit
- [ ] `git grep -ri "AIza" -- .` shows no real key
- [ ] `git check-ignore backend/.env frontend/.env.local` both ignored
- [ ] CORS origins set correctly on Render
- [ ] Incognito test of Vercel URL: intake + chat + kit work, no console key leak
