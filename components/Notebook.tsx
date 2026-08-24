"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { VILLAGERS } from "@/lib/villagers";
import { NOTEBOOK_SECTIONS, NotebookSection } from "@/lib/notebook";

const ANCHOR_EMOJI: Record<string, string> = {
  kaiana: "🧭",
  penelope: "🦢",
  sunny: "⭐",
  melody: "💍",
};

function isDiscovered(state: ReturnType<typeof useGame>["state"], section: NotebookSection, entryId: string, kind: string) {
  if (kind === "item") return !!state.notebookDiscovered[entryId];
  return (state.villagerGiftCounts[entryId] || 0) > 0;
}

function SectionPage({ section }: { section: NotebookSection }) {
  const { state } = useGame();
  const anchor = VILLAGERS[section.anchorVillagerId];
  const discoveredCount = section.entries.filter((e) => isDiscovered(state, section, e.id, e.kind)).length;
  const complete = discoveredCount === section.entries.length;

  return (
    <div className="relative rounded-2xl bg-[#fdf6e8] ring-1 ring-amber-200 shadow-inner p-4 overflow-hidden">
      {/* soft watercolor wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-100/40 via-transparent to-amber-100/40 pointer-events-none" />

      <div className="relative flex items-start justify-between mb-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-amber-900">{section.title}</h3>
          <p className="text-[11px] text-amber-600">
            {discoveredCount}/{section.entries.length} discovered
          </p>
        </div>
        <div className="w-14 h-14 rounded-xl bg-white ring-2 ring-amber-300 shadow flex items-center justify-center text-3xl shrink-0">
          {ANCHOR_EMOJI[section.anchorVillagerId] || "📖"}
        </div>
      </div>

      <div className="relative space-y-2">
        {section.entries.map((entry) => {
          const found = isDiscovered(state, section, entry.id, entry.kind);
          const label =
            entry.kind === "item" ? ITEMS[entry.id]?.name || entry.id : VILLAGERS[entry.id]?.name || entry.id;
          const icon =
            entry.kind === "item"
              ? ITEMS[entry.id]?.isEmoji
                ? ITEMS[entry.id]?.icon
                : null
              : null;
          return (
            <div
              key={entry.id}
              className={`flex items-start gap-3 rounded-xl p-2.5 ring-1 ${
                found ? "bg-white/70 ring-amber-200" : "bg-amber-50/60 ring-amber-100"
              }`}
            >
              <div
                className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-lg ${
                  found ? "bg-white" : "bg-amber-100 text-amber-300"
                }`}
              >
                {found ? icon || "✦" : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${found ? "text-amber-900" : "text-amber-400"}`}>
                  {found ? label : "Undiscovered"}
                </p>
                {found && <p className="text-[11px] italic text-amber-700/80 leading-snug">{entry.note}</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative mt-4 flex items-center justify-between">
        <p className="text-[11px] text-amber-700/80 italic">Reward: {section.completionReward}</p>
        {complete && (
          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-[#1c2f5c] rounded-full px-2.5 py-1 rotate-[-4deg] shadow ring-2 ring-[#1c2f5c]/40">
            ✦ PAGE COMPLETED ✦
          </span>
        )}
      </div>
    </div>
  );
}

export default function Notebook({ onClose }: { onClose: () => void }) {
  const { state, play, markNotebookSeen } = useGame();
  const [sectionId, setSectionId] = useState(NOTEBOOK_SECTIONS[0].id);

  useEffect(() => {
    play("bottleOpen");
    markNotebookSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const section = NOTEBOOK_SECTIONS.find((s) => s.id === sectionId) || NOTEBOOK_SECTIONS[0];

  return (
    <div className="absolute inset-0 z-30 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-[#3a2a1a] rounded-t-3xl sm:rounded-3xl p-3 shadow-2xl max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between px-2 py-1 mb-2">
          <h2 className="font-serif text-white text-base font-bold">📖 Sanctuary Explorer's Notebook</h2>
          <button type="button" onClick={onClose} className="text-amber-200 text-2xl leading-none px-2">
            &times;
          </button>
        </div>

        <div className="flex gap-1.5 mb-3 px-1 overflow-x-auto">
          {NOTEBOOK_SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSectionId(s.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                s.id === sectionId ? "bg-amber-400 text-amber-950" : "bg-white/10 text-amber-100"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto px-1 pb-1" style={{ touchAction: "pan-y" }}>
          <SectionPage section={section} />
        </div>
      </div>
    </div>
  );
}
