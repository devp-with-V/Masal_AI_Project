"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Draggable from "react-draggable";
import { ScoreBar, TierPill } from "@/components/ui";
import { api, cache, type Lead, type LeadIn } from "@/lib/api";

const EMPTY: LeadIn = {
  name: "", phone: "", location: "", requirement: "", budget: "", timeline: "", message: "",
};

export default function Dashboard() {
  const [form, setForm] = useState<LeadIn>(EMPTY);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selection, setSelection] = useState("auto|auto");
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [reopenLeadId, setReopenLeadId] = useState<string | null>(null);
  const [reopenUpdate, setReopenUpdate] = useState("");
  const [reopening, setReopening] = useState(false);
  const [briefing, setBriefing] = useState("");
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingMinimized, setBriefingMinimized] = useState(false);
  const [warming, setWarming] = useState(false);
  const [warmingCountdown, setWarmingCountdown] = useState(50);
  const [warmingSuccess, setWarmingSuccess] = useState(false);

  const aiMenuRef = useRef<HTMLDivElement>(null);

  const handleReopen = async () => {
    if (!reopenLeadId || !reopenUpdate.trim()) return;
    setReopening(true);
    try {
      await api.reopen(reopenLeadId, reopenUpdate);
      setReopenLeadId(null);
      setReopenUpdate("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reopen failed");
    } finally {
      setReopening(false);
    }
  };

  const handleBriefing = async () => {
    if (briefing) {
      setBriefing("");
      localStorage.removeItem("masal-briefing");
      return;
    }
    setBriefingLoading(true);
    try {
      const res = await api.briefing();
      setBriefing(res.briefing);
      localStorage.setItem("masal-briefing", res.briefing);
      localStorage.setItem("masal-briefing-date", new Date().toDateString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Briefing failed");
    } finally {
      setBriefingLoading(false);
    }
  };

  const load = async () => {
    let isSlow = false;
    const slowTimer = setTimeout(() => {
      isSlow = true;
      setWarming(true);
    }, 1000);

    try {
      const data = await api.list();
      setLeads(data);
      cache.save(data);
    } catch {
      setLeads(cache.load());
    } finally {
      clearTimeout(slowTimer);
      if (isSlow) {
        setWarmingSuccess(true);
        setTimeout(() => {
          setWarming(false);
          setWarmingSuccess(false);
          setWarmingCountdown(50);
        }, 1500);
      }
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (warming && !warmingSuccess && warmingCountdown > 0) {
      timer = setInterval(() => {
        setWarmingCountdown((p) => p - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [warming, warmingSuccess, warmingCountdown]);

  useEffect(() => {
    setSelection(localStorage.getItem("masal-selection") || "auto|auto");
    const cachedBriefing = localStorage.getItem("masal-briefing");
    const cachedDate = localStorage.getItem("masal-briefing-date");
    if (cachedBriefing && cachedDate === new Date().toDateString()) {
      setBriefing(cachedBriefing);
    } else {
      localStorage.removeItem("masal-briefing");
      localStorage.removeItem("masal-briefing-date");
    }
    load();
    api.health().catch(() => {});
    
    // Close AI menu on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (aiMenuRef.current && !aiMenuRef.current.contains(event.target as Node)) {
        setAiMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  let shown = leads.filter((l) => {
    if (filter !== "ALL" && l.analysis?.tier !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!l.name.toLowerCase().includes(q) && !l.location.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Sort: active leads first, closed leads at the bottom
  shown = shown.sort((a, b) => {
    if (a.closed && !b.closed) return 1;
    if (!a.closed && b.closed) return -1;
    return 0; // maintain backend sorting for ties
  });

  const set = (k: keyof LeadIn) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));



  const aiOptions = [
    { label: "🤖 Auto (best available free)", opts: [{ val: "auto|auto", text: "Auto — try all providers" }] },
    { label: "⚡ Gemini — AI Studio", opts: [{ val: "gemini|gemini-3.1-flash-lite", text: "Gemini 3.1 Flash Lite" }, { val: "gemini|gemini-3.6-flash", text: "Gemini 3.6 Flash" }] },
    { label: "🔀 OpenRouter — free tier", opts: [{ val: "openrouter|openrouter/auto", text: "OpenRouter Auto" }, { val: "openrouter|google/gemini-2.0-flash-exp:free", text: "Gemini 2.0 Flash Exp" }, { val: "openrouter|meta-llama/llama-3.1-8b-instruct:free", text: "Llama 3.1 8B" }] },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-stone-950 text-stone-100">

      {/* ── Top bar (never scrolls) ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-stone-900 bg-stone-950 z-30">
        {/* Logo + back to landing */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-red-700 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/40">
            <span className="text-white font-black text-sm">M</span>
          </div>
          <span className="font-bold text-lg text-stone-100 tracking-tight hidden sm:block">Masal AI</span>
        </Link>

        {/* Centre: count pill + briefing btn */}
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-stone-400 bg-stone-900/50 px-4 py-1.5 rounded-full border border-stone-800">
            <span>Total Leads: <span className="text-stone-200">{leads.length}</span></span>
          </div>
          
          <button
            onClick={handleBriefing}
            disabled={briefingLoading || warming}
            className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${
              briefing ? "bg-amber-900/40 border-amber-800 text-amber-300" : "bg-stone-900 border-stone-800 text-stone-300 hover:text-stone-100 hover:bg-stone-800"
            }`}
          >
            {briefingLoading ? "Generating..." : briefing ? "Close Briefing" : "☀️ Morning Briefing"}
          </button>
        </div>

        {/* Right: Custom AI Selector */}
        <div className="relative" ref={aiMenuRef}>
          <button 
            onClick={() => setAiMenuOpen(!aiMenuOpen)}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl px-4 py-2 text-xs font-medium transition-colors"
          >
            <span className="text-stone-500">Model:</span>
            <span className="text-stone-200">{selection.split('|')[1] || 'Auto'}</span>
            <span className="text-[8px] text-stone-600 ml-1">▼</span>
          </button>
          
          {aiMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                {aiOptions.map((group) => (
                  <div key={group.label} className="mb-2 last:mb-0">
                    <div className="text-[10px] uppercase tracking-widest text-stone-500 px-3 py-2 font-bold">{group.label}</div>
                    {group.opts.map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => {
                          setSelection(opt.val);
                          localStorage.setItem("masal-selection", opt.val);
                          setAiMenuOpen(false);
                        }}
                        className={`w-full text-left text-xs px-3 py-2.5 rounded-xl transition-colors ${
                          selection === opt.val ? "bg-red-900/30 text-red-300 font-bold" : "text-stone-300 hover:bg-stone-800"
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>



      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full p-6 gap-6">
        
        {/* ── Left Column (New Lead Form) ── */}
        <div className="w-[350px] lg:w-[400px] flex-shrink-0 flex flex-col overflow-y-auto scrollbar-hide pr-2">
          
          {/* Notifications */}
          {error && (
            <div className="mb-4 bg-red-950/60 border border-red-900/60 text-red-300 text-xs rounded-xl p-3 flex justify-between items-center">
              {error}
              <button onClick={() => setError("")} className="ml-3 text-red-500 hover:text-red-300 font-bold">✕</button>
            </div>
          )}

          <button
            onClick={() => setFormOpen(!formOpen)}
            className={`text-sm font-bold px-5 py-3 rounded-xl border transition-all mb-3 text-left ${
              formOpen
                ? "bg-stone-800 border-stone-700 text-stone-300"
                : "bg-red-700 border-red-700 text-white hover:bg-red-600 shadow-lg shadow-red-900/20"
            }`}
          >
            {formOpen ? "✕ Close Form" : "+ New Lead"}
          </button>

          <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${formOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
            <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md mb-20">
              <h2 className="text-sm font-bold text-stone-200 mb-4">Add Lead Details</h2>
              <form onSubmit={submit} className="flex flex-col gap-4">
                {(["name", "phone", "location", "requirement", "budget", "timeline"] as const).map((k) => (
                  <input
                    key={k}
                    required={k !== "phone"}
                    placeholder={k[0].toUpperCase() + k.slice(1) + (k === "phone" ? " (Optional)" : "")}
                    value={form[k] || ""}
                    onChange={set(k)}
                    className="text-sm bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-red-800 transition-colors"
                  />
                ))}
                <textarea
                  required
                  placeholder="Customer message / transcript"
                  value={form.message}
                  onChange={set("message")}
                  rows={4}
                  className="text-sm bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-red-800 transition-colors resize-none"
                />
                <button
                  disabled={loading}
                  className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl py-3 transition-colors shadow-lg shadow-red-900/30 mt-2"
                >
                  {loading ? "Analysing with AI…" : "Analyse lead →"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Right Column (Filters & Cards) ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          
          {/* Filters and Search */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-900/40 p-2 rounded-2xl border border-stone-800/60 mb-6 flex-shrink-0">
            <div className="flex flex-wrap items-center gap-2">
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
                    className={`text-xs font-bold px-4 py-2 rounded-xl border border-transparent text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors ${accent}`}
                  >
                    {t} {counts[t] > 0 && <span className="opacity-60 ml-1">({counts[t]})</span>}
                  </button>
                );
              })}
            </div>
            
            <div className="relative flex-1 max-w-[240px]">
              <input 
                type="text"
                placeholder="Search leads here..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-stone-600 transition-colors"
              />
            </div>
          </div>

          {/* Scrollable Cards Area */}
          <div className="flex-1 overflow-y-auto pr-2 pb-10 scrollbar-hide">
            <div className="grid gap-4">
              {shown.map((l) => {
                const tier = l.analysis?.tier;
                
                if (l.closed) {
                  return (
                    <div
                      key={l.id}
                      onClick={() => setReopenLeadId(l.id)}
                      className="group block bg-stone-950 border border-stone-800/50 rounded-2xl p-5 transition-all hover:bg-stone-900 cursor-pointer grayscale opacity-70"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className="font-bold text-stone-500 text-base line-through">{l.name}</span>
                          <span className="text-stone-600 text-sm"> · {l.location} · {l.budget}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-stone-900 text-stone-500 border-stone-800 uppercase">
                          CLOSED
                        </span>
                      </div>
                      <p className="text-sm text-stone-500 line-clamp-2 mb-4 leading-relaxed italic">
                        Closing comment: {l.close_reason}
                      </p>
                      <div className="mt-3 pt-3 border-t border-stone-800/30 flex items-center justify-between text-stone-600">
                        <span className="text-[11px] font-medium tracking-wide uppercase">
                          Click to reopen
                        </span>
                      </div>
                    </div>
                  );
                }

                const borderHover =
                  tier === "HOT"  ? "hover:border-red-900/70"
                  : tier === "WARM" ? "hover:border-amber-900/70"
                  : tier === "COLD" ? "hover:border-blue-900/70"
                  : "hover:border-stone-700";
                return (
                  <Link
                    key={l.id}
                    href={`/leads/${l.id}`}
                    className={`group block bg-stone-900/40 border border-stone-800 rounded-2xl p-5 transition-all hover:bg-stone-900/80 hover:shadow-xl ${borderHover}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <span className="font-bold text-stone-100 text-base">{l.name}</span>
                        <span className="text-stone-500 text-sm"> · {l.location} · {l.budget}</span>
                      </div>
                      <TierPill tier={tier} />
                    </div>
                    <p className="text-sm text-stone-400 line-clamp-2 mb-4 leading-relaxed">
                      {l.analysis?.summary || l.message}
                    </p>
                    <ScoreBar score={l.analysis?.score} />
                    <div className="mt-3 pt-3 border-t border-stone-800/50 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-stone-500 tracking-wide uppercase">
                        {l.requirement} · {l.timeline}
                      </span>
                      {l.analysis && (
                        <span className={`text-[11px] font-bold tracking-wide uppercase ${
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
                <div className="text-center py-24 text-stone-600 bg-stone-900/20 rounded-2xl border border-stone-800/50 border-dashed">
                  <div className="text-4xl mb-4 opacity-50">📭</div>
                  <p className="text-sm font-medium text-stone-500">
                    {filter === "ALL" ? "No leads yet — click \"+ New Lead\" to add one." : `No leads found.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Reopen Lead Modal ── */}
      {reopenLeadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl w-full max-w-md">
            <h2 className="text-lg font-bold text-stone-100 mb-2">Is this lead active again?</h2>
            
            <div className="bg-stone-950 border border-stone-800 p-3 rounded-lg mb-4">
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-1">Previous closing comment</p>
              <p className="text-sm text-stone-300 italic">
                &ldquo;{leads.find(l => l.id === reopenLeadId)?.close_reason}&rdquo;
              </p>
            </div>

            <p className="text-sm text-stone-400 mb-4">
              If they replied or things have changed, log the new updates here. The AI will re-analyze their status based on this new info.
            </p>
            <textarea
              value={reopenUpdate}
              onChange={(e) => setReopenUpdate(e.target.value)}
              placeholder="e.g. They just called back and increased their budget to 90L..."
              rows={4}
              className="w-full text-sm bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-red-800 transition-colors resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setReopenLeadId(null); setReopenUpdate(""); }}
                className="px-4 py-2 rounded-xl text-sm font-bold text-stone-400 hover:text-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReopen}
                disabled={reopening || !reopenUpdate.trim()}
                className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-900/30 transition-colors"
              >
                {reopening ? "Re-analyzing..." : "Yes, Re-analyze"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Minimized Briefing Dock (Bottom Left) ── */}
      {briefing && briefingMinimized && (
        <div 
          onClick={() => setBriefingMinimized(false)}
          className="fixed bottom-6 left-6 z-50 bg-stone-900 border border-amber-900/50 rounded-full px-5 py-3 shadow-2xl cursor-pointer hover:bg-amber-950/80 transition-all hover:scale-105 flex items-center gap-3 animate-bounce"
        >
          <span className="text-amber-400 font-bold text-sm tracking-widest uppercase flex items-center gap-2">
            <span>☀️</span> Morning Briefing
          </span>
          <span className="text-amber-500 font-bold text-lg leading-none mt-[-2px]">+</span>
        </div>
      )}

      {/* ── Draggable Briefing Window ── */}
      {briefing && !briefingMinimized && (
        <Draggable handle=".drag-handle">
          <div className="fixed bottom-24 right-12 w-full max-w-sm sm:max-w-md bg-stone-900 border border-amber-900/50 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
            {/* Header (Drag Handle) */}
            <div className="drag-handle bg-amber-950/80 hover:bg-amber-900 flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing border-b border-amber-900/50 transition-colors">
              <h2 className="text-amber-400 font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                <span>☀️</span> Morning Briefing
              </h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); setBriefingMinimized(true); }}
                  className="text-amber-500 hover:text-amber-300 transition-colors font-bold text-lg leading-none mt-[-4px]"
                  title="Minimize"
                >
                  −
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setBriefing(""); 
                    localStorage.removeItem("masal-briefing"); 
                    localStorage.removeItem("masal-briefing-date");
                  }}
                  className="text-amber-500 hover:text-amber-300 transition-colors font-bold text-xl leading-none mt-[-2px]"
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto scrollbar-hide bg-stone-900 cursor-auto">
              <div className="text-stone-300 text-sm leading-relaxed">
                <ul className="list-disc pl-5 marker:text-amber-700/50 space-y-2">
                  {briefing.split('\n').map((line, i) => {
                    if (!line.trim()) return null;
                    const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
                    const content = line.replace(/^[\*\-]\s+/, '');
                    
                    const parts = content.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="text-amber-100 font-bold">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    });

                    if (isBullet) {
                      return <li key={i}>{parts}</li>;
                    }
                    return <div key={i} className="mt-4 font-medium italic text-amber-200/80 -ml-5">{parts}</div>;
                  })}
                </ul>
              </div>
            </div>
          </div>
        </Draggable>
      )}

      {/* ── Fullscreen Warming Backend Overlay ── */}
      {warming && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 backdrop-blur-md">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-10 shadow-2xl flex flex-col items-center text-center max-w-sm">
            {warmingSuccess ? (
              <>
                <div className="w-16 h-16 bg-green-900/30 border border-green-500 rounded-full flex items-center justify-center mb-6">
                  <span className="text-green-500 text-3xl">✓</span>
                </div>
                <h2 className="text-2xl font-black text-stone-100 mb-2">Connected!</h2>
                <p className="text-stone-400">Loading your dashboard...</p>
              </>
            ) : (
              <>
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-4 border-stone-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-stone-300">
                    {warmingCountdown}s
                  </div>
                </div>
                <h2 className="text-xl font-bold text-stone-100 mb-3">Waking up backend</h2>
                <p className="text-sm text-stone-400 leading-relaxed">
                  The free tier server is spinning up. It usually takes around 50 seconds. Thanks for your patience!
                </p>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
