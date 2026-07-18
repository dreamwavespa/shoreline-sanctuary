"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ITEMS, rollSpawn } from "@/lib/items";
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
  const { collectItem } = useGame();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [poppingKeys, setPoppingKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSpots(randomSpots(9));
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
        <p className="text-xs font-semibold text-amber-800/70 uppercase tracking-wide">Sanctuary Residents</p>
        <EllyCard />
        <OllieCard />
        <SnappyCard />
        <UmbrellaCard />
        <SeagullCard />
        <BeachBagCard />
      </div>
    </div>
  );
}
