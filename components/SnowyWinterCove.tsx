"use client";

import Image from "next/image";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { VILLAGERS } from "@/lib/villagers";
import { useEffect, useRef, useState } from "react";

type Spot = "snowy" | "floes" | "blocks" | "snowmen" | "pool";
const SPOTS: { id: Spot; label: string; description: string; left: string; top: string }[] = [
  { id: "snowy", label: "Visit Snowy the harp seal pup", description: "Snowy welcomes you from her favorite ice floe. Her blue snowflake scarf keeps her cozy.", left: "22%", top: "73%" },
  { id: "floes", label: "Explore the floating ice floes", description: "Search the floating ice floes for winter treasures and unopened frozen ice blocks.", left: "43%", top: "44%" },
  { id: "blocks", label: "Visit the ice block game area", description: "Use Snowy’s carving tool to chip open saved winter ice blocks and discover hidden treasures.", left: "81%", top: "54%" },
  { id: "snowmen", label: "Visit the snowman-making clearing", description: "A snowman waits by the trees. The snowball mold will unlock snowman-making in a future update.", left: "83%", top: "27%" },
  { id: "pool", label: "Explore Snowy's sheltered swimming pool", description: "The cove's sheltered water stays open for Snowy to swim and play.", left: "47%", top: "66%" },
];

export default function SnowyWinterCove({ onBack }: { onBack: () => void }) {
  const { state, giftVillager, collectItem, openWinterIceBlock, play, setMusicOverride } = useGame();
  useEffect(() => { setMusicOverride("snowyWinterCove"); return () => setMusicOverride("grove"); }, [setMusicOverride]);
  const [giftMessage,setGiftMessage] = useState("");
  const [chipStage,setChipStage] = useState(0);
  const [iceReward,setIceReward] = useState("");
  const [carvingStatus,setCarvingStatus] = useState("");
  const rewardPool = ["winter-frosted-sea-glass","winter-snowball-pearl","winter-frosted-scallop-shell","winter-snowflake-sand-dollar","winter-everlasting-ice-crystal","winter-silver-snowflake-key","winter-golden-shell-key","winter-crystal-seal"];
  const beginCarving = () => {
    if ((state.inventory["winter-ice-block"]||0)<1 || (state.inventory["snowy-ice-carving-tool"]||0)<1) return;
    setIceReward(rewardPool[Math.floor(Math.random()*rewardPool.length)]);
    setChipStage(1);
    setCarvingStatus("Ice block ready. Select Chip Ice to begin.");
  };
  const chipIce = () => {
    if (!iceReward || chipStage<1) return;
    if (chipStage===1) {play("winterIceFirstChip",0.6);setChipStage(2);setCarvingStatus("The first cracks appear in the ice.");}
    else if (chipStage===2) {play("winterIceFurtherCracks",0.6);setChipStage(3);setCarvingStatus("The cracks spread. One final chip will reveal the treasure.");}
    else if (chipStage===3) {
      if (!openWinterIceBlock(iceReward)) {setCarvingStatus("Unable to open this block. Check your inventory.");return;}
      play("winterIceFinalShatter",0.5);
      setChipStage(4);
      setCarvingStatus("The ice shatters! You discovered "+(ITEMS[iceReward]?.name||"a winter treasure")+". Added to inventory.");
    }
  };
  const [iceSearchDate,setIceSearchDate] = useState("");
  const [iceSearchFound,setIceSearchFound] = useState<number[]>([]);
  const [iceAnnouncement,setIceAnnouncement] = useState("");
  const [lastIceImage,setLastIceImage] = useState("");
  const [lastIceName,setLastIceName] = useState("");
  const iceSearchToday = new Date().toLocaleDateString("en-CA");
  const iceSearchKey = "shoreline-winter-ice-floes-v1-" + iceSearchToday;
  const iceFinds = [
    {id:"winter-ice-block",name:"Unopened Winter Ice Block",image:"Winter-ice-block.PNG"},
    {id:"winter-frosted-sea-glass",name:"Frosted Sea Glass",image:"Frosted_Sea_Glass.png"},
    {id:"winter-snowball-pearl",name:"Snowball Pearl",image:"Snowball_Pearl.png"},
    {id:"winter-frosted-scallop-shell",name:"Frosted Scallop Shell",image:"Frosted_Scallop_Shell.png"},
    {id:"winter-frosted-spiral-shell",name:"Frosted Spiral Shell",image:"Frosted_Spiral_Shell.png"},
    {id:"winter-snowflake-sand-dollar",name:"Snowflake Sand Dollar",image:"Snowflake_Sand_Dollar.png"},
    {id:"winter-ice-coral",name:"Ice Coral",image:"Ice_Coral.png"},
    {id:"winter-iridescent-starfish",name:"Iridescent Starfish",image:"Iridescent_Starfish.png"},
  ];
  useEffect(() => {
    try { const saved=JSON.parse(localStorage.getItem(iceSearchKey)||"[]");setIceSearchFound(Array.isArray(saved)?saved.filter((n:unknown)=>typeof n==="number"&&n>=0&&n<5):[]); } catch {setIceSearchFound([]);}
    setIceSearchDate(iceSearchToday);
  },[iceSearchKey,iceSearchToday]);
  const searchIce = (slot:number) => {
    if (iceSearchDate!==iceSearchToday || iceSearchFound.includes(slot)) return;
    // Each daily slot has a stable discovery, including a guaranteed ice block.
    const pool = [iceFinds[0],...iceFinds.slice(1)];
    const choice = slot===0 ? pool[0] : pool[1+Math.floor(Math.random()*(pool.length-1))];
    const next=[...iceSearchFound,slot];
    try {localStorage.setItem(iceSearchKey,JSON.stringify(next));} catch {}
    setIceSearchFound(next);
    collectItem(choice.id,{silent:true});
    play(choice.id==="winter-ice-block"?"winterIceCollect":"seaGlass",0.6);
    setLastIceImage("/images/Winter/"+choice.image);
    setLastIceName(choice.name);
    setIceAnnouncement(choice.name+" found on ice floe "+(slot+1)+". Added to inventory.");
  };
  const favoriteGifts = VILLAGERS.snowy.gift.lovedGiftIds;
  const [spot, setSpot] = useState<Spot | null>(null);
  const [night, setNight] = useState(false);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const dialogHeading = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    const update = () => { const h = new Date().getHours(); setNight(h >= 19 || h < 6); };
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => { if (spot) dialogHeading.current?.focus(); }, [spot]);
  const close = () => { setChipStage(0);setIceReward("");setCarvingStatus("");setGiftMessage(""); setSpot(null); window.setTimeout(() => returnFocus.current?.focus(), 0); };
  const selected = SPOTS.find(s => s.id === spot);
  return <section aria-label="Snowy's Winter Cove" className="mx-auto max-w-3xl space-y-3 rounded-xl bg-indigo-950 p-3 text-white">
    <button type="button" onClick={onBack} className="min-h-12 rounded-lg bg-amber-100 px-5 py-3 font-bold text-indigo-950">Return to Coconut Grove</button>
    <h1 className="text-2xl font-bold">Snowy's Winter Cove</h1>
    <p className="text-sm text-indigo-100">Visit Snowy, explore the floating ice, and discover the future winter activity areas. The cove changes from day to night automatically.</p>
    <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "2 / 3" }}>
      <Image src={night ? "/images/Winter-cove-night.PNG" : "/images/Winter-cove-day.PNG"} alt={night ? "Moonlit winter cove with Snowy the white seal, glowing lanterns, floating ice floes, an ice block area, and a snowy clearing." : "Sunny winter cove with Snowy the white seal, floating ice floes, a sheltered swimming pool, an ice block area, and a snowman clearing."} fill unoptimized priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
      {SPOTS.map(s => <button key={s.id} type="button" style={{ left:s.left, top:s.top, transform:"translate(-50%,-50%)" }} className="absolute z-10 flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/45 bg-sky-100/20 px-2 text-lg text-white shadow-[0_1px_5px_rgba(0,20,50,0.28)] backdrop-blur-[1px] transition-colors hover:bg-sky-100/40 focus-visible:bg-indigo-950/90 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300" aria-label={s.label} onClick={e => { returnFocus.current = e.currentTarget; setSpot(s.id); }}>{s.id === "snowy" ? "🦭" : s.id === "blocks" ? "🧊" : s.id === "snowmen" ? "⛄" : s.id === "pool" ? "🌊" : "❄️"}</button>)}
    </div>
    <p className="text-sm text-indigo-100">Explore the five interactive areas directly in the cove illustration.</p>
    {selected && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/90 p-4" onKeyDown={e => { if(e.key==="Escape"){e.preventDefault();close();} if(e.key==="Tab"){e.preventDefault();(e.currentTarget.querySelector('[role="dialog"] button') as HTMLButtonElement)?.focus();} }}>
      <div role="dialog" aria-modal="true" aria-labelledby="snowy-dialog-title" aria-describedby="snowy-dialog-description" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border-2 border-amber-200 bg-indigo-950 p-5 text-white">
        <h2 ref={dialogHeading} tabIndex={-1} id="snowy-dialog-title" className="text-xl font-bold">{selected.label}</h2>
        {spot === "snowy" && <Image src="/images/Snowy-portrait.PNG" alt="Snowy, a fluffy white harp seal pup wearing a blue snowflake scarf." width={280} height={280} unoptimized className="mx-auto my-3 h-52 w-auto object-contain" />}
        <p id="snowy-dialog-description" className="my-4">{selected.description}</p>
        {spot === "snowy" && <section aria-label="Snowy's friendship and gifts" className="my-4 space-y-3 rounded-xl bg-indigo-900 p-3">
          <h3 className="font-bold">Snowy's Friendship</h3>
          <p aria-live="polite">Favorite gifts given: {state.villagerGiftCounts.snowy || 0}</p>
          <p className="text-sm">Snowy loves fresh reef fish, beach balls, snowflake pearls, coconut drops, and frozen drinks.</p>
          <div className="grid gap-2">{favoriteGifts.map(id=><button key={id} type="button" disabled={(state.inventory[id]||0)<1} onClick={()=>{const success=giftVillager("snowy",id);setGiftMessage(success?`Snowy happily accepts your ${ITEMS[id]?.name||id}! Your friendship grows.`:`You need a ${ITEMS[id]?.name||id} in your inventory first.`);}} className="min-h-11 rounded-lg border border-sky-200 bg-indigo-800 p-2 text-left disabled:opacity-50">Give {ITEMS[id]?.name||id} — {state.inventory[id]||0} available</button>)}</div>
          {giftMessage&&<p role="status" className="font-semibold">{giftMessage}</p>}
        </section>}
        {spot === "floes" && <section className="space-y-3" aria-label="Ice Floe Exploration">
          <p>Search five ice floes each day. Ice blocks are stored unopened in your inventory until Snowy's carving tool is unlocked.</p>
          <p>Unopened ice blocks in inventory: {state.inventory["winter-ice-block"]||0}</p>
          <div className="relative mx-auto w-full overflow-hidden rounded-xl" style={{aspectRatio:"2 / 3"}}>
            <Image src={night?"/images/Winter/Ice-flow-search-night.PNG":"/images/Winter/Ice-flow-search-day.PNG"} alt={night?"Moonlit ice floe search area with five floating ice platforms, Snowy, glowing crystals, snowy cliffs and northern lights.":"Sunny ice floe search area with five floating ice platforms, Snowy, glowing crystals and snowy cliffs."} fill unoptimized sizes="(max-width: 768px) 100vw, 450px" className="object-cover" />
            {[
              {left:"70%",top:"28%"},
              {left:"43%",top:"39%"},
              {left:"82%",top:"40%"},
              {left:"27%",top:"52%"},
              {left:"70%",top:"57%"},
            ].map((position,slot)=><button key={slot} type="button" style={{left:position.left,top:position.top,transform:"translate(-50%,-50%)"}} disabled={iceSearchDate!==iceSearchToday||iceSearchFound.includes(slot)} onClick={()=>searchIce(slot)} aria-label={`Ice floe ${slot+1}, ${iceSearchFound.includes(slot)?"already searched today":"search for a winter treasure"}`} className="absolute z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/70 bg-sky-100/30 text-2xl text-white shadow-md backdrop-blur-[1px] hover:bg-sky-100/50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-300 disabled:border-white/40 disabled:bg-slate-800/35 disabled:text-white/70" >{iceSearchFound.includes(slot)?"✓":"❄"}</button>)}
          </div>
          <p className="text-sm text-sky-100">Select a snowflake on an ice floe to search it. A checkmark means that floe has already been searched today.</p>
          <p aria-live="off">{iceSearchFound.length} of 5 ice floes searched today.</p>
          {lastIceImage&&<Image src={lastIceImage} alt={lastIceName} width={180} height={180} unoptimized className="mx-auto h-36 w-36 object-contain" />}
          <p role="status" aria-live="polite">{iceAnnouncement||`${iceSearchFound.length} of 5 ice floes searched today.`}</p>
          {iceSearchFound.length===5&&<p>All five floes explored today. Come back tomorrow for more discoveries!</p>}
        </section>}
        {spot === "blocks" && <section aria-label="Frozen Treasure Discovery" className="my-4 space-y-3 rounded-xl bg-indigo-900 p-3">
          <h3 className="font-bold">Frozen Treasure Discovery</h3>
          <p>Unopened ice blocks: {state.inventory["winter-ice-block"]||0}</p>
          <p>{(state.inventory["snowy-ice-carving-tool"]||0)>0?"Snowy's Ice Carving Tool unlocked.":"Snowy's carving tool is locked. Give Snowy three favorite gifts to earn it. Save your ice blocks until then."}</p>
          {chipStage>0&&<Image src={chipStage===4?ITEMS[iceReward]?.icon||"/images/Winter/Winter-ice-block.PNG":"/images/Winter/Winter-ice-block.PNG"} alt={chipStage===4?(ITEMS[iceReward]?.name||"Discovered treasure"):"Unopened ice block, carving stage "+chipStage} width={240} height={240} unoptimized className="mx-auto h-48 w-48 object-contain" />}
          {chipStage===0||chipStage===4?<button type="button" disabled={(state.inventory["winter-ice-block"]||0)<1||(state.inventory["snowy-ice-carving-tool"]||0)<1} onClick={beginCarving} className="min-h-12 rounded-lg bg-amber-100 px-4 py-2 font-bold text-indigo-950 disabled:opacity-50">Select an Ice Block</button>:<button type="button" onClick={chipIce} className="min-h-12 rounded-lg bg-amber-100 px-4 py-2 font-bold text-indigo-950">Chip Ice — {chipStage} of 3</button>}
          <p role="status" aria-live="polite" aria-atomic="true">{carvingStatus}</p>
          {chipStage===4&&<p>You can open another saved ice block, if you have one.</p>}
        </section>}
        <button type="button" onClick={close} className="min-h-12 rounded-lg bg-amber-100 px-5 py-3 font-bold text-indigo-950">Return to Winter Cove</button>
      </div>
    </div>}
  </section>;
}
