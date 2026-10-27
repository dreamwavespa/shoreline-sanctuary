"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";

type Kind = "cotton" | "catnip";
type Plant = { plantedAt: number; lastHarvest: number };
type Patch = Record<Kind, Plant[]>;
const KEY = "shoreline-fiber-herb-patch-v1";
const GROW = 12 * 60 * 60 * 1000;
const REGROW = 3 * 60 * 60 * 1000;
const CONFIG = {
  cotton: { label: "Cotton", max: 3, min: 3, maxYield: 5, seed: "cotton-plant-seeds", item: "cotton-balls", icon: "☁️" },
  catnip: { label: "Catnip", max: 2, min: 2, maxYield: 3, seed: "catnip-plant-seeds", item: "catnip", icon: "🌿" },
} as const;
const valid = (p: unknown): p is Plant => !!p && typeof p === "object" &&
  typeof (p as Plant).plantedAt === "number" && Number.isFinite((p as Plant).plantedAt) && (p as Plant).plantedAt > 0 &&
  typeof (p as Plant).lastHarvest === "number" && Number.isFinite((p as Plant).lastHarvest) && (p as Plant).lastHarvest >= 0;
const due = (p: Plant) => Math.max(p.plantedAt + GROW, p.lastHarvest ? p.lastHarvest + REGROW : 0);
const remainingText = (ms: number) => Math.floor(ms / 3600000) + "h " + Math.ceil((ms % 3600000) / 60000) + "m";

export default function GroveFiberPatch({ kind }: { kind?: Kind } = {}) {
  const { state, craft, collectItem } = useGame();
  const [patch, setPatch] = useState<Patch>({ cotton: [], catnip: [] });
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [message, setMessage] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          const obj = parsed as Partial<Patch>;
          setPatch({
            cotton: Array.isArray(obj.cotton) ? obj.cotton.filter(valid).slice(0, 3) : [],
            catnip: Array.isArray(obj.catnip) ? obj.catnip.filter(valid).slice(0, 2) : [],
          });
        }
      } else {
        // One starter plant of each kind; subsequent plants require seeds.
        const initial = { cotton: [{ plantedAt: Date.now(), lastHarvest: 0 }], catnip: [{ plantedAt: Date.now(), lastHarvest: 0 }] };
        localStorage.setItem(KEY, JSON.stringify(initial));
        setPatch(initial);
      }
    } catch { /* Malformed save data should not crash the grove. */ }
    setNow(Date.now());
    setReady(true);
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const save = (next: Patch) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setPatch(next);
    setNow(Date.now());
  };
  const plant = (kind: Kind) => {
    const config = CONFIG[kind];
    if (!ready || patch[kind].length >= config.max || (state.inventory[config.seed] || 0) < 1) return;
    if (!craft("grove-" + kind + "-planting", [{ itemId: config.seed, count: 1 }])) return;
    save({ ...patch, [kind]: [...patch[kind], { plantedAt: Date.now(), lastHarvest: 0 }] });
    setMessage(config.label + " planted. First harvest in 12 hours.");
  };
  const harvest = (kind: Kind, index: number) => {
    const p = patch[kind][index];
    if (!ready || !p || now < due(p)) return;
    const config = CONFIG[kind];
    const count = config.min + Math.floor(Math.random() * (config.maxYield - config.min + 1));
    save({ ...patch, [kind]: patch[kind].map((entry, i) => i === index ? { ...entry, lastHarvest: Date.now() } : entry) });
    for (let i = 0; i < count; i++) collectItem(config.item, { silent: true });
    setMessage("Collected " + count + " " + (kind === "cotton" ? "cotton balls" : "catnip portions") + ". Next harvest in 3 hours.");
  };
  return <section aria-labelledby="fiber-patch-heading" className="mt-4 rounded-2xl bg-emerald-950/90 p-4 text-white ring-1 ring-emerald-300/50">
    <h3 id="fiber-patch-heading" className="text-xl font-bold">🌱 Cotton & Catnip Patch</h3>
    <p className="mt-2">These plants grow year-round. Your first cotton and catnip plants are included; additional plants need seeds. Harvests replenish every three hours.</p>
    {!ready ? <p>Checking the growing patch...</p> : (kind ? [kind] : ["cotton", "catnip"] as const).map(kind => {
      const config = CONFIG[kind];
      return <div key={kind} className="mt-4 rounded-xl bg-emerald-900/80 p-3">
        <h4 className="font-bold">{config.icon} {config.label} — {patch[kind].length} of {config.max} plants</h4>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {patch[kind].map((p, index) => {
            const remaining = Math.max(0, due(p) - now);
            return <button key={index} type="button" disabled={remaining > 0} onClick={() => harvest(kind, index)}
              aria-label={remaining > 0 ? config.label + " plant " + (index + 1) + ", next harvest in " + remainingText(remaining) : "Harvest " + config.label + " plant " + (index + 1)}
              className="min-h-12 rounded-xl bg-emerald-700 p-3 font-semibold disabled:opacity-60">
              {config.label} plant {index + 1}: {remaining ? "Ready in " + remainingText(remaining) : "Harvest " + config.min + "–" + config.maxYield}
            </button>;
          })}
        </div>
        {patch[kind].length < config.max && <button type="button" onClick={() => plant(kind)} disabled={!state.inventory[config.seed]}
          className="mt-3 min-h-12 rounded-xl bg-teal-700 p-3 font-bold disabled:opacity-50">
          Plant another {config.label.toLowerCase()} plant ({state.inventory[config.seed] || 0} seeds)
        </button>}
      </div>;
    })}
    <p role="status" aria-live="polite" className="mt-3">{message}</p>
  </section>;
}
