"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ITEMS, rollReefSpawn } from "@/lib/items";
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
      itemId: rollReefSpawn(),
      x: 8 + Math.random() * 84,
      y: 38 + Math.random() * 50,
    });
  }
  return spots;
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
  const { state, collectItem, setMusicOverride } = useGame();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [poppingKeys, setPoppingKeys] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<"dive" | "restore" | "libby">("dive");

  useEffect(() => {
    setSpots(randomSpots(6));
  }, []);

  // AudioEngine owns the single music element; this screen only tells it
  // which track to prefer while the Libby (lobster trap) sub-tab is active,
  // and clears that preference on tab-away/unmount so the zone's default
  // underwater track resumes. Never mount a second <audio> element here.
  useEffect(() => {
    if (tab === "libby") {
      setMusicOverride("deepReefDescent");
    } else {
      setMusicOverride(null);
    }
    return () => setMusicOverride(null);
  }, [tab, setMusicOverride]);

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
      setSpots((cur) => (cur.length < 4 ? [...cur, ...randomSpots(1)] : cur));
    }, 220);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#07262b]">
      <div className="relative w-full h-[48%] min-h-[240px] overflow-hidden select-none">
        <Image src={SCENES.shipwreck} alt="Deep Reef shipwreck" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-blue-900/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#07262b]" />
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
              <Image src={def.icon} alt={def.name} width={34} height={34} unoptimized className="object-contain drop-shadow" />
            </button>
          );
        })}
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setTab("dive")}
            className={`flex-1 py-2 rounded-full text-xs font-semibold ${tab === "dive" ? "bg-teal-600 text-white" : "bg-white/80 text-teal-800"}`}
          >
            🕸️ Ghost Net
          </button>
          <button
            type="button"
            onClick={() => setTab("restore")}
            className={`flex-1 py-2 rounded-full text-xs font-semibold ${tab === "restore" ? "bg-amber-700 text-white" : "bg-white/80 text-amber-800"}`}
          >
            ⚓ Shipwreck
          </button>
          <button
            type="button"
            onClick={() => setTab("libby")}
            className={`flex-1 py-2 rounded-full text-xs font-semibold ${tab === "libby" ? "bg-cyan-600 text-white" : "bg-white/80 text-cyan-800"}`}
          >
            🦞 Libby
          </button>
        </div>
        {tab === "dive" ? <GhostNetCard /> : tab === "restore" ? <ShipwreckCard /> : <LibbyCard />}
        <p className="text-xs text-teal-200/70 text-center mt-4">Tap the glinting debris above to collect restoration materials.</p>
      </div>
    </div>
  );
}
