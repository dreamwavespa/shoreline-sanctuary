"use client";
import { FormEvent, useEffect, useRef, useState } from "react";

type Scene = {
  duration: number;
  title: string;
  caption: string;
  image: string;
  alt: string;
  effect?: string;
  music?: string;
  overlay?: "shell" | "bottle" | "characters" | "fire" | "tide" | "fish" | "cottage" | "lighthouse" | "moon";
};

const scenes: Scene[] = [
  { duration: 12, title: "Welcome to Shoreline Sanctuary", caption: "A little magic washes ashore", image: "/images/Beach-background-day.PNG", alt: "Sunny beach at Shoreline Sanctuary", effect: "/audio/Seaweed%20Collect.mp3", overlay: "characters", music: "/audio/Glow%20on%20the%20Tide.mp3" },
  { duration: 11, title: "Messages from the sea", caption: "Open a frosted bottle and discover a story", image: "/images/Bottle-quest-day.PNG", alt: "Enchanted bottle quest pavilion", effect: "/audio/Bottle%20cork.wav", overlay: "bottle", music: "/audio/Message%20in%20a%20Bottle.mp3" },
  { duration: 11, title: "A home by the water", caption: "Make the seaside hut your own", image: "/images/Hut/Hut-day-updated.PNG", alt: "Decorated seaside hut", effect: "/audio/Hut-Fireplace-Crackling-Loop.mp3", overlay: "fire", music: "/audio/Cozy%20Beach%20Haven.mp3" },
  { duration: 11, title: "Follow the tide", caption: "Boats and new adventures await", image: "/images/Cove/Dock-background-day.PNG", alt: "Sunny cove dock with boats", effect: "/audio/dock-footsteps.mp3", music: "/audio/Cove%20Treasure%20Hunt.mp3" },
  { duration: 10, title: "Tiny ocean treasures", caption: "Search the tide pools for discoveries", image: "/images/TidePool/Tidepool-background-day.PNG", alt: "Shallow tide pool", effect: "/audio/Ocean%20Water%20Splash.mp3", overlay: "tide", music: "/audio/Tide%20Pool%20Wonders.mp3" },
  { duration: 11, title: "Beneath the waves", caption: "Meet the wonders of the reef", image: "/images/Reef/Observatory-day.PNG", alt: "Underwater reef observatory", effect: "/audio/Aquarium-ambiance.wav", overlay: "fish", music: "/audio/Sunlit%20Shallows.mp3" },
  { duration: 9, title: "Friends around every corner", caption: "Come visit the cozy cottage", image: "/images/Cottage/Cottage-day.png", alt: "Cozy cottage entrance", overlay: "cottage", music: "/audio/Cozy%20Beach%20Haven.mp3" },
  { duration: 8, title: "A light to guide you", caption: "Find warmth and wonder at the lighthouse", image: "/images/Lighthouse/Lighthouse-downstairs-night.PNG", alt: "Lighthouse living room at night", effect: "/audio/marshmallow-purr-short.mp3", overlay: "lighthouse", music: "/audio/Coastal%20Crafting%20Haven.mp3" },
  { duration: 7, title: "Shoreline Sanctuary", caption: "Your magical seaside escape", image: "/images/Beach-background-night.PNG", alt: "Moonlit Shoreline beach", effect: "/audio/Ceramic-bell.mp3", overlay: "moon", music: "/audio/Luminous%20Tides.mp3" },
];
const totalSeconds = scenes.reduce((sum, scene) => sum + scene.duration, 0);
const soundFiles = [...new Set([...scenes.flatMap(s => [s.music, s.effect]), "/audio/Parchment.wav"].filter((s): s is string => !!s))];
const cumulative = scenes.map((_, i) => scenes.slice(0, i + 1).reduce((sum, s) => sum + s.duration, 0));

export default function ShowcaseClient({ authenticated, configured }: { authenticated: boolean; configured: boolean }) {
  const [signedIn, setSignedIn] = useState(authenticated);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"ready" | "countdown" | "playing" | "finished">("ready");
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [sound, setSound] = useState(true);
  const ctx = useRef<AudioContext | null>(null);
  const buffers = useRef(new Map<string, AudioBuffer>());
  const playing = useRef<{source: AudioBufferSourceNode; gain: GainNode} | null>(null);
  const effects = useRef<AudioBufferSourceNode[]>([]);
  const [audioWarning, setAudioWarning] = useState("");
  const generation = useRef(0);
  const clock = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastScene = useRef(-1);
  const sceneIndex = Math.max(0, cumulative.findIndex(end => elapsed < end));
  const scene = scenes[sceneIndex];
  const sceneStart = sceneIndex === 0 ? 0 : cumulative[sceneIndex - 1];
  const sceneElapsed = elapsed - sceneStart;

  function stopAudio() {
    try { playing.current?.source.stop(); } catch {}
    playing.current = null;
    effects.current.forEach(source => { try { source.stop(); } catch {} });
    effects.current = [];
  }
  function clearClock() { if (clock.current) clearInterval(clock.current); clock.current = null; }
  function reset() {
    generation.current++;
    clearClock(); stopAudio(); lastScene.current = -1;
    setPhase("ready"); setElapsed(0); setCountdown(10);
  }
  useEffect(() => () => { clearClock(); stopAudio(); void ctx.current?.close(); }, []);

  async function loadAudio(context: AudioContext) {
    const failures = await Promise.all(soundFiles.map(async file => {
      if (buffers.current.has(file)) return false;
      try {
        const response = await fetch(file);
        if (!response.ok) return true;
        buffers.current.set(file, await context.decodeAudioData(await response.arrayBuffer()));
        return false;
      } catch { return true; }
    }));
    if (failures.some(Boolean)) setAudioWarning("Some audio could not load. Check your connection before recording.");
  }
  function playSound(file?: string, delay = 0) {
    const context = ctx.current, buffer = file ? buffers.current.get(file) : undefined;
    if (!context || !buffer) return;
    const source = context.createBufferSource(), gain = context.createGain();
    source.buffer = buffer; gain.gain.value = file?.includes("Fireplace") ? 0.25 : 0.85;
    source.connect(gain).connect(context.destination);
    effects.current.push(source);
    source.onended = () => { effects.current = effects.current.filter(item => item !== source); };
    source.start(context.currentTime + delay);
  }
  function changeSceneAudio(index: number) {
    if (!sound || !ctx.current) return;
    const context = ctx.current, item = scenes[index];
    const buffer = item.music ? buffers.current.get(item.music) : undefined;
    if (buffer) {
      const old = playing.current;
      const source = context.createBufferSource(), gain = context.createGain();
      source.buffer = buffer; source.loop = true;
      source.connect(gain).connect(context.destination);
      const now = context.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.36, now + 1.5);
      source.start();
      playing.current = {source, gain};
      if (old) {
        old.gain.gain.cancelScheduledValues(now);
        old.gain.gain.setValueAtTime(old.gain.gain.value, now);
        old.gain.gain.linearRampToValueAtTime(0, now + 1.5);
        old.source.stop(now + 1.6);
      }
    }
    playSound(item.effect);
    if (index === 1) playSound("/audio/Parchment.wav", 2);
  }
  useEffect(() => {
    if (phase !== "playing" || lastScene.current === sceneIndex) return;
    lastScene.current = sceneIndex;
    changeSceneAudio(sceneIndex);
  }, [phase, sceneIndex]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/showcase/session", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "Could not sign in."); return; }
      setPassword("");
      setSignedIn(true);
    } catch { setError("Unable to connect. Please try again."); }
  }

  function start() {
    reset();
    const current = generation.current;
    setAudioWarning("");
    let ready: Promise<unknown> = Promise.resolve();
    if (sound) {
      try {
        const context = ctx.current ?? new AudioContext();
        ctx.current = context;
        // The Start tap unlocks Web Audio on iPhone before hands-free playback.
        ready = context.resume().then(() => loadAudio(context)).catch(() => setAudioWarning("Audio could not be started."));
      } catch { setAudioWarning("Audio is unavailable."); }
    }
    setPhase("countdown");
    let remaining = 10;
    clock.current = setInterval(() => {
      remaining--;
      setCountdown(remaining);
      if (remaining !== 0) return;
      clearClock();
      void ready.then(() => {
        if (generation.current !== current) return;
        lastScene.current = -1;
        setElapsed(0); setPhase("playing");
        let seconds = 0;
        clock.current = setInterval(() => {
          seconds++;
          if (seconds >= totalSeconds) {
            clearClock(); stopAudio(); setElapsed(totalSeconds); setPhase("finished");
          } else setElapsed(seconds);
        }, 1000);
      });
    }, 1000);
  }

  if (!configured) return <main className="min-h-screen bg-teal-950 p-8 text-white"><h1 className="text-2xl font-bold">Private Shoreline Showcase</h1><p className="mt-4">Showcase access is not configured. Set SHOWCASE_PASSWORD and SHOWCASE_SESSION_SECRET on the server, then restart the application.</p></main>;
  if (!signedIn) return <main className="min-h-screen bg-teal-950 p-6 text-white"><div className="mx-auto max-w-md"><h1 className="text-2xl font-bold">Private Shoreline Showcase</h1><p className="my-4">Creator access only. This page is separate from the public game.</p><form onSubmit={login} className="space-y-4"><label htmlFor="showcase-password" className="block">Showcase password</label><input id="showcase-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg p-3 text-black" required /><button className="rounded-lg bg-amber-300 px-5 py-3 font-bold text-teal-950" type="submit">Unlock showcase</button>{error && <p role="alert">{error}</p>}</form><a className="mt-8 block underline" href="/">Return to Shoreline</a></div></main>;

  return <main className="min-h-screen bg-teal-950 text-white">
    {phase === "ready" || phase === "finished" ? <section className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-2xl font-bold">Shoreline Sanctuary — 90-second trailer</h1>
      <p>Private, automatic tour of nine Shoreline scenes. It does not change your inventory, quests, or saved game.</p>
      <p role="status">{audioWarning}</p>
      <p>{phase === "finished" ? "Trailer finished. You can record it again." : "Start iPhone screen recording, then press Start. Turn VoiceOver off during the ten-second countdown."}</p>
      <label className="flex items-center gap-3"><input type="checkbox" checked={sound} onChange={e => setSound(e.target.checked)} /> Play Shoreline music and sound effects</label>
      <button onClick={start} className="w-full rounded-xl bg-amber-300 p-4 text-lg font-bold text-teal-950">{phase === "finished" ? "Replay 90-second trailer" : "Start trailer (10-second countdown)"}</button>
      <button className="rounded-lg border p-3" onClick={async () => { await fetch("/api/showcase/session", { method: "DELETE" }); setSignedIn(false); reset(); }}>Sign out</button>
      <a href="/" className="block underline">Return to regular game</a>
    </section> : <section className="relative mx-auto h-[100dvh] max-w-[65vh] overflow-hidden bg-slate-950" aria-label="Shoreline Sanctuary trailer recording area">
      {phase === "countdown" ? <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center"><h1 className="text-3xl font-bold">Recording begins in {countdown}</h1><p>Turn VoiceOver off now. The trailer advances automatically.</p><button onClick={reset} className="rounded-lg border p-3">Cancel</button></div> : <>
        <img key={scene.image} src={scene.image} alt={scene.alt} className="absolute inset-0 h-full w-full object-cover animate-[fadeIn_1s_ease-in]" />
        {scene.overlay === "characters" && <><img src="/images/Elly-transparent.PNG" alt="" className="absolute bottom-[22%] left-[5%] w-[32%] animate-[bounce_4s_ease-in-out_infinite] drop-shadow-xl" /><img src="/images/Olli-transparent.PNG" alt="" className="absolute bottom-[22%] right-[5%] w-[32%] animate-[bounce_5s_ease-in-out_infinite] drop-shadow-xl" />{sceneElapsed >= 5 && <div aria-hidden="true" className="absolute bottom-[26%] left-[46%] text-4xl drop-shadow-lg">🐚</div>}</>}
        {scene.overlay === "bottle" && <div className="absolute inset-x-[14%] bottom-[27%] rounded-2xl border border-amber-200/60 bg-teal-950/75 px-5 py-5 text-center shadow-2xl"><div className="text-4xl" aria-hidden="true">🍾 ✨</div><p className="mt-2 text-base italic text-amber-100">{sceneElapsed < 4 ? "A frosted bottle washes ashore…" : "Every bottle holds a new mystery."}</p></div>}
        {scene.overlay === "tide" && <img src="/images/TidePool/Whispering-Seashell.png" alt="" className="absolute bottom-[25%] left-[38%] w-[25%] animate-[bounce_4s_ease-in-out_infinite] drop-shadow-xl" />}
        {scene.overlay === "fish" && <img src="/images/Reef/Libby-transparent.PNG" alt="" className="absolute bottom-[26%] right-[6%] w-[29%] animate-[bounce_5s_ease-in-out_infinite] drop-shadow-xl" />}
        {scene.overlay === "moon" && <div className="absolute inset-x-0 top-[16%] text-center text-4xl tracking-widest text-amber-100 drop-shadow-xl" aria-hidden="true">✦ ✧ ✦</div>}
        <div className="absolute inset-x-0 bottom-[6%] px-5 text-center">
          <div className="mx-auto max-w-sm rounded-xl bg-slate-950/65 px-4 py-3 shadow-xl">
            <h2 className="text-xl font-bold text-amber-100">{scene.title}</h2>
            <p className="mt-1 text-sm text-white">{scene.caption}</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-1 bg-amber-200/80 transition-[width] duration-1000" style={{ width: String(Math.min(100, elapsed / totalSeconds * 100)) + "%" }} aria-hidden="true" />
      </>}
    </section>}
  </main>;
}
