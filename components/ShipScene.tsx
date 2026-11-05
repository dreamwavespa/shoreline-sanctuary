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
  const [cabinDiscovery, setCabinDiscovery] = useState<string | null>(null);
  const [deckArea, setDeckArea] = useState<"main" | "cabin">("main");
  const [deckPanel, setDeckPanel] = useState<"piano" | "games" | "treasure" | "navigation" | "wheel" | "musicbox" | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogOpen = Boolean(deckPanel || smoothieBarOpen || listenGameOpen || ringTossOpen);
  const closePanel = () => { setCabinDiscovery(null); setDeckPanel(null); window.setTimeout(() => triggerRef.current?.focus(), 0); };
  useEffect(() => {
    if (!dialogOpen) return;
    const previous = document.activeElement;
    if (previous instanceof HTMLElement && !triggerRef.current) triggerRef.current = previous;
    window.setTimeout(() => dialogRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setDeckPanel(null); setSmoothieBarOpen(false); setListenGameOpen(false); setRingTossOpen(false); window.setTimeout(() => triggerRef.current?.focus(), 0); }
      if (event.key === "Tab" && dialogRef.current) {
        const controls = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
        if (!controls.length) { event.preventDefault(); return; }
        if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls[controls.length - 1].focus(); }
        else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) { event.preventDefault(); controls[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dialogOpen]);
  const openFrom = (event: React.MouseEvent<HTMLButtonElement>, action: () => void) => { triggerRef.current = event.currentTarget; action(); };
  const listenButtonRef = useRef<HTMLButtonElement>(null);
  const ringTossButtonRef = useRef<HTMLButtonElement>(null);
  const smoothieButtonRef = useRef<HTMLButtonElement>(null);
  const closeListenGame = () => { setListenGameOpen(false); window.setTimeout(() => listenButtonRef.current?.focus(), 0); };
  const closeRingToss = () => { setRingTossOpen(false); window.setTimeout(() => ringTossButtonRef.current?.focus(), 0); };
  const closeSmoothieBar = () => { setSmoothieBarOpen(false); window.setTimeout(() => smoothieButtonRef.current?.focus(), 0); };

  useEffect(() => { if (state.gameCompleted) setMusicOverride("ship"); return () => setMusicOverride(null); }, [state.gameCompleted, setMusicOverride]);

  if (!state.gameCompleted) return <div className="h-full overflow-y-auto pb-24 px-4 pt-4 bg-[#0b3d3a] flex items-center justify-center"><div className="rounded-2xl bg-white/90 p-6 shadow-md ring-1 ring-amber-200 text-center max-w-sm"><p className="text-3xl mb-2">⛵</p><p className="font-semibold text-amber-900 mb-1">The harbor gathering hasn&apos;t begun yet</p><p className="text-sm text-amber-700">Restore the shipwreck and complete The Grand Reunion to welcome everyone aboard the Community Ship.</p></div></div>;

  const changeDeck = (area: "main" | "cabin") => { setDeckArea(area); setCabinDiscovery(null); setDeckPanel(null); };
  const hotspots = deckArea === "main" ? [
    { label: "Visit the Shoreline Smoothie Bar", top: 18, left: 3, width: 31, height: 49, action: () => setSmoothieBarOpen(true) },
    { label: "Play the community piano", top: 18, left: 39, width: 25, height: 42, action: () => setDeckPanel("piano") },
    { label: "Explore ship games", top: 25, left: 80, width: 19, height: 46, action: () => setDeckPanel("games") },
    { label: "Go down the staircase to the lower cabin", top: 68, left: 33, width: 35, height: 27, action: () => changeDeck("cabin") },
  ] : [
    { label: "Go up the staircase to the main deck", top: 5, left: 0, width: 21, height: 83, action: () => changeDeck("main") },
    { label: "Open the treasure chest", top: 38, left: 15, width: 22, height: 45, action: () => setDeckPanel("treasure") },
    { label: "Explore the navigation table and sea charts", top: 43, left: 38, width: 41, height: 44, action: () => setDeckPanel("navigation") },
    { label: "Examine the ship's wheel", top: 19, left: 25, width: 20, height: 30, action: () => setDeckPanel("wheel") },
    { label: "Open the music box", top: 26, left: 81, width: 17, height: 33, action: () => setDeckPanel("musicbox") },
  ];

  return <div className="min-h-full bg-[#0b3d3a] text-white" style={{ backgroundImage: "linear-gradient(180deg, #0b3d3a 0%, #104c49 70%, #0b3d3a 100%)" }}>
    <h1 className="px-4 pt-4 text-xl font-bold">{deckArea === "main" ? "Community Ship — Main Deck" : "Community Ship — Lower Cabin"}</h1>
    <p className="px-4 py-2 text-sm text-teal-100">Explore the illustrated ship by selecting an object. Use the labeled interactive objects to explore each room. Swipe through the objects with VoiceOver or use Tab and Enter with a keyboard.</p>
    <div className="relative w-full">
      <Image src={deckArea === "main" ? "/images/Ship/shipwreck_main_deck_portrait.png" : "/images/Ship/shipwreck_lower_cabin_portrait.png"} alt={deckArea === "main" ? "Illustrated main deck with smoothie bar, music and games" : "Illustrated lower cabin with nautical treasures and a staircase"} width={1024} height={1536} unoptimized className="block h-auto w-full" priority />
      {hotspots.map((spot) => <button key={spot.label} type="button" aria-label={spot.label} title={spot.label} onClick={(event) => openFrom(event, spot.action)}
        className="absolute rounded-xl border-2 border-transparent focus-visible:border-yellow-300 focus-visible:bg-yellow-300/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
        style={{ top: spot.top + "%", left: spot.left + "%", width: spot.width + "%", height: spot.height + "%" }} />)}
    </div>
    {dialogOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) { setDeckPanel(null); setSmoothieBarOpen(false); setListenGameOpen(false); setRingTossOpen(false); window.setTimeout(() => triggerRef.current?.focus(), 0); } }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={deckPanel === "piano" ? "Community Piano" : deckPanel === "games" ? "Ship Games" : deckPanel === "treasure" ? "Captain's Treasure Chest" : deckPanel === "navigation" ? "Navigation Table" : deckPanel === "wheel" ? "Ship's Wheel" : deckPanel === "musicbox" ? "Lost Music Box" : smoothieBarOpen ? "Smoothie Bar" : ringTossOpen ? "Olli's Ring Toss" : "Listen to the Shell"} tabIndex={-1} className="w-full max-w-xl max-h-[90dvh] overflow-y-auto overscroll-contain rounded-2xl bg-[#0b3d3a] p-3 text-white shadow-2xl outline-none sm:p-5">
        <button type="button" className="mb-3 rounded-xl bg-amber-700 px-5 py-3 font-bold text-white" onClick={() => { setDeckPanel(null); setSmoothieBarOpen(false); setListenGameOpen(false); setRingTossOpen(false); window.setTimeout(() => triggerRef.current?.focus(), 0); }}>Close popup</button>
    {deckArea === "cabin" && deckPanel && <section className="mx-4 mt-4 space-y-3 rounded-xl bg-white p-4 text-slate-900" aria-label="Lower cabin discovery">
      <h2 className="text-lg font-bold">{deckPanel === "treasure" ? "Captain's Treasure Chest" : deckPanel === "navigation" ? "Navigation Table" : deckPanel === "wheel" ? "Ship's Wheel" : "The Lost Music Box"}</h2>
      <p>{deckPanel === "treasure" ? "The old chest is open, revealing polished gemstones, pearls, and sea treasures. The captain's collection is safe aboard the Community Ship." : deckPanel === "navigation" ? "Unroll the sea charts and examine the compass, telescope, and maps. The navigation table holds memories of voyages across the sanctuary waters." : deckPanel === "wheel" ? "The polished wooden wheel once guided the ship through wind and waves. Imagine choosing a course toward the reef, the sandbar, or a new horizon." : "A delicate music box rests on the cabin shelf beside the captain's old sheet music. Its tiny melody is waiting to be rediscovered."}</p>
      {(deckPanel === "treasure" || deckPanel === "navigation") && <div className="space-y-3">
        <p className="text-sm">Choose an object to examine. These discoveries are for exploration and do not remove or award inventory items.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(deckPanel === "treasure" ? ["Pearl necklace", "Polished gemstones", "Carved seashell", "Captain's keepsake"] : ["Compass", "Sea charts", "Telescope", "Voyage journal"]).map((item) => <button key={item} type="button" onClick={() => setCabinDiscovery(item)} aria-pressed={cabinDiscovery === item} className="rounded-lg bg-teal-700 px-4 py-3 text-left font-semibold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400">{item}</button>)}
        </div>
        {cabinDiscovery && <div role="status" aria-live="polite" className="rounded-lg bg-amber-50 p-3 text-slate-900"><strong>{cabinDiscovery}</strong><p>{({
          "Pearl necklace": "A strand of luminous pearls, carefully kept among the captain's treasures.",
          "Polished gemstones": "Colorful stones catch the lantern light inside the open chest.",
          "Carved seashell": "A delicate shell carving recalls the sanctuary's shores.",
          "Captain's keepsake": "A small keepsake preserved as a memory of the ship's voyages.",
          "Compass": "The compass needle points north, ready to guide another voyage.",
          "Sea charts": "The charts mark familiar waters near the reef, sandbar, and shore.",
          "Telescope": "A brass telescope rests beside the maps, ready for a lookout.",
          "Voyage journal": "The captain's journal holds notes from earlier journeys."
        } as Record<string, string>)[cabinDiscovery]}</p></div>}
      </div>}
      <button type="button" className="rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white" onClick={closePanel}>Close {deckPanel === "treasure" ? "treasure chest" : deckPanel === "navigation" ? "navigation table" : deckPanel === "wheel" ? "ship's wheel" : "music box"}</button>
    </section>}
    {deckArea === "main" && deckPanel && <section className="mx-4 mt-4 space-y-3 rounded-xl bg-white p-4 text-slate-900" aria-label={deckPanel === "piano" ? "Piano activity" : "Ship games"}>
      <button type="button" className="rounded-lg bg-slate-700 px-4 py-2 text-white" onClick={closePanel}>Close activity</button>
      {deckPanel === "piano" ? <PianoCard /> : <>
        <SaltyCard />
        <button ref={ringTossButtonRef} type="button" onClick={() => setRingTossOpen(true)} className="w-full rounded-xl bg-amber-600 p-3 font-bold text-white">Play Olli's Ring Toss</button>
        <button ref={listenButtonRef} type="button" onClick={() => setListenGameOpen(true)} className="w-full rounded-xl bg-cyan-700 p-3 font-bold text-white">Play Listen to the Shell</button>
      </>}
    </section>}
    {smoothieBarOpen && <SmoothieBar onClose={closeSmoothieBar} />}
    {listenGameOpen && <ListenToShell onClose={closeListenGame} />}
    {ringTossOpen && <OlliRingToss onClose={closeRingToss} />}
      </div>
    </div>}
  </div>;
}
