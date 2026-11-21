"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import LilyPadCrossing from "./LilyPadCrossing";

const seasonalFeathers = [
  "robin-blossom-feather",
  "robin-golden-sun-feather",
  "robin-copper-leaf-feather",
  "robin-frosted-crystal-feather",
];
const sightingId = "woodland-swan";
const controlStyle = "min-h-11 rounded-lg bg-emerald-900 px-3 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400";
const hotspotStyle = "absolute min-h-11 min-w-11 rounded-full touch-manipulation hover:bg-white/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300";

export default function WoodlandSwanPond({ now }: { now: number }) {
  const { state, play, markVillagerEncounter } = useGame();
  const [viewedDay, setViewedDay] = useState<number | null>(null);
  const [crossing, setCrossing] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const entry = useRef<HTMLButtonElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const lilyPads = useRef<HTMLButtonElement>(null);
  const date = new Date(now);
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  const unlocked = !!state.robinNestingCompleted?.length || state.notebookDiscovered[sightingId]
    || seasonalFeathers.some((id) => (state.inventory[id] || 0) > 0);
  const visiting = day % 4 === 0;
  const seen = visiting && viewedDay === day;

  useEffect(() => {
    if (!dialog.current?.open) return;
    if (crossing) title.current?.focus();
    else lilyPads.current?.focus();
  }, [crossing]);

  if (!unlocked) return null;

  const openPond = () => {
    dialog.current?.showModal();
    title.current?.focus();
  };

  const onClose = () => {
    setCrossing(false);
    entry.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <button ref={entry} type="button" aria-haspopup="dialog" onClick={openPond}
        className="flex min-h-12 w-full items-center gap-3 rounded-xl bg-white p-2 text-left font-bold text-emerald-950 shadow-sm ring-1 ring-emerald-300 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-500">
        <Image src="/images/Robin/woodland-pond.webp" alt="" width={76} height={50} unoptimized
          className="h-[50px] w-[76px] rounded-lg object-cover" />
        Visit Woodland Pond
      </button>

      <dialog ref={dialog} onClose={onClose} aria-labelledby="woodland-pond-title"
        className="m-auto max-h-[90dvh] w-[calc(100%_-_1.5rem)] max-w-3xl overflow-y-auto overscroll-contain rounded-2xl bg-emerald-50 p-4 text-emerald-950 shadow-2xl backdrop:bg-slate-950/70 sm:p-5">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 ref={title} id="woodland-pond-title" tabIndex={-1} className="font-serif text-2xl font-bold">
            {crossing ? "Lily Pad Crossing" : "Woodland Pond"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {crossing && <button type="button" className={controlStyle} onClick={() => setCrossing(false)}>Back to the Pond</button>}
            <button type="button" className={controlStyle} onClick={() => dialog.current?.close()}>Return to Woodland Trail</button>
          </div>
        </header>
        <div hidden={crossing}>
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-emerald-800">
            <Image src="/images/Robin/woodland-pond.webp" alt="A calm woodland pond framed by reeds and water lilies."
              fill sizes="(max-width: 768px) 100vw, 720px" unoptimized className="object-cover" />
            <button ref={lilyPads} type="button" aria-label="Play Lily Pad Crossing" onClick={() => setCrossing(true)}
              className={`${hotspotStyle} left-[2%] top-[38%] flex h-[27%] w-[32%] items-center justify-center`}>
              <span aria-hidden="true" className="rounded-full bg-emerald-900/85 px-2 py-1 text-xl shadow ring-1 ring-emerald-200 sm:text-2xl">🐸</span>
            </button>
            {visiting && <button type="button" aria-label={seen ? "Listen to the swan’s call again" : "Visit the Swan"}
              className={`${hotspotStyle} left-[55%] top-[49%] aspect-[3/2] w-[34%] ${seen ? "woodland-swan-glide" : ""}`}
              onClick={() => {
                setViewedDay(day);
                play("woodlandSwanCall", 0.65);
                if (!state.notebookDiscovered[sightingId]) markVillagerEncounter(sightingId);
              }}>
              <Image src="/images/Robin/woodland-swan.webp" alt="" fill sizes="(max-width: 768px) 34vw, 250px"
                unoptimized className="object-contain" />
            </button>}
          </div>
          <p role="status" className="mt-3 text-sm">
            {seen ? "The white swan glides past the reeds, leaving a soft ripple. Swan Sighting is recorded in your Explorer’s Notebook."
              : visiting ? "A white swan is visiting the pond today."
              : "The swan is away today. It returns every few days."}
          </p>
        </div>
        <div hidden={!crossing}>
          <LilyPadCrossing active={crossing} />
        </div>
      </dialog>

      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          .woodland-swan-glide { animation: swan-glide 7s ease-out both; }
        }
        @keyframes swan-glide {
          from { transform: translateX(0); }
          to { transform: translateX(-65%); }
        }
      `}</style>
    </>
  );
}
