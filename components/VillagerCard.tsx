"use client";
import { useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { VillagerDef } from "@/lib/villagers";

const RING_BY_GROUP: Record<string, string> = {
  "sea-glass-sister": "ring-indigo-200",
  "shoreline-resident": "ring-sky-200",
  "underwater-village": "ring-teal-200",
  "traveling-special": "ring-amber-200",
};

const EMOJI_FALLBACK: Record<string, string> = {
  sandy: "🐦",
  kai: "🐚",
  sunny: "⭐",
  penelope: "🦢",
  coral: "🐴",
  mina: "🥭",
  bubbles: "🐬",
  pearl: "🪪",
  splash: "🥭",
  shelldon: "🐢",
  shelby: "🦀",
  misty: "🮼",
  angel: "🐠",
  melody: "💍",
  marella: "🔮",
  coralie: "🌿",
  kaiana: "🧭",
};

export default function VillagerCard({ villager }: { villager: VillagerDef }) {
  const { state, giftVillager } = useGame();
  const [expanded, setExpanded] = useState(false);
  const giftCount = state.villagerGiftCounts[villager.id] || 0;

  const availableGifts = villager.gift.lovedGiftIds
    .map((id) => ({ id, have: state.inventory[id] || 0, def: ITEMS[id] }))
    .filter((g) => g.def);

  const handleGift = (itemId: string) => {
    giftVillager(villager.id, itemId);
  };

  return (
    <div className={`rounded-2xl bg-white/90 shadow-md ring-1 ${RING_BY_GROUP[villager.group] || "ring-amber-200"} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-amber-50 flex items-center justify-center">
          {villager.imageUrl ? (
            <Image src={villager.imageUrl} alt={villager.name} fill unoptimized className="object-cover" />
          ) : (
            <span className="text-3xl">{EMOJI_FALLBACK[villager.id] || "🐚"}</span>
          )}
        </div>
        <div className="flex-1">
          <p className="font-bold text-amber-900">
            {villager.name} <span className="font-normal text-amber-700">{villager.title}</span>
          </p>
          <p className="text-xs text-amber-600">
            {villager.role}
            {giftCount > 0 && <span className="ml-1 text-rose-500">· 🎁 x{giftCount}</span>}
          </p>
          {villager.schedule && <p className="text-[11px] text-amber-500 italic">{villager.schedule}</p>}
        </div>
        <span className="text-lg text-amber-400">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-amber-100 pt-3 space-y-3">
          <p className="text-xs text-amber-700">{villager.personality}</p>
          <p className="text-xs text-amber-700">{villager.gameplay}</p>

          <div>
            <p className="text-[11px] font-semibold text-amber-800/70 uppercase tracking-wide mb-1.5">Loved Gifts</p>
            {availableGifts.length === 0 ? (
              <p className="text-xs text-amber-500 italic">You don't have any of their favorite gifts yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableGifts.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    disabled={g.have < 1}
                    onClick={() => handleGift(g.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full text-white disabled:bg-amber-100 disabled:text-amber-400 bg-rose-500 active:bg-rose-600"
                  >
                    {g.def.isEmoji ? (
                      <span>{g.def.icon}</span>
                    ) : (
                      <Image src={g.def.icon} alt={g.def.name} width={16} height={16} unoptimized />
                    )}
                    Give {g.def.name} ({g.have})
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-[11px] text-amber-500 italic">
            Reaction: {villager.gift.reactionVisual} — {villager.gift.reactionSfx}
          </p>
        </div>
      )}
    </div>
  );
}
