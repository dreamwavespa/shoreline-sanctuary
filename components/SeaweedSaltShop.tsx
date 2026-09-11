"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ITEMS } from "@/lib/items";
import { SCENES } from "@/lib/media";
import { getShopDateKey, getTodaysDiscovery, SELL_PRICES, SHOP_STOCK } from "@/lib/shop";
import { useGame } from "@/lib/store";

type ShopSection = "buy" | "sell" | "discoveries" | "talk";

const SEAWEED_LINES = [
  "Every object the tide returns has another life in it. Sometimes it only needs the right pair of paws.",
  "Maeve knows the weather. I know what the weather leaves behind.",
  "Bring me good handiwork, useful foods, or a curious shoreline find. I'll always offer a fair trade.",
  "The best sea glass hides where the water turns quiet. The second best sits in my apron pocket.",
];

function ItemIcon({ itemId }: { itemId: string }) {
  const item = ITEMS[itemId];
  if (!item) return null;
  return item.isEmoji ? (
    <span className="text-3xl" aria-hidden="true">{item.icon}</span>
  ) : (
    <Image src={item.icon} alt="" width={52} height={52} unoptimized className="h-12 w-12 object-contain" />
  );
}

export default function SeaweedSaltShop() {
  const { state, setScreen, setMusicOverride, play, buyFromSeaweed, sellToSeaweed } = useGame();
  const [section, setSection] = useState<ShopSection>("buy");
  const [discoveryRevealed, setDiscoveryRevealed] = useState(false);
  const [talkIndex, setTalkIndex] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const discovery = useMemo(() => getTodaysDiscovery(), []);
  const dateKey = useMemo(() => getShopDateKey(), []);
  const discoveryPurchased = state.seaweedDiscoveryPurchases.includes(dateKey);

  const sellable = Object.entries(state.inventory)
    .filter(([itemId, count]) => count > 0 && SELL_PRICES[itemId])
    .sort((a, b) => ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name));

  useEffect(() => {
    setMusicOverride("market");
    play("shopDoor", 0.55);
    const focusTimer = window.setTimeout(() => titleRef.current?.focus(), 500);
    return () => {
      window.clearTimeout(focusTimer);
      setMusicOverride(null);
    };
    // Enter and leave once per shop visit. The game-store callbacks change
    // identity as save data changes, so depending on them would replay the
    // door chime after every purchase or sale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revealDiscovery = () => {
    setDiscoveryRevealed(true);
    play("seaweedDiscovery", 0.7);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f3e4c8] pb-24 text-stone-900">
      <section className="relative h-52 overflow-hidden sm:h-64">
        <Image
          src={SCENES.seaweedShopExterior}
          alt="Seaweed and Salt, a weathered cedar shop beside the shoreline"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/15 to-transparent" />
        <button
          type="button"
          onClick={() => setScreen("beach")}
          className="absolute left-3 top-3 rounded-full bg-stone-950/75 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-cyan-200"
        >
          ← Return to Beach
        </button>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">Provisions Crafts and Tidal Curios</p>
          <h1 ref={titleRef} tabIndex={-1} className="font-serif text-3xl font-bold outline-none">Seaweed &amp; Salt</h1>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-4">
        <section className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-3 shadow-sm">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
            <Image src={SCENES.seaweedPortrait} alt="Seaweed the otter wearing her blue work apron" fill unoptimized sizes="80px" className="object-cover" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">Seaweed</h2>
            <p className="text-sm text-stone-700">“Come in! The morning tide brought a few surprises.”</p>
            <p className="mt-1 font-bold text-teal-800" aria-label={`${state.sandDollars} Sand Dollars`}>
              🪙 {state.sandDollars} Sand Dollars
            </p>
          </div>
        </section>

        <nav aria-label="Seaweed and Salt shop sections" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            ["buy", "Buy Goods"],
            ["sell", "Sell & Trade"],
            ["discoveries", "Discoveries"],
            ["talk", "Talk to Seaweed"],
          ] as [ShopSection, string][]).map(([id, label]) => (
            <button
              type="button"
              key={id}
              aria-pressed={section === id}
              onClick={() => setSection(id)}
              className={`min-h-12 rounded-xl px-3 py-2 text-sm font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-cyan-300 ${
                section === id ? "bg-teal-800 text-white" : "border border-stone-300 bg-white text-stone-800"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {section === "buy" && (
          <section aria-labelledby="shop-buy-heading">
            <h2 id="shop-buy-heading" className="font-serif text-2xl font-bold">Goods on the Shelves</h2>
            <p className="mt-1 text-sm text-stone-700">Pantry favorites, useful materials, and carefully cleaned salvage.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {SHOP_STOCK.map((listing) => {
                const item = ITEMS[listing.itemId];
                const canAfford = state.sandDollars >= listing.price;
                return (
                  <article key={listing.itemId} className="flex gap-3 rounded-2xl border border-stone-300 bg-white p-3 shadow-sm">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cyan-50"><ItemIcon itemId={listing.itemId} /></div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-sm text-stone-600">{listing.note}</p>
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => buyFromSeaweed(listing.itemId)}
                        aria-label={`Buy ${item.name} for ${listing.price} Sand Dollars`}
                        className="mt-2 min-h-11 w-full rounded-xl bg-teal-700 px-3 py-2 text-sm font-bold text-white disabled:bg-stone-300 disabled:text-stone-600"
                      >
                        Buy · 🪙 {listing.price}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {section === "sell" && (
          <section aria-labelledby="shop-sell-heading">
            <h2 id="shop-sell-heading" className="font-serif text-2xl font-bold">Sell to Seaweed</h2>
            <p className="mt-1 text-sm text-stone-700">Seaweed buys one item at a time so you always know what remains in your collection.</p>
            {sellable.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-stone-400 bg-white/70 p-5 text-center">
                <p className="font-bold">Nothing ready to trade yet.</p>
                <p className="mt-1 text-sm text-stone-600">Search the beach, tide pool, or cove for shoreline goods.</p>
                <button type="button" onClick={() => setScreen("bucket")} className="mt-3 min-h-11 rounded-xl bg-stone-800 px-4 py-2 font-bold text-white">View Collection</button>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {sellable.map(([itemId, count]) => {
                  const item = ITEMS[itemId];
                  const price = SELL_PRICES[itemId];
                  return (
                    <div key={itemId} className="flex items-center gap-3 rounded-2xl border border-stone-300 bg-white p-3 shadow-sm">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50"><ItemIcon itemId={itemId} /></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-stone-600">You have {count}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => sellToSeaweed(itemId)}
                        aria-label={`Sell one ${item.name} for ${price} Sand Dollars. You have ${count}.`}
                        className="min-h-11 rounded-xl bg-amber-700 px-3 py-2 text-sm font-bold text-white"
                      >
                        Sell 1 · 🪙 {price}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {section === "discoveries" && (
          <section aria-labelledby="shop-discovery-heading" className="overflow-hidden rounded-2xl border border-cyan-300 bg-slate-950 text-white shadow-lg">
            <div className="relative h-40">
              <Image src={SCENES.seaweedShopCounter} alt="Seaweed's wooden counter with tidal curios in glass display cases" fill unoptimized sizes="100vw" className="object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <h2 id="shop-discovery-heading" className="absolute bottom-3 left-4 font-serif text-2xl font-bold">Seaweed’s Dive Discovery</h2>
            </div>
            <div className="p-4">
              {!discoveryRevealed ? (
                <>
                  <p className="text-cyan-50">Seaweed has tucked something unusual beneath the counter.</p>
                  <button type="button" onClick={revealDiscovery} className="mt-3 min-h-12 w-full rounded-xl bg-cyan-200 px-4 py-3 font-bold text-slate-950 focus:outline-none focus:ring-4 focus:ring-white">
                    Ask What Seaweed Found
                  </button>
                </>
              ) : (
                <div aria-live="polite">
                  <div className="flex items-start gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/10"><ItemIcon itemId={discovery.itemId} /></div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-cyan-100">{discovery.title}</h3>
                      <p className="mt-1 text-sm text-cyan-50">{discovery.story}</p>
                      <p className="mt-1 text-sm text-cyan-100">{discovery.note}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={discoveryPurchased || state.sandDollars < discovery.price}
                    onClick={() => buyFromSeaweed(discovery.itemId, dateKey)}
                    className="mt-4 min-h-12 w-full rounded-xl bg-cyan-200 px-4 py-3 font-bold text-slate-950 disabled:bg-slate-700 disabled:text-slate-300"
                  >
                    {discoveryPurchased ? "Reserved for You · Purchased" : `Buy Today’s Discovery · 🪙 ${discovery.price}`}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {section === "talk" && (
          <section aria-labelledby="shop-talk-heading" className="overflow-hidden rounded-2xl border border-amber-300 bg-white shadow-sm">
            <div className="relative h-44">
              <Image src={SCENES.seaweedShopInterior} alt="The warm wooden interior of Seaweed and Salt" fill unoptimized sizes="100vw" className="object-cover" />
            </div>
            <div className="p-4">
              <h2 id="shop-talk-heading" className="font-serif text-2xl font-bold">A Word with Seaweed</h2>
              <p aria-live="polite" className="mt-2 text-stone-700">“{SEAWEED_LINES[talkIndex]}”</p>
              <button
                type="button"
                onClick={() => setTalkIndex((index) => (index + 1) % SEAWEED_LINES.length)}
                className="mt-4 min-h-12 w-full rounded-xl bg-stone-800 px-4 py-3 font-bold text-white"
              >
                Keep Talking
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
