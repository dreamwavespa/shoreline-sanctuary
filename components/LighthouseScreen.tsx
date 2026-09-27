"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MARSHMALLOW_TREAT_COOLDOWN_MS, useGame } from "@/lib/store";
import { SCENES } from "@/lib/media";
import LighthouseLookout from "./LighthouseLookout";
import WeatherStation from "./WeatherStation";

const SIGHTINGS = [
  { emoji: "⛵", text: "A distant sailboat, cutting a lazy line across the horizon." },
  { emoji: "🐋", text: "A pod of whales, blowing plumes of white spray into the air." },
  { emoji: "🌫️", text: "A gentle evening fog is rolling in — the tides will shift soon." },
  { emoji: "🌊", text: "Calm seas as far as you can see. Just the wind and the waves." },
  { emoji: "⚓", text: "Something glints on a distant reef... worth investigating one day." },
];

interface Constellation {
  id: string;
  name: string;
  emoji: string;
  description: string;
  panMin: number;
  panMax: number;
  freq: number;
  type: OscillatorType;
}

const CONSTELLATIONS: Constellation[] = [
  { id: "the-anchor", name: "The Anchor", emoji: "⚓", description: "Four bright stars in the shape of a ship's anchor, low on the horizon.", panMin: -1, panMax: -0.5, freq: 392, type: "sine" },
  { id: "the-nautilus", name: "The Nautilus", emoji: "🐚", description: "A gentle spiral of stars, coiling like a shell.", panMin: -0.5, panMax: 0, freq: 523, type: "triangle" },
  { id: "the-lighthouse", name: "The Lighthouse Keeper", emoji: "🗼️", description: "A tall column of stars topped with one brilliant point of light.", panMin: 0, panMax: 0.5, freq: 659, type: "square" },
  { id: "the-whale", name: "The Great Whale", emoji: "🐋", description: "A long, gentle curve of stars arcing across the sky like a breaching whale.", panMin: 0.5, panMax: 1, freq: 784, type: "sawtooth" },
];

const MARSHMALLOW_REACTIONS = {
  newFriend: [
    "Marshmallow leans into your hand and gives a tiny purr.",
    "Marshmallow slow-blinks at you from his spot by the window.",
    "His tail curls happily around his paws.",
  ],
  trusting: [
    "Marshmallow kneads his paws and purrs like a little lighthouse motor.",
    "He bumps his forehead against your hand, then settles beside you.",
    "Marshmallow rolls onto his side and stretches his fluffy paws toward you.",
  ],
  closeFriend: [
    "Marshmallow trots over as soon as he sees you and rubs against your legs.",
    "He flops dramatically onto his back, completely certain you came to see him.",
    "Marshmallow curls up beside you and starts purring before you even touch him.",
  ],
  bestFriend: [
    "Marshmallow chirps, races around the lantern room, and comes skidding back for more attention!",
    "He rests one soft paw on you and gives you a long, contented slow blink.",
    "Marshmallow follows you around the lighthouse, purring every step of the way.",
  ],
};

const ORDINARY_TREASURES = [
  { id: "shell-scallop", name: "Scallop Shell" },
  { id: "glass-white", name: "White Sea Glass" },
  { id: "glass-teal", name: "Teal Sea Glass" },
  { id: "ribbon", name: "Ribbon" },
];

const MARSHMALLOW_MEOWS = [
  "/audio/Marshmallow/marshmallow-meow-1.mp3",
  "/audio/Marshmallow/meow1.mp3",
  "/audio/Marshmallow/meow2.mp3",
  "/audio/Marshmallow/meow3.mp3",
  "/audio/Marshmallow/meow4.mp3",
  "/audio/Marshmallow/meow5.mp3",
];
const MARSHMALLOW_SHORT_PURR = "/audio/Marshmallow/marshmallow-purr-short.mp3";
const MARSHMALLOW_COZY_PURR = "/audio/Marshmallow/marshmallow-purr-cozy.mp3";

function MarshmallowCard() {
  const { state, scratchMarshmallow, giftMarshmallow, collectItem, giveMarshmallowFluffyBed, restMarshmallowInBed } = useGame();
  const treats = state.inventory["food-campfire-marshmallow"] || 0;
  const fluffyBedCount = state.inventory["furniture-fluffy-cat-bed"] || 0;
  const [reaction, setReaction] = useState("Curled up by the lantern room window.");
  const [now, setNow] = useState<number | null>(null);
  const interactions = state.marshmallowScratchCount + (state.marshmallowGifted ? 3 : 0);
  const relationship = interactions >= 30 ? "bestFriend" : interactions >= 16 ? "closeFriend" : interactions >= 7 ? "trusting" : "newFriend";
  const relationshipLabel = relationship === "bestFriend" ? "Devoted lighthouse companion" : relationship === "closeFriend" ? "Close friend" : relationship === "trusting" ? "Growing trust" : "Getting acquainted";
  const remainingMs = now === null ? 0 : Math.max(0, state.marshmallowLastGiftAt + MARSHMALLOW_TREAT_COOLDOWN_MS - now);
  const remainingMinutes = Math.ceil(remainingMs / 60_000);
  const treatReady = now !== null && remainingMs === 0;

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const playCatSound = (src: string, volume = 0.75) => {
    try {
      window.dispatchEvent(new Event("shoreline:audio-interaction"));
      const audio = new Audio(src);
      audio.volume = Math.max(0, Math.min(1, volume * state.audio.master));
      void audio.play().catch(() => {});
    } catch {}
  };

  const randomMeow = () => MARSHMALLOW_MEOWS[Math.floor(Math.random() * MARSHMALLOW_MEOWS.length)];

  const chooseReaction = () => {
    const pool = MARSHMALLOW_REACTIONS[relationship];
    setReaction(pool[Math.floor(Math.random() * pool.length)]);
  };

  const maybeFindTreasure = (nextScratchCount: number) => {
    if (nextScratchCount < 5 || nextScratchCount % 5 !== 0) return;
    const today = new Date().toLocaleDateString("en-CA");
    const key = "shoreline-marshmallow-treasure-date";
    try {
      if (localStorage.getItem(key) === today) return;
      const treasure = ORDINARY_TREASURES[Math.floor(Math.random() * ORDINARY_TREASURES.length)];
      collectItem(treasure.id, { silent: true });
      localStorage.setItem(key, today);
      setReaction(`Marshmallow trots back with something in his mouth and drops a ${treasure.name} at your feet. A present for you!`);
    } catch {}
  };

  const handleScratch = () => {
    const nextCount = state.marshmallowScratchCount + 1;
    scratchMarshmallow();
    chooseReaction();
    maybeFindTreasure(nextCount);
    const soundRoll = Math.random();
    if (relationship === "closeFriend" || relationship === "bestFriend") {
      if (soundRoll < 0.55) playCatSound(MARSHMALLOW_SHORT_PURR, 0.68);
      else if (soundRoll < 0.82) playCatSound(randomMeow(), 0.72);
      else playCatSound(MARSHMALLOW_COZY_PURR, 0.62);
    } else if (soundRoll < 0.5) {
      playCatSound(randomMeow(), 0.72);
    } else {
      playCatSound(MARSHMALLOW_SHORT_PURR, 0.64);
    }
  };

  const handleGiveBed = () => {
    if (!giveMarshmallowFluffyBed()) return;
    setReaction("You set the fluffy cat bed near the warm lighthouse window. Marshmallow circles it twice, kneads the cushion, and curls up with a pleased little purr.");
    playCatSound(MARSHMALLOW_COZY_PURR, 0.62);
  };

  const handleRestInBed = () => {
    if (!restMarshmallowInBed()) return;
    const bedReactions = [
      "Marshmallow climbs into his fluffy bed, kneads the cushion, and settles into a warm little cloud of fur.",
      "He circles his bed twice, tucks his paws underneath himself, and begins to purr.",
      "Marshmallow stretches across his fluffy bed and gives you a sleepy slow blink before closing his eyes.",
    ];
    setReaction(bedReactions[Math.floor(Math.random() * bedReactions.length)]);
    playCatSound(MARSHMALLOW_COZY_PURR, 0.6);
  };

  const handleTreat = () => {
    if (!giftMarshmallow()) return;
    const special = relationship === "bestFriend" && Math.random() < 0.25;
    setReaction(special
      ? "Marshmallow's eyes go huge. He chirps, dashes around the lighthouse in a burst of marshmallow-fueled zoomies, then returns purring!"
      : "Marshmallow delicately takes the treat, licks his whiskers, and curls up happily beside you.");
    playCatSound(randomMeow(), special ? 0.82 : 0.72);
    window.setTimeout(() => playCatSound(special ? MARSHMALLOW_SHORT_PURR : MARSHMALLOW_COZY_PURR, 0.62), 650);
  };

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-rose-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden">
          <Image src={SCENES.petBed} alt="Marshmallow the Lighthouse Cat" fill unoptimized className="object-cover" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-rose-900">Marshmallow the Lighthouse Cat</h2>
          <p className="text-xs font-semibold text-rose-600">{relationshipLabel}</p>
          <p className="text-sm text-rose-700 mt-1" role="status" aria-live="polite">{reaction}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={handleScratch} className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-rose-500 active:bg-rose-600 shadow text-sm">
          🖐️ Pet Marshmallow
        </button>
        <button type="button" disabled={treats < 1 || !treatReady} onClick={handleTreat} className="flex-1 py-2.5 rounded-xl font-semibold text-white disabled:bg-rose-200 disabled:text-rose-500 bg-rose-700 active:bg-rose-800 shadow text-sm">
          {now === null ? "Checking Treat Time…" : !treatReady ? `Full · Ready in about ${remainingMinutes} min` : treats < 1 ? "No Marshmallow Treats" : `🍡 Give Treat (${treats})`}
        </button>
      </div>
      <div className="mt-3 rounded-xl bg-rose-50 p-3 ring-1 ring-rose-100">
        <p className="text-sm font-semibold text-rose-900 mb-2">🛏️ Marshmallow's Care</p>
        {state.marshmallowBed === "none" && fluffyBedCount > 0 && (
          <button type="button" onClick={handleGiveBed} className="w-full py-2.5 rounded-xl font-semibold text-white bg-amber-700 active:bg-amber-800 shadow text-sm">
            Give Fluffy Cat Bed to Marshmallow
          </button>
        )}
        {state.marshmallowBed === "none" && fluffyBedCount < 1 && (
          <p className="text-xs text-rose-700">Seaweed sometimes has a fluffy cat bed that would make the lighthouse extra cozy.</p>
        )}
        {state.marshmallowBed !== "none" && (
          <>
            <p className="text-xs text-rose-700 mb-2">Marshmallow's fluffy cat bed is tucked beside the warm lighthouse window.</p>
            <button type="button" onClick={handleRestInBed} className="w-full py-2.5 rounded-xl font-semibold text-white bg-rose-600 active:bg-rose-700 shadow text-sm">
              💤 Let Marshmallow Rest in His Bed
            </button>
          </>
        )}
      </div>
      <div className="mt-3 text-center text-xs text-rose-700">
        <p>Marshmallow's friendship grows through care and time together. Some changes are meant to be discovered rather than counted.</p>
        <p className="mt-1" role="status" aria-live="polite">
          {now === null ? "Checking when Marshmallow will be ready." : treatReady ? "Marshmallow is ready for another treat." : `Marshmallow is full. Another treat in about ${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"}.`}
        </p>
      </div>
    </div>
  );
}

export default function LighthouseScreen() {
  const { state, addFoundConstellation } = useGame();
  const [pan, setPan] = useState(0);
  const [sighting, setSighting] = useState<{ emoji: string; text: string } | null>(null);
  const [foundThisScan, setFoundThisScan] = useState<Constellation | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const lookoutButtonRef = useRef<HTMLButtonElement>(null);
  const [lookoutOpen, setLookoutOpen] = useState(false);

  const playBlip = (panValue: number, freq = 660, type: OscillatorType = "sine") => {
    try {
      if (!ctxRef.current) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        ctxRef.current = new Ctx();
      }
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      osc.frequency.value = freq;
      osc.type = type;
      panner.pan.value = Math.max(-1, Math.min(1, panValue));
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(gain).connect(panner).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    } catch {}
  };

  const scan = () => {
    const match = CONSTELLATIONS.find((c) => pan >= c.panMin && pan <= c.panMax);
    if (match) {
      playBlip(pan, match.freq, match.type);
      setFoundThisScan(match);
      addFoundConstellation(match.id);
      setSighting(null);
    } else {
      playBlip(pan);
      setFoundThisScan(null);
      const pick = SIGHTINGS[Math.floor(Math.random() * SIGHTINGS.length)];
      setSighting(pick);
    }
  };

  if (!state.chestOpened && !state.weatherStationUnlocked) {
    return (
      <div className="h-full overflow-y-auto pb-24 px-4 pt-4 bg-[#fbf3e3] flex items-center justify-center">
        <div className="rounded-2xl bg-white/90 p-6 shadow-md ring-1 ring-amber-200 text-center max-w-sm">
          <p className="text-3xl mb-2">🗺️</p>
          <p className="font-semibold text-amber-900 mb-1">The cliff path is still overgrown</p>
          <p className="text-sm text-amber-700">
            Return Maeve&apos;s missing kettle or open the locked chest on the Hidden Beach to reveal the way up to the lighthouse.
          </p>
        </div>
      </div>
    );
  }

  const foundCount = state.foundConstellations.length;
  const closeLookout = () => {
    setLookoutOpen(false);
    window.setTimeout(() => lookoutButtonRef.current?.focus(), 0);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#fbf3e3]">
      <div className="relative w-full h-56">
        <Image src={SCENES.telescopeStars} alt="Lighthouse lookout" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf3e3] via-transparent to-black/10" />
      </div>

      <div className="px-4 -mt-6 relative space-y-4">