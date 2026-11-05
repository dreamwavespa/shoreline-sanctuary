"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";

const orders = [
  { name: "Vanilla Seashell Cakes", ingredients: ["Flour", "Eggs", "Vanilla"], decoration: "Pearl sprinkles" },
  { name: "Chocolate Tide Cakes", ingredients: ["Flour", "Eggs", "Cocoa powder"], decoration: "Chocolate curls" },
  { name: "Coconut Shore Cakes", ingredients: ["Flour", "Eggs", "Coconut cream"], decoration: "Coconut flakes" },
  { name: "Berry Seashell Cakes", ingredients: ["Flour", "Eggs", "Strawberries"], decoration: "Berry glaze" },
];
const ingredients = ["Flour", "Eggs", "Vanilla", "Cocoa powder", "Coconut cream", "Strawberries", "Sea salt", "Mint"];
const decorations = ["Pearl sprinkles", "Chocolate curls", "Coconut flakes", "Berry glaze"];
const day = () => new Date().toLocaleDateString("en-CA");
type Stage = "ingredients" | "mix" | "molds" | "bake" | "decorate" | "complete";

export default function SeashellBakingChallenge({ onClose }: { onClose: () => void }) {
  const { collectItem, play } = useGame();
  const [orderIndex, setOrderIndex] = useState<number | null>(null);
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
    const index = Math.floor(Math.random() * orders.length);
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
    play("bagRustle");
    if (next.length === 3) {
      setStage("mix");
      setAnnouncement("All ingredients selected. Stir the batter three times.");
    } else setAnnouncement(ingredient + " added. " + (3 - next.length) + " ingredients remain.");
  };
  const advance = (next: Stage, message: string) => {
    play("picnicLatch"); setProgress(0); setStage(next); setAnnouncement(message);
  };
  const step = (next: Stage, message: string, verb: string) => {
    const count = progress + 1;
    setProgress(count);
    play("bagRustle");
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
    play("picnicLatch");
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
            <button key={item} type="button" disabled={chosen.includes(item)} onClick={() => chooseIngredient(item)} className="min-h-12 rounded-lg bg-rose-100 p-3 disabled:opacity-50">{item}{chosen.includes(item) ? " — added" : ""}</button>
          )}</div>
        </>}
        {stage === "mix" && <button type="button" onClick={() => step("molds", "Batter mixed. Fill three seashell molds.", "Stir")} className="mt-3 min-h-12 rounded-lg bg-teal-800 p-3 text-white">Stir batter ({progress}/3)</button>}
        {stage === "molds" && <button type="button" onClick={() => step("bake", "All three molds filled. Bake the tray.", "Mold")} className="mt-3 min-h-12 rounded-lg bg-teal-800 p-3 text-white">Fill seashell mold ({progress}/3)</button>}
        {stage === "bake" && <button type="button" onClick={() => advance("decorate", "Cakes baked and cooled. Choose " + order.decoration + ".")} className="mt-3 min-h-12 rounded-lg bg-teal-800 p-3 text-white">Bake and cool cakes</button>}
        {stage === "decorate" && <>
          <p className="mt-2">Finish with {order.decoration}.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">{decorations.map(item =>
            <button key={item} type="button" onClick={() => finish(item)} className="min-h-12 rounded-lg bg-rose-100 p-3">{item}</button>
          )}</div>
        </>}
        {stage === "complete" && <p className="mt-3 font-bold text-emerald-800">Order completed! {reward}</p>}
      </section>}
      <button type="button" onClick={start} className="mt-5 min-h-12 rounded-xl bg-rose-700 px-5 py-3 font-bold text-white">{order ? "Start another order" : "Start baking challenge"}</button>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</p>
    </div>
  </div>;
}
