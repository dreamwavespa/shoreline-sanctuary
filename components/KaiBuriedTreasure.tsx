"use client";

import { useState } from "react";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";

const TRADEABLE_SHELLS = ["shell-scallop", "shell-whelk", "shell-cowrie", "shell-clam", "shell-conch", "shell-abalone", "shell-nautilus", "shell-murex", "iridescent-shell"];
const DIG_SPOTS = [
  { id: "left", name: "Left bubbling sand spot", icon: "💦" },
  { id: "center", name: "Center bubbling sand spot", icon: "🫧" },
  { id: "right", name: "Right bubbling sand spot", icon: "💦" },
] as const;

export default function KaiBuriedTreasure() {
  const { state, play, tradeWithKai } = useGame();
  const availableShells = TRADEABLE_SHELLS.filter((id) => (state.inventory[id] || 0) >= 3);
  const [shellId, setShellId] = useState(availableShells[0] || "");
  const [searching, setSearching] = useState(false);
  const [revealedSpot, setRevealedSpot] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const unlocked = Boolean(state.questProgress.kaiburrowsecret);

  const offerShells = () => {
    if (!shellId || (state.inventory[shellId] || 0) < 3) return;
    setSearching(true);
    setRevealedSpot("");
    play("oceanWaterSplash", 0.5);
    setAnnouncement(`Kai accepts two ${ITEMS[shellId].name}s and disappears with a pfft-squirt. Choose any bubbling sand spot.`);
  };

  const search = (spotId: string) => {
    if (!searching) return;
    const rewardItemId = tradeWithKai(shellId);
    if (!rewardItemId) {
      setSearching(false);
      setAnnouncement("The trade could not be completed. Choose a shell with at least three copies.");
      return;
    }
    setSearching(false);
    setRevealedSpot(spotId);
    setAnnouncement(`Pfft! You found ${ITEMS[rewardItemId].name}. It was added to your inventory.`);
    if ((state.inventory[shellId] || 0) < 5) setShellId(availableShells.find((id) => id !== shellId) || "");
  };

  return (
    <section className="rounded-2xl bg-gradient-to-br from-cyan-50 to-stone-100 p-4 shadow-md ring-1 ring-cyan-200" aria-labelledby="kai-treasure-heading">
      <h3 id="kai-treasure-heading" className="font-serif text-lg font-bold text-teal-950">🐚 Kai’s Buried Treasure Trade</h3>
      {!unlocked ? (
        <p className="mt-2 rounded-xl bg-amber-100 p-3 text-sm font-semibold text-amber-900">Complete “Kai’s Burrow Secret” on the Bottles tab to unlock Kai’s repeatable trades.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-teal-800">Trade two copies of one shell, then choose a bubbling sand spot. Kai always leaves one copy safely in your collection. There is no timer and no wrong spot.</p>
          <fieldset className="mt-3">
            <legend className="text-sm font-bold text-teal-950">Choose a duplicate shell</legend>
            {availableShells.length === 0 ? (
              <p className="mt-2 text-sm text-teal-700">Collect at least three of one shell type: one to keep and two to trade.</p>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {availableShells.map((id) => (
                  <button key={id} type="button" disabled={searching} aria-pressed={shellId === id} onClick={() => setShellId(id)} className={`min-h-11 rounded-xl px-2 py-2 text-xs font-bold ring-1 ${shellId === id ? "bg-teal-700 text-white ring-teal-800" : "bg-white text-teal-900 ring-teal-200"}`}>
                    {ITEMS[id].name} ({state.inventory[id]})
                  </button>
                ))}
              </div>
            )}
          </fieldset>
          {!searching ? (
            <button type="button" disabled={!shellId || (state.inventory[shellId] || 0) < 3} onClick={offerShells} className="mt-3 min-h-11 w-full rounded-xl bg-cyan-700 px-3 py-2 text-sm font-bold text-white disabled:bg-slate-200 disabled:text-slate-500">Offer Two Duplicate Shells</button>
          ) : (
            <fieldset className="mt-4">
              <legend className="font-bold text-teal-950">Where should you dig?</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {DIG_SPOTS.map((spot) => (
                  <button key={spot.id} type="button" onClick={() => search(spot.id)} aria-label={`Search ${spot.name.toLowerCase()}`} className="min-h-20 rounded-2xl bg-amber-100 px-2 py-3 text-sm font-bold text-amber-950 ring-1 ring-amber-300">
                    <span className="block text-2xl" aria-hidden="true">{spot.icon}</span>{spot.id}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {revealedSpot && <p className="mt-3 rounded-xl bg-emerald-100 p-3 text-sm font-semibold text-emerald-900" aria-hidden="true">✨ Kai’s treasure appeared in the {revealedSpot} spot!</p>}
          <p role="status" aria-live="polite" className="mt-2 min-h-5 text-xs font-semibold text-teal-900">{announcement}</p>
          <p className="mt-1 text-xs text-teal-700">Buried trades completed: {state.kaiBuriedTrades}</p>
        </>
      )}
    </section>
  );
}
