from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field

Tier = Literal["HOT", "WARM", "COLD"]
Urgency = Literal["high", "medium", "low"]


class LeadIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    location: str = Field(min_length=1, max_length=200)
    requirement: str = Field(min_length=1, max_length=200)
    budget: str = Field(min_length=1, max_length=200)
    timeline: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=2000)


class Analysis(BaseModel):
    summary: str
    intent: str
    key_requirements: list[str] = Field(min_length=0, max_length=5)
    objections: list[str] = Field(min_length=0, max_length=4)
    next_action: str
    suggested_response: str
    score: int = Field(ge=0, le=100)
    tier: Tier
    urgency: Urgency
    reasoning: str


class ChatMsg(BaseModel):
    role: Literal["user", "assistant"]
    text: str = Field(max_length=2000)


class ActionKit(BaseModel):
    talk_track: str
    whatsapp: str = Field(max_length=600)
    follow_up_title: str
    due_date: str  # ISO date YYYY-MM-DD


class Lead(BaseModel):
    id: str
    created_at: str
    chat_history: list[ChatMsg] = []
    action_kit: Optional[ActionKit] = None
    analysis: Optional[Analysis] = None
    # LeadIn fields flattened
    name: str
    location: str
    requirement: str
    budget: str
    timeline: str
    message: str

    @classmethod
    def from_input(cls, lead_id: str, data: LeadIn, analysis: Optional[Analysis] = None) -> "Lead":
        return cls(
            id=lead_id,
            created_at=datetime.utcnow().isoformat() + "Z",
            analysis=analysis,
            **data.model_dump(),
        )


class ChatReq(BaseModel):
    question: str = Field(min_length=1, max_length=1000)


class ChatRes(BaseModel):
    answer: str
