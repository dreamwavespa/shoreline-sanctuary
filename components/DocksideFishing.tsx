"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import { DOCK_FISH } from "@/lib/offshore";

type FishingPhase = "ready" | "waiting" | "bite" | "reeling";

export default function DocksideFishing({ night }: { night: boolean }) {
  const { state, offshoreAction, play } = useGame();
  const [phase, setPhase] = useState<FishingPhase>("ready");
  const [message, setMessage] = useState("Cast a line from the pier.");
  const timer = useRef<number | null>(null);
  const log = state.offshore.dockFishLog ?? [];

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const fish = () => {
    if (timer.current !== null) return;
    if (phase === "ready") {
      setPhase("waiting");
      setMessage("Line cast. Wait for a bite.");
      timer.current = window.setTimeout(() => {
        timer.current = null;
        setPhase("bite");
        setMessage("You got a bite! Reel in whenever you’re ready.");
        play("oceanWaterSplash", 0.45);
      }, 2000 + Math.random() * 2200);
    } else if (phase === "bite") {
      setPhase("reeling");
      setMessage("Reeling in…");
      play("dockFishingReel");
      timer.current = window.setTimeout(() => {
        timer.current = null;
        setMessage(offshoreAction({ type: "dock-fishing", night }));
        setPhase("ready");
      }, 2700);
    }
  };

  const labels: Record<FishingPhase, string> = {
    ready: "Cast Line",
    waiting: "Waiting for a bite",
    bite: "Reel In",
    reeling: "Reeling in",
  };

  return <section className="space-y-4 rounded-2xl bg-white p-4 shadow">
    <div aria-hidden="true" className={`relative flex h-28 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b ${night ? "from-indigo-950 to-cyan-950" : "from-cyan-700 to-teal-500"}`}>
      {phase !== "ready" && <div className={`relative h-6 w-6 rounded-full border-2 border-white bg-gradient-to-b from-white from-50% to-rose-600 to-50% shadow ${phase === "bite" ? "ring-4 ring-amber-200 motion-safe:animate-bounce" : ""}`} />}
    </div>
    <p role="status" aria-live="polite" aria-atomic="true" className="min-h-12 text-teal-950">{message}</p>
    <button type="button" onClick={fish} aria-disabled={phase === "waiting" || phase === "reeling"}
      className="min-h-12 w-full rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white aria-disabled:bg-slate-200 aria-disabled:text-slate-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-500">
      {labels[phase]}
    </button>
    <h4 className="font-semibold text-teal-950">Fishing log ({log.length} of {DOCK_FISH.day.length + DOCK_FISH.night.length})</h4>
    {log.length > 0 ? <ul className="list-disc pl-6">{log.map(name => <li key={name}>{name}</li>)}</ul> : <p>Your first catch will appear here.</p>}
  </section>;
}
