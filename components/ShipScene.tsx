"use client";
import { useRef } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { SCENES } from "@/lib/media";

const NOTES: { label: string; freq: number }[] = [
  { label: "C", freq: 261.63 },
  { label: "D", freq: 293.66 },
  { label: "E", freq: 329.63 },
  { label: "F", freq: 349.23 },
  { label: "G", freq: 392.0 },
  { label: "A", freq: 440.0 },
  { label: "B", freq: 493.88 },
];

function SaltyCard() {
  const { state, throwBallToSalty } = useGame();
  const balls = state.inventory["beach-ball"] || 0;

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-sky-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden">
          <Image src={SCENES.sealPontoon} alt="Salty the Harbor Seal" fill unoptimized className="object-cover" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-sky-900">Salty & The Harbor Seals</h2>
          <p className="text-sm text-sky-700">
            Streak: {state.saltyStreak} · Total catches: {state.saltyTotalCatches}
          </p>
        </div>
      </div>
      <p className="text-xs text-sky-700 mb-3">
        Toss the beach ball out to Salty — land three catches in a row for a bonus of rare reef treasures!
      </p>
      <button
        type="button"
        disabled={balls < 1}
        onClick={throwBallToSalty}
        className="w-full py-3 rounded-xl font-semibold text-white disabled:bg-sky-200 disabled:text-sky-500 bg-sky-600 active:bg-sky-700 shadow"
      >
        🏐 Throw the Ball ({balls})
      </button>
    </div>
  );
}

function PianoCard() {
  const ctxRef = useRef<AudioContext | null>(null);

  const playNote = (freq: number) => {
    try {
      if (!ctxRef.current) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        ctxRef.current = new Ctx();
      }
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = "triangle";
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.15);
    } catch {}
  };

  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-indigo-200">
      <h2 className="text-lg font-bold text-indigo-900 mb-1">The Community Piano</h2>
      <p className="text-sm text-indigo-700 mb-3">Sailors and sanctuary friends gather here in the evenings to play a tune.</p>
      <div className="grid grid-cols-7 gap-1.5">
        {NOTES.map((n) => (
          <button
            key={n.label}
            type="button"
            onClick={() => playNote(n.freq)}
            className="aspect-square rounded-lg bg-indigo-100 active:bg-indigo-300 text-indigo-900 font-bold text-sm shadow-sm"
          >
            {n.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ShipScene() {
  const { state } = useGame();

  if (!state.gameCompleted) {
    return (
      <div className="h-full overflow-y-auto pb-24 px-4 pt-4 bg-[#0b3d3a] flex items-center justify-center">
        <div className="rounded-2xl bg-white/90 p-6 shadow-md ring-1 ring-amber-200 text-center max-w-sm">
          <p className="text-3xl mb-2">⛵</p>
          <p className="font-semibold text-amber-900 mb-1">The harbor gathering hasn't begun yet</p>
          <p className="text-sm text-amber-700">
            Restore the shipwreck and complete The Grand Reunion to welcome everyone aboard the Community Ship.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#0b3d3a]">
      <div className="relative w-full h-48">
        <Image src={SCENES.shipDeck} alt="Community Ship deck" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b3d3a] via-transparent to-black/10" />
      </div>

      <div className="px-4 -mt-6 relative space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-teal-100 p-5 shadow-md ring-1 ring-amber-300 text-center">
          <p className="text-3xl mb-1">⛵🎉</p>
          <p className="font-semibold text-amber-900">Welcome aboard the Community Ship</p>
          <p className="text-xs text-amber-800">Every friend of the sanctuary gathers here now.</p>
        </div>
        <SaltyCard />
        <PianoCard />
      </div>
    </div>
  );
}
