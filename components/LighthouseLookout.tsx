"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/lib/store";

type WatchMode = "day" | "night";
type Direction = "west" | "horizon" | "east" | "sky";

interface LookoutSighting {
  id: string;
  name: string;
  icon: string;
  description: string;
  clue: string;
  direction: Direction;
  mode: WatchMode;
}

const DIRECTIONS: { id: Direction; label: string; icon: string; shortcut: string }[] = [
  { id: "west", label: "West Cove", icon: "⬅️", shortcut: "1" },
  { id: "horizon", label: "Open Horizon", icon: "⏺️", shortcut: "2" },
  { id: "east", label: "Eastern Reef", icon: "➡️", shortcut: "3" },
  { id: "sky", label: "High Sky", icon: "⬆️", shortcut: "4" },
];

const SIGHTINGS: LookoutSighting[] = [
  { id: "lookout-humpback-pod", name: "Humpback Whale Pod", icon: "🐋", description: "Three humpback whales surface beyond the western cove, sending silver mist into the sun.", clue: "A soft plume of mist rises beyond the west cove.", direction: "west", mode: "day" },
  { id: "lookout-sunlit-sailboat", name: "Sunlit Sailboat", icon: "⛵", description: "A white-and-blue sailboat glides across the sunlit open horizon.", clue: "White sails and a flash of blue move slowly along the open horizon.", direction: "horizon", mode: "day" },
  { id: "lookout-dolphin-family", name: "Dolphin Family", icon: "🐬", description: "A family of dolphins leaps beside the eastern reef, the smallest one following close behind.", clue: "Quick splashes sparkle near the eastern reef.", direction: "east", mode: "day" },
  { id: "lookout-roseate-spoonbills", name: "Roseate Spoonbills", icon: "🦩", description: "Four unusual pink spoonbills glide high above the island on broad, quiet wings.", clue: "A flash of pink feathers circles high overhead.", direction: "sky", mode: "day" },
  { id: "lookout-distant-island", name: "Distant Moonlit Island", icon: "🏝️", description: "A tiny island appears beyond the western cove, outlined by moonlight and a ring of pale surf.", clue: "A dark shape edged in silver rests beyond the west cove.", direction: "west", mode: "night" },
  { id: "lookout-lantern-boat", name: "Lantern Fishing Boat", icon: "🚤", description: "A fishing boat drifts across the horizon with warm lanterns reflected in the water.", clue: "Warm lantern lights bob along the open horizon.", direction: "horizon", mode: "night" },
  { id: "lookout-moonlit-whale", name: "Moonlit Whale", icon: "🐳", description: "A lone whale lifts its tail beside the eastern reef, then slips quietly beneath the water.", clue: "A wide silver ripple spreads near the eastern reef.", direction: "east", mode: "night" },
  { id: "lookout-shooting-stars", name: "Shooting Star Pair", icon: "🌠", description: "Two shooting stars cross high above the lighthouse, one bright gold and one soft blue.", clue: "A quick streak of light flickers in the high sky.", direction: "sky", mode: "night" },
];

const WHALE_FRAMES = Array.from({ length: 12 }, (_, index) => `/images/whale_${String(index + 1).padStart(2, "0")}_${["surface","rising","blow","arc","prepare_dive","tail_rise","tail_high","tail_lower","tail_disappear","splash","ripples","ripples_fade"][index]}.png`);
const DOLPHIN_FRAMES = Array.from({ length: 10 }, (_, index) => `/images/dolphin_${String(index + 1).padStart(2, "0")}.png`);
const BOAT_IMAGES: Record<string, string> = {
  "lookout-sunlit-sailboat": "/images/C627786E-9C07-43AD-8363-D41F3A16EB8E.png",
  "lookout-lantern-boat": "/images/63937B93-2D09-4661-81BF-D3FBAA53B93C.png",
};

export default function LighthouseLookout({ onClose }: { onClose: () => void }) {
  const { state, addLookoutSighting, play } = useGame();
  const [mode, setMode] = useState<WatchMode>("day");
  const [direction, setDirection] = useState<Direction>("horizon");
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [currentSighting, setCurrentSighting] = useState<LookoutSighting | null>(null);
  const [roundFinds, setRoundFinds] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("Choose a daylight or starry-night lookout watch.");
  const [whaleFrame, setWhaleFrame] = useState(0);
  const [whaleAnimating, setWhaleAnimating] = useState(false);
  const [dolphinFrame, setDolphinFrame] = useState(0);
  const [dolphinAnimating, setDolphinAnimating] = useState(false);
  const [boatAnimationKey, setBoatAnimationKey] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const modeSightings = useMemo(() => SIGHTINGS.filter((sighting) => sighting.mode === mode), [mode]);
  const journalCount = SIGHTINGS.filter((sighting) => state.lookoutSightings.includes(sighting.id)).length;
  const selectedDirection = DIRECTIONS.find((item) => item.id === direction) || DIRECTIONS[1];
  const clue = modeSightings.find((sighting) => sighting.direction === direction)?.clue || "The view is calm.";
  const showingWhale = currentSighting?.id === "lookout-moonlit-whale";
  const showingDolphins = currentSighting?.id === "lookout-dolphin-family";
  const boatImage = currentSighting ? BOAT_IMAGES[currentSighting.id] : undefined;
  const showingBoat = Boolean(boatImage);
  const isNightBoat = currentSighting?.id === "lookout-lantern-boat";
  const animalAnimating = whaleAnimating || dolphinAnimating;

  useEffect(() => { headingRef.current?.focus(); }, []);
  useEffect(() => () => { if (completionTimerRef.current) clearTimeout(completionTimerRef.current); }, []);

  useEffect(() => {
    if (!whaleAnimating) return;
    const timer = window.setInterval(() => {
      setWhaleFrame((frame) => {
        if (frame >= WHALE_FRAMES.length - 1) { window.clearInterval(timer); setWhaleAnimating(false); return frame; }
        return frame + 1;
      });
    }, 430);
    return () => window.clearInterval(timer);
  }, [whaleAnimating]);

  useEffect(() => {
    if (!dolphinAnimating) return;
    const timer = window.setInterval(() => {
      setDolphinFrame((frame) => {
        if (frame >= DOLPHIN_FRAMES.length - 1) { window.clearInterval(timer); setDolphinAnimating(false); return frame; }
        return frame + 1;
      });
    }, 480);
    return () => window.clearInterval(timer);
  }, [dolphinAnimating]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (!playing || complete || animalAnimating) return;
      const keyboardDirection: Record<string, Direction> = { "1": "west", "2": "horizon", "3": "east", "4": "sky", ArrowLeft: "west", ArrowRight: "east", ArrowUp: "sky", ArrowDown: "horizon" };
      const nextDirection = keyboardDirection[event.key];
      if (nextDirection) { event.preventDefault(); moveTelescope(nextDirection); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const startWatch = () => {
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    setDirection("horizon"); setCurrentSighting(null); setRoundFinds([]); setComplete(false); setPlaying(true);
    setWhaleFrame(0); setWhaleAnimating(false); setDolphinFrame(0); setDolphinAnimating(false);
    setBoatAnimationKey((key) => key + 1);
    setAnnouncement(`${mode === "day" ? "Daylight" : "Starry-night"} watch started. The telescope is aimed at the open horizon. ${modeSightings.find((sighting) => sighting.direction === "horizon")?.clue}`);
  };

  const moveTelescope = (nextDirection: Direction) => {
    if (animalAnimating) return;
    const next = DIRECTIONS.find((item) => item.id === nextDirection) || DIRECTIONS[1];
    const nextClue = modeSightings.find((sighting) => sighting.direction === nextDirection)?.clue || "The view is calm.";
    setDirection(nextDirection); setCurrentSighting(null); setWhaleFrame(0); setDolphinFrame(0); play("driftwood");
    setAnnouncement(`Telescope aimed at ${next.label}. ${nextClue} Select Scan This View to look closer.`);
  };

  const scan = () => {
    if (animalAnimating) return;
    const sighting = modeSightings.find((item) => item.direction === direction);
    if (!sighting) return;
    const alreadyInRound = roundFinds.includes(sighting.id);
    const alreadyInJournal = state.lookoutSightings.includes(sighting.id);
    const isWhale = sighting.id === "lookout-moonlit-whale";
    const isDolphin = sighting.id === "lookout-dolphin-family";
    const isBoat = Boolean(BOAT_IMAGES[sighting.id]);
    setCurrentSighting(sighting);
    if (isWhale) { setWhaleFrame(0); setWhaleAnimating(true); }
    if (isDolphin) { setDolphinFrame(0); setDolphinAnimating(true); }
    if (isBoat) setBoatAnimationKey((key) => key + 1);
    if (!alreadyInRound) setRoundFinds((finds) => [...finds, sighting.id]);
    if (!alreadyInJournal) addLookoutSighting(sighting.id);
    play(alreadyInRound ? "shell" : "questComplete");

    const nextCount = alreadyInRound ? roundFinds.length : roundFinds.length + 1;
    if (nextCount === modeSightings.length) {
      const finishWatch = () => { setComplete(true); setPlaying(false); setAnnouncement(`${sighting.name}. ${sighting.description} ${mode === "day" ? "Daylight" : "Starry-night"} watch complete. All four sightings are in the lookout journal.`); };
      if (isWhale) {
        setAnnouncement(`${sighting.name}. ${sighting.description} Watch the whale surface, lift its tail, and disappear beneath the moonlit water.`);
        completionTimerRef.current = setTimeout(finishWatch, WHALE_FRAMES.length * 430 + 500);
      } else if (isDolphin) {
        setAnnouncement(`${sighting.name}. ${sighting.description} Watch the family surface, leap, and dive beside the reef.`);
        completionTimerRef.current = setTimeout(finishWatch, DOLPHIN_FRAMES.length * 480 + 500);
      } else finishWatch();
    } else {
      setAnnouncement(`${sighting.name}. ${sighting.description}${alreadyInJournal ? " This sighting was already in your journal." : " New journal entry unlocked."} ${modeSightings.length - nextCount} sightings remain in this watch.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07152f]/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="lookout-title">
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-indigo-950 via-sky-950 to-amber-50 p-5 shadow-2xl ring-1 ring-sky-300">
        <div className="flex items-start justify-between gap-4 text-white"><div><p className="text-sm font-semibold text-sky-200">Lighthouse Mini-Game</p><h2 id="lookout-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold outline-none">🔭 Lighthouse Lookout</h2></div><button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-indigo-950">Close</button></div>

        {!playing && !complete ? (
          <div className="mt-5 rounded-2xl bg-white/95 p-4">
            <p className="text-indigo-950">Choose a watch, aim the telescope in four directions, and scan each view. Every new discovery unlocks a permanent lookout journal entry.</p>
            <fieldset className="mt-5"><legend className="font-bold text-indigo-950">Choose a lookout watch</legend><div className="mt-3 grid grid-cols-2 gap-3">
              {(["day", "night"] as WatchMode[]).map((option) => { const found = SIGHTINGS.filter((sighting) => sighting.mode === option && state.lookoutSightings.includes(sighting.id)).length; return (
                <button key={option} type="button" aria-pressed={mode === option} onClick={() => { setMode(option); setAnnouncement(`${option === "day" ? "Daylight" : "Starry-night"} watch selected. ${found} of 4 journal entries found.`); }} className={`rounded-xl p-4 text-left ring-2 ${mode === option ? "bg-indigo-700 text-white ring-indigo-800" : "bg-sky-50 text-indigo-950 ring-sky-200"}`}>
                  <span className="block text-3xl" aria-hidden="true">{option === "day" ? "☀️" : "🌙"}</span><span className="block font-bold">{option === "day" ? "Daylight Watch" : "Starry-Night Watch"}</span><span className={`mt-1 block text-sm ${mode === option ? "text-indigo-100" : "text-indigo-700"}`}>Journal: {found}/4</span>
                </button>); })}
            </div></fieldset>
            <button type="button" onClick={startWatch} className="mt-5 w-full rounded-xl bg-amber-600 py-3 font-bold text-white shadow active:bg-amber-700">Begin Lookout Watch</button><p className="mt-4 text-center text-sm font-semibold text-teal-800">Lookout journal: {journalCount}/8 discoveries</p>
          </div>
        ) : complete ? (
          <div className="mt-5 rounded-2xl bg-white/95 p-5 text-center"><div className="text-6xl" aria-hidden="true">{mode === "day" ? "☀️🔭" : "🌙🔭"}</div><h3 className="mt-3 text-xl font-bold text-indigo-950">{mode === "day" ? "Daylight" : "Starry-Night"} Watch Complete!</h3><p className="mt-2 text-indigo-800">All four sightings from this watch are recorded.</p><p className="mt-2 font-semibold text-teal-800">Lookout journal: {journalCount}/8 discoveries</p><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={startWatch} className="rounded-xl bg-amber-600 px-4 py-3 font-bold text-white">Watch Again</button><button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-3 font-bold text-indigo-950 ring-1 ring-indigo-300">Return to Lighthouse</button></div></div>
        ) : (
          <div className="mt-5">
            <div className="rounded-3xl bg-sky-100 p-5 text-center ring-4 ring-amber-500 shadow-inner"><p className="text-sm font-semibold text-indigo-800">{mode === "day" ? "Daylight Watch" : "Starry-Night Watch"} · Found {roundFinds.length}/4</p>
              <div className={`mt-3 min-h-36 overflow-hidden rounded-full border-[10px] border-indigo-950 p-6 shadow-inner ${mode === "night" ? "bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-700" : "bg-gradient-to-b from-sky-300 to-cyan-100"}`} role="img" aria-label={currentSighting ? `${currentSighting.name}. ${currentSighting.description}` : `Telescope aimed at ${selectedDirection.label}. ${clue}`}>
                {showingWhale ? <img src={WHALE_FRAMES[whaleFrame]} alt="" aria-hidden="true" className="mx-auto h-44 w-full max-w-md object-contain" /> : showingDolphins ? <img src={DOLPHIN_FRAMES[dolphinFrame]} alt="" aria-hidden="true" className="mx-auto h-44 w-full max-w-md object-contain" /> : showingBoat && boatImage ? (
                  <div className="relative mx-auto h-44 w-full max-w-md overflow-hidden" aria-hidden="true"><img key={`${currentSighting?.id}-${boatAnimationKey}`} src={boatImage} alt="" className={`lookout-boat absolute bottom-1 h-36 w-auto max-w-none object-contain ${isNightBoat ? "lookout-boat-night" : "lookout-boat-day"}`} /></div>
                ) : <div className="text-6xl" aria-hidden="true">{currentSighting?.icon || selectedDirection.icon}</div>}
                <p className={`mt-2 font-bold ${mode === "night" ? "text-white" : "text-indigo-950"}`}>{currentSighting?.name || selectedDirection.label}</p><p className={`mt-1 text-sm ${mode === "night" ? "text-sky-100" : "text-indigo-800"}`}>{currentSighting?.description || clue}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Telescope directions">{DIRECTIONS.map((item) => <button key={item.id} type="button" disabled={animalAnimating} aria-pressed={direction === item.id} aria-keyshortcuts={`${item.shortcut}${item.id === "west" ? " ArrowLeft" : item.id === "east" ? " ArrowRight" : item.id === "sky" ? " ArrowUp" : " ArrowDown"}`} onClick={() => moveTelescope(item.id)} className={`min-h-20 rounded-xl p-3 font-bold ring-2 disabled:cursor-wait disabled:opacity-60 ${direction === item.id ? "bg-amber-500 text-indigo-950 ring-amber-200" : "bg-white text-indigo-950 ring-sky-200"}`}><span aria-hidden="true">{item.icon}</span> {item.shortcut}. {item.label}</button>)}</div>
            <button type="button" onClick={scan} disabled={animalAnimating} className="mt-4 w-full rounded-xl bg-teal-600 py-3 font-bold text-white shadow active:bg-teal-700 disabled:cursor-wait disabled:opacity-60">{whaleAnimating ? "Watching Whale…" : dolphinAnimating ? "Watching Dolphins…" : "Scan This View"}</button>
          </div>
        )}
        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
        <style jsx>{`
          .lookout-boat-day { animation: lookoutBoatGlide 7s ease-in-out both; }
          .lookout-boat-night { animation: lookoutBoatDrift 9s ease-in-out both; }
          @keyframes lookoutBoatGlide { 0% { left: -45%; transform: translateY(4px) rotate(-0.5deg); } 25% { transform: translateY(0) rotate(0.4deg); } 55% { transform: translateY(3px) rotate(-0.3deg); } 100% { left: 105%; transform: translateY(0) rotate(0.2deg); } }
          @keyframes lookoutBoatDrift { 0% { left: -48%; transform: translateY(5px) rotate(-0.8deg); } 30% { transform: translateY(0) rotate(0.6deg); } 65% { transform: translateY(4px) rotate(-0.4deg); } 100% { left: 105%; transform: translateY(1px) rotate(0.3deg); } }
          @media (prefers-reduced-motion: reduce) { .lookout-boat { animation: none !important; left: 25%; } }
        `}</style>
      </div>
    </div>
  );
}
