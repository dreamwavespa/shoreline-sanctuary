"use client";
import { useState } from "react";
import Image from "next/image";
import LunaDiscovery from "./LunaDiscovery";
import TwinkleCorner from "./TwinkleCorner";

export default function MoonlitSandbar({ onReturn }: { onReturn: () => void }) {
  const [visitor, setVisitor] = useState<"luna" | "twinkle" | null>(null);
  return <section aria-labelledby="moonlit-sandbar-heading" className="space-y-3">
    {!visitor ? <>
      <div className="relative h-[52vh] min-h-[340px] max-h-[650px] overflow-hidden rounded-2xl ring-1 ring-indigo-200">
        <Image src="/images/Moonlit-sandbar-background.PNG" alt="A moonlit beach with lanterns, luminous shells, tide pools and a glowing trail beneath a starry sky." fill unoptimized sizes="100vw" className="object-cover" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-slate-950/85 to-transparent p-4">
          <h2 id="moonlit-sandbar-heading" className="text-xl font-bold text-white">Moonlit Sandbar</h2>
          <p className="text-sm text-white">Follow the glowing shells to visit Boo's nighttime friends.</p>
        </div>
        <div className="absolute inset-x-3 bottom-3 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setVisitor("luna")} className="min-h-14 rounded-xl bg-indigo-950/90 px-3 py-3 font-semibold text-white ring-2 ring-cyan-200 focus:outline-none focus:ring-4 focus:ring-amber-300">🌙 Visit Luna the Moon Snail</button>
          <button type="button" onClick={() => setVisitor("twinkle")} className="min-h-14 rounded-xl bg-indigo-950/90 px-3 py-3 font-semibold text-white ring-2 ring-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-300">🐚 Visit Twinkle the Hermit Crab</button>
        </div>
      </div>
      <p className="text-sm text-indigo-100">More nighttime friends, including Glimmer and Mothie, may join this shore later.</p>
    </> : <>
      <button type="button" onClick={() => setVisitor(null)} className="min-h-12 w-full rounded-xl bg-indigo-200 px-4 py-3 font-bold text-indigo-950 focus:ring-4 focus:ring-amber-300">← Return to Moonlit Sandbar</button>
      <div className="relative h-[38vh] min-h-[240px] max-h-[500px] overflow-hidden rounded-2xl ring-1 ring-indigo-200">
        <Image
          src={visitor === "luna" ? "/images/Luna-moonlight-polishing-nook.png" : "/images/Twinkle-shell-nook.png"}
          alt={visitor === "luna" ? "Luna's moonlit polishing nook, with glowing wax jars, pearly shells and an ocean view." : "Twinkle's cozy nighttime shell nook, filled with driftwood shelves, shell baskets and treasures."}
          fill unoptimized sizes="100vw" className="object-cover"
        />
      </div>
      {visitor === "luna" ? <LunaDiscovery /> : <TwinkleCorner />}
    </>}
    {!visitor && <button type="button" onClick={onReturn} className="min-h-12 w-full rounded-xl bg-white px-4 py-3 font-bold text-teal-950 focus:ring-4 focus:ring-amber-300">← Return to Secret Sandbar</button>}
  </section>;
}
