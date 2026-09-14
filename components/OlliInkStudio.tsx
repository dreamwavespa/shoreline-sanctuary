"use client";

import { useState } from "react";
import { ITEMS } from "@/lib/items";
import { OLLI_ART_BACKGROUNDS, OLLI_ART_PATTERNS, OLLI_ART_STAMPS, OLLI_INK_IDS } from "@/lib/olli";
import { useGame } from "@/lib/store";

const ALL_INKS = [...OLLI_INK_IDS, "ink-pumpkin-orange"];
const STAMP_ICONS: Record<string, string> = {
  Shell: "🐚", Fish: "🐠", Wave: "🌊", "Paw Print": "🐾", Tentacles: "🐙",
  Flower: "🌸", Star: "⭐", "Marshmallow Silhouette": "🐈",
};
const BACKGROUNDS: Record<string, string> = {
  "Sunset Shore": "from-orange-200 via-pink-200 to-sky-300",
  "Moonlit Water": "from-indigo-950 via-blue-800 to-cyan-600",
  "Sea Glass Paper": "from-teal-100 via-cyan-50 to-emerald-200",
  "Sandy Cove": "from-amber-100 via-yellow-50 to-cyan-200",
};
const INK_COLORS: Record<string, string> = {
  "ink-midnight-blue": "text-indigo-950",
  "ink-seaglass-teal": "text-teal-600",
  "ink-coral-pink": "text-pink-500",
  "ink-seaweed-green": "text-emerald-700",
  "ink-pearl-shimmer": "text-white",
  "ink-pumpkin-orange": "text-orange-500",
};

export default function OlliInkStudio({ onClose }: { onClose: () => void }) {
  const { state, createOlliInkPicture } = useGame();
  const availableInks = ALL_INKS.filter((id) => (state.inventory[id] || 0) > 0);
  const [inkId, setInkId] = useState(availableInks[0] || "");
  const [background, setBackground] = useState<string>(OLLI_ART_BACKGROUNDS[0]);
  const [stamp, setStamp] = useState<string>(OLLI_ART_STAMPS[0]);
  const [pattern, setPattern] = useState<string>(OLLI_ART_PATTERNS[0]);
  const [name, setName] = useState("");
  const [announcement, setAnnouncement] = useState("Olli's Ink Studio opened.");

  const finish = () => {
    const picture = createOlliInkPicture(inkId, background, stamp, pattern, name);
    if (!picture) {
      setAnnouncement("Choose an ink color that is available in your inventory.");
      return;
    }
    setAnnouncement(`${picture.name} was saved in Olli's Ink Gallery.`);
    setName("");
    if ((state.inventory[inkId] || 0) <= 1) setInkId(availableInks.find((id) => id !== inkId) || "");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-indigo-950/90 p-4" role="dialog" aria-modal="true" aria-labelledby="olli-ink-title" aria-describedby="olli-ink-description" onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}>
      <div className="mx-auto max-w-2xl rounded-3xl bg-[#fbf3e3] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Accessible Creative Activity</p><h1 id="olli-ink-title" className="font-serif text-2xl font-bold text-indigo-950">🐙 Olli’s Ink Studio</h1></div>
          <button type="button" autoFocus onClick={onClose} className="rounded-xl bg-indigo-100 px-4 py-2 font-bold text-indigo-950">Close</button>
        </div>
        <p id="olli-ink-description" className="mt-2 text-sm text-indigo-800">Choose each part of the picture. No freehand drawing or dragging is required. Saving uses one jar of ink.</p>
        <p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm font-semibold text-teal-800">{announcement}</p>

        <div className={`mt-4 rounded-3xl bg-gradient-to-br ${BACKGROUNDS[background]} p-6 text-center shadow-inner ring-1 ring-indigo-200`} role="img" aria-label={`Preview: ${stamp} in ${ITEMS[inkId]?.name || "no ink"}, with ${pattern}, on ${background}`}>
          <p className={`text-7xl ${INK_COLORS[inkId] || "text-slate-400"}`} aria-hidden="true">{STAMP_ICONS[stamp]}</p>
          <p className="mt-3 rounded-full bg-white/70 px-3 py-1 text-sm font-bold text-indigo-950">{pattern}</p>
        </div>

        <ChoiceGroup title="Ink Color" value={inkId} options={availableInks} getLabel={(id) => `${ITEMS[id].name} (${state.inventory[id] || 0})`} onChange={setInkId} empty="Find Olli during a Camouflage Hunt to collect ink." />
        <ChoiceGroup title="Background" value={background} options={[...OLLI_ART_BACKGROUNDS]} getLabel={(value) => value} onChange={setBackground} />
        <ChoiceGroup title="Stamp" value={stamp} options={[...OLLI_ART_STAMPS]} getLabel={(value) => `${STAMP_ICONS[value]} ${value}`} onChange={setStamp} />
        <ChoiceGroup title="Pattern" value={pattern} options={[...OLLI_ART_PATTERNS]} getLabel={(value) => value} onChange={setPattern} />

        <label className="mt-4 block text-sm font-bold text-indigo-950" htmlFor="olli-picture-name">Picture name (optional)</label>
        <input id="olli-picture-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={50} className="mt-1 min-h-12 w-full rounded-xl border border-indigo-300 bg-white px-3 text-indigo-950" placeholder="Olli will create a name if left blank" />
        <button type="button" disabled={!inkId} onClick={finish} className="mt-4 min-h-12 w-full rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:bg-slate-300 disabled:text-slate-600">Save Ink Picture</button>

        <section className="mt-6" aria-labelledby="olli-gallery-heading">
          <h2 id="olli-gallery-heading" className="font-serif text-xl font-bold text-indigo-950">Olli’s Ink Gallery</h2>
          {state.olliInkPictures.length === 0 ? <p className="mt-2 text-sm text-indigo-700">Your first finished ink picture will appear here.</p> : (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {state.olliInkPictures.map((picture) => (
                <article key={picture.id} className={`rounded-2xl bg-gradient-to-br ${BACKGROUNDS[picture.background]} p-4 text-center shadow ring-1 ring-indigo-200`}>
                  <p className={`text-4xl ${INK_COLORS[picture.inkId]}`} aria-hidden="true">{STAMP_ICONS[picture.stamp]}</p>
                  <h3 className="mt-2 text-sm font-bold text-indigo-950">{picture.name}</h3>
                  <p className="text-[11px] text-indigo-800">{ITEMS[picture.inkId].name} · {picture.pattern}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ChoiceGroup({ title, value, options, getLabel, onChange, empty }: {
  title: string; value: string; options: string[]; getLabel: (value: string) => string;
  onChange: (value: string) => void; empty?: string;
}) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-bold text-indigo-950">{title}</legend>
      {options.length === 0 ? <p className="mt-1 text-sm text-indigo-700">{empty}</p> : (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {options.map((option) => <button key={option} type="button" aria-pressed={value === option} onClick={() => onChange(option)} className={`min-h-11 rounded-xl px-3 py-2 text-sm font-semibold ring-1 ${value === option ? "bg-indigo-700 text-white ring-indigo-800" : "bg-white text-indigo-900 ring-indigo-200"}`}>{getLabel(option)}</button>)}
        </div>
      )}
    </fieldset>
  );
}
