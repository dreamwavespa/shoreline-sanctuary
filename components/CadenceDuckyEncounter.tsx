"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import { isCadenceDuckyRescued, rescueCadenceDucky } from "@/lib/cadenceQuest";

export default function CadenceDuckyEncounter() {
  const { state, screen, play } = useGame();
  const [rescued, setRescued] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setRescued(isCadenceDuckyRescued());
  }, [screen]);

  if (screen !== "sandbars" || !state.sandbarsUnlocked || state.questProgress["cadence-ducky"] || rescued) return null;

  const rescue = () => {
    if (!state.raftInflated || state.raftAirLevel < 1) {
      setMessage("The raft needs air before you can reach Ducky. Pump it up, then try again.");
      return;
    }
    rescueCadenceDucky();
    setRescued(true);
    play("rubberDucky", 0.8);
    window.setTimeout(() => play("babyLaugh", 0.25), 350);
    setMessage("Squeak! You scoop Cadence's yellow ducky out of the shallows. Take Ducky back to Cadence through her Bottle Quest.");
  };

  return (
    <aside className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-xl rounded-2xl bg-yellow-50 p-4 text-slate-900 shadow-xl ring-2 ring-yellow-300" aria-labelledby="cadence-ducky-heading">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-4xl">🐤</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-teal-800">Cadence's Main Bottle Quest</p>
          <h2 id="cadence-ducky-heading" className="font-serif text-lg font-bold text-amber-950">The Great Rubber Ducky Voyage</h2>
          <p className="mt-1 text-sm text-slate-700">A tiny yellow duck bobs in the shallow water beyond the shifting sand. Cadence's lost bedtime Ducky!</p>
          <button type="button" onClick={rescue} className="mt-3 min-h-12 w-full rounded-xl bg-teal-700 px-4 py-3 font-bold text-white active:bg-teal-800">🛟 Paddle Out and Rescue Ducky</button>
          <p role="status" aria-live="polite" className="mt-2 text-sm font-semibold text-teal-900">{message}</p>
        </div>
      </div>
    </aside>
  );
}
