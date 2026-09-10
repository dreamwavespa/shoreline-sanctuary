"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SandcastleFeature, useGame } from "@/lib/store";

interface CastleOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

interface CastleCategory {
  id: string;
  label: string;
  prompt: string;
  options: CastleOption[];
}

const CATEGORIES: CastleCategory[] = [
  {
    id: "towers",
    label: "Towers",
    prompt: "Choose the castle towers.",
    options: [
      { id: "round-towers", label: "Twin Round Towers", icon: "🏰", description: "Two sturdy towers with smooth rounded tops." },
      { id: "shell-towers", label: "Spiral Shell Towers", icon: "🐚", description: "Tall towers shaped with curling shell ridges." },
    ],
  },
  {
    id: "bridge",
    label: "Bridge",
    prompt: "Choose a bridge for the entrance.",
    options: [
      { id: "arched-bridge", label: "Arched Sand Bridge", icon: "🌉", description: "A high arch over the front pathway." },
      { id: "driftwood-bridge", label: "Driftwood Drawbridge", icon: "🪵", description: "A little wooden bridge with shell ropes." },
    ],
  },
  {
    id: "moat",
    label: "Moat",
    prompt: "Choose the water feature.",
    options: [
      { id: "round-moat", label: "Round Tidal Moat", icon: "🌊", description: "A gentle ring of shallow seawater." },
      { id: "tidepool-moat", label: "Tide-Pool Canal", icon: "🫧", description: "A winding canal with tiny tide pools." },
    ],
  },
  {
    id: "shells",
    label: "Shell Decorations",
    prompt: "Choose shells for the castle walls.",
    options: [
      { id: "scallop-trim", label: "Scallop Shell Trim", icon: "🐚", description: "A neat row of fan-shaped scallop shells." },
      { id: "sand-dollar-crest", label: "Sand Dollar Crests", icon: "🪙", description: "Sand dollars pressed above each doorway." },
    ],
  },
  {
    id: "glass",
    label: "Sea Glass",
    prompt: "Choose a sea-glass accent.",
    options: [
      { id: "teal-windows", label: "Teal Glass Windows", icon: "💎", description: "Cool teal pieces that shine like windows." },
      { id: "rainbow-path", label: "Rainbow Glass Path", icon: "🌈", description: "A colorful path leading to the bridge." },
    ],
  },
  {
    id: "flags",
    label: "Flags",
    prompt: "Choose the finishing flags.",
    options: [
      { id: "coral-flags", label: "Coral Pink Flags", icon: "🚩", description: "Cheerful coral flags for the tallest towers." },
      { id: "star-flags", label: "Starry Blue Flags", icon: "🌟", description: "Deep blue flags dotted with golden stars." },
    ],
  },
];

const WAVE_GIFTS = [
  { id: "pearl-gate", label: "Pearl Gate Charm", icon: "🦪" },
  { id: "seaglass-sun", label: "Golden Sea-Glass Sun", icon: "☀️" },
];

export default function SandcastleArchitect({ onClose }: { onClose: () => void }) {
  const { state, collectItem, play, saveSandcastle } = useGame();
  const [selections, setSelections] = useState<Record<string, CastleOption>>({});
  const [waveGifts, setWaveGifts] = useState<typeof WAVE_GIFTS>([]);
  const [complete, setComplete] = useState(false);
  const [announcement, setAnnouncement] = useState("Choose one feature from each section to begin your sandcastle.");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const savedRef = useRef(false);

  const selectedCount = Object.keys(selections).length;
  const expectedWaveCount = selectedCount >= 4 ? 2 : selectedCount >= 2 ? 1 : 0;
  const waveReady = waveGifts.length < expectedWaveCount;
  const castlesCreated = state.inventory["sandcastle-masterpiece"] || 0;
  const selectedSummary = useMemo(
    () => CATEGORIES.map((category) => selections[category.id]?.label).filter(Boolean).join(", "),
    [selections]
  );

  useEffect(() => {
    headingRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const chooseOption = (category: CastleCategory, option: CastleOption) => {
    if (complete) return;
    const isNewCategory = !selections[category.id];
    const nextSelections = { ...selections, [category.id]: option };
    const nextCount = Object.keys(nextSelections).length;
    setSelections(nextSelections);
    play("driftwood");

    if (isNewCategory && (nextCount === 2 || nextCount === 4)) {
      setAnnouncement(`${option.label} added. A gentle wave is rolling in with a new decorating treasure. You may welcome it now or keep choosing castle features.`);
    } else {
      setAnnouncement(`${option.label} added to the castle. ${CATEGORIES.length - nextCount} feature ${CATEGORIES.length - nextCount === 1 ? "section remains" : "sections remain"}.`);
    }
  };

  const welcomeWave = () => {
    const gift = WAVE_GIFTS[waveGifts.length];
    if (!gift) return;
    setWaveGifts((gifts) => [...gifts, gift]);
    play("seaGlass");
    setAnnouncement(`The wave left a ${gift.label}. It has been added to your castle without disturbing anything.`);
  };

  const finishCastle = () => {
    if (selectedCount !== CATEGORIES.length || waveGifts.length !== WAVE_GIFTS.length || savedRef.current) return;
    const features: Record<string, SandcastleFeature> = {};
    for (const [categoryId, option] of Object.entries(selections)) {
      features[categoryId] = { label: option.label, icon: option.icon };
    }
    savedRef.current = true;
    saveSandcastle({
      features,
      waveGifts: waveGifts.map((gift) => ({ label: gift.label, icon: gift.icon })),
    });
    collectItem("sandcastle-masterpiece");
    setComplete(true);
    setAnnouncement(`Sandcastle complete. It includes ${selectedSummary}, plus ${waveGifts.map((gift) => gift.label).join(" and ")}. A sandcastle keepsake was added to your collection.`);
  };

  const startOver = () => {
    savedRef.current = false;
    setSelections({});
    setWaveGifts([]);
    setComplete(false);
    setAnnouncement("New sandcastle started. Choose one feature from each section.");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#063d49]/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="sandcastle-title">
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-sky-50 via-amber-50 to-orange-100 p-5 shadow-2xl ring-1 ring-amber-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-800">Shifting Sandbars Mini-Game</p>
            <h2 id="sandcastle-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold text-amber-950 outline-none">🏖️ Sandcastle Architect</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-amber-950 ring-1 ring-amber-300">Close</button>
        </div>

        {complete ? (
          <div className="mt-6 text-center">
            <div className="rounded-3xl bg-sky-100 p-5 ring-1 ring-sky-200" role="img" aria-label={`Completed sandcastle with ${selectedSummary}, ${waveGifts.map((gift) => gift.label).join(" and ")}`}>
              <div className="text-6xl" aria-hidden="true">{selections.flags?.icon || "🚩"}</div>
              <div className="mt-1 text-7xl" aria-hidden="true">{selections.towers?.icon || "🏰"}</div>
              <div className="mt-1 flex justify-center gap-4 text-3xl" aria-hidden="true">
                <span>{selections.shells?.icon}</span><span>{selections.glass?.icon}</span><span>{selections.bridge?.icon}</span>
              </div>
              <div className="mt-2 text-4xl" aria-hidden="true">{selections.moat?.icon} {waveGifts.map((gift) => gift.icon).join(" ")}</div>
            </div>
            <h3 className="mt-4 text-xl font-bold text-amber-950">Your Sandcastle Is Complete!</h3>
            <p className="mt-2 text-amber-800">The tide brought two decorations and left every tower standing.</p>
            <p className="mt-2 font-semibold text-teal-800">Sandcastle keepsakes: {castlesCreated}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={startOver} className="rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">Build Another</button>
              <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-3 font-bold text-amber-950 ring-1 ring-amber-300">Return to Sandbars</button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-amber-950">Choose one design from each section. After every two new features, a gentle wave brings a surprise decoration. Nothing is ever washed away.</p>

            <section aria-labelledby="castle-preview-heading" className="mt-5 rounded-3xl bg-sky-100 p-4 text-center ring-1 ring-sky-200">
              <h3 id="castle-preview-heading" className="font-bold text-teal-950">Castle Preview</h3>
              <div className="mt-2 min-h-28" role="img" aria-label={selectedCount ? `Castle preview: ${selectedSummary}${waveGifts.length ? `, wave gifts: ${waveGifts.map((gift) => gift.label).join(", ")}` : ""}` : "Empty sandcastle building area"}>
                <div className="text-4xl" aria-hidden="true">{selections.flags?.icon || "▫️"}</div>
                <div className="text-6xl" aria-hidden="true">{selections.towers?.icon || "🏖️"}</div>
                <div className="flex justify-center gap-3 text-2xl" aria-hidden="true">
                  <span>{selections.shells?.icon || "▫️"}</span><span>{selections.glass?.icon || "▫️"}</span><span>{selections.bridge?.icon || "▫️"}</span><span>{selections.moat?.icon || "▫️"}</span>
                </div>
                {waveGifts.length > 0 && <div className="mt-1 text-2xl" aria-hidden="true">{waveGifts.map((gift) => gift.icon).join(" ")}</div>}
              </div>
              <p className="text-sm font-semibold text-teal-900">{selectedCount}/{CATEGORIES.length} feature sections complete · {waveGifts.length}/2 wave gifts</p>
            </section>

            {waveReady && (
              <section aria-labelledby="gentle-wave-heading" className="mt-5 rounded-2xl bg-cyan-100 p-4 text-center ring-2 ring-cyan-400">
                <div className="text-4xl" aria-hidden="true">🌊✨</div>
                <h3 id="gentle-wave-heading" className="font-bold text-teal-950">A Gentle Wave Arrives</h3>
                <p className="mt-1 text-sm text-teal-800">It has brought a new decorating treasure. Your castle is completely safe.</p>
                <button type="button" onClick={welcomeWave} className="mt-3 w-full rounded-xl bg-cyan-700 py-3 font-bold text-white active:bg-cyan-800">Welcome the Wave</button>
              </section>
            )}

            <div className="mt-5 space-y-4" aria-label="Sandcastle design choices">
              {CATEGORIES.map((category) => (
                <fieldset key={category.id} className="rounded-2xl bg-white/80 p-4 ring-1 ring-amber-200">
                  <legend className="px-1 font-bold text-amber-950">{category.label}</legend>
                  <p className="text-sm text-amber-800">{category.prompt}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {category.options.map((option) => {
                      const selected = selections[category.id]?.id === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => chooseOption(category, option)}
                          className={`min-h-28 rounded-xl p-3 text-left ring-2 ${selected ? "bg-amber-700 text-white ring-amber-800" : "bg-amber-50 text-amber-950 ring-amber-200"}`}
                        >
                          <span className="block text-2xl" aria-hidden="true">{option.icon}</span>
                          <span className="block font-bold">{option.label}</span>
                          <span className={`mt-1 block text-sm ${selected ? "text-amber-100" : "text-amber-700"}`}>{option.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            <button
              type="button"
              disabled={selectedCount !== CATEGORIES.length || waveGifts.length !== WAVE_GIFTS.length || waveReady}
              onClick={finishCastle}
              className="mt-5 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow disabled:bg-teal-200 disabled:text-teal-500"
            >
              Complete Sandcastle
            </button>
            <p className="mt-2 text-center text-sm text-amber-800">{selectedCount !== CATEGORIES.length ? `${CATEGORIES.length - selectedCount} feature ${CATEGORIES.length - selectedCount === 1 ? "section" : "sections"} left to choose.` : waveReady ? "Welcome the wave before finishing." : waveGifts.length < 2 ? "One more gentle wave will arrive as you build." : "Your castle is ready to complete."}</p>
          </div>
        )}

        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      </div>
    </div>
  );
}
