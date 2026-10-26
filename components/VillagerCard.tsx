"use client";
import { useState } from "react";

const versionedImage = (src: string) => src.startsWith("/images/") ? `${src}?v=${process.env.NEXT_PUBLIC_SHORELINE_ASSET_VERSION || "development"}` : src;
import Image from "next/image";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { currentShelbyOrder, isPackageComplete } from "@/lib/shelbyShipping";
import { VillagerDef } from "@/lib/villagers";
import { ScheduleStatus } from "@/lib/schedule";
import { getTravelingMerchantStock } from "@/lib/travelingMerchants";
import { getNextSeaGlassSisterReward, SEA_GLASS_SISTER_REWARDS, sisterRewardClaimId } from "@/lib/seaGlassSisterRewards";

const RING_BY_GROUP: Record<string, string> = {
  "sea-glass-sister": "ring-indigo-200",
  "shoreline-resident": "ring-sky-200",
  "underwater-village": "ring-teal-200",
  "traveling-special": "ring-amber-200",
};

const BEACH_PORTRAITS: Record<string, string> = {
  sandy: "/images/Beach-Sandy-transparent.png",
  kai: "/images/Beach-Kai-transparent.png",
  sunny: "/images/Beach-Sunny-transparent.png",
  penelope: "/images/Beach-Penelope-transparent.png",
  olli: "/images/Olli-transparent.PNG",
  snappy: "/images/Snappy-transparent.PNG",
  elly: "/images/Elly-transparent.PNG",
  shelldon: "/images/Sheldon-transparent.PNG",
  shelby: "/images/Shelby-transparent.PNG",
  misty: "/images/Misty-transparent.PNG",
  angel: "/images/Angel-transparent.PNG",
  celeste: "/images/Celeste-transparent.PNG",
  orion: "/images/Orion-transparent.PNG",
};

const EMOJI_FALLBACK: Record<string, string> = {
  sandy: "🐦", olli: "🐙", kai: "🐚", sunny: "⭐", penelope: "🦢", coral: "🐴", mina: "🥭", bubbles: "🐬", pearl: "🪪", splash: "🥭", shelldon: "🐢", shelby: "🦀", misty: "🪼", angel: "🐠", melody: "💍", marella: "🔮", coralie: "🌿", kaiana: "🧭",
};

export default function VillagerCard({ villager, schedule }: { villager: VillagerDef; schedule?: ScheduleStatus | null; }) {
  const { state, giftVillager, buyFromTraveler, markVillagerEncounter, visitNightVisitor, play, packShelbyItem, sendShelbyShipment, claimShelbyShipment, openShelbyCargo } = useGame();
  const [expanded, setExpanded] = useState(false);
  const [cargoResult, setCargoResult] = useState<string | null>(null);
  const scheduleKnown = schedule !== undefined && schedule !== null;
  const isAway = scheduleKnown && !schedule!.available;
  const shippingOrder = currentShelbyOrder(state.shelbyShipmentDate ? Math.max(0, (state.shelbyShipmentCount || 1) - 1) : (state.shelbyShipmentCount || 0));
  const remainingItems = shippingOrder.requires.reduce((total, requirement) => total + Math.max(0, requirement.count - ((state.shelbyPacked || {})[requirement.itemId] || 0)), 0);
  const giftCount = state.villagerGiftCounts[villager.id] || 0;
  const sisterRewards = SEA_GLASS_SISTER_REWARDS[villager.id] || [];
  const nextSisterReward = getNextSeaGlassSisterReward(villager.id, giftCount);
  const merchantId: "shelldon" | "shelby" | null = villager.id === "shelldon" || villager.id === "shelby" ? villager.id : null;
  const merchantStock = merchantId ? getTravelingMerchantStock(merchantId, new Date(), state) : [];
  const nightVisitorId: "celeste" | "orion" | null = villager.id === "celeste" || villager.id === "orion" ? villager.id : null;
  const nightVisits = nightVisitorId ? (state.nightVisitorVisits[nightVisitorId] || 0) : 0;
  const [nightVisitFeedback, setNightVisitFeedback] = useState("");


  const availableGifts = villager.gift.lovedGiftIds.map((id) => ({ id, have: state.inventory[id] || 0, def: ITEMS[id] })).filter((g) => g.def);
  const potteryGifts = Object.entries(state.inventory)
    .filter(([id, count]) => count > 0 && /^(flower-vase|coastal-bowl|seashell-cup|driftwood-candleholder|porcelain-tea-set|pearl-vase|porcelain-bowl|moonlight-candleholder)(--.*)?$/.test(id) && ITEMS[id])
    .sort(([a], [b]) => ITEMS[a].name.localeCompare(ITEMS[b].name));
  const [selectedPottery, setSelectedPottery] = useState("");
  const handleGift = (itemId: string) => {
    giftVillager(villager.id, itemId);
  };

  return (
    <div className={`rounded-2xl bg-white/90 shadow-md ring-1 ${RING_BY_GROUP[villager.group] || "ring-amber-200"} overflow-hidden`}>
      <button type="button" onClick={() => {
        if (!expanded && !isAway) markVillagerEncounter(villager.id);
        setExpanded((v) => !v);
      }} aria-expanded={expanded} className="w-full text-left p-4 flex items-center gap-3">
        <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-amber-50 flex items-center justify-center">
          {(BEACH_PORTRAITS[villager.id] || villager.imageUrl) ? <Image src={versionedImage(BEACH_PORTRAITS[villager.id] || villager.imageUrl!)} alt={villager.name} fill unoptimized className="object-contain p-1" /> : <span className="text-3xl">{EMOJI_FALLBACK[villager.id] || "🐚"}</span>}
        </div>
        <div className="flex-1">
          <p className="font-bold text-amber-900">{villager.name} <span className="font-normal text-amber-700">{villager.title}</span></p>
          <p className="text-xs text-amber-600">{villager.role}{giftCount > 0 && <span className="ml-1 text-rose-500">· 🎁 x{giftCount}</span>}</p>
          {villager.schedule && <p className="text-[11px] text-amber-500 italic">{villager.schedule}</p>}
          {scheduleKnown && <p className={`text-[11px] font-semibold mt-0.5 ${isAway ? "text-slate-500" : "text-emerald-600"}`}>{isAway ? `🌘 ${schedule!.awayLabel}` : `🟢 ${schedule!.presentLabel}`}</p>}
        </div>
        <span className="text-lg text-amber-400" aria-hidden="true">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-amber-100 pt-3 space-y-3">
          <p className="text-xs text-amber-700">{villager.personality}</p>
          <p className="text-xs text-amber-700">{villager.gameplay}</p>

          {villager.id === "shelldon" && (
            <section aria-label="Sheldon's friendship progress" className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-200 space-y-2">
              <h3 className="font-bold text-emerald-950">Sheldon's Treasures from the Tides</h3>
              <p className="text-sm font-semibold text-emerald-900" aria-live="polite">Friendship Progress: {giftCount} {giftCount === 1 ? "gift" : "gifts"} given</p>
              <p className="text-xs text-emerald-800">Rare Enriched Soil and Deep-Sea Seeds are his favorite gifts.</p>
              {([
                [3, "Traveler's Botanical Journal"],
                [5, "Verdant Tide Shell"],
                [8, "Turtle's Watering Can"],
                [12, "Moon Tide Seed"],
              ] as const).map(([needed, name]) => (
                <p key={needed} className="text-sm text-emerald-950">{giftCount >= needed ? "✓ Unlocked" : `${Math.max(0, needed - giftCount)} more to unlock`}: {name} ({needed} gifts)</p>
              ))}
              <p className="text-sm font-semibold text-emerald-900" aria-live="polite">{([3, 5, 8, 12].find((needed) => giftCount < needed) !== undefined) ? `Next reward at ${[3, 5, 8, 12].find((needed) => giftCount < needed)} gifts.` : "All friendship milestones reached!"}</p>
            </section>
          )}

          {sisterRewards.length > 0 && (
            <section aria-label={`${villager.name} friendship rewards`} className="rounded-xl bg-indigo-50 p-3 ring-1 ring-indigo-200">
              <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-indigo-950">Sea Glass Sister Friendship</h3><p className="mt-0.5 text-xs text-indigo-800">{giftCount} loved {giftCount === 1 ? "gift" : "gifts"} given</p></div><span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-indigo-800 ring-1 ring-indigo-200">{Math.min(giftCount, 12)}/12</span></div>
              <div className="mt-3 space-y-2">
                {sisterRewards.map((reward) => {
                  const reached = giftCount >= reward.gifts;
                  const claimed = state.crafted.includes(sisterRewardClaimId(villager.id, reward.gifts));
                  return <div key={reward.gifts} className={`rounded-lg p-2.5 ring-1 ${reached ? "bg-emerald-50 ring-emerald-200" : "bg-white ring-indigo-100"}`}><p className={`text-xs font-bold ${reached ? "text-emerald-900" : "text-indigo-950"}`}>{reached ? "✓ " : ""}{reward.gifts} gifts · {reward.name}</p><p className={`mt-0.5 text-[11px] ${reached ? "text-emerald-700" : "text-indigo-700"}`}>{reward.description}</p>{claimed && <p className="mt-1 text-[11px] font-semibold text-emerald-800">Reward received · permanently unlocked</p>}</div>;
                })}
              </div>
              <p className="mt-3 text-xs font-semibold text-indigo-900" aria-live="polite">{nextSisterReward ? `Next reward at ${nextSisterReward.gifts} gifts: ${nextSisterReward.name}.` : "All current friendship milestones reached."}</p>
            </section>
          )}

          {villager.id === "shelby" && (
            <section aria-label="Shelby's Shipping Orders" className="mt-3 rounded-xl bg-sky-50 p-3 ring-1 ring-sky-200 space-y-3">
              <h3 className="font-bold text-sky-950">📦 Shipping Orders</h3>
              <div className="rounded-lg border border-sky-200 bg-white p-3 space-y-2">
                <h4 className="font-bold text-sky-950">🎁 Sealed Mystery Cargo</h4>
                <p className="text-sm">Sealed parcels owned: {state.inventory["shelby-sealed-cargo"] || 0}. Open one for a surprise imported supply, rare material, or exceptional maritime treasure.</p>
                <p className="text-sm font-semibold text-sky-900">Your Sand Dollars: {state.sandDollars} · Price: 24</p>
                <button type="button" disabled={state.sandDollars < 24}
                  onClick={() => { if (buyFromTraveler("shelby", "shelby-sealed-cargo")) setCargoResult(null); }}
                  className="rounded-lg bg-amber-700 px-3 py-2 text-white disabled:opacity-40"
                  aria-label="Buy one sealed mystery cargo box for 24 Sand Dollars">Buy Sealed Mystery Cargo — 24 Sand Dollars</button>
                <button type="button" disabled={(state.inventory["shelby-sealed-cargo"] || 0) < 1}
                  onClick={() => { const reward = openShelbyCargo(); if (reward) setCargoResult(reward); }}
                  className="rounded-lg bg-sky-800 px-3 py-2 text-white disabled:opacity-40">Open one mystery cargo box</button>
                {cargoResult && <p role="status" className="font-semibold text-emerald-900">You discovered: {ITEMS[cargoResult]?.name || cargoResult}! Added to inventory.</p>}
              </div>

              <p className="text-xs text-sky-800">Pack common Shoreline finds. Send a full crate and collect its return cargo on the next calendar day.</p>
              <h4 className="font-semibold text-sm">{shippingOrder.title}</h4>
              {shippingOrder.requires.map(({ itemId, count }) => {
                const packed = (state.shelbyPacked || {})[itemId] || 0;
                const available = state.inventory[itemId] || 0;
                return <div key={itemId} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>{ITEMS[itemId]?.name || itemId}: {packed} of {count} packed; {available} available</span>
                  <button type="button" disabled={!!state.shelbyShipmentDate || packed >= count || available < 1}
                    onClick={() => { if (packShelbyItem(itemId)) play("shelbyBox", 0.65); }}
                    className="rounded-lg bg-sky-800 px-3 py-2 text-white disabled:opacity-40"
                    aria-label={`Pack one ${ITEMS[itemId]?.name || itemId}`}>Pack one</button>
                </div>;
              })}
              <p role="status" className="text-sm text-sky-900">{remainingItems === 0 ? "All required items packed. Crate ready to send." : `${remainingItems} items left to pack before sending.`}</p>
              {state.shelbyShipmentDate ? (
                <div role="status" className="space-y-2">
                  <p>Crate sent on {state.shelbyShipmentDate}. Your return cargo will be ready the next day.</p>
                  <button type="button" onClick={() => { if (claimShelbyShipment()) play("shelbyMailbox", 0.7); }}
                    className="rounded-lg bg-emerald-800 px-3 py-2 text-white">Collect returning cargo (when ready)</button>
                </div>
              ) : (
                <button type="button" disabled={!isPackageComplete(shippingOrder, state.shelbyPacked || {})}
                  onClick={sendShelbyShipment}
                  className="rounded-lg bg-emerald-800 px-3 py-2 text-white disabled:opacity-40" aria-label={remainingItems > 0 ? `Send crate unavailable. Pack ${remainingItems} more items first.` : "Send packed crate"}>Send packed crate</button>
              )}
              <p className="text-xs text-sky-800">Return reward: {shippingOrder.rewardCount} {ITEMS[shippingOrder.rewardItemId]?.name || shippingOrder.rewardItemId} and {shippingOrder.sandDollars} Sand Dollars. A new order appears after you collect the returning cargo. Some deliveries also contain mystery pearls; every third and fifth shipment earns a rarer treasure.</p>
            </section>
          )}

          {nightVisitorId && (
            <section aria-label={`${villager.name} nighttime friendship`} className="rounded-xl bg-cyan-50 p-3 ring-1 ring-cyan-200">
              <h3 className="text-sm font-bold text-cyan-950">Moonlit Friendship</h3>
              <p className="mt-1 text-xs text-cyan-800">{nightVisits} of 5 nighttime visits shared</p>
              <p className="mt-1 text-[11px] text-cyan-700">A visit can be recorded once per real-world night. Special treasures are shared as your friendship grows.</p>
              <button type="button" onClick={() => { const result = visitNightVisitor(nightVisitorId); setNightVisitFeedback(result.counted ? (result.rewardItemId ? `${villager.name} shared a special treasure! Nighttime visit ${result.visits} recorded.` : `Moonlit moment shared with ${villager.name}. Nighttime visit ${result.visits} recorded.`) : `No new visit recorded. You can spend time with ${villager.name} once per night.`); }} className="mt-3 min-h-11 w-full rounded-lg bg-cyan-700 px-3 py-2 text-sm font-bold text-white active:bg-cyan-800">
                Spend a Moonlit Moment with {villager.name}
              </button>
              {nightVisitFeedback && <p role="status" aria-live="polite" className="mt-2 text-sm text-cyan-900">{nightVisitFeedback}</p>}
            </section>
          )}

          {merchantId && !isAway && (
            <section aria-label={`${villager.name}'s current stock`} className="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
              <div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-sm font-bold text-amber-950">Current Traveling Stock</h3><span className="text-xs font-semibold text-amber-800">🪙 {state.sandDollars}</span></div>
              <p className="mb-3 text-xs text-amber-700">{villager.id === "shelldon" ? "This selection changes each Shelldon Sunday." : "Shelby brings four rotating cargo items and any blueprints still needed for future locked areas."}</p>
              <div className="space-y-2">
                {merchantStock.map((listing) => {
                  const item = ITEMS[listing.itemId]; if (!item) return null;
                  const count = state.inventory[listing.itemId] || 0;
                  const owned = (listing.kind === "blueprint" && state.blueprints.includes(listing.itemId)) || (listing.itemId === "seaside-air-pump" && count > 0);
                  return <div key={listing.itemId} className="rounded-xl bg-white p-3 ring-1 ring-amber-100"><div className="flex items-start gap-2"><span className="text-xl" aria-hidden="true">{item.isEmoji ? item.icon : "🎁"}</span><div className="min-w-0 flex-1"><p className="text-xs font-bold text-amber-950">{item.name}</p><p className="mt-0.5 text-[11px] text-amber-700">{listing.note}</p>{listing.kind !== "blueprint" && count > 0 && <p className="mt-1 text-[11px] font-semibold text-emerald-700">In inventory: {count}</p>}</div></div><button type="button" disabled={owned || state.sandDollars < listing.price} onClick={() => buyFromTraveler(merchantId, listing.itemId)} className="mt-2 min-h-11 w-full rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white active:bg-amber-800 disabled:bg-amber-100 disabled:text-amber-500">{owned ? (listing.kind === "blueprint" ? "Owned · Blueprint Collection" : "Owned · Permanent Tool") : `Buy for ${listing.price} Sand Dollars`}</button></div>;
                })}
              </div>
            </section>
          )}

          {!nightVisitorId && (isAway ? <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 text-center"><p className="text-xs font-semibold text-slate-600">{schedule!.awayLabel}</p><p className="text-[11px] text-slate-500 mt-1">Come back when they're around to gift them something.</p></div> : (
            <div><p className="text-[11px] font-semibold text-amber-800/70 uppercase tracking-wide mb-1.5">Loved Gifts</p>{availableGifts.length === 0 ? <p className="text-xs text-amber-500 italic">You don't have any of their favorite gifts yet.</p> : <div className="flex flex-wrap gap-2">{availableGifts.map((g) => <button key={g.id} type="button" disabled={g.have < 1} onClick={() => handleGift(g.id)} className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full text-white disabled:bg-amber-100 disabled:text-amber-400 bg-rose-500 active:bg-rose-600">{g.def.isEmoji ? <span>{g.def.icon}</span> : <Image src={g.def.icon} alt={g.def.name} width={16} height={16} unoptimized />}Give {g.def.name} ({g.have})</button>)}</div>}
              {potteryGifts.length > 0 && <div className="mt-3 space-y-2"><label htmlFor={`pottery-gift-${villager.id}`} className="block text-xs font-semibold text-amber-900">Gift handmade pottery</label><select id={`pottery-gift-${villager.id}`} value={selectedPottery} onChange={event => setSelectedPottery(event.target.value)} className="min-h-11 w-full rounded-lg border border-amber-300 bg-white p-2 text-sm"><option value="">Choose a pottery piece</option>{potteryGifts.map(([id, count]) => <option key={id} value={id}>{ITEMS[id].name} ({count} owned)</option>)}</select><button type="button" disabled={!selectedPottery || !(state.inventory[selectedPottery] > 0)} onClick={() => { if (selectedPottery && giftVillager(villager.id, selectedPottery)) setSelectedPottery(""); }} className="min-h-11 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Give selected pottery</button><p className="text-xs text-amber-800">Handmade pottery counts as a gift. Favorite gifts still have their own special reactions.</p></div>}</div>
          ))}
          {!nightVisitorId && <p className="text-[11px] text-amber-500 italic">Reaction: {villager.gift.reactionVisual} — {villager.gift.reactionSfx}</p>}
        </div>
      )}
    </div>
  );
}
