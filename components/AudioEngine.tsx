"use client";
import { useEffect, useRef, useState } from "react";
import { useGame, Zone } from "@/lib/store";
import { MUSIC, AMBIENCE_LOOP } from "@/lib/media";

const TRACKS: Record<Zone, string> = {
  beach: MUSIC.beach,
  lighthouse: MUSIC.lighthouse,
  underwater: MUSIC.underwater,
};

function clamp01(v: number) {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function moveTowards(current: number, target: number, maxDelta: number) {
  const c = clamp01(current);
  const t = clamp01(target);
  if (Math.abs(t - c) <= maxDelta) return t;
  return clamp01(c + Math.sign(t - c) * maxDelta);
}

export default function AudioEngine() {
  const { zone, state } = useGame();
  const [unlocked, setUnlocked] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const currentZoneRef = useRef<Zone>(zone);
  const currentVol = useRef({ music: 0, ambience: 0 });
  const settingsRef = useRef(state.audio);
  const zoneRef = useRef(zone);

  zoneRef.current = zone;
  settingsRef.current = state.audio;

  useEffect(() => {
    if (unlocked) return;
    const unlock = () => {
      const all = [musicRef.current, ambienceRef.current];
      Promise.all(
        all.map((a) => {
          if (!a) return Promise.resolve();
          a.volume = 0;
          return a.play().catch(() => {});
        })
      ).then(() => setUnlocked(true));
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, [unlocked]);

  useEffect(() => {
    if (currentZoneRef.current === zone) return;
    currentZoneRef.current = zone;
    const el = musicRef.current;
    if (!el) return;
    const wasPlaying = !el.paused;
    el.src = TRACKS[zone];
    el.loop = true;
    currentVol.current.music = 0;
    el.volume = 0;
    if (wasPlaying || unlocked) {
      void el.play().catch(() => {});
    }
  }, [zone, unlocked]);

  useEffect(() => {
    let raf: number;
    let last = performance.now();
    const tick = (now: number) => {
      try {
        const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
        last = now;
        const settings = settingsRef.current;
        const master = clamp01(settings.master);
        const music = clamp01(settings.music);
        const ambience = clamp01(settings.ambience);
        const musicTarget = settings.musicMuted ? 0 : music * master;
        const ambienceTarget = ambience * master;

        const speed = 0.8;
        const cv = currentVol.current;
        cv.music = moveTowards(cv.music, musicTarget, speed * dt);
        cv.ambience = moveTowards(cv.ambience, ambienceTarget, speed * dt);

        if (musicRef.current) musicRef.current.volume = clamp01(cv.music);
        if (ambienceRef.current) ambienceRef.current.volume = clamp01(cv.ambience);
      } catch {
        // Never let a stray error kill the loop — just skip this frame.
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <audio ref={musicRef} src={TRACKS[zone]} loop preload="auto" crossOrigin="anonymous" />
      <audio ref={ambienceRef} src={AMBIENCE_LOOP} loop preload="auto" crossOrigin="anonymous" />
    </>
  );
}
