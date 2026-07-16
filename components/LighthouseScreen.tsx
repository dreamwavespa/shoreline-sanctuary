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

export default function LighthouseScreen() {
  const { state } = useGame();
  const [pan, setPan] = useState(0);
  const [sighting, setSighting] = useState<{ emoji: string; text: string } | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const playBlip = (panValue: number) => {
    try {
      if (!ctxRef.current) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        ctxRef.current = new Ctx();
      }
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      osc.frequency.value = 660;
      osc.type = "sine";
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
    playBlip(pan);
    const pick = SIGHTINGS[Math.floor(Math.random() * SIGHTINGS.length)];
    setSighting(pick);
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

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#fbf3e3]">
      <div className="relative w-full h-56">
        <Image src={SCENES.lookout} alt="Lighthouse lookout" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf3e3] via-transparent to-black/10" />
      </div>

      <div className="px-4 -mt-6 relative space-y-4">
        <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-amber-200">
          <h2 className="text-lg font-bold text-amber-900 mb-1">The Sound Compass</h2>
          <p className="text-sm text-amber-700 mb-4">
            Pan the telescope across the horizon, then scan — headphones recommended to hear which direction to look.
          </p>

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

          {sighting && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 text-center">
              <p className="text-2xl mb-1">{sighting.emoji}</p>
              <p className="text-sm text-amber-800">{sighting.text}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-amber-200 text-center">
          <p className="text-3xl mb-1">🤿</p>
          <p className="font-semibold text-amber-900 mb-1">Diving Gear Equipped</p>
          <p className="text-sm text-amber-700">
            The Deep Reef and the sunken shipwreck await below the waves — coming in Phase 3.
          </p>
        </div>
      </div>
    </div>
  );
}
