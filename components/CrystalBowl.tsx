"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  BOWL_CRYSTALS, BOWL_POSITIONS, BOWL_STYLES, CRYSTAL_IDS,
  type BowlCrystal, type BowlStyle, type CrystalBowl,
} from "@/lib/crystal-bowl";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";

export function crystalBowlDescription(bowl: CrystalBowl) {
  return `${BOWL_STYLES[bowl.style].name} bowl. ${BOWL_POSITIONS.map((position, index) => {
    const id = bowl.slots[index];
    return `${position}: ${id ? ITEMS[id].name : "empty"}`;
  }).join(". ")}.`;
}

export function CrystalBowlArt({ bowl }: { bowl: CrystalBowl }) {
  const { rim, glaze } = BOWL_STYLES[bowl.style];
  return (
    <div aria-hidden="true" className="relative isolate aspect-[2/1] w-full drop-shadow-md">
      <div className="absolute inset-x-0 bottom-[9%] top-[40%] rounded-[50%] shadow-sm" style={{ background: `linear-gradient(170deg, ${rim}, ${glaze} 72%)` }} />
      <div className="absolute inset-x-0 top-[27%] h-[44%] rounded-[50%] border-2 shadow-inner" style={{ background: glaze, borderColor: rim }} />
      {bowl.slots.map((id, index) => {
        if (!id) return null;
        const item = ITEMS[id];
        return <span key={index} className="absolute top-[10%] flex h-1/2 w-[27%] items-end justify-center" style={{ left: `${10 + index * 27}%` }}>
          {item.isEmoji ? <span className="text-[clamp(0.6rem,3vw,1.6rem)] leading-none">{item.icon}</span>
            : <Image src={item.icon} alt="" fill unoptimized sizes="64px" className="object-contain object-bottom" />}
        </span>;
      })}
      <div className="absolute inset-x-[4%] bottom-[29%] h-[17%] rounded-[50%] border-b-2" style={{ borderColor: rim }} />
    </div>
  );
}

export function useCrystalBowlChime() {
  const { state } = useGame();
  const context = useRef<AudioContext | null>(null);
  const active = useRef<GainNode | null>(null);

  useEffect(() => () => {
    active.current?.disconnect();
    active.current = null;
    if (context.current) void context.current.close().catch(() => {});
    context.current = null;
  }, []);

  return (slots: CrystalBowl["slots"]) => {
    if (!state.audio.master) return;
    const AudioClass = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioClass) return;
    try {
      const audio = context.current ?? (context.current = new AudioClass());
      void audio.resume().catch(() => {});
      active.current?.disconnect();
      const output = audio.createGain();
      output.gain.value = state.audio.master * 0.16;
      output.connect(audio.destination);
      active.current = output;
      slots.filter((id): id is BowlCrystal => id !== null).forEach((id, index) => {
        const time = audio.currentTime + 0.02 + index * 0.29;
        const tone = audio.createOscillator();
        const envelope = audio.createGain();
        tone.frequency.value = BOWL_CRYSTALS[id];
        envelope.gain.setValueAtTime(0.001, time);
        envelope.gain.exponentialRampToValueAtTime(0.75, time + 0.025);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.52);
        tone.connect(envelope).connect(output);
        tone.start(time);
        tone.stop(time + 0.54);
        tone.onended = () => { tone.disconnect(); envelope.disconnect(); };
      });
    } catch {}
  };
}

const selectStyle = "block min-h-11 w-full rounded-lg border border-teal-800 bg-white px-2 text-slate-900";

export default function CrystalBowlTable({ button }: { button: string }) {
  const { state, saveCrystalBowl } = useGame();
  const [draft, setDraft] = useState<CrystalBowl>(() => state.crystalBowl ?? { style: "ivory", slots: [null, null, null] });
  const [notice, setNotice] = useState("");
  const chime = useCrystalBowlChime();
  const available = (id: BowlCrystal) => (state.inventory[id] || 0) + (state.crystalBowl?.slots.filter(crystal => crystal === id).length || 0);
  const hasCrystals = draft.slots.some(Boolean);
  const options = CRYSTAL_IDS.filter(id => available(id) > 0);
  const canSave = hasCrystals && options.length > 0 && CRYSTAL_IDS.every(id => draft.slots.filter(crystal => crystal === id).length <= available(id));

  return (
    <div className="space-y-3">
      <p>Choose a ceramic bowl and arrange up to three crystals from your collection. Saving places those crystals in your bowl. When you rearrange it, any crystals you remove return to inventory.</p>
      {!options.length && <p>Bring a crystal from the underwater caves or a tumbled gemstone from Walter’s barrel to get started.</p>}
      <label className="block max-w-xs">
        <span className="font-semibold">Bowl glaze</span>
        <select className={selectStyle} value={draft.style} onChange={event => {
          setNotice("");
          setDraft({ ...draft, style: event.target.value as BowlStyle });
        }}>
          {Object.entries(BOWL_STYLES).map(([id, style]) => <option key={id} value={id}>{style.name}</option>)}
        </select>
      </label>
      <div className="rounded-xl bg-teal-950 p-4 text-amber-50">
        <div className="mx-auto w-52 max-w-full"><CrystalBowlArt bowl={draft} /></div>
        <p>{crystalBowlDescription(draft)}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {BOWL_POSITIONS.map((position, index) => (
          <label key={position}>
            <span className="font-semibold">{position} crystal</span>
            <select
              className={selectStyle}
              value={draft.slots[index] ?? ""}
              onChange={event => {
                const id = (event.target.value || null) as BowlCrystal | null;
                const slots = [...draft.slots];
                slots[index] = id;
                setDraft({ ...draft, slots });
                setNotice("");
                if (id) chime([id]);
              }}
            >
              <option value="">Empty</option>
              {options.map(id => <option key={id} value={id} disabled={draft.slots.filter((crystal, slot) => slot !== index && crystal === id).length >= available(id)}>{ITEMS[id].name}</option>)}
            </select>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {([["Swap left and center", 0, 1], ["Swap center and right", 1, 2]] as const).map(([label, first, second]) => (
          <button key={label} type="button" className={button} disabled={draft.slots[first] === draft.slots[second]} onClick={() => {
            const slots = [...draft.slots];
            [slots[first], slots[second]] = [slots[second], slots[first]];
            setDraft({ ...draft, slots });
            setNotice(crystalBowlDescription({ ...draft, slots }));
          }}>{label}</button>
        ))}
        <button type="button" className={button} disabled={!hasCrystals} onClick={() => {
          chime(draft.slots);
          setNotice(crystalBowlDescription(draft));
        }}>Listen to the arrangement</button>
        <button type="button" className={button} disabled={!canSave} onClick={() => {
          const alreadyOwned = !!state.crystalBowl;
          if (!saveCrystalBowl(draft)) {
            setNotice("Check that all the selected crystals are available.");
            return;
          }
          setNotice(alreadyOwned ? "Your crystal bowl arrangement is saved." : "You took your crystal bowl home. Display it in the Hut. Jasmine at Sea Glass Spa was added to the Lighthouse Library postcard album.");
        }}>{state.crystalBowl ? "Save arrangement" : "Take the bowl home"}</button>
      </div>
      <p role="status" aria-atomic="true">{notice}</p>
    </div>
  );
}
