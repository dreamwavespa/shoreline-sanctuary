"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { localDateKey } from "@/lib/customSandArt";

const KEY = "shoreline-twinkle-v1";
type Progress = { day: string; traded: boolean; visits: number; lastVisit: string; rewards: string[] };
const REWARDS = ["shell-cowrie", "shell-nautilus", "shell-abalone", "moonlit-sea-glass"];
function load(): Progress {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null") as Progress;
    if (v && typeof v.visits === "number" && Array.isArray(v.rewards)) return { ...v, day: localDateKey(), traded: v.day === localDateKey() ? v.traded : false };
  } catch {}
  return { day: localDateKey(), traded: false, visits: 0, lastVisit: "", rewards: [] };
}
export default function TwinkleCorner() {
  const { collectItem } = useGame();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => { setProgress(load()); }, []);
  const save = (next: Progress) => { localStorage.setItem(KEY, JSON.stringify(next)); setProgress(next); };
  if (!progress) return <p>Preparing Twinkle's shell collection...</p>;
  const visit = () => {
    if (progress.lastVisit === localDateKey()) return;
    save({ ...progress, visits: progress.visits + 1, lastVisit: localDateKey() });
    setMessage("Twinkle clicks his claws and shows you his latest shell. Your friendship grows!");
  };
  const swap = () => {
    if (progress.traded) return;
    const id = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    save({ ...progress, traded: true, rewards: [...progress.rewards, id] });
    collectItem(id);
    setMessage("Twinkle offers you " + ITEMS[id].name + "! It's been added to your inventory.");
  };
  return <section aria-labelledby="twinkle-heading" className="rounded-2xl bg-indigo-950 p-4 text-white ring-1 ring-amber-200/60">
    <h2 id="twinkle-heading" className="text-xl font-bold">🐚 Twinkle's Shell Nook</h2>
    <p className="mt-2 text-sm text-indigo-100">Boo's cheerful hermit crab friend collects unusual shells and dreams of decorating a cozy beach hut. Visit him and discover his daily shell surprise.</p>
    <p className="mt-2 font-semibold">Friendship visits: {progress.visits}</p>
    <button type="button" disabled={progress.lastVisit === localDateKey()} onClick={visit} className="mt-3 min-h-12 w-full rounded-xl bg-violet-700 px-3 py-3 font-semibold disabled:opacity-60">{progress.lastVisit === localDateKey() ? "Visited today" : "Spend Time with Twinkle"}</button>
    <button type="button" disabled={progress.traded} onClick={swap} className="mt-2 min-h-12 w-full rounded-xl bg-teal-700 px-3 py-3 font-semibold disabled:opacity-60">{progress.traded ? "Today's shell surprise collected" : "Explore Twinkle's Shell Surprise"}</button>
    <h3 className="mt-4 font-semibold">Twinkle's Finds</h3>
    <p className="text-sm text-indigo-100">Shell surprises received: {progress.rewards.length}</p>
    <p className="mt-2 text-xs text-indigo-200">Coming later: shell trading using inventory materials, furniture finds, and decorations for the beach hut.</p>
    <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 text-sm text-amber-100">{message}</p>
  </section>;
}
