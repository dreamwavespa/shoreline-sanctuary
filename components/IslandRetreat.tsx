"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ITEMS } from "@/lib/items";
import { KITCHEN_RECIPES } from "@/lib/recipes";
import { SMOOTHIE_RECIPES } from "@/lib/smoothie-recipes";
import { useGame } from "@/lib/store";

const button = "min-h-12 rounded-xl bg-teal-800 px-4 py-2 font-semibold text-white disabled:bg-slate-200 disabled:text-slate-600 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-500";
const drinks = [
  ...KITCHEN_RECIPES.filter((recipe) => recipe.station === "Chilled Drinks"),
  ...SMOOTHIE_RECIPES,
];
const shells = ["shell-scallop", "shell-conch", "shell-cowrie"];
const positions = [
  "Top left", "Top center", "Top right",
  "Middle left", "Center", "Middle right",
  "Bottom left", "Bottom center", "Bottom right",
];
const patternKey = "shoreline-island-retreat-shell-pattern";

type Area = "veranda" | "lounge" | "sand" | "spa";
const titles: Record<Area, string> = {
  veranda: "Island Retreat",
  lounge: "Shore Lounge",
  sand: "Seashell Patterns",
  spa: "Sea Glass Spa",
};

export default function IslandRetreat({ night, onReturn }: { night: boolean; onReturn: () => void }) {
  const { state, play, useCadenceBubbleBath } = useGame();
  const [area, setArea] = useState<Area>("veranda");
  const [waves, setWaves] = useState(true);
  const [music, setMusic] = useState(false);
  const [drink, setDrink] = useState("");
  const [servedDrink, setServedDrink] = useState("");
  const [shell, setShell] = useState(shells[0]);
  const [position, setPosition] = useState(0);
  const [pattern, setPattern] = useState<(string | null)[]>(() => positions.map(() => null));
  const [spongeWet, setSpongeWet] = useState(false);
  const [message, setMessage] = useState({ text: "", revision: 0 });
  const heading = useRef<HTMLHeadingElement>(null);
  const servedDrinkText = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(patternKey) ?? "null");
      if (Array.isArray(saved) && saved.length === positions.length) {
        setPattern(saved.map((id) => typeof id === "string" && shells.includes(id) ? id : null));
      }
    } catch {
      // A missing or unreadable save starts with an empty stretch of sand.
    }
  }, []);

  useEffect(() => {
    heading.current?.focus();
  }, [area]);

  useEffect(() => {
    if (servedDrink) servedDrinkText.current?.focus();
  }, [servedDrink]);

  const announce = (text: string) => setMessage((current) => ({ text, revision: current.revision + 1 }));

  const visit = (next: Area) => {
    announce("");
    setArea(next);
  };

  const updatePattern = (id: string | null) => {
    setPattern((current) => current.map((entry, index) => index === position ? id : entry));
    if (id) play("shell", 0.35);
    announce(id ? `${ITEMS[id].name} placed at ${positions[position].toLowerCase()}.` : `${positions[position]} cleared.`);
  };

  const savePattern = () => {
    try {
      localStorage.setItem(patternKey, JSON.stringify(pattern));
      announce("Your seashell pattern is saved on this device.");
    } catch {
      announce("Your seashell pattern could not be saved on this device.");
    }
  };

  return (
    <section
      aria-labelledby="island-retreat-heading"
      data-retreat-waves={waves ? "on" : "off"}
      data-retreat-music={music ? "on" : "off"}
      className={`space-y-4 rounded-2xl p-4 sm:p-6 ${night ? "bg-slate-900 text-amber-50" : "bg-teal-50 text-slate-900"}`}
    >
      <h3 id="island-retreat-heading" ref={heading} tabIndex={-1} className="font-serif text-3xl font-bold focus:outline-none">{titles[area]}</h3>
      {area === "veranda" && <>
        <Image src="/images/Paintings/the-seaside-retreat.png" alt="A painting of the seaside retreat." width={900} height={600} unoptimized className="max-h-72 w-full rounded-2xl object-cover" />
        <p>{night ? "Lanterns light the veranda as the waves roll in below." : "The luxury boat pulls up below a veranda overlooking the shore."}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <button type="button" className={button} onClick={() => visit("lounge")}>Have a drink by the shore</button>
          <button type="button" className={button} onClick={() => visit("sand")}>Make a seashell pattern</button>
          <button type="button" className={button} onClick={() => visit("spa")}>Visit Sea Glass Spa</button>
        </div>
      </>}
      {area === "lounge" && <>
        <p>Settle into a chair by the water. Your welcome drink is complimentary.</p>
        {servedDrink ? <p ref={servedDrinkText} tabIndex={-1} className="font-semibold">On your side table: {servedDrink}.</p> : <div className="space-y-3">
          <label className="block space-y-1">
            <span className="block font-semibold">Choose a welcome drink</span>
            <select value={drink} onChange={(event) => setDrink(event.target.value)} className="min-h-12 max-w-full rounded-lg border border-teal-700 bg-white px-3 text-slate-900">
              <option value="">Choose a drink</option>
              {drinks.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <button type="button" className={button} disabled={!drink} onClick={() => {
            const selected = drinks.find((item) => item.id === drink);
            if (!selected || servedDrink) return;
            setServedDrink(selected.name);
            play("teaPouring", 0.35);
          }}>Serve my drink</button>
        </div>}
        <fieldset className="flex flex-wrap gap-x-6 gap-y-2">
          <legend className="mb-2 font-semibold">Shore lounge sounds</legend>
          <label className="flex min-h-12 items-center gap-2"><input type="checkbox" checked={waves} onChange={(event) => setWaves(event.target.checked)} /> Waves</label>
          <label className="flex min-h-12 items-center gap-2"><input type="checkbox" checked={music} onChange={(event) => setMusic(event.target.checked)} /> Soft music</label>
        </fieldset>
      </>}
      {area === "sand" && <>
        <p>Choose a shell and a spot in the sand. You can replace or clear any spot and save your arrangement to revisit.</p>
        <ol aria-label="Current seashell pattern" className="grid grid-cols-3 gap-1 rounded-2xl bg-amber-200 p-2 text-center text-amber-950 sm:gap-2">
          {positions.map((label, index) => {
            const id = pattern[index];
            return <li key={label} className="min-w-0 rounded-lg bg-amber-50/50 p-1 text-xs sm:p-2 sm:text-sm">
              {id && <Image src={ITEMS[id].icon} alt="" width={48} height={48} unoptimized className="mx-auto object-contain" />}
              <span className="block">{label}</span><span className="block font-semibold">{id ? ITEMS[id].name : "Empty"}</span>
            </li>;
          })}
        </ol>
        <div className="flex flex-wrap gap-3 text-slate-900">
          <label className="rounded-lg bg-white p-2"><span className="mr-2">Shell</span><select value={shell} onChange={(event) => setShell(event.target.value)} className="min-h-10">
            {shells.map((id) => <option key={id} value={id}>{ITEMS[id].name}</option>)}
          </select></label>
          <label className="rounded-lg bg-white p-2"><span className="mr-2">Spot</span><select value={position} onChange={(event) => setPosition(Number(event.target.value))} className="min-h-10">
            {positions.map((label, index) => <option key={label} value={index}>{label}</option>)}
          </select></label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={button} onClick={() => updatePattern(shell)}>Place shell</button>
          <button type="button" className={button} disabled={!pattern[position]} onClick={() => updatePattern(null)}>Clear this spot</button>
          <button type="button" className={button} onClick={savePattern}>Save pattern</button>
        </div>
      </>}
      {area === "spa" && <>
        <p>Linnea, a mermaid with white flowers in her braid and a pearly lavender tail, sits beside the soaking basin. Her white poodle Jasmine wears lavender and pink bows.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={button} onClick={() => announce("Linnea says, “Welcome to Sea Glass Spa. I’m Linnea, and that’s Jasmine. She’ll say hello as soon as she decides whether you’re sitting in her favorite chair.”")}>Talk to Linnea</button>
          <button type="button" className={button} onClick={() => announce(night ? "Jasmine is curled up on her cushion. She gives a sleepy sigh." : "Jasmine’s pearl collar jingles as she pads over to greet you.")}>Greet Jasmine</button>
        </div>
        <h4 className="text-lg font-bold">Warm soaking basin</h4>
        <p>Linnea has a sponge you can try. If you’ve found a Sea-Foam Sponge, you can use your own here.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={button} onClick={() => {
            setSpongeWet(true);
            play("oceanWaterSplash", 0.2);
            announce(state.inventory["sea-foam-sponges"] ? "Your sea sponge soaks up the warm water." : "Linnea’s sea sponge soaks up the warm water.");
          }}>Dip sea sponge</button>
          <button type="button" className={button} disabled={!spongeWet} onClick={() => {
            setSpongeWet(false);
            play("oceanWaterSplash", 0.3);
            announce("Warm water drips from the sponge back into the basin.");
          }}>Squeeze sea sponge</button>
          <button type="button" className={button} disabled={!state.inventory["cadence-rose-milk-bubble-bath"]} onClick={() => {
            if (!useCadenceBubbleBath()) return;
            play("oceanWaterSplash", 0.25);
            announce("Rose Milk Bubble Bath foams across the surface of the basin.");
          }}>Use Rose Milk Bubble Bath</button>
        </div>
        {!state.inventory["cadence-rose-milk-bubble-bath"] && <p>Bring a serving of Rose Milk Bubble Bath to add it to the basin.</p>}
      </>}
      <p role="status" aria-atomic="true"><span key={message.revision}>{message.text}</span></p>
      {area === "veranda" ? <button type="button" className={button} onClick={onReturn}>Sail back to the Cove Dock</button> : <button type="button" className={button} onClick={() => visit("veranda")}>Return to the veranda</button>}
    </section>
  );
}
