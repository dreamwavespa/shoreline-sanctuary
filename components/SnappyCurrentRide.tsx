"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";

type Lane = "left" | "center" | "right";
type EncounterType = "bubble" | "clear" | "seaweed" | "rock" | "debris";

interface Encounter {
  type: EncounterType;
  label: string;
  icon: string;
}

type CourseStep = Record<Lane, Encounter>;

const BUBBLE: Encounter = { type: "bubble", label: "a trail of bubbles", icon: "🫧" };
const CLEAR: Encounter = { type: "clear", label: "clear, gentle water", icon: "🌊" };
const SEAWEED: Encounter = { type: "seaweed", label: "a curtain of seaweed", icon: "🌿" };
const ROCK: Encounter = { type: "rock", label: "a smooth rock", icon: "🪨" };
const DEBRIS: Encounter = { type: "debris", label: "floating debris", icon: "🗑️" };

const COURSE: CourseStep[] = [
  { left: BUBBLE, center: CLEAR, right: SEAWEED },
  { left: ROCK, center: BUBBLE, right: CLEAR },
  { left: CLEAR, center: DEBRIS, right: BUBBLE },
  { left: BUBBLE, center: ROCK, right: CLEAR },
  { left: SEAWEED, center: BUBBLE, right: CLEAR },
  { left: CLEAR, center: BUBBLE, right: DEBRIS },
  { left: ROCK, center: CLEAR, right: BUBBLE },
  { left: BUBBLE, center: SEAWEED, right: CLEAR },
];

const LANES: { id: Lane; label: string; shortcut: string }[] = [
  { id: "left", label: "Left Lane", shortcut: "1" },
  { id: "center", label: "Center Lane", shortcut: "2" },
  { id: "right", label: "Right Lane", shortcut: "3" },
];

function describeStep(step: CourseStep) {
  return `Left lane: ${step.left.label}. Center lane: ${step.center.label}. Right lane: ${step.right.label}.`;
}

export default function SnappyCurrentRide({ onClose }: { onClose: () => void }) {
  const { state, collectItem, play } = useGame();
  const [stepIndex, setStepIndex] = useState(0);
  const [lane, setLane] = useState<Lane>("center");
  const [bubbles, setBubbles] = useState(0);
  const [bumps, setBumps] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [announcement, setAnnouncement] = useState("Begin when Snappy is ready to ride the gentle current.");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const currentStep = COURSE[stepIndex];
  const ridesCompleted = state.inventory["snappy-current-keepsake"] || 0;

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
      const shortcut: Record<string, Lane> = { "1": "left", "2": "center", "3": "right" };
      if (shortcut[event.key]) {
        event.preventDefault();
        chooseLane(shortcut[event.key]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const startRide = () => {
    setStepIndex(0);
    setLane("center");
    setBubbles(0);
    setBumps(0);
    setComplete(false);
    setPlaying(true);
    setAnnouncement(`Ride started. Segment 1 of ${COURSE.length}. ${describeStep(COURSE[0])} Choose left, center, or right. There is no time limit.`);
  };

  const chooseLane = (nextLane: Lane) => {
    if (!currentStep || !playing || complete) return;
    const encounter = currentStep[nextLane];
    const nextBubbles = bubbles + (encounter.type === "bubble" ? 1 : 0);
    const hitObstacle = encounter.type === "seaweed" || encounter.type === "rock" || encounter.type === "debris";
    const nextBumps = bumps + (hitObstacle ? 1 : 0);
    const nextStepIndex = stepIndex + 1;
    setLane(nextLane);
    setBubbles(nextBubbles);
    setBumps(nextBumps);

    if (encounter.type === "bubble") play("seaGlass");
    else if (hitObstacle) play("plastic");
    else play("shell");

    if (nextStepIndex >= COURSE.length) {
      collectItem("snappy-current-keepsake");
      setComplete(true);
      setPlaying(false);
      setAnnouncement(`Ride complete. Snappy entered the ${nextLane} lane and found ${encounter.label}. Collected ${nextBubbles} bubbles with ${nextBumps} ${nextBumps === 1 ? "bump" : "bumps"}.`);
      return;
    }

    setStepIndex(nextStepIndex);
    const result = encounter.type === "bubble"
      ? "Snappy collected a bubble trail."
      : hitObstacle
        ? `Snappy gently bumped ${encounter.label}, then continued safely.`
        : "Snappy glided through clear water.";
    setAnnouncement(`${result} Segment ${nextStepIndex + 1} of ${COURSE.length}. ${describeStep(COURSE[nextStepIndex])} Choose the next lane when you are ready.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#063d49]/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="current-ride-title">
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-cyan-50 via-sky-100 to-emerald-50 p-5 shadow-2xl ring-1 ring-cyan-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-800">Beach Mini-Game</p>
            <h2 id="current-ride-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold text-emerald-950 outline-none">🐢 Snappy’s Current Ride</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-emerald-950 ring-1 ring-emerald-300">Close</button>
        </div>

        {!playing && !complete ? (
          <div className="mt-5">
            <p className="text-emerald-950">Guide Snappy through eight gentle current segments. Each segment clearly describes all three lanes. Collect bubbles, avoid seaweed, rocks, and floating debris, and choose whenever you are ready—nothing is timed.</p>
            <div className="mt-5 rounded-3xl bg-cyan-100 p-5 text-center ring-1 ring-cyan-200" role="img" aria-label="Snappy the sea turtle waiting in calm blue water with bubbles nearby">
              <div className="text-7xl" aria-hidden="true">🐢</div>
              <div className="text-4xl" aria-hidden="true">🌊 🫧 🌊</div>
            </div>
            <button type="button" onClick={startRide} className="mt-5 w-full rounded-xl bg-emerald-700 py-3 font-bold text-white shadow active:bg-emerald-800">Begin Current Ride</button>
            <p className="mt-4 text-center text-sm font-semibold text-teal-800">Rides completed: {ridesCompleted}</p>
          </div>
        ) : complete ? (
          <div className="mt-6 text-center">
            <div className="text-7xl" aria-hidden="true">🐢🫧</div>
            <h3 className="mt-3 text-xl font-bold text-emerald-950">Current Ride Complete!</h3>
            <p className="mt-2 text-emerald-800">Bubbles collected: {bubbles}/8 · Bumps: {bumps}</p>
            <p className="mt-2 font-semibold text-teal-800">Rides completed: {ridesCompleted}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={startRide} className="rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white">Ride Again</button>
              <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-3 font-bold text-emerald-950 ring-1 ring-emerald-300">Return to Beach</button>
            </div>
          </div>
        ) : currentStep ? (
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-semibold text-emerald-950">
              <span>Segment {stepIndex + 1}/{COURSE.length}</span>
              <span>Bubbles: {bubbles} · Bumps: {bumps}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-cyan-200" role="progressbar" aria-label="Current ride progress" aria-valuemin={0} aria-valuemax={COURSE.length} aria-valuenow={stepIndex}>
              <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${(stepIndex / COURSE.length) * 100}%` }} />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 rounded-3xl bg-sky-700 p-3" role="img" aria-label={`Snappy is in the ${lane} lane. ${describeStep(currentStep)}`}>
              {LANES.map((item) => (
                <div key={item.id} className={`min-h-40 rounded-2xl p-3 text-center text-white ${lane === item.id ? "bg-cyan-500 ring-4 ring-amber-300" : "bg-sky-600"}`}>
                  <p className="text-sm font-bold">{item.label}</p>
                  <div className="mt-3 text-4xl" aria-hidden="true">{currentStep[item.id].icon}</div>
                  {lane === item.id && <div className="mt-3 text-4xl" aria-hidden="true">🐢</div>}
                  <p className="mt-2 text-sm">{currentStep[item.id].label}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 font-semibold text-emerald-950">Choose Snappy’s lane. There is no time limit.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {LANES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => chooseLane(item.id)}
                  aria-keyshortcuts={item.shortcut}
                  className="min-h-20 rounded-xl bg-emerald-700 p-3 font-bold text-white shadow active:bg-emerald-800"
                >
                  {item.shortcut}. {item.label}<span className="mt-1 block text-sm font-normal text-emerald-100">{currentStep[item.id].label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      </div>
    </div>
  );
}
