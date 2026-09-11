"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ITEMS, rollCoveSpawn } from "@/lib/items";
import { useGame } from "@/lib/store";
import { SCENES } from "@/lib/media";
import ShellMatch from "./ShellMatch";

interface Spot {
  key: string;
  itemId: string;
  x: number;
  y: number;
}

function randomSpots(n: number): Spot[] {
  const spots: Spot[] = [];
  for (let i = 0; i < n; i++) {
    spots.push({
      key: `${Date.now()}-${i}-${Math.random()}`,
      itemId: rollCoveSpawn(),
      x: 8 + Math.random() * 84,
      y: 40 + Math.random() * 48,
    });
  }
  return spots;
}

const CHEST_COST = [
  { itemId: "shell-sanddollar", count: 3 },
  { itemId: "pearl-blue", count: 2 },
];

function ChestCard() {
  const { state, openChest, hasEnough } = useGame();
  const canOpen = hasEnough(CHEST_COST);

  if (state.chestOpened) {
    return (
      <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-amber-200 text-center">
        <p className="text-3xl mb-1">🔝️</p>
        <p className="font-semibold text-amber-900 mb-1">The chest lies open</p>
        <p className="text-sm text-amber-700">
          Inside you found an Old Nautical Map 🗺️, a Brass Compass 🧭, and a full set of Diving Gear 🤿.
          The map and compass point toward a winding path up into the cliffs.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-amber-200">
      <h2 className="text-lg font-bold text-amber-900 mb-1">🔒 A Locked Treasure Chest</h2>
      <p className="text-sm text-amber-700 mb-3">
        An old sea chest, rusted shut. It needs a few precious ocean treasures to weight-balance the locking mechanism.
      </p>
      <div className="flex gap-3 mb-4 flex-wrap">
        {CHEST_COST.map((c) => {
          const def = ITEMS[c.itemId];
          const have = c.itemId === "shell-sanddollar" ? state.sandDollars : state.inventory[c.itemId] || 0;
          const ok = have >= c.count;
          return (
            <div key={c.itemId} className={`flex flex-col items-center rounded-xl p-2 ring-1 ${ok ? "ring-emerald-300 bg-emerald-50" : "ring-red-200 bg-red-50"}`}>
              <Image src={def.icon} alt={def.name} width={32} height={32} unoptimized className="object-contain" />
              <span className="text-[10px] mt-1 text-amber-800">{have}/{c.count}</span>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        disabled={!canOpen}
        onClick={() => openChest(CHEST_COST)}
        className="w-full py-3 rounded-xl font-semibold text-white transition disabled:bg-amber-200 disabled:text-amber-500 bg-teal-600 active:bg-teal-700 shadow"
      >
        {canOpen ? "Open the Chest" : "Need More Treasures"}
      </button>
    </div>
  );
}

function MaevesKettleCard() {
  const { state, recoverMaevesKettle } = useGame();
  const questDone = !!state.questProgress.keeperkettle;

  if (questDone) return null;

  if (state.kettleRecovered) {
    return (
      <div className="rounded-2xl bg-emerald-50 p-4 shadow-md ring-1 ring-emerald-300">
        <p className="font-bold text-emerald-950">🫖 Maeve&apos;s kettle is safe</p>
        <p className="mt-1 text-sm text-emerald-800">Take it to The Keeper&apos;s Kettle on the Bottles tab to return it to her.</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="kettle-heading" className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-amber-300">
      <div className="relative h-40 w-full">
        <Image src={SCENES.maevesKettle} alt="Maeve's weathered copper kettle caught among rocks and seaweed" fill unoptimized className="object-cover" />
      </div>
      <div className="p-4">
        <h2 id="kettle-heading" className="font-serif text-lg font-bold text-amber-950">A copper glint in the kelp</h2>
        <p className="mt-1 text-sm text-amber-800">Something heavy is caught along the southwest drift line. Its dented spout gives a faint whistle as the water retreats.</p>
        <button type="button" onClick={recoverMaevesKettle} className="mt-3 w-full rounded-xl bg-amber-700 py-3 font-bold text-white shadow active:bg-amber-800">
          Free the Copper Kettle
        </button>
      </div>
    </section>
  );
}

export default function CoveScene() {
  const { state, collectItem, setMusicOverride } = useGame();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [poppingKeys, setPoppingKeys] = useState<Record<string, boolean>>({});
  const [showChest, setShowChest] = useState(false);
  const [shellMatchOpen, setShellMatchOpen] = useState(false);
  const shellMatchButtonRef = useRef<HTMLButtonElement>(null);

  const closeShellMatch = () => {
    setShellMatchOpen(false);
    window.setTimeout(() => shellMatchButtonRef.current?.focus(), 0);
  };

  useEffect(() => {
    setSpots(randomSpots(7));
  }, []);

  useEffect(() => {
    if (state.rowboatRepaired) setMusicOverride("cove");
    return () => setMusicOverride(null);
  }, [state.rowboatRepaired, setMusicOverride]);

  if (!state.rowboatRepaired) {
    return (
      <div className="h-full overflow-y-auto pb-24 px-4 pt-4 bg-[#fbf3e3] flex items-center justify-center">
        <div className="rounded-2xl bg-white/90 p-6 shadow-md ring-1 ring-amber-200 text-center max-w-sm">
          <p className="text-3xl mb-2">🚣</p>
          <p className="font-semibold text-amber-900 mb-1">The Hidden Beach is out of reach</p>
          <p className="text-sm text-amber-700">
            Fill your bucket on the main beach, then repair the rowboat in the Workshop to row out to the Hidden Cove.
          </p>
        </div>
      </div>
    );
  }

  const handleTap = (spot: Spot) => {
    if (poppingKeys[spot.key]) return;
    setPoppingKeys((p) => ({ ...p, [spot.key]: true }));
    collectItem(spot.itemId);
    window.setTimeout(() => {
      setSpots((cur) => cur.filter((s) => s.key !== spot.key));
      setSpots((cur) => (cur.length < 5 ? [...cur, ...randomSpots(1)] : cur));
    }, 220);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#fbf3e3]">
      <div className="relative w-full h-[55%] min-h-[280px] overflow-hidden select-none">
        <Image src={SCENES.treasureCove} alt="Hidden Cove" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
        {!showChest &&
          spots.map((spot) => {
            const def = ITEMS[spot.itemId];
            const popping = poppingKeys[spot.key];
            return (
              <button
                key={spot.key}
                onClick={() => handleTap(spot)}
                aria-label={`Collect ${def.name}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm shadow-lg ring-1 ring-white/60 transition-all duration-200 active:scale-90 ${
                  popping ? "opacity-0 scale-150" : "opacity-100 scale-100 animate-bob"
                }`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: 52, height: 52 }}
              >
                <Image src={def.icon} alt={def.name} width={36} height={36} unoptimized className="object-contain drop-shadow" />
              </button>
            );
          })}
        <button
          type="button"
          onClick={() => setShowChest((v) => !v)}
          className="absolute bottom-3 right-3 bg-amber-900/80 text-amber-50 text-xs font-semibold px-3 py-2 rounded-full shadow-lg"
        >
          {showChest ? "🏖️ Back to Cove" : "🔒 View Chest"}
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4">{showChest ? <ChestCard /> : (
        <>
          <p className="text-xs text-amber-700/80 text-center">Tap the sparkling treasures in the cove above to collect them.</p>
          <MaevesKettleCard />
          <section aria-labelledby="cove-game-heading" className="rounded-2xl bg-gradient-to-br from-sky-50 to-amber-50 p-4 shadow-md ring-1 ring-sky-200">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">Cove Mini-Game</p>
            <h2 id="cove-game-heading" className="mt-1 font-serif text-lg font-bold text-sky-950">🐚 Shell Match</h2>
            <p className="mt-1 text-sm text-sky-800">Turn over shell cards to find matching pairs. Higher levels introduce similar shapes and a rare shell.</p>
            <button
              ref={shellMatchButtonRef}
              type="button"
              onClick={() => setShellMatchOpen(true)}
              className="mt-3 w-full rounded-xl bg-sky-800 py-3 font-bold text-white shadow active:bg-sky-900"
            >
              Play Shell Match
            </button>
          </section>
        </>
      )}</div>

      {shellMatchOpen && <ShellMatch onClose={closeShellMatch} />}
    </div>
  );
}
