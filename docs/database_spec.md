# Database Spec — In-memory (brief-compliant)

Brief allows "in-memory or a real database". We choose in-memory for zero setup/cost/risk.

## Entity: Lead
```json
{
  "id": "uuid4",
  "name": "string ≤200",
  "location": "string ≤200",
  "requirement": "string (e.g. 2BHK resale)",
  "budget": "string (e.g. 70-80L)",
  "timeline": "string (e.g. within 2 months)",
  "message": "string ≤2000 (inquiry/transcript)",
  "created_at": "iso-datetime",
  "analysis": {
    "summary": "2-3 sentences",
    "intent": "e.g. ready-to-visit / browsing / price-checking",
    "key_requirements": ["3-5 items"],
    "objections": ["1-4 items"],
    "next_action": "one concrete step + when",
    "suggested_response": "copy-paste message",
    "score": "0-100 int",
    "tier": "HOT | WARM | COLD",
    "urgency": "high | medium | low",
    "reasoning": "1-2 lines why this score"
  },
  "chat_history": [{ "role": "user|assistant", "text": "string" }],
  "action_kit": {
    "talk_track": "string (multi-line)",
    "whatsapp": "string ≤500ch",
    "follow_up_title": "string",
    "due_date": "iso-date"
  }
}
```

## Scoring (`scoring.py`)
- Model proposes 0-100; backend applies guardrails:
  - timeline contains `immediate|urgent|asap|this week|2 weeks` → `score = max(score, 75)`
  - `len(message.strip()) < 10` → `score = min(score, 50)`
  - Tier: `≥75 HOT`, `50–74 WARM`, `<50 COLD`
  - Urgency: derived from timeline keywords (high: immediate/week, medium: month, else low) unless model sets it.
- Sort default: `score desc`, tie-break `urgency high first`, then `created_at desc`.

## Seed Data (`backend/seed_leads.json`)
1. **Hot** — Rohan, Pune, 2BHK ≤80L, 2 months, "visited site, need loan help, ready for token" → ~85
2. **Warm** — Sara, Mumbai, 1BHK rental-to-buy, 3-6 months, "just browsing options" → ~60
3. **Cold** — Test, vague message "hi rates?" → ~30

Loaded into dict on startup. Analyzed live on first boot if analysis missing, then cached.

## Persistence Notes
- Render free disk is ephemeral — restarts clear custom leads, seeds reload. Document in README.
- Frontend mirrors list to `localStorage key=masal-leads-v1` for instant render during cold-start; backend is source of truth on refresh.
- Upgrade path (no frontend change): swap dict → SQLite via SQLAlchemy using same Pydantic schemas.

## Limits
No cross-device sync, no auth scoping. Fine for interview demo.
