"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import GroveCoffeePlant from "./GroveCoffeePlant";
import GroveFiberPatch from "./GroveFiberPatch";
import { ITEMS } from "@/lib/items";

const ARRIVAL_MS = 24 * 60 * 60 * 1000;
const ASSET_VERSION = process.env.NEXT_PUBLIC_SHORELINE_ASSET_VERSION || "development";

export default function WoodlandTrail({ onBack }: { onBack: () => void }) {
  const { state, placeRobinNest, repairRobinNest, placeRobinFeeder, refillRobinFeeder, replaceRobinFeeder, giftRobin, fillRobinBirdbath, robinNestingAction, activateRobinGreenhouse } = useGame();
  const [now, setNow] = useState(() => Date.now());
  const [announcement, setAnnouncement] = useState("");
  const [selectedGift, setSelectedGift] = useState("dried-sugar-berries");
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
  const giftIds = Object.keys(state.inventory).filter(id => (id === "dried-sugar-berries" || id === "cotton-balls" || id === "wind-fabric-scrap" || id.startsWith("flower-") || id === "rain-lily-blossom") && (state.inventory[id] || 0) > 0 && ITEMS[id]);
  const date = new Date(now);
  const month = date.getMonth();
  const season = month >= 2 && month <= 4 ? "spring" : month >= 5 && month <= 7 ? "summer" : month >= 8 && month <= 10 ? "autumn" : "winter";
  const seasonKey = `${date.getFullYear()}-${season}`;
  const todayKey = [date.getFullYear(), String(month + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  const nestingStage = state.robinNestingStage || 0;
  const nestingImage = nestingStage === 2 || nestingStage === 3 || nestingStage === 4 ? "robin_nest_eggs.png" : nestingStage === 5 ? "robin_nest_hatchlings.png" : nestingStage === 6 ? "robin_nest_fledglings.png" : "robin_empty_nest.png";
  const nestingMessage = ["", "Robin is preparing a cozy nest.", "Three pale blue eggs have appeared!", "Robin is keeping her eggs warm.", "The eggs are almost ready to hatch.", "The chicks have hatched!", "The young robins are growing feathers."][nestingStage] || "Robin's nest is ready for another season.";
  const birdbathAge = now - (state.robinBirdbathFilledAt || 0);
  const birdbathLevel = !state.robinBirdbathFilledAt || birdbathAge >= 48 * 60 * 60 * 1000 ? "Empty" : birdbathAge >= 24 * 60 * 60 * 1000 ? "Half full" : "Full";
  const feederRefills = state.robinFeederRefills || 0;
  const feederReady = now - (state.robinFeederLastFilledAt || 0) >= 48 * 60 * 60 * 1000;
  const playSeedSound = () => {
    audioRef.current?.pause();
    const audio = new Audio(`/audio/pinecone-feeder-seeds.mp3?v=${ASSET_VERSION}`);
    audioRef.current = audio;
    void audio.play().catch(() => {});
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
            <Image src={nestingStage ? `/images/Robin/${nestingImage}` : `/images/Robin-nest.PNG?v=${ASSET_VERSION}`} alt="" fill unoptimized sizes="30vw" className="object-contain" />
          </div>
        )}
        {state.robinFeederPlaced && (
          <div className="pointer-events-none absolute right-[4%] top-[28%] z-10 h-[17%] w-[20%]" aria-hidden="true">
            <Image src="/images/pinecone-feeder.png" alt="" fill unoptimized sizes="20vw" className="object-contain drop-shadow-lg" />
          </div>
        )}
        {arrived && (
          <button type="button" onClick={greetRobin} aria-label="Greet Robin and hear her birdsong" className="absolute right-[23%] top-[29%] z-20 h-[23%] w-[25%] rounded-2xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300">
            <Image src={`/images/Robin-transparent.PNG?v=${ASSET_VERSION}`} alt="" fill unoptimized sizes="30vw" className="object-contain" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-lg bg-emerald-950/90 px-2 py-1 text-sm font-bold text-white">Robin</span>
          </button>
        )}
        <button type="button" onClick={() => { setAnnouncement(`Birdbath is ${birdbathLevel.toLowerCase()}. Use the birdbath controls below to refill it.`); document.getElementById("robin-birdbath-title")?.scrollIntoView({ behavior: "smooth", block: "center" }); }} aria-label={`Check Robin's birdbath. ${birdbathLevel}.`} className="absolute left-[32%] top-[49%] z-20 h-[15%] w-[22%] rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300"><span className="sr-only">Check birdbath</span></button>
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
        <section aria-labelledby="robin-greenhouse-title" className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-300">
          <h2 id="robin-greenhouse-title" className="text-xl font-bold text-emerald-950">Robin's Winter Greenhouse Bubble</h2>
          {state.robinWinterBubbleActive ? (
            <p className="mt-2" role="status">Greenhouse protection active. Robin's nest is sheltered for winter, and winter nesting will be available in December.</p>
          ) : [10, 11, 0, 1].includes(month) ? (
            <>
              <p className="mt-2">Prepare Robin's protective greenhouse bubble for the winter months. This is a one-time sanctuary upgrade with no ingredients required.</p>
              <button type="button" disabled={!arrived} onClick={() => { if (activateRobinGreenhouse()) setAnnouncement("Robin's greenhouse bubble is active and her nest is protected."); }} className="mt-3 min-h-11 rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white disabled:bg-slate-300 disabled:text-slate-700">Activate greenhouse bubble</button>
            </>
          ) : <p className="mt-2">The greenhouse bubble can be activated beginning November 1 to prepare Robin's nest for winter.</p>}
        </section>
        <section aria-labelledby="robin-season-title" className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-300">
          <h2 id="robin-season-title" className="text-xl font-bold text-emerald-950">Robin's Seasonal Family</h2>
          <p className="mt-2">Season: {season}. One nesting event per season. Missed days never harm the chicks.</p>
          <p className="mt-2 text-sm text-emerald-900">Seasonal rewards: Spring — Blossom Feather; Summer — Golden Sun Feather; Autumn — Copper Leaf Feather; Winter — Frosted Crystal Feather.</p>
          <p className="mt-1 text-sm text-emerald-900">Complete all four seasons to receive the Crystal Nest keepsake.</p>
          <p className="mt-1 text-sm text-emerald-900">Seasons completed: {["spring", "summer", "autumn", "winter"].filter(s => (state.robinNestingCompleted || []).some(key => key.endsWith(`-${s}`))).length} of 4.</p>
          {nestingStage > 0 ? (
            <>
              <p className="mt-2" role="status">Nesting day {nestingStage} of 7. {nestingMessage}</p>
              <button type="button" disabled={state.robinNestingLastCheck === todayKey || !!state.robinNestRepairNeeded} onClick={() => { if (robinNestingAction("check")) setAnnouncement("You checked on Robin's family. Their nesting story has progressed."); }} className="mt-3 min-h-11 rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white disabled:bg-slate-300 disabled:text-slate-700">Check on Robin's nest</button>
              {state.robinNestingLastCheck === todayKey && <p className="mt-2">You've checked on the nest today. Return tomorrow.</p>}
            </>
          ) : (state.robinNestingCompleted || []).includes(seasonKey) ? (
            <p className="mt-2">Robin's chicks have fledged safely this season. Return next season for another family!</p>
          ) : season === "winter" && !state.robinWinterBubbleActive ? (
            <p className="mt-2">Winter nesting will become available when the greenhouse bubble is activated. Robin remains safe while she waits.</p>
          ) : (
            <>
              <p className="mt-2">Robin is ready to prepare her nest for this season.</p>
              <button type="button" disabled={!arrived || !!state.robinNestRepairNeeded} onClick={() => { if (robinNestingAction("start")) setAnnouncement("Robin is preparing her seasonal nest. Check tomorrow for eggs."); }} className="mt-3 min-h-11 rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white disabled:bg-slate-300 disabled:text-slate-700">Begin seasonal nesting</button>
            </>
          )}
        </section>
        <section aria-labelledby="robin-feeder-title" className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-300">
          <h2 id="robin-feeder-title" className="text-xl font-bold text-emerald-950">Robin's Pinecone Feeder</h2>
          {!state.robinFeederPlaced ? (
            <>
              <p className="mt-2">Prepare a Pinecone Bird Feeder in the Nature & Wildlife cookbook, then hang it near Robin's nest.</p>
              <button type="button" disabled={!state.robinNestPlacedAt || (state.inventory["food-pinecone-bird-feeder"] || 0) < 1} onClick={() => { if (placeRobinFeeder()) setAnnouncement("Pinecone feeder hung near Robin's nest. Robin has a fresh treat!"); }} className="mt-3 min-h-11 rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white disabled:bg-slate-300 disabled:text-slate-700">Hang pinecone feeder ({state.inventory["food-pinecone-bird-feeder"] || 0} available)</button>
            </>
          ) : (
            <>
              <p className="mt-2">Feeder refills: {feederRefills} of 12. {feederRefills >= 12 ? "The pinecone is worn and ready to be replaced." : feederReady ? "The feeder is ready for fresh coconut cream and birdseed." : "The feeder is full. Check back in two days."}</p>
              {feederRefills >= 12 ? (
                <button type="button" disabled={(state.inventory["food-pinecone-bird-feeder"] || 0) < 1} onClick={() => { if (replaceRobinFeeder()) { playSeedSound(); setAnnouncement("Robin's worn feeder has been replaced with a fresh pinecone feeder."); } }} className="mt-3 min-h-11 rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white disabled:bg-slate-300 disabled:text-slate-700">Replace feeder ({state.inventory["food-pinecone-bird-feeder"] || 0} available)</button>
              ) : (
                <button type="button" disabled={!feederReady || (state.inventory["coconut-cream"] || 0) < 1 || (state.inventory["birdseed"] || 0) < 1} onClick={() => { if (refillRobinFeeder()) { playSeedSound(); setAnnouncement("You added coconut cream and birdseed to Robin's feeder. Robin chirps happily."); } }} className="mt-3 min-h-11 rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white disabled:bg-slate-300 disabled:text-slate-700">Refill with coconut cream and birdseed (1 each)</button>
              )}
            </>
          )}
        </section>
        <section aria-labelledby="robin-gifts-title" className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-300">
          <h2 id="robin-gifts-title" className="text-xl font-bold text-emerald-950">Robin's Friendship & Gifts</h2>
          <p className="mt-2">Gifts given: {state.robinGiftCount || 0}. Robin enjoys sugar berries, cotton balls, fabric scraps and flowers. Give one gift each day after she arrives.</p>
          <p className="mt-1 text-sm text-emerald-900">Rewards: 3 gifts — Robin's Feather and leaf-shaped sand art bottle unlock; 6 gifts — Woodland Nest Decorations; 10 gifts — Carved Crystal Robin.</p>
          {giftIds.length ? (
            <div className="mt-3 space-y-2">
              <label htmlFor="robin-gift-choice" className="block font-semibold">Choose a gift</label>
              <select id="robin-gift-choice" value={giftIds.includes(selectedGift) ? selectedGift : giftIds[0]} onChange={e => setSelectedGift(e.target.value)} className="min-h-12 w-full rounded-lg border-2 border-emerald-500 bg-white p-2 text-emerald-950">{giftIds.map(id => <option key={id} value={id}>{ITEMS[id].name} ({state.inventory[id]})</option>)}</select>
              <button type="button" disabled={!arrived || state.robinGiftDate === new Date().toLocaleDateString("en-CA")} onClick={() => { const id = giftIds.includes(selectedGift) ? selectedGift : giftIds[0]; if (giftRobin(id)) { greetRobin(); setAnnouncement(`Robin loves your ${ITEMS[id].name}! Gift ${(state.robinGiftCount || 0) + 1} recorded.`); } }} className="min-h-12 rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white disabled:bg-slate-300 disabled:text-slate-700">Give Robin a gift</button>
            </div>
          ) : <p className="mt-2">Collect sugar berries, cotton balls, fabric scraps or flowers to give Robin a gift.</p>}
          {state.robinGiftDate === new Date().toLocaleDateString("en-CA") && <p className="mt-2">Robin has received today's gift. Visit again tomorrow.</p>}
        </section>
        <section aria-labelledby="robin-birdbath-title" className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-emerald-300">
          <h2 id="robin-birdbath-title" className="text-xl font-bold text-emerald-950">Woodland Birdbath</h2>
          <p className="mt-2">Water level: {birdbathLevel}. Fill it with one fresh water serving. Robin may splash and sing when she visits.</p>
          <button type="button" disabled={!state.robinNestPlacedAt || state.robinBirdbathCareDate === new Date().toLocaleDateString("en-CA") || (state.inventory["fresh-water-serving"] || 0) < 1} onClick={() => { if (fillRobinBirdbath()) { audioRef.current?.pause(); const audio = new Audio(`/audio/robin-birdbath-water-birds.mp3?v=${ASSET_VERSION}`); audioRef.current = audio; void audio.play().catch(() => {}); setAnnouncement("You filled Robin's birdbath. Water splashes and birds chirp."); } }} className="mt-3 min-h-12 rounded-xl bg-emerald-800 px-4 py-2 font-semibold text-white disabled:bg-slate-300 disabled:text-slate-700">Fill birdbath (1 fresh water serving)</button>
          {state.robinBirdbathCareDate === new Date().toLocaleDateString("en-CA") && <p className="mt-2">Birdbath cared for today. Return tomorrow.</p>}
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
