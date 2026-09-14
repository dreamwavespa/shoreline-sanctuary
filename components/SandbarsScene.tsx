"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ITEMS, rollSandbarSpawn } from "@/lib/items";
import { useGame } from "@/lib/store";
import { SCENES } from "@/lib/media";
import { VILLAGERS } from "@/lib/villagers";
import VillagerCard from "./VillagerCard";
import SandcastleArchitect from "./SandcastleArchitect";
import { isBooOctober, localDateKey } from "@/lib/customSandArt";
import UnderwaterResidentActivity from "./UnderwaterResidentActivity";

interface Spot {
  key: string;
  itemId: string;
  x: number;
  y: number;
}

const RAFT_AIR_LABELS = ["Deflated", "Low Air", "Slightly Soft", "Fully Inflated"];

function RaftAirMeter({ level }: { level: number }) {
  return (
    <div className="mt-3 rounded-xl bg-white/70 p-3 ring-1 ring-sky-200">
      <div className="flex items-center justify-between gap-3 text-sm font-bold text-sky-950">
        <span>Raft air</span><span>{level}/3 · {RAFT_AIR_LABELS[level]}</span>
      </div>
      <div role="meter" aria-label="Raft air level" aria-valuemin={0} aria-valuemax={3} aria-valuenow={level} aria-valuetext={`${level} of 3, ${RAFT_AIR_LABELS[level]}`} className="mt-2 grid grid-cols-3 gap-1">
        {[1, 2, 3].map((segment) => <span key={segment} aria-hidden="true" className={`h-3 rounded-full ${level >= segment ? "bg-sky-600" : "bg-slate-200"}`} />)}
      </div>
    </div>
  );
}

function randomSpots(n: number): Spot[] {
  const spots: Spot[] = [];
  for (let i = 0; i < n; i++) {
    spots.push({
      key: `${Date.now()}-${i}-${Math.random()}`,
      itemId: rollSandbarSpawn(),
      x: 8 + Math.random() * 84,
      y: 38 + Math.random() * 50,
    });
  }
  return spots;
}

function RaftCard() {
  const { state, reinflateRaft, checkRaftAirLevel, feedKelpToBirds, splashBirds, ignoreBirds, hasEnough } = useGame();
  const [birdEvent, setBirdEvent] = useState(false);
  const [announcement, setAnnouncement] = useState({ message: "", revision: 0 });
  const birdActionsRef = useRef<HTMLDivElement>(null);
  const canKelp = hasEnough([{ itemId: "food-seaweed-chips", count: 1 }]);
  const airLevel = state.raftAirLevel;
  const hasAirPump = (state.inventory["seaside-air-pump"] || 0) > 0;

  const announce = (message: string) => {
    setAnnouncement((current) => ({ message, revision: current.revision + 1 }));
  };

  useEffect(() => {
    if (birdEvent) birdActionsRef.current?.focus();
  }, [birdEvent]);

  const inflate = (useAirPump: boolean) => {
    const level = reinflateRaft(useAirPump);
    announce(`Raft air is now ${level} of 3, ${RAFT_AIR_LABELS[level]}.`);
  };

  const checkAir = () => {
    const level = checkRaftAirLevel();
    announce(`Raft air level: ${level} of 3, ${RAFT_AIR_LABELS[level]}.`);
  };

  const checkOnRaft = () => {
    if (!state.raftInflated) return;
    if (Math.random() < 0.6) {
      announce("A seagull lands on the raft. Choose how to respond.");
      setBirdEvent(true);
      return;
    }
    announce("The raft is safe and gently bobbing. No seagulls are nearby right now.");
  };

  const resolve = (fn: () => void) => {
    fn();
    setBirdEvent(false);
  };

  if (!state.raftInflated) {
    return (
      <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-slate-300 text-center">
        <p className="text-3xl mb-1">🫠</p>
        <p className="font-semibold text-slate-800 mb-1">The raft has deflated</p>
        <p className="text-sm text-slate-600">It drifted back to the dock. Manual pumping restores one level per press and uses no materials.</p>
        <RaftAirMeter level={airLevel} />
        <button type="button" onClick={() => inflate(false)} className="mt-3 min-h-12 w-full rounded-xl bg-teal-600 px-3 py-3 font-semibold text-white shadow active:bg-teal-700">Pump Air Manually · +1 Level</button>
        {hasAirPump && <button type="button" onClick={() => inflate(true)} className="mt-2 min-h-12 w-full rounded-xl bg-amber-600 px-3 py-3 font-semibold text-white shadow active:bg-amber-700">Use Seaside Air Pump · Fill to 3/3</button>}
        {!hasAirPump && <p className="mt-2 text-xs text-slate-600">Shelldon occasionally brings a permanent Seaside Air Pump on Sundays.</p>}
        <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 min-h-5 text-xs font-semibold text-teal-800"><span key={announcement.revision}>{announcement.message}</span></p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-teal-200">
      <p className="font-semibold text-teal-900 mb-1">🛟 The Inflatable Raft</p>
      <p className="text-sm text-teal-700 mb-3">Bobbing gently, anchored just past the shore. Keep an eye out for curious gulls.</p>
      <RaftAirMeter level={airLevel} />
      <button type="button" onClick={checkAir} aria-label={`Check raft air level. Current level ${airLevel} of 3, ${RAFT_AIR_LABELS[airLevel]}.`} className="mt-3 min-h-11 w-full rounded-xl bg-sky-100 px-3 py-2 text-sm font-bold text-sky-950 ring-1 ring-sky-300">Check Raft Air Level</button>
      {airLevel < 3 && (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => inflate(false)} className="min-h-11 rounded-xl bg-teal-700 px-3 py-2 text-sm font-bold text-white">Pump Once · +1</button>
          {hasAirPump && <button type="button" onClick={() => inflate(true)} className="min-h-11 rounded-xl bg-amber-600 px-3 py-2 text-sm font-bold text-white">Air Pump · Fill Completely</button>}
        </div>
      )}
      {!birdEvent ? (
        <button
          type="button"
          onClick={checkOnRaft}
          className="mt-3 w-full py-3 rounded-xl font-semibold text-white bg-teal-600 active:bg-teal-700 shadow"
        >
          👀 Check on the Raft for Seagulls
        </button>
      ) : (
        <div ref={birdActionsRef} tabIndex={-1} role="group" aria-labelledby="raft-seagull-prompt" className="space-y-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-300">
          <p id="raft-seagull-prompt" className="text-sm font-semibold text-amber-700 text-center">🕊️ A seagull lands on your raft, eyeing it as a bouncy surface! Choose how to respond.</p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canKelp}
              onClick={() => { resolve(feedKelpToBirds); announce("The birds follow the kelp chip. The raft keeps its air and one Recycled Rubber was added."); }}
              className="flex-1 text-xs font-semibold px-2 py-2 rounded-full text-white disabled:bg-emerald-200 disabled:text-emerald-500 bg-emerald-600 active:bg-emerald-700"
            >
              🌿 Toss Kelp Chip
            </button>
            <button
              type="button"
              onClick={() => { resolve(splashBirds); announce("A gentle splash sends the birds away. The raft keeps its air."); }}
              className="flex-1 text-xs font-semibold px-2 py-2 rounded-full text-white bg-sky-600 active:bg-sky-700"
            >
              💦 Splash Water
            </button>
            <button
              type="button"
              onClick={() => { const level = ignoreBirds(); setBirdEvent(false); announce(`The seagull lowers the raft to ${level} of 3, ${RAFT_AIR_LABELS[level]}.`); }}
              className="flex-1 text-xs font-semibold px-2 py-2 rounded-full text-white bg-slate-500 active:bg-slate-600"
            >
              🙈 Ignore
            </button>
          </div>
        </div>
      )}
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 min-h-5 text-xs font-semibold text-teal-900"><span key={announcement.revision}>{announcement.message}</span></p>
    </div>
  );
}

export default function SandbarsScene() {
  const { state, collectItem, claimBooSand, deliverBooToolSet } = useGame();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [poppingKeys, setPoppingKeys] = useState<Record<string, boolean>>({});
  const [sandcastleOpen, setSandcastleOpen] = useState(false);
  const [booMessage, setBooMessage] = useState("");
  const sandcastleButtonRef = useRef<HTMLButtonElement>(null);
  const earlierSandcastles = Math.max(
    0,
    (state.inventory["sandcastle-masterpiece"] || 0) - state.sandcastleGallery.length
  );
  const booColorsAvailable = isBooOctober();
  const booClaimedToday = state.booSandClaimDate === localDateKey();
  const booToolSetCount = state.inventory["boo-sand-art-tool-set"] || 0;

  const chooseBooSand = (itemId: string) => {
    if (!claimBooSand(itemId)) return;
    setBooMessage(`Boo pours three scoops of ${ITEMS[itemId].name} into a travel pouch for you.`);
  };

  useEffect(() => {
    setSpots(randomSpots(6));
  }, []);

  if (!state.sandbarsUnlocked) {
    return (
      <div className="h-full overflow-y-auto pb-24 px-4 pt-4 bg-[#0e4a52] flex items-center justify-center">
        <div className="rounded-2xl bg-white/90 p-6 shadow-md ring-1 ring-teal-200 text-center max-w-sm">
          <p className="text-3xl mb-2">🛟</p>
          <p className="font-semibold text-teal-900 mb-1">The Sandbars are out of reach</p>
          <p className="text-sm text-teal-700">Craft the Inflatable Rubber Raft in the Workshop's Décor tab to explore the Shifting Sandbars.</p>
        </div>
      </div>
    );
  }

  const handleTap = (spot: Spot) => {
    if (poppingKeys[spot.key]) return;
    setPoppingKeys((p) => ({ ...p, [spot.key]: true }));
    collectItem(spot.itemId);
    window.setTimeout(() => {
      setSpots((cur) => cur.filter((s) => s.key !== spot.key));
      setSpots((cur) => (cur.length < 4 ? [...cur, ...randomSpots(1)] : cur));
    }, 220);
  };

  const closeSandcastle = () => {
    setSandcastleOpen(false);
    window.setTimeout(() => sandcastleButtonRef.current?.focus(), 0);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#0e4a52]">
      <div className="relative w-full h-[45%] min-h-[220px] overflow-hidden select-none">
        <Image src={SCENES.treasureCove} alt="Shifting Sandbars" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-teal-900/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#0e4a52]" />
        {spots.map((spot) => {
          const def = ITEMS[spot.itemId];
          const popping = poppingKeys[spot.key];
          return (
            <button
              key={spot.key}
              onClick={() => handleTap(spot)}
              aria-label={`Collect ${def.name}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm shadow-lg ring-1 ring-white/60 transition-all duration-200 active:scale-90 ${
                popping ? "opacity-0 scale-150" : "opacity-100 scale-100 animate-bob"
              }`}
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: 50, height: 50 }}
            >
              {def.isEmoji ? (
                <span className="text-2xl">{def.icon}</span>
              ) : (
                <Image src={def.icon} alt={def.name} width={34} height={34} unoptimized className="object-contain drop-shadow" />
              )}
            </button>
          );
        })}
      </div>

      <div className="px-4 pt-4 space-y-3">
        <RaftCard />

        <section aria-labelledby="boo-sand-heading" className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-md ring-1 ring-orange-300">
          <div className="relative h-44">
            <Image src={SCENES.booSandArt} alt="Boo, a white ghost crab wearing an orange-and-black hat, beside colorful sand bottles at his moonlit Sandbar stall" fill unoptimized sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-orange-200">Boo&apos;s Sandbar Home</p>
              <h2 id="boo-sand-heading" className="font-serif text-xl font-bold">👻 Boo&apos;s Sand Art Stall</h2>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-orange-50">Boo lives beside this driftwood stall. He helps Kaiana with custom sand art and saves his rarest colors for October.</p>
            {!state.booToolSetDelivered && <div className="mt-3 rounded-xl bg-white/10 p-3 ring-1 ring-orange-200/40">
              <p className="text-sm font-bold text-orange-100">Boo needs his Sand Art Tool Set</p>
              <p className="mt-1 text-xs text-orange-50">Craft it in the Workshop from 3 Plastic Debris and 2 Shiny Soda Tabs, then bring it here.</p>
              <button type="button" disabled={booToolSetCount < 1} onClick={() => { if (deliverBooToolSet()) setBooMessage("Boo happily clicks his scoop, shovel, sieve, and funnel together. His Custom Bottle Studio is now open!"); }} className="mt-3 min-h-11 w-full rounded-xl bg-orange-500 px-3 py-2 text-sm font-bold text-white disabled:bg-slate-600 disabled:text-slate-300">{booToolSetCount > 0 ? "Give Tool Set to Boo" : "Tool Set Not Crafted Yet"}</button>
            </div>}
            {state.booToolSetDelivered && <p className="mt-2 text-sm font-bold text-emerald-300">✓ Tool set delivered · Custom Bottle Studio unlocked</p>}
            <p role="status" aria-live="polite" className="mt-2 text-sm font-semibold text-orange-200">
              {booMessage || (!state.booToolSetDelivered
                ? "Boo will share rare October sand after his tools are delivered."
                : booColorsAvailable
                ? booClaimedToday ? "Today’s rare sand bundle has already been collected. Boo will prepare another tomorrow." : "Choose one October color. Boo will share three scoops today."
                : "Pumpkin Orange and Candy Corn Swirl sand return October 1. Sand already in your collection can still be used year-round.")}
            </p>
            {state.booToolSetDelivered && booColorsAvailable && !booClaimedToday && <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => chooseBooSand("sand-pumpkin-orange")} className="min-h-14 rounded-xl bg-orange-600 px-3 py-3 text-sm font-bold text-white active:bg-orange-700">🎃 Choose Pumpkin Orange</button>
              <button type="button" onClick={() => chooseBooSand("sand-candy-corn-swirl")} className="min-h-14 rounded-xl bg-amber-100 px-3 py-3 text-sm font-bold text-slate-950 active:bg-amber-200">🍬 Choose Candy Corn Swirl</button>
            </div>}
          </div>
        </section>

        <div>
          <p className="mb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-teal-100/80">Boo&apos;s ID Card &amp; Gifts</p>
          <VillagerCard villager={VILLAGERS.boo} />
        </div>

        <section aria-labelledby="sandcastle-game-heading" className="rounded-2xl bg-gradient-to-br from-amber-50 to-cyan-100 p-4 shadow-md ring-1 ring-amber-200">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">Sandbar Mini-Game</p>
          <h2 id="sandcastle-game-heading" className="mt-1 font-serif text-lg font-bold text-amber-950">🏖️ Sandcastle Architect</h2>
          <p className="mt-1 text-sm text-amber-800">Choose towers, bridges, moats, shells, sea glass, and flags. Gentle waves bring new decorations without damaging your creation.</p>
          <button
            ref={sandcastleButtonRef}
            type="button"
            onClick={() => setSandcastleOpen(true)}
            className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800"
          >
            Build a Sandcastle
          </button>
        </section>

        <p className="text-xs font-semibold text-teal-100/70 uppercase tracking-wide pt-2">
          Underwater Village
        </p>
        <VillagerCard villager={VILLAGERS.coral} />
        <UnderwaterResidentActivity villagerId="coral" />
        <VillagerCard villager={VILLAGERS.mina} />
        <UnderwaterResidentActivity villagerId="mina" />
        <VillagerCard villager={VILLAGERS.bubbles} />
        <UnderwaterResidentActivity villagerId="bubbles" />
        <VillagerCard villager={VILLAGERS.pearl} />
        <UnderwaterResidentActivity villagerId="pearl" />
        <VillagerCard villager={VILLAGERS.splash} />
        <UnderwaterResidentActivity villagerId="splash" />

        <section aria-labelledby="sandcastle-gallery-heading" className="rounded-2xl bg-gradient-to-br from-amber-50 to-sky-100 p-4 shadow-md ring-1 ring-amber-200">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">Saved Creations</p>
          <h2 id="sandcastle-gallery-heading" className="mt-1 font-serif text-lg font-bold text-amber-950">🏰 Sandcastle Gallery</h2>
          {state.sandcastleGallery.length === 0 && earlierSandcastles === 0 ? (
            <p className="mt-2 text-sm text-amber-800">Your completed sandcastles will be displayed here.</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: earlierSandcastles }).map((_, index) => (
                <div
                  key={`earlier-${index}`}
                  role="img"
                  aria-label={`Earlier sandcastle keepsake ${index + 1}. This castle was made before detailed gallery designs were saved.`}
                  className="rounded-2xl bg-sky-100 p-3 text-center ring-1 ring-sky-200"
                >
                  <div className="text-2xl" aria-hidden="true">🚩</div>
                  <div className="text-5xl" aria-hidden="true">🏰</div>
                  <div className="text-2xl" aria-hidden="true">🐚 💎 🌊</div>
                  <p className="mt-2 text-xs font-bold text-teal-950">Earlier Sandcastle</p>
                </div>
              ))}
              {state.sandcastleGallery.map((castle, index) => {
                const featureNames = ["towers", "bridge", "moat", "shells", "glass", "flags"]
                  .map((key) => castle.features[key]?.label)
                  .filter(Boolean)
                  .join(", ");
                const giftNames = castle.waveGifts.map((gift) => gift.label).join(" and ");
                return (
                  <div
                    key={castle.id}
                    role="img"
                    aria-label={`Saved sandcastle ${index + 1}: ${featureNames}. Wave gifts: ${giftNames}.`}
                    className="rounded-2xl bg-sky-100 p-3 text-center ring-1 ring-sky-200"
                  >
                    <div className="text-2xl" aria-hidden="true">{castle.features.flags?.icon || "🚩"}</div>
                    <div className="text-5xl" aria-hidden="true">{castle.features.towers?.icon || "🏰"}</div>
                    <div className="flex justify-center gap-2 text-xl" aria-hidden="true">
                      <span>{castle.features.shells?.icon}</span>
                      <span>{castle.features.glass?.icon}</span>
                      <span>{castle.features.bridge?.icon}</span>
                    </div>
                    <div className="mt-1 text-xl" aria-hidden="true">
                      {castle.features.moat?.icon} {castle.waveGifts.map((gift) => gift.icon).join(" ")}
                    </div>
                    <p className="mt-2 text-xs font-bold text-teal-950">Sandcastle {earlierSandcastles + index + 1}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <p className="text-xs text-teal-200/70 text-center mt-4">Open-water sandbars, shifting with every tide.</p>
      </div>
      {sandcastleOpen && <SandcastleArchitect onClose={closeSandcastle} />}
    </div>
  );
}
