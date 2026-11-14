"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AQUARIUM_SPECIES } from "@/lib/aquarium";

type Props = { discovered: string[]; onClose: () => void };
export default function OceanObservatory({ discovered, onClose }: Props) {
  const [night, setNight] = useState(false);
  const [peaceful, setPeaceful] = useState(false);
  const [motion, setMotion] = useState(true);
  const [backgroundFailed, setBackgroundFailed] = useState(false);
  useEffect(() => {
    const update = () => { const h = new Date().getHours(); setNight(h >= 19 || h < 6); };
    update(); const id = window.setInterval(update, 60000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => { setBackgroundFailed(false); }, [night]);
  const fish = AQUARIUM_SPECIES.filter(s => discovered.includes(s.id));
  return <section aria-label="Waverly's Ocean Observatory" className="space-y-3">
    {!peaceful && <><h4 className="text-xl font-bold">Waverly's Ocean Observatory</h4><p>All sixteen reef species discovered! Enjoy the living reef through Waverly's observation window.</p></>}
    <div className="relative mx-auto w-full max-w-[680px] overflow-hidden rounded-xl bg-gradient-to-b from-cyan-700 via-blue-900 to-slate-950" aria-label={night ? "Moonlit underwater reef viewed through the observatory window" : "Sunlit underwater reef viewed through the observatory window"}>
      <Image src={night ? "/images/Reef/Observatory-night.PNG" : "/images/Reef/Observatory-day.PNG"} onError={() => setBackgroundFailed(true)} alt={night ? "Waverly's nighttime observatory, with luminous coral and open ocean beyond a large window." : "Waverly's daytime observatory, with colorful coral and clear blue water beyond a large window."} width={1024} height={1536} unoptimized className="block h-auto w-full" style={backgroundFailed ? {visibility:"hidden"} : undefined} />
      {backgroundFailed && <p className="absolute inset-x-4 top-4 rounded-lg bg-slate-950/80 p-3 text-center text-white">Observatory background image is unavailable. The reef scene is shown with a temporary ocean backdrop.</p>}
      <div aria-hidden="true" className="pointer-events-none absolute overflow-hidden" style={{left:"13%",top:"10%",width:"74%",height:"51%",borderRadius:"40% 40% 25% 25%"}}>
        {fish.map((species, index) => {
          const row = Math.floor(index / 4); const col = index % 4;
          return <div key={species.id} className={motion ? "observatory-swim" : ""} style={{position:"absolute",left:`${3+col*25}%`,top:`${5+row*23}%`,width:"16%",animationDelay:`-${index*1.7}s`,animationDuration:`${13+(index%5)*4}s`}}>
            <span className="relative block"><span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-3xl">{species.emoji}</span><Image src={species.imageSrc} alt="" width={180} height={140} unoptimized className="relative w-full h-auto object-contain drop-shadow" onError={(event) => { event.currentTarget.style.display = "none"; }} /></span>
          </div>;
        })}
      </div>
    </div>
    {!peaceful && <p>Watching {fish.length} discovered fish species. Familiar Shoreline visitors may pass by in future updates.</p>}
    <div className="flex flex-wrap gap-2">
      <button type="button" className="min-h-12 rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white" onClick={() => setPeaceful(p => !p)}>{peaceful ? "Show Observatory Information" : "Peaceful Viewing Mode"}</button>
      <button type="button" className="min-h-12 rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white" onClick={() => setMotion(m => !m)}>{motion ? "Reduce Motion" : "Enable Swimming Animation"}</button>
      <button type="button" className="min-h-12 rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white" onClick={onClose}>Return to Marine Lab</button>
    </div>
    {!peaceful && <details><summary className="cursor-pointer font-semibold">Accessible fish directory</summary><ul className="list-disc pl-6">{fish.map(s => <li key={s.id}>{s.name}</li>)}</ul></details>}
    <style jsx>{`@keyframes observatoryDrift {0%{transform:translateX(-12%) translateY(0)}50%{transform:translateX(12%) translateY(-7%)}100%{transform:translateX(-12%) translateY(0)}}.observatory-swim{animation:observatoryDrift 16s ease-in-out infinite}@media(prefers-reduced-motion:reduce){.observatory-swim{animation:none!important}}`}</style>
  </section>;
}
