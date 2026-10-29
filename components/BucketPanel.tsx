"use client";
import Image from "next/image";
import { useState } from "react";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { SCENES } from "@/lib/media";

export default function BucketPanel() {
  const { state, bucketCapacity, setScreen } = useGame();
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

  return (
    <div className="h-full overflow-y-auto pb-24 px-4 pt-4 bg-[#fbf3e3]">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-md mb-4">
        <Image src={SCENES.bucketStates} alt="Beach bucket" width={1000} height={563} unoptimized className="w-full h-auto" />
      </div>

      <div className="rounded-2xl bg-white/70 border border-amber-200 p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-amber-900">Your Bucket</span>
          <span className="text-sm text-amber-700">{tier}</span>
        </div>
        <div className="h-4 rounded-full bg-amber-100 overflow-hidden ring-1 ring-amber-200">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-amber-700">
          {state.bucketCount}/{bucketCapacity} this trip &middot; {state.bucketsFilled} buckets filled overall
        </div>
      </div>

      <section className="mb-4 rounded-2xl border border-teal-300 bg-teal-50 p-4 shadow-sm" aria-labelledby="trade-heading">
        <h2 id="trade-heading" className="font-serif text-lg font-bold text-teal-950">Trade Your Finds</h2>
        <p className="mt-1 text-sm text-teal-800">Take eligible shoreline goods to Seaweed &amp; Salt and exchange them for Sand Dollars.</p>
        <button
          type="button"
          onClick={() => setScreen("shop")}
          className="mt-3 min-h-12 w-full rounded-xl bg-teal-700 px-4 py-3 font-bold text-white shadow active:bg-teal-800"
        >
          Visit Seaweed &amp; Salt · 🪙 {state.sandDollars}
        </button>
      </section>

      <section className="mb-4 rounded-2xl border border-indigo-300 bg-indigo-50 p-4 shadow-sm" aria-labelledby="blueprints-heading">
        <h2 id="blueprints-heading" className="font-serif text-lg font-bold text-indigo-950">Blueprint Collection</h2>
        <p className="mt-1 text-sm text-indigo-800">Expansion plans are protected here until their new sanctuary areas are ready to build.</p>
        {blueprints.length === 0 ? (
          <p className="mt-3 text-sm text-indigo-700/80">No blueprints collected yet. Watch for Shelby’s Trading Ship.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {blueprints.map((item) => (
              <div key={item.id} className="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-indigo-100">
                <span className="text-2xl" aria-hidden="true">{item.isEmoji ? item.icon : "📐"}</span>
                <p className="mt-1 text-xs font-bold text-indigo-950">{item.name}</p>
                <p className="mt-1 text-[10px] text-indigo-700">Saved for a future expansion</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <h2 className="text-lg font-semibold text-amber-900 mb-2">Collection</h2>
      <div className="mb-4 space-y-3 rounded-xl bg-white/80 p-3">
        <label htmlFor="inventory-search" className="block font-semibold text-amber-900">Search inventory</label>
        <input id="inventory-search" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search item names" className="min-h-12 w-full rounded-lg border border-amber-300 bg-white px-3 text-base text-amber-950"/>
        <label htmlFor="inventory-category" className="block font-semibold text-amber-900">Item category</label>
        <select id="inventory-category" value={category} onChange={e=>setCategory(e.target.value)} className="min-h-12 w-full rounded-lg border border-amber-300 bg-white px-3 text-base text-amber-950">
          <option value="all">All items</option><option value="flowers">Flowers</option><option value="gardening">Seeds & gardening</option><option value="ocean">Ocean finds</option><option value="food">Food & drinks</option><option value="materials">Crafting materials</option><option value="decor">Decorations & pottery</option><option value="special">Rare & special</option><option value="other">Other items</option>
        </select>
        <p role="status" className="text-sm text-amber-800">{entries.length} matching item types</p>
        {(search || category!=="all") && <button type="button" className="min-h-11 rounded-lg bg-teal-800 px-4 py-2 font-semibold text-white" onClick={()=>{setSearch("");setCategory("all");}}>Clear filters</button>}
      </div>
      {entries.length === 0 && !search && category==="all" && (
        <p className="text-sm text-amber-700/80">Nothing collected yet — head to the beach and start tapping treasures!</p>
      )}
      {entries.length===0 && (search || category!=="all") && <p role="status" className="mb-3 text-amber-800">No items match your search or category.</p>}
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
    </div>
  );
}
