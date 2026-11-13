"use client";
import { FormEvent, useEffect, useRef, useState } from "react";

const stages = [
  { seconds: 6, caption: "Welcome to Shoreline Sanctuary", image: "/images/Beach-background-day.PNG", alt: "Sunny Shoreline beach" },
  { seconds: 7, caption: "Discover treasures along the shore", image: "/images/Beach-background-day.PNG", alt: "A seashell appears on the beach" },
  { seconds: 8, caption: "Meet Elly and Olli", image: "/images/Beach-background-day.PNG", alt: "Elly and Olli visit the beach" },
  { seconds: 6, caption: "Explore after dark", image: "/images/Beach-background-night.PNG", alt: "Moonlit Shoreline beach" },
  { seconds: 3, caption: "Shoreline Sanctuary", image: "/images/Beach-background-night.PNG", alt: "Nighttime beach and title" },
] as const;
const total = stages.reduce((sum, stage) => sum + stage.seconds, 0);
const beachMusic = "/audio/Glow%20on%20the%20Tide.mp3";
const sfx = "/audio/Seashell%20"; // Actual shell sound is selected below.
const shellSound = "/audio/Seaweed%20Collect.mp3";

export default function ShowcaseClient({ authenticated, configured }: { authenticated: boolean; configured: boolean }) {
  const [signedIn, setSignedIn] = useState(authenticated);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"ready" | "countdown" | "playing" | "finished">("ready");
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [sound, setSound] = useState(true);
  const music = useRef<HTMLAudioElement | null>(null);
  const effects = useRef<HTMLAudioElement | null>(null);
  const clock = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageIndex = stages.findIndex((stage, i) => elapsed < stages.slice(0, i + 1).reduce((sum, item) => sum + item.seconds, 0));
  const index = stageIndex < 0 ? stages.length - 1 : stageIndex;
  const stage = stages[index];

  function stopAudio() {
    music.current?.pause();
    effects.current?.pause();
  }
  function clearClock() { if (clock.current) clearInterval(clock.current); clock.current = null; }
  function reset() { clearClock(); stopAudio(); setPhase("ready"); setElapsed(0); setCountdown(10); }
  useEffect(() => () => { clearClock(); stopAudio(); }, []);

  async function login(e: FormEvent) {
    e.preventDefault(); setError("");
    try {
      const response = await fetch("/api/showcase/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error || "Could not sign in."); return; }
      setPassword(""); setSignedIn(true);
    } catch { setError("Unable to connect. Please try again."); }
  }

  function start() {
    reset();
    // A tap unlocks audio on iOS before the ten-second hands-free countdown.
    if (sound) {
      const audio = new Audio(beachMusic); audio.loop = true; audio.preload = "auto";
      music.current = audio;
      audio.play().then(() => { audio.pause(); audio.currentTime = 0; }).catch(() => {});
      effects.current = new Audio(shellSound);
    }
    setPhase("countdown");
    let remaining = 10;
    clock.current = setInterval(() => {
      remaining -= 1; setCountdown(remaining);
      if (remaining === 0) {
        clearClock(); setPhase("playing"); setElapsed(0);
        if (sound) { music.current?.play().catch(() => {}); }
        let seconds = 0;
        clock.current = setInterval(() => {
          seconds += 1;
          setElapsed(seconds);
          if (seconds === 7 && sound) { effects.current?.play().catch(() => {}); }
          if (seconds >= total) { clearClock(); stopAudio(); setPhase("finished"); }
        }, 1000);
      }
    }, 1000);
  }

  if (!configured) return <main className="min-h-screen bg-teal-950 p-8 text-white"><h1 className="text-2xl font-bold">Private Shoreline Showcase</h1><p className="mt-4">Showcase access is not configured. Set SHOWCASE_PASSWORD and SHOWCASE_SESSION_SECRET on the server, then restart the application.</p></main>;
  if (!signedIn) return <main className="min-h-screen bg-teal-950 p-6 text-white"><div className="mx-auto max-w-md"><h1 className="text-2xl font-bold">Private Shoreline Showcase</h1><p className="my-4">Creator access only. This page is separate from the public game.</p><form onSubmit={login} className="space-y-4"><label htmlFor="showcase-password" className="block">Showcase password</label><input id="showcase-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-lg p-3 text-black" required /><button className="rounded-lg bg-amber-300 px-5 py-3 font-bold text-teal-950" type="submit">Unlock showcase</button>{error && <p role="alert">{error}</p>}</form><a className="mt-8 block underline" href="/">Return to Shoreline</a></div></main>;

  return <main className="min-h-screen bg-teal-950 text-white">
    {(phase === "ready" || phase === "finished") ? <section className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-2xl font-bold">Shoreline Showcase</h1>
      <p>Private 30-second beach preview. This demonstration does not alter your saved game.</p>
      <p>{phase === "finished" ? "Showcase finished. You can replay it." : "Start your iPhone screen recording first. After pressing Start, turn VoiceOver off during the ten-second countdown."}</p>
      <label className="flex items-center gap-3"><input type="checkbox" checked={sound} onChange={e => setSound(e.target.checked)} /> Play Shoreline music and sounds</label>
      <button onClick={start} className="w-full rounded-xl bg-amber-300 p-4 text-lg font-bold text-teal-950">{phase === "finished" ? "Replay showcase" : "Start showcase (10-second countdown)"}</button>
      <button className="rounded-lg border p-3" onClick={async () => { await fetch("/api/showcase/session", { method: "DELETE" }); setSignedIn(false); reset(); }}>Sign out</button>
      <a href="/" className="block underline">Return to regular game</a>
    </section> : <section className="relative mx-auto h-[100dvh] max-w-[65vh] overflow-hidden bg-slate-950" aria-label="Shoreline Showcase recording area">
      {phase === "countdown" ? <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center"><h1 className="text-3xl font-bold">Recording begins in {countdown}</h1><p>Turn VoiceOver off now. The showcase will advance automatically.</p><button onClick={reset} className="rounded-lg border p-3">Cancel</button></div> : <>
        <img src={stage.image} alt={stage.alt} className="absolute inset-0 h-full w-full object-cover" />
        {index === 1 && <div className="absolute left-[45%] top-[69%] animate-bounce rounded-full bg-amber-200/90 p-3 text-4xl shadow-xl" aria-hidden="true">🐚</div>}
        {index === 2 && <><img src="/images/Elly-transparent.PNG" alt="" className="absolute bottom-[16%] left-[6%] w-[36%] drop-shadow-xl" /><img src="/images/Olli-transparent.PNG" alt="" className="absolute bottom-[15%] right-[5%] w-[36%] drop-shadow-xl" /></>}
        <div className="absolute inset-x-0 bottom-[7%] bg-black/55 px-4 py-5 text-center text-2xl font-semibold">{stage.caption}</div>
      </>}
    </section>}
  </main>;
}
