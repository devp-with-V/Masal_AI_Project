import re

HOT_KEYWORDS = ("immediate", "urgent", "asap", "this week", "2 weeks", "15 days", "token")
MED_KEYWORDS = ("month", "weeks", "visit", "loan", "site")


def infer_urgency(timeline: str) -> str:
    t = timeline.lower()
    if any(k in t for k in HOT_KEYWORDS):
        return "high"
    if any(k in t for k in MED_KEYWORDS):
        return "medium"
    if re.search(r"\b(just|browsing|6 months|exploring)\b", t):
        return "low"
    return "medium"


def apply_guardrails(score: int, timeline: str, message: str) -> tuple[int, str, str]:
    """Clamp model score with deterministic rules. Returns (score, tier, urgency)."""
    score = max(0, min(100, int(score)))
    tl = timeline.lower()
    if any(k in tl for k in ("immediate", "urgent", "asap", "this week")):
        score = max(score, 75)
    if len(message.strip()) < 10:
        score = min(score, 50)
    tier = "HOT" if score >= 75 else ("WARM" if score >= 50 else "COLD")
    return score, tier, infer_urgency(timeline)
