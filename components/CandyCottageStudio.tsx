"use client";
import { useEffect, useState } from "react";

type House = { name: string; design: string; walls: string; roof: string; windows: string; garden: string; decoration: string };
const seasonal = [
  { name: "Spring Candy Greenhouse", walls: "Sugar glass", roof: "Pastel wafers", windows: "Sugar glass", garden: "Candy flowers", decoration: "Jellybeans" },
  { name: "Summer Seaside Cottage", walls: "Wafer cookies", roof: "Coconut icing", windows: "Sugar glass", garden: "Seashell candies", decoration: "Fruit sprinkles" },
  { name: "Autumn Harvest House", walls: "Chocolate panels", roof: "Caramel icing", windows: "Candy panes", garden: "Candy pumpkins", decoration: "Maple candies" },
  { name: "Winter Gingerbread Cabin", walls: "Gingerbread", roof: "Snowy icing", windows: "Candy panes", garden: "Gumdrop trees", decoration: "Peppermint sticks" },
] as const;
const materials = {
  walls: ["Gingerbread", "Wafer cookies", "Chocolate panels", "Sugar glass", "Candy bricks", "Pretzel logs"],
  roof: ["Snowy icing", "Pastel wafers", "Coconut icing", "Caramel icing", "Chocolate tiles", "Peppermint shingles"],
  windows: ["Sugar glass", "Candy panes", "Chocolate shutters", "Glowing candy windows"],
  garden: ["Candy flowers", "Seashell candies", "Candy pumpkins", "Gumdrop trees", "Sugar pathways", "Chocolate fences"],
  decoration: ["Jellybeans", "Fruit sprinkles", "Maple candies", "Peppermint sticks", "Marshmallows", "Candy pearls"],
} as const;
const assetRoot = "/images/Candy%20cottage/";
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
const storageKey = "shoreline-candy-cottage-gallery-v1";
export default function CandyCottageStudio({ onClose }: { onClose: () => void }) {
  const season = Math.floor(((new Date().getMonth() + 1) % 12) / 3);
  const featured = seasonal[season];
  const [house, setHouse] = useState<House>({ ...featured, design: "Seasonal Project" });
  const [gallery, setGallery] = useState<House[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(saved)) setGallery(saved.filter((item) => item && typeof item.name === "string").slice(0, 40));
    } catch { /* local save unavailable */ }
  }, []);
  const chooseDesign = (index: number) => {
    const chosen = seasonal[index];
    setHouse({ ...chosen, design: "Seasonal Project" });
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
          <button type="button" onClick={() => { setHouse({ name: "My Custom Candy House", design: "Free Build", walls: "Gingerbread", roof: "Pastel wafers", windows: "Sugar glass", garden: "Candy flowers", decoration: "Jellybeans" }); setMessage("Free Build ready."); }} className="min-h-11 w-full rounded-xl bg-pink-200 p-3 font-bold">Start Free Build</button>
          <label className="block font-semibold" htmlFor="candy-house-name">Name your house</label>
          <input id="candy-house-name" className="min-h-11 w-full rounded-lg border border-amber-500 bg-white p-2" value={house.name} onChange={event => setHouse({ ...house, name: event.target.value })} maxLength={70} />
          <div className="rounded-xl border border-amber-300 bg-white p-4" role="group" aria-label="Current candy house design">
            <div className="mx-auto w-full max-w-sm">
              <p className="mb-2 text-center text-sm font-semibold">House preview (roof placement is experimental)</p>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-b from-sky-100 to-amber-100">
                <img src={assetRoot + (house.design === "Free Build" ? "Free-Build-Cookie-Cottage.png" : houseArt[house.name] || "Free-Build-Cookie-Cottage.png")} alt={house.design === "Free Build" ? "Undecorated Free Build cookie cottage" : "Base illustration for " + house.name} className="absolute inset-0 h-full w-full object-contain" />
                <img src={assetRoot + roofArt[house.roof]} alt="" aria-hidden="true" className="pointer-events-none absolute left-[13%] top-[10%] w-[74%] object-contain opacity-90" />
              </div>
              <p className="mt-2 text-center text-xs text-amber-900">Roof overlays are approximate until we fit them to each house. The original roof remains in the base illustration.</p>
            </div>
            <h3 className="text-center font-bold">{house.name}</h3>
            <p className="text-sm">Walls: {house.walls}. Roof: {house.roof}. Windows: {house.windows}. Garden: {house.garden}. Decorations: {house.decoration}.</p>
          </div>
          {(Object.keys(materials) as (keyof typeof materials)[]).map(part => (
            <label key={part} className="block font-semibold">
              {part.charAt(0).toUpperCase() + part.slice(1)}
              <select value={house[part]} onChange={event => { setHouse({ ...house, [part]: event.target.value }); setMessage(part + " updated to " + event.target.value); }} className="mt-1 min-h-11 w-full rounded-lg border border-amber-500 bg-white p-2">
                {Array.from(new Set<string>([house[part], ...materials[part]])).map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          ))}
          <p role="status" aria-live="polite">{message}</p>
          <button type="button" onClick={save} className="min-h-11 w-full rounded-xl bg-teal-900 p-3 font-bold text-white">Save House to Gallery</button>
          <section aria-label="Candy Cottage Gallery" className="space-y-2">
            <h3 className="font-serif text-lg font-bold">Candy Cottage Gallery ({gallery.length})</h3>
            {gallery.length === 0 ? <p>No saved houses yet.</p> : gallery.map((saved, index) => (
              <div key={index} className="flex items-center justify-between gap-2 rounded-lg border border-amber-300 bg-white p-2">
                <span className="text-sm">{saved.name} — {saved.design}</span>
                <button type="button" onClick={() => { setHouse(saved); setMessage(saved.name + " loaded for editing."); }} className="min-h-11 rounded-lg bg-amber-200 px-3 font-semibold">Edit</button>
              </div>
            ))}
          </section>
        </div>
      </section>
    </div>
  );
}
