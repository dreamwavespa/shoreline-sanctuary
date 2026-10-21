"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import { localDateKey } from "@/lib/customSandArt";
const KEY = "shoreline-mothie-lights-v1";
const lights = [
  {name:"Golden",color:"#fde68a",x:18,y:25},
  {name:"Blue",color:"#7dd3fc",x:77,y:29},
  {name:"Lavender",color:"#d8b4fe",x:43,y:55},
  {name:"Seafoam",color:"#99f6e4",x:80,y:72},
  {name:"Moonlight",color:"#fff7ed",x:22,y:76},
];
type Progress = {day:string; completed:boolean; visits:number; caught:number[]};
function load():Progress {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "null") as Progress;
    if (p && typeof p.visits === "number") return {day:localDateKey(),visits:p.visits,completed:p.day===localDateKey() && !!p.completed,caught:p.day===localDateKey() && Array.isArray(p.caught)?p.caught:[]};
  } catch {}
  return {day:localDateKey(),completed:false,visits:0,caught:[]};
}
export default function MothieFireflyLights(){
  const {collectItem}=useGame();
  const [progress,setProgress]=useState<Progress|null>(null);
  const [message,setMessage]=useState("Guide five glowing fireflies into Mothie's jar.");
  useEffect(()=>{setProgress(load());},[]);
  const save=(p:Progress)=>{localStorage.setItem(KEY,JSON.stringify(p));setProgress(p);};
  const catchLight=(index:number)=>{
    if(!progress || progress.completed || progress.caught.includes(index))return;
    const caught=[...progress.caught,index];
    save({...progress,caught});
    setMessage(lights[index].name+" firefly guided! "+caught.length+" of 5 collected.");
  };
  const claim=()=>{
    if(!progress || progress.completed || progress.caught.length!==5)return;
    save({...progress,completed:true,visits:progress.visits+1});
    collectItem("firefly-jar");
    setMessage("Mothie gives you a Glowing Firefly Jar! Added to inventory.");
  };
  if(!progress)return <p>Preparing Mothie's firefly clearing...</p>;
  return <section aria-labelledby="mothie-game" className="mt-4 space-y-3 rounded-2xl bg-indigo-950 p-4 text-white ring-1 ring-violet-200/50">
    <h4 id="mothie-game" className="text-lg font-bold">Guide the Firefly Lights</h4>
    <p className="text-sm">Tap five glowing lights to guide them into the jar. Each light is also an accessible, labeled button for VoiceOver.</p>
    <div className="relative h-64 rounded-2xl border border-indigo-300/60 bg-gradient-to-b from-slate-950 via-indigo-950 to-teal-950">
      {lights.map((light,i)=>!progress.caught.includes(i) && <button key={light.name} type="button" disabled={progress.completed} onClick={()=>catchLight(i)} aria-label={"Guide "+light.name+" firefly to jar"} className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300" style={{left:light.x+"%",top:light.y+"%"}}>
        <span aria-hidden="true" className="h-5 w-5 rounded-full" style={{backgroundColor:light.color,boxShadow:"0 0 14px 7px "+light.color+"88"}}/>
      </button>)}
      <div aria-hidden="true" className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-xl bg-indigo-900 px-4 py-2">🏮 {progress.caught.length}/5</div>
    </div>
    <p role="status" aria-live="polite">Fireflies guided: {progress.caught.length} of 5.</p>
    <button type="button" disabled={progress.completed || progress.caught.length!==5} onClick={claim} className="min-h-12 w-full rounded-xl bg-violet-700 p-3 font-semibold disabled:opacity-50">{progress.completed?"Tonight's Jar Collected":"Complete Firefly Jar and Collect Reward"}</button>
    <p role="status" aria-live="polite">{message}</p>
    <p className="text-sm">Friendship visits: {progress.visits}. Return tomorrow night for another jar.</p>
  </section>;
}
