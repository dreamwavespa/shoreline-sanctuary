"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/lib/store";

interface MosaicPiece {
  id: string;
  label: string;
  color: string;
  shape: string;
  slot: number;
}

interface MosaicDesign {
  id: string;
  name: string;
  icon: string;
  description: string;
  rewardItemId: string;
  layout: string;
  pieces: MosaicPiece[];
}

const MOSAICS: MosaicDesign[] = [
  {
    id: "moonlit-tide",
    name: "Moonlit Tide",
    icon: "🌙",
    description: "Fit six cool-toned pieces into a moonlit wave scene.",
    rewardItemId: "mosaic-moonlit-tide",
    layout: "grid-cols-3",
    pieces: [
      { id: "moon-sky-left", label: "Indigo sky shard", color: "bg-indigo-700", shape: "rounded-[48%_32%_45%_28%]", slot: 0 },
      { id: "moon-glow", label: "Pearl moon piece", color: "bg-amber-100", shape: "rounded-full", slot: 1 },
      { id: "moon-sky-right", label: "Violet sky shard", color: "bg-violet-600", shape: "[clip-path:polygon(12%_9%,92%_2%,78%_93%,4%_75%)]", slot: 2 },
      { id: "moon-wave-left", label: "Deep teal wave", color: "bg-teal-700", shape: "rounded-[55%_25%_50%_35%]", slot: 3 },
      { id: "moon-foam", label: "Sea-foam curl", color: "bg-cyan-200", shape: "[clip-path:polygon(4%_55%,30%_12%,62%_28%,96%_5%,84%_90%,24%_82%)]", slot: 4 },
      { id: "moon-wave-right", label: "Blue wave shard", color: "bg-blue-600", shape: "rounded-[25%_60%_35%_52%]", slot: 5 },
    ],
  },
  {
    id: "rainbow-fish",
    name: "Rainbow Fish",
    icon: "🐠",
    description: "Arrange bright sea glass into a shimmering little fish.",
    rewardItemId: "mosaic-rainbow-fish",
    layout: "grid-cols-3",
    pieces: [
      { id: "fish-tail-top", label: "Amber tail tip", color: "bg-amber-400", shape: "[clip-path:polygon(2%_5%,96%_50%,8%_92%)]", slot: 0 },
      { id: "fish-back", label: "Purple back piece", color: "bg-purple-600", shape: "rounded-[65%_35%_22%_48%]", slot: 1 },
      { id: "fish-head", label: "Teal head piece", color: "bg-teal-500", shape: "rounded-[55%_70%_60%_35%]", slot: 2 },
      { id: "fish-tail-bottom", label: "Pink tail tip", color: "bg-pink-500", shape: "[clip-path:polygon(7%_8%,95%_48%,5%_96%)]", slot: 3 },
      { id: "fish-belly", label: "Green belly piece", color: "bg-emerald-500", shape: "rounded-[28%_55%_65%_38%]", slot: 4 },
      { id: "fish-eye", label: "Pearl eye piece", color: "bg-slate-100", shape: "rounded-full", slot: 5 },
    ],
  },
  {
    id: "sea-glass-flower",
    name: "Sea Glass Flower",
    icon: "🌸",
    description: "Build an eight-piece flower from petal-shaped glass.",
    rewardItemId: "mosaic-seaglass-flower",
    layout: "grid-cols-4",
    pieces: [
      { id: "flower-petal-one", label: "Rose pink petal", color: "bg-rose-400", shape: "rounded-[70%_20%_65%_25%]", slot: 0 },
      { id: "flower-petal-two", label: "Lavender petal", color: "bg-violet-400", shape: "rounded-[25%_65%_22%_70%]", slot: 1 },
      { id: "flower-petal-three", label: "Sky blue petal", color: "bg-sky-400", shape: "rounded-[68%_30%_60%_35%]", slot: 2 },
      { id: "flower-petal-four", label: "Sea-green petal", color: "bg-emerald-400", shape: "rounded-[35%_65%_30%_62%]", slot: 3 },
      { id: "flower-leaf-left", label: "Deep green leaf", color: "bg-emerald-700", shape: "[clip-path:polygon(2%_45%,88%_2%,98%_88%,22%_72%)]", slot: 4 },
      { id: "flower-center", label: "Golden flower center", color: "bg-amber-300", shape: "rounded-full", slot: 5 },
      { id: "flower-stem", label: "Teal stem piece", color: "bg-teal-600", shape: "rounded-[30%_55%_35%_65%]", slot: 6 },
      { id: "flower-leaf-right", label: "Bright green leaf", color: "bg-lime-500", shape: "[clip-path:polygon(12%_4%,98%_46%,78%_92%,3%_78%)]", slot: 7 },
    ],
  },
];

function shuffled<T>(items: readonly T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function KaianaMosaicStudio({ onClose }: { onClose: () => void }) {
  const { state, collectItem, play } = useGame();
  const [designIndex, setDesignIndex] = useState(0);
  const [tray, setTray] = useState<MosaicPiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<number, MosaicPiece>>({});
  const [mistakes, setMistakes] = useState(0);
  const [guidanceEnabled, setGuidanceEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [announcement, setAnnouncement] = useState("Choose a mosaic design for Kaiana's studio.");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const design = MOSAICS[designIndex];
  const selectedPiece = tray.find((piece) => piece.id === selectedPieceId) || null;
  const placedCount = Object.keys(placed).length;

  const collection = useMemo(
    () => MOSAICS.map((mosaic) => ({ ...mosaic, count: state.inventory[mosaic.rewardItemId] || 0 })),
    [state.inventory]
  );

  useEffect(() => {
    headingRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const startMosaic = (nextDesignIndex = designIndex) => {
    const nextDesign = MOSAICS[nextDesignIndex];
    setDesignIndex(nextDesignIndex);
    setTray(shuffled(nextDesign.pieces));
    setSelectedPieceId(null);
    setPlaced({});
    setMistakes(0);
    setComplete(false);
    setPlaying(true);
    setAnnouncement(`${nextDesign.name} started. Choose a sea-glass piece, then choose its place in the mosaic frame.`);
  };

  const selectPiece = (piece: MosaicPiece) => {
    setSelectedPieceId(piece.id);
    play("seaGlass");
    setAnnouncement(`${piece.label} selected.${guidanceEnabled ? ` It belongs in position ${piece.slot + 1}.` : " Choose a position in the frame."}`);
  };

  const placePiece = (slot: number) => {
    if (placed[slot]) {
      setAnnouncement(`Position ${slot + 1} already has a piece.`);
      return;
    }
    if (!selectedPiece) {
      setAnnouncement("Choose a sea-glass piece first, then choose its position.");
      return;
    }
    if (selectedPiece.slot !== slot) {
      setMistakes((count) => count + 1);
      play("plastic");
      setAnnouncement(`${selectedPiece.label} does not fit position ${slot + 1}.${guidanceEnabled ? ` Try position ${selectedPiece.slot + 1}.` : " Try another position."}`);
      return;
    }

    const nextPlaced = { ...placed, [slot]: selectedPiece };
    setPlaced(nextPlaced);
    setTray((pieces) => pieces.filter((piece) => piece.id !== selectedPiece.id));
    setSelectedPieceId(null);
    play("seaGlass");

    if (Object.keys(nextPlaced).length === design.pieces.length) {
      window.setTimeout(() => {
        collectItem(design.rewardItemId);
        setComplete(true);
        setPlaying(false);
        setAnnouncement(`${design.name} completed with ${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}. It is now displayed in the cottage.`);
      }, 450);
    } else {
      setAnnouncement(`${selectedPiece.label} fits position ${slot + 1}. ${design.pieces.length - Object.keys(nextPlaced).length} pieces remain.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#160f2b]/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="mosaic-title">
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-indigo-50 via-cyan-50 to-amber-50 p-5 shadow-2xl ring-1 ring-violet-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-violet-800">Kaiana's Cottage Mini-Game</p>
            <h2 id="mosaic-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold text-indigo-950 outline-none">🎨 Kaiana's Mosaic Studio</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-indigo-950 ring-1 ring-violet-300">Close</button>
        </div>

        {!playing && !complete ? (
          <div className="mt-5">
            <p className="text-indigo-950">Choose a design, then fit each oddly shaped piece of sea glass into its matching position. Completed mosaics become framed cottage decorations.</p>
            <fieldset className="mt-5">
              <legend className="font-bold text-indigo-950">Choose a mosaic</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {MOSAICS.map((mosaic, index) => (
                  <button
                    key={mosaic.id}
                    type="button"
                    aria-pressed={designIndex === index}
                    onClick={() => {
                      setDesignIndex(index);
                      setAnnouncement(`${mosaic.name} selected. ${mosaic.description}`);
                    }}
                    className={`rounded-xl p-3 text-left ring-2 ${designIndex === index ? "bg-violet-700 text-white ring-violet-800" : "bg-white text-indigo-950 ring-violet-200"}`}
                  >
                    <span className="block text-3xl" aria-hidden="true">{mosaic.icon}</span>
                    <span className="block font-bold">{mosaic.name}</span>
                    <span className={`mt-1 block text-sm ${designIndex === index ? "text-violet-100" : "text-indigo-700"}`}>{mosaic.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mt-4 flex items-center gap-3 rounded-xl bg-white/80 p-3 text-indigo-950 ring-1 ring-violet-200">
              <input type="checkbox" checked={guidanceEnabled} onChange={(event) => setGuidanceEnabled(event.target.checked)} className="h-5 w-5 accent-violet-700" />
              <span><span className="font-bold">Spoken position guidance</span><span className="block text-sm text-indigo-700">Announce where each selected piece belongs.</span></span>
            </label>

            <button type="button" onClick={() => startMosaic()} className="mt-5 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800">Begin Mosaic</button>

            <section aria-labelledby="mosaic-collection-heading" className="mt-5 rounded-2xl bg-white/75 p-4 ring-1 ring-cyan-200">
              <h3 id="mosaic-collection-heading" className="font-bold text-indigo-950">Cottage Mosaic Collection</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {collection.map((mosaic) => (
                  <div key={mosaic.id} className="rounded-xl bg-cyan-50 p-3 text-center ring-1 ring-cyan-200">
                    <span className="text-2xl" aria-hidden="true">{mosaic.icon}</span>
                    <p className="text-xs font-bold text-indigo-950">{mosaic.name}</p>
                    <p className="text-xs text-indigo-700">Created: {mosaic.count}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : complete ? (
          <div className="mt-6 text-center">
            <div className="text-6xl" aria-hidden="true">{design.icon}✨</div>
            <h3 className="mt-2 text-xl font-bold text-indigo-950">{design.name} Complete!</h3>
            <p className="mt-2 text-indigo-800">Mistakes: {mistakes}</p>
            <p className="mt-2 font-semibold text-teal-800">Framed and displayed in the cottage</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => startMosaic()} className="rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">Make Another</button>
              <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-3 font-bold text-indigo-950 ring-1 ring-violet-300">Return to Cottage</button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-semibold text-indigo-950">
              <span>{design.name}</span>
              <span>{placedCount}/{design.pieces.length} pieces</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-indigo-200" role="progressbar" aria-label="Mosaic pieces placed" aria-valuemin={0} aria-valuemax={design.pieces.length} aria-valuenow={placedCount}>
              <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${(placedCount / design.pieces.length) * 100}%` }} />
            </div>

            <section aria-labelledby="mosaic-tray-heading" className="mt-5">
              <h3 id="mosaic-tray-heading" className="font-bold text-indigo-950">Sea Glass Tray</h3>
              <p className="mt-1 text-sm text-indigo-800">Choose one piece, then choose its place in the frame.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {tray.map((piece) => (
                  <button
                    key={piece.id}
                    type="button"
                    aria-pressed={selectedPieceId === piece.id}
                    onClick={() => selectPiece(piece)}
                    className={`min-h-24 rounded-xl p-2 shadow-md ring-2 ${selectedPieceId === piece.id ? "bg-white ring-violet-700" : "bg-cyan-50 ring-cyan-200"}`}
                  >
                    <span aria-hidden="true" className={`mx-auto block h-12 w-14 border-2 border-white/80 shadow-inner ${piece.color} ${piece.shape}`} />
                    <span className="mt-2 block text-xs font-bold text-indigo-950">{piece.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="mosaic-frame-heading" className="mt-5 rounded-2xl bg-indigo-950 p-4 ring-4 ring-amber-500 shadow-inner">
              <h3 id="mosaic-frame-heading" className="font-bold text-amber-100">Mosaic Frame</h3>
              <p className="mt-1 text-sm text-indigo-100">{selectedPiece ? `${selectedPiece.label} selected. Choose its position.` : "Choose a sea-glass piece first."}</p>
              <div className={`mx-auto mt-4 grid max-w-lg ${design.layout} gap-2`}>
                {design.pieces.map((piece, slot) => {
                  const placedPiece = placed[slot];
                  return (
                    <button
                      key={piece.id}
                      type="button"
                      disabled={!!placedPiece}
                      onClick={() => placePiece(slot)}
                      aria-label={placedPiece ? `Position ${slot + 1}, filled with ${placedPiece.label}` : `Position ${slot + 1}, empty`}
                      className="flex min-h-20 items-center justify-center rounded-xl border-2 border-dashed border-cyan-300 bg-white/10 p-2 text-sm font-bold text-cyan-100 disabled:opacity-100"
                    >
                      {placedPiece ? (
                        <span aria-hidden="true" className={`block h-14 w-16 border-2 border-white/80 shadow-[0_0_18px_rgba(255,255,255,0.35)] ${placedPiece.color} ${placedPiece.shape}`} />
                      ) : `Position ${slot + 1}`}
                    </button>
                  );
                })}
              </div>
            </section>

            <p className="mt-4 text-center text-sm text-indigo-800">Mistakes: {mistakes}</p>
          </div>
        )}

        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      </div>
    </div>
  );
}
