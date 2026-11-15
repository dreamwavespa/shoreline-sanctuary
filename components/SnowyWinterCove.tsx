"use client";

import Image from "next/image";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { VILLAGERS } from "@/lib/villagers";
import { useEffect, useRef, useState } from "react";

type Spot = "snowy" | "floes" | "blocks" | "snowmen" | "pool";
const SPOTS: { id: Spot; label: string; description: string; left: string; top: string }[] = [
  { id: "snowy", label: "Visit Snowy the harp seal pup", description: "Snowy welcomes you from her favorite ice floe. Her blue snowflake scarf keeps her cozy.", left: "22%", top: "73%" },
  { id: "floes", label: "Explore the floating ice floes", description: "Wide, glittering ice floes drift gently across the sheltered cove. Ice-floe games are coming soon.", left: "43%", top: "44%" },
  { id: "blocks", label: "Visit the ice block game area", description: "Translucent blue ice blocks are ready for future stacking and sliding games.", left: "81%", top: "54%" },
  { id: "snowmen", label: "Visit the snowman-making clearing", description: "A snowman waits by the trees. The snowball mold will unlock snowman-making in a future update.", left: "83%", top: "27%" },
  { id: "pool", label: "Explore Snowy's sheltered swimming pool", description: "The cove's sheltered water stays open for Snowy to swim and play.", left: "47%", top: "66%" },
];

export default function SnowyWinterCove({ onBack }: { onBack: () => void }) {
  const { state, giftVillager } = useGame();
  const [giftMessage,setGiftMessage] = useState("");
  const favoriteGifts = VILLAGERS.snowy.gift.lovedGiftIds;
  const [spot, setSpot] = useState<Spot | null>(null);
  const [night, setNight] = useState(false);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const dialogHeading = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    const update = () => { const h = new Date().getHours(); setNight(h >= 19 || h < 6); };
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => { if (spot) dialogHeading.current?.focus(); }, [spot]);
  const close = () => { setGiftMessage(""); setSpot(null); window.setTimeout(() => returnFocus.current?.focus(), 0); };
  const selected = SPOTS.find(s => s.id === spot);
  return <section aria-label="Snowy's Winter Cove" className="mx-auto max-w-3xl space-y-3 rounded-xl bg-indigo-950 p-3 text-white">
    <button type="button" onClick={onBack} className="min-h-12 rounded-lg bg-amber-100 px-5 py-3 font-bold text-indigo-950">Return to Coconut Grove</button>
    <h1 className="text-2xl font-bold">Snowy's Winter Cove</h1>
    <p className="text-sm text-indigo-100">Visit Snowy, explore the floating ice, and discover the future winter activity areas. The cove changes from day to night automatically.</p>
    <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "2 / 3" }}>
      <Image src={night ? "/images/Winter-cove-night.PNG" : "/images/Winter-cove-day.PNG"} alt={night ? "Moonlit winter cove with Snowy the white seal, glowing lanterns, floating ice floes, an ice block area, and a snowy clearing." : "Sunny winter cove with Snowy the white seal, floating ice floes, a sheltered swimming pool, an ice block area, and a snowman clearing."} fill unoptimized priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
      {SPOTS.map(s => <button key={s.id} type="button" style={{ left:s.left, top:s.top, transform:"translate(-50%,-50%)" }} className="absolute z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-amber-200 bg-indigo-950/85 px-2 text-xs font-bold text-white shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300" aria-label={s.label} onClick={e => { returnFocus.current = e.currentTarget; setSpot(s.id); }}>{s.id === "snowy" ? "🦭" : s.id === "blocks" ? "🧊" : s.id === "snowmen" ? "⛄" : s.id === "pool" ? "🌊" : "❄️"}</button>)}
    </div>
    <p className="text-sm text-indigo-100">Select any labeled hotspot in the picture. All five areas are also available as buttons below for screen-reader navigation.</p>
    <div className="grid gap-2 sm:grid-cols-2">{SPOTS.map(s => <button key={s.id} type="button" className="min-h-12 rounded-lg border border-amber-200 bg-indigo-900 p-3 text-left font-semibold" onClick={e => { returnFocus.current=e.currentTarget;setSpot(s.id); }}>{s.label}</button>)}</div>
    {selected && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/90 p-4" onKeyDown={e => { if(e.key==="Escape"){e.preventDefault();close();} if(e.key==="Tab"){e.preventDefault();(e.currentTarget.querySelector('[role="dialog"] button') as HTMLButtonElement)?.focus();} }}>
      <div role="dialog" aria-modal="true" aria-labelledby="snowy-dialog-title" aria-describedby="snowy-dialog-description" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border-2 border-amber-200 bg-indigo-950 p-5 text-white">
        <h2 ref={dialogHeading} tabIndex={-1} id="snowy-dialog-title" className="text-xl font-bold">{selected.label}</h2>
        {spot === "snowy" && <Image src="/images/Snowy-portrait.PNG" alt="Snowy, a fluffy white harp seal pup wearing a blue snowflake scarf." width={280} height={280} unoptimized className="mx-auto my-3 h-52 w-auto object-contain" />}
        <p id="snowy-dialog-description" className="my-4">{selected.description}</p>
        {spot === "snowy" && <section aria-label="Snowy's friendship and gifts" className="my-4 space-y-3 rounded-xl bg-indigo-900 p-3">
          <h3 className="font-bold">Snowy's Friendship</h3>
          <p aria-live="polite">Favorite gifts given: {state.villagerGiftCounts.snowy || 0}</p>
          <p className="text-sm">Snowy loves fresh reef fish, beach balls, snowflake pearls, coconut drops, and frozen drinks.</p>
          <div className="grid gap-2">{favoriteGifts.map(id=><button key={id} type="button" disabled={(state.inventory[id]||0)<1} onClick={()=>{const success=giftVillager("snowy",id);setGiftMessage(success?`Snowy happily accepts your ${ITEMS[id]?.name||id}! Your friendship grows.`:`You need a ${ITEMS[id]?.name||id} in your inventory first.`);}} className="min-h-11 rounded-lg border border-sky-200 bg-indigo-800 p-2 text-left disabled:opacity-50">Give {ITEMS[id]?.name||id} — {state.inventory[id]||0} available</button>)}</div>
          {giftMessage&&<p role="status" className="font-semibold">{giftMessage}</p>}
        </section>}
        <button type="button" onClick={close} className="min-h-12 rounded-lg bg-amber-100 px-5 py-3 font-bold text-indigo-950">Return to Winter Cove</button>
      </div>
    </div>}
  </section>;
}
