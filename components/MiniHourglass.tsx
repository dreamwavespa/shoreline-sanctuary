"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";

export default function MiniHourglass({ readyAt, label }: { readyAt: number; label: string }) {
  const { state } = useGame();
  const [now, setNow] = useState(() => Date.now());
  const [flipped, setFlipped] = useState(false);
  const unlocked = state.crafted.includes("hourglass-restored");
  useEffect(() => {
    if (!unlocked || readyAt <= 0) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [readyAt, unlocked]);
  useEffect(() => { setFlipped(false); }, [readyAt]);
  if (!unlocked || readyAt <= 0) return null;
  const remaining = Math.max(0, Math.ceil((readyAt - now) / 1000));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeText = remaining ? `${minutes} minutes and ${seconds} seconds remaining` : "Ready";
  return <div className="mt-3 rounded-xl bg-amber-50 p-3 text-amber-950 ring-1 ring-amber-300">
    <div className="flex items-center gap-3">
      <Image src="/images/Hourglass/hourglass-restored.png" alt="" width={70} height={90} unoptimized className={flipped && remaining > 0 ? "h-20 w-14 rotate-180 object-contain transition-transform" : "h-20 w-14 object-contain"} />
      <div><p className="font-bold">Sands of Time — miniature hourglass</p><p aria-live="off">{label}: {timeText}.</p></div>
    </div>
    <button type="button" onClick={() => setFlipped(value => !value)} className="mt-2 min-h-11 rounded-lg bg-teal-800 px-4 py-2 font-semibold text-white">Flip miniature hourglass</button>
    <p role="status" aria-live="polite" className="mt-2 text-sm">{flipped ? `Hourglass flipped. ${label}: ${timeText}.` : "The miniature hourglass follows the existing timer."}</p>
  </div>;
}
