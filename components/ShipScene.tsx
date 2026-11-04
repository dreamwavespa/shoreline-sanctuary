"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { SCENES } from "@/lib/media";
import ListenToShell from "./ListenToShell";
import OlliRingToss from "./OlliRingToss";
import SmoothieBar from "./SmoothieBar";

const NOTES: { label: string; freq: number }[] = [
  { label: "C", freq: 261.63 }, { label: "D", freq: 293.66 }, { label: "E", freq: 329.63 },
  { label: "F", freq: 349.23 }, { label: "G", freq: 392.0 }, { label: "A", freq: 440.0 }, { label: "B", freq: 493.88 },
];

function SaltyCard() {
  const { state, throwBallToSalty } = useGame();
  const balls = state.inventory["beach-ball"] || 0;
  return <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-sky-200">
    <div className="flex items-center gap-3 mb-3"><div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden"><Image src={SCENES.sealPontoon} alt="Salty the Harbor Seal" fill unoptimized className="object-cover" /></div><div><h2 className="text-lg font-bold text-sky-900">Salty & The Harbor Seals</h2><p className="text-sm text-sky-700">Streak: {state.saltyStreak} · Total catches: {state.saltyTotalCatches}</p></div></div>
    <p className="text-xs text-sky-700 mb-3">Toss the beach ball out to Salty — land three catches in a row for a bonus of rare reef treasures!</p>
    <button type="button" disabled={balls < 1} onClick={throwBallToSalty} className="w-full py-3 rounded-xl font-semibold text-white disabled:bg-sky-200 disabled:text-sky-500 bg-sky-600 active:bg-sky-700 shadow">🏐 Throw the Ball ({balls})</button>
  </div>;
}

function PianoCard() {
  const ctxRef = useRef<AudioContext | null>(null);
  const playNote = (freq: number) => { try { if (!ctxRef.current) { const Ctx = window.AudioContext || (window as any).webkitAudioContext; ctxRef.current = new Ctx(); } const ctx = ctxRef.current; const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.frequency.value = freq; osc.type = "triangle"; gain.gain.setValueAtTime(0.0001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02); gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.1); osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 1.15); } catch {} };
  return <div className="rounded-2xl bg-white/90 p-5 shadow-md ring-1 ring-indigo-200"><h2 className="text-lg font-bold text-indigo-900 mb-1">The Community Piano</h2><p className="text-sm text-indigo-700 mb-3">Sailors and sanctuary friends gather here in the evenings to play a tune.</p><div className="grid grid-cols-7 gap-1.5">{NOTES.map((n) => <button key={n.label} type="button" onClick={() => playNote(n.freq)} className="aspect-square rounded-lg bg-indigo-100 active:bg-indigo-300 text-indigo-900 font-bold text-sm shadow-sm">{n.label}</button>)}</div></div>;
}

export default function ShipScene() {
  const { state, setMusicOverride } = useGame();
  const [listenGameOpen, setListenGameOpen] = useState(false);
  const [ringTossOpen, setRingTossOpen] = useState(false);
  const [smoothieBarOpen, setSmoothieBarOpen] = useState(false);
  const [deckArea, setDeckArea] = useState<"main" | "cabin">("main");
  const [deckPanel, setDeckPanel] = useState<"piano" | "games" | null>(null);
  const listenButtonRef = useRef<HTMLButtonElement>(null);
  const ringTossButtonRef = useRef<HTMLButtonElement>(null);
  const smoothieButtonRef = useRef<HTMLButtonElement>(null);
  const closeListenGame = () => { setListenGameOpen(false); window.setTimeout(() => listenButtonRef.current?.focus(), 0); };
  const closeRingToss = () => { setRingTossOpen(false); window.setTimeout(() => ringTossButtonRef.current?.focus(), 0); };
  const closeSmoothieBar = () => { setSmoothieBarOpen(false); window.setTimeout(() => smoothieButtonRef.current?.focus(), 0); };

  useEffect(() => { if (state.gameCompleted) setMusicOverride("ship"); return () => setMusicOverride(null); }, [state.gameCompleted, setMusicOverride]);

  if (!state.gameCompleted) return <div className="h-full overflow-y-auto pb-24 px-4 pt-4 bg-[#0b3d3a] flex items-center justify-center"><div className="rounded-2xl bg-white/90 p-6 shadow-md ring-1 ring-amber-200 text-center max-w-sm"><p className="text-3xl mb-2">⛵</p><p className="font-semibold text-amber-900 mb-1">The harbor gathering hasn&apos;t begun yet</p><p className="text-sm text-amber-700">Restore the shipwreck and complete The Grand Reunion to welcome everyone aboard the Community Ship.</p></div></div>;

  const hotspots = deckArea === "main" ? [
    { label: "Visit the Shoreline Smoothie Bar", top: 30, left: 4, width: 30, height: 28, action: () => setSmoothieBarOpen(true) },
    { label: "Play the community piano", top: 34, left: 35, width: 31, height: 27, action: () => setDeckPanel("piano") },
    { label: "Explore ship games", top: 46, left: 67, width: 30, height: 27, action: () => setDeckPanel("games") },
    { label: "Go down to the lower cabin", top: 78, left: 60, width: 37, height: 18, action: () => { setDeckArea("cabin"); setDeckPanel(null); } },
  ] : [
    { label: "Return to the main deck", top: 76, left: 55, width: 40, height: 21, action: () => { setDeckArea("main"); setDeckPanel(null); } },
  ];

  return <div className="h-full overflow-y-auto pb-24 bg-[#0b3d3a] text-white">
    <h1 className="px-4 pt-4 text-xl font-bold">{deckArea === "main" ? "Community Ship — Main Deck" : "Community Ship — Lower Cabin"}</h1>
    <p className="px-4 py-2 text-sm text-teal-100">Explore the illustrated ship by selecting an object. All activities are also available using the accessible buttons below.</p>
    <div className="relative w-full">
      <Image src={deckArea === "main" ? "/images/Ship/shipwreck_main_deck_portrait.png" : "/images/Ship/shipwreck_lower_cabin_portrait.png"} alt={deckArea === "main" ? "Illustrated main deck with smoothie bar, music and games" : "Illustrated lower cabin with nautical treasures and a staircase"} width={1024} height={1536} unoptimized className="block h-auto w-full" priority />
      {hotspots.map((spot) => <button key={spot.label} type="button" aria-label={spot.label} title={spot.label} onClick={spot.action}
        className="absolute rounded-xl border-2 border-transparent focus-visible:border-yellow-300 focus-visible:bg-yellow-300/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
        style={{ top: spot.top + "%", left: spot.left + "%", width: spot.width + "%", height: spot.height + "%" }} />)}
    </div>
    <nav aria-label="Ship activities" className="mx-4 mt-4 grid grid-cols-2 gap-3">
      {deckArea === "main" ? <>
        <button className="rounded-xl bg-teal-700 p-3 font-semibold" onClick={() => setSmoothieBarOpen(true)}>Smoothie Bar</button>
        <button className="rounded-xl bg-teal-700 p-3 font-semibold" onClick={() => setDeckPanel("piano")}>Community Piano</button>
        <button className="rounded-xl bg-teal-700 p-3 font-semibold" onClick={() => setDeckPanel("games")}>Ship Games</button>
        <button className="rounded-xl bg-amber-700 p-3 font-semibold" onClick={() => { setDeckArea("cabin"); setDeckPanel(null); }}>Lower Cabin</button>
      </> : <button className="col-span-2 rounded-xl bg-amber-700 p-3 font-semibold" onClick={() => { setDeckArea("main"); setDeckPanel(null); }}>Return to Main Deck</button>}
    </nav>
    {deckArea === "cabin" && <p className="mx-4 mt-4 rounded-xl bg-teal-900 p-4 text-sm">Explore the captain's cabin. More treasure and navigation activities can be connected here in a future update.</p>}
    {deckArea === "main" && deckPanel && <section className="mx-4 mt-4 space-y-3 rounded-xl bg-white p-4 text-slate-900" aria-label={deckPanel === "piano" ? "Piano activity" : "Ship games"}>
      <button type="button" className="rounded-lg bg-slate-700 px-4 py-2 text-white" onClick={() => setDeckPanel(null)}>Close activity</button>
      {deckPanel === "piano" ? <PianoCard /> : <>
        <SaltyCard />
        <button ref={ringTossButtonRef} type="button" onClick={() => setRingTossOpen(true)} className="w-full rounded-xl bg-amber-600 p-3 font-bold text-white">Play Olli's Ring Toss</button>
        <button ref={listenButtonRef} type="button" onClick={() => setListenGameOpen(true)} className="w-full rounded-xl bg-cyan-700 p-3 font-bold text-white">Play Listen to the Shell</button>
      </>}
    </section>}
    {smoothieBarOpen && <SmoothieBar onClose={closeSmoothieBar} />}
    {listenGameOpen && <ListenToShell onClose={closeListenGame} />}
    {ringTossOpen && <OlliRingToss onClose={closeRingToss} />}
  </div>;
}
