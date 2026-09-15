"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";

const RECIPES = [
  { id: "cadence-crib-mobile", name: "Crib Mobile", image: "/images/IMG_6347.jpeg", cost: [{ itemId: "shell-clam", count: 1 }, { itemId: "shell-scallop", count: 1 }, { itemId: "shell-conch", count: 1 }, { itemId: "glass-purple", count: 1 }, { itemId: "glass-pink", count: 1 }, { itemId: "glass-white", count: 1 }, { itemId: "copper-wire", count: 1 }], description: "A shell and sea-glass mobile that gently turns above Cadence's bed." },
  { id: "cadence-clamshell-nightlight", name: "Clamshell Nightlight", image: "/images/IMG_6348.jpeg", cost: [{ itemId: "firefly-jar", count: 1 }, { itemId: "star-sand", count: 1 }, { itemId: "shell-clam", count: 2 }], description: "A softly glowing clamshell nightlight filled with firefly light and sparkling star sand." },
  { id: "cadence-rose-milk-bubble-bath", name: "Rose Milk Bubble Bath", image: "/images/IMG_6349.jpeg", cost: [{ itemId: "rose-milk", count: 1 }, { itemId: "dry-oats", count: 1 }, { itemId: "lavender", count: 1 }], description: "A gentle rose-milk bubble bath with oats and lavender." },
] as const;

const DISCOVERIES = [
  { id: "cadence-marshmallow-plushy", name: "Marshmallow Plushy", image: "/images/IMG_6350.jpeg", description: "A soft fluffy white cat for Cadence to cuddle with." },
  { id: "cadence-shimmering-seashell-rattle", name: "Shimmering Seashell Rattle", image: "/images/IMG_6351.jpeg", description: "A shimmering rattle filled with rainbow pearls, sea glitter, and tiny seashells." },
  { id: "cadence-signature-beach-ball", name: "Cadence's Signature Beach Ball", image: "/images/IMG_6345.jpeg", description: "Cadence's seafoam mint, baby pink, and white beach ball." },
] as const;

const PIANO = ["/audio/Piano-1.mp3", "/audio/Piano-2.mp3", "/audio/Piano-3.mp3", "/audio/Piano-4.mp3"];

export default function CadenceNursery({ onClose }: { onClose: () => void }) {
  const { state, craft, play, collectItem, setMusicOverride } = useGame();
  const [message, setMessage] = useState("Cadence splashes her tiny tail and smiles when you enter.");
  const [discovered, setDiscovered] = useState<string[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const owned = useMemo(() => new Set(state.crafted), [state.crafted]);

  const announce = (text: string) => setMessage(text);
  const playPiano = () => {
    const src = PIANO[Math.floor(Math.random() * PIANO.length)];
    const audio = new Audio(src);
    audio.volume = Math.max(0, Math.min(1, state.audio.master * 0.75));
    void audio.play().catch(() => undefined);
    play("babyLaugh", 0.35);
    announce("You play a few sparkling notes on the shell piano. Cadence giggles and joins the duet.");
  };

  const discover = (item: typeof DISCOVERIES[number]) => {
    if (discovered.includes(item.id)) {
      announce(`${item.name} is already tucked safely into Cadence's toy chest.`);
      return;
    }
    collectItem(item.id, { silent: true });
    setDiscovered((old) => [...old, item.id]);
    play(item.id.includes("beach-ball") ? "beachBall" : "babyLaugh", 0.55);
    announce(`Discovered ${item.name}. It has been placed in Cadence's driftwood toy chest.`);
  };

  const make = (recipe: typeof RECIPES[number]) => {
    if (owned.has(recipe.id)) {
      announce(`${recipe.name} is already displayed in Cadence's nursery.`);
      return;
    }
    if (craft(recipe.id, [...recipe.cost])) {
      announce(`${recipe.name} crafted. It now appears in Cadence's nursery.`);
    } else {
      announce(`You do not have all the materials needed for ${recipe.name}.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#261b36] text-slate-900" role="dialog" aria-modal="true" aria-labelledby="cadence-title">
      <div className="relative min-h-[260px] w-full overflow-hidden">
        <Image src="/images/IMG_6342.jpeg" alt="Cadence's cozy sea-glass nursery" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-[#261b36]" />
        <button ref={closeRef} type="button" onClick={() => { setMusicOverride(null); onClose(); }} className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-2 font-bold text-rose-900 shadow">Back to Cottage</button>
        <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-3 shadow">
          <h1 id="cadence-title" className="font-serif text-xl font-bold text-rose-900">🌸 Cadence's Nursery</h1>
          <p className="text-sm text-rose-800">Play, discover shoreline toys, and craft cozy treasures for Cady's room.</p>
        </div>
      </div>

      <main className="mx-auto max-w-2xl space-y-4 p-4 pb-24">
        <div aria-live="polite" role="status" className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-900">{message}</div>

        <section className="rounded-2xl bg-white/95 p-4 shadow" aria-labelledby="cadence-play">
          <h2 id="cadence-play" className="font-serif text-lg font-bold text-rose-900">Play with Cadence</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { play("beachBall", .6); play("babyLaugh", .3); announce("You roll the beach ball across the rug. Cadence splashes her tail and rolls it back."); }} className="rounded-xl bg-pink-100 p-3 font-semibold">🏖️ Toss Beach Ball</button>
            <button type="button" onClick={playPiano} className="rounded-xl bg-emerald-100 p-3 font-semibold">🎹 Shell Piano Duet</button>
            <button type="button" onClick={() => { play("babyBottle", .55); announce("Cadence happily drinks her warm rose milk."); }} className="rounded-xl bg-pink-100 p-3 font-semibold">🍼 Give Rose Milk</button>
            <button type="button" onClick={() => { play("babySpoon", .55); announce("You spoon-feed Cadence a tiny snack. She kicks her tail and makes heart-shaped bubbles."); }} className="rounded-xl bg-emerald-100 p-3 font-semibold">🥄 Feed a Snack</button>
          </div>
        </section>

        <section className="rounded-2xl bg-white/95 p-4 shadow" aria-labelledby="cadence-craft">
          <h2 id="cadence-craft" className="font-serif text-lg font-bold text-rose-900">Nursery Crafting</h2>
          <p className="mt-1 text-sm text-slate-700">Crafted pieces become permanent nursery decorations.</p>
          <div className="mt-3 space-y-3">{RECIPES.map((r) => <article key={r.id} className="rounded-xl border border-rose-200 p-3"><div className="flex gap-3"><Image src={r.image} alt="" width={72} height={72} unoptimized className="h-18 w-18 rounded-lg object-cover" /><div><h3 className="font-bold">{r.name}</h3><p className="text-xs text-slate-600">{r.description}</p></div></div><p className="mt-2 text-xs">Requires: {r.cost.map(c => `${c.count} ${c.itemId.replaceAll("-", " ")}`).join(", ")}</p><button type="button" onClick={() => make(r)} className="mt-2 w-full rounded-lg bg-rose-700 py-2 font-bold text-white">{owned.has(r.id) ? "Crafted & Displayed" : `Craft ${r.name}`}</button></article>)}</div>
        </section>

        <section className="rounded-2xl bg-white/95 p-4 shadow" aria-labelledby="cadence-discoveries">
          <h2 id="cadence-discoveries" className="font-serif text-lg font-bold text-rose-900">Washed-Up Toy Discoveries</h2>
          <p className="mt-1 text-sm text-slate-700">Find special toys and send them to Cadence's driftwood toy chest.</p>
          <div className="mt-3 grid gap-3">{DISCOVERIES.map((item) => <button key={item.id} type="button" onClick={() => discover(item)} className="flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-left"><Image src={item.image} alt="" width={64} height={64} unoptimized className="h-16 w-16 rounded-lg object-cover" /><span><strong className="block">{item.name}</strong><span className="text-xs text-slate-700">{item.description}</span></span></button>)}</div>
        </section>
      </main>
    </div>
  );
}
