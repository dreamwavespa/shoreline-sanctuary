"use client";
import { useState } from "react";
import Image from "next/image";
import { QuestDef, QUESTS } from "@/lib/quests";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { SCENES } from "@/lib/media";

export default function BottleQuests() {
  const { state, claimQuest, hasEnough, play } = useGame();
  const [openId, setOpenId] = useState<string | null>(null);

  const isReady = (q: QuestDef) => {
    if (state.questProgress[q.id]) return false;
    if (q.requiresFlag && !(state as any)[q.requiresFlag]) return false;
    if (q.requiresCraft && !state.crafted.includes(q.requiresCraft)) return false;
    if (q.requires.length && !hasEnough(q.requires)) return false;
    return true;
  };

  const isVisible = (q: QuestDef) => {
    if (q.phase === 2 && !state.rowboatRepaired) return false;
    if (q.phase === 3 && !state.hasDivingGear) return false;
    return true;
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#fbf3e3]">
      <div className="relative w-full h-40">
        <Image src={SCENES.bottleHero} alt="Message in a bottle" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf3e3] via-transparent to-black/10" />
      </div>
      <div className="px-4 -mt-4 relative space-y-3">
        {state.gameCompleted && (
          <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-teal-100 p-5 shadow-md ring-1 ring-amber-300 text-center mb-2">
            <p className="text-3xl mb-1">🎉</p>
            <p className="font-bold text-amber-900">Shoreline Sanctuary — Complete!</p>
            <p className="text-xs text-amber-800 mt-1">Thank you for restoring this little corner of the ocean.</p>
          </div>
        )}
        {QUESTS.filter(isVisible).map((q) => {
          const done = state.questProgress[q.id];
          const ready = isReady(q);
          const isOpen = openId === q.id;
          return (
            <div key={q.id} className="rounded-2xl bg-white/90 shadow-md ring-1 ring-amber-200 overflow-hidden">
              <button
                type="button"
                className="w-full text-left p-4 flex items-center justify-between"
                onClick={() => {
                  setOpenId(isOpen ? null : q.id);
                  if (!isOpen) play("bottleOpen");
                }}
              >
                <div>
                  <div className="font-semibold text-amber-900">{q.title}</div>
                  <div className="text-xs text-amber-600">{done ? "Completed ✓" : `From: ${q.from}`}</div>
                </div>
                <span className="text-xl">{done ? "📜" : "🍾"}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-amber-100 pt-3">
                  <p className="text-sm italic text-amber-800 mb-3">"{q.letter}"</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {q.requires.map((r) => {
                      const def = ITEMS[r.itemId];
                      const have = state.inventory[r.itemId] || 0;
                      const ok = have >= r.count;
                      return (
                        <div key={r.itemId} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ring-1 ${ok ? "ring-emerald-300 bg-emerald-50 text-emerald-800" : "ring-red-200 bg-red-50 text-red-700"}`}>
                          {def.isEmoji ? <span>{def.icon}</span> : <Image src={def.icon} alt={def.name} width={16} height={16} unoptimized />}
                          <span>{def.name} {have}/{r.count}</span>
                        </div>
                      );
                    })}
                    {q.requiresCraft && (
                      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ring-1 ${state.crafted.includes(q.requiresCraft) ? "ring-emerald-300 bg-emerald-50 text-emerald-800" : "ring-red-200 bg-red-50 text-red-700"}`}>
                        🔨 {state.crafted.includes(q.requiresCraft) ? "Crafted" : "Needs crafting"}
                      </div>
                    )}
                    {q.requiresFlag && (
                      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ring-1 ${(state as any)[q.requiresFlag] ? "ring-emerald-300 bg-emerald-50 text-emerald-800" : "ring-red-200 bg-red-50 text-red-700"}`}>
                        {(state as any)[q.requiresFlag] ? "✓ Ready" : "Not yet"}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-amber-700 mb-3">Reward: {q.rewardLabel}</p>
                  <button
                    type="button"
                    disabled={done || !ready}
                    onClick={() => claimQuest(q)}
                    className="w-full py-2 rounded-xl font-semibold text-white disabled:bg-amber-200 disabled:text-amber-500 bg-teal-600 active:bg-teal-700"
                  >
                    {done ? "Turned In" : ready ? "Turn In Quest" : "Not Ready Yet"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
