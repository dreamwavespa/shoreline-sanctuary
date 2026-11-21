"use client";

import Image from "next/image";
import { useState } from "react";
import { useGame } from "@/lib/store";

const seasonalFeathers = [
  "robin-blossom-feather",
  "robin-golden-sun-feather",
  "robin-copper-leaf-feather",
  "robin-frosted-crystal-feather",
];
const sightingId = "woodland-swan";

export default function WoodlandSwanPond({ now }: { now: number }) {
  const { state, play, markVillagerEncounter } = useGame();
  const [viewedDay, setViewedDay] = useState<number | null>(null);
  const date = new Date(now);
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  const unlocked = !!state.robinNestingCompleted?.length || state.notebookDiscovered[sightingId]
    || seasonalFeathers.some((id) => (state.inventory[id] || 0) > 0);
  const visiting = day % 4 === 0;
  const seen = visiting && viewedDay === day;
  if (!unlocked) return null;

  return (
    <section aria-labelledby="woodland-swan-title" className="space-y-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-300">
      <h2 id="woodland-swan-title" className="text-xl font-bold text-emerald-950">Woodland Pond</h2>
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-emerald-800">
        <Image src="/images/Robin/woodland-pond.webp" alt="A calm woodland pond framed by reeds and water lilies."
          fill sizes="(max-width: 768px) 100vw, 720px" unoptimized className="object-cover" />
        {seen && <div className="woodland-swan-glide absolute left-[55%] top-[49%] aspect-[3/2] w-[34%]">
          <Image src="/images/Robin/woodland-swan.webp" alt="A white swan with a curved neck glides across the pond."
            fill sizes="(max-width: 768px) 34vw, 250px" unoptimized className="object-contain" />
        </div>}
        {visiting && <button type="button"
          className="absolute bottom-3 left-1/2 w-max max-w-[94%] -translate-x-1/2 min-h-12 rounded-xl bg-emerald-800 px-4 py-2 font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-500"
          onClick={() => {
            setViewedDay(day);
            play("woodlandSwanCall", 0.65);
            if (!state.notebookDiscovered[sightingId]) markVillagerEncounter(sightingId);
          }}>{seen ? "Listen to the swan’s call again" : "Visit the Swan"}</button>}
      </div>
      <p role="status" className="text-sm text-emerald-950">
        {seen ? "A white swan glides past the reeds, leaving a soft ripple. Swan Sighting is recorded in your Explorer’s Notebook."
          : visiting ? "A white swan is visiting the pond today."
          : "The pond is quiet today. The swan returns every few days."}
      </p>
      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          .woodland-swan-glide { animation: swan-glide 7s ease-out both; }
        }
        @keyframes swan-glide {
          from { transform: translateX(46%); }
          to { transform: translateX(-110%); }
        }
      `}</style>
    </section>
  );
}
