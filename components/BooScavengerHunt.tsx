"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import { recordBooActivity } from "./BooFriendship";
import { ITEMS } from "@/lib/items";
import { localDateKey } from "@/lib/customSandArt";

type Hunt = { day: string; order: number[]; found: boolean[]; rewards: string[]; bonus: boolean };
const KEY = "shoreline-boo-scavenger-v1";
const PLACES = [
  { name: "Old Driftwood", clue: "Where a weathered branch rests above the tide, a secret waits on its sheltered side.", icon: "🪵" },
  { name: "Moonlit Tide Pool", clue: "Look where little pools hold the moon's reflection, and tiny ripples hide a collection.", icon: "🌊" },
  { name: "Shell Arch", clue: "Beneath a doorway built by the sea, a hidden gift is waiting for thee.", icon: "🐚" },
  { name: "Lantern Rock", clue: "Beside the stone that catches lantern light, something sparkles in the night.", icon: "🏮" },
  { name: "Sea Grass", clue: "Among the waving grasses near the shore, Boo tucked away a little more.", icon: "🌿" },
  { name: "Starfish Stone", clue: "Search near the stone where starfish rest, and see if you can find my quest.", icon: "⭐" }
];
const POOL = ["moonwashed-shell", "moonlit-sea-glass", "milky-moonstone-pebbles", "tideglow-pebble"];
function newHunt(): Hunt {
  const order = PLACES.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 3);
  return { day: localDateKey(), order, found: [false, false, false], rewards: order.map(() => POOL[Math.floor(Math.random() * POOL.length)]), bonus: false };
}
function loadHunt(): Hunt {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "null") as Hunt;
    if (value.day === localDateKey() && value.order?.length === 3 && value.found?.length === 3 && value.rewards?.length === 3 && typeof value.bonus === "boolean") return value;
  } catch {}
  return newHunt();
}
export default function BooScavengerHunt() {
  const { collectItem } = useGame();
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [message, setMessage] = useState("Boo has hidden three treasures. Listen to his clues!");
  useEffect(() => { setHunt(loadHunt()); }, []);
  const save = (next: Hunt) => {
    setHunt(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };
  if (!hunt) return <section aria-label="Boo's Moonlight Scavenger Hunt"><p>Preparing tonight's clues...</p></section>;
  const step = hunt.found.findIndex(found => !found);
  const completed = step === -1;
  const choose = (place: number) => {
    if (completed) return;
    if (hunt.order[step] !== place) {
      setMessage("Boo clicks his claws: Not here! Listen to the clue and try another hiding place.");
      return;
    }
    const item = hunt.rewards[step];
    const found = hunt.found.map((v, i) => i === step ? true : v);
    const finished = found.every(Boolean);
    const bonus = finished && !hunt.bonus;
    save({ ...hunt, found, bonus: hunt.bonus || bonus });
    collectItem(item);
    if (bonus) { collectItem("glowing-sand-dollar"); recordBooActivity("scavenger"); }
    setMessage("You found " + ITEMS[item].name + "! " + (bonus ? "All three clues solved! Boo gives you a bonus Glowing Sand Dollar." : "Boo has another clue for you."));
  };
  return (
    <section aria-labelledby="boo-hunt-title" className="rounded-xl bg-indigo-900/70 p-4 ring-1 ring-indigo-300/40">
      <h3 id="boo-hunt-title" className="text-lg font-bold">Boo's Moonlight Scavenger Hunt</h3>
      <p className="mt-1 text-sm text-indigo-100">Follow three clues around the Secret Sandbar. Wrong guesses have no penalty. A new hunt begins each day.</p>
      <p className="mt-2 font-semibold">Treasures found: {hunt.found.filter(Boolean).length} of 3</p>
      {completed ? <p className="mt-3 rounded-lg bg-indigo-700 p-3 font-semibold">You've found all three treasures today! Boo will have new clues tomorrow.</p> :
        <>
          <div className="mt-3 rounded-lg bg-indigo-950 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Boo's clue {step + 1}</p>
            <p className="mt-1 italic">“{PLACES[hunt.order[step]].clue}”</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Search hiding places">
            {PLACES.map((place, index) => (
              <button key={place.name} type="button" onClick={() => choose(index)}
                className="min-h-20 rounded-xl bg-indigo-700 p-3 text-center font-semibold text-white focus:outline-none focus:ring-4 focus:ring-amber-300">
                <span aria-hidden="true" className="block text-2xl">{place.icon}</span>
                {place.name}
              </button>
            ))}
          </div>
        </>}
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 text-sm text-amber-100">{message}</p>
    </section>
  );
}
