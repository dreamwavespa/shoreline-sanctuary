"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";

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
const GLAZES = [{ id: "clear-pottery-glaze", name: "Clear" }, { id: "pearl-pottery-glaze", name: "Pearl" }, { id: "iridescent-pottery-glaze", name: "Iridescent" }, { id: "orange-glaze", name: "Orange" }];
const STORAGE = "shoreline-pottery-v1";
const MINUTE = 60000;
function duration(ms: number) { const n = Math.max(0, Math.ceil(ms / MINUTE)); return n ? n + " min remaining" : "Ready"; }
export default function PotteryStudio() {
  const { state, craft, hasEnough } = useGame();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [glazeChoice, setGlazeChoice] = useState<Record<string,string>>({});
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem(STORAGE) || "{}"); if (Array.isArray(saved.jobs)) setJobs(saved.jobs); if (Array.isArray(saved.completed)) setCompleted(saved.completed); } catch {}
    setHydrated(true);
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(STORAGE, JSON.stringify({ jobs, completed })); }, [jobs, completed, hydrated]);
  const coastalDone = PIECES.filter(p => p.clay === "coastal").every(p => completed.includes(p.id));
  const porcelainDone = PIECES.filter(p => p.clay === "porcelain").every(p => completed.includes(p.id));
  const slots = 2 + Number(coastalDone) + Number(porcelainDone);
  const active = jobs.filter(j => j.stage !== "ready").length;
  const begin = (piece: typeof PIECES[number]) => {
    if (active >= slots) return;
    const material = piece.clay === "coastal" ? "coastal-clay" : "white-porcelain-clay";
    if (!hasEnough([{itemId: material, count: piece.cost}])) { setNotice("Not enough clay."); return; }
    if (!craft("pottery-shaped-workpiece", [{itemId: material, count: piece.cost}])) return;
    setJobs(prev => [...prev, { id: Date.now().toString() + "-" + prev.length, piece: piece.id, clay: piece.clay, stage: "drying", readyAt: Date.now() + 10 * MINUTE }]);
    setNotice(piece.name + " is drying.");
  };
  const startFire = (job: Job) => {
    if (job.stage !== "ready-glaze" && !(job.stage === "drying" && now >= job.readyAt)) return;
    const glaze = glazeChoice[job.id] || GLAZES[0].id;
    if (!hasEnough([{itemId: glaze, count: 1}])) { setNotice("Not enough glaze."); return; }
    if (!craft("pottery-glaze-applied", [{itemId: glaze, count: 1}])) return;
    setJobs(prev => prev.map(j => j.id === job.id ? {...j, stage: "firing", readyAt: Date.now() + 15 * MINUTE, glaze} : j));
    setNotice("Glazed pottery is firing in the kiln.");
  };
  const collect = (job: Job) => {
    if (job.stage !== "ready" && !(job.stage === "firing" && now >= job.readyAt)) return;
    // Only register a finished item if the catalog defines it.
    if (!craft(job.piece, [])) return;
    setCompleted(prev => prev.includes(job.piece) ? prev : [...prev, job.piece]);
    setJobs(prev => prev.filter(j => j.id !== job.id));
    setNotice("Finished " + (PIECES.find(p => p.id === job.piece)?.name || "pottery") + " collected.");
  };
  if (!hydrated) return <p>Loading pottery studio…</p>;
  return <section className="space-y-4 rounded-2xl bg-white/90 p-4 text-teal-950" aria-label="Pottery Studio">
    <p>Shape pottery, wait for it to dry, choose a glaze, then fire it in the kiln. Timers continue while this page is closed.</p>
    <p className="font-semibold">Pottery spaces: {active} of {slots} in use</p>
    <p className="text-sm">Coastal collection: {PIECES.filter(p => p.clay === "coastal" && completed.includes(p.id)).length}/4. Porcelain collection: {PIECES.filter(p => p.clay === "porcelain" && completed.includes(p.id)).length}/4.</p>
    {coastalDone && <p>Coastal Clay Mastery: third space unlocked!</p>}
    {porcelainDone && <p>Porcelain Mastery: fourth space unlocked!</p>}
    {coastalDone && porcelainDone && <p>Artisan's Glaze Palette earned! Glaze mixing will be added in the next phase.</p>}
    <div className="grid gap-3 sm:grid-cols-2">{PIECES.map(piece => {
      const clayId = piece.clay === "coastal" ? "coastal-clay" : "white-porcelain-clay";
      const have = state.inventory[clayId] || 0;
      return <article key={piece.id} className="rounded-xl border border-teal-200 bg-teal-50 p-3">
        <h3 className="font-bold">{piece.name}</h3>
        <p className="text-sm">{piece.clay === "coastal" ? "Coastal Clay" : "White Porcelain Clay"}: {have}/{piece.cost}</p>
        {piece.id === "porcelain-tea-set" && <p className="text-xs">Tea set shaping will unlock after its existing cottage prerequisite is connected.</p>}
        <button type="button" disabled={active >= slots || have < piece.cost || piece.id === "porcelain-tea-set"} onClick={() => begin(piece)} className="mt-2 min-h-11 rounded-lg bg-teal-800 px-4 py-2 text-white disabled:opacity-50">Shape {piece.name}</button>
      </article>;
    })}</div>
    <h3 className="text-lg font-bold">Drying shelf and kiln</h3>
    {jobs.length === 0 && <p>No pottery projects underway yet.</p>}
    {jobs.map(job => {
      const piece = PIECES.find(p => p.id === job.piece);
      const readyGlaze = job.stage === "ready-glaze" || (job.stage === "drying" && now >= job.readyAt);
      const readyCollect = job.stage === "ready" || (job.stage === "firing" && now >= job.readyAt);
      return <article key={job.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
        <h4 className="font-bold">{piece?.name || job.piece}</h4>
        <p aria-live="off">{readyCollect ? "Ready to collect" : readyGlaze ? "Dry and ready for glazing" : job.stage === "drying" ? "Drying: " + duration(job.readyAt - now) : "Kiln firing: " + duration(job.readyAt - now)}</p>
        {readyGlaze && <div className="mt-2 space-y-2"><label className="block text-sm font-semibold" htmlFor={"glaze-"+job.id}>Choose glaze</label>
          <select id={"glaze-"+job.id} className="min-h-11 rounded-lg border p-2" value={glazeChoice[job.id] || GLAZES[0].id} onChange={e => setGlazeChoice(prev => ({...prev, [job.id]: e.target.value}))}>{GLAZES.map(g => <option key={g.id} value={g.id}>{g.name} ({state.inventory[g.id] || 0} available)</option>)}</select>
          <button type="button" onClick={() => startFire(job)} className="ml-2 min-h-11 rounded-lg bg-teal-800 px-4 py-2 text-white">Glaze and fire</button></div>}
        {readyCollect && <button type="button" onClick={() => collect(job)} className="mt-2 min-h-11 rounded-lg bg-teal-800 px-4 py-2 text-white">Collect finished pottery</button>}
      </article>;
    })}
    <p role="status" className="text-sm font-semibold">{notice}</p>
    <p className="text-xs text-teal-700">This first version stores pottery timers in this browser. Cross-device syncing and phone notifications are planned for a later phase.</p>
  </section>;
}
