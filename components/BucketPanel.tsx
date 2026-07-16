"use client";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { SCENES } from "@/lib/media";

export default function BucketPanel() {
  const { state, bucketCapacity } = useGame();
  const pct = Math.min(100, Math.round((state.bucketCount / bucketCapacity) * 100));
  const tier = pct <= 25 ? "Empty" : pct <= 75 ? "Half-Full" : "Full to the Brim!";

  const entries = Object.entries(state.inventory)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="h-full overflow-y-auto pb-24 px-4 pt-4 bg-[#fbf3e3]">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-md mb-4">
        <Image src={SCENES.bucketStates} alt="Beach bucket" width={1000} height={563} unoptimized className="w-full h-auto" />
      </div>

      <div className="rounded-2xl bg-white/70 border border-amber-200 p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-amber-900">Your Bucket</span>
          <span className="text-sm text-amber-700">{tier}</span>
        </div>
        <div className="h-4 rounded-full bg-amber-100 overflow-hidden ring-1 ring-amber-200">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-amber-700">
          {state.bucketCount}/{bucketCapacity} this trip &middot; {state.bucketsFilled} buckets filled overall
        </div>
      </div>

      <h2 className="text-lg font-semibold text-amber-900 mb-2">Collection</h2>
      {entries.length === 0 && (
        <p className="text-sm text-amber-700/80">Nothing collected yet — head to the beach and start tapping treasures!</p>
      )}
      <div className="grid grid-cols-4 gap-3">
        {entries.map(([id, count]) => {
          const def = ITEMS[id];
          if (!def) return null;
          return (
            <div key={id} className="flex flex-col items-center bg-white/80 rounded-xl p-2 shadow-sm ring-1 ring-amber-100">
              <div className="w-10 h-10 flex items-center justify-center">
                {def.isEmoji ? (
                  <span className="text-2xl">{def.icon}</span>
                ) : (
                  <Image src={def.icon} alt={def.name} width={40} height={40} unoptimized className="object-contain" />
                )}
              </div>
              <span className="text-[10px] text-amber-800 text-center mt-1 leading-tight">{def.name}</span>
              <span className="text-xs font-bold text-emerald-700">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
