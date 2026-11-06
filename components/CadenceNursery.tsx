"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { blockUnlocks, discoverNightBlocks } from "@/lib/cadence-block-unlocks";

const RECIPES = [
  { id: "cadence-crib-mobile", name: "Crib Mobile", image: "/images/IMG_6347.jpeg", sound: "cadenceMobile", cost: [{ itemId: "shell-clam", count: 1 }, { itemId: "shell-scallop", count: 1 }, { itemId: "shell-conch", count: 1 }, { itemId: "glass-purple", count: 1 }, { itemId: "glass-pink", count: 1 }, { itemId: "glass-white", count: 1 }, { itemId: "copper-wire", count: 1 }], description: "A shell and sea-glass mobile that gently turns above Cadence's bed." },
  { id: "cadence-clamshell-nightlight", name: "Clamshell Nightlight", image: "/images/IMG_6348.jpeg", sound: "sparkle", cost: [{ itemId: "firefly-jar", count: 1 }, { itemId: "star-sand", count: 1 }, { itemId: "shell-clam", count: 2 }], description: "A softly glowing clamshell nightlight filled with firefly light and sparkling star sand." },
  { id: "cadence-rose-milk-bubble-bath", name: "Rose Milk Bubble Bath", image: "/images/IMG_6349.jpeg", sound: "oceanWaterSplash", repeatable: true, cost: [{ itemId: "bottled-rose-milk", count: 1 }, { itemId: "dried-sea-oats", count: 1 }, { itemId: "sea-lavender", count: 1 }], description: "A gentle rose-milk bubble bath with oats and sea lavender." },
  { id: "cadence-snappy-turtle-teether", name: "Snappy Turtle Teether", image: "/images/IMG_0197.jpeg", sound: "sparkle", cost: [{ itemId: "trash-plastic", count: 1 }, { itemId: "luminous-sea-goo", count: 1 }, { itemId: "sea-water", count: 1 }], description: "A seafoam turtle teether inspired by Snappy, with a softly glowing swirl at the center for Cadence." },
] as const;

const DISCOVERIES = [
  { id: "cadence-marshmallow-plushy", name: "Marshmallow Plushy", image: "/images/IMG_6350.jpeg", sound: "babyBabble", description: "A soft fluffy white cat for Cadence to cuddle with." },
  { id: "cadence-shimmering-seashell-rattle", name: "Shimmering Seashell Rattle", image: "/images/IMG_6351.jpeg", sound: "babyRattle", description: "A shimmering rattle filled with rainbow pearls, sea glitter, and tiny seashells." },
  { id: "cadence-signature-beach-ball", name: "Cadence's Signature Beach Ball", image: "/images/IMG_6345.jpeg", sound: "beachBall", description: "Cadence's seafoam mint, baby pink, and white beach ball." },
] as const;

const BABY_FOODS = [
  { id: "food-cadence-warm-rose-milk", name: "Warm Rose Milk", icon: "🍼", sound: "babyBottle", reaction: "Cadence takes the warm rose milk bottle with both hands, drinks happily, then gives a sleepy little baby babble." },
  { id: "food-cadence-sea-pea-puree", name: "Steamed Sea Pea Purée", icon: "🫛", sound: "babySpoon", reaction: "Cadence tastes the smooth sea pea purée, kicks her tiny tail, and makes a trail of delighted heart-shaped bubbles." },
  { id: "food-cadence-sun-berry-mash", name: "Sun-Berry Fruit Mash", icon: "🫐", sound: "babySpoon", reaction: "Cadence tries the sweet sun-berry mash. Her rosy cheeks brighten and she reaches eagerly for another spoonful." },
  { id: "food-cadence-teething-kelp-cookie", name: "Teething Kelp Cookie", icon: "🍪", sound: "cookieCrunch", reaction: "Cadence nibbles the soft kelp cookie, gives a tiny pleased crunch, and giggles as she holds it in both hands." },
] as const;

const PIANO = ["/audio/Piano1.mp3", "/audio/Piano3.mp3", "/audio/Piano-cheerful.mp3"];
const LULLABIES = ["cadence1", "cadence2", "cadence3"] as const;


// Cadence's accessible seaside block games. Each control is a button; dragging is never required.
const BLOCK_SETS: Record<string, { label: string; prefix: string; blocks: string[] }> = {"seaside":{"label":"Seaside","prefix":"Seaside","blocks":["shell","starfish","wave","pearl","fish","moon"]},"garden":{"label":"Garden","prefix":"Garden","blocks":["Hibiscus","Sunflower","Butterfly","Strawberry","Watering-Can","Bee"]},"night-sky":{"label":"Night Sky","prefix":"Night-Sky","blocks":["Crescent-Moon","Star","Constellation","Shooting-Star","Full-Moon","Owl"]},"winter":{"label":"Winter","prefix":"Winter","blocks":["Snowflake","Snowman","Snowy-Tree","Hot-Chocolate","Ice-Skates","Pinecones"]}};
const BLOCK_GIFT_KEY = "shoreline-cadence-block-gift-v1";
function CadenceBlocks({ inventory, onGift, master, onDailyReward }: { inventory: Record<string, number>; onGift: (itemId: string) => void; master: number; onDailyReward: () => void }) {
  const [giftedSets, setGiftedSets] = useState<string[]>([]);
  const [collection, setCollection] = useState("seaside");
  const setInfo = BLOCK_SETS[collection];
  const BLOCKS = setInfo.blocks;
  const BLOCK_ART = (block: string) => `/images/Driftwood-blocks/${setInfo.prefix}-${block}.png`;
  const gifted = giftedSets.includes(collection);
  const [mode, setMode] = useState<"stack" | "pattern" | "creative">("stack");
  const [placed, setPlaced] = useState<string[]>([]);
  const [pattern, setPattern] = useState<string[]>(["shell", "starfish", "shell"]);
  const [feedback, setFeedback] = useState("Choose a block to begin.");
  const [shape, setShape] = useState("pyramid");
  const [dailyRequest, setDailyRequest] = useState("pyramid");
  const [dailyDone, setDailyDone] = useState(false);
  const [completedShape, setCompletedShape] = useState(false);
  useEffect(() => {
    const day = new Date().toLocaleDateString("en-CA");
    const keys = ["pyramid","towers","bridge","house"];
    const index = Math.floor(new Date().getTime() / 86400000) % keys.length;
    setDailyRequest(keys[index]);
    try { setDailyDone(localStorage.getItem("cadence-block-daily-" + day) === "done"); } catch {}
  }, []);
  const [slots, setSlots] = useState<(string | null)[]>(Array(6).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const [moving, setMoving] = useState<number | null>(null);
  const shapes: Record<string, { title: string; positions: string[]; columns: number }> = {
    pyramid: { title: "Pyramid", positions: ["Bottom left", "Bottom middle", "Bottom right", "Middle left", "Middle right", "Top"], columns: 3 },
    towers: { title: "Twin Towers", positions: ["Left bottom", "Left middle", "Left top", "Right bottom", "Right middle", "Right top"], columns: 2 },
    bridge: { title: "Little Bridge", positions: ["Left support", "Right support", "Bridge left", "Bridge middle", "Bridge right", "Decoration"], columns: 3 },
    house: { title: "Little House", positions: ["Left wall", "Right wall", "Floor", "Roof left", "Roof right", "Chimney"], columns: 3 },
    free: { title: "Free Building", positions: ["Top left", "Top middle", "Top right", "Bottom left", "Bottom middle", "Bottom right"], columns: 3 }
  };
  const layout = shapes[shape];
  // Each slot has a real spatial position, independent of its accessible reading order.
  const shapeCells: Record<string, [number, number][]> = {
    pyramid: [[1,3],[3,3],[5,3],[2,2],[4,2],[3,1]],
    towers: [[1,3],[1,2],[1,1],[5,3],[5,2],[5,1]],
    bridge: [[1,3],[5,3],[2,2],[3,2],[4,2],[3,1]],
    house: [[1,3],[5,3],[3,3],[2,2],[4,2],[3,1]],
    free: [[1,1],[3,1],[5,1],[1,2],[3,2],[5,2]]
  };

  const celebrate = (next: (string | null)[]) => {
    if (next.every(Boolean) && !completedShape) {
      setCompletedShape(true);
      const day = new Date().toLocaleDateString("en-CA");
      if (shape === dailyRequest && !dailyDone) {
        setDailyDone(true);
        try { localStorage.setItem("cadence-block-daily-" + day, "done"); } catch {}
        onDailyReward();
        return " Cadence giggles and claps! You completed her daily building request and earned one sand dollar.";
      }
      return " Cadence claps and giggles at your finished " + shapes[shape].title + "!";
    }
    if (!next.every(Boolean)) setCompletedShape(false);
    return "";
  };
  const choosePosition = (index: number) => {
    if (moving !== null) {
      const next = [...slots]; [next[moving], next[index]] = [next[index], next[moving]];
      setSlots(next); setMoving(null); setSelected(null); sound();
      setFeedback("Moved or swapped blocks. " + layout.positions[index] + " now has " + (next[index] || "no block") + "." + celebrate(next));
    } else if (slots[index]) {
      setMoving(index); setSelected(index);
      setFeedback("Selected " + slots[index] + " at " + layout.positions[index] + ". Choose a destination to move or swap, or choose a block to replace it.");
    } else {
      setSelected(index); setFeedback("Selected " + layout.positions[index] + ". Choose a block to place.");
    }
  };
  useEffect(() => { try { setGiftedSets(Object.keys(BLOCK_SETS).filter(key => localStorage.getItem(key === "seaside" ? BLOCK_GIFT_KEY : "shoreline-cadence-block-gift-" + key) === "yes")); } catch {} }, []);
  const sound = (fall = false) => {
    const src = fall ? "/audio/Block-tower-fall.mp3" : `/audio/Block-place-${1 + Math.floor(Math.random() * 3)}.mp3`;
    const audio = new Audio(src); audio.volume = Math.min(1, Math.max(.85, master)); void audio.play().catch(() => undefined);
  };
  const choose = (block: string) => {
    if (mode === "creative") {
      const index = selected ?? slots.findIndex(x => x === null);
      if (index < 0) { setFeedback("Choose a position to replace a block."); return; }
      const next = [...slots]; next[index] = block; setSlots(next); setSelected(null); setMoving(null); sound();
      setFeedback("Placed " + block + " at " + layout.positions[index] + ". " + next.filter(Boolean).length + " of 6 positions filled." + celebrate(next));
      return;
    }
    if (mode === "pattern") {
      const expected = pattern[placed.length];
      if (block !== expected) { setFeedback(`Try again. Choose the ${expected} block next.`); return; }
      sound();
      const next = [...placed, block]; setPlaced(next);
      if (next.length === pattern.length) setFeedback("Pattern complete! Cadence cheers. Choose New Pattern to play again.");
      else setFeedback(`Correct! ${next.length} of ${pattern.length} blocks matched. Choose the next block.`);
      return;
    }
    if (placed.length >= 6) { setFeedback("All six blocks are in place. Reset to build again."); return; }
    sound(); const next = [...placed, block]; setPlaced(next);
    setFeedback(mode === "stack" ? `Tower height: ${next.length} blocks. Last placed: ${block}.` : `Your creation has ${next.length} blocks. Last added: ${block}.`);
  };
  const newPattern = () => { const options = [["shell","starfish","shell"],["wave","pearl","wave"],["fish","moon","fish","moon"],["shell","wave","pearl","shell"]]; setPattern(options[Math.floor(Math.random()*options.length)]); setPlaced([]); setFeedback("New pattern ready. Listen to the pattern and choose blocks in order."); };
  return <section data-cadence-block-play={gifted ? "active" : "inactive"} aria-labelledby="cadence-blocks-heading" className="rounded-2xl bg-white/95 p-4 shadow">
    <h2 id="cadence-blocks-heading" className="font-serif text-lg font-bold text-rose-900">Cadence's Driftwood Block Play</h2><div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose block collection">{Object.entries(BLOCK_SETS).map(([key, value]) => <button type="button" key={key} aria-pressed={collection === key} onClick={() => {setCollection(key);setPlaced([]);setSlots(Array(6).fill(null));setSelected(null);setMoving(null);setCompletedShape(false);setFeedback(value.label + " blocks selected.");}} className="rounded-lg bg-amber-100 px-3 py-2 aria-pressed:bg-amber-300">{value.label}</button>)}</div>
    {!gifted ? <div><p className="mt-2">Craft the {setInfo.label} Driftwood Blocks in Decorative Crafts, then give the finished set to Cadence.</p><p>Sets in inventory: {inventory[`cadence-${collection}-blocks`] || 0}</p><button type="button" disabled={(inventory[`cadence-${collection}-blocks`] || 0) < 1} onClick={() => { onGift(`cadence-${collection}-blocks`); try { localStorage.setItem(collection === "seaside" ? BLOCK_GIFT_KEY : "shoreline-cadence-block-gift-" + collection,"yes"); } catch {} setGiftedSets(prev => [...new Set([...prev, collection])]); setFeedback("Cadence loves her new blocks!"); }} className="mt-2 rounded-lg bg-rose-700 px-4 py-3 font-bold text-white disabled:opacity-50">Gift {setInfo.label} Blocks to Cadence</button></div> : <>
    <p className="mt-2 text-sm">Choose an activity. Use labeled buttons to place blocks; no dragging needed.</p>
    <div className="mt-3 flex flex-wrap gap-2">{(["stack","pattern","creative"] as const).map(m => <button key={m} type="button" aria-pressed={mode===m} onClick={() => {setMode(m);setPlaced([]);setSelected(null);setMoving(null);setFeedback(`${m} activity ready.`);}} className="rounded-lg bg-violet-100 px-3 py-2 font-semibold capitalize aria-pressed:bg-violet-300">{m === "stack" ? "Tower Stacking" : m === "pattern" ? "Pattern Matching" : "Creative Building"}</button>)}</div>
    {mode === "creative" && <div className="mt-3"><p className="font-semibold">Cadence's daily request: {shapes[dailyRequest].title}. {dailyDone ? "Completed today!" : "Fill all six positions to earn one sand dollar."}</p><p className="text-sm">Choose a shape, then select a position and a block. Select an occupied position and a destination to move or swap blocks. The wooden blocks fit closely together, while position names remain available to screen readers.</p><div className="mt-2 flex flex-wrap gap-2">{Object.entries(shapes).map(([key, value]) => <button type="button" key={key} aria-pressed={shape === key} onClick={() => {setShape(key);setCompletedShape(false);setSlots(Array(6).fill(null));setSelected(null);setMoving(null);setFeedback(value.title + " ready.");}} className="rounded-lg bg-amber-100 px-3 py-2 aria-pressed:bg-amber-300">{value.title}</button>)}</div></div>}
    {mode === "pattern" && <p className="mt-3 font-semibold">Copy this pattern: {pattern.join(", ")}. {placed.length === pattern.length ? "Completed!" : `Next position: ${placed.length+1}.`}</p>}
    <div className={`mt-3 rounded-xl bg-amber-50 p-3 ${mode === "stack" ? "flex min-h-72 flex-col-reverse items-center justify-start gap-0" : mode === "creative" ? "grid min-h-60 grid-cols-5 grid-rows-3 items-center justify-items-center gap-0" : "flex flex-wrap items-center justify-center gap-2"}`} aria-label={`Placed blocks: ${placed.join(", ") || "none"}`}>
      {mode === "creative" ? slots.map((block, i) => <button key={i} type="button" aria-pressed={selected === i} onClick={() => choosePosition(i)} style={{ gridColumn: shapeCells[shape][i][0], gridRow: shapeCells[shape][i][1] }} className="flex h-[76px] w-full min-w-0 flex-col items-center justify-center rounded-md border border-amber-300 bg-transparent p-0 aria-pressed:bg-rose-100" aria-label={layout.positions[i] + ": " + (block || "empty") + ". Select position."}>{block ? <Image src={BLOCK_ART(block)} alt="" width={60} height={60} unoptimized className="h-14 w-14 object-contain"/> : <span className="text-xs">Empty</span>}<span className="sr-only">{layout.positions[i]}</span></button>) : placed.map((b,i)=><Image key={i} src={BLOCK_ART(b)} alt={`Position ${i+1}: ${b}`} width={64} height={64} unoptimized className={`h-16 w-16 object-contain ${mode === "stack" ? "-mt-2 first:mt-0" : ""}`}/>)}
      {mode !== "creative" && !placed.length && <p className="text-sm">No blocks placed yet.</p>}
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2">{BLOCKS.map(b=><button type="button" key={b} onClick={()=>choose(b)} disabled={mode !== "creative" && (placed.length>=6 || (mode==="pattern" && placed.length===pattern.length))} className="rounded-xl bg-cyan-50 p-2 font-semibold capitalize ring-1 ring-cyan-300 disabled:opacity-50"><Image src={BLOCK_ART(b)} alt="" width={72} height={72} unoptimized className="mx-auto h-16 w-16 object-contain"/>{b}</button>)}</div>
    <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={()=>{setPlaced([]);setSlots(Array(6).fill(null));setCompletedShape(false);setSelected(null);setMoving(null);setFeedback("Blocks reset.");}} className="rounded-lg bg-amber-200 px-3 py-2 font-bold">Reset Blocks</button>{mode==="stack" && <button type="button" onClick={()=>{sound(true);setPlaced([]);setFeedback("The tower tumbles! Cadence giggles.");}} disabled={!placed.length} className="rounded-lg bg-rose-200 px-3 py-2 font-bold">Knock Down Tower</button>}{mode==="pattern" && <button type="button" onClick={newPattern} className="rounded-lg bg-emerald-200 px-3 py-2 font-bold">New Pattern</button>}</div>
    <p role="status" aria-live="polite" className="mt-3 font-semibold text-rose-900">{feedback}</p>
    </>}
  </section>;
}

function CadenceBuoyRings({ owned, onCelebrate }: { owned: boolean; onCelebrate: () => void }) {
  const rings = [
    { color: "Purple", size: 5, className: "bg-purple-500" },
    { color: "Blue", size: 4, className: "bg-sky-500" },
    { color: "Green", size: 3, className: "bg-emerald-500" },
    { color: "Yellow", size: 2, className: "bg-yellow-400" },
    { color: "Pink", size: 1, className: "bg-pink-400" },
  ];
  const [stack, setStack] = useState<number[]>([]);
  const [lastPlaced, setLastPlaced] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("Choose the largest ring first, then work toward the smallest.");
  const finished = stack.length === rings.length;
  const addRing = (size: number) => {
    if (stack.includes(size)) return;
    const expected = 5 - stack.length;
    if (size !== expected) {
      setFeedback(`Try a larger ring first. The next ring should be size ${expected} of 5.`);
      return;
    }
    const next = [...stack, size];
    setStack(next);
    setLastPlaced(size);
    const ring = rings.find(r => r.size === size)!;
    if (next.length === rings.length) {
      setFeedback("You stacked all five rings from largest to smallest! Cadence laughs and claps.");
      onCelebrate();
    } else {
      setFeedback(`${ring.color} ring placed, size ${size} of 5. ${next.length} of 5 rings stacked.`);
    }
  };
  return <section className="rounded-2xl bg-white/95 p-4 shadow space-y-3" aria-labelledby="cadence-buoy-rings">
    <h2 id="cadence-buoy-rings" className="font-serif text-lg font-bold text-rose-900">Buoy Stacking Rings</h2>
    <p className="text-sm text-slate-700">Build a colorful buoy tower with Cadence, starting with the largest ring.</p>
    {!owned ? <p>Craft Buoy Stacking Rings in the Workshop to unlock this activity.</p> : <>
      <div className="relative mx-auto h-64 w-64 max-w-full overflow-hidden rounded-2xl bg-sky-50" aria-hidden="true">
        <div className="absolute bottom-5 left-1/2 h-5 w-44 -translate-x-1/2 rounded-full bg-amber-700 shadow-md" />
        <div className="absolute bottom-9 left-1/2 h-44 w-4 -translate-x-1/2 rounded-t-full bg-amber-500 shadow-sm" />
        {stack.map((size, index) => {
          const ring = rings.find(r => r.size === size)!;
          return <div key={size} className={`absolute left-1/2 h-8 -translate-x-1/2 rounded-[50%] border-[3px] border-white/35 shadow-[0_5px_6px_rgba(36,55,74,0.25),inset_0_-5px_5px_rgba(0,0,0,0.16),inset_0_4px_4px_rgba(255,255,255,0.5)] ${ring.className} ${lastPlaced === size ? "animate-buoy-drop" : ""}`} style={{ width: `${52 + size * 24}px`, bottom: `${36 + index * 23}px` }}>
            <div className="absolute inset-x-3 top-[3px] h-[7px] rounded-[50%] bg-white/35 blur-[2px]" />
            <div className="absolute inset-x-2 bottom-[2px] h-[5px] rounded-[50%] bg-black/10 blur-[2px]" />
            <div className="absolute left-1/2 top-1/2 h-2 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-700/70 shadow-inner" />
          </div>;
        })}
        {finished && <div className="absolute right-3 top-3 text-3xl animate-bounce">✨</div>}
      </div>
      <style jsx>{`@keyframes buoy-drop { from { opacity: .55; transform: translate(-50%, -125px) scale(1.08); } 70% { transform: translate(-50%, 8px) scale(.96, .88); } 86% { transform: translate(-50%, -4px) scale(1.02, 1.05); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } } .animate-buoy-drop { animation: buoy-drop 650ms ease-out both; } @media (prefers-reduced-motion: reduce) { .animate-buoy-drop { animation: none; } }`}</style>
      <p role="status" aria-live="polite" aria-atomic="true" className="font-semibold text-rose-900">{feedback}</p>
      <div className="grid grid-cols-2 gap-2">
        {rings.map(ring => <button key={ring.size} type="button" disabled={stack.includes(ring.size) || finished} onClick={() => addRing(ring.size)} className="min-h-11 rounded-xl bg-teal-800 px-3 py-2 font-semibold text-white disabled:bg-slate-300 disabled:text-slate-700">
          {ring.color} ring, size {ring.size} of 5{stack.includes(ring.size) ? ", placed" : ""}
        </button>)}
      </div>
      <button type="button" onClick={() => { setStack([]); setLastPlaced(null); setFeedback("Tower reset. Choose the largest ring first."); }} className="min-h-11 w-full rounded-xl border-2 border-teal-800 p-2 font-semibold text-teal-900">Start Over</button>
    </>}
  </section>;
}

function CadenceBubbleBath({ owned, onSound }: { owned: boolean; onSound: (sound: "splash" | "laugh" | "squeak") => void }) {
  const [bubbles, setBubbles] = useState(0);
  const [duckFloating, setDuckFloating] = useState(false);
  const [message, setMessage] = useState("Fill the little tub, then float the seashell duck and pop bubbles.");
  const filled = bubbles > 0;
  const bathtimeDone = duckFloating && bubbles >= 6;
  const start = () => { setBubbles(1); setDuckFloating(false); setMessage("The tub fills with warm water and soft bubbles. Float the duck next."); onSound("splash"); };
  const floatDuck = () => { setDuckFloating(true); setMessage("The seashell rubber duck bobs on the water. Squeak! Now pop five bubbles."); onSound("squeak"); };
  const squeakDuck = () => { setMessage("Squeak, squeak! Cadence giggles as the seashell duck bobs in the bath."); onSound("squeak"); };
  const pop = () => { const next = bubbles + 1; setBubbles(next); if (next >= 6) { setMessage("Pop! Five bubbles popped. Cadence giggles and splashes happily at bath time!"); onSound("laugh"); } else { setMessage(`Pop! ${next - 1} of 5 bubbles popped. Cadence watches the duck bob.`); onSound("splash"); } };
  return <section className="rounded-2xl bg-white/95 p-4 shadow space-y-3" aria-labelledby="cadence-bubble-bath">
    <h2 id="cadence-bubble-bath" className="font-serif text-lg font-bold text-rose-900">Seashell Duck Bubble Bath</h2>
    <p className="text-sm text-slate-700">Play with Cadence's new rubber duck in a bubbly little tub.</p>
    {!owned ? <p>Craft the Seashell Rubber Duck in the Workshop to unlock bath playtime.</p> : <>
      <div aria-hidden="true" className="relative mx-auto h-48 w-full max-w-xs overflow-hidden rounded-3xl bg-sky-50">
        <div className="absolute bottom-2 left-5 right-5 h-28 rounded-[45%] border-[10px] border-pink-200 bg-sky-300 shadow-inner">
          {filled && <div className="absolute inset-2 rounded-[45%] bg-sky-200/80" />}
        </div>
        {filled && Array.from({ length: Math.min(bubbles + 3, 10) }, (_, i) => <div key={i} className="absolute h-5 w-5 rounded-full border-2 border-white/90 bg-white/40 shadow-sm motion-safe:animate-pulse" style={{ left: `${14 + (i * 19) % 74}%`, top: `${38 + (i * 13) % 38}%` }} />)}
        {duckFloating && <Image src="/images/Seashell_Rubber_Duck.png" alt="" width={120} height={120} unoptimized className="absolute bottom-8 left-1/2 h-24 w-24 -translate-x-1/2 object-contain motion-safe:animate-bounce" />}
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className="font-semibold text-rose-900">{message}</p>
      {!filled ? <button type="button" onClick={start} className="min-h-11 w-full rounded-xl bg-teal-800 p-3 font-semibold text-white">Fill the Bubble Bath</button> :
        !duckFloating ? <button type="button" onClick={floatDuck} className="min-h-11 w-full rounded-xl bg-teal-800 p-3 font-semibold text-white">Float the Seashell Duck</button> :
        !bathtimeDone ? <button type="button" onClick={pop} className="min-h-11 w-full rounded-xl bg-teal-800 p-3 font-semibold text-white">Pop Bubble, ${Math.min(bubbles - 1, 5)} of 5 popped</button> : <p className="font-semibold text-teal-900">Bath playtime complete!</p>}
      {duckFloating && <button type="button" onClick={squeakDuck} className="min-h-11 w-full rounded-xl bg-amber-200 p-3 font-semibold text-amber-950">Squeak the Duck</button>}
      {filled && <button type="button" onClick={() => { setBubbles(0); setDuckFloating(false); setMessage("Bath reset. Fill the little tub to play again."); }} className="min-h-11 w-full rounded-xl border-2 border-teal-800 p-2 font-semibold text-teal-900">Start Bath Time Over</button>}
    </>}
  </section>;
}

export default function CadenceNursery({ onClose, onGoToKitchen }: { onClose: () => void; onGoToKitchen?: () => void }) {
  const { state, craft, cook, giveCadenceBlocks, play, collectItem, setMusicOverride, useBabyBottle } = useGame();
  const [message, setMessage] = useState("Cadence splashes her tiny tail and smiles when you enter.");
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [expandedRecipes, setExpandedRecipes] = useState<string[]>([]);
  const [lullaby, setLullaby] = useState<(typeof LULLABIES)[number]>("cadence1");
  const owned = useMemo(() => new Set(state.crafted), [state.crafted]);
  const keepsakeUnlocked = !!state.questProgress["cadence-ducky"];

  useEffect(() => { setMusicOverride(lullaby); return () => setMusicOverride(null); }, [lullaby, setMusicOverride]);
  useEffect(()=>{blockUnlocks(state.inventory,state.crafted);if(discoverNightBlocks())setMessage("Cadence sees the stars! The Night Sky block recipe is permanently unlocked in Decorative Crafts.");},[]);

  const announce = (text: string) => setMessage(text);
  const playLocal = (src: string, level = .7) => { const audio = new Audio(src); audio.volume = Math.max(0, Math.min(1, state.audio.master * level)); void audio.play().catch(() => undefined); };
  const playPiano = () => { playLocal(PIANO[Math.floor(Math.random() * PIANO.length)], .72); play("babyLaugh", .28); announce("You play sparkling notes on the shell piano. Cadence giggles and joins the duet while the nursery lullaby continues underneath."); };
  const discover = (item: typeof DISCOVERIES[number]) => { if (discovered.includes(item.id) || (state.inventory[item.id] ?? 0) > 0) { announce(`${item.name} is already tucked safely into Cadence's driftwood toy chest.`); return; } collectItem(item.id, { silent: true }); setDiscovered(old => [...old, item.id]); play(item.sound, .58); play("toyBoxClose", .25); announce(`Discovered ${item.name}. It has been placed in Cadence's driftwood toy chest.`); };
  const make = (recipe: typeof RECIPES[number]) => {
    const repeatable = "repeatable" in recipe && recipe.repeatable;
    if (!repeatable && owned.has(recipe.id)) { announce(`${recipe.name} is already displayed in Cadence's nursery.`); return; }
    if (repeatable) {
      if (cook([...recipe.cost], recipe.id, 1)) { play(recipe.sound, .5); announce(`${recipe.name} crafted and added to your inventory. You can make another whenever you have Rose Milk, Dried Sea Oats, and Sea Lavender.`); }
      else announce(`You do not have all the materials needed for ${recipe.name}.`);
      return;
    }
    if (craft(recipe.id, [...recipe.cost])) { setExpandedRecipes(old => old.filter(id => id !== recipe.id)); play(recipe.sound, .5); announce(`${recipe.name} crafted. It now appears in Cadence's nursery. Its recipe has been collapsed.`); }
    else announce(`You do not have all the materials needed for ${recipe.name}.`);
  };
  const toggleRecipe = (id: string) => setExpandedRecipes(old => old.includes(id) ? old.filter(item => item !== id) : [...old, id]);
  const feedBottle = () => {
    const rose = !!state.notebookDiscovered["kitchen-bottle:rose"];
    const berry = !!state.notebookDiscovered["kitchen-bottle:berry"];
    const water = !!state.notebookDiscovered["kitchen-bottle:water"];
    const orange = !!state.notebookDiscovered["kitchen-bottle:orange"];
    if (!rose && !berry && !water && !orange) { announce("The Seashell Baby Bottle is empty. Fill it in the kitchen first."); return; }
    if (!useBabyBottle("feed")) return;
    play("babyBabble", .25);
    announce(rose ? "Cadence drinks her warm rose milk, snuggles into her blanket, and gives a happy little babble. The Seashell Baby Bottle is empty and ready to refill." : berry ? "Cadence tastes the sweet berry juice, giggles, and swishes her tiny tail with delight. The Seashell Baby Bottle is empty and ready to refill." : orange ? "Cadence sips fresh orange juice and giggles. The Seashell Baby Bottle is empty and ready to refill." : "Cadence enjoys a little fresh water and gives a contented babble. The Seashell Baby Bottle is empty and ready to refill.");
  };
  const feed = (food: typeof BABY_FOODS[number]) => {
    const count = state.inventory[food.id] ?? 0;
    if (count < 1) { announce(`There is no ${food.name} ready. Prepare it in the Kitchen first, then bring it back to Cadence.`); return; }
    if (!cook([{ itemId: food.id, count: 1 }], food.id, 0)) { announce(`Cadence's ${food.name} could not be served right now.`); return; }
    play(food.sound, .58);
    if (food.id !== "food-cadence-teething-kelp-cookie") play("babyBabble", .18); else play("babyLaugh", .2);
    announce(`${food.reaction} One serving of ${food.name} was used.`);
  };

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#261b36] text-slate-900" role="dialog" aria-modal="true" aria-labelledby="cadence-title">
    <div className="relative min-h-[260px] w-full overflow-hidden"><Image src="/images/IMG_6342.jpeg" alt="Cadence's cozy sea-glass nursery" fill unoptimized className="object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-[#261b36]" /><button type="button" onClick={() => { setMusicOverride(null); onClose(); }} className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-2 font-bold text-rose-900 shadow">Back to Cottage</button><div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-3 shadow"><h1 id="cadence-title" className="font-serif text-xl font-bold text-rose-900">🌸 Cadence's Nursery</h1><p className="text-sm text-rose-800">Play, discover shoreline toys, feed Cady, and craft cozy treasures for her room.</p></div></div>
    <main className="mx-auto max-w-2xl space-y-4 p-4 pb-24">
      <div aria-live="polite" role="status" className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-900">{message}</div>
      {keepsakeUnlocked ? <section className="rounded-2xl bg-gradient-to-br from-amber-50 to-pink-50 p-4 shadow ring-2 ring-amber-300" aria-labelledby="cadence-keepsakes"><p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">Quest Reward Unlocked</p><h2 id="cadence-keepsakes" className="font-serif text-lg font-bold text-rose-900">🧰 Cadence's Keepsake Chest</h2><p className="mt-1 text-sm text-slate-700">Ducky is safely home for bedtime. Cadence's special heirlooms are now on display.</p><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => { play("babySpoon", .5); announce("You lift Cadence's engraved silver baby spoon. Its handle is decorated with a delicate wave motif."); }} className="rounded-xl bg-white p-3 text-left ring-1 ring-amber-200"><span className="block text-2xl" aria-hidden="true">🥄</span><strong className="block">Engraved Silver Baby Spoon</strong><span className="text-xs text-slate-600">An antique ship relic polished by Kaiana.</span></button><button type="button" onClick={() => { play("babyRattle", .6); play("babyLaugh", .2); announce("The Golden Pearl Rattle gives a delicate crystalline chime. Cadence beams at the sound."); }} className="rounded-xl bg-white p-3 text-left ring-1 ring-amber-200"><span className="block text-2xl" aria-hidden="true">✨</span><strong className="block">Golden Pearl Rattle</strong><span className="text-xs text-slate-600">A golden keepsake inlaid with tiny pink pearls.</span></button></div></section> : <section className="rounded-2xl bg-white/90 p-4 shadow ring-1 ring-slate-300"><h2 className="font-serif text-lg font-bold text-slate-800">🔒 Keepsake Chest</h2><p className="mt-1 text-sm text-slate-600">Cadence's keepsake chest will open after her lost yellow Ducky is rescued through The Great Rubber Ducky Voyage.</p></section>}
      <section className="rounded-2xl bg-white/95 p-4 shadow" aria-labelledby="cadence-music"><h2 id="cadence-music" className="font-serif text-lg font-bold text-rose-900">Nursery Lullabies</h2><p className="mt-1 text-sm">Choose one of Cadence's three background lullabies.</p><div className="mt-3 grid grid-cols-3 gap-2">{LULLABIES.map((key, i) => <button key={key} type="button" aria-pressed={lullaby === key} onClick={() => { setLullaby(key); announce(`Lullaby ${i + 1} is now playing.`); }} className="rounded-xl bg-violet-100 p-3 font-semibold">Lullaby {i + 1}{lullaby === key ? " • Playing" : ""}</button>)}</div></section>
      <section className="rounded-2xl bg-white/95 p-4 shadow" aria-labelledby="cadence-feeding"><h2 id="cadence-feeding" className="font-serif text-lg font-bold text-rose-900">Cadence's Snack Time</h2><p className="mt-1 text-sm text-slate-700">Prepare baby foods in the Kitchen, then bring them here for Cadence. Each feeding uses one serving.</p>{state.notebookDiscovered["kitchen-reward:baby"] && <div className="mt-3 rounded-xl bg-rose-50 p-3 ring-1 ring-rose-200">
        <h3 className="font-semibold text-rose-900">Seashell Baby Bottle</h3>
        {onGoToKitchen && <button type="button" onClick={onGoToKitchen} className="mt-2 min-h-11 rounded-lg bg-teal-900 px-4 py-2 font-bold text-white">Go to Kitchen to Fill Bottle</button>}
        <p className="mt-1 text-sm">{state.notebookDiscovered["kitchen-bottle:rose"] ? "Filled with Warm Rose Milk" : state.notebookDiscovered["kitchen-bottle:berry"] ? "Filled with Berry Juice" : state.notebookDiscovered["kitchen-bottle:orange"] ? "Filled with Fresh Orange Juice" : state.notebookDiscovered["kitchen-bottle:water"] ? "Filled with Fresh Water" : "Empty — fill the bottle in the kitchen"}</p>
        <button type="button" disabled={!state.notebookDiscovered["kitchen-bottle:rose"] && !state.notebookDiscovered["kitchen-bottle:berry"] && !state.notebookDiscovered["kitchen-bottle:water"] && !state.notebookDiscovered["kitchen-bottle:orange"]} onClick={feedBottle} className="mt-2 min-h-11 rounded-lg bg-rose-800 px-4 py-2 font-bold text-white disabled:opacity-50">Offer Filled Bottle to Cadence</button>
      </div>}<div className="mt-3 grid gap-2 sm:grid-cols-2">{BABY_FOODS.map(food => { const count = state.inventory[food.id] ?? 0; return <button key={food.id} type="button" onClick={() => feed(food)} aria-label={`${food.name}. ${count} servings ready.`} className="rounded-xl border border-pink-200 bg-pink-50 p-3 text-left"><span className="text-2xl" aria-hidden="true">{food.icon}</span><strong className="ml-2">{food.name}</strong><span className="mt-1 block text-xs text-slate-700">Servings ready: {count}</span><span className="mt-2 block text-sm font-semibold text-rose-800">{count > 0 ? "Feed Cadence" : "Cook in Kitchen first"}</span></button>; })}</div></section>
      <section className="rounded-2xl bg-white/95 p-4 shadow" aria-labelledby="cadence-play"><h2 id="cadence-play" className="font-serif text-lg font-bold text-rose-900">Play & Care</h2><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => { play("beachBall", .6); play("babyLaugh", .3); announce("You roll the beach ball across the rug. Cadence splashes her tail and rolls it back."); }} className="rounded-xl bg-pink-100 p-3 font-semibold">🏖️ Toss Beach Ball</button><button type="button" onClick={playPiano} className="rounded-xl bg-emerald-100 p-3 font-semibold">🎹 Shell Piano Duet</button><button type="button" onClick={() => { play("rockingCradle", .55); announce("You gently rock Cadence's scallop cradle. She cuddles her toys and grows sleepy."); }} className="rounded-xl bg-violet-100 p-3 font-semibold">🌙 Rock the Cradle</button><button type="button" onClick={() => { play("babyRattle", .55); play("babyLaugh", .22); announce("The shimmering seashell rattle jingles. Cadence reaches for it and laughs."); }} className="rounded-xl bg-amber-100 p-3 font-semibold">✨ Shake the Rattle</button></div></section>
      <CadenceBubbleBath owned={(state.inventory["seashell-rubber-duck"] || 0) > 0 || state.crafted.includes("seashell-rubber-duck")} onSound={(sound) => { if (sound === "squeak") { const audio = new Audio("/audio/Rubber-ducky-squeak.mp3"); audio.volume = Math.max(0, Math.min(1, state.audio.master * 0.75)); void audio.play().catch(() => undefined); play("babyLaugh", .18); } else if (sound === "laugh") play("babyLaugh", .4); else play("oceanWaterSplash", .18); }} />
      <CadenceBuoyRings owned={(state.inventory["buoy-stacking-rings"] || 0) > 0 || state.crafted.includes("buoy-stacking-rings")} onCelebrate={() => { play("babyLaugh", .4); }} />
      <CadenceBlocks inventory={state.inventory} master={state.audio.master} onDailyReward={() => collectItem("shell-sanddollar", { silent: true })} onGift={(itemId) => { if (!giveCadenceBlocks(itemId)) return; play("babyLaugh", .3); announce("Cadence receives her seaside blocks and invites you to play."); }} />
      <section className="rounded-2xl bg-white/95 p-4 shadow" aria-labelledby="cadence-craft"><h2 id="cadence-craft" className="font-serif text-lg font-bold text-rose-900">Nursery Crafting</h2><p className="mt-1 text-sm text-slate-700">Craft nursery decorations once. Rose Milk Bubble Bath is repeatable and stays available whenever you have its ingredients.</p><div className="mt-3 space-y-3">{RECIPES.map(r => { const repeatable = "repeatable" in r && r.repeatable; const isOwned = !repeatable && owned.has(r.id); const expanded = repeatable || !isOwned || expandedRecipes.includes(r.id); const detailsId = `${r.id}-recipe`; return <article key={r.id} className="rounded-xl border border-rose-200 p-3">{isOwned ? <button type="button" aria-expanded={expanded} aria-controls={detailsId} aria-label={`${r.name}, crafted and displayed. ${expanded ? "Hide recipe" : "Show recipe"}.`} onClick={() => toggleRecipe(r.id)} className="flex w-full items-center gap-3 rounded-lg text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-rose-600"><Image src={r.image} alt="" width={72} height={72} unoptimized className="h-[72px] w-[72px] rounded-lg object-cover" /><span><strong className="block">{r.name}</strong><span className="text-xs font-semibold text-emerald-800">Crafted & Displayed · {expanded ? "Hide recipe" : "Show recipe"}</span></span></button> : <div className="flex gap-3"><Image src={r.image} alt="" width={72} height={72} unoptimized className="h-[72px] w-[72px] rounded-lg object-cover" /><div><h3 className="font-bold">{r.name}</h3><p className="text-xs text-slate-600">{r.description}</p>{repeatable && <p className="mt-1 text-xs font-semibold text-rose-800">Repeatable craft · In inventory: {state.inventory[r.id] ?? 0}</p>}</div></div>}{expanded && <div id={detailsId}>{isOwned && <p className="mt-2 text-xs text-slate-600">{r.description}</p>}<p className="mt-2 text-xs">Requires: {r.cost.map(c => `${c.count} ${c.itemId.replaceAll("-", " ")}`).join(", ")}</p>{isOwned ? <p className="mt-2 text-sm font-bold text-emerald-800">Crafted & Displayed</p> : <button type="button" onClick={() => make(r)} className="mt-2 w-full rounded-lg bg-rose-700 py-2 font-bold text-white">Craft {r.name}</button>}</div>}</article>; })}</div></section>
      <section className="rounded-2xl bg-white/95 p-4 shadow" aria-labelledby="cadence-discoveries"><h2 id="cadence-discoveries" className="font-serif text-lg font-bold text-rose-900">Driftwood Toy Chest</h2><p className="mt-1 text-sm text-slate-700">Special toys discovered along the shoreline are kept here for Cadence.</p><div className="mt-3 grid gap-3">{DISCOVERIES.map(item => { const found = discovered.includes(item.id) || (state.inventory[item.id] ?? 0) > 0; return <button key={item.id} type="button" onClick={() => discover(item)} className="flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-left"><Image src={item.image} alt="" width={64} height={64} unoptimized className="h-16 w-16 rounded-lg object-cover" /><span><strong className="block">{item.name}{found ? " • Found" : ""}</strong><span className="text-xs text-slate-700">{item.description}</span></span></button>})}</div></section>
    </main>
  </div>;
}