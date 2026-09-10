"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";

interface ArtifactPiece {
  id: string;
  label: string;
  detail: string;
  slot: number;
}

interface Artifact {
  id: string;
  name: string;
  icon: string;
  description: string;
  layout: string;
  rewardItemId: string;
  pieces: ArtifactPiece[];
}

const ARTIFACTS: Artifact[] = [
  {
    id: "painted-vase",
    name: "Painted Harbor Vase",
    icon: "🏺",
    description: "Rebuild five curved pottery sections from the base to the rim.",
    layout: "grid-cols-1 max-w-52",
    rewardItemId: "museum-painted-vase",
    pieces: [
      { id: "vase-base", label: "Heavy pottery base", detail: "wide flat foot", slot: 0 },
      { id: "vase-lower", label: "Lower curved pottery", detail: "deep blue glaze", slot: 1 },
      { id: "vase-center", label: "Painted center band", detail: "gold wave pattern", slot: 2 },
      { id: "vase-shoulder", label: "Narrow pottery shoulder", detail: "two small handles", slot: 3 },
      { id: "vase-rim", label: "Pottery rim", detail: "thin rounded lip", slot: 4 },
    ],
  },
  {
    id: "harbor-sign",
    name: "Old Harbor Sign",
    icon: "🪧",
    description: "Join four weathered boards from left to right to reveal the ship’s home port.",
    layout: "grid-cols-4",
    rewardItemId: "museum-harbor-sign",
    pieces: [
      { id: "sign-one", label: "Sign piece with S", detail: "left broken edge", slot: 0 },
      { id: "sign-two", label: "Sign piece with A N", detail: "two nail holes", slot: 1 },
      { id: "sign-three", label: "Sign piece with C T", detail: "faded compass mark", slot: 2 },
      { id: "sign-four", label: "Sign piece with U A R Y", detail: "right rope loop", slot: 3 },
    ],
  },
  {
    id: "captains-map",
    name: "Captain’s Island Map",
    icon: "🗺️",
    description: "Fit six water-worn map sections into a two-column chart.",
    layout: "grid-cols-2",
    rewardItemId: "museum-captains-map",
    pieces: [
      { id: "map-northwest", label: "Northwest map corner", detail: "lighthouse cliff", slot: 0 },
      { id: "map-northeast", label: "Northeast map corner", detail: "compass rose", slot: 1 },
      { id: "map-west", label: "West map section", detail: "main beach", slot: 2 },
      { id: "map-east", label: "East map section", detail: "hidden cove", slot: 3 },
      { id: "map-southwest", label: "Southwest map corner", detail: "deep reef", slot: 4 },
      { id: "map-southeast", label: "Southeast map corner", detail: "sandbars", slot: 5 },
    ],
  },
];

function shuffled<T>(items: readonly T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function ArtifactRestoration({ onClose }: { onClose: () => void }) {
  const { state, collectItem, play } = useGame();
  const [artifactIndex, setArtifactIndex] = useState(0);
  const [tray, setTray] = useState<ArtifactPiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<number, ArtifactPiece>>({});
  const [mistakes, setMistakes] = useState(0);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [announcement, setAnnouncement] = useState("Choose an artifact to restore for the museum.");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const artifact = ARTIFACTS[artifactIndex];
  const selectedPiece = tray.find((piece) => piece.id === selectedPieceId) || null;
  const restoredCount = Object.keys(placed).length;

  const collection = useMemo(
    () => ARTIFACTS.map((item) => ({ ...item, count: state.inventory[item.rewardItemId] || 0 })),
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

  const startRestoration = (nextArtifactIndex = artifactIndex) => {
    const nextArtifact = ARTIFACTS[nextArtifactIndex];
    setArtifactIndex(nextArtifactIndex);
    setTray(shuffled(nextArtifact.pieces));
    setSelectedPieceId(null);
    setPlaced({});
    setMistakes(0);
    setComplete(false);
    setPlaying(true);
    setAnnouncement(`${nextArtifact.name} restoration started. Choose a broken piece, then choose its position in the restoration frame.`);
  };

  const selectPiece = (piece: ArtifactPiece) => {
    setSelectedPieceId(piece.id);
    play("driftwood");
    setAnnouncement(`${piece.label} selected, ${piece.detail}.${hintsEnabled ? ` It belongs in position ${piece.slot + 1}.` : " Choose a position."}`);
  };

  const placePiece = (slot: number) => {
    if (placed[slot]) {
      setAnnouncement(`Position ${slot + 1} is already restored.`);
      return;
    }
    if (!selectedPiece) {
      setAnnouncement("Choose a broken artifact piece first, then choose a position.");
      return;
    }
    if (selectedPiece.slot !== slot) {
      setMistakes((count) => count + 1);
      play("plastic");
      setAnnouncement(`${selectedPiece.label} does not fit position ${slot + 1}.${hintsEnabled ? ` Try position ${selectedPiece.slot + 1}.` : " Try another position."}`);
      return;
    }

    const nextPlaced = { ...placed, [slot]: selectedPiece };
    const nextTray = tray.filter((piece) => piece.id !== selectedPiece.id);
    setPlaced(nextPlaced);
    setTray(nextTray);
    setSelectedPieceId(null);
    play("wood");

    if (Object.keys(nextPlaced).length === artifact.pieces.length) {
      window.setTimeout(() => {
        collectItem(artifact.rewardItemId);
        setComplete(true);
        setPlaying(false);
        setAnnouncement(`${artifact.name} restored with ${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}. It is now displayed in the museum collection.`);
      }, 450);
    } else {
      setAnnouncement(`${selectedPiece.label} fits position ${slot + 1}. ${artifact.pieces.length - Object.keys(nextPlaced).length} pieces remain.`);
    }
  };

  const slotColor = artifact.id === "painted-vase"
    ? "from-blue-700 to-amber-400"
    : artifact.id === "harbor-sign"
      ? "from-amber-800 to-amber-500"
      : "from-teal-200 to-amber-100";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#041f2d]/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="artifact-title">
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-amber-50 to-cyan-100 p-5 shadow-2xl ring-1 ring-amber-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-800">Shipwreck Museum Mini-Game</p>
            <h2 id="artifact-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold text-amber-950 outline-none">🏺 Artifact Restoration</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-amber-950 ring-1 ring-amber-300">Close</button>
        </div>

        {!playing && !complete ? (
          <div className="mt-5">
            <p className="text-amber-950">Select a recovered object, then fit its labeled fragments into the restoration frame. Every completed object becomes part of the museum collection.</p>
            <fieldset className="mt-5">
              <legend className="font-bold text-amber-950">Choose an artifact</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {ARTIFACTS.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={artifactIndex === index}
                    onClick={() => {
                      setArtifactIndex(index);
                      setAnnouncement(`${item.name} selected. ${item.description}`);
                    }}
                    className={`rounded-xl p-3 text-left ring-2 ${artifactIndex === index ? "bg-amber-800 text-white ring-amber-900" : "bg-white text-amber-950 ring-amber-200"}`}
                  >
                    <span className="block text-2xl" aria-hidden="true">{item.icon}</span>
                    <span className="block font-bold">{item.name}</span>
                    <span className={`mt-1 block text-sm ${artifactIndex === index ? "text-amber-100" : "text-amber-700"}`}>{item.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mt-4 flex items-center gap-3 rounded-xl bg-white/80 p-3 text-amber-950 ring-1 ring-amber-200">
              <input type="checkbox" checked={hintsEnabled} onChange={(event) => setHintsEnabled(event.target.checked)} className="h-5 w-5 accent-amber-700" />
              <span><span className="font-bold">Restoration guide</span><span className="block text-sm text-amber-700">Announce the correct position for each selected piece.</span></span>
            </label>

            <button type="button" onClick={() => startRestoration()} className="mt-5 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800">Begin Restoration</button>

            <section aria-labelledby="museum-collection-heading" className="mt-5 rounded-2xl bg-white/75 p-4 ring-1 ring-cyan-200">
              <h3 id="museum-collection-heading" className="font-bold text-teal-950">Museum Collection</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {collection.map((item) => (
                  <div key={item.id} className="rounded-xl bg-cyan-50 p-3 text-center ring-1 ring-cyan-200">
                    <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                    <p className="text-xs font-bold text-teal-950">{item.name}</p>
                    <p className="text-xs text-teal-700">Restored: {item.count}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : complete ? (
          <div className="mt-6 text-center">
            <div className="text-6xl" aria-hidden="true">{artifact.icon}✨</div>
            <h3 className="mt-2 text-xl font-bold text-amber-950">{artifact.name} Restored!</h3>
            <p className="mt-2 text-amber-800">Mistakes: {mistakes}</p>
            <p className="mt-2 font-semibold text-teal-800">Added to the museum collection</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => startRestoration()} className="rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">Restore Another</button>
              <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-3 font-bold text-amber-950 ring-1 ring-amber-300">Return to Reef</button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-semibold text-teal-950">
              <span>{artifact.name}</span>
              <span>{restoredCount}/{artifact.pieces.length} pieces</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-cyan-200" role="progressbar" aria-label="Artifact pieces restored" aria-valuemin={0} aria-valuemax={artifact.pieces.length} aria-valuenow={restoredCount}>
              <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${(restoredCount / artifact.pieces.length) * 100}%` }} />
            </div>

            <section aria-labelledby="broken-pieces-heading" className="mt-5">
              <h3 id="broken-pieces-heading" className="font-bold text-amber-950">Broken Pieces</h3>
              <p className="mt-1 text-sm text-amber-800">Choose one piece from the tray.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {tray.map((piece) => (
                  <button
                    key={piece.id}
                    type="button"
                    aria-pressed={selectedPieceId === piece.id}
                    onClick={() => selectPiece(piece)}
                    className={`min-h-24 rounded-[35%_45%_30%_50%] border-4 p-3 text-sm shadow-md ${selectedPieceId === piece.id ? "border-teal-700 bg-teal-100 text-teal-950" : "border-amber-300 bg-amber-100 text-amber-950"}`}
                  >
                    <span className="block font-bold">{piece.label}</span>
                    <span className="block text-xs opacity-80">{piece.detail}</span>
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="restoration-frame-heading" className="mt-5 rounded-2xl bg-white/80 p-4 ring-1 ring-cyan-200">
              <h3 id="restoration-frame-heading" className="font-bold text-teal-950">Restoration Frame</h3>
              <p className="mt-1 text-sm text-teal-800">{selectedPiece ? `${selectedPiece.label} selected. Choose its position.` : "Choose a broken piece before selecting a position."}</p>
              <div className={`mx-auto mt-4 grid ${artifact.layout} gap-2`}>
                {artifact.pieces.map((piece, slot) => {
                  const restoredPiece = placed[slot];
                  return (
                    <button
                      key={piece.id}
                      type="button"
                      disabled={!!restoredPiece}
                      onClick={() => placePiece(slot)}
                      aria-label={restoredPiece ? `Position ${slot + 1}, restored with ${restoredPiece.label}` : `Position ${slot + 1}, empty`}
                      className={`min-h-20 rounded-xl border-2 border-dashed p-2 text-sm font-bold shadow-inner ${restoredPiece ? `border-white bg-gradient-to-br ${slotColor} text-white` : "border-teal-400 bg-cyan-50 text-teal-800"}`}
                    >
                      {restoredPiece ? restoredPiece.label : `Position ${slot + 1}`}
                    </button>
                  );
                })}
              </div>
            </section>

            <p className="mt-4 text-center text-sm text-amber-800">Mistakes: {mistakes}</p>
          </div>
        )}

        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      </div>
    </div>
  );
}
