"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";

type Area = "inside" | "patio";
function DisplayArt({ icon, name, isEmoji }: { icon: string; name: string; isEmoji?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (isEmoji || !icon || failed) return <span aria-hidden="true" className="text-xl">{isEmoji ? icon : "🏺"}</span>;
  return <img src={icon} alt="" onError={() => setFailed(true)} className="h-full w-full object-contain drop-shadow-md" />;
}
const imagePath = (area: Area, night: boolean) =>
  `/images/Hut/${area === "inside" ? "Hut" : "Patio"}-${night ? "night" : "day"}.PNG`;

export default function HutScene({ onClose }: { onClose: () => void }) {
  const { state, setMusicOverride } = useGame();
  const [area, setArea] = useState<Area>("inside");
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const openDecoration = (id: string) => { setAnnouncement(""); setSelectedSlot(id); };
  const slots = [
    { id: "shelf1-left", name: "Top shelf, left", x: 21, y: 20.5 },
    { id: "shelf1-right", name: "Top shelf, right", x: 33, y: 21 },
    { id: "shelf2-left", name: "Middle shelf, left", x: 21, y: 28.5 },
    { id: "shelf2-right", name: "Middle shelf, right", x: 33, y: 29 },
    { id: "shelf3-left", name: "Bottom shelf, left", x: 21, y: 35.5 },
    { id: "shelf3-right", name: "Bottom shelf, right", x: 33, y: 36 },
    { id: "wall", name: "Wall display, center", x: 57, y: 41 },
    { id: "wall-left", name: "Wall display, left", x: 48, y: 32 },
    { id: "wall-right", name: "Wall display, right", x: 65, y: 32 },
    { id: "coffee-table", name: "Coffee table", x: 47, y: 65 },
    { id: "side-table", name: "Side table", x: 94, y: 67 },
    { id: "sofa-pillow-left", name: "Sofa, left pillow", x: 68, y: 58 },
    { id: "sofa-pillow-right", name: "Sofa, right pillow", x: 84, y: 59 },
    { id: "shell-chair", name: "Seashell chair corner", x: 30, y: 72 },
  ];
  const isWallSlot = (id: string) => id.startsWith("wall");
  const isPillowSlot = (id: string) => id.startsWith("sofa-pillow");
  const isChairSlot = (id: string) => id === "shell-chair";
  const isPillowDecor = (id: string) => /pillow|cushion/i.test(id + " " + (ITEMS[id]?.name || ""));
  const isChairDecor = (id: string) => /shell.chair|seashell.chair|pearl.shell.chair/i.test(id + " " + (ITEMS[id]?.name || ""));
  const isTableSlot = (id: string) => id.includes("table");
  const isWallDecor = (id: string) => /paint|artwork|mirror|wall|canvas|portrait/i.test(id + " " + (ITEMS[id]?.name || ""));
  const ownedDecor = Object.entries(state.inventory).filter(([id, count]) =>
    count > 0 && ITEMS[id] && (ITEMS[id].category === "decor" || (id.includes("painting") || id.includes("artwork")))
  ).sort((a, b) => ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name));
  const savePlacement = (next: Record<string, string>) => {
    setPlacements(next);
    try { window.localStorage.setItem("shoreline-hut-displays-v1", JSON.stringify(next)); } catch {}
  };
  const place = (id: string) => {
    if (!selectedSlot) return;
    if (isPillowSlot(selectedSlot) && !isPillowDecor(id)) { setAnnouncement("Choose a pillow or cushion for the sofa."); return; }
    if (isChairSlot(selectedSlot) && !isChairDecor(id)) { setAnnouncement("Choose your seashell chair for this corner."); return; }
    if (isWallSlot(selectedSlot) && !isWallDecor(id)) { setAnnouncement("Choose a painting, mirror, or other wall artwork for this position."); return; }
    const count = state.inventory[id] || 0;
    const usedElsewhere = Object.entries(placements).filter(([slot, item]) => slot !== selectedSlot && item === id).length;
    if (usedElsewhere >= count) { setAnnouncement("All owned copies of that decoration are already displayed."); return; }
    savePlacement({ ...placements, [selectedSlot]: id });
    setAnnouncement(`${ITEMS[id].name} placed on ${slots.find(s => s.id === selectedSlot)?.name}.`);
  };
  const clearSlot = () => {
    if (!selectedSlot) return;
    const next = { ...placements }; delete next[selectedSlot];
    savePlacement(next); setAnnouncement("Decoration returned to available inventory.");
  };
  const moveSlot = (direction: number) => {
    if (!selectedSlot || !placements[selectedSlot]) return;
    const index = slots.findIndex(s => s.id === selectedSlot);
    const nextSlot = slots[index + direction];
    if (!nextSlot || isWallSlot(selectedSlot) !== isWallSlot(nextSlot.id) || isTableSlot(selectedSlot) !== isTableSlot(nextSlot.id) || isPillowSlot(selectedSlot) !== isPillowSlot(nextSlot.id) || isChairSlot(selectedSlot) !== isChairSlot(nextSlot.id)) return;
    const next = { ...placements };
    const current = next[selectedSlot], other = next[nextSlot.id];
    next[nextSlot.id] = current;
    if (other) next[selectedSlot] = other; else delete next[selectedSlot];
    savePlacement(next); setSelectedSlot(nextSlot.id);
    setAnnouncement(`Moved to ${nextSlot.name}.`);
  };
  const [night, setNight] = useState(false);
  const [fireOn, setFireOn] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const destinationRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () => { const hour = new Date().getHours(); setNight(hour >= 19 || hour < 6); };
    update();
    try { const stored = JSON.parse(window.localStorage.getItem("shoreline-hut-displays-v1") || "{}"); if (stored && typeof stored === "object" && !Array.isArray(stored)) setPlacements(stored); } catch {}
    const timer = window.setInterval(update, 60000);
    setSelectedSlot(null);
    closeRef.current?.focus();
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    setMusicOverride(area === "inside" ? "hut" : "hutPatio");
    return () => setMusicOverride(null);
  }, [area, setMusicOverride]);
  const changeArea = (next: Area) => {
    setSelectedSlot(null);
    setArea(next);
    window.setTimeout(() => destinationRef.current?.focus(), 0);
  };
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 p-2 sm:p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-label={area === "inside" ? "Your seaside hut" : "Your seaside patio"} className="flex max-h-[96dvh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl bg-[#fff7e9] p-3 shadow-2xl">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-teal-950">{area === "inside" ? "Your Seaside Hut" : "Oceanfront Patio"}</h2>
          <button ref={closeRef} type="button" onClick={onClose} className="min-h-11 rounded-xl bg-teal-900 px-4 py-2 font-bold text-white">Return to Beach</button>
        </div>
        <p className="sr-only" aria-live="polite">{area === "inside" ? "Inside your hut. Three display shelves, a fireplace, seating, and a door to the patio." : "On your patio overlooking the beach. A door leads back inside."} {night ? "It is nighttime." : "It is daytime."}</p>
        <div className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-xl" style={{ aspectRatio: "3 / 4" }}>
          <Image src={imagePath(area, night)} alt={area === "inside" ? (night ? "Cozy hut interior at night with a glowing fireplace and moonlit ocean beyond the patio door" : "Sunny hut interior with three wooden shelves, fireplace, cozy furniture and a glass door to the patio") : (night ? "Wooden oceanfront patio beneath the moon and lantern light" : "Sunny oceanfront patio with flowers, wind chimes and room for decorations")} fill unoptimized priority sizes="(max-width: 640px) 100vw, 430px" className="object-contain" />
          {area === "inside" && slots.map(slot => {
            const id = placements[slot.id];
            const item = id && ITEMS[id];
            return <button key={slot.id} type="button" onClick={() => openDecoration(slot.id)} aria-label={`${slot.name}, ${item ? item.name : "empty"}, decorate`} className="absolute z-10 flex items-center justify-center rounded-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300" style={{ left: `${slot.x - (isWallSlot(slot.id) ? 7 : 5)}%`, top: `${slot.y - (isWallSlot(slot.id) ? 6 : 5)}%`, width: isWallSlot(slot.id) ? "14%" : isChairSlot(slot.id) ? "22%" : isPillowSlot(slot.id) ? "11%" : isTableSlot(slot.id) ? "11%" : "10%", height: isWallSlot(slot.id) ? "12%" : isChairSlot(slot.id) ? "21%" : isPillowSlot(slot.id) ? "9%" : isTableSlot(slot.id) ? "9%" : "6.5%" }}>
              {item && <DisplayArt key={item.id} icon={item.icon} name={item.name} isEmoji={item.isEmoji} />}
              <span className="sr-only">{slot.name}</span>
            </button>;
          })}
          {area === "inside" ? (
            <>
              <button type="button" onClick={() => changeArea("patio")} aria-label="Open patio door and go outside" className="absolute left-[71%] top-[20%] h-[36%] w-[27%] rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"><span className="sr-only">Go to Patio</span></button>
              <button type="button" onClick={() => setFireOn(v => !v)} aria-label={fireOn ? "Fireplace, turn fire off" : "Fireplace, turn fire on"} aria-pressed={fireOn} className="absolute left-[1%] top-[37%] h-[24%] w-[21%] rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"><span className="sr-only">Toggle Fireplace</span></button>
            </>
          ) : (
            <button type="button" onClick={() => changeArea("inside")} aria-label="Open hut door and go inside" className="absolute left-[1%] top-[15%] h-[47%] w-[29%] rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"><span className="sr-only">Go Inside</span></button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button ref={destinationRef} type="button" onClick={() => changeArea(area === "inside" ? "patio" : "inside")} className="min-h-11 rounded-xl bg-teal-800 px-4 py-2 font-semibold text-white">{area === "inside" ? "Go to Patio" : "Go Inside"}</button>
          {area === "inside" && <button type="button" onClick={() => setFireOn(v => !v)} aria-pressed={fireOn} className="min-h-11 rounded-xl border border-teal-800 px-4 py-2 font-semibold text-teal-950">{fireOn ? "Turn Fireplace Off" : "Turn Fireplace On"}</button>}
        </div>
        {area === "inside" && <p role="status" className="mt-2 text-sm text-teal-950">Fireplace {fireOn ? "on" : "off"} (visual fire remains part of the background).</p>}
        {area === "inside" && <button type="button" onClick={() => openDecoration("shelf1-left")} className="mt-2 min-h-11 rounded-xl bg-teal-800 px-4 py-2 font-semibold text-white">Decorate Your Hut</button>}
        {selectedSlot && area === "inside" && <section role="dialog" aria-label="Choose a decoration" className="mt-3 rounded-xl border border-teal-800 bg-white p-3">
          <h3 className="font-bold text-teal-950">{slots.find(s => s.id === selectedSlot)?.name}</h3>
          <p className="text-sm">Current: {placements[selectedSlot] && ITEMS[placements[selectedSlot]] ? ITEMS[placements[selectedSlot]].name : "Empty"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => moveSlot(-1)} className="min-h-11 rounded-lg border px-3">Move Left</button>
            <button type="button" onClick={() => moveSlot(1)} className="min-h-11 rounded-lg border px-3">Move Right</button>
            <button type="button" onClick={clearSlot} className="min-h-11 rounded-lg border px-3">Remove</button>
            <button type="button" onClick={() => setSelectedSlot(null)} className="min-h-11 rounded-lg bg-teal-900 px-3 text-white">Done</button>
          </div>
          <label htmlFor="hut-slot" className="mt-3 block font-semibold">Display position</label>
          <select id="hut-slot" value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} className="min-h-11 w-full rounded-lg border p-2">{slots.map(slot => <option key={slot.id} value={slot.id}>{slot.name}</option>)}</select>
          <p className="mt-2 text-sm">Choose an owned decoration:</p>
          <div className="mt-2 max-h-52 overflow-y-auto">
            {ownedDecor.length === 0 ? <p>No decorations in inventory yet.</p> : ownedDecor.filter(([id]) => isWallSlot(selectedSlot) ? isWallDecor(id) : isPillowSlot(selectedSlot) ? isPillowDecor(id) : isChairSlot(selectedSlot) ? isChairDecor(id) : true).map(([id, count]) => <button key={id} type="button" onClick={() => place(id)} className="mb-1 block min-h-11 w-full rounded-lg border border-slate-300 p-2 text-left text-teal-950">{ITEMS[id].name} (owned: {count})</button>)}
          </div>
          <p role="status" aria-live="polite" className="mt-2 text-sm">{announcement}</p>
        </section>}
      </section>
    </div>
  );
}
