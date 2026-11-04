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
const COVE_FIND_ART: Record<string, string> = {
  "shell-sanddollar": "Cove-sand-dollar.png",
  "shell-abalone": "Cove-abalone-shell.png",
  "raw-driftwood-planks": "Cove-driftwood.png",
  "pearl-cream": "Pearl-cream.png",
  "pearl-chocolate": "Pearl-chocolate.png",
  "pearl-globe": "Pearl-globe.png",
  "pottery-fragment-lighthouse": "Pottery-fragment-lighthouse.png",
  "pottery-fragment-wave": "Pottery-fragment-wave.png",
  "pottery-fragment-flower": "Pottery-fragment-flower.png",
  "pottery-fragment-shell": "Pottery-fragment-shell.png",
  "pottery-fragment-starfish": "Pottery-fragment-starfish.png",
  "tide-trinket-anchor": "Tide-trinket-anchor.png",
  "tide-trinket-locket": "Tide-trinket-locket.png",
  "tide-trinket-compass": "Tide-trinket-compass.png",
  "tide-trinket-shell": "Tide-trinket-shell.png",
  "tide-trinket-key": "Tide-trinket-key.png",
};
function coveFindArt(id: string): string | null {
  if (COVE_FIND_ART[id]) return coveImage(COVE_FIND_ART[id]);
  if (id.startsWith("glass-")) return coveImage("Cove-sea-glass.png");
  if (id.startsWith("pearl-")) return coveImage("Cove-pearl-oyster.png");
  return null;
}
const LOW_TIDE_COVE_POOL = [
  { id: "white-porcelain-clay", weight: 30 }, { id: "glitter", weight: 24 },
  { id: "pearl-cream", weight: 12 }, { id: "pearl-chocolate", weight: 6 }, { id: "pearl-globe", weight: 1 },
  ...["lighthouse","wave","flower","shell","starfish"].map(x => ({ id: "pottery-fragment-" + x, weight: 3 })),
  ...["anchor","locket","compass","shell"].map(x => ({ id: "tide-trinket-" + x, weight: 2.5 })),
  { id: "tide-trinket-key", weight: 2 },
];
function rollLowTideCove(): string {
  let n = Math.random() * LOW_TIDE_COVE_POOL.reduce((sum, e) => sum + e.weight, 0);
  for (const e of LOW_TIDE_COVE_POOL) { n -= e.weight; if (n < 0) return e.id; }
  return "white-porcelain-clay";
}
const coveNight = () => { const hour = new Date().getHours(); return hour >= 19 || hour < 6; };

// Hand-picked sandy zones keep finds away from the dock, chest, rocks and Shell Match.
const COVE_SAND_POSITIONS = [
  [44, 62], [53, 66], [38, 71], [50, 75], [62, 73],
  [32, 80], [44, 84], [56, 85], [67, 88], [36, 91],
  [49, 92], [64, 94], [77, 84], [25, 87],
] as const;
function randomSpots(n: number, occupied: Spot[] = []): Spot[] {
  const used = new Set(occupied.map(s => `${s.x},${s.y}`));
  const positions = [...COVE_SAND_POSITIONS].filter(([x,y]) => !used.has(`${x},${y}`));
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  return positions.slice(0, n).map(([x,y], i) => ({
    key: `${Date.now()}-${i}-${Math.random()}`,
    itemId: rollCoveSpawn(),
    x, y,
  }));
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


const COVE_COLLECTIONS = [
  { title: "Tidekeeper's Vase", ids: ["pottery-fragment-lighthouse", "pottery-fragment-wave", "pottery-fragment-flower", "pottery-fragment-shell", "pottery-fragment-starfish"], description: "Collect five unique fragments to prepare for the future pottery restoration project." },
  { title: "Lost Tide Trinkets", ids: ["tide-trinket-anchor", "tide-trinket-locket", "tide-trinket-compass", "tide-trinket-shell", "tide-trinket-key"], description: "The Forgotten Tide Key may someday open a hidden time capsule." },
  { title: "Rare Cove Pearls", ids: ["pearl-cream", "pearl-chocolate", "pearl-globe"], description: "Chocolate and Globe Pearls will arrive with the unusually low tide discoveries." },
] as const;

function CoveTreasuresCollection({ discovered }: { discovered: Record<string, boolean> }) {
  return (
    <section aria-label="Cove Treasures collection" className="space-y-5">
      <p className="text-sm text-amber-900">Treasures remain recorded here even after they leave your inventory.</p>
      {COVE_COLLECTIONS.map(group => {
        const found = group.ids.filter(id => discovered[id]).length;
        return (
          <section key={group.title} className="rounded-xl bg-white p-4 ring-1 ring-amber-200" aria-label={group.title}>
            <h3 className="font-bold text-amber-950">{group.title} — {found} of {group.ids.length} discovered</h3>
            <p className="mb-3 text-sm text-amber-800">{group.description}</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {group.ids.map(id => {
                const foundItem = !!discovered[id];
                return (
                  <li key={id} className="rounded-lg bg-amber-50 p-3 text-center">
                    {foundItem ? <Image src={ITEMS[id].icon} alt="" width={76} height={76} unoptimized className="mx-auto h-20 w-20 object-contain" /> : <div aria-hidden="true" className="mx-auto flex h-20 w-20 items-center justify-center text-3xl">?</div>}
                    <span className="mt-2 block text-sm font-semibold text-amber-950">{foundItem ? ITEMS[id].name : "Undiscovered treasure"}</span>
                    <span className="block text-xs text-amber-800">{foundItem ? "Discovered" : "Not yet found"}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </section>
  );
}

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
  const [showCollection, setShowCollection] = useState(false);
  const collectionButtonRef = useRef<HTMLButtonElement>(null);
  const [dockOpen, setDockOpen] = useState(false);
  const dockButtonRef = useRef<HTMLButtonElement>(null);
  const chestButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [shellMatchOpen, setShellMatchOpen] = useState(false);
  const [nighttime, setNighttime] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [lowTideSearches, setLowTideSearches] = useState(0);
  const [lowTideMessage, setLowTideMessage] = useState("");
  const lowTideDate = state.weatherForecastDate;
  const today = new Date().toLocaleDateString("en-CA");
  const lowTideActive = state.currentForecast?.id === "low-tide" && lowTideDate === today;
  const lowTideKey = "shoreline-low-tide-cove-" + lowTideDate;
  useEffect(() => {
    if (!lowTideActive) { setLowTideSearches(0); return; }
    try { setLowTideSearches(Math.min(3, Math.max(0, Number(localStorage.getItem(lowTideKey) || "0")))); }
    catch { setLowTideSearches(0); }
  }, [lowTideActive, lowTideKey]);
  const searchLowTideCove = () => {
    if (!lowTideActive) return;
    let saved = 0;
    try { saved = Math.min(3, Math.max(0, Number(localStorage.getItem(lowTideKey) || "0"))); } catch {}
    if (saved >= 3) { setLowTideSearches(3); setLowTideMessage("All three low-tide searches are complete."); return; }
    const id = rollLowTideCove();
    if (!ITEMS[id]) return;
    try { localStorage.setItem(lowTideKey, String(saved + 1)); } catch {}
    setLowTideSearches(saved + 1);
    collectItem(id, { silent: true });
    setLowTideMessage("You discovered " + ITEMS[id].name + " among the exposed Cove rocks! Added to inventory. " + (2 - saved) + " searches remaining.");
  };

  const shellMatchButtonRef = useRef<HTMLButtonElement>(null);

  const closeActivity = () => {
    const wasDock = dockOpen;
    const wasCollection = showCollection;
    setDockOpen(false);
    setShowChest(false);
    setShowCollection(false);
    window.setTimeout(() => (wasCollection ? collectionButtonRef : wasDock ? dockButtonRef : chestButtonRef).current?.focus(), 0);
  };
  useEffect(() => {
    if (!dockOpen && !showChest && !showCollection) return;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>('button');
    first?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeActivity(); return; }
      if (event.key !== 'Tab' || !dialog) return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(el => el.getClientRects().length > 0);
      if (!controls.length) return;
      const firstControl = controls[0], lastControl = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === firstControl) { event.preventDefault(); lastControl.focus(); }
      else if (!event.shiftKey && document.activeElement === lastControl) { event.preventDefault(); firstControl.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [dockOpen, showChest, showCollection]);
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
    const isFirstFragment = spot.itemId.startsWith("pottery-fragment-") && !Object.keys(state.inventory).some(id => id.startsWith("pottery-fragment-") && (state.inventory[id] || 0) > 0);
    const specialMessage = isFirstFragment
      ? " The Broken Tidekeeper's Vase: This patterned piece belongs to an old coastal vase. Find all five different fragments to uncover its story and restore it in a future Pottery Studio update."
      : spot.itemId === "tide-trinket-key" ? " A mysterious inscription hints that this key may open a hidden time capsule one day. Keep it safe." : "";
    setAnnouncement(`${ITEMS[spot.itemId].name} collected and added to inventory.${specialMessage}`);
    window.setTimeout(() => {
      setSpots((cur) => cur.filter((s) => s.key !== spot.key));
      setSpots((cur) => (cur.length < 5 ? [...cur, ...randomSpots(1, cur)] : cur));
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
        <button ref={chestButtonRef} type="button" aria-label={state.chestOpened ? "Open daily treasure chest activities" : "Inspect locked treasure chest"}
          onClick={() => { setShowChest(true); setDockOpen(false); }}
          className="absolute left-[8%] top-[27%] w-[26%] h-[15%] focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400">
          <Image src={coveImage(state.chestOpened ? "Cove-chest-open.png" : "Cove-chest-closed.png")} alt="" fill unoptimized className="object-contain" />
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
        {spots.map(spot => {
          const def = ITEMS[spot.itemId];
          const art = coveFindArt(spot.itemId);
          return (
            <button key={spot.key} type="button" onClick={() => handleTap(spot)} aria-label={`Collect ${def.name}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full drop-shadow-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 ${poppingKeys[spot.key] ? "opacity-0" : "animate-bob"}`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: 44, height: 44 }}>
              {art ? <Image src={art} alt="" width={38} height={38} unoptimized className="object-contain" /> : <span aria-hidden="true" className="text-2xl drop-shadow-md">{def.category === "shell" ? "🐚" : def.category === "raw" ? "🪵" : def.category === "food" ? "🍒" : def.category === "special" ? "✨" : "💎"}</span>}
            </button>
          );
        })}
      </div>
      {lowTideActive && (
        <section aria-label="Unusually low tide Cove discoveries" className="mx-auto max-w-[780px] px-4 py-4">
          <div className="rounded-xl bg-sky-50 p-4 ring-1 ring-sky-200">
            <h2 className="text-lg font-bold text-teal-950">Unusually Low Tide — Exposed Cove Rocks</h2>
            <p className="mt-1 text-sm text-teal-900">The Lighthouse forecast reveals porcelain clay, sea glitter, rare pearls, pottery fragments and lost trinkets.</p>
            <p className="mt-2 font-semibold text-teal-950">{lowTideSearches} of 3 searches completed today.</p>
            <button type="button" disabled={lowTideSearches >= 3} onClick={searchLowTideCove} className="mt-3 min-h-12 w-full rounded-xl bg-teal-900 px-4 py-3 font-bold text-white disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-500">{lowTideSearches >= 3 ? "All low-tide searches completed" : "Search the exposed Cove rocks"}</button>
            <p role="status" aria-live="polite" className="mt-2 text-sm text-teal-950">{lowTideMessage}</p>
          </div>
        </section>
      )}
      <div className="mx-auto max-w-[780px] px-4 py-4"><button ref={collectionButtonRef} type="button" onClick={() => { setShowCollection(true); setShowChest(false); setDockOpen(false); }} className="min-h-12 w-full rounded-xl bg-teal-900 px-4 py-3 font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-500">Open Cove Treasures Collection</button></div>
      {(showChest || dockOpen || showCollection) && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-3 sm:p-6">
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={showCollection ? "Cove Treasures collection" : dockOpen ? "Cove Dock activities" : "Treasure chest activities"}
            className="flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[#fbf3e3] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-200 bg-white px-4 py-3">
              <h2 className="text-lg font-bold text-amber-950">{showCollection ? "Cove Treasures" : dockOpen ? "Cove Dock" : "Treasure Chest"}</h2>
              <button type="button" onClick={closeActivity} className="min-h-12 rounded-lg bg-teal-900 px-4 py-2 font-semibold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-500">Close and return to Cove</button>
            </div>
            <div className="min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5">
              {showChest && <ChestCard />}
              {showCollection && <CoveTreasuresCollection discovered={state.coveTreasuresDiscovered || {}} />}
              <OffshoreEntry kind="dock" sceneOpen={dockOpen} onSceneClose={closeActivity} />
            </div>
          </div>
        </div>
      )}
      {shellMatchOpen && <ShellMatch onClose={closeShellMatch} />}
    </div>
  );
}
