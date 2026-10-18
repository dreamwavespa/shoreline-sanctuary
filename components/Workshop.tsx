"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { SCENES } from "@/lib/media";
import { KITCHEN_RECIPES, JEWELRY_RECIPES, DECOR_RECIPES, RAFT_RECIPE, SAND_ART_RECIPES } from "@/lib/recipes";
import Notebook from "./Notebook";
import WindChimeWorkshop from "./WindChimeWorkshop";
import PicnicPacking from "./PicnicPacking";
import JewelryCounter from "./JewelryCounter";
import CustomSandArtStudio from "./CustomSandArtStudio";
import OlliInkStudio from "./OlliInkStudio";
import ShellPaintingStudio from "./ShellPaintingStudio";

const WIND_CHIME_COST = [
  { itemId: "glass-green", count: 2 },
  { itemId: "glass-blue", count: 1 },
  { itemId: "raw-driftwood-arch", count: 1 },
];

const ROWBOAT_COST = [
  { itemId: "raw-driftwood-planks", count: 1 },
  { itemId: "raw-driftwood-arch", count: 3 },
  { itemId: "raw-barnacle-wood", count: 1 },
];

const LANTERN_COST = [
  { itemId: "glass-amber", count: 2 },
  { itemId: "glass-white", count: 1 },
];

const FISH_GROTTO_COST = [
  { itemId: "glass-teal", count: 2 },
  { itemId: "glass-purple", count: 1 },
];

const BOO_TOOL_SET_COST = [
  { itemId: "trash-plastic", count: 3 },
  { itemId: "shiny-soda-tab", count: 2 },
];

function CostRow({ cost }: { cost: { itemId: string; count: number }[] }) {
  const { state } = useGame();
  return (
    <div className="flex gap-3 mb-4 flex-wrap">
      {cost.map((c) => {
        const def = ITEMS[c.itemId];
        const have = state.inventory[c.itemId] || 0;
        const ok = have >= c.count;
        return (
          <div key={c.itemId} className={`flex flex-col items-center rounded-xl p-2 ring-1 ${ok ? "ring-emerald-300 bg-emerald-50" : "ring-red-200 bg-red-50"}`}>
            {def.isEmoji ? (
              <span className="text-2xl" aria-hidden="true">{def.icon}</span>
            ) : (
              <Image src={def.icon} alt="" width={32} height={32} unoptimized className="object-contain" />
            )}
            <span className="text-[10px] mt-1 text-amber-800" aria-hidden="true">{have}/{c.count}</span>
            <span className="sr-only">{def.name}: {have} of {c.count} available.</span>
          </div>
        );
      })}
    </div>
  );
}

function RecipeCard({
  title,
  description,
  cost,
  recipeId,
  locked,
  lockedMessage,
  accent = "amber",
  repeatable = false,
  imageSrc,
  imageAlt,
}: {
  title: string;
  description: string;
  cost: { itemId: string; count: number }[];
  recipeId: string;
  locked?: boolean;
  lockedMessage?: string;
  accent?: string;
  repeatable?: boolean;
  imageSrc?: string;
  imageAlt?: string;
}) {
  const { state, craft, hasEnough } = useGame();
  const [announcement, setAnnouncement] = useState("");
  const canCraft = hasEnough(cost);
  const alreadyCrafted = state.crafted.includes(recipeId);

  const handleCraft = () => {
    if (!craft(recipeId, cost)) return;
    const craftedItem = ITEMS[recipeId];
    const nextCount = craftedItem ? (state.inventory[recipeId] || 0) + 1 : 1;
    setAnnouncement(craftedItem ? `${craftedItem.name} crafted. ${nextCount} now in inventory.` : `${title} crafted.`);
  };

  if (locked) {
    return (
      <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-amber-200 mb-4 text-center">
        <p className="text-sm text-amber-700">{lockedMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-amber-200 mb-4">
      <h2 className="text-lg font-bold text-amber-900 mb-1">{title}</h2>
      <p className="text-sm text-amber-700 mb-3">{description}</p>
      {imageSrc && (
        <div className="relative mb-4 h-48 overflow-hidden rounded-2xl bg-amber-50 shadow-inner ring-1 ring-amber-200">
          <Image src={imageSrc} alt={imageAlt || `Finished ${title}`} fill unoptimized sizes="(max-width: 640px) 100vw, 640px" className="object-cover" />
        </div>
      )}
      <CostRow cost={cost} />
      <button
        type="button"
        disabled={!canCraft || (alreadyCrafted && !repeatable)}
        onClick={handleCraft}
        className="w-full py-3 rounded-xl font-semibold text-white transition disabled:bg-amber-200 disabled:text-amber-500 bg-teal-600 active:bg-teal-700 shadow"
      >
        {alreadyCrafted && !repeatable ? "Already Crafted ✓" : canCraft ? (alreadyCrafted ? "Craft Again" : "Craft") : "Need More Materials"}
      </button>
      <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
    </div>
  );
}

type FoodVisualDef =
  | { kind: "scene"; scene: keyof typeof SCENES; alt: string }
  | { kind: "grove"; position: string; alt: string }
  | { kind: "illustration"; main: string; detail: string; gradient: string; alt: string };

const FOOD_VISUALS: Record<string, FoodVisualDef> = {
  "golden-pumpkin-bisque": { kind: "grove", position: "0% 36%", alt: "Golden pumpkin bisque served in a coconut bowl with lemongrass" },
  "sea-rose-pumpkin-tart": { kind: "grove", position: "33.33% 36%", alt: "Golden pumpkin tart topped with pink sea roses and dark coastal berries" },
  "island-spiced-gingerbread": { kind: "grove", position: "66.66% 36%", alt: "Island spiced gingerbread cookies shaped like a shell, coral branch, and starfish" },
  "coastal-spiced-cocoa": { kind: "grove", position: "100% 36%", alt: "Frothy coastal spiced cocoa in a blue ceramic mug topped with fresh mint" },
  "dry-sugar-berries": { kind: "illustration", main: "🍇", detail: "☀️", gradient: "from-violet-200 via-rose-100 to-amber-100", alt: "A bowl of sun-dried purple sugar berries" },
  "coconut-cream": { kind: "illustration", main: "🥥", detail: "🥄", gradient: "from-cyan-100 via-white to-amber-100", alt: "Rich white coconut cream served in a polished coconut shell with a spoon" },
  "beach-plum-jelly": { kind: "scene", scene: "beachPlumJelly", alt: "A finished jar of glossy purple Beach Plum Jelly" },
  "sea-rose-milk": { kind: "scene", scene: "roseBowl", alt: "A finished bowl of soothing Sea-Rose Milk decorated with pink petals" },
  "seaweed-chips": { kind: "illustration", main: "🥬", detail: "🧂", gradient: "from-emerald-200 via-lime-100 to-amber-100", alt: "A ceramic bowl filled with crisp green seaweed chips and a pinch of sea salt" },
  "campfire-marshmallow": { kind: "illustration", main: "🍡", detail: "🔥", gradient: "from-orange-200 via-rose-100 to-indigo-100", alt: "A golden campfire marshmallow toasted on a skewer above glowing coals" },
  "sea-lettuce-wrap": { kind: "illustration", main: "🌯", detail: "🥬", gradient: "from-teal-200 via-emerald-100 to-amber-100", alt: "A finished sea lettuce garden wrap on a coastal ceramic plate" },
  "sweet-sugar-berry-tea": { kind: "illustration", main: "🫖", detail: "🍇", gradient: "from-rose-200 via-violet-100 to-amber-100", alt: "A rosy pot of sweet sugar berry tea with dried purple berries" },
  "lemon-tea": { kind: "illustration", main: "🍵", detail: "🍋", gradient: "from-yellow-100 via-amber-50 to-emerald-100", alt: "A warm cup of lemon tea with a fresh lemon slice" },
  "mint-tea": { kind: "illustration", main: "🍵", detail: "🌿", gradient: "from-emerald-200 via-teal-100 to-amber-50", alt: "A warm cup of mint tea with fresh coastal mint leaves" },
};

function FoodVisual({ recipeId }: { recipeId: string }) {
  const visual = FOOD_VISUALS[recipeId];
  if (!visual) return null;

  if (visual.kind === "scene") {
    return (
      <div className="relative mt-4 h-44 overflow-hidden rounded-2xl bg-amber-100 shadow-inner ring-1 ring-amber-200" role="img" aria-label={visual.alt}>
        <Image src={SCENES[visual.scene]} alt="" fill unoptimized sizes="(max-width: 640px) 100vw, 640px" className="object-cover" />
      </div>
    );
  }

  if (visual.kind === "grove") {
    return (
      <div
        role="img"
        aria-label={visual.alt}
        className="mt-4 h-44 rounded-2xl bg-[#f5ead0] bg-no-repeat shadow-inner ring-1 ring-amber-200"
        style={{
          backgroundImage: `url(${SCENES.coconutGroveRecipes})`,
          backgroundPosition: visual.position,
          backgroundSize: "400% auto",
        }}
      />
    );
  }

  return (
    <div role="img" aria-label={visual.alt} className={`relative mt-4 flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${visual.gradient} shadow-inner ring-1 ring-amber-200`}>
      <span aria-hidden="true" className="absolute bottom-5 h-8 w-40 rounded-[50%] bg-white/75 shadow-md ring-1 ring-amber-200" />
      <span aria-hidden="true" className="relative z-10 text-7xl drop-shadow-lg">{visual.main}</span>
      <span aria-hidden="true" className="absolute right-[25%] top-6 rotate-12 text-3xl drop-shadow">{visual.detail}</span>
      <span aria-hidden="true" className="absolute left-5 top-4 text-xl opacity-60">✨</span>
    </div>
  );
}

function RoseMilkBottling() {
  const { state, bottleRoseMilk } = useGame();
  const [phase, setPhase] = useState<"idle" | "filling" | "sealed">("idle");
  const [announcement, setAnnouncement] = useState("");
  const timers = useRef<number[]>([]);
  const looseMilk = state.inventory["food-sea-rose-milk"] || 0;
  const bottledMilk = state.inventory["bottled-rose-milk"] || 0;

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const handleBottle = () => {
    if (phase !== "idle" || !bottleRoseMilk()) {
      setAnnouncement("Cook a serving of Soothing Sea-Rose Milk before filling a bottle.");
      return;
    }
    setPhase("filling");
    setAnnouncement("Pouring one serving of Sea-Rose Milk into the old-fashioned bottle.");
    timers.current.push(window.setTimeout(() => setPhase("sealed"), 1250));
    timers.current.push(window.setTimeout(() => {
      setPhase("idle");
      setAnnouncement("Bottled Rose Milk is sealed and ready to sell to Seaweed for 7 Sand Dollars.");
    }, 2350));
  };

  return (
    <section aria-labelledby="rose-milk-bottling-heading" className="mt-4 rounded-2xl bg-rose-50 p-4 text-center ring-1 ring-rose-200">
      <h3 id="rose-milk-bottling-heading" className="font-serif text-lg font-bold text-rose-950">Bottle It for Seaweed</h3>
      <p id="rose-milk-bottling-help" className="mt-1 text-sm text-rose-800">
        Activate the illustrated milk bottle to package one pantry serving. Seaweed pays 7 Sand Dollars for each sealed bottle.
      </p>
      <button
        type="button"
        onClick={handleBottle}
        disabled={looseMilk < 1 || phase !== "idle"}
        aria-describedby="rose-milk-bottling-help rose-milk-bottling-counts"
        aria-label={`Bottle one serving of Soothing Sea-Rose Milk for Seaweed. ${looseMilk} unbottled serving${looseMilk === 1 ? "" : "s"} available.`}
        className={`rose-milk-bottle-button rose-milk-bottle--${phase} mx-auto mt-3 block w-full max-w-sm overflow-hidden rounded-2xl bg-[#fffdf5] shadow-md ring-2 ring-rose-300 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-55`}
      >
        <span className="relative block aspect-[16/9] overflow-hidden" aria-hidden="true">
          <Image src={SCENES.roseMilkBottle} alt="" fill unoptimized sizes="(max-width: 640px) 100vw, 384px" className="rose-milk-bottle-base object-cover" />
          <span className="rose-milk-bottle-fill absolute inset-0">
            <Image src={SCENES.roseMilkBottle} alt="" fill unoptimized sizes="(max-width: 640px) 100vw, 384px" className="object-cover" />
          </span>
          <span className="rose-milk-bottle-sparkles absolute inset-0 flex items-center justify-center text-4xl">✨</span>
        </span>
        <span className="block bg-rose-700 px-4 py-3 font-bold text-white">
          {phase === "filling" ? "Pouring Rose Milk…" : phase === "sealed" ? "Bottle Sealed!" : looseMilk > 0 ? "Bottle One for Seaweed" : "Cook Rose Milk First"}
        </span>
      </button>
      <p id="rose-milk-bottling-counts" className="mt-3 text-xs font-semibold text-rose-800">
        Pantry servings: {looseMilk} · Sealed bottles ready to sell: {bottledMilk}
      </p>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
    </section>
  );
}

function RecipeThumbnail({ recipeId }: { recipeId: string }) {
  const visual = FOOD_VISUALS[recipeId];
  const recipe = KITCHEN_RECIPES.find((entry) => entry.id === recipeId);
  const fallback = ITEMS[recipe?.outputItemId || ""]?.icon || "🍽️";
  return (
    <span aria-hidden="true" className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-100 text-3xl ring-1 ring-amber-200">
      {visual?.kind === "scene" ? <Image src={SCENES[visual.scene]} alt="" fill unoptimized sizes="64px" className="object-cover" />
        : visual?.kind === "grove" ? <span className="h-full w-full bg-no-repeat" style={{ backgroundImage: `url(${SCENES.coconutGroveRecipes})`, backgroundPosition: visual.position, backgroundSize: "400% auto" }} />
        : <span>{visual?.kind === "illustration" ? visual.main : fallback}</span>}
    </span>
  );
}

function KitchenRecipeRewards() {
  const { state } = useGame();
  const baby = ["cadence-warm-rose-milk", "cadence-sea-pea-puree", "cadence-sun-berry-mash", "cadence-teething-kelp-cookies"];
  const smoothies = ["strawberry-banana", "tropical-pineapple", "mixed-berry", "coastal-berry-mint"];
  const groups = [
    { name: "Baby Food", reward: "Seashell Baby Bottle", keys: baby.map((id) => `recipe:${id}`) },
    { name: "Smoothies", reward: "Coastal Ice Maker", keys: smoothies.map((id) => `smoothie:${id}`) },
  ];
  return (
    <section aria-labelledby="kitchen-rewards-heading" className="mt-4 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-300">
      <h3 id="kitchen-rewards-heading" className="font-serif text-xl font-bold text-amber-950">Kitchen Collection Rewards</h3>
      <p className="mt-1 text-sm text-amber-900">Prepare each recipe once to permanently unlock its collection reward. Ingredients are still required each time you cook.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {groups.map((group) => {
          const completed = group.keys.filter((key) => state.notebookDiscovered[key]).length;
          const unlocked = completed === group.keys.length;
          return <div key={group.name} className="rounded-xl bg-white p-3 ring-1 ring-amber-200">
            <h4 className="font-bold text-teal-950">{group.name}</h4>
            <p className="text-sm text-teal-900">{completed} of {group.keys.length} recipes prepared</p>
            <p className="mt-1 text-sm font-semibold text-amber-950">{unlocked ? "Unlocked: " : "Reward: "}{group.reward}</p>
            <p className="text-xs text-slate-700">{unlocked ? "Permanently earned!" : "Complete the collection to unlock."}</p>
          </div>;
        })}
      </div>
    </section>
  );
}

function KitchenRefrigerator({ onClose }: { onClose: () => void }) {
  const { state } = useGame();
  const [section, setSection] = useState<"prepared" | "fresh" | "supplies">("prepared");
  const preparedIds = new Set(KITCHEN_RECIPES.map((recipe) => recipe.outputItemId));
  const cookingIds = new Set(KITCHEN_RECIPES.flatMap((recipe) => recipe.cost.map((ingredient) => ingredient.itemId)));
  const entries = Object.entries(state.inventory)
    .filter(([id, count]) => count > 0 && id !== "orange-glaze" && ITEMS[id] && (ITEMS[id].category === "food" || cookingIds.has(id)))
    .filter(([id]) => section === "prepared" ? preparedIds.has(id) : section === "fresh" ? !preparedIds.has(id) && /fruit|berry|coconut|pumpkin|lettuce|mint|lemon|herb|fish|flower|milk/i.test(id + " " + ITEMS[id].name) : !preparedIds.has(id) && !/fruit|berry|coconut|pumpkin|lettuce|mint|lemon|herb|fish|flower|milk/i.test(id + " " + ITEMS[id].name))
    .sort(([a], [b]) => ITEMS[a].name.localeCompare(ITEMS[b].name));
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/75 p-3" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="kitchen-fridge-heading" className="flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-sky-50 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-sky-200 p-4">
          <h2 id="kitchen-fridge-heading" className="font-serif text-xl font-bold text-teal-950">🧊 Cottage Refrigerator</h2>
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl bg-teal-900 px-4 font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400">Close Refrigerator</button>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-sky-200 p-3" aria-label="Refrigerator categories">
          {([{ id: "prepared", label: "Prepared Foods" }, { id: "fresh", label: "Fresh Ingredients" }, { id: "supplies", label: "Cooking Supplies" }] as const).map((tab) => (
            <button key={tab.id} type="button" aria-pressed={section === tab.id} onClick={() => setSection(tab.id)} className={`min-h-11 rounded-xl px-3 py-2 text-sm font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 ${section === tab.id ? "bg-teal-900 text-white" : "bg-white text-teal-950 ring-1 ring-teal-200"}`}>{tab.label}</button>
          ))}
        </div>
        <div className="overflow-y-auto p-4">
          <p className="mb-3 text-sm text-teal-900">Showing your current inventory. Items remain available for cooking and other activities.</p>
          {entries.length === 0 ? <p className="rounded-xl bg-white p-4 text-teal-900">Nothing in this section yet. Gather ingredients or prepare recipes to fill your refrigerator.</p> : (
            <ul className="space-y-2">
              {entries.map(([id, count]) => <li key={id} className="flex items-center gap-3 rounded-xl bg-white p-3 text-teal-950 ring-1 ring-sky-200">
                <span aria-hidden="true" className="text-2xl">{ITEMS[id].isEmoji ? ITEMS[id].icon : "🍽️"}</span>
                <span className="flex-1 font-medium">{ITEMS[id].name}</span>
                <span className="font-bold" aria-label={`Quantity ${count}`}>×{count}</span>
              </li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ShorelineCookbook() {
  const { play } = useGame();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const selectedRecipe = KITCHEN_RECIPES.find((recipe) => recipe.id === selectedRecipeId);
  return (
    <section aria-labelledby="shoreline-cookbook-heading" className="mb-5 rounded-2xl bg-amber-50 p-4 shadow-md ring-1 ring-amber-300">
      <h2 id="shoreline-cookbook-heading" tabIndex={-1} className="font-serif text-2xl font-bold text-amber-950">📖 The Shoreline Cookbook</h2>
      <p className="mt-1 text-sm text-amber-900">Open a recipe card to check ingredients and prepare a dish. Recipes can be made again whenever ingredients are available.</p>
      {selectedRecipe ? (
        <div className="mt-4">
          <button type="button" onClick={() => { play("kitchenPageTurn", 0.4); setSelectedRecipeId(null); }} className="mb-3 min-h-12 rounded-xl bg-teal-800 px-4 py-2 font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400">← Back to Recipe Book</button>
          <CookCard recipe={selectedRecipe} />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {KITCHEN_RECIPES.map((recipe) => (
            <button key={recipe.id} type="button" onClick={() => { play("kitchenPageTurn", 0.4); setSelectedRecipeId(recipe.id); }}
              aria-label={`Open recipe card for ${recipe.name}, ${recipe.season}`}
              className="min-h-20 rounded-xl border-2 border-amber-200 bg-white p-3 text-left shadow-sm hover:bg-amber-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-700">
              <span className="flex items-center gap-3">
                <RecipeThumbnail recipeId={recipe.id} />
                <span className="min-w-0">
                  <span className="block font-serif text-base font-bold text-amber-950">{recipe.name}</span>
                  <span className="mt-1 block text-xs text-amber-800">{recipe.season} · {recipe.station}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function CookCard({ recipe }: { recipe: (typeof KITCHEN_RECIPES)[number] }) {
  const { state, cook, hasEnough } = useGame();
  const canCook = hasEnough(recipe.cost);
  const madeCount = state.inventory[recipe.outputItemId] || 0;
  const output = ITEMS[recipe.outputItemId];
  const headingId = `recipe-${recipe.id}`;

  return (
    <article
      aria-labelledby={headingId}
      className="relative mb-5 overflow-hidden rounded-2xl border-2 border-amber-300 bg-[#fff9e8] p-5 shadow-md"
    >
      <div aria-hidden="true" className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-teal-500 via-rose-300 to-amber-400" />
      <div className="flex items-start gap-3 pt-1">
        <div aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-3xl shadow-sm ring-1 ring-amber-200">
          {output?.isEmoji ? output.icon : "🍽️"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">Recipe Card</p>
          <h2 id={headingId} className="font-serif text-xl font-bold leading-tight text-amber-950">{recipe.name}</h2>
          <p className="mt-1 text-xs font-semibold text-amber-700">{recipe.station} · {recipe.season}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-amber-900">{recipe.description}</p>

      <FoodVisual recipeId={recipe.id} />

      <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-amber-800">Ingredients</h3>
      <ul className="mt-2 space-y-2">
        {recipe.cost.map((ingredient) => {
          const def = ITEMS[ingredient.itemId];
          const have = state.inventory[ingredient.itemId] || 0;
          const enough = have >= ingredient.count;
          return (
            <li key={ingredient.itemId} className={`flex items-center gap-3 rounded-xl px-3 py-2 ring-1 ${enough ? "bg-emerald-50 text-emerald-950 ring-emerald-200" : "bg-rose-50 text-rose-950 ring-rose-200"}`}>
              <span aria-hidden="true" className="text-xl">{def.isEmoji ? def.icon : "•"}</span>
              <span className="flex-1 text-sm font-medium">{def.name}</span>
              <span className="text-xs font-bold" aria-label={`${have} available, ${ingredient.count} needed`}>{have}/{ingredient.count}</span>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        disabled={!canCook}
        onClick={() => { if (!hasEnough(recipe.cost)) return; cook(recipe.cost, recipe.outputItemId, recipe.outputCount || 1); }}
        className="mt-4 min-h-12 w-full rounded-xl bg-orange-600 py-3 font-bold text-white shadow transition disabled:bg-orange-200 disabled:text-orange-600 active:bg-orange-700"
      >
        {canCook ? `🍳 Cook ${recipe.name}` : "Need More Ingredients"}
      </button>
      <p className="mt-2 text-center text-xs font-medium text-amber-700">In pantry: {madeCount}</p>
      {recipe.id === "sea-rose-milk" && <RoseMilkBottling />}
    </article>
  );
}

type SandArtRecipe = (typeof SAND_ART_RECIPES)[number];
type SandColor = "apricot" | "pink" | "teal" | "white";

const SAND_COLORS: Record<SandColor, { fill: string; name: string }> = {
  apricot: { fill: "#f2a45f", name: "apricot" },
  pink: { fill: "#e86f9f", name: "pink" },
  teal: { fill: "#159b9a", name: "teal" },
  white: { fill: "#f8fafc", name: "snow-white" },
};

const SAND_ART_LAYERS: Record<string, SandColor[]> = {
  "sunset-shoreline": ["apricot", "pink", "apricot", "pink"],
  "subaquatic-sandbar": ["teal", "apricot", "teal", "teal"],
  "legendary-tidepool": ["pink", "teal", "pink", "teal"],
  "star-wish": ["teal", "white", "pink", "white"],
  "beach-bottle": ["white", "white", "pink", "white"],
};

function BottleVisual({ recipe, filledLayers, size = "large" }: { recipe: SandArtRecipe; filledLayers: number; size?: "large" | "small" }) {
  const layers = SAND_ART_LAYERS[recipe.id] || [];
  const shownLayers = layers.slice(0, filledLayers);
  const hasSparkles = recipe.cost.some((item) => item.itemId === "pearl-silver" || item.itemId === "firefly-jar");
  const layerDescription = shownLayers.length
    ? `${shownLayers.map((color) => SAND_COLORS[color].name).join(", ")} sand from bottom to top`
    : "empty";
  const label = `${recipe.name} bottle, ${filledLayers} of ${layers.length} layers filled: ${layerDescription}.`;
  const dimensions = size === "large" ? "w-44 h-64" : "w-24 h-36";

  return (
    <div role="img" aria-label={label} className={`${dimensions} mx-auto`}>
      <svg viewBox="0 0 160 260" aria-hidden="true" focusable="false" className="w-full h-full drop-shadow-lg">
        <defs>
          <clipPath id={`bottle-${recipe.id}-${size}`}>
            <path d="M61 18h38v42c0 8 6 13 15 20 10 8 16 19 16 32v112c0 12-9 21-21 21H51c-12 0-21-9-21-21V112c0-13 6-24 16-32 9-7 15-12 15-20V18Z" />
          </clipPath>
          <linearGradient id={`glass-${recipe.id}-${size}`} x1="0" x2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.58" />
            <stop offset="0.45" stopColor="#dff8f7" stopOpacity="0.12" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#bottle-${recipe.id}-${size})`}>
          <rect x="30" y="80" width="100" height="165" fill="#f7ffff" fillOpacity="0.45" />
          {shownLayers.map((color, index) => {
            const layerHeight = 41;
            const y = 245 - (index + 1) * layerHeight;
            return (
              <rect
                key={`${color}-${index}`}
                x="28"
                y={y}
                width="104"
                height={layerHeight + 1}
                fill={SAND_COLORS[color].fill}
                className="transition-all duration-500"
              />
            );
          })}
          {hasSparkles && filledLayers > 0 && (
            <g fill="#fffbea" opacity="0.95">
              <circle cx="54" cy="221" r="2.2" />
              <circle cx="94" cy="198" r="1.8" />
              <circle cx="72" cy="177" r="2" />
              <circle cx="108" cy="154" r="2.1" />
              <circle cx="48" cy="132" r="1.7" />
              <circle cx="88" cy="105" r="2.2" />
            </g>
          )}
          <path d="M43 25h18v37c0 13-9 18-17 26-8 7-11 16-11 29v105c0 9 5 15 12 19" fill="none" stroke="#fff" strokeOpacity="0.65" strokeWidth="6" />
          <path d="M61 18h38v42c0 8 6 13 15 20 10 8 16 19 16 32v112c0 12-9 21-21 21H51c-12 0-21-9-21-21V112c0-13 6-24 16-32 9-7 15-12 15-20V18Z" fill={`url(#glass-${recipe.id}-${size})`} />
        </g>

        <path d="M61 18h38v42c0 8 6 13 15 20 10 8 16 19 16 32v112c0 12-9 21-21 21H51c-12 0-21-9-21-21V112c0-13 6-24 16-32 9-7 15-12 15-20V18Z" fill="none" stroke="#4a7779" strokeWidth="4" />
        <rect x="57" y="13" width="46" height="13" rx="5" fill="#b88b55" stroke="#77552f" strokeWidth="3" />
      </svg>
    </div>
  );
}

function SandArtStudio() {
  const { state, cook, hasEnough } = useGame();
  const [selectedId, setSelectedId] = useState(SAND_ART_RECIPES[0].id);
  const [filledLayers, setFilledLayers] = useState(0);
  const [isFilling, setIsFilling] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const selectedRecipe = SAND_ART_RECIPES.find((recipe) => recipe.id === selectedId) || SAND_ART_RECIPES[0];
  const selectedLayers = useMemo(() => SAND_ART_LAYERS[selectedRecipe.id] || [], [selectedRecipe.id]);
  const goldenWishLocked = selectedRecipe.id === "golden-star-wish" && (state.inventory["golden-feather"] || 0) < 1;
  const canMake = hasEnough(selectedRecipe.cost) && !goldenWishLocked;
  const completedBottles = SAND_ART_RECIPES.filter((recipe) => (state.inventory[recipe.outputItemId] || 0) > 0);

  useEffect(() => {
    if (!isFilling) return;

    if (filledLayers < selectedLayers.length) {
      const timer = window.setTimeout(() => {
        const nextLayer = filledLayers + 1;
        const color = selectedLayers[filledLayers];
        setFilledLayers(nextLayer);
        setAnnouncement(`${SAND_COLORS[color].name} sand added. ${selectedRecipe.name} bottle is ${nextLayer} of ${selectedLayers.length} layers full.`);
      }, 550);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      cook(selectedRecipe.cost, selectedRecipe.outputItemId, 1);
      setIsFilling(false);
      setAnnouncement(`${selectedRecipe.name} complete. It has been added to your sand art gallery.`);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [cook, filledLayers, isFilling, selectedLayers, selectedRecipe]);

  const chooseRecipe = (recipe: SandArtRecipe) => {
    if (isFilling) return;
    setSelectedId(recipe.id);
    setFilledLayers(0);
    setAnnouncement(`${recipe.name} selected. Empty bottle ready.`);
  };

  const beginFilling = () => {
    if (!canMake || isFilling) return;
    setFilledLayers(0);
    setIsFilling(true);
    setAnnouncement(`Starting ${selectedRecipe.name}. The bottle is empty.`);
  };

  return (
    <section aria-labelledby="sand-art-heading">
      <h2 id="sand-art-heading" className="sr-only">Sand Art Station</h2>
      <p className="text-sm text-pink-800 mb-3 text-center">Choose a design, then watch its colors fill the bottle one layer at a time.</p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4" role="group" aria-label="Choose a sand art design">
        {SAND_ART_RECIPES.map((recipe) => {
          const selected = recipe.id === selectedRecipe.id;
          return (
            <button
              key={recipe.id}
              type="button"
              disabled={isFilling}
              aria-pressed={selected}
              onClick={() => chooseRecipe(recipe)}
              className={`rounded-xl px-3 py-3 text-sm font-semibold ring-2 transition ${selected ? "bg-pink-700 text-white ring-pink-800" : "bg-white/90 text-pink-900 ring-pink-200"} disabled:opacity-60`}
            >
              {recipe.name}
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl bg-gradient-to-b from-cyan-50 to-pink-50 p-5 shadow-md ring-1 ring-pink-200 mb-4">
        <h3 className="text-xl font-bold text-pink-950 text-center mb-1">{selectedRecipe.name}</h3>
        <p className="text-sm text-pink-800 text-center mb-3">{selectedRecipe.description}</p>
        <BottleVisual recipe={selectedRecipe} filledLayers={filledLayers} />
        <p className="text-sm font-semibold text-pink-900 text-center mt-1 mb-4">
          {isFilling ? `${filledLayers} of ${selectedLayers.length} layers filled` : filledLayers === selectedLayers.length ? "Bottle complete" : "Bottle ready to fill"}
        </p>
        <CostRow cost={selectedRecipe.cost} />
        {selectedRecipe.id === "golden-star-wish" && <p className={`mt-2 text-xs font-semibold text-center ${goldenWishLocked ? "text-amber-800" : "text-emerald-700"}`}>{goldenWishLocked ? "Complete Wildlife & Sightings to earn Penelope’s Golden Feather and unlock this recipe." : "Golden Feather catalyst unlocked · the feather will not be consumed."}</p>}
        <button
          type="button"
          disabled={!canMake || isFilling}
          onClick={beginFilling}
          className="w-full py-3 rounded-xl font-semibold text-white transition disabled:bg-pink-200 disabled:text-pink-600 bg-pink-700 active:bg-pink-800 shadow"
        >
          {isFilling ? "Layering the Sand…" : canMake ? "🎨 Layer the Sand" : "Need More Sand"}
        </button>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>

      <section aria-labelledby="bottle-gallery-heading" className="rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-pink-200">
        <h3 id="bottle-gallery-heading" className="text-lg font-bold text-pink-950 mb-1">My Sand Art Bottles</h3>
        <p className="text-sm text-pink-800 mb-4">Your finished bottles are displayed here.</p>
        {completedBottles.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {completedBottles.map((recipe) => {
              const count = state.inventory[recipe.outputItemId] || 0;
              return (
                <article key={recipe.id} className="rounded-2xl bg-gradient-to-b from-cyan-50 to-white p-3 text-center ring-1 ring-cyan-200">
                  <BottleVisual recipe={recipe} filledLayers={(SAND_ART_LAYERS[recipe.id] || []).length} size="small" />
                  <h4 className="text-sm font-bold text-pink-950 mt-1">{recipe.name}</h4>
                  <p className="text-sm text-pink-800">Created: {count}</p>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl bg-pink-50 p-4 text-sm text-pink-800 text-center">Your first finished bottle will appear here.</p>
        )}
      </section>
    </section>
  );
}

type Tab = "crafting" | "kitchen" | "jewelry" | "decor" | "sandart";

export default function Workshop() {
  const { state, setMusicOverride } = useGame();
  const [tab, setTab] = useState<Tab>("crafting");
  const { play } = useGame();
  const [cookbookOpen, setCookbookOpen] = useState(false);
  const [fridgeOpen, setFridgeOpen] = useState(false);
  const fridgeButtonRef = useRef<HTMLButtonElement>(null);
  const closeFridge = () => { play("kitchenFridge", 1); setFridgeOpen(false); window.setTimeout(() => fridgeButtonRef.current?.focus(), 0); };
  const cookbookButtonRef = useRef<HTMLButtonElement>(null);
  const closeCookbook = () => { setCookbookOpen(false); window.setTimeout(() => cookbookButtonRef.current?.focus(), 0); };
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [windChimeOpen, setWindChimeOpen] = useState(false);
  const [picnicPackingOpen, setPicnicPackingOpen] = useState(false);
  const [jewelryCounterOpen, setJewelryCounterOpen] = useState(false);
  const [customSandArtOpen, setCustomSandArtOpen] = useState(false);
  const [olliInkOpen, setOlliInkOpen] = useState(false);
  const [shellPaintingOpen, setShellPaintingOpen] = useState(false);
  const windChimeButtonRef = useRef<HTMLButtonElement>(null);
  const picnicPackingButtonRef = useRef<HTMLButtonElement>(null);
  const jewelryCounterButtonRef = useRef<HTMLButtonElement>(null);
  const customSandArtButtonRef = useRef<HTMLButtonElement>(null);
  const olliInkButtonRef = useRef<HTMLButtonElement>(null);
  const shellPaintingButtonRef = useRef<HTMLButtonElement>(null);

  const closeWindChime = () => {
    setWindChimeOpen(false);
    window.setTimeout(() => windChimeButtonRef.current?.focus(), 0);
  };

  const closePicnicPacking = () => {
    setPicnicPackingOpen(false);
    window.setTimeout(() => picnicPackingButtonRef.current?.focus(), 0);
  };

  const closeJewelryCounter = () => {
    setJewelryCounterOpen(false);
    window.setTimeout(() => jewelryCounterButtonRef.current?.focus(), 0);
  };

  const closeCustomSandArt = () => {
    setCustomSandArtOpen(false);
    window.setTimeout(() => customSandArtButtonRef.current?.focus(), 0);
  };

  const closeOlliInk = () => {
    setOlliInkOpen(false);
    window.setTimeout(() => olliInkButtonRef.current?.focus(), 0);
  };

  const closeShellPainting = () => {
    setShellPaintingOpen(false);
    window.setTimeout(() => shellPaintingButtonRef.current?.focus(), 0);
  };

  // AudioEngine owns the single music element. The Kitchen sub-tab uses its
  // kitchen track; every other Workshop tab — including Jewelry and Sand Art —
  // uses Coastal Crafting Haven. Do not clear the override between tab changes,
  // because rapidly swapping to the zone track and back can leave playback
  // paused in some browsers. Clear it only when Workshop itself unmounts.
  useEffect(() => {
    setMusicOverride(tab === "kitchen" ? "kitchen" : "crafting");
  }, [tab, setMusicOverride]);

  useEffect(() => {
    return () => setMusicOverride(null);
  }, [setMusicOverride]);

  const TABS: { id: Tab; label: string; active: string; inactive: string }[] = [
    { id: "crafting", label: "🔨 Crafting", active: "bg-teal-600 text-white", inactive: "bg-white/80 text-teal-800" },
    { id: "kitchen", label: "🍲 Kitchen", active: "bg-orange-600 text-white", inactive: "bg-white/80 text-orange-800" },
    { id: "jewelry", label: "💍 Jewelry", active: "bg-purple-600 text-white", inactive: "bg-white/80 text-purple-800" },
    { id: "decor", label: "⛱️ Décor", active: "bg-sky-600 text-white", inactive: "bg-white/80 text-sky-800" },
    { id: "sandart", label: "🎨 Sand Art", active: "bg-pink-600 text-white", inactive: "bg-white/80 text-pink-800" },
  ];

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#fbf3e3]">
      <div className="relative w-full h-48">
        <Image src={SCENES.workshop} alt="Sea Glass Workshop" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf3e3] via-transparent to-black/10" />
      </div>

      <div className="px-4 -mt-6 relative">
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[30%] py-2 rounded-full text-[11px] font-semibold ${tab === t.id ? t.active : t.inactive}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setNotebookOpen(true)}
          className="w-full text-left rounded-2xl bg-white/90 p-4 mb-3 shadow-md ring-1 ring-amber-200 flex items-center gap-3 active:scale-[0.98] transition"
        >
          <div className="w-14 h-14 shrink-0 rounded-xl bg-amber-50 flex items-center justify-center text-3xl">📖</div>
          <div className="flex-1">
            <p className="font-bold text-amber-900">Explorer's Notebook</p>
            <p className="text-xs text-amber-700">
              A leather journal rests on the corner of the desk, next to the crafting bucket.
            </p>
          </div>
        </button>

        {!state.workshopUnlocked ? (
          <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-amber-200 text-center">
            <p className="text-amber-900 font-semibold mb-1">The workbench is locked</p>
            <p className="text-sm text-amber-700">
              Complete "The Glass Artisan" bottle quest to unlock the Sea Glass Workshop and learn to craft Melodic Wind Chimes.
            </p>
          </div>
        ) : tab === "crafting" ? (
          <>
            <RecipeCard
              title="Melodic Wind Chime"
              description="Sway gently in the wind and play soothing tones. Hang it near your camp to invite wildlife."
              cost={WIND_CHIME_COST}
              recipeId="wind-chime"
              repeatable
            />

            <RecipeCard
              title="Kelp Resin"
              description="Press fresh reef kelp with soothing sea salt into a useful natural resin. This recipe can be crafted whenever you have enough ingredients."
              cost={[{ itemId: "kelp", count: 2 }, { itemId: "soothing-sea-salt", count: 1 }]}
              recipeId="kelp-resin"
              repeatable
            />

            {state.sandbarsUnlocked && (
              <RecipeCard
                title="Boo's Sand Art Tool Set"
                description="Turn cleaned plastic debris and aluminum soda tabs into a scoop, small shovel, fine sieve, and bottle funnel for Boo's Sandbar studio. Bring the finished set to Boo."
                cost={BOO_TOOL_SET_COST}
                recipeId="boo-sand-art-tool-set"
                imageSrc={SCENES.booSandArtTools}
                imageAlt={ITEMS["boo-sand-art-tool-set"].artDescription}
              />
            )}

            <section aria-labelledby="wind-chime-game-heading" className="rounded-2xl bg-gradient-to-br from-cyan-50 to-amber-50 p-4 mb-4 shadow-md ring-1 ring-cyan-200">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">Workshop Mini-Game</p>
              <h2 id="wind-chime-game-heading" className="mt-1 font-serif text-lg font-bold text-amber-950">🎐 Wind Chime Workshop</h2>
              <p className="mt-1 text-sm text-amber-800">Arrange shells and sea glass, hear every tone, and play your finished chime.</p>
              <button
                ref={windChimeButtonRef}
                type="button"
                onClick={() => setWindChimeOpen(true)}
                className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800"
              >
                Open Wind Chime Workshop
              </button>
            </section>

            <section aria-labelledby="shell-painting-heading" className="rounded-2xl bg-gradient-to-br from-pink-50 to-cyan-50 p-4 mb-4 shadow-md ring-1 ring-pink-200">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-pink-800">Sunny&apos;s Crafting Activity</p>
              <h2 id="shell-painting-heading" className="mt-1 font-serif text-lg font-bold text-sky-950">⭐ Shell Painting Studio</h2>
              <p className="mt-1 text-sm text-sky-800">Turn collected shells and Paint Pigment into named artwork for Sunny&apos;s gallery. All choices use buttons—nothing needs to be drawn or dragged.</p>
              <button ref={shellPaintingButtonRef} type="button" onClick={() => setShellPaintingOpen(true)} className="mt-3 min-h-12 w-full rounded-xl bg-pink-600 px-4 py-3 font-bold text-white shadow active:bg-pink-700">Open Shell Painting Studio</button>
            </section>

            {!state.rowboatRepaired && !state.bucketsFilled ? (
              <RecipeCard
                title="Repair the Rowboat"
                description=""
                cost={[]}
                recipeId="rowboat-repair-locked"
                locked
                lockedMessage="Fill your beach bucket all the way to the brim to uncover the materials needed to repair the old rowboat."
              />
            ) : (
              <RecipeCard
                title="Repair the Rowboat"
                description="Patch the weathered hull with driftwood and barnacled planks. Repairing it opens a path to the Hidden Beach."
                cost={ROWBOAT_COST}
                recipeId="rowboat-repair"
              />
            )}

            {state.rowboatRepaired && (
              <>
                <RecipeCard
                  title="Sea Glass Lantern"
                  description="A warm, glowing housing to help light the coastal path up to the lighthouse."
                  cost={LANTERN_COST}
                  recipeId="sea-glass-lantern"
                />
                <RecipeCard
                  title="Interactive Fish Grotto"
                  description="A colorful sea-glass arch placed in the shallows — rumor has it Rainbow Seahorses love to hide here."
                  cost={FISH_GROTTO_COST}
                  recipeId="fish-grotto"
                />
              </>
            )}
          </>
        ) : tab === "kitchen" ? (
          <>
            <section aria-label="Cozy cottage kitchen" className="mb-4">
              <div className="relative w-full overflow-hidden rounded-2xl shadow-md ring-1 ring-amber-300" style={{ aspectRatio: "3 / 2" }}>
                <Image src="/images/Kitchen-background.PNG" alt="Sunlit coastal cottage kitchen with sea-glass refrigerator, stove, wooden cabinets, ocean-view window, and an open cookbook on the center island" fill unoptimized sizes="100vw" className="object-cover" />
                <button
                  ref={fridgeButtonRef}
                  type="button"
                  aria-label="Open the blue kitchen refrigerator"
                  onClick={() => { play("kitchenFridge", 1); setFridgeOpen(true); }}
                  className="absolute left-[1%] top-[16%] h-[75%] w-[18%] rounded-xl border-2 border-transparent bg-transparent focus-visible:border-amber-300 focus-visible:bg-amber-100/30 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-950"
                >
                  <span className="sr-only">Open refrigerator</span>
                </button>
                <button
                  ref={cookbookButtonRef}
                  type="button"
                  aria-label="Open the cookbook on the kitchen island"
                  onClick={() => { play("kitchenPageTurn", 0.4); setCookbookOpen(true); }}
                  className="absolute left-[59%] top-[42%] h-[24%] w-[25%] rounded-xl border-2 border-transparent bg-transparent focus-visible:border-amber-300 focus-visible:bg-amber-100/30 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-950"
                >
                  <span className="sr-only">Open cookbook</span>
                </button>
              </div>
              <p className="mt-2 text-center text-sm text-amber-950">Select the cookbook on the island to browse and prepare recipes.</p>
            </section>
            <section aria-labelledby="picnic-packing-heading" className="rounded-2xl bg-gradient-to-br from-rose-50 to-amber-100 p-4 mb-4 shadow-md ring-1 ring-rose-200">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-800">Kitchen Mini-Game</p>
              <h2 id="picnic-packing-heading" className="mt-1 font-serif text-lg font-bold text-amber-950">🧺 Picnic Packing</h2>
              <p className="mt-1 text-sm text-amber-800">Fit food, a blanket, dishes, flowers, drinks, and treats into the picnic basket without squishing anything.</p>
              <button
                ref={picnicPackingButtonRef}
                type="button"
                onClick={() => setPicnicPackingOpen(true)}
                className="mt-3 w-full rounded-xl bg-rose-700 py-3 font-bold text-white shadow active:bg-rose-800"
              >
                Pack a Picnic Basket
              </button>
            </section>
          </>
        ) : tab === "jewelry" ? (
          <>
            <p className="text-xs text-purple-800/70 mb-3 text-center">The Jewelry Bench sparkles with wire, thread, and polished treasures.</p>
            <section aria-labelledby="custom-jewelry-heading" className="mb-4 overflow-hidden rounded-2xl bg-purple-950 text-white shadow-md ring-1 ring-purple-300">
              <div className="relative h-36">
                <Image src={SCENES.jewelryCounter} alt="Pearls, sea glass, shells, stones, wire, and tools arranged at the coastal Jewelry Counter" fill unoptimized sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-950/25 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-pink-200">Melody&apos;s Creative Activity</p>
                  <h2 id="custom-jewelry-heading" className="font-serif text-xl font-bold">💎 Custom Jewelry Counter</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-purple-50">Create one-of-a-kind necklaces, bracelets, and earrings from your collected pearls, shells, stones, and sea glass.</p>
                <button ref={jewelryCounterButtonRef} type="button" onClick={() => setJewelryCounterOpen(true)} className="mt-3 min-h-12 w-full rounded-xl bg-pink-200 px-4 py-3 font-bold text-purple-950 shadow active:bg-pink-100">Open Jewelry Counter</button>
              </div>
            </section>
            <h2 className="mb-3 font-serif text-lg font-bold text-purple-950">Melody&apos;s Signature Designs</h2>
            {JEWELRY_RECIPES.map((r) => (
              <RecipeCard key={r.id} title={r.name} description={r.description} cost={r.cost} recipeId={r.id} imageSrc={r.sceneImage ? SCENES[r.sceneImage as keyof typeof SCENES] : undefined} imageAlt={ITEMS[r.id]?.artDescription} />
            ))}
          </>
        ) : tab === "decor" ? (
          <>
            <p className="text-xs text-sky-800/70 mb-3 text-center">Resort furnishings and gear for the whole sanctuary.</p>
            {DECOR_RECIPES.map((r) => (
              <RecipeCard key={r.id} title={r.name} description={r.description} cost={r.cost} recipeId={r.id} repeatable imageSrc={r.sceneImage ? SCENES[r.sceneImage as keyof typeof SCENES] : undefined} imageAlt={ITEMS[r.id]?.artDescription} locked={r.id === "coastal-beeswax-candle" && state.honeybellStage < 3} lockedMessage="Grow the Golden Honeybell in the Coconut Grove to welcome the bees and unlock their candle recipe." />
            ))}
            <RecipeCard
              title={RAFT_RECIPE.name}
              description={RAFT_RECIPE.description}
              cost={RAFT_RECIPE.cost}
              recipeId={RAFT_RECIPE.id}
            />
          </>
        ) : (
          <>
            <section aria-labelledby="olli-ink-studio-heading" className="mb-4 rounded-2xl bg-gradient-to-br from-indigo-950 to-teal-800 p-4 text-white shadow-md ring-1 ring-cyan-300">
              <p className="text-[11px] font-bold uppercase tracking-wide text-cyan-200">Olli&apos;s Creative Activity</p>
              <h2 id="olli-ink-studio-heading" className="mt-1 font-serif text-xl font-bold">🐙 Ink Picture Studio</h2>
              <p className="mt-1 text-sm text-cyan-50">Use ink earned by finding camouflaged Olli. Choose a background, stamp, and pattern without drawing or dragging.</p>
              {state.olliHuntsCompleted < 1 && <p className="mt-2 rounded-xl bg-white/10 p-3 text-sm font-semibold text-cyan-100">Find Olli during his first Camouflage Hunt to unlock the studio.</p>}
              <button ref={olliInkButtonRef} type="button" disabled={state.olliHuntsCompleted < 1} onClick={() => setOlliInkOpen(true)} className="mt-3 min-h-12 w-full rounded-xl bg-cyan-200 px-4 py-3 font-bold text-indigo-950 disabled:bg-slate-600 disabled:text-slate-300">Open Olli&apos;s Ink Studio</button>
            </section>
            <section aria-labelledby="custom-sand-art-heading" className="mb-4 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-md ring-1 ring-orange-300">
              <div className="relative h-40">
                <Image src={SCENES.booSandArt} alt="Boo the ghost crab at his moonlit Sandbar stall with colorful sand art bottles" fill unoptimized sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-orange-200">Kaiana &amp; Boo&apos;s Creative Activity</p>
                  <h2 id="custom-sand-art-heading" className="font-serif text-xl font-bold">🏺 Custom Sand Art Bottles</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-orange-50">Build five layers in any order, add an optional shoreline treasure, name the bottle, and save it for display or sell it to Seaweed.</p>
                {!state.sandbarsUnlocked && <p className="mt-2 rounded-xl bg-white/10 p-3 text-sm font-semibold text-orange-100">Unlock the Shifting Sandbars and meet Boo before opening the custom studio.</p>}
                {state.sandbarsUnlocked && !state.booToolSetDelivered && <p className="mt-2 rounded-xl bg-white/10 p-3 text-sm font-semibold text-orange-100">Craft Boo&apos;s Sand Art Tool Set in the Crafting tab, then deliver it at his Sandbar home.</p>}
                <button ref={customSandArtButtonRef} type="button" disabled={!state.sandbarsUnlocked || !state.booToolSetDelivered} onClick={() => setCustomSandArtOpen(true)} className="mt-3 min-h-12 w-full rounded-xl bg-orange-400 px-4 py-3 font-bold text-slate-950 shadow active:bg-orange-300 disabled:bg-slate-600 disabled:text-slate-300">{state.booToolSetDelivered ? "Open Custom Bottle Studio" : "Boo's Tools Needed"}</button>
              </div>
            </section>
            <h2 className="mb-3 font-serif text-lg font-bold text-pink-950">Kaiana&apos;s Signature Designs</h2>
            <SandArtStudio />
          </>
        )}
      </div>

      {fridgeOpen && <KitchenRefrigerator onClose={closeFridge} />}
      {cookbookOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-3" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCookbook(); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="shoreline-cookbook-heading" className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-amber-50 shadow-2xl">
            <div className="flex shrink-0 justify-end border-b border-amber-200 p-3">
              <button type="button" onClick={closeCookbook} className="min-h-11 rounded-xl bg-teal-900 px-5 font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400">Close Cookbook</button>
            </div>
            <div className="overflow-y-auto p-3"><ShorelineCookbook /><KitchenRecipeRewards /></div>
          </div>
        </div>
      )}
      {notebookOpen && <Notebook onClose={() => setNotebookOpen(false)} />}
      {windChimeOpen && <WindChimeWorkshop onClose={closeWindChime} />}
      {picnicPackingOpen && <PicnicPacking onClose={closePicnicPacking} />}
      {jewelryCounterOpen && <JewelryCounter onClose={closeJewelryCounter} />}
      {customSandArtOpen && <CustomSandArtStudio onClose={closeCustomSandArt} />}
      {olliInkOpen && <OlliInkStudio onClose={closeOlliInk} />}
      {shellPaintingOpen && <ShellPaintingStudio onClose={closeShellPainting} />}
    </div>
  );
}
