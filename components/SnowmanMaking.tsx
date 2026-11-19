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
// One assembled snowman coordinate system for every body choice.
// All coordinates below are percentages of the same winter scene.
// Accessories are derived from the assembled head and torso, never from
// their previous screen position or from another accessory.
// Fixed scene-space assembly presets. Each snowman uses one coordinate frame;
// decoration positions never depend on the dimensions of another decoration.
function snowmanLayout(parts:Snowman):Record<Part,Rect>{
  const layout={} as Record<Part,Rect>;
  const hidden=rect(50,80,0,0);
  for(const key of ["body","baseBall","middleBall","headBall"] as const) layout[key]=hidden;
  layout.snowball=rect(13,77,23,17);
  const custom=!parts.body;
  const keys=(["baseBall","middleBall","headBall"] as const).filter(key=>!!parts[key]);
  const count=custom?keys.length:(parts.body==="Two_Ball_Snowman_Base.png"?2:3);
  // Snowballs are arranged bottom-up and meet at stable overlap points.
  const slots:Rect[]=count===1?[rect(37,72,26,22)]:count===2?
    [rect(34,66,32,22),rect(40,64,20,17)]:
    [rect(33,76,34,19),rect(39,67,22,15),rect(43,59,14,12)];
  if(custom) keys.forEach((key,i)=>layout[key]=slots[i]);
  else layout.body=count===2?rect(31,57,38,37):rect(30,51,40,43);
  // These anchors are independent of the chosen hat, scarf, or face art.
  const head=count===1?slots[0]:count===2?slots[1]:slots[2];
  const torso=count===1?slots[0]:count===2?slots[0]:slots[1];
  const base=slots[0];
  const cx=50;
  const centered=(w:number,h:number,y:number)=>rect(cx-w/2,y,w,h);
  const faceScale = custom && count === 2 ? 1.32 : 1;
  layout.eyes=centered(head.width*.58*faceScale,head.height*.23*faceScale,head.top+head.height*.44);
  layout.nose=centered(head.width*.52*faceScale,head.height*.23*faceScale,head.top+head.height*.59);
  layout.mouth=centered(head.width*.54*faceScale,head.height*.21*faceScale,head.top+head.height*.76);
  // The three-ball body artwork sits lower inside its image box.
  // Hat artwork has different transparent padding: top hats need a higher anchor,
  // while beanies on individually stacked snowballs need a lower anchor.
  const hatOffset = parts.hat === "Black_Top_Hat.png" ? -.43 : custom ? -.08 : !custom && count === 3 ? -.12 : -.38;
  layout.hat=centered(head.width*1.35,head.height*.83,head.top+head.height*hatOffset);
  layout.scarf=centered(torso.width*.78,torso.height*.60,head.top+head.height*.77);
  layout.buttons=centered(base.width*.13,base.height*.16,base.top+base.height*.38);
  const armJointSpacing = torso.width * (!custom && count === 3 ? .70 : .52);
  const armImageHeight = torso.width * (count === 2 ? .64 : .76);
  const armJointTop = torso.top + torso.height * (count === 2 ? .34 : .44);
  layout.arms=centered(armJointSpacing,armImageHeight,armJointTop);
  layout.accessory=rect(63,72,26,22);
  return layout;
}
const renderOrder:Part[]=["snowball","body","baseBall","middleBall","headBall","arms","buttons","scarf","hat","eyes","nose","mouth","accessory"];
// Crop transparent padding and stray sheet borders while preserving the image scale.
const snowmanArtworkClips: Record<string, string> = {
  "Two_Ball_Snowman_Base.png": "inset(20% 18% 8% 24%)",
  "Three_Ball_Snowman_Base.png": "inset(11% 19% 6% 21%)",
  "Black_Top_Hat.png": "inset(24% 8% 16% 19%)",
  "Red_Plaid_Cap.png": "inset(28% 8% 18% 21%)",
  "Purple_Flower_Beret.png": "inset(30% 5% 24% 14%)",
  "Santa_Hat.png": "inset(24% 6% 21% 16%)",
  "Blue_Snowflake_Scarf.png": "inset(14% 11% 6% 14%)",
  "Red_Plaid_Scarf.png": "inset(10% 12% 0 20%)",
};

type ArmArtwork = { clipPath: string; jointX: number; jointY: number; rotation: number };

// Each sprite has two arms sharing a square. Clip each half and pivot it
// around the cut end of its twig so it stays attached when rotated.
const snowmanArmArtwork: Record<string, readonly [ArmArtwork, ArmArtwork]> = {
  "Plain_Twig_Arms.png": [
    {clipPath:"inset(0 48% 0 17%)",jointX:43,jointY:83,rotation:-48},
    {clipPath:"inset(0 0 0 53%)",jointX:60,jointY:83,rotation:48},
  ],
  "Berry_Twig_Arms.png": [
    {clipPath:"inset(0 47% 0 18%)",jointX:46,jointY:82,rotation:-42},
    {clipPath:"inset(0 0 0 54%)",jointX:59,jointY:82,rotation:42},
  ],
  "Blue_Mitten_Arms.png": [
    {clipPath:"inset(0 45% 0 15%)",jointX:50,jointY:81,rotation:-32},
    {clipPath:"inset(0 0 0 57%)",jointX:62,jointY:81,rotation:32},
  ],
  "Starfish_Twig_Arms.png": [
    {clipPath:"inset(0 39% 0 19%)",jointX:54,jointY:79,rotation:-30},
    {clipPath:"inset(0 0 0 63%)",jointX:68,jointY:79,rotation:30},
  ],
};

function SnowmanScene({night,parts,second,description,compact=false,expanded=false}:{night:boolean;parts:Snowman;second?:Snowman|null;description:string;compact?:boolean;expanded?:boolean}) {
  const layout = snowmanLayout(parts);
  const sizes = compact ? "110px" : expanded ? "600px" : "250px";

  return <div className={`relative mx-auto w-full overflow-hidden rounded-xl ${compact?"max-w-36":expanded?"max-w-[min(92vw,70vh)]":"max-w-md"}`} style={{aspectRatio:"1 / 1.25"}} role="img" aria-label={description}>
    <Image src={night?"/images/Winter/Snowy-clearing-night.PNG":"/images/Winter/Snowy-clearing-day.PNG"} alt="" fill unoptimized sizes={compact?"144px":"(max-width: 768px) 100vw, 450px"} className="object-cover"/>
    <div className="pointer-events-none absolute inset-0" style={expanded?{transform:"scale(1.15)",transformOrigin:"52% 76%"}:undefined}>
    {[parts,...(second?[second]:[])].map((snowman,index)=><div key={index} className="absolute inset-0" style={second?{transform:`translateX(${index===0?"-18%":"12%"}) scale(.73)`,transformOrigin:"50% 80%"}:undefined}>
    {renderOrder.map(part => {
      const file = snowman[part];
      if (!file || (!(snowman.body||snowman.baseBall||snowman.middleBall||snowman.headBall) && part !== "snowball")) return null;
      const position:Rect = snowman===parts ? layout[part] : snowmanLayout(snowman)[part];
      const individualBall = part === "baseBall" || part === "middleBall" || part === "headBall";
      const source = ROOT + file + (individualBall ? "?v=20261116-snowball-fix" : "?v=20261116-clean");
      const arms = part === "arms" ? snowmanArmArtwork[file] : undefined;
      if (arms) {
        const height = position.height;
        const width = height * 1.25;
        return arms.map(({clipPath, jointX, jointY, rotation}, index) => (
          <div key={index === 0 ? "leftArm" : "rightArm"} className="pointer-events-none absolute" style={{
            left: (position.left + index * position.width - width * jointX / 100) + "%",
            top: (position.top - height * jointY / 100) + "%",
            width: width + "%",
            height: height + "%",
            zIndex: 1,
          }}>
            <Image src={source} alt="" fill unoptimized sizes={sizes}
              style={{clipPath, transform:`rotate(${rotation}deg)`, transformOrigin:`${jointX}% ${jointY}%`}}/>
          </div>
        ));
      }
      const clipPath = snowmanArtworkClips[file];
      let {left, top, width, height} = position;
      if (clipPath) {
        // Match object-contain's square image area in the 4:5 scene.
        const squareWidth = Math.min(width, height * 1.25);
        const squareHeight = squareWidth / 1.25;
        left += (width - squareWidth) / 2;
        top += (height - squareHeight) / 2;
        width = squareWidth;
        height = squareHeight;
      }

      return <div key={part} className="pointer-events-none absolute" style={{left:left+"%",top:top+"%",width:width+"%",height:height+"%",zIndex:part==="arms"?3:individualBall||part==="body"?2:(part==="eyes"||part==="nose"||part==="mouth")?6:4}}>
        {individualBall ? (
          <img src={source} alt="" draggable={false} style={{display:"block",width:"100%",height:"100%",objectFit:"contain",opacity:1}}/>
        ) : (
          <Image src={source} alt="" fill unoptimized sizes={sizes} className="object-contain" style={{clipPath}}/>
        )}
      </div>;
    })}
    </div>)}
    </div>
  </div>;
}
const STORAGE = "shoreline-snowman-winter-v1";
const PREVIEW_STORAGE = "shoreline-snowman-preview-v1";
type Memory = { date:string; parts:Snowman; second?:Snowman|null };
export default function SnowmanMaking({night}:{night:boolean}) {
  const {state,play}=useGame();
  const month=new Date().getMonth();
  const inWinter=month===11||month===0||month===1;
  const [preview,setPreview]=useState(!inWinter);
  const [expanded,setExpanded]=useState(false);
  const [viewingMemory,setViewingMemory]=useState<Memory|null>(null);
  const [parts,setParts]=useState<Snowman>(DEFAULT);
  const [second,setSecond]=useState<Snowman|null>(null);
  const [editingSecond,setEditingSecond]=useState(false);
  const editingParts=editingSecond&&second?second:parts;
  const [active,setActive]=useState<Part>("body");
  const [memories,setMemories]=useState<Memory[]>([]);
  const [announcement,setAnnouncement]=useState("");
  const [loaded,setLoaded]=useState(false);
  const storageKey=preview?PREVIEW_STORAGE:STORAGE;
  useEffect(()=>{
    try {
      const raw=JSON.parse(localStorage.getItem(storageKey)||"{}");
      setParts({...DEFAULT,...(raw.parts||{})});
      setSecond(raw.second?{...DEFAULT,...raw.second}:null);
      setEditingSecond(false);
      setMemories(Array.isArray(raw.memories)?raw.memories:[]);
    } catch {setParts(DEFAULT);setSecond(null);setMemories([]);}
    setLoaded(true);
  },[storageKey]);
  useEffect(()=>{
    if(!loaded)return;
    try {localStorage.setItem(storageKey,JSON.stringify({parts,second,memories}));} catch {}
  },[parts,second,memories,storageKey,loaded]);
  const select=(key:Part,choice:Choice|null)=>{
    if (choice && (["body","snowball","baseBall","middleBall","headBall"].includes(key)) && /Snowball|Snowman_Base/.test(choice.file)) play("snowballCollect",0.65);
    const applyChoice=(prev:Snowman):Snowman=>({
      ...prev,
      ...(key==="body" && choice ? {baseBall:"",middleBall:"",headBall:""} : {}),
      ...(["baseBall","middleBall","headBall"].includes(key) && choice ? {body:""} : {}),
      [key]:choice?.file||""
    });
    if(editingSecond&&second) setSecond(prev=>applyChoice(prev||DEFAULT));
    else setParts(prev=>applyChoice(prev));
    setAnnouncement(choice?choice.name+" added as "+(PARTS.find(p=>p.key===key)?.label||key)+".":"Removed "+PARTS.find(p=>p.key===key)?.label+".");
  };
  const save=()=>{
    const entry={date:new Date().toLocaleString(),parts:{...parts},second:second?{...second}:null};
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
      <button type="button" onClick={()=>setExpanded(true)} className="min-h-12 w-full rounded-xl border border-amber-200 bg-indigo-800 px-4 py-3 font-semibold">View Snowman Scene Full Screen</button>
      <SnowmanScene night={night} parts={parts} second={second} description={"Full snowman preview in "+(night?"moonlit":"sunny")+" winter clearing. First snowman: "+describe(parts)+(second?". Second snowman: "+describe(second):"")}/>
      {(expanded||viewingMemory)&&<div className="fixed inset-0 z-[9999] flex flex-col overflow-y-auto bg-indigo-950 p-3 text-white" role="dialog" aria-modal="true" aria-label={viewingMemory?"Saved winter snowman scene":"Full-screen snowman scene"}>
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 pb-3">
          <h3 className="text-lg font-bold">{viewingMemory?"Winter Memory Book Scene":"Your Winter Snowman Scene"}</h3>
          <button type="button" autoFocus onClick={()=>{setExpanded(false);setViewingMemory(null);}} className="min-h-12 rounded-lg border border-amber-200 bg-indigo-800 px-4 font-semibold">Close full-screen view</button>
        </div>
        <SnowmanScene night={night} parts={viewingMemory?viewingMemory.parts:parts} second={viewingMemory?viewingMemory.second:second} expanded description={(viewingMemory?"Saved snowman":"Enlarged snowman")+" in "+(night?"moonlit":"sunny")+" winter clearing. First snowman: "+describe(viewingMemory?viewingMemory.parts:parts)+((viewingMemory?viewingMemory.second:second)?". Second snowman: "+describe((viewingMemory?viewingMemory.second:second)!):"")}/>
        <p className="mx-auto mt-3 max-w-2xl text-sm">{viewingMemory?"Saved "+viewingMemory.date+". "+describe(viewingMemory.parts):"Your snowman and winter clearing. Close this view to change decorations or save your snowman in the Winter Memory Book."}</p>
        <button type="button" onClick={()=>{setExpanded(false);setViewingMemory(null);}} className="mx-auto mt-3 min-h-12 rounded-lg border border-sky-200 px-6">{viewingMemory?"Return to Winter Memory Book":"Return to decorating"}</button>
      </div>}
      <div role="group" aria-label="Snowmen in the clearing" className="flex flex-wrap gap-2"><button type="button" aria-pressed={!editingSecond} onClick={()=>setEditingSecond(false)} className="min-h-12 rounded-lg border px-3">Decorate first snowman</button>{second?<><button type="button" aria-pressed={editingSecond} onClick={()=>setEditingSecond(true)} className="min-h-12 rounded-lg border px-3">Decorate second snowman</button><button type="button" onClick={()=>{setSecond(null);setEditingSecond(false);setAnnouncement("Second snowman removed.");}} className="min-h-12 rounded-lg border px-3">Remove second snowman</button></>:<button type="button" onClick={()=>{setSecond({...DEFAULT});setEditingSecond(true);setActive("body");setAnnouncement("Second snowman added. Choose its body.");}} className="min-h-12 rounded-lg border px-3">Add second snowman</button>}</div>
      <p className="text-sm">Live snowman preview. Choose a category, then select an item. Changes are saved automatically on this device.</p>
      <div className="flex items-center gap-3 rounded-xl border border-sky-300 bg-indigo-950/95 p-2 shadow-lg" aria-label="Live snowman mini preview">
        <div className="w-28 shrink-0"><SnowmanScene night={night} parts={parts} second={second} compact description={"First snowman: "+describe(parts)+(second?". Second snowman: "+describe(second):"")}/></div>
        <div className="min-w-0 space-y-1">
          <p className="font-semibold">{editingSecond?"Decorating second snowman":"Decorating first snowman"}</p>
          <p className="text-sm">Preview updates as you decorate.</p>
          <p className="text-xs text-sky-100">{PARTS.find(group=>group.key===active)?.label}: {PARTS.find(group=>group.key===active)?.options.find(o=>o.file===editingParts[active])?.name||"None"}</p>
        </div>
      </div>
      <section className="space-y-2 rounded-xl border border-sky-300 p-3" aria-label="Everlasting Snowball collection">
        <h4 className="font-semibold">Everlasting Snowballs</h4>
        <p>Rare snowballs stay in your inventory when used. Choose a collected size to display beside your snowman. Preview mode allows testing all sizes without adding them to inventory.</p>
        <div className="grid grid-cols-3 gap-2">
          {(["small","medium","large"] as const).map(size=>{
            const owned=state.inventory["winter-everlasting-snowball-"+size]||0;
            const option=PARTS.find(p=>p.key==="snowball")?.options.find(o=>o.file.toLowerCase().startsWith(size));
            return <button key={size} type="button" disabled={!preview&&owned===0} aria-pressed={!!option&&editingParts.snowball===option.file} onClick={()=>{if(option)select("snowball",option);}} className="min-h-12 rounded-lg border border-sky-200 p-2 disabled:opacity-50">
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
        <button type="button" onClick={()=>{const fresh={...DEFAULT};setParts(fresh);setSecond(null);setEditingSecond(false);setActive("body");try{localStorage.setItem(storageKey,JSON.stringify({parts:fresh,second:null,memories}));}catch{}setAnnouncement("Started a new snowman. All snowballs, facial features, clothing, and accessories have been cleared. Your Winter Memory Book is unchanged.");}} className="min-h-12 rounded-lg border border-amber-100 px-4 py-2">Start New Snowman</button>
      </div>
      <section aria-label="Winter Memory Book" className="space-y-2">
        <h4 className="font-bold">Winter Memory Book — {memories.length} saved snowmen</h4>
        {memories.length===0?<p>No snowmen saved yet.</p>:<div className="space-y-2">{memories.map((entry,i)=><div key={i} className="rounded-lg border border-indigo-400 p-3">
          <p>Snowman scene {memories.length-i}, saved {entry.date}. {describe(entry.parts)}{entry.second?" Second snowman: "+describe(entry.second):""}</p>
          <button type="button" className="mt-2 mr-2 min-h-11 rounded-lg border border-amber-200 px-3 py-2" onClick={()=>setViewingMemory(entry)}>View saved scene full screen</button>
           <button type="button" className="mt-2 min-h-11 rounded-lg border border-sky-200 px-3 py-2" onClick={()=>{setParts({...DEFAULT,...entry.parts});setSecond(entry.second?{...DEFAULT,...entry.second}:null);setEditingSecond(false);setAnnouncement("Saved snowman loaded into preview.");}}>Load this snowman</button>
        </div>)}</div>}
      </section>
    </>}
  </section>;
}
