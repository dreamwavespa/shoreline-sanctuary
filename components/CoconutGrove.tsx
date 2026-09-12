"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ITEMS } from "@/lib/items";
import { SCENES } from "@/lib/media";
import { useGame } from "@/lib/store";

type NodeId = "palms" | "berries" | "herbs" | "roots" | "seasonal";
type HarvestTimes = Partial<Record<NodeId, number>>;

const STORAGE_KEY = "shoreline-coconut-grove-harvests";
const BASE_COOLDOWN: Record<NodeId, number> = {
  palms: 30 * 60_000,
  berries: 20 * 60_000,
  herbs: 25 * 60_000,
  roots: 35 * 60_000,
  seasonal: 24 * 60 * 60_000,
};

const NODES: { id: NodeId; icon: string; title: string; instruction: string }[] = [
  { id: "palms", icon: "🥥", title: "Coconut Palms", instruction: "Shake a palm, then gather what falls into the sand." },
  { id: "berries", icon: "🫐", title: "Berry Bramble", instruction: "Pick four ripe berries and settle the bundle into the wicker basket." },
  { id: "herbs", icon: "🌿", title: "Botanical Herb Thicket", instruction: "Snip fragrant lemongrass or beach mint beside the mossy log." },
  { id: "roots", icon: "🫚", title: "Sandy Root Patch", instruction: "Pull a fresh root from the soft, dark island soil." },
  { id: "seasonal", icon: "🎃", title: "Seasonal Garden", instruction: "Harvest the crop growing in the stone-ringed garden." },
];

function choose<T>(weighted: { value: T; weight: number }[]): T {
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of weighted) {
    if (roll < item.weight) return item.value;
    roll -= item.weight;
  }
  return weighted[0].value;
}

export default function CoconutGrove() {
  const { state, collectItem, play, setMusicOverride, setScreen } = useGame();
  const [harvestedAt, setHarvestedAt] = useState<HarvestTimes>({});
  const [message, setMessage] = useState("The grove is ready to explore.");
  const [now, setNow] = useState(() => Date.now());
  const postStorm = state.currentForecast?.id === "storm" || state.stormCleanupAvailable;
  const month = new Date().getMonth();
  const season = month >= 8 && month <= 10 ? "autumn" : month === 11 || month <= 1 ? "winter" : "growing";

  useEffect(() => {
    setMusicOverride("grove");
    play("groveTrail", 0.65);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHarvestedAt(JSON.parse(saved));
    } catch {}
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => {
      window.clearInterval(timer);
      setMusicOverride(null);
    };
    // Enter/exit lifecycle only. Re-running this when context callbacks change
    // would restart the trail sound after every harvested item.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cooldowns = useMemo(() => {
    const factor = postStorm ? 0.5 : 1;
    return Object.fromEntries(Object.entries(BASE_COOLDOWN).map(([id, ms]) => [id, ms * factor])) as Record<NodeId, number>;
  }, [postStorm]);

  const remaining = (id: NodeId) => Math.max(0, (harvestedAt[id] || 0) + cooldowns[id] - now);
  const waitLabel = (id: NodeId) => {
    const ms = remaining(id);
    if (!ms) return "Ready to harvest";
    const minutes = Math.ceil(ms / 60_000);
    return `Regrowing — about ${minutes} minute${minutes === 1 ? "" : "s"} remaining`;
  };

  const add = (itemId: string, count: number) => {
    for (let i = 0; i < count; i += 1) collectItem(itemId, { silent: true });
  };

  const harvest = (id: NodeId) => {
    if (remaining(id)) return;
    const rewards: { itemId: string; count: number }[] = [];

    if (id === "palms") {
      play("groveLeafRustle");
      const itemId = postStorm && Math.random() < 0.25
        ? "sweet-green-coconut"
        : choose([{ value: "coconut", weight: 85 }, { value: "dry-palm-frond", weight: 15 }]);
      rewards.push({ itemId, count: itemId === "coconut" ? 1 + Math.floor(Math.random() * 2) : 1 });
      window.setTimeout(() => play("grovePalmFall"), 180);
      window.setTimeout(() => play("groveCoconutImpact"), 420);
    } else if (id === "berries") {
      const companionBerry = postStorm && Math.random() < 0.3
        ? "wild-dewdrop-currant"
        : choose([
            { value: "coastal-brambleberry", weight: 75 },
            { value: "wild-beach-plum", weight: 25 },
          ]);
      rewards.push({ itemId: "sea-berry", count: 1 });
      rewards.push({ itemId: companionBerry, count: companionBerry === "wild-beach-plum" ? 1 : 3 });
      play("groveBerryPick");
      window.setTimeout(() => play("groveBasketFill"), 380);
    } else if (id === "herbs") {
      const itemId = postStorm && Math.random() < 0.45
        ? "rain-lily-blossom"
        : choose([{ value: "wild-lemongrass", weight: 50 }, { value: "coastal-beach-mint", weight: 40 }]);
      rewards.push({ itemId, count: itemId === "rain-lily-blossom" ? 1 : 2 });
      play("groveHerbSnip");
    } else if (id === "roots") {
      const itemId = postStorm && Math.random() < 0.35
        ? "storm-fiddlehead"
        : choose([{ value: "dune-ginger", weight: 65 }, { value: "sweet-island-cane", weight: 30 }]);
      rewards.push({ itemId, count: itemId === "sweet-island-cane" ? 1 : 1 + Math.floor(Math.random() * 2) });
      play("groveRootPull");
    } else if (season === "autumn") {
      rewards.push({ itemId: Math.random() < 0.75 ? "golden-island-pumpkin" : "miniature-sugar-squash", count: 1 });
      play("groveHerbSnip");
    } else if (season === "winter") {
      rewards.push({ itemId: "winter-spice-bark", count: 1 });
      play("groveLeafRustle");
    } else {
      setMessage("The seasonal garden is growing quietly. Autumn and winter crops will appear later in the year.");
      return;
    }

    rewards.forEach(({ itemId, count }) => add(itemId, count));
    const names = rewards.map(({ itemId, count }) => `${count} ${ITEMS[itemId].name}`).join(" and ");
    setMessage(`Collected ${names}. It is now in your bucket and inventory.`);
    const next = { ...harvestedAt, [id]: Date.now() };
    setHarvestedAt(next);
    setNow(Date.now());
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const leave = () => {
    play("groveSignTap");
    setScreen("beach");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#edf5df] pb-24">
      <div className="relative h-[42%] min-h-[260px] w-full overflow-hidden">
        <Image src={SCENES.coconutGrove} alt="A sun-dappled coconut grove with berry brambles, herbs, sandy root beds, flowers, and a path back to the beach" fill priority unoptimized sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/75 via-transparent to-black/10" />
        <div className="absolute bottom-4 left-4 right-4 text-white drop-shadow">
          <p className="text-xs font-bold uppercase tracking-widest text-lime-100">Beach Sub-Area</p>
          <h1 className="font-serif text-3xl font-bold">Coconut Grove</h1>
          <p className="mt-1 text-sm">Golden light, rustling palms, and useful island botanicals.</p>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        {postStorm && (
          <p className="rounded-xl bg-sky-100 p-3 text-sm font-semibold text-sky-950 ring-1 ring-sky-300">🌦️ Post-storm growth is active: rare plants may appear and every grove patch regrows twice as fast.</p>
        )}
        <p role="status" aria-live="polite" className="rounded-xl bg-white/90 p-3 text-sm font-medium text-emerald-950 shadow-sm ring-1 ring-emerald-200">{message}</p>

        <section aria-labelledby="harvest-heading">
          <h2 id="harvest-heading" className="mb-2 font-serif text-xl font-bold text-emerald-950">Foraging Patches</h2>
          <div className="space-y-3">
            {NODES.map((node) => {
              const unavailable = node.id === "seasonal" && season === "growing";
              const waiting = remaining(node.id) > 0;
              return (
                <div key={node.id} className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-emerald-200">
                  <h3 className="font-bold text-emerald-950">{node.icon} {node.title}</h3>
                  <p className="mt-1 text-sm text-emerald-800">{node.instruction}</p>
                  <p className="mt-2 text-xs font-semibold text-emerald-700">{unavailable ? "Growing until autumn" : waitLabel(node.id)}</p>
                  <button type="button" disabled={waiting || unavailable} onClick={() => harvest(node.id)} className="mt-3 min-h-12 w-full rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white shadow disabled:bg-emerald-200 disabled:text-emerald-600 active:bg-emerald-800">
                    {node.id === "palms" ? "Shake Palm and Gather" : node.id === "berries" ? "Pick Berry Bundle" : node.id === "herbs" ? "Snip Fresh Herbs" : node.id === "roots" ? "Pull a Root Crop" : "Harvest Seasonal Crop"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="recipes-heading" className="overflow-hidden rounded-2xl bg-amber-50 shadow-sm ring-1 ring-amber-300">
          <Image src={SCENES.coconutGroveRecipes} alt="Recipe cards for Golden Pumpkin Bisque, Sea Rose Pumpkin Tart, Island Spiced Gingerbread, and Frothy Coastal Spiced Cocoa" width={1408} height={768} unoptimized className="h-auto w-full" />
          <div className="p-4">
            <h2 id="recipes-heading" className="font-serif text-xl font-bold text-amber-950">Grove Recipe Collection</h2>
            <p className="mt-1 text-sm text-amber-800">Your four new seasonal recipes are available in the Workshop Kitchen. Harvest here, then bring the ingredients to the hearth.</p>
          </div>
        </section>

        <button type="button" onClick={leave} className="min-h-12 w-full rounded-xl bg-amber-800 px-4 py-3 font-bold text-white shadow active:bg-amber-900">🪧 Follow the “To Shore” Sign</button>
      </div>
    </div>
  );
}
