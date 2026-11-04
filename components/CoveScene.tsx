"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { OffshoreEntry } from "./Offshore";
import { ITEMS, rollCoveSpawn } from "@/lib/items";
import { useGame } from "@/lib/store";
import { getShopDateKey } from "@/lib/shop";
import ShellMatch from "./ShellMatch";

interface Spot {
  key: string;
  itemId: string;
  x: number;
  y: number;
}

const coveImage = (name: string) => `/images/Cove/${name}?v=${process.env.NEXT_PUBLIC_SHORELINE_ASSET_VERSION || "development"}`;
const coveNight = () => { const hour = new Date().getHours(); return hour >= 19 || hour < 6; };

function randomSpots(n: number): Spot[] {
  const spots: Spot[] = [];
  for (let i = 0; i < n; i++) {
    spots.push({
      key: `${Date.now()}-${i}-${Math.random()}`,
      itemId: rollCoveSpawn(),
      x: 14 + Math.random() * 72,
      y: 60 + Math.random() * 31,
    });
  }
  return spots;
}

const CHEST_COST = [
  { itemId: "shell-sanddollar", count: 3 },
  { itemId: "pearl-blue", count: 2 },
];

const CHEST_TREASURE_NOTES: Record<string, string> = {
  "moonstone-moon": "A crescent-shaped moonstone that gives off a soft silver glow.",
  "carnelian-heart": "A warm orange-red gemstone polished into a tiny heart.",
  "charm-green-leaf": "A rare green leaf charm found only during September. Once collected, it stays in your inventory until used in custom jewelry.",
  "pendant-red-apple": "A rare red apple pendant found only during September. Once collected, it stays in your inventory until used in custom jewelry.",
  "blueprint-beach-hut": "Plans for a cozy beach hut—a clue for a future sanctuary expansion.",
  "blueprint-library": "Detailed plans for a quiet island library—a future expansion waiting to be built.",
  "map-underwater-crystal-cave": "A water-worn map marking the Benthic Pocket beneath Waverly’s research ship. Visit the marine lab through the Reef.",
  "pearl-rainbow": "A rare pearl whose colors shift like a rainbow in sunlight.",
  "pearl-gold": "A lustrous pearl with a rich golden sheen.",
  "pearl-glow-dark": "A pale pearl that glows softly after the surrounding light fades.",
  "glass-aquamarine-glow": "Aquamarine sea glass with a mysterious light shining from within.",
  "gold-world-globe": "A tiny old-world globe etched in gold, with islands picked out along its surface.",
  "bag-old-coins": "A weathered pouch filled with old coins from distant ports.",
};

function ChestCard() {
  const { state, openChest, searchChest, hasEnough } = useGame();
  const [todayKey, setTodayKey] = useState("");
  const canOpen = hasEnough(CHEST_COST);
  const claimedToday = !!todayKey && state.chestDailyClaimDate === todayKey;
  const dailyFind = state.chestDailyRewardItemId ? ITEMS[state.chestDailyRewardItemId] : null;
  const isSeptember = todayKey.slice(5, 7) === "09";

  useEffect(() => {
    setTodayKey(getShopDateKey());
  }, []);

  if (state.chestOpened) {
    return (
      <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-amber-200 text-center">
        <p className="text-3xl mb-1">🧰</p>
        <p className="font-semibold text-amber-900 mb-1">The chest lies open</p>
        <p className="text-sm text-amber-700">
          Inside you found an Old Nautical Map 🗺️, a Brass Compass 🧭, and a full set of Diving Gear 🤿.
          The map and compass point toward a winding path up into the cliffs.
        </p>
        <div className="mt-4 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
          <p className="font-semibold text-amber-900">Daily Chest Treasure</p>
          <p className="mt-1 text-sm text-amber-700">Search once each day for glowing gems, rare pearls, old-world curios, or plans pointing toward future sanctuary expansions.</p>
          {isSeptember && <p className="mt-2 text-sm font-semibold text-emerald-800">September finds may include a rare Green Leaf Charm or Red Apple Pendant for Melody&apos;s custom jewelry.</p>}
          {claimedToday && dailyFind && (
            <div role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-emerald-900 ring-1 ring-emerald-200">
              <span
                aria-hidden="true"
                className={`inline-block text-4xl ${dailyFind.glows ? "chest-treasure-glow" : ""}`}
              >
                {dailyFind.icon}
              </span>
              <p className="mt-1 text-sm font-bold">Today&apos;s find: {dailyFind.name}</p>
              {CHEST_TREASURE_NOTES[dailyFind.id] && <p className="mt-1 text-sm">{CHEST_TREASURE_NOTES[dailyFind.id]}</p>}
            </div>
          )}
          <button
            type="button"
            disabled={!todayKey || claimedToday}
            onClick={searchChest}
            className="mt-3 min-h-12 w-full rounded-xl bg-amber-700 px-4 py-3 font-bold text-white shadow disabled:bg-amber-200 disabled:text-amber-600 active:bg-amber-800"
          >
            {claimedToday ? "Treasure Collected Today" : "Search the Chest"}
          </button>
        </div>
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
        <Image src={coveImage("Copper-kettle.PNG")} alt="Maeve's weathered copper kettle caught among rocks and seaweed" fill unoptimized className="object-cover" />
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
  const { state, collectItem, setMusicOverride, recoverMaevesKettle } = useGame();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [poppingKeys, setPoppingKeys] = useState<Record<string, boolean>>({});
  const [showChest, setShowChest] = useState(false);
  const [dockOpen, setDockOpen] = useState(false);
  const dockButtonRef = useRef<HTMLButtonElement>(null);
  const [shellMatchOpen, setShellMatchOpen] = useState(false);
  const [nighttime, setNighttime] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const shellMatchButtonRef = useRef<HTMLButtonElement>(null);

  const closeShellMatch = () => {
    setShellMatchOpen(false);
    window.setTimeout(() => shellMatchButtonRef.current?.focus(), 0);
  };

  useEffect(() => {
    const updateTime = () => setNighttime(coveNight());
    updateTime();
    const interval = window.setInterval(updateTime, 60000);
    setSpots(randomSpots(7));
    return () => window.clearInterval(interval);
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
    setAnnouncement(`${ITEMS[spot.itemId].name} collected and added to inventory.`);
    window.setTimeout(() => {
      setSpots((cur) => cur.filter((s) => s.key !== spot.key));
      setSpots((cur) => (cur.length < 5 ? [...cur, ...randomSpots(1)] : cur));
    }, 220);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#fbf3e3]">
      <p className="sr-only" role="status">{announcement}</p>
      <p className="sr-only" role="status">{nighttime ? "Night has fallen over the Hidden Cove." : "It is daytime at the Hidden Cove."}</p>
      <div className="relative mx-auto w-full max-w-[780px] aspect-[2/3] select-none">
        <Image
          src={coveImage(nighttime ? "Cove-background-night-time.PNG" : "Cove-background-day-time.PNG")}
          alt={nighttime ? "Moonlit Hidden Cove with rocky pools and a sheltered sandy shore" : "Sunlit Hidden Cove with rocky pools and a sheltered sandy shore"}
          fill unoptimized priority className="object-fill"
        />
        <button type="button" ref={dockButtonRef} aria-label="Visit Cove Dock for wildlife photography and salvage voyages" aria-expanded={dockOpen} onClick={() => { setDockOpen(true); setShowChest(false); }}
          className="absolute left-[3%] top-[38%] w-[37%] h-[23%] focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400">
          <Image src={coveImage("Cove-dock-rowboat.PNG")} alt="" fill unoptimized className="object-contain" />
        </button>
        <button type="button" aria-label={state.chestOpened ? "Open daily treasure chest activities" : "Inspect locked treasure chest"}
          onClick={() => { setShowChest(true); setDockOpen(false); }}
          className="absolute left-[8%] top-[27%] w-[26%] h-[15%] focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400">
          <Image src={coveImage(state.chestOpened ? "Cove-treasure-chest-open.png" : "Cove-treasure-chest-closed.png")} alt="" fill unoptimized className="object-contain" />
        </button>
        {!state.questProgress.keeperkettle && !state.kettleRecovered && (
          <button type="button" aria-label="Discover Maeve's copper kettle among the rocks" onClick={() => { recoverMaevesKettle(); setAnnouncement("Maeve’s copper kettle recovered. Return it through The Keeper’s Kettle bottle quest."); }}
            className="absolute right-[4%] top-[43%] w-[30%] h-[18%] focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400"
>
            <Image src={coveImage("Copper-kettle.PNG")} alt="" fill unoptimized className="object-contain" />
          </button>
        )}
        <button ref={shellMatchButtonRef} type="button" aria-label="Play Shell Match" onClick={() => setShellMatchOpen(true)}
          className="absolute right-[4%] top-[62%] h-[19%] w-[37%] focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400">
          <Image src={coveImage("Shell-match.PNG")} alt="" fill unoptimized className="object-contain" />
        </button>
        {!showChest && spots.map(spot => {
          const def = ITEMS[spot.itemId];
          return (
            <button key={spot.key} type="button" onClick={() => handleTap(spot)} aria-label={`Collect ${def.name}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full drop-shadow-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 ${poppingKeys[spot.key] ? "opacity-0" : "animate-bob"}`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: 44, height: 44 }}>
              {def.icon.startsWith("/") || def.icon.startsWith("http") ? <Image src={def.icon} alt="" width={32} height={32} unoptimized className="object-contain" /> : <span aria-hidden="true" className="text-2xl">{def.icon}</span>}
            </button>
          );
        })}
      </div>
      <div className="mx-auto max-w-[780px] px-4 pt-4 space-y-3">
        {showChest && <section aria-label="Treasure chest"><button type="button" onClick={() => setShowChest(false)} className="mb-3 rounded-lg bg-amber-800 px-4 py-3 font-semibold text-white">Return to Cove</button><ChestCard /></section>}
        {!state.questProgress.keeperkettle && <MaevesKettleCard />}
        <OffshoreEntry kind="dock" sceneOpen={dockOpen} onSceneClose={() => { setDockOpen(false); window.setTimeout(() => dockButtonRef.current?.focus(), 0); }} />
      </div>
      {shellMatchOpen && <ShellMatch onClose={closeShellMatch} />}
    </div>
  );
}
