"use client";
import { useState } from "react";
import Image from "next/image";
import LunaDiscovery from "./LunaDiscovery";
import TwinkleCorner from "./TwinkleCorner";
import GlimmerSandArt from "./GlimmerSandArt";

export default function MoonlitSandbar({ onReturn }: { onReturn: () => void }) {
  const [visitor, setVisitor] = useState<"luna" | "twinkle" | "glimmer" | "mothie" | null>(null);
  return <section aria-labelledby="moonlit-sandbar-heading" className="space-y-3">
    {!visitor ? <>
      <div className="relative h-[52vh] min-h-[340px] max-h-[650px] overflow-hidden rounded-2xl ring-1 ring-indigo-200">
        <Image src="/images/Moonlit-sandbar-background.PNG" alt="A moonlit beach with lanterns, luminous shells, tide pools and a glowing trail beneath a starry sky." fill unoptimized sizes="100vw" className="object-cover" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-slate-950/85 to-transparent p-4">
          <h2 id="moonlit-sandbar-heading" className="text-xl font-bold text-white">Moonlit Sandbar</h2>
          <p className="text-sm text-white">Follow the glowing shells to visit Boo's nighttime friends.</p>
        </div>
        {/* Each friend has a distinct place in the scenery; labels remain readable and VoiceOver controls stay native buttons. */}
        <div className="absolute inset-x-2 bottom-[2%] grid grid-cols-4 items-end gap-1 sm:gap-3">
          {([
            ["luna", "Luna", "the Moon Snail", "/images/Luna-transparent.PNG"],
            ["twinkle", "Twinkle", "the Hermit Crab", "/images/Twinkle-hermit-crab.PNG"],
            ["glimmer", "Glimmer", "the Luminous Sea Slug", "/images/Glimmer-transparent.PNG"],
            ["mothie", "Mothie", "the Moon Moth", "/images/Mothie-transparent.PNG"],
          ] as const).map(([id, name, description, src]) => (
            <button key={id} type="button" onClick={() => setVisitor(id)}
              aria-label={`Visit ${name} ${description}`}
              className={`group relative flex min-h-32 flex-col items-center justify-end rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 sm:min-h-44 ${id === "mothie" ? "pb-5" : ""}`}>
              <span className={`relative block w-full ${id === "mothie" ? "h-28 -translate-y-4 sm:h-40" : id === "glimmer" ? "h-20 sm:h-32" : "h-24 sm:h-36"}`}>
                <Image src={src} alt="" fill unoptimized sizes="(max-width: 640px) 25vw, 160px"
                  className="object-contain drop-shadow-xl transition-transform group-active:scale-95"
                  />
              </span>
              <span aria-hidden="true" className="relative rounded-full bg-indigo-950/85 px-2 py-1 text-xs font-semibold text-white">{name}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-indigo-100">Meet Boo’s four nighttime friends along the glowing shore.</p>
    </> : <>
      <button type="button" onClick={() => setVisitor(null)} className="min-h-12 w-full rounded-xl bg-indigo-200 px-4 py-3 font-bold text-indigo-950 focus:ring-4 focus:ring-amber-300">← Return to Moonlit Sandbar</button>
      {(visitor === "luna" || visitor === "twinkle") ? <>
        <div className="relative h-[38vh] min-h-[240px] max-h-[500px] overflow-hidden rounded-2xl ring-1 ring-indigo-200">
          <Image src={visitor === "luna" ? "/images/Luna-moonlight-polishing-nook.png" : "/images/Twinkle-shell-nook.png"}
            alt={visitor === "luna" ? "Luna's moonlit polishing nook, with glowing wax jars, pearly shells and an ocean view." : "Twinkle's cozy nighttime shell nook, filled with driftwood shelves, shell baskets and treasures."}
            fill unoptimized sizes="100vw" className="object-cover" />
        </div>
        {visitor === "luna" ? <LunaDiscovery /> : <TwinkleCorner />}
      </> : <div className="rounded-2xl bg-indigo-950/70 p-5 text-white ring-1 ring-indigo-200/40">
        <div className="relative mx-auto h-48 w-48 sm:h-64 sm:w-64">
          <Image src={visitor === "glimmer" ? "/images/Glimmer-transparent.PNG" : "/images/Mothie-transparent.PNG"} alt="" fill unoptimized sizes="256px" className="object-contain" />
        </div>
        <h3 className="text-xl font-bold">{visitor === "glimmer" ? "Glimmer’s Luminous Sand Art" : "Mothie’s Firefly Lights"}</h3>
        <p className="mt-2">{visitor === "glimmer"
          ? "Glimmer dreams of painting the shore with glowing sand patterns. Help her paint luminous designs in the moonlit sand."
          : "Mothie watches over the fireflies that light up Shoreline. Her firefly-jar activity is coming soon."}</p>
      </div>}
      {visitor === "glimmer" && <GlimmerSandArt />}
    </>}
    {!visitor && <button type="button" onClick={onReturn} className="min-h-12 w-full rounded-xl bg-white px-4 py-3 font-bold text-teal-950 focus:ring-4 focus:ring-amber-300">← Return to Secret Sandbar</button>}
  </section>;
}
