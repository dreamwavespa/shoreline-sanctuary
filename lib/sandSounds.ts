"use client";
export function playSandSound(kind: "hourglass" | "pour") {
  if (typeof window === "undefined") return;
  try {
    const audio = new Audio(kind === "hourglass" ? "/audio/shoreline-hourglass-sand.mp3" : "/audio/shoreline-sand-art-pour.mp3");
    audio.volume = kind === "hourglass" ? 0.42 : 0.35;
    void audio.play().catch(() => {});
  } catch { /* Optional sound; never block gameplay. */ }
}
