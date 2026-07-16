"use client";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { SCENES } from "@/lib/media";

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

function RecipeCard({
  title,
  description,
  cost,
  recipeId,
  locked,
  lockedMessage,
}: {
  title: string;
  description: string;
  cost: { itemId: string; count: number }[];
  recipeId: string;
  locked?: boolean;
  lockedMessage?: string;
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

export default function Workshop() {
  const { state } = useGame();

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#fbf3e3]">
      <div className="relative w-full h-48">
        <Image src={SCENES.workshop} alt="Sea Glass Workshop" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf3e3] via-transparent to-black/10" />
      </div>

      <div className="px-4 -mt-6 relative">
        {!state.workshopUnlocked ? (
          <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-amber-200 text-center">
            <p className="text-amber-900 font-semibold mb-1">The workbench is locked</p>
            <p className="text-sm text-amber-700">
              Complete "The Glass Artisan" bottle quest to unlock the Sea Glass Workshop and learn to craft Melodic Wind Chimes.
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
