"use client";
import { useEffect, useRef, useState } from "react";

const versionedImage = (src: string) => src.startsWith("/images/") ? `${src}?v=${process.env.NEXT_PUBLIC_SHORELINE_ASSET_VERSION || "development"}` : src;
import Image from "next/image";
import { ITEMS, rollSpawn } from "@/lib/items";
import { useGame } from "@/lib/store";
import { SCENES } from "@/lib/media";
import { VILLAGERS } from "@/lib/villagers";
import VillagerCard from "./VillagerCard";
import { getScheduleStatus, ScheduleStatus } from "@/lib/schedule";
import SnappyCurrentRide from "./SnappyCurrentRide";
import TidePoolSearch from "./TidePoolSearch";
import { getOlliClue } from "@/lib/olli";
import { PenelopeCleanupHeart, SandyStormHunt } from "./ShorelineResidentActivities";
import KaiBuriedTreasure from "./KaiBuriedTreasure";
import { localDateKey } from "@/lib/customSandArt";
import MistyMoonlitExchange from "./MistyMoonlitExchange";

interface Spot {
  key: string;
  itemId: string;
  x: number;
  y: number;
}

function isBeachNight(date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= 19 || hour < 6;
}

// Keep familiar beach finds common; special night finds remain repeatable.
function rollNightBeachItem(): string {
  const chance = Math.random();
  if (chance < 0.08) return "star-wish-bottle";
  if (chance >= 0.38) return rollSpawn();
  const fullMoon = (() => {
    const phase = ((Date.now() / 86400000 - 10957.5) % 29.530588853 + 29.530588853) % 29.530588853;
    return Math.abs(phase - 14.7652944265) < 1.5;
  })();
  const pool: Array<[string, number]> = [
    ["moonlit-sea-glass", 26], ["milky-moonstone-pebbles", 23],
    ["ceramic-bell", 20], ["moonwashed-shell", 19],
    ["tideglow-pebble", fullMoon ? 12 : 9],
    ["glowing-sand-dollar", fullMoon ? 5 : 3],
  ];
  let roll = Math.random() * pool.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [id, weight] of pool) {
    if (roll < weight) return id;
    roll -= weight;
  }
  return "moonlit-sea-glass";
}

const BEACH_RESIDENT_POSITIONS = [
  { x: 24, y: 33 }, { x: 73, y: 79 }, { x: 79, y: 60 }, { x: 24, y: 68 },
  { x: 46, y: 48 }, { x: 88, y: 42 }, { x: 86, y: 25 },
  { x: 41, y: 76 }, { x: 61, y: 43 },
  { x: 92, y: 12 }, { x: 12, y: 52 }, { x: 42, y: 11 }, { x: 72, y: 13 },
];

function randomSpots(n: number, night = false, existing: Spot[] = []): Spot[] {
  const spots: Spot[] = [];
  for (let i = 0; i < n; i++) {
    // Star Wish Bottles are a rare beach-after-dark discovery. Daytime
    // continues to use the existing beach spawn table unchanged.
    const itemId = night ? rollNightBeachItem() : rollSpawn();
    let x = 50, y = 50, found = false;
    for (let attempt = 0; attempt < 120; attempt++) {
      const candidateX = 8 + Math.random() * 84;
      const candidateY = 38 + Math.random() * 52;
      if (BEACH_RESIDENT_POSITIONS.every((p) => Math.abs(candidateX - p.x) > 15 || Math.abs(candidateY - p.y) > 10) &&
          [...existing, ...spots].every((p) => Math.abs(candidateX - p.x) > 12 || Math.abs(candidateY - p.y) > 7)) {
        x = candidateX; y = candidateY; found = true; break;
      }
    }
    if (!found) continue;
    spots.push({
      key: `${Date.now()}-${i}-${Math.random()}`,
      itemId,
      x,
      y,
    });
  }
  return spots;
}

function EllyGarden() {
  const { state, careEllyGarden } = useGame();
  const [announcement, setAnnouncement] = useState("");
  const plants = [
    { id: "anemone", name: "Moonlight Anemone", task: "Gently clean away drifting sand" },
    { id: "kelp", name: "Starlight Kelp", task: "Untangle its glowing strands" },
    { id: "bloom", name: "Pearl Bloom", task: "Send a few glowing bubbles" },
  ];
  const date = localDateKey(new Date());
  const cared = plants.filter(plant => state.notebookDiscovered[`elly-garden:${date}:${plant.id}`]).length;
  return <section aria-labelledby="elly-garden-title" className="mt-4 rounded-2xl bg-indigo-950 p-3 text-white">
    <h3 id="elly-garden-title" className="text-xl font-bold">Elly's Jellyfish Glow Garden</h3>
    <p className="my-2 text-sm">Help Elly care for three glowing plants. Each can be tended once a day.</p>
    <Image src="/images/Elly-glow-garden.PNG" alt="Elly's enchanted underwater garden with a glowing moonlight anemone, starlight kelp, pearl bloom, and floating jellyfish" width={1200} height={800} unoptimized className="w-full rounded-xl" />
    <p className="mt-2" aria-live="polite">{cared} of 3 plants cared for today. {announcement}</p>
    <div className="mt-3 space-y-2">{plants.map(plant => {
      const done = !!state.notebookDiscovered[`elly-garden:${date}:${plant.id}`];
      return <button key={plant.id} type="button" disabled={done} onClick={() => {
        if (careEllyGarden(plant.id as "anemone" | "kelp" | "bloom")) setAnnouncement(`You tended ${plant.name}.`);
      }} className="min-h-12 w-full rounded-xl bg-sky-700 p-3 text-left font-semibold disabled:bg-slate-700 disabled:opacity-70">
        {plant.name}: {done ? "Cared for today" : plant.task}
      </button>;
    })}</div>
  </section>;
}

function EllyCard() {
  const { tapElly } = useGame();
  const [msg, setMsg] = useState<string | null>(null);

  const handleTap = () => {
    const result = tapElly();
    if (!result.ok) {
      setMsg(`Elly needs to rest — ${result.secondsLeft}s`);
      window.setTimeout(() => setMsg((m) => (m ? null : m)), 1500);
    }
  };

  return (
    <button
      type="button"
      onClick={handleTap}
      className="w-full text-left rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-amber-200 flex items-center gap-3 active:scale-[0.98] transition"
    >
      <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden">
        <Image src={SCENES.jellyfish} alt="Elly the Jellyfish" fill unoptimized className="object-cover" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-amber-900">Elly the Jellyfish</p>
        <p className="text-xs text-amber-700">Tap gently to visit — she shares glowing Sea-Goo every so often. ✨</p>
        {msg && <p className="text-[11px] text-teal-700 mt-1">{msg}</p>}
      </div>
    </button>
  );
}

function OlliCard() {
  const { state, collectItem, play, requestOlliClue } = useGame();
  const [squirt, setSquirt] = useState(false);
  const hiding = state.olliHidingLocation;

  const handleTap = () => {
    if (hiding) {
      requestOlliClue();
      return;
    }
    setSquirt(true);
    collectItem("seaweed-fronds", { silent: true });
    play("seaweedCollect");
    window.setTimeout(() => setSquirt(false), 500);
  };

  return <div className="space-y-2">
    <VillagerCard villager={VILLAGERS.olli} />
    <section className="rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-teal-200">
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-4xl" aria-hidden="true">
          {hiding ? "💨" : squirt ? "💦" : "🐙"}
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-teal-900">{hiding ? "Olli Is Hiding!" : "Visit Olli"}</h2>
          <p role="status" aria-live="polite" className="mt-1 text-xs text-teal-700">
            {hiding ? getOlliClue(hiding, state.olliClueStage) : "Say hello and Olli will toss you a stray frond of seaweed."}
          </p>
        </div>
      </div>
      <button type="button" onClick={handleTap} className="mt-3 min-h-11 w-full rounded-xl bg-teal-700 px-3 py-2 text-sm font-bold text-white active:bg-teal-800">
        {hiding ? (state.olliClueStage >= 2 ? "Repeat Final Clue" : "Ask Olli for Another Clue") : "Say Hello to Olli"}
      </button>
    </section>
  </div>;
}

function SnappyCard() {
  const { state, feedSnappy, giftSnappyChoker } = useGame();
  const milk = state.inventory["food-sea-rose-milk"] || 0;
  const choker = state.inventory["tidal-pearl-choker"] || 0;

  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-emerald-200 flex items-center gap-3">
      <div role="img" aria-label={`${state.snappyAwake ? "Snappy is awake" : "Snappy is sleeping"}${state.snappyChokerGifted ? ", wearing the Tidal Pearl Choker with a permanently sparkling shell" : ""}.`} className={`relative w-16 h-16 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center text-4xl ${state.snappyChokerGifted ? "snappy-shell-sparkle" : ""}`}>
        <span aria-hidden="true">{state.snappyAwake ? "🐢" : "😴"}</span>
        {state.snappyChokerGifted && <>
          <span aria-hidden="true" className="snappy-sparkle snappy-sparkle-one">✦</span>
          <span aria-hidden="true" className="snappy-sparkle snappy-sparkle-two">✧</span>
          <span aria-hidden="true" className="snappy-sparkle snappy-sparkle-three">✦</span>
        </>}
      </div>
      <div className="flex-1">
        <p className="font-bold text-emerald-900">Snappy the Sea Turtle</p>
        <p className="text-xs text-emerald-700 mb-2">
          {state.snappyAwake
            ? `Wide awake and grateful — fed ${state.snappyFedCount} time(s).${state.snappyChokerGifted ? " His Tidal Pearl Choker makes his shell shimmer." : ""}`
            : `Fast asleep on a sun-warmed rock.${state.snappyChokerGifted ? " His jeweled shell sparkles softly as he dreams." : " A bowl of Sea-Rose Milk from the Kitchen might wake him gently."}`}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={milk < 1}
            onClick={feedSnappy}
            className="text-xs font-semibold px-3 py-1.5 rounded-full text-white disabled:bg-emerald-200 disabled:text-emerald-500 bg-emerald-600 active:bg-emerald-700"
          >
            🥛 Feed Sea-Rose Milk ({milk})
          </button>
          {!state.snappyChokerGifted && (
            <button
              type="button"
              disabled={choker < 1}
              onClick={giftSnappyChoker}
              aria-label={`Gift the Tidal Pearl Choker to Snappy. ${choker} available.`}
              className="text-xs font-semibold px-3 py-1.5 rounded-full text-white disabled:bg-cyan-200 disabled:text-cyan-600 bg-cyan-700 active:bg-cyan-800"
            >
              📿 Gift Tidal Pearl Choker ({choker})
            </button>
          )}
        </div>
        {state.snappyChokerGifted && <p className="mt-2 text-xs font-bold text-cyan-800">✦ Tidal Pearl Choker gifted · Shell sparkle active</p>}
      </div>
    </div>
  );
}

function UmbrellaCard({ open, toggle }: { open: boolean; toggle: () => void }) {
  const { state } = useGame();

  if (!state.umbrellaPlaced) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={open ? "Beach umbrella is open. Fold umbrella." : "Beach umbrella is folded. Open umbrella."}
      className="w-full text-left rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-sky-200 flex items-center gap-3 active:scale-[0.98] transition"
    >
      <div className="w-16 h-16 shrink-0 rounded-xl bg-sky-50 flex items-center justify-center text-4xl">
        {open ? "⛱️" : "🎏"}
      </div>
      <div className="flex-1">
        <p className="font-bold text-sky-900">The Beach Umbrella</p>
        <p className="text-xs text-sky-700">
          {open ? "Open and shading Snappy's favorite napping spot." : "Folded down for the evening. Tap to open it again."}
        </p>
      </div>
    </button>
  );
}

function SeagullCard() {
  const { state, tradeWithSeagull, shooSeagull } = useGame();
  const [msg, setMsg] = useState<string | null>(null);
  const milk = state.inventory["coconut-cream"] || 0;
  const dismissedToday = state.seagullDismissedDate === localDateKey();

  if (!state.picnicBasketPlaced) return null;
  if (dismissedToday) {
    return (
      <section className="rounded-2xl bg-white/90 p-4 text-center shadow-md ring-1 ring-yellow-200">
        <h2 className="font-bold text-yellow-900">🕊️ The Winged Bandit Is Away</h2>
        <p className="mt-1 text-sm text-yellow-700">The seagull you shooed away will return to the Picnic Basket tomorrow.</p>
      </section>
    );
  }

  const handleTrade = () => {
    const result = tradeWithSeagull();
    if (!result.ok) {
      setMsg("SQUAWK! (You need Coconut Cream to trade.)");
      window.setTimeout(() => setMsg((m) => (m ? null : m)), 1800);
    } else if (result.snappyDefended) {
      setMsg(`Snappy chased the seagull away and recovered ${ITEMS[result.rewardItemId!].name}.`);
      window.setTimeout(() => setMsg((m) => (m ? null : m)), 2200);
    } else if (result.rewardItemId) {
      setMsg(`The seagull traded you ${ITEMS[result.rewardItemId].name}.`);
      window.setTimeout(() => setMsg((m) => (m ? null : m)), 2200);
    }
  };

  const handleShoo = () => {
    shooSeagull();
  };

  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-yellow-200">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-16 h-16 shrink-0 rounded-xl bg-yellow-50 flex items-center justify-center text-4xl">🕊️</div>
        <div className="flex-1">
          <p className="font-bold text-yellow-900">Winged Bandit (Seagull)</p>
          <p className="text-xs text-yellow-700">
            Eyeing your Picnic Basket — trades: {state.seagullTradeCount}
          </p>
        </div>
      </div>
        {msg && <p role="status" aria-live="polite" className="text-[11px] text-yellow-800 mb-2">{msg}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={milk < 1}
          onClick={handleTrade}
          className="flex-1 text-xs font-semibold px-3 py-1.5 rounded-full text-white disabled:bg-yellow-200 disabled:text-yellow-500 bg-yellow-600 active:bg-yellow-700"
        >
          🥥 Trade Coconut Milk ({milk})
        </button>
        <button
          type="button"
          onClick={handleShoo}
          className="flex-1 text-xs font-semibold px-3 py-1.5 rounded-full text-white bg-slate-500 active:bg-slate-600"
        >
          👋 Shoo Away
        </button>
      </div>
    </div>
  );
}

function BeachBagCard() {
  const { state, digBeachBag, hasEnough } = useGame();
  const cost = [
    { itemId: "dried-sea-oats", count: 3 },
    { itemId: "washed-up-canvas", count: 1 },
  ];
  const canDig = hasEnough(cost);

  if (state.hasBeachBag) return null;

  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-lime-200">
      <p className="font-bold text-lime-900 mb-1">A Mint-Green Strap in the Sand...</p>
      <p className="text-xs text-lime-700 mb-2">Something's buried near the dunes. Gather sea oats and canvas to dig it out.</p>
      <button
        type="button"
        disabled={!canDig}
        onClick={digBeachBag}
        className="w-full text-xs font-semibold px-3 py-2 rounded-full text-white disabled:bg-lime-200 disabled:text-lime-500 bg-lime-600 active:bg-lime-700"
      >
        {canDig ? "🖐️ Dig Up the Beach Bag" : "Need More Sea Oats & Canvas"}
      </button>
    </div>
  );
}

export default function BeachScene() {
  const { state, collectItem, collectSeaWater, setScreen, lastToast, play } = useGame();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedResident, setSelectedResident] = useState<"sandy" | "kai" | "sunny" | "penelope" | "olli" | "elly" | "snappy" | "shelldon" | "shelby" | "misty" | "angel" | "celeste" | "orion" | null>(null);
  const residentCloseRef = useRef<HTMLButtonElement>(null);
  const [nighttime, setNighttime] = useState(false);
  const [seagullDialogOpen, setSeagullDialogOpen] = useState(false);
  const picnicBasketButtonRef = useRef<HTMLButtonElement>(null);
  const closeSeagullDialog = () => {
    setSeagullDialogOpen(false);
    window.setTimeout(() => picnicBasketButtonRef.current?.focus(), 0);
  };
  const [umbrellaOpen, setUmbrellaOpen] = useState(true);
  const [umbrellaAnnouncement, setUmbrellaAnnouncement] = useState("");
  const toggleUmbrella = () => {
    const nextOpen = !umbrellaOpen;
    setUmbrellaOpen(nextOpen);
    setUmbrellaAnnouncement(nextOpen ? "Beach umbrella opened." : "Beach umbrella folded.");
    // Use the two local umbrella effects rather than the unreliable external clip.
    try {
      const sound = new Audio(nextOpen ? "/audio/Umbrella-open.mp3" : "/audio/Umbrella-close.mp3");
      sound.volume = 1;
      void sound.play().catch(() => {});
    } catch {}
  };
  const [poppingKeys, setPoppingKeys] = useState<Record<string, boolean>>({});
  // Computed client-side, post-mount, so server and first client render match
  // (schedule depends on real wall-clock time/date).
  const [travelerSchedule, setTravelerSchedule] = useState<Record<string, ScheduleStatus> | null>(null);
  const [currentRideOpen, setCurrentRideOpen] = useState(false);
  const currentRideButtonRef = useRef<HTMLButtonElement>(null);
  const [tidePoolOpen, setTidePoolOpen] = useState(false);
  const tidePoolButtonRef = useRef<HTMLButtonElement>(null);
  const [isCollectingWater, setIsCollectingWater] = useState(false);
  const waterAnimationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const night = isBeachNight();
    setNighttime(night);
    setSpots(randomSpots(6, night));
    setTravelerSchedule({
      shelldon: getScheduleStatus("shelldon"),
      shelby: getScheduleStatus("shelby"),
      misty: getScheduleStatus("misty"),
    });
  }, []);

  useEffect(() => {
    return () => {
      if (waterAnimationTimerRef.current !== null) window.clearTimeout(waterAnimationTimerRef.current);
    };
  }, []);

  const handleCollectSeaWater = () => {
    if (isCollectingWater) return;
    setIsCollectingWater(true);
    collectSeaWater();
    waterAnimationTimerRef.current = window.setTimeout(() => {
      setIsCollectingWater(false);
      waterAnimationTimerRef.current = null;
    }, 1100);
  };

  const handleTap = (spot: Spot) => {
    if (poppingKeys[spot.key]) return;
    setPoppingKeys((p) => ({ ...p, [spot.key]: true }));
    collectItem(spot.itemId);
    window.setTimeout(() => {
      setSpots((cur) => cur.filter((s) => s.key !== spot.key));
      setSpots((cur) => {
        if (cur.length < 6) {
          return [...cur, ...randomSpots(1, nighttime, cur)];
        }
        return cur;
      });
    }, 220);
  };

  const closeCurrentRide = () => {
    setCurrentRideOpen(false);
    window.setTimeout(() => currentRideButtonRef.current?.focus(), 0);
  };

  const closeTidePool = () => {
    setTidePoolOpen(false);
    window.setTimeout(() => tidePoolButtonRef.current?.focus(), 0);
  };

  return (
    <div className="relative w-full h-full overflow-y-auto select-none">
      <div className="relative w-full aspect-[2/3] min-h-[560px] overflow-hidden rounded-b-2xl">
        <Image
          src={versionedImage(nighttime ? "/images/Beach-background-night.PNG" : "/images/Beach-background-day.PNG")}
          alt={nighttime ? "Shoreline beach at night beneath a starry sky and bright moon" : "Shoreline beach during the day"}
          fill
          priority
          unoptimized
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
        <p className="sr-only" role="status">{nighttime ? "Night has fallen over Shoreline. Rare nighttime discoveries may wash ashore." : "It is daytime at Shoreline beach."}</p>
        {/* Illustrated, keyboard-accessible destination signs. */}
        <button type="button" onClick={() => setScreen("grove")} aria-label="Follow the wooden path to Coconut Grove"
          className="absolute left-[10%] top-[19%] z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center focus-visible:rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300">
          <Image src={versionedImage("/images/Coconut-grove-transparent.PNG")} alt="" aria-hidden="true" width={110} height={110} unoptimized className="h-full w-full object-contain drop-shadow-lg" />
        </button>
        <button type="button" onClick={() => setScreen("shop")} aria-label="Visit Seaweed and Salt shop"
          className="absolute left-[38%] top-[24%] z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center focus-visible:rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300">
          <Image src={versionedImage("/images/Seaweed-and-salt-transparent.PNG")} alt="" aria-hidden="true" width={110} height={110} unoptimized className="h-full w-full object-contain drop-shadow-lg" />
        </button>
        {/* In-scene activities reuse the original handlers and game dialogs. */}
        <button
          type="button"
          onClick={() => setTidePoolOpen(true)}
          aria-label="Search the rocky tide pool"
          className="absolute left-[83%] top-[88%] z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal-950/65 text-2xl shadow-md ring-1 ring-white/60 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"
        >
          <Image src={versionedImage("/images/Beach-tide-pool.PNG")} alt="" aria-hidden="true" width={90} height={90} unoptimized className="h-20 w-20 max-w-none object-contain drop-shadow-lg" />
        </button>
        <button
          type="button"
          onClick={handleCollectSeaWater}
          disabled={isCollectingWater}
          aria-busy={isCollectingWater}
          aria-label={`Collect one jar of sea water at the ocean's edge. You have ${state.inventory["sea-water"] || 0}.`}
          className="absolute left-[88%] top-[53%] z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-950/65 text-2xl shadow-md ring-1 ring-white/60 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300 disabled:opacity-60"
        >
          <Image src={versionedImage("/images/Beach-bucket.PNG")} alt="" aria-hidden="true" width={70} height={70} unoptimized className={isCollectingWater ? "h-16 w-16 max-w-none object-contain drop-shadow-lg origin-bottom transition-transform duration-500 ease-in-out rotate-[28deg] translate-y-2 scale-95 motion-reduce:transition-none" : "h-16 w-16 max-w-none object-contain drop-shadow-lg origin-bottom transition-transform duration-500 ease-in-out rotate-0 translate-y-0 scale-100 motion-reduce:transition-none"} />
        </button>
        <span role="status" aria-live="polite" className="sr-only">{isCollectingWater ? "Dipping the bucket into the sea and filling it with water." : ""}</span>
        {/* Snappy's existing mini-game, accessible directly beside the turtle. */}
        <button
          ref={currentRideButtonRef}
          type="button"
          onClick={() => setCurrentRideOpen(true)}
          aria-label="Play Snappy's Current Ride mini-game"
          className="absolute left-[89%] top-[43%] z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal-950/65 text-2xl shadow-md ring-1 ring-white/60 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"
        >
          <span aria-hidden="true">🌊</span>
        </button>
        {state.umbrellaPlaced && (
          <button
            type="button"
            onClick={toggleUmbrella}
            aria-label={umbrellaOpen ? "Beach umbrella open. Fold the umbrella." : "Beach umbrella folded. Open the umbrella."}
            className="absolute left-[53%] top-[61%] z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-4xl drop-shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-700"
          >
            <Image src={versionedImage(umbrellaOpen ? "/images/Beach-umbrella-open.PNG" : "/images/Beach-umbrella-closed.PNG")} alt="" aria-hidden="true" width={110} height={110} unoptimized className="h-24 w-24 max-w-none object-contain drop-shadow-lg transition-transform duration-700 ease-in-out motion-reduce:transition-none" />
          </button>
        )}
        <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">{umbrellaAnnouncement}</span>
        {state.picnicBasketPlaced && (
          <button
            ref={picnicBasketButtonRef}
            type="button"
            onClick={() => setSeagullDialogOpen(true)}
            aria-label={state.seagullDismissedDate === localDateKey() ? "Picnic basket. The seagull has flown away until tomorrow." : "Picnic basket. Visit the seagull to trade or shoo him away."}
            className="absolute left-[48%] top-[73%] z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-50/30 text-4xl drop-shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-700"
          >
            <Image src={versionedImage("/images/Beach-picnic-basket.PNG")} alt="" aria-hidden="true" width={86} height={86} unoptimized className="h-20 w-20 max-w-none object-contain drop-shadow-lg" />
            {state.seagullDismissedDate !== localDateKey() && (
              <Image src={versionedImage("/images/Beach-seagull.PNG")} alt="" aria-hidden="true" width={72} height={72} unoptimized className="absolute -right-8 -top-7 h-14 w-14 max-w-none object-contain drop-shadow-lg" />
            )}
          </button>
        )}
        {/* Interactive resident artwork, with accessible links to existing interactions. */}
        {([
          { id: "sandy", name: "Sandy", image: "/images/Beach-Sandy-transparent.png", x: 24, y: 33 },
          { id: "kai", name: "Kai", image: "/images/Beach-Kai-transparent.png", x: 73, y: 79 },
          { id: "sunny", name: "Sunny", image: "/images/Beach-Sunny-transparent.png", x: 79, y: 60 },
          { id: "penelope", name: "Penelope", image: "/images/Beach-Penelope-transparent.png", x: 24, y: 68 },
          { id: "olli", name: "Olli", image: "/images/Olli-transparent.PNG", x: 46, y: 48 },
          { id: "snappy", name: "Snappy", image: "/images/Snappy-transparent.PNG", x: 88, y: 42 },
          { id: "elly", name: "Elly", image: "/images/Elly-transparent.PNG", x: 86, y: 25 },
          ...(travelerSchedule?.shelldon?.available ? [{ id: "shelldon" as const, name: "Shelldon", image: "/images/Sheldon-transparent.PNG", x: 41, y: 76 }] : []),
          ...(travelerSchedule?.shelby?.available ? [{ id: "shelby" as const, name: "Shelby", image: "/images/Shelby-transparent.PNG", x: 61, y: 43 }] : []),
          ...(travelerSchedule?.misty?.available ? [{ id: "misty" as const, name: "Misty", image: "/images/Misty-transparent.PNG", x: 92, y: 12 }] : []),
          { id: "angel", name: "Angel", image: "/images/Angel-transparent.PNG", x: 12, y: 52 },
          ...(nighttime && ["lookout-distant-island", "lookout-lantern-boat", "lookout-moonlit-whale", "lookout-shooting-stars"].some((id) => state.lookoutSightings.includes(id)) ? [
            { id: "celeste" as const, name: "Celeste", image: "/images/Celeste-transparent.PNG", x: 42, y: 11 },
            { id: "orion" as const, name: "Orion", image: "/images/Orion-transparent.PNG", x: 72, y: 13 },
          ] : []),
        ] as const).map((character) => (
          <button
            key={character.id}
            type="button"
            aria-label={`Visit ${character.name}`}
            onClick={() => setSelectedResident(character.id)}
            className="absolute z-10 flex min-h-16 min-w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center p-1 drop-shadow-lg focus-visible:rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-700"
            style={{ left: `${character.x}%`, top: `${character.y}%` }}
          >
            <Image src={versionedImage(character.image)} alt="" aria-hidden="true" width={92} height={92} unoptimized className={character.id === "celeste" || character.id === "orion" ? "h-16 w-16 object-contain sm:h-20 sm:w-20" : "h-20 w-20 object-contain sm:h-24 sm:w-24"} />
            <span aria-hidden="true" className="rounded-full bg-amber-50/90 px-2 py-0.5 text-xs font-bold text-stone-900">{character.name}</span>
          </button>
        ))}
        {spots.map((spot) => {
          const def = ITEMS[spot.itemId];
          const popping = poppingKeys[spot.key];
          return (
            <button
              key={spot.key}
              onClick={() => handleTap(spot)}
              aria-label={`Collect ${def.name}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white/25 shadow-sm ring-1 ring-white/30 transition-all duration-200 active:scale-90 ${
                popping ? "opacity-0 scale-150" : "opacity-100 scale-100 animate-bob"
              }`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: 44, height: 44 }}
            >
              {def.isEmoji ? (
                <span className="text-xl">{def.icon}</span>
              ) : (
                <Image src={versionedImage(def.icon)} alt={def.name} width={34} height={34} unoptimized className="object-contain drop-shadow" />
              )}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-4 space-y-3 bg-[#fbf3e3] pb-8">
        {/* Beach scenery provides the water bucket, grove, shop, tide pool, Snappy ride, umbrella, and picnic interactions. */}
        <BeachBagCard />

        {/* Resident interactions, special quests, and visitor exchanges live in the accessible character dialogs above. */}
      </div>
      {selectedResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" role="presentation" onClick={() => setSelectedResident(null)}>
          <section role="dialog" aria-modal="true" aria-label={`${selectedResident === "elly" ? "Elly" : selectedResident === "snappy" ? "Snappy" : VILLAGERS[selectedResident].name} activities`} className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#fbf3e3] p-4 shadow-xl" onClick={(event) => event.stopPropagation()}>
            {/* Announce gift and reward results inside the active modal: aria-modal hides outside status regions from VoiceOver. */}
            <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{lastToast || ""}</div>
            <button ref={residentCloseRef} type="button" autoFocus onClick={() => setSelectedResident(null)} className="mb-3 min-h-11 rounded-xl bg-teal-800 px-4 py-2 font-bold text-white">Close {selectedResident === "elly" ? "Elly" : selectedResident === "snappy" ? "Snappy" : VILLAGERS[selectedResident].name}</button>
            {selectedResident === "elly" ? <><EllyCard /><EllyGarden /></> : selectedResident === "snappy" ? <SnappyCard /> : selectedResident === "olli" ? <OlliCard /> : selectedResident === "misty" ? <><VillagerCard villager={VILLAGERS.misty} schedule={travelerSchedule?.misty} /><MistyMoonlitExchange /></> : selectedResident === "shelldon" || selectedResident === "shelby" ? <VillagerCard key={selectedResident} villager={VILLAGERS[selectedResident]} schedule={travelerSchedule?.[selectedResident]} /> : (
              <>
                <VillagerCard key={selectedResident} villager={VILLAGERS[selectedResident]} />
                {selectedResident === "sandy" && <SandyStormHunt />}
                {selectedResident === "kai" && <KaiBuriedTreasure />}
                {selectedResident === "penelope" && <PenelopeCleanupHeart />}
              </>
            )}
          </section>
        </div>
      )}
      {seagullDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" role="presentation" onClick={closeSeagullDialog}>
          <section role="dialog" aria-modal="true" aria-label="Picnic basket and seagull" className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#fbf3e3] p-4 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{lastToast || ""}</div>
            <button type="button" autoFocus onClick={closeSeagullDialog} className="mb-3 min-h-11 rounded-xl bg-teal-800 px-4 py-2 font-bold text-white">Close Picnic Basket</button>
            <SeagullCard />
          </section>
        </div>
      )}
      {currentRideOpen && <SnappyCurrentRide onClose={closeCurrentRide} />}
      {tidePoolOpen && <TidePoolSearch onClose={closeTidePool} />}
    </div>
  );
}
