"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";

interface MuseumFind {
  itemId: string;
  name: string;
  icon: string;
  description: string;
}

interface SceneObject {
  id: string;
  name: string;
  icon: string;
  itemId?: string;
  found: boolean;
}

interface SalvageLevel {
  name: string;
  description: string;
  requestedCount: number;
  distractorCount: number;
}

const MUSEUM_FINDS: MuseumFind[] = [
  { itemId: "salvage-brass-key", name: "Captain’s Brass Key", icon: "🔑", description: "A heavy cabin key stamped with the Sovereign’s crest." },
  { itemId: "salvage-porcelain-cup", name: "Blue Porcelain Teacup", icon: "☕", description: "A delicate cup painted with tiny blue waves." },
  { itemId: "salvage-spyglass", name: "Captain’s Spyglass", icon: "🔭", description: "A collapsible brass telescope clouded by seawater." },
  { itemId: "salvage-ship-lantern", name: "Cabin Oil Lantern", icon: "🏮", description: "A small copper lantern with one unbroken glass pane." },
  { itemId: "salvage-dolphin-carving", name: "Carved Dolphin Figure", icon: "🐬", description: "A cheerful wooden dolphin once fixed to a cabin shelf." },
  { itemId: "salvage-silver-spoon", name: "Engraved Silver Spoon", icon: "🥄", description: "A dining spoon engraved with a tiny anchor." },
  { itemId: "ribbon", name: "Sea-Silk Ribbon", icon: "🎀", description: "A preserved length of shimmering silk ribbon from the ship’s old cargo." },
  { itemId: "locket", name: "Antique Locket", icon: "📿", description: "A salt-worn locket recovered from a small drawer in the captain’s quarters." },
  { itemId: "tarnished-compass", name: "Tarnished Compass", icon: "🧭", description: "A weathered brass compass waiting for Kaiana’s careful restoration." },
];

const DISTRACTORS = [
  { name: "Living coral branch", icon: "🪸" },
  { name: "Smooth reef stone", icon: "🪨" },
  { name: "Kelp fronds", icon: "🌿" },
  { name: "Empty clam shell", icon: "🐚" },
  { name: "Small reef fish", icon: "🐠" },
  { name: "Barnacled plank", icon: "🪵" },
  { name: "Drifting bubbles", icon: "🫧" },
  { name: "Patch of sea grass", icon: "🌱" },
  { name: "Common pebble", icon: "⚪" },
  { name: "Old rope scrap", icon: "➰" },
];

const LEVELS: SalvageLevel[] = [
  { name: "Cabin Shelf", description: "Find three requested artifacts among five pieces of reef clutter.", requestedCount: 3, distractorCount: 5 },
  { name: "Cargo Hold", description: "Find four requested artifacts in a larger, busier search area.", requestedCount: 4, distractorCount: 7 },
  { name: "Captain’s Quarters", description: "Find five requested artifacts among nine closely packed objects.", requestedCount: 5, distractorCount: 9 },
];

function shuffled<T>(items: readonly T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function createDive(level: SalvageLevel, levelIndex: number) {
  const guaranteedItemId = levelIndex === 1 ? "ribbon" : levelIndex === 2 ? "locket" : null;
  const guaranteedFind = MUSEUM_FINDS.find((item) => item.itemId === guaranteedItemId);
  const otherFinds = MUSEUM_FINDS.filter((item) => item.itemId !== guaranteedItemId);
  const requested = guaranteedFind
    ? [guaranteedFind, ...shuffled(otherFinds).slice(0, level.requestedCount - 1)]
    : shuffled(MUSEUM_FINDS).slice(0, level.requestedCount);
  const targets: SceneObject[] = requested.map((item) => ({
    id: `find-${item.itemId}`,
    name: item.name,
    icon: item.icon,
    itemId: item.itemId,
    found: false,
  }));
  const clutter: SceneObject[] = shuffled(DISTRACTORS).slice(0, level.distractorCount).map((item, index) => ({
    id: `clutter-${index}-${item.name}`,
    name: item.name,
    icon: item.icon,
    found: false,
  }));
  return { requested, objects: shuffled([...targets, ...clutter]) };
}

export default function ShipwreckSalvage({ onClose }: { onClose: () => void }) {
  const { state, collectItem, play } = useGame();
  const [levelIndex, setLevelIndex] = useState(0);
  const [requested, setRequested] = useState<MuseumFind[]>([]);
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [announcement, setAnnouncement] = useState("Choose a shipwreck area to search.");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const objectRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const level = LEVELS[levelIndex];
  const foundCount = objects.filter((object) => object.itemId && object.found).length;
  const collection = useMemo(
    () => MUSEUM_FINDS.map((item) => ({ ...item, count: state.inventory[item.itemId] || 0 })),
    [state.inventory]
  );

  useEffect(() => {
    headingRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const startDive = (nextLevelIndex = levelIndex) => {
    const nextLevel = LEVELS[nextLevelIndex];
    const dive = createDive(nextLevel, nextLevelIndex);
    setLevelIndex(nextLevelIndex);
    setRequested(dive.requested);
    setObjects(dive.objects);
    setMistakes(0);
    setComplete(false);
    setPlaying(true);
    setAnnouncement(`${nextLevel.name} search started. Find: ${dive.requested.map((item) => item.name).join(", ")}.`);
    window.setTimeout(() => objectRefs.current[0]?.focus(), 0);
  };

  const focusNextObject = (currentIndex: number, nextObjects: SceneObject[]) => {
    const nextIndex = nextObjects.findIndex((item, index) => index > currentIndex && !item.found);
    const wrappedIndex = nextIndex >= 0 ? nextIndex : nextObjects.findIndex((item) => !item.found);
    window.setTimeout(() => objectRefs.current[wrappedIndex]?.focus(), 0);
  };

  const inspectObject = (index: number) => {
    const object = objects[index];
    if (!object || object.found || complete) return;

    if (!object.itemId) {
      setMistakes((count) => count + 1);
      play(object.name.includes("plastic") ? "plastic" : "driftwood");
      setAnnouncement(`${object.name} is not on the museum search list. Leave it in the reef scene and keep looking.`);
      return;
    }

    const nextObjects = objects.map((item, objectIndex) => objectIndex === index ? { ...item, found: true } : item);
    const nextFoundCount = nextObjects.filter((item) => item.itemId && item.found).length;
    setObjects(nextObjects);
    collectItem(object.itemId);

    if (nextFoundCount === requested.length) {
      window.setTimeout(() => {
        setComplete(true);
        setPlaying(false);
        setAnnouncement(`${level.name} search complete. All ${requested.length} artifacts were added to the museum collection with ${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}.`);
      }, 450);
      return;
    }

    const remaining = requested.filter((find) => !nextObjects.some((item) => item.itemId === find.itemId && item.found));
    setAnnouncement(`${object.name} found and added to the museum. ${remaining.length} requested objects remain: ${remaining.map((item) => item.name).join(", ")}.`);
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

  const isRequestedFound = (itemId: string) => objects.some((object) => object.itemId === itemId && object.found);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#031d2b]/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="salvage-title">
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-sky-50 to-amber-50 p-5 shadow-2xl ring-1 ring-sky-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sky-800">Shipwreck Mini-Game</p>
            <h2 id="salvage-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold text-sky-950 outline-none">⚓ Shipwreck Salvage</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-sky-950 ring-1 ring-sky-300">Close</button>
        </div>

        {!playing && !complete ? (
          <div className="mt-5">
            <p className="text-sky-950">Search the shipwreck only for the objects requested by the museum. Every correct find becomes a real collectible in your museum inventory.</p>
            <fieldset className="mt-5">
              <legend className="font-bold text-sky-950">Choose a search area</legend>
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
                    className={`rounded-xl p-3 text-left ring-2 ${levelIndex === index ? "bg-sky-800 text-white ring-sky-900" : "bg-white text-sky-950 ring-sky-200"}`}
                  >
                    <span className="block font-bold">Level {index + 1}: {option.name}</span>
                    <span className={`mt-1 block text-sm ${levelIndex === index ? "text-sky-100" : "text-sky-700"}`}>{option.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <button type="button" onClick={() => startDive()} className="mt-5 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800">Begin Salvage Dive</button>

            <section aria-labelledby="salvage-collection-heading" className="mt-5 rounded-2xl bg-white/80 p-4 ring-1 ring-amber-200">
              <h3 id="salvage-collection-heading" className="font-bold text-amber-950">Salvage Museum Collection</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {collection.map((item) => (
                  <div key={item.itemId} className="rounded-xl bg-amber-50 p-3 text-center ring-1 ring-amber-200">
                    <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                    <p className="text-xs font-bold text-amber-950">{item.name}</p>
                    <p className="text-xs text-amber-700">Collected: {item.count}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : complete ? (
          <div className="mt-6 text-center">
            <div className="text-5xl" aria-hidden="true">⚓🏛️✨</div>
            <h3 className="mt-2 text-xl font-bold text-sky-950">Salvage Dive Complete!</h3>
            <p className="mt-2 text-sky-800">Artifacts recovered: {requested.length} · Mistakes: {mistakes}</p>
            <p className="mt-2 font-semibold text-amber-800">Every find is now in the museum collection.</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => startDive()} className="rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">Search Again</button>
              {levelIndex < LEVELS.length - 1 && <button type="button" onClick={() => startDive(levelIndex + 1)} className="rounded-xl bg-sky-800 px-4 py-3 font-bold text-white">Next Area</button>}
              <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-3 font-bold text-sky-950 ring-1 ring-sky-300">Return to Reef</button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-semibold text-sky-950">
              <span>Found: {foundCount}/{requested.length}</span>
              <span>Mistakes: {mistakes}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky-200" role="progressbar" aria-label="Requested artifacts found" aria-valuemin={0} aria-valuemax={requested.length} aria-valuenow={foundCount}>
              <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${(foundCount / requested.length) * 100}%` }} />
            </div>

            <section aria-labelledby="museum-request-heading" className="mt-4 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
              <h3 id="museum-request-heading" className="font-bold text-amber-950">Museum Search List</h3>
              <ul className="mt-2 space-y-1 text-sm text-amber-900">
                {requested.map((item) => <li key={item.itemId}>{isRequestedFound(item.itemId) ? "✓" : "○"} {item.name}</li>)}
              </ul>
            </section>

            <p className="mt-4 text-sm text-sky-800">Use Tab or arrow keys to inspect the scene. Activate only objects on the museum list.</p>
            <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label={`${level.name} underwater search scene`}>
              {objects.map((object, index) => (
                <button
                  key={object.id}
                  ref={(element) => { objectRefs.current[index] = element; }}
                  type="button"
                  disabled={object.found}
                  onClick={() => inspectObject(index)}
                  onKeyDown={(event) => handleObjectKeyDown(event, index)}
                  aria-label={object.found ? `Position ${index + 1}, ${object.name}, collected` : `Position ${index + 1}, ${object.name}`}
                  className={`aspect-square min-h-24 rounded-2xl p-2 shadow-md ring-2 transition ${object.found ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : object.itemId ? "bg-amber-50 text-amber-950 ring-amber-300" : "bg-cyan-100 text-cyan-950 ring-cyan-300"}`}
                >
                  <span className="block text-3xl" aria-hidden="true">{object.found ? "✓" : object.icon}</span>
                  <span className="mt-1 block text-xs font-bold leading-tight">{object.found ? "Collected" : object.name}</span>
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
