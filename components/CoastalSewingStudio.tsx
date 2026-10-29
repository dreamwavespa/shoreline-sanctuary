"use client";
import { useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";
import { VILLAGERS } from "@/lib/villagers";

const PROJECTS = [
  ["seashell-pillow","Seashell Pillow",2,3,0,0,0],
  ["moon-pillow","Moon Pillow",2,2,0,0,0],
  ["luxury-feather-pillow","Luxury Feather Pillow",2,2,3,0,0],
  ["patchwork-beach-blanket","Patchwork Beach Blanket",4,0,0,0,0],
  ["cozy-fluffy-baby-blanket","Cozy Fluffy Baby Blanket",2,2,0,0,0],
  ["turtle-plushie","Turtle Plushie",2,3,0,0,0],
  ["octopus-plushie","Octopus Plushie",2,4,0,0,0],
  ["moon-jelly-plushie","Moon Jelly Plushie",2,2,0,2,0],
  ["fluffy-snowball-cat-toy","Fluffy Snowball Cat Toy",0,2,0,0,0],
  ["catnip-moon","Catnip Moon",1,0,0,0,1],
  ["crinkly-starfish","Crinkly Starfish",2,0,0,0,0],
] as const;
const THREADS = ["Pearl White","Ocean Blue","Seafoam Green","Rose Pink","Lavender","Golden Sand"];
const IMAGE_ROOT = "/images/Sewing/";
function playFile(file: string) { try { const audio = new Audio("/audio/" + file); audio.volume = 0.7; void audio.play().catch(() => {}); } catch {} }
export default function CoastalSewingStudio() {
  const {state,craft,collectItem,hasEnough,giftVillager,markVillagerEncounter} = useGame();
  const [giftChoice,setGiftChoice] = useState("pearl-pink");
  const [needleSearchDate,setNeedleSearchDate] = useState(() => {try{return localStorage.getItem("shoreline-lacey-pin-search-date") || "";}catch{return "";}});
  const [needleSearchCount,setNeedleSearchCount] = useState(() => {try{return Number(localStorage.getItem("shoreline-lacey-pin-search-count") || "0");}catch{return 0;}});
  const [pinChoice,setPinChoice] = useState("urchin");
  const lacey = VILLAGERS.lacey;
  const giftCount = state.villagerGiftCounts.lacey || 0;
  const friendshipMilestones = [[3,"Sea-Urchin Pincushion"],[5,"Clam-Shell Satchel"],[8,"Turret-Shell Thimble"],[12,"Embroidery Hoop"]] as const;
  const [message,setMessage] = useState("Welcome to Lacey's Coastal Sewing Studio! All projects are available as soon as you have the materials.");
  const [thread,setThread] = useState(THREADS[0]);
  const [selected,setSelected] = useState<string>(PROJECTS[0][0]);
  const [lastClaim,setLastClaim] = useState(() => { try { return localStorage.getItem("shoreline-sewing-pin-daily") || ""; } catch { return ""; } });
  const allMade = PROJECTS.every(([id]) => state.crafted.includes("sewing-"+id));
  const thimble = !!state.inventory["magic-sewing-thimble"] || state.notebookRewardsClaimed.includes("coastal-sewing-materials");
  const pinUnlocked = !!state.inventory["seashell-pin-cushion"] || state.crafted.includes("sewing-pin-cushion-reward");
  const today = new Date().toLocaleDateString("en-CA");
  const project = PROJECTS.find(p => p[0] === selected) || PROJECTS[0];
  const [id,name,fabric,cotton,feathers,ribbons,catnip] = project;
  const cost = [
    ...(fabric ? [{itemId:"recycled-fabric",count:fabric}] : []),
    {itemId:"hemp-thread",count:1},
    ...(cotton ? [{itemId:"cotton-balls",count:cotton}] : []),
    ...(feathers ? [{itemId:"bird-feather",count:feathers}] : []),
    ...(ribbons ? [{itemId:"ribbon",count:ribbons}] : []),
    ...(catnip ? [{itemId:"catnip",count:catnip}] : []),
    ...(id === "crinkly-starfish" ? [{itemId:"trash-plastic",count:1}] : [])
  ];
  const recycle = () => {
    if (!craft("sewing-recycle-towel",[{itemId:"washed-beach-towel",count:1}])) {setMessage("You need one washed-ashore beach towel.");return;}
    collectItem("recycled-fabric",{silent:true});collectItem("recycled-fabric",{silent:true});
    playFile("sewing-fabric-rip.mp3");setMessage("Towel recycled into two pieces of fabric.");
  };
  const sew = () => {
    if (!hasEnough(cost)) {setMessage("You need more materials to sew this project.");return;}
    if (!craft("sewing-"+id,cost)) {setMessage("Unable to complete the sewing project.");return;}
    playFile("sewing-machine.mp3");
    setMessage(name+" completed and added to your inventory. Thread selected: "+thread+". The finished design matches the original artwork.");
  };
  const claimPin = () => {
    if (!allMade || pinUnlocked) return;
    if (craft("sewing-pin-cushion-reward", [])) {collectItem("seashell-pin-cushion",{silent:true});playFile("sewing-reward.mp3");setMessage("You completed all 11 projects! The Seashell Pin Cushion is now yours. Collect one sewing supply each day.");}
  };
  const makeFabric = () => {
    if (!craft("sewing-scraps-to-fabric",[{itemId:"wind-fabric-scrap",count:3}])) {setMessage("You need three fabric scraps.");return;}
    collectItem("recycled-fabric",{silent:true});playFile("sewing-fabric-rip.mp3");setMessage("Three fabric scraps combined into one usable piece of recycled fabric.");
  };
  const needleStages = ["lacey-needle-beach-clue","lacey-needle-shipwreck-clue","lacey-needle-found"];
  const needleStep = needleStages.filter(stage => state.crafted.includes(stage)).length;
  const searchNeedle = () => {
    if (needleStep >= 3) return;
    const stage = needleStages[needleStep];
    if (!craft(stage,[])) return;
    const lines = ["You find a silver thread tangled in a washed-up shell. The next clue points toward the Shipwreck.", "An old sewing basket among the shipwreck treasures holds a note: look inside Lacey’s pincushions.", "A tiny metallic chime rings out! You found Lacey’s lost embroidery needle. Return to the Bottles page to complete the quest."];
    setMessage(lines[needleStep]);playFile("sewing-reward.mp3");
  };
  const dailyNeedleSearch = () => {
    if (!state.questProgress.needleinthetides || needleSearchDate === today) return;
    const count = needleSearchCount + 1;
    const rare = Math.random();
    const reward = count % 7 === 0 ? "lacey-seashell-pattern" : rare < 0.06 ? "lacey-pearl-needle" : rare < 0.22 ? "lacey-embroidery-thread" : ["wind-fabric-scrap","hemp-thread","cotton-balls","ribbon"][Math.floor(Math.random()*4)];
    collectItem(reward,{silent:true});
    try {localStorage.setItem("shoreline-lacey-pin-search-date",today);localStorage.setItem("shoreline-lacey-pin-search-count",String(count));}catch{}
    setNeedleSearchDate(today);setNeedleSearchCount(count);
    playFile("sewing-reward.mp3");
    const pinName = pinChoice === "urchin" ? "Sea-Urchin" : pinChoice === "clam" ? "Clam-Shell" : "Starfish";
    setMessage("A delicate metallic chime rings from the "+pinName+" Pin Cushion! You found "+(ITEMS[reward]?.name || reward)+". Added to inventory. Search again tomorrow.");
  };
  const claim = () => {
    if (!pinUnlocked || lastClaim === today) return;
    const pool = ["wind-fabric-scrap","cotton-balls","hemp-thread","catnip","bird-feather"];
    const item = pool[Math.floor(Math.random()*pool.length)];
    collectItem(item,{silent:true});try{localStorage.setItem("shoreline-sewing-pin-daily",today);}catch{}
    setLastClaim(today);playFile("sewing-reward.mp3");setMessage("Seashell Pin Cushion: received one "+(ITEMS[item]?.name || item)+".");
  };
  return <section className="space-y-5 rounded-2xl bg-amber-50 p-3 text-teal-950" aria-label="Coastal Sewing Studio">
    <div className="relative h-64 overflow-hidden rounded-xl bg-sky-100 sm:h-96"><Image src={IMAGE_ROOT+"Sewing-corner-background.PNG"} alt="Coastal sewing room overlooking the sea" fill unoptimized className="object-cover" sizes="100vw" /></div>
    <div className="flex items-center gap-3 rounded-xl bg-white p-3"><div className="relative h-32 w-28 shrink-0"><Image src={IMAGE_ROOT+"Lacey.PNG"} alt="Lacey, mermaid seamstress holding an embroidery hoop" fill unoptimized className="object-contain" sizes="112px" /></div><div><h3 className="font-serif text-xl font-bold">Lacey's Sewing Studio</h3><p>Welcome! Choose any project and sew when you have enough supplies. Friendship and embroidery upgrades will arrive separately.</p></div></div>
    <section className="rounded-xl bg-white p-3 space-y-2" aria-label="Lacey friendship">
      <h3 className="font-bold">Lacey's Friendship</h3>
      <p>{giftCount} gifts given. Her favorite gifts are pink pearls, moonlit sea glass, frozen pineapple drinks, and rain lily blossoms.</p>
      <label htmlFor="lacey-gift" className="block font-medium">Choose a gift for Lacey</label>
      <select id="lacey-gift" className="w-full rounded border p-2" value={giftChoice} onChange={e=>setGiftChoice(e.target.value)}>
        {lacey.gift.lovedGiftIds.map(itemId=><option key={itemId} value={itemId}>{ITEMS[itemId]?.name || itemId} (have {state.inventory[itemId] || 0})</option>)}
      </select>
      <button type="button" disabled={!(state.inventory[giftChoice] > 0)} onClick={()=>{if(giftVillager("lacey",giftChoice)){markVillagerEncounter("lacey");setMessage("Lacey loves your gift! Your friendship has grown. Check your inventory for any milestone rewards.");}}} className="rounded-lg bg-teal-800 px-4 py-2 text-white disabled:opacity-50">Give Lacey a gift</button>
      <ul className="list-disc pl-5">{friendshipMilestones.map(([count,reward])=><li key={count}>{count} gifts: {reward} — {giftCount >= count ? "earned" : "not yet earned"}</li>)}</ul>
      <p className="text-sm">Friendship keepsakes prepare you for a future embroidery expansion. They do not restrict the original sewing projects.</p>
    </section>
    <p role="status" aria-live="polite" className="rounded-lg bg-white p-3">{message}</p>
    <section className="rounded-xl bg-white p-3 space-y-2" aria-label="The Needle in the Tides quest">
      <h3 className="font-bold">The Needle in the Tides</h3>
      <p>Read Lacey's bottle message on the Bottles page, then follow three clues to recover her missing embroidery needle.</p>
      <p>Clues discovered: {needleStep} of 3. {state.questProgress.needleinthetides ? "Quest completed." : needleStep===3 ? "Needle found! Return to the Bottles page to claim your reward." : "A clue is waiting."}</p>
      <button type="button" disabled={needleStep>=3 || !!state.questProgress.needleinthetides} onClick={searchNeedle} className="rounded-lg bg-teal-800 px-4 py-2 text-white disabled:opacity-50">{needleStep===0 ? "Search for a clue on the beach" : needleStep===1 ? "Search the shipwreck sewing basket" : "Search Lacey's pin cushions"}</button>
      <p className="text-sm">The special needle will enable decorative embroidery in a future studio expansion; it does not change the original project artwork.</p>
    </section>
    <section className="rounded-xl bg-white p-3 space-y-2" aria-label="Lacey's Lost Needle Search">
      <h3 className="font-bold">Lacey's Lost Needle Search</h3>
      <p>{state.questProgress.needleinthetides ? "Help Lacey find misplaced needles and sewing treasures. Choose one pin cushion to search each day. Every search gives a supply; rare embroidery discoveries are possible." : "Complete The Needle in the Tides bottle quest to unlock this optional daily search."}</p>
      {state.questProgress.needleinthetides && <>
        <fieldset className="space-y-2"><legend className="font-medium">Choose a pin cushion</legend>
          {([["urchin","Sea-Urchin Pin Cushion"],["clam","Clam-Shell Pin Cushion"],["starfish","Starfish Pin Cushion"]] as const).map(([value,label])=><label key={value} className="flex items-center gap-2"><input type="radio" name="lacey-search-pin" checked={pinChoice===value} onChange={()=>setPinChoice(value)} />{label}</label>)}
        </fieldset>
        <p>Searches completed: {needleSearchCount}. {needleSearchDate===today ? "Today's search is complete. Come back tomorrow." : "One search available today."}</p>
        <button type="button" disabled={needleSearchDate===today} onClick={dailyNeedleSearch} className="rounded-lg bg-teal-800 px-4 py-2 text-white disabled:opacity-50">{needleSearchDate===today ? "Today's search completed" : "Search selected pin cushion"}</button>
        <p className="text-sm">Every seventh search discovers a special seashell embroidery pattern. Rare thread and pearl-tipped needles may appear sooner. The pattern is a collectible for future embroidery customization.</p>
      </>}
    </section>
    <div className="rounded-xl bg-white p-3"><h3 className="font-bold">Recycle beach towels</h3><p>One washed-ashore towel makes two pieces of recycled fabric. Towels available: {state.inventory["washed-beach-towel"] || 0}.</p><button type="button" disabled={!state.inventory["washed-beach-towel"]} onClick={recycle} className="mt-2 rounded-lg bg-teal-800 px-4 py-2 text-white disabled:opacity-50">Cut towel into two fabric pieces</button></div>
    <div className="rounded-xl bg-white p-3"><h3 className="font-bold">Combine fabric scraps</h3><p>Three windblown fabric scraps make one piece of recycled fabric. Scraps available: {state.inventory["wind-fabric-scrap"] || 0}.</p><button type="button" disabled={(state.inventory["wind-fabric-scrap"] || 0) < 3} onClick={makeFabric} className="mt-2 rounded-lg bg-teal-800 px-4 py-2 text-white disabled:opacity-50">Combine three fabric scraps</button></div>
    <div className="rounded-xl bg-white p-3"><h3 className="font-bold">Magic Thimble</h3><div className="relative h-24 w-24"><Image src={IMAGE_ROOT+"magic-thimble.png"} alt="Pearl-decorated Magic Thimble" fill unoptimized className="object-contain" sizes="96px" /></div><p>{thimble ? "Choose a thread color. Finished project artwork stays unchanged for now." : "Complete the Coastal Sewing Materials page and collect your Magic Thimble from the Explorer\'s Notebook. The original project artwork stays unchanged."}</p><label htmlFor="sewing-thread" className="block font-medium">Thread color</label><select id="sewing-thread" value={thread} onChange={e=>setThread(e.target.value)} disabled={!thimble} className="w-full rounded border p-2">{THREADS.map(t=><option key={t}>{t}</option>)}</select></div>
    <div className="rounded-xl bg-white p-3"><h3 className="font-bold">Sewing projects</h3><label htmlFor="sewing-project" className="block">Choose a project</label><select id="sewing-project" value={selected} onChange={e=>setSelected(e.target.value)} className="w-full rounded border p-2">{PROJECTS.map(([p,n])=><option value={p} key={p}>{n}</option>)}</select>
    <div className="relative mx-auto my-3 h-48 max-w-xs"><Image src={IMAGE_ROOT+id+".png"} alt={name+" finished project artwork"} fill unoptimized className="object-contain" sizes="320px" /></div>
    <p>Materials: {cost.map(c=>c.count+" "+(ITEMS[c.itemId]?.name || c.itemId)+" (have "+(state.inventory[c.itemId] || 0)+")").join(", ")}.</p>
    <p>{state.crafted.includes("sewing-"+id) ? "Completed at least once." : "Not yet completed."}</p>
    <button type="button" onClick={sew} disabled={!hasEnough(cost)} className="mt-2 rounded-lg bg-teal-800 px-4 py-2 text-white disabled:opacity-50">Sew {name}</button></div>
    <div className="rounded-xl bg-white p-3"><h3 className="font-bold">Seashell Pin Cushion</h3><div className="relative h-24 w-24"><Image src={IMAGE_ROOT+"seashell-pin-cushion.png"} alt="Seashell Pin Cushion with sewing pins" fill unoptimized className="object-contain" sizes="96px" /></div><p>Projects completed: {PROJECTS.filter(([p])=>state.crafted.includes("sewing-"+p)).length} of {PROJECTS.length}. Finish each project once to earn the Seashell Pin Cushion, then collect one free sewing supply daily.</p>{allMade && !pinUnlocked && <button type="button" onClick={claimPin} className="mt-2 rounded-lg bg-teal-800 px-4 py-2 text-white">Collect Seashell Pin Cushion reward</button>}{pinUnlocked && <p>Seashell Pin Cushion unlocked and added to inventory.</p>}<button type="button" disabled={!pinUnlocked || lastClaim===today} onClick={claim} className="mt-2 rounded-lg bg-teal-800 px-4 py-2 text-white disabled:opacity-50">{!pinUnlocked ? "Earn the Seashell Pin Cushion first" : lastClaim===today ? "Today's supply collected" : "Collect today's sewing supply"}</button></div>
  </section>;
}
