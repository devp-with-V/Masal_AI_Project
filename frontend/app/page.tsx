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
          <span className="font-bold text-stone-100 tracking-tight">Masal AI Project</span>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-bold bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-red-900/30"
        >
          Open Dashboard →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-red-900/20 blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Copy */}
          <div className="flex flex-col items-start text-left">
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

            <div className="flex gap-4 flex-wrap">
              <Link
                href="/dashboard"
                className="bg-red-700 hover:bg-red-600 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-xl shadow-red-900/30 hover:scale-105 active:scale-95"
              >
                Start Prioritizing →
              </Link>
              <a
                href="#how"
                className="text-stone-300 hover:text-stone-100 font-medium px-8 py-3.5 text-sm transition-all border border-stone-700 hover:border-stone-500 rounded-xl hover:bg-stone-900"
              >
                See how it works ↓
              </a>
            </div>
          </div>

          {/* Right Column: Floating Overlapping Cards */}
          <div className="relative h-[500px] hidden lg:block perspective-[1000px]">
            
            {/* Card 1 (Back, Cold) */}
            <div className="absolute top-0 right-12 w-[400px] bg-stone-950/80 border border-stone-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-float-3 z-10 opacity-70">
              <div className="flex justify-between mb-3">
                <span className="font-bold text-stone-400">Priya Singh</span>
                <span className="text-[10px] bg-blue-900/40 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full font-bold">COLD</span>
              </div>
              <p className="text-xs text-stone-500 mb-3">Just browsing 2BHKs in Thane. No timeline.</p>
              <div className="h-1 bg-stone-800 rounded-full overflow-hidden"><div className="h-full w-[35%] bg-blue-500" /></div>
            </div>

            {/* Card 2 (Middle, Warm) */}
            <div className="absolute top-24 right-20 w-[420px] bg-stone-900/90 border border-stone-700 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-float-2 z-20">
              <div className="flex justify-between mb-3">
                <span className="font-bold text-stone-200">Amit Kumar</span>
                <span className="text-[10px] bg-amber-900/50 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-bold">WARM</span>
              </div>
              <p className="text-sm text-stone-400 mb-3">Looking for a 3BHK in Gurgaon. Budget 2Cr. Ready next month.</p>
              <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden"><div className="h-full w-[65%] bg-amber-500" /></div>
            </div>

            {/* Card 3 (Front, Hot) */}
            <div className="absolute top-48 right-32 w-[450px] bg-stone-900 border border-red-900/40 rounded-2xl p-6 shadow-[0_20px_50px_rgba(153,27,27,0.3)] backdrop-blur-xl animate-float-1 z-30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] text-stone-400 font-mono uppercase tracking-widest">Live analysis</span>
                </div>
                <span className="text-[11px] bg-red-900/80 text-red-200 border border-red-700 px-2.5 py-0.5 rounded-full font-bold shadow-lg shadow-red-900/50">HOT</span>
              </div>
              <div className="font-bold text-stone-100 text-lg mb-1">
                Rohan Patil
              </div>
              <div className="text-xs text-stone-500 mb-4">Pune · 70–80L</div>
              <p className="text-sm text-stone-300 mb-5 leading-relaxed bg-stone-950/50 p-3 rounded-lg border border-stone-800">
                Site visit done, loan pre-approved, ready for token if registration costs are clear.
              </p>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full w-[88%] bg-red-500 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-[200%] animate-[translateX_2s_infinite]" />
                  </div>
                </div>
                <span className="text-sm font-black text-red-400 font-mono tracking-tighter">88</span>
              </div>
              <p className="text-xs font-medium text-stone-400 border-t border-stone-800 pt-4 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">→</span> 
                <span>Call tomorrow morning. Emphasise loan support and registration cost clarity.</span>
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-24 px-6 border-t border-stone-900 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-red-900/50 to-transparent hidden md:block" />
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="text-[10px] text-stone-600 uppercase tracking-[0.2em] text-center mb-3 font-bold">
            How it works
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-center text-stone-100 mb-20">
            From inquiry to action in seconds
          </h2>
          <div className="flex flex-col gap-12 md:gap-24">
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
            ].map((f, i) => (
              <div key={f.step} className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 w-full relative">
                  <div className="absolute top-1/2 -translate-y-1/2 w-8 h-px bg-red-900/50 hidden md:block" style={{ [i % 2 === 0 ? 'right' : 'left']: '-2rem' }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] hidden md:block" style={{ [i % 2 === 0 ? 'right' : 'left']: '-2.35rem' }} />
                  <div className="bg-stone-900/80 border border-stone-800 hover:border-red-900/50 rounded-2xl p-8 backdrop-blur-sm transition-all hover:-translate-y-1 shadow-2xl">
                    <p className="text-[12px] text-red-500 font-mono font-bold mb-3 tracking-widest">STEP {f.step}</p>
                    <h3 className="text-2xl font-black text-stone-100 mb-3">{f.title}</h3>
                    <p className="text-base text-stone-400 leading-relaxed">{f.body}</p>
                  </div>
                </div>
                <div className="flex-1 flex justify-center text-8xl md:text-[140px] opacity-[0.03] grayscale transition-all hover:opacity-20 hover:grayscale-0 cursor-default select-none">
                  {f.icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features strip (Infinite Marquee) ── */}
      <section className="py-24 border-t border-stone-900 overflow-hidden bg-stone-950 flex flex-col relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-stone-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-stone-950 to-transparent z-10 pointer-events-none" />
        
        <div className="flex w-[200%] animate-marquee">
          {/* Double the array for smooth infinite loop */}
          {[...Array(2)].map((_, arrayIndex) => (
            <div key={arrayIndex} className="flex gap-6 px-3 w-1/2 shrink-0">
              {[
                {
                  title: "Action Kit",
                  sub: "Own feature",
                  body: "One click generates a call talk-track, a personalised WhatsApp message, and a follow-up task with a due date.",
                  color: "border-red-900/50 bg-red-950/20",
                },
                {
                  title: "Multi-provider AI",
                  sub: "Resilient",
                  body: "Gemini → OpenRouter fallback chain. When one quota hits zero, the next kicks in automatically.",
                  color: "border-amber-900/50 bg-amber-950/20",
                },
                {
                  title: "Grounded chat",
                  sub: "Not a generic chatbot",
                  body: "Ask follow-ups like 'what should I emphasise?' and get answers grounded strictly in that lead's data.",
                  color: "border-blue-950 bg-blue-950/20",
                },
                {
                  title: "HOT / WARM / COLD",
                  sub: "Scored & ranked",
                  body: "Every lead gets a 0–100 score with deterministic guardrails. Act on priority — not inbox order.",
                  color: "border-stone-800 bg-stone-900/40",
                },
              ].map((f, i) => (
                <div key={f.title + arrayIndex} className={`w-[350px] shrink-0 border rounded-2xl p-7 transition-all hover:scale-[1.02] ${f.color}`}>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-2">{f.sub}</p>
                  <h3 className="font-bold text-lg text-stone-100 mb-3">{f.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{f.body}</p>
                </div>
              ))}
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
        Masal AI Project · AI Lead Prioritizer · Gemini + OpenRouter · Free tier
      </footer>

      {/* Floating Badge */}
      <div className="fixed bottom-6 right-6 z-50 animate-bounce">
        <div className="bg-stone-900/90 border border-red-900/50 backdrop-blur-md px-4 py-2 rounded-full shadow-lg shadow-red-900/20 text-xs font-bold text-stone-300 flex items-center gap-2 cursor-default hover:bg-stone-800 transition-colors">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Made by Vedant
        </div>
      </div>
    </main>
  );
}
