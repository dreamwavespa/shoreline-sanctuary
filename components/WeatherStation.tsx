"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { SCENES } from "@/lib/media";
import { useGame, WeatherForecast } from "@/lib/store";
import StormCleanup from "./StormCleanup";

const WEATHER_PARTICLES = Array.from({ length: 12 }, (_, index) => index);

function AnimatedForecast({ weather }: { weather: WeatherForecast }) {
  const isRain = weather.id === "storm";
  const isSnow = weather.id === "snow";
  const isCold = weather.id === "cold";
  const showSun = weather.id === "calm" || weather.id === "low-tide" || weather.id === "ship" || isCold;
  const showClouds = !isCold && weather.id !== "low-tide";

  const skyClass = isRain
    ? "from-slate-800 via-slate-600 to-slate-400"
    : isSnow || isCold
      ? "from-sky-300 via-blue-100 to-slate-50"
      : weather.id === "fog"
        ? "from-slate-400 via-slate-300 to-slate-200"
        : "from-sky-500 via-cyan-300 to-amber-100";

  return (
    <div aria-hidden="true" className={`weather-scene relative mt-3 h-40 overflow-hidden rounded-2xl bg-gradient-to-b ${skyClass} ring-1 ring-white/30`}>
      {showSun && <div className={`weather-sun ${isCold ? "weather-cold-sun" : ""}`} />}

      {showClouds && (
        <>
          <div className={`weather-cloud weather-cloud-one ${weather.id === "wind" ? "weather-cloud-fast" : ""}`}><span /><span /><span /></div>
          <div className={`weather-cloud weather-cloud-two ${weather.id === "wind" ? "weather-cloud-fast" : ""}`}><span /><span /><span /></div>
        </>
      )}

      {weather.id === "wind" && (
        <div className="weather-palm">
          <div className="weather-palm-crown">🌴</div>
        </div>
      )}

      {isRain && (
        <div className="absolute inset-0">
          {WEATHER_PARTICLES.map((index) => <span key={index} className="weather-raindrop" style={{ left: `${5 + index * 8}%`, animationDelay: `${(index % 5) * -0.23}s` }} />)}
          <span className="weather-lightning">ϟ</span>
        </div>
      )}

      {isSnow && (
        <div className="absolute inset-0">
          {WEATHER_PARTICLES.map((index) => <span key={index} className="weather-snowflake" style={{ left: `${4 + index * 8}%`, animationDelay: `${(index % 6) * -0.7}s` }}>{index % 3 === 0 ? "✦" : "❄"}</span>)}
        </div>
      )}

      {weather.id === "fog" && <><span className="weather-fog weather-fog-one" /><span className="weather-fog weather-fog-two" /><span className="weather-fog weather-fog-three" /></>}
      {weather.id === "ship" && <span className="weather-ship">⛵</span>}
      {isCold && <><span className="weather-frost weather-frost-left">❄ ✦ ❄</span><span className="weather-frost weather-frost-right">✦ ❄ ✦</span><span className="weather-breath weather-breath-one" /><span className="weather-breath weather-breath-two" /></>}

      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-cyan-500/70 to-blue-800/90">
        <span className="weather-wave weather-wave-one" />
        <span className="weather-wave weather-wave-two" />
      </div>
      {weather.id === "low-tide" && <div className="absolute inset-x-0 bottom-0 h-7 bg-amber-200"><span className="absolute left-1/4 top-1 text-white">✦</span><span className="absolute right-1/3 top-3 text-white">✦</span></div>}
    </div>
  );
}

export default function WeatherStation() {
  const { state, checkWeather, collectRainGaugeWater } = useGame();
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const cleanupButtonRef = useRef<HTMLButtonElement>(null);
  const keeperQuestDone = !!state.questProgress.keeperkettle;
  const rainGaugeVialsReady = Math.max(0, state.stormCleanupCompletions - state.rainGaugeVialsClaimed);

  const closeCleanup = () => {
    setCleanupOpen(false);
    window.setTimeout(() => cleanupButtonRef.current?.focus(), 0);
  };

  const fillWaterVial = () => {
    if (collectRainGaugeWater()) {
      setAnnouncement("Pure Water Vial filled and added to your inventory.");
    }
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
                    <AnimatedForecast weather={state.currentForecast} />
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
                <div className="mt-4 rounded-xl bg-sky-50 p-4 ring-1 ring-sky-200">
                  <p className="font-bold text-sky-950">💧 Maeve&apos;s Rain Gauge</p>
                  <p className="mt-1 text-sm text-sky-800">
                    {rainGaugeVialsReady > 0
                      ? `The cleaned gauge holds enough clear rainwater for ${rainGaugeVialsReady} ${rainGaugeVialsReady === 1 ? "vial" : "vials"}.`
                      : "The rain gauge is empty. It will refill after the next Storm Cleanup."}
                  </p>
                  <button
                    type="button"
                    disabled={rainGaugeVialsReady < 1}
                    onClick={fillWaterVial}
                    className="mt-3 w-full rounded-xl bg-sky-700 py-3 font-bold text-white shadow active:bg-sky-800 disabled:bg-sky-200 disabled:text-sky-500"
                  >
                    {rainGaugeVialsReady > 0 ? `Fill Pure Water Vial (${rainGaugeVialsReady} ready)` : "Rain Gauge Empty"}
                  </button>
                  <p className="mt-3 text-center text-xs font-semibold text-teal-700">
                    Storm cleanups completed: {state.stormCleanupCompletions}
                  </p>
                  <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      {cleanupOpen && <StormCleanup onClose={closeCleanup} />}
    </>
  );
}
