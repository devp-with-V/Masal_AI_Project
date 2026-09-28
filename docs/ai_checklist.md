# AI Checklist

## Model (locked)
- **Gemini 3.1 Flash Lite** (`gemini-3.1-flash-lite`) with fallback to **Gemini 3.6 Flash** (`gemini-3.6-flash`), `temperature=0.3`, JSON mode.
- Key: https://aistudio.google.com → Get API Key (free, no card, ~1500 req/day).
- Why best for this brief: free-tier generous, fast (<8s), reliable strict-JSON, no card vs OpenRouter/Groq tighter limits.
- Fallback on `429/quota`: UI banner "AI quota hit — retry in 60s" + 1 auto-retry with backoff. Never return fake analysis (brief forbids canned responses).

## Calls (all in `backend/ai.py`, server-side only)
1. `analyze_lead(lead_in: LeadIn) -> Analysis` — full schema incl. score/tier/urgency/reasoning.
2. `chat_with_lead(lead: Lead, history, question) -> str` — system prompt injects `lead.json + analysis.json`.
3. `generate_action_kit(lead) -> ActionKit` — talk_track + whatsapp + follow_up.

## Prompt Versions (log these)
- `analyze v1`: "Real-estate sales analyst. STRICT JSON. Weights: timeline 40, budget clarity 30, intent specificity 20, objections -10."
- `chat v1`: "Answer ONLY from provided lead context. Cite facts. If unknown say so. Keep <150 words unless rewrite requested."
- `kit v1`: "Talk-track 5 lines, whatsapp <500ch with name+next step, follow-up title + due offset days."

## Validation
- `response_mime_type="application/json"` for analyze/kit; `json.loads` → Pydantic → on fail regex-extract `{...}` → retry once → else HTTP 502 with raw preview (debug only).
- Log: `lead_id, latency_ms, prompt_version` — never full PII in prod logs.

## Manual Tests (run on live URL before recording)
- [ ] Hot intake: "2BHK Pune under 80L, need in 2 months, visited site, worried about loan" → expect ≥75 HOT
- [ ] Chat: "what should I emphasize on the call?" → must mention location/budget/timeline facts
- [ ] Chat: "make my reply more assertive" → rewrites suggested_response, same facts, firmer CTA
- [ ] Kit: all 3 parts present, WhatsApp copies

## Cost
$0. Estimated <200 calls for build + demo + interview.
