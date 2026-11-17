"use client";
import { useEffect, useState } from "react";

type PlacedDecoration = { id: number; art: string; spot: string; x: number; y: number };
type House = { name: string; design: string; walls: string; roof: string; windows: string; garden: string; decoration: string; doorArt?: string; windowArt?: string; placedDecorations?: PlacedDecoration[] };
const seasonal = [
  { name: "Spring Candy Greenhouse", walls: "Sugar glass", roof: "Pastel wafers", windows: "Sugar glass", garden: "Candy flowers", decoration: "Candy pearls" },
  { name: "Summer Seaside Cottage", walls: "Wafer cookies", roof: "Coconut icing", windows: "Sugar glass", garden: "Seashell candies", decoration: "Fruit sprinkles" },
  { name: "Autumn Harvest House", walls: "Chocolate panels", roof: "Caramel icing", windows: "Candy panes", garden: "Candy pumpkins", decoration: "Marshmallows" },
  { name: "Winter Gingerbread Cabin", walls: "Gingerbread", roof: "Snowy icing", windows: "Candy panes", garden: "Gumdrop trees", decoration: "Peppermint sticks" },
] as const;
const materials = {
  walls: ["Gingerbread", "Wafer cookies", "Chocolate panels", "Sugar glass", "Candy bricks", "Pretzel logs"],
  roof: ["Snowy icing", "Pastel wafers", "Coconut icing", "Caramel icing", "Chocolate tiles", "Peppermint shingles"],
  windows: ["Sugar glass", "Candy panes", "Chocolate shutters", "Glowing candy windows"],
  garden: ["Candy flowers", "Seashell candies", "Candy pumpkins", "Gumdrop trees", "Sugar pathways", "Chocolate fences"],
  decoration: ["Fruit sprinkles", "Peppermint sticks", "Marshmallows", "Candy pearls", "Pastel gumdrops"],
} as const;
const assetRoot = "/images/Candy%20cottage/";
// Only list candy materials with an existing matching illustration.
const candyMaterialArt: Record<string, { file: string; left: string; top: string; width: string; height: string }> = {
  "Fruit sprinkles": { file: "Sprinkled-Icing-Swirl.png", left: "34%", top: "29%", width: "32%", height: "13%" },
  "Peppermint sticks": { file: "Candy-Cane.png", left: "19%", top: "76%", width: "15%", height: "17%" },
  "Marshmallows": { file: "Marshmallows.png", left: "38%", top: "78%", width: "24%", height: "12%" },
  "Candy pearls": { file: "Icing-Pearl-Trim.png", left: "30%", top: "37%", width: "40%", height: "10%" },
  "Pastel gumdrops": { file: "Pastel-Gumdrops.png", left: "67%", top: "77%", width: "17%", height: "15%" },
};
const decorationChoices = [
  ["Candy heart", "Candy-Heart.png"], ["Candy star", "Candy-Star.png"], ["Candy seashell", "Candy-Seashell.png"],
  ["Candy sand dollar", "Candy-Sand-Dollar.png"], ["Candy cane", "Candy-Cane.png"],
  ["Crossed candy canes", "Crossed-Candy-Canes-With-Bow.png"],
  ["Pink lollipop", "Lollipop-Pink.png"], ["Rainbow lollipop", "Lollipop-Rainbow.png"],
  ["Peppermint lollipop", "Lollipop-Peppermint.png"], ["Marshmallows", "Marshmallows.png"],
  ["Pastel gumdrops", "Pastel-Gumdrops.png"], ["Copper candy lantern", "Candy-Lantern-Copper.png"],
  ["Teal candy lantern", "Candy-Lantern-Teal.png"],
] as const;
const gardenChoices = [
  ["Candy flowers", "Candy-Flowers.png"], ["Flower bush", "Flower-Bush.png"],
  ["Blue flower bush", "Blue-Flower-Bush.png"], ["Candy pumpkins", "Candy-Pumpkins.png"],
  ["Gumdrop tree", "Gumdrop-Tree.png"], ["Pink candy tree", "Pink-Candy-Tree.png"],
  ["Snow tree", "Snow-Tree.png"], ["Sunflowers", "Sunflowers.png"],
  ["Cookie birdhouse", "Cookie-Birdhouse.png"], ["Lollipop bush", "Lollipop-Bush.png"],
  ["Cookie fence", "Cookie-Fence.png"], ["Gingerbread fence", "Gingerbread-Cookie-Fence.png"],
  ["Rope fence", "Rope-Fence.png"],
] as const;
const decorationSpots = {
  "Front gable": { left: 42, top: 33, width: 12, height: 12 },
  "Above door": { left: 32, top: 36, width: 12, height: 12 },
  "Left garden": { left: 0, top: 70, width: 20, height: 20 },
  "Right garden": { left: 80, top: 70, width: 20, height: 20 },
  "Left path": { left: 23, top: 77, width: 17, height: 17 },
  "Right path": { left: 60, top: 77, width: 17, height: 17 },
} as const;
type DecorationSpot = keyof typeof decorationSpots;
const decorationName = (art: string) => [...decorationChoices, ...gardenChoices].find((item) => item[1] === art)?.[0] || art;
const allowedSpots = (art: string): DecorationSpot[] => {
  if (/Tree|Bush|Flowers|Pumpkins|Sunflowers|Fence|Birdhouse/i.test(art)) return ["Left garden", "Right garden", "Left path", "Right path"];
  if (/Lantern/i.test(art)) return ["Left path", "Right path", "Left garden", "Right garden"];
  if (/Cane|Lollipop/i.test(art)) return ["Left garden", "Right garden", "Left path", "Right path", "Front gable"];
  if (/Heart|Star|Seashell|Sand-Dollar/i.test(art)) return ["Above door", "Front gable"];
  return ["Front gable", "Above door", "Left garden", "Right garden", "Left path", "Right path"];
};
const movementDescription = (item: PlacedDecoration) => {
  const horizontal = item.x < 0 ? Math.abs(item.x / 2) + " steps left" : item.x > 0 ? (item.x / 2) + " steps right" : "centered horizontally";
  const vertical = item.y < 0 ? Math.abs(item.y / 2) + " steps up" : item.y > 0 ? (item.y / 2) + " steps down" : "centered vertically";
  return decorationName(item.art) + ", " + item.spot + ", " + horizontal + ", " + vertical;
};

const doorChoices = [["Original door",""],["Chocolate Peppermint","Chocolate-Peppermint-Door.png"],["Pastel Candy","Pastel-Candy-Door.png"],["Seaside Candy","Seaside-Candy-Door.png"],["Autumn Caramel","Autumn-Caramel-Door.png"],["Lavender","Door-Lavender.png"],["Mint","Door-Mint.png"],["Pink","Door-Pink.png"],["Teal Heart","Door-Teal-Heart.png"],["Blue","Door-Blue.png"],["Garland","Door-Garland.png"],["Wreath","Door-Wreath.png"]] as const;
const windowChoices = [["Original windows",""],["Gingerbread Sugar Glass","Gingerbread-Sugar-Glass-Window.png"],["Pastel Floral","Pastel-Floral-Window.png"],["Seaside Seashell","Seaside-Seashell-Window.png"],["Autumn Caramel","Autumn-Caramel-Window.png"],["Round","Window-Round.png"],["Flowerbox","Window-Flowerbox.png"],["Lattice","Window-Lattice.png"],["Shutters","Window-Shutters.png"]] as const;
// Each artwork batch has different transparent margins and proportions.
// Tune the bounding boxes independently without modifying the PNGs.
type OverlayPlacement = { left: string; top: string; width: string; height: string };
const doorPlacement: Record<string, OverlayPlacement> = {
  "Chocolate-Peppermint-Door.png": { left: "36%", top: "44%", width: "28%", height: "41%" },
  "Pastel-Candy-Door.png": { left: "36%", top: "43%", width: "28%", height: "42%" },
  "Seaside-Candy-Door.png": { left: "39%", top: "46%", width: "22%", height: "37%" },
  "Autumn-Caramel-Door.png": { left: "36%", top: "44%", width: "28%", height: "41%" },
  "Door-Lavender.png": { left: "38%", top: "46%", width: "24%", height: "37%" },
  "Door-Mint.png": { left: "38%", top: "46%", width: "24%", height: "37%" },
  "Door-Pink.png": { left: "38%", top: "46%", width: "24%", height: "37%" },
  "Door-Teal-Heart.png": { left: "38%", top: "46%", width: "24%", height: "37%" },
  "Door-Blue.png": { left: "38%", top: "46%", width: "24%", height: "37%" },
  "Door-Garland.png": { left: "40%", top: "48%", width: "20%", height: "32%" },
  "Door-Wreath.png": { left: "40%", top: "48%", width: "20%", height: "33%" },
};
const defaultDoorPlacement: OverlayPlacement = { left: "35%", top: "42%", width: "30%", height: "45%" };
type WindowPlacement = { left: string; right: string; top: string; width: string; height: string };
const windowPlacement: Record<string, WindowPlacement> = {
  "Gingerbread-Sugar-Glass-Window.png": { left: "13%", right: "56%", top: "44%", width: "31%", height: "35%" },
  "Pastel-Floral-Window.png": { left: "13%", right: "56%", top: "44%", width: "31%", height: "35%" },
  "Seaside-Seashell-Window.png": { left: "16%", right: "59%", top: "46%", width: "25%", height: "31%" },
  "Autumn-Caramel-Window.png": { left: "13%", right: "56%", top: "44%", width: "31%", height: "35%" },
  "Window-Round.png": { left: "16%", right: "59%", top: "46%", width: "25%", height: "29%" },
  "Window-Flowerbox.png": { left: "14%", right: "57%", top: "41%", width: "29%", height: "34%" },
  "Window-Lattice.png": { left: "13%", right: "56%", top: "44%", width: "31%", height: "35%" },
  "Window-Shutters.png": { left: "13%", right: "56%", top: "44%", width: "31%", height: "35%" },
};
const defaultWindowPlacement: WindowPlacement = { left: "12%", right: "55%", top: "43%", width: "33%", height: "37%" };
const houseArt: Record<string, string> = {
  "Spring Candy Greenhouse": "Spring-Candy-Greenhouse.png",
  "Summer Seaside Cottage": "Summer-Seaside-Cottage.png",
  "Autumn Harvest House": "Autumn-Harvest-House.png",
  "Winter Gingerbread Cabin": "Winter-Gingerbread-Log-Cabin.png",
};
const roofArt: Record<string, string> = {
  "Snowy icing": "Snowy-Icing.png",
  "Pastel wafers": "Pastel-Frosting.png",
  "Coconut icing": "Pastel-Frosting.png",
  "Caramel icing": "Caramel-Cinnamon.png",
  "Chocolate tiles": "Chocolate-Shingles.png",
  "Peppermint shingles": "Peppermint-Shingles.png",
};
// Each illustration has a different roof position. Keep these adjustments in one place.
const roofPlacement: Record<string, { left: string; top: string; width: string }> = {
  "Spring Candy Greenhouse": { left: "13%", top: "15%", width: "74%" },
  "Summer Seaside Cottage": { left: "12%", top: "16%", width: "76%" },
  "Autumn Harvest House": { left: "11%", top: "15%", width: "78%" },
  "Winter Gingerbread Cabin": { left: "12%", top: "16%", width: "76%" },
  "Free Build": { left: "1%", top: "7%", width: "98%" },
};
const storageKey = "shoreline-candy-cottage-gallery-v1";
export default function CandyCottageStudio({ onClose }: { onClose: () => void }) {
  const season = Math.floor(((new Date().getMonth() + 1) % 12) / 3);
  const featured = seasonal[season];
  const [house, setHouse] = useState<House>({ ...featured, design: "Seasonal Project" });
  const [gallery, setGallery] = useState<House[]>([]);
  const [message, setMessage] = useState("");
  const [selectedArt, setSelectedArt] = useState<string>(decorationChoices[0][1]);
  const [selectedSpot, setSelectedSpot] = useState<DecorationSpot>("Front gable");
  const [selectedDecorationId, setSelectedDecorationId] = useState<number | null>(null);
  const decorations = house.placedDecorations || [];
  const availableSpots = allowedSpots(selectedArt);
  const effectiveSpot = availableSpots.includes(selectedSpot) ? selectedSpot : availableSpots[0];
  const addDecoration = () => {
    const id = Math.max(0, ...decorations.map(item => item.id)) + 1;
    setHouse({ ...house, placedDecorations: [...decorations, { id, art: selectedArt, spot: effectiveSpot, x: 0, y: 0 }] });
    setSelectedDecorationId(id);
    setMessage(decorationName(selectedArt) + " added to " + effectiveSpot + ", centered horizontally and vertically.");
  };
  const moveDecoration = (dx: number, dy: number) => {
    if (selectedDecorationId === null) return;
    const updated = decorations.map(item => item.id === selectedDecorationId
      ? { ...item, x: Math.max(-12, Math.min(12, item.x + dx)), y: Math.max(-12, Math.min(12, item.y + dy)) } : item);
    setHouse({ ...house, placedDecorations: updated });
    const moved = updated.find(item => item.id === selectedDecorationId);
    if (moved) setMessage(movementDescription(moved) + ".");
  };
  const removeDecoration = () => {
    setHouse({ ...house, placedDecorations: decorations.filter(item => item.id !== selectedDecorationId) });
    setSelectedDecorationId(null);
    setMessage("Decoration removed.");
  };
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(saved)) setGallery(saved.filter((item) => item && typeof item.name === "string").slice(0, 40));
    } catch { /* local save unavailable */ }
  }, []);
  const chooseDesign = (index: number) => {
    const chosen = seasonal[index];
    setHouse({ ...chosen, design: "Seasonal Project", placedDecorations: [] });
    setSelectedDecorationId(null);
    setMessage(chosen.name + " ready to decorate.");
  };
  const save = () => {
    const next = [...gallery, { ...house, name: house.name.trim() || "My Candy Cottage" }].slice(-40);
    setGallery(next);
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); setMessage("Candy cottage saved to your gallery."); }
    catch { setMessage("Could not save on this device. Please check browser storage settings."); }
  };
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 p-3">
      <section role="dialog" aria-modal="true" aria-labelledby="candy-cottage-title" className="flex max-h-[92dvh] w-full max-w-xl flex-col rounded-2xl bg-amber-50 text-teal-950 shadow-xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-200 p-4">
          <h2 id="candy-cottage-title" className="font-serif text-xl font-bold">🏠 Candy Cottage Decorating Studio</h2>
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl bg-teal-900 px-3 py-2 font-semibold text-white">Close</button>
        </header>
        <div className="space-y-4 overflow-y-auto p-4">
          <p>Build a candy house with unlimited decorating supplies. These materials are separate from kitchen ingredients and never consume food inventory.</p>
          <p className="font-semibold">Featured this season: {featured.name}</p>
          <div className="grid grid-cols-2 gap-2">
            {seasonal.map((option, index) => <button key={option.name} type="button" onClick={() => chooseDesign(index)} className="min-h-11 rounded-xl border border-amber-400 bg-white p-2 text-sm font-semibold">{option.name}</button>)}
          </div>
          <button type="button" onClick={() => { setHouse({ name: "My Custom Candy House", design: "Free Build", walls: "Gingerbread", roof: "Pastel wafers", windows: "Sugar glass", garden: "Candy flowers", decoration: "Candy pearls", doorArt: "", windowArt: "", placedDecorations: [] }); setSelectedDecorationId(null); setMessage("Free Build ready."); }} className="min-h-11 w-full rounded-xl bg-pink-200 p-3 font-bold">Start Free Build</button>
          <label className="block font-semibold" htmlFor="candy-house-name">Name your house</label>
          <input id="candy-house-name" className="min-h-11 w-full rounded-lg border border-amber-500 bg-white p-2" value={house.name} onChange={event => setHouse({ ...house, name: event.target.value })} maxLength={70} />
          <div className="rounded-xl border border-amber-300 bg-white p-4" role="group" aria-label="Current candy house design">
            <div className="mx-auto w-full max-w-sm">
              <p className="mb-2 text-center text-sm font-semibold">Your candy house</p>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-b from-sky-100 to-amber-100">
                <img
                  src={assetRoot + (house.design === "Free Build" ? "Cookie-cottage-free-build-clean.PNG" : houseArt[house.name] || "Cookie-cottage-free-build-clean.PNG")}
                  alt={house.design === "Free Build" ? "Undecorated Free Build cookie cottage" : "Base illustration for " + house.name}
                  className="absolute inset-0 h-full w-full object-contain"
                  style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}
                />
                {house.design === "Free Build" && <img
                  src={assetRoot + roofArt[house.roof]}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute object-contain"
                  style={{
                    ...(roofPlacement[house.design === "Free Build" ? "Free Build" : house.name] || roofPlacement["Free Build"]),
                    maskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
                  }}
                />}
                {house.design === "Free Build" && house.doorArt && <img src={assetRoot + house.doorArt} alt="" aria-hidden="true" className="pointer-events-none absolute object-contain" style={doorPlacement[house.doorArt] || defaultDoorPlacement} />}
                {house.design === "Free Build" && house.windowArt && <>
                  <img src={assetRoot + house.windowArt} alt="" aria-hidden="true" className="pointer-events-none absolute object-contain" style={{ ...windowPlacement[house.windowArt] || defaultWindowPlacement, left: (windowPlacement[house.windowArt] || defaultWindowPlacement).left, right: undefined }} />
                  <img src={assetRoot + house.windowArt} alt="" aria-hidden="true" className="pointer-events-none absolute object-contain" style={{ ...windowPlacement[house.windowArt] || defaultWindowPlacement, left: (windowPlacement[house.windowArt] || defaultWindowPlacement).right, right: undefined }} />
                </>}
                {candyMaterialArt[house.decoration] && (
                  <img
                    src={assetRoot + candyMaterialArt[house.decoration].file}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute object-contain"
                    style={{
                      left: candyMaterialArt[house.decoration].left,
                      top: candyMaterialArt[house.decoration].top,
                      width: candyMaterialArt[house.decoration].width,
                      height: candyMaterialArt[house.decoration].height,
                    }}
                  />
                )}
                {decorations.map(item => {
                  const spot = decorationSpots[item.spot as DecorationSpot];
                  if (!spot) return null;
                  return <img key={item.id} src={assetRoot + item.art} alt="" aria-hidden="true"
                    className="pointer-events-none absolute object-contain"
                    style={{ left: (spot.left + item.x) + "%", top: (spot.top + item.y) + "%", width: spot.width + "%", height: spot.height + "%" }} />;
                })}
              </div>
              {house.design === "Free Build" && <p className="mt-2 text-center text-xs text-amber-900">Free Build uses a clean cottage base for your selected doors and windows.</p>}
            </div>
            <h3 className="text-center font-bold">{house.name}</h3>
            <p className="text-sm">Walls: {house.walls}. Roof: {house.roof}. Windows: {house.windows}. Garden: {house.garden}. Decorations: {house.decoration}.</p>
          </div>
          {house.design === "Free Build" && (
          <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Visual door and window choices">
            <label className="block font-semibold">Door artwork
              <select value={house.doorArt || ""} onChange={event => { setHouse({ ...house, doorArt: event.target.value }); setMessage("Door artwork updated."); }} className="mt-1 min-h-11 w-full rounded-lg border border-amber-500 bg-white p-2">
                {doorChoices.map(([label, filename]) => <option key={label} value={filename}>{label}</option>)}
              </select>
            </label>
            <label className="block font-semibold">Window artwork (both windows)
              <select value={house.windowArt || ""} onChange={event => { setHouse({ ...house, windowArt: event.target.value }); setMessage("Window artwork updated."); }} className="mt-1 min-h-11 w-full rounded-lg border border-amber-500 bg-white p-2">
                {windowChoices.map(([label, filename]) => <option key={label} value={filename}>{label}</option>)}
              </select>
            </label>
          </div>
          )}
          {(Object.keys(materials) as (keyof typeof materials)[]).filter(part => house.design === "Free Build" || (part !== "windows" && part !== "walls")).map(part => (
            <label key={part} className="block font-semibold">
              {part.charAt(0).toUpperCase() + part.slice(1)}
              <select value={house[part]} onChange={event => { setHouse({ ...house, [part]: event.target.value }); setMessage(part + " updated to " + event.target.value + (part === "decoration" && !candyMaterialArt[event.target.value] ? ". This candy material is currently a description only; use Candy and garden decorations to add visible pieces." : "")); }} className="mt-1 min-h-11 w-full rounded-lg border border-amber-500 bg-white p-2">
                {Array.from(new Set<string>([house[part], ...materials[part]])).map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          ))}
          <section className="space-y-3 rounded-xl border border-amber-300 bg-white p-3" aria-label="Candy and garden decorating">
            <h3 className="font-serif text-lg font-bold">Candy and garden decorations</h3>
            <p className="text-sm">Choose an item and a location, then add it to your house. Select an added decoration to move or remove it. No dragging required.</p>
            <label className="block font-semibold">Decoration
              <select value={selectedArt} onChange={event => { const art = event.target.value; setSelectedArt(art); setSelectedSpot(allowedSpots(art)[0]); }} className="mt-1 min-h-11 w-full rounded-lg border border-amber-500 bg-white p-2">
                <optgroup label="Candy decorations">{decorationChoices.map(([name, file]) => <option key={file} value={file}>{name}</option>)}</optgroup>
                <optgroup label="Garden decorations">{gardenChoices.map(([name, file]) => <option key={file} value={file}>{name}</option>)}</optgroup>
              </select>
            </label>
            <label className="block font-semibold">Placement area
              <select value={effectiveSpot} onChange={event => setSelectedSpot(event.target.value as DecorationSpot)} className="mt-1 min-h-11 w-full rounded-lg border border-amber-500 bg-white p-2">
                {availableSpots.map(spot => <option key={spot} value={spot}>{spot}</option>)}
              </select>
            </label>
            <button type="button" onClick={addDecoration} className="min-h-11 w-full rounded-xl bg-pink-200 p-3 font-bold">Add decoration to preview</button>
            {decorations.length > 0 && <>
              <label className="block font-semibold">Edit placed decoration
                <select value={selectedDecorationId ?? ""} onChange={event => { const id = Number(event.target.value); setSelectedDecorationId(id); const item = decorations.find(d => d.id === id); if (item) setMessage(movementDescription(item) + "."); }} className="mt-1 min-h-11 w-full rounded-lg border border-amber-500 bg-white p-2">
                  <option value="" disabled>Choose a decoration</option>
                  {decorations.map(item => <option key={item.id} value={item.id}>{decorationName(item.art)} — {item.spot} (item {item.id})</option>)}
                </select>
              </label>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Move selected decoration">
                <span />
                <button type="button" disabled={selectedDecorationId === null} onClick={() => moveDecoration(0, -2)} className="min-h-11 rounded-lg bg-amber-100 disabled:opacity-50">Move up</button>
                <span />
                <button type="button" disabled={selectedDecorationId === null} onClick={() => moveDecoration(-2, 0)} className="min-h-11 rounded-lg bg-amber-100 disabled:opacity-50">Move left</button>
                <button type="button" disabled={selectedDecorationId === null} onClick={() => moveDecoration(0, 2)} className="min-h-11 rounded-lg bg-amber-100 disabled:opacity-50">Move down</button>
                <button type="button" disabled={selectedDecorationId === null} onClick={() => moveDecoration(2, 0)} className="min-h-11 rounded-lg bg-amber-100 disabled:opacity-50">Move right</button>
              </div>
              <button type="button" disabled={selectedDecorationId === null} onClick={removeDecoration} className="min-h-11 rounded-lg border border-amber-500 px-3 py-2 disabled:opacity-50">Remove selected decoration</button>
            </>}
          </section>
          <p role="status" aria-live="polite" aria-atomic="true">{message}</p>
          <button type="button" onClick={save} className="min-h-11 w-full rounded-xl bg-teal-900 p-3 font-bold text-white">Save House to Gallery</button>
          <section aria-label="Candy Cottage Gallery" className="space-y-2">
            <h3 className="font-serif text-lg font-bold">Candy Cottage Gallery ({gallery.length})</h3>
            {gallery.length === 0 ? <p>No saved houses yet.</p> : gallery.map((saved, index) => (
              <div key={index} className="flex items-center justify-between gap-2 rounded-lg border border-amber-300 bg-white p-2">
                <span className="text-sm">{saved.name} — {saved.design}</span>
                <button type="button" onClick={() => { setHouse(saved); setSelectedDecorationId(null); setMessage(saved.name + " loaded for editing."); }} className="min-h-11 rounded-lg bg-amber-200 px-3 font-semibold">Edit</button>
              </div>
            ))}
          </section>
        </div>
      </section>
    </div>
  );
}
