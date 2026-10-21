"use client";
import {useEffect,useState} from "react";
import {useGame} from "@/lib/store";
const KEY="shoreline-coffee-plant-v1";
const GROW=12*60*60*1000, REGROW=3*60*60*1000;
type Plant={plantedAt:number;lastHarvest:number};
export default function GroveCoffeePlant(){
 const {state,craft,collectItem}=useGame();
 const [plant,setPlant]=useState<Plant|null>(null);
 const [ready,setReady]=useState(false);
 const [now,setNow]=useState(Date.now());
 const [message,setMessage]=useState("");
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved&&Number.isFinite(saved.plantedAt)&&Number.isFinite(saved.lastHarvest))setPlant(saved);}catch{}setReady(true);const timer=window.setInterval(()=>setNow(Date.now()),30000);return()=>window.clearInterval(timer);},[]);
 const next=plant?Math.max(plant.plantedAt+GROW,plant.lastHarvest?plant.lastHarvest+REGROW:0):0;
 const remaining=Math.max(0,next-now);
 const plantSeed=()=>{
  if(!ready||plant||!state.inventory["coffee-plant-seeds"])return;
  if(!craft("grove-coffee-planting",[{itemId:"coffee-plant-seeds",count:1}]))return;
  const p={plantedAt:Date.now(),lastHarvest:0};localStorage.setItem(KEY,JSON.stringify(p));setPlant(p);setNow(Date.now());setMessage("Coffee seed planted! The first harvest grows in 12 hours.");
 };
 const harvest=()=>{
  if(!plant||remaining>0)return;
  const p={...plant,lastHarvest:Date.now()};
  localStorage.setItem(KEY,JSON.stringify(p));setPlant(p);setNow(Date.now());
  const count=2+Math.floor(Math.random()*2);
  for(let i=0;i<count;i++)collectItem("coffee-beans",{silent:true});
  setMessage("Harvested "+count+" coffee beans! The plant will be ready again in 3 hours.");
 };
 const hours=Math.floor(remaining/3600000),minutes=Math.ceil((remaining%3600000)/60000);
 return <section aria-labelledby="grove-coffee-heading" className="mt-4 rounded-2xl bg-emerald-950/90 p-4 text-white ring-1 ring-emerald-300/50">
  <h3 id="grove-coffee-heading" className="text-xl font-bold">☕ Coffee Plant</h3>
  <p className="mt-2">Grow your own coffee beans for the cottage recipes. Shelby sells coffee plant seeds. Once planted, the tree remains in your grove.</p>
  <div aria-hidden="true" className="my-3 text-center text-6xl">{!plant?"🌱":remaining>0&&plant.lastHarvest===0?"🌿":"🌳"}</div>
  {!ready?<p>Checking your coffee plant...</p>:!plant?<button type="button" disabled={!state.inventory["coffee-plant-seeds"]} onClick={plantSeed} className="min-h-12 w-full rounded-xl bg-emerald-700 p-3 font-bold disabled:opacity-50">Plant Coffee Seeds {state.inventory["coffee-plant-seeds"]?"":"(Seeds needed)"}</button>:<button type="button" disabled={remaining>0} onClick={harvest} className="min-h-12 w-full rounded-xl bg-emerald-700 p-3 font-bold disabled:opacity-50">{remaining>0?"Next harvest in "+hours+"h "+minutes+"m":"Harvest 2–3 Coffee Beans"}</button>}
  <p role="status" aria-live="polite" className="mt-2 text-sm">{message||(!plant?"Get coffee plant seeds from Shelby to begin.":"After the first 12-hour growth, harvest every 3 hours.")}</p>
 </section>;
}
