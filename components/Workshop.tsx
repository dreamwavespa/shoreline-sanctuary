"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { SCENES, MUSIC } from "@/lib/media";
import { KITCHEN_RECIPES, JEWELRY_RECIPES, DECOR_RECIPES, RAFT_RECIPE, SAND_ART_RECIPES } from "@/lib/recipes";

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

function SandArtCard({ recipe }: { recipe: (typeof SAND_ART_RECIPES)[number] }) {
  const { state, cook, hasEnough } = useGame();
  const canMake = hasEnough(recipe.cost);
  const madeCount = state.inventory[recipe.outputItemId] || 0;

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-pink-200 mb-4">
      <h2 className="text-lg font-bold text-pink-900 mb-1">{recipe.name}</h2>
      <p className="text-sm text-pink-700 mb-3">{recipe.description}</p>
      <CostRow cost={recipe.cost} />
      <button
        type="button"
        disabled={!canMake}
        onClick={() => cook(recipe.cost, recipe.outputItemId, 1)}
        className="w-full py-3 rounded-xl font-semibold text-white transition disabled:bg-pink-200 disabled:text-pink-500 bg-pink-600 active:bg-pink-700 shadow"
      >
        {canMake ? "🎨 Layer the Sand" : "Need More Sand"}
      </button>
      {madeCount > 0 && <p className="text-[11px] text-pink-700/70 mt-2 text-center">Bottled: {madeCount}</p>}
    </div>
  );
}

type Tab = "crafting" | "kitchen" | "jewelry" | "decor" | "sandart";

export default function Workshop() {
  const { state } = useGame();
  const [tab, setTab] = useState<Tab>("crafting");
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = musicRef.current;
    if (!el) return;
    if (tab === "kitchen") {
      el.volume = 0.5 * state.audio.master * state.audio.music * (state.audio.musicMuted ? 0 : 1);
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
    return () => {
      el.pause();
    };
  }, [tab, state.audio.master, state.audio.music, state.audio.musicMuted]);

  const TABS: { id: Tab; label: string; active: string; inactive: string }[] = [
    { id: "crafting", label: "🔨 Crafting", active: "bg-teal-600 text-white", inactive: "bg-white/80 text-teal-800" },
    { id: "kitchen", label: "🍲 Kitchen", active: "bg-orange-600 text-white", inactive: "bg-white/80 text-orange-800" },
    { id: "jewelry", label: "💍 Jewelry", active: "bg-purple-600 text-white", inactive: "bg-white/80 text-purple-800" },
    { id: "decor", label: "⛱️ Décor", active: "bg-sky-600 text-white", inactive: "bg-white/80 text-sky-800" },
    { id: "sandart", label: "🎨 Sand Art", active: "bg-pink-600 text-white", inactive: "bg-white/80 text-pink-800" },
  ];

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#fbf3e3]">
      <audio ref={musicRef} src={MUSIC.kitchen} loop preload="none" />

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
          <>
            <p className="text-xs text-pink-800/70 mb-3 text-center">Layer colored sand into frosted bottles at the meditative sand-art station.</p>
            {SAND_ART_RECIPES.map((r) => (
              <SandArtCard key={r.id} recipe={r} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
