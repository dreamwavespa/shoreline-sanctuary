"use client";

import { useEffect } from "react";

const WATER = "/audio/kalsstockmedia-large-glass-of-water-filling-sound-fx-353321.mp3";
const CRINKLE = "/audio/Marshmallow/marshmallow-crinkle-ball.mp3";
const FISHING = "/audio/Marshmallow/marshmallow-fishing-toy.mp3";
const PURRS = [
  "/audio/Marshmallow/marshmallow-purr-short.mp3",
  "/audio/Marshmallow/marshmallow-purr-cozy.mp3",
];
const MEOWS = [
  "/audio/Marshmallow/meow1.mp3",
  "/audio/Marshmallow/meow2.mp3",
  "/audio/Marshmallow/meow3.mp3",
  "/audio/Marshmallow/meow4.mp3",
  "/audio/Marshmallow/meow5.mp3",
];

function play(src: string, volume = 0.72, stopAfterMs?: number) {
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    void audio.play().catch(() => {});
    if (stopAfterMs) {
      window.setTimeout(() => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {}
      }, stopAfterMs);
    }
  } catch {}
}

function happyReaction(delay = 450) {
  window.setTimeout(() => {
    const pool = Math.random() < 0.55 ? PURRS : MEOWS;
    play(pool[Math.floor(Math.random() * pool.length)], 0.58);
  }, delay);
}

export default function MarshmallowCareSounds() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button");
      if (!button) return;
      const label = (button.textContent || "").trim();

      if (label.includes("Refill Marshmallow's Water Bowl")) {
        // The source recording is 6.24s; stop at 3.8s so the daily interaction stays snappy.
        play(WATER, 0.66, 3800);
        happyReaction(2850);
        return;
      }

      if (label.includes("Give Crinkly Foil Ball") || label.includes("Play with Crinkly Foil Ball")) {
        play(CRINKLE, 0.72);
        happyReaction(500);
        return;
      }

      if (label.includes("Give Fishing Pole Toy") || label.includes("Play with Fishing Pole Toy")) {
        play(FISHING, 0.72);
        happyReaction(550);
        return;
      }

      if (label.includes("Search the Lighthouse")) {
        let attempts = 0;
        try { attempts = Number(window.localStorage.getItem("shoreline-marshmallow-toy-search-count") || "0"); } catch {}
        // The care panel increments after this click handler. Attempt 2 gets a quiet clue; attempt 3 gets the full found sound.
        if (attempts === 1) play(CRINKLE, 0.22, 900);
        if (attempts >= 2) {
          play(CRINKLE, 0.62);
          happyReaction(450);
        }
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
