"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ScoreBar, TierPill } from "@/components/ui";
import { api, cache, type Lead, type LeadIn } from "@/lib/api";

const EMPTY: LeadIn = { name: "", location: "", requirement: "", budget: "", timeline: "", message: "" };

export default function Home() {
  const [form, setForm] = useState<LeadIn>(EMPTY);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [warming, setWarming] = useState(true);
  const [error, setError] = useState("");
  const [model, setModel] = useState("auto");

  const load = async () => {
    try {
      const data = await api.list();
      setLeads(data);
      cache.save(data);
    } catch {
      setLeads(cache.load()); // cold-start fallback
    } finally {
      setWarming(false);
    }
  };
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("refreshed=true")) {
      setError("List refreshed: The backend restarted and old leads were cleared.");
    }
    setModel(localStorage.getItem("masal-model") || "auto");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyze failed");
    } finally {
      setLoading(false);
      load();
    }
  };

  const shown = leads.filter((l) => filter === "ALL" || l.analysis?.tier === filter);

  const set = (k: keyof LeadIn) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold">Masal AI — Lead Prioritizer</h1>
          <p className="text-xs text-gray-500">Scan who matters, what they want, what to do next.</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            className="text-xs border rounded-md px-2 py-1 bg-white cursor-pointer"
            value={model}
            onChange={(e) => {
              const val = e.target.value;
              setModel(val);
              localStorage.setItem("masal-model", val);
            }}
          >
            <option value="auto">Auto (Fallback Chain)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
            <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
          </select>
          <span className="text-xs text-gray-500">{warming ? "warming backend…" : `${leads.length} leads`}</span>
        </div>
      </header>

      {error && <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3">{error}</div>}
      <div className="mx-6 mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
        Demo — do not enter real PII. Backend sleeps on free tier; first load may take ~50s.
      </div>

      <div className="grid md:grid-cols-[380px_1fr] gap-6 p-6">
        <form onSubmit={submit} className="bg-white border rounded-xl p-4 shadow-sm space-y-3 h-fit">
          <h2 className="font-bold">New lead</h2>
          {(["name", "location", "requirement", "budget", "timeline"] as const).map((k) => (
            <input
              key={k}
              required
              placeholder={k[0].toUpperCase() + k.slice(1)}
              value={form[k]}
              onChange={set(k)}
              className="w-full text-sm border rounded-lg px-3 py-2"
            />
          ))}
          <textarea
            required
            placeholder="Customer message / transcript"
            value={form.message}
            onChange={set("message")}
            rows={4}
            className="w-full text-sm border rounded-lg px-3 py-2"
          />
          <button
            disabled={loading}
            className="w-full bg-black text-white text-sm font-bold rounded-lg py-2 disabled:opacity-50"
          >
            {loading ? "Analyzing with AI…" : "Analyze lead"}
          </button>
        </form>

        <section>
          <div className="flex gap-2 mb-3">
            {["ALL", "HOT", "WARM", "COLD"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`text-xs font-bold px-3 py-1 rounded-full border ${filter === t ? "bg-black text-white" : "bg-white"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="grid gap-3">
            {shown.map((l) => (
              <Link key={l.id} href={`/leads/${l.id}`} className="bg-white border rounded-xl p-4 shadow-sm hover:border-black">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-sm">{l.name} <span className="font-normal text-gray-500">· {l.location} · {l.budget}</span></div>
                  <TierPill tier={l.analysis?.tier} />
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{l.analysis?.summary || l.message}</p>
                <div className="mt-2">
                  <ScoreBar score={l.analysis?.score} />
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  {l.requirement} · {l.timeline} · urgency {l.analysis?.urgency || "…"}
                </div>
              </Link>
            ))}
            {!shown.length && <p className="text-sm text-gray-500">No leads yet — add one.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
