"use client";

import Image from "next/image";
import { useGame } from "@/lib/store";
import { useEffect, useState } from "react";

type Part = "baseBall" | "middleBall" | "headBall" | "snowball" | "body" | "eyes" | "nose" | "mouth" | "arms" | "hat" | "scarf" | "buttons" | "accessory";
type Choice = { name: string; file: string };
type Snowman = Record<Part, string>;
const ROOT = "/images/Winter/Snowman/";
const PARTS: { key: Part; label: string; options: Choice[] }[] = [
  { key: "body", label: "Snowballs and body", options: [
    {name:"Three snowball body",file:"Three_Ball_Snowman_Base.png"},{name:"Two snowball body",file:"Two_Ball_Snowman_Base.png"},

  ] },
  { key: "baseBall", label: "Base snowball", options: [{name:"Large snowball",file:"Large_Snowball.png"},{name:"Medium snowball",file:"Medium_Snowball.png"},{name:"Small snowball",file:"Small_Snowball.png"}] },
  { key: "middleBall", label: "Middle snowball", options: [{name:"Medium snowball",file:"Medium_Snowball.png"},{name:"Large snowball",file:"Large_Snowball.png"},{name:"Small snowball",file:"Small_Snowball.png"}] },
  { key: "headBall", label: "Head snowball", options: [{name:"Small snowball",file:"Small_Snowball.png"},{name:"Medium snowball",file:"Medium_Snowball.png"},{name:"Large snowball",file:"Large_Snowball.png"}] },
  { key: "snowball", label: "Extra snowballs", options: [
    {name:"Large snowball",file:"Large_Snowball.png"},{name:"Medium snowball",file:"Medium_Snowball.png"},{name:"Small snowball",file:"Small_Snowball.png"},
  ] },
  { key: "eyes", label: "Eyes", options: [
    {name:"Black coal eyes",file:"Black_Coal_Eyes.png"},{name:"Blue eyes",file:"Blue_Eyes.png"},
    {name:"Heart eyes",file:"Brown_Heart_Eyes.png"},{name:"Blue gem eyes",file:"Blue_Gem_Eyes.png"},
    {name:"Wooden button eyes",file:"Wood_Button_Eyes.png"},
  ] },
  { key: "nose", label: "Nose", options: [
    {name:"Carrot",file:"Carrot_Nose.png"},{name:"Twig",file:"Twig_Nose.png"},{name:"Scallop shell",file:"Scallop_Shell_Nose.png"},
    {name:"Starfish",file:"Starfish_Nose.png"},{name:"Pebble",file:"Pebble_Nose.png"},{name:"Pink heart",file:"Pink_Heart_Nose.png"},
  ] },
  { key: "mouth", label: "Mouth", options: [
    {name:"Coal smile",file:"Coal_Smile.png"},{name:"Twig smile",file:"Twig_Smile.png"},
    {name:"Golden pearl smile",file:"Golden_Pearl_Smile.png"},{name:"Heart mouth",file:"Heart_Mouth.png"},
  ] },
  { key: "arms", label: "Arms", options: [
    {name:"Plain twig arms",file:"Plain_Twig_Arms.png"},{name:"Berry twig arms",file:"Berry_Twig_Arms.png"},
    {name:"Blue mitten arms",file:"Blue_Mitten_Arms.png"},{name:"Starfish twig arms",file:"Starfish_Twig_Arms.png"},
  ] },
  { key: "hat", label: "Hat", options: [
    {name:"Blue snowflake beanie",file:"Blue_Snowflake_Beanie.png"},{name:"Lavender beanie",file:"Lavender_Beanie.png"},
    {name:"Red plaid cap",file:"Red_Plaid_Cap.png"},{name:"Black top hat",file:"Black_Top_Hat.png"},
    {name:"Straw beach hat",file:"Straw_Beach_Hat.png"},{name:"Santa hat",file:"Santa_Hat.png"},
    {name:"Purple flower beret",file:"Purple_Flower_Beret.png"},
  ] },
  { key: "scarf", label: "Scarf", options: [
    {name:"Blue snowflake scarf",file:"Blue_Snowflake_Scarf.png"},{name:"Lavender scarf",file:"Lavender_Scarf.png"},
    {name:"Red plaid scarf",file:"Red_Plaid_Scarf.png"},{name:"Ivory knit scarf",file:"Ivory_Knit_Scarf.png"},
    {name:"Aqua knit scarf",file:"Aqua_Knit_Scarf.png"},{name:"Pink knit scarf",file:"Pink_Knit_Scarf.png"},
  ] },
  { key: "buttons", label: "Buttons", options: [
    {name:"Wooden button",file:"Wooden_Button.png"},{name:"Heart button",file:"Heart_Button.png"},
    {name:"Scallop button",file:"Scallop_Button.png"},{name:"Snowflake button",file:"Snowflake_Button.png"},
    {name:"Sand dollar button",file:"Sand_Dollar_Button.png"},{name:"Blue gem button",file:"Blue_Gem_Button.png"},
  ] },
  { key: "accessory", label: "Accessory", options: [
    {name:"Mini lantern",file:"Mini_Lantern.png"},{name:"Golden anchor",file:"Golden_Anchor.png"},
    {name:"Seashell",file:"Seashell.png"},{name:"Starfish",file:"Starfish.png"},
    {name:"Toy sailboat",file:"Toy_Sailboat.png"},{name:"Robin bird",file:"Robin_Bird.png"},
    {name:"Snowball basket",file:"Snowball_Basket.png"},{name:"Wooden sled",file:"Wooden_Sled.png"},
    {name:"Snow shovel",file:"Snow_Shovel.png"},{name:"Seagull",file:"Seagull.png"},
    {name:"Winter lantern",file:"Lantern.png"},{name:"Holly and pinecone",file:"Holly_Pinecone.png"},
    {name:"Icicle snowflake",file:"Icicle_Snowflake.png"},{name:"Pink scallop shell",file:"Pink_Scallop_Shell.png"},
    {name:"Snowflake",file:"Snowflake.png"},
  ] },
];
const DEFAULT: Snowman = {baseBall:"",middleBall:"",headBall:"",snowball:"",body:"",eyes:"",nose:"",mouth:"",arms:"",hat:"",scarf:"",buttons:"",accessory:""};
type Rect = {left:number;top:number;width:number;height:number};
const rect=(left:number,top:number,width:number,height:number):Rect=>({left,top,width,height});
const BALL_RECTS: Record<"baseBall"|"middleBall"|"headBall",Rect> = {
  baseBall:rect(29,61,42,28),middleBall:rect(34,45,32,23),headBall:rect(39,31,22,19),
};
const BALL_SCALE: Record<string,number> = {Large_Snowball:1,Medium_Snowball:0.82,Small_Snowball:0.67};
const ballSize=(file:string)=>Object.entries(BALL_SCALE).find(([name])=>file.startsWith(name))?.[1]||1;
function centered(rectangle:Rect,scale:number):Rect {
  return rect(rectangle.left+rectangle.width*(1-scale)/2,rectangle.top+rectangle.height*(1-scale)/2,rectangle.width*scale,rectangle.height*scale);
}
function snowmanLayout(parts:Snowman):Record<Part,Rect>{
  const custom=!parts.body && !!(parts.baseBall||parts.middleBall||parts.headBall);
  const layout={} as Record<Part,Rect>;
  layout.body=rect(23,23,54,68);
  layout.snowball=rect(13,77,23,17);
  if(custom){
    for(const part of ["baseBall","middleBall","headBall"] as const){
      layout[part]=centered(BALL_RECTS[part],ballSize(parts[part]));
    }
  }else{
    Object.assign(layout,BALL_RECTS);
  }
  // The anchor is determined by the topmost selected snowball, not by the accessory.
  const head=custom ? (parts.headBall?layout.headBall:parts.middleBall?layout.middleBall:layout.baseBall)
    : parts.body==="Two_Ball_Snowman_Base.png"?rect(36,36,28,24):rect(39,35,22,19);
  const center=head.left+head.width/2;
  const faceY=head.top+head.height*0.46;
  const neckY=head.top+head.height*0.92;
  const lower=custom?(parts.middleBall?layout.middleBall:layout.baseBall):rect(29,60,42,28);
  const middle=custom?(parts.middleBall?layout.middleBall:layout.baseBall):rect(34,50,32,23);
  const accessory=(width:number,height:number,top:number):Rect=>rect(center-width/2,top,width,height);
  layout.eyes=accessory(head.width*0.68,head.height*0.27,faceY-head.height*0.13);
  layout.nose=accessory(head.width*0.39,head.height*0.30,faceY+head.height*0.03);
  layout.mouth=accessory(head.width*0.55,head.height*0.23,faceY+head.height*0.25);
  layout.hat=accessory(head.width*1.4,head.height*1.05,head.top-head.height*0.62);
  layout.scarf=accessory(middle.width*0.8,middle.height*0.8,neckY-head.height*0.08);
  layout.buttons=accessory(lower.width*0.22,lower.height*0.29,lower.top+lower.height*0.39);
  layout.arms=accessory(middle.width*2.1,middle.height*1.8,middle.top-middle.height*0.12);
  layout.accessory=rect(63,72,26,22);
  return layout;
}
// Small per-artwork adjustments compensate for transparent padding and unusual silhouettes.
const ART_SCALE: Record<string,number> = {
  Santa_Hat:0.94,Straw_Beach_Hat:1.06,Black_Top_Hat:0.92,
  Red_Plaid_Scarf:0.85,Blue_Snowflake_Scarf:0.93,
  Blue_Mitten_Arms:0.88,Wooden_Button:0.78,
};
const renderOrder:Part[]=["snowball","arms","body","baseBall","middleBall","headBall","eyes","nose","mouth","buttons","scarf","hat","accessory"];
function SnowmanScene({night,parts,description,compact=false}:{night:boolean;parts:Snowman;description:string;compact?:boolean}) {
  return <div className={`relative mx-auto w-full overflow-hidden rounded-xl ${compact?"max-w-36":"max-w-md"}`} style={{aspectRatio:"1 / 1.25"}} role="img" aria-label={description}>
    <Image src={night?"/images/Winter/Snowy-clearing-night.PNG":"/images/Winter/Snowy-clearing-day.PNG"} alt="" fill unoptimized sizes={compact?"144px":"(max-width: 768px) 100vw, 450px"} className="object-cover"/>
    {renderOrder.map(part=>{const layout=snowmanLayout(parts);const file=parts[part];const scale=Object.entries(ART_SCALE).find(([name])=>file.startsWith(name))?.[1]||1;const position=centered(layout[part],scale);return file?<div key={part} className="pointer-events-none absolute" style={{left:position.left+"%",top:position.top+"%",width:position.width+"%",height:position.height+"%"}}>
      <Image src={ROOT+file+"?v=20261116-clean"} alt="" fill unoptimized sizes={compact?"110px":"250px"} className="object-contain"/>
    </div>:null;})}
  </div>;
}
const STORAGE = "shoreline-snowman-winter-v1";
const PREVIEW_STORAGE = "shoreline-snowman-preview-v1";
type Memory = { date:string; parts:Snowman };
export default function SnowmanMaking({night}:{night:boolean}) {
  const {state,play}=useGame();
  const month=new Date().getMonth();
  const inWinter=month===11||month===0||month===1;
  const [preview,setPreview]=useState(!inWinter);
  const [parts,setParts]=useState<Snowman>(DEFAULT);
  const [active,setActive]=useState<Part>("body");
  const [memories,setMemories]=useState<Memory[]>([]);
  const [announcement,setAnnouncement]=useState("");
  const [loaded,setLoaded]=useState(false);
  const storageKey=preview?PREVIEW_STORAGE:STORAGE;
  useEffect(()=>{
    try {
      const raw=JSON.parse(localStorage.getItem(storageKey)||"{}");
      setParts({...DEFAULT,...(raw.parts||{})});
      setMemories(Array.isArray(raw.memories)?raw.memories:[]);
    } catch {setParts(DEFAULT);setMemories([]);}
    setLoaded(true);
  },[storageKey]);
  useEffect(()=>{
    if(!loaded)return;
    try {localStorage.setItem(storageKey,JSON.stringify({parts,memories}));} catch {}
  },[parts,memories,storageKey,loaded]);
  const select=(key:Part,choice:Choice|null)=>{
    if (choice && (["body","snowball","baseBall","middleBall","headBall"].includes(key)) && /Snowball|Snowman_Base/.test(choice.file)) play("snowballCollect",0.65);
    setParts(prev=>({
      ...prev,
      ...(key==="body" && choice ? {baseBall:"",middleBall:"",headBall:""} : {}),
      ...(["baseBall","middleBall","headBall"].includes(key) && choice ? {body:""} : {}),
      [key]:choice?.file||""
    }));
    setAnnouncement(choice?choice.name+" added as "+(PARTS.find(p=>p.key===key)?.label||key)+".":"Removed "+PARTS.find(p=>p.key===key)?.label+".");
  };
  const save=()=>{
    const entry={date:new Date().toLocaleString(),parts:{...parts}};
    setMemories(prev=>[entry,...prev].slice(0,30));
    setAnnouncement("Snowman saved to your Winter Memory Book.");
  };
  const describe=(p:Snowman)=>PARTS.map(group=>{
    const found=group.options.find(o=>o.file===p[group.key]);
    return found?group.label+": "+found.name:null;
  }).filter(Boolean).join(". ");
  return <section className="space-y-4" aria-label="Snowman making activity">
    <h3 className="text-lg font-bold">Build Your Winter Snowman</h3>
    <p>Choose snowballs, a face, arms, and cozy accessories. Your snowman appears in the clearing as you decorate. Save your favorites in the Winter Memory Book.</p>
    {!inWinter&&<p>The winter activity opens December 1 and remains available through February. Preview mode lets you test without changing winter progress.</p>}
    <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={preview} onChange={e=>{setLoaded(false);setPreview(e.target.checked);setAnnouncement("");}}/> Snowman preview mode (separate testing progress)</label>
    {(inWinter||preview)&&<>
      <SnowmanScene night={night} parts={parts} description={"Full snowman preview in "+(night?"moonlit":"sunny")+" winter clearing. "+describe(parts)}/>
      <p className="text-sm">Live snowman preview. Choose a category, then select an item. Changes are saved automatically on this device.</p>
      <div className="sticky top-0 z-20 flex items-center gap-3 rounded-xl border border-sky-300 bg-indigo-950/95 p-2 shadow-lg" aria-label="Live snowman mini preview">
        <div className="w-28 shrink-0"><SnowmanScene night={night} parts={parts} compact description={"Current snowman: "+describe(parts)}/></div>
        <div className="min-w-0 space-y-1">
          <p className="font-semibold">Your snowman</p>
          <p className="text-sm">Preview updates as you decorate.</p>
          <p className="text-xs text-sky-100">{PARTS.find(group=>group.key===active)?.label}: {PARTS.find(group=>group.key===active)?.options.find(o=>o.file===parts[active])?.name||"None"}</p>
        </div>
      </div>
      <section className="space-y-2 rounded-xl border border-sky-300 p-3" aria-label="Everlasting Snowball collection">
        <h4 className="font-semibold">Everlasting Snowballs</h4>
        <p>Rare snowballs stay in your inventory when used. Choose a collected size to display beside your snowman. Preview mode allows testing all sizes without adding them to inventory.</p>
        <div className="grid grid-cols-3 gap-2">
          {(["small","medium","large"] as const).map(size=>{
            const owned=state.inventory["winter-everlasting-snowball-"+size]||0;
            const option=PARTS.find(p=>p.key==="snowball")?.options.find(o=>o.file.toLowerCase().startsWith(size));
            return <button key={size} type="button" disabled={!preview&&owned===0} aria-pressed={!!option&&parts.snowball===option.file} onClick={()=>{if(option)select("snowball",option);}} className="min-h-12 rounded-lg border border-sky-200 p-2 disabled:opacity-50">
              {size.charAt(0).toUpperCase()+size.slice(1)} — {owned} collected{preview?" (preview)":""}
            </button>;
          })}
        </div>
        {parts.snowball&&<button type="button" className="min-h-11 rounded-lg border border-sky-200 px-3 py-2" onClick={()=>select("snowball",null)}>Remove displayed snowball</button>}
      </section>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Snowman decoration categories">
        {PARTS.map(group=><button type="button" key={group.key} aria-pressed={active===group.key} onClick={()=>setActive(group.key)} className={`min-h-11 rounded-lg border px-3 py-2 ${active===group.key?"border-yellow-300 bg-indigo-700":"border-sky-200 bg-indigo-900"}`}>{group.label}</button>)}
      </div>
      <h4 className="font-semibold">Choose {PARTS.find(p=>p.key===active)?.label.toLowerCase()}</h4>
      <div className="grid grid-cols-2 gap-2">
        {PARTS.find(p=>p.key===active)?.options.map(choice=><button key={choice.file} type="button" aria-pressed={parts[active]===choice.file} onClick={()=>select(active,choice)} className={`min-h-28 rounded-xl border p-2 ${parts[active]===choice.file?"border-yellow-300 bg-indigo-700":"border-sky-300 bg-indigo-900"}`}>
          <Image src={ROOT+choice.file+"?v=20261116-clean"} alt="" width={92} height={92} unoptimized className="mx-auto h-20 w-20 object-contain"/>
          <span className="block text-sm">{choice.name}{parts[active]===choice.file?" — selected":""}</span>
        </button>)}
        {active!=="body"&&<button type="button" onClick={()=>select(active,null)} className="min-h-11 rounded-lg border border-sky-200 p-2">No {PARTS.find(p=>p.key===active)?.label.toLowerCase()}</button>}
      </div>
      <p role="status" aria-live="polite">{announcement}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={save} className="min-h-12 rounded-lg bg-amber-100 px-4 py-2 font-bold text-indigo-950">Save Snowman to Winter Memory Book</button>
        <button type="button" onClick={()=>{const fresh={...DEFAULT};setParts(fresh);setActive("body");try{localStorage.setItem(storageKey,JSON.stringify({parts:fresh,memories}));}catch{}setAnnouncement("Started a new snowman. All snowballs, facial features, clothing, and accessories have been cleared. Your Winter Memory Book is unchanged.");}} className="min-h-12 rounded-lg border border-amber-100 px-4 py-2">Start New Snowman</button>
      </div>
      <section aria-label="Winter Memory Book" className="space-y-2">
        <h4 className="font-bold">Winter Memory Book — {memories.length} saved snowmen</h4>
        {memories.length===0?<p>No snowmen saved yet.</p>:<div className="space-y-2">{memories.map((entry,i)=><div key={i} className="rounded-lg border border-indigo-400 p-3">
          <p>Snowman {memories.length-i}, saved {entry.date}. {describe(entry.parts)}</p>
          <button type="button" className="mt-2 min-h-11 rounded-lg border border-sky-200 px-3 py-2" onClick={()=>{setParts({...DEFAULT,...entry.parts});setAnnouncement("Saved snowman loaded into preview.");}}>Load this snowman</button>
        </div>)}</div>}
      </section>
    </>}
  </section>;
}
