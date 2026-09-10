"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { SCENES } from "@/lib/media";
import { useGame } from "@/lib/store";
import StormCleanup from "./StormCleanup";

export default function WeatherStation() {
  const { state, checkWeather } = useGame();
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const cleanupButtonRef = useRef<HTMLButtonElement>(null);
  const keeperQuestDone = !!state.questProgress.keeperkettle;

  const closeCleanup = () => {
    setCleanupOpen(false);
    window.setTimeout(() => cleanupButtonRef.current?.focus(), 0);
  };

  return (
    <>
      <section aria-labelledby="maeve-heading" className="overflow-hidden rounded-2xl bg-white/90 shadow-md ring-1 ring-sky-300">
        <div className="relative h-44 w-full">
          <Image src={SCENES.maeveGlass} alt="Maeve Glass seated in her lighthouse observatory with Marshmallow on her lap" fill unoptimized className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 text-white">
            <h2 id="maeve-heading" className="font-serif text-xl font-bold">Maeve Glass</h2>
            <p className="text-sm text-sky-100">Lighthouse Keeper</p>
          </div>
        </div>

        <div className="p-5">
          {!keeperQuestDone ? (
            <div>
              <p className="text-sm leading-relaxed text-slate-700">
                Maeve studies an empty hook beside the stove. “A lighthouse without hot tea is no fit place for a woman or her cat.”
              </p>
              <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
                Read <strong>The Keeper&apos;s Kettle</strong> on the Bottles tab, then search the southwest drift line in the Cove.
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-slate-700">
                “Marshmallow watches the wind, I watch the instruments, and between us we rarely get it wrong.”
              </p>

              <div className="mt-4 rounded-2xl bg-gradient-to-br from-sky-950 to-teal-800 p-4 text-white shadow-inner">
                <p className="text-xs font-bold uppercase tracking-wide text-sky-200">Maeve&apos;s Weather Station</p>
                {state.currentForecast ? (
                  <div className="mt-2" role="status" aria-live="polite">
                    <h3 className="font-serif text-lg font-bold"><span aria-hidden="true">{state.currentForecast.icon}</span> {state.currentForecast.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-sky-50">{state.currentForecast.message}</p>
                    <p className="mt-2 text-xs font-semibold text-amber-200">{state.currentForecast.effect}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-sky-100">The brass instruments are ready. Ask Maeve to read the sky and tide.</p>
                )}
                <button type="button" onClick={checkWeather} className="mt-4 w-full rounded-xl bg-amber-400 py-3 font-bold text-sky-950 shadow active:bg-amber-300">
                  Check the Weather
                </button>
              </div>

              {state.stormCleanupAvailable && (
                <div className="mt-4 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-300">
                  <p className="font-bold text-amber-950">The strand needs attention</p>
                  <p className="mt-1 text-sm text-amber-800">A recent squall left debris near the lighthouse path. There is no timer and no penalty.</p>
                  <button
                    ref={cleanupButtonRef}
                    type="button"
                    onClick={() => setCleanupOpen(true)}
                    className="mt-3 w-full rounded-xl bg-amber-700 py-3 font-bold text-white shadow active:bg-amber-800"
                  >
                    Start Storm Cleanup
                  </button>
                </div>
              )}

              {state.stormCleanupCompletions > 0 && !state.stormCleanupAvailable && (
                <p className="mt-3 text-center text-xs font-semibold text-teal-700">
                  Storm cleanups completed: {state.stormCleanupCompletions}
                </p>
              )}
            </>
          )}
        </div>
      </section>
      {cleanupOpen && <StormCleanup onClose={closeCleanup} />}
    </>
  );
}
