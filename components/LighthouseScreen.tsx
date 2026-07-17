"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { SCENES } from "@/lib/media";

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

function MarshmallowCard() {
  const { state, scratchMarshmallow, giftMarshmallow } = useGame();
  const treats = state.inventory["food-campfire-marshmallow"] || 0;
  const [purr, setPurr] = useState(false);

  const handleScratch = () => {
    scratchMarshmallow();
    setPurr(true);
    window.setTimeout(() => setPurr(false), 600);
  };

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-rose-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden">
          <Image src={SCENES.petBed} alt="Marshmallow the Lighthouse Cat" fill unoptimized className="object-cover" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-rose-900">Marshmallow the Lighthouse Cat</h2>
          <p className="text-sm text-rose-700">
            {purr ? "Purring softly... 💕" : "Curled up by the lantern room window."}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleScratch}
          className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-rose-500 active:bg-rose-600 shadow text-sm"
        >
          🖐️ Scratch ({state.marshmallowScratchCount})
        </button>
        <button
          type="button"
          disabled={treats < 1 || state.marshmallowGifted}
          onClick={giftMarshmallow}
          className="flex-1 py-2.5 rounded-xl font-semibold text-white disabled:bg-rose-200 disabled:text-rose-500 bg-rose-700 active:bg-rose-800 shadow text-sm"
        >
          {state.marshmallowGifted ? "Gifted ✓" : `🍡 Gift Marshmallow (${treats})`}
        </button>
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

  if (!state.chestOpened) {
    return (
      <div className="h-full overflow-y-auto pb-24 px-4 pt-4 bg-[#fbf3e3] flex items-center justify-center">
        <div className="rounded-2xl bg-white/90 p-6 shadow-md ring-1 ring-amber-200 text-center max-w-sm">
          <p className="text-3xl mb-2">🗺️</p>
          <p className="font-semibold text-amber-900 mb-1">The cliff path is still overgrown</p>
          <p className="text-sm text-amber-700">
            Open the locked chest on the Hidden Beach to find the map and compass that reveal the way up to the lighthouse.
          </p>
        </div>
      </div>
    );
  }

  const foundCount = state.foundConstellations.length;

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#fbf3e3]">
      <div className="relative w-full h-56">
        <Image src={SCENES.telescopeStars} alt="Lighthouse lookout" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf3e3] via-transparent to-black/10" />
      </div>

      <div className="px-4 -mt-6 relative space-y-4">
        <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-amber-200">
          <h2 className="text-lg font-bold text-amber-900 mb-1">Star-Gazing Binoculars</h2>
          <p className="text-sm text-amber-700 mb-1">
            Pan across the horizon and scan for four ocean-themed constellations — headphones recommended.
          </p>
          <p className="text-xs font-semibold text-teal-700 mb-4">Found: {foundCount}/4</p>

          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setPan((p) => Math.max(-1, +(p - 0.34).toFixed(2)))}
              className="w-11 h-11 rounded-full bg-teal-600 text-white text-lg active:scale-95"
            >
              ⬅️
            </button>
            <div className="flex-1 h-2 rounded-full bg-amber-100 relative">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-teal-600 shadow"
                style={{ left: `calc(${((pan + 1) / 2) * 100}% - 8px)` }}
              />
            </div>
            <button
              type="button"
              onClick={() => setPan((p) => Math.min(1, +(p + 0.34).toFixed(2)))}
              className="w-11 h-11 rounded-full bg-teal-600 text-white text-lg active:scale-95"
            >
              ➡️
            </button>
          </div>

          <button
            type="button"
            onClick={scan}
            className="w-full py-3 rounded-xl font-semibold text-white bg-amber-700 active:bg-amber-800 shadow"
          >
            🔭 Scan the Horizon
          </button>

          {foundThisScan && (
            <div className="mt-4 p-3 rounded-xl bg-teal-50 ring-1 ring-teal-300 text-center">
              <p className="text-2xl mb-1">{foundThisScan.emoji}</p>
              <p className="font-semibold text-teal-900 text-sm">{foundThisScan.name}</p>
              <p className="text-xs text-teal-700">{foundThisScan.description}</p>
            </div>
          )}
          {!foundThisScan && sighting && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 text-center">
              <p className="text-2xl mb-1">{sighting.emoji}</p>
              <p className="text-sm text-amber-800">{sighting.text}</p>
            </div>
          )}
        </div>

        <MarshmallowCard />

        <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-amber-200 text-center">
          <p className="text-3xl mb-1">🤿</p>
          <p className="font-semibold text-amber-900 mb-1">Diving Gear Equipped</p>
          <p className="text-sm text-amber-700">
            The Deep Reef and the sunken shipwreck await below the waves — head to the Reef tab.
          </p>
        </div>
      </div>
    </div>
  );
}
