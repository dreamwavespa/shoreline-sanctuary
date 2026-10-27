"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import GroveCoffeePlant from "./GroveCoffeePlant";
import GroveFiberPatch from "./GroveFiberPatch";

const ARRIVAL_MS = 24 * 60 * 60 * 1000;
const ASSET_VERSION = process.env.NEXT_PUBLIC_SHORELINE_ASSET_VERSION || "development";

export default function WoodlandTrail({ onBack }: { onBack: () => void }) {
  const { state, placeRobinNest, repairRobinNest } = useGame();
  const [now, setNow] = useState(() => Date.now());
  const [announcement, setAnnouncement] = useState("");
  const [activeGarden, setActiveGarden] = useState<"coffee" | "cotton" | "catnip" | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const arrived = !!state.robinNestPlacedAt && now - state.robinNestPlacedAt >= ARRIVAL_MS;
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => () => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);
  const openGarden = (garden: "coffee" | "cotton" | "catnip") => {
    setActiveGarden(garden);
    setAnnouncement(`${garden === "coffee" ? "Coffee shrubs" : garden === "cotton" ? "Cotton patch" : "Catnip plants"} selected. Planting and harvesting controls are below the forest scene.`);
  };
  const greetRobin = () => {
    setAnnouncement("Robin chirps a cheerful greeting from her tree.");
    audioRef.current?.pause();
    const audio = new Audio(`/audio/Robin-greeting.mp3?v=${ASSET_VERSION}`);
    audioRef.current = audio;
    audio.play().catch(() => setAnnouncement("Robin chirps a greeting. Audio could not play."));
  };

  return (
    <main className="h-full overflow-y-auto bg-[#e6f1df] pb-24" aria-label="Woodland Trail">
      <section className="relative h-[520px] w-full overflow-hidden bg-emerald-950 sm:h-[650px]" aria-label="Woodland Trail forest clearing">
        <Image src={`/images/Woodland-trail.PNG?v=${ASSET_VERSION}`} alt="Sunlit forest clearing with a winding trail, Robin's large tree on the right, a birdbath, flowers, cotton plants and coffee shrubs" fill priority unoptimized sizes="100vw" className="object-cover object-center" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-950/75 to-transparent" />
        <h1 className="pointer-events-none absolute left-4 top-3 z-10 font-serif text-3xl font-bold text-white drop-shadow-lg">Woodland Trail</h1>
        <button type="button" onClick={onBack} aria-label="Return to Coconut Grove" className="absolute left-3 top-[13%] z-20 min-h-11 rounded-lg border-2 border-amber-200 bg-[#60432b]/95 px-3 py-2 text-sm font-semibold text-white shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300">← Coconut Grove</button>
        {state.robinNestPlacedAt > 0 && (
          <div className="pointer-events-none absolute right-[6%] top-[7%] h-[19%] w-[28%]" aria-hidden="true">
            <Image src={`/images/Robin-nest.PNG?v=${ASSET_VERSION}`} alt="" fill unoptimized sizes="30vw" className="object-contain" />
          </div>
        )}
        {arrived && (
          <button type="button" onClick={greetRobin} aria-label="Greet Robin and hear her birdsong" className="absolute right-[23%] top-[29%] z-20 h-[23%] w-[25%] rounded-2xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300">
            <Image src={`/images/Robin-transparent.PNG?v=${ASSET_VERSION}`} alt="" fill unoptimized sizes="30vw" className="object-contain" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-lg bg-emerald-950/90 px-2 py-1 text-sm font-bold text-white">Robin</span>
          </button>
        )}
        {/* Decorative details are not interactive and never intercept plant taps. */}
        <div className="pointer-events-none absolute left-[2%] bottom-[2%] h-[14%] w-[25%]" aria-hidden="true">
          <Image src="/images/Mossy-rocks.png" alt="" fill unoptimized sizes="25vw" className="object-contain" />
        </div>
        <div className="pointer-events-none absolute left-[43%] bottom-[3%] h-[11%] w-[22%]" aria-hidden="true">
          <Image src="/images/Woodland-wildflowers.png" alt="" fill unoptimized sizes="22vw" className="object-contain" />
        </div>
        <div className="pointer-events-none absolute left-[3%] top-[60%] h-[13%] w-[21%]" aria-hidden="true">
          <Image src="/images/Cotton-harvest-basket.png" alt="" fill unoptimized sizes="21vw" className="object-contain" />
        </div>
        <div className="pointer-events-none absolute right-[2%] top-[72%] h-[11%] w-[19%]" aria-hidden="true">
          <Image src="/images/Coffee-harvest-basket.png" alt="" fill unoptimized sizes="19vw" className="object-contain" />
        </div>
        {/* The forest artwork remains visible; large, labeled hotspots open the actual plant controls. */}
        <button type="button" onClick={() => openGarden("coffee")} aria-label="Explore coffee shrubs, plant seeds or harvest" aria-pressed={activeGarden === "coffee"} className="absolute right-[2%] top-[45%] h-[31%] w-[44%] z-20 rounded-2xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300">
          <Image src="/images/Coffee-plant.png" alt="" fill unoptimized sizes="45vw" className="object-contain drop-shadow-lg" />
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-emerald-950/85 px-2 py-1 text-xs font-semibold text-white">Coffee shrubs</span>
        </button>
        <button type="button" onClick={() => openGarden("cotton")} aria-label="Explore cotton patch, plant seeds or harvest" aria-pressed={activeGarden === "cotton"} className="absolute left-[2%] bottom-[13%] h-[30%] w-[42%] z-20 rounded-2xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300">
          <Image src="/images/Cotton-plant.png" alt="" fill unoptimized sizes="45vw" className="object-contain drop-shadow-lg" />
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-emerald-950/85 px-2 py-1 text-xs font-semibold text-white">Cotton patch</span>
        </button>
        <button type="button" onClick={() => openGarden("catnip")} aria-label="Explore catnip plants, plant seeds or harvest" aria-pressed={activeGarden === "catnip"} className="absolute right-[1%] bottom-[7%] h-[23%] w-[34%] z-20 rounded-2xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300">
          <Image src="/images/Catnip-plant.png" alt="" fill unoptimized sizes="45vw" className="object-contain drop-shadow-lg" />
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-emerald-950/85 px-2 py-1 text-xs font-semibold text-white">Catnip plants</span>
        </button>
      </section>
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-5">
        <p role="status" aria-live="polite" aria-atomic="true" className="font-semibold text-emerald-950">{announcement}</p>
        <section aria-labelledby="robin-nest-title" className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-300">
          <h2 id="robin-nest-title" className="text-xl font-bold text-emerald-950">Robin's Bird Sanctuary</h2>
          {!state.robinNestPlacedAt ? (
            <>
              <p className="mt-2">A sheltered branch is ready for a rescued nest. Place one here and Robin will arrive after 24 hours.</p>
              <button type="button" disabled={(state.inventory["wind-bird-nest"] || 0) < 1} onClick={() => { if (placeRobinNest()) setAnnouncement("Nest placed in Robin's tree. Her 24-hour arrival countdown has started."); }} className="mt-3 min-h-11 rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white disabled:bg-slate-300 disabled:text-slate-700">
                {(state.inventory["wind-bird-nest"] || 0) > 0 ? "Place rescued nest in Robin's tree" : "Find a rescued nest on a windy beach"}
              </button>
            </>
          ) : (
            <>
              <p className="mt-2">{arrived ? "Robin has arrived and made the forest clearing her home." : `Robin may arrive in about ${Math.max(1, Math.ceil((ARRIVAL_MS - (now - state.robinNestPlacedAt)) / 3_600_000))} hours.`}</p>
              {arrived && <button type="button" onClick={greetRobin} className="mt-3 min-h-11 rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white">Greet Robin — play her song</button>}
              {state.robinNestRepairNeeded ? (
                <div className="mt-3">
                  <p>The last storm loosened Robin's nest. Use a spare rescued nest to repair it.</p>
                  <button type="button" disabled={(state.inventory["wind-bird-nest"] || 0) < 1} onClick={() => { if (repairRobinNest()) setAnnouncement("Robin's nest is repaired and secure."); }} className="mt-2 min-h-11 rounded-xl bg-amber-800 px-4 py-2 font-semibold text-white disabled:bg-slate-300 disabled:text-slate-700">Repair nest with spare nest ({state.inventory["wind-bird-nest"] || 0} available)</button>
                </div>
              ) : <p className="mt-2 text-emerald-800">Nest condition: secure. Spare nests: {state.inventory["wind-bird-nest"] || 0}.</p>}
            </>
          )}
        </section>
        <section aria-label="Woodland Trail plantings" className="space-y-4">
          <h2 className="text-xl font-bold text-emerald-950">Forest Garden</h2>
          <p>Choose the coffee shrubs, cotton patch or catnip plants in the clearing to tend them. Each plant keeps its existing growth and harvest schedule.</p>
          {activeGarden && (
            <div className="rounded-2xl bg-white p-3 shadow-md ring-1 ring-emerald-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-emerald-950">{activeGarden === "coffee" ? "Coffee Shrubs" : activeGarden === "cotton" ? "Cotton Patch" : "Catnip Plants"}</h3>
                <button type="button" onClick={() => { setActiveGarden(null); setAnnouncement("Returned to the Woodland Trail clearing."); }} className="min-h-11 rounded-lg bg-emerald-800 px-3 py-2 font-semibold text-white">Close garden controls</button>
              </div>
              {activeGarden === "coffee" ? <GroveCoffeePlant /> : <GroveFiberPatch kind={activeGarden} />}
            </div>
          )}
        </section>
        <button type="button" onClick={onBack} className="min-h-11 rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white">Return to Coconut Grove</button>
      </div>
    </main>
  );
}
