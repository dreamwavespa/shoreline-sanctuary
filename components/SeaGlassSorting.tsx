"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";

type SortRule = "color" | "size" | "shape";
type GlassColor = "green" | "teal" | "amber" | "purple";
type GlassSize = "small" | "medium" | "large";
type GlassShape = "rounded" | "triangle" | "long";

interface GlassPiece {
  id: string;
  color: GlassColor;
  size: GlassSize;
  shape: GlassShape;
  rare: boolean;
  rewardItemId: string;
}

const COLOR_OPTIONS: { value: GlassColor; label: string }[] = [
  { value: "green", label: "Green" },
  { value: "teal", label: "Teal" },
  { value: "amber", label: "Amber" },
  { value: "purple", label: "Purple" },
];

const SIZE_OPTIONS: { value: GlassSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const SHAPE_OPTIONS: { value: GlassShape; label: string }[] = [
  { value: "rounded", label: "Rounded" },
  { value: "triangle", label: "Triangular" },
  { value: "long", label: "Long" },
];

const GLASS_COLORS: Record<GlassColor, { className: string; itemId: string }> = {
  green: { className: "bg-emerald-500 border-emerald-200", itemId: "glass-green" },
  teal: { className: "bg-teal-500 border-cyan-200", itemId: "glass-teal" },
  amber: { className: "bg-amber-500 border-yellow-200", itemId: "glass-amber" },
  purple: { className: "bg-purple-600 border-fuchsia-200", itemId: "glass-purple" },
};

const SIZE_CLASSES: Record<GlassSize, string> = {
  small: "w-16 h-12",
  medium: "w-24 h-16",
  large: "w-32 h-20",
};

const SHAPE_CLASSES: Record<GlassShape, string> = {
  rounded: "rounded-[48%_38%_44%_35%]",
  triangle: "[clip-path:polygon(50%_3%,96%_92%,4%_86%)]",
  long: "rounded-[55%_35%_50%_30%] rotate-[-8deg]",
};

const RULE_LABELS: Record<SortRule, string> = {
  color: "Color",
  size: "Size",
  shape: "Shape",
};

function randomFrom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function makePieces(): GlassPiece[] {
  const guaranteedColors: GlassColor[] = ["green", "teal", "amber"];
  const colors: GlassColor[] = [...guaranteedColors];
  for (let i = colors.length; i < 8; i += 1) {
    const rare = Math.random() < 0.18;
    colors.push(rare ? "purple" : randomFrom(guaranteedColors));
  }

  return colors
    .map((color, index) => ({
      id: `${Date.now()}-${index}`,
      color,
      size: randomFrom<GlassSize>(["small", "medium", "large"]),
      shape: randomFrom<GlassShape>(["rounded", "triangle", "long"]),
      rare: color === "purple",
      rewardItemId: GLASS_COLORS[color].itemId,
    }))
    .sort(() => Math.random() - 0.5);
}

function describePiece(piece: GlassPiece) {
  return `${piece.size} ${piece.color} ${piece.shape} sea glass${piece.rare ? ", rare" : ""}`;
}

export default function SeaGlassSorting({ onClose }: { onClose: () => void }) {
  const { collectItem } = useGame();
  const [rule, setRule] = useState<SortRule>("color");
  const [pieces, setPieces] = useState<GlassPiece[]>([]);
  const [pieceIndex, setPieceIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [rewardItemId, setRewardItemId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("Choose how you would like to sort the sea glass.");
  const headingRef = useRef<HTMLHeadingElement>(null);

  const currentPiece = pieces[pieceIndex];
  const bins = useMemo(() => {
    if (rule === "color") return COLOR_OPTIONS;
    if (rule === "size") return SIZE_OPTIONS;
    return SHAPE_OPTIONS;
  }, [rule]);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (!playing || complete) return;
      const binIndex = Number(event.key) - 1;
      if (Number.isInteger(binIndex) && bins[binIndex]) {
        event.preventDefault();
        sortInto(String(bins[binIndex].value), bins[binIndex].label);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const startRound = () => {
    const nextPieces = makePieces();
    setPieces(nextPieces);
    setPieceIndex(0);
    setMistakes(0);
    setRewardItemId(null);
    setComplete(false);
    setPlaying(true);
    setAnnouncement(`Round started. Sort by ${RULE_LABELS[rule].toLowerCase()}. First piece: ${describePiece(nextPieces[0])}.`);
  };

  const sortInto = (value: string, label: string) => {
    if (!currentPiece || complete) return;
    if (currentPiece[rule] !== value) {
      setMistakes((count) => count + 1);
      setAnnouncement(`${label} is not the right bin for this piece. Try again. ${describePiece(currentPiece)}.`);
      return;
    }

    const nextIndex = pieceIndex + 1;
    if (nextIndex >= pieces.length) {
      const rarePiece = pieces.find((piece) => piece.rare);
      const reward = rarePiece?.rewardItemId || "glass-green";
      collectItem(reward);
      setRewardItemId(reward);
      setPieceIndex(nextIndex);
      setComplete(true);
      setPlaying(false);
      setAnnouncement(`Correct. Round complete with ${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}. ${ITEMS[reward].name} added to your inventory.`);
      return;
    }

    setPieceIndex(nextIndex);
    setAnnouncement(`Correct. ${pieces.length - nextIndex} pieces remain. Next piece: ${describePiece(pieces[nextIndex])}.`);
  };

  const accuracy = pieces.length ? Math.round((pieces.length / (pieces.length + mistakes)) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102c35]/95 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="sea-glass-title">
      <div className="mx-auto max-w-xl rounded-3xl bg-gradient-to-b from-cyan-50 to-indigo-100 p-5 shadow-2xl ring-1 ring-cyan-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-700">Cottage Mini-Game</p>
            <h2 id="sea-glass-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold text-indigo-950 outline-none">
              💎 Sea Glass Sorting
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-indigo-900 ring-1 ring-indigo-200">
            Close
          </button>
        </div>

        {!playing && !complete ? (
          <div className="mt-5">
            <p className="text-indigo-900">Sort eight pieces by color, size, or shape. A rare purple piece may appear—and if it does, you can keep it for Melody’s jewelry crafting.</p>
            <fieldset className="mt-5">
              <legend className="font-bold text-indigo-950">Choose a sorting rule</legend>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(Object.keys(RULE_LABELS) as SortRule[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={rule === option}
                    onClick={() => {
                      setRule(option);
                      setAnnouncement(`Sort by ${RULE_LABELS[option]} selected.`);
                    }}
                    className={`rounded-xl px-3 py-3 font-semibold ring-2 ${rule === option ? "bg-indigo-700 text-white ring-indigo-800" : "bg-white text-indigo-900 ring-indigo-200"}`}
                  >
                    {RULE_LABELS[option]}
                  </button>
                ))}
              </div>
            </fieldset>
            <button type="button" onClick={startRound} className="mt-5 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800">
              Start Sorting
            </button>
          </div>
        ) : complete ? (
          <div className="mt-6 text-center">
            <div className="text-5xl" aria-hidden="true">✨</div>
            <h3 className="mt-2 text-xl font-bold text-indigo-950">Sorting Complete!</h3>
            <p className="mt-2 text-indigo-900">Accuracy: {accuracy}% · Mistakes: {mistakes}</p>
            {rewardItemId && <p className="mt-2 font-semibold text-teal-800">Reward: {ITEMS[rewardItemId].name}</p>}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={startRound} className="rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">Play Again</button>
              <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-3 font-bold text-indigo-900 ring-1 ring-indigo-300">Return to Cottage</button>
            </div>
          </div>
        ) : currentPiece ? (
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-semibold text-indigo-900">
              <span>Piece {pieceIndex + 1} of {pieces.length}</span>
              <span>Mistakes: {mistakes}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-indigo-200" role="progressbar" aria-label="Pieces sorted" aria-valuemin={0} aria-valuemax={pieces.length} aria-valuenow={pieceIndex}>
              <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${(pieceIndex / pieces.length) * 100}%` }} />
            </div>

            <div className="mt-5 rounded-3xl bg-white/80 p-6 text-center ring-1 ring-cyan-200">
              <p className="text-sm font-semibold text-indigo-800">Sort this piece by {RULE_LABELS[rule].toLowerCase()}</p>
              <div className="flex min-h-36 items-center justify-center" role="img" aria-label={describePiece(currentPiece)}>
                <div aria-hidden="true" className={`${SIZE_CLASSES[currentPiece.size]} ${SHAPE_CLASSES[currentPiece.shape]} ${GLASS_COLORS[currentPiece.color].className} border-4 shadow-[inset_8px_8px_14px_rgba(255,255,255,0.45),0_8px_18px_rgba(15,118,110,0.25)]`} />
              </div>
              <p className="font-semibold capitalize text-indigo-950">{describePiece(currentPiece)}</p>
            </div>

            <div className={`mt-4 grid gap-2 ${bins.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`} aria-label={`${RULE_LABELS[rule]} sorting bins`}>
              {bins.map((bin, index) => (
                <button
                  key={String(bin.value)}
                  type="button"
                  onClick={() => sortInto(String(bin.value), bin.label)}
                  className="min-h-16 rounded-xl bg-indigo-700 px-3 py-3 font-bold text-white shadow active:bg-indigo-800"
                  aria-keyshortcuts={String(index + 1)}
                >
                  {index + 1}. {bin.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      </div>
    </div>
  );
}
