export const WORRY_STONES = [
{id:"clear-quartz",name:"Clear Quartz",weight:20,rarity:"common",effect:"A gentle crystalline sparkle.",file:"Clear-Quartz"},
{id:"rose-quartz",name:"Rose Quartz",weight:20,rarity:"common",effect:"A soft pink comforting glow.",file:"Rose-Quartz"},
{id:"ocean-jasper",name:"Ocean Jasper",weight:20,rarity:"common",effect:"Gentle ocean waves.",file:"Ocean-Jasper",audio:"/audio/Walter-Ocean-Jasper-Waves-Short.mp3"},
{id:"amber",name:"Amber",weight:15,rarity:"uncommon",effect:"A warm golden shimmer.",file:"Amber"},
{id:"amethyst",name:"Amethyst",weight:10,rarity:"uncommon",effect:"Soft purple sparkles.",file:"Amethyst"},
{id:"moonstone",name:"Moonstone",weight:6,rarity:"rare",effect:"A gentle moonlight glow.",file:"Moonstone"},
{id:"blue-lace-agate",name:"Blue Lace Agate",weight:7,rarity:"rare",effect:"A delicate crystal chime.",file:"Blue-Lace-Agate",audio:"/audio/Crystal-bowl.mp3"},
{id:"rainbow-fluorite",name:"Rainbow Fluorite",weight:2,rarity:"very rare",effect:"Shifting rainbow colors.",file:"Rainbow-Fluorite"}
] as const;
export type WorryStoneId = typeof WORRY_STONES[number]["id"];
export function identifyWorryStone(): WorryStoneId {
 const roll=Math.random()*100; let total=0;
 for(const stone of WORRY_STONES){total+=stone.weight;if(roll<total)return stone.id;}
 return "clear-quartz";
}
