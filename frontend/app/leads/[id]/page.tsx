"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CopyButton, ScoreBar, TierPill } from "@/components/ui";
import { api, type Lead, type Tier } from "@/lib/api";

/* ── Per-tier design tokens ──────────────────────────────────── */
function theme(tier: Tier | null | undefined, closed?: boolean) {
  if (closed) {
    return {
      bg:       "bg-stone-950",
      header:   "bg-stone-900/40 border-stone-800 backdrop-blur-md grayscale opacity-80",
      card:     "bg-stone-900/30 border-stone-800 grayscale opacity-80",
      accent:   "text-stone-500",
      chip:     "bg-stone-900 border-stone-800 text-stone-500",
      btn:      "bg-stone-800 text-stone-500 cursor-not-allowed",
      btnOut:   "border-stone-800 text-stone-500 cursor-not-allowed",
      chat:     { user: "bg-stone-900 border-stone-800", ai: "bg-stone-900/50 border-stone-800" },
      pulse:    "",
      blob:     "bg-transparent",
      label:    "CLOSED",
      labelCls: "bg-stone-900 text-stone-500 border-stone-800",
      input:    "bg-stone-900 border-stone-800 text-stone-500 placeholder-stone-700",
      badge:    "text-stone-500",
    };
  }

  switch (tier) {
    case "HOT":
      return {
        bg:       "bg-gradient-to-br from-red-950 via-stone-950 to-stone-950",
        header:   "bg-red-950/70 border-red-900/50 backdrop-blur-md",
        card:     "bg-red-950/25 border-red-900/40",
        accent:   "text-red-400",
        chip:     "bg-red-900/40 border-red-800/60 text-red-300",
        btn:      "bg-red-700 hover:bg-red-600 text-white shadow-md shadow-red-900/40",
        btnOut:   "border-red-800 text-red-400 hover:bg-red-950/60",
        chat:     { user: "bg-red-950/50 border-red-900/40", ai: "bg-stone-900/60 border-stone-800" },
        pulse:    "hot-pulse",
        blob:     "bg-red-700",
        label:    "URGENT",
        labelCls: "bg-red-900/60 text-red-300 border-red-800",
        input:    "bg-red-950/40 border-red-900/60 focus:border-red-700 text-stone-100 placeholder-red-900/70",
        badge:    "text-red-400",
      };
    case "WARM":
      return {
        bg:       "bg-gradient-to-br from-amber-950 via-stone-950 to-stone-950",
        header:   "bg-amber-950/70 border-amber-900/50 backdrop-blur-md",
        card:     "bg-amber-950/25 border-amber-900/40",
        accent:   "text-amber-400",
        chip:     "bg-amber-900/40 border-amber-800/60 text-amber-300",
        btn:      "bg-amber-700 hover:bg-amber-600 text-white shadow-md shadow-amber-900/40",
        btnOut:   "border-amber-800 text-amber-400 hover:bg-amber-950/60",
        chat:     { user: "bg-amber-950/50 border-amber-900/40", ai: "bg-stone-900/60 border-stone-800" },
        pulse:    "warm-breathe",
        blob:     "bg-amber-700",
        label:    "FOLLOW UP",
        labelCls: "bg-amber-900/60 text-amber-300 border-amber-800",
        input:    "bg-amber-950/40 border-amber-900/60 focus:border-amber-700 text-stone-100 placeholder-amber-900/60",
        badge:    "text-amber-400",
      };
    case "COLD":
      return {
        bg:       "bg-gradient-to-br from-blue-950 via-stone-950 to-stone-950",
        header:   "bg-blue-950/70 border-blue-900/50 backdrop-blur-md",
        card:     "bg-blue-950/25 border-blue-900/40",
        accent:   "text-blue-400",
        chip:     "bg-blue-950/60 border-blue-900/60 text-blue-300",
        btn:      "bg-blue-800 hover:bg-blue-700 text-white shadow-md shadow-blue-900/40",
        btnOut:   "border-blue-900 text-blue-400 hover:bg-blue-950/60",
        chat:     { user: "bg-blue-950/50 border-blue-900/40", ai: "bg-stone-900/60 border-stone-800" },
        pulse:    "cold-drift",
        blob:     "bg-blue-700",
        label:    "LOW PRIORITY",
        labelCls: "bg-blue-950/60 text-blue-300 border-blue-900",
        input:    "bg-blue-950/40 border-blue-900/60 focus:border-blue-700 text-stone-100 placeholder-blue-900/60",
        badge:    "text-blue-400",
      };
    default:
      return {
        bg:       "bg-stone-950",
        header:   "bg-stone-900/70 border-stone-800 backdrop-blur-md",
        card:     "bg-stone-900/50 border-stone-800",
        accent:   "text-stone-400",
        chip:     "bg-stone-800 border-stone-700 text-stone-400",
        btn:      "bg-red-700 hover:bg-red-600 text-white",
        btnOut:   "border-stone-700 text-stone-400 hover:bg-stone-800",
        chat:     { user: "bg-stone-800/60 border-stone-700", ai: "bg-stone-900/60 border-stone-800" },
        pulse:    "",
        blob:     "bg-stone-700",
        label:    "ANALYSING",
        labelCls: "bg-stone-800 text-stone-400 border-stone-700",
        input:    "bg-stone-800/60 border-stone-700 focus:border-stone-600 text-stone-100 placeholder-stone-600",
        badge:    "text-stone-400",
      };
  }
}

/* ── Component ───────────────────────────────────────────────── */
export default function Detail({ params }: { params: { id: string } }) {
  const { id } = params;
  const [lead, setLead] = useState<Lead | null>(null);
  const [q, setQ] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [kitLoading, setKitLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const load = async () => {
    try {
      setLead(await api.get(id));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Load failed";
      if (msg.includes("Lead not found")) {
        router.push("/dashboard?refreshed=true");
      } else {
        setError(msg);
      }
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const ask = async (preset?: string) => {
    const question = preset || q;
    if (!question.trim()) return;
    setChatLoading(true);
    setError("");
    try {
      await api.chat(id, question);
      setQ("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setChatLoading(false);
    }
  };

  const kit = async () => {
    setKitLoading(true);
    setError("");
    try {
      await api.kit(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action Kit failed");
    } finally {
      setKitLoading(false);
    }
  };

  const [closeModal, setCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [closing, setClosing] = useState(false);

  const handleCloseLead = async () => {
    if (!closeReason.trim()) return;
    setClosing(true);
    try {
      await api.close(id, closeReason);
      setCloseModal(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to close lead");
    } finally {
      setClosing(false);
    }
  };

  const tier = lead?.analysis?.tier;
  const t = theme(tier, lead?.closed);
  const a = lead?.analysis;

  /* Loading / error fallback */
  if (!lead)
    return (
      <div className="h-screen bg-stone-950 flex items-center justify-center text-stone-500 text-sm">
        {error || "Loading lead…"}
      </div>
    );

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${t.bg}`}>

      {/* ── Atmospheric background blobs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute top-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl ${t.blob} opacity-10 ${t.pulse}`}
        />
        <div
          className={`absolute bottom-1/3 left-1/4 w-56 h-56 rounded-full blur-3xl ${t.blob} opacity-5 ${t.pulse}`}
          style={{ animationDelay: "1.8s" }}
        />
      </div>

      {/* ── Fixed header ── */}
      <header
        className={`relative z-20 flex-shrink-0 flex items-center gap-4 px-5 py-3 border-b ${t.header}`}
      >
        <Link
          href="/dashboard"
          className={`text-xs border rounded-lg px-3 py-1.5 transition-colors ${t.btnOut}`}
        >
          ← All leads
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-stone-100 truncate">
            {lead.name}
            <span className="font-normal text-stone-500 text-sm"> · {lead.location}</span>
          </h1>
        </div>
        <TierPill tier={tier} />
        {tier && (
          <span className={`hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded border ${t.labelCls}`}>
            {t.label}
          </span>
        )}
      </header>

      {/* ── Error banner ── */}
      {error && (
        <div className="relative z-20 flex-shrink-0 mx-5 mt-3 bg-red-950/60 border border-red-900/60 text-red-300 text-xs rounded-lg p-2.5 flex justify-between">
          {error}
          <button onClick={() => setError("")} className="ml-3 text-red-500">✕</button>
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="relative z-10 flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto">
          
          {/* ── Left column: Analysis (Independently scrollable) ── */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
            <div className="space-y-4 pr-1">
              {/* Lead facts */}
              <Card title="Lead facts" className={t.card}>
                <p className="text-sm text-stone-300">{lead.requirement} · {lead.budget} · {lead.timeline}</p>
                <p className={`text-xs mt-1.5 italic ${t.accent}`}>&ldquo;{lead.message}&rdquo;</p>
                <div className="mt-3"><ScoreBar score={a?.score} /></div>
                {a && (
                  <p className="text-xs text-stone-500 mt-2">{a.reasoning} · urgency{" "}
                    <span className={t.badge}>{a.urgency}</span>
                  </p>
                )}
              </Card>

              {a && (
                <>
                  {/* Summary & intent */}
                  <Card title="Summary & intent" className={t.card}>
                    <p className="text-sm text-stone-200 leading-relaxed">{a.summary}</p>
                    <p className={`text-xs mt-2 ${t.accent}`}>Intent: {a.intent}</p>
                  </Card>

                  {/* Key requirements */}
                  <Card title="Key requirements" className={t.card}>
                    <div className="flex flex-wrap gap-1.5">
                      {a.key_requirements.map((r) => (
                        <span key={r} className={`text-xs rounded-full px-2.5 py-0.5 border ${t.chip}`}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </Card>

                  {/* Objections */}
                  {a.objections.length > 0 && (
                    <Card title="Objections / concerns" className={t.card}>
                      <ul className="text-sm text-stone-300 list-disc list-inside space-y-1">
                        {a.objections.map((o) => <li key={o}>{o}</li>)}
                      </ul>
                    </Card>
                  )}

                  {/* Next action */}
                  <Card title="Recommended next action" className={t.card}>
                    <p className={`text-sm font-semibold ${t.accent}`}>{a.next_action}</p>
                  </Card>

                  {/* Suggested response */}
                  <Card title="Suggested response" className={t.card}>
                    <p className="text-sm text-stone-300 whitespace-pre-wrap leading-relaxed">{a.suggested_response}</p>
                    <div className="mt-3"><CopyButton text={a.suggested_response} /></div>
                  </Card>
                </>
              )}
            </div>
            {/* Add padding at bottom for scroll clearance */}
            <div className="h-8"></div>
          </div>

          {/* ── Right column: Action Kit + Chat (Independently scrollable) ── */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
            <div className="space-y-4 pl-0 lg:pl-1">
              {/* Action Kit */}
              <Card title="Action Kit — call · WhatsApp · follow-up" className={t.card}>
                {!lead.action_kit ? (
                  <button
                    onClick={kit}
                    disabled={kitLoading || !a}
                    className={`text-sm font-bold rounded-lg px-5 py-2.5 disabled:opacity-50 transition-colors ${t.btn}`}
                  >
                    {kitLoading ? "Generating…" : !a ? "Waiting for analysis…" : "Generate Action Kit"}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${t.accent}`}>Talk-track</p>
                      <p className="text-sm text-stone-300 whitespace-pre-wrap leading-relaxed">{lead.action_kit.talk_track}</p>
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${t.accent}`}>WhatsApp</p>
                      <p className="text-sm text-stone-300 whitespace-pre-wrap leading-relaxed">{lead.action_kit.whatsapp}</p>
                      <div className="mt-2 flex gap-2">
                        <CopyButton text={lead.action_kit.whatsapp} />
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(lead.action_kit.whatsapp)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-md border border-green-900/50 text-green-400 bg-green-950/20 hover:bg-green-900/40 transition-colors"
                          >
                            Send via WhatsApp ↗
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-stone-500 border-t border-stone-800 pt-3">
                      Follow-up: <span className={`font-semibold ${t.accent}`}>{lead.action_kit.follow_up_title}</span>
                      {" "}— due <span className="text-stone-300">{lead.action_kit.due_date}</span>
                    </div>
                    <button
                      onClick={kit}
                      className={`text-xs border rounded-lg px-3 py-1.5 transition-colors ${t.btnOut}`}
                    >
                      Regenerate
                    </button>
                  </div>
                )}
              </Card>

              {/* Grounded chat */}
              <Card title="Ask about this lead (grounded)" className={t.card}>
                {/* Quick presets */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[
                    "What should I emphasise on the call?",
                    "Make my reply more assertive",
                    "What are the red flags?",
                    "Draft a WhatsApp follow-up",
                  ].map((p) => (
                    <button
                      key={p}
                      onClick={() => ask(p)}
                      className={`text-[11px] border rounded-full px-2.5 py-1 transition-colors ${t.btnOut}`}
                    >
                      {p.length > 28 ? p.slice(0, 27) + "…" : p}
                    </button>
                  ))}
                </div>

                {/* History */}
                <div className="space-y-2 max-h-56 overflow-y-auto mb-3 pr-1 scrollbar-hide">
                  {(lead.chat_history || []).map((m, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border text-sm ${
                        m.role === "user" ? t.chat.user : t.chat.ai
                      }`}
                    >
                      <span className={`text-[9px] font-bold uppercase tracking-widest block mb-1 ${t.accent}`}>
                        {m.role}
                      </span>
                      <p className="text-stone-200 leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                  {!lead.chat_history?.length && (
                    <p className="text-xs text-stone-600 py-2">No messages yet. Use the presets or type below.</p>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && ask()}
                    placeholder="Ask anything about this lead…"
                    className={`flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none transition-colors ${t.input}`}
                  />
                  <button
                    onClick={() => ask()}
                    disabled={chatLoading || !q.trim()}
                    className={`text-sm font-bold rounded-lg px-4 disabled:opacity-50 transition-colors ${t.btn}`}
                  >
                    {chatLoading ? "…" : "Ask"}
                  </button>
                </div>
              </Card>

              {/* ── Close Lead Section ── */}
              {!lead.closed && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setCloseModal(true)}
                    className="text-xs font-bold px-4 py-2 rounded-lg border border-stone-800 text-stone-500 hover:text-red-400 hover:border-red-900/50 hover:bg-red-950/20 transition-all"
                  >
                    Close Lead
                  </button>
                </div>
              )}
            </div>
            {/* Add padding at bottom for scroll clearance */}
            <div className="h-8"></div>
          </div>
        </div>
      </div>

      {/* ── Close Lead Modal ── */}
      {closeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl w-full max-w-md">
            <h2 className="text-lg font-bold text-stone-100 mb-2">Close Lead?</h2>
            <p className="text-sm text-stone-400 mb-4">Are you sure you want to close this lead? Please add a comment about the client outcome.</p>
            <textarea
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder="e.g. Client bought a different property..."
              rows={3}
              className="w-full text-sm bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-red-800 transition-colors resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setCloseModal(false); setCloseReason(""); }}
                className="px-4 py-2 rounded-xl text-sm font-bold text-stone-400 hover:text-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseLead}
                disabled={closing || !closeReason.trim()}
                className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-900/30 transition-colors"
              >
                {closing ? "Saving..." : "Save & Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
