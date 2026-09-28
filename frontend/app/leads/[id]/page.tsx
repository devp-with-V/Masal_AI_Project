"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CopyButton, ScoreBar, TierPill } from "@/components/ui";
import { api, type Lead } from "@/lib/api";

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
        router.push("/?refreshed=true");
      } else {
        setError(msg);
      }
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
    try {
      await api.kit(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action Kit failed");
    } finally {
      setKitLoading(false);
    }
  };

  if (!lead) return <main className="p-6 text-sm">{error || "Loading lead…"}</main>;
  const a = lead.analysis;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-sm border rounded-lg px-3 py-1">← All leads</Link>
        <h1 className="font-bold">{lead.name} <span className="font-normal text-gray-500 text-sm">· {lead.location}</span></h1>
        <TierPill tier={a?.tier} />
      </header>
      {error && <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3">{error}</div>}

      <div className="grid lg:grid-cols-2 gap-4 p-6">
        <div className="space-y-4">
          <Card title="Lead facts">
            <p className="text-sm">{lead.requirement} · {lead.budget} · {lead.timeline}</p>
            <p className="text-xs text-gray-500 mt-1 italic">“{lead.message}”</p>
            <div className="mt-2"><ScoreBar score={a?.score} /></div>
            {a && <p className="text-xs text-gray-500 mt-1">{a.reasoning} · urgency {a.urgency}</p>}
          </Card>
          {a && (
            <>
              <Card title="Summary & intent"><p className="text-sm">{a.summary}</p><p className="text-xs text-gray-500 mt-1">Intent: {a.intent}</p></Card>
              <Card title="Key requirements">
                <div className="flex flex-wrap gap-1">{a.key_requirements.map((r) => <span key={r} className="text-xs bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">{r}</span>)}</div>
              </Card>
              <Card title="Objections">
                <ul className="text-sm list-disc ml-4">{a.objections.map((o) => <li key={o}>{o}</li>)}</ul>
              </Card>
              <Card title="Recommended next action"><p className="text-sm font-semibold">{a.next_action}</p></Card>
              <Card title="Suggested response">
                <p className="text-sm whitespace-pre-wrap">{a.suggested_response}</p>
                <div className="mt-2"><CopyButton text={a.suggested_response} /></div>
              </Card>
            </>
          )}
        </div>

        <div className="space-y-4">
          <Card title="Action Kit — call · WhatsApp · follow-up">
            {!lead.action_kit ? (
              <button onClick={kit} disabled={kitLoading} className="text-sm bg-black text-white font-bold rounded-lg px-4 py-2 disabled:opacity-50">
                {kitLoading ? "Generating…" : "Generate Action Kit"}
              </button>
            ) : (
              <div className="space-y-3">
                <div><p className="text-xs font-bold text-gray-500">TALK-TRACK</p><p className="text-sm whitespace-pre-wrap">{lead.action_kit.talk_track}</p></div>
                <div><p className="text-xs font-bold text-gray-500">WHATSAPP</p><p className="text-sm whitespace-pre-wrap">{lead.action_kit.whatsapp}</p>
                  <div className="mt-1"><CopyButton text={lead.action_kit.whatsapp} /></div></div>
                <div className="text-xs">Follow-up: <b>{lead.action_kit.follow_up_title}</b> — due {lead.action_kit.due_date}</div>
                <button onClick={kit} className="text-xs border rounded-lg px-3 py-1">Regenerate</button>
              </div>
            )}
          </Card>

          <Card title="Ask about this lead (grounded)">
            <div className="flex gap-2 mb-2">
              <button onClick={() => ask("What should I emphasize on the call?")} className="text-xs border rounded-full px-2 py-1">emphasize?</button>
              <button onClick={() => ask("Make my reply more assertive")} className="text-xs border rounded-full px-2 py-1">more assertive</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto text-sm">
              {(lead.chat_history || []).map((m, i) => (
                <div key={i} className={`p-2 rounded-lg ${m.role === "user" ? "bg-gray-100" : "bg-green-50 border border-green-100"}`}>
                  <span className="text-[10px] font-bold uppercase text-gray-500">{m.role}</span>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask…" className="flex-1 text-sm border rounded-lg px-3 py-2" />
              <button onClick={() => ask()} disabled={chatLoading} className="text-sm bg-black text-white rounded-lg px-4 disabled:opacity-50">
                {chatLoading ? "…" : "Ask"}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
