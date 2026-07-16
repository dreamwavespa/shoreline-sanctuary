"use client";
import { useEffect, useRef, useState } from "react";
import { useGame, Zone } from "@/lib/store";
import { MUSIC, AMBIENCE_LOOP } from "@/lib/media";

const TRACKS: Record<Zone, string> = {
  beach: MUSIC.beach,
  lighthouse: MUSIC.lighthouse,
  underwater: MUSIC.underwater,
};

function moveTowards(current: number, target: number, maxDelta: number) {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

export default function AudioEngine() {
  const { zone, state } = useGame();
  const [unlocked, setUnlocked] = useState(false);
  const beachRef = useRef<HTMLAudioElement | null>(null);
  const lighthouseRef = useRef<HTMLAudioElement | null>(null);
  const underwaterRef = useRef<HTMLAudioElement | null>(null);
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const currentVol = useRef({ beach: 0, lighthouse: 0, underwater: 0, ambience: 0 });
  const zoneRef = useRef(zone);
  const settingsRef = useRef(state.audio);

  zoneRef.current = zone;
  settingsRef.current = state.audio;

  useEffect(() => {
    if (unlocked) return;
    const unlock = () => {
      const all = [beachRef.current, lighthouseRef.current, underwaterRef.current, ambienceRef.current];
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
    let raf: number;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const settings = settingsRef.current;
      const activeZone = zoneRef.current;
      const musicCeiling = settings.musicMuted ? 0 : settings.music * settings.master;
      const ambienceCeiling = settings.ambience * settings.master;

      const targets = {
        beach: (activeZone === "beach" ? 1 : 0) * musicCeiling,
        lighthouse: (activeZone === "lighthouse" ? 1 : 0) * musicCeiling,
        underwater: (activeZone === "underwater" ? 1 : 0) * musicCeiling,
        ambience: ambienceCeiling,
      };

      const speed = 0.6;
      const cv = currentVol.current;
      cv.beach = moveTowards(cv.beach, targets.beach, speed * dt);
      cv.lighthouse = moveTowards(cv.lighthouse, targets.lighthouse, speed * dt);
      cv.underwater = moveTowards(cv.underwater, targets.underwater, speed * dt);
      cv.ambience = moveTowards(cv.ambience, targets.ambience, speed * dt);

      if (beachRef.current) beachRef.current.volume = cv.beach;
      if (lighthouseRef.current) lighthouseRef.current.volume = cv.lighthouse;
      if (underwaterRef.current) underwaterRef.current.volume = cv.underwater;
      if (ambienceRef.current) ambienceRef.current.volume = cv.ambience;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <audio ref={beachRef} src={TRACKS.beach} loop preload="auto" crossOrigin="anonymous" />
      <audio ref={lighthouseRef} src={TRACKS.lighthouse} loop preload="auto" crossOrigin="anonymous" />
      <audio ref={underwaterRef} src={TRACKS.underwater} loop preload="auto" crossOrigin="anonymous" />
      <audio ref={ambienceRef} src={AMBIENCE_LOOP} loop preload="auto" crossOrigin="anonymous" />
    </>
  );
}
