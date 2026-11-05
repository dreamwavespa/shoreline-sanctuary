"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { SCENES } from "@/lib/media";
import ListenToShell from "./ListenToShell";
import OlliRingToss from "./OlliRingToss";
import SmoothieBar from "./SmoothieBar";

const PIANO_NOTES = Array.from({ length: 24 }, (_, i) => {
  const names = ["C", "C sharp", "D", "D sharp", "E", "F", "F sharp", "G", "G sharp", "A", "A sharp", "B"];
  const octave = i < 12 ? 4 : 5;
  return { label: names[i % 12] + octave, short: names[i % 12].replace(" sharp", "♯"), freq: 261.625565 * Math.pow(2, i / 12), black: names[i % 12].includes("sharp") };
});
const UKULELE_STRINGS = [
  { label: "G4 string", freq: 392 }, { label: "C4 string", freq: 261.63 },
  { label: "E4 string", freq: 329.63 }, { label: "A4 string", freq: 440 },
];
const UKULELE_CHORDS = [
  { label: "C major", freqs: [392, 261.63, 329.63, 523.25] },
  { label: "F major", freqs: [440, 349.23, 261.63, 440] },
  { label: "G major", freqs: [392, 293.66, 392, 493.88] },
  { label: "A minor", freqs: [440, 261.63, 329.63, 440] },
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

function MusicStudio({ initialInstrument = "piano" }: { initialInstrument?: "piano" | "drums" | "ukulele" }) {
  const [instrument, setInstrument] = useState<"piano" | "drums" | "ukulele">(initialInstrument);
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => () => { void ctxRef.current?.close(); ctxRef.current = null; }, []);
  const audio = () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = new Ctx();
    }
    if (ctxRef.current?.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current!;
  };
  const tone = (freq: number, kind: "piano" | "ukulele", delay = 0) => {
    try {
      const ctx = audio(), at = ctx.currentTime + delay;
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = kind === "piano" ? "triangle" : "sawtooth";
      osc.frequency.setValueAtTime(freq, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(kind === "piano" ? 0.18 : 0.085, at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + (kind === "piano" ? 1.1 : 0.75));
      osc.connect(gain).connect(ctx.destination);
      osc.start(at); osc.stop(at + (kind === "piano" ? 1.15 : 0.8));
    } catch {}
  };
  const drum = (kind: "bass" | "snare" | "cymbal" | "hand") => {
    try {
      const ctx = audio(), at = ctx.currentTime;
      if (kind === "bass" || kind === "hand") {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(kind === "bass" ? 140 : 220, at);
        osc.frequency.exponentialRampToValueAtTime(kind === "bass" ? 48 : 110, at + 0.2);
        gain.gain.setValueAtTime(0.35, at);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
        osc.connect(gain).connect(ctx.destination); osc.start(at); osc.stop(at + 0.31);
      } else {
        const length = Math.floor(ctx.sampleRate * (kind === "snare" ? 0.18 : 0.7));
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate), data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
        const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
        source.buffer = buffer;
        filter.type = "highpass"; filter.frequency.value = kind === "snare" ? 1200 : 5000;
        gain.gain.setValueAtTime(kind === "snare" ? 0.23 : 0.14, at);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + (kind === "snare" ? 0.18 : 0.7));
        source.connect(filter).connect(gain).connect(ctx.destination);
        source.start(at); source.stop(at + (kind === "snare" ? 0.18 : 0.7));
      }
    } catch {}
  };
  return <div className="rounded-2xl bg-white/95 p-4 text-slate-900 shadow-md">
    <h2 className="mb-2 text-lg font-bold">Community Music Corner</h2>
    <p className="mb-3 text-sm">Choose an instrument, then select labeled notes, strings, or drums to play. All controls work with VoiceOver and a keyboard.</p>
    <div className="mb-4 grid grid-cols-3 gap-2" role="group" aria-label="Choose an instrument">
      {(["piano", "drums", "ukulele"] as const).map((name) => <button key={name} type="button" aria-pressed={instrument === name} onClick={() => setInstrument(name)} className={`rounded-lg px-2 py-3 font-semibold capitalize focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 ${instrument === name ? "bg-teal-800 text-white" : "bg-teal-100 text-teal-900"}`}>{name}</button>)}
    </div>
    {instrument === "piano" && <section aria-label="Two octave piano">
      <h3 className="mb-2 font-bold">Two-octave piano keyboard</h3>
      <p className="mb-3 text-sm">Swipe horizontally to reach all keys. White and black keys are individually labeled for VoiceOver.</p>
      <div className="overflow-x-auto rounded-xl bg-amber-950 p-3" aria-label="Scrollable piano keyboard">
        <div className="relative h-44 w-[672px]" role="group" aria-label="Piano keys C4 through B5">
          {PIANO_NOTES.filter(note => !note.black).map((note, index) => <button key={note.label} type="button" aria-label={`Play piano note ${note.label}`} onClick={() => tone(note.freq, "piano")} style={{ left: `${index * 48}px`, width: "48px" }} className="absolute top-0 h-44 rounded-b-lg border-2 border-slate-500 bg-gradient-to-b from-white to-slate-200 pb-3 text-sm font-bold text-slate-900 shadow-inner active:from-amber-100 active:to-amber-300 focus-visible:z-30 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 flex items-end justify-center">{note.label.replace(" sharp", "")}</button>)}
          {PIANO_NOTES.filter(note => note.black).map(note => {
            const index = PIANO_NOTES.findIndex(n => n.label === note.label);
            const whiteBefore = PIANO_NOTES.slice(0, index).filter(n => !n.black).length;
            return <button key={note.label} type="button" aria-label={`Play piano note ${note.label}`} onClick={() => tone(note.freq, "piano")} style={{ left: `${whiteBefore * 48 - 15}px`, width: "30px" }} className="absolute top-0 z-10 h-28 rounded-b-md border border-slate-600 bg-gradient-to-b from-slate-700 to-black text-[10px] font-bold text-white shadow-lg active:bg-indigo-700 focus-visible:z-30 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 flex items-end justify-center pb-2">{note.short}</button>;
          })}
        </div>
      </div>
    </section>}
    {instrument === "drums" && <section aria-label="Playable drum kit">
      <h3 className="mb-2 font-bold">Tap the drum kit</h3>
      <p className="mb-3 text-sm">Each drum and cymbal is a labeled playable surface.</p>
      <div className="relative mx-auto grid max-w-sm grid-cols-2 gap-4 rounded-2xl bg-slate-800 p-4">
        {([{ label: "Cymbal", kind: "cymbal", style: "bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-700 border-yellow-800" }, { label: "Hand drum", kind: "hand", style: "bg-gradient-to-br from-orange-100 via-amber-200 to-orange-600 border-amber-900" }, { label: "Snare drum", kind: "snare", style: "bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500 border-slate-600" }, { label: "Bass drum", kind: "bass", style: "bg-gradient-to-br from-teal-100 via-teal-300 to-teal-800 border-teal-950" }] as const).map(item => <button key={item.kind} type="button" aria-label={`Play ${item.label}`} onClick={() => drum(item.kind)} className={`aspect-square min-h-28 rounded-full border-[9px] p-3 text-center font-bold text-slate-950 shadow-[0_8px_0_#111827] active:translate-y-1 active:shadow-sm focus-visible:outline focus-visible:outline-4 focus-visible:outline-white ${item.style}`}>{item.label}</button>)}
      </div>
    </section>}
    {instrument === "ukulele" && <section aria-label="Playable ukulele">
      <h3 className="mb-2 font-bold">Pluck the ukulele</h3>
      <p className="mb-3 text-sm">Select one of the four strings on the wooden ukulele, or strum a chord below.</p>
      <div className="relative mx-auto max-w-sm rounded-[45%] border-[12px] border-amber-950 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-800 px-6 py-10 shadow-xl">
        <div className="mx-auto mb-5 h-20 w-20 rounded-full border-[8px] border-amber-900 bg-amber-950 shadow-inner" aria-hidden="true" />
        <div className="space-y-3" role="group" aria-label="Ukulele strings">
          {UKULELE_STRINGS.map((string, index) => <button key={string.label} type="button" aria-label={`Pluck ${string.label}`} onClick={() => tone(string.freq, "ukulele")} className="relative block h-10 w-full rounded-md bg-amber-100/20 text-center text-sm font-bold text-amber-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-white"><span aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t-2 border-slate-100 shadow-sm" /><span className="relative rounded bg-amber-100/90 px-2">{string.label}</span></button>)}
        </div>
        <div className="mx-auto mt-5 h-4 w-24 rounded bg-amber-950" aria-hidden="true" />
      </div>
      <h4 className="mb-2 mt-4 font-semibold">Strum a chord</h4>
      <div className="grid grid-cols-2 gap-2">
        {UKULELE_CHORDS.map(chord => <button key={chord.label} type="button" onClick={() => chord.freqs.forEach((freq, index) => tone(freq, "ukulele", index * 0.045))} className="rounded-lg bg-teal-100 px-3 py-4 font-semibold text-teal-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400">{chord.label}</button>)}
      </div>
    </section>}
  </div>;
}

export default function ShipScene() {
  const { state, setMusicOverride } = useGame();
  const [listenGameOpen, setListenGameOpen] = useState(false);
  const [ringTossOpen, setRingTossOpen] = useState(false);
  const [smoothieBarOpen, setSmoothieBarOpen] = useState(false);
  const [cabinDiscovery, setCabinDiscovery] = useState<string | null>(null);
  const discoveryAnnouncementRef = useRef<HTMLParagraphElement>(null);
  const [musicInstrument, setMusicInstrument] = useState<"piano" | "drums" | "ukulele">("piano");
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
  const selectDiscovery = (item: string) => { setCabinDiscovery(item); window.setTimeout(() => discoveryAnnouncementRef.current?.focus(), 0); };
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
    { label: "Play the community piano", top: 18, left: 39, width: 20, height: 42, action: () => { setMusicInstrument("piano"); setDeckPanel("piano"); } },
    { label: "Play the ukulele", top: 34, left: 60, width: 9, height: 30, action: () => { setMusicInstrument("ukulele"); setDeckPanel("piano"); } },
    { label: "Play the drums", top: 30, left: 69, width: 12, height: 35, action: () => { setMusicInstrument("drums"); setDeckPanel("piano"); } },
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
      <div ref={dialogRef} data-ship-music-activity={deckPanel === "piano" ? "active" : undefined} role="dialog" aria-modal="true" aria-label={deckPanel === "piano" ? "Community Piano" : deckPanel === "games" ? "Ship Games" : deckPanel === "treasure" ? "Captain's Treasure Chest" : deckPanel === "navigation" ? "Navigation Table" : deckPanel === "wheel" ? "Ship's Wheel" : deckPanel === "musicbox" ? "Lost Music Box" : smoothieBarOpen ? "Smoothie Bar" : ringTossOpen ? "Olli's Ring Toss" : "Listen to the Shell"} tabIndex={-1} className="w-full max-w-xl max-h-[90dvh] overflow-y-auto overscroll-contain rounded-2xl bg-[#0b3d3a] p-3 text-white shadow-2xl outline-none sm:p-5">
        <button type="button" className="mb-3 rounded-xl bg-amber-700 px-5 py-3 font-bold text-white" onClick={() => { setDeckPanel(null); setSmoothieBarOpen(false); setListenGameOpen(false); setRingTossOpen(false); window.setTimeout(() => triggerRef.current?.focus(), 0); }}>Close popup</button>
    {deckArea === "cabin" && deckPanel && <section className="mx-4 mt-4 space-y-3 rounded-xl bg-white p-4 text-slate-900" aria-label="Lower cabin discovery">
      <h2 className="text-lg font-bold">{deckPanel === "treasure" ? "Captain's Treasure Chest" : deckPanel === "navigation" ? "Navigation Table" : deckPanel === "wheel" ? "Ship's Wheel" : "The Lost Music Box"}</h2>
      <p>{deckPanel === "treasure" ? "The old chest is open, revealing polished gemstones, pearls, and sea treasures. The captain's collection is safe aboard the Community Ship." : deckPanel === "navigation" ? "Unroll the sea charts and examine the compass, telescope, and maps. The navigation table holds memories of voyages across the sanctuary waters." : deckPanel === "wheel" ? "The polished wooden wheel once guided the ship through wind and waves. Imagine choosing a course toward the reef, the sandbar, or a new horizon." : "A delicate music box rests on the cabin shelf beside the captain's old sheet music. Its tiny melody is waiting to be rediscovered."}</p>
      {(deckPanel === "treasure" || deckPanel === "navigation") && <div className="space-y-3">
        <p className="text-sm">Choose an object to examine. These discoveries are for exploration and do not remove or award inventory items.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(deckPanel === "treasure" ? ["Pearl necklace", "Polished gemstones", "Carved seashell", "Captain's keepsake"] : ["Compass", "Sea charts", "Telescope", "Voyage journal"]).map((item) => <button key={item} type="button" onClick={() => selectDiscovery(item)} aria-pressed={cabinDiscovery === item} className="rounded-lg bg-teal-700 px-4 py-3 text-left font-semibold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400">{item}</button>)}
        </div>
        {cabinDiscovery && <div className="rounded-lg bg-amber-50 p-3 text-slate-900"><strong>{cabinDiscovery}</strong><p ref={discoveryAnnouncementRef} tabIndex={-1} role="status" aria-live="polite">{({
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

    </section>}
    {deckArea === "main" && deckPanel && <section className="mx-4 mt-4 space-y-3 rounded-xl bg-white p-4 text-slate-900" aria-label={deckPanel === "piano" ? "Piano activity" : "Ship games"}>
      <button type="button" className="rounded-lg bg-slate-700 px-4 py-2 text-white" onClick={closePanel}>Close activity</button>
      {deckPanel === "piano" ? <MusicStudio key={musicInstrument} initialInstrument={musicInstrument} /> : <>
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
