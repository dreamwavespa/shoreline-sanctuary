"use client";

import Image from "next/image";
import { useState } from "react";
import { ITEMS } from "@/lib/items";
import { SPA_RECIPES } from "@/lib/spa-recipes";
import { useGame } from "@/lib/store";

const recipeArt: Record<(typeof SPA_RECIPES)[number]["id"], string> = {
  "spa-coconut-cream-lotion": "0% 0%",
  "spa-watermelon-sugar-scrub": "50% 0%",
  "spa-citrus-lotion": "100% 0%",
  "spa-coconut-seashell-soap": "0% 100%",
  "spa-vanilla-flower-candle": "50% 100%",
};

export default function SpaRecipeCounter({ onCraft, button }: { onCraft: (message: string) => void; button: string }) {
  const { state, craft } = useGame();
  const [index, setIndex] = useState(0);
  const recipe = SPA_RECIPES[index];
  const item = ITEMS[recipe.id];
  const owned = state.inventory[recipe.id] || 0;
  const ready = recipe.cost.every(({ itemId, count }) => (state.inventory[itemId] || 0) >= count);

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="block font-semibold">Choose a spa recipe</span>
        <select
          value={index}
          onChange={(event) => setIndex(Number(event.target.value))}
          className="min-h-12 w-full max-w-sm rounded-lg border border-teal-800 bg-white px-3 text-slate-900"
        >
          {SPA_RECIPES.map(({ id }, option) => <option key={id} value={option}>{ITEMS[id].name}</option>)}
        </select>
      </label>
      <article aria-labelledby="spa-recipe-title" className="overflow-hidden rounded-2xl border-4 border-double border-teal-800 bg-[#fff0d8] text-[#552c1b] shadow">
        <h5 id="spa-recipe-title" className="border-b border-amber-700/40 px-3 py-4 text-center font-serif text-2xl font-bold text-teal-950">
          <span aria-hidden="true" className="mr-2">🐚</span>{item.name}
        </h5>
        <div className="grid sm:grid-cols-[2fr_3fr]">
          <div aria-hidden="true" className="flex items-center justify-center border-amber-700/20 bg-[#fff7e9] sm:border-r">
            <div className="aspect-square w-full max-w-52 bg-no-repeat"
              style={{ backgroundImage: "url('/images/retreat/spa-recipe-art.png')", backgroundSize: "300% 200%", backgroundPosition: recipeArt[recipe.id] }} />
          </div>
          <div className="space-y-3 p-4">
            <p className="font-serif text-lg">{recipe.description}</p>
            <h6 className="bg-sky-200 px-2 py-1 font-serif text-lg font-bold text-teal-950">Ingredients</h6>
            <ul className="divide-y divide-amber-800/20">
              {recipe.cost.map(({ itemId, count }) => {
                const ingredient = ITEMS[itemId];
                const available = state.inventory[itemId] || 0;
                return (
                  <li key={itemId} className="flex items-center gap-2 py-2">
                    {ingredient.isEmoji
                      ? <span aria-hidden="true" className="shrink-0 text-xl">{ingredient.icon}</span>
                      : <Image src={ingredient.icon} alt="" width={24} height={24} unoptimized className="shrink-0 object-contain" />}
                    <span>{ingredient.name}. Need {count}, have {available}.</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 border-y border-amber-700/40 bg-amber-100 px-4 py-2 text-sm font-semibold">
          <span>Sea Glass Spa Counter</span><span>Available year-round</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <button
            type="button"
            className={button}
            aria-disabled={!ready}
            onClick={() => {
              if (!ready) return;
              if (craft(recipe.id, [...recipe.cost])) onCraft(`Made ${item.name}. Added one to your inventory.`);
              else onCraft("Check your inventory for the ingredients.");
            }}
          >Make {item.name}</button>
          <p>{ready ? `In inventory: ${owned}.` : `In inventory: ${owned}. More ingredients needed.`}</p>
        </div>
      </article>
    </div>
  );
}
