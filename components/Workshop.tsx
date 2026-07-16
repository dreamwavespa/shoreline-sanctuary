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

export default function Workshop() {
  const { state, craft, hasEnough } = useGame();
  const canCraft = hasEnough(WIND_CHIME_COST);
  const alreadyCrafted = state.crafted.includes("wind-chime");

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
          <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-amber-200">
            <h2 className="text-lg font-bold text-amber-900 mb-1">Melodic Wind Chime</h2>
            <p className="text-sm text-amber-700 mb-3">
              Sway gently in the wind and play soothing tones. Hang it near your camp to invite wildlife.
            </p>
            <div className="flex gap-3 mb-4">
              {WIND_CHIME_COST.map((c) => {
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
              disabled={!canCraft || alreadyCrafted}
              onClick={() => craft("wind-chime", WIND_CHIME_COST)}
              className="w-full py-3 rounded-xl font-semibold text-white transition disabled:bg-amber-200 disabled:text-amber-500 bg-teal-600 active:bg-teal-700 shadow"
            >
              {alreadyCrafted ? "Already Crafted ✓" : canCraft ? "Craft Wind Chime" : "Need More Materials"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
