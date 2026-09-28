"""Gemini calls — server-side only. All functions raise on missing key/quota (never fake)."""
import json
import os
import re
import time

import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

from schemas import ActionKit, Analysis, Lead, LeadIn
from scoring import apply_guardrails

MODEL_LITE = "gemini-3.1-flash-lite"
MODEL_PRO = "gemini-3.6-flash"
PROMPT_VERSION = "analyze v1 / chat v1 / kit v1"


def _get_model(model_name: str, config: dict = None):
    key = os.getenv("GEMINI_API_KEY", "")
    if not key:
        raise RuntimeError("GEMINI_API_KEY not set")
    genai.configure(api_key=key)
    if config is None:
        config = {"temperature": 0.3, "response_mime_type": "application/json"}
    return genai.GenerativeModel(model_name, generation_config=config)


def _generate(model_choice: str, prompt: str, config: dict = None) -> str:
    """Try requested model; on 429 fall back to the other free-tier model; raise friendly message if both exhausted."""
    if model_choice == "auto":
        models_to_try = [MODEL_LITE, MODEL_PRO]
    elif model_choice == MODEL_LITE:
        models_to_try = [MODEL_LITE, MODEL_PRO]   # fallback to PRO if LITE quota gone
    elif model_choice == MODEL_PRO:
        models_to_try = [MODEL_PRO, MODEL_LITE]   # fallback to LITE if PRO quota gone
    else:
        models_to_try = [model_choice, MODEL_LITE, MODEL_PRO]  # unknown → try all

    opts = {"request_options": {"timeout": 60}}

    for m_name in models_to_try:
        model = _get_model(m_name, config)
        try:
            return model.generate_content(prompt, **opts).text
        except ResourceExhausted:
            continue   # quota hit on this model → try next in chain

    raise Exception("AI limit reached for today — try again after midnight or switch models.")


def _extract_json(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if not m:
            raise
        return json.loads(m.group(0))


ANALYZE_SYS = (
    "You are a real-estate sales analyst. Return STRICT JSON with keys: "
    "summary (2-3 sentences), intent (e.g. ready-to-visit/browsing/price-checking), "
    "key_requirements (3-5 strings), objections (1-4 strings), next_action (one concrete step + when), "
    "suggested_response (copy-paste message to customer), score (0-100 int), "
    "tier (HOT>=75, WARM 50-74, COLD<50), urgency (high/medium/low), reasoning (1-2 lines). "
    "Weights: timeline urgency 40, budget clarity 30, intent specificity 20, objections -10. "
    "PROMPT_VERSION=analyze v1."
)


def analyze_lead(data: LeadIn, model_choice: str = "auto") -> Analysis:
    prompt = f"{ANALYZE_SYS}\nLEAD: {data.model_dump_json()}"
    resp = _generate(model_choice, prompt)
    raw = _extract_json(resp)
    score, tier, urgency = apply_guardrails(
        int(raw.get("score", 50)), data.timeline, data.message
    )
    raw["score"], raw["tier"], raw["urgency"] = score, tier, urgency
    return Analysis(**raw)


def chat_with_lead(lead: Lead, question: str, model_choice: str = "auto") -> str:
    ctx = lead.model_dump_json()
    prompt = (
        "You are a sales coach. Answer ONLY from this lead context. Cite facts "
        "(location/budget/timeline). If unknown, say so. Keep <150 words unless "
        "user asks for a rewrite. PROMPT_VERSION=chat v1.\n"
        f"CONTEXT: {ctx}\nQUESTION: {question}"
    )
    return _generate(model_choice, prompt, config={"temperature": 0.4}).strip()


def generate_action_kit(lead: Lead, model_choice: str = "auto") -> ActionKit:
    from datetime import date, timedelta

    prompt = (
        "Generate STRICT JSON with: talk_track (5-line call script: opener + 3 emphasis "
        "bullets + 1 objection line), whatsapp (personalized, <500 chars, name + next step), "
        "follow_up_title (short task), due_in_days (int 1-14 from timeline+tier). "
        "PROMPT_VERSION=kit v1.\n"
        f"LEAD: {lead.model_dump_json()}"
    )
    raw = _extract_json(_generate(model_choice, prompt))
    due = (date.today() + timedelta(days=int(raw.get("due_in_days", 3)))).isoformat()
    return ActionKit(
        talk_track=raw["talk_track"],
        whatsapp=raw["whatsapp"][:600],
        follow_up_title=raw.get("follow_up_title", f"Follow up with {lead.name}"),
        due_date=due,
    )
