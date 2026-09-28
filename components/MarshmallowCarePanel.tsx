"use client";

import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";

const BOWL_DATE_KEY = "shoreline-marshmallow-water-bowl-date";
const BOWL_PLACED_KEY = "shoreline-marshmallow-water-bowl-placed";
const CRINKLE_GIVEN_KEY = "shoreline-marshmallow-crinkle-given";
const FISHING_GIVEN_KEY = "shoreline-marshmallow-fishing-given";
const CRINKLE_PLAY_KEY = "shoreline-marshmallow-crinkle-play-count";
const TOY_QUEST_STARTED_KEY = "shoreline-marshmallow-toy-quest-started";
const TOY_FOUND_KEY = "shoreline-marshmallow-toy-found";
const TOY_SEARCH_KEY = "shoreline-marshmallow-toy-search-count";

const BOWL_REACTIONS = [
  "Marshmallow takes a long drink, then looks up with a happy little meow.",
  "Marshmallow sniffs the fresh water, takes a few careful laps, and settles beside the bowl.",
  "Marshmallow drinks, washes one paw, and looks very pleased with himself.",
  "Marshmallow gives the bowl an approving sniff before taking a quiet drink.",
];

const CRINKLE_REACTIONS = [
  "Marshmallow bats the foil ball across the lighthouse floor and races after it.",
  "The foil ball crinkles under Marshmallow's paw. He freezes, wiggles, and pounces again.",
  "Marshmallow carries the crinkly ball a few steps, drops it, and chirps for another round.",
];

const FISHING_REACTIONS = [
  "Marshmallow crouches low, tracks the fishing-pole toy, and springs into the air after it.",
  "Marshmallow catches the dangling toy between both paws and refuses to let go for a moment.",
  "Marshmallow follows the fishing-pole toy in a determined little circle, tail swishing happily.",
];

function todayKey() {
  return new Date().toLocaleDateString("en-CA");
}

export default function MarshmallowCarePanel() {
  const { state, scratchMarshmallow } = useGame();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [bowlPlaced, setBowlPlaced] = useState(false);
  const [bowlFilledToday, setBowlFilledToday] = useState(false);
  const [crinkleGiven, setCrinkleGiven] = useState(false);
  const [fishingGiven, setFishingGiven] = useState(false);
  const [questStarted, setQuestStarted] = useState(false);
  const [toyFound, setToyFound] = useState(false);
  const questDone = !!state.questProgress["marshmallowlosttoy"];

  useEffect(() => {
    try {
      setBowlPlaced(window.localStorage.getItem(BOWL_PLACED_KEY) === "yes");
      setBowlFilledToday(window.localStorage.getItem(BOWL_DATE_KEY) === todayKey());
      setCrinkleGiven(window.localStorage.getItem(CRINKLE_GIVEN_KEY) === "yes");
      setFishingGiven(window.localStorage.getItem(FISHING_GIVEN_KEY) === "yes");
      setQuestStarted(window.localStorage.getItem(TOY_QUEST_STARTED_KEY) === "yes");
      setToyFound(window.localStorage.getItem(TOY_FOUND_KEY) === "yes");
    } catch {}
  }, []);

  const announceQuestChange = () => {
    try { window.dispatchEvent(new Event("shoreline:marshmallow-toy-quest")); } catch {}
  };

  const placeBowl = () => {
    try { window.localStorage.setItem(BOWL_PLACED_KEY, "yes"); } catch {}
    setBowlPlaced(true);
    setMessage("The Sea Glass Water Bowl now has a permanent place beside Marshmallow's resting area.");
  };

  const fillBowl = () => {
    if (bowlFilledToday) return;
    try { window.localStorage.setItem(BOWL_DATE_KEY, todayKey()); } catch {}
    setBowlFilledToday(true);
    scratchMarshmallow();
    setMessage(BOWL_REACTIONS[Math.floor(Math.random() * BOWL_REACTIONS.length)]);
  };

  const giveCrinkle = () => {
    try { window.localStorage.setItem(CRINKLE_GIVEN_KEY, "yes"); } catch {}
    setCrinkleGiven(true);
    setMessage("You give Marshmallow the Crinkly Foil Ball. He taps it once, hears the crinkle, and immediately pounces.");
  };

  const giveFishing = () => {
    try { window.localStorage.setItem(FISHING_GIVEN_KEY, "yes"); } catch {}
    setFishingGiven(true);
    setMessage("You set out the Fishing Pole Toy. Marshmallow's eyes go wide as the little lure dances across the floor.");
  };

  const playCrinkle = () => {
    if (questStarted && !questDone && !toyFound) {
      setMessage("Marshmallow looks around for his Crinkly Foil Ball, but it is still missing. The bottle clue may help you find it.");
      return;
    }
    let plays = 1;
    try {
      plays = Number(window.localStorage.getItem(CRINKLE_PLAY_KEY) || "0") + 1;
      window.localStorage.setItem(CRINKLE_PLAY_KEY, String(plays));
    } catch {}
    scratchMarshmallow();
    setMessage(CRINKLE_REACTIONS[Math.floor(Math.random() * CRINKLE_REACTIONS.length)]);
    if (!questStarted && plays >= 3) {
      try { window.localStorage.setItem(TOY_QUEST_STARTED_KEY, "yes"); } catch {}
      setQuestStarted(true);
      announceQuestChange();
      window.setTimeout(() => setMessage("After all that play, Marshmallow's Crinkly Foil Ball has vanished. A bottle clue has appeared in Bottle Quests."), 900);
    }
  };

  const playFishing = () => {
    scratchMarshmallow();
    setMessage(FISHING_REACTIONS[Math.floor(Math.random() * FISHING_REACTIONS.length)]);
  };

  const searchForToy = () => {
    let attempts = 1;
    try {
      attempts = Number(window.localStorage.getItem(TOY_SEARCH_KEY) || "0") + 1;
      window.localStorage.setItem(TOY_SEARCH_KEY, String(attempts));
    } catch {}
    if (attempts === 1) {
      setMessage("You check beneath the lighthouse chair. Nothing there, but Marshmallow watches closely.");
      return;
    }
    if (attempts === 2) {
      setMessage("Near the stairs you hear a faint crinkle. Marshmallow's ears perk up. You're getting close.");
      return;
    }
    try { window.localStorage.setItem(TOY_FOUND_KEY, "yes"); } catch {}
    setToyFound(true);
    announceQuestChange();
    setMessage("Found it! The Crinkly Foil Ball was tucked behind a storage basket. Marshmallow chirps, grabs it, and trots proudly back to his bed.");
  };

  return (
    <div className="absolute bottom-4 right-4 z-30 max-w-[calc(100%-2rem)]">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-rose-700 px-4 py-3 font-bold text-white shadow-lg ring-2 ring-white/80" aria-label="Open Marshmallow care and play">
          🐈 Care & Play
        </button>
      ) : (
        <section aria-label="Marshmallow care and play" className="w-[min(24rem,calc(100vw-2rem))] max-h-[70vh] overflow-y-auto rounded-2xl bg-rose-50 p-4 shadow-2xl ring-2 ring-rose-200">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-wide text-rose-700">Lighthouse Cat</p><h2 className="font-serif text-xl font-bold text-rose-950">Marshmallow's Care & Play</h2></div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-white px-3 py-2 font-bold text-rose-800 ring-1 ring-rose-200" aria-label="Close Marshmallow care and play">✕</button>
          </div>

          {message && <p role="status" aria-live="polite" className="mt-3 rounded-xl bg-white p-3 text-sm text-rose-900 ring-1 ring-rose-200">{message}</p>}

          <div className="mt-4 rounded-xl bg-cyan-50 p-3 ring-1 ring-cyan-200">
            <h3 className="font-bold text-teal-900">💧 Sea Glass Water Bowl</h3>
            <p className="mt-1 text-xs text-teal-800">A permanent lighthouse care item. Refill it once each day; missing a day never causes a penalty.</p>
            {!bowlPlaced ? (
              <button type="button" onClick={placeBowl} className="mt-2 w-full rounded-lg bg-teal-700 py-2 font-semibold text-white">Set Out Sea Glass Water Bowl</button>
            ) : (
              <button type="button" disabled={bowlFilledToday} onClick={fillBowl} className="mt-2 w-full rounded-lg bg-teal-700 py-2 font-semibold text-white disabled:bg-teal-200 disabled:text-teal-600">{bowlFilledToday ? "Water Bowl Filled Today ✓" : "Refill Marshmallow's Water Bowl"}</button>
            )}
          </div>

          <div className="mt-3 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
            <h3 className="font-bold text-amber-950">🧶 Toys</h3>
            <p className="mt-1 text-xs text-amber-800">Once given to Marshmallow, his toys stay at the lighthouse and can be used again.</p>
            <div className="mt-2 grid gap-2">
              {!crinkleGiven ? <button type="button" onClick={giveCrinkle} className="rounded-lg bg-amber-700 py-2 font-semibold text-white">Give Crinkly Foil Ball</button> : <button type="button" onClick={playCrinkle} className="rounded-lg bg-amber-700 py-2 font-semibold text-white">Play with Crinkly Foil Ball</button>}
              {!fishingGiven ? <button type="button" onClick={giveFishing} className="rounded-lg bg-amber-700 py-2 font-semibold text-white">Give Fishing Pole Toy</button> : <button type="button" onClick={playFishing} className="rounded-lg bg-amber-700 py-2 font-semibold text-white">Play with Fishing Pole Toy</button>}
            </div>
          </div>

          {questStarted && !questDone && (
            <div className="mt-3 rounded-xl bg-violet-50 p-3 ring-1 ring-violet-200">
              <h3 className="font-bold text-violet-950">🍾 Marshmallow's Missing Toy</h3>
              {!toyFound ? <><p className="mt-1 text-xs text-violet-800">Read Marshmallow's bottle clue in Bottle Quests, then search inside the lighthouse. Listen for the faint crinkle.</p><button type="button" onClick={searchForToy} className="mt-2 w-full rounded-lg bg-violet-700 py-2 font-semibold text-white">Search the Lighthouse</button></> : <p className="mt-1 text-sm font-semibold text-violet-900">You found the Crinkly Foil Ball! Return to Bottle Quests to finish the memory.</p>}
            </div>
          )}

          {questDone && <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 ring-1 ring-emerald-200"><strong>Relationship memory:</strong> You found Marshmallow's lost toy. 💕</div>}
        </section>
      )}
    </div>
  );
}
