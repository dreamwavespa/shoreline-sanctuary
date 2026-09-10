"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";

const DEBRIS = [
  { id: "branch", icon: "🪵", label: "Move the broken branch above the tide line" },
  { id: "ring", icon: "♻️", label: "Remove the plastic ring from the tide pool" },
  { id: "rope", icon: "🪢", label: "Untangle the rope from the rocks" },
  { id: "crate", icon: "📦", label: "Secure the loose supply crate" },
  { id: "bottle", icon: "🍾", label: "Collect the glass bottle from the sand" },
  { id: "seaweed", icon: "🌿", label: "Clear seaweed from the lighthouse steps" },
];

export default function StormCleanup({ onClose }: { onClose: () => void }) {
  const { completeStormCleanup, play } = useGame();
  const [cleared, setCleared] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const clearItem = (id: string) => {
    if (cleared.includes(id) || finished) return;
    const next = [...cleared, id];
    setCleared(next);
    play(id === "ring" ? "plastic" : id === "bottle" ? "bottleGlass" : "driftwood");
    if (next.length === DEBRIS.length) {
      completeStormCleanup();
      setFinished(true);
    }
  };

  return (
    <div
      className="absolute inset-0 z-40 flex items-end justify-center bg-slate-950/70 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="storm-cleanup-title"
    >
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-[#eef6f5] p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-sky-800">Lighthouse Mini-Game</p>
            <h2 id="storm-cleanup-title" className="font-serif text-2xl font-bold text-slate-900">🌦️ Storm Cleanup</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close Storm Cleanup"
            className="rounded-full bg-white px-3 py-2 text-lg font-bold text-slate-800 shadow ring-1 ring-slate-200"
          >
            ×
          </button>
        </div>

        {!finished ? (
          <>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              The gale has passed. Clear all six hazards at your own pace so the lighthouse path and tide pools are safe again.
            </p>
            <p className="mt-2 font-semibold text-teal-800" role="status" aria-live="polite">
              {cleared.length} of {DEBRIS.length} cleanup jobs complete.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DEBRIS.map((item) => {
                const done = cleared.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={done}
                    onClick={() => clearItem(item.id)}
                    className="min-h-24 rounded-2xl bg-white p-4 text-left shadow ring-1 ring-sky-200 transition active:scale-[0.98] disabled:bg-teal-50 disabled:text-teal-800 disabled:ring-teal-300"
                  >
                    <span className="mr-2 text-2xl" aria-hidden="true">{done ? "✅" : item.icon}</span>
                    <span className="text-sm font-semibold">{done ? `Done: ${item.label}` : item.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl bg-white p-6 text-center shadow ring-1 ring-teal-300" role="status" aria-live="assertive">
            <p className="text-4xl" aria-hidden="true">✨</p>
            <h3 className="mt-2 font-serif text-xl font-bold text-teal-950">The shoreline is safe again</h3>
            <p className="mt-2 text-sm text-teal-800">
              Maeve gives an approving nod. You recovered one weathered plank, one piece of blue sea glass, and two shiny soda tabs.
            </p>
            <button type="button" onClick={onClose} className="mt-5 w-full rounded-xl bg-teal-700 py-3 font-bold text-white active:bg-teal-800">
              Return to Maeve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
