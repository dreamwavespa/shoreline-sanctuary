"use client";

import { useState } from "react";
import { localDateKey } from "@/lib/customSandArt";
import { ITEMS } from "@/lib/items";
import { getScheduleStatus } from "@/lib/schedule";
import { useGame } from "@/lib/store";

const OFFER_IDS = ["bioluminescent-shard", "moonstone"];

export default function MistyMoonlitExchange() {
  const { state, tradeWithMisty, claimMistyFriendshipReward } = useGame();
  const schedule = getScheduleStatus("misty");
  const availableOffers = OFFER_IDS.filter((id) => (state.inventory[id] || 0) > 0);
  const [offerId, setOfferId] = useState(availableOffers[0] || "");
  const [announcement, setAnnouncement] = useState("");
  const tradedToday = state.mistyTradeDate === localDateKey();
  const gifts = state.villagerGiftCounts.misty || 0;
  const lanternReady = gifts >= 3 && !state.mistyFriendshipRewardClaimed;

  const exchange = () => {
    const rewardItemId = tradeWithMisty(offerId);
    if (!rewardItemId) {
      setAnnouncement("The exchange is not available. Check Misty’s schedule and your materials.");
      return;
    }
    setAnnouncement(`Misty revealed ${ITEMS[rewardItemId].name}. It was added to your inventory.`);
    setOfferId("");
  };

  const claimLantern = () => {
    const rewardItemId = claimMistyFriendshipReward();
    if (rewardItemId) setAnnouncement(`${ITEMS[rewardItemId].name} was added to your inventory.`);
  };

  return (
    <section className="rounded-2xl bg-gradient-to-br from-indigo-950 to-cyan-800 p-4 text-white shadow-md ring-1 ring-cyan-300" aria-labelledby="misty-exchange-heading">
      <h3 id="misty-exchange-heading" className="font-serif text-lg font-bold">🪼 Misty’s Moonlit Exchange</h3>
      {!schedule.available ? (
        <p className="mt-2 text-sm text-cyan-100">The moonlit water is quiet. {schedule.awayLabel}</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-cyan-50">During the full moon, trade one Bioluminescent Shard or Moonstone for a glowing material. One exchange is available each day of her visit.</p>
          <fieldset className="mt-3">
            <legend className="text-sm font-bold text-white">Choose an offering</legend>
            {availableOffers.length === 0 ? <p className="mt-2 text-sm text-cyan-100">Coral can cultivate Bioluminescent Shards, and Moonstones can be found through sanctuary discoveries.</p> : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {availableOffers.map((id) => (
                  <button key={id} type="button" disabled={tradedToday} aria-pressed={offerId === id} onClick={() => setOfferId(id)} className={`min-h-11 rounded-xl px-2 py-2 text-xs font-bold ring-1 ${offerId === id ? "bg-cyan-200 text-indigo-950 ring-white" : "bg-white/10 text-white ring-cyan-200/50"}`}>{ITEMS[id].name} ({state.inventory[id]})</button>
                ))}
              </div>
            )}
          </fieldset>
          <button type="button" disabled={tradedToday || !offerId || (state.inventory[offerId] || 0) < 1} onClick={exchange} className="mt-3 min-h-11 w-full rounded-xl bg-cyan-200 px-3 py-2 text-sm font-bold text-indigo-950 disabled:bg-slate-600 disabled:text-slate-300">{tradedToday ? "Today’s Exchange Completed" : "Make Moonlit Exchange"}</button>

          <div className="mt-4 rounded-xl bg-white/10 p-3 ring-1 ring-white/20">
            <p className="text-sm font-bold">Misty’s Friendship Glow: {Math.min(gifts, 3)}/3 gifts</p>
            <p className="mt-1 text-xs text-cyan-100">Three gifts during her full-moon visits earn a permanent Moon Jelly Lantern.</p>
            <button type="button" disabled={!lanternReady} onClick={claimLantern} className="mt-2 min-h-11 w-full rounded-xl bg-purple-200 px-3 py-2 text-sm font-bold text-indigo-950 disabled:bg-slate-600 disabled:text-slate-300">{state.mistyFriendshipRewardClaimed ? "Moon Jelly Lantern Collected" : lanternReady ? "Receive Moon Jelly Lantern" : "Friendship Reward Not Ready"}</button>
          </div>
          <p role="status" aria-live="polite" className="mt-2 min-h-5 text-xs font-semibold text-cyan-50">{announcement}</p>
        </>
      )}
    </section>
  );
}
