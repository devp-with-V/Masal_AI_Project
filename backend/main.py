import json
import os
import time
import uuid
from collections import defaultdict
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ai import analyze_lead, chat_with_lead, generate_action_kit, generate_briefing
from schemas import ActionKit, ChatMsg, ChatReq, ChatRes, Lead, LeadIn

load_dotenv()

app = FastAPI(title="Masal AI — Lead Prioritizer")

origins = [
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", "").rstrip("/"),
]
origins = [o for o in origins if o]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- naive rate limit: 30 req/min per IP ---
_hits: dict[str, list[float]] = defaultdict(list)


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        ip = request.client.host if request.client else "anon"
        now = time.time()
        _hits[ip] = [t for t in _hits[ip] if now - t < 60]
        if len(_hits[ip]) >= 30:
            return JSONResponse({"detail": "Rate limit: 30 req/min"}, status_code=429)
        _hits[ip].append(now)
    return await call_next(request)


STORE: dict[str, Lead] = {}


def _sort_key(l: Lead):
    urg = {"high": 0, "medium": 1, "low": 2}
    s = l.analysis.score if l.analysis else -1
    u = urg.get(l.analysis.urgency if l.analysis else "low", 2)
    return (-s, u, l.created_at)


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "providers": {
            "gemini": bool(os.getenv("GEMINI_API_KEY")),
            "openrouter": bool(os.getenv("OPENROUTER_API_KEY")),
        },
        "leads": len(STORE),
    }


@app.get("/health")
def root_health():
    return health()


@app.post("/api/analyze", response_model=Lead)
def create_lead(data: LeadIn, request: Request):
    provider_choice = request.headers.get("x-provider-select", "auto")
    model_choice    = request.headers.get("x-model-select", "auto")
    try:
        analysis = analyze_lead(data, provider_choice, model_choice)
    except RuntimeError as e:
        raise HTTPException(500, f"AI config error: {e}")
    except Exception as e:
        raise HTTPException(502, f"AI call failed: {str(e)[:300]}")
    lead = Lead.from_input(str(uuid.uuid4()), data, analysis)
    STORE[lead.id] = lead
    save_store()
    return lead


@app.get("/api/leads", response_model=list[Lead])
def list_leads(sort: str = "score"):
    leads = list(STORE.values())
    if sort == "score":
        leads.sort(key=_sort_key)
    return leads


@app.get("/api/leads/{lead_id}", response_model=Lead)
def get_lead(lead_id: str):
    lead = STORE.get(lead_id)
    if not lead:
        raise HTTPException(404, "Lead not found (Render may have restarted — seeds reload)")
    return lead


@app.post("/api/leads/{lead_id}/chat", response_model=ChatRes)
def chat(lead_id: str, body: ChatReq, request: Request):
    provider_choice = request.headers.get("x-provider-select", "auto")
    model_choice    = request.headers.get("x-model-select", "auto")
    lead = STORE.get(lead_id)
    if not lead:
        raise HTTPException(404, "Lead not found")
    try:
        answer = chat_with_lead(lead, body.question, provider_choice, model_choice)
    except RuntimeError as e:
        raise HTTPException(500, f"AI config error: {e}")
    except Exception as e:
        raise HTTPException(502, f"AI call failed: {str(e)[:300]}")
    lead.chat_history.append(ChatMsg(role="user", text=body.question))
    lead.chat_history.append(ChatMsg(role="assistant", text=answer))
    save_store()
    return ChatRes(answer=answer)


@app.post("/api/leads/{lead_id}/action-kit", response_model=ActionKit)
def action_kit(lead_id: str, request: Request):
    provider_choice = request.headers.get("x-provider-select", "auto")
    model_choice    = request.headers.get("x-model-select", "auto")
    lead = STORE.get(lead_id)
    if not lead:
        raise HTTPException(404, "Lead not found")
    if not lead.analysis:
        raise HTTPException(400, "Lead has no analysis yet")
    try:
        kit = generate_action_kit(lead, provider_choice, model_choice)
    except RuntimeError as e:
        raise HTTPException(500, f"AI config error: {e}")
    except Exception as e:
        raise HTTPException(502, f"AI call failed: {str(e)[:300]}")
    lead.action_kit = kit
    save_store()
    return kit


from pydantic import BaseModel
class CloseReq(BaseModel):
    reason: str

@app.post("/api/leads/{lead_id}/close", response_model=Lead)
def close_lead(lead_id: str, body: CloseReq):
    if lead_id not in STORE:
        raise HTTPException(404, "Lead not found")
    STORE[lead_id].closed = True
    STORE[lead_id].close_reason = body.reason
    save_store()
    return STORE[lead_id]


class ReopenReq(BaseModel):
    update: str

@app.post("/api/leads/{lead_id}/reopen", response_model=Lead)
def reopen_lead(lead_id: str, body: ReopenReq, request: Request):
    if lead_id not in STORE:
        raise HTTPException(404, "Lead not found")
    
    lead = STORE[lead_id]
    # Append the new update to the message
    lead.message = f"{lead.message}\n\n[UPDATE - REOPENED]: {body.update}"
    
    # Re-analyze
    provider_choice = request.headers.get("x-provider-select", "auto")
    model_choice    = request.headers.get("x-model-select", "auto")
    
    # Construct a LeadIn object for the analyze_lead function
    lead_in = LeadIn(
        name=lead.name,
        phone=lead.phone,
        location=lead.location,
        requirement=lead.requirement,
        budget=lead.budget,
        timeline=lead.timeline,
        message=lead.message
    )
    
    try:
        new_analysis = analyze_lead(lead_in, provider_choice, model_choice)
    except RuntimeError as e:
        raise HTTPException(500, f"AI config error: {e}")
    except Exception as e:
        raise HTTPException(502, f"AI call failed: {str(e)[:300]}")
        
    lead.analysis = new_analysis
    lead.closed = False
    lead.close_reason = None
    
    # Also invalidate the action kit so they have to generate a new one based on the new context
    lead.action_kit = None
    save_store()
    return lead



STORE_FILE = Path(__file__).parent / "store.json"

def save_store():
    try:
        data = {k: v.model_dump() for k, v in STORE.items()}
        STORE_FILE.write_text(json.dumps(data))
    except Exception as e:
        print(f"Error saving store: {e}")

def load_store():
    try:
        if STORE_FILE.exists():
            data = json.loads(STORE_FILE.read_text())
            for k, v in data.items():
                STORE[k] = Lead(**v)
            return True
    except Exception as e:
        print(f"Error loading store: {e}")
    return False

@app.get("/api/briefing")
def daily_briefing(request: Request):
    provider_choice = request.headers.get("x-provider-select", "auto")
    model_choice = request.headers.get("x-model-select", "auto")
    try:
        text = generate_briefing(list(STORE.values()), provider_choice, model_choice)
    except Exception as e:
        raise HTTPException(502, f"Briefing failed: {str(e)[:300]}")
    return {"briefing": text}

@app.on_event("startup")
def load_seeds():
    """Load seeds instantly; analyze in background so boot never blocks."""
    if load_store() and STORE:
        return # Skip seeds if we have persisted data

    import threading
    path = Path(__file__).parent / "seed_leads.json"
    try:
        raw = json.loads(path.read_text())
    except Exception:
        return
    for item in raw:
        try:
            data = LeadIn(**item)
        except Exception:
            continue
        lid = str(uuid.uuid4())
        STORE[lid] = Lead.from_input(lid, data, None)
    save_store()

    def _analyze_all():
        ids = list(STORE.keys())
        for i, lid in enumerate(ids):
            if i > 0:
                time.sleep(15)  # free tier RPM — stagger
            lead = STORE.get(lid)
            if not lead or lead.analysis or not os.getenv("GEMINI_API_KEY"):
                continue
            try:
                lead.analysis = analyze_lead(LeadIn(**lead.model_dump(include={"name", "location", "requirement", "budget", "timeline", "message"})))
            except Exception:
                continue  # stays unanalyzed; UI shows "analyzing…"

    threading.Thread(target=_analyze_all, daemon=True).start()
