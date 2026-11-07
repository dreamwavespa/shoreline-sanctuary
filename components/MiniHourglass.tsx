"use client";
import { playSandSound } from "@/lib/sandSounds";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";

function remainingTime(readyAt: number): string {
  const remaining = Math.max(0, Math.ceil((readyAt - Date.now()) / 1000));
  if (remaining === 0) return "Ready";
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return `${minutes} minutes and ${seconds} seconds remaining`;
}

export default function MiniHourglass({ readyAt, label }: { readyAt: number; label: string }) {
  const { state } = useGame();
  const [flipped, setFlipped] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const unlocked = state.crafted.includes("hourglass-restored");

  // Reset announcements when a new pottery or kitchen timer starts.
  useEffect(() => {
    setFlipped(false);
    setAnnouncement("");
  }, [readyAt]);

  if (!unlocked || readyAt <= 0) return null;

  return <div className="mt-3 rounded-xl bg-amber-50 p-3 text-amber-950 ring-1 ring-amber-300">
    <div className="flex items-center gap-3">
      <Image src="/images/Hourglass/hourglass-restored.png" alt="" width={70} height={90} unoptimized className={flipped ? "h-20 w-14 rotate-180 object-contain transition-transform" : "h-20 w-14 object-contain"} />
      <div>
        <p className="font-bold">Sands of Time — miniature hourglass</p>
        <p className="text-sm">{label}. The timer runs quietly. Check the time whenever you like.</p>
      </div>
    </div>
    <div className="mt-2 flex flex-wrap gap-2">
      <button type="button" onClick={() => setAnnouncement(`${label}: ${remainingTime(readyAt)}.`)} className="min-h-11 rounded-lg bg-teal-800 px-4 py-2 font-semibold text-white">Check time remaining</button>
      <button type="button" onClick={() => {
        setFlipped(value => !value);
        playSandSound("hourglass");
        setAnnouncement("Miniature hourglass flipped. The original timer continues.");
      }} className="min-h-11 rounded-lg bg-amber-800 px-4 py-2 font-semibold text-white">Flip miniature hourglass</button>
    </div>
    <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 text-sm">{announcement}</p>
  </div>;
}
