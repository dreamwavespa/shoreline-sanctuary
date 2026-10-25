"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ITEMS } from "@/lib/items";
import { SCENES } from "@/lib/media";
import { getShopDateKey } from "@/lib/shop";
import { BEE_VISIT_COOLDOWN_MS, useGame } from "@/lib/store";
import HiddenGroveNursery, { WateringCanIcon } from "./HiddenGroveNursery";
import GroveCoffeePlant from "./GroveCoffeePlant";

type NodeId = "palms" | "berries" | "herbs" | "coastal" | "fruit" | "roots" | "seasonal" | "vegetables";
type HarvestTimes = Partial<Record<NodeId, number>>;

const MYSTERY_HERB_KEY = "shoreline-imported-herb-v1";
const MYSTERY_HERB_GROW_MS = 45 * 60_000;
const MYSTERY_HERBS = ["island-vanilla-orchid", "moonmint-leaves", "tropical-hibiscus"] as const;
type MysteryHerb = { result: typeof MYSTERY_HERBS[number]; plantedAt: number; rareSeedBonus?: boolean };
const FLOWER_BED_KEY = "shoreline-grove-flowerbed-v1";
const FLOWER_GROW_MS = 30 * 60_000;
const flowerGrowMs = (hasTurtleCan: boolean) => hasTurtleCan ? 20 * 60_000 : FLOWER_GROW_MS;
const FLOWERS = [
  { seed: "shelldon-moon-tide-seed", flower: "shelldon-moon-tide-blossom" },
  { seed: "seed-beach-rose", flower: "flower-beach-rose" },
  { seed: "seed-sea-holly", flower: "flower-sea-holly" },
  { seed: "seed-seaside-daisy", flower: "flower-seaside-daisy" },
  { seed: "seed-coastal-sunflower", flower: "flower-coastal-sunflower" },
  { seed: "seed-dune-evening-primrose", flower: "flower-dune-evening-primrose" },
  { seed: "seed-saltmarsh-mallow", flower: "flower-saltmarsh-mallow" },
  { seed: "seed-sea-morning-glory", flower: "flower-sea-morning-glory" },
] as const;
type FlowerPlant = { seed: string; flower: string; plantedAt: number };
const STORAGE_KEY = "shoreline-coconut-grove-harvests";
const BASE_COOLDOWN: Record<NodeId, number> = {
  palms: 30 * 60_000,
  berries: 20 * 60_000,
  herbs: 25 * 60_000,
  coastal: 25 * 60_000,
  fruit: 30 * 60_000,
  roots: 35 * 60_000,
  seasonal: 24 * 60 * 60_000,
  vegetables: 30 * 60_000,
};

const NODES: { id: NodeId; icon: string; title: string; instruction: string }[] = [
  { id: "palms", icon: "🥥", title: "Coconut Palms", instruction: "Shake a palm, then gather what falls into the sand." },
  { id: "berries", icon: "🫐", title: "Berry Bramble", instruction: "Pick a bundle of coastal berries, strawberries, blueberries, or raspberries." },
  { id: "herbs", icon: "🌿", title: "Botanical Herb Thicket", instruction: "Snip fragrant lemongrass, beach mint, or rosemary beside the mossy log." },
  { id: "coastal", icon: "🫛", title: "Coastal Edibles Patch", instruction: "Gather sea peas with tender sea parsley or flowering sea lavender." },
  { id: "fruit", icon: "🍍", title: "Tropical Fruit Garden", instruction: "Harvest pineapple, mangoes, bananas, grapes from the vine, or lemons from the tree." },
  { id: "roots", icon: "🫚", title: "Sandy Root Patch", instruction: "Pull a fresh root from the soft, dark island soil." },
  { id: "vegetables", icon: "🥕", title: "Vegetable Garden", instruction: "Harvest carrots, potatoes, broccoli, cucumbers, and tomatoes from the year-round vegetable beds." },
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
  const { state, collectItem, craft, play, setMusicOverride, setScreen, advanceHoneybell, visitGroveBees } = useGame();
  const [harvestedAt, setHarvestedAt] = useState<HarvestTimes>({});
  const [message, setMessage] = useState("The grove is ready to explore.");
  const [now, setNow] = useState(() => Date.now());
  const [nurseryOpen, setNurseryOpen] = useState(false);
  const [flowerBedOpen, setFlowerBedOpen] = useState(false);
  const [mysteryHerbOpen, setMysteryHerbOpen] = useState(false);
  const [mysteryHerb, setMysteryHerb] = useState<MysteryHerb | null>(null);
  const [flowerPlant, setFlowerPlant] = useState<FlowerPlant | null>(null);
  const [beePanelOpen, setBeePanelOpen] = useState(false);
  const [leafSandReady, setLeafSandReady] = useState(false);
  const nurseryButtonRef = useRef<HTMLButtonElement>(null);
  const beeHotspotRef = useRef<HTMLButtonElement>(null);
  const nurseryHotspotRef = useRef<HTMLButtonElement>(null);
  const postStorm = state.currentForecast?.id === "storm" || state.stormCleanupAvailable;
  const month = new Date().getMonth();
  const season = month >= 2 && month <= 4 ? "spring" : month >= 5 && month <= 7 ? "summer" : month >= 8 && month <= 10 ? "autumn" : "winter";
  const seasonalGardenImage = {
    spring: "/images/coconut-grove-spring.png",
    summer: "/images/coconut-grove-summer.png",
    autumn: "/images/coconut-grove-autumn.png",
    winter: "/images/coconut-grove-winter.png",
  }[season];
  const beeClueFound = state.foundBottleMessages.includes("sea-rose-bees") || state.honeybellStage > 0;
  const beesUnlocked = state.honeybellStage >= 3;
  const beeVisitRemaining = Math.max(0, state.beeLastVisitAt + BEE_VISIT_COOLDOWN_MS - now);
  const beeVisitMinutes = Math.ceil(beeVisitRemaining / 60_000);
  const dailyWaxReady = state.beeWaxClaimDate !== getShopDateKey();

  useEffect(() => {
    setMusicOverride("grove");
    play("groveTrail", 0.65);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHarvestedAt(JSON.parse(saved));
      const flowerSaved = localStorage.getItem(FLOWER_BED_KEY);
      if (flowerSaved) setFlowerPlant(JSON.parse(flowerSaved));
      const herbSaved = localStorage.getItem(MYSTERY_HERB_KEY);
      if (herbSaved) { const planted = JSON.parse(herbSaved) as MysteryHerb; if (MYSTERY_HERBS.includes(planted.result) && Number.isFinite(planted.plantedAt)) setMysteryHerb(planted); }
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
            { value: "coastal-brambleberry", weight: 25 },
            { value: "wild-beach-plum", weight: 15 },
            { value: "strawberry", weight: 20 },
            { value: "blueberry", weight: 20 },
            { value: "raspberry", weight: 20 },
          ]);
      rewards.push({ itemId: "sea-berry", count: 1 });
      rewards.push({ itemId: companionBerry, count: companionBerry === "wild-beach-plum" ? 1 : 3 });
      play("groveBerryPick");
      window.setTimeout(() => play("groveBasketFill"), 380);
    } else if (id === "herbs") {
      const itemId = postStorm && Math.random() < 0.45
        ? "rain-lily-blossom"
        : choose([
            { value: "wild-lemongrass", weight: 35 },
            { value: "coastal-beach-mint", weight: 35 },
            { value: "rosemary", weight: 30 },
          ]);
      rewards.push({ itemId, count: itemId === "rain-lily-blossom" ? 1 : 2 });
      play("groveHerbSnip");
    } else if (id === "coastal") {
      const companionPlant = choose([
        { value: "sea-parsley", weight: 60 },
        { value: "sea-lavender", weight: 40 },
      ]);
      rewards.push({ itemId: "sea-peas", count: 2 });
      rewards.push({ itemId: companionPlant, count: companionPlant === "sea-lavender" ? 1 : 2 });
      play("groveHerbSnip");
      window.setTimeout(() => play("groveBasketFill"), 380);
    } else if (id === "fruit") {
      const itemId = choose([
        { value: "pineapple", weight: 20 },
        { value: "mango", weight: 20 },
        { value: "banana", weight: 20 },
        { value: "grapes", weight: 20 },
        { value: "lemon", weight: 20 },
      ]);
      rewards.push({ itemId, count: itemId === "grapes" || itemId === "banana" ? 2 : 1 });
      play(itemId === "grapes" ? "groveBerryPick" : "groveItemPickup");
      window.setTimeout(() => play("groveBasketFill"), 380);
    } else if (id === "roots") {
      const itemId = postStorm && Math.random() < 0.35
        ? "storm-fiddlehead"
        : choose([{ value: "dune-ginger", weight: 55 }, { value: "sweet-island-cane", weight: 45 }]);
      rewards.push({ itemId, count: itemId === "sweet-island-cane" ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 2) });
      play("groveRootPull");
    } else if (id === "vegetables") {
      const itemId = choose([{ value: "carrot", weight: 25 }, { value: "potato", weight: 20 }, { value: "broccoli", weight: 20 }, { value: "cucumber", weight: 18 }, { value: "tomato", weight: 17 }]);
      rewards.push({ itemId, count: 2 });
      play("groveRootPull");
    } else if (season === "autumn") {
      rewards.push({ itemId: Math.random() < 0.75 ? "golden-island-pumpkin" : "miniature-sugar-squash", count: 1 });
      play("groveHerbSnip");
    } else if (season === "winter") {
      rewards.push({ itemId: choose([{ value: "winter-spice-bark", weight: 30 }, { value: "winterberry-holly", weight: 25 }, { value: "christmas-rose", weight: 25 }, { value: "snowdrop-flowers", weight: 20 }]), count: 1 });
      play("groveLeafRustle");
    } else if (season === "spring") {
      rewards.push({ itemId: choose([{ value: "strawberry", weight: 30 }, { value: "spring-pea-shoots", weight: 30 }, { value: "spring-edible-blossoms", weight: 25 }, { value: "snowdrop-flowers", weight: 15 }]), count: 1 });
      play("groveHerbSnip");
    } else {
      rewards.push({ itemId: choose([{ value: "watermelon", weight: 35 }, { value: "passion-fruit", weight: 35 }, { value: "summer-hibiscus", weight: 30 }]), count: 1 });
      play("groveBerryPick");
    }

    rewards.forEach(({ itemId, count }) => add(itemId, count));
    if (Math.random() < 0.22) setLeafSandReady(true);
    const names = rewards.map(({ itemId, count }) => `${count} ${ITEMS[itemId].name}`).join(" and ");
    setMessage(`Collected ${names}. It is now in your bucket and inventory.`);
    const next = { ...harvestedAt, [id]: Date.now() };
    setHarvestedAt(next);
    setNow(Date.now());
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const plantFlower = (seed: string, flower: string) => {
    if (flowerPlant || !state.inventory[seed]) return;
    if (!craft(`grove-flower-planting:${seed}`, [{ itemId: seed, count: 1 }])) return;
    const planted = { seed, flower, plantedAt: Date.now() };
    setFlowerPlant(planted);
    try { localStorage.setItem(FLOWER_BED_KEY, JSON.stringify(planted)); } catch {}
    setMessage(`Planted ${ITEMS[seed]?.name || "flower seeds"} in the flowerbed.`);
    play("groveHerbSnip");
  };

  const harvestFlower = () => {
    if (!flowerPlant || Date.now() - flowerPlant.plantedAt < flowerGrowMs(!!state.inventory["shelldon-turtle-watering-can"])) return;
    collectItem(flowerPlant.flower, { silent: true });
    play("groveHerbSnip");
    setMessage(`Harvested ${ITEMS[flowerPlant.flower]?.name || "a flower"}! It is now in your inventory.`);
    setFlowerPlant(null);
    try { localStorage.removeItem(FLOWER_BED_KEY); } catch {}
  };

  const plantMysteryHerb = () => {
    if (mysteryHerb || !state.inventory["imported-island-herb-seeds"]) return;
    if (!craft("grove-mystery-herb-plant", [{ itemId: "imported-island-herb-seeds", count: 1 }])) return;
    const planted: MysteryHerb = { result: MYSTERY_HERBS[Math.floor(Math.random() * MYSTERY_HERBS.length)], plantedAt: Date.now(), rareSeedBonus: Math.random() < 0.10 };
    setMysteryHerb(planted);
    try { localStorage.setItem(MYSTERY_HERB_KEY, JSON.stringify(planted)); } catch {}
    setMessage("Mystery island seeds planted. The plant will be revealed at harvest.");
    play("groveHerbSnip");
  };

  const harvestMysteryHerb = () => {
    if (!mysteryHerb || Date.now() - mysteryHerb.plantedAt < MYSTERY_HERB_GROW_MS) return;
    collectItem(mysteryHerb.result, { silent: true });
    if (mysteryHerb.result === "island-vanilla-orchid") collectItem("vanilla", { silent: true });
    if (mysteryHerb.rareSeedBonus) collectItem("deep-sea-seed", { silent: true });
    setMessage("Mystery revealed! You grew " + ITEMS[mysteryHerb.result].name + "! Added to inventory." + (mysteryHerb.rareSeedBonus ? " Bonus discovery: Deep-Sea Seed!" : ""));
    play("groveHerbSnip");
    setMysteryHerb(null);
    try { localStorage.removeItem(MYSTERY_HERB_KEY); } catch {}
  };

  const investigateLeafSand = () => {
    if (!leafSandReady) return;
    collectItem("sand-green-leaf", { silent: true });
    play("groveLeafRustle");
    setLeafSandReady(false);
    setMessage("You brush aside the leaves and discover Green Leaf Sand, green grains sprinkled with tiny leaves. It is now in your bucket and inventory.");
  };

  const leave = () => {
    play("groveSignTap");
    setScreen("beach");
  };

  const closeNursery = () => {
    setNurseryOpen(false);
    window.setTimeout(() => nurseryHotspotRef.current?.focus(), 0);
  };

  const tendHoneybell = () => {
    const result = advanceHoneybell();
    if (!result.ok) return;
    setMessage(result.stage === 1
      ? "You found the Golden Honeybell Seed hidden beyond the sea lavender."
      : result.stage === 2
        ? "The Golden Honeybell is planted beside the sea roses. One careful watering will help it bloom."
        : "The Golden Honeybell opens in the sunlight. The coastal bees circle down and return to their hive!");
  };

  const visitBees = () => {
    const result = visitGroveBees();
    if (!result.ok) {
      setMessage(result.minutesLeft
        ? `The bees are foraging. Visit again in about ${result.minutesLeft} minute${result.minutesLeft === 1 ? "" : "s"}.`
        : "The bees will arrive after the Golden Honeybell blooms.");
      return;
    }
    if (result.wax && result.honey) setMessage("The bees shared a jar of coastal wax and a surprise jar of honey.");
    else if (result.wax) setMessage("The bees shared today's jar of coastal wax. Their honeycomb is still filling.");
    else if (result.honey) setMessage("A golden jar of coastal honey was ready inside the hive!");
    else setMessage("The bees are still filling their honeycomb. Visit again later.");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#edf5df] pb-24">
      <section aria-label="Interactive Coconut Grove" className="relative min-h-[540px] w-full overflow-hidden bg-emerald-900 sm:min-h-[540px]">
        <Image src={SCENES.coconutGrove} alt="Tropical Coconut Grove with palms, fruit trees and garden beds" fill priority unoptimized sizes="100vw" className="object-cover object-[43%_35%] sm:object-center" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-emerald-950/30" />
        <h1 className="pointer-events-none absolute left-4 top-4 font-serif text-3xl font-bold text-white drop-shadow-lg">Coconut Grove</h1>
        {/* Seasonal plants are decorative; the existing garden hotspot handles all interaction. */}
        <div className="pointer-events-none absolute left-[62%] top-[49%] z-[5] h-[40%] w-[38%]" aria-hidden="true">
          <Image src={seasonalGardenImage} alt="" fill unoptimized sizes="(max-width: 640px) 42vw, 25vw" className="object-contain object-bottom" />
        </div>
        {/* Vegetable beds are decorative; the existing accessible hotspot handles harvesting. */}
        <div className="pointer-events-none absolute left-[18%] top-[34%] z-[5] h-[34%] w-[43%]" aria-hidden="true">
          <Image src="/images/Coconut-grove-vegetable-garden.PNG" alt="" fill unoptimized sizes="(max-width: 640px) 30vw, 20vw" className="object-contain object-bottom" />
        </div>
        {NODES.map((node) => {
          // Hotspots align with the artwork: palms upper left, berries left,
          // herb flowers center, coastal edibles lower left, fruit right,
          // roots in the foreground, seasonal patch lower right.
          const spots: Record<NodeId, { left: string; top: string; width: string; height: string }> = {
            palms: { left: "1%", top: "1%", width: "26%", height: "25%" },
            berries: { left: "1%", top: "32%", width: "26%", height: "24%" },
            herbs: { left: "27%", top: "40%", width: "24%", height: "24%" },
            coastal: { left: "2%", top: "64%", width: "31%", height: "25%" },
            fruit: { left: "54%", top: "34%", width: "25%", height: "27%" },
            roots: { left: "35%", top: "70%", width: "24%", height: "22%" },
            vegetables: { left: "18%", top: "34%", width: "43%", height: "34%" },
            seasonal: { left: "67%", top: "66%", width: "30%", height: "29%" },
          };
          const spot = spots[node.id];
          const waiting = remaining(node.id) > 0;
          return (
            <button key={node.id} type="button" title={node.title}
              style={{ left: spot.left, top: spot.top, width: spot.width, height: spot.height }}
              aria-label={`${node.title}. ${waitLabel(node.id)}. ${waiting ? "Select to check regrowth." : node.instruction}`}
              onClick={() => waiting ? setMessage(`${node.title}: ${waitLabel(node.id)}.`) : harvest(node.id)}
              className="group absolute z-10 cursor-pointer rounded-xl bg-transparent transition-colors hover:bg-white/10 focus-visible:bg-white/15 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300 active:bg-white/20">
              <span aria-hidden="true" className="pointer-events-none absolute bottom-1 left-1 rounded-full bg-emerald-950/75 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{node.title}</span>
            </button>
          );
        })}
        <button type="button" ref={beeHotspotRef} onClick={() => setBeePanelOpen(true)} aria-label="Explore Golden Honeybell and Coastal Hive" className="absolute right-[1%] top-[8%] z-10 h-[21%] w-[17%] rounded-xl bg-transparent text-transparent hover:bg-white/10 focus-visible:bg-white/15 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300"><span aria-hidden="true" className="sr-only">Beehive</span></button>
        <button type="button" ref={nurseryHotspotRef} onClick={() => state.groveNurseryAvailable ? setNurseryOpen(true) : setMessage("The Hidden Grove Nursery is resting. A new coastal storm will uncover more materials.")} aria-label={state.groveNurseryAvailable ? "Open Hidden Grove Nursery" : "Explore Hidden Grove Nursery; unavailable until the next storm"} className="absolute left-[53%] top-[7%] z-10 h-[28%] w-[27%] rounded-xl bg-transparent text-transparent hover:bg-white/10 focus-visible:bg-white/15 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300"><span aria-hidden="true" className="sr-only">Nursery</span></button>
        <button type="button" onClick={() => setMysteryHerbOpen(true)} aria-label="Open imported mystery herb planting" className="absolute left-[27%] top-[64%] z-20 min-h-11 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-950 shadow ring-2 ring-emerald-600 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300">🌱 Mystery Herbs</button>
        <button type="button" onClick={() => setFlowerBedOpen(true)} aria-label="Open Sheldon's flowerbed for planting land flower seeds" className="absolute left-[35%] top-[91%] z-20 min-h-11 rounded-lg bg-rose-100 px-3 py-2 text-sm font-bold text-rose-950 shadow ring-2 ring-rose-500 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300">🌷 Flowerbed</button>
        {leafSandReady && <button type="button" onClick={investigateLeafSand} aria-label="Collect Green Leaf Sand" className="absolute left-[31%] top-[84%] z-20 min-h-12 min-w-12 rounded-full bg-lime-100/90 text-2xl shadow-lg ring-2 ring-lime-500 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300">✨</button>}
        <button type="button" onClick={leave} className="absolute bottom-3 left-3 z-10 min-h-12 rounded-xl bg-amber-100 px-4 py-2 font-bold text-amber-950 shadow-lg ring-2 ring-amber-700">🪧 Beach</button>
      </section>
      <div className="space-y-3 px-4 py-4">
        {postStorm && (
          <p className="rounded-xl bg-sky-100 p-3 text-sm font-semibold text-sky-950 ring-1 ring-sky-300">🌦️ Post-storm growth is active: rare plants may appear and every grove patch regrows twice as fast.</p>
        )}
        <p role="status" aria-live="polite" className="rounded-xl bg-white/90 p-3 text-sm font-medium text-emerald-950 shadow-sm ring-1 ring-emerald-200">{message}</p>

        <p className="text-sm text-emerald-950">Select plants in the garden to harvest or check regrowth. The seasonal patch and vegetable garden produce crops all year. Recipes and cooking are in the Workshop Kitchen’s Shoreline Cookbook; completed recipes appear in the Explorer’s Notebook.</p>

        <button type="button" onClick={leave} className="min-h-12 w-full rounded-xl bg-amber-800 px-4 py-3 font-bold text-white shadow active:bg-amber-900">🪧 Follow the “To Shore” Sign</button>
      </div>
      {mysteryHerbOpen && (
        <section role="dialog" aria-modal="true" aria-labelledby="mystery-herb-title" className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-3">
          <div className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-emerald-50 p-5 text-emerald-950 shadow-2xl">
            <h2 id="mystery-herb-title" className="font-serif text-2xl font-bold">Imported Mystery Herbs</h2>
            <p className="my-2">Plant Shelby's imported seeds. The mystery plant grows for 45 minutes. Regular herbs can still be harvested.</p>
            {mysteryHerb ? (
              <div className="space-y-3">
                <p role="status">{now - mysteryHerb.plantedAt >= MYSTERY_HERB_GROW_MS ? "Unknown Island Plant — ready to reveal!" : "Unknown Island Plant — about " + Math.ceil((MYSTERY_HERB_GROW_MS - (now - mysteryHerb.plantedAt)) / 60000) + " minutes remaining"}</p>
                <button type="button" disabled={now - mysteryHerb.plantedAt < MYSTERY_HERB_GROW_MS} onClick={harvestMysteryHerb} className="min-h-11 rounded-lg bg-emerald-800 px-4 py-2 font-bold text-white disabled:opacity-50">Reveal and Harvest</button>
              </div>
            ) : (
              <button type="button" disabled={!state.inventory["imported-island-herb-seeds"]} onClick={plantMysteryHerb} className="min-h-11 rounded-lg bg-white p-3 font-bold ring-1 ring-emerald-300 disabled:opacity-50">Plant Mystery Packet — owned: {state.inventory["imported-island-herb-seeds"] || 0}</button>
            )}
            <button type="button" onClick={() => setMysteryHerbOpen(false)} className="mt-4 block min-h-11 rounded-lg bg-emerald-900 px-4 py-2 font-bold text-white">Return to Coconut Grove</button>
          </div>
        </section>
      )}
      {flowerBedOpen && (
        <section role="dialog" aria-modal="true" aria-labelledby="grove-flowerbed-heading" className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-3">
          <div className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-rose-50 p-5 shadow-2xl">
            <h2 id="grove-flowerbed-heading" className="font-serif text-2xl font-bold text-rose-950">Sheldon's Flowerbed</h2>
            <p className="my-2 text-sm text-rose-900">Plant one packet of land flower seeds. Flowers grow in {state.inventory["shelldon-turtle-watering-can"] ? "20" : "30"} minutes, even while you explore elsewhere.</p>
            {flowerPlant ? (
              <div className="space-y-3">
                <p role="status">{ITEMS[flowerPlant.flower]?.name} — {now - flowerPlant.plantedAt >= flowerGrowMs(!!state.inventory["shelldon-turtle-watering-can"]) ? "Ready to harvest" : `Growing, about ${Math.ceil((flowerGrowMs(!!state.inventory["shelldon-turtle-watering-can"]) - (now - flowerPlant.plantedAt)) / 60_000)} minutes remaining`}</p>
                <button type="button" disabled={now - flowerPlant.plantedAt < flowerGrowMs(!!state.inventory["shelldon-turtle-watering-can"])} onClick={harvestFlower} className="min-h-11 rounded-lg bg-emerald-800 px-4 py-2 font-bold text-white disabled:opacity-50">Harvest Flower</button>
              </div>
            ) : (
              <div className="space-y-2">
                {FLOWERS.map(({ seed, flower }) => (
                  <button key={seed} type="button" disabled={!state.inventory[seed]} onClick={() => plantFlower(seed, flower)} className="block min-h-11 w-full rounded-lg bg-white p-3 text-left font-semibold text-rose-950 ring-1 ring-rose-200 disabled:opacity-50">
                    Plant {ITEMS[seed]?.name} — owned: {state.inventory[seed] || 0}
                  </button>
                ))}
              </div>
            )}
            <button type="button" onClick={() => setFlowerBedOpen(false)} className="mt-4 min-h-11 rounded-lg bg-rose-900 px-4 py-2 font-bold text-white">Return to Coconut Grove</button>
          </div>
        </section>
      )}
      {beePanelOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="honeybell-heading" className="max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-amber-50 p-3 shadow-2xl">
            <button type="button" onClick={() => { setBeePanelOpen(false); window.setTimeout(() => beeHotspotRef.current?.focus(), 0); }} className="mb-3 min-h-12 rounded-xl bg-amber-900 px-4 py-2 font-bold text-white">← Back to Coconut Grove</button>
        <section aria-labelledby="honeybell-heading" className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-rose-50 p-5 shadow-md ring-1 ring-amber-300">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Frosted Bottle Secret</p>
          <h2 id="honeybell-heading" className="mt-1 font-serif text-xl font-bold text-amber-950">Golden Honeybell &amp; Coastal Hive</h2>
          {!beeClueFound ? (
            <div className="mt-4 rounded-2xl bg-slate-100 p-5 text-center ring-1 ring-slate-300">
              <span aria-hidden="true" className="text-4xl">🔒</span>
              <p className="mt-2 font-bold text-slate-800">Flower and hive undiscovered</p>
              <p className="mt-1 text-sm text-slate-600">A message inside a sealed frosted bottle may reveal what the coastal bees are waiting for.</p>
            </div>
          ) : !beesUnlocked ? (
            <div className="mt-4 text-center">
              <div role="img" aria-label={state.honeybellStage === 0 ? "Sea lavender hiding a rare seed" : state.honeybellStage === 1 ? "A Golden Honeybell seed ready to plant" : "A planted Golden Honeybell sprout waiting to bloom"} className="mx-auto flex h-36 max-w-sm items-end justify-center rounded-2xl bg-gradient-to-b from-sky-100 to-emerald-200 pb-4 shadow-inner ring-1 ring-emerald-300">
                <span aria-hidden="true" className={`text-7xl ${state.honeybellStage === 2 ? "honeybell-sprout" : ""}`}>
                  {state.honeybellStage === 0 ? "🪻" : state.honeybellStage === 1 ? "🌰" : "🌱"}
                </span>
              </div>
              <p className="mt-3 text-sm text-amber-900">
                {state.honeybellStage === 0
                  ? "The bottle message points beyond the sea lavender. Search gently for the hidden seed."
                  : state.honeybellStage === 1
                    ? "Plant the seed beside the sea roses, where the bottle sender said the bees once gathered."
                    : "The roots have taken hold. Water the sprout and let the Honeybell open."}
              </p>
              <button type="button" onClick={tendHoneybell} className="mt-3 min-h-12 w-full rounded-xl bg-amber-700 px-4 py-3 font-bold text-white shadow active:bg-amber-800">
                {state.honeybellStage === 0 ? "Search Beyond the Sea Lavender" : state.honeybellStage === 1 ? "Plant the Golden Honeybell" : "Water and Grow the Honeybell"}
              </button>
              <p className="mt-2 text-xs font-semibold text-amber-700">Growth: {state.honeybellStage} of 3 steps</p>
            </div>
          ) : (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={visitBees}
                disabled={beeVisitRemaining > 0}
                aria-describedby="bee-rewards-description bee-visit-status"
                aria-label={`Visit the blooming Golden Honeybell and coastal bee hive. ${dailyWaxReady ? "Today's wax is ready." : "Today's wax has been collected."}`}
                className="group relative mx-auto block h-56 w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-b from-sky-200 via-amber-100 to-emerald-300 shadow-md ring-2 ring-amber-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-65"
              >
                <span aria-hidden="true" className="absolute bottom-3 left-1/2 -translate-x-1/2 text-8xl honeybell-bloom">🌼</span>
                <span aria-hidden="true" className="honeybell-hive" />
                <span aria-hidden="true" className="honeybell-bee honeybell-bee-one">🐝</span>
                <span aria-hidden="true" className="honeybell-bee honeybell-bee-two">🐝</span>
                <span aria-hidden="true" className="honeybell-bee honeybell-bee-three">🐝</span>
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-amber-950 shadow">
                  {beeVisitRemaining > 0 ? `Bees foraging · ${beeVisitMinutes}m` : "Visit the Flower & Hive"}
                </span>
              </button>
              <p id="bee-rewards-description" className="mt-3 text-sm text-amber-900">The first available visit each day gives one jar of wax. Honey is not guaranteed, but it will appear by the third visit without a honey reward.</p>
              <p id="bee-visit-status" className="mt-2 text-xs font-semibold text-amber-700">{dailyWaxReady ? "Daily wax ready" : "Today’s wax collected"} · Hive visits: {state.beeVisits}</p>
            </div>
          )}
        </section>


          </div>
        </div>
      )}
      <GroveCoffeePlant />
      {nurseryOpen && <HiddenGroveNursery onClose={closeNursery} />}
    </div>
  );
}
