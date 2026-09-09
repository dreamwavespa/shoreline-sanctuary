"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import Notebook from "./Notebook";
import { COTTAGE_ROOMS, COTTAGE_HARMONY_LAYERS, VILLAGERS } from "@/lib/villagers";
import VillagerCard from "./VillagerCard";
import SeaGlassSorting from "./SeaGlassSorting";

export default function Cottage() {
  const { state, setMusicOverride } = useGame();
  const [roomId, setRoomId] = useState(COTTAGE_ROOMS[0].id);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [sortingOpen, setSortingOpen] = useState(false);
  const sortingButtonRef = useRef<HTMLButtonElement>(null);

  const closeSorting = () => {
    setSortingOpen(false);
    window.setTimeout(() => sortingButtonRef.current?.focus(), 0);
  };

  const bondedSisterCount = COTTAGE_ROOMS.filter(
    (r) => (state.villagerGiftCounts[r.ownerId] || 0) > 0
  ).length;

  // Cottage Harmony Engine: the score itself layers in as sisters are
  // bonded, using the game's single-music-track engine (same override
  // pattern as the Kitchen and Reef zones) so it never doubles up with
  // the beach zone track.
  useEffect(() => {
    if (bondedSisterCount >= 1) {
      setMusicOverride(`cottage${Math.min(4, bondedSisterCount)}`);
    } else {
      setMusicOverride(null);
    }
    return () => setMusicOverride(null);
  }, [bondedSisterCount, setMusicOverride]);
  const currentLayer =
    [...COTTAGE_HARMONY_LAYERS].reverse().find((l) => l.sisterCount <= bondedSisterCount) || null;

  const room = COTTAGE_ROOMS.find((r) => r.id === roomId) || COTTAGE_ROOMS[0];
  const sister = VILLAGERS[room.ownerId];

  return (
    <div className="h-full overflow-y-auto pb-24 bg-[#241a3d]">
      <div className="relative w-full h-[42%] min-h-[220px] overflow-hidden select-none">
        <Image src={room.imageUrl} alt={room.name} fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#241a3d]" />
        <div className="absolute bottom-3 left-3 right-3 bg-black/50 text-amber-50 rounded-xl px-3 py-2">
          <p className="font-serif text-sm font-bold">{room.name}</p>
          <p className="text-[11px] text-amber-100/80">{room.levelLabel} · {room.station}</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="flex gap-1.5">
          {COTTAGE_ROOMS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRoomId(r.id)}
              className={`flex-1 py-2 rounded-full text-[11px] font-semibold transition ${
                r.id === roomId ? "bg-indigo-600 text-white" : "bg-white/80 text-indigo-800"
              }`}
            >
              {VILLAGERS[r.ownerId].name}
            </button>
          ))}
        </div>

        <p className="text-xs text-indigo-100/80 leading-relaxed">{room.description}</p>

        {room.id === "jewelry-parlor" && (
          <button
            ref={sortingButtonRef}
            type="button"
            onClick={() => setNotebookOpen(true)}
            className="w-full text-left rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-amber-200 flex items-center gap-3 active:scale-[0.98] transition"
          >
            <div className="w-14 h-14 shrink-0 rounded-xl bg-amber-50 flex items-center justify-center text-3xl">📖</div>
            <div className="flex-1">
              <p className="font-bold text-amber-900">The Reading Stand</p>
              <p className="text-xs text-amber-700">
                A sunlit wooden stand near Melody's workbench, holding your Sanctuary Explorer's Notebook.
              </p>
            </div>
          </button>
        )}

        {sister && <VillagerCard villager={sister} />}

        <section aria-labelledby="cottage-games-heading" className="rounded-2xl bg-gradient-to-br from-cyan-50 to-indigo-100 p-4 shadow-md ring-1 ring-cyan-200">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">Cottage Mini-Game</p>
          <h2 id="cottage-games-heading" className="mt-1 font-serif text-lg font-bold text-indigo-950">💎 Sea Glass Sorting</h2>
          <p className="mt-1 text-sm text-indigo-800">Sort pieces by color, size, or shape. Rare colors can become crafting treasures for Melody.</p>
          <button
            type="button"
            onClick={() => setSortingOpen(true)}
            className="mt-3 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800"
          >
            Play Sea Glass Sorting
          </button>
        </section>

        <div className="rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-indigo-200">
          <p className="text-[11px] font-semibold text-indigo-800/70 uppercase tracking-wide mb-1.5">
            Cottage Harmony Engine
          </p>
          <p className="text-sm text-indigo-900 font-semibold mb-1">
            {bondedSisterCount}/4 Sisters bonded
          </p>
          <p className="text-xs text-indigo-700">
            {currentLayer
              ? currentLayer.description
              : "Give a loved gift to a sister to start the music."}
          </p>
          <div className="flex gap-1 mt-3">
            {COTTAGE_ROOMS.map((r, i) => {
              const bonded = (state.villagerGiftCounts[r.ownerId] || 0) > 0;
              return (
                <div
                  key={r.id}
                  className={`flex-1 h-1.5 rounded-full ${bonded ? "bg-indigo-500" : "bg-indigo-100"}`}
                  title={`${VILLAGERS[r.ownerId].name}${bonded ? " — bonded" : ""}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {notebookOpen && <Notebook onClose={() => setNotebookOpen(false)} />}
      {sortingOpen && <SeaGlassSorting onClose={closeSorting} />}
    </div>
  );
}
