"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";

const KEY = "shoreline-luna-discovery-v1";
const FRIEND_KEY = "shoreline-boo-friendship-v1";
export const LUNA_PROGRESS_EVENT = "shoreline-luna-progress";
const STAGES = [
  { label: "Look near the driftwood", clue: "Boo points to a silver shimmer beside his driftwood shelter.", success: "You find a faint trail of silver beneath the driftwood." },
  { label: "Follow the tide pool trail", clue: "The glowing trail curves toward a quiet tide pool.", success: "The trail brightens and winds around the tide pool." },
  { label: "Examine the moonlit shell", clue: "A tiny spiral shell glimmers near the edge of the sandbar.", success: "Luna the Moon Snail peeks out! She offers you a glowing shell as a welcome gift." }
];
function readStage() {
  try { const n = Number(localStorage.getItem(KEY) || "0"); return Number.isInteger(n) && n >= 0 && n <= 3 ? n : 0; } catch { return 0; }
}
function friendshipPoints(gifts: number) {
  try { const data = JSON.parse(localStorage.getItem(FRIEND_KEY) || "null"); return (typeof data?.points === "number" ? data.points : 0) + gifts; } catch { return gifts; }
}
export default function LunaDiscovery() {
  const { state, collectItem } = useGame();
  const [stage, setStage] = useState<number | null>(null);
  const [points, setPoints] = useState(0);
  const [message, setMessage] = useState("");
  const gifts = state.villagerGiftCounts.boo || 0;
  useEffect(() => {
    const update = () => setPoints(friendshipPoints(gifts));
    setStage(readStage());
    update();
    window.addEventListener("boo-friendship-updated", update);
    return () => window.removeEventListener("boo-friendship-updated", update);
  }, [gifts]);
  const unlocked = points >= 7;
  const advance = () => {
    if (stage === null || stage >= 3 || !unlocked) return;
    const next = stage + 1;
    localStorage.setItem(KEY, String(next));
    setStage(next);
    window.dispatchEvent(new Event(LUNA_PROGRESS_EVENT));
    if (next === 3) collectItem("luna-moon-snail-shell");
    setMessage(STAGES[stage].success);
  };
  return (
    <section aria-labelledby="luna-discovery-title" className="rounded-xl bg-sky-950/80 p-4 ring-1 ring-cyan-300/40">
      <h3 id="luna-discovery-title" className="text-lg font-bold">Luna the Moon Snail</h3>
      {stage === null ? <p>Checking Boo's secrets...</p> : !unlocked ?
        <p className="mt-2 text-sm text-sky-100">Boo knows a shy nighttime visitor. Reach friendship level 3 with Boo to unlock her discovery trail.</p> :
        stage === 3 ? <>
          <p className="mt-2 text-sm text-sky-100">Luna has been discovered! Her Moon Snail Shell is a permanent keepsake in your inventory.</p>
          <p className="mt-2 text-sm text-cyan-100">Boo whispers: “Luna likes quiet nights. Look for her silver trail when you visit the sandbar.”</p>
        </> :
        <>
          <p className="mt-2 text-sm text-sky-100">Boo clicks his claws softly: “Follow the silver trail. My shy friend is waiting.”</p>
          <p className="mt-2 font-semibold">Silver trail · Step {stage + 1} of 3</p>
          <p className="mt-1 text-sm italic text-cyan-100">{STAGES[stage].clue}</p>
          <button type="button" onClick={advance} className="mt-3 min-h-12 w-full rounded-lg bg-cyan-700 px-3 py-3 font-semibold text-white focus:outline-none focus:ring-4 focus:ring-amber-300">{STAGES[stage].label}</button>
        </>}
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 text-sm text-amber-100">{message}</p>
    </section>
  );
}
