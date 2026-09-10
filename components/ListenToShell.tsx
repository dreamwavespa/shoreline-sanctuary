"use client";

import { useEffect, useRef, useState } from "react";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";

type IslandSoundId = "waves" | "gulls" | "rain" | "whale" | "chimes";
type Difficulty = "gentle" | "explorer";

interface IslandSound {
  id: IslandSoundId;
  name: string;
  location: string;
  hint: string;
  icon: string;
  file: string;
}

const ISLAND_SOUNDS: IslandSound[] = [
  { id: "waves", name: "Rolling Waves", location: "the main beach", hint: "A broad rushing sound rises, softens, and rises again.", icon: "🌊", file: "/audio/listen-to-shell/waves.mp3" },
  { id: "gulls", name: "Calling Gulls", location: "the picnic shore", hint: "A clear seabird call carries above the water.", icon: "🕊️", file: "/audio/listen-to-shell/gulls.mp3" },
  { id: "rain", name: "Gentle Rain", location: "the cottage windows", hint: "Many light droplets patter close together.", icon: "🌧️", file: "/audio/listen-to-shell/rain.mp3" },
  { id: "whale", name: "Whale Song", location: "the deep reef", hint: "A low voice bends slowly through the water.", icon: "🐋", file: "/audio/listen-to-shell/whale.mp3" },
  { id: "chimes", name: "Wind Chimes", location: "the craft workshop", hint: "Bright notes ring one after another in the breeze.", icon: "🎐", file: "/audio/listen-to-shell/chimes.mp3" },
];

const DIFFICULTIES: Record<Difficulty, { name: string; soundIds: IslandSoundId[]; rounds: number }> = {
  gentle: { name: "Gentle Listening", soundIds: ["waves", "gulls", "rain"], rounds: 5 },
  explorer: { name: "Island Explorer", soundIds: ["waves", "gulls", "rain", "whale", "chimes"], rounds: 7 },
};

export default function ListenToShell({ onClose }: { onClose: () => void }) {
  const { state, setAudioSetting, collectItem } = useGame();
  const [difficulty, setDifficulty] = useState<Difficulty>("gentle");
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [targetId, setTargetId] = useState<IslandSoundId>("waves");
  const [answerLocked, setAnswerLocked] = useState(false);
  const [rewardItemId, setRewardItemId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("Explore the practice sounds or choose a listening level.");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const originalMusicMutedRef = useRef(state.audio.musicMuted);
  const difficultyConfig = DIFFICULTIES[difficulty];
  const availableSounds = ISLAND_SOUNDS.filter((sound) => difficultyConfig.soundIds.includes(sound.id));
  const targetSound = ISLAND_SOUNDS.find((sound) => sound.id === targetId) || ISLAND_SOUNDS[0];

  useEffect(() => {
    headingRef.current?.focus();
    setAudioSetting("musicMuted", true);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setAudioSetting("musicMuted", originalMusicMutedRef.current);
    };
  }, []);

  const playIslandSound = (sound: IslandSound, announce = true) => {
    const audio = audioRef.current || new Audio();
    audio.pause();
    audio.currentTime = 0;
    audio.src = sound.file;
    audio.volume = state.audio.master;
    audioRef.current = audio;
    audio.play().catch(() => {
      setAnnouncement("The sound could not start. Press Replay Mystery Sound to try again.");
    });
    if (announce) setAnnouncement(`Playing ${sound.name} practice sound. It belongs to ${sound.location}.`);
  };

  const chooseTarget = (soundIds: IslandSoundId[], previous?: IslandSoundId) => {
    const choices = soundIds.filter((id) => id !== previous);
    return choices[Math.floor(Math.random() * choices.length)] || soundIds[0];
  };

  const beginRound = () => {
    const nextTarget = chooseTarget(difficultyConfig.soundIds);
    const nextSound = ISLAND_SOUNDS.find((item) => item.id === nextTarget) || ISLAND_SOUNDS[0];
    setRoundIndex(0);
    setScore(0);
    setComplete(false);
    setRewardItemId(null);
    setTargetId(nextTarget);
    setAnswerLocked(false);
    setPlaying(true);
    setAnnouncement(`Round 1 of ${difficultyConfig.rounds}. Listen carefully, then choose where this sound came from.${hintsEnabled ? ` Hint: ${nextSound.hint}` : ""}`);
    playIslandSound(nextSound, false);
  };

  const answer = (sound: IslandSound) => {
    if (answerLocked) return;
    setAnswerLocked(true);
    const correct = sound.id === targetId;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    const isLastRound = roundIndex + 1 >= difficultyConfig.rounds;

    if (isLastRound) {
      const reward = difficulty === "explorer" && nextScore === difficultyConfig.rounds ? "shell-abalone" : "shell-cowrie";
      const timer = window.setTimeout(() => {
        collectItem(reward);
        setRewardItemId(reward);
        setComplete(true);
        setPlaying(false);
        setAnswerLocked(false);
        setAnnouncement(`${correct ? "Correct" : `That was ${targetSound.name}`}. Game complete with ${nextScore} of ${difficultyConfig.rounds} correct. ${ITEMS[reward].name} added to your inventory.`);
      }, 700);
      timersRef.current.push(timer);
      return;
    }

    const nextTarget = chooseTarget(difficultyConfig.soundIds, targetId);
    setAnnouncement(correct ? `Correct. The sound came from ${targetSound.location}.` : `That was ${targetSound.name} from ${targetSound.location}.`);
    const timer = window.setTimeout(() => {
      const nextRound = roundIndex + 1;
      const nextSound = ISLAND_SOUNDS.find((item) => item.id === nextTarget) || ISLAND_SOUNDS[0];
      setRoundIndex(nextRound);
      setTargetId(nextTarget);
      setAnswerLocked(false);
      setAnnouncement(`Round ${nextRound + 1} of ${difficultyConfig.rounds}. Listen carefully.${hintsEnabled ? ` Hint: ${nextSound.hint}` : ""}`);
      playIslandSound(nextSound, false);
    }, 1150);
    timersRef.current.push(timer);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#062f3a]/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="listen-shell-title">
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-cyan-50 to-blue-100 p-5 shadow-2xl ring-1 ring-cyan-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-cyan-800">Community Ship Mini-Game</p>
            <h2 id="listen-shell-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold text-blue-950 outline-none">🐚 Listen to the Shell</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-blue-950 ring-1 ring-blue-300">Close</button>
        </div>

        {!playing && !complete ? (
          <div className="mt-5">
            <p className="text-blue-950">Listen to a sound carried by the shell, then identify where on the island it came from. The ship’s music pauses automatically while you play.</p>

            <section aria-labelledby="practice-sounds-heading" className="mt-5 rounded-2xl bg-white/75 p-4 ring-1 ring-cyan-200">
              <h3 id="practice-sounds-heading" className="font-bold text-blue-950">Practice Sounds</h3>
              <p className="mt-1 text-sm text-blue-800">Hear each sound and learn its island location before starting.</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ISLAND_SOUNDS.map((sound) => (
                  <button key={sound.id} type="button" onClick={() => playIslandSound(sound)} className="rounded-xl bg-cyan-100 px-3 py-3 text-left text-sm text-blue-950 ring-1 ring-cyan-300">
                    <span aria-hidden="true">{sound.icon} </span><span className="font-bold">Hear {sound.name}</span><span className="block text-xs text-blue-700">From {sound.location}</span>
                  </button>
                ))}
              </div>
            </section>

            <fieldset className="mt-5">
              <legend className="font-bold text-blue-950">Choose a listening level</legend>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(Object.keys(DIFFICULTIES) as Difficulty[]).map((option) => (
                  <button key={option} type="button" aria-pressed={difficulty === option} onClick={() => setDifficulty(option)} className={`rounded-xl p-3 text-left ring-2 ${difficulty === option ? "bg-blue-800 text-white ring-blue-900" : "bg-white text-blue-950 ring-blue-200"}`}>
                    <span className="block font-bold">{DIFFICULTIES[option].name}</span>
                    <span className={`block text-sm ${difficulty === option ? "text-blue-100" : "text-blue-700"}`}>{DIFFICULTIES[option].soundIds.length} sounds · {DIFFICULTIES[option].rounds} rounds</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mt-4 flex items-center gap-3 rounded-xl bg-white/80 p-3 text-blue-950 ring-1 ring-blue-200">
              <input type="checkbox" checked={hintsEnabled} onChange={(event) => setHintsEnabled(event.target.checked)} className="h-5 w-5 accent-blue-700" />
              <span><span className="font-bold">Spoken hints</span><span className="block text-sm text-blue-700">Show and announce a description of each mystery sound.</span></span>
            </label>

            <button type="button" onClick={beginRound} className="mt-5 w-full rounded-xl bg-cyan-700 py-3 font-bold text-white shadow active:bg-cyan-800">Start Listening</button>
          </div>
        ) : complete ? (
          <div className="mt-6 text-center">
            <div className="text-5xl" aria-hidden="true">🐚🎶</div>
            <h3 className="mt-2 text-xl font-bold text-blue-950">Island Sounds Identified!</h3>
            <p className="mt-2 text-blue-900">Score: {score} of {difficultyConfig.rounds}</p>
            {rewardItemId && <p className="mt-2 font-semibold text-cyan-800">Reward: {ITEMS[rewardItemId].name}</p>}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={beginRound} className="rounded-xl bg-cyan-700 px-4 py-3 font-bold text-white">Play Again</button>
              <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-3 font-bold text-blue-900 ring-1 ring-blue-300">Return to Ship</button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-semibold text-blue-950">
              <span>Round {roundIndex + 1} of {difficultyConfig.rounds}</span>
              <span>Score: {score}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-200" role="progressbar" aria-label="Listening rounds completed" aria-valuemin={0} aria-valuemax={difficultyConfig.rounds} aria-valuenow={roundIndex}>
              <div className="h-full rounded-full bg-cyan-600 transition-all" style={{ width: `${(roundIndex / difficultyConfig.rounds) * 100}%` }} />
            </div>

            <div className="mt-5 rounded-3xl bg-white/80 p-5 text-center ring-1 ring-cyan-200">
              <div className="text-5xl" aria-hidden="true">🐚</div>
              <h3 className="mt-2 text-lg font-bold text-blue-950">Mystery Island Sound</h3>
              {hintsEnabled && <p className="mt-2 text-blue-800">Hint: {targetSound.hint}</p>}
              <button
                type="button"
                onClick={() => {
                  setAnnouncement(`Replaying mystery sound.${hintsEnabled ? ` Hint: ${targetSound.hint}` : ""}`);
                  playIslandSound(targetSound, false);
                }}
                className="mt-4 w-full rounded-xl bg-cyan-700 py-3 font-bold text-white"
              >
                Replay Mystery Sound
              </button>
            </div>

            <fieldset className="mt-5" disabled={answerLocked}>
              <legend className="font-bold text-blue-950">Where did the sound come from?</legend>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {availableSounds.map((sound) => (
                  <button key={sound.id} type="button" onClick={() => answer(sound)} className="rounded-xl bg-blue-800 px-4 py-3 text-left font-bold text-white disabled:opacity-55">
                    <span aria-hidden="true">{sound.icon} </span>{sound.location}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      </div>
    </div>
  );
}