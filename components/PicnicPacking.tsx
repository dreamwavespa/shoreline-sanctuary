"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";

interface PicnicItem {
  id: string;
  label: string;
  icon: string;
  detail: string;
  spaces: number[];
  startSpace: number;
}

const PICNIC_ITEMS: PicnicItem[] = [
  { id: "sandwiches", label: "Sandwich Box", icon: "🥪", detail: "wide and sturdy", spaces: [0, 1], startSpace: 0 },
  { id: "flowers", label: "Jar of Flowers", icon: "💐", detail: "tall and delicate", spaces: [2, 6], startSpace: 2 },
  { id: "dishes", label: "Stack of Dishes", icon: "🍽️", detail: "tall and breakable", spaces: [3, 7], startSpace: 3 },
  { id: "fruit", label: "Fresh Fruit", icon: "🍓", detail: "soft and easily bruised", spaces: [4, 5], startSpace: 4 },
  { id: "treats", label: "Sweet Treats", icon: "🧁", detail: "small but easily squished", spaces: [8, 9], startSpace: 8 },
  { id: "drinks", label: "Cold Drinks", icon: "🧃", detail: "heavy and kept upright", spaces: [10, 11], startSpace: 10 },
  { id: "blanket", label: "Rolled Picnic Blanket", icon: "🧺", detail: "long and soft", spaces: [12, 13, 14, 15], startSpace: 12 },
];

function shuffled<T>(items: readonly T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function PicnicPacking({ onClose }: { onClose: () => void }) {
  const { state, collectItem, play } = useGame();
  const [tray, setTray] = useState<PicnicItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [occupied, setOccupied] = useState<Record<number, PicnicItem>>({});
  const [mistakes, setMistakes] = useState(0);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [announcement, setAnnouncement] = useState("Begin when you are ready to pack the picnic basket.");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selectedItem = tray.find((item) => item.id === selectedItemId) || null;
  const packedCount = PICNIC_ITEMS.length - tray.length;
  const basketsPacked = state.inventory["picnic-packed-keepsake"] || 0;

  useEffect(() => {
    headingRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const startPacking = () => {
    setTray(shuffled(PICNIC_ITEMS));
    setSelectedItemId(null);
    setOccupied({});
    setMistakes(0);
    setComplete(false);
    setPlaying(true);
    setAnnouncement("Packing started. Choose an item from the picnic table, then choose its starting space in the basket.");
  };

  const selectItem = (item: PicnicItem) => {
    setSelectedItemId(item.id);
    play("bagRustle");
    setAnnouncement(`${item.label} selected. It is ${item.detail}.${hintsEnabled ? ` Place it starting in basket space ${item.startSpace + 1}.` : " Choose an open basket space."}`);
  };

  const placeItem = (space: number) => {
    if (occupied[space]) {
      setAnnouncement(`Basket space ${space + 1} is already holding ${occupied[space].label}.`);
      return;
    }
    if (!selectedItem) {
      setAnnouncement("Choose an item from the picnic table first.");
      return;
    }
    if (selectedItem.startSpace !== space) {
      setMistakes((count) => count + 1);
      play("plastic");
      setAnnouncement(`${selectedItem.label} will not fit safely starting in space ${space + 1}.${hintsEnabled ? ` Try space ${selectedItem.startSpace + 1} so nothing gets squished.` : " Try another open space."}`);
      return;
    }

    const nextOccupied = { ...occupied };
    for (const itemSpace of selectedItem.spaces) nextOccupied[itemSpace] = selectedItem;
    const nextTray = tray.filter((item) => item.id !== selectedItem.id);
    setOccupied(nextOccupied);
    setTray(nextTray);
    setSelectedItemId(null);
    play("picnicLatch");

    if (nextTray.length === 0) {
      window.setTimeout(() => {
        collectItem("picnic-packed-keepsake");
        setComplete(true);
        setPlaying(false);
        setAnnouncement(`Picnic basket packed with ${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}. The food, flowers, dishes, treats, drinks, and blanket all fit safely.`);
      }, 450);
    } else {
      setAnnouncement(`${selectedItem.label} packed safely. ${nextTray.length} ${nextTray.length === 1 ? "item remains" : "items remain"}.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#49301f]/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="picnic-packing-title">
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-rose-50 via-amber-50 to-emerald-50 p-5 shadow-2xl ring-1 ring-rose-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-rose-800">Beach Mini-Game</p>
            <h2 id="picnic-packing-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold text-amber-950 outline-none">🧺 Picnic Packing</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-amber-950 ring-1 ring-rose-300">Close</button>
        </div>

        {!playing && !complete ? (
          <div className="mt-5">
            <p className="text-amber-950">Fit seven picnic items into a sixteen-space basket. Choose an item, then choose its starting space. Pack sturdy items around delicate food and flowers so nothing gets squished.</p>
            <label className="mt-4 flex items-center gap-3 rounded-xl bg-white/80 p-3 text-amber-950 ring-1 ring-rose-200">
              <input type="checkbox" checked={hintsEnabled} onChange={(event) => setHintsEnabled(event.target.checked)} className="h-5 w-5 accent-rose-700" />
              <span><span className="font-bold">Packing hints</span><span className="block text-sm text-amber-700">Announce the safest starting space for each item.</span></span>
            </label>
            <button type="button" onClick={startPacking} className="mt-5 w-full rounded-xl bg-rose-700 py-3 font-bold text-white shadow active:bg-rose-800">Begin Packing</button>
            <p className="mt-4 text-center text-sm font-semibold text-emerald-800">Picnic baskets packed: {basketsPacked}</p>
          </div>
        ) : complete ? (
          <div className="mt-6 text-center">
            <div className="rounded-3xl bg-amber-100 p-5 ring-1 ring-amber-200" role="img" aria-label="A neatly packed picnic basket containing sandwiches, flowers, dishes, fruit, treats, drinks, and a rolled blanket">
              <div className="text-6xl" aria-hidden="true">🧺</div>
              <div className="mt-2 text-3xl" aria-hidden="true">🥪 💐 🍽️ 🍓 🧁 🧃</div>
            </div>
            <h3 className="mt-4 text-xl font-bold text-amber-950">Picnic Packed Perfectly!</h3>
            <p className="mt-2 text-amber-800">Nothing was squished · Mistakes: {mistakes}</p>
            <p className="mt-2 font-semibold text-emerald-800">Picnic baskets packed: {basketsPacked}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={startPacking} className="rounded-xl bg-rose-700 px-4 py-3 font-bold text-white">Pack Another</button>
              <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-3 font-bold text-amber-950 ring-1 ring-rose-300">Return to Beach</button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-semibold text-amber-950">
              <span>Packed {packedCount}/{PICNIC_ITEMS.length}</span>
              <span>Mistakes: {mistakes}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-rose-200" role="progressbar" aria-label="Picnic items packed" aria-valuemin={0} aria-valuemax={PICNIC_ITEMS.length} aria-valuenow={packedCount}>
              <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${(packedCount / PICNIC_ITEMS.length) * 100}%` }} />
            </div>

            <section aria-labelledby="picnic-table-heading" className="mt-5">
              <h3 id="picnic-table-heading" className="font-bold text-amber-950">Picnic Table</h3>
              <p className="mt-1 text-sm text-amber-800">Choose one item to pack.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {tray.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selectedItemId === item.id}
                    onClick={() => selectItem(item)}
                    className={`min-h-28 rounded-xl p-3 text-left ring-2 ${selectedItemId === item.id ? "bg-rose-700 text-white ring-rose-800" : "bg-white text-amber-950 ring-rose-200"}`}
                  >
                    <span className="block text-3xl" aria-hidden="true">{item.icon}</span>
                    <span className="block font-bold">{item.label}</span>
                    <span className={`mt-1 block text-sm ${selectedItemId === item.id ? "text-rose-100" : "text-amber-700"}`}>{item.detail}</span>
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="picnic-basket-heading" className="mt-5 rounded-2xl bg-amber-800 p-4 ring-4 ring-amber-950/40 shadow-inner">
              <h3 id="picnic-basket-heading" className="font-bold text-amber-50">Picnic Basket</h3>
              <p className="mt-1 text-sm text-amber-100">{selectedItem ? `${selectedItem.label} selected. Choose its starting space.` : "Choose an item before selecting a basket space."}</p>
              <div className="mt-4 grid grid-cols-4 gap-1 rounded-xl bg-amber-950/30 p-2">
                {Array.from({ length: 16 }).map((_, space) => {
                  const item = occupied[space];
                  const isStart = item?.startSpace === space;
                  return (
                    <button
                      key={space}
                      type="button"
                      disabled={!!item}
                      onClick={() => placeItem(space)}
                      aria-label={item ? `Basket space ${space + 1}, occupied by ${item.label}` : `Basket space ${space + 1}, empty`}
                      className={`min-h-16 rounded-lg border-2 p-1 text-xs font-bold disabled:opacity-100 ${item ? "border-amber-200 bg-amber-100 text-amber-950" : "border-dashed border-amber-200 bg-amber-50/20 text-amber-50"}`}
                    >
                      {item ? (isStart ? <><span className="block text-2xl" aria-hidden="true">{item.icon}</span><span>{item.label}</span></> : <span aria-hidden="true">•</span>) : `Space ${space + 1}`}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      </div>
    </div>
  );
}
