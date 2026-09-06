"use client";
import { useEffect, useRef, useState } from "react";
import { useGame, Zone } from "@/lib/store";
import { MUSIC, AMBIENCE_LOOP } from "@/lib/media";

// All game audio is routed through one Web Audio context. This is important on
// mobile browsers, where starting an independent HTMLAudioElement for a pickup
// or interaction can steal audio focus from looping background music.

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
  const swappingTrackRef = useRef(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const ambienceGainRef = useRef<GainNode | null>(null);
  const sfxGainRef = useRef<GainNode | null>(null);
  const graphBuilt = useRef(false);
  const routedSfxRef = useRef<WeakSet<HTMLMediaElement>>(new WeakSet());

  settingsRef.current = state.audio;

  const trackSrcFor = (key: string) =>
    (MUSIC as Record<string, string>)[key] || TRACKS[key as Zone];

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

      const sfxGain = ctx.createGain();
      sfxGain.gain.value = clamp01(0.75 * settingsRef.current.master);
      sfxGain.connect(ctx.destination);
      sfxGainRef.current = sfxGain;

      graphBuilt.current = true;
    } catch {
      // Direct media-element playback remains the fallback if Web Audio cannot
      // be initialized. This still works on desktop browsers.
    }
  };

  // The store creates cached `new Audio(...)` elements for SFX. Route those
  // elements into the same AudioContext as music and ambience before they
  // start playing. That prevents an SFX element from taking exclusive audio
  // focus and silencing the background track. The original play() still runs,
  // so bottle sequences keep receiving their normal `ended` events.
  useEffect(() => {
    if (!unlocked || !audioCtxRef.current || !sfxGainRef.current) return;

    const nativePlay = HTMLMediaElement.prototype.play;
    const engineMusic = musicRef.current;
    const engineAmbience = ambienceRef.current;

    HTMLMediaElement.prototype.play = function (...args: Parameters<HTMLMediaElement["play"]>) {
      const el = this as HTMLMediaElement;
      const ctx = audioCtxRef.current;
      const sfxGain = sfxGainRef.current;

      if (
        ctx &&
        sfxGain &&
        el !== engineMusic &&
        el !== engineAmbience &&
        !routedSfxRef.current.has(el)
      ) {
        try {
          const source = ctx.createMediaElementSource(el);
          source.connect(sfxGain);
          routedSfxRef.current.add(el);
          el.volume = 1;
        } catch {
          // If a media element has already been connected by the browser,
          // leave it on its existing route rather than breaking playback.
        }
      }

      if (ctx?.state === "suspended") {
        void ctx.resume().catch(() => {});
      }

      return nativePlay.apply(this, args as any);
    };

    return () => {
      HTMLMediaElement.prototype.play = nativePlay;
    };
  }, [unlocked]);

  // Unlock audio on the first pointer or keyboard gesture. Keyboard support is
  // required for screen-reader and non-pointer navigation.
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
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [unlocked]);

  // Keep the already-unlocked shared context active. This is intentionally
  // context-based rather than tied to arbitrary click timers.
  useEffect(() => {
    if (!unlocked) return;

    const keepContextActive = () => {
      const ctx = audioCtxRef.current;
      if (ctx?.state === "suspended") {
        void ctx.resume().catch(() => {});
      }
    };

    window.addEventListener("pointerdown", keepContextActive, true);
    window.addEventListener("keydown", keepContextActive, true);

    return () => {
      window.removeEventListener("pointerdown", keepContextActive, true);
      window.removeEventListener("keydown", keepContextActive, true);
    };
  }, [unlocked]);

  // Swap the single background-music element when the effective track changes.
  useEffect(() => {
    const nextKey = musicOverride || zone;
    if (currentTrackKeyRef.current === nextKey) return;

    currentTrackKeyRef.current = nextKey;
    const el = musicRef.current;
    if (!el) return;

    swappingTrackRef.current = true;
    const wasPlaying = !el.paused;
    el.src = trackSrcFor(nextKey);
    el.loop = true;
    currentVol.current.music = 0;

    if (musicGainRef.current) {
      musicGainRef.current.gain.value = 0;
      el.volume = 1;
    } else {
      el.volume = 0;
    }

    const finishSwap = () => {
      swappingTrackRef.current = false;
    };

    if (wasPlaying || unlocked) {
      void el.play().then(finishSwap).catch(finishSwap);
    } else {
      finishSwap();
    }
  }, [zone, musicOverride, unlocked]);

  // Fade music/ambience and continuously keep the context healthy. If an
  // older browser suspends the context after a media transition, the next
  // frame asks it to resume without restarting the track.
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

        if (sfxGainRef.current) {
          sfxGainRef.current.gain.value = clamp01(0.75 * master);
        }

        const ctx = audioCtxRef.current;
        if (unlocked && ctx?.state === "suspended") {
          void ctx.resume().catch(() => {});
        }
      } catch {
        // Never allow one audio error to kill the animation loop.
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [unlocked]);

  return (
    <>
      <audio
        ref={musicRef}
        src={trackSrcFor(currentTrackKeyRef.current)}
        loop
        preload="auto"
        crossOrigin="anonymous"
      />
      <audio
        ref={ambienceRef}
        src={AMBIENCE_LOOP}
        loop
        preload="auto"
        crossOrigin="anonymous"
      />
    </>
  );
}
