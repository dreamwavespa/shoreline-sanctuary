"use client";

import { useState } from "react";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";
import { localDateKey } from "@/lib/customSandArt";

type ResidentId = "coral" | "mina" | "bubbles" | "pearl" | "splash";

const CARD_STYLE = "mt-2 rounded-2xl bg-cyan-50 p-4 shadow-sm ring-1 ring-cyan-200";
const BUTTON_STYLE = "mt-3 min-h-12 w-full rounded-xl bg-teal-700 px-4 py-3 font-bold text-white shadow active:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-500";

export default function UnderwaterResidentActivity({ villagerId }: { villagerId: ResidentId }) {
  const {
    state,
    cultivateWithCoral,
    bakeWithMina,
    claimBubblesDelivery,
    claimPearlsFriendshipGift,
    tradeWithSplash,
  } = useGame();
  const [announcement, setAnnouncement] = useState("");

  if (villagerId === "coral") {
    const bulbs = state.inventory["coral-bulb"] || 0;
    const fertilizer = state.inventory.fertilizer || 0;
    const canCultivate = bulbs > 0 && fertilizer > 0;
    const cultivate = () => {
      const reward = cultivateWithCoral();
      if (reward) setAnnouncement(`Coral's garden produced ${ITEMS[reward].name}. It was added to your inventory.`);
    };
    return (
      <section className={CARD_STYLE} aria-labelledby="coral-activity-heading">
        <h3 id="coral-activity-heading" className="font-serif text-lg font-bold text-teal-950">🌱 Coral’s Glow Garden</h3>
        <p className="mt-1 text-sm text-teal-800">Combine one Coral Bulb with one Sea Fertilizer. Coral usually grows Sea Berries; every third cultivation produces a rare Bioluminescent Shard.</p>
        <p className="mt-2 text-xs font-semibold text-teal-900">Coral Bulbs: {bulbs} · Sea Fertilizer: {fertilizer} · Gardens cultivated: {state.coralCultivations}</p>
        <button type="button" disabled={!canCultivate} onClick={cultivate} className={BUTTON_STYLE}>
          {canCultivate ? "Cultivate One Glow Garden" : "Needs 1 Coral Bulb and 1 Sea Fertilizer"}
        </button>
        <Status message={announcement} />
      </section>
    );
  }

  if (villagerId === "mina") {
    const kelp = state.inventory.kelp || 0;
    const berries = state.inventory["sea-berry"] || 0;
    const canBake = kelp > 0 && berries > 0;
    const bake = () => {
      if (bakeWithMina()) setAnnouncement("Mina baked two Warm Kelp Cookies and packed them into your inventory.");
    };
    return (
      <section className={CARD_STYLE} aria-labelledby="mina-activity-heading">
        <h3 id="mina-activity-heading" className="font-serif text-lg font-bold text-teal-950">🍪 Mina’s Kelp Kitchen</h3>
        <p className="mt-1 text-sm text-teal-800">Bring one Kelp and one Sea Berry to bake two Warm Kelp Cookies. This activity is repeatable and has no timer.</p>
        <p className="mt-2 text-xs font-semibold text-teal-900">Kelp: {kelp} · Sea Berries: {berries} · Batches baked: {state.minaBakes}</p>
        <button type="button" disabled={!canBake} onClick={bake} className={BUTTON_STYLE}>
          {canBake ? "Bake Two Kelp Cookies" : "Needs 1 Kelp and 1 Sea Berry"}
        </button>
        <Status message={announcement} />
      </section>
    );
  }

  if (villagerId === "bubbles") {
    const friendshipStarted = (state.villagerGiftCounts.bubbles || 0) > 0;
    const claimedToday = state.bubblesDeliveryDate === localDateKey();
    const claim = () => {
      const delivery = claimBubblesDelivery();
      if (delivery) setAnnouncement(`Bubbles delivered a Frosted Glass Bottle and ${ITEMS[delivery.bonusItemId].name}. Both were added to your inventory.`);
    };
    return (
      <section className={CARD_STYLE} aria-labelledby="bubbles-activity-heading">
        <h3 id="bubbles-activity-heading" className="font-serif text-lg font-bold text-teal-950">🐬 Bubbles’ Daily Delivery</h3>
        <p className="mt-1 text-sm text-teal-800">After you give Bubbles his first gift, he can deliver one Frosted Glass Bottle and one mystery item each day.</p>
        <button type="button" disabled={!friendshipStarted || claimedToday} onClick={claim} className={BUTTON_STYLE}>
          {!friendshipStarted ? "Give Bubbles a Gift First" : claimedToday ? "Today’s Delivery Collected" : "Meet Bubbles at the Delivery Buoy"}
        </button>
        <Status message={announcement} />
      </section>
    );
  }

  if (villagerId === "pearl") {
    const gifts = state.villagerGiftCounts.pearl || 0;
    const earned = Math.floor(gifts / 3);
    const rewardReady = state.pearlRewardsClaimed < earned;
    const progress = gifts - state.pearlRewardsClaimed * 3;
    const claim = () => {
      const reward = claimPearlsFriendshipGift();
      if (reward) setAnnouncement(`Pearl formed a ${ITEMS[reward].name}. It was added to your inventory.`);
    };
    return (
      <section className={CARD_STYLE} aria-labelledby="pearl-activity-heading">
        <h3 id="pearl-activity-heading" className="font-serif text-lg font-bold text-teal-950">🦪 Pearl’s Friendship Pearl</h3>
        <p className="mt-1 text-sm text-teal-800">Pearl slowly forms a special pearl after every three gifts. Unclaimed rewards remain safely waiting for you.</p>
        <p className="mt-2 text-xs font-semibold text-teal-900">{rewardReady ? "A friendship pearl is ready." : `Progress toward the next pearl: ${Math.min(progress, 3)}/3 gifts`}</p>
        <button type="button" disabled={!rewardReady} onClick={claim} className={BUTTON_STYLE}>
          {rewardReady ? "Receive Friendship Pearl" : "No Pearl Ready Yet"}
        </button>
        <Status message={announcement} />
      </section>
    );
  }

  const fish = state.inventory["fresh-reef-fish"] || 0;
  const trade = () => {
    const result = tradeWithSplash();
    if (result) setAnnouncement(`${result.story} Splash traded you ${ITEMS[result.rewardItemId].name}; it was added to your inventory.`);
  };
  return (
    <section className={CARD_STYLE} aria-labelledby="splash-activity-heading">
      <h3 id="splash-activity-heading" className="font-serif text-lg font-bold text-teal-950">🐟 Splash’s Catch &amp; Tale</h3>
      <p className="mt-1 text-sm text-teal-800">Fresh Reef Fish now occasionally appear among Sandbar finds. Trade one to Splash for a useful craft item and one of his fishing stories.</p>
      <p className="mt-2 text-xs font-semibold text-teal-900">Fresh Reef Fish: {fish} · Trades completed: {state.splashTrades}</p>
      <button type="button" disabled={fish < 1} onClick={trade} className={BUTTON_STYLE}>
        {fish > 0 ? "Trade One Fish and Hear a Tale" : "Find a Fresh Reef Fish First"}
      </button>
      <Status message={announcement} />
    </section>
  );
}

function Status({ message }: { message: string }) {
  return <p role="status" aria-live="polite" className="mt-2 text-sm font-semibold text-teal-900">{message}</p>;
}
