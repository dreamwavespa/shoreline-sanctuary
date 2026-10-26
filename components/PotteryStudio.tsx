"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import Image from "next/image";

type FinishedPottery = { piece: string; glaze: string; itemId: string; collectedAt: number };
type Job = { id: string; piece: string; clay: "coastal" | "porcelain"; stage: "drying" | "ready-glaze" | "firing" | "ready"; readyAt: number; glaze?: string };
const PIECES = [
  { id: "flower-vase", name: "Flower Vase", clay: "coastal", cost: 1 },
  { id: "coastal-bowl", name: "Coastal Bowl", clay: "coastal", cost: 1 },
  { id: "seashell-cup", name: "Seashell Cup", clay: "coastal", cost: 1 },
  { id: "driftwood-candleholder", name: "Driftwood Candleholder", clay: "coastal", cost: 1 },
  { id: "porcelain-tea-set", name: "Porcelain Tea Set", clay: "porcelain", cost: 2 },
  { id: "pearl-vase", name: "Pearl Vase", clay: "porcelain", cost: 1 },
  { id: "porcelain-bowl", name: "Porcelain Bowl", clay: "porcelain", cost: 1 },
  { id: "moonlight-candleholder", name: "Moonlight Candleholder", clay: "porcelain", cost: 1 },
] as const;
const GLAZES = [{ id: "clear-pottery-glaze", name: "Clear" }, { id: "pearl-pottery-glaze", name: "Pearl" }, { id: "iridescent-pottery-glaze", name: "Iridescent" }, { id: "orange-glaze", name: "Orange" }, { id: "glaze-ruby-red", name: "Ruby Red" }, { id: "glaze-sunflower-yellow", name: "Sunflower Yellow" }, { id: "glaze-sky-blue", name: "Sky Blue" }, { id: "glaze-sea-foam-green", name: "Sea Foam Green" }, { id: "glaze-baby-pink", name: "Baby Pink" }, { id: "glaze-pearl-white", name: "Pearl White" }, { id: "glaze-midnight-black", name: "Midnight Black" }, { id: "glaze-purple-grape", name: "Purple Grape" }, { id: "glaze-chocolate-brown", name: "Chocolate Brown" }, { id: "glaze-metallic-gold", name: "Metallic Gold" }, { id: "glaze-shimmering-silver", name: "Shimmering Silver" } ];
const SPECIAL_GLAZES = [
  { name: "Mermaid Shimmer", colors: ["glaze-sky-blue", "iridescent-pottery-glaze"], description: "Ocean blue with lavender and aqua reflections." },
  { name: "Sunset Pearl", colors: ["glaze-baby-pink", "orange-glaze"], description: "Peach and coral-pink sunset swirls." },
  { name: "Moonlit Silver", colors: ["glaze-midnight-black", "glaze-shimmering-silver"], description: "Midnight tones with silver streaks." },
  { name: "Royal Coral", colors: ["glaze-ruby-red", "glaze-metallic-gold"], description: "Ruby red with golden veins." },
  { name: "Sea Glass Mist", colors: ["glaze-sea-foam-green", "clear-pottery-glaze"], description: "Frosted translucent sea-glass green." },
  { name: "Blushing Pearl", colors: ["glaze-baby-pink", "glaze-pearl-white"], description: "Soft pearlescent pink." },
  { name: "Aurora Tide", colors: ["glaze-purple-grape", "iridescent-pottery-glaze"], description: "Violet and teal aurora reflections." },
  { name: "Golden Driftwood", colors: ["glaze-chocolate-brown", "glaze-metallic-gold"], description: "Warm driftwood brown with golden highlights." },
] as const;
const mixKey = (colors: readonly string[]) => [...colors].sort().join("+");
const specialGlaze = (glaze?: string) => SPECIAL_GLAZES.find(s => mixKey(s.colors) === glaze);
const COLORED_SHAPES = ["seashell-cup", "flower-vase", "coastal-bowl", "pearl-vase", "porcelain-bowl"];
const GLAZE_FILTERS: Record<string, string> = {
  "glaze-ruby-red": "sepia(1) saturate(5) hue-rotate(305deg)",
  "glaze-sunflower-yellow": "sepia(1) saturate(3) hue-rotate(350deg)",
  "glaze-sky-blue": "saturate(1.35)",
  "glaze-sea-foam-green": "sepia(.35) saturate(1.5) hue-rotate(35deg)",
  "glaze-baby-pink": "sepia(.65) saturate(1.6) hue-rotate(285deg)",
  "glaze-pearl-white": "saturate(.35) brightness(1.2)",
  "glaze-midnight-black": "grayscale(.8) brightness(.42)",
  "glaze-purple-grape": "sepia(.55) saturate(2) hue-rotate(105deg)",
  "glaze-chocolate-brown": "sepia(.9) saturate(1.4) hue-rotate(335deg) brightness(.7)",
  "glaze-metallic-gold": "sepia(.95) saturate(2) hue-rotate(350deg)",
  "glaze-shimmering-silver": "grayscale(1) brightness(1.2)",
  "orange-glaze": "sepia(1) saturate(3) hue-rotate(335deg)",
};
const POTTERY_SOUNDS = { wheel: "/audio/pottery-wheel.mp3", glaze: "/audio/pottery-glaze.mp3", kiln: "/audio/pottery-kiln.mp3", collect: "/audio/pottery-collect.mp3" } as const;
function playPotterySound(kind: keyof typeof POTTERY_SOUNDS, next?: keyof typeof POTTERY_SOUNDS) {
  try {
    const audio = new Audio(POTTERY_SOUNDS[kind]);
    audio.volume = 0.55;
    if (next) audio.addEventListener("ended", () => playPotterySound(next), { once: true });
    void audio.play().catch(() => {});
  } catch { /* Sound is optional; crafting remains accessible without audio. */ }
}
const STORAGE = "shoreline-pottery-v1";
const MINUTE = 60000;
function duration(ms: number) { const n = Math.max(0, Math.ceil(ms / MINUTE)); return n ? n + " min remaining" : "Ready"; }
export default function PotteryStudio() {
  const { state, craft, hasEnough } = useGame();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [finished, setFinished] = useState<FinishedPottery[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [glazeChoice, setGlazeChoice] = useState<Record<string,string>>({});
  const [secondGlazeChoice, setSecondGlazeChoice] = useState<Record<string,string>>({});
  const [notice, setNotice] = useState("");
  const [lastKitClaim, setLastKitClaim] = useState("");
  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem(STORAGE) || "{}"); if (Array.isArray(saved.jobs)) setJobs(saved.jobs); if (Array.isArray(saved.completed)) setCompleted(saved.completed); if (Array.isArray(saved.finished)) setFinished(saved.finished); if (typeof saved.lastKitClaim === "string") setLastKitClaim(saved.lastKitClaim); } catch {}
    setHydrated(true);
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(STORAGE, JSON.stringify({ jobs, completed, finished, lastKitClaim })); }, [jobs, completed, finished, lastKitClaim, hydrated]);
  const completedDesigns = new Set([...completed, ...finished.map(item => item.piece)]);
  const coastalPieces = PIECES.filter(p => p.clay === "coastal");
  const porcelainPieces = PIECES.filter(p => p.clay === "porcelain");
  const coastalDone = coastalPieces.every(p => completedDesigns.has(p.id));
  const porcelainDone = porcelainPieces.every(p => completedDesigns.has(p.id));
  const teaSetUnlocked = (state.villagerGiftCounts.kaiana || 0) >= 9 || state.crafted.includes("recipe-porcelain-tea-set");
  const slots = 2 + Number(coastalDone) + Number(porcelainDone);
  const active = jobs.filter(j => j.stage !== "ready").length;
  const begin = (piece: typeof PIECES[number]) => {
    if (active >= slots) return;
    if (piece.id === "porcelain-tea-set" && !teaSetUnlocked) { setNotice("Kaiana unlocks the Porcelain Tea Set recipe after her ninth gift."); return; }
    const material = piece.clay === "coastal" ? "coastal-clay" : "white-porcelain-clay";
    if (!hasEnough([{itemId: material, count: piece.cost}])) { setNotice("Not enough clay."); return; }
    if (!craft("pottery-shaped-workpiece", [{itemId: material, count: piece.cost}])) return;
    setJobs(prev => [...prev, { id: Date.now().toString() + "-" + prev.length, piece: piece.id, clay: piece.clay, stage: "drying", readyAt: Date.now() + 10 * MINUTE }]);
    playPotterySound("wheel");
    setNotice(piece.name + " is drying.");
  };
  const startFire = (job: Job) => {
    if (job.stage !== "ready-glaze" && !(job.stage === "drying" && now >= job.readyAt)) return;
    const glaze = glazeChoice[job.id] || GLAZES[0].id;
    const second = coastalDone && porcelainDone ? secondGlazeChoice[job.id] : undefined;
    if (second && second === glaze) { setNotice("Choose two different glazes to mix."); return; }
    const ingredients = [{itemId: glaze, count: 1}, ...(second ? [{itemId: second, count: 1}] : [])];
    if (!hasEnough(ingredients)) { setNotice("Not enough glaze for the selected finish."); return; }
    if (!craft("pottery-glaze-applied", ingredients)) return;
    setJobs(prev => prev.map(j => j.id === job.id ? {...j, stage: "firing", readyAt: Date.now() + 15 * MINUTE, glaze: second ? [glaze, second].sort().join("+") : glaze} : j));
    playPotterySound("glaze", "kiln");
    setNotice(second ? "Two glazes combined. Pottery is firing in the kiln." : "Glazed pottery is firing in the kiln.");
  };
  const collect = (job: Job) => {
    if (job.stage !== "ready" && !(job.stage === "firing" && now >= job.readyAt)) return;
    // Only register a finished item if the catalog defines it.
    const specialty = specialGlaze(job.glaze);
    const variantId = specialty && ["flower-vase", "pearl-vase", "coastal-bowl", "porcelain-bowl", "seashell-cup", "porcelain-tea-set", "moonlight-candleholder"].includes(job.piece)
      ? `${job.piece}--special-${specialty.name.toLowerCase().replace(/\s+/g, "-")}`
      : COLORED_SHAPES.includes(job.piece) && job.glaze && !job.glaze.includes("+") ? `${job.piece}--${job.glaze}` : job.piece;
    const collectibleId = ITEMS[variantId] ? variantId : job.piece;
    if (!craft(collectibleId, [])) return;
    setFinished(prev => [...prev, { piece: job.piece, glaze: job.glaze || "clear-pottery-glaze", itemId: collectibleId, collectedAt: Date.now() }]);
    setCompleted(prev => prev.includes(job.piece) ? prev : [...prev, job.piece]);
    setJobs(prev => prev.filter(j => j.id !== job.id));
    playPotterySound("collect");
    const special = specialGlaze(job.glaze);
    const previouslyDiscovered = new Set(finished.map(item => specialGlaze(item.glaze)?.name).filter(Boolean));
    setNotice(special && !previouslyDiscovered.has(special.name) ? `New glaze discovered: ${special.name}! Recorded in your Artisan’s Glaze Discoveries.` : "Finished " + (PIECES.find(p => p.id === job.piece)?.name || "pottery") + " collected.");
  };
  const potteryImage = (piece: string, glaze?: string) => {
    const specialty = specialGlaze(glaze);
    if (specialty) {
      const slug = specialty.name.toLowerCase().replace(/\s+/g, "-");
      const suffix: Record<string, string> = {
        "flower-vase": "vase", "pearl-vase": "vase",
        "coastal-bowl": "bowl", "porcelain-bowl": "bowl",
        "seashell-cup": "cup", "porcelain-tea-set": "tea-set",
        "moonlight-candleholder": "moonlight-candleholder",
      };
      if (suffix[piece]) return `/images/Pottery/${slug}-${suffix[piece]}.png`;
    }
    const variantId = COLORED_SHAPES.includes(piece) && glaze && !glaze.includes("+") ? `${piece}--${glaze}` : piece;
    return ITEMS[variantId]?.icon || ITEMS[piece]?.icon || "/images/pottery-studio.png";
  };
  const glazeName = (glaze: string) => specialGlaze(glaze)?.name || glaze.split("+").map(id => GLAZES.find(g => g.id === id)?.name || id).join(" + ");
  const potteryFilter = (piece: string, glaze?: string) => {
    if (!glaze || glaze.includes("+") || piece === "seashell-cup") return undefined;
    const image = potteryImage(piece, glaze);
    if (image !== ITEMS[piece]?.icon) return undefined;
    return GLAZE_FILTERS[glaze];
  };
  const todayKey = new Date(now).toLocaleDateString("en-CA");
  const kitOwned = state.crafted.includes("master-potters-glaze-kit");
  const collectDailyGlaze = () => {
    if (!kitOwned || lastKitClaim === todayKey) return;
    const glaze = GLAZES[Math.floor(Math.random() * GLAZES.length)];
    if (!glaze || !craft(glaze.id, [])) return;
    if (!craft(glaze.id, [])) return;
    setLastKitClaim(todayKey);
    try { const audio = new Audio("/audio/Chest Opening.mp3"); audio.volume = 0.55; void audio.play().catch(() => {}); } catch { /* Sound is optional. */ }
    setNotice("Master Potter's Glaze Kit: You received 2 portions of " + glaze.name + " glaze!");
  };
  const discoveredSpecials = new Set(finished.map(item => specialGlaze(item.glaze)?.name).filter(Boolean));
  const groupedFinished = Object.values(finished.reduce<Record<string, { item: FinishedPottery; count: number }>>((groups, item) => {
    const key = item.piece + "::" + item.glaze;
    if (!groups[key]) groups[key] = { item, count: 0 };
    groups[key].count += 1;
    if (item.collectedAt > groups[key].item.collectedAt) groups[key].item = item;
    return groups;
  }, {})).sort((a, b) => b.item.collectedAt - a.item.collectedAt);
  if (!hydrated) return <p>Loading pottery studio…</p>;
  return <section className="space-y-4 rounded-2xl bg-white/90 p-4 text-teal-950" aria-label="Pottery Studio">
    <p>Shape pottery, wait for it to dry, choose a glaze, then fire it in the kiln. Timers continue while this page is closed.</p>
    <p className="font-semibold">Pottery spaces: {active} of {slots} in use</p>
    <section aria-labelledby="pottery-mastery-heading" className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-3">
      <h3 id="pottery-mastery-heading" className="text-lg font-bold">Pottery mastery rewards</h3>
      <p className="text-sm">Finish each unique pottery shape once, with any glaze. Repeat pieces and glaze colors do not affect mastery progress. Your previous finished designs count.</p>
      {([{ label: "Coastal Clay Mastery", pieces: coastalPieces, unlocked: coastalDone, reward: "Third pottery space" }, { label: "Porcelain Clay Mastery", pieces: porcelainPieces, unlocked: porcelainDone, reward: "Fourth pottery space" }] as const).map(group => <div key={group.label} className="rounded-lg bg-white p-3">
        <h4 className="font-semibold">{group.label}: {group.pieces.filter(p => completedDesigns.has(p.id)).length}/{group.pieces.length}</h4>
        <p className="text-sm">{group.unlocked ? "Unlocked" : "Locked"} — Reward: {group.reward}</p>
        <ul className="mt-2 space-y-1 text-sm">{group.pieces.map(piece => <li key={piece.id}>{completedDesigns.has(piece.id) ? "✓ Completed: " : "Not yet completed: "}{piece.name}</li>)}</ul>
      </div>)}
      <p className="font-semibold">{coastalDone && porcelainDone ? "Artisan's Glaze Palette unlocked! Select an optional second glaze when finishing pottery. Each selected glaze uses one portion." : "Artisan's Glaze Palette: Complete both clay collections to unlock mixing two glazes."}</p>
    </section>
    <section aria-labelledby="artisan-discoveries-heading" className="rounded-xl border border-teal-200 bg-teal-50 p-3 space-y-2">
      <h3 id="artisan-discoveries-heading" className="text-lg font-bold">Artisan's Glaze Discoveries</h3>
      <p className="font-semibold">{discoveredSpecials.size} of {SPECIAL_GLAZES.length} specialty finishes discovered</p>
      {coastalDone && porcelainDone ? <p className="text-sm">Mix two glazes while finishing pottery. Collect the fired piece to record a discovery. Mixing order does not matter.</p> : <p className="text-sm">Complete Coastal and Porcelain Mastery to unlock the Artisan's Glaze Palette and discover these secret finishes.</p>}
      <ul className="space-y-2">{SPECIAL_GLAZES.map((special, index) => {
        const discovered = discoveredSpecials.has(special.name);
        return <li key={special.name} className="rounded-lg bg-white p-2 text-sm">
          <strong>{discovered ? "✓ " + special.name : "Undiscovered finish " + (index + 1)}</strong>
          {discovered && <p>{special.description} Ingredients: {special.colors.map(id => GLAZES.find(g => g.id === id)?.name || id).join(" + ")}.</p>}
        </li>;
      })}</ul>
      <div className="rounded-lg border border-amber-300 bg-white p-3 space-y-2">
        <h4 className="font-semibold">Master Potter's Glaze Kit</h4>
        <Image src="/images/Pottery/Master-pottery-kit.PNG" alt="Coastal wooden glaze kit with colorful glaze jars and brushes" width={240} height={200} unoptimized className="mx-auto max-h-48 w-auto object-contain" />
        <p className="text-sm">A collectible keepsake for discovering all eight specialty glazes. Claim it once and find it in your inventory.</p>
        {kitOwned ? <div className="space-y-2"><p className="font-semibold">✓ Reward claimed — Master Potter's Glaze Kit is unlocked.</p><p className="text-sm">Collect two portions of one random glaze each day.</p><button type="button" disabled={lastKitClaim === todayKey} onClick={collectDailyGlaze} className="rounded-lg bg-teal-700 px-4 py-3 text-white disabled:opacity-50">{lastKitClaim === todayKey ? "Today's glaze collected — return tomorrow" : "Collect Today's Glaze"}</button></div> : <button type="button" disabled={discoveredSpecials.size !== SPECIAL_GLAZES.length} onClick={() => { if (discoveredSpecials.size === SPECIAL_GLAZES.length && !state.crafted.includes("master-potters-glaze-kit") && craft("master-potters-glaze-kit", [])) setNotice("Master Potter's Glaze Kit claimed! Find your keepsake in inventory."); }} className="rounded-lg bg-teal-700 px-4 py-3 text-white disabled:opacity-50">{discoveredSpecials.size === SPECIAL_GLAZES.length ? "Claim Master Potter's Glaze Kit" : `Locked — ${discoveredSpecials.size}/8 glazes discovered`}</button>}
      </div>
      <p className="text-xs">Discovery progress is saved with this browser's pottery collection. The daily kit collection resets on the next local calendar day.</p>
    </section>
    <div className="grid gap-3 sm:grid-cols-2">{PIECES.map(piece => {
      const clayId = piece.clay === "coastal" ? "coastal-clay" : "white-porcelain-clay";
      const have = state.inventory[clayId] || 0;
      return <article key={piece.id} className="rounded-xl border border-teal-200 bg-teal-50 p-3">
        {ITEMS[piece.id]?.icon && !ITEMS[piece.id].isEmoji && <Image src={ITEMS[piece.id].icon} alt={piece.name} width={112} height={112} unoptimized className="mx-auto h-28 w-28 object-contain" />}
        <h3 className="font-bold">{piece.name}</h3>
        <p className="text-sm">{piece.clay === "coastal" ? "Coastal Clay" : "White Porcelain Clay"}: {have}/{piece.cost}</p>
        {piece.id === "porcelain-tea-set" && <p className="text-xs">{teaSetUnlocked ? "Unlocked through Kaiana’s ninth gift. Ready to shape." : `Locked: Give Kaiana nine gifts in the Cottage (${state.villagerGiftCounts.kaiana || 0}/9).`}</p>}
        <button type="button" disabled={active >= slots || have < piece.cost || (piece.id === "porcelain-tea-set" && !teaSetUnlocked)} onClick={() => begin(piece)} className="mt-2 min-h-11 rounded-lg bg-teal-800 px-4 py-2 text-white disabled:opacity-50">Shape {piece.name}</button>
      </article>;
    })}</div>
    <h3 className="text-lg font-bold">Drying shelf and kiln</h3>
    {jobs.length === 0 && <p>No pottery projects underway yet.</p>}
    {jobs.map(job => {
      const piece = PIECES.find(p => p.id === job.piece);
      const readyGlaze = job.stage === "ready-glaze" || (job.stage === "drying" && now >= job.readyAt);
      const readyCollect = job.stage === "ready" || (job.stage === "firing" && now >= job.readyAt);
      return <article key={job.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
        {potteryImage(job.piece, job.glaze) && !ITEMS[job.piece]?.isEmoji && <Image src={potteryImage(job.piece, job.glaze)} style={{ filter: potteryFilter(job.piece, job.glaze) }} alt="" width={88} height={88} unoptimized className="h-22 w-22 object-contain" />}
        <h4 className="font-bold">{piece?.name || job.piece}</h4>
        {job.glaze && <p className="text-sm">Applied glaze: {glazeName(job.glaze)}</p>}
        <p aria-live="off">{readyCollect ? "Ready to collect" : readyGlaze ? "Dry and ready for glazing" : job.stage === "drying" ? "Drying: " + duration(job.readyAt - now) : "Kiln firing: " + duration(job.readyAt - now)}</p>
        {readyGlaze && <div className="mt-2 space-y-2"><label className="block text-sm font-semibold" htmlFor={"glaze-"+job.id}>Choose glaze</label>
          <select id={"glaze-"+job.id} className="min-h-11 rounded-lg border p-2" value={glazeChoice[job.id] || GLAZES[0].id} onChange={e => setGlazeChoice(prev => ({...prev, [job.id]: e.target.value}))}>{GLAZES.map(g => <option key={g.id} value={g.id}>{g.name} ({state.inventory[g.id] || 0} available)</option>)}</select>
          {coastalDone && porcelainDone && <><label className="block text-sm font-semibold" htmlFor={"second-glaze-"+job.id}>Second glaze (optional — Artisan's Palette)</label><select id={"second-glaze-"+job.id} className="min-h-11 rounded-lg border p-2" value={secondGlazeChoice[job.id] || ""} onChange={e => setSecondGlazeChoice(prev => ({...prev, [job.id]: e.target.value}))}><option value="">No second glaze</option>{GLAZES.map(g => <option key={g.id} value={g.id}>{g.name} ({state.inventory[g.id] || 0} available)</option>)}</select><p className="text-xs">Mixing uses one portion of each glaze. Known specialty combinations are named when collected. Other mixes retain both color names. Mixed pieces currently use their base artwork and inventory item.</p></>}
          <button type="button" onClick={() => startFire(job)} className="ml-2 min-h-11 rounded-lg bg-teal-800 px-4 py-2 text-white">Glaze and fire</button></div>}
        {readyCollect && <button type="button" onClick={() => collect(job)} className="mt-2 min-h-11 rounded-lg bg-teal-800 px-4 py-2 text-white">Collect finished pottery</button>}
      </article>;
    })}
    <section aria-label="Finished pottery collection" className="space-y-2">
      <h3 className="text-lg font-bold">Finished pottery collection</h3>
      <p className="text-sm">Browse your finished pottery by shape and glaze. Matching pieces are grouped together with their quantities. Colored artwork is available for Seashell Cups and selected vases and bowls; other finishes use their base artwork until more designs are added.</p>
      {groupedFinished.length === 0 ? <p>No finished pieces recorded in this version yet. Your previously collected pottery remains in inventory.</p> :
        <div className="grid grid-cols-2 gap-3">{groupedFinished.map(({ item, count }) =>
          <article key={item.piece + "::" + item.glaze} className="rounded-xl border border-teal-200 p-2">
            <Image src={potteryImage(item.piece, item.glaze)} style={{ filter: potteryFilter(item.piece, item.glaze) }} alt="" width={100} height={100} unoptimized className="mx-auto h-24 w-24 object-contain"/>
            <p className="font-semibold">{PIECES.find(p => p.id === item.piece)?.name || item.piece}</p>
            <p className="text-sm">{glazeName(item.glaze)} glaze</p>
            <p className="text-sm font-semibold">Crafted: {count}</p>
          </article>)}</div>}
    </section>
    <p role="status" className="text-sm font-semibold">{notice}</p>
    <p className="text-xs text-teal-700">This first version stores pottery timers in this browser. Cross-device syncing and phone notifications are planned for a later phase.</p>
  </section>;
}
