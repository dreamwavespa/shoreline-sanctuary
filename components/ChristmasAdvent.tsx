"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "../lib/store";

const ORNAMENTS = ["Starfish_Pearls","Pink_Scallop_Shell","Sand_Dollar","Lighthouse_Globe","Crystal_Snowflake","Christmas_Whale","Maeve_Teacup","Maeve_Teapot","Lobster_Trap","Marshmallow_Cat","Seahorse","Shelby_Turtle","Elly_Jellyfish","Libby_Lobster","Olli_Octopus","Sailboat","Snowy_Cottage_Globe","Starfish_Lantern","Binoculars","Archie_Books","Sea_Glass_Jar","Rope_Anchor","Ice_Skate","Coastal_Wreath","Seashell_Bell","Moonlit_Crescent","Nautilus_Shell","Robin_Bird","Snowy_Lantern","Christmas_Present"];
const BASE = "/images/Christmas/";
const rewards = [{"itemId":"glowing-wax","name":"Glowing Wax"},{"itemId":"dried-sugar-berries","name":"Dried Sugar Berries"},{"itemId":"advent-fabric-scraps","name":"Fabric Scraps"},{"itemId":"chocolate-seashells","name":"Chocolate Seashells"},{"itemId":"advent-snowflake-pearls","name":"Snowflake Pearls"},{"itemId":"advent-cookies-milk-recipe","name":"Cookies and Milk Recipe"},{"itemId":"advent-sea-glitter","name":"Sea Glitter"},{"itemId":"white-porcelain-clay","name":"White Porcelain Clay"},{"itemId":"advent-fluffy-pompoms","name":"Fluffy Pompoms"},{"itemId":"ice-cream-topping-candy-seashells","name":"Candy Seashells Ice Cream Topping"},{"itemId":"marshmallow-snowflake","name":"Snowflake Marshmallow"},{"itemId":"advent-christmas-cupcake","name":"Christmas Cupcake"},{"itemId":"glowing-wax","name":"Glowing Wax"},{"itemId":"dried-sugar-berries","name":"Dried Sugar Berries"},{"itemId":"advent-snowflake-pearls","name":"Snowflake Pearls"},{"itemId":"advent-lighthouse-bookmark","name":"Lighthouse Winter Bookmark"},{"itemId":"advent-fabric-scraps","name":"Fabric Scraps"},{"itemId":"chocolate-seashells","name":"Chocolate Seashells"},{"itemId":"white-porcelain-clay","name":"White Porcelain Clay"},{"itemId":"advent-snowball-mold","name":"Snowball Mold"},{"itemId":"advent-snowflake-stocking","name":"Fluffy Snowflake Stocking"},{"itemId":"marshmallow-snowflake","name":"Snowflake Marshmallow"},{"itemId":"ice-cream-topping-candy-seashells","name":"Candy Seashells Ice Cream Topping"},{"itemId":"advent-sea-glitter","name":"Sea Glitter"},{"itemId":"advent-christmas-surprise","name":"Christmas Surprise Bundle"}];
const giftImages = ["Cookies-and-Milk.png","Christmas-Cupcake.png","Lighthouse-Winter-Bookmark.png","Fluffy-Snowflake-Stocking.png","Snowball-Mold.png","Christmas-Surprise-Bundle.png","Snowflake-Pearls.png","Fluffy-Pompoms.png","Fabric-Scraps.png"];
type Progress = { opened: number[]; placed: Record<string,number> };
const empty = (): Progress => ({opened:[],placed:{}});
const slots = Array.from({length:30},(_,i)=>({left: 34+(i%5)*8, top: 17+Math.floor(i/5)*11}));
function key(preview:boolean,year:number){return `shoreline-advent-${preview?"preview":"real"}-${year}`;}
export default function ChristmasAdvent({ musicEnabled = true, onMusicChange }: { musicEnabled?: boolean; onMusicChange?: (enabled:boolean)=>void }) {
 const soundsRef = useRef<HTMLAudioElement[]>([]);
 const playSound = (filename:string, volume=0.45) => {
   try {
     const sound = new Audio(`/audio/${filename}`);
     sound.volume = volume;
     soundsRef.current.push(sound);
     sound.addEventListener("ended", () => { soundsRef.current = soundsRef.current.filter(a => a !== sound); }, { once:true });
     void sound.play().catch(() => {});
   } catch {}
 };
 useEffect(() => () => { soundsRef.current.forEach(a => { a.pause(); a.currentTime = 0; }); soundsRef.current = []; }, []);
 const { collectItem } = useGame();
 const [preview,setPreview]=useState(false);
 const [progress,setProgress]=useState<Progress>(empty);
 const [selected,setSelected]=useState<number|null>(null);
 const [message,setMessage]=useState("");
 const [now,setNow]=useState<Date|null>(null);
 const [memories,setMemories]=useState<Record<string,Progress>>({});
 const [showBook,setShowBook]=useState(false);
 useEffect(()=>{setNow(new Date());try{setMemories(JSON.parse(localStorage.getItem("shoreline-christmas-memory-book")||"{}"));}catch{}},[]);
 const year=now?.getFullYear()||2026;
 useEffect(()=>{try{setProgress(JSON.parse(localStorage.getItem(key(preview,year))||"null")||empty());}catch{setProgress(empty());}setSelected(null);setMessage("");},[preview,year]);
 const save=(next:Progress)=>{setProgress(next);try{localStorage.setItem(key(preview,year),JSON.stringify(next));}catch{setMessage("Unable to save on this device.");}};
 const month=now?.getMonth();const day=now?.getDate()||0;
 const active=month===11 && day<=31;
 const open=(d:number)=>{if(!preview && (!active||d>day)){setMessage("This present is not available yet.");return;}if(progress.opened.includes(d)){setMessage(`December ${d}. Gift already opened. You received ${rewards[d-1].name} and the ${ORNAMENTS[d-1].replaceAll("_"," ")} ornament.`);return;}const reward=rewards[d-1];playSound("Advent-Wrapping-Paper.mp3",0.3);playSound(d===25||[6,12,16,20,21].includes(d)?"Advent-Sleigh-Bells.mp3":"Advent-Magic-Reveal.mp3",0.35);if(!preview)collectItem(reward.itemId,{silent:true});save({...progress,opened:[...progress.opened,d]});setMessage(`December ${d}. You've received ${reward.name} and the ${ORNAMENTS[d-1].replaceAll("_"," ")} ornament! ${preview?"Preview only. No items added to your real inventory.":"The reward has been added to your inventory."} Select the ornament below to decorate your tree.`);};
 const place=(slot:number)=>{if(selected===null){const occupant=Object.entries(progress.placed).find(([,v])=>v===slot);setMessage(occupant?`Branch ${slot+1} has the ${ORNAMENTS[Number(occupant[0])].replaceAll("_"," ")} ornament. Select an ornament below to change it.`:`Branch ${slot+1} is empty. Select an ornament below to place it.`);return;}const placed={...progress.placed};for(const [k,v] of Object.entries(placed)){if(v===slot)delete placed[k];}placed[String(selected)]=slot;save({...progress,placed});setMessage(`${ORNAMENTS[selected].replaceAll("_"," ")} placed on branch ${slot+1}.`);};
 const archive=()=>{if(preview){setMessage("Preview trees cannot be saved to the real Christmas Memory Book.");return;}const next={...memories,[String(year)]:progress};setMemories(next);try{localStorage.setItem("shoreline-christmas-memory-book",JSON.stringify(next));}catch{}setMessage(`Christmas tree saved to the ${year} Memory Book.`);};
 const claimed=progress.opened.length;
 return <section className="mx-auto max-w-5xl text-amber-50">
  <h2 className="text-2xl font-bold">Shoreline Christmas Advent Tree</h2>
  {onMusicChange&&<button type="button" aria-pressed={musicEnabled} onClick={()=>onMusicChange(!musicEnabled)} className="my-2 rounded-lg border border-amber-200 px-4 py-2">Christmas music: {musicEnabled?"On":"Off"}</button>}
  <p className="my-2">Open presents from December 1–25, including missed days through December 31, then decorate your tree. {claimed} of 25 gifts opened.</p>
  <label className="my-3 flex items-center gap-3"><input type="checkbox" checked={preview} onChange={e=>setPreview(e.target.checked)} className="h-5 w-5"/> Christmas Preview Mode (testing only)</label>
  {preview&&<p className="mb-2 text-yellow-200">Preview mode: all dates are unlocked. Progress is separate from the real Advent calendar.</p>}
  <div className="relative mx-auto w-full aspect-video overflow-hidden rounded-xl bg-indigo-950">
   <img src={BASE+"Christmas-tree-interactive.PNG"} alt="Snowy coastal Christmas tree with warm lights and a starfish star" className="absolute inset-0 h-full w-full object-contain"/>
   {slots.map((s,i)=><button key={i} type="button" onClick={()=>place(i)} aria-label={(()=>{const occupant=Object.entries(progress.placed).find(([,v])=>v===i);return occupant?`Branch ${i+1}, ${ORNAMENTS[Number(occupant[0])].replaceAll("_"," ")} ornament${selected!==null?". Select to replace.":". Select to hear details."}`:`Branch ${i+1}, empty${selected!==null?". Select to place ornament.":". Select an ornament first."}`;})()} className="absolute h-[8%] w-[7%] rounded-full border border-transparent focus-visible:border-yellow-300 focus-visible:bg-yellow-300/30 disabled:cursor-default" style={{left:s.left+"%",top:s.top+"%"}}/>)}
   {Object.entries(progress.placed).map(([id,slot])=>{const s=slots[slot];return s?<img key={id} src={BASE+"Ornaments/Ornament_"+String(Number(id)+1).padStart(2,"0")+"_"+ORNAMENTS[Number(id)]+".png"} alt="" className="pointer-events-none absolute h-[9%] w-[8%] object-contain" style={{left:s.left+"%",top:s.top+"%"}}/>:null;})}
  </div>
  <p className="mt-3">Choose an ornament below, then select one of the 30 tree branches. Branches can be changed at any time.</p>
  <div className="my-3 grid grid-cols-5 gap-2 sm:grid-cols-10">{Array.from({length:25},(_,i)=>{const d=i+1;const opened=progress.opened.includes(d);const locked=!preview&&(!active||d>day);return <button key={d} type="button" disabled={locked||opened} onClick={()=>open(d)} aria-label={`December ${d}: ${opened?`opened. ${rewards[d-1].name} and ${ORNAMENTS[d-1].replaceAll("_"," ")} ornament`:locked?"locked":"unopened gift. Available to open"}`} className="min-h-12 rounded-lg border border-amber-300 bg-rose-900 p-2 font-semibold disabled:opacity-60"><img src={BASE+"Gifts/"+giftImages[i%giftImages.length]} alt="" className="mx-auto h-10 w-10 object-contain"/><span>{d}{opened?" ✓":""}</span></button>;})}</div>
  <h3 className="text-xl font-bold">Collected ornaments</h3>
  <div className="my-3 grid grid-cols-3 gap-2 sm:grid-cols-5">{ORNAMENTS.map((name,i)=>{const unlocked=progress.opened.includes(i+1)||preview&&i>=25;return <button key={name} disabled={!unlocked} onClick={()=>{setSelected(i);setMessage(`${name.replaceAll("_"," ")} selected. Choose a tree branch.`);}} aria-pressed={selected===i} className="rounded-lg border border-amber-300 bg-indigo-900 p-2 disabled:opacity-40 aria-pressed:ring-4 aria-pressed:ring-yellow-300"><img src={BASE+"Ornaments/Ornament_"+String(i+1).padStart(2,"0")+"_"+name+".png"} alt="" className="mx-auto h-16 w-16 object-contain"/><span className="text-xs">{name.replaceAll("_"," ")}</span></button>;})}</div>
  <p role="status" aria-live="polite" className="my-3 min-h-8">{message}</p>
  <div className="flex flex-wrap gap-3">
   <button type="button" onClick={()=>setShowBook(!showBook)} className="rounded-lg bg-amber-100 px-4 py-3 font-semibold text-indigo-950">Christmas Memory Book</button>
   {(!preview&&month===11&&day>=25)&&<button type="button" onClick={archive} className="rounded-lg bg-amber-100 px-4 py-3 font-semibold text-indigo-950">Save tree to Memory Book</button>}
   {preview&&<button type="button" onClick={()=>{if(window.confirm("Reset preview gifts and ornaments?")){save(empty());setMessage("Preview progress reset.");}}} className="rounded-lg border border-amber-200 px-4 py-3">Reset preview only</button>}
  </div>
  {showBook&&<div className="mt-4 rounded-lg border border-amber-200 p-4"><h3 className="font-bold">Christmas Memory Book</h3>{Object.entries(memories).length===0?<p>No trees saved yet.</p>:Object.entries(memories).map(([y,p])=><p key={y}>{y}: {p.opened.length} gifts opened, {Object.keys(p.placed).length} ornaments placed.</p>)}</div>}
 </section>;
}
