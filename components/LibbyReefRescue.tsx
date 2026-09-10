"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";

type ReefObjectKind = "debris" | "protected";

interface ReefObject {
  id: string;
  name: string;
  icon: string;
  kind: ReefObjectKind;
  action?: string;
  removed: boolean;
}

interface RescueLevel {
  name: string;
  description: string;
  debris: Array<Omit<ReefObject, "kind" | "removed">>;
  protectedLife: Array<Omit<ReefObject, "kind" | "removed">>;
}

const LEVELS: RescueLevel[] = [
  {
    name: "Shallow Coral Garden",
    description: "Remove four obvious pieces of debris around three coral neighbors.",
    debris: [
      { id: "line", name: "Loose fishing line", icon: "🧵", action: "Cut and coil" },
      { id: "ring", name: "Plastic drink ring", icon: "⭕", action: "Snip and remove" },
      { id: "bottle", name: "Plastic bottle", icon: "🧴", action: "Collect for recycling" },
      { id: "can", name: "Rusty drink can", icon: "🥫", action: "Lift into the salvage bag" },
    ],
    protectedLife: [
      { id: "coral", name: "Living branch coral", icon: "🪸" },
      { id: "fish", name: "Resting reef fish", icon: "🐠" },
      { id: "anemone", name: "Delicate sea anemone", icon: "🌸" },
    ],
  },
  {
    name: "Tangled Reef Path",
    description: "Clear six pieces of debris from a busier reef without disturbing four protected neighbors.",
    debris: [
      { id: "line-long", name: "Long fishing line", icon: "🧵", action: "Cut into safe sections" },
      { id: "rings", name: "Plastic six-pack rings", icon: "⭕", action: "Snip every loop" },
      { id: "bag", name: "Drifting plastic bag", icon: "🛍️", action: "Fold into the salvage bag" },
      { id: "cup", name: "Plastic cup", icon: "🥤", action: "Collect for recycling" },
      { id: "can-blue", name: "Blue drink can", icon: "🥫", action: "Lift into the salvage bag" },
      { id: "rope", name: "Frayed synthetic rope", icon: "➰", action: "Cut and coil" },
    ],
    protectedLife: [
      { id: "coral-red", name: "Red fan coral", icon: "🪸" },
      { id: "seahorse", name: "Tiny seahorse", icon: "🐚" },
      { id: "starfish", name: "Resting starfish", icon: "⭐" },
      { id: "kelp", name: "Young kelp fronds", icon: "🌿" },
    ],
  },
  {
    name: "Rainbow Seahorse Nursery",
    description: "A delicate final rescue with eight debris items hidden among six protected reef neighbors.",
    debris: [
      { id: "net", name: "Small ghost-net patch", icon: "🕸️", action: "Cut free one edge at a time" },
      { id: "line-clear", name: "Nearly invisible fishing line", icon: "🧵", action: "Cut and coil" },
      { id: "rings-clear", name: "Clear plastic rings", icon: "⭕", action: "Snip every loop" },
      { id: "wrapper", name: "Shiny food wrapper", icon: "🍬", action: "Collect for recycling" },
      { id: "bottle-green", name: "Green plastic bottle", icon: "🧴", action: "Collect for recycling" },
      { id: "lid", name: "Floating plastic lid", icon: "🔵", action: "Lift into the salvage bag" },
      { id: "rope-yellow", name: "Yellow synthetic rope", icon: "➰", action: "Cut and coil" },
      { id: "can-silver", name: "Silver drink can", icon: "🥫", action: "Lift into the salvage bag" },
    ],
    protectedLife: [
      { id: "seahorse-rainbow", name: "Rainbow seahorse", icon: "🌈" },
      { id: "coral-blue", name: "Blue branch coral", icon: "🪸" },
      { id: "coral-fan", name: "Delicate fan coral", icon: "🌿" },
      { id: "fish-yellow", name: "Yellow reef fish", icon: "🐠" },
      { id: "anemone-pink", name: "Pink sea anemone", icon: "🌸" },
      { id: "clam", name: "Young reef clam", icon: "🐚" },
    ],
  },
];

function shuffled<T>(items: readonly T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function createReef(level: RescueLevel): ReefObject[] {
  const debris = level.debris.map((item) => ({ ...item, kind: "debris" as const, removed: false }));
  const protectedLife = level.protectedLife.map((item) => ({ ...item, kind: "protected" as const, removed: false }));
  return shuffled([...debris, ...protectedLife]);
}

export default function LibbyReefRescue({ onClose }: { onClose: () => void }) {
  const { collectItem, play } = useGame();
  const [levelIndex, setLevelIndex] = useState(0);
  const [objects, setObjects] = useState<ReefObject[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [rewardItemId, setRewardItemId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("Choose a reef rescue area.");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const objectRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const level = LEVELS[levelIndex];
  const debrisRemoved = useMemo(() => objects.filter((item) => item.kind === "debris" && item.removed).length, [objects]);

  useEffect(() => {
    headingRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const startLevel = (nextLevelIndex = levelIndex) => {
    const nextLevel = LEVELS[nextLevelIndex];
    const nextObjects = createReef(nextLevel);
    setLevelIndex(nextLevelIndex);
    setObjects(nextObjects);
    setMistakes(0);
    setComplete(false);
    setRewardItemId(null);
    setPlaying(true);
    setAnnouncement(`${nextLevel.name} rescue started. ${nextLevel.debris.length} debris items and ${nextLevel.protectedLife.length} protected reef neighbors.`);
    window.setTimeout(() => objectRefs.current[0]?.focus(), 0);
  };

  const focusNextObject = (currentIndex: number, nextObjects: ReefObject[]) => {
    const nextIndex = nextObjects.findIndex((item, index) => index > currentIndex && !item.removed);
    const wrappedIndex = nextIndex >= 0 ? nextIndex : nextObjects.findIndex((item) => !item.removed);
    window.setTimeout(() => objectRefs.current[wrappedIndex]?.focus(), 0);
  };

  const inspectObject = (index: number) => {
    const item = objects[index];
    if (!item || item.removed || complete) return;

    if (item.kind === "protected") {
      setMistakes((count) => count + 1);
      play("shell");
      setAnnouncement(`${item.name} is living or protected. Leave it safely in place and choose debris instead.`);
      return;
    }

    const nextObjects = objects.map((object, objectIndex) => objectIndex === index ? { ...object, removed: true } : object);
    const nextRemovedCount = nextObjects.filter((object) => object.kind === "debris" && object.removed).length;
    setObjects(nextObjects);
    play("plastic");

    if (nextRemovedCount === level.debris.length) {
      const reward = levelIndex === LEVELS.length - 1 && mistakes === 0 ? "pearl-deepsea" : "recycled-rubber";
      window.setTimeout(() => {
        collectItem(reward);
        setRewardItemId(reward);
        setComplete(true);
        setPlaying(false);
        setAnnouncement(`${level.name} is clean with ${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}. ${ITEMS[reward].name} added to your inventory.`);
      }, 400);
      return;
    }

    setAnnouncement(`${item.action || "Remove"} complete: ${item.name}. ${level.debris.length - nextRemovedCount} debris items remain.`);
    focusNextObject(index, nextObjects);
  };

  const handleObjectKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const columns = 3;
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = Math.min(objects.length - 1, index + 1);
    else if (event.key === "ArrowLeft") nextIndex = Math.max(0, index - 1);
    else if (event.key === "ArrowDown") nextIndex = Math.min(objects.length - 1, index + columns);
    else if (event.key === "ArrowUp") nextIndex = Math.max(0, index - columns);
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = objects.length - 1;
    else return;
    event.preventDefault();
    objectRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#032d32]/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="reef-rescue-title">
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-cyan-50 to-teal-100 p-5 shadow-2xl ring-1 ring-cyan-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-cyan-800">Reef Mini-Game</p>
            <h2 id="reef-rescue-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold text-teal-950 outline-none">🦞 Libby’s Reef Rescue</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-teal-950 ring-1 ring-teal-300">Close</button>
        </div>

        {!playing && !complete ? (
          <div className="mt-5">
            <p className="text-teal-950">Help Libby remove dangerous debris without touching coral or sea life. There is no timer, so inspect every object carefully.</p>
            <fieldset className="mt-5">
              <legend className="font-bold text-teal-950">Choose a rescue area</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {LEVELS.map((option, index) => (
                  <button
                    key={option.name}
                    type="button"
                    aria-pressed={levelIndex === index}
                    onClick={() => {
                      setLevelIndex(index);
                      setAnnouncement(`${option.name} selected. ${option.description}`);
                    }}
                    className={`rounded-xl p-3 text-left ring-2 ${levelIndex === index ? "bg-teal-800 text-white ring-teal-900" : "bg-white text-teal-950 ring-teal-200"}`}
                  >
                    <span className="block font-bold">Level {index + 1}: {option.name}</span>
                    <span className={`mt-1 block text-sm ${levelIndex === index ? "text-teal-100" : "text-teal-700"}`}>{option.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <button type="button" onClick={() => startLevel()} className="mt-5 w-full rounded-xl bg-cyan-700 py-3 font-bold text-white shadow active:bg-cyan-800">Begin Reef Rescue</button>
          </div>
        ) : complete ? (
          <div className="mt-6 text-center">
            <div className="text-5xl" aria-hidden="true">🦞✨🪸</div>
            <h3 className="mt-2 text-xl font-bold text-teal-950">Reef Rescue Complete!</h3>
            <p className="mt-2 text-teal-800">Protected neighbors disturbed: {mistakes}</p>
            {rewardItemId && <p className="mt-2 font-semibold text-cyan-800">Reward: {ITEMS[rewardItemId].name}</p>}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => startLevel()} className="rounded-xl bg-cyan-700 px-4 py-3 font-bold text-white">Rescue Again</button>
              {levelIndex < LEVELS.length - 1 && <button type="button" onClick={() => startLevel(levelIndex + 1)} className="rounded-xl bg-teal-800 px-4 py-3 font-bold text-white">Next Area</button>}
              <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-3 font-bold text-teal-950 ring-1 ring-teal-300">Return to Reef</button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-semibold text-teal-950">
              <span>Debris removed: {debrisRemoved}/{level.debris.length}</span>
              <span>Mistakes: {mistakes}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-teal-200" role="progressbar" aria-label="Reef debris removed" aria-valuemin={0} aria-valuemax={level.debris.length} aria-valuenow={debrisRemoved}>
              <div className="h-full rounded-full bg-cyan-600 transition-all" style={{ width: `${(debrisRemoved / level.debris.length) * 100}%` }} />
            </div>
            <p className="mt-3 text-sm text-teal-800">Use Tab or arrow keys to inspect the reef. Activate debris to remove it. Protected objects remain in place.</p>

            <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label={`${level.name} rescue grid`}>
              {objects.map((item, index) => (
                <button
                  key={item.id}
                  ref={(element) => { objectRefs.current[index] = element; }}
                  type="button"
                  disabled={item.removed}
                  onClick={() => inspectObject(index)}
                  onKeyDown={(event) => handleObjectKeyDown(event, index)}
                  aria-label={item.removed ? `Cleared position ${index + 1}, ${item.name} removed` : `${item.name}, ${item.kind === "debris" ? `debris. ${item.action}` : "protected reef life, do not disturb"}`}
                  className={`aspect-square min-h-24 rounded-2xl p-2 shadow-md ring-2 transition ${item.removed ? "bg-cyan-50 text-teal-700 ring-cyan-200" : item.kind === "debris" ? "bg-amber-50 text-amber-950 ring-amber-300" : "bg-emerald-100 text-emerald-950 ring-emerald-300"}`}
                >
                  <span className="block text-3xl" aria-hidden="true">{item.removed ? "✓" : item.icon}</span>
                  <span className="mt-1 block text-xs font-bold leading-tight">{item.removed ? "Cleared" : item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      </div>
    </div>
  );
}
