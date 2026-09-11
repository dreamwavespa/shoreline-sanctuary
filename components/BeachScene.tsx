"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ITEMS, rollSpawn } from "@/lib/items";
import { useGame } from "@/lib/store";
import { SCENES } from "@/lib/media";
import { VILLAGERS } from "@/lib/villagers";
import VillagerCard from "./VillagerCard";
import { getScheduleStatus, ScheduleStatus } from "@/lib/schedule";
import SnappyCurrentRide from "./SnappyCurrentRide";
import TidePoolSearch from "./TidePoolSearch";

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
      itemId: rollSpawn(),
      x: 8 + Math.random() * 84,
      y: 38 + Math.random() * 52,
    });
  }
  return spots;
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

function OllieCard() {
  const { collectItem } = useGame();
  const [squirt, setSquirt] = useState(false);

  const handleTap = () => {
    setSquirt(true);
    collectItem("seaweed-fronds", { silent: true });
    window.setTimeout(() => setSquirt(false), 500);
  };

  return (
    <button
      type="button"
      onClick={handleTap}
      className="w-full text-left rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-teal-200 flex items-center gap-3 active:scale-[0.98] transition"
    >
      <div className="w-16 h-16 shrink-0 rounded-xl bg-teal-50 flex items-center justify-center text-4xl">
        {squirt ? "💦" : "🐙"}
      </div>
      <div className="flex-1">
        <p className="font-bold text-teal-900">Ollie the Octopus</p>
        <p className="text-xs text-teal-700">Playful and curious — tap to say hello and he'll toss you a stray frond of seaweed.</p>
      </div>
    </button>
  );
}

function SnappyCard() {
  const { state, feedSnappy } = useGame();
  const milk = state.inventory["food-sea-rose-milk"] || 0;

  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-emerald-200 flex items-center gap-3">
      <div className="w-16 h-16 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center text-4xl">
        {state.snappyAwake ? "🐢" : "😴"}
      </div>
      <div className="flex-1">
        <p className="font-bold text-emerald-900">Snappy the Sea Turtle</p>
        <p className="text-xs text-emerald-700 mb-2">
          {state.snappyAwake
            ? `Wide awake and grateful — fed ${state.snappyFedCount} time(s).`
            : "Fast asleep on a sun-warmed rock. A bowl of Sea-Rose Milk from the Kitchen might wake her gently."}
        </p>
        <button
          type="button"
          disabled={milk < 1}
          onClick={feedSnappy}
          className="text-xs font-semibold px-3 py-1.5 rounded-full text-white disabled:bg-emerald-200 disabled:text-emerald-500 bg-emerald-600 active:bg-emerald-700"
        >
          🥛 Feed Sea-Rose Milk ({milk})
        </button>
      </div>
    </div>
  );
}

function UmbrellaCard() {
  const { state, play } = useGame();
  const [open, setOpen] = useState(true);

  if (!state.umbrellaPlaced) return null;

  const toggle = () => {
    setOpen((o) => !o);
    play("umbrellaWhoof");
  };

  return (
    <button
      type="button"
      onClick={toggle}
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

  if (!state.picnicBasketPlaced) return null;

  const handleTrade = () => {
    const result = tradeWithSeagull();
    if (!result.ok) {
      setMsg("SQUAWK! (You need Coconut Cream to trade.)");
      window.setTimeout(() => setMsg((m) => (m ? null : m)), 1800);
    } else if (result.snappyDefended) {
      setMsg('Snappy: "Crisis averted. Back to my nap."');
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
      {msg && <p className="text-[11px] text-yellow-800 mb-2">{msg}</p>}
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
  const { collectItem, setScreen } = useGame();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [poppingKeys, setPoppingKeys] = useState<Record<string, boolean>>({});
  // Computed client-side, post-mount, so server and first client render match
  // (schedule depends on real wall-clock time/date).
  const [travelerSchedule, setTravelerSchedule] = useState<Record<string, ScheduleStatus> | null>(null);
  const [currentRideOpen, setCurrentRideOpen] = useState(false);
  const currentRideButtonRef = useRef<HTMLButtonElement>(null);
  const [tidePoolOpen, setTidePoolOpen] = useState(false);
  const tidePoolButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSpots(randomSpots(9));
    setTravelerSchedule({
      shelldon: getScheduleStatus("shelldon"),
      shelby: getScheduleStatus("shelby"),
      misty: getScheduleStatus("misty"),
    });
  }, []);

  const handleTap = (spot: Spot) => {
    if (poppingKeys[spot.key]) return;
    setPoppingKeys((p) => ({ ...p, [spot.key]: true }));
    collectItem(spot.itemId);
    window.setTimeout(() => {
      setSpots((cur) => cur.filter((s) => s.key !== spot.key));
      setSpots((cur) => {
        if (cur.length < 6) {
          return [...cur, ...randomSpots(1)];
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
      <div className="relative w-full h-[60%] min-h-[280px] overflow-hidden rounded-b-2xl">
        <Image
          src={SCENES.beachMain}
          alt="Shoreline beach"
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
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
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: 56, height: 56 }}
            >
              {def.isEmoji ? (
                <span className="text-2xl">{def.icon}</span>
              ) : (
                <Image src={def.icon} alt={def.name} width={40} height={40} unoptimized className="object-contain drop-shadow" />
              )}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-4 space-y-3 bg-[#fbf3e3] pb-8">
        <p className="text-xs font-semibold text-amber-800/70 uppercase tracking-wide">Places Along the Shore</p>
        <section aria-labelledby="seaweed-shop-heading" className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-amber-300">
          <div className="relative h-40 w-full">
            <Image src={SCENES.seaweedShopExterior} alt="Seaweed and Salt shop beside the beach" fill unoptimized sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
            <h2 id="seaweed-shop-heading" className="absolute bottom-3 left-4 font-serif text-xl font-bold text-white">🦦 Seaweed &amp; Salt</h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-stone-700">Follow the waterline to Seaweed’s market for provisions, crafts, tidal curios, and fair trades.</p>
            <button
              type="button"
              onClick={() => setScreen("shop")}
              aria-label="Seaweed and Salt shop. Buy supplies, sell crafted goods, and talk with Seaweed."
              className="mt-3 min-h-12 w-full rounded-xl bg-amber-800 py-3 font-bold text-white shadow active:bg-amber-900"
            >
              Follow the Shoreline to the Shop
            </button>
          </div>
        </section>

        <p className="text-xs font-semibold text-amber-800/70 uppercase tracking-wide">Sanctuary Residents</p>
        <EllyCard />
        <OllieCard />
        <SnappyCard />
        <section aria-labelledby="tide-pool-heading" className="overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-100 shadow-md ring-1 ring-cyan-300">
          <div className="relative h-40 w-full">
            <Image src={SCENES.tidePool} alt="A clear turquoise tide pool among coastal rocks" fill unoptimized sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-950/75 via-transparent to-transparent" />
            <h2 id="tide-pool-heading" className="absolute bottom-3 left-4 font-serif text-xl font-bold text-white">🌊 Tide-Pool Search</h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-teal-900">Explore seven rocky pockets at your own pace. Meet Rainbow, Pip, Sparkle, and Barnaby, and look for sea lettuce, anemones, and a pearl-bearing clam.</p>
            <button
              ref={tidePoolButtonRef}
              type="button"
              onClick={() => setTidePoolOpen(true)}
              className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800"
            >
              Search the Tide Pool
            </button>
          </div>
        </section>
        <section aria-labelledby="current-ride-heading" className="rounded-2xl bg-gradient-to-br from-cyan-50 to-emerald-100 p-4 shadow-md ring-1 ring-cyan-200">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">Snappy's Beach Mini-Game</p>
          <h2 id="current-ride-heading" className="mt-1 font-serif text-lg font-bold text-emerald-950">🐢 Snappy’s Current Ride</h2>
          <p className="mt-1 text-sm text-emerald-800">Guide Snappy through gentle currents, collect bubbles, and avoid seaweed, rocks, and floating debris. Every choice is untimed.</p>
          <button
            ref={currentRideButtonRef}
            type="button"
            onClick={() => setCurrentRideOpen(true)}
            className="mt-3 w-full rounded-xl bg-emerald-700 py-3 font-bold text-white shadow active:bg-emerald-800"
          >
            Ride the Current
          </button>
        </section>
        <UmbrellaCard />
        <SeagullCard />
        <BeachBagCard />

        <p className="text-xs font-semibold text-amber-800/70 uppercase tracking-wide pt-2">
          Shoreline Residents & Eco-Allies
        </p>
        <VillagerCard villager={VILLAGERS.sandy} />
        <VillagerCard villager={VILLAGERS.kai} />
        <VillagerCard villager={VILLAGERS.sunny} />
        <VillagerCard villager={VILLAGERS.penelope} />

        <p className="text-xs font-semibold text-amber-800/70 uppercase tracking-wide pt-2">
          Traveling & Special Characters
        </p>
        {travelerSchedule && (
          <div className="rounded-2xl bg-indigo-50 ring-1 ring-indigo-200 p-3">
            <p className="text-[11px] font-semibold text-indigo-800/70 uppercase tracking-wide mb-1.5">
              Today's Visitors
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(["shelldon", "shelby", "misty"] as const).map((id) => (
                <span
                  key={id}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    travelerSchedule[id].available ? "bg-emerald-500 text-white" : "bg-white text-slate-400 ring-1 ring-slate-200"
                  }`}
                >
                  {travelerSchedule[id].available ? "🟢" : "🌘"} {VILLAGERS[id].name}
                </span>
              ))}
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500 text-white">
                🟢 Angel
              </span>
            </div>
          </div>
        )}
        <VillagerCard villager={VILLAGERS.shelldon} schedule={travelerSchedule?.shelldon} />
        <VillagerCard villager={VILLAGERS.shelby} schedule={travelerSchedule?.shelby} />
        <VillagerCard villager={VILLAGERS.misty} schedule={travelerSchedule?.misty} />
        <VillagerCard villager={VILLAGERS.angel} />
      </div>
      {currentRideOpen && <SnappyCurrentRide onClose={closeCurrentRide} />}
      {tidePoolOpen && <TidePoolSearch onClose={closeTidePool} />}
    </div>
  );
}
