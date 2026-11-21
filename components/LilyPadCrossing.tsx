"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";

const lanes = ["left", "center", "right"] as const;
type Lane = (typeof lanes)[number];
const rows = [78, 65, 52, 39, 26];
const columns = [23, 50, 77];

function makeRoute(): Lane[] {
  let previous = 1;
  return rows.map(() => {
    const choices = lanes.filter((_, index) => Math.abs(index - previous) <= 1);
    const lane = choices[Math.floor(Math.random() * choices.length)];
    previous = lanes.indexOf(lane);
    return lane;
  });
}

const action = "min-h-11 rounded-lg bg-emerald-900 px-3 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400 aria-disabled:opacity-60";
const padStyle = "absolute h-7 w-14 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 shadow-md";

export default function LilyPadCrossing() {
  const { state, play, claimLilyPadReward } = useGame();
  const frog = useRef<HTMLAudioElement>(null);
  const cueLane = useRef<Lane | null>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  const [route, setRoute] = useState<Lane[]>([]);
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const target = route[step];
  const finished = route.length > 0 && step === route.length;

  useEffect(() => {
    const audio = frog.current;
    return () => audio?.pause();
  }, []);

  const playCue = (lane: Lane) => {
    const audio = frog.current;
    if (!audio) return;
    audio.pause();
    if (cueLane.current !== lane) {
      cueLane.current = lane;
      audio.src = `/audio/pond/frog-${lane}.mp3`;
    } else {
      audio.currentTime = 0;
    }
    audio.volume = state.audio.master * 0.85;
    window.dispatchEvent(new Event("shoreline:audio-interaction"));
    void audio.play()
      .then(() => window.dispatchEvent(new Event("shoreline:audio-interaction")))
      .catch(() => {});
  };

  const start = () => {
    const next = makeRoute();
    setRoute(next);
    setStep(0);
    setMessage("You’re on the near bank. Follow the frog to the first lily pad.");
    playCue(next[0]);
  };

  const jump = (lane: Lane) => {
    if (!target) return;
    if (lane !== target) {
      frog.current?.pause();
      play("oceanWaterSplash", 0.55);
      setStep(0);
      setMessage(`Splash! The ${lane} jump missed. You’re back on the near bank. Listen to the frog again to retry.`);
      return;
    }

    const landed = step + 1;
    setStep(landed);
    if (landed === route.length) {
      frog.current?.pause();
      play("questComplete", 0.55);
      window.requestAnimationFrame(() => startButton.current?.focus());
      setMessage(claimLilyPadReward()
        ? "You crossed the pond! You earned 2 Sand Dollars."
        : "You crossed the pond! You’ve already collected today’s reward.");
      return;
    }

    setMessage(`You landed on the ${lane} pad. ${landed} of ${route.length} jumps complete. Replay the frog clue if needed.`);
    playCue(route[landed]);
  };

  return (
    <details className="rounded-xl bg-emerald-50 p-3 text-emerald-950 ring-1 ring-emerald-200"
      onToggle={(event) => { if (!event.currentTarget.open) frog.current?.pause(); }}>
      <summary className="min-h-11 cursor-pointer rounded py-2 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400">
        Play Lily Pad Crossing
      </summary>
      <div className="space-y-3 pt-2">
        <p className="text-sm">
          Follow the frog across five lily pads. One croak means left, two mean center, and three mean right.
          Look for the frog on the board or reveal the direction in text. Take your time.
        </p>
        <div className="flex flex-wrap gap-2">
          <button ref={startButton} type="button" className={action} aria-disabled={!!target} onClick={() => { if (!target) start(); }}>
            {finished ? "Cross again" : "Start crossing"}
          </button>
          <button type="button" className={action} aria-disabled={!target} onClick={() => { if (target) playCue(target); }}>
            Replay frog clue
          </button>
          <button type="button" className={action} aria-disabled={!target} onClick={() => {
            if (target) setMessage(`Jump to the ${target} lily pad.`);
          }}>
            Reveal direction
          </button>
        </div>
        <div className="relative isolate aspect-[3/2] overflow-hidden rounded-lg bg-emerald-900">
          <Image src="/images/Robin/woodland-pond.webp" alt="" fill sizes="(max-width: 768px) 100vw, 720px"
            unoptimized className="object-cover brightness-75" />
          <span aria-hidden="true" className="absolute left-1/2 top-1 -translate-x-1/2 rounded bg-emerald-950/90 px-2 py-1 text-xs font-semibold text-white">
            {finished ? "You crossed!" : "Far bank"}
          </span>
          {rows.flatMap((top, row) => columns.map((left, column) => {
            const visited = row < step && route[row] === lanes[column];
            return <span key={`${row}-${column}`} aria-hidden="true" style={{ left: `${left}%`, top: `${top}%` }}
              className={`${padStyle} ${visited ? "border-white bg-emerald-200" : "border-lime-800 bg-lime-600/85"}`} />;
          }))}
          {lanes.map((lane, index) => <button key={lane} type="button" aria-label={`Jump to the ${lane} lily pad`}
            aria-disabled={!target} onClick={() => jump(lane)}
            className={`absolute z-10 flex h-11 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-4 focus-visible:outline-white ${!target ? "pointer-events-none opacity-0" : ""}`}
            tabIndex={target ? 0 : -1} aria-hidden={target ? undefined : true}
            style={{ left: `${columns[index]}%`, top: `${rows[Math.min(step, rows.length - 1)]}%` }}>
            {target === lane && <span aria-hidden="true" className="rounded-full bg-emerald-900 px-2 text-xl shadow ring-2 ring-amber-300">🐸</span>}
          </button>)}
        </div>
        <p role="status" aria-atomic="true" className="min-h-6 text-sm font-semibold">{message}</p>
        <p className="text-sm">First crossing each day earns 2 Sand Dollars.</p>
        <audio ref={frog} preload="auto" />
      </div>
    </details>
  );
}
