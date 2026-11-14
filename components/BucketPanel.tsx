"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";


export default function BucketPanel() {
  const { state, bucketCapacity, setScreen, setMusicOverride } = useGame();
  const [isNight, setIsNight] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () => { const h = new Date().getHours(); setIsNight(h >= 19 || h < 6); };
    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => { setMusicOverride("inventory"); return () => setMusicOverride(null); }, [setMusicOverride]);
  useEffect(() => {
    if (panel) closeRef.current?.focus();
  }, [panel]);
  const [search,setSearch] = useState("");
  const [category,setCategory] = useState("all");
  const classify = (id:string) => {
    const item=ITEMS[id];
    if (/flower|blossom|lavender|orchid|hibiscus|holly|rose|moonflower/i.test(id) && !/seed|petal|shard|glaze|painting|mosaic|marshmallow/i.test(id)) return "flowers";
    if (/seed|soil|sapling|plant/i.test(id)) return "gardening";
    if (/fish|kelp|coral|seaweed|pearl|shell|sea.glass/i.test(id) && item?.category==="raw") return "ocean";
    if (item?.category==="food") return "food";
    if (item?.category==="decor") return "decor";
    if (item?.category==="special" || item?.rarity==="rare") return "special";
    if (item?.category==="raw") return "materials";
    return "other";
  };
  const pct = Math.min(100, Math.round((state.bucketCount / bucketCapacity) * 100));
  const tier = pct <= 25 ? "Empty" : pct <= 75 ? "Half-Full" : "Full to the Brim!";

  const entries = Object.entries(state.inventory)
    .filter(([id, count]) => count > 0 && !!ITEMS[id] && (category==="all" || classify(id)===category) && (!search.trim() || ITEMS[id].name.toLowerCase().includes(search.trim().toLowerCase()) || id.toLowerCase().includes(search.trim().toLowerCase())))
    .sort((a, b) => b[1] - a[1]);
  const blueprints = state.blueprints.map((id) => ITEMS[id]).filter(Boolean);

  const categories = [
    { id: "ocean", name: "Ocean finds", x: 44, y: 49, w: 28, h: 20 },
    { id: "decor", name: "Decorations and pottery", x: 7, y: 20, w: 25, h: 34 },
    { id: "materials", name: "Crafting materials", x: 5, y: 62, w: 24, h: 18 },
    { id: "gardening", name: "Seeds and gardening", x: 78, y: 52, w: 21, h: 23 },
    { id: "flowers", name: "Flowers", x: 77, y: 36, w: 22, h: 16 },
    { id: "food", name: "Food and drinks", x: 56, y: 12, w: 27, h: 20 },
    { id: "special", name: "Rare and special", x: 36, y: 33, w: 27, h: 15 },
    { id: "other", name: "Other items", x: 75, y: 24, w: 24, h: 12 },
  ];
  const openCategory = (id: string) => { setCategory(id); setSearch(""); setPanel("collection"); };
  const panelTitle = panel === "collection" ? (categories.find(c => c.id === category)?.name || "All items") : panel === "bucket" ? "Your Beach Bucket" : panel === "blueprints" ? "Blueprint Collection" : "Trade Your Finds";
  return (
    <div className="h-full overflow-y-auto pb-24 px-3 pt-3 bg-[#fbf3e3]">
      <h1 className="font-serif text-xl font-bold text-amber-950 mb-2">The Treasure Room</h1>
      <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl shadow-lg">
        <Image src={isNight ? "/images/Inventory-night.PNG" : "/images/Inventory-day.PNG"} alt={isNight ? "Moonlit seaside treasure room with cabinets, shelves, baskets and a treasure chest" : "Sunlit seaside treasure room with cabinets, shelves, baskets and a treasure chest"} width={1024} height={1365} unoptimized priority className="block w-full h-auto" />
        {categories.map(c => <button key={c.id} type="button" aria-label={`Open ${c.name}`} title={c.name} onClick={() => openCategory(c.id)}
          className="absolute rounded-lg border-2 border-amber-100/60 bg-teal-900/15 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300"
          style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.w}%`, height: `${c.h}%` }} />)}
        <button type="button" aria-label="Open beach bucket" onClick={() => setPanel("bucket")} className="absolute left-[1%] top-[78%] h-[19%] w-[25%] rounded-lg border-2 border-amber-100/60 bg-teal-900/15 focus-visible:outline-4 focus-visible:outline-yellow-300" />
        <button type="button" aria-label="Open blueprint collection" onClick={() => setPanel("blueprints")} className="absolute left-[73%] top-[75%] h-[24%] w-[26%] rounded-lg border-2 border-amber-100/60 bg-teal-900/15 focus-visible:outline-4 focus-visible:outline-yellow-300" />
      </div>
      <div className="mx-auto max-w-2xl mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => openCategory("all")} className="min-h-12 rounded-xl bg-teal-800 p-3 font-semibold text-white">Browse all items</button>
        <button type="button" onClick={() => setPanel("bucket")} className="min-h-12 rounded-xl bg-teal-800 p-3 font-semibold text-white">Beach bucket</button>
        <button type="button" onClick={() => setPanel("blueprints")} className="min-h-12 rounded-xl bg-teal-800 p-3 font-semibold text-white">Blueprints</button>
        <button type="button" onClick={() => setPanel("trade")} className="min-h-12 rounded-xl bg-teal-800 p-3 font-semibold text-white">Trade at Seaweed &amp; Salt</button>
      </div>
      {panel && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3" onKeyDown={e => { if (e.key === "Escape") setPanel(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="treasure-panel-title" className="max-h-[85dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-[#fff7e9] p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 id="treasure-panel-title" className="font-serif text-xl font-bold text-amber-950">{panelTitle}</h2>
            <button ref={closeRef} type="button" onClick={() => setPanel(null)} className="min-h-11 rounded-lg bg-teal-800 px-4 text-white">Close</button>
          </div>
          {panel === "bucket" && <div>
            <p className="font-semibold text-amber-900">{tier}</p>
            <div role="progressbar" aria-label="Bucket fullness" aria-valuenow={state.bucketCount} aria-valuemin={0} aria-valuemax={bucketCapacity} className="mt-2 h-4 overflow-hidden rounded-full bg-amber-200">
              <div className="h-full bg-teal-600" style={{width:`${pct}%`}} />
            </div>
            <p className="mt-2 text-amber-900">{state.bucketCount} of {bucketCapacity} this trip; {state.bucketsFilled} buckets filled overall.</p>
          </div>}
          {panel === "blueprints" && (blueprints.length === 0 ? <p>No blueprints collected yet. Watch for Shelby’s Trading Ship.</p> : <div className="grid grid-cols-2 gap-3">{blueprints.map(item => <div key={item.id} className="rounded-lg bg-white p-3"><strong>{item.name}</strong><p className="text-sm">Saved for a future expansion</p></div>)}</div>)}
          {panel === "trade" && <div><p>Take eligible shoreline goods to Seaweed &amp; Salt and exchange them for Sand Dollars.</p><button type="button" className="mt-3 min-h-12 rounded-xl bg-teal-800 p-3 text-white" onClick={() => { setPanel(null); setScreen("shop"); }}>Visit Seaweed &amp; Salt · {state.sandDollars} Sand Dollars</button></div>}
          {panel === "collection" && <>
            <label htmlFor="inventory-search" className="block font-semibold">Search inventory</label>
            <input id="inventory-search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search item names" className="mb-3 min-h-12 w-full rounded-lg border border-amber-400 bg-white p-3 text-base" />
            <label htmlFor="inventory-category" className="block font-semibold">Item category</label>
            <select id="inventory-category" value={category} onChange={e => setCategory(e.target.value)} className="mb-3 min-h-12 w-full rounded-lg border border-amber-400 bg-white p-3 text-base">
              <option value="all">All items</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <p role="status" className="mb-3 text-sm">{entries.length} matching item types</p>
            {entries.length === 0 && <p className="mb-3">{search || category !== "all" ? "No items match your search or category." : "Nothing collected yet — head to the beach and start finding treasures!"}</p>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {entries.map(([id, count]) => {
          const def = ITEMS[id];
          if (!def) return null;
          const embroideryMatch = id.match(/^sewing-embroidered-(seashell-pillow|moon-pillow|patchwork-beach-blanket|cozy-fluffy-baby-blanket)-(seashell|starfish|flower|moon)(?:-(pearl-white|ocean-blue|seafoam-green|rose-pink|lavender|golden-sand))?$/);
          const embroideryColor = embroideryMatch?.[3] ? embroideryMatch[3].replaceAll("-", " ") : "color not recorded";
          return (
            <div key={id} className="flex flex-col items-center bg-white/80 rounded-xl p-2 shadow-sm ring-1 ring-amber-100">
              <div className="w-16 h-16 flex items-center justify-center">
                {def.isEmoji ? (
                  <span className={`text-2xl ${def.glows ? "chest-treasure-glow" : ""}`}>{def.icon}</span>
                ) : (
                  embroideryMatch ? (
                    <div className="relative h-16 w-16" role="img" aria-label={def.name + ". Embroidered " + embroideryMatch[2] + ", thread " + embroideryColor}>
                      <Image src={def.icon} alt="" fill unoptimized className="object-contain" sizes="64px" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative h-7 w-7"><Image src={"/images/Sewing/embroidery-"+embroideryMatch[2]+".png"} alt="" fill unoptimized className="object-contain" sizes="28px" /></div>
                      </div>
                    </div>
                  ) : <Image src={def.icon} alt={def.artDescription || def.name} width={40} height={40} unoptimized className={`object-contain ${def.glows ? "chest-treasure-glow" : ""}`} />
                )}
              </div>
              <span className="text-[10px] text-amber-800 text-center mt-1 leading-tight">{def.name}</span>
              {embroideryMatch && <span className="text-[10px] text-teal-800 text-center">Thread: {embroideryColor}</span>}
              <span className="text-xs font-bold text-emerald-700">{count}</span>
            </div>
          );
        })}
      </div>
          </>}
        </section>
      </div>}
    </div>
  );
}
