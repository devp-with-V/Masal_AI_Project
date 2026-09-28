"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ScoreBar, TierPill } from "@/components/ui";
import { api, cache, type Lead, type LeadIn } from "@/lib/api";

const EMPTY: LeadIn = {
  name: "", location: "", requirement: "", budget: "", timeline: "", message: "",
};

export default function Dashboard() {
  const [form, setForm] = useState<LeadIn>(EMPTY);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [warming, setWarming] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selection, setSelection] = useState("auto|auto");

  const load = async () => {
    try {
      const data = await api.list();
      setLeads(data);
      cache.save(data);
    } catch {
      setLeads(cache.load());
    } finally {
      setWarming(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("refreshed=true")) {
      setInfo("List refreshed — the backend restarted and old leads were cleared.");
    }
    setSelection(localStorage.getItem("masal-selection") || "auto|auto");
    load();
    api.health().catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const lead = await api.analyze(form);
      setLeads((p) => [lead, ...p]);
      setForm(EMPTY);
      setFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyze failed");
    } finally {
      setLoading(false);
      load();
    }
  };

  const counts = {
    ALL:  leads.length,
    HOT:  leads.filter((l) => l.analysis?.tier === "HOT").length,
    WARM: leads.filter((l) => l.analysis?.tier === "WARM").length,
    COLD: leads.filter((l) => l.analysis?.tier === "COLD").length,
  };

  const shown = leads.filter((l) => filter === "ALL" || l.analysis?.tier === filter);
  const set = (k: keyof LeadIn) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-stone-950 text-stone-100">

      {/* ── Top bar (never scrolls) ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-stone-900 bg-stone-950 z-30">
        {/* Logo + back to landing */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 bg-red-700 rounded-lg flex items-center justify-center shadow-md shadow-red-900/40">
            <span className="text-white font-black text-xs">M</span>
          </div>
          <span className="font-bold text-stone-100 tracking-tight hidden sm:block">Masal AI</span>
        </Link>

        {/* Centre: count pill */}
        <div className="text-xs text-stone-500">
          {warming ? (
            <span className="animate-pulse">warming backend…</span>
          ) : (
            <span>{leads.length} lead{leads.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Right: provider selector + New Lead */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col gap-0">
            <label className="text-[9px] text-stone-600 uppercase tracking-widest">AI Model</label>
            <select
              className="text-xs border border-stone-800 rounded-md px-2 py-1 bg-stone-900 text-stone-300 cursor-pointer min-w-[190px] focus:outline-none focus:border-red-800"
              value={selection}
              onChange={(e) => {
                const val = e.target.value;
                setSelection(val);
                localStorage.setItem("masal-selection", val);
              }}
            >
              <optgroup label="🤖 Auto (best available free)">
                <option value="auto|auto">Auto — try all providers</option>
              </optgroup>
              <optgroup label="⚡ Gemini — AI Studio (20/day)">
                <option value="gemini|gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                <option value="gemini|gemini-3.6-flash">Gemini 3.6 Flash</option>
              </optgroup>
              <optgroup label="🔀 OpenRouter — free tier (50–1000/day)">
                <option value="openrouter|openrouter/auto">OpenRouter Auto (free router)</option>
                <option value="openrouter|google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash Exp (via OR)</option>
                <option value="openrouter|meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (via OR)</option>
              </optgroup>
            </select>
          </div>

          <button
            onClick={() => { setFormOpen((o) => !o); setError(""); }}
            className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all ${
              formOpen
                ? "bg-stone-800 border-stone-700 text-stone-300"
                : "bg-red-700 border-red-700 text-white hover:bg-red-600 shadow-md shadow-red-900/30"
            }`}
          >
            {formOpen ? "✕ Cancel" : "+ New Lead"}
          </button>
        </div>
      </header>

      {/* ── Notifications ── */}
      {info && (
        <div className="flex-shrink-0 mx-5 mt-3 bg-amber-950/60 border border-amber-900/60 text-amber-300 text-xs rounded-lg p-2.5 flex justify-between items-center">
          {info}
          <button onClick={() => setInfo("")} className="ml-3 text-amber-500 hover:text-amber-300">✕</button>
        </div>
      )}
      {error && (
        <div className="flex-shrink-0 mx-5 mt-3 bg-red-950/60 border border-red-900/60 text-red-300 text-xs rounded-lg p-2.5 flex justify-between items-center">
          {error}
          <button onClick={() => setError("")} className="ml-3 text-red-500 hover:text-red-300">✕</button>
        </div>
      )}

      {/* ── Collapsible "New Lead" form ── */}
      <div
        className={`flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
          formOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-b border-stone-900 bg-stone-900/60 p-5">
          <h2 className="text-sm font-bold text-stone-200 mb-4">New lead</h2>
          <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(["name", "location", "requirement", "budget", "timeline"] as const).map((k) => (
              <input
                key={k}
                required
                placeholder={k[0].toUpperCase() + k.slice(1)}
                value={form[k]}
                onChange={set(k)}
                className="text-sm bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-red-800 transition-colors"
              />
            ))}
            <textarea
              required
              placeholder="Customer message / transcript"
              value={form.message}
              onChange={set("message")}
              rows={2}
              className="col-span-2 md:col-span-3 text-sm bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-red-800 transition-colors resize-none"
            />
            <button
              disabled={loading}
              className="col-span-2 md:col-span-3 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold rounded-lg py-2.5 transition-colors shadow-md shadow-red-900/30"
            >
              {loading ? "Analysing with AI…" : "Analyse lead →"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Filter bar (stays visible, never scrolls) ── */}
      <div className="flex-shrink-0 flex items-center gap-2 px-5 py-3 border-b border-stone-900 bg-stone-950">
        {(["ALL", "HOT", "WARM", "COLD"] as const).map((t) => {
          const active = filter === t;
          const accent =
            t === "HOT"  ? "data-[active=true]:bg-red-900/40 data-[active=true]:border-red-800 data-[active=true]:text-red-300"
            : t === "WARM" ? "data-[active=true]:bg-amber-900/40 data-[active=true]:border-amber-800 data-[active=true]:text-amber-300"
            : t === "COLD" ? "data-[active=true]:bg-blue-950/60 data-[active=true]:border-blue-900 data-[active=true]:text-blue-300"
            : "data-[active=true]:bg-stone-800 data-[active=true]:border-stone-700 data-[active=true]:text-stone-100";
          return (
            <button
              key={t}
              data-active={active}
              onClick={() => setFilter(t)}
              className={`text-xs font-bold px-3 py-1 rounded-full border border-stone-800 text-stone-500 hover:text-stone-300 hover:border-stone-700 transition-colors ${accent}`}
            >
              {t} {counts[t] > 0 && <span className="opacity-60">({counts[t]})</span>}
            </button>
          );
        })}
      </div>

      {/* ── Scrollable cards area ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 grid gap-3">
          {shown.map((l) => {
            const tier = l.analysis?.tier;
            const borderHover =
              tier === "HOT"  ? "hover:border-red-900/70"
              : tier === "WARM" ? "hover:border-amber-900/70"
              : tier === "COLD" ? "hover:border-blue-900/70"
              : "hover:border-stone-700";
            return (
              <Link
                key={l.id}
                href={`/leads/${l.id}`}
                className={`group block bg-stone-900/60 border border-stone-800 rounded-xl p-4 transition-all hover:shadow-lg ${borderHover}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="font-bold text-stone-100 text-sm">{l.name}</span>
                    <span className="text-stone-500 text-sm"> · {l.location} · {l.budget}</span>
                  </div>
                  <TierPill tier={tier} />
                </div>
                <p className="text-xs text-stone-400 line-clamp-2 mb-3">
                  {l.analysis?.summary || l.message}
                </p>
                <ScoreBar score={l.analysis?.score} />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-stone-600">
                    {l.requirement} · {l.timeline}
                  </span>
                  {l.analysis && (
                    <span className={`text-[11px] font-medium ${
                      l.analysis.urgency === "high" ? "text-red-500"
                      : l.analysis.urgency === "medium" ? "text-amber-500"
                      : "text-blue-400"
                    }`}>
                      {l.analysis.urgency} urgency
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {!shown.length && (
            <div className="text-center py-16 text-stone-600">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm font-medium text-stone-500">
                {filter === "ALL" ? "No leads yet — click \"+ New Lead\" to add one." : `No ${filter} leads.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Demo notice ── */}
      <div className="flex-shrink-0 px-5 py-2 border-t border-stone-900 text-[10px] text-stone-700 text-center">
        Demo — do not enter real PII · Backend may take ~50s on first load (free tier cold start)
      </div>
    </div>
  );
}
