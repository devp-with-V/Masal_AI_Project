"use client";
import { useState } from "react";
import type { Tier } from "@/lib/api";

export function TierPill({ tier }: { tier: Tier | null | undefined }) {
  if (!tier) return <span className="text-xs text-gray-400">analyzing…</span>;
  const c =
    tier === "HOT"
      ? "bg-red-100 text-red-700 border-red-200"
      : tier === "WARM"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${c}`}>{tier}</span>
  );
}

export function ScoreBar({ score }: { score: number | null | undefined }) {
  if (score == null) return <div className="h-2 bg-gray-100 rounded" />;
  const c = score >= 75 ? "bg-red-500" : score >= 50 ? "bg-amber-500" : "bg-slate-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 bg-gray-100 rounded overflow-hidden">
        <div className={`h-full ${c}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono font-bold w-7 text-right">{score}</span>
    </div>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1200);
      }}
      className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
    >
      {ok ? "Copied ✓" : "Copy"}
    </button>
  );
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{title}</h3>
      {children}
    </div>
  );
}
