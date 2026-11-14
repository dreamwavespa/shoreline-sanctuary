"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AQUARIUM_SPECIES } from "@/lib/aquarium";

type Props = { discovered: string[]; onClose: () => void; testMode?: boolean };
const VISITORS = {
  day: [{name:"Elly the jellyfish",symbol:"🪼",image:"/images/Elly-transparent.PNG"},{name:"Olli the octopus",symbol:"🐙",image:"/images/Olli-transparent.PNG"},{name:"Snappy the turtle",symbol:"🐢",image:"/images/Snappy-transparent.PNG"},{name:"Libby the lobster",symbol:"🦞",image:null}],
  night: [{name:"Celeste the moon jellyfish",symbol:"🪼",image:"/images/Celeste-transparent.PNG"},{name:"Orion the sea butterfly",symbol:"🦋",image:"/images/Orion-transparent.PNG"}]
};
const fishPosition = (index: number) => ({
  left: `${8 + (index * 31 % 76)}%`,
  top: `${7 + (index * 23 % 73)}%`,
  width: `${13 + (index % 3) * 2}%`,
  animationDelay: `-${index * 2.4}s`,
  animationDuration: `${15 + (index * 7 % 21)}s`,
  ["--drift-x" as string]: `${index % 2 ? -35 : 35}%`,
  ["--drift-y" as string]: `${index % 3 ? -15 : 12}%`
});
export default function OceanObservatory({ discovered, onClose, testMode = false }: Props) {
  const [night, setNight] = useState(false);
  const [previewTime, setPreviewTime] = useState<"auto" | "day" | "night">("auto");
  const showNight = testMode && previewTime !== "auto" ? previewTime === "night" : night;
  const [peaceful, setPeaceful] = useState(false);
  const [motion, setMotion] = useState(true);
  const [backgroundFailed, setBackgroundFailed] = useState(false);
  const [backgroundAttempt, setBackgroundAttempt] = useState(0);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const backgroundPath = showNight ? "/images/Reef/Observatory-night.PNG" : "/images/Reef/Observatory-day.PNG";
  const backgroundSrc = backgroundAttempt === 0 ? backgroundPath : `${backgroundPath}?retry=${backgroundAttempt}`;
  const retryBackground = () => {
    setBackgroundFailed(false);
    setBackgroundLoaded(false);
    setBackgroundAttempt(attempt => attempt + 1);
  };
  const [visitorIndex, setVisitorIndex] = useState<number | null>(null);
  const [reduceMotionPreference, setReduceMotionPreference] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { setReduceMotionPreference(media.matches); if (media.matches) setMotion(false); };
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!motion) { setVisitorIndex(null); return; }
    let turn = 0;
    const id = window.setInterval(() => { turn += 1; setVisitorIndex(turn % 3 === 0 ? null : turn % (showNight ? 2 : 4)); }, 18000);
    return () => window.clearInterval(id);
  }, [showNight, motion]);
  useEffect(() => {
    const update = () => { const h = new Date().getHours(); setNight(h >= 19 || h < 6); };
    update(); const id = window.setInterval(update, 60000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    setBackgroundFailed(false);
    setBackgroundLoaded(false);
    setBackgroundAttempt(0);
  }, [showNight]);
  useEffect(() => {
    if (backgroundLoaded || !backgroundFailed || backgroundAttempt >= 2) return;
    const timer = window.setTimeout(retryBackground, 1800);
    return () => window.clearTimeout(timer);
  }, [backgroundFailed, backgroundAttempt, backgroundLoaded]);
  const fish = AQUARIUM_SPECIES.filter(s => discovered.includes(s.id));
  return <section aria-label="Waverly's Ocean Observatory" className="space-y-3">
    {!peaceful && <><h4 className="text-xl font-bold">Waverly's Ocean Observatory</h4><p>All sixteen reef species discovered! Enjoy the living reef through Waverly's observation window.</p></>}
    {testMode && <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">Preview lighting:</span>{(["day","night","auto"] as const).map(value => <button key={value} type="button" aria-pressed={previewTime === value} onClick={() => setPreviewTime(value)} className={`min-h-11 rounded-lg border px-4 py-2 font-semibold ${previewTime === value ? "bg-amber-100 text-teal-950 border-amber-100" : "bg-teal-900 text-white border-white/50"}`}>{value === "auto" ? "Automatic" : value === "day" ? "Daytime" : "Nighttime"}</button>)}</div>}
    <div className="relative mx-auto w-full max-w-[680px] overflow-hidden rounded-xl bg-gradient-to-b from-cyan-700 via-blue-900 to-slate-950" aria-label={showNight ? "Moonlit underwater reef viewed through the observatory window" : "Sunlit underwater reef viewed through the observatory window"}>
      <Image key={backgroundSrc} src={backgroundSrc} onLoad={() => { setBackgroundLoaded(true); setBackgroundFailed(false); }} onError={() => setBackgroundFailed(true)} alt={showNight ? "Waverly's nighttime observatory, with luminous coral and open ocean beyond a large window." : "Waverly's daytime observatory, with colorful coral and clear blue water beyond a large window."} width={1024} height={1536} unoptimized className="block h-auto w-full" style={backgroundFailed ? {visibility:"hidden"} : undefined} />
      {backgroundFailed && <div className="absolute inset-x-4 top-4 rounded-lg bg-slate-950/90 p-3 text-center text-white"><p role="status">The observatory background could not load. The fish are still visible.</p><button type="button" onClick={retryBackground} className="mt-2 min-h-11 rounded-lg bg-amber-100 px-4 py-2 font-semibold text-teal-950">Retry Background</button></div>}
      <div aria-hidden="true" className="pointer-events-none absolute overflow-hidden" style={{left:"13%",top:"10%",width:"74%",height:"51%",borderRadius:"40% 40% 25% 25%"}}>
        {fish.map((species, index) => {
          return <div key={species.id} className={motion ? "observatory-swim" : ""} style={{position:"absolute",...fishPosition(index)}}>
            <span className="relative block"><span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-3xl">{species.emoji}</span><Image src={species.imageSrc} alt="" width={180} height={140} unoptimized className="relative w-full h-auto object-contain drop-shadow" onError={(event) => { event.currentTarget.style.display = "none"; }} /></span>
          </div>;
        })}
        {visitorIndex !== null && motion && <div className="observatory-visitor absolute bottom-[12%] left-[5%] rounded-full bg-cyan-950/50 px-3 py-2 text-center text-white shadow-lg" style={{fontSize:"clamp(18px,4vw,34px)"}}><span aria-hidden="true" className="relative block h-16 w-16"><span className="absolute inset-0 flex items-center justify-center">{VISITORS[showNight ? "night" : "day"][visitorIndex].symbol}</span>{VISITORS[showNight ? "night" : "day"][visitorIndex].image && <Image src={VISITORS[night ? "night" : "day"][visitorIndex].image!} alt="" width={120} height={120} unoptimized className="relative h-full w-full object-contain" onError={event => {event.currentTarget.style.display="none";}} />}</span></div>}
      </div>
    </div>
    {!peaceful && <p>Watching {fish.length} discovered fish species. Elly, Olli, Snappy and Libby visit by day; Celeste and Orion visit at night.</p>}
    {!peaceful && <details><summary className="cursor-pointer font-semibold">Who visits the observatory?</summary><p>Daytime: Elly the jellyfish, Olli the octopus, Snappy the turtle, and Libby the lobster. Nighttime: Celeste the moon jellyfish and Orion the sea butterfly. Visitors appear occasionally without interrupting VoiceOver.</p></details>}
    <div className="flex flex-wrap gap-2">
      <button type="button" className="min-h-12 rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white" onClick={() => setPeaceful(p => !p)}>{peaceful ? "Show Observatory Information" : "Peaceful Viewing Mode"}</button>
      <button type="button" className="min-h-12 rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white" onClick={() => setMotion(m => !m)}>{motion ? "Reduce Motion" : "Enable Swimming Animation"}</button>
      <button type="button" className="min-h-12 rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white" onClick={onClose}>Return to Marine Lab</button>
    </div>
    {!peaceful && <details><summary className="cursor-pointer font-semibold">Accessible fish directory</summary><ul className="list-disc pl-6">{fish.map(s => <li key={s.id}>{s.name}</li>)}</ul></details>}
    <style jsx>{`@keyframes observatoryDrift {0%,100%{transform:translate(0,0)}50%{transform:translate(var(--drift-x),var(--drift-y))}}@keyframes visitorPass {0%{transform:translateX(-35%);opacity:0}20%,80%{opacity:1}100%{transform:translateX(120%);opacity:0}}.observatory-swim{animation-name:observatoryDrift;animation-timing-function:ease-in-out;animation-iteration-count:infinite}.observatory-visitor{animation:visitorPass 18s ease-in-out both}@media(prefers-reduced-motion:reduce){.observatory-swim,.observatory-visitor{animation:none!important}}`}</style>
  </section>;
}
