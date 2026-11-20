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

type Hotspot = {
  label: string;
  caption: string;
  left: number;
  top: number;
  action: () => void;
};

function RetreatScene({ spa, night, hotspots }: { spa?: boolean; night: boolean; hotspots: Hotspot[] }) {
  return (
    <div className="relative mx-auto max-w-[540px] overflow-hidden rounded-2xl bg-teal-900">
      <Image
        src={spa ? "/images/retreat/sea-glass-spa.webp" : "/images/retreat/veranda.webp"}
        alt={spa ? "Linnea rests on a stone ledge, with Jasmine on a cushion near the soaking basin." : "A lounge chair overlooks the sea. A sandy path leads to the shell spiral and the spa cottage."}
        width={768}
        height={1024}
        unoptimized
        className={`block h-auto w-full ${night ? "brightness-[.72]" : ""}`}
      />
      {hotspots.map(({ label, caption, left, top, action }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          onClick={action}
          style={{ left: `${left}%`, top: `${top}%` }}
          className="absolute min-h-12 w-[29%] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-teal-100 bg-teal-950/90 px-1.5 py-1 text-xs font-semibold text-white shadow-md hover:bg-teal-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300 sm:text-sm"
        >
          {caption}
        </button>
      ))}
    </div>
  );
}

export default function IslandRetreat({ night, onReturn, onMusicChange }: { night: boolean; onReturn: () => void; onMusicChange?: (track: string | null) => void }) {
  const { state, play, useCadenceBubbleBath } = useGame();
  const [area, setArea] = useState<Area>("veranda");
  const [waves, setWaves] = useState(true);
  const [music, setMusic] = useState(false);
  const [drink, setDrink] = useState("");
  const [servedDrink, setServedDrink] = useState("");
  const [shell, setShell] = useState(shells[0]);
  const [position, setPosition] = useState(0);
  const [pattern, setPattern] = useState<(string | null)[]>(() => positions.map(() => null));
  const [spaMusic, setSpaMusic] = useState(true);
  const [basinOpen, setBasinOpen] = useState(false);
  const [bubblesReady, setBubblesReady] = useState(false);
  const basinHeading = useRef<HTMLHeadingElement>(null);
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

  const track = area === "spa" ? "seaGlassSpa" : "islandRetreat";
  useEffect(() => {
    onMusicChange?.(track);
  }, [onMusicChange, track]);

  useEffect(() => {
    if (basinOpen) basinHeading.current?.focus();
  }, [basinOpen]);

  useEffect(() => {
    heading.current?.focus();
  }, [area]);

  useEffect(() => {
    if (servedDrink) servedDrinkText.current?.focus();
  }, [servedDrink]);

  const announce = (text: string) => setMessage((current) => ({ text, revision: current.revision + 1 }));

  const visit = (next: Area) => {
    announce("");
    setBasinOpen(false);
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
      data-retreat-music={(area === "spa" ? spaMusic : music) ? "on" : "off"}
      className={`space-y-4 rounded-2xl p-4 sm:p-6 ${night ? "bg-slate-900 text-amber-50" : "bg-teal-50 text-slate-900"}`}
    >
      <h3 id="island-retreat-heading" ref={heading} tabIndex={-1} className="font-serif text-3xl font-bold focus:outline-none">{titles[area]}</h3>
      {area === "veranda" && <>
        <RetreatScene night={night} hotspots={[
          { label: "Have a drink by the shore", caption: "Shore Lounge", left: 25, top: 61, action: () => visit("lounge") },
          { label: "Make a seashell pattern", caption: "Seashell Patterns", left: 50, top: 83, action: () => visit("sand") },
          { label: "Visit Sea Glass Spa", caption: "Sea Glass Spa", left: 82, top: 56, action: () => visit("spa") },
        ]} />
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
        <RetreatScene spa night={night} hotspots={[
          { label: "Talk to Linnea", caption: "Linnea", left: 25, top: 52, action: () => announce("Linnea says, “Welcome to Sea Glass Spa. I’m Linnea, and that’s Jasmine. She’ll say hello as soon as she decides whether you’re sitting in her favorite chair.”") },
          { label: "Greet Jasmine", caption: "Jasmine", left: 76, top: 53, action: () => announce(night ? "Jasmine is curled up on her cushion. She gives a sleepy sigh." : "Jasmine’s pearl collar jingles as she pads over to greet you.") },
          { label: "Open the soaking basin", caption: "Soaking Basin", left: 54, top: 76, action: () => {
            if (basinOpen) basinHeading.current?.focus();
            else setBasinOpen(true);
          } },
        ]} />
        <label className="flex min-h-12 items-center gap-2"><input type="checkbox" checked={spaMusic} onChange={(event) => setSpaMusic(event.target.checked)} /> Spa music</label>
        {basinOpen && <section aria-labelledby="retreat-basin-heading" className="space-y-3">
        <h4 id="retreat-basin-heading" ref={basinHeading} tabIndex={-1} className="text-lg font-bold">Warm soaking basin</h4>
        <p>Linnea has a sponge you can try. If you’ve found a Sea-Foam Sponge, you can use your own here.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={button} onClick={() => {
            setSpongeWet(true);
            play("oceanWaterSplash", 0.2);
            announce(state.inventory["sea-foam-sponges"] ? "Your sea sponge soaks up the warm water." : "Linnea’s sea sponge soaks up the warm water.");
          }}>Dip sea sponge</button>
          <button type="button" className={button} disabled={!spongeWet} onClick={() => {
            setSpongeWet(false);
            play("spaSpongeSqueeze", 0.75);
            announce("Warm water drips from the sponge back into the basin.");
          }}>Squeeze sea sponge</button>
          <button type="button" className={button} disabled={!state.inventory["cadence-rose-milk-bubble-bath"]} onClick={() => {
            if (!useCadenceBubbleBath()) return;
            play("oceanWaterSplash", 0.25);
            setBubblesReady(true);
            announce("Rose Milk Bubble Bath foams across the surface of the basin.");
          }}>Use Rose Milk Bubble Bath</button>
          {bubblesReady && <button type="button" className={button} onClick={() => {
            play("spaBubblesPop", 0.65);
            announce("A cluster of soap bubbles pops against the edge of the basin.");
          }}>Pop soap bubbles</button>}
        </div>
        {!state.inventory["cadence-rose-milk-bubble-bath"] && <p>Bring a serving of Rose Milk Bubble Bath to add it to the basin.</p>}
        </section>}
      </>}
      <p role="status" aria-atomic="true"><span key={message.revision}>{message.text}</span></p>
      {area === "veranda" ? <button type="button" className={button} onClick={onReturn}>Sail back to the Cove Dock</button> : <button type="button" className={button} onClick={() => visit("veranda")}>Return to the veranda</button>}
    </section>
  );
}
