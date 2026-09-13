"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SCENES } from "@/lib/media";
import { useGame } from "@/lib/store";

export function WateringCanIcon({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M19 25h27v25H19z" fill="currentColor" opacity=".92" />
      <path d="M44 29c9-1 14-8 15-15-8 0-15 5-18 12M19 31H8l-4 7h15" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 25v-6c0-8 15-8 15 0v6" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M8 42v9M3 45v5M13 45v5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const STEPS = [
  { label: "Add Coconut Fiber", detail: "Place the pale coconut fiber into the mixing pot.", sound: "groveLeafRustle", icon: "🥥" },
  { label: "Add Crumbled Seaweed", detail: "Layer in the green crumbled seaweed.", sound: "seaweedCollect", icon: "🌿" },
  { label: "Add Dark Grove Soil", detail: "Scoop rich soil from beneath the grove roots.", sound: "nurseryDig", icon: "🟤" },
  { label: "Mix and Fill the Pot", detail: "Blend the three ingredients into enriched soil.", sound: "nurseryDig", icon: "🥄" },
  { label: "Plant the Mystery Seed", detail: "Make a small hollow and gently settle the seed.", sound: "nurseryPlant", icon: "🌰" },
  { label: "Water the Nursery Bed", detail: "Give the newly planted bed a gentle shower.", sound: "nurseryWater", icon: "💧" },
] as const;

export default function HiddenGroveNursery({ onClose }: { onClose: () => void }) {
  const { completeGroveNursery, play } = useGame();
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("Begin by adding coconut fiber. The nursery has no timer and no penalty.");
  const [foundSeed, setFoundSeed] = useState<boolean | null>(null);
  const [revealing, setRevealing] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const revealTimer = useRef<number | null>(null);

  useEffect(() => {
    closeRef.current?.focus();
    return () => {
      if (revealTimer.current) window.clearTimeout(revealTimer.current);
    };
  }, []);

  const performStep = (index: number) => {
    if (index !== step || revealing || foundSeed !== null) return;
    const current = STEPS[index];
    play(current.sound, current.sound === "nurseryWater" ? 0.9 : 0.8);

    if (index < STEPS.length - 1) {
      const next = index + 1;
      setStep(next);
      setMessage(`${current.label} complete. Next: ${STEPS[next].label}.`);
      return;
    }

    const result = completeGroveNursery();
    if (!result.ok) {
      setMessage("This storm's nursery materials have already been used.");
      return;
    }

    setRevealing(true);
    setMessage("Water is soaking into the enriched soil. Something is stirring beneath the leaves.");
    revealTimer.current = window.setTimeout(() => {
      setFoundSeed(result.foundSeed);
      setStep(STEPS.length);
      setRevealing(false);
      setMessage(
        result.foundSeed
          ? "Aqua light shines through the soil! You prepared Rare Enriched Soil and uncovered a Deep-Sea Seed."
          : "The bed is ready. You prepared Rare Enriched Soil; the Deep-Sea Seed remains hidden until another storm."
      );
    }, 1800);
  };

  const finished = foundSeed !== null;
  const fillLevel = step >= 4 ? 100 : Math.min(step, 3) * 30;

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-emerald-950/80 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="nursery-title">
      <div className="max-h-[96vh] w-full overflow-y-auto rounded-t-3xl bg-[#eef8e8] shadow-2xl sm:max-w-3xl sm:rounded-3xl">
        <div className="relative h-64 overflow-hidden sm:h-80">
          <Image src={SCENES.hiddenGroveNursery} alt="A sheltered post-storm nursery in the coconut grove, with coconut fiber, crumbled seaweed, dark soil, a mixing pot, and a raised planting bed" fill priority unoptimized sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-black/15" />

          <div className={`nursery-pot-fill absolute bottom-[28%] left-[45%] h-10 w-20 rounded-b-full bg-amber-950/90 sm:left-[46%] ${step >= 4 ? "is-mixed" : ""}`} style={{ transform: `scaleY(${Math.max(fillLevel, 5) / 100})` }} aria-hidden="true" />
          {step >= 5 && <span className="nursery-sprout absolute bottom-[31%] left-[49%] text-4xl" aria-hidden="true">🌱</span>}
          {revealing && (
            <span className="nursery-watering absolute right-[18%] top-[38%] text-sky-100" aria-hidden="true">
              <WateringCanIcon className="h-16 w-16" />
              <span className="nursery-water-drops">•••</span>
            </span>
          )}
          {foundSeed === true && <span className="nursery-seed-glow absolute bottom-[14%] right-[18%] text-5xl" aria-hidden="true">🌰</span>}

          <div className="absolute bottom-0 left-0 right-0 p-5 text-white drop-shadow">
            <p className="text-xs font-bold uppercase tracking-widest text-lime-200">Post-Storm Mini-Game</p>
            <h2 id="nursery-title" className="font-serif text-3xl font-bold">Hidden Grove Nursery</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close Hidden Grove Nursery" className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xl font-bold text-emerald-950 shadow ring-1 ring-white">×</button>
        </div>

        <div className="p-5">
          <p role="status" aria-live="polite" aria-atomic="true" className="rounded-xl bg-white p-4 text-sm font-semibold leading-relaxed text-emerald-950 shadow-sm ring-1 ring-emerald-200">
            {message}
          </p>

          {!finished ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {STEPS.map((item, index) => {
                const done = index < step;
                const current = index === step;
                return (
                  <button key={item.label} type="button" disabled={!current || revealing} onClick={() => performStep(index)} className="min-h-24 rounded-2xl bg-white p-4 text-left shadow ring-1 ring-emerald-200 transition active:scale-[0.98] disabled:bg-emerald-50 disabled:text-emerald-700 disabled:ring-emerald-100">
                    <span className="mr-3 text-2xl" aria-hidden="true">{done ? "✅" : item.icon}</span>
                    <span className="font-bold">{done ? `Done: ${item.label}` : item.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed">{item.detail}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={`mt-4 rounded-2xl p-6 text-center shadow ring-1 ${foundSeed ? "bg-cyan-50 ring-cyan-300" : "bg-amber-50 ring-amber-300"}`}>
              <p className="text-4xl" aria-hidden="true">{foundSeed ? "🌱✨" : "🌿"}</p>
              <h3 className="mt-2 font-serif text-xl font-bold text-emerald-950">Nursery round complete</h3>
              <p className="mt-2 text-sm text-emerald-800">
                {foundSeed ? "Rare Enriched Soil and one Deep-Sea Seed were added to your inventory." : "Rare Enriched Soil was added to your inventory. A Deep-Sea Seed is guaranteed after three nursery rounds without one."}
              </p>
              <button type="button" onClick={onClose} className="mt-5 w-full rounded-xl bg-emerald-700 py-3 font-bold text-white shadow active:bg-emerald-800">Return to the Coconut Grove</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
