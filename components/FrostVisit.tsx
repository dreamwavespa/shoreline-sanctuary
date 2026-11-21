"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ITEMS } from "@/lib/items";
import { frostNightKey } from "@/lib/offshore";
import { useGame } from "@/lib/store";
import { VILLAGERS } from "@/lib/villagers";

const hidingPlaces = [
  {
    label: "Rock Crevice",
    clue: "Frost’s ink forms two crooked walls with a narrow gap between them.",
    hint: "The ink trail slips into a crack between two rocks.",
  },
  {
    label: "Kelp Nook",
    clue: "Frost’s ink draws long ribbons that bend with the current.",
    hint: "The ink trail curls around the roots of the swaying kelp.",
  },
  {
    label: "Empty Shell",
    clue: "Frost’s ink curls into a spiral that gets smaller and smaller.",
    hint: "The ink trail ends at the opening of an empty spiral shell.",
  },
];

const frost = VILLAGERS.frost;
const button = "min-h-11 rounded-lg bg-teal-800 px-3 py-2 font-semibold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-500 aria-disabled:opacity-60";

export default function FrostVisit() {
  const { state, giftVillager, offshoreAction } = useGame();
  const [night, setNight] = useState(() => frostNightKey(new Date()));
  const [round, setRound] = useState<{ target: number; guesses: number[]; complete: boolean } | null>(null);
  const [result, setResult] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  useEffect(() => {
    const checkNight = () => setNight(frostNightKey(new Date()));
    const timer = window.setInterval(checkNight, 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const startRound = () => {
    if (!frostNightKey(new Date()) || (round && !round.complete)) return;
    setRound({ target: Math.floor(Math.random() * hidingPlaces.length), guesses: [], complete: false });
    setResult("");
  };

  const search = (index: number) => {
    if (!round || round.complete || round.guesses.includes(index) || !frostNightKey(new Date())) return;
    if (index === round.target) {
      setRound({ ...round, complete: true });
      setResult(offshoreAction({ type: "finish-frost-hide-and-seek" }));
    } else {
      setRound({ ...round, guesses: [...round.guesses, index] });
      setResult(`No glowing sea glass at the ${hidingPlaces[index].label}. ${hidingPlaces[round.target].hint}`);
    }
  };

  if (!night) return <p className="mt-3 text-sm text-teal-900">Frost visits the Rock Shelters after 7 p.m.</p>;

  const playing = !!round && !round.complete;
  const feedback = result || (round ? hidingPlaces[round.target].clue : "");

  return (
    <details className="mt-3 rounded-xl bg-white/90 p-3 text-teal-950 ring-1 ring-teal-200">
      <summary className="min-h-11 cursor-pointer py-2 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-500">
        Visit Frost
      </summary>
      <div className="mt-2 space-y-4">
        <Image src="/images/Reef/frost-white-octopus.webp" alt="Frost, a white octopus with pale aqua speckles"
          width={640} height={427} unoptimized className="mx-auto h-auto w-full max-w-xs rounded-xl" />
        <section aria-labelledby="frost-game-heading" className="space-y-2">
          <h3 id="frost-game-heading" className="font-bold">Frost’s Glowing Hide-and-Seek</h3>
          <p className="text-sm">Frost hides glowing sea glass and draws a clue in ink. Take as long as you like to find it.</p>
          <button type="button" className={button} onClick={startRound} aria-disabled={playing}>
            {round?.complete ? "Play again" : "Start hide-and-seek"}
          </button>
          <p role="status" aria-atomic="true" className="text-sm font-semibold">{feedback}</p>
          {round && <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Hiding places">
            {hidingPlaces.map(({ label }, index) => (
              <button key={label} type="button" className={button} onClick={() => search(index)}
                aria-disabled={!playing || round.guesses.includes(index)}>
                Search {label}
              </button>
            ))}
          </div>}
        </section>
        <section aria-labelledby="frost-gift-heading" className="space-y-2">
          <h3 id="frost-gift-heading" className="font-bold">Give Frost a Gift</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {frost.gift.lovedGiftIds.map(itemId => {
              const quantity = state.inventory[itemId] || 0;
              const { name } = ITEMS[itemId];
              return (
                <button key={itemId} type="button" className={button} aria-disabled={quantity < 1} onClick={() => {
                  if (quantity > 0 && giftVillager(frost.id, itemId)) {
                    setGiftMessage(`Frost loves the ${name} and curls his arms in delight.`);
                  }
                }}>
                  Give {name} ({quantity} available)
                </button>
              );
            })}
          </div>
          <p role="status" className="text-sm">{giftMessage}</p>
        </section>
      </div>
    </details>
  );
}
