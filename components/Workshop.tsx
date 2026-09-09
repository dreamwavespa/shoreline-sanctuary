"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { SCENES } from "@/lib/media";
import { KITCHEN_RECIPES, JEWELRY_RECIPES, DECOR_RECIPES, RAFT_RECIPE, SAND_ART_RECIPES } from "@/lib/recipes";
import Notebook from "./Notebook";

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
              <span className="text-2xl">{def.icon}</span>
            ) : (
              <Image src={def.icon} alt={def.name} width={32} height={32} unoptimized className="object-contain" />
            )}
            <span className="text-[10px] mt-1 text-amber-800">{have}/{c.count}</span>
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
}: {
  title: string;
  description: string;
  cost: { itemId: string; count: number }[];
  recipeId: string;
  locked?: boolean;
  lockedMessage?: string;
  accent?: string;
}) {
  const { state, craft, hasEnough } = useGame();
  const canCraft = hasEnough(cost);
  const alreadyCrafted = state.crafted.includes(recipeId);

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
      <CostRow cost={cost} />
      <button
        type="button"
        disabled={!canCraft || alreadyCrafted}
        onClick={() => craft(recipeId, cost)}
        className="w-full py-3 rounded-xl font-semibold text-white transition disabled:bg-amber-200 disabled:text-amber-500 bg-teal-600 active:bg-teal-700 shadow"
      >
        {alreadyCrafted ? "Already Crafted ✓" : canCraft ? "Craft" : "Need More Materials"}
      </button>
    </div>
  );
}

function CookCard({ recipe }: { recipe: (typeof KITCHEN_RECIPES)[number] }) {
  const { state, cook, hasEnough } = useGame();
  const canCook = hasEnough(recipe.cost);
  const madeCount = state.inventory[recipe.outputItemId] || 0;

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-orange-200 mb-4">
      <h2 className="text-lg font-bold text-orange-900 mb-1">{recipe.name}</h2>
      <p className="text-sm text-orange-700 mb-3">{recipe.description}</p>
      <CostRow cost={recipe.cost} />
      <button
        type="button"
        disabled={!canCook}
        onClick={() => cook(recipe.cost, recipe.outputItemId, recipe.outputCount || 1)}
        className="w-full py-3 rounded-xl font-semibold text-white transition disabled:bg-orange-200 disabled:text-orange-500 bg-orange-600 active:bg-orange-700 shadow"
      >
        {canCook ? "🍳 Cook" : "Need More Ingredients"}
      </button>
      {madeCount > 0 && <p className="text-[11px] text-orange-700/70 mt-2 text-center">In pantry: {madeCount}</p>}
    </div>
  );
}

type SandArtRecipe = (typeof SAND_ART_RECIPES)[number];
type SandColor = "apricot" | "pink" | "teal";

const SAND_COLORS: Record<SandColor, { fill: string; name: string }> = {
  apricot: { fill: "#f2a45f", name: "apricot" },
  pink: { fill: "#e86f9f", name: "pink" },
  teal: { fill: "#159b9a", name: "teal" },
};

const SAND_ART_LAYERS: Record<string, SandColor[]> = {
  "sunset-shoreline": ["apricot", "pink", "apricot", "pink"],
  "subaquatic-sandbar": ["teal", "apricot", "teal", "teal"],
  "legendary-tidepool": ["pink", "teal", "pink", "teal"],
};

function BottleVisual({ recipe, filledLayers, size = "large" }: { recipe: SandArtRecipe; filledLayers: number; size?: "large" | "small" }) {
  const layers = SAND_ART_LAYERS[recipe.id] || [];
  const shownLayers = layers.slice(0, filledLayers);
  const hasPearlDust = recipe.cost.some((item) => item.itemId === "pearl-silver");
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
          {hasPearlDust && filledLayers > 0 && (
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
  const canMake = hasEnough(selectedRecipe.cost);
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4" role="group" aria-label="Choose a sand art design">
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
  const [notebookOpen, setNotebookOpen] = useState(false);

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
            />

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
            <p className="text-xs text-orange-800/70 mb-3 text-center">The Hearth Stove crackles warmly — cook up cozy treats for your sanctuary friends.</p>
            {KITCHEN_RECIPES.map((r) => (
              <CookCard key={r.id} recipe={r} />
            ))}
          </>
        ) : tab === "jewelry" ? (
          <>
            <p className="text-xs text-purple-800/70 mb-3 text-center">The Jewelry Bench sparkles with wire, thread, and polished treasures.</p>
            {JEWELRY_RECIPES.map((r) => (
              <RecipeCard key={r.id} title={r.name} description={r.description} cost={r.cost} recipeId={r.id} />
            ))}
          </>
        ) : tab === "decor" ? (
          <>
            <p className="text-xs text-sky-800/70 mb-3 text-center">Resort furnishings and gear for the whole sanctuary.</p>
            {DECOR_RECIPES.map((r) => (
              <RecipeCard key={r.id} title={r.name} description={r.description} cost={r.cost} recipeId={r.id} />
            ))}
            <RecipeCard
              title={RAFT_RECIPE.name}
              description={RAFT_RECIPE.description}
              cost={RAFT_RECIPE.cost}
              recipeId={RAFT_RECIPE.id}
            />
          </>
        ) : (
          <SandArtStudio />
        )}
      </div>

      {notebookOpen && <Notebook onClose={() => setNotebookOpen(false)} />}
    </div>
  );
}
