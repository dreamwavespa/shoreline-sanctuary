"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ITEMS } from "@/lib/items";
import { SCENES } from "@/lib/media";
import { getShopDateKey, getTodaysDiscovery, SELL_PRICES, SHOP_STOCK } from "@/lib/shop";
import { useGame } from "@/lib/store";
import VillagerCard from "@/components/VillagerCard";
import { VILLAGERS } from "@/lib/villagers";

type ShopSection = "buy" | "sell" | "discoveries" | "talk" | "shipping";

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
  const { state, setScreen, setMusicOverride, play, buyFromSeaweed, sellToSeaweed, sellCustomJewelry, toggleCustomJewelryFavorite, sellCustomSandBottle, toggleCustomSandBottleFavorite } = useGame();
  const [section, setSection] = useState<ShopSection | null>(null);
  const [discoveryRevealed, setDiscoveryRevealed] = useState(false);
  const [talkIndex, setTalkIndex] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const openArea = (area: ShopSection, trigger: HTMLButtonElement) => { triggerRef.current = trigger; setSection(area); };
  const closeArea = () => { setSection(null); window.setTimeout(() => triggerRef.current?.focus(), 0); };
  useEffect(() => { if (section) closeRef.current?.focus(); }, [section]);
  const handleDialogKeys = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") { event.preventDefault(); closeArea(); return; }
    if (event.key !== "Tab") return;
    const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])') || []);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  const discovery = useMemo(() => getTodaysDiscovery(), []);
  const dateKey = useMemo(() => getShopDateKey(), []);
  const discoveryPurchased = state.seaweedDiscoveryPurchases.includes(dateKey);
  const copperWireStockUnlocked = state.rowboatRepaired && state.hasDivingGear;
  const visibleShopStock = SHOP_STOCK.filter(
    (listing) =>
      ITEMS[listing.itemId] &&
      (listing.itemId !== "copper-wire" || copperWireStockUnlocked)
  );

  const sellable = Object.entries(state.inventory)
    .filter(([itemId, count]) => count > 0 && SELL_PRICES[itemId] && ITEMS[itemId])
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
      <header className="flex items-center justify-between gap-3 px-4 pt-4">
        <h1 ref={titleRef} tabIndex={-1} className="font-serif text-2xl font-bold outline-none">Seaweed &amp; Salt</h1>
        <button type="button" onClick={() => setScreen("beach")} className="min-h-11 rounded-xl bg-teal-900 px-3 py-2 font-bold text-white">Return to Beach</button>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-4">
        <section aria-label="Explore Seaweed and Salt" className="relative overflow-hidden rounded-2xl shadow-lg">
          <div className="relative aspect-[3/2] min-h-0">
            <Image src={`/images/Shop-background.PNG?v=${process.env.NEXT_PUBLIC_SHORELINE_ASSET_VERSION || "development"}`} alt="Seaweed and Salt general store interior, with shelves to the left, Shelby's shipping counter in the center, and specialty displays to the right" fill unoptimized sizes="100vw" className="object-contain object-center" />
            {([
              { id: "buy", label: "Browse the shop shelves", x: "2%", y: "29%", w: "27%", h: "48%" },
              { id: "shipping", label: "Open Shelby's Shipping Counter", x: "35%", y: "40%", w: "31%", h: "40%" },
              { id: "discoveries", label: "Explore the seasonal and specialty display", x: "72%", y: "25%", w: "26%", h: "42%" },
              { id: "sell", label: "Sell and trade at the counter", x: "3%", y: "75%", w: "27%", h: "22%" },
            ] as const).map((area) => (
              <button key={area.id} type="button" aria-label={area.label} title={area.label}
                onClick={(event) => openArea(area.id, event.currentTarget)}
                className="absolute z-10 rounded-xl bg-transparent focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-300 focus-visible:bg-white/20"
                style={{ left: area.x, top: area.y, width: area.w, height: area.h }}>
                <span className="sr-only">{area.label}</span>
              </button>
            ))}
            <button type="button" aria-label="Talk to Seaweed the otter" title="Talk to Seaweed"
              onClick={(event) => openArea("talk", event.currentTarget)}
              className="absolute bottom-[3%] right-[2%] z-20 h-[43%] w-[24%] rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-300">
              <Image src={`/images/Shop-Seaweed-transparent.PNG?v=${process.env.NEXT_PUBLIC_SHORELINE_ASSET_VERSION || "development"}`} alt="" aria-hidden="true" fill unoptimized sizes="(max-width: 640px) 25vw, 160px" className="object-contain object-bottom drop-shadow-lg" />
            </button>
          </div>
        </section>
        {section && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-6" role="presentation" onClick={closeArea}>
            <section ref={dialogRef} role="dialog" aria-modal="true" aria-label={section === "buy" ? "Shop Shelves" : section === "sell" ? "Sell and Trade" : section === "shipping" ? "Shelby's Shipping Counter" : section === "discoveries" ? "Special Discoveries" : "Talk to Seaweed"} onKeyDown={handleDialogKeys} onClick={(event) => event.stopPropagation()} className="max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#f3e4c8] p-4 text-stone-900 shadow-xl">
              <button ref={closeRef} type="button" onClick={closeArea} className="mb-4 min-h-11 rounded-xl bg-teal-900 px-4 py-2 font-bold text-white">Close and return to shop</button>
        {section === "shipping" && (
          <section aria-label="Shelby's Shipping Counter" className="space-y-3">
            <h2 className="font-serif text-2xl font-bold">Shelby's Shipping Counter</h2>
            <p className="text-sm text-stone-700">Pack orders, send crates and collect returning cargo here every day, even when Shelby is away from the beach. Open the shipping card below to work on your order.</p>
            <VillagerCard villager={VILLAGERS.shelby} />
          </section>
        )}

        {section === "buy" && (
          <section aria-labelledby="shop-buy-heading">
            <h2 id="shop-buy-heading" className="font-serif text-2xl font-bold">Goods on the Shelves</h2>
            <p className="mt-1 text-sm text-stone-700">Pantry favorites, useful materials, and carefully cleaned salvage.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {visibleShopStock.map((listing) => {
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
            {!copperWireStockUnlocked && (
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
                Seaweed will begin stocking Weathered Copper Wire after you unlock both the Hidden Cove and the Reef.
              </p>
            )}
          </section>
        )}

        {section === "sell" && (
          <section aria-labelledby="shop-sell-heading">
            <h2 id="shop-sell-heading" className="font-serif text-2xl font-bold">Sell to Seaweed</h2>
            <p className="mt-1 text-sm text-stone-700">Seaweed buys one item at a time, including bottled Rose Milk, extra workshop décor, wind chimes, and sand-art bottles, so you always know what remains in your collection.</p>
            {sellable.length === 0 && state.customJewelry.length === 0 && state.customSandBottles.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-stone-400 bg-white/70 p-5 text-center">
                <p className="font-bold">Nothing ready to trade yet.</p>
                <p className="mt-1 text-sm text-stone-600">Search the beach, tide pool, or cove for shoreline goods.</p>
                <button type="button" onClick={() => setScreen("bucket")} className="mt-3 min-h-11 rounded-xl bg-stone-800 px-4 py-2 font-bold text-white">View Collection</button>
              </div>
            ) : (
              <div className="mt-3 space-y-5">
                {sellable.length > 0 && <div className="space-y-2">
                  <h3 className="font-bold text-stone-800">Shoreline Goods and Workshop Crafts</h3>
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
                </div>}

                {state.customJewelry.length > 0 && (
                  <section aria-labelledby="custom-jewelry-sales-heading" className="rounded-2xl border border-purple-300 bg-purple-50 p-4">
                    <h3 id="custom-jewelry-sales-heading" className="font-serif text-xl font-bold text-purple-950">Melody&apos;s Custom Jewelry</h3>
                    <p className="mt-1 text-sm text-purple-800">Seaweed values each one-of-a-kind piece by its type, materials, and pattern. Favorites are protected from sale.</p>
                    <div className="mt-3 space-y-3">
                      {state.customJewelry.map((piece) => (
                        <article key={piece.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-purple-200">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-bold text-purple-950">{piece.name}</h4>
                              <p className="text-xs capitalize text-purple-700">{piece.kind} · {piece.materials.length} design pieces</p>
                            </div>
                            <span className="text-2xl" aria-hidden="true">{piece.favorite ? "⭐" : piece.kind === "necklace" ? "📿" : piece.kind === "bracelet" ? "⭕" : "✨"}</span>
                          </div>
                          <p className="mt-2 text-sm text-stone-700">{piece.materials.map((itemId) => ITEMS[itemId]?.name).filter(Boolean).join(", ")}</p>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => toggleCustomJewelryFavorite(piece.id)} aria-pressed={piece.favorite} className="min-h-11 rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-950 ring-1 ring-amber-300">{piece.favorite ? "Unfavorite" : "Favorite"}</button>
                            <button type="button" disabled={piece.favorite} onClick={() => sellCustomJewelry(piece.id)} aria-label={piece.favorite ? `${piece.name} is favorited and protected from sale.` : `Sell ${piece.name} for ${piece.value} Sand Dollars.`} className="min-h-11 rounded-xl bg-purple-700 px-3 py-2 text-sm font-bold text-white disabled:bg-purple-200 disabled:text-purple-600">Sell · 🪙 {piece.value}</button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {state.customSandBottles.length > 0 && (
                  <section aria-labelledby="custom-sand-sales-heading" className="rounded-2xl border border-orange-300 bg-orange-50 p-4">
                    <h3 id="custom-sand-sales-heading" className="font-serif text-xl font-bold text-orange-950">Kaiana &amp; Boo&apos;s Custom Bottles</h3>
                    <p className="mt-1 text-sm text-orange-800">Seaweed values the colors, pattern, and optional treasure in each bottle. Favorites are protected from sale.</p>
                    <div className="mt-3 space-y-3">
                      {state.customSandBottles.map((bottle) => (
                        <article key={bottle.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-200">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="font-bold text-orange-950">{bottle.name}</h4>
                              <p className="text-xs text-orange-700">Five layers{bottle.accentId ? ` · ${ITEMS[bottle.accentId]?.name} accent` : " · no accent"}</p>
                            </div>
                            <span className="text-2xl" aria-hidden="true">{bottle.favorite ? "⭐" : "🏺"}</span>
                          </div>
                          <p className="mt-2 text-sm text-stone-700">{bottle.layers.map((itemId) => ITEMS[itemId]?.name).filter(Boolean).join(", ")}</p>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => toggleCustomSandBottleFavorite(bottle.id)} aria-pressed={bottle.favorite} className="min-h-11 rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-950 ring-1 ring-amber-300">{bottle.favorite ? "Unfavorite" : "Favorite"}</button>
                            <button type="button" disabled={bottle.favorite} onClick={() => sellCustomSandBottle(bottle.id)} aria-label={bottle.favorite ? `${bottle.name} is favorited and protected from sale.` : `Sell ${bottle.name} for ${bottle.value} Sand Dollars.`} className="min-h-11 rounded-xl bg-orange-700 px-3 py-2 text-sm font-bold text-white disabled:bg-orange-200 disabled:text-orange-700">Sell · 🪙 {bottle.value}</button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
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
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
