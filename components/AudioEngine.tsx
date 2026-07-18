"use client";
import { useEffect, useRef, useState } from "react";
import { useGame, Zone } from "@/lib/store";
import { MUSIC, AMBIENCE_LOOP } from "@/lib/media";

// IMPORTANT: iOS Safari silently ignores HTMLMediaElement.volume — it is a
// hard platform restriction (volume there is only controllable by the
// hardware buttons/silent switch). Setting `audio.volume = x` is a no-op on
// iPhone, which is why sliders/mute previously updated the UI but never
// changed anything audible on an actual device. The fix is to route
// playback through the Web Audio API and control loudness with a GainNode
// instead, which iOS *does* allow JS to control.
//
// IMPORTANT #2: This component is the ONLY place that should ever mount a
// music <audio> element. Individual screens (Kitchen, the Lobster Trap,
// etc.) must never create their own background-music <audio> tags — doing
// that plays a second track simultaneously on top of whatever AudioEngine
// is already playing for the current zone (exactly what caused the Kitchen
// and Lobster Trap double-music bug). Instead, a screen that wants a
// specific track calls `setMusicOverride("kitchen")` (a key into MUSIC) via
// useGame(), and clears it back to null on cleanup/tab-away. AudioEngine
// picks up that override here and swaps its single music element to it.

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
  const { zone, state, musicOverride } = useGame();
  const [unlocked, setUnlocked] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackKeyRef = useRef<string>(musicOverride || zone);
  const currentVol = useRef({ music: 0, ambience: 0 });
  const settingsRef = useRef(state.audio);
  const zoneRef = useRef(zone);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const ambienceGainRef = useRef<GainNode | null>(null);
  const graphBuilt = useRef(false);

  zoneRef.current = zone;
  settingsRef.current = state.audio;

  const trackSrcFor = (key: string) => (MUSIC as Record<string, string>)[key] || TRACKS[key as Zone];

  const ensureGraph = () => {
    if (graphBuilt.current) return;
    if (!musicRef.current || !ambienceRef.current) return;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new Ctx();
      audioCtxRef.current = ctx;

      const musicSource = ctx.createMediaElementSource(musicRef.current);
      const musicGain = ctx.createGain();
      musicGain.gain.value = 0;
      musicSource.connect(musicGain).connect(ctx.destination);
      musicGainRef.current = musicGain;

      const ambienceSource = ctx.createMediaElementSource(ambienceRef.current);
      const ambienceGain = ctx.createGain();
      ambienceGain.gain.value = 0;
      ambienceSource.connect(ambienceGain).connect(ctx.destination);
      ambienceGainRef.current = ambienceGain;

      graphBuilt.current = true;

      if (process.env.NODE_ENV !== "production") {
        (window as any).__shorelineAudioDebug = () => ({
          usingWebAudio: true,
          contextState: ctx.state,
          musicGain: musicGainRef.current?.gain.value,
          ambienceGain: ambienceGainRef.current?.gain.value,
        });
      }
    } catch {
      // If building the Web Audio graph fails for any reason, tick() below
      // falls back to setting .volume directly (works everywhere except iOS).
      if (process.env.NODE_ENV !== "production") {
        (window as any).__shorelineAudioDebug = () => ({
          usingWebAudio: false,
          musicVolume: musicRef.current?.volume,
          ambienceVolume: ambienceRef.current?.volume,
        });
      }
    }
  };

  // Unlock audio + resume the AudioContext on the first user gesture
  // (required by both HTMLMediaElement autoplay policy and Web Audio API
  // on iOS Safari).
  useEffect(() => {
    if (unlocked) return;
    const unlock = () => {
      ensureGraph();
      const ctx = audioCtxRef.current;
      const els = [musicRef.current, ambienceRef.current];
      Promise.all([
        ctx ? ctx.resume().catch(() => {}) : Promise.resolve(),
        ...els.map((a) => (a ? a.play().catch(() => {}) : Promise.resolve())),
      ]).then(() => setUnlocked(true));
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, [unlocked]);

  // Swap the music track's source whenever the effective track (zone, or an
  // active screen override) actually changes. An override always wins over
  // the zone default while it is set.
  useEffect(() => {
    const nextKey = musicOverride || zone;
    if (currentTrackKeyRef.current === nextKey) return;
    currentTrackKeyRef.current = nextKey;
    const el = musicRef.current;
    if (!el) return;
    const wasPlaying = !el.paused;
    el.src = trackSrcFor(nextKey);
    el.loop = true;
    currentVol.current.music = 0;
    if (musicGainRef.current) musicGainRef.current.gain.value = 0;
    el.volume = 0;
    if (wasPlaying || unlocked) {
      void el.play().catch(() => {});
    }
  }, [zone, musicOverride, unlocked]);

  // Fade loop: guarded so a single bad frame can never permanently kill the
  // rAF chain. Prefers Web Audio GainNode volume control (works on iOS);
  // falls back to HTMLMediaElement.volume only if the graph failed to build.
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

        const speed = 0.8; // volume units per second (~1.2s fade)
        const cv = currentVol.current;
        cv.music = moveTowards(cv.music, musicTarget, speed * dt);
        cv.ambience = moveTowards(cv.ambience, ambienceTarget, speed * dt);

        const mv = clamp01(cv.music);
        const av = clamp01(cv.ambience);

        if (musicGainRef.current) {
          musicGainRef.current.gain.value = mv;
        } else if (musicRef.current) {
          musicRef.current.volume = mv;
        }
        if (ambienceGainRef.current) {
          ambienceGainRef.current.gain.value = av;
        } else if (ambienceRef.current) {
          ambienceRef.current.volume = av;
        }
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
      <audio ref={musicRef} src={trackSrcFor(currentTrackKeyRef.current)} loop preload="auto" crossOrigin="anonymous" />
      <audio ref={ambienceRef} src={AMBIENCE_LOOP} loop preload="auto" crossOrigin="anonymous" />
    </>
  );
}
