"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ITEMS, rollSandbarSpawn } from "@/lib/items";
import { useGame } from "@/lib/store";
import { SCENES } from "@/lib/media";
import { VILLAGERS } from "@/lib/villagers";
import VillagerCard from "./VillagerCard";
import SandcastleArchitect from "./SandcastleArchitect";
import { isBooOctober, localDateKey } from "@/lib/customSandArt";
import UnderwaterResidentActivity from "./UnderwaterResidentActivity";
import BooTreasureCorner from "./BooTreasureCorner";
import LunaDiscovery from "./LunaDiscovery";

interface Spot {
  key: string;
  itemId: string;
  x: number;
  y: number;
}

const RAFT_AIR_LABELS = ["Deflated", "Low Air", "Slightly Soft", "Fully Inflated"];

function RaftAirMeter({ level }: { level: number }) {
  return (
    <div className="mt-3 rounded-xl bg-white/70 p-3 ring-1 ring-sky-200">
      <div className="flex items-center justify-between gap-3 text-sm font-bold text-sky-950">
        <span>Raft air</span><span>{level}/3 · {RAFT_AIR_LABELS[level]}</span>
      </div>
      <div role="meter" aria-label="Raft air level" aria-valuemin={0} aria-valuemax={3} aria-valuenow={level} aria-valuetext={`${level} of 3, ${RAFT_AIR_LABELS[level]}`} className="mt-2 grid grid-cols-3 gap-1">
        {[1, 2, 3].map((segment) => <span key={segment} aria-hidden="true" className={`h-3 rounded-full ${level >= segment ? "bg-sky-600" : "bg-slate-200"}`} />)}
      </div>
    </div>
  );
}

// Keep collection hotspots clear of characters and interactive landmarks.
// Coordinates are percentages of the tall sandbar scene.
const SANDBAR_HOTSPOTS = [
  { x: 20, y: 12 }, { x: 76, y: 20 }, { x: 28, y: 35 },
  { x: 76, y: 43 }, { x: 21, y: 61 }, { x: 76, y: 70 },
  { x: 10, y: 42 }, { x: 78, y: 51.5 }, { x: 78, y: 88 },
];

function randomSpots(n: number, existing: Spot[] = []): Spot[] {
  const spots: Spot[] = [];
  for (let i = 0; i < n; i++) {
    let x = 50;
    let y = 50;
    let found = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const candidateX = 8 + Math.random() * 84;
      const candidateY = 12 + Math.random() * 76;
      const clearOfHotspots = SANDBAR_HOTSPOTS.every((p) =>
        Math.abs(candidateX - p.x) > 13 || Math.abs(candidateY - p.y) > 5
      );
      const clearOfCollectibles = [...existing, ...spots].every((p) =>
        Math.abs(candidateX - p.x) > 12 || Math.abs(candidateY - p.y) > 4
      );
      if (clearOfHotspots && clearOfCollectibles) {
        x = candidateX;
        y = candidateY;
        found = true;
        break;
      }
    }
    if (!found) continue;
    spots.push({
      key: `${Date.now()}-${i}-${Math.random()}`,
      itemId: rollSandbarSpawn(),
      x,
      y,
    });
  }
  return spots;
}

function RaftCard() {
  const { state, reinflateRaft, checkRaftAirLevel, feedKelpToBirds, splashBirds, ignoreBirds, hasEnough } = useGame();
  const [birdEvent, setBirdEvent] = useState(false);
  const [announcement, setAnnouncement] = useState({ message: "", revision: 0 });
  const birdActionsRef = useRef<HTMLDivElement>(null);
  const canKelp = hasEnough([{ itemId: "food-seaweed-chips", count: 1 }]);
  const airLevel = state.raftAirLevel;
  const hasAirPump = (state.inventory["seaside-air-pump"] || 0) > 0;

  const announce = (message: string) => {
    setAnnouncement((current) => ({ message, revision: current.revision + 1 }));
  };

  useEffect(() => {
    if (birdEvent) birdActionsRef.current?.focus();
  }, [birdEvent]);

  const inflate = (useAirPump: boolean) => {
    const level = reinflateRaft(useAirPump);
    announce(`Raft air is now ${level} of 3, ${RAFT_AIR_LABELS[level]}.`);
  };

  const checkAir = () => {
    const level = checkRaftAirLevel();
    announce(`Raft air level: ${level} of 3, ${RAFT_AIR_LABELS[level]}.`);
  };

  const checkOnRaft = () => {
    if (!state.raftInflated) return;
    if (Math.random() < 0.6) {
      announce("A seagull lands on the raft. Choose how to respond.");
      setBirdEvent(true);
      return;
    }
    announce("The raft is safe and gently bobbing. No seagulls are nearby right now.");
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
        <p className="text-sm text-slate-600">It drifted back to the dock. Manual pumping restores one level per press and uses no materials.</p>
        <RaftAirMeter level={airLevel} />
        <button type="button" onClick={() => inflate(false)} className="mt-3 min-h-12 w-full rounded-xl bg-teal-600 px-3 py-3 font-semibold text-white shadow active:bg-teal-700">Pump Air Manually · +1 Level</button>
        {hasAirPump && <button type="button" onClick={() => inflate(true)} className="mt-2 min-h-12 w-full rounded-xl bg-amber-600 px-3 py-3 font-semibold text-white shadow active:bg-amber-700">Use Seaside Air Pump · Fill to 3/3</button>}
        {!hasAirPump && <p className="mt-2 text-xs text-slate-600">Shelldon occasionally brings a permanent Seaside Air Pump on Sundays.</p>}
        <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 min-h-5 text-xs font-semibold text-teal-800"><span key={announcement.revision}>{announcement.message}</span></p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-teal-200">
      <p className="font-semibold text-teal-900 mb-1">🛟 The Inflatable Raft</p>
      <p className="text-sm text-teal-700 mb-3">Bobbing gently, anchored just past the shore. Keep an eye out for curious gulls.</p>
      <RaftAirMeter level={airLevel} />
      <button type="button" onClick={checkAir} aria-label={`Check raft air level. Current level ${airLevel} of 3, ${RAFT_AIR_LABELS[airLevel]}.`} className="mt-3 min-h-11 w-full rounded-xl bg-sky-100 px-3 py-2 text-sm font-bold text-sky-950 ring-1 ring-sky-300">Check Raft Air Level</button>
      {airLevel < 3 && (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => inflate(false)} className="min-h-11 rounded-xl bg-teal-700 px-3 py-2 text-sm font-bold text-white">Pump Once · +1</button>
          {hasAirPump && <button type="button" onClick={() => inflate(true)} className="min-h-11 rounded-xl bg-amber-600 px-3 py-2 text-sm font-bold text-white">Air Pump · Fill Completely</button>}
        </div>
      )}
      {!birdEvent ? (
        <button
          type="button"
          onClick={checkOnRaft}
          className="mt-3 w-full py-3 rounded-xl font-semibold text-white bg-teal-600 active:bg-teal-700 shadow"
        >
          👀 Check on the Raft for Seagulls
        </button>
      ) : (
        <div ref={birdActionsRef} tabIndex={-1} role="group" aria-labelledby="raft-seagull-prompt" className="space-y-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-300">
          <p id="raft-seagull-prompt" className="text-sm font-semibold text-amber-700 text-center">🕊️ A seagull lands on your raft, eyeing it as a bouncy surface! Choose how to respond.</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canKelp}
              onClick={() => { resolve(feedKelpToBirds); announce("The birds follow the kelp chip. The raft keeps its air and one Recycled Rubber was added."); }}
              className="flex-1 text-xs font-semibold px-2 py-2 rounded-full text-white disabled:bg-emerald-200 disabled:text-emerald-500 bg-emerald-600 active:bg-emerald-700"
            >
              🌿 Toss Kelp Chip
            </button>
            <button
              type="button"
              onClick={() => { resolve(splashBirds); announce("A gentle splash sends the birds away. The raft keeps its air."); }}
              className="flex-1 text-xs font-semibold px-2 py-2 rounded-full text-white bg-sky-600 active:bg-sky-700"
            >
              💦 Splash Water
            </button>
            <button
              type="button"
              onClick={() => { const level = ignoreBirds(); setBirdEvent(false); announce(`The seagull lowers the raft to ${level} of 3, ${RAFT_AIR_LABELS[level]}.`); }}
              className="flex-1 text-xs font-semibold px-2 py-2 rounded-full text-white bg-slate-500 active:bg-slate-600"
            >
              🙈 Ignore
            </button>
          </div>
        </div>
      )}
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 min-h-5 text-xs font-semibold text-teal-900"><span key={announcement.revision}>{announcement.message}</span></p>
    </div>
  );
}

export default function SandbarsScene() {
  const { state, collectItem, claimBooSand, deliverBooToolSet } = useGame();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [poppingKeys, setPoppingKeys] = useState<Record<string, boolean>>({});
  const [sandcastleOpen, setSandcastleOpen] = useState(false);
  const [booMessage, setBooMessage] = useState("");
  const [destination, setDestination] = useState<string | null>(null);
  const [lunaStage, setLunaStage] = useState(0);
  const [lunaUnlocked, setLunaUnlocked] = useState(false);
  const destinationRef = useRef<HTMLButtonElement | null>(null);
  const sandcastleButtonRef = useRef<HTMLButtonElement>(null);
  const earlierSandcastles = Math.max(
    0,
    (state.inventory["sandcastle-masterpiece"] || 0) - state.sandcastleGallery.length
  );
  const booColorsAvailable = isBooOctober();
  const booClaimedToday = state.booSandClaimDate === localDateKey();
  const booToolSetCount = state.inventory["boo-sand-art-tool-set"] || 0;

  const chooseBooSand = (itemId: string) => {
    if (!claimBooSand(itemId)) return;
    setBooMessage(`Boo pours three scoops of ${ITEMS[itemId].name} into a travel pouch for you.`);
  };

  useEffect(() => {
    setSpots(randomSpots(6));
  }, []);
  useEffect(() => {
    const update = () => {
      const value = Number(localStorage.getItem("shoreline-luna-discovery-v1") || "0");
      setLunaStage(Number.isInteger(value) ? Math.max(0, Math.min(3, value)) : 0);
      try {
        const data = JSON.parse(localStorage.getItem("shoreline-boo-friendship-v1") || "null");
        setLunaUnlocked(((data?.points || 0) + (state.villagerGiftCounts.boo || 0)) >= 7);
      } catch { setLunaUnlocked(false); }
    };
    update();
    window.addEventListener("shoreline-luna-progress", update);
    window.addEventListener("boo-friendship-updated", update);
    return () => {
      window.removeEventListener("shoreline-luna-progress", update);
      window.removeEventListener("boo-friendship-updated", update);
    };
  }, [state.villagerGiftCounts.boo]);

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
      setSpots((cur) => (cur.length < 4 ? [...cur, ...randomSpots(1, cur)] : cur));
    }, 220);
  };

  const closeSandcastle = () => {
    setSandcastleOpen(false);
    window.setTimeout(() => sandcastleButtonRef.current?.focus(), 0);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#0e4a52]">
      {!destination && <div className="relative w-full min-h-[1450px] sm:min-h-[1650px] lg:min-h-[1800px] overflow-hidden select-none">
        <Image src="/images/Sandbar-background-tall.PNG" alt="A sunset sandbar with shallow turquoise lagoons, winding sandy shores and a sandcastle" fill unoptimized className="object-cover object-top" />
        <div className="absolute inset-0 bg-teal-900/15" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#0e4a52]" />
        {spots.map((spot) => {
          const def = ITEMS[spot.itemId];
          const popping = poppingKeys[spot.key];
          return (
            <button
              key={spot.key}
              onClick={() => handleTap(spot)}
              aria-label={`Collect ${def.name}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white/25 backdrop-blur-[1px] shadow-md ring-1 ring-white/35 transition-all duration-200 active:scale-90 ${
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
        {lunaUnlocked && <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden="true">
          {[
            { x: 32, y: 80 }, { x: 38, y: 77 }, { x: 45, y: 78 },
            { x: 52, y: 75 }, { x: 60, y: 78 }, { x: 67, y: 81 },
            { x: 73, y: 85 }, { x: 78, y: 88 },
          ].map((point, index) => (
            <span key={index} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow-[0_0_9px_3px_rgba(220,250,255,0.8)]" style={{ left: `${point.x}%`, top: `${point.y}%`, width: index % 3 === 0 ? 5 : 3, height: index % 3 === 0 ? 5 : 3 }} />
          ))}
        </div>}
        {lunaUnlocked && <button type="button" onClick={() => setDestination("luna")} aria-label={lunaStage >= 3 ? "Visit Luna the Moon Snail" : "Follow Luna's silver trail, step " + (lunaStage + 1) + " of 3"} className="absolute bottom-[6%] right-[6%] z-20 flex min-h-20 w-28 flex-col items-center rounded-xl p-1 text-white drop-shadow-lg focus:ring-4 focus:ring-amber-300"><Image src="/images/Luna-snail.PNG" alt="" width={105} height={78} unoptimized className="h-20 w-24 rounded-full object-cover object-center ring-2 ring-white/40" /><span className="rounded-full bg-sky-950/90 px-2 py-1 text-xs font-bold ring-1 ring-cyan-200">{lunaStage >= 3 ? "Visit Luna" : "Silver Trail"}</span></button>}
        <div className="absolute inset-0 z-10 pointer-events-none" aria-label="Explore the Sandbar">
          {([
            { id: "boo", name: "Boo", art: "👻", left: 20, top: 12 },
            { id: "coral", name: "Coral", art: "🐴", left: 76, top: 20 },
            { id: "mina", name: "Mina", art: "🌺", left: 28, top: 35 },
            { id: "bubbles", name: "Bubbles", art: "🐬", left: 76, top: 43 },
            { id: "pearl", name: "Pearl", art: "🦪", left: 21, top: 61 },
            { id: "splash", name: "Splash", art: "🐠", left: 76, top: 70 },
            { id: "raft", name: "Raft", art: "🛟", left: 10, top: 42 },
            { id: "sandcastle", name: "Sandcastle", art: "", left: 78, top: 51.5 },
          ] as const).map(({ id, name, art, left, top }) => (
            <button
              type="button"
              key={id}
              onClick={() => setDestination(id)}
              aria-label={id === "sandcastle" ? "Build a sandcastle" : id === "raft" ? "Visit the raft" : `Visit ${name}`}
              className="pointer-events-auto absolute flex min-h-14 min-w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl px-2 py-1 text-white drop-shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {art && <span aria-hidden="true" className={`${id === "raft" ? "text-3xl sm:text-4xl" : "text-5xl sm:text-6xl"} leading-none drop-shadow-[0_3px_3px_rgba(0,0,0,0.7)]`}>{art}</span>}
              <span className="mt-1 rounded-full bg-slate-950/75 px-3 py-1 text-sm font-bold shadow">{name}</span>
            </button>
          ))}
        </div>
      </div>}

      <div className="px-4 pt-4 space-y-3">
        {destination === "raft" && <RaftCard />}
        {destination === "boo" && <BooTreasureCorner />}
        {destination === "luna" && <LunaDiscovery />}

        {destination === "boo" && <>
        <section aria-labelledby="boo-sand-heading" className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-md ring-1 ring-orange-300">
          <div className="relative h-44">
            <Image src={SCENES.booSandArt} alt="Boo, a white ghost crab wearing an orange-and-black hat, beside colorful sand bottles at his moonlit Sandbar stall" fill unoptimized sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-orange-200">Boo&apos;s Sandbar Home</p>
              <h2 id="boo-sand-heading" className="font-serif text-xl font-bold">👻 Boo&apos;s Sand Art Stall</h2>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-orange-50">Boo lives beside this driftwood stall. He helps Kaiana with custom sand art and saves his rarest colors for October.</p>
            {!state.booToolSetDelivered && <div className="mt-3 rounded-xl bg-white/10 p-3 ring-1 ring-orange-200/40">
              <p className="text-sm font-bold text-orange-100">Boo needs his Sand Art Tool Set</p>
              <p className="mt-1 text-xs text-orange-50">Craft it in the Workshop from 3 Plastic Debris and 2 Shiny Soda Tabs, then bring it here.</p>
              <button type="button" disabled={booToolSetCount < 1} onClick={() => { if (deliverBooToolSet()) setBooMessage("Boo happily clicks his scoop, shovel, sieve, and funnel together. His Custom Bottle Studio is now open!"); }} className="mt-3 min-h-11 w-full rounded-xl bg-orange-500 px-3 py-2 text-sm font-bold text-white disabled:bg-slate-600 disabled:text-slate-300">{booToolSetCount > 0 ? "Give Tool Set to Boo" : "Tool Set Not Crafted Yet"}</button>
            </div>}
            {state.booToolSetDelivered && <p className="mt-2 text-sm font-bold text-emerald-300">✓ Tool set delivered · Custom Bottle Studio unlocked</p>}
            <p role="status" aria-live="polite" className="mt-2 text-sm font-semibold text-orange-200">
              {booMessage || (!state.booToolSetDelivered
                ? "Boo will share rare October sand after his tools are delivered."
                : booColorsAvailable
                ? booClaimedToday ? "Today’s rare sand bundle has already been collected. Boo will prepare another tomorrow." : "Choose one October color. Boo will share three scoops today."
                : "Pumpkin Orange and Candy Corn Swirl sand return October 1. Sand already in your collection can still be used year-round.")}
            </p>
            {state.booToolSetDelivered && booColorsAvailable && !booClaimedToday && <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => chooseBooSand("sand-pumpkin-orange")} className="min-h-14 rounded-xl bg-orange-600 px-3 py-3 text-sm font-bold text-white active:bg-orange-700">🎃 Choose Pumpkin Orange</button>
              <button type="button" onClick={() => chooseBooSand("sand-candy-corn-swirl")} className="min-h-14 rounded-xl bg-amber-100 px-3 py-3 text-sm font-bold text-slate-950 active:bg-amber-200">🍬 Choose Candy Corn Swirl</button>
            </div>}
          </div>
        </section>

        <div id="boo-gifts-heading">
          <p className="mb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-teal-100/80">Boo&apos;s ID Card &amp; Gifts</p>
          <VillagerCard villager={VILLAGERS.boo} />
        </div>

        </>}
        {destination === "sandcastle" && <>
        <section aria-labelledby="sandcastle-game-heading" className="rounded-2xl bg-gradient-to-br from-amber-50 to-cyan-100 p-4 shadow-md ring-1 ring-amber-200">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">Sandbar Mini-Game</p>
          <h2 id="sandcastle-game-heading" className="mt-1 font-serif text-lg font-bold text-amber-950">🏖️ Sandcastle Architect</h2>
          <p className="mt-1 text-sm text-amber-800">Choose towers, bridges, moats, shells, sea glass, and flags. Gentle waves bring new decorations without damaging your creation.</p>
          <button
            ref={sandcastleButtonRef}
            type="button"
            onClick={() => setSandcastleOpen(true)}
            className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800"
          >
            Build a Sandcastle
          </button>
        </section>

        </>}
        {["coral","mina","bubbles","pearl","splash"].includes(destination || "") && <>
        <p className="text-xs font-semibold text-teal-100/70 uppercase tracking-wide pt-2">
          Underwater Village
        </p>
        {destination === "coral" && <VillagerCard villager={VILLAGERS.coral} />}
        {destination === "coral" && <UnderwaterResidentActivity villagerId="coral" />}
        {destination === "mina" && <VillagerCard villager={VILLAGERS.mina} />}
        {destination === "mina" && <UnderwaterResidentActivity villagerId="mina" />}
        {destination === "bubbles" && <VillagerCard villager={VILLAGERS.bubbles} />}
        {destination === "bubbles" && <UnderwaterResidentActivity villagerId="bubbles" />}
        {destination === "pearl" && <VillagerCard villager={VILLAGERS.pearl} />}
        {destination === "pearl" && <UnderwaterResidentActivity villagerId="pearl" />}
        {destination === "splash" && <VillagerCard villager={VILLAGERS.splash} />}
        {destination === "splash" && <UnderwaterResidentActivity villagerId="splash" />}

        </>}
        {destination === "sandcastle" && <>
        <section aria-labelledby="sandcastle-gallery-heading" className="rounded-2xl bg-gradient-to-br from-amber-50 to-sky-100 p-4 shadow-md ring-1 ring-amber-200">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">Saved Creations</p>
          <h2 id="sandcastle-gallery-heading" className="mt-1 font-serif text-lg font-bold text-amber-950">🏰 Sandcastle Gallery</h2>
          {state.sandcastleGallery.length === 0 && earlierSandcastles === 0 ? (
            <p className="mt-2 text-sm text-amber-800">Your completed sandcastles will be displayed here.</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: earlierSandcastles }).map((_, index) => (
                <div
                  key={`earlier-${index}`}
                  role="img"
                  aria-label={`Earlier sandcastle keepsake ${index + 1}. This castle was made before detailed gallery designs were saved.`}
                  className="rounded-2xl bg-sky-100 p-3 text-center ring-1 ring-sky-200"
                >
                  <div className="text-2xl" aria-hidden="true">🚩</div>
                  <div className="text-5xl" aria-hidden="true">🏰</div>
                  <div className="text-2xl" aria-hidden="true">🐚 💎 🌊</div>
                  <p className="mt-2 text-xs font-bold text-teal-950">Earlier Sandcastle</p>
                </div>
              ))}
              {state.sandcastleGallery.map((castle, index) => {
                const featureNames = ["towers", "bridge", "moat", "shells", "glass", "flags"]
                  .map((key) => castle.features[key]?.label)
                  .filter(Boolean)
                  .join(", ");
                const giftNames = castle.waveGifts.map((gift) => gift.label).join(" and ");
                return (
                  <div
                    key={castle.id}
                    role="img"
                    aria-label={`Saved sandcastle ${index + 1}: ${featureNames}. Wave gifts: ${giftNames}.`}
                    className="rounded-2xl bg-sky-100 p-3 text-center ring-1 ring-sky-200"
                  >
                    <div className="text-2xl" aria-hidden="true">{castle.features.flags?.icon || "🚩"}</div>
                    <div className="text-5xl" aria-hidden="true">{castle.features.towers?.icon || "🏰"}</div>
                    <div className="flex justify-center gap-2 text-xl" aria-hidden="true">
                      <span>{castle.features.shells?.icon}</span>
                      <span>{castle.features.glass?.icon}</span>
                      <span>{castle.features.bridge?.icon}</span>
                    </div>
                    <div className="mt-1 text-xl" aria-hidden="true">
                      {castle.features.moat?.icon} {castle.waveGifts.map((gift) => gift.icon).join(" ")}
                    </div>
                    <p className="mt-2 text-xs font-bold text-teal-950">Sandcastle {earlierSandcastles + index + 1}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        </>}
        {destination && <button type="button" onClick={() => setDestination(null)} className="min-h-12 w-full rounded-xl bg-white px-4 py-3 font-bold text-teal-950 focus:ring-4 focus:ring-amber-300">← Return to Secret Sandbar</button>}
        {!destination && <p className="text-xs text-teal-200/70 text-center mt-4">Open-water sandbars, shifting with every tide.</p>}
      </div>
      {sandcastleOpen && <SandcastleArchitect onClose={closeSandcastle} />}
    </div>
  );
}
