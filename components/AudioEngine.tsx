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

const BEACH_PLAYLIST = [
  MUSIC.beach,
  "/audio/Glow%20on%20the%20Tide.mp3",
  "/audio/Luminous%20Tides.mp3",
];

// Shuffle each set of three songs, so every track plays before one repeats.
function shuffleBeachTracks(excludeFirst?: number): number[] {
  const order = BEACH_PLAYLIST.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.length > 1 && order[0] === excludeFirst) {
    const swap = 1 + Math.floor(Math.random() * (order.length - 1));
    [order[0], order[swap]] = [order[swap], order[0]];
  }
  return order;
}

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
  const beachOrderRef = useRef<number[]>([]);
  const beachPositionRef = useRef(0);
  const lastBeachTrackRef = useRef<number | undefined>(undefined);
  if (beachOrderRef.current.length === 0) beachOrderRef.current = shuffleBeachTracks();
  const currentVol = useRef({ music: 0, ambience: 0 });
  const settingsRef = useRef(state.audio);
  const zoneRef = useRef(zone);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const ambienceGainRef = useRef<GainNode | null>(null);
  const graphBuilt = useRef(false);
  const musicRetryRef = useRef(0);

  zoneRef.current = zone;
  settingsRef.current = state.audio;

  const trackSrcFor = (key: string) => key === "beach" ? BEACH_PLAYLIST[beachOrderRef.current[beachPositionRef.current]] : (MUSIC as Record<string, string>)[key] || TRACKS[key as Zone];

  const onMusicEnded = () => {
    const el = musicRef.current;
    if (!el || currentTrackKeyRef.current !== "beach") return;
    lastBeachTrackRef.current = beachOrderRef.current[beachPositionRef.current];
    beachPositionRef.current++;
    if (beachPositionRef.current >= beachOrderRef.current.length) {
      beachOrderRef.current = shuffleBeachTracks(lastBeachTrackRef.current);
      beachPositionRef.current = 0;
    }
    el.src = trackSrcFor("beach");
    void el.play().catch(() => {});
  };

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

  // Keep background audio alive across interaction sounds. SFX are created as
  // detached Audio() elements, so their media events do not propagate through
  // document. store.tsx emits a custom event instead. Pointer/keyboard checks
  // also cover Web Audio interactions such as the telescope and ship piano.
  useEffect(() => {
    if (!unlocked) return;

    const keepBackgroundAlive = () => {
      const settings = settingsRef.current;
      const ctx = audioCtxRef.current;
      const music = musicRef.current;
      const ambience = ambienceRef.current;

      if (ctx?.state === "suspended") {
        void ctx.resume().catch(() => {});
      }

      if (
        music &&
        music.paused &&
        !settings.musicMuted &&
        settings.master > 0 &&
        settings.music > 0
      ) {
        void music.play().catch(() => {});
      }

      if (
        ambience &&
        ambience.paused &&
        settings.master > 0 &&
        settings.ambience > 0
      ) {
        void ambience.play().catch(() => {});
      }
    };

    const handleAudioInteraction = () => {
      keepBackgroundAlive();
      // iOS may pause a background media element shortly after the foreground
      // sound begins, so retry after the audio-policy decision has settled.
      window.setTimeout(keepBackgroundAlive, 100);
      window.setTimeout(keepBackgroundAlive, 350);
      window.setTimeout(keepBackgroundAlive, 800);
    };

    window.addEventListener("shoreline:audio-interaction", handleAudioInteraction);
    window.addEventListener("pointerup", handleAudioInteraction);
    window.addEventListener("keyup", handleAudioInteraction);

    return () => {
      window.removeEventListener("shoreline:audio-interaction", handleAudioInteraction);
      window.removeEventListener("pointerup", handleAudioInteraction);
      window.removeEventListener("keyup", handleAudioInteraction);
    };
  }, [unlocked]);

  // Swap the music track's source whenever the effective track (zone, or an
  // active screen override) actually changes. An override always wins over
  // the zone default while it is set.
  useEffect(() => {
    const nextKey = musicOverride || zone;
    if (currentTrackKeyRef.current === nextKey) return;
    const previousKey = currentTrackKeyRef.current;
    currentTrackKeyRef.current = nextKey;
    if (nextKey === "beach" && previousKey !== "beach") {
      beachOrderRef.current = shuffleBeachTracks(lastBeachTrackRef.current);
      beachPositionRef.current = 0;
    }
    const el = musicRef.current;
    if (!el) return;
    const wasPlaying = !el.paused;
    musicRetryRef.current = 0;
    el.src = trackSrcFor(nextKey);
    el.loop = nextKey !== "beach";
    currentVol.current.music = 0;
    if (musicGainRef.current) {
      // When Web Audio is active, GainNode owns the fade. Keep the media
      // element itself at full volume so the gain can actually bring the
      // newly loaded track back up from silence.
      musicGainRef.current.gain.value = 0;
      el.volume = 1;
    } else {
      // Without Web Audio, the fade loop below directly controls .volume.
      el.volume = 0;
    }
    if (wasPlaying || unlocked) {
      void el.play().catch(() => {});
    }
  }, [zone, musicOverride, unlocked]);

  // Recover from a stalled track load or a playback attempt rejected by iOS.
  // Keep retries bounded and reset them whenever the selected track changes.
  useEffect(() => {
    if (!unlocked) return;
    const music = musicRef.current;
    if (!music) return;
    let retryTimer: number | undefined;
    const recover = () => {
      if (settingsRef.current.musicMuted || settingsRef.current.music <= 0 || settingsRef.current.master <= 0) return;
      if (musicRetryRef.current >= 3) return;
      musicRetryRef.current += 1;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      retryTimer = window.setTimeout(() => {
        if (music.error) {
          const current = music.currentSrc || music.src;
          music.src = current;
          music.load();
        }
        void audioCtxRef.current?.resume().catch(() => {});
        void music.play().catch(() => {});
      }, 800 * musicRetryRef.current);
    };
    const ready = () => {
      if (music.paused && !settingsRef.current.musicMuted) {
        void music.play().catch(() => {});
      }
    };
    const playing = () => {
      musicRetryRef.current = 0;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
    music.addEventListener("error", recover);
    music.addEventListener("stalled", recover);
    music.addEventListener("canplay", ready);
    music.addEventListener("playing", playing);
    return () => {
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      music.removeEventListener("error", recover);
      music.removeEventListener("stalled", recover);
      music.removeEventListener("canplay", ready);
      music.removeEventListener("playing", playing);
    };
  }, [unlocked]);

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
        // Web Audio made the sliders work on iOS, but the old defaults now
        // sound quieter than the original full-volume media playback. Restore
        // that perceived level while preserving the user's slider controls.
        const blockDucking = document.querySelector('[data-cadence-block-play="active"]') ? 0.35 : 1;
        const instrumentDucking = document.querySelector('[data-ship-music-activity="active"]') ? 0.15 : 1;
        const beachBallDucking = document.querySelector('[data-beach-ball-game="active"]') ? 0.7 : 1;
        const trackKey = currentTrackKeyRef.current;
        const isNewBeachTrack = trackKey === "beach" && beachOrderRef.current[beachPositionRef.current] !== 0;
        const trackVolumeBoost = trackKey === "cadencePlayroom" ? 1.6
          : trackKey === "hut" || trackKey === "hutPatio" || isNewBeachTrack ? 1.22 : 1;
        const musicTarget = settings.musicMuted ? 0 : clamp01(music * master * 1.25 * blockDucking * instrumentDucking * beachBallDucking);
        const ambienceTarget = ambience * master;

        const speed = 0.8; // volume units per second (~1.2s fade)
        const cv = currentVol.current;
        cv.music = moveTowards(cv.music, musicTarget, speed * dt);
        cv.ambience = moveTowards(cv.ambience, ambienceTarget, speed * dt);

        const mv = clamp01(cv.music);
        const av = clamp01(cv.ambience);

        if (musicGainRef.current) {
          musicGainRef.current.gain.value = mv * trackVolumeBoost;
        } else if (musicRef.current) {
          musicRef.current.volume = clamp01(mv * trackVolumeBoost);
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
      <audio ref={musicRef} src={trackSrcFor(currentTrackKeyRef.current)} loop={currentTrackKeyRef.current !== "beach"} onEnded={onMusicEnded} preload="auto" crossOrigin="anonymous" />
      <audio ref={ambienceRef} src={AMBIENCE_LOOP} loop preload="auto" crossOrigin="anonymous" />
    </>
  );
}
