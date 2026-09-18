"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";

const REWARDS = [
  { id: "halloween-candy", weight: 16, rare: false },
  { id: "chocolate-seashells", weight: 13, rare: false },
  { id: "shell-sanddollar", weight: 11, rare: false },
  { id: "dried-sugar-berries", weight: 10, rare: false },
  { id: "orange-sea-glitter", weight: 9, rare: false },
  { id: "orange-glaze", weight: 8, rare: false },
  { id: "glowing-wax", weight: 7, rare: false },
  { id: "pumpkin-spice", weight: 7, rare: false },
  { id: "ghost-pearl", weight: 4, rare: true },
  { id: "moon-charm", weight: 3, rare: true },
  { id: "carnelian-crystal-pumpkin", weight: 2, rare: true },
  { id: "clear-quartz-skull", weight: 2, rare: true },
  { id: "black-obsidian-cat", weight: 2, rare: true },
  { id: "porcelain-ghost-figurine", weight: 2, rare: true },
  { id: "magic-8-ball", weight: 2, rare: true },
  { id: "white-pumpkin", weight: 2, rare: true },
  { id: "yellow-pumpkin", weight: 2, rare: true },
  { id: "green-pumpkin", weight: 2, rare: true },
  { id: "blue-pumpkin", weight: 2, rare: true },
];

const TRICKS = [
  { sound: "boo_hahaha.mp3", text: "A voice cries Boo! and laughter circles the cottage." },
  { sound: "cartoon_ghost_wooo.mp3", text: "A tiny ghostly wooo floats out of the cauldron." },
  { sound: "scary_ghost_excerpt.mp3", text: "A ghostly voice rises from the bubbling brew." },
  { sound: "spooky_laughter.mp3", text: "Mysterious laughter echoes around the room." },
  { sound: "crow_caws.mp3", text: "A few phantom crows caw overhead." },
  { sound: "angry_cat_hiss.mp3", text: "A magical cat gives one dramatic hiss." },
  { sound: "slime_impact.mp3", text: "The cauldron splashes harmless green slime." },
  { sound: "glass_breaking.mp3", text: "There is a startling crash—but nothing actually broke!" },
  { sound: "halloween_wind.mp3", text: "A sudden spooky wind swirls around the cottage." },
];

const EIGHT_BALL_ANSWERS = [
  "The tide says yes.",
  "Ask again after sunset.",
  "A lucky shell may be closer than you think.",
  "Maeve would tell you to watch the horizon.",
  "The tide pool is whispering about a discovery.",
  "Sheldon may have something interesting today.",
  "The moon says: be curious.",
  "A little patience will reveal the answer.",
  "Signs point toward the cove.",
  "The sea keeps some secrets until tomorrow.",
];

function dateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// TEMPORARY TEST OVERRIDE: keep the October event visible before October so it can be tested.
const HALLOWEEN_TEST_MODE = true;

function isOctober() {
  return HALLOWEEN_TEST_MODE || new Date().getMonth() === 9;
}

function rollReward() {
  const total = REWARDS.reduce((sum, reward) => sum + reward.weight, 0);
  let roll = Math.random() * total;
  for (const reward of REWARDS) {
    if (roll < reward.weight) return reward;
    roll -= reward.weight;
  }
  return REWARDS[0];
}

function playHalloween(file: string, volume = 0.75) {
  try {
    const audio = new Audio(`/audio/halloween/${file}`);
    audio.volume = volume;
    void audio.play();
  } catch {}
}

export default function HalloweenCauldron() {
  const { state, collectItem } = useGame();
  const [lastClaim, setLastClaim] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [eightBallDate, setEightBallDate] = useState("");
  const [eightBallAnswer, setEightBallAnswer] = useState("");

  useEffect(() => {
    try {
      setLastClaim(localStorage.getItem("shoreline-halloween-cauldron-date") || "");
      setEightBallDate(localStorage.getItem("shoreline-magic-8-ball-date") || "");
    } catch {}
  }, []);

  const today = dateKey();
  const claimed = !HALLOWEEN_TEST_MODE && lastClaim === today;
  const hasEightBall = (state.inventory["magic-8-ball"] || 0) > 0;
  const pumpkins = useMemo(() => ["white-pumpkin", "yellow-pumpkin", "green-pumpkin", "blue-pumpkin"], []);
  const pumpkinCount = pumpkins.filter((id) => (state.inventory[id] || 0) > 0).length;

  if (!isOctober()) return null;

  const trickOrTreat = () => {
    if (busy || claimed) return;
    setBusy(true);
    setMessage("The cauldron bubbles and glows...");
    // Play the clearer cauldron bubbling recording before the trick.
    playHalloween("cauldron.wav", 1);
    window.setTimeout(() => {
      const trick = TRICKS[Math.floor(Math.random() * TRICKS.length)];
      const reward = rollReward();
      playHalloween(trick.sound, 0.68);
      collectItem(reward.id, { silent: true });
      try { localStorage.setItem("shoreline-halloween-cauldron-date", today); } catch {}
      setLastClaim(today);
      const rewardName = ITEMS[reward.id]?.name || reward.id;
      setMessage(`${trick.text} Underneath the trick, you find ${rewardName}!`);
      if (reward.rare) window.setTimeout(() => playHalloween("rare_reward_sparkle.mp3", 0.7), 650);
      setBusy(false);
    }, 3200);
  };

  const askEightBall = () => {
    if (!hasEightBall || eightBallDate === today) return;
    const answer = EIGHT_BALL_ANSWERS[Math.floor(Math.random() * EIGHT_BALL_ANSWERS.length)];
    setEightBallAnswer(answer);
    setEightBallDate(today);
    try { localStorage.setItem("shoreline-magic-8-ball-date", today); } catch {}
    playHalloween("rare_reward_sparkle.mp3", 0.55);
  };

  return (
    <section aria-labelledby="halloween-cauldron-heading" className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-purple-50 to-emerald-50 shadow-md ring-1 ring-orange-300">
      <div className="relative h-44 w-full">
        <Image src="/images/IMG_6365.jpeg" alt="A Halloween cauldron bubbling over a fire with green mist, glowing bubbles, herbs, and tiny spooky decorations" fill unoptimized className="object-cover" />
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-800">October Cottage Event{HALLOWEEN_TEST_MODE ? " · Test Mode" : ""}</p>
        <h2 id="halloween-cauldron-heading" className="mt-1 font-serif text-lg font-bold text-purple-950">🎃 The Trick-or-Treat Cauldron</h2>
        <p className="mt-1 text-sm text-purple-900">Visit once each day in October. The cauldron always gives a treat, but it may play a trick first.</p>
        <button type="button" disabled={busy} onClick={trickOrTreat} className="mt-3 w-full rounded-xl bg-orange-700 py-3 font-bold text-white shadow disabled:cursor-not-allowed disabled:bg-orange-300">
          {busy ? "The cauldron is bubbling..." : claimed ? "Today's treat collected — come back tomorrow" : "Trick or Treat!"}
        </button>
        <div aria-live="polite" aria-atomic="true" className="mt-3 min-h-6 text-sm font-semibold text-purple-950">{message}</div>
        {HALLOWEEN_TEST_MODE && claimed && (
          <button
            type="button"
            onClick={() => {
              try { localStorage.removeItem("shoreline-halloween-cauldron-date"); } catch {}
              setLastClaim("");
              setMessage("Test reset complete. The cauldron is ready for another trick or treat.");
            }}
            className="mt-2 w-full rounded-xl border border-purple-400 bg-white py-2 font-semibold text-purple-900"
          >
            Reset today's cauldron for testing
          </button>
        )}
        <p className="mt-2 text-xs text-purple-800">Pumpkin Collection: {pumpkinCount}/4 colors found — White, Yellow, Green, and Blue.</p>

        {hasEightBall && (
          <div className="mt-4 rounded-xl bg-indigo-950 p-3 text-indigo-50">
            <h3 className="font-bold">🔮 Magic 8 Ball</h3>
            <p className="mt-1 text-xs text-indigo-100">Your rare cauldron find is now a permanent cottage keepsake. Ask it one question each day.</p>
            <button type="button" onClick={askEightBall} disabled={eightBallDate === today} className="mt-2 w-full rounded-lg bg-violet-600 py-2 font-semibold text-white disabled:bg-violet-900">
              {eightBallDate === today ? "The Magic 8 Ball is resting until tomorrow" : "Ask the Magic 8 Ball"}
            </button>
            <div aria-live="polite" className="mt-2 text-sm font-semibold">{eightBallAnswer}</div>
          </div>
        )}
      </div>
    </section>
  );
}
