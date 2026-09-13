"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ITEMS } from "@/lib/items";
import { JEWELRY_KIND_DETAILS, JEWELRY_MATERIAL_IDS, JewelryKind } from "@/lib/jewelry";
import { SCENES } from "@/lib/media";
import { CustomJewelryPiece, useGame } from "@/lib/store";

function MaterialIcon({ itemId, size = 36 }: { itemId: string; size?: number }) {
  const item = ITEMS[itemId];
  if (!item) return null;
  return item.isEmoji ? (
    <span className="text-2xl" aria-hidden="true">{item.icon}</span>
  ) : (
    <Image src={item.icon} alt="" width={size} height={size} unoptimized className="object-contain" />
  );
}

function materialGroup(itemId: string) {
  if (itemId.startsWith("pearl-") || itemId === "mother-of-pearl") return "Pearls";
  if (itemId.startsWith("glass-")) return "Sea Glass";
  if (itemId.startsWith("shell-") || itemId === "iridescent-shell") return "Shells";
  return "Stones";
}

const KIND_ICONS: Record<JewelryKind, string> = { necklace: "📿", bracelet: "⭕", earrings: "✨" };

export default function JewelryCounter({ onClose }: { onClose: () => void }) {
  const { state, play, createCustomJewelry, toggleCustomJewelryFavorite } = useGame();
  const [kind, setKind] = useState<JewelryKind | null>(null);
  const [materials, setMaterials] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [announcement, setAnnouncement] = useState("Melody welcomes you to the Jewelry Counter. Choose a piece to begin.");
  const [completed, setCompleted] = useState<CustomJewelryPiece | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const selectedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const itemId of materials) counts[itemId] = (counts[itemId] || 0) + 1;
    return counts;
  }, [materials]);

  const ownedMaterials = JEWELRY_MATERIAL_IDS.filter((itemId) => (state.inventory[itemId] || 0) > 0);
  const groupedMaterials = ["Pearls", "Sea Glass", "Shells", "Stones"].map((group) => ({
    group,
    items: ownedMaterials.filter((itemId) => materialGroup(itemId) === group),
  })).filter((section) => section.items.length > 0);

  const chooseKind = (nextKind: JewelryKind) => {
    setKind(nextKind);
    setMaterials([]);
    setName("");
    setCompleted(null);
    setAnnouncement(`${JEWELRY_KIND_DETAILS[nextKind].label} selected. Choose materials for position 1.`);
  };

  const availableCount = (itemId: string) => Math.max(0, (state.inventory[itemId] || 0) - (selectedCounts[itemId] || 0));

  const addMaterial = (itemId: string) => {
    if (!kind || materials.length >= JEWELRY_KIND_DETAILS[kind].slots || availableCount(itemId) < 1) return;
    const next = [...materials, itemId];
    setMaterials(next);
    play("jewelryMaterials", 0.72);
    const slots = JEWELRY_KIND_DETAILS[kind].slots;
    setAnnouncement(`${ITEMS[itemId].name} added at position ${next.length}. ${next.length === slots ? "The design is full and ready to finish." : `Choose position ${next.length + 1}.`}`);
  };

  const canAffordDesign = (design: string[]) => {
    const counts: Record<string, number> = {};
    for (const itemId of design) counts[itemId] = (counts[itemId] || 0) + 1;
    return Object.entries(counts).every(([itemId, count]) => (state.inventory[itemId] || 0) >= count);
  };

  const applyPattern = (pattern: "repeat" | "alternate" | "mirror") => {
    if (!kind || materials.length === 0) return;
    const slots = JEWELRY_KIND_DETAILS[kind].slots;
    let design: string[] = [];
    if (pattern === "repeat") design = Array(slots).fill(materials[0]);
    if (pattern === "alternate" && materials.length >= 2) design = Array.from({ length: slots }, (_, index) => materials[index % 2]);
    if (pattern === "mirror") {
      const needed = Math.ceil(slots / 2);
      if (materials.length < needed) return;
      const firstHalf = materials.slice(0, needed);
      design = kind === "earrings"
        ? [firstHalf[0], firstHalf[1], firstHalf[0], firstHalf[1]]
        : [...firstHalf, ...firstHalf.slice(0, slots - needed).reverse()];
    }
    if (!design.length || !canAffordDesign(design)) {
      setAnnouncement("You need more copies of those materials to complete that pattern.");
      return;
    }
    setMaterials(design);
    play("jewelryMaterials", 0.75);
    setAnnouncement(`${pattern === "repeat" ? "Repeating" : pattern === "alternate" ? "Alternating" : "Mirrored"} pattern applied. The design is ready to finish.`);
  };

  const undo = () => {
    if (!materials.length) return;
    const removed = materials[materials.length - 1];
    setMaterials((current) => current.slice(0, -1));
    setAnnouncement(`${ITEMS[removed].name} removed. Position ${materials.length} is ready.`);
  };

  const finishPiece = () => {
    if (!kind || materials.length !== JEWELRY_KIND_DETAILS[kind].slots) return;
    const result = createCustomJewelry(kind, materials, name);
    if (!result.ok || !result.piece) {
      setAnnouncement("The piece could not be completed. Check that the foundation and all selected materials are still available.");
      return;
    }
    setCompleted(result.piece);
    setAnnouncement(`${result.piece.name} is complete and saved in your jewelry collection. Seaweed values it at ${result.piece.value} Sand Dollars.`);
  };

  const startAnother = () => {
    setKind(null);
    setMaterials([]);
    setName("");
    setCompleted(null);
    setAnnouncement("Choose a new jewelry type to begin another design.");
  };

  const verticalOffset = (index: number) => {
    if (!kind) return 0;
    const patterns: Record<JewelryKind, number[]> = {
      necklace: [0, 9, 16, 16, 9, 0],
      bracelet: [10, 2, 0, 2, 10],
      earrings: [0, 13, 0, 13],
    };
    return patterns[kind][index] || 0;
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-purple-950/80 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="jewelry-counter-title">
      <div className="max-h-[96vh] w-full overflow-y-auto rounded-t-3xl bg-[#fff8ed] shadow-2xl sm:max-w-4xl sm:rounded-3xl">
        <div className="relative h-60 overflow-hidden sm:h-80">
          <Image src={SCENES.jewelryCounter} alt="A sunlit coastal jewelry counter with trays of pearls, sea glass, shells, stones, wire, thread, and jewelry tools beside an ocean window" fill priority unoptimized sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-transparent to-black/15" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white drop-shadow">
            <p className="text-xs font-bold uppercase tracking-widest text-pink-200">Melody&apos;s Workshop Activity</p>
            <h2 id="jewelry-counter-title" ref={headingRef} tabIndex={-1} className="font-serif text-3xl font-bold outline-none">Custom Jewelry Counter</h2>
            <p className="mt-1 text-sm text-purple-50">“Every shoreline treasure already knows what it wants to become. Let&apos;s listen.” — Melody</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close Custom Jewelry Counter" className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xl font-bold text-purple-950 shadow ring-1 ring-white">×</button>
        </div>

        <div className="space-y-5 p-5">
          <p role="status" aria-live="polite" aria-atomic="true" className="rounded-xl bg-purple-50 p-4 text-sm font-semibold leading-relaxed text-purple-950 ring-1 ring-purple-200">{announcement}</p>

          {!kind && !completed && (
            <section aria-labelledby="choose-jewelry-heading">
              <h3 id="choose-jewelry-heading" className="font-serif text-xl font-bold text-purple-950">Choose a jewelry type</h3>
              <p className="mt-1 text-sm text-purple-800">The foundation and every selected decoration will be used when the piece is completed.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(Object.keys(JEWELRY_KIND_DETAILS) as JewelryKind[]).map((option) => {
                  const details = JEWELRY_KIND_DETAILS[option];
                  const foundationCount = state.inventory[details.foundationId] || 0;
                  const materialCount = JEWELRY_MATERIAL_IDS.reduce((sum, itemId) => sum + (state.inventory[itemId] || 0), 0);
                  const available = foundationCount > 0 && materialCount >= details.slots;
                  return (
                    <button key={option} type="button" disabled={!available} onClick={() => chooseKind(option)} className="min-h-32 rounded-2xl bg-white p-4 text-center shadow ring-1 ring-purple-200 active:scale-[0.98] disabled:bg-stone-100 disabled:text-stone-500">
                      <span className="block text-4xl" aria-hidden="true">{KIND_ICONS[option]}</span>
                      <span className="mt-2 block font-bold">Design a {details.label}</span>
                      <span className="mt-1 block text-xs">{details.slots} design positions · {details.foundationLabel}</span>
                      {!available && <span className="mt-2 block text-xs font-semibold">More materials needed</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {kind && !completed && (
            <>
              <section aria-labelledby="jewelry-preview-heading" className="rounded-2xl bg-gradient-to-br from-purple-100 via-pink-50 to-amber-50 p-5 text-center shadow-inner ring-1 ring-purple-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-left">
                    <h3 id="jewelry-preview-heading" className="font-serif text-xl font-bold text-purple-950">{JEWELRY_KIND_DETAILS[kind].label} Preview</h3>
                    <p className="text-xs text-purple-800">Uses {JEWELRY_KIND_DETAILS[kind].foundationLabel}</p>
                  </div>
                  <button type="button" onClick={startAnother} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-purple-800 ring-1 ring-purple-200">Change Type</button>
                </div>
                <div className={`jewelry-design-preview mt-6 flex min-h-24 items-start justify-center gap-2 ${kind === "earrings" ? "gap-8" : ""}`} role="group" aria-label={`${JEWELRY_KIND_DETAILS[kind].label} design preview`}>
                  {Array.from({ length: JEWELRY_KIND_DETAILS[kind].slots }, (_, index) => {
                    const itemId = materials[index];
                    const positionLabel = kind === "earrings" ? `${index < 2 ? "Left" : "Right"} earring position ${(index % 2) + 1}` : `Position ${index + 1}`;
                    return (
                      <div key={index} style={{ transform: `translateY(${verticalOffset(index)}px)` }} className={`jewelry-design-slot flex h-14 w-14 items-center justify-center rounded-full border-2 ${itemId ? "border-amber-400 bg-white shadow-md" : "border-dashed border-purple-300 bg-white/60"}`} role="img" aria-label={`${positionLabel}: ${itemId ? ITEMS[itemId].name : "empty"}`}>
                        {itemId ? <MaterialIcon itemId={itemId} size={40} /> : <span className="text-xs font-bold text-purple-500" aria-hidden="true">{index + 1}</span>}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-sm font-semibold text-purple-900">{materials.length} of {JEWELRY_KIND_DETAILS[kind].slots} positions filled</p>
              </section>

              <section aria-labelledby="pattern-tools-heading" className="rounded-2xl bg-white p-4 shadow ring-1 ring-amber-200">
                <h3 id="pattern-tools-heading" className="font-bold text-amber-950">Optional Pattern Tools</h3>
                <p className="mt-1 text-xs text-amber-800">Start a pattern manually, then let Melody complete it.</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button type="button" disabled={materials.length < 1} onClick={() => applyPattern("repeat")} className="min-h-11 rounded-xl bg-purple-700 px-3 py-2 text-sm font-bold text-white disabled:bg-purple-200">Repeat First</button>
                  <button type="button" disabled={materials.length < 2} onClick={() => applyPattern("alternate")} className="min-h-11 rounded-xl bg-purple-700 px-3 py-2 text-sm font-bold text-white disabled:bg-purple-200">Alternate Two</button>
                  <button type="button" disabled={materials.length < Math.ceil(JEWELRY_KIND_DETAILS[kind].slots / 2)} onClick={() => applyPattern("mirror")} className="min-h-11 rounded-xl bg-purple-700 px-3 py-2 text-sm font-bold text-white disabled:bg-purple-200">{kind === "earrings" ? "Match Earrings" : "Mirror Half"}</button>
                  <button type="button" disabled={!materials.length} onClick={undo} className="min-h-11 rounded-xl bg-amber-700 px-3 py-2 text-sm font-bold text-white disabled:bg-amber-200">Undo Last</button>
                </div>
              </section>

              <section aria-labelledby="materials-heading">
                <h3 id="materials-heading" className="font-serif text-xl font-bold text-purple-950">Choose position {Math.min(materials.length + 1, JEWELRY_KIND_DETAILS[kind].slots)}</h3>
                {groupedMaterials.length === 0 ? <p className="mt-2 text-sm text-purple-800">No jewelry materials are available.</p> : groupedMaterials.map((section) => (
                  <div key={section.group} className="mt-4">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-purple-800">{section.group}</h4>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {section.items.map((itemId) => (
                        <button key={itemId} type="button" disabled={materials.length >= JEWELRY_KIND_DETAILS[kind].slots || availableCount(itemId) < 1} onClick={() => addMaterial(itemId)} aria-label={`Add ${ITEMS[itemId].name}. ${availableCount(itemId)} available for this design.`} className="flex min-h-16 items-center gap-3 rounded-xl bg-white p-3 text-left shadow ring-1 ring-purple-200 disabled:bg-stone-100 disabled:text-stone-500">
                          <MaterialIcon itemId={itemId} />
                          <span><span className="block text-sm font-bold">{ITEMS[itemId].name}</span><span className="block text-xs">{availableCount(itemId)} available</span></span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

              <section aria-labelledby="finish-design-heading" className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-300">
                <h3 id="finish-design-heading" className="font-serif text-xl font-bold text-amber-950">Finish Your Design</h3>
                <label htmlFor="jewelry-name" className="mt-3 block text-sm font-bold text-amber-900">Name your piece <span className="font-normal">(optional)</span></label>
                <input id="jewelry-name" value={name} maxLength={50} onChange={(event) => setName(event.target.value)} placeholder="Melody can name it for you" className="mt-1 min-h-12 w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-base text-stone-900 focus:outline-none focus:ring-4 focus:ring-purple-300" />
                <button type="button" disabled={materials.length !== JEWELRY_KIND_DETAILS[kind].slots || (state.inventory[JEWELRY_KIND_DETAILS[kind].foundationId] || 0) < 1} onClick={finishPiece} className="mt-3 min-h-12 w-full rounded-xl bg-purple-700 px-4 py-3 font-bold text-white shadow active:bg-purple-800 disabled:bg-purple-200 disabled:text-purple-500">Complete One-of-a-Kind Piece</button>
              </section>
            </>
          )}

          {completed && (
            <section className="jewelry-complete-sparkle rounded-2xl bg-gradient-to-br from-purple-100 via-white to-amber-100 p-6 text-center shadow ring-1 ring-purple-300" aria-labelledby="finished-jewelry-heading">
              <p className="text-4xl" aria-hidden="true">💎✨</p>
              <h3 id="finished-jewelry-heading" className="mt-2 font-serif text-2xl font-bold text-purple-950">{completed.name}</h3>
              <p className="mt-2 text-sm text-purple-800">Melody places the finished {JEWELRY_KIND_DETAILS[completed.kind].label.toLowerCase()} into a soft display pouch. Seaweed&apos;s estimated offer is {completed.value} Sand Dollars.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">{completed.materials.map((itemId, index) => <span key={`${itemId}-${index}`} className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow ring-1 ring-amber-300"><MaterialIcon itemId={itemId} /></span>)}</div>
              <button type="button" onClick={startAnother} className="mt-5 w-full rounded-xl bg-purple-700 py-3 font-bold text-white">Create Another Piece</button>
            </section>
          )}

          <section aria-labelledby="jewelry-collection-heading" className="border-t border-purple-200 pt-5">
            <h3 id="jewelry-collection-heading" className="font-serif text-xl font-bold text-purple-950">Your One-of-a-Kind Collection</h3>
            <p className="mt-1 text-sm text-purple-800">Favorite treasured pieces to protect them from being sold to Seaweed.</p>
            {state.customJewelry.length === 0 ? (
              <p className="mt-3 rounded-xl bg-white p-4 text-sm text-stone-600 ring-1 ring-stone-200">Your display tray is waiting for its first design.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {state.customJewelry.map((piece) => (
                  <article key={piece.id} className="rounded-2xl bg-white p-4 shadow ring-1 ring-purple-200">
                    <div className="flex items-start justify-between gap-3"><div><h4 className="font-bold text-purple-950">{piece.name}</h4><p className="text-xs text-purple-700">{JEWELRY_KIND_DETAILS[piece.kind].label} · Seaweed value: {piece.value} Sand Dollars</p></div><span className="text-2xl" aria-hidden="true">{piece.favorite ? "⭐" : KIND_ICONS[piece.kind]}</span></div>
                    <p className="mt-2 text-sm text-stone-700">{piece.materials.map((itemId) => ITEMS[itemId]?.name).join(", ")}</p>
                    <button type="button" onClick={() => toggleCustomJewelryFavorite(piece.id)} aria-pressed={piece.favorite} className="mt-3 min-h-11 w-full rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-950 ring-1 ring-amber-300">{piece.favorite ? "Remove from Favorites" : "Mark as Favorite"}</button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
