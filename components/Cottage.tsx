"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import Notebook from "./Notebook";
import { COTTAGE_ROOMS, COTTAGE_HARMONY_LAYERS, VILLAGERS } from "@/lib/villagers";
import VillagerCard from "./VillagerCard";
import SeaGlassSorting from "./SeaGlassSorting";
import KaianaMosaicStudio from "./KaianaMosaicStudio";
import CoralieUnderwaterGarden from "./CoralieUnderwaterGarden";
import CadenceNursery from "./CadenceNursery";
import HalloweenCauldron from "./HalloweenCauldron";

const MARELLA_OBSERVATIONS = [
  { id: "moon-halo", name: "Moon Halo", icon: "🌕", interpretation: "A silver ring around the moon. Marella says the sanctuary is holding a quiet promise.", reward: "star-sand" },
  { id: "constellation-reflection", name: "Constellation Reflection", icon: "✨", interpretation: "Stars shimmer in the tide basin as if the sea has borrowed the sky.", reward: "pearl-silver" },
  { id: "meteor-trail", name: "Meteor Trail", icon: "☄️", interpretation: "A bright trail crosses the horizon. Marella calls it a wish already on its way.", reward: "sand-snow-white" },
  { id: "bioluminescent-tide", name: "Bioluminescent Tide", icon: "🌊", interpretation: "Cyan light gathers along the waves. The smallest sea creatures are answering the moon.", reward: "bioluminescent-shard" },
  { id: "distant-aurora", name: "Distant Aurora", icon: "🌌", interpretation: "A veil of color flickers far beyond the island. Marella records it as an exceptionally rare sky-tide.", reward: "pearl-rainbow" },
  { id: "moon-jelly-migration", name: "Moon Jelly Migration", icon: "🪼", interpretation: "Tiny lights drift beneath the surface. Marella says the moon jellies are following an ancient current.", reward: "pearl-glow-dark" },
  { id: "celestial-tide", name: "Celestial Tide", icon: "🔮", interpretation: "For one luminous moment, stars, moonlight, and ocean reflections align. Marella calls it the Celestial Tide.", reward: "moonstone-moon" },
] as const;

const COTTAGE_MOSAICS = [
  { itemId: "mosaic-moonlit-tide", name: "Moonlit Tide", icon: "🌙" },
  { itemId: "mosaic-rainbow-fish", name: "Rainbow Fish", icon: "🐠" },
  { itemId: "mosaic-seaglass-flower", name: "Sea Glass Flower", icon: "🌸" },
];

export default function Cottage() {
  const { state, setMusicOverride } = useGame();
  const [roomId, setRoomId] = useState(COTTAGE_ROOMS[0].id);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [sortingOpen, setSortingOpen] = useState(false);
  const [mosaicOpen, setMosaicOpen] = useState(false);
  const [gardenOpen, setGardenOpen] = useState(false);
  const [cadenceOpen, setCadenceOpen] = useState(false);
  const [marellaDiscoveries, setMarellaDiscoveries] = useState<string[]>([]);
  const [marellaLastObservation, setMarellaLastObservation] = useState("");
  const [marellaResult, setMarellaResult] = useState<string>("");
  const sortingButtonRef = useRef<HTMLButtonElement>(null);
  const mosaicButtonRef = useRef<HTMLButtonElement>(null);
  const gardenButtonRef = useRef<HTMLButtonElement>(null);
  const cadenceButtonRef = useRef<HTMLButtonElement>(null);

  const closeSorting = () => { setSortingOpen(false); window.setTimeout(() => sortingButtonRef.current?.focus(), 0); };
  const closeMosaic = () => { setMosaicOpen(false); window.setTimeout(() => mosaicButtonRef.current?.focus(), 0); };
  const closeGarden = () => { setGardenOpen(false); window.setTimeout(() => gardenButtonRef.current?.focus(), 0); };
  const closeCadence = () => { setCadenceOpen(false); window.setTimeout(() => cadenceButtonRef.current?.focus(), 0); };

  const bondedSisterCount = COTTAGE_ROOMS.filter((r) => (state.villagerGiftCounts[r.ownerId] || 0) > 0).length;

  useEffect(() => {
    if (bondedSisterCount >= 1) setMusicOverride(`cottage${Math.min(4, bondedSisterCount)}`);
    else setMusicOverride(null);
    return () => setMusicOverride(null);
  }, [bondedSisterCount, setMusicOverride]);

  const currentLayer = [...COTTAGE_HARMONY_LAYERS].reverse().find((l) => l.sisterCount <= bondedSisterCount) || null;
  const room = COTTAGE_ROOMS.find((r) => r.id === roomId) || COTTAGE_ROOMS[0];
  const sister = VILLAGERS[room.ownerId];
  const completedMosaics = COTTAGE_MOSAICS.filter((mosaic) => (state.inventory[mosaic.itemId] || 0) > 0);
  const nighttime = (() => { const hour = new Date().getHours(); return hour >= 19 || hour < 6; })();

  useEffect(() => {
    try {
      const discoveries = JSON.parse(localStorage.getItem("shoreline-marella-observations") || "[]");
      if (Array.isArray(discoveries)) setMarellaDiscoveries(discoveries);
      setMarellaLastObservation(localStorage.getItem("shoreline-marella-last-observation") || "");
    } catch {}
  }, []);

  const observeWithMarella = () => {
    if (!nighttime) { setMarellaResult("Marella's telescope is ready after 7 PM, when the night sky becomes visible."); return; }
    const now = new Date();
    const nightDate = new Date(now);
    if (now.getHours() < 6) nightDate.setDate(nightDate.getDate() - 1);
    const nightKey = `${nightDate.getFullYear()}-${String(nightDate.getMonth() + 1).padStart(2, "0")}-${String(nightDate.getDate()).padStart(2, "0")}`;
    if (marellaLastObservation === nightKey) { setMarellaResult("You and Marella have already recorded tonight's observation. Return tomorrow night."); return; }
    const undiscovered = MARELLA_OBSERVATIONS.filter((o) => !marellaDiscoveries.includes(o.id));
    const pool = undiscovered.length ? undiscovered : MARELLA_OBSERVATIONS;
    const observation = pool[Math.floor(Math.random() * pool.length)];
    const next = marellaDiscoveries.includes(observation.id) ? marellaDiscoveries : [...marellaDiscoveries, observation.id];
    setMarellaDiscoveries(next);
    setMarellaLastObservation(nightKey);
    localStorage.setItem("shoreline-marella-observations", JSON.stringify(next));
    localStorage.setItem("shoreline-marella-last-observation", nightKey);
    setMarellaResult(`${observation.name}. ${observation.interpretation}`);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#241a3d]">
      <div className="relative w-full h-[42%] min-h-[220px] overflow-hidden select-none">
        <Image src={room.imageUrl} alt={room.name} fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#241a3d]" />
        {completedMosaics.length > 0 && <div className="absolute right-3 top-3 flex gap-2 rounded-xl bg-[#241a3d]/80 p-2 shadow-lg" aria-label="Completed mosaics displayed in the cottage">{completedMosaics.map((mosaic) => <div key={mosaic.itemId} role="img" aria-label={`${mosaic.name} mosaic, created ${state.inventory[mosaic.itemId]} ${state.inventory[mosaic.itemId] === 1 ? "time" : "times"}`} className="flex h-14 w-12 items-center justify-center rounded-sm border-4 border-amber-500 bg-indigo-950 text-2xl shadow-inner"><span aria-hidden="true">{mosaic.icon}</span></div>)}</div>}
        <div className="absolute bottom-3 left-3 right-3 bg-black/50 text-amber-50 rounded-xl px-3 py-2"><p className="font-serif text-sm font-bold">{room.name}</p><p className="text-[11px] text-amber-100/80">{room.levelLabel} · {room.station}</p></div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="flex gap-1.5">{COTTAGE_ROOMS.map((r) => <button key={r.id} type="button" onClick={() => setRoomId(r.id)} className={`flex-1 py-2 rounded-full text-[11px] font-semibold transition ${r.id === roomId ? "bg-indigo-600 text-white" : "bg-white/80 text-indigo-800"}`}>{VILLAGERS[r.ownerId].name}</button>)}</div>
        <p className="text-xs text-indigo-100/80 leading-relaxed">{room.description}</p>

        {room.id === "jewelry-parlor" && <button type="button" onClick={() => setNotebookOpen(true)} className="w-full text-left rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-amber-200 flex items-center gap-3 active:scale-[0.98] transition"><div className="w-14 h-14 shrink-0 rounded-xl bg-amber-50 flex items-center justify-center text-3xl">📖</div><div className="flex-1"><p className="font-bold text-amber-900">The Reading Stand</p><p className="text-xs text-amber-700">A sunlit wooden stand near Melody's workbench, holding your Sanctuary Explorer's Notebook.</p></div></button>}

        {sister && <VillagerCard villager={sister} />}

        <HalloweenCauldron />

        <section aria-labelledby="cadence-heading" className="rounded-2xl bg-gradient-to-br from-pink-50 via-white to-emerald-50 p-4 shadow-md ring-1 ring-pink-200">
          <div className="flex items-center gap-3">
            <Image src="/images/IMG_6343.jpeg" alt="Cadence, the baby sister of the Sea Glass Sisters" width={72} height={72} unoptimized className="h-18 w-18 rounded-2xl object-cover shadow" />
            <div><p className="text-[11px] font-semibold uppercase tracking-wide text-pink-700">Sea Glass Sisters</p><h2 id="cadence-heading" className="font-serif text-lg font-bold text-rose-950">🌸 Visit Baby Cadence</h2></div>
          </div>
          <p className="mt-2 text-sm text-rose-900">Visit Cady's nursery to play the shell piano, toss her beach ball, discover washed-up toys, feed her snacks, and craft decorations for her room.</p>
          <button ref={cadenceButtonRef} type="button" onClick={() => setCadenceOpen(true)} className="mt-3 w-full rounded-xl bg-rose-700 p-2 font-bold text-white shadow active:bg-rose-800 flex items-center justify-center gap-3"><Image src="/images/IMG_6344.jpeg" alt="" aria-hidden="true" width={52} height={52} unoptimized className="h-13 w-13 rounded-xl object-cover" /><span>Enter Cadence's Nursery</span></button>
        </section>

        {room.id === "celestial-observatory" && <section aria-labelledby="marella-observatory-heading" className="rounded-2xl bg-gradient-to-br from-indigo-950 via-blue-950 to-cyan-950 p-4 shadow-md ring-1 ring-cyan-300 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">Marella · Seer of Tides</p>
          <h2 id="marella-observatory-heading" className="mt-1 font-serif text-lg font-bold">🔭 Marella's Observatory</h2>
          <Image src="/images/Marella-observatory.PNG" alt="Marella's moonlit observatory with a brass telescope, celestial charts, crystals, lanterns, and an open view across the ocean" width={1536} height={1024} unoptimized className="mt-3 w-full rounded-xl object-cover shadow" />
          <p className="mt-3 text-sm text-cyan-50">Stars reveal what the tides remember. Join Marella for one observation each night and gradually fill her Observatory Journal.</p>
          <p className="mt-2 text-xs text-cyan-200">{marellaDiscoveries.length}/7 celestial observations recorded · Available 7 PM–5:59 AM.</p>
          <button type="button" onClick={observeWithMarella} className="mt-3 w-full rounded-xl bg-cyan-700 py-3 font-bold text-white shadow active:bg-cyan-800">{nighttime ? "Observe the Night Sky" : "Observatory Opens at 7 PM"}</button>
          {marellaResult && <p role="status" aria-live="polite" className="mt-3 rounded-xl bg-white/10 p-3 text-sm text-cyan-50">{marellaResult}</p>}
          <div className="mt-4" aria-labelledby="marella-journal-heading"><h3 id="marella-journal-heading" className="font-bold text-cyan-100">Observatory Journal</h3><ul className="mt-2 space-y-1 text-sm">{MARELLA_OBSERVATIONS.map((o) => <li key={o.id}>{marellaDiscoveries.includes(o.id) ? `${o.icon} ${o.name}` : "☆ Undiscovered celestial event"}</li>)}</ul></div>
        </section>}

        {room.id === "bioluminescent-grotto" && <section aria-labelledby="coralie-garden-heading" className="rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-100 p-4 shadow-md ring-1 ring-emerald-200"><p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">Coralie's Sanctuary</p><h2 id="coralie-garden-heading" className="mt-1 font-serif text-lg font-bold text-emerald-950">🌿 Underwater Garden</h2><p className="mt-1 text-sm text-emerald-800">Create Coralie's glowing grotto garden. Choose six garden spaces, then fill them with underwater plants, island flora, and handcrafted decorations.</p><p className="mt-2 text-xs text-emerald-700">Your garden layout is saved automatically, and every space has a named, screen-reader-friendly control.</p><button ref={gardenButtonRef} type="button" onClick={() => setGardenOpen(true)} className="mt-3 w-full rounded-xl bg-emerald-700 py-3 font-bold text-white shadow active:bg-emerald-800">Enter Coralie's Underwater Garden</button></section>}

        <section aria-labelledby="cottage-games-heading" className="rounded-2xl bg-gradient-to-br from-cyan-50 to-indigo-100 p-4 shadow-md ring-1 ring-cyan-200"><p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">Cottage Mini-Game</p><h2 id="cottage-games-heading" className="mt-1 font-serif text-lg font-bold text-indigo-950">💎 Sea Glass Sorting</h2><p className="mt-1 text-sm text-indigo-800">Sort pieces by color, size, or shape. Rare colors can become crafting treasures for Melody.</p><button ref={sortingButtonRef} type="button" onClick={() => setSortingOpen(true)} className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800">Play Sea Glass Sorting</button></section>

        {room.id === "restoration-studio" && (state.inventory["kaiana-antique-crystal-curio-case"] || 0) > 0 && <section aria-labelledby="kaiana-curio-heading" className="rounded-2xl bg-gradient-to-br from-amber-50 to-stone-100 p-4 shadow-md ring-2 ring-amber-400"><p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">Explorer's Notebook Reward</p><h2 id="kaiana-curio-heading" className="mt-1 font-serif text-lg font-bold text-stone-900">🗄️ Kaiana’s Antique Crystal Curio Case</h2><Image src="/images/Kaiana’s-case.PNG" alt="Kaiana’s Antique Crystal Curio Case, a restored driftwood and brass glass cabinet displaying crystals and restored seaside relics" width={1024} height={1024} unoptimized className="mt-3 w-full rounded-xl object-cover shadow" /><p className="mt-3 text-sm text-stone-700">The restored driftwood-and-brass cabinet now stands in Kaiana’s studio, its glass shelves displaying treasures from your Gems & Restorations discoveries.</p><p className="mt-2 text-xs font-semibold text-amber-900">Unlocked by completing Gems & Restorations 9/9.</p></section>}

        {room.id === "restoration-studio" && <section aria-labelledby="mosaic-game-heading" className="rounded-2xl bg-gradient-to-br from-violet-50 to-cyan-100 p-4 shadow-md ring-1 ring-violet-200"><p className="text-[11px] font-semibold uppercase tracking-wide text-violet-800">Kaiana's Mini-Game</p><h2 id="mosaic-game-heading" className="mt-1 font-serif text-lg font-bold text-indigo-950">🎨 Kaiana's Mosaic Studio</h2><p className="mt-1 text-sm text-indigo-800">Fit oddly shaped sea glass into three mosaic designs. Finished pieces become framed cottage decorations.</p><button ref={mosaicButtonRef} type="button" onClick={() => setMosaicOpen(true)} className="mt-3 w-full rounded-xl bg-violet-700 py-3 font-bold text-white shadow active:bg-violet-800">Open Mosaic Studio</button></section>}

        <div className="rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-indigo-200"><p className="text-[11px] font-semibold text-indigo-800/70 uppercase tracking-wide mb-1.5">Cottage Harmony Engine</p><p className="text-sm text-indigo-900 font-semibold mb-1">{bondedSisterCount}/4 Sisters bonded</p><p className="text-xs text-indigo-700">{currentLayer ? currentLayer.description : "Give a loved gift to a sister to start the music."}</p><div className="flex gap-1 mt-3">{COTTAGE_ROOMS.map((r) => { const bonded = (state.villagerGiftCounts[r.ownerId] || 0) > 0; return <div key={r.id} className={`flex-1 h-1.5 rounded-full ${bonded ? "bg-indigo-500" : "bg-indigo-100"}`} title={`${VILLAGERS[r.ownerId].name}${bonded ? " — bonded" : ""}`} />; })}</div></div>
      </div>

      {notebookOpen && <Notebook onClose={() => setNotebookOpen(false)} />}
      {sortingOpen && <SeaGlassSorting onClose={closeSorting} />}
      {mosaicOpen && <KaianaMosaicStudio onClose={closeMosaic} />}
      {gardenOpen && <CoralieUnderwaterGarden onClose={closeGarden} />}
      {cadenceOpen && <CadenceNursery onClose={closeCadence} />}
    </div>
  );
}
