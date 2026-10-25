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
  "christmas-rose":"glowing-roses.png", "snowdrop-flowers":"snowdrop-flowers.png",
  "tropical-hibiscus":"glowing-roses.png", "summer-hibiscus":"glowing-roses.png",
  "spring-edible-blossoms":"seaside-daisy.png"
};
const SIZES = { small:3, medium:6, large:10 } as const;
type Size = keyof typeof SIZES;
type Stem = { id:string; slot:number };
const POSITIONS = [
 {name:"Back left",x:31,y:25,angle:-26,scale:.86},
 {name:"Back center",x:50,y:18,angle:0,scale:.91},
 {name:"Back right",x:69,y:25,angle:26,scale:.86},
 {name:"Middle left",x:35,y:37,angle:-18,scale:.94},
 {name:"Middle right",x:65,y:37,angle:18,scale:.94},
 {name:"Middle center",x:50,y:35,angle:0,scale:1},
 {name:"Front left",x:35,y:48,angle:-12,scale:.88},
 {name:"Front right",x:65,y:48,angle:12,scale:.88},
 {name:"Outer left",x:22,y:39,angle:-38,scale:.85},
 {name:"Outer right",x:78,y:39,angle:38,scale:.85}
];
function sound(file:string) { try { const a = new Audio("/audio/"+file); a.volume=.5; void a.play().catch(()=>{}); } catch {} }
export default function FlowerArranging() {
 const {state}=useGame();
 const [size,setSize]=useState<Size>("small");
 const [vase,setVase]=useState("");
 const [stems,setStems]=useState<Stem[]>([]);
 const [message,setMessage]=useState("");
 const vases=Object.keys(state.inventory).filter(id=>(id==="flower-vase" || id==="pearl-vase" || id.startsWith("flower-vase--") || id.startsWith("pearl-vase--")) && state.inventory[id]>0 && ITEMS[id]);
 const flowers=Object.keys(FLOWERS).filter(id=>ITEMS[id] && state.inventory[id]>0);
 const [preview,setPreview]=useState(false);
 const move=(index:number,slot:number)=>{setStems(old=>old.map((stem,i)=>i===index?{...stem,slot}:stem.slot===slot?{...stem,slot:old[index].slot}:stem));setPreview(false);};
 const bouquet=(compact:boolean)=> <div className={compact?"relative mx-auto h-52 w-full max-w-xs":"relative mx-auto h-80 w-full max-w-sm"} aria-label={stems.length?stems.map(s=>ITEMS[s.id]?.name+" at "+POSITIONS[s.slot].name).join("; "):"Empty bouquet"}>
 {stems.map((stem,i)=>{const p=POSITIONS[stem.slot];return <Image key={i} src={ROOT+FLOWERS[stem.id]} alt="" width={160} height={230} unoptimized className="absolute h-[66%] w-[38%] object-contain" style={{left:p.x+"%",top:p.y+"%",transform:`translate(-50%, -10%) rotate(${p.angle}deg) scale(${p.scale})`,transformOrigin:"50% 85%",zIndex:p.y<30?2:p.y<45?4:6}}/>})}
 {vase && <Image src={ITEMS[vase].icon} alt="" width={180} height={160} unoptimized className="absolute bottom-[1%] left-1/2 h-[42%] w-[48%] -translate-x-1/2 object-contain" style={{zIndex:10}}/>}
 </div>;
 const used=(id:string)=>stems.filter(s=>s.id===id).length;
 const add=(id:string)=>{if(stems.length>=SIZES[size] || used(id)>=(state.inventory[id]||0))return;setStems(p=>[...p,{id,slot:p.length}]);sound("Flower-placement.mp3");setPreview(false);setMessage(ITEMS[id].name+" added.");};
 const finish=()=>{if(!vase || !stems.length)return;setPreview(true);sound("Flower-arrangement-complete.mp3");setMessage("Arrangement preview complete! No materials have been consumed. Saving, gifting and selling will be connected in the next phase.");};
 return <section aria-label="Flower arranging studio" className="space-y-4">
 <h2 className="font-serif text-2xl font-bold">Flower Arranging Studio</h2>
 <p>Choose a vase and place flowers from your inventory. You can undo or rearrange stems before previewing. This first version does not consume inventory.</p>
 <div className="relative overflow-hidden rounded-xl bg-rose-100"><Image src={ROOT+"Flower-shop-background.PNG"} alt="Flower shop arranging counter" width={900} height={600} unoptimized className="w-full object-contain"/><div className="absolute inset-x-[18%] bottom-[5%] flex justify-center">{bouquet(true)}</div></div>
 <section aria-label="Bouquet close-up preview" className="rounded-xl border border-rose-300 bg-white p-3"><h3 className="font-bold">Your bouquet — live preview</h3><p className="text-sm">Choose positions below to change how the stems overlap. Your flowers stay in the vase.</p><div className="mt-2 overflow-hidden rounded-xl bg-gradient-to-b from-sky-50 to-rose-100">{bouquet(false)}</div>{preview && <p role="status" className="mt-2 font-semibold">Finished arrangement preview: {stems.map(x=>ITEMS[x.id]?.name).join(", ")} in {ITEMS[vase]?.name}.</p>}</section>
 <label className="block font-bold" htmlFor="flower-size">Bouquet size</label>
 <select id="flower-size" value={size} onChange={e=>{setSize(e.target.value as Size);setStems([]);}} className="min-h-11 w-full rounded-lg border p-2">{Object.entries(SIZES).map(([name,n])=><option key={name} value={name}>{name} — {n} stems</option>)}</select>
 <label className="block font-bold" htmlFor="flower-vase">Choose a vase</label>
 <select id="flower-vase" value={vase} onChange={e=>setVase(e.target.value)} className="min-h-11 w-full rounded-lg border p-2"><option value="">Select a vase</option>{vases.map(id=><option key={id} value={id}>{ITEMS[id].name} ({state.inventory[id]})</option>)}</select>
 {!vases.length && <p>No flower vases in inventory. Craft one in the pottery studio or purchase one when available.</p>}
 <h3 className="font-bold">Flowers available — {stems.length}/{SIZES[size]} placed</h3>
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{flowers.map(id=><button key={id} type="button" disabled={stems.length>=SIZES[size]||used(id)>=state.inventory[id]} onClick={()=>add(id)} className="min-h-11 rounded-xl border bg-white p-2 text-left disabled:opacity-50"><Image src={ROOT+FLOWERS[id]} alt="" width={72} height={72} unoptimized className="mx-auto h-20 object-contain"/><span className="block text-sm font-semibold">{ITEMS[id].name} · {state.inventory[id]-used(id)} left</span></button>)}</div>
 {!flowers.length && <p>Harvest flowers in the Coconut Grove or Coralie's garden to begin.</p>}
 <h3 className="font-bold">Arrange individual stems</h3>
 <p className="text-sm">Choose a position for each flower. Selecting an occupied position swaps the two flowers. Each position changes its angle and layering.</p>
 <ol className="space-y-2">{stems.map((stem,i)=><li key={i} className="rounded-lg bg-white p-3"><div className="flex items-center justify-between gap-2"><span className="font-semibold">{i+1}. {ITEMS[stem.id]?.name}</span><button type="button" onClick={()=>{setStems(p=>p.filter((_,j)=>j!==i));setPreview(false);}} className="min-h-11 rounded bg-stone-200 px-3">Remove</button></div><label htmlFor={`flower-position-${i}`} className="mt-2 block text-sm font-semibold">Position</label><select id={`flower-position-${i}`} value={stem.slot} onChange={e=>move(i,Number(e.target.value))} className="min-h-11 w-full rounded-lg border p-2">{POSITIONS.map((p,j)=><option key={p.name} value={j}>{p.name}</option>)}</select></li>)}</ol>
 <p role="status" aria-live="polite">{message}</p>
 <button type="button" disabled={!vase||!stems.length} onClick={finish} className="min-h-11 rounded-xl bg-rose-800 px-5 py-3 font-bold text-white disabled:opacity-50">Preview finished arrangement</button>
 </section>;
}
