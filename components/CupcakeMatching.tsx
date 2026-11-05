"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";

type Flavor = "vanilla" | "chocolate" | "strawberry" | "lemon" | "blueberry" | "coconut";
type Mode = "beginner" | "intermediate" | "advanced";
type Card = { id: string; flavor: Flavor; kind: "decorated" | "plain" | "frosting"; label: string };
const FLAVORS: Flavor[] = ["vanilla", "chocolate", "strawberry", "lemon", "blueberry", "coconut"];
const REWARD_KEY = "shoreline-cupcake-match-reward-date";
const IMAGE_DIR = "/images/Cupcakes";
const label = (flavor: Flavor) => flavor[0].toUpperCase() + flavor.slice(1);
const shuffle = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);
const localDay = () => new Date().toLocaleDateString("en-CA");

export default function CupcakeMatching({ onClose }: { onClose: () => void }) {
  const { collectItem, play } = useGame();
  const [mode, setMode] = useState<Mode>("beginner");
  const [cards, setCards] = useState<Card[]>([]);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState("Choose a difficulty and begin matching cupcakes.");
  const [reward, setReward] = useState("");
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const closeRef = useRef(onClose);
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRef = useRef<string[]>([]);
  const matchedRef = useRef<string[]>([]);
  const gameIdRef = useRef(0);
  closeRef.current = onClose;

  useEffect(() => {
    headingRef.current?.focus();
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("keydown", escape);
      if (pendingRef.current) clearTimeout(pendingRef.current);
      gameIdRef.current += 1;
    };
  }, []);

  const start = (nextMode: Mode) => {
    if (pendingRef.current) clearTimeout(pendingRef.current);
    gameIdRef.current += 1;
    setMode(nextMode);
    const flavors = nextMode === "beginner" ? FLAVORS.slice(0, 3) : FLAVORS;
    const nextCards = flavors.flatMap((flavor) => {
      const kinds: Card["kind"][] = nextMode === "beginner" ? ["decorated", "decorated"] : nextMode === "intermediate" ? ["plain", "frosting"] : ["plain", "decorated"];
      return kinds.map((kind, index) => ({ id: `${flavor}-${kind}-${index}`, flavor, kind, label: `${label(flavor)} ${kind === "plain" ? "plain cupcake" : kind === "frosting" ? "frosting and decorations" : "decorated cupcake"}` }));
    });
    setCards(shuffle(nextCards));
    setRevealed([]);
    setMatched([]);
    selectedRef.current = [];
    matchedRef.current = [];
    setMoves(0);
    setReward("");
    setLocked(false);
    setStarted(true);
    setMessage(`${nextMode} game started. ${flavors.length} pairs. Select a card to reveal it, then find its matching flavor.`);
  };

  const selectCard = (card: Card, position: number) => {
    if (locked || matchedRef.current.includes(card.id)) return;
    if (selectedRef.current.includes(card.id)) {
      setMessage(`Card ${position + 1}, ${card.label}, is already selected. Choose another card.`);
      return;
    }
    const selected = [...selectedRef.current, card.id];
    selectedRef.current = selected;
    setRevealed(selected);
    if (selected.length === 1) {
      play("bagRustle");
      setMessage(`Card ${position + 1}: ${card.label}. Choose a second card.`);
      return;
    }
    setMoves((count) => count + 1);
    const first = cards.find((item) => item.id === selected[0])!;
    const correct = first.flavor === card.flavor;
    setLocked(true);
    if (correct) {
      play("picnicLatch");
      const nextMatched = [...matchedRef.current, ...selected];
      matchedRef.current = nextMatched;
      setMatched(nextMatched);
      setMessage(`Match! ${label(card.flavor)} cupcake pair found. ${nextMatched.length / 2} of ${cards.length / 2} pairs completed.`);
    } else {
      play("plastic");
      setMessage(`Not a match. ${first.label} and ${card.label}. Try again.`);
    }
    const gameId = gameIdRef.current;
    pendingRef.current = setTimeout(() => {
      if (gameId !== gameIdRef.current) return;
      selectedRef.current = [];
      setRevealed([]);
      setLocked(false);
      if (correct && matchedRef.current.length === cards.length) {
        let bonus = "Today's baking ingredient bonus was already collected. You can keep playing!";
        try {
          if (localStorage.getItem(REWARD_KEY) !== localDay()) {
            const ingredients = ["flour", "eggs", "cocoa-powder", "flour", "eggs", "cocoa-powder", "vanilla"];
            const ingredient = ingredients[Math.floor(Math.random() * ingredients.length)];
            collectItem(ingredient, { silent: true });
            localStorage.setItem(REWARD_KEY, localDay());
            bonus = `Daily reward: 1 ${ingredient === "cocoa-powder" ? "cocoa powder" : ingredient} added to your inventory.`;
          }
        } catch {
          bonus = "Round complete. Your daily reward could not be saved.";
        }
        setReward(bonus);
        setMessage(`All ${cards.length / 2} cupcake pairs matched in ${moves + 1} turns. ${bonus}`);
      }
    }, correct ? 450 : 950);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-amber-950/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="cupcake-matching-title">
      <div className="mx-auto max-w-3xl rounded-3xl bg-rose-50 p-5 text-amber-950 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 id="cupcake-matching-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold outline-none">🧁 Cupcake Matching</h2>
          <button type="button" onClick={onClose} className="rounded-lg bg-white px-4 py-2 font-bold ring-1 ring-rose-300">Close</button>
        </div>
        <p className="mt-3">Match cupcake flavors! Beginner pairs identical decorated cupcakes. Intermediate pairs plain cupcakes with their frosting. Advanced pairs plain cupcakes with their finished decorated versions.</p>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Choose a matching level">
          <button type="button" onClick={() => start("beginner")} className="rounded-lg bg-rose-700 px-4 py-3 font-semibold text-white">Beginner: 3 pairs</button>
          <button type="button" onClick={() => start("intermediate")} className="rounded-lg bg-teal-800 px-4 py-3 font-semibold text-white">Intermediate: 6 pairs</button>
          <button type="button" onClick={() => start("advanced")} className="rounded-lg bg-purple-800 px-4 py-3 font-semibold text-white">Advanced: 6 pairs</button>
        </div>
        <p className="mt-3 text-sm">One surprise baking ingredient per day for your first completed round. No ingredients are spent to play. Sounds use existing Shoreline effects for now.</p>
        {started && (
          <>
            <p className="mt-4 font-semibold">Level: {mode}. Moves: {moves}. Pairs matched: {matched.length / 2} of {cards.length / 2}.</p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Cupcake matching cards">
              {cards.map((card, index) => {
                const found = matched.includes(card.id);
                const faceUp = found || revealed.includes(card.id);
                return (
                  <button key={card.id} type="button" onClick={() => selectCard(card, index)} disabled={found || locked}
                    aria-label={`Card ${index + 1}: ${faceUp ? card.label : "hidden cupcake"}. ${found ? "Matched." : faceUp ? "Revealed." : "Select to reveal."}`}
                    className={`flex min-h-28 flex-col items-center justify-center rounded-xl border-2 p-2 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-800 ${found ? "border-emerald-600 bg-emerald-100" : "border-rose-300 bg-white"}`}>
                    {faceUp ? (
                      <Image src={`${IMAGE_DIR}/cupcake-${card.flavor}-${card.kind}.png`} alt="" width={120} height={120} unoptimized className="h-24 w-24 object-contain" />
                    ) : <span aria-hidden="true" className="text-5xl">🧁</span>}
                    <span className="mt-1 text-xs font-semibold">{faceUp ? card.label : `Card ${index + 1}`}</span>
                  </button>
                );
              })}
            </div>
            {matched.length === cards.length && <p className="mt-4 font-bold text-emerald-800">All cupcakes matched! {reward}</p>}
          </>
        )}
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{message}</p>
        <p className="mt-4 text-sm text-amber-800">Choose any level again to replay. Press Escape to close.</p>
      </div>
    </div>
  );
}
