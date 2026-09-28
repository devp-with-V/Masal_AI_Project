"use client";
import { useState } from "react";
import type { Tier } from "@/lib/api";

/* ── TierPill ───────────────────────────────────────────────── */
export function TierPill({ tier }: { tier: Tier | null | undefined }) {
  if (!tier)
    return <span className="text-xs text-stone-500 italic">analyzing…</span>;
  const c =
    tier === "HOT"
      ? "bg-red-900/60 text-red-300 border-red-800"
      : tier === "WARM"
        ? "bg-amber-900/60 text-amber-300 border-amber-800"
        : "bg-blue-950/60 text-blue-300 border-blue-900";
  return (
    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${c}`}>
      {tier}
    </span>
  );
}

/* ── ScoreBar ───────────────────────────────────────────────── */
export function ScoreBar({ score }: { score: number | null | undefined }) {
  if (score == null)
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 bg-stone-800 rounded-full animate-pulse" />
        <span className="text-xs font-mono text-stone-600 w-7 text-right">—</span>
      </div>
    );
  const c =
    score >= 75 ? "bg-red-500" : score >= 50 ? "bg-amber-500" : "bg-blue-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 bg-stone-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${c} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-stone-300 w-7 text-right">
        {score}
      </span>
    </div>
  );
}

/* ── CopyButton ─────────────────────────────────────────────── */
export function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1400);
      }}
      className="text-xs px-3 py-1 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-100 transition-colors"
    >
      {ok ? "Copied ✓" : "Copy"}
    </button>
  );
}

/* ── Card ───────────────────────────────────────────────────── */
export function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-stone-900/70 border border-stone-800 rounded-xl p-4 ${className}`}
    >
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
