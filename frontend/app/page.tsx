"use client";
import Link from "next/link";

export default function Landing() {
  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 overflow-x-hidden">

      {/* ── Sticky Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-stone-950/90 backdrop-blur-md border-b border-stone-900">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-red-700 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/40">
            <span className="text-white font-black text-xs">M</span>
          </div>
          <span className="font-bold text-stone-100 tracking-tight">Masal AI</span>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-bold bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-red-900/30"
        >
          Open Dashboard →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-red-900/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs text-red-400 bg-red-950/60 border border-red-900/70 rounded-full px-3.5 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            AI-powered lead intelligence · Free tier
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-stone-100 leading-[1.08] mb-6 text-balance">
            Know who to call.
            <br />
            <span className="text-red-500">Before you call.</span>
          </h1>

          <p className="text-base md:text-lg text-stone-400 max-w-lg mb-10 leading-relaxed">
            Masal AI scores, ranks, and explains every inbound real-estate lead — so your team spends time
            closing, not triaging.
          </p>

          <div className="flex gap-3 flex-wrap justify-center">
            <Link
              href="/dashboard"
              className="bg-red-700 hover:bg-red-600 text-white font-bold px-7 py-3 rounded-xl text-sm transition-colors shadow-xl shadow-red-900/30"
            >
              Start Prioritizing →
            </Link>
            <a
              href="#how"
              className="text-stone-400 hover:text-stone-200 font-medium px-6 py-3 text-sm transition-colors border border-stone-800 hover:border-stone-700 rounded-xl"
            >
              See how it works ↓
            </a>
          </div>

          {/* Preview card */}
          <div className="mt-16 w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl p-5 text-left shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-stone-500 font-mono uppercase tracking-widest">Live analysis</span>
              </div>
              <span className="text-xs bg-red-900/60 text-red-300 border border-red-800 px-2.5 py-0.5 rounded-full font-bold">HOT</span>
            </div>
            <div className="font-bold text-stone-100 mb-0.5">
              Rohan Patil{" "}
              <span className="font-normal text-stone-500 text-sm">· Pune · 70–80L</span>
            </div>
            <p className="text-sm text-stone-400 mb-4 leading-relaxed">
              Site visit done, loan pre-approved, ready for token if registration costs are clear.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full w-[88%] bg-red-500 rounded-full" />
              </div>
              <span className="text-xs font-mono font-bold text-red-400">88</span>
            </div>
            <p className="text-xs text-stone-500 border-t border-stone-800 pt-3">
              → Call tomorrow morning. Emphasise loan support and registration cost clarity.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-24 px-6 border-t border-stone-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] text-stone-600 uppercase tracking-[0.2em] text-center mb-3">
            How it works
          </p>
          <h2 className="text-3xl font-black text-center text-stone-100 mb-14">
            From inquiry to action in seconds
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                title: "Intake a lead",
                body: "Paste the customer's message, add their budget and timeline. Thirty seconds per lead.",
                icon: "📋",
              },
              {
                step: "02",
                title: "AI scores + explains",
                body: "Gemini analyses intent, scores urgency 0–100, flags objections, and suggests your next move.",
                icon: "🤖",
              },
              {
                step: "03",
                title: "Act with confidence",
                body: "Get a call talk-track, a WhatsApp draft, and a follow-up task — all personalised to this lead.",
                icon: "⚡",
              },
            ].map((f) => (
              <div
                key={f.step}
                className="bg-stone-900 border border-stone-800 hover:border-red-900/60 rounded-xl p-6 transition-colors"
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <p className="text-[10px] text-red-600 font-mono mb-2 tracking-widest">{f.step}</p>
                <h3 className="font-bold text-stone-100 mb-2">{f.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features strip ── */}
      <section className="py-20 px-6 border-t border-stone-900">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
          {[
            {
              title: "Action Kit",
              sub: "Own feature",
              body: "One click generates a call talk-track, a personalised WhatsApp message, and a follow-up task with a due date — before, during, and after the call covered.",
              color: "border-red-900/50 bg-red-950/20",
            },
            {
              title: "Multi-provider AI",
              sub: "Resilient",
              body: "Gemini → OpenRouter fallback chain. Choose your model from the dropdown. When one quota hits zero, the next kicks in automatically.",
              color: "border-amber-900/50 bg-amber-950/20",
            },
            {
              title: "Grounded chat",
              sub: "Not a generic chatbot",
              body: "Ask follow-ups like \u0022what should I emphasise on the call?\u0022 and get answers grounded in that lead\u2019s data — location, budget, objections.",
              color: "border-blue-950 bg-blue-950/20",
            },
            {
              title: "HOT / WARM / COLD",
              sub: "Scored & ranked",
              body: "Every lead gets a 0–100 score with deterministic guardrails on top. Sort, filter, and act on priority — not inbox order.",
              color: "border-stone-800 bg-stone-900/40",
            },
          ].map((f) => (
            <div key={f.title} className={`border rounded-xl p-6 ${f.color}`}>
              <p className="text-[10px] text-stone-600 uppercase tracking-widest mb-1">{f.sub}</p>
              <h3 className="font-bold text-stone-100 mb-2">{f.title}</h3>
              <p className="text-sm text-stone-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center border-t border-stone-900">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-red-900/20 rounded-3xl blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-black text-stone-100 mb-3">
              Ready to prioritise smarter?
            </h2>
            <p className="text-stone-400 mb-8 text-sm">
              No login. No setup. Open the dashboard and add your first lead.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-red-700 hover:bg-red-600 text-white font-bold px-10 py-4 rounded-xl transition-colors shadow-xl shadow-red-900/40 text-sm"
            >
              Open the Dashboard →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-900 py-6 text-center text-xs text-stone-700">
        Masal AI — Lead Prioritizer · Gemini + OpenRouter · Free tier · Built for the real-estate team
      </footer>
    </main>
  );
}
