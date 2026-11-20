"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import Image from "next/image";
import { ITEMS } from "@/lib/items";
import { DOCK_FISH, type DockCatch, type DockFish } from "@/lib/offshore";

type FishingPhase = "ready" | "waiting" | "bite" | "reeling";

const fishPositions: Record<DockFish, string> = {
  "Silver Mullet": "0% 0%",
  "Striped Porgy": "100% 0%",
  "Moonlit Silverside": "0% 100%",
  "Lantern Goby": "100% 100%",
};

function FishSprite({ fish, className }: { fish: string; className: string }) {
  const position = fishPositions[fish as DockFish];
  if (!position) return null;
  return <span aria-hidden="true" className={`block aspect-square shrink-0 bg-no-repeat ${className}`}
    style={{ backgroundImage: "url('/images/Cove/dockside-fish.webp')", backgroundSize: "200% 200%", backgroundPosition: position }} />;
}

export default function DocksideFishing({ night }: { night: boolean }) {
  const { state, reelDockCatch, play } = useGame();
  const [catchArt, setCatchArt] = useState<DockCatch>();
  const [phase, setPhase] = useState<FishingPhase>("ready");
  const [message, setMessage] = useState("Cast a line from the pier.");
  const timer = useRef<number | null>(null);
  const log = state.offshore.dockFishLog ?? [];

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const fish = () => {
    if (timer.current !== null) return;
    if (phase === "ready") {
      setCatchArt(undefined);
      setPhase("waiting");
      setMessage("Line cast. Wait for a bite.");
      timer.current = window.setTimeout(() => {
        timer.current = null;
        setPhase("bite");
        setMessage("You got a bite! Reel in whenever you’re ready.");
        play("oceanWaterSplash", 0.45);
      }, 2000 + Math.random() * 2200);
    } else if (phase === "bite") {
      setPhase("reeling");
      setMessage("Reeling in…");
      play("dockFishingReel");
      timer.current = window.setTimeout(() => {
        timer.current = null;
        const result = reelDockCatch(night);
        setCatchArt(result.dockCatch);
        setMessage(result.message);
        setPhase("ready");
      }, 2700);
    }
  };

  const labels: Record<FishingPhase, string> = {
    ready: "Cast Line",
    waiting: "Waiting for a bite",
    bite: "Reel In",
    reeling: "Reeling in",
  };

  return <section className="space-y-4 rounded-2xl bg-white p-4 shadow">
    <div aria-hidden="true" className="relative aspect-[3/2] overflow-hidden rounded-xl bg-cyan-950">
      <Image src="/images/Cove/dockside-fishing.webp" alt="" fill sizes="(max-width: 780px) 100vw, 720px"
        className={`object-cover ${night ? "brightness-[.55] saturate-[.85]" : ""}`} />
      {night && <div className="absolute inset-0 bg-indigo-900/35" />}
      {phase !== "ready" && <div className="absolute inset-0">
        <div className={`absolute top-[62%] -translate-x-1/2 -translate-y-1/2 motion-safe:transition-[left,top] motion-safe:duration-[2600ms] ${phase === "reeling" ? "!left-[77%] !top-[70%]" : "left-[49%]"}`}>
          <div className={`absolute inset-[-9px] rounded-[50%] border-2 border-white/80 ${phase === "bite" ? "motion-safe:animate-ping" : ""}`} />
          <div className={`relative h-5 w-5 rounded-full border-2 border-white bg-gradient-to-b from-white from-50% to-rose-700 to-50% shadow ${phase === "bite" ? "motion-safe:animate-bounce" : ""}`} />
        </div>
      </div>}
      {catchArt && "fish" in catchArt && <FishSprite fish={catchArt.fish} className="dock-fish-release absolute left-[58%] top-[54%] w-[23%]" />}
    </div>
    <style>{`
      @keyframes dock-fish-release {
        0% { transform: translate(0, -34%) rotate(-8deg); opacity: 1; }
        30% { transform: translate(-35%, -42%) rotate(5deg); opacity: 1; }
        100% { transform: translate(-180%, 34%); opacity: 0; }
      }
      .dock-fish-release { display: none; }
      @media (prefers-reduced-motion: no-preference) {
        .dock-fish-release { display: block; animation: dock-fish-release 1.8s ease-out forwards; }
      }
    `}</style>
    {catchArt && <div aria-hidden="true" className="flex items-center gap-3 rounded-xl bg-teal-50 px-3 text-sm font-semibold text-teal-950">
      {"fish" in catchArt ? <><FishSprite fish={catchArt.fish} className="w-24" />{catchArt.fish}</> :
        <><Image src={ITEMS[catchArt.treasure].icon} alt="" width={72} height={72} className="h-18 w-18 object-contain" />{ITEMS[catchArt.treasure].name}</>}
    </div>}
    <p role="status" aria-live="polite" aria-atomic="true" className="min-h-12 text-teal-950">{message}</p>
    <button type="button" onClick={fish} aria-disabled={phase === "waiting" || phase === "reeling"}
      className="min-h-12 w-full rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white aria-disabled:bg-slate-200 aria-disabled:text-slate-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-500">
      {labels[phase]}
    </button>
    <h4 className="font-semibold text-teal-950">Fishing log ({log.length} of {DOCK_FISH.day.length + DOCK_FISH.night.length})</h4>
    {log.length > 0 ? <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">{log.map(name => <li key={name} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2"><FishSprite fish={name} className="w-16" /><span>{name}</span></li>)}</ul> : <p>Your first catch will appear here.</p>}
  </section>;
}
