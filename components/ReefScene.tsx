"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { OffshoreEntry } from "./Offshore";
import { ITEMS, rollReefSpawn } from "@/lib/items";
import { useGame } from "@/lib/store";
import { SCENES } from "@/lib/media";
import ArtifactRestoration from "./ArtifactRestoration";
import LibbyReefRescue from "./LibbyReefRescue";
import ShipwreckSalvage from "./ShipwreckSalvage";
import { getAquariumSpecies, rollBabyFish } from "@/lib/aquarium";

interface Spot {
  key: string;
  itemId: string;
  x: number;
  y: number;
}

function randomSpots(n: number, iridescentFlakesUnlocked = false): Spot[] {
  const spots: Spot[] = [];
  for (let i = 0; i < n; i++) {
    spots.push({
      key: `${Date.now()}-${i}-${Math.random()}`,
      itemId: rollReefSpawn(iridescentFlakesUnlocked),
      x: 8 + Math.random() * 84,
      y: 38 + Math.random() * 50,
    });
  }
  return spots;
}

function initialReefSpots(iridescentFlakesUnlocked = false): Spot[] {
  return [
    { key: `coral-bulb-${Date.now()}`, itemId: "coral-bulb", x: 22, y: 72 },
    { key: `fertilizer-${Date.now()}`, itemId: "fertilizer", x: 78, y: 68 },
    { key: `kelp-${Date.now()}`, itemId: "kelp", x: 48, y: 78 },
    ...randomSpots(3, iridescentFlakesUnlocked),
  ];
}

const RESTORE_COST = [
  { itemId: "raw-driftwood-arch", count: 5 },
  { itemId: "raw-driftwood-planks", count: 3 },
  { itemId: "raw-barnacle-wood", count: 3 },
];

const LIBBY_TRADES: { give: { itemId: string; count: number }; get: { itemId: string; count: number } }[] = [
  { give: { itemId: "shell-flake-blue", count: 1 }, get: { itemId: "nautilus-flake", count: 1 } },
  { give: { itemId: "pearl-deepsea", count: 2 }, get: { itemId: "star-sand", count: 1 } },
  { give: { itemId: "raw-barnacle-wood", count: 2 }, get: { itemId: "pearl-deepsea", count: 1 } },
];

function TradeRow({ trade }: { trade: (typeof LIBBY_TRADES)[number] }) {
  const { state, tradeWithLibby, hasEnough } = useGame();
  const giveDef = ITEMS[trade.give.itemId];
  const getDef = ITEMS[trade.get.itemId];
  const can = hasEnough([trade.give]);
  const have = state.inventory[trade.give.itemId] || 0;

  return (
    <div className="flex items-center justify-between rounded-xl bg-white/80 p-3 ring-1 ring-cyan-200 mb-2">
      <div className="flex items-center gap-2 text-sm text-cyan-900">
        <span>{giveDef.isEmoji ? giveDef.icon : "🔹"}</span>
        <span className="text-xs">{trade.give.count}x {giveDef.name} ({have})</span>
        <span className="mx-1">→</span>
        <span>{getDef.isEmoji ? getDef.icon : "🔹"}</span>
        <span className="text-xs">{trade.get.count}x {getDef.name}</span>
      </div>
      <button
        type="button"
        disabled={!can}
        onClick={() => tradeWithLibby(trade.give, trade.get)}
        className="text-xs font-semibold px-3 py-1.5 rounded-full text-white disabled:bg-cyan-200 disabled:text-cyan-500 bg-cyan-600 active:bg-cyan-700"
      >
        Trade
      </button>
    </div>
  );
}

function LibbyCard() {
  const { state, pryTrap, trapPryTarget } = useGame();
  const pct = Math.min(100, Math.round((state.trapProgress / trapPryTarget) * 100));

  if (!state.libbyRescued) {
    return (
      <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-cyan-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden">
            <Image src={SCENES.lobsterTrap} alt="Lobster trap" fill unoptimized className="object-cover" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-cyan-900">A Trapped Blue Lobster</h2>
            <p className="text-sm text-cyan-700">Libby is tangled in an old lobster trap. Pry it open, piece by piece.</p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-cyan-100 overflow-hidden ring-1 ring-cyan-200 mb-3">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <button
          type="button"
          onClick={pryTrap}
          className="w-full py-3 rounded-xl font-semibold text-white transition bg-cyan-600 active:bg-cyan-700 shadow active:scale-[0.98]"
        >
          🦞 Pry the Trap ({state.trapProgress}/{trapPryTarget})
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-cyan-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden">
          <Image src={SCENES.lobsterTrap} alt="Libby the Blue Lobster" fill unoptimized className="object-cover" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-cyan-900">Libby the Blue Lobster</h2>
          <p className="text-sm text-cyan-700">Free and grateful — she loves to trade rare reef finds.</p>
        </div>
      </div>
      {LIBBY_TRADES.map((t, i) => (
        <TradeRow key={i} trade={t} />
      ))}
      <p className="mt-3 rounded-xl bg-cyan-50 p-3 text-sm text-cyan-800 ring-1 ring-cyan-200">
        Since Libby&apos;s rescue, rare Iridescent Blue Shell Flakes can appear among the Reef finds above. Trade them to Libby for the Nautilus Flakes used in the Tidal Pearl Choker.
      </p>
    </div>
  );
}

function GhostNetCard() {
  const { state, cutNet, netCutTarget } = useGame();
  const pct = Math.min(100, Math.round((state.netProgress / netCutTarget) * 100));

  if (state.ghostNetCut) {
    return (
      <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-teal-200 text-center">
        <p className="text-3xl mb-1">🕸️✂️</p>
        <p className="font-semibold text-teal-900 mb-1">The ghost net is cleared!</p>
        <p className="text-sm text-teal-700">The reef fish are free to roam again.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-teal-200">
      <h2 className="text-lg font-bold text-teal-900 mb-1">🕸️ A Tangled Ghost Net</h2>
      <p className="text-sm text-teal-700 mb-3">
        A forgotten nylon fishing net has snagged on the coral. Snip it away, piece by piece.
      </p>
      <div className="h-3 rounded-full bg-teal-100 overflow-hidden ring-1 ring-teal-200 mb-3">
        <div
          className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <button
        type="button"
        onClick={cutNet}
        className="w-full py-3 rounded-xl font-semibold text-white transition bg-teal-600 active:bg-teal-700 shadow active:scale-[0.98]"
      >
        ✂️ Cut the Net ({state.netProgress}/{netCutTarget})
      </button>
    </div>
  );
}

function ShipwreckCard() {
  const { state, restoreShip, hasEnough } = useGame();
  const canRestore = hasEnough(RESTORE_COST) && state.ghostNetCut;

  if (state.shipRestored) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-teal-100 p-6 shadow-md ring-1 ring-amber-300 text-center">
        <p className="text-4xl mb-2">🎉⛵🐠</p>
        <h2 className="text-lg font-bold text-amber-900 mb-1">The Grand Finale</h2>
        <p className="text-sm text-amber-800">
          The Sovereign lives again — not as a house, but as a permanent, protected home for Rainbow Seahorses,
          Golden Nautiluses, and every creature you've helped along the way. Word of your sanctuary has reached
          ports far and wide. Visit the Bottles tab to celebrate with "The Grand Reunion."
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-amber-200">
      <h2 className="text-lg font-bold text-amber-900 mb-1">⚓ The Sunken Shipwreck</h2>
      <p className="text-sm text-amber-700 mb-3">
        A massive, centuries-old wreck rests on the reef floor — the very ship your rowboat and mystery
        driftwood pieces came from. Clear the sand and rebuild her bones.
      </p>
      {!state.ghostNetCut && (
        <p className="text-xs text-red-600 mb-3 font-semibold">Clear the ghost net first before you can work on the hull.</p>
      )}
      <div className="flex gap-3 mb-4 flex-wrap">
        {RESTORE_COST.map((c) => {
          const def = ITEMS[c.itemId];
          const have = state.inventory[c.itemId] || 0;
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
        disabled={!canRestore}
        onClick={() => restoreShip(RESTORE_COST)}
        className="w-full py-3 rounded-xl font-semibold text-white transition disabled:bg-amber-200 disabled:text-amber-500 bg-teal-600 active:bg-teal-700 shadow"
      >
        {canRestore ? "Restore the Shipwreck" : "Need More Materials"}
      </button>
    </div>
  );
}

export default function ReefScene() {
  const [rescuedLobster, setRescuedLobster] = useState(false);
  useEffect(() => {
    try { setRescuedLobster(JSON.parse(localStorage.getItem("shoreline-rescued-trap-animals-v1") || "[]").includes("Lobster")); } catch {}
  }, []);

  const { state, collectItem, setMusicOverride, discoverBabyFish } = useGame();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [poppingKeys, setPoppingKeys] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<"dive" | "restore" | "libby">("dive");
  const activitiesRef = useRef<HTMLDivElement>(null);
  const [reefActivityOpen, setReefActivityOpen] = useState(false);
  const reefActivityTrigger = useRef<HTMLButtonElement | null>(null);
  const reefActivityDialog = useRef<HTMLDivElement>(null);
  const closeReefActivity = () => { setReefActivityOpen(false); window.setTimeout(() => reefActivityTrigger.current?.focus(), 0); };
  useEffect(() => { if (reefActivityOpen) reefActivityDialog.current?.focus(); }, [reefActivityOpen]);
  const [labOpen, setLabOpen] = useState(false);
  const labEntranceRef = useRef<HTMLButtonElement>(null);
  const openReefArea = (area: "dive" | "restore" | "libby" | "lab") => {
    if (area === "lab") {
      setLabOpen(true);
      return;
    }
    setTab(area);
    setReefActivityOpen(true);
  };
  const [offshoreTrack, setOffshoreTrack] = useState<string | null>(null);
  const [artifactGameOpen, setArtifactGameOpen] = useState(false);
  const artifactButtonRef = useRef<HTMLButtonElement>(null);
  const [reefRescueOpen, setReefRescueOpen] = useState(false);
  const reefRescueButtonRef = useRef<HTMLButtonElement>(null);
  const [salvageOpen, setSalvageOpen] = useState(false);
  const [reefSearchMessage, setReefSearchMessage] = useState("The restored reef is ready to explore.");
  const salvageButtonRef = useRef<HTMLButtonElement>(null);

  const closeArtifactGame = () => {
    setArtifactGameOpen(false);
    window.setTimeout(() => artifactButtonRef.current?.focus(), 0);
  };

  const closeReefRescue = () => {
    setReefRescueOpen(false);
    window.setTimeout(() => reefRescueButtonRef.current?.focus(), 0);
  };

  const searchRestoredReef = (habitat: "coral" | "seagrass" | "rocks" | "open") => {
    const roll = Math.random();
    if (roll < 0.16) {
      collectItem("fishing-net");
      setReefSearchMessage("You find a usable section of fishing net caught harmlessly between the rocks. It has been added to your inventory.");
      return;
    }
    if (roll < 0.34) {
      collectItem("seaweed-fronds");
      setReefSearchMessage("You find healthy seaweed swaying beside the restored coral.");
      return;
    }
    const current = [...state.aquariumResidents.map(r => r.speciesId), ...(state.pendingBabyFishId ? [state.pendingBabyFishId] : [])];
    const undiscoveredInHabitat = state.discoveredAquariumFish.filter(id => getAquariumSpecies(id)?.habitat === habitat);
    const habitatSpecies = rollBabyFish([], habitat);
    const missing = habitatSpecies ? undefined : undefined;
    const excluded = [...current, ...undiscoveredInHabitat];
    const newBaby = rollBabyFish(excluded, habitat);
    const fallbackBaby = rollBabyFish(current, habitat);
    const baby = newBaby || fallbackBaby;
    if (baby && Math.random() < 0.62 && discoverBabyFish(baby.id)) {
      setReefSearchMessage(`You discovered a ${baby.babyName} in the ${habitat}! It is young enough for Waverly’s nursery. Its Field Guide entry is now unlocked.`);
    } else {
      const adult = rollBabyFish([], habitat);
      setReefSearchMessage(adult ? `You observe an adult ${adult.name} in the ${habitat}. Adult fish stay in their natural habitat; only suitable babies are brought to Waverly.` : "You watch healthy reef fish move through the restored habitat.");
    }
  };

  const closeSalvage = () => {
    setSalvageOpen(false);
    window.setTimeout(() => salvageButtonRef.current?.focus(), 0);
  };

  useEffect(() => {
    setSpots(initialReefSpots(state.libbyRescued));
  }, [state.libbyRescued]);

  // AudioEngine owns the single music element; this screen only tells it
  // which track to prefer while the Libby (lobster trap) sub-tab is active,
  // and clears that preference on tab-away/unmount so the zone's default
  // underwater track resumes. Never mount a second <audio> element here.
  useEffect(() => {
    if (offshoreTrack) {
      setMusicOverride(offshoreTrack);
    } else if (tab === "libby") {
      setMusicOverride("deepReefDescent");
    } else {
      setMusicOverride(null);
    }
    return () => setMusicOverride(null);
  }, [tab, offshoreTrack, setMusicOverride]);

  if (!state.hasDivingGear) {
    return (
      <div className="h-full overflow-y-auto pb-24 px-4 pt-4 bg-[#07262b] flex items-center justify-center">
        <div className="rounded-2xl bg-white/90 p-6 shadow-md ring-1 ring-teal-200 text-center max-w-sm">
          <p className="text-3xl mb-2">🤿</p>
          <p className="font-semibold text-teal-900 mb-1">You need Diving Gear</p>
          <p className="text-sm text-teal-700">
            Open the locked treasure chest on the Hidden Beach to find the Diving Gear needed to explore the Deep Reef.
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
      setSpots((cur) => (cur.length < 4 ? [...cur, ...randomSpots(1, state.libbyRescued)] : cur));
    }, 220);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#07262b]">
      {labOpen ? <OffshoreEntry kind="lab" sceneOpen onSceneClose={() => { setLabOpen(false); window.setTimeout(() => labEntranceRef.current?.focus(), 50); }} onMusicChange={setOffshoreTrack} /> : <>
      <div className="relative mx-auto w-full max-w-[680px] select-none" aria-label="Deep Reef illustrated scene">
        <Image
          src="/images/Reef/Reef-background.PNG"
          alt="Portrait underwater reef with a large shipwreck on the left, Libby's lobster trap, colorful coral, a rescue area, and Waverly's Marine Lab entrance at the bottom."
          width={1024}
          height={1536}
          unoptimized
          priority
          className="block h-auto w-full"
        />
        {rescuedLobster && <button type="button" aria-label="Rescued lobster resting safely in Libby's Reef" className="absolute left-[59%] top-[54%] z-10 h-[10%] w-[17%] focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"><Image src="/images/Cove/Lobster.png" alt="" fill unoptimized sizes="120px" className="object-contain drop-shadow-md" /></button>}
        {([
          { label: "Enter the shipwreck: restoration, salvage and artifacts", area: "restore", x: 25, y: 28, w: 40, h: 26 },
          { label: "Libby's lobster trap: rescue or trade with Libby", area: "libby", x: 23, y: 51, w: 36, h: 15 },
          { label: "Reef Rescue: remove debris with Libby", area: "libby", x: 80, y: 40, w: 28, h: 15 },
          { label: "Search the reef for Waverly's fish", area: "dive", x: 76, y: 24, w: 35, h: 14 },
          { label: "Waverly's Marine Lab entrance", area: "lab", x: 74, y: 68, w: 42, h: 25 },
        ] as const).map(({ label, area, x, y, w, h }) => (
          <button
            key={label}
            ref={area === "lab" ? labEntranceRef : undefined}
            type="button"
            aria-label={label}
            title={label}
            onClick={(event) => { reefActivityTrigger.current = event.currentTarget; openReefArea(area); }}
            className="absolute rounded-xl border-2 border-transparent bg-transparent focus-visible:border-white focus-visible:bg-cyan-900/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
            style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, transform: "translate(-50%, -50%)" }}
          />
        ))}
        {spots.map((spot) => {
          const def = ITEMS[spot.itemId];
          const popping = poppingKeys[spot.key];
          return (
            <button
              key={spot.key}
              type="button"
              onClick={() => handleTap(spot)}
              aria-label={`Collect ${def.name}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white/75 shadow-lg ring-1 ring-white/70 transition-all duration-200 active:scale-90 ${popping ? "opacity-0 scale-150" : "opacity-100 animate-bob"}`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: 42, height: 42 }}
            >
              {def.isEmoji ? <span aria-hidden="true" className="text-2xl">{def.icon}</span> : <Image src={def.icon} alt="" width={30} height={30} unoptimized className="object-contain" />}
            </button>
          );
        })}
      </div>

      {reefActivityOpen && <div ref={reefActivityDialog} role="dialog" aria-modal="true" aria-label={tab === "dive" ? "Reef Exploration and Fish Search" : tab === "restore" ? "Shipwreck Activities" : "Libby and Reef Rescue"} tabIndex={-1} onKeyDown={(event) => { if (event.key === "Escape") closeReefActivity(); }} className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 p-3 sm:p-8"><div className="mx-auto max-w-[780px] rounded-2xl bg-[#07262b] p-3 shadow-2xl"><button type="button" onClick={closeReefActivity} className="mb-3 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400">Close activity and return to Reef</button><div ref={activitiesRef} className="px-1 pt-2">
        <h2 className="text-lg font-semibold text-white mb-3" tabIndex={-1}>{tab === "dive" ? "Reef Exploration" : tab === "restore" ? "Shipwreck Activities" : "Libby and Reef Rescue"}</h2>
        {tab === "dive" ? <div className="space-y-4"><GhostNetCard />{state.ghostNetCut && <section aria-labelledby="reef-search-heading" className="rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-100 p-4 shadow-md ring-1 ring-teal-200"><p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">Restored Reef Activity</p><h2 id="reef-search-heading" className="mt-1 font-serif text-lg font-bold text-teal-950">🐠 Search the Reef</h2><p className="mt-1 text-sm text-teal-800">Explore the coral, seagrass, rock shelters, and open water. Baby fish suitable for Waverly’s aquarium will be discovered here as the nursery system grows.</p><div className="mt-3 grid grid-cols-2 gap-2" aria-label="Choose a reef habitat to search">
  <button type="button" onClick={() => searchRestoredReef("coral")} className="rounded-xl bg-teal-700 py-3 px-2 font-bold text-white shadow active:bg-teal-800">Search Coral &amp; Anemones</button>
  <button type="button" onClick={() => searchRestoredReef("seagrass")} className="rounded-xl bg-teal-700 py-3 px-2 font-bold text-white shadow active:bg-teal-800">Search Seagrass</button>
  <button type="button" onClick={() => searchRestoredReef("rocks")} className="rounded-xl bg-teal-700 py-3 px-2 font-bold text-white shadow active:bg-teal-800">Search Rock Shelters</button>
  <button type="button" onClick={() => searchRestoredReef("open")} className="rounded-xl bg-teal-700 py-3 px-2 font-bold text-white shadow active:bg-teal-800">Search Open Reef</button>
</div><p role="status" aria-live="polite" className="mt-3 rounded-xl bg-white/80 p-3 text-sm text-teal-900 ring-1 ring-teal-200">{reefSearchMessage}</p>{state.pendingBabyFishId && <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">🐟 Nursery discovery waiting: {getAquariumSpecies(state.pendingBabyFishId)?.babyName}. Visit Waverly’s Marine Lab to place the baby in the aquarium.</p>}</section>}</div> : tab === "restore" ? (
          <div className="space-y-4">
            <ShipwreckCard />
            <section aria-labelledby="artifact-game-heading" className="rounded-2xl bg-gradient-to-br from-amber-50 to-cyan-50 p-4 shadow-md ring-1 ring-amber-200">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">Shipwreck Museum Mini-Game</p>
              <h2 id="artifact-game-heading" className="mt-1 font-serif text-lg font-bold text-amber-950">🏺 Artifact Restoration</h2>
              <p className="mt-1 text-sm text-amber-800">Reassemble pottery, a weathered harbor sign, and the captain’s map for the museum collection.</p>
              <button
                ref={artifactButtonRef}
                type="button"
                onClick={() => setArtifactGameOpen(true)}
                className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800"
              >
                Open Artifact Restoration
              </button>
            </section>
            <section aria-labelledby="salvage-game-heading" className="rounded-2xl bg-gradient-to-br from-sky-50 to-amber-50 p-4 shadow-md ring-1 ring-sky-200">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">Shipwreck Mini-Game</p>
              <h2 id="salvage-game-heading" className="mt-1 font-serif text-lg font-bold text-sky-950">⚓ Shipwreck Salvage</h2>
              <p className="mt-1 text-sm text-sky-800">Search for requested objects among the reef clutter. Every correct find joins the museum collection.</p>
              <button
                ref={salvageButtonRef}
                type="button"
                onClick={() => setSalvageOpen(true)}
                className="mt-3 w-full rounded-xl bg-sky-800 py-3 font-bold text-white shadow active:bg-sky-900"
              >
                Begin Shipwreck Salvage
              </button>
            </section>
          </div>
        ) : (
          <div className="space-y-4">
            <LibbyCard />
            {state.libbyRescued && (
              <section aria-labelledby="reef-rescue-game-heading" className="rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-100 p-4 shadow-md ring-1 ring-cyan-200">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-800">Reef Mini-Game</p>
                <h2 id="reef-rescue-game-heading" className="mt-1 font-serif text-lg font-bold text-teal-950">🦞 Libby’s Reef Rescue</h2>
                <p className="mt-1 text-sm text-teal-800">Remove fishing line, plastic rings, and other debris without disturbing coral or sea life.</p>
                <button
                  ref={reefRescueButtonRef}
                  type="button"
                  onClick={() => setReefRescueOpen(true)}
                  className="mt-3 w-full rounded-xl bg-cyan-700 py-3 font-bold text-white shadow active:bg-cyan-800"
                >
                  Begin Libby’s Reef Rescue
                </button>
              </section>
            )}
          </div>
        )}
        <p className="text-xs text-teal-200/70 text-center mt-4">Collect the labeled reef finds above. Coral Bulbs grow beside the living coral, Kelp sways in the current, and Sea Fertilizer gathers in the nutrient-rich sand.</p>
      </div>

      </div></div>}

      {artifactGameOpen && <ArtifactRestoration onClose={closeArtifactGame} />}
      {reefRescueOpen && <LibbyReefRescue onClose={closeReefRescue} />}
      {salvageOpen && <ShipwreckSalvage onClose={closeSalvage} />}
      </>}
    </div>
  );
}
