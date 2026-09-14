"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ITEMS } from "@/lib/items";
import { SCENES } from "@/lib/media";
import { useGame } from "@/lib/store";

const TEAS = [
  {
    itemId: "food-sweet-sugar-berry-tea",
    note: "Rosy, fruity, and naturally sweet.",
    moment: "Maeve smiles into her cup. “A little sweetness makes even a hard-weather day feel kinder.” Marshmallow answers with a slow, contented purr.",
  },
  {
    itemId: "food-lemon-tea",
    note: "Bright and warming after a cool sea breeze.",
    moment: "Maeve watches the last gold light cross the water. “Lemon tea clears the fog from more than the windows.” Marshmallow settles closer to the warm table.",
  },
  {
    itemId: "food-mint-tea",
    note: "Fresh, soothing, and peaceful after a storm.",
    moment: "Maeve rests both hands around her cup. “Mint is best after the wind has had its say.” Marshmallow curls his tail around his paws beside his water saucer.",
  },
] as const;

type Phase = "choosing" | "setting" | "brewing" | "pouring" | "shared";

const PHASE_TEXT: Record<Phase, string> = {
  choosing: "Choose a tea for Maeve to brew.",
  setting: "Maeve sets two cups and Marshmallow's water saucer on the table.",
  brewing: "The tea steeps in Maeve's lighthouse teapot.",
  pouring: "Maeve pours the warm tea into both cups.",
  shared: "Tea is served. The three of you enjoy a quiet lighthouse moment.",
};

export default function TeaWithMaeve({ onClose }: { onClose: () => void }) {
  const { state, haveTeaWithMaeve, play } = useGame();
  const firstAvailable = TEAS.find((tea) => (state.inventory[tea.itemId] || 0) > 0)?.itemId || TEAS[0].itemId;
  const [selectedId, setSelectedId] = useState<string>(firstAvailable);
  const [phase, setPhase] = useState<Phase>("choosing");
  const [announcement, setAnnouncement] = useState({ message: PHASE_TEXT.choosing, revision: 0 });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const timersRef = useRef<number[]>([]);
  const selectedTea = TEAS.find((tea) => tea.itemId === selectedId) || TEAS[0];
  const availableCount = state.inventory[selectedId] || 0;
  const busy = phase !== "choosing" && phase !== "shared";

  const announce = (message: string) => {
    setAnnouncement((current) => ({ message, revision: current.revision + 1 }));
  };

  useEffect(() => {
    headingRef.current?.focus();
    return () => timersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const schedule = (callback: () => void, delay: number) => {
    timersRef.current.push(window.setTimeout(callback, delay));
  };

  const beginTea = () => {
    if (!haveTeaWithMaeve(selectedId)) {
      announce("That tea is not available. Prepare another serving in the Workshop kitchen first.");
      return;
    }

    setPhase("setting");
    announce(PHASE_TEXT.setting);
    play("cupAndSaucer", 0.85);

    schedule(() => {
      setPhase("brewing");
      announce(PHASE_TEXT.brewing);
      play("teaBrewing", 0.75);
    }, 900);

    schedule(() => {
      setPhase("pouring");
      announce(PHASE_TEXT.pouring);
      play("teaPouring", 0.8);
    }, 9200);

    schedule(() => {
      setPhase("shared");
      announce(`${PHASE_TEXT.shared} ${selectedTea.moment}`);
    }, 14000);
  };

  const phaseIcon = phase === "setting" ? "☕☕" : phase === "brewing" ? "♨️" : phase === "pouring" ? "🫖" : phase === "shared" ? "🐈💕" : "🫖";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 p-4" role="dialog" aria-modal="true" aria-labelledby="tea-with-maeve-heading">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-[#fff8e8] shadow-2xl ring-1 ring-amber-300">
        <div className="relative h-64 sm:h-80">
          <Image src={SCENES.maeveTeaTable} alt="Maeve sharing tea with the player while Marshmallow sits beside the table in the lighthouse at sunset" fill unoptimized sizes="(max-width: 672px) 100vw, 672px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20" />
          <div aria-hidden="true" className={`absolute bottom-16 left-1/2 -translate-x-1/2 rounded-full bg-amber-50/90 px-5 py-3 text-4xl shadow-lg ${busy ? "animate-pulse" : ""}`}>{phaseIcon}</div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-200">Lighthouse Activity</p>
              <h2 id="tea-with-maeve-heading" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold outline-none">Tea with Maeve &amp; Marshmallow</h2>
            </div>
            <button type="button" onClick={onClose} className="min-h-11 rounded-full bg-white px-4 py-2 font-bold text-amber-950" aria-label="Close tea with Maeve">Close</button>
          </div>
        </div>

        <div className="p-5">
          <p className="rounded-xl bg-amber-100 p-3 text-center text-sm font-semibold text-amber-950" aria-hidden="true">{PHASE_TEXT[phase]}</p>
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true"><span key={announcement.revision}>{announcement.message}</span></div>

          {phase === "choosing" && (
            <fieldset className="mt-5 space-y-3">
              <legend className="font-serif text-lg font-bold text-amber-950">Choose a prepared tea</legend>
              {TEAS.map((tea) => {
                const item = ITEMS[tea.itemId];
                const count = state.inventory[tea.itemId] || 0;
                const selected = selectedId === tea.itemId;
                return (
                  <button key={tea.itemId} type="button" disabled={count < 1} aria-pressed={selected} onClick={() => setSelectedId(tea.itemId)} className={`min-h-16 w-full rounded-xl p-3 text-left ring-2 ${selected ? "bg-amber-700 text-white ring-amber-900" : "bg-white text-amber-950 ring-amber-200"} disabled:bg-slate-100 disabled:text-slate-500 disabled:ring-slate-200`}>
                    <span className="font-bold">{item.icon} {item.name}</span>
                    <span className="mt-1 block text-xs">{tea.note} In pantry: {count}.</span>
                  </button>
                );
              })}
              <button type="button" disabled={availableCount < 1} onClick={beginTea} className="mt-2 min-h-12 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800 disabled:bg-slate-300 disabled:text-slate-600">
                {availableCount > 0 ? `Brew ${ITEMS[selectedId].name}` : "Prepare Tea in the Workshop First"}
              </button>
            </fieldset>
          )}

          {busy && (
            <div className="mt-5 text-center">
              <p className="font-serif text-xl font-bold text-amber-950">{ITEMS[selectedId].name}</p>
              <p className="mt-2 text-sm text-amber-800">Listen as Maeve prepares the table. The next step happens automatically.</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-amber-200" role="progressbar" aria-label="Tea preparation progress" aria-valuemin={0} aria-valuemax={3} aria-valuenow={phase === "setting" ? 1 : phase === "brewing" ? 2 : 3}>
                <div className="h-full rounded-full bg-teal-600 transition-all duration-700" style={{ width: phase === "setting" ? "33%" : phase === "brewing" ? "66%" : "100%" }} />
              </div>
            </div>
          )}

          {phase === "shared" && (
            <div className="mt-5 rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-amber-200">
              <p className="text-3xl" aria-hidden="true">☕ 🫖 🐈</p>
              <h3 className="mt-2 font-serif text-xl font-bold text-amber-950">A Quiet Cup Together</h3>
              <p className="mt-3 text-sm leading-relaxed text-amber-900">{selectedTea.moment}</p>
              <p className="mt-3 text-xs font-semibold text-teal-800">Tea visits shared: {state.maeveTeaVisits}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setPhase("choosing")} className="min-h-11 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">Choose Another Tea</button>
                <button type="button" onClick={onClose} className="min-h-11 rounded-xl bg-amber-700 px-4 py-3 font-bold text-white">Return to the Lighthouse</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
