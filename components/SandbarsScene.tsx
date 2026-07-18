"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ITEMS, rollSandbarSpawn } from "@/lib/items";
import { useGame } from "@/lib/store";
import { SCENES } from "@/lib/media";

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
      itemId: rollSandbarSpawn(),
      x: 8 + Math.random() * 84,
      y: 38 + Math.random() * 50,
    });
  }
  return spots;
}

function RaftCard() {
  const { state, reinflateRaft, feedKelpToBirds, splashBirds, ignoreBirds, hasEnough } = useGame();
  const [birdEvent, setBirdEvent] = useState(false);
  const canKelp = hasEnough([{ itemId: "food-seaweed-chips", count: 1 }]);

  const checkOnRaft = () => {
    if (!state.raftInflated) return;
    if (Math.random() < 0.6) setBirdEvent(true);
  };

  const resolve = (fn: () => void) => {
    fn();
    setBirdEvent(false);
  };

  if (!state.raftInflated) {
    return (
      <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-slate-300 text-center">
        <p className="text-3xl mb-1">🫠</p>
        <p className="font-semibold text-slate-800 mb-1">The raft has deflated</p>
        <p className="text-sm text-slate-600 mb-3">pffFSSSSSSSSssss... it drifted back to the dock. No materials needed to re-inflate.</p>
        <button
          type="button"
          onClick={reinflateRaft}
          className="w-full py-3 rounded-xl font-semibold text-white bg-teal-600 active:bg-teal-700 shadow"
        >
          🧧 Hold to Re-Inflate
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-teal-200">
      <p className="font-semibold text-teal-900 mb-1">🛟 The Inflatable Raft</p>
      <p className="text-sm text-teal-700 mb-3">Bobbing gently, anchored just past the shore. Keep an eye out for curious gulls.</p>
      {!birdEvent ? (
        <button
          type="button"
          onClick={checkOnRaft}
          className="w-full py-3 rounded-xl font-semibold text-white bg-teal-600 active:bg-teal-700 shadow"
        >
          👀 Check on the Raft
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-amber-700 text-center">🕊️ A seagull lands on your raft, eyeing it as a bouncy surface!</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canKelp}
              onClick={() => resolve(feedKelpToBirds)}
              className="flex-1 text-xs font-semibold px-2 py-2 rounded-full text-white disabled:bg-emerald-200 disabled:text-emerald-500 bg-emerald-600 active:bg-emerald-700"
            >
              🌿 Toss Kelp Chip
            </button>
            <button
              type="button"
              onClick={() => resolve(splashBirds)}
              className="flex-1 text-xs font-semibold px-2 py-2 rounded-full text-white bg-sky-600 active:bg-sky-700"
            >
              💦 Splash Water
            </button>
            <button
              type="button"
              onClick={() => resolve(ignoreBirds)}
              className="flex-1 text-xs font-semibold px-2 py-2 rounded-full text-white bg-slate-500 active:bg-slate-600"
            >
              🙈 Ignore
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SandbarsScene() {
  const { state, collectItem } = useGame();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [poppingKeys, setPoppingKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSpots(randomSpots(6));
  }, []);

  if (!state.sandbarsUnlocked) {
    return (
      <div className="h-full overflow-y-auto pb-24 px-4 pt-4 bg-[#0e4a52] flex items-center justify-center">
        <div className="rounded-2xl bg-white/90 p-6 shadow-md ring-1 ring-teal-200 text-center max-w-sm">
          <p className="text-3xl mb-2">🛟</p>
          <p className="font-semibold text-teal-900 mb-1">The Sandbars are out of reach</p>
          <p className="text-sm text-teal-700">Craft the Inflatable Rubber Raft in the Workshop's Décor tab to explore the Shifting Sandbars.</p>
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
      setSpots((cur) => (cur.length < 4 ? [...cur, ...randomSpots(1)] : cur));
    }, 220);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#0e4a52]">
      <div className="relative w-full h-[45%] min-h-[220px] overflow-hidden select-none">
        <Image src={SCENES.treasureCove} alt="Shifting Sandbars" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-teal-900/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#0e4a52]" />
        {spots.map((spot) => {
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
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: 50, height: 50 }}
            >
              {def.isEmoji ? (
                <span className="text-2xl">{def.icon}</span>
              ) : (
                <Image src={def.icon} alt={def.name} width={34} height={34} unoptimized className="object-contain drop-shadow" />
              )}
            </button>
          );
        })}
      </div>

      <div className="px-4 pt-4">
        <RaftCard />
        <p className="text-xs text-teal-200/70 text-center mt-4">Open-water sandbars, shifting with every tide.</p>
      </div>
    </div>
  );
}
