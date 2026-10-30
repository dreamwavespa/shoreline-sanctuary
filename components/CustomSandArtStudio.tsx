"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CUSTOM_SAND_ACCENT_IDS, CUSTOM_SAND_IDS } from "@/lib/customSandArt";
import { ITEMS } from "@/lib/items";
import { SCENES } from "@/lib/media";
import { CustomSandBottle, useGame } from "@/lib/store";

const SAND_FILLS: Record<string, string> = {
  "sand-pink": "#f9a8d4",
  "sand-teal": "#0f9fa8",
  "sand-apricot": "#fb923c",
  "sand-snow-white": "#fffaf0",
  "sand-pumpkin-orange": "#e85d04",
  "sand-candy-corn-swirl": "linear-gradient(90deg,#f97316 0 33%,#facc15 33% 66%,#fff7ed 66%)",
};

function ItemIcon({ itemId }: { itemId: string }) {
  const item = ITEMS[itemId];
  if (!item) return null;
  return item.isEmoji ? <span className="text-2xl" aria-hidden="true">{item.icon}</span> : <Image src={item.icon} alt="" width={38} height={38} unoptimized className="h-9 w-9 object-contain" />;
}

const SAND_PALETTE: Record<string, string> = {
  "sand-black-obsidian": "#27232d", "sand-red-ruby": "#b73348", "sand-green-leaf": "#79a65b",
  "star-sand": "#e8ce85", "sand-moonlight-silver": "#c9d1df", "sand-blush-pearl": "#efc4d3",
  "sand-frost-moon": "#dce9f4", "sand-rose-quartz": "#e9a4bb", "sand-clover": "#74a56c",
  "sand-rainbow-mist": "#b9a8dc", "sand-sea-blossom": "#f1b2b4", "sand-sunbeam": "#f3d37b",
  "sand-firefly": "#b9cb72", "sand-shooting-star": "#9da6da", "sand-harvest-moon": "#cf9958",
  "sand-amber-tide": "#d99c52", "sand-starlight-snow": "#e6e9f1",
};
function AccentArtwork({ accentId }: { accentId: string | null }) {
  if (!accentId || !ITEMS[accentId]) return null;
  const item = ITEMS[accentId];
  return item.isEmoji ? <span className="text-xs" aria-hidden="true">{item.icon}</span> : <span className={`inline-flex h-3.5 w-3.5 items-center justify-center overflow-hidden ${accentId.startsWith("pearl-") ? "rounded-full" : "rounded-sm"}`}><Image src={item.icon} alt="" width={28} height={28} unoptimized className="h-full w-full object-cover" /></span>;
}
function BottlePreview({ layers, accentId, compact = false, shape = "classic" }: { layers: string[]; accentId: string | null; compact?: boolean; shape?: "classic" | "leaf" | "moon" }) {
  const description = layers.length
    ? `${layers.length} of 5 layers, bottom to top: ${layers.map((id) => ITEMS[id]?.name).join(", ")}${accentId ? `. Accent: ${ITEMS[accentId]?.name}` : ""}.`
    : "Empty frosted glass bottle.";
  const colors = layers.map(id => SAND_PALETTE[id] || (SAND_FILLS[id]?.startsWith("#") ? SAND_FILLS[id] : "#edbc83"));
  const gradient = colors.length ? `linear-gradient(to top, ${colors.map((color, i) => `${color} ${i * 100 / colors.length}% ${(i + 1) * 100 / colors.length}%`).join(", ")})` : "transparent";
  if (shape !== "classic") {
    const leaf = shape === "leaf";
    const maskPath = leaf
      ? "M 31 213 Q 47 180 71 157 Q 98 123 133 89 Q 164 57 198 43 Q 210 74 189 113 Q 165 154 123 185 Q 83 212 31 213 Z"
      : "M 87 41 Q 147 30 183 82 Q 217 140 183 194 Q 140 243 73 219 Q 43 208 24 173 Q 67 204 107 173 Q 155 137 141 90 Q 129 57 87 41 Z";
    const maskId = leaf ? "leaf-sand-interior" : "moon-sand-interior";
    return (
      <div role="img" aria-label={description} className={`relative mx-auto ${compact ? "w-20" : "w-36"}`}>
        <svg viewBox="0 0 240 260" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs><clipPath id={maskId}><path d={maskPath} /></clipPath></defs>
          <g clipPath={`url(#${maskId})`}>
            {colors.map((color, i) => <rect key={i} x="0" y={260 - (i + 1) * 46} width="240" height="46" fill={color} opacity="1" />)}
          </g>
        </svg>
        <Image src={leaf ? "/images/Leaf-shaped-sand-art-bottle-empty.PNG" : "/images/Moon-shaped-sand-art-bottle.PNG"} alt="" width={240} height={260} unoptimized className="relative z-10 h-auto w-full object-contain opacity-42" />
        {accentId && <div className={`absolute z-20 ${leaf ? "bottom-[19%] left-[43%]" : "bottom-[17%] right-[26%]"}`}><AccentArtwork accentId={accentId} /></div>}
      </div>
    );
  }
  return (
    <div role="img" aria-label={description} className={`mx-auto ${compact ? "w-20" : "w-36"}`}>
      <div className="mx-auto h-8 w-12 rounded-t-md border-4 border-b-0 border-cyan-800/70 bg-white/40" />
      <div className={`custom-sand-bottle relative overflow-hidden rounded-[2.25rem] border-4 border-cyan-800/70 bg-white/45 shadow-inner ${compact ? "h-28" : "h-48"}`}>
        <div className="absolute inset-0" style={{ background: gradient }} />
        {accentId && <div className="absolute inset-x-0 bottom-2 flex justify-center"><AccentArtwork accentId={accentId} /></div>}
        <div className="pointer-events-none absolute inset-2 rounded-[1.75rem] border-l-4 border-white/55" />
      </div>
    </div>
  );
}

export default function CustomSandArtStudio({ onClose }: { onClose: () => void }) {
  const { state, play, createCustomSandBottle, toggleCustomSandBottleFavorite } = useGame();
  const [layers, setLayers] = useState<string[]>([]);
  const [shape, setShape] = useState<"classic" | "leaf" | "moon">("classic");
  const [accentId, setAccentId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [completed, setCompleted] = useState<CustomSandBottle | null>(null);
  const [announcement, setAnnouncement] = useState("Kaiana and Boo welcome you. Add five sand layers from bottom to top.");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus(); }, []);

  const selectedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    layers.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
    return counts;
  }, [layers]);
  const available = (id: string) => Math.max(0, (state.inventory[id] || 0) - (selectedCounts[id] || 0));
  const ownedSand = CUSTOM_SAND_IDS.filter((id) => (state.inventory[id] || 0) > 0);
  const ownedAccents = CUSTOM_SAND_ACCENT_IDS.filter((id) => (state.inventory[id] || 0) > 0);
  const canAffordPattern = (design: string[]) => {
    const counts: Record<string, number> = {};
    design.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
    return Object.entries(counts).every(([id, count]) => (state.inventory[id] || 0) >= count);
  };

  const addLayer = (itemId: string) => {
    if (layers.length >= 5 || available(itemId) < 1) return;
    const next = [...layers, itemId];
    setLayers(next);
    play(ITEMS[itemId].sfx, 0.55);
    setAnnouncement(`${ITEMS[itemId].name} added as layer ${next.length}. ${next.length === 5 ? "The bottle is full. Choose an optional accent or finish it." : `Choose layer ${next.length + 1}.`}`);
  };

  const applyPattern = (type: "repeat" | "alternate" | "mirror") => {
    let design: string[] = [];
    if (type === "repeat" && layers[0]) design = Array(5).fill(layers[0]);
    if (type === "alternate" && layers.length >= 2) design = Array.from({ length: 5 }, (_, index) => layers[index % 2]);
    if (type === "mirror" && layers.length >= 3) design = [layers[0], layers[1], layers[2], layers[1], layers[0]];
    if (!design.length || !canAffordPattern(design)) {
      setAnnouncement("You need more scoops of those colors to complete that pattern.");
      return;
    }
    setLayers(design);
    play("driftwood", 0.55);
    setAnnouncement(`${type === "repeat" ? "Repeating" : type === "alternate" ? "Alternating" : "Mirrored"} pattern applied. The bottle is ready to finish.`);
  };

  const finish = () => {
    const result = createCustomSandBottle(layers, accentId, name, shape);
    if (!result.ok || !result.bottle) {
      setAnnouncement("The bottle could not be completed. Check that the empty bottle, sand, and accent are still available.");
      return;
    }
    setCompleted(result.bottle);
    setAnnouncement(`${result.bottle.name} is complete and saved in your display gallery. Seaweed values it at ${result.bottle.value} Sand Dollars.`);
  };

  const startAnother = () => {
    setLayers([]); setAccentId(null); setName(""); setCompleted(null);
    setAnnouncement("A new empty bottle is ready. Add the bottom layer first.");
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-slate-950/85 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="custom-sand-title">
      <div className="max-h-[96vh] w-full overflow-y-auto rounded-t-3xl bg-[#fff8ed] shadow-2xl sm:max-w-4xl sm:rounded-3xl">
        <div className="relative h-60 overflow-hidden sm:h-80">
          <Image src={SCENES.booSandArt} alt="Boo, a white ghost crab in an orange-and-black hat, pouring colorful sand into a glass bottle at his moonlit Sandbar stall" fill priority unoptimized sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white drop-shadow">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-200">Kaiana &amp; Boo&apos;s Creative Activity</p>
            <h2 id="custom-sand-title" ref={headingRef} tabIndex={-1} className="font-serif text-3xl font-bold outline-none">Custom Sand Art Bottles</h2>
            <p className="mt-1 text-sm text-orange-50">Kaiana teaches balance and pattern; Boo brings Sandbar color and mischief.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close Custom Sand Art Bottles" className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xl font-bold text-slate-950 shadow ring-1 ring-white">×</button>
        </div>

        <div className="space-y-5 p-5">
          <p role="status" aria-live="polite" aria-atomic="true" className="rounded-xl bg-orange-50 p-4 text-sm font-semibold leading-relaxed text-orange-950 ring-1 ring-orange-200">{announcement}</p>

          {!completed && (
            <>
              {(state.crafted.includes("robin-friendship:3") || state.crafted.includes("moon-shaped-sand-bottle")) && <section aria-label="Bottle shape" className="rounded-xl bg-white p-4 ring-1 ring-amber-200"><h3 className="font-bold">Choose bottle shape</h3><div className="mt-2 flex flex-wrap gap-2"><button type="button" aria-pressed={shape === "classic"} onClick={() => setShape("classic")} className="min-h-11 rounded-lg bg-teal-100 px-4 py-2 text-teal-950">Classic bottle</button>{state.crafted.includes("robin-friendship:3") && <button type="button" aria-pressed={shape === "leaf"} onClick={() => setShape("leaf")} className="min-h-11 rounded-lg bg-teal-100 px-4 py-2 text-teal-950">Robin's leaf-shaped bottle</button>}{state.crafted.includes("moon-shaped-sand-bottle") && <button type="button" aria-pressed={shape === "moon"} onClick={() => setShape("moon")} className="min-h-11 rounded-lg bg-teal-100 px-4 py-2 text-teal-950">Marella's moon-shaped bottle</button>}</div></section>}
              <section aria-labelledby="sand-preview-heading" className="rounded-2xl bg-gradient-to-br from-cyan-100 via-white to-orange-100 p-5 text-center ring-1 ring-cyan-300">
                <h3 id="sand-preview-heading" className="font-serif text-xl font-bold text-slate-950">Bottle Preview</h3>
                <p className="mb-3 text-sm text-slate-700">{state.inventory["empty-glass-bottle"] || 0} empty frosted bottle{(state.inventory["empty-glass-bottle"] || 0) === 1 ? "" : "s"} available</p>
                <BottlePreview layers={layers} accentId={accentId} shape={shape} />
                <p className="mt-3 font-bold text-slate-900">{layers.length} of 5 layers filled</p>
              </section>

              <section aria-labelledby="sand-pattern-heading" className="rounded-2xl bg-white p-4 ring-1 ring-orange-200">
                <h3 id="sand-pattern-heading" className="font-bold text-orange-950">Optional Pattern Tools</h3>
                <p className="mt-1 text-sm text-orange-800">Start the pattern yourself, then let Kaiana complete it.</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button type="button" disabled={!layers.length} onClick={() => applyPattern("repeat")} className="min-h-11 rounded-xl bg-orange-700 px-3 py-2 text-sm font-bold text-white disabled:bg-orange-200">Repeat First</button>
                  <button type="button" disabled={layers.length < 2} onClick={() => applyPattern("alternate")} className="min-h-11 rounded-xl bg-orange-700 px-3 py-2 text-sm font-bold text-white disabled:bg-orange-200">Alternate Two</button>
                  <button type="button" disabled={layers.length < 3} onClick={() => applyPattern("mirror")} className="min-h-11 rounded-xl bg-orange-700 px-3 py-2 text-sm font-bold text-white disabled:bg-orange-200">Mirror Three</button>
                  <button type="button" disabled={!layers.length} onClick={() => { const removed = layers[layers.length - 1]; setLayers((current) => current.slice(0, -1)); setAnnouncement(`${ITEMS[removed].name} removed.`); }} className="min-h-11 rounded-xl bg-slate-700 px-3 py-2 text-sm font-bold text-white disabled:bg-slate-200">Undo Last</button>
                </div>
              </section>

              <section aria-labelledby="sand-colors-heading">
                <h3 id="sand-colors-heading" className="font-serif text-xl font-bold text-slate-950">Choose layer {Math.min(5, layers.length + 1)}</h3>
                {ownedSand.length === 0 ? <p className="mt-2 text-sm text-slate-700">Collect colored sand from the beach and Sandbars first.</p> : (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {ownedSand.map((itemId) => <button key={itemId} type="button" disabled={layers.length >= 5 || available(itemId) < 1} onClick={() => addLayer(itemId)} aria-label={`Add ${ITEMS[itemId].name}. ${available(itemId)} available for this bottle.`} className="flex min-h-16 items-center gap-3 rounded-xl bg-white p-3 text-left shadow ring-1 ring-cyan-200 disabled:bg-stone-100 disabled:text-stone-500"><ItemIcon itemId={itemId} /><span><span className="block text-sm font-bold">{ITEMS[itemId].name}</span><span className="block text-xs">{available(itemId)} available</span></span></button>)}
                  </div>
                )}
              </section>

              {layers.length === 5 && <section aria-labelledby="sand-accent-heading" className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                <h3 id="sand-accent-heading" className="font-serif text-xl font-bold text-amber-950">Optional Treasure Accent</h3>
                <p className="mt-1 text-sm text-amber-800">Add one shell, pearl, or piece of sea glass—or leave the sand unadorned.</p>
                <button type="button" aria-pressed={!accentId} onClick={() => setAccentId(null)} className="mt-3 min-h-11 rounded-xl bg-white px-3 py-2 text-sm font-bold text-amber-950 ring-1 ring-amber-300">No Accent</button>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ownedAccents.map((itemId) => <button key={itemId} type="button" aria-pressed={accentId === itemId} onClick={() => setAccentId(itemId)} className={`flex min-h-14 items-center gap-2 rounded-xl p-3 text-left ring-2 ${accentId === itemId ? "bg-amber-200 ring-amber-600" : "bg-white ring-amber-200"}`}><ItemIcon itemId={itemId} /><span className="text-sm font-bold">{ITEMS[itemId].name}</span></button>)}
                </div>
              </section>}

              <section aria-labelledby="sand-finish-heading" className="rounded-2xl bg-slate-900 p-4 text-white">
                <h3 id="sand-finish-heading" className="font-serif text-xl font-bold">Name and Finish</h3>
                <label htmlFor="sand-bottle-name" className="mt-3 block text-sm font-bold">Bottle name (optional)</label>
                <input id="sand-bottle-name" value={name} maxLength={50} onChange={(event) => setName(event.target.value)} placeholder="Kaiana will choose a name if blank" className="mt-1 min-h-12 w-full rounded-xl bg-white px-3 text-slate-950" />
                <button type="button" disabled={layers.length !== 5 || (state.inventory["empty-glass-bottle"] || 0) < 1} onClick={finish} className="mt-3 min-h-12 w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-white disabled:bg-slate-500">Seal Custom Bottle</button>
              </section>
            </>
          )}

          {completed && <section aria-labelledby="sand-complete-heading" className="rounded-2xl bg-cyan-50 p-5 text-center ring-1 ring-cyan-300"><h3 id="sand-complete-heading" className="font-serif text-2xl font-bold text-cyan-950">{completed.name} is complete!</h3><BottlePreview layers={completed.layers} accentId={completed.accentId} shape={completed.shape} /><p className="mt-3 text-sm text-cyan-900">Saved for display · Seaweed value: {completed.value} Sand Dollars</p><button type="button" onClick={startAnother} className="mt-4 min-h-12 w-full rounded-xl bg-cyan-800 px-4 py-3 font-bold text-white">Make Another Bottle</button></section>}

          <section aria-labelledby="custom-bottle-gallery-heading">
            <h3 id="custom-bottle-gallery-heading" className="font-serif text-xl font-bold text-slate-950">Custom Bottle Gallery</h3>
            {state.customSandBottles.length === 0 ? <p className="mt-2 text-sm text-slate-700">Finished bottles will be displayed here.</p> : <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{state.customSandBottles.map((bottle) => <article key={bottle.id} className="rounded-2xl bg-white p-3 text-center shadow ring-1 ring-cyan-200"><BottlePreview layers={bottle.layers} accentId={bottle.accentId} shape={bottle.shape} compact /><h4 className="mt-2 font-bold text-slate-950">{bottle.name}</h4><p className="text-xs text-slate-600">Value: {bottle.value} Sand Dollars</p><button type="button" aria-pressed={bottle.favorite} onClick={() => toggleCustomSandBottleFavorite(bottle.id)} className="mt-2 min-h-11 w-full rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-950 ring-1 ring-amber-300">{bottle.favorite ? "★ Display Favorite" : "☆ Add to Favorites"}</button></article>)}</div>}
          </section>
        </div>
      </div>
    </div>
  );
}
