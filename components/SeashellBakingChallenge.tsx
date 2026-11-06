"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";
import Image from "next/image";

const ART = "/images/Baking/";
const ingredientImages: Record<string, string> = {
  Flour: "Flour.png", Eggs: "Eggs.png", Vanilla: "Vanilla.png",
  "Cocoa powder": "Cocoa-powder.png", "Coconut cream": "Coconut.png",
  Strawberries: "Strawberries.png", Butter: "Butter.png", Sugar: "Sugar.png",
  "Cream cheese": "Cream-cheese.png", Biscuits: "Seashell-biscuits.png",
  Blueberries: "Blueberries.png",
};
const decorationImages: Record<string, string> = {
  "Pearl sprinkles": "Pearl-sprinkles.png",
  "Chocolate curls": "Chocolate-curls.png",
  "Coconut flakes": "Coconut-flakes.png",
  "Berry glaze": "Strawberries.png",
  "Pastel icing": "Pink-frosting.png",
  "Vanilla cream": "Vanilla-frosting.png",
  "Blueberry topping": "Blueberries.png",
  "Chocolate drizzle": "Chocolate-frosting.png",
  "Whipped cream": "Whipped-cream.png",
};

function OrderArt({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (failed) return <p className="text-sm italic">{alt}</p>;
  return <Image src={src} alt={alt} width={220} height={220} unoptimized onError={() => setFailed(true)} className="mx-auto max-h-44 w-auto max-w-full object-contain" />;
}
function BakingArt({ file, name, size = 160 }: { file: string; name: string; size?: number }) {
  return <Image src={ART + file} alt={name} width={size} height={size} unoptimized className="mx-auto max-h-44 w-auto max-w-full object-contain" />;
}

type BakingOrder = { name: string; ingredients: string[]; decoration: string; image: string; steps: string[] };
const orders: BakingOrder[] = [
  { name: "Vanilla Seashell Cakes", ingredients: ["Flour", "Eggs", "Vanilla"], decoration: "Pearl sprinkles", image: "/images/Baking/Vanilla-seashell-cake.png", steps: ["Stir batter", "Fill seashell mold", "Bake and cool cakes"] },
  { name: "Chocolate Tide Cakes", ingredients: ["Flour", "Eggs", "Cocoa powder"], decoration: "Chocolate curls", image: "/images/Baking/Chocolate-seashell-cake.png", steps: ["Stir batter", "Fill seashell mold", "Bake and cool cakes"] },
  { name: "Coconut Shore Cakes", ingredients: ["Flour", "Eggs", "Coconut cream"], decoration: "Coconut flakes", image: "/images/Baking/Coconut-seashell-cake.png", steps: ["Stir batter", "Fill seashell mold", "Bake and cool cakes"] },
  { name: "Berry Seashell Cakes", ingredients: ["Flour", "Eggs", "Strawberries"], decoration: "Berry glaze", image: "/images/Baking/Berry-seashell-cake.png", steps: ["Stir batter", "Fill seashell mold", "Bake and cool cakes"] },
  { name: "Seashell Sugar Cookies", ingredients: ["Flour", "Butter", "Sugar"], decoration: "Pastel icing", image: "/images/Baking/Seashell-sugar-cookies.png", steps: ["Roll cookie dough", "Cut seashell cookies", "Bake cookies"] },
  { name: "Mermaid Macarons", ingredients: ["Almond flour", "Eggs", "Sugar"], decoration: "Vanilla cream", image: "/images/Baking/Mermaid-macarons.png", steps: ["Fold macaron batter", "Pipe macaron shells", "Bake macaron shells"] },
  { name: "Blueberry Tide Cheesecake", ingredients: ["Cream cheese", "Biscuits", "Blueberries"], decoration: "Blueberry topping", image: "/images/Baking/Blueberry-tide-cheesecake.png", steps: ["Crush biscuit crust", "Press cheesecake crust", "Bake and cool cheesecake"] },
  { name: "Toasted Coconut Macaroons", ingredients: ["Coconut cream", "Eggs", "Sugar"], decoration: "Chocolate drizzle", image: "/images/Baking/Toasted-coconut-macaroons.png", steps: ["Mix coconut batter", "Scoop coconut mounds", "Bake coconut macaroons"] },
  { name: "Sunshine Lemon Tart", ingredients: ["Flour", "Eggs", "Lemons"], decoration: "Whipped cream", image: "/images/Baking/Sunshine-lemon-tart.png", steps: ["Mix lemon filling", "Press tart pastry", "Bake lemon tart"] },
];
const ingredients = ["Flour", "Eggs", "Vanilla", "Cocoa powder", "Coconut cream", "Strawberries", "Butter", "Sugar", "Almond flour", "Cream cheese", "Biscuits", "Blueberries", "Lemons", "Sea salt", "Mint"];
const decorations = ["Pearl sprinkles", "Chocolate curls", "Coconut flakes", "Berry glaze", "Pastel icing", "Vanilla cream", "Blueberry topping", "Chocolate drizzle", "Whipped cream"];
const day = () => new Date().toLocaleDateString("en-CA");
type Stage = "ingredients" | "mix" | "molds" | "bake" | "decorate" | "complete";

export default function SeashellBakingChallenge({ onClose }: { onClose: () => void }) {
  const { collectItem, play } = useGame();
  const [orderIndex, setOrderIndex] = useState<number | null>(null);
  const [lastOrder, setLastOrder] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>("ingredients");
  const [chosen, setChosen] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [announcement, setAnnouncement] = useState("Start a baking order.");
  const [reward, setReward] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const order = orderIndex === null ? null : orders[orderIndex];
  useEffect(() => {
    heading.current?.focus();
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") close.current(); };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);
  const start = () => {
    const available = orders.map((_, i) => i).filter(i => i !== lastOrder);
    const index = available[Math.floor(Math.random() * available.length)];
    setLastOrder(index);
    setOrderIndex(index); setStage("ingredients"); setChosen([]);
    setProgress(0); setMistakes(0); setReward("");
    setAnnouncement("New order: " + orders[index].name + ". Choose " + orders[index].ingredients.join(", ") + ".");
  };
  const chooseIngredient = (ingredient: string) => {
    if (!order || chosen.includes(ingredient)) return;
    if (!order.ingredients.includes(ingredient)) {
      setMistakes(n => n + 1);
      setAnnouncement(ingredient + " is not needed. Try another ingredient.");
      return;
    }
    const next = [...chosen, ingredient];
    setChosen(next);
    if (ingredient === "Eggs") play("bakingEggCrack", 0.95);
    else play("bagRustle");
    if (next.length === 3) {
      setStage("mix");
      setAnnouncement("All ingredients selected. " + order.steps[0] + " three times.");
    } else setAnnouncement(ingredient + " added. " + (3 - next.length) + " ingredients remain.");
  };
  const advance = (next: Stage, message: string) => {
    play("picnicLatch"); setProgress(0); setStage(next); setAnnouncement(message);
  };
  const step = (next: Stage, message: string, verb: string) => {
    const count = progress + 1;
    setProgress(count);
    if (stage === "mix") play(order?.name === "Mermaid Macarons" ? "bakingMixingSoft" : "bakingMixing", 1);
    else play("bagRustle");
    if (count === 3) advance(next, message);
    else setAnnouncement(verb + " " + count + " of 3 completed.");
  };
  const finish = (decoration: string) => {
    if (!order) return;
    if (decoration !== order.decoration) {
      setMistakes(n => n + 1);
      setAnnouncement("That decoration does not match the order. Try again.");
      return;
    }
    let result = "Today's baking ingredient has already been collected.";
    try {
      if (localStorage.getItem("shoreline-seashell-baking-date") !== day()) {
        const pool = ["flour", "eggs", "cocoa-powder", "flour", "eggs", "vanilla"];
        const item = pool[Math.floor(Math.random() * pool.length)];
        collectItem(item, { silent: true });
        localStorage.setItem("shoreline-seashell-baking-date", day());
        result = "Daily reward: one " + (item === "cocoa-powder" ? "cocoa powder" : item) + " added to your inventory.";
      }
    } catch { result = "Daily reward could not be saved."; }
    play("bakingSprinkles", 0.95);
    setReward(result); setStage("complete");
    setAnnouncement("Order completed: " + order.name + ". " + mistakes + " mistakes. " + result);
  };
  return <div role="dialog" aria-modal="true" aria-labelledby="seashell-baking-title" className="fixed inset-0 z-50 overflow-y-auto bg-amber-950/95 p-4">
    <div className="mx-auto max-w-xl rounded-3xl bg-amber-50 p-5 text-amber-950">
      <div className="flex items-start justify-between gap-3">
        <h2 id="seashell-baking-title" tabIndex={-1} ref={heading} className="font-serif text-2xl font-bold outline-none">Seashell Baking Challenge</h2>
        <button type="button" onClick={onClose} className="rounded-lg bg-white p-3 font-bold">Close</button>
      </div>
      <p className="mt-3">Prepare a seaside baking order. No timer or inventory ingredients are required. Your first completed order each day awards one surprise baking ingredient.</p>
      {order && <section className="mt-4 rounded-xl bg-white p-4" aria-label="Current baking order">
        <h3 className="text-xl font-bold">{order.name}</h3>
        <p className="mt-2">Step: {stage}. Mistakes: {mistakes}.</p>
        {stage === "ingredients" && <>
          <p className="mt-2">Recipe: {order.ingredients.join(", ")}. Choose all three.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">{ingredients.map(item =>
            <button key={item} type="button" disabled={chosen.includes(item)} onClick={() => chooseIngredient(item)} aria-label={item + (chosen.includes(item) ? ", added" : ", add ingredient")} className="min-h-12 rounded-lg bg-rose-100 p-3 font-semibold disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-700">{ingredientImages[item] && <BakingArt file={ingredientImages[item]} name="" size={120} />}{item}{chosen.includes(item) ? " — added" : ""}</button>
          )}</div>
        </>}
        {stage === "mix" && <button type="button" onClick={() => step("molds", order.steps[0] + " complete. " + order.steps[1] + " three times.", order.steps[0])} aria-label={order.steps[0] + ", " + progress + " of 3 complete"} className="mt-3 min-h-12 w-full rounded-xl bg-teal-50 p-3 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-700"><BakingArt file="Mixing-bowl.png" name="" size={220} />{order.steps[0]} ({progress}/3)</button>}
        {stage === "molds" && <button type="button" onClick={() => step("bake", order.steps[1] + " complete. " + order.steps[2] + ".", order.steps[1])} aria-label={order.steps[1] + ", " + progress + " of 3 complete"} className="mt-3 min-h-12 w-full rounded-xl bg-teal-50 p-3 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-700"><BakingArt file="Seashell-baking-tray.png" name="" size={240} />{order.steps[1]} ({progress}/3)</button>}
        {stage === "bake" && <button type="button" onClick={() => advance("decorate", "Baking complete. Choose " + order.decoration + ".")} aria-label={order.steps[2]} className="mt-3 min-h-12 w-full rounded-xl bg-teal-50 p-3 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-700"><BakingArt file="Seashell-oven.png" name="" size={240} />{order.steps[2]}</button>}
        {stage === "decorate" && <>
          <p className="mt-2">Finish with {order.decoration}.</p>
          <OrderArt src={order.image} alt={order.name + " illustration"} />
          <div className="mt-3 grid grid-cols-2 gap-2">{decorations.map(item =>
            <button key={item} type="button" onClick={() => finish(item)} aria-label={"Decorate with " + item} className="min-h-12 rounded-lg bg-rose-100 p-3 font-semibold focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-700">{decorationImages[item] && <BakingArt file={decorationImages[item]} name="" size={120} />}{item}</button>
          )}</div>
        </>}
        {stage === "complete" && <div className="mt-3 text-center"><BakingArt file="Cake-display-stand.png" name="Glass cake display stand" size={180} /><OrderArt src={order.image} alt={order.name} />{decorationImages[order.decoration] && <div className="mt-2"><BakingArt file={decorationImages[order.decoration]} name={order.decoration + " topping"} size={120} /></div>}<p className="mt-3 font-bold text-emerald-800">Order completed! {reward}</p></div>}
      </section>}
      <button type="button" onClick={start} className="mt-5 min-h-12 rounded-xl bg-rose-700 px-5 py-3 font-bold text-white">{order ? "Start another order" : "Start baking challenge"}</button>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</p>
    </div>
  </div>;
}
