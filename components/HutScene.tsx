"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Area = "inside" | "patio";
const imagePath = (area: Area, night: boolean) =>
  `/images/Hut/${area === "inside" ? "Hut" : "Patio"}-${night ? "night" : "day"}.PNG`;

export default function HutScene({ onClose }: { onClose: () => void }) {
  const [area, setArea] = useState<Area>("inside");
  const [night, setNight] = useState(false);
  const [fireOn, setFireOn] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const destinationRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () => { const hour = new Date().getHours(); setNight(hour >= 19 || hour < 6); };
    update();
    const timer = window.setInterval(update, 60000);
    closeRef.current?.focus();
    return () => window.clearInterval(timer);
  }, []);
  const changeArea = (next: Area) => {
    setArea(next);
    window.setTimeout(() => destinationRef.current?.focus(), 0);
  };
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 p-2 sm:p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-label={area === "inside" ? "Your seaside hut" : "Your seaside patio"} className="flex max-h-[96dvh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl bg-[#fff7e9] p-3 shadow-2xl">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-teal-950">{area === "inside" ? "Your Seaside Hut" : "Oceanfront Patio"}</h2>
          <button ref={closeRef} type="button" onClick={onClose} className="min-h-11 rounded-xl bg-teal-900 px-4 py-2 font-bold text-white">Return to Beach</button>
        </div>
        <p className="sr-only" aria-live="polite">{area === "inside" ? "Inside your hut. Three display shelves, a fireplace, seating, and a door to the patio." : "On your patio overlooking the beach. A door leads back inside."} {night ? "It is nighttime." : "It is daytime."}</p>
        <div className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-xl" style={{ aspectRatio: "3 / 4" }}>
          <Image src={imagePath(area, night)} alt={area === "inside" ? (night ? "Cozy hut interior at night with a glowing fireplace and moonlit ocean beyond the patio door" : "Sunny hut interior with three wooden shelves, fireplace, cozy furniture and a glass door to the patio") : (night ? "Wooden oceanfront patio beneath the moon and lantern light" : "Sunny oceanfront patio with flowers, wind chimes and room for decorations")} fill unoptimized priority sizes="(max-width: 640px) 100vw, 430px" className="object-contain" />
          {area === "inside" ? (
            <>
              <button type="button" onClick={() => changeArea("patio")} aria-label="Open patio door and go outside" className="absolute left-[71%] top-[20%] h-[36%] w-[27%] rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"><span className="sr-only">Go to Patio</span></button>
              <button type="button" onClick={() => setFireOn(v => !v)} aria-label={fireOn ? "Fireplace, turn fire off" : "Fireplace, turn fire on"} aria-pressed={fireOn} className="absolute left-[1%] top-[37%] h-[24%] w-[21%] rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"><span className="sr-only">Toggle Fireplace</span></button>
            </>
          ) : (
            <button type="button" onClick={() => changeArea("inside")} aria-label="Open hut door and go inside" className="absolute left-[1%] top-[15%] h-[47%] w-[29%] rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"><span className="sr-only">Go Inside</span></button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button ref={destinationRef} type="button" onClick={() => changeArea(area === "inside" ? "patio" : "inside")} className="min-h-11 rounded-xl bg-teal-800 px-4 py-2 font-semibold text-white">{area === "inside" ? "Go to Patio" : "Go Inside"}</button>
          {area === "inside" && <button type="button" onClick={() => setFireOn(v => !v)} aria-pressed={fireOn} className="min-h-11 rounded-xl border border-teal-800 px-4 py-2 font-semibold text-teal-950">{fireOn ? "Turn Fireplace Off" : "Turn Fireplace On"}</button>}
        </div>
        {area === "inside" && <p role="status" className="mt-2 text-sm text-teal-950">{fireOn ? "The fireplace is on." : "The fireplace is off."} Fireplace animation and decoration placement are coming in a later update.</p>}
      </section>
    </div>
  );
}
