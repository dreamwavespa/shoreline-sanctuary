"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";

interface MatchCard {
  uid: string;
  itemId: string;
  faceUp: boolean;
  matched: boolean;
}

const LEVELS = [
  {
    name: "Gentle Tide",
    description: "Three clearly different shell pairs.",
    shells: ["shell-scallop", "shell-conch", "shell-sanddollar"],
  },
  {
    name: "Pattern Shore",
    description: "Four pairs with more similar shapes and patterns.",
    shells: ["shell-scallop", "shell-clam", "shell-whelk", "shell-cowrie"],
  },
  {
    name: "Rare Shell Cove",
    description: "Six pairs, including the rare Abalone Shell.",
    shells: ["shell-nautilus", "shell-murex", "shell-conch", "shell-abalone", "shell-clam", "shell-cowrie"],
  },
] as const;

function makeBoard(shells: readonly string[]): MatchCard[] {
  return shells
    .flatMap((itemId, pairIndex) => [
      { uid: `${Date.now()}-${pairIndex}-a`, itemId, faceUp: false, matched: false },
      { uid: `${Date.now()}-${pairIndex}-b`, itemId, faceUp: false, matched: false },
    ])
    .sort(() => Math.random() - 0.5);
}

export default function ShellMatch({ onClose }: { onClose: () => void }) {
  const { collectItem } = useGame();
  const [levelIndex, setLevelIndex] = useState(0);
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [firstCardIndex, setFirstCardIndex] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [rewardItemId, setRewardItemId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("Choose a level to begin Shell Match.");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const level = LEVELS[levelIndex];
  const matchedPairs = useMemo(() => cards.filter((card) => card.matched).length / 2, [cards]);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const startLevel = (nextLevelIndex = levelIndex) => {
    const nextLevel = LEVELS[nextLevelIndex];
    const nextCards = makeBoard(nextLevel.shells);
    setLevelIndex(nextLevelIndex);
    setCards(nextCards);
    setFirstCardIndex(null);
    setMoves(0);
    setLocked(false);
    setComplete(false);
    setRewardItemId(null);
    setPlaying(true);
    setAnnouncement(`${nextLevel.name} started. ${nextCards.length} face-down cards in the board.`);
    window.setTimeout(() => cardRefs.current[0]?.focus(), 0);
  };

  const finishLevel = (finishedCards: MatchCard[], nextMoves: number) => {
    const reward = levelIndex === LEVELS.length - 1 ? "shell-abalone" : level.shells[Math.floor(Math.random() * level.shells.length)];
    collectItem(reward);
    setCards(finishedCards);
    setFirstCardIndex(null);
    setLocked(false);
    setComplete(true);
    setPlaying(false);
    setRewardItemId(reward);
    setAnnouncement(`All pairs matched in ${nextMoves} moves. ${ITEMS[reward].name} added to your inventory.`);
  };

  const turnCard = (index: number) => {
    const card = cards[index];
    if (!card || locked || card.faceUp || card.matched || complete) return;

    const turnedCards = cards.map((item, cardIndex) => (cardIndex === index ? { ...item, faceUp: true } : item));
    setCards(turnedCards);

    if (firstCardIndex === null) {
      setFirstCardIndex(index);
      setAnnouncement(`Card ${index + 1}: ${ITEMS[card.itemId].name}. Choose one more card.`);
      return;
    }

    const firstCard = turnedCards[firstCardIndex];
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    setLocked(true);

    if (firstCard.itemId === card.itemId) {
      setAnnouncement(`Match: ${ITEMS[card.itemId].name}.`);
      window.setTimeout(() => {
        const matchedCards = turnedCards.map((item, cardIndex) =>
          cardIndex === firstCardIndex || cardIndex === index ? { ...item, matched: true } : item
        );
        const allMatched = matchedCards.every((item) => item.matched);
        if (allMatched) {
          finishLevel(matchedCards, nextMoves);
        } else {
          setCards(matchedCards);
          setFirstCardIndex(null);
          setLocked(false);
          setAnnouncement(`Match saved. ${matchedCards.filter((item) => item.matched).length / 2} of ${level.shells.length} pairs found.`);
          const nextAvailable = matchedCards.findIndex((item) => !item.matched && !item.faceUp);
          window.setTimeout(() => cardRefs.current[nextAvailable]?.focus(), 0);
        }
      }, 650);
    } else {
      setAnnouncement(`Not a match: ${ITEMS[firstCard.itemId].name} and ${ITEMS[card.itemId].name}. The cards will turn face down.`);
      window.setTimeout(() => {
        setCards((current) => current.map((item, cardIndex) =>
          cardIndex === firstCardIndex || cardIndex === index ? { ...item, faceUp: false } : item
        ));
        setFirstCardIndex(null);
        setLocked(false);
        setAnnouncement("Cards are face down. Choose another card.");
        window.setTimeout(() => cardRefs.current[firstCardIndex]?.focus(), 0);
      }, 1100);
    }
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const columns = cards.length <= 8 ? 4 : 4;
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = Math.min(cards.length - 1, index + 1);
    else if (event.key === "ArrowLeft") nextIndex = Math.max(0, index - 1);
    else if (event.key === "ArrowDown") nextIndex = Math.min(cards.length - 1, index + columns);
    else if (event.key === "ArrowUp") nextIndex = Math.max(0, index - columns);
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = cards.length - 1;
    else return;
    event.preventDefault();
    cardRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#082f49]/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="shell-match-title">
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-sky-50 to-amber-50 p-5 shadow-2xl ring-1 ring-sky-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sky-700">Cove Mini-Game</p>
            <h2 id="shell-match-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold text-sky-950 outline-none">🐚 Shell Match</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-sky-900 ring-1 ring-sky-200">Close</button>
        </div>

        {!playing && !complete ? (
          <div className="mt-5">
            <p className="text-sky-950">Turn over two cards at a time and remember where each shell is hiding.</p>
            <fieldset className="mt-5">
              <legend className="font-bold text-sky-950">Choose a level</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {LEVELS.map((option, index) => (
                  <button
                    key={option.name}
                    type="button"
                    aria-pressed={levelIndex === index}
                    onClick={() => {
                      setLevelIndex(index);
                      setAnnouncement(`${option.name} selected. ${option.description}`);
                    }}
                    className={`rounded-xl px-3 py-3 text-left ring-2 ${levelIndex === index ? "bg-sky-800 text-white ring-sky-900" : "bg-white text-sky-950 ring-sky-200"}`}
                  >
                    <span className="block font-bold">Level {index + 1}: {option.name}</span>
                    <span className={`mt-1 block text-sm ${levelIndex === index ? "text-sky-100" : "text-sky-700"}`}>{option.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <button type="button" onClick={() => startLevel()} className="mt-5 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800">Start Shell Match</button>
          </div>
        ) : complete ? (
          <div className="mt-6 text-center">
            <div className="text-5xl" aria-hidden="true">🐚✨</div>
            <h3 className="mt-2 text-xl font-bold text-sky-950">Every Pair Found!</h3>
            <p className="mt-2 text-sky-900">{level.name} completed in {moves} moves.</p>
            {rewardItemId && <p className="mt-2 font-semibold text-teal-800">Reward: {ITEMS[rewardItemId].name}</p>}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => startLevel()} className="rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">Play Again</button>
              {levelIndex < LEVELS.length - 1 && (
                <button type="button" onClick={() => startLevel(levelIndex + 1)} className="rounded-xl bg-sky-800 px-4 py-3 font-bold text-white">Next Level</button>
              )}
              <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-3 font-bold text-sky-900 ring-1 ring-sky-300">Return to Cove</button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm font-semibold text-sky-950">
              <span>Pairs: {matchedPairs}/{level.shells.length}</span>
              <span>Moves: {moves}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky-200" role="progressbar" aria-label="Shell pairs found" aria-valuemin={0} aria-valuemax={level.shells.length} aria-valuenow={matchedPairs}>
              <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${(matchedPairs / level.shells.length) * 100}%` }} />
            </div>
            <p className="mt-3 text-sm text-sky-800">Use Tab or the arrow keys to move between cards. Press Enter or Space to turn one over.</p>

            <div className="mt-4 grid grid-cols-4 gap-2" role="group" aria-label={`${level.name} shell matching board`}>
              {cards.map((card, index) => {
                const revealed = card.faceUp || card.matched;
                const name = ITEMS[card.itemId].name;
                return (
                  <button
                    key={card.uid}
                    ref={(element) => { cardRefs.current[index] = element; }}
                    type="button"
                    disabled={card.matched || locked}
                    onClick={() => turnCard(index)}
                    onKeyDown={(event) => handleCardKeyDown(event, index)}
                    aria-label={card.matched ? `Card ${index + 1}, ${name}, matched` : revealed ? `Card ${index + 1}, ${name}, face up` : `Card ${index + 1}, face down`}
                    className={`aspect-[3/4] min-h-20 rounded-xl p-2 shadow-md ring-2 transition ${card.matched ? "bg-emerald-100 ring-emerald-400 opacity-75" : revealed ? "bg-white ring-amber-300" : "bg-gradient-to-br from-sky-700 to-teal-800 ring-sky-300"} disabled:cursor-default`}
                  >
                    {revealed ? (
                      <span className="flex h-full flex-col items-center justify-center gap-1">
                        <Image src={ITEMS[card.itemId].icon} alt="" width={54} height={54} unoptimized className="max-h-14 object-contain" />
                        <span className="text-[11px] font-bold leading-tight text-sky-950">{name}</span>
                      </span>
                    ) : (
                      <span aria-hidden="true" className="flex h-full items-center justify-center text-3xl text-white">?</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      </div>
    </div>
  );
}
