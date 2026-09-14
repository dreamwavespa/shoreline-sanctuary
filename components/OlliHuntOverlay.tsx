"use client";

import { useEffect, useState } from "react";
import { ITEMS } from "@/lib/items";
import { OLLI_HIDING_PLACES } from "@/lib/olli";
import { useGame } from "@/lib/store";

export default function OlliHuntOverlay() {
  const { state, screen, setScreen, dismissOlliNotification, findOlli } = useGame();
  const [foundMessage, setFoundMessage] = useState("");
  const location = state.olliHidingLocation;
  const place = location ? OLLI_HIDING_PLACES[location] : null;
  const atHidingPlace = Boolean(place && screen === place.screen);

  useEffect(() => {
    if (!foundMessage) return;
    const timeout = window.setTimeout(() => setFoundMessage(""), 4200);
    return () => window.clearTimeout(timeout);
  }, [foundMessage]);

  const revealOlli = () => {
    if (!location) return;
    const reward = findOlli(location);
    if (reward) setFoundMessage(`You found Olli. ${ITEMS[reward].name} was added to your inventory.`);
  };

  return (
    <>
      {state.olliNotificationPending && location && (
        <aside className="absolute left-3 right-3 top-3 z-30 rounded-2xl bg-indigo-950/95 p-4 text-white shadow-xl ring-1 ring-cyan-200" aria-label="Olli hide-and-seek notification">
          <p role="status" aria-live="polite" className="font-bold">🐙 A bubbly pop echoes across Shoreline!</p>
          <p className="mt-1 text-sm text-cyan-50">Olli has disappeared in a cloud of ink. Visit his Beach spot for a clue.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { dismissOlliNotification(); setScreen("beach"); }} className="min-h-11 rounded-xl bg-cyan-500 px-3 py-2 text-sm font-bold text-slate-950">Visit Olli</button>
            <button type="button" onClick={dismissOlliNotification} className="min-h-11 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white ring-1 ring-white/30">Keep Exploring</button>
          </div>
        </aside>
      )}

      {atHidingPlace && place && (
        <button
          type="button"
          onClick={revealOlli}
          aria-label={place.searchLabel}
          className={`absolute z-20 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-950/65 text-4xl shadow-xl ring-2 ring-cyan-200/80 animate-bob ${place.visualPosition}`}
        >
          <span aria-hidden="true" className="opacity-70">🐙</span>
        </button>
      )}

      {foundMessage && (
        <p role="status" aria-live="polite" className="absolute bottom-4 left-3 right-3 z-30 rounded-xl bg-emerald-950/95 px-4 py-3 text-center text-sm font-bold text-white shadow-xl">
          {foundMessage}
        </p>
      )}
    </>
  );
}
