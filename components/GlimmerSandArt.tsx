"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { localDateKey } from "@/lib/customSandArt";

const KEY = "shoreline-glimmer-art-v1";
const patterns = [
  { name: "Crescent Moon", symbol: "☾" },
  { name: "Starfish", symbol: "★" },
  { name: "Seashell", symbol: "🐚" },
  { name: "Ocean Wave", symbol: "〰" },
] as const;
const colors = [
  { name: "Moonlight Blue", hex: "#7dd3fc" },
  { name: "Pearl White", hex: "#f8fafc" },
  { name: "Lavender Glow", hex: "#d8b4fe" },
  { name: "Seafoam Green", hex: "#99f6e4" },
] as const;
type Progress = { day: string; completed: boolean; friendship: number; designs: string[] };
const initial = (): Progress => ({ day: localDateKey(), completed: false, friendship: 0, designs: [] });
function load(): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null") as Progress;
    if (saved && typeof saved.friendship === "number" && Array.isArray(saved.designs)) {
      return { ...saved, day: localDateKey(), completed: saved.day === localDateKey() && !!saved.completed };
    }
  } catch {}
  return initial();
}
export default function GlimmerSandArt() {
  const { collectItem } = useGame();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [pattern, setPattern] = useState(0);
  const [color, setColor] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [message, setMessage] = useState("Choose a pattern and glowing color, then reveal the artwork.");
  const start = useRef<{x:number;y:number}|null>(null);
  const lastMove = useRef<{x:number;y:number}|null>(null);
  useEffect(() => { setProgress(load()); }, []);
  const addStroke = () => {
    if (progress?.completed) return;
    setStrokes(n => Math.min(8, n + 1));
  };
  const finish = () => {
    if (!progress || progress.completed || strokes < 8) return;
    const design = patterns[pattern].name + " in " + colors[color].name;
    const reward = progress.friendship % 4 === 3 ? "bioluminescent-shard" : "moonlit-sea-glass";
    const next: Progress = { day: localDateKey(), completed: true, friendship: progress.friendship + 1, designs: [...progress.designs, design] };
    localStorage.setItem(KEY, JSON.stringify(next));
    setProgress(next);
    collectItem(reward);
    setMessage("You finished " + design + "! Glimmer's friendship grew. " + ITEMS[reward].name + " was added to your inventory.");
  };
  if (!progress) return <p>Preparing Glimmer's sand art...</p>;
  const shade = colors[color].hex;
  return <section aria-labelledby="glimmer-art-heading" className="mt-4 space-y-4 rounded-2xl bg-indigo-950/80 p-4 text-white ring-1 ring-cyan-200/50">
    <h4 id="glimmer-art-heading" className="text-lg font-bold">Create Luminous Sand Art</h4>
    <p className="text-sm text-indigo-100">Choose a pattern and color. Swipe across the sand to reveal eight glowing strokes, or use the accessible Reveal Next Stroke button. Complete one design each night for a reward.</p>
    <label className="block font-semibold" htmlFor="glimmer-pattern">Sand pattern</label>
    <select id="glimmer-pattern" value={pattern} disabled={progress.completed} onChange={e => { setPattern(Number(e.target.value)); setStrokes(0); }} className="min-h-12 w-full rounded-lg bg-indigo-800 p-3 text-white">
      {patterns.map((p,i) => <option key={p.name} value={i}>{p.name}</option>)}
    </select>
    <label className="block font-semibold" htmlFor="glimmer-color">Glowing color</label>
    <select id="glimmer-color" value={color} disabled={progress.completed} onChange={e => { setColor(Number(e.target.value)); setStrokes(0); }} className="min-h-12 w-full rounded-lg bg-indigo-800 p-3 text-white">
      {colors.map((c,i) => <option key={c.name} value={i}>{c.name}</option>)}
    </select>
    <div role="img" aria-label={`${patterns[pattern].name} in ${colors[color].name}; ${strokes} of 8 glowing strokes revealed`}
      onPointerDown={e => { if (progress.completed) return; start.current = {x:e.clientX,y:e.clientY}; lastMove.current = start.current; e.currentTarget.setPointerCapture(e.pointerId); addStroke(); }}
      onPointerMove={e => { if (!start.current || !lastMove.current) return; const distance = Math.hypot(e.clientX-lastMove.current.x,e.clientY-lastMove.current.y); if(distance>24){lastMove.current={x:e.clientX,y:e.clientY};addStroke();} }}
      onPointerUp={() => {start.current=null;lastMove.current=null;}}
      onPointerCancel={() => {start.current=null;lastMove.current=null;}}
      className="relative flex h-52 select-none items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-200/60 bg-gradient-to-br from-amber-800 via-yellow-900 to-indigo-950"
      style={{touchAction:"none"}}>
      <span aria-hidden="true" className="text-8xl transition-opacity duration-300" style={{color:shade, opacity:0.08+0.115*strokes, textShadow:`0 0 ${strokes*4}px ${shade}`}}>{patterns[pattern].symbol}</span>
      <span aria-hidden="true" className="absolute bottom-2 rounded-full bg-indigo-950/80 px-3 py-1 text-xs">Glowing sand canvas</span>
    </div>
    <p role="status" aria-live="polite">Strokes revealed: {strokes} of 8. {progress.completed ? "Today's artwork completed." : ""}</p>
    <button type="button" disabled={progress.completed || strokes >= 8} onClick={addStroke} className="min-h-12 w-full rounded-xl bg-violet-700 p-3 font-semibold disabled:opacity-50">Reveal Next Stroke</button>
    <button type="button" disabled={progress.completed || strokes < 8} onClick={finish} className="min-h-12 w-full rounded-xl bg-teal-700 p-3 font-semibold disabled:opacity-50">Finish Sand Painting and Collect Reward</button>
    <p role="status" aria-live="polite" className="text-sm text-amber-100">{message}</p>
    <p className="text-sm">Friendship: {progress.friendship} · Paintings completed: {progress.designs.length}</p>
    <p className="text-xs text-indigo-200">Every fourth completed painting earns a Bioluminescent Shard; other paintings earn Moonlit Sea Glass.</p>
  </section>;
}
