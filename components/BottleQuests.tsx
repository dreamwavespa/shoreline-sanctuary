"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { QuestDef, QUESTS } from "@/lib/quests";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { SCENES } from "@/lib/media";
import { FOUND_BOTTLE_MESSAGES } from "@/lib/bottleFinds";
import { isCadenceDuckyRescued } from "@/lib/cadenceQuest";

export default function BottleQuests() {
  const { state, claimQuest, hasEnough, inspectFoundBottle, playBottleSequence, setMusicOverride } = useGame();
  const [openId, setOpenId] = useState<string | null>(null);
  const [stationPanel, setStationPanel] = useState<"frosted" | "original" | "hourglass" | "journal" | null>(null);
  const [isNight, setIsNight] = useState(false);
  const [latestFind, setLatestFind] = useState<{ messageId: string; bonusItemId: string | null } | null>(null);
  const [duckyRescued, setDuckyRescued] = useState(false);
  const [marshmallowToyQuestStarted, setMarshmallowToyQuestStarted] = useState(false);
  const [marshmallowToyFound, setMarshmallowToyFound] = useState(false);
  const sealedBottleCount = state.inventory["sealed-frosted-bottle"] || 0;
  const emptyBottleCount = state.inventory["empty-glass-bottle"] || 0;
  const latestMessage = latestFind ? FOUND_BOTTLE_MESSAGES.find((message) => message.id === latestFind.messageId) : null;
  const latestBonus = latestFind?.bonusItemId ? ITEMS[latestFind.bonusItemId] : null;
  const journalMessages = FOUND_BOTTLE_MESSAGES.filter((message) => state.foundBottleMessages.includes(message.id));

  useEffect(() => {
    setMusicOverride("bottles");
    const updateTime = () => { const h = new Date().getHours(); setIsNight(h >= 19 || h < 6); };
    updateTime();
    const clock = window.setInterval(updateTime, 60000);
    setDuckyRescued(isCadenceDuckyRescued());
    const syncDucky = () => setDuckyRescued(isCadenceDuckyRescued());
    const syncMarshmallowToy = () => {
      try {
        setMarshmallowToyQuestStarted(window.localStorage.getItem("shoreline-marshmallow-toy-quest-started") === "yes");
        setMarshmallowToyFound(window.localStorage.getItem("shoreline-marshmallow-toy-found") === "yes");
      } catch {}
    };
    syncMarshmallowToy();
    window.addEventListener("shoreline:cadence-ducky", syncDucky);
    window.addEventListener("shoreline:marshmallow-toy-quest", syncMarshmallowToy);
    return () => {
      window.clearInterval(clock);
      setMusicOverride(null);
      window.removeEventListener("shoreline:cadence-ducky", syncDucky);
      window.removeEventListener("shoreline:marshmallow-toy-quest", syncMarshmallowToy);
    };
  }, [setMusicOverride]);

  const isReady = (q: QuestDef) => {
    if (state.questProgress[q.id]) return false;
    if (q.id === "cadence-ducky" && !duckyRescued) return false;
    if (q.id === "marshmallowlosttoy" && !marshmallowToyFound) return false;
    if (q.requiresFlag && !(state as any)[q.requiresFlag]) return false;
    if (q.requiresCraft && !state.crafted.includes(q.requiresCraft)) return false;
    if (q.requires.length && !hasEnough(q.requires)) return false;
    return true;
  };

  const isVisible = (q: QuestDef) => {
    if (q.phase === 2 && !state.rowboatRepaired) return false;
    if (q.phase === 3 && !state.hasDivingGear) return false;
    if (q.id === "libbytraprepair" && !state.libbyTrapBottleFound) return false;
    if (q.id === "marshmallowlosttoy" && !marshmallowToyQuestStarted) return false;
    return true;
  };

  return <div className="h-full overflow-y-auto bg-[#123f3b]">
    <h1 className="sr-only">The Enchanted Bottle Station</h1>
    <div className="relative w-full max-w-2xl mx-auto" style={{aspectRatio:"2 / 3"}}>
      <Image src={isNight ? "/images/Bottle-quest-night.PNG" : "/images/Bottle-quest-day.PNG"} alt={isNight ? "Moonlit seaside bottle pavilion with shelves, a basket, hourglass, and journal" : "Sunlit seaside bottle pavilion with shelves, a basket, hourglass, and journal"} fill unoptimized sizes="(max-width: 640px) 100vw, 640px" className="object-cover" priority />
      <button type="button" aria-label="Open frosted bottles found on the beach" title="Open frosted bottles found on the beach" onClick={() => setStationPanel("frosted")} className="absolute rounded-xl border-2 border-transparent focus-visible:border-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-700" style={{left:"1%",top:"29%",width:"30%",height:"53%"}}><span className="sr-only">Open frosted bottles found on the beach</span></button>
      <button type="button" aria-label="Open original bottle quests" title="Open original bottle quests" onClick={() => setStationPanel("original")} className="absolute rounded-xl border-2 border-transparent focus-visible:border-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-700" style={{left:"72%",top:"19%",width:"28%",height:"42%"}}><span className="sr-only">Open original bottle quests</span></button>
      <button type="button" aria-label="View Sands of Time hourglass quest" title="View Sands of Time hourglass quest" onClick={() => setStationPanel("hourglass")} className="absolute rounded-xl border-2 border-transparent focus-visible:border-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-700" style={{left:"35%",top:"39%",width:"23%",height:"16%"}}><span className="sr-only">View Sands of Time hourglass quest</span></button>
      <button type="button" aria-label="Open bottle message journal" title="Open bottle message journal" onClick={() => setStationPanel("journal")} className="absolute rounded-xl border-2 border-transparent focus-visible:border-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-teal-700" style={{left:"56%",top:"46%",width:"26%",height:"13%"}}><span className="sr-only">Open bottle message journal</span></button>
    </div>
    <div className="max-w-2xl mx-auto px-4">
            {state.gameCompleted && <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-teal-100 p-5 shadow-md ring-1 ring-amber-300 text-center mb-2"><p className="text-3xl mb-1">🎉</p><p className="font-bold text-amber-900">Shoreline Sanctuary — Complete!</p><p className="text-xs text-amber-800 mt-1">Thank you for restoring this little corner of the ocean.</p></div>}

    </div>
    {stationPanel && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3" onMouseDown={(event) => { if(event.target === event.currentTarget) setStationPanel(null); }}>
      <section role="dialog" aria-modal="true" aria-label={stationPanel === "frosted" ? "Frosted bottle collection" : stationPanel === "original" ? "Original bottle quests" : stationPanel === "hourglass" ? "Sands of Time" : "Bottle message journal"} className="w-full max-w-2xl max-h-[88dvh] overflow-y-auto rounded-2xl bg-[#fbf3e3] p-3 shadow-2xl">
        <div className="sticky top-0 z-10 flex justify-end bg-[#fbf3e3] pb-2"><button type="button" onClick={() => setStationPanel(null)} className="min-h-12 rounded-xl bg-teal-800 px-5 py-2 font-semibold text-white">Close</button></div>
        {stationPanel === "frosted" && <div>      <section aria-labelledby="found-bottles-heading" className="rounded-2xl bg-gradient-to-br from-cyan-50 to-amber-50 p-5 shadow-md ring-1 ring-cyan-300">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">Found Along the Tide Line</p><h2 id="found-bottles-heading" className="mt-1 font-serif text-xl font-bold text-amber-950">🍾 Sealed Frosted Bottles</h2>
        <p className="mt-1 text-sm text-amber-800">Check each sealed bottle for a note and an occasional tucked-away treasure. After opening, the empty bottle can be used for sand art.</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm"><div className="rounded-xl bg-white/80 p-3 ring-1 ring-cyan-200"><p className="font-bold text-teal-900">{sealedBottleCount}</p><p className="text-xs text-teal-700">Sealed to check</p></div><div className="rounded-xl bg-white/80 p-3 ring-1 ring-amber-200"><p className="font-bold text-amber-900">{emptyBottleCount}</p><p className="text-xs text-amber-700">Empty for crafting</p></div></div>
        <button type="button" disabled={sealedBottleCount < 1} onClick={() => { const result = inspectFoundBottle(); if (result) setLatestFind(result); }} className="mt-3 min-h-12 w-full rounded-xl bg-teal-700 px-4 py-3 font-bold text-white shadow active:bg-teal-800 disabled:bg-teal-200 disabled:text-teal-600">{sealedBottleCount > 0 ? "Open a Sealed Bottle" : "No Sealed Bottles to Check"}</button>
        {latestMessage && <div role="status" aria-live="polite" className="mt-4 rounded-xl bg-white p-4 text-left shadow-inner ring-1 ring-amber-200"><p className="text-xs font-bold uppercase tracking-wide text-amber-700">Message Inside</p><p className="mt-2 font-serif text-lg leading-relaxed text-slate-800">“{latestMessage.text}”</p>{latestBonus && <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-200"><p className="font-bold text-emerald-900">Bonus find: {latestBonus.name}</p>{latestBonus.isEmoji ? <span aria-hidden="true" className="mt-2 block text-4xl">{latestBonus.icon}</span> : <div className="relative mx-auto mt-3 h-80 w-full max-w-48 overflow-hidden rounded-xl bg-amber-50 shadow-md ring-1 ring-amber-300"><Image src={latestBonus.icon} alt={latestBonus.artDescription || latestBonus.name} fill unoptimized sizes="192px" className="object-contain" /></div>}</div>}<p className="mt-2 text-xs text-teal-700">The checked bottle is now available for sand-art crafting.</p></div>}
        {journalMessages.length > 0 && <details className="mt-4 rounded-xl bg-white/75 p-3 ring-1 ring-cyan-200"><summary className="cursor-pointer font-bold text-teal-900">Bottle Message Journal ({journalMessages.length}/{FOUND_BOTTLE_MESSAGES.length})</summary><ol className="mt-3 space-y-3 pl-5 text-sm text-slate-700">{journalMessages.map((message) => <li key={message.id}>{message.text}</li>)}</ol></details>}
      </section>
</div>}
        {stationPanel === "hourglass" && <div>      <section aria-labelledby="sands-of-time-quest" className="rounded-2xl bg-white/90 p-4 shadow-md ring-1 ring-cyan-300 text-teal-950">
        <h2 id="sands-of-time-quest" className="font-serif text-xl font-bold">Sands of Time — Hourglass Quest</h2>
        {state.crafted.includes("hourglass-restored") ? <>
          <p className="mt-2 font-semibold">Quest complete! Your restored hourglass is ready in the sand art studio.</p>
          <Image src="/images/Hourglass/hourglass-restored.png" alt="Completed coastal hourglass with colorful sand and seashell decorations" width={160} height={200} unoptimized className="mt-2 h-40 w-32 object-contain" />
        </> : state.foundBottleMessages.includes("sands-of-time") ? <>
          <p className="mt-2">You found the mysterious bottle and its hourglass cap. Search the deeper Tide Pool for the other four pieces, then visit the sand art studio to restore the hourglass.</p>
          <p className="mt-2 font-semibold">{["hourglass-cap", "hourglass-upper-chamber", "hourglass-lower-chamber", "hourglass-connector", "hourglass-base"].filter(id => (state.inventory[id] || 0) > 0).length} of 5 pieces collected.</p>
          <ul className="mt-2 space-y-1">{["hourglass-cap", "hourglass-upper-chamber", "hourglass-lower-chamber", "hourglass-connector", "hourglass-base"].map(id => <li key={id}>{ITEMS[id].name}: {(state.inventory[id] || 0) > 0 ? "Found" : "Not found"}</li>)}</ul>
        </> : <>
          <p className="mt-2">A mysterious message bottle holds the beginning of an hourglass mystery. Find a sealed frosted bottle on the beach and open it above to begin.</p>
          <p className="mt-2 text-sm">The first Sands of Time message you discover awards the ornate hourglass cap. The remaining pieces are hidden in the deeper Tide Pool.</p>
        </>}
      </section>
</div>}
        {stationPanel === "original" && <div className="space-y-3"><h2 className="font-serif text-xl font-bold text-amber-950">Original Bottle Quests</h2>      {QUESTS.filter(isVisible).map((q) => { const done = state.questProgress[q.id]; const ready = isReady(q); const isOpen = openId === q.id; return <div key={q.id} className="rounded-2xl bg-white/90 shadow-md ring-1 ring-amber-200 overflow-hidden">
        <button type="button" className="w-full text-left p-4 flex items-center justify-between" onClick={() => { setOpenId(isOpen ? null : q.id); if (!isOpen) playBottleSequence(); }}><div><div className="font-semibold text-amber-900">{q.title}</div><div className="text-xs text-amber-600">{done ? "Completed ✓" : `From: ${q.from}`}</div></div><span className="text-xl">{done ? "📜" : "🍾"}</span></button>
        {isOpen && <div className="px-4 pb-4 border-t border-amber-100 pt-3"><p className="text-sm italic text-amber-800 mb-3">"{q.letter}"</p><div className="flex flex-wrap gap-2 mb-3">
          {q.requires.map((r) => { const def = ITEMS[r.itemId]; const have = state.inventory[r.itemId] || 0; const ok = have >= r.count; return <div key={r.itemId} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ring-1 ${ok ? "ring-emerald-300 bg-emerald-50 text-emerald-800" : "ring-red-200 bg-red-50 text-red-700"}`}>{def.isEmoji ? <span>{def.icon}</span> : <Image src={def.icon} alt={def.name} width={16} height={16} unoptimized />}<span>{def.name} {have}/{r.count}</span></div>; })}
          {q.id === "libbytraprepair" && <div className="w-full rounded-xl bg-cyan-50 px-3 py-2 text-xs font-semibold text-teal-900 ring-1 ring-cyan-200">🌊 This bottle washed in after a storm. Take the repair materials to Libby.</div>}
          {q.id === "cadence-ducky" && <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ring-1 ${duckyRescued ? "ring-emerald-300 bg-emerald-50 text-emerald-800" : "ring-red-200 bg-red-50 text-red-700"}`}>{duckyRescued ? "🐤 Ducky rescued from the Sandbars ✓" : "🛟 Take the raft to the Sandbars and find Ducky"}</div>}
          {q.id === "marshmallowlosttoy" && <div className={`w-full rounded-xl px-3 py-2 text-xs font-semibold ring-1 ${marshmallowToyFound ? "bg-emerald-50 text-emerald-900 ring-emerald-200" : "bg-violet-50 text-violet-900 ring-violet-200"}`}>{marshmallowToyFound ? "🧶 Crinkly Foil Ball found in the lighthouse ✓" : "🐈 Search the lighthouse and listen for a faint crinkle."}</div>}
          {q.requiresCraft && <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ring-1 ${state.crafted.includes(q.requiresCraft) ? "ring-emerald-300 bg-emerald-50 text-emerald-800" : "ring-red-200 bg-red-50 text-red-700"}`}>🔨 {state.crafted.includes(q.requiresCraft) ? "Crafted" : "Needs crafting"}</div>}
          {q.requiresFlag && <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ring-1 ${(state as any)[q.requiresFlag] ? "ring-emerald-300 bg-emerald-50 text-emerald-800" : "ring-red-200 bg-red-50 text-red-700"}`}>{(state as any)[q.requiresFlag] ? "✓ Ready" : "Not yet"}</div>}
        </div><p className="text-xs text-amber-700 mb-3">Reward: {q.rewardLabel}</p><button type="button" disabled={done || !ready} onClick={() => claimQuest(q)} className="w-full py-2 rounded-xl font-semibold text-white disabled:bg-amber-200 disabled:text-amber-500 bg-teal-600 active:bg-teal-700">{done ? "Turned In" : ready ? (q.id === "cadence-ducky" ? "Return Ducky to Cadence" : q.id === "libbytraprepair" ? "Take Materials to Libby" : q.id === "marshmallowlosttoy" ? "Return Toy to Marshmallow" : "Turn In Quest") : "Not Ready Yet"}</button></div>}
      </div>; })}
</div>}
        {stationPanel === "journal" && <div className="rounded-xl bg-white p-4"><h2 className="font-serif text-xl font-bold text-amber-950">Bottle Message Journal</h2><p className="mt-2 text-sm">Discovered messages: {journalMessages.length} of {FOUND_BOTTLE_MESSAGES.length}</p>{journalMessages.length ? <ol className="mt-3 list-decimal space-y-3 pl-5">{journalMessages.map(message => <li key={message.id}>{message.text}</li>)}</ol> : <p className="mt-3">Find frosted bottles on the beach and open them to collect messages.</p>}</div>}
      </section>
    </div>}
  </div>;
}
