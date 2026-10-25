"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";

const LEGACY_KEY = "shoreline-coffee-plant-v1";
const KEY = "shoreline-coffee-plants-v2";
const MAX_PLANTS = 4;
const GROW = 12 * 60 * 60 * 1000;
const REGROW = 3 * 60 * 60 * 1000;
type Plant = { plantedAt: number; lastHarvest: number };
const validPlant = (value: unknown): value is Plant => {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Plant>;
  return typeof p.plantedAt === "number" && Number.isFinite(p.plantedAt) && p.plantedAt > 0 &&
    typeof p.lastHarvest === "number" && Number.isFinite(p.lastHarvest) && p.lastHarvest >= 0;
};
const nextHarvest = (plant: Plant) => Math.max(plant.plantedAt + GROW, plant.lastHarvest ? plant.lastHarvest + REGROW : 0);

export default function GroveCoffeePlant() {
  const { state, craft, collectItem } = useGame();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) setPlants(parsed.filter(validPlant).slice(0, MAX_PLANTS));
      } else {
        const legacy: unknown = JSON.parse(localStorage.getItem(LEGACY_KEY) || "null");
        if (validPlant(legacy)) {
          setPlants([legacy]);
          localStorage.setItem(KEY, JSON.stringify([legacy]));
        }
      }
    } catch { /* Keep the grove available even if saved data is malformed. */ }
    setNow(Date.now());
    setReady(true);
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const save = (updated: Plant[]) => {
    localStorage.setItem(KEY, JSON.stringify(updated));
    setPlants(updated);
    setNow(Date.now());
  };

  const plantSeed = () => {
    if (!ready || plants.length >= MAX_PLANTS || (state.inventory["coffee-plant-seeds"] || 0) < 1) return;
    if (!craft("grove-coffee-planting", [{ itemId: "coffee-plant-seeds", count: 1 }])) return;
    save([...plants, { plantedAt: Date.now(), lastHarvest: 0 }]);
    setMessage("Coffee plant added! Its first harvest will be ready in 12 hours.");
  };

  const harvest = (index: number) => {
    const plant = plants[index];
    if (!ready || !plant || now < nextHarvest(plant)) return;
    const count = 2 + Math.floor(Math.random() * 2);
    const updated = plants.map((p, i) => i === index ? { ...p, lastHarvest: Date.now() } : p);
    save(updated);
    for (let i = 0; i < count; i++) collectItem("coffee-beans", { silent: true });
    setMessage("Harvested " + count + " coffee beans from plant " + (index + 1) + "! Ready again in 3 hours.");
  };

  const timeLeft = (remaining: number) => {
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.ceil((remaining % 3600000) / 60000);
    return hours + "h " + minutes + "m";
  };

  return <section aria-labelledby="grove-coffee-heading" className="mt-4 rounded-2xl bg-emerald-950/90 p-4 text-white ring-1 ring-emerald-300/50">
    <h3 id="grove-coffee-heading" className="text-xl font-bold">☕ Coffee Plants</h3>
    <p className="mt-2">Grow up to four coffee plants for cottage recipes. Shelby sells coffee plant seeds. Each plant stays in your grove and grows beans again after harvesting.</p>
    {!ready ? <p>Checking your coffee plants...</p> : <>
      <p className="mt-2 font-semibold">{plants.length} of {MAX_PLANTS} coffee plants growing</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: MAX_PLANTS }, (_, index) => {
          const plant = plants[index];
          const remaining = plant ? Math.max(0, nextHarvest(plant) - now) : 0;
          return <div key={index} className="rounded-xl bg-emerald-900/80 p-3 ring-1 ring-emerald-300/30">
            <h4 className="font-bold">Coffee Plant {index + 1}</h4>
            <div aria-hidden="true" className="my-2 text-center text-4xl">{!plant ? "🌱" : plant.lastHarvest === 0 && remaining > 0 ? "🌿" : "🌳"}</div>
            {plant ? <button type="button" disabled={remaining > 0} onClick={() => harvest(index)} className="min-h-12 w-full rounded-xl bg-emerald-700 p-3 font-bold disabled:opacity-60" aria-label={remaining > 0 ? "Coffee plant " + (index + 1) + ", next harvest in " + timeLeft(remaining) : "Harvest 2 to 3 coffee beans from coffee plant " + (index + 1)}>
              {remaining > 0 ? "Next harvest in " + timeLeft(remaining) : "Harvest 2–3 Coffee Beans"}
            </button> : <p className="text-sm">Empty planting space</p>}
          </div>;
        })}
      </div>
      {plants.length < MAX_PLANTS ? <button type="button" disabled={(state.inventory["coffee-plant-seeds"] || 0) < 1} onClick={plantSeed} className="mt-3 min-h-12 w-full rounded-xl bg-emerald-700 p-3 font-bold disabled:opacity-50">
        Plant Coffee Seeds {(state.inventory["coffee-plant-seeds"] || 0) < 1 ? "(Seeds needed)" : ""}
      </button> : <p className="mt-3">All four coffee plant spaces are filled. Extra seeds stay in your inventory.</p>}
    </>}
    <p role="status" aria-live="polite" className="mt-2 text-sm">{message || "New plants grow for 12 hours. After the first harvest, each plant is ready again every 3 hours."}</p>
  </section>;
}
