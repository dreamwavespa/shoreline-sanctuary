"use client";
import Image from "next/image";
const FILTERS: Record<string,string> = {
 "glaze-ruby-red":"sepia(1) saturate(4) hue-rotate(305deg)",
 "glaze-sunflower-yellow":"sepia(1) saturate(3) hue-rotate(350deg)",
 "glaze-sky-blue":"saturate(1.35)",
 "glaze-sea-foam-green":"sepia(.35) saturate(1.5) hue-rotate(35deg)",
 "glaze-baby-pink":"sepia(.65) saturate(1.6) hue-rotate(285deg)",
 "glaze-pearl-white":"saturate(.35) brightness(1.2)",
 "glaze-midnight-black":"grayscale(.8) brightness(.42)",
 "glaze-purple-grape":"sepia(.55) saturate(2) hue-rotate(105deg)",
 "glaze-chocolate-brown":"sepia(.9) saturate(1.4) hue-rotate(335deg) brightness(.7)",
 "glaze-metallic-gold":"sepia(.95) saturate(2) hue-rotate(350deg)",
 "glaze-shimmering-silver":"grayscale(1) brightness(1.2)",
 "orange-glaze":"sepia(1) saturate(3) hue-rotate(335deg)",
 "pearl-pottery-glaze":"saturate(.7) brightness(1.1)",
 "iridescent-pottery-glaze":"saturate(1.5) hue-rotate(18deg)",
};
const SPECIALS:Record<string,string> = {
 "mermaid-shimmer":"saturate(1.5) hue-rotate(32deg)",
 "sunset-pearl":"sepia(.45) saturate(1.4) hue-rotate(320deg)",
 "moonlit-silver":"grayscale(.55) brightness(.9)",
 "royal-coral":"sepia(.55) saturate(2) hue-rotate(300deg)",
 "sea-glass-mist":"sepia(.3) saturate(1.2) hue-rotate(45deg)",
 "blushing-pearl":"sepia(.25) saturate(1.2) hue-rotate(290deg)",
 "aurora-tide":"saturate(1.5) hue-rotate(70deg)",
 "golden-driftwood":"sepia(.8) saturate(1.4)",
};
export function glazeFilter(glaze?:string) {
 if (!glaze) return undefined;
 const special = Object.entries(SPECIALS).find(([name])=>glaze.includes(name));
 if (special) return special[1];
 return glaze.split("+").map(x=>FILTERS[x]).filter(Boolean).join(" ") || undefined;
}
export default function GlazedPotteryImage({src,glaze,alt,size=100,preserveWax=false}:{src:string;glaze?:string;alt:string;size?:number;preserveWax?:boolean}) {
 const filter=glazeFilter(glaze);
 const finish=(glaze||"").toLowerCase();
 const metallic=/metallic|gold|silver/.test(finish);
 const pearlescent=/iridescent|pearl|shimmer|aurora|mermaid/.test(finish);
 const sheen=metallic||pearlescent;
 const sheenGradient=metallic
  ? "linear-gradient(125deg,transparent 15%,rgba(255,250,222,.12) 32%,rgba(255,255,255,.48) 43%,rgba(255,247,195,.15) 54%,transparent 72%)"
  : "linear-gradient(125deg,transparent 12%,rgba(255,215,244,.18) 29%,rgba(255,255,255,.48) 43%,rgba(185,242,255,.22) 56%,transparent 76%)";
 return <span role="img" aria-label={alt} style={{position:"relative",display:"inline-block",width:size,height:size,maxWidth:"100%"}}>
   <Image src={src} alt="" width={size} height={size} unoptimized style={{width:"100%",height:"100%",objectFit:"contain",filter}} />
   {sheen && <span aria-hidden="true" style={{position:"absolute",inset:0,pointerEvents:"none",background:sheenGradient,opacity:.8,maskImage:preserveWax ? "linear-gradient(to bottom, transparent 0%, transparent 26%, black 47%)" : undefined,WebkitMaskImage:preserveWax ? "linear-gradient(to bottom, transparent 0%, transparent 26%, black 47%)" : undefined}} />}
   {preserveWax && filter && <Image src={src} alt="" aria-hidden="true" width={size} height={size} unoptimized style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain",maskImage:"linear-gradient(to bottom, black 0%, black 24%, transparent 43%)",WebkitMaskImage:"linear-gradient(to bottom, black 0%, black 24%, transparent 43%)"}} />}
 </span>;
}
