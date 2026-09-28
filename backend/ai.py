"""AI provider layer — Gemini (direct) + OpenRouter (OpenAI-compat).
All functions raise on missing key / exhausted quota — never return fake analysis.
"""
import json
import os
import re
import time

import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

from schemas import ActionKit, Analysis, Lead, LeadIn
from scoring import apply_guardrails

# ── Model constants ────────────────────────────────────────────────────────────
GEMINI_LITE = "gemini-3.1-flash-lite"
GEMINI_PRO  = "gemini-3.6-flash"

# OpenRouter free models — `:free` suffix = zero cost, no card
OR_AUTO     = "openrouter/auto"          # OR smart router — picks best free model
OR_GEMINI   = "google/gemini-2.0-flash-exp:free"
OR_LLAMA    = "meta-llama/llama-3.1-8b-instruct:free"

PROMPT_VERSION = "analyze v1 / chat v1 / kit v1"


# ── Gemini (direct Google AI Studio) ──────────────────────────────────────────
def _generate_gemini(model_name: str, prompt: str, config: dict | None = None) -> str:
    """Call Google AI Studio directly. Raises ResourceExhausted on 429/quota."""
    key = os.getenv("GEMINI_API_KEY", "")
    if not key:
        raise RuntimeError("GEMINI_API_KEY not set")
    genai.configure(api_key=key)
    if config is None:
        config = {"temperature": 0.3, "response_mime_type": "application/json"}
    model = genai.GenerativeModel(model_name, generation_config=config)
    return model.generate_content(prompt, request_options={"timeout": 60}).text


# ── OpenRouter (OpenAI-compatible, free-tier) ──────────────────────────────────
def _generate_openrouter(model_name: str, prompt: str, config: dict | None = None) -> str:
    """Call OpenRouter via the OpenAI SDK. Raises openai.RateLimitError on 429."""
    from openai import OpenAI, RateLimitError  # noqa: F401 (checked below)

    key = os.getenv("OPENROUTER_API_KEY", "")
    if not key:
        raise RuntimeError("OPENROUTER_API_KEY not set")

    temperature = (config or {}).get("temperature", 0.3)
    wants_json  = (config or {}).get("response_mime_type") == "application/json"

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=key,
        default_headers={
            "HTTP-Referer": os.getenv("FRONTEND_URL", "http://localhost:3000"),
            "X-Title": "Masal AI Lead Prioritizer",
        },
    )

    kwargs: dict = dict(
        model=model_name,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        timeout=60,
    )
    # Use json_object mode for structured calls (analyze + kit); chat doesn't need it
    if wants_json:
        kwargs["response_format"] = {"type": "json_object"}

    resp = client.chat.completions.create(**kwargs)
    return resp.choices[0].message.content or ""


# ── Provider dispatcher ────────────────────────────────────────────────────────
def _generate(provider: str, model_name: str, prompt: str, config: dict | None = None) -> str:
    """
    Route to the right provider, fall back across the full chain on 429 / missing key.

    provider:   "gemini" | "openrouter" | "auto"
    model_name: specific model string, or "auto" to use provider default
    """
    from openai import RateLimitError

    # Build fallback chain: [(provider_str, model_str), ...]
    if provider == "gemini":
        m = model_name if model_name not in ("auto", "") else GEMINI_LITE
        chain = [("gemini", m), ("gemini", GEMINI_PRO), ("openrouter", OR_AUTO)]
    elif provider == "openrouter":
        m = model_name if model_name not in ("auto", "") else OR_AUTO
        chain = [("openrouter", m), ("gemini", GEMINI_LITE), ("gemini", GEMINI_PRO)]
    else:  # "auto" — try cheapest Gemini first, then OR as safety net
        chain = [
            ("gemini",      GEMINI_LITE),
            ("gemini",      GEMINI_PRO),
            ("openrouter",  OR_AUTO),
        ]

    last_err: Exception | None = None
    for prov, mdl in chain:
        try:
            if prov == "gemini":
                return _generate_gemini(mdl, prompt, config)
            else:
                return _generate_openrouter(mdl, prompt, config)
        except (ResourceExhausted, RateLimitError) as e:
            last_err = e
            continue  # quota hit — try next in chain
        except RuntimeError:
            # Key not set for this provider — skip it silently
            continue

    raise Exception(
        "All AI providers exhausted for today — try after midnight, "
        "or switch the model in the top-right dropdown."
    )


# ── JSON extractor ─────────────────────────────────────────────────────────────
def _extract_json(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if not m:
            raise
        return json.loads(m.group(0))


# ── Prompts ────────────────────────────────────────────────────────────────────
ANALYZE_SYS = (
    "You are a real-estate sales analyst. Return STRICT JSON with keys: "
    "summary (2-3 sentences), intent (e.g. ready-to-visit/browsing/price-checking), "
    "key_requirements (3-5 strings), objections (0-4 strings, empty list [] if none), "
    "next_action (one concrete step + when), "
    "suggested_response (copy-paste message to customer), score (0-100 int), "
    "tier (HOT>=75, WARM 50-74, COLD<50), urgency (high/medium/low), reasoning (1-2 lines). "
    "Weights: timeline urgency 40, budget clarity 30, intent specificity 20, objections -10. "
    "PROMPT_VERSION=analyze v1."
)


# ── Public functions ───────────────────────────────────────────────────────────
def analyze_lead(data: LeadIn, provider: str = "auto", model_choice: str = "auto") -> Analysis:
    prompt = f"{ANALYZE_SYS}\nLEAD: {data.model_dump_json()}"
    resp = _generate(provider, model_choice, prompt)
    raw = _extract_json(resp)
    score, tier, urgency = apply_guardrails(
        int(raw.get("score", 50)), data.timeline, data.message
    )
    raw["score"], raw["tier"], raw["urgency"] = score, tier, urgency
    return Analysis(**raw)


def chat_with_lead(lead: Lead, question: str, provider: str = "auto", model_choice: str = "auto") -> str:
    ctx = lead.model_dump_json()
    prompt = (
        "You are a sales coach. Answer ONLY from this lead context. Cite facts "
        "(location/budget/timeline). If unknown, say so. Keep <150 words unless "
        "user asks for a rewrite. PROMPT_VERSION=chat v1.\n"
        f"CONTEXT: {ctx}\nQUESTION: {question}"
    )
    # Chat is free-form text — no JSON mode; pass temperature only
    return _generate(provider, model_choice, prompt, config={"temperature": 0.4}).strip()


def generate_action_kit(lead: Lead, provider: str = "auto", model_choice: str = "auto") -> ActionKit:
    from datetime import date, timedelta

    prompt = (
        "Generate STRICT JSON with: talk_track (5-line call script: opener + 3 emphasis "
        "bullets + 1 objection line), whatsapp (personalized, <500 chars, name + next step), "
        "follow_up_title (short task), due_in_days (int 1-14 from timeline+tier). "
        "PROMPT_VERSION=kit v1.\n"
        f"LEAD: {lead.model_dump_json()}"
    )
    raw = _extract_json(_generate(provider, model_choice, prompt))
    due = (date.today() + timedelta(days=int(raw.get("due_in_days", 3)))).isoformat()
    return ActionKit(
        talk_track=raw["talk_track"],
        whatsapp=raw["whatsapp"][:600],
        follow_up_title=raw.get("follow_up_title", f"Follow up with {lead.name}"),
        due_date=due,
    )
