"use client";
const NIGHT = "shoreline-cadence-night-sky-discovered";
const WINTER = "shoreline-cadence-winter-discovered";
function eastern() {
 const parts = new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",month:"numeric",hour:"numeric",hourCycle:"h23"}).formatToParts(new Date());
 const get = (key:string) => Number(parts.find(p=>p.type===key)?.value || 0);
 return {month:get("month"),hour:get("hour")};
}
export function blockUnlocks(inventory:Record<string,number>,crafted:string[]) {
 const owned = (id:string,slug:string) => (inventory[id]||0)>0 || crafted.includes(id) || localStorage.getItem("shoreline-cadence-block-gift-"+slug)==="yes";
 const time=eastern();
 const winter=time.month===12||time.month===1||time.month===2;
 try {
  if(winter||owned("cadence-winter-blocks","winter")) localStorage.setItem(WINTER,"yes");
  if(owned("cadence-night-sky-blocks","night-sky")) localStorage.setItem(NIGHT,"yes");
  return {winter:localStorage.getItem(WINTER)==="yes",nightSky:localStorage.getItem(NIGHT)==="yes"};
 } catch {return {winter:winter||owned("cadence-winter-blocks","winter"),nightSky:owned("cadence-night-sky-blocks","night-sky")};}
}
export function discoverNightBlocks() {
 if(eastern().hour<19)return false;
 try {const fresh=localStorage.getItem(NIGHT)!=="yes";localStorage.setItem(NIGHT,"yes");return fresh;}catch{return false;}
}