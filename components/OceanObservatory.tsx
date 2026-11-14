"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AQUARIUM_SPECIES } from "@/lib/aquarium";

type Props = { discovered: string[]; onClose: () => void };
const visitors = [
  { name: "Elly", src: "/images/Elly.png" },
  { name: "Olli", src: "/images/Olli.png" },
  { name: "Snappy", src: "/images/Snappy.png" },
];
export default function OceanObservatory({ discovered, onClose }: Props) {
  const [night, setNight] = useState(false);
  const [peaceful, setPeaceful] = useState(false);
  const [motion, setMotion] = useState(true);
  const [visitor, setVisitor] = useState<number | null>(null);
  useEffect(() => {
    const update = () => { const h = new Date().getHours(); setNight(h >= 19 || h < 6); };
    update(); const id = window.setInterval(update, 60000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (!motion) return;
    const id = window.setInterval(() => setVisitor(Math.random() < 0.4 ? Math.floor(Math.random() * visitors.length) : null), 24000);
    return () => window.clearInterval(id);
  }, [motion]);
  const fish = AQUARIUM_SPECIES.filter(s => discovered.includes(s.id));
  return <section aria-label="Waverly's Ocean Observatory" className="space-y-3">
    {!peaceful && <><h4 className="text-xl font-bold">Waverly's Ocean Observatory</h4><p>All sixteen reef species discovered! Enjoy the living reef through Waverly's observation window.</p></>}
    <div className="relative mx-auto w-full max-w-[680px] overflow-hidden rounded-xl" aria-label={night ? "Moonlit underwater reef viewed through the observatory window" : "Sunlit underwater reef viewed through the observatory window"}>
      <Image src={night ? "/images/Reef/Observatory-night.png" : "/images/Reef/Observatory-day.png"} alt={night ? "Waverly's nighttime observatory, with luminous coral and open ocean beyond a large window." : "Waverly's daytime observatory, with colorful coral and clear blue water beyond a large window."} width={1024} height={1536} unoptimized className="block h-auto w-full" />
      <div aria-hidden="true" className="pointer-events-none absolute overflow-hidden" style={{left:"13%",top:"10%",width:"74%",height:"51%",borderRadius:"40% 40% 25% 25%"}}>
        {fish.map((species, index) => {
          const row = Math.floor(index / 4); const col = index % 4;
          return <div key={species.id} className={motion ? "observatory-swim" : ""} style={{position:"absolute",left:`${6+col*23}%`,top:`${12+row*20}%`,width:"19%",animationDelay:`-${index*1.7}s`,animationDuration:`${13+(index%5)*4}s`}}>
            <Image src={species.imageSrc} alt="" width={180} height={140} unoptimized className="w-full h-auto object-contain drop-shadow" />
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
