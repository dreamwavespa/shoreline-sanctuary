"use client";

import { useState } from "react";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";

const CARD_STYLE = "rounded-2xl bg-gradient-to-br from-sky-50 to-amber-50 p-4 shadow-md ring-1 ring-sky-200";
const BUTTON_STYLE = "mt-3 min-h-11 w-full rounded-xl bg-teal-700 px-3 py-2 text-sm font-bold text-white disabled:bg-slate-200 disabled:text-slate-500";

export function SandyStormHunt() {
  const { state, completeSandyStormHunt } = useGame();
  const [announcement, setAnnouncement] = useState("");
  const available = state.stormCleanupCompletions > state.sandyStormHuntsCompleted;
  const hasSupplies = (state.inventory["trash-plastic"] || 0) >= 1 && (state.inventory["glass-blue"] || 0) >= 1;

  const complete = () => {
    const reward = completeSandyStormHunt();
    if (reward) setAnnouncement(`Checklist complete. ${reward.count} ${ITEMS[reward.itemId].name}${reward.count === 1 ? "" : "s"} and 1 Sand Dollar were added.`);
  };

  return (
    <section className={CARD_STYLE} aria-labelledby="sandy-storm-heading">
      <h3 id="sandy-storm-heading" className="font-serif text-lg font-bold text-sky-950">🐦 Sandy’s Post-Storm Checklist</h3>
      <p className="mt-1 text-sm text-sky-800">Each completed Storm Cleanup opens one untimed search. Bring Sandy one piece of plastic debris and one piece of blue sea glass.</p>
      <p className="mt-2 text-xs font-semibold text-sky-900">
        Plastic: {state.inventory["trash-plastic"] || 0}/1 · Blue sea glass: {state.inventory["glass-blue"] || 0}/1
      </p>
      <button type="button" disabled={!available || !hasSupplies} onClick={complete} className={BUTTON_STYLE}>
        {!available ? "Wait for the Next Storm Cleanup" : hasSupplies ? "Complete Sandy’s Checklist" : "Gather the Checklist Items"}
      </button>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-xs font-semibold text-emerald-800">{announcement}</p>
    </section>
  );
}

export function PenelopeCleanupHeart() {
  const { state, claimPenelopeCleanupReward } = useGame();
  const [announcement, setAnnouncement] = useState("");
  const gifts = state.villagerGiftCounts.penelope || 0;
  const earned = Math.floor(gifts / 3);
  const ready = state.penelopeRewardsClaimed < earned;
  const progress = gifts - state.penelopeRewardsClaimed * 3;

  const claim = () => {
    const reward = claimPenelopeCleanupReward();
    if (reward) setAnnouncement(`Penelope dropped ${reward.count} ${ITEMS[reward.itemId].name}${reward.count === 1 ? "" : "s"}. They were added to your inventory.`);
  };

  return (
    <section className={CARD_STYLE} aria-labelledby="penelope-heart-heading">
      <h3 id="penelope-heart-heading" className="font-serif text-lg font-bold text-sky-950">🪶 Penelope’s Cleanup Heart</h3>
      <p className="mt-1 text-sm text-sky-800">Gift Penelope plastic debris or rescued balloons. Every three cleanup gifts fills her heart and earns coconuts or berries.</p>
      <p className="mt-2 text-xs font-semibold text-sky-900">Heart meter: {ready ? "Full — reward ready" : `${Math.min(progress, 3)}/3 cleanup gifts`}</p>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-sky-100" aria-hidden="true">
        <div className="h-full bg-rose-500 transition-all" style={{ width: `${ready ? 100 : (Math.min(progress, 3) / 3) * 100}%` }} />
      </div>
      <button type="button" disabled={!ready} onClick={claim} className={BUTTON_STYLE}>{ready ? "Receive Penelope’s Food Gift" : "Cleanup Heart Is Still Filling"}</button>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-xs font-semibold text-emerald-800">{announcement}</p>
    </section>
  );
}
