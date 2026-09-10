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
  { id: "lookout-sunlit-sailboat", name: "Sunlit Sailboat", icon: "⛵", description: "A small white sailboat crosses the open horizon with a bright teal sail.", clue: "A triangle of teal moves slowly along the open horizon.", direction: "horizon", mode: "day" },
  { id: "lookout-dolphin-family", name: "Dolphin Family", icon: "🐬", description: "A family of dolphins leaps beside the eastern reef, the smallest one following close behind.", clue: "Quick splashes sparkle near the eastern reef.", direction: "east", mode: "day" },
  { id: "lookout-roseate-spoonbills", name: "Roseate Spoonbills", icon: "🦩", description: "Four unusual pink spoonbills glide high above the island on broad, quiet wings.", clue: "A flash of pink feathers circles high overhead.", direction: "sky", mode: "day" },
  { id: "lookout-distant-island", name: "Distant Moonlit Island", icon: "🏝️", description: "A tiny island appears beyond the western cove, outlined by moonlight and a ring of pale surf.", clue: "A dark shape edged in silver rests beyond the west cove.", direction: "west", mode: "night" },
  { id: "lookout-lantern-boat", name: "Lantern Fishing Boat", icon: "🚤", description: "A fishing boat drifts across the horizon with warm lanterns reflected in the water.", clue: "Three warm lights bob along the open horizon.", direction: "horizon", mode: "night" },
  { id: "lookout-moonlit-whale", name: "Moonlit Whale", icon: "🐳", description: "A lone whale lifts its tail beside the eastern reef, then slips quietly beneath the water.", clue: "A wide silver ripple spreads near the eastern reef.", direction: "east", mode: "night" },
  { id: "lookout-shooting-stars", name: "Shooting Star Pair", icon: "🌠", description: "Two shooting stars cross high above the lighthouse, one bright gold and one soft blue.", clue: "A quick streak of light flickers in the high sky.", direction: "sky", mode: "night" },
];

export default function LighthouseLookout({ onClose }: { onClose: () => void }) {
  const { state, addLookoutSighting, play } = useGame();
  const [mode, setMode] = useState<WatchMode>("day");
  const [direction, setDirection] = useState<Direction>("horizon");
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [currentSighting, setCurrentSighting] = useState<LookoutSighting | null>(null);
  const [roundFinds, setRoundFinds] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("Choose a daylight or starry-night lookout watch.");
  const headingRef = useRef<HTMLHeadingElement>(null);

  const modeSightings = useMemo(() => SIGHTINGS.filter((sighting) => sighting.mode === mode), [mode]);
  const journalCount = SIGHTINGS.filter((sighting) => state.lookoutSightings.includes(sighting.id)).length;
  const selectedDirection = DIRECTIONS.find((item) => item.id === direction) || DIRECTIONS[1];
  const clue = modeSightings.find((sighting) => sighting.direction === direction)?.clue || "The view is calm.";

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (!playing || complete) return;
      const keyboardDirection: Record<string, Direction> = {
        "1": "west",
        "2": "horizon",
        "3": "east",
        "4": "sky",
        ArrowLeft: "west",
        ArrowRight: "east",
        ArrowUp: "sky",
        ArrowDown: "horizon",
      };
      const nextDirection = keyboardDirection[event.key];
      if (nextDirection) {
        event.preventDefault();
        moveTelescope(nextDirection);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const startWatch = () => {
    setDirection("horizon");
    setCurrentSighting(null);
    setRoundFinds([]);
    setComplete(false);
    setPlaying(true);
    setAnnouncement(`${mode === "day" ? "Daylight" : "Starry-night"} watch started. The telescope is aimed at the open horizon. ${modeSightings.find((sighting) => sighting.direction === "horizon")?.clue}`);
  };

  const moveTelescope = (nextDirection: Direction) => {
    const next = DIRECTIONS.find((item) => item.id === nextDirection) || DIRECTIONS[1];
    const nextClue = modeSightings.find((sighting) => sighting.direction === nextDirection)?.clue || "The view is calm.";
    setDirection(nextDirection);
    setCurrentSighting(null);
    play("driftwood");
    setAnnouncement(`Telescope aimed at ${next.label}. ${nextClue} Select Scan This View to look closer.`);
  };

  const scan = () => {
    const sighting = modeSightings.find((item) => item.direction === direction);
    if (!sighting) return;
    const alreadyInRound = roundFinds.includes(sighting.id);
    const alreadyInJournal = state.lookoutSightings.includes(sighting.id);
    setCurrentSighting(sighting);
    if (!alreadyInRound) setRoundFinds((finds) => [...finds, sighting.id]);
    if (!alreadyInJournal) addLookoutSighting(sighting.id);
    play(alreadyInRound ? "shell" : "questComplete");

    const nextCount = alreadyInRound ? roundFinds.length : roundFinds.length + 1;
    if (nextCount === modeSightings.length) {
      setComplete(true);
      setPlaying(false);
      setAnnouncement(`${sighting.name}. ${sighting.description} ${mode === "day" ? "Daylight" : "Starry-night"} watch complete. All four sightings are in the lookout journal.`);
    } else {
      setAnnouncement(`${sighting.name}. ${sighting.description}${alreadyInJournal ? " This sighting was already in your journal." : " New journal entry unlocked."} ${modeSightings.length - nextCount} sightings remain in this watch.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07152f]/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="lookout-title">
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-indigo-950 via-sky-950 to-amber-50 p-5 shadow-2xl ring-1 ring-sky-300">
        <div className="flex items-start justify-between gap-4 text-white">
          <div>
            <p className="text-sm font-semibold text-sky-200">Lighthouse Mini-Game</p>
            <h2 id="lookout-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold outline-none">🔭 Lighthouse Lookout</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-indigo-950">Close</button>
        </div>

        {!playing && !complete ? (
          <div className="mt-5 rounded-2xl bg-white/95 p-4">
            <p className="text-indigo-950">Choose a watch, aim the telescope in four directions, and scan each view. Every new discovery unlocks a permanent lookout journal entry.</p>
            <fieldset className="mt-5">
              <legend className="font-bold text-indigo-950">Choose a lookout watch</legend>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {(["day", "night"] as WatchMode[]).map((option) => {
                  const found = SIGHTINGS.filter((sighting) => sighting.mode === option && state.lookoutSightings.includes(sighting.id)).length;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={mode === option}
                      onClick={() => {
                        setMode(option);
                        setAnnouncement(`${option === "day" ? "Daylight" : "Starry-night"} watch selected. ${found} of 4 journal entries found.`);
                      }}
                      className={`rounded-xl p-4 text-left ring-2 ${mode === option ? "bg-indigo-700 text-white ring-indigo-800" : "bg-sky-50 text-indigo-950 ring-sky-200"}`}
                    >
                      <span className="block text-3xl" aria-hidden="true">{option === "day" ? "☀️" : "🌙"}</span>
                      <span className="block font-bold">{option === "day" ? "Daylight Watch" : "Starry-Night Watch"}</span>
                      <span className={`mt-1 block text-sm ${mode === option ? "text-indigo-100" : "text-indigo-700"}`}>Journal: {found}/4</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <button type="button" onClick={startWatch} className="mt-5 w-full rounded-xl bg-amber-600 py-3 font-bold text-white shadow active:bg-amber-700">Begin Lookout Watch</button>
            <p className="mt-4 text-center text-sm font-semibold text-teal-800">Lookout journal: {journalCount}/8 discoveries</p>
          </div>
        ) : complete ? (
          <div className="mt-5 rounded-2xl bg-white/95 p-5 text-center">
            <div className="text-6xl" aria-hidden="true">{mode === "day" ? "☀️🔭" : "🌙🔭"}</div>
            <h3 className="mt-3 text-xl font-bold text-indigo-950">{mode === "day" ? "Daylight" : "Starry-Night"} Watch Complete!</h3>
            <p className="mt-2 text-indigo-800">All four sightings from this watch are recorded.</p>
            <p className="mt-2 font-semibold text-teal-800">Lookout journal: {journalCount}/8 discoveries</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={startWatch} className="rounded-xl bg-amber-600 px-4 py-3 font-bold text-white">Watch Again</button>
              <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-3 font-bold text-indigo-950 ring-1 ring-indigo-300">Return to Lighthouse</button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <div className="rounded-3xl bg-sky-100 p-5 text-center ring-4 ring-amber-500 shadow-inner">
              <p className="text-sm font-semibold text-indigo-800">{mode === "day" ? "Daylight Watch" : "Starry-Night Watch"} · Found {roundFinds.length}/4</p>
              <div className="mt-3 min-h-36 rounded-full border-[10px] border-indigo-950 bg-gradient-to-b from-sky-300 to-cyan-100 p-6 shadow-inner" role="img" aria-label={currentSighting ? `${currentSighting.name}. ${currentSighting.description}` : `Telescope aimed at ${selectedDirection.label}. ${clue}`}>
                <div className="text-6xl" aria-hidden="true">{currentSighting?.icon || selectedDirection.icon}</div>
                <p className="mt-2 font-bold text-indigo-950">{currentSighting?.name || selectedDirection.label}</p>
                <p className="mt-1 text-sm text-indigo-800">{currentSighting?.description || clue}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Telescope directions">
              {DIRECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={direction === item.id}
                  aria-keyshortcuts={`${item.shortcut}${item.id === "west" ? " ArrowLeft" : item.id === "east" ? " ArrowRight" : item.id === "sky" ? " ArrowUp" : " ArrowDown"}`}
                  onClick={() => moveTelescope(item.id)}
                  className={`min-h-20 rounded-xl p-3 font-bold ring-2 ${direction === item.id ? "bg-amber-500 text-indigo-950 ring-amber-200" : "bg-white text-indigo-950 ring-sky-200"}`}
                >
                  <span aria-hidden="true">{item.icon}</span> {item.shortcut}. {item.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={scan} className="mt-4 w-full rounded-xl bg-teal-600 py-3 font-bold text-white shadow active:bg-teal-700">Scan This View</button>
          </div>
        )}

        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      </div>
    </div>
  );
}
