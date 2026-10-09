"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { localDateKey } from "@/lib/customSandArt";

type Patch = { depth: number; reward: string[]; claimed: boolean };
const STORAGE = "shoreline-boo-dig-v1";
const REWARDS = ["moonwashed-shell", "moonlit-sea-glass", "milky-moonstone-pebbles", "glowing-sand-dollar", "tideglow-pebble"];
const newPatches = (): Patch[] => Array.from({ length: 3 }, () => ({ depth: 0, reward: [], claimed: false }));
function readPatches(): Patch[] {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE) || "null");
    if (data?.day === localDateKey() && Array.isArray(data.patches) && data.patches.length === 3 &&
        data.patches.every((p: Patch) => Number.isInteger(p.depth) && p.depth >= 0 && p.depth <= 4 && Array.isArray(p.reward) && typeof p.claimed === "boolean")) return data.patches;
  } catch {}
  return newPatches();
}
export default function BooDiggingGame() {
  const { collectItem } = useGame();
  const [patches, setPatches] = useState<Patch[]>(newPatches);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Choose one of the three sandy patches.");
  const patchesRef = useRef<Patch[]>(newPatches());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSwipe = useRef(0);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const loaded = readPatches();
    patchesRef.current = loaded;
    setPatches(loaded);
    setReady(true);
    return () => { if (holdRef.current) clearInterval(holdRef.current); audioRef.current?.pause(); };
  }, []);
  const play = (file: string) => {
    try {
      audioRef.current?.pause();
      const audio = new Audio("/audio/boo-" + file + ".mp3");
      audio.volume = 0.4;
      audioRef.current = audio;
      void audio.play().catch(() => {});
    } catch {}
  };
  const save = (updated: Patch[]) => {
    patchesRef.current = updated;
    setPatches(updated);
    localStorage.setItem(STORAGE, JSON.stringify({ day: localDateKey(), patches: updated }));
  };
  const dig = (index: number) => {
    if (!ready) return;
    const current = patchesRef.current;
    const patch = current[index];
    if (!patch || patch.depth >= 4 || patch.claimed) return;
    const depth = patch.depth + 1;
    const chest = depth === 4 && Math.random() < 0.22;
    const reward = depth === 4
      ? Array.from({ length: chest ? 3 : 1 }, () => REWARDS[Math.floor(Math.random() * REWARDS.length)])
      : [];
    save(current.map((p, i) => i === index ? { ...p, depth, reward } : p));
    play(depth === 4 ? "discovery" : depth === 1 ? "shovel" : depth === 3 ? "wet-sand" : "sand-brush");
    setMessage(depth === 4 ? (chest ? "You uncovered a treasure chest with three surprises! Open it to collect them." : "You uncovered a treasure! Collect your find.") : "Patch " + (index + 1) + ": " + depth + " of 4 layers cleared.");
  };
  const claim = (index: number) => {
    const current = patchesRef.current;
    const patch = current[index];
    if (!patch || patch.claimed || patch.depth !== 4 || !patch.reward.length) return;
    save(current.map((p, i) => i === index ? { ...p, claimed: true } : p));
    patch.reward.forEach(id => collectItem(id));
    setMessage("Added to inventory: " + patch.reward.map(id => ITEMS[id].name).join(", ") + ".");
  };
  const stop = () => { if (holdRef.current) clearInterval(holdRef.current); holdRef.current = null; };
  const start = (index: number) => {
    stop();
    holdRef.current = setInterval(() => dig(index), 650);
  };
  const beginSand = (index: number, event: React.PointerEvent<HTMLDivElement>) => {
    if (!ready || patchesRef.current[index]?.depth === 4) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    start(index);
  };
  const moveSand = (index: number, event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current) return;
    const distance = Math.hypot(event.clientX - pointerStart.current.x, event.clientY - pointerStart.current.y);
    if (distance < 24) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    const now = Date.now();
    if (now - lastSwipe.current >= 350) { lastSwipe.current = now; dig(index); }
  };
  const endSand = () => { pointerStart.current = null; stop(); };
  return (
    <section aria-labelledby="boo-dig-heading" className="rounded-xl bg-indigo-950/80 p-3 ring-1 ring-indigo-300/40">
      <h3 id="boo-dig-heading" className="text-lg font-bold">Boo's Buried Treasure</h3>
      <p className="mt-1 text-sm text-indigo-100">Dig at all three spots each day. Swipe or hold directly on the sand, or activate its button four times with Enter or Space. No timer.</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {patches.map((patch, index) => (
          <div key={index} className="rounded-xl bg-amber-100 p-3 text-amber-950">
            <p className="font-semibold">Sand patch {index + 1}</p>
            <div aria-hidden="true" onPointerDown={event => beginSand(index, event)} onPointerMove={event => moveSand(index, event)} onPointerUp={endSand} onPointerCancel={endSand} onLostPointerCapture={endSand} className="relative my-2 h-36 overflow-hidden rounded-xl bg-amber-900 shadow-inner touch-none select-none cursor-grab"><div className="absolute inset-0 flex items-center justify-center text-5xl">{patch.depth === 4 ? (patch.reward.length > 1 ? "🧰" : "✨") : index === 0 ? "🐚" : index === 1 ? "💎" : "🪙"}</div><div className="absolute inset-0 transition-all duration-500" style={{background:"repeating-radial-gradient(circle at 40% 50%,#f5d9a1 0px,#dfb577 12px,#ebc88b 25px)",clipPath:patch.depth===0?"inset(0)":patch.depth===1?"polygon(0 0,100% 0,100% 100%,0 100%,0 70%,30% 55%,55% 60%,75% 78%,0 85%)":patch.depth===2?"polygon(0 0,100% 0,100% 100%,85% 100%,70% 65%,80% 30%,55% 20%,25% 50%,0 75%)":patch.depth===3?"polygon(0 0,100% 0,100% 22%,78% 10%,55% 32%,25% 15%,0 28%)":"inset(0 0 100% 0)"}}/><span className="absolute bottom-2 left-2 right-2 rounded-lg bg-amber-50/90 p-1 text-center text-xs font-bold">{patch.depth===4?"Treasure uncovered":patch.depth+" of 4 layers brushed away"}</span></div>
            <p className="text-sm">{patch.claimed ? "Collected today" : patch.depth === 4 ? (patch.reward.length > 1 ? "Treasure chest found!" : "Treasure found!") : patch.depth + " of 4 layers cleared"}</p>
            {patch.depth < 4 ? (
              <button type="button" disabled={!ready}
                onClick={() => dig(index)}
                aria-label={"Dig sand patch " + (index + 1) + ", " + patch.depth + " of 4 layers cleared"}
                className="mt-2 min-h-12 w-full touch-none rounded-lg bg-teal-800 px-2 py-3 font-semibold text-white focus:outline-none focus:ring-4 focus:ring-indigo-500 disabled:opacity-50">
                Brush away sand
              </button>
            ) : (
              <button type="button" disabled={patch.claimed} onClick={() => claim(index)} className="mt-2 min-h-12 w-full rounded-lg bg-teal-800 px-2 py-3 font-semibold text-white disabled:bg-slate-500">
                {patch.claimed ? "Treasure collected" : "Open and collect treasure"}
              </button>
            )}
          </div>
        ))}
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 text-sm text-amber-100">{message}</p>
      <p className="mt-2 text-xs text-indigo-200">The patches refresh each local day. Finds are added to your existing inventory.</p>
    </section>
  );
}
