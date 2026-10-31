"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import { localDateKey } from "@/lib/customSandArt";

type LunaState = { day: string; polished: number; friendship: number; lastVisit: string; shelf: number; selected: number; strokes: number; polishRecipeClaimed?: boolean };
const KEY = "shoreline-luna-polishing-v1";
const SHELLS = ["Pearl Spiral", "Silver Ripple", "Starlight Scallop"];
const ICONS = ["🐚", "🪸", "✨"];
const fresh = (): LunaState => ({ day: localDateKey(), polished: 0, friendship: 0, lastVisit: "", shelf: 0, selected: 0, strokes: 0 });
function load(): LunaState {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null") as LunaState;
    if (v && typeof v.friendship === "number" && typeof v.shelf === "number") {
      return { ...v, day: localDateKey(), polished: v.day === localDateKey() ? (v.polished || 0) : 0, strokes: v.day === localDateKey() ? (v.strokes || 0) : 0, selected: v.day === localDateKey() ? (v.selected || 0) : 0 };
    }
  } catch {}
  return fresh();
}
function isFullMoon(date: Date) {
  // Approximate lunar cycle; use the same local date throughout the activity.
  const lunarDays = 29.530588853;
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const age = ((date.getTime() - knownNewMoon) / 86400000 % lunarDays + lunarDays) % lunarDays;
  return Math.abs(age - lunarDays / 2) <= 0.8;
}
export default function LunaPolishing() {
  const { collectItem } = useGame();
  const [data, setData] = useState<LunaState | null>(null);
  const [message, setMessage] = useState("Luna has three shells ready for polishing.");
  const hold = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX = useRef<number | null>(null);
  const dataRef = useRef<LunaState | null>(null);
  const fullMoon = isFullMoon(new Date());
  useEffect(() => {
    const saved = load(); dataRef.current = saved; setData(saved);
    return () => { if (hold.current) clearInterval(hold.current); };
  }, []);
  const save = (next: LunaState) => {
    dataRef.current = next; setData(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };
  const visit = () => {
    const d = dataRef.current;
    if (!d || d.lastVisit === localDateKey()) return;
    save({ ...d, lastVisit: localDateKey(), friendship: d.friendship + 1 });
    setMessage("Luna greets you with a gentle shimmer. Your friendship grows.");
  };
  const polish = () => {
    const d = dataRef.current;
    if (!d || d.polished >= 3) return;
    const strokes = d.strokes + 1;
    if (strokes < 4) {
      save({ ...d, strokes });
      setMessage(SHELLS[d.selected] + ": polishing stroke " + strokes + " of 4.");
      return;
    }
    const completed = d.polished + 1;
    const wax = completed === 3 || Math.random() < 0.25;
    const fullMoonWax = fullMoon && completed === 3;
    if (wax) collectItem("glowing-wax");
    if (fullMoonWax) collectItem("glowing-wax");
    if (fullMoon && completed === 3) collectItem("shell-opal-rare");
    const firstPolishGift = !d.polishRecipeClaimed && d.shelf + 1 >= 3;
    if (firstPolishGift) {
      collectItem("moonlit-artisan-polish-recipe");
      for (let i = 0; i < 3; i++) collectItem("moonlit-artisan-polish", { silent: true });
    }
    save({ ...d, strokes: 0, polished: completed, selected: completed % 3, shelf: d.shelf + 1, friendship: d.friendship + 1, polishRecipeClaimed: d.polishRecipeClaimed || firstPolishGift });
    setMessage("You polished " + SHELLS[d.selected] + ". Luna adds it to her display shelf." + (wax ? " She shares one Glowing Wax." : "") + (fullMoonWax ? " Full moon bonus: another Glowing Wax and a Rare Opal Shell!" : "") + (completed === 3 ? " All three shells are polished for tonight." : "") + (firstPolishGift ? " Luna gifts you a jar of Moonlit Artisan Polish with three uses and teaches you the recipe in Decorative Crafts!" : ""));
  };
  const stop = () => { if (hold.current) clearInterval(hold.current); hold.current = null; touchX.current = null; };
  const begin = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    touchX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
    polish();
    hold.current = setInterval(polish, 650);
  };
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (touchX.current === null) return;
    if (Math.abs(event.clientX - touchX.current) >= 28) {
      touchX.current = event.clientX;
      polish();
    }
  };
  if (!data) return <section aria-label="Luna's shell polishing">Preparing Luna's shells...</section>;
  const done = data.polished >= 3;
  return (
    <section aria-labelledby="luna-polish-heading" className="rounded-xl bg-indigo-950/80 p-4 text-white ring-1 ring-cyan-300/50">
      <h3 id="luna-polish-heading" className="text-lg font-bold">Luna's Moonlight Shell Polishing</h3>
      <p className="mt-1 text-sm text-cyan-100">Luna uses luminous wax to make her shells shine. Polish three shells each night. The third always earns Glowing Wax. After three total shells, Luna shares her artisan polish recipe and a starter jar.</p>
      {fullMoon && <p className="mt-2 rounded-lg bg-sky-700 p-2 font-semibold">🌕 Full Moon Night! Finish all three shells for extra Glowing Wax and a Rare Opal Shell.</p>}
      <p className="mt-2 font-semibold">Friendship: {data.friendship} · Shells polished tonight: {data.polished}/3</p>
      <button type="button" disabled={data.lastVisit === localDateKey()} onClick={visit} className="mt-2 min-h-12 w-full rounded-lg bg-violet-700 px-3 py-2 font-bold disabled:opacity-60">{data.lastVisit === localDateKey() ? "Tonight's visit recorded" : "Spend a Quiet Moment with Luna"}</button>
      <div className="mt-3 rounded-xl bg-sky-900 p-3">
        <p className="font-semibold">{done ? "All shells polished!" : SHELLS[data.selected]}</p>
        <div aria-hidden="true" onPointerDown={begin} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} className="relative my-2 flex h-36 touch-none select-none items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-400 via-sky-300 to-indigo-400 text-6xl">
          <span style={{filter:"brightness(" + (0.55 + data.strokes * 0.15) + ")"}}>{done ? "✨" : ICONS[data.selected]}</span>
          {!done && <span className="pointer-events-none absolute bottom-2 rounded-lg bg-slate-950/80 px-3 py-1 text-sm">Swipe or hold to polish · {data.strokes}/4</span>}
        </div>
        {!done && <button type="button" onClick={polish} className="min-h-12 w-full rounded-lg bg-cyan-700 px-3 py-3 font-bold focus:ring-4 focus:ring-amber-300" aria-label={"Polish " + SHELLS[data.selected] + ", stroke " + data.strokes + " of 4"}>Polish Shell</button>}
      </div>
      <p className="mt-3 font-semibold">Luna's Polishing Shelf</p>
      <p className="text-sm text-cyan-100">Total shells polished together: {data.shelf}. Luna keeps the restored shells on her shelf.</p>
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 text-sm text-amber-100">{message}</p>
    </section>
  );
}
