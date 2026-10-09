"use client";
import Image from "next/image";
import { useState } from "react";
import { useGame } from "@/lib/store";

export default function BooTreasureCorner() {
  const { state } = useGame();
  const [view, setView] = useState<"home" | "collection">("home");
  const sands = [
    ["sand-pumpkin-orange", "Pumpkin Orange"],
    ["sand-candy-corn-swirl", "Candy Corn Swirl"],
  ] as const;
  return (
    <section aria-labelledby="boo-treasure-heading" className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-md ring-1 ring-indigo-300">
      <div className="relative h-56 sm:h-80">
        <Image src="/images/Boo-treasure-corner.PNG" alt="Boo's moonlit driftwood treasure nook, with lanterns, shelves of sparkling sands, a treasure chest, and the ocean beyond." fill unoptimized sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 to-transparent p-4 pt-12">
          <h2 id="boo-treasure-heading" className="font-serif text-xl font-bold">Boo's Treasure Corner</h2>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm text-indigo-100">Welcome to Boo's moonlit hideaway on the Secret Sandbar. Explore his treasures, visit him, and see the sands you've collected.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <a href="#boo-sand-heading" className="min-h-12 rounded-xl bg-indigo-600 px-3 py-3 text-center font-semibold text-white focus:outline-none focus:ring-4 focus:ring-amber-300">Talk to Boo · Sand Art Stall</a>
          <a href="#boo-gifts-heading" className="min-h-12 rounded-xl bg-indigo-600 px-3 py-3 text-center font-semibold text-white focus:outline-none focus:ring-4 focus:ring-amber-300">Boo's ID Card & Gifts</a>
          <button type="button" onClick={() => setView(view === "collection" ? "home" : "collection")} aria-expanded={view === "collection"} aria-controls="boo-treasure-collection" className="min-h-12 rounded-xl bg-amber-600 px-3 py-3 font-semibold text-white focus:outline-none focus:ring-4 focus:ring-amber-300">{view === "collection" ? "Close Sand Collection" : "Explore Monthly Sands"}</button>
        </div>
        {view === "collection" && <div id="boo-treasure-collection" className="rounded-xl bg-white/10 p-3" aria-label="Boo's sand collection">
          <h3 className="font-semibold">Rare sands in your inventory</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {sands.map(([id, name]) => <li key={id}>{name}: {state.inventory[id] || 0} scoops</li>)}
          </ul>
          <p className="mt-2 text-xs text-indigo-100">More monthly sands and treasures will be added in a future update.</p>
        </div>}
        <p className="text-xs text-indigo-200">Coming next: interactive treasure digging, buried chests, moonlight scavenger hunts, and Boo's friendship adventures.</p>
      </div>
    </section>
  );
}
