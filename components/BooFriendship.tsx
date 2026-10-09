"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import { localDateKey } from "@/lib/customSandArt";

const KEY = "shoreline-boo-friendship-v1";
type Progress = { points: number; lastVisit: string; activityDays: Record<string, string> };
const fresh = (): Progress => ({ points: 0, lastVisit: "", activityDays: {} });
function load(): Progress {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    if (data && typeof data.points === "number" && typeof data.lastVisit === "string" && data.activityDays && typeof data.activityDays === "object") return data;
  } catch {}
  return fresh();
}
export function recordBooActivity(kind: "digging" | "scavenger") {
  const data = load();
  const today = localDateKey();
  if (data.activityDays[kind] === today) return;
  const next = { ...data, points: data.points + 1, activityDays: { ...data.activityDays, [kind]: today } };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("boo-friendship-updated"));
}
const LEVELS = [0, 3, 7, 13, 21];
const NAMES = ["New Acquaintance", "Sandbar Friend", "Trusted Treasure Hunter", "Keeper of Secrets", "Boo's Best Friend"];
export default function BooFriendship() {
  const { state } = useGame();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [message, setMessage] = useState("");
  const giftCount = state.villagerGiftCounts.boo || 0;
  useEffect(() => {
    setProgress(load());
    const update = () => setProgress(load());
    window.addEventListener("boo-friendship-updated", update);
    return () => window.removeEventListener("boo-friendship-updated", update);
  }, []);
  const save = (next: Progress) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setProgress(next);
  };
  if (!progress) return <section aria-label="Boo friendship">Loading friendship...</section>;
  const total = progress.points + giftCount;
  const level = LEVELS.reduce((value, threshold, i) => total >= threshold ? i : value, 0);
  const next = LEVELS[level + 1];
  const visited = progress.lastVisit === localDateKey();
  const visit = () => {
    if (visited) return;
    save({ ...progress, points: progress.points + 1, lastVisit: localDateKey() });
    setMessage("Boo clicks his claws happily and shares a moonlit moment with you. Friendship increased!");
  };
  return (
    <section aria-labelledby="boo-friendship-heading" className="rounded-xl bg-violet-900/70 p-4 ring-1 ring-violet-300/40">
      <h3 id="boo-friendship-heading" className="text-lg font-bold">Friendship with Boo</h3>
      <p className="mt-1 text-sm text-violet-100">Visit Boo, give him loved gifts, and complete his treasure activities to grow your friendship. Progress carries over between days.</p>
      <p className="mt-2 font-semibold">Level {level + 1} of 5 · {NAMES[level]}</p>
      <p className="text-sm">{total} friendship points{next !== undefined ? " · Next level at " + next : " · Maximum level reached"}</p>
      <div role="progressbar" aria-label="Boo friendship progress" aria-valuemin={0} aria-valuemax={21} aria-valuenow={Math.min(total,21)} className="mt-2 h-3 overflow-hidden rounded-full bg-violet-950"><div className="h-full bg-amber-300" style={{width:Math.min(100,total/21*100)+"%"}} /></div>
      <button type="button" disabled={visited} onClick={visit} className="mt-3 min-h-12 w-full rounded-xl bg-violet-600 px-3 py-3 font-semibold text-white disabled:bg-violet-800 disabled:text-violet-200 focus:ring-4 focus:ring-amber-300">{visited ? "Today's visit recorded" : "Spend a Moment with Boo"}</button>
      <p className="mt-2 text-sm text-violet-100">{level >= 2 ? "Boo trusts you with a secret: Luna the Moon Snail sometimes leaves a silver trail after dark. Follow her silver trail in the Treasure Corner to meet her." : "At friendship level 3, Boo will tell you about Luna the Moon Snail."}</p>
      <p className="mt-1 text-xs text-violet-200">Loved gifts already given: {giftCount}. Digging and scavenger hunt completions count once per day each.</p>
      <p role="status" aria-live="polite" className="mt-2 text-sm text-amber-100">{message}</p>
    </section>
  );
}
