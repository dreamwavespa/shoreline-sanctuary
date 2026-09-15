"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";

type SmoothieRecipe = {
  id: string;
  name: string;
  icon: string;
  description: string;
  ingredients: { itemId: string; count: number }[];
};

const RECIPES: SmoothieRecipe[] = [
  {
    id: "strawberry-banana",
    name: "Strawberry Banana Smoothie",
    icon: "🍓🍌",
    description: "A creamy island favorite made with sweet strawberries and banana.",
    ingredients: [
      { itemId: "strawberry", count: 2 },
      { itemId: "banana", count: 1 },
    ],
  },
  {
    id: "tropical-pineapple",
    name: "Tropical Pineapple Smoothie",
    icon: "🍍🥥",
    description: "Bright pineapple blended with sweet green coconut from the grove.",
    ingredients: [
      { itemId: "pineapple", count: 1 },
      { itemId: "sweet-green-coconut", count: 1 },
    ],
  },
  {
    id: "mixed-berry",
    name: "Mixed Berry Smoothie",
    icon: "🍓🫐",
    description: "A colorful blend of strawberry, blueberry, and raspberry.",
    ingredients: [
      { itemId: "strawberry", count: 1 },
      { itemId: "blueberry", count: 1 },
      { itemId: "raspberry", count: 1 },
    ],
  },
  {
    id: "coastal-berry-mint",
    name: "Coastal Berry Mint Smoothie",
    icon: "🫐🌿",
    description: "Blueberries and raspberries with a refreshing sprig of coastal beach mint.",
    ingredients: [
      { itemId: "blueberry", count: 1 },
      { itemId: "raspberry", count: 1 },
      { itemId: "coastal-beach-mint", count: 1 },
    ],
  },
];

const BLENDER_AUDIO = "/audio/freesound_community-blender-mixer-smoothie-33026.mp3";
const POUR_AUDIO = "/audio/kalsstockmedia-large-glass-of-water-filling-sound-fx-353321.mp3";

export default function SmoothieBar({ onClose }: { onClose: () => void }) {
  const { state, cook } = useGame();
  const [selectedId, setSelectedId] = useState(RECIPES[0].id);
  const [status, setStatus] = useState("Choose a smoothie recipe, then blend it when you have the ingredients.");
  const [blending, setBlending] = useState(false);
  const blendTimer = useRef<number | null>(null);
  const pourTimer = useRef<number | null>(null);
  const blenderAudio = useRef<HTMLAudioElement | null>(null);
  const pourAudio = useRef<HTMLAudioElement | null>(null);

  const selected = useMemo(() => RECIPES.find((recipe) => recipe.id === selectedId) || RECIPES[0], [selectedId]);
  const hasIngredients = selected.ingredients.every(({ itemId, count }) => (state.inventory[itemId] || 0) >= count);

  useEffect(() => {
    return () => {
      if (blendTimer.current) window.clearTimeout(blendTimer.current);
      if (pourTimer.current) window.clearTimeout(pourTimer.current);
      blenderAudio.current?.pause();
      pourAudio.current?.pause();
    };
  }, []);

  const ingredientText = (recipe: SmoothieRecipe) =>
    recipe.ingredients
      .map(({ itemId, count }) => `${count} ${ITEMS[itemId]?.name || itemId}`)
      .join(", ");

  const stopAudio = (audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  const finishSmoothie = () => {
    stopAudio(pourAudio.current);
    const made = cook(selected.ingredients, `food-smoothie-${selected.id}`, 1);
    if (made) {
      setStatus(`${selected.name} is ready! It has been added to your inventory.`);
    } else {
      setStatus("The smoothie could not be made. Check your ingredients and try again.");
    }
    setBlending(false);
  };

  const startPour = () => {
    stopAudio(blenderAudio.current);
    setStatus(`Pouring ${selected.name} into a serving glass.`);
    if (!pourAudio.current) pourAudio.current = new Audio(POUR_AUDIO);
    pourAudio.current.volume = 0.75;
    pourAudio.current.currentTime = 0;
    pourAudio.current.play().catch(() => undefined);
    pourTimer.current = window.setTimeout(finishSmoothie, 2500);
  };

  const blend = () => {
    if (blending) return;
    if (!hasIngredients) {
      const missing = selected.ingredients
        .filter(({ itemId, count }) => (state.inventory[itemId] || 0) < count)
        .map(({ itemId, count }) => `${ITEMS[itemId]?.name || itemId}: need ${count}, have ${state.inventory[itemId] || 0}`)
        .join("; ");
      setStatus(`You need more ingredients for ${selected.name}. ${missing}.`);
      return;
    }

    setBlending(true);
    setStatus(`Blending ${selected.name}.`);
    if (!blenderAudio.current) blenderAudio.current = new Audio(BLENDER_AUDIO);
    blenderAudio.current.volume = 0.68;
    blenderAudio.current.currentTime = 0;
    blenderAudio.current.play().catch(() => undefined);
    blendTimer.current = window.setTimeout(startPour, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="smoothie-bar-title">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-amber-50 shadow-2xl ring-1 ring-amber-200">
        <div className="relative min-h-40 bg-gradient-to-br from-teal-700 via-cyan-600 to-amber-400 p-6 text-white">
          <button type="button" onClick={onClose} className="absolute right-4 top-4 min-h-12 rounded-xl bg-white/95 px-4 py-2 font-bold text-teal-900 shadow">Close</button>
          <p className="text-4xl" aria-hidden="true">🥤🌴🍓</p>
          <h1 id="smoothie-bar-title" className="mt-2 font-serif text-2xl font-bold">Community Ship Smoothie Bar</h1>
          <p className="mt-1 max-w-lg text-sm text-white/95">Turn fruit and herbs gathered around Shoreline Sanctuary into fresh drinks for the ship party.</p>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{status}</div>
          <p className="rounded-xl bg-white p-3 text-sm font-medium text-teal-950 shadow-sm" aria-hidden="true">{status}</p>

          <fieldset disabled={blending}>
            <legend className="mb-3 text-lg font-bold text-teal-950">Choose a recipe</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {RECIPES.map((recipe) => {
                const selectedRecipe = selectedId === recipe.id;
                const available = recipe.ingredients.every(({ itemId, count }) => (state.inventory[itemId] || 0) >= count);
                return (
                  <button
                    key={recipe.id}
                    type="button"
                    aria-pressed={selectedRecipe}
                    onClick={() => {
                      setSelectedId(recipe.id);
                      setStatus(`${recipe.name} selected. ${available ? "You have all ingredients." : "Some ingredients are missing."}`);
                    }}
                    className={`min-h-28 rounded-2xl p-4 text-left shadow-sm ring-2 ${selectedRecipe ? "bg-teal-100 ring-teal-700" : "bg-white ring-transparent"}`}
                  >
                    <span className="text-2xl" aria-hidden="true">{recipe.icon}</span>
                    <span className="mt-1 block font-bold text-teal-950">{recipe.name}</span>
                    <span className="mt-1 block text-xs text-teal-800">{recipe.description}</span>
                    <span className="mt-2 block text-xs font-semibold text-slate-700">Ingredients: {ingredientText(recipe)}</span>
                    <span className="mt-1 block text-xs font-bold text-teal-900">{available ? "Ready to blend" : "Ingredients needed"}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <section aria-labelledby="smoothie-selection-heading" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-teal-200">
            <h2 id="smoothie-selection-heading" className="font-bold text-teal-950">Selected: {selected.name}</h2>
            <p className="mt-1 text-sm text-teal-800">{selected.description}</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              {selected.ingredients.map(({ itemId, count }) => {
                const owned = state.inventory[itemId] || 0;
                return <li key={itemId}>{ITEMS[itemId]?.name || itemId}: {owned} available, {count} needed</li>;
              })}
            </ul>
            <button
              type="button"
              onClick={blend}
              disabled={blending}
              aria-describedby="smoothie-selection-heading"
              className="mt-4 min-h-12 w-full rounded-xl bg-teal-700 px-4 py-3 font-bold text-white shadow disabled:bg-teal-300 disabled:text-teal-800"
            >
              {blending ? "Preparing smoothie…" : `Blend ${selected.name}`}
            </button>
          </section>

          <p className="text-xs text-slate-600">The blending step is not a timed challenge. VoiceOver announces the selected recipe, missing ingredients, blending, pouring, and completion.</p>
        </div>
      </div>
    </div>
  );
}
