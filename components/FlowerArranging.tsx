"use client";
import { useState } from "react";
import Image from "next/image";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";

const ROOT = "/images/Flower shop/";
const FLOWERS: Record<string,string> = {
  "flower-beach-rose":"beach-rose.png", "flower-sea-holly":"sea-holly.png",
  "flower-seaside-daisy":"seaside-daisy.png", "flower-coastal-sunflower":"coastal-sunflower.png",
  "flower-dune-evening-primrose":"dune-evening-primrose.png", "flower-saltmarsh-mallow":"saltmarsh-mallow.png",
  "flower-sea-morning-glory":"sea-morning-glory.png", "shelldon-moon-tide-blossom":"moon-tide-blossom.png",
  "sea-lavender":"sea-lavender.png", "rain-lily-blossom":"rain-lily-blossom.png",
  "plant-radiant-moonflower":"radiant-moonflower.png", "plant-twinkle-star-flower":"twinkle-star-flower.png",
  "plant-glowing-roses":"glowing-roses.png", "island-vanilla-orchid":"island-vanilla-orchid.png",
  "christmas-rose":"glowing-roses.png", "snowdrop-flowers":"snowdrop-flowers.png"
};
const SIZES = { small:3, medium:6, large:10 } as const;
type Size = keyof typeof SIZES;
type Stem = { id:string; slot:number };
const POSITIONS = [{left:18,top:29},{left:50,top:15},{left:80,top:29},{left:32,top:45},{left:66,top:45},{left:50,top:36},{left:12,top:52},{left:87,top:52},{left:38,top:12},{left:65,top:12}];
function sound(file:string) { try { const a = new Audio("/audio/"+file); a.volume=.5; void a.play().catch(()=>{}); } catch {} }
export default function FlowerArranging() {
 const {state,craft}=useGame();
 const [size,setSize]=useState<Size>("small");
 const [vase,setVase]=useState("");
 const [stems,setStems]=useState<Stem[]>([]);
 const [message,setMessage]=useState("");
 const vases=Object.keys(state.inventory).filter(id=>(id==="flower-vase" || id==="pearl-vase" || id.startsWith("flower-vase--") || id.startsWith("pearl-vase--")) && state.inventory[id]>0 && ITEMS[id]);
 const flowers=Object.keys(FLOWERS).filter(id=>ITEMS[id] && state.inventory[id]>0);
 const used=(id:string)=>stems.filter(s=>s.id===id).length;
 const add=(id:string)=>{if(stems.length>=SIZES[size] || used(id)>=(state.inventory[id]||0))return;setStems(p=>[...p,{id,slot:p.length}]);sound("Flower-placement.mp3");setMessage(ITEMS[id].name+" added.");};
 const finish=()=>{if(!vase || !stems.length)return; const counts=new Map<string,number>();for(const s of stems)counts.set(s.id,(counts.get(s.id)||0)+1); const materials=[{itemId:vase,count:1},...Array.from(counts,([itemId,count])=>({itemId,count}))];if(!craft("flower-arrangement",materials)){setMessage("Unable to finish; check materials.");return;}sound("Flower-arrangement-complete.mp3");setStems([]);setVase("");setMessage("Arrangement completed! Materials used. A collectible arrangement and gifting/selling will be added in the next phase.");};
 return <section aria-label="Flower arranging studio" className="space-y-4">
 <h2 className="font-serif text-2xl font-bold">Flower Arranging Studio</h2>
 <p>Choose a vase and place flowers from your inventory. You can undo or rearrange stems before finishing.</p>
 <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-rose-100">
 <Image src={ROOT+"Flower-shop-background.PNG"} alt="Flower arranging studio interior" fill unoptimized className="object-contain"/>
 {stems.map((s,i)=>{const p=POSITIONS[s.slot];return <Image key={i} src={ROOT+FLOWERS[s.id]} alt="" width={90} height={120} unoptimized className="absolute h-[33%] w-[18%] object-contain" style={{left:p.left+"%",top:p.top+"%",transform:"translate(-50%,-30%)"}}/>})}
 {vase && <Image src={ITEMS[vase].icon} alt="" width={130} height={130} unoptimized className="absolute bottom-[5%] left-1/2 h-[32%] w-[25%] -translate-x-1/2 object-contain"/>}
 </div>
 <label className="block font-bold" htmlFor="flower-size">Bouquet size</label>
 <select id="flower-size" value={size} onChange={e=>{setSize(e.target.value as Size);setStems([]);}} className="min-h-11 w-full rounded-lg border p-2">{Object.entries(SIZES).map(([name,n])=><option key={name} value={name}>{name} — {n} stems</option>)}</select>
 <label className="block font-bold" htmlFor="flower-vase">Choose a vase</label>
 <select id="flower-vase" value={vase} onChange={e=>setVase(e.target.value)} className="min-h-11 w-full rounded-lg border p-2"><option value="">Select a vase</option>{vases.map(id=><option key={id} value={id}>{ITEMS[id].name} ({state.inventory[id]})</option>)}</select>
 {!vases.length && <p>No flower vases in inventory. Craft one in the pottery studio or purchase one when available.</p>}
 <h3 className="font-bold">Flowers available — {stems.length}/{SIZES[size]} placed</h3>
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{flowers.map(id=><button key={id} type="button" disabled={stems.length>=SIZES[size]||used(id)>=state.inventory[id]} onClick={()=>add(id)} className="min-h-11 rounded-xl border bg-white p-2 text-left disabled:opacity-50"><Image src={ROOT+FLOWERS[id]} alt="" width={72} height={72} unoptimized className="mx-auto h-20 object-contain"/><span className="block text-sm font-semibold">{ITEMS[id].name} · {state.inventory[id]-used(id)} left</span></button>)}</div>
 {!flowers.length && <p>Harvest flowers in the Coconut Grove or Coralie's garden to begin.</p>}
 <h3 className="font-bold">Arrangement positions</h3>
 <ol className="space-y-2">{stems.map((s,i)=><li key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-2"><span className="flex-1">{i+1}. {ITEMS[s.id]?.name}</span><button type="button" disabled={i===0} onClick={()=>setStems(p=>p.map((x,j)=>j===i?{...x,slot:Math.max(0,x.slot-1)}:j===i-1?{...x,slot:x.slot+1}:x))} className="min-h-11 rounded bg-rose-100 px-2">Move left</button><button type="button" disabled={i===stems.length-1} onClick={()=>setStems(p=>p.map((x,j)=>j===i?{...x,slot:Math.min(9,x.slot+1)}:j===i+1?{...x,slot:x.slot-1}:x))} className="min-h-11 rounded bg-rose-100 px-2">Move right</button><button type="button" onClick={()=>setStems(p=>p.filter((_,j)=>j!==i).map((x,j)=>({...x,slot:j})))} className="min-h-11 rounded bg-stone-200 px-2">Remove</button></li>)}</ol>
 <p role="status" aria-live="polite">{message}</p>
 <button type="button" disabled={!vase||!stems.length} onClick={finish} className="min-h-11 rounded-xl bg-rose-800 px-5 py-3 font-bold text-white disabled:opacity-50">Finish arrangement</button>
 </section>;
}
