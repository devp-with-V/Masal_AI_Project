export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

export type Tier = "HOT" | "WARM" | "COLD";

export interface Analysis {
  summary: string;
  intent: string;
  key_requirements: string[];
  objections: string[];
  next_action: string;
  suggested_response: string;
  score: number;
  tier: Tier;
  urgency: "high" | "medium" | "low";
  reasoning: string;
}

export interface ActionKit {
  talk_track: string;
  whatsapp: string;
  follow_up_title: string;
  due_date: string;
}

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  phone?: string;
  location: string;
  requirement: string;
  budget: string;
  timeline: string;
  message: string;
  analysis: Analysis | null;
  chat_history?: { role: string; text: string }[];
  action_kit?: ActionKit | null;
  closed?: boolean;
  close_reason?: string;
}

export interface LeadIn {
  name: string;
  phone?: string;
  location: string;
  requirement: string;
  budget: string;
  timeline: string;
  message: string;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem("masal-selection") || "auto|auto" : "auto|auto";
  const [provider, model] = stored.includes("|") ? stored.split("|") : ["auto", stored];
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Provider-Select": provider,
      "X-Model-Select": model,
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => req<{ ok: boolean; providers: { gemini: boolean; openrouter: boolean }; leads: number }>("/api/health"),
  analyze: (data: LeadIn) =>
    req<Lead>("/api/analyze", { method: "POST", body: JSON.stringify(data) }),
  list: () => req<Lead[]>("/api/leads?sort=score"),
  get: (id: string) => req<Lead>(`/api/leads/${id}`),
  chat: (id: string, question: string) =>
    req<{ answer: string }>(`/api/leads/${id}/chat`, {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
  kit: (id: string) => req<ActionKit>(`/api/leads/${id}/action-kit`, { method: "POST" }),
  close: (id: string, reason: string) => req<Lead>(`/api/leads/${id}/close`, { method: "POST", body: JSON.stringify({ reason }) }),
  reopen: (id: string, update: string) => req<Lead>(`/api/leads/${id}/reopen`, { method: "POST", body: JSON.stringify({ update }) }),
  briefing: () => req<{ briefing: string }>("/api/briefing"),
};

const LS_KEY = "masal-leads-v1";
export const cache = {
  save: (leads: Lead[]) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(leads));
    } catch {}
  },
  load: (): Lead[] => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {
      return [];
    }
  },
};
