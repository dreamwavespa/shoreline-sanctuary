"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/lib/store";

interface GardenOption {
  id: string;
  name: string;
  icon: string;
  kind: "plant" | "decor";
  description: string;
  discoveryIds?: string[];
  discoveryLabel?: string;
}

interface GardenBed { id: string; name: string; description: string; }
type GardenPlacements = Record<string, string>;
const STORAGE_KEY = "shoreline-coralie-underwater-garden";

const GARDEN_BEDS: GardenBed[] = [
  { id: "moon-pool", name: "Moon Pool", description: "A shallow silver-lit pool beside the grotto wall." },
  { id: "pearl-patch", name: "Pearl Patch", description: "Soft sand and tiny shells beneath a curtain of bubbles." },
  { id: "tide-bed", name: "Tide Bed", description: "A gently moving bed where leafy ocean plants can sway." },
  { id: "grotto-wall", name: "Grotto Wall", description: "A sheltered stone wall perfect for glowing plants and hanging decorations." },
  { id: "cottage-path", name: "Cottage Path", description: "The path leading from Coralie's grotto toward the Sea Glass Cottage." },
  { id: "island-planter", name: "Island Planter", description: "A raised planter for flora Coralie has brought down from the island." },
];

const GARDEN_OPTIONS: GardenOption[] = [
  { id: "eelgrass", name: "Eelgrass", icon: "🌿", kind: "plant", description: "Long emerald blades that ripple softly with the current.", discoveryIds: ["kelp"], discoveryLabel: "Discover kelp or a similar underwater green" },
  { id: "sea-lettuce", name: "Sea Lettuce", icon: "🥬", kind: "plant", description: "Bright green edible fronds with ruffled edges.", discoveryIds: ["sea-lettuce"], discoveryLabel: "Discover Sea Lettuce in the tide pools or sanctuary" },
  { id: "sea-lavender", name: "Sea Lavender", icon: "🪻", kind: "plant", description: "Purple coastal flowers Coralie has adapted for the sheltered grotto.", discoveryIds: ["sea-lavender"], discoveryLabel: "Harvest Sea Lavender in the Coconut Grove" },
  { id: "glow-bloom", name: "Glow Bloom", icon: "✨", kind: "plant", description: "A gentle bioluminescent flower that glows after dusk.", discoveryIds: ["bioluminescent-shard", "rain-lily-blossom"], discoveryLabel: "Discover a bioluminescent shard or Rain Lily Blossom" },
  { id: "sea-berry-vine", name: "Sea Berry Vine", icon: "🫐", kind: "plant", description: "A trailing vine with jewel-like berries for future recipes and gifts.", discoveryIds: ["sea-berry", "coastal-brambleberry", "blueberry", "raspberry", "strawberry"], discoveryLabel: "Harvest a Sea Berry or berry bundle" },
  { id: "kelp-fan", name: "Kelp Fan", icon: "🌱", kind: "plant", description: "Broad golden-green leaves that create a calm hiding place for small sea life.", discoveryIds: ["kelp"], discoveryLabel: "Discover Kelp" },
  { id: "rosemary-bed", name: "Rosemary Bed", icon: "🌿", kind: "plant", description: "Fragrant island rosemary growing in a sheltered planter.", discoveryIds: ["rosemary"], discoveryLabel: "Harvest Rosemary in the Coconut Grove" },
  { id: "sea-parsley-bed", name: "Sea Parsley", icon: "🌱", kind: "plant", description: "Tender coastal parsley transplanted into Coralie's saltwater garden.", discoveryIds: ["sea-parsley"], discoveryLabel: "Harvest Sea Parsley in the Coconut Grove" },
  { id: "sea-pea-vine", name: "Sea Pea Vine", icon: "🫛", kind: "plant", description: "A climbing coastal edible with delicate green tendrils.", discoveryIds: ["sea-peas"], discoveryLabel: "Harvest Sea Peas in the Coconut Grove" },
  { id: "lemongrass", name: "Wild Lemongrass", icon: "🌾", kind: "plant", description: "Tall fragrant blades brought from the island herb thicket.", discoveryIds: ["wild-lemongrass"], discoveryLabel: "Harvest Wild Lemongrass in the Coconut Grove" },
  { id: "beach-mint", name: "Coastal Beach Mint", icon: "🍃", kind: "plant", description: "A fresh mint patch that thrives near Coralie's cool grotto springs.", discoveryIds: ["coastal-beach-mint"], discoveryLabel: "Harvest Coastal Beach Mint in the Coconut Grove" },
  { id: "pearl-lantern", name: "Pearl Lantern", icon: "🏮", kind: "decor", description: "A softly glowing lantern made from shell, pearl, and sea glass." },
  { id: "shell-arch", name: "Shell Arch", icon: "🐚", kind: "decor", description: "A small decorative arch made from shells gathered around the sanctuary." },
  { id: "sea-glass-marker", name: "Sea Glass Garden Marker", icon: "💎", kind: "decor", description: "A colorful marker that catches the grotto light." },
  { id: "driftwood-trellis", name: "Driftwood Trellis", icon: "🪵", kind: "decor", description: "A rustic frame for climbing island plants and trailing vines." },
];

export default function CoralieUnderwaterGarden({ onClose }: { onClose: () => void }) {
  const { state } = useGame();
  const [placements, setPlacements] = useState<GardenPlacements>({});
  const [selectedBedId, setSelectedBedId] = useState(GARDEN_BEDS[0].id);
  const [announcement, setAnnouncement] = useState("Coralie's Underwater Garden opened.");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) setPlacements(JSON.parse(saved)); } catch {} window.setTimeout(() => closeButtonRef.current?.focus(), 0); }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(placements)); } catch {} }, [placements]);

  const discovered = (option: GardenOption) => !option.discoveryIds || option.discoveryIds.some((id) => state.notebookDiscovered[id] || (state.inventory[id] || 0) > 0);
  const selectedBed = GARDEN_BEDS.find((bed) => bed.id === selectedBedId) || GARDEN_BEDS[0];
  const placedCount = Object.keys(placements).length;
  const plantedCount = useMemo(() => Object.values(placements).filter((id) => GARDEN_OPTIONS.find((o) => o.id === id)?.kind === "plant").length, [placements]);
  const unlockedPlants = GARDEN_OPTIONS.filter((o) => o.kind === "plant" && discovered(o));
  const lockedPlants = GARDEN_OPTIONS.filter((o) => o.kind === "plant" && !discovered(o));

  const placeOption = (option: GardenOption) => { if (!discovered(option)) return; setPlacements((current) => ({ ...current, [selectedBedId]: option.id })); setAnnouncement(`${option.name} placed in ${selectedBed.name}.`); };
  const clearSelectedBed = () => { const existingId = placements[selectedBedId]; if (!existingId) { setAnnouncement(`${selectedBed.name} is already empty.`); return; } const existing = GARDEN_OPTIONS.find((o) => o.id === existingId); setPlacements((current) => { const next = { ...current }; delete next[selectedBedId]; return next; }); setAnnouncement(`${existing?.name || "Decoration"} removed from ${selectedBed.name}.`); };
  const resetGarden = () => { setPlacements({}); setAnnouncement("The underwater garden has been cleared. All six garden spaces are ready to decorate again."); };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071f2d]/95 p-4 text-white" role="dialog" aria-modal="true" aria-labelledby="coralie-garden-title">
      <div className="mx-auto max-w-2xl pb-24">
        <div className="sticky top-0 z-10 -mx-1 mb-4 rounded-2xl bg-[#0b3441]/95 p-4 shadow-xl ring-1 ring-emerald-300/30 backdrop-blur">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Coralie's Grotto</p><h1 id="coralie-garden-title" className="font-serif text-2xl font-bold text-emerald-50">🌿 Underwater Garden</h1><p className="mt-1 text-sm text-cyan-100">Plants unlock as you discover and harvest them around Shoreline. Your garden layout is saved automatically.</p></div><button ref={closeButtonRef} type="button" onClick={onClose} className="rounded-xl bg-white/10 px-4 py-2 font-bold text-white ring-1 ring-white/20">Close</button></div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-emerald-950/70 px-3 py-1">{placedCount}/6 spaces decorated</span><span className="rounded-full bg-emerald-950/70 px-3 py-1">{plantedCount} living plant{plantedCount === 1 ? "" : "s"}</span><span className="rounded-full bg-emerald-950/70 px-3 py-1">{unlockedPlants.length}/{unlockedPlants.length + lockedPlants.length} plants discovered</span></div>
        </div>
        <div aria-live="polite" className="sr-only">{announcement}</div>

        <section aria-labelledby="garden-preview-heading" className="mb-5 rounded-3xl bg-gradient-to-b from-cyan-900/80 to-emerald-950/90 p-4 shadow-xl ring-1 ring-cyan-300/20"><h2 id="garden-preview-heading" className="font-serif text-xl font-bold text-cyan-50">Garden View</h2><p className="mb-4 mt-1 text-sm text-cyan-100/80">Six little spaces curve around Coralie's glowing grotto. Select one to edit it.</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{GARDEN_BEDS.map((bed) => { const option = GARDEN_OPTIONS.find((item) => item.id === placements[bed.id]); const selected = bed.id === selectedBedId; return <button key={bed.id} type="button" onClick={() => { setSelectedBedId(bed.id); setAnnouncement(`${bed.name} selected. ${option ? `${option.name} is placed here.` : "This space is empty."}`); }} aria-pressed={selected} aria-label={`${bed.name}. ${option ? `${option.name} placed here.` : "Empty garden space."}${selected ? " Selected." : ""}`} className={`min-h-28 rounded-2xl p-3 text-left shadow-md ${selected ? "bg-emerald-100 text-emerald-950 ring-4 ring-amber-300" : "bg-white/10 text-white ring-1 ring-white/20"}`}><span aria-hidden="true" className="block text-3xl">{option?.icon || "🫧"}</span><span className="mt-2 block text-sm font-bold">{bed.name}</span><span className="mt-1 block text-xs opacity-80">{option?.name || "Empty"}</span></button>; })}</div></section>

        <section aria-labelledby="selected-bed-heading" className="mb-5 rounded-2xl bg-white/95 p-4 text-slate-900 shadow-lg"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Selected Garden Space</p><h2 id="selected-bed-heading" className="mt-1 font-serif text-xl font-bold text-emerald-950">{selectedBed.name}</h2><p className="mt-1 text-sm text-slate-700">{selectedBed.description}</p>{placements[selectedBedId] && <button type="button" onClick={clearSelectedBed} className="mt-3 rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-800">Clear {selectedBed.name}</button>}</section>

        <section aria-labelledby="plants-heading" className="mb-5"><h2 id="plants-heading" className="font-serif text-xl font-bold text-emerald-50">Discovered Plants</h2><p className="mb-3 text-sm text-cyan-100/80">Once you have discovered a plant or its source ingredient anywhere in Shoreline, Coralie can cultivate it here without consuming your inventory.</p><div className="space-y-2">{unlockedPlants.length === 0 && <p className="rounded-xl bg-white/10 p-4 text-sm text-cyan-100">No garden plants discovered yet. Visit the Coconut Grove, tide pools, reef, and other sanctuary areas, then return to Coralie.</p>}{unlockedPlants.map((option) => <button key={option.id} type="button" onClick={() => placeOption(option)} className="w-full rounded-2xl bg-emerald-50 p-4 text-left text-emerald-950 shadow-md"><span className="flex items-start gap-3"><span aria-hidden="true" className="text-3xl">{option.icon}</span><span><span className="block font-bold">Plant {option.name} in {selectedBed.name}</span><span className="mt-1 block text-xs text-emerald-800">{option.description}</span></span></span></button>)}</div></section>

        {lockedPlants.length > 0 && <section aria-labelledby="locked-plants-heading" className="mb-5 rounded-2xl bg-slate-900/60 p-4 ring-1 ring-white/10"><h2 id="locked-plants-heading" className="font-serif text-lg font-bold text-white">🌱 Plants Still to Discover</h2><p className="mt-1 text-sm text-cyan-100">Coralie keeps these spaces in her botanical journal until you find the plant in the sanctuary.</p><div className="mt-3 space-y-2">{lockedPlants.map((option) => <div key={option.id} className="rounded-xl bg-black/20 p-3" aria-label={`${option.name}, locked. ${option.discoveryLabel}`}><p className="font-bold text-slate-200">🔒 {option.name}</p><p className="mt-1 text-xs text-slate-300">{option.discoveryLabel}</p></div>)}</div></section>}

        <section aria-labelledby="decor-heading" className="mb-5"><h2 id="decor-heading" className="font-serif text-xl font-bold text-cyan-50">Garden Decorations</h2><p className="mt-1 text-sm text-cyan-100/80">Coralie's starter decorations remain available while the living collection grows through exploration.</p><div className="mt-3 space-y-2">{GARDEN_OPTIONS.filter((o) => o.kind === "decor").map((option) => <button key={option.id} type="button" onClick={() => placeOption(option)} className="w-full rounded-2xl bg-cyan-50 p-4 text-left text-cyan-950 shadow-md"><span className="flex items-start gap-3"><span aria-hidden="true" className="text-3xl">{option.icon}</span><span><span className="block font-bold">Place {option.name} in {selectedBed.name}</span><span className="mt-1 block text-xs text-cyan-800">{option.description}</span></span></span></button>)}</div></section>

        <section className="rounded-2xl bg-[#17313b] p-4 ring-1 ring-white/10"><h2 className="font-serif text-lg font-bold text-white">Coralie's Garden Notes</h2><p className="mt-1 text-sm text-cyan-100">“Bring me what the island teaches you. Once you have met a plant in the wild, we can give it a home here too.”</p><button type="button" onClick={resetGarden} className="mt-4 w-full rounded-xl bg-rose-100 py-3 font-bold text-rose-900">Reset Entire Garden</button></section>
      </div>
    </div>
  );
}
