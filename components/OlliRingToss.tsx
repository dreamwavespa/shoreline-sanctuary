"use client";

import { useState } from "react";
import { useGame } from "@/lib/store";
import { localDateKey } from "@/lib/customSandArt";

type Direction = "left" | "center" | "right";
type Strength = "soft" | "medium" | "strong";
interface Target { direction: Direction; strength: Strength; distance: string; }

const DIRECTIONS: Direction[] = ["left", "center", "right"];
const STRENGTHS: Strength[] = ["soft", "medium", "strong"];
const DISTANCE_BY_STRENGTH: Record<Strength, string> = { soft: "near", medium: "middle", strong: "far" };

function newTarget(): Target {
  const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
  const strength = STRENGTHS[Math.floor(Math.random() * STRENGTHS.length)];
  return { direction, strength, distance: DISTANCE_BY_STRENGTH[strength] };
}

export default function OlliRingToss({ onClose }: { onClose: () => void }) {
  const { state, play, completeOlliRingToss } = useGame();
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<Target>(newTarget);
  const [direction, setDirection] = useState<Direction>("center");
  const [strength, setStrength] = useState<Strength>("medium");
  const [announcement, setAnnouncement] = useState("Olli raises one tentacle. Choose its direction and distance, then toss when ready.");
  const [finished, setFinished] = useState(false);

  const toss = () => {
    const hit = direction === target.direction && strength === target.strength;
    const nextScore = score + (hit ? 1 : 0);
    if (hit) {
      play("plastic", 0.6);
      window.setTimeout(() => play("questComplete", 0.4), 220);
    } else {
      play("oceanWaterSplash", 0.65);
    }
    if (round >= 5) {
      const result = completeOlliRingToss(nextScore);
      setScore(nextScore);
      setFinished(true);
      setAnnouncement(`Round complete with ${nextScore} of 5 rings landed. ${result.rewarded ? "Perfect score reward: 3 Sand Dollars." : nextScore === 5 ? "Today's perfect-score reward was already collected." : "Try again whenever you like."}`);
      return;
    }
    const nextTarget = newTarget();
    setScore(nextScore);
    setRound((value) => value + 1);
    setTarget(nextTarget);
    setAnnouncement(`${hit ? "The ring lands with a happy suction-pop!" : `Splash! Olli's target was ${target.direction}, ${target.distance}, needing a ${target.strength} toss.`} Round ${round + 1}: Olli raises a ${nextTarget.distance} tentacle on the ${nextTarget.direction}.`);
  };

  const restart = () => {
    setRound(1);
    setScore(0);
    setTarget(newTarget());
    setFinished(false);
    setAnnouncement("New game started. Olli raises one tentacle.");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sky-950/90 p-4" role="dialog" aria-modal="true" aria-labelledby="ring-toss-title" aria-describedby="ring-toss-description" onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}>
      <div className="mx-auto max-w-xl rounded-3xl bg-amber-50 p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-sky-700">Community Ship Party Game</p><h1 id="ring-toss-title" className="font-serif text-2xl font-bold text-sky-950">⭕ Olli’s Ring Toss</h1></div>
          <button type="button" autoFocus onClick={onClose} className="rounded-xl bg-sky-100 px-4 py-2 font-bold text-sky-950">Close</button>
        </div>
        <p id="ring-toss-description" className="mt-2 text-sm text-sky-800">Olli holds up a tentacle on the left, center, or right. Match the direction, using a soft toss for near, medium for middle, or strong for far. There is no timer.</p>
        <div className="mt-4 rounded-3xl bg-gradient-to-b from-cyan-200 to-blue-600 p-6 text-center text-sky-950 ring-1 ring-sky-300" role="img" aria-label={finished ? `Ring toss complete with ${score} of 5` : `Olli holds a ${target.distance} tentacle on the ${target.direction}`}>
          <p className="text-7xl" aria-hidden="true">🐙</p>
          {!finished && <p className="mt-2 font-bold">Target: {target.direction} · {target.distance}</p>}
          <p className="mt-1 text-sm font-semibold">Round {Math.min(round, 5)}/5 · Score {score}</p>
        </div>
        <p role="status" aria-live="polite" className="mt-3 min-h-12 rounded-xl bg-white p-3 text-sm font-semibold text-sky-900">{announcement}</p>

        {!finished ? <>
          <fieldset className="mt-4"><legend className="font-bold text-sky-950">Choose direction</legend><div className="mt-2 grid grid-cols-3 gap-2">{DIRECTIONS.map((value) => <button key={value} type="button" aria-pressed={direction === value} onClick={() => setDirection(value)} className={`min-h-11 rounded-xl px-2 py-2 text-sm font-bold ${direction === value ? "bg-sky-700 text-white" : "bg-white text-sky-900 ring-1 ring-sky-200"}`}>{value}</button>)}</div></fieldset>
          <fieldset className="mt-4"><legend className="font-bold text-sky-950">Choose toss strength</legend><div className="mt-2 grid grid-cols-3 gap-2">{STRENGTHS.map((value) => <button key={value} type="button" aria-pressed={strength === value} onClick={() => setStrength(value)} className={`min-h-11 rounded-xl px-2 py-2 text-sm font-bold ${strength === value ? "bg-teal-700 text-white" : "bg-white text-teal-900 ring-1 ring-teal-200"}`}>{value}</button>)}</div></fieldset>
          <button type="button" onClick={toss} className="mt-5 min-h-12 w-full rounded-xl bg-amber-600 px-4 py-3 font-bold text-white">Toss Woven Seagrass Ring</button>
        </> : <button type="button" onClick={restart} className="mt-5 min-h-12 w-full rounded-xl bg-sky-700 px-4 py-3 font-bold text-white">Play Another Round</button>}

        <p className="mt-3 text-xs text-sky-700">Best score: {state.olliRingBestScore}/5 · {state.olliRingRewardDate === localDateKey() ? "Today’s perfect-score reward collected" : "A perfect score awards 3 Sand Dollars today"}</p>
      </div>
    </div>
  );
}
