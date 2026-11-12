"use client";
import { useState } from "react";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { localDateKey } from "@/lib/customSandArt";

const GIFTS = ["shell-scallop", "glass-teal", "ribbon", "pearl-cream"] as const;
const REWARDS = [
  { at: 3, item: "shell-sanddollar", title: "A keeper's thank-you" },
  { at: 8, item: "glass-teal", title: "A sea-glass keepsake" },
  { at: 15, item: "pearl-cream", title: "A lighthouse treasure" },
] as const;
const STORIES = [
  "Maeve smiles. “The sea changes every day. That is why I never tire of watching it.”",
  "Maeve says, “Marshmallow can hear a storm before my instruments notice it.”",
  "Maeve points toward the horizon. “Every ship carries a story, even the quiet ones.”",
  "Maeve laughs softly. “The best lighthouse evenings include a warm cup of tea and good company.”",
  "Maeve says, “One day, I will show you the old books I've collected from visiting sailors.”",
];

export default function MaeveFriendship() {
  const { state, talkToMaeve, giftMaeve, claimMaeveReward } = useGame();
  const [message, setMessage] = useState("");
  const [giftId, setGiftId] = useState<string>(GIFTS[0]);
  const points = state.maeveFriendship || 0;
  const today = localDateKey();
  const talked = state.maeveLastConversationDate === today;
  const gifted = state.maeveLastGiftDate === today;
  const level = points >= 15 ? "Trusted Lighthouse Friend" : points >= 8 ? "Close Friend" : points >= 3 ? "Friendly Visitor" : "Getting Acquainted";
  const next = [3, 8, 15].find(n => n > points);
  const converse = () => {
    if (!talkToMaeve()) return;
    setMessage(STORIES[(points + state.maeveTeaVisits) % STORIES.length] + " Friendship +1.");
  };
  const give = () => {
    if (!giftMaeve(giftId)) return;
    setMessage("Maeve thanks you for the " + (ITEMS[giftId]?.name || "gift") + ". Friendship +" + (giftId === "pearl-cream" ? "3" : "2") + ".");
  };
  return (
    <section className="mt-4 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-300" aria-labelledby="maeve-friendship-heading">
      <h3 id="maeve-friendship-heading" className="text-lg font-bold text-amber-950">Friendship with Maeve</h3>
      <p className="mt-1 text-sm text-amber-900">Relationship: {level}. Friendship points: {points}.{next ? ` Next reward at ${next} points.` : " All friendship milestones reached!"}</p>
      <p className="mt-1 text-sm text-amber-800">Tea visits shared: {state.maeveTeaVisits}. You can talk and give one gift each day.</p>
      <button type="button" disabled={talked} onClick={converse} className="mt-3 w-full rounded-xl bg-amber-800 px-4 py-3 font-semibold text-white disabled:opacity-50">
        {talked ? "You've chatted with Maeve today" : "Chat with Maeve"}
      </button>
      <label htmlFor="maeve-gift" className="mt-4 block text-sm font-semibold text-amber-950">Choose a gift from your inventory</label>
      <select id="maeve-gift" value={giftId} onChange={e => setGiftId(e.target.value)} className="mt-1 w-full rounded-lg border border-amber-400 bg-white p-3 text-amber-950">
        {GIFTS.map(id => <option key={id} value={id}>{ITEMS[id]?.name || id} — owned: {state.inventory[id] || 0}</option>)}
      </select>
      <button type="button" disabled={gifted || (state.inventory[giftId] || 0) < 1} onClick={give} className="mt-2 w-full rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white disabled:opacity-50">
        {gifted ? "Maeve has received a gift today" : "Give Maeve a Gift"}
      </button>
      <h4 className="mt-4 font-bold text-amber-950">Friendship rewards</h4>
      <div className="mt-2 space-y-2">
        {REWARDS.map(reward => {
          const claimed = (state.maeveRewardsClaimed || []).includes(reward.at);
          return <div key={reward.at} className="rounded-lg bg-white p-3">
            <p className="text-sm text-amber-950">{reward.at} points: {reward.title} — {ITEMS[reward.item]?.name || reward.item}</p>
            <button type="button" disabled={claimed || points < reward.at} onClick={() => { if (claimMaeveReward(reward.at)) setMessage("Collected " + (ITEMS[reward.item]?.name || "reward") + " from Maeve."); }} className="mt-2 rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white disabled:opacity-50">
              {claimed ? "Collected" : points >= reward.at ? "Collect Reward" : "Locked"}
            </button>
          </div>;
        })}
      </div>
      <p role="status" aria-live="polite" className="mt-3 text-sm font-semibold text-teal-900">{message}</p>
    </section>
  );
}
