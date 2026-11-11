"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGame } from "@/lib/store";
import { ITEMS } from "@/lib/items";

type Area = "inside" | "patio";
function DisplayArt({ icon, name, isEmoji }: { icon: string; name: string; isEmoji?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (isEmoji || !icon || failed) return <span aria-hidden="true" className="text-xl">{isEmoji ? icon : "🏺"}</span>;
  return <img src={icon} alt="" onError={() => setFailed(true)} className="h-full w-full object-contain drop-shadow-md" />;
}
const FLOWER_SHOP_ROOT = "/images/Flower shop/";
const FLOWER_SHOP_ART: Record<string, string> = {
  "flower-beach-rose":"beach-rose.png", "flower-sea-holly":"sea-holly.png",
  "flower-seaside-daisy":"seaside-daisy.png", "flower-coastal-sunflower":"coastal-sunflower.png",
  "flower-dune-evening-primrose":"dune-evening-primrose.png", "flower-saltmarsh-mallow":"saltmarsh-mallow.png",
  "flower-sea-morning-glory":"sea-morning-glory.png", "shelldon-moon-tide-blossom":"moon-tide-blossom.png",
  "sea-lavender":"sea-lavender.png", "rain-lily-blossom":"rain-lily-blossom.png",
  "plant-radiant-moonflower":"radiant-moonflower.png", "plant-twinkle-star-flower":"twinkle-star-flower.png",
  "plant-glowing-roses":"glowing-roses.png", "island-vanilla-orchid":"island-vanilla-orchid.png",
  "christmas-rose":"christmas-rose.png", "snowdrop-flowers":"snowdrop-flowers.png",
  "tropical-hibiscus":"tropical-hibiscus.png", "summer-hibiscus":"summer-hibiscus.png",
  "spring-edible-blossoms":"spring-edible-blossoms.png", "winterberry-holly":"winterberry-holly.png"
};
const FLOWER_POSITIONS = [
  {x:31,y:25,angle:-26,scale:.86}, {x:50,y:18,angle:0,scale:.91},
  {x:69,y:25,angle:26,scale:.86}, {x:35,y:37,angle:-18,scale:.94},
  {x:65,y:37,angle:18,scale:.94}, {x:50,y:35,angle:0,scale:1},
  {x:35,y:48,angle:-12,scale:.88}, {x:65,y:48,angle:12,scale:.88},
  {x:22,y:39,angle:-38,scale:.85}, {x:78,y:39,angle:38,scale:.85}
];
function ArrangementArt({ vaseIcon, stems, name }: { vaseIcon: string; stems: { id: string; slot: number }[]; name: string }) {
  // Match the Flower Shop's bouquet positioning, stacking, and art assets exactly.
  return <div className="relative h-full w-full overflow-visible" role="img" aria-label={name + " with " + stems.map(stem => ITEMS[stem.id]?.name || stem.id).join(", ")}>
    {stems.map((stem, i) => {
      const p = FLOWER_POSITIONS[stem.slot];
      const art = FLOWER_SHOP_ART[stem.id];
      if (!p || !art) return null;
      const anchorX = 50 + (p.x - 50) * .36;
      const anchorY = 54 + (p.y - 35) * .32;
      return <Image key={i} src={FLOWER_SHOP_ROOT + art} alt="" width={160} height={230} unoptimized className="absolute h-[66%] w-[38%] object-contain" style={{ left: anchorX + "%", top: anchorY + "%", transform: `translate(-50%, -72%) rotate(${p.angle * .65}deg) scale(${p.scale * .87})`, transformOrigin: "50% 85%", zIndex: p.y < 30 ? 2 : p.y < 45 ? 4 : 6 }} />;
    })}
    <Image src={vaseIcon || "/images/Pottery/coastal-vase.png"} alt="" width={180} height={160} unoptimized className="absolute bottom-[1%] left-1/2 h-[42%] w-[48%] -translate-x-1/2 object-contain" style={{ zIndex: 10 }} />
  </div>;
}
function PatioFlowerBox({ flowers }: { flowers: string[] }) {
  return <div className="relative h-full w-full" role="img" aria-label={"Driftwood flower box with " + (flowers.length ? flowers.map(id => ITEMS[id]?.name || id).join(", ") : "no flowers")}>
    <div className="absolute inset-x-0 top-0 flex h-[72%] items-end justify-around">
      {flowers.map((id, index) => <div key={index} className="h-full min-w-0 flex-1" style={{ transform: `translateY(${index % 2 ? 8 : 0}%)` }}><DisplayArt icon={ITEMS[id]?.icon || "🌸"} name={ITEMS[id]?.name || "Flower"} isEmoji={ITEMS[id]?.isEmoji || !ITEMS[id]?.icon} /></div>)}
    </div>
    <div className="absolute bottom-0 left-[5%] h-[40%] w-[90%] rounded-sm border-2 border-amber-950 bg-gradient-to-b from-amber-700 to-amber-900 shadow-md">
      <div className="absolute inset-x-0 top-[38%] border-t border-amber-300/50" />
      <div className="absolute left-[20%] top-0 h-full border-l border-amber-950/50" />
      <div className="absolute right-[20%] top-0 h-full border-r border-amber-950/50" />
    </div>
  </div>;
}
const imagePath = (area: Area, night: boolean) =>
  area === "inside" && !night ? "/images/Hut/Hut-day-updated.PNG" : `/images/Hut/${area === "inside" ? "Hut" : "Patio"}-${night ? "night" : "day"}.PNG${area === "inside" && night ? "?v=night-hut-refresh-20261108" : ""}`;

export default function HutScene({ onClose }: { onClose: () => void }) {
  const { state, setMusicOverride, collectItem } = useGame();
  const [area, setArea] = useState<Area>("inside");
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [vaseFlowers, setVaseFlowers] = useState<string[]>([]);
  const [patioBoxFlowers, setPatioBoxFlowers] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [curtainStyle, setCurtainStyle] = useState("");
  const [curtainsClosed, setCurtainsClosed] = useState(false);
  const curtainStyles = [
    { id: "sky-blue-curtains", name: "Sky Blue Curtains", file: "Sky_Blue_Curtains" },
    { id: "pink-flower-curtains", name: "Pink Flower Curtains", file: "Pink_Flower_Curtains" },
    { id: "seafoam-flower-curtains", name: "Seafoam Flower Curtains", file: "Seafoam_Flower_Curtains" },
  ];
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("shoreline-hut-curtains-v1") || "{}");
      if (typeof saved.style === "string") setCurtainStyle(saved.style);
      if (typeof saved.closed === "boolean") setCurtainsClosed(saved.closed);
    } catch {}
  }, []);
  const saveCurtains = (style: string, closed: boolean) => {
    setCurtainStyle(style);
    setCurtainsClosed(closed);
    if (style && style === curtainStyle && closed !== curtainsClosed) { const audio = new Audio("/audio/Shoreline_Curtain_Swish_Louder.mp3"); audio.volume = 0.8; void audio.play().catch(() => {}); }
    try { window.localStorage.setItem("shoreline-hut-curtains-v1", JSON.stringify({ style, closed })); } catch {}
    setAnnouncement(style ? `${ITEMS[style]?.name || "Curtains"} ${closed ? "closed" : "open"}.` : "Curtains removed and returned to available inventory.");
  };
  const activeCurtains = curtainStyles.find(c => c.id === curtainStyle && (state.inventory[c.id] || 0) > 0);

  const entranceReadyAt = useRef(0);
  const openDecoration = (id: string) => { if (Date.now() < entranceReadyAt.current) return; setAnnouncement(""); setSelectedSlot(id); };
  const slots = [
    { id: "shelf1-left", name: "Top shelf, left", x: 21, y: 20.5 },
    { id: "shelf1-right", name: "Top shelf, right", x: 33, y: 21 },
    { id: "shelf2-left", name: "Middle shelf, left", x: 21, y: 28.5 },
    { id: "shelf2-right", name: "Middle shelf, right", x: 33, y: 29 },
    { id: "shelf3-left", name: "Bottom shelf, left", x: 21, y: 35.5 },
    { id: "shelf3-right", name: "Bottom shelf, right", x: 33, y: 36 },
    { id: "wall", name: "Wall display, center", x: 57, y: 41 },
    { id: "wall-left", name: "Wall display, left", x: 48, y: 32 },
    { id: "wall-right", name: "Wall display, right", x: 65, y: 32 },
    { id: "coffee-table", name: "Coffee table", x: 47, y: 65 },
    { id: "side-table", name: "Side table", x: 94, y: 67 },
    { id: "fireplace-mantel", name: "Fireplace hearth, beside sofa", x: 17, y: 59 },
    { id: "sofa-pillow-left", name: "Sofa, left pillow", x: 68, y: 58 },
    { id: "sofa-pillow-right", name: "Sofa, right pillow", x: 84, y: 59 },
    { id: "shell-chair", name: "Seashell chair corner", x: 43, y: 79 },
    { id: "patio-fountain", name: "Patio fountain space", x: 48, y: 73 },
    { id: "patio-chair-left", name: "Patio beach chair, left", x: 26, y: 79 },
    { id: "patio-chair-right", name: "Patio beach chair, right", x: 73, y: 79 },
    { id: "patio-table", name: "Patio table", x: 83, y: 66 },
    { id: "patio-planter", name: "Patio flower display", x: 57, y: 57 },
    { id: "patio-lantern", name: "Patio lantern", x: 91, y: 47 },
    { id: "patio-chime", name: "Patio wind chime", x: 78, y: 20 },
    { id: "patio-birdbath", name: "Patio bird bath", x: 17, y: 62 },
  ];
  const isPatioSlot = (id: string) => id.startsWith("patio-");
  const activeSlots = slots.filter(slot => area === "patio" ? isPatioSlot(slot.id) : !isPatioSlot(slot.id));
  const patioMatches = (slot: string, id: string) => {
    const name = id + " " + (ITEMS[id]?.name || "");
    if (slot === "patio-fountain") return /fountain/i.test(name);
    if (slot === "patio-birdbath") return /bird.?bath/i.test(name);
    if (slot.startsWith("patio-chair")) return /beach.chair/i.test(name);
    if (slot === "patio-chime") return /wind.chime|winter.chime/i.test(name);
    if (slot === "patio-lantern") return /lantern/i.test(name);
    if (slot === "patio-planter") return id.startsWith("arrangement:") || /flower|bouquet|plant|vase/i.test(name);
    return true;
  };
  const isWallSlot = (id: string) => id.startsWith("wall");
  const isPillowSlot = (id: string) => id.startsWith("sofa-pillow");
  const isChairSlot = (id: string) => id === "shell-chair";
  const isPillowDecor = (id: string) => { const name = id + " " + (ITEMS[id]?.name || ""); return !/cat.toy|catnip|crinkle|snowball.cat|toy.mouse/i.test(name) && /pillow|cushion|plushie|plush.toy|stuffed.animal/i.test(name); };
  const isChairDecor = (id: string) => /shell.chair|seashell.chair|pearl.shell.chair/i.test(id + " " + (ITEMS[id]?.name || ""));
  const isTableSlot = (id: string) => id.includes("table") || id === "fireplace-mantel";
  const isWallDecor = (id: string) => /paint|artwork|mirror|wall|canvas|portrait/i.test(id + " " + (ITEMS[id]?.name || ""));
  const isArrangement = (id: string) => id.startsWith("arrangement:");
  const isDisplayFlower = (id: string) => id.startsWith("plant-") && /flower|rose/i.test(ITEMS[id]?.name || "") || id.startsWith("flower-") && /flower|rose|bouquet/i.test(ITEMS[id]?.name || "");
  // Only finished display objects belong on furniture; supplies and wearable crafts do not.
  const isSurfaceDecor = (id: string) => {
    if (isArrangement(id)) return true;
    const label = id + " " + (ITEMS[id]?.name || "");
    if (/curtain|boot|wading|glitter|pigment|powder|ingredient|fabric|ribbon|seed|flower.petal|paint.brush|rubber.duck|beach.ball|raft|umbrella|bag|hat|mitten|sweater|necklace|bracelet|earring|ring|pillow|cushion|chair|fountain|bird.?bath|wind.chime|painting|artwork|mirror|wall|canvas|portrait/i.test(label)) return false;
    return /vase|pottery|ceramic|plate|mug|cup|teapot|tea.set|snow.globe|snowglobe|sand.art|sand.bottle|bottle|candle|lamp|lantern|hourglass|crystal|sculpture|figurine|shell.chest|treasure.chest|decorative.bowl|flower.arrangement|flower.bouquet|salt.lamp/i.test(label);
  };
  const slotAccepts = (slot: string, id: string) => {
    if (isWallSlot(slot)) return !isArrangement(id) && isWallDecor(id);
    if (isPillowSlot(slot)) return !isArrangement(id) && isPillowDecor(id);
    if (isChairSlot(slot)) return !isArrangement(id) && isChairDecor(id);
    if (isPatioSlot(slot)) return patioMatches(slot, id) && (slot !== "patio-planter" || isArrangement(id) || isDisplayFlower(id) || /bouquet|vase/i.test(id + " " + (ITEMS[id]?.name || "")));
    return isSurfaceDecor(id);
  };
  const arrangementFor = (id: string) => state.flowerArrangements.find(a => "arrangement:" + a.id === id);
  const decorName = (id: string) => isArrangement(id) ? (arrangementFor(id)?.name || "Flower arrangement") : (ITEMS[id]?.name || id);
  const decorIcon = (id: string) => isArrangement(id) ? (ITEMS[arrangementFor(id)?.vaseId || ""]?.icon || "") : (ITEMS[id]?.icon || "");
  const usedCount = (id: string, excluding?: string) => Object.entries(placements).filter(([slot, item]) => slot !== excluding && item === id).length;
  const ownedDecor = Object.entries(state.inventory).filter(([id, count]) =>
    count > 0 && ITEMS[id] && (ITEMS[id].category === "decor" || id === "tidekeeper-vase" || isDisplayFlower(id) || id.startsWith("flower-") || id.includes("painting") || id.includes("artwork"))
  ).sort((a, b) => ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name));
  const availableArrangements = state.flowerArrangements.filter(a => !usedCount("arrangement:" + a.id));
  const isFlowerSlot = (slot: string) => slot === "patio-planter" || slot === "coffee-table" || slot === "side-table" || slot.startsWith("shelf");
  const flowerOptions = Object.entries(state.inventory).filter(([id, count]) => count > 0 && isDisplayFlower(id) && ITEMS[id] && !id.includes("vase") && !id.includes("curtain"));
  const savePatioBoxFlowers = (next: string[]) => {
    setPatioBoxFlowers(next);
    try { window.localStorage.setItem("shoreline-patio-flower-box-v1", JSON.stringify(next)); } catch {}
  };
  const saveVaseFlowers = (next: string[]) => {
    setVaseFlowers(next);
    try { window.localStorage.setItem("shoreline-tidekeeper-flowers-v1", JSON.stringify(next)); } catch {}
  };
  const savePlacement = (next: Record<string, string>) => {
    setPlacements(next);
    try { window.localStorage.setItem("shoreline-hut-displays-v1", JSON.stringify(next)); } catch {}
  };
  const place = (id: string) => {
    if (!selectedSlot) return;
    if (selectedSlot === "patio-planter" && isDisplayFlower(id)) {
      const next = [...patioBoxFlowers, id];
      if (next.length > 6 || next.filter(x => x === id).length > (state.inventory[id] || 0)) { setAnnouncement("Flower box is full or no additional copies are available."); return; }
      savePatioBoxFlowers(next);
      setAnnouncement(ITEMS[id].name + " added to the patio flower box.");
      return;
    }
    if (!slotAccepts(selectedSlot, id)) { setAnnouncement("This decoration is not suitable for that display position."); return; }
    if (isPatioSlot(selectedSlot) && !patioMatches(selectedSlot, id)) { setAnnouncement("Choose a suitable patio decoration for this position."); return; }
    if (isPillowSlot(selectedSlot) && !isPillowDecor(id)) { setAnnouncement("Choose a pillow or plushie for the sofa."); return; }
    if (isChairSlot(selectedSlot) && !isChairDecor(id)) { setAnnouncement("Choose your seashell chair for this corner."); return; }
    if (isWallSlot(selectedSlot) && !isWallDecor(id)) { setAnnouncement("Choose a painting, mirror, or other wall artwork for this position."); return; }
    const count = isArrangement(id) ? (arrangementFor(id) ? 1 : 0) : (state.inventory[id] || 0);
    const usedElsewhere = Object.entries(placements).filter(([slot, item]) => slot !== selectedSlot && item === id).length;
    if (usedElsewhere >= count) { setAnnouncement("All owned copies of that decoration are already displayed."); return; }
    savePlacement({ ...placements, [selectedSlot]: id });
    setAnnouncement(`${decorName(id)} placed on ${slots.find(s => s.id === selectedSlot)?.name}.`);
  };
  const clearSlot = () => {
    if (!selectedSlot) return;
    if (selectedSlot === "patio-planter" && !placements[selectedSlot]) { savePatioBoxFlowers([]); setAnnouncement("Flower box cleared."); return; }
    const next = { ...placements }; delete next[selectedSlot];
    savePlacement(next); setAnnouncement("Decoration returned to available inventory.");
  };
  const moveSlot = (direction: number) => {
    if (!selectedSlot || !placements[selectedSlot]) return;
    const index = slots.findIndex(s => s.id === selectedSlot);
    const nextSlot = slots[index + direction];
    const other = nextSlot ? placements[nextSlot.id] : undefined;
    if (!nextSlot || isWallSlot(selectedSlot) !== isWallSlot(nextSlot.id) || isTableSlot(selectedSlot) !== isTableSlot(nextSlot.id) || isPillowSlot(selectedSlot) !== isPillowSlot(nextSlot.id) || isChairSlot(selectedSlot) !== isChairSlot(nextSlot.id) || !slotAccepts(nextSlot.id, placements[selectedSlot]) || (other && !slotAccepts(selectedSlot, other))) return;
    const next = { ...placements };
    const current = next[selectedSlot];
    next[nextSlot.id] = current;
    if (other) next[selectedSlot] = other; else delete next[selectedSlot];
    savePlacement(next); setSelectedSlot(nextSlot.id);
    setAnnouncement(`Moved to ${nextSlot.name}.`);
  };
  const [automaticChimes, setAutomaticChimes] = useState(true);
  const [chimeStyle, setChimeStyle] = useState<"mixed" | "small" | "bamboo">("mixed");
  const [fountainOn, setFountainOn] = useState(true);
  const [soundMessage, setSoundMessage] = useState("");
  const [showPatioSounds, setShowPatioSounds] = useState(false);
  const effectAudioRef = useRef<HTMLAudioElement | null>(null);
  const fountainAudioRef = useRef<HTMLAudioElement | null>(null);
  const chimeFiles = {
    small: ["chime-small-1.mp3", "chime-small-2.mp3", "chime-small-3.mp3", "chime-metal-soft.mp3", "chime-delicate.mp3"],
    bamboo: ["chime-bamboo-1.mp3", "chime-bamboo-2.mp3", "chime-bamboo-3.mp3"],
  };
  const stopChime = () => {
    effectAudioRef.current?.pause();
    effectAudioRef.current = null;
  };
  const playChime = () => {
    if (area !== "patio" || !placements["patio-chime"]) return;
    stopChime();
    const isWinterChime = placements["patio-chime"] === "winter-chimes";
    const choices = chimeStyle === "mixed" ? [...chimeFiles.small, ...chimeFiles.bamboo] : chimeFiles[chimeStyle];
    const filename = choices[Math.floor(Math.random() * choices.length)];
    const audio = new Audio(isWinterChime ? "/audio/winter-chimes-short.mp3" : "/audio/Patio/" + filename);
    audio.volume = 0.38;
    effectAudioRef.current = audio;
    void audio.play().catch(() => setSoundMessage("Audio could not play. Try tapping Play Wind Chimes again."));
  };
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("shoreline-patio-sound-settings-v1") || "{}");
      if (typeof saved.automaticChimes === "boolean") setAutomaticChimes(saved.automaticChimes);
      if (["mixed", "small", "bamboo"].includes(saved.chimeStyle)) setChimeStyle(saved.chimeStyle);
      if (typeof saved.fountainOn === "boolean") setFountainOn(saved.fountainOn);
    } catch {}
  }, []);
  useEffect(() => {
    try { window.localStorage.setItem("shoreline-patio-sound-settings-v1", JSON.stringify({ automaticChimes, chimeStyle, fountainOn })); } catch {}
  }, [automaticChimes, chimeStyle, fountainOn]);
  useEffect(() => {
    if (area !== "patio" || !placements["patio-chime"] || !automaticChimes) {
      stopChime();
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        if (!document.hidden) playChime();
        schedule();
      }, 25000 + Math.random() * 40000);
    };
    schedule();
    return () => { clearTimeout(timer); stopChime(); };
  }, [area, placements["patio-chime"], automaticChimes, chimeStyle]);
  useEffect(() => {
    if (area !== "patio" || !placements["patio-fountain"] || !fountainOn) {
      fountainAudioRef.current?.pause();
      fountainAudioRef.current = null;
      return;
    }
    const audio = new Audio("/audio/Patio/fountain-loop.mp3");
    audio.loop = true;
    audio.volume = 0.22;
    fountainAudioRef.current = audio;
    void audio.play().catch(() => { /* Mobile autoplay may require a user gesture. */ });
    return () => { audio.pause(); audio.src = ""; if (fountainAudioRef.current === audio) fountainAudioRef.current = null; };
  }, [area, placements["patio-fountain"], fountainOn]);
  useEffect(() => () => { effectAudioRef.current?.pause(); fountainAudioRef.current?.pause(); }, []);
  const [night, setNight] = useState(false);
  const patioBirds = [
    { name: "Robin", calls: ["Robin-greeting.mp3"], image: "/images/Birds/bird-robin.png" },
    { name: "Blue jay", calls: ["bird-bluejay-1.mp3", "bird-bluejay-2.mp3", "bird-bluejay-3.mp3"], image: "/images/Birds/bird-bluejay.png" },
    { name: "Chickadee", calls: ["bird-chickadee-1.mp3"], image: "/images/Birds/bird-chickadee.png" },
    { name: "Goldfinch", calls: ["bird-goldfinch-1.mp3", "bird-goldfinch-2.mp3", "bird-goldfinch-3.mp3"], image: "/images/Birds/bird-goldfinch.png" },
    { name: "Hummingbird", calls: ["bird-hummingbird-1.mp3"], image: "/images/Birds/bird-hummingbird.png" },
    { name: "Wren", calls: ["bird-wren-1.mp3", "bird-wren-2.mp3", "bird-wren-3.mp3"], image: "/images/Birds/bird-wren.png" },
  ];
  const [visitingBird, setVisitingBird] = useState<number | null>(null);
  const [birdMessage, setBirdMessage] = useState("");
  const birdAudioRef = useRef<HTMLAudioElement | null>(null);
  const [birdGift, setBirdGift] = useState<{ day: string; item: string; bird: string } | null>(null);
  const [birdGiftMessage, setBirdGiftMessage] = useState("");
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("shoreline-patio-bird-gifts-v1") || "{}");
      if (saved.pending) setBirdGift(saved.pending);
    } catch {}
  }, []);
  const leaveBirdGift = (index: number) => {
    try {
      const key = "shoreline-patio-bird-gifts-v1";
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      const today = new Date().toLocaleDateString("en-CA");
      if (saved.lastVisit === today) return;
      saved.lastVisit = today;
      if (!saved.pending && Math.random() < 0.55) {
        const item = Math.random() < 0.8 ? "bird-feather" : "pinecone";
        saved.pending = { day: today, item, bird: patioBirds[index].name };
        setBirdGift(saved.pending);
        setBirdGiftMessage("A visiting bird has left something near the birdbath. Search the patio to collect it.");
      }
      localStorage.setItem(key, JSON.stringify(saved));
    } catch {}
  };
  const collectBirdGift = () => {
    if (!birdGift) return;
    collectItem(birdGift.item, { silent: true });
    setBirdGiftMessage(`You found ${ITEMS[birdGift.item]?.name || "a gift"} left by a ${birdGift.bird.toLowerCase()}! Added to inventory.`);
    setBirdGift(null);
    try {
      const key = "shoreline-patio-bird-gifts-v1";
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      delete saved.pending;
      localStorage.setItem(key, JSON.stringify(saved));
    } catch {}
  };

  const playBirdCall = (index: number) => {
    const bird = patioBirds[index];
    if (!bird) return;
    birdAudioRef.current?.pause();
    const file = bird.calls[Math.floor(Math.random() * bird.calls.length)];
    const audio = new Audio(file === "Robin-greeting.mp3" ? "/audio/" + file : "/audio/Birds/" + file);
    audio.volume = 0.28;
    birdAudioRef.current = audio;
    void audio.play().catch(() => setBirdMessage("Bird sound could not play. Try the Listen button again."));
  };
  useEffect(() => {
    if (area !== "patio" || night) {
      setVisitingBird(null);
      birdAudioRef.current?.pause();
      return;
    }
    let arrivalTimer: ReturnType<typeof setTimeout>;
    let departureTimer: ReturnType<typeof setTimeout>;
    let active = true;
    const schedule = () => {
      arrivalTimer = setTimeout(() => {
        if (!active) return;
        if (!document.hidden) {
          const index = Math.floor(Math.random() * patioBirds.length);
          setVisitingBird(index);
          leaveBirdGift(index);
          setBirdMessage(patioBirds[index].name + " is visiting the patio.");
          clearTimeout(departureTimer);
          departureTimer = setTimeout(() => {
            if (active) { setVisitingBird(null); setBirdMessage("The bird has flown away."); }
          }, 45000);
        }
        schedule();
      }, 60000 + Math.random() * 45000);
    };
    schedule();
    return () => { active = false; clearTimeout(arrivalTimer); clearTimeout(departureTimer); birdAudioRef.current?.pause(); };
  }, [area, night]);
  useEffect(() => () => { birdAudioRef.current?.pause(); }, []);

  type ArchieGift = { id: string; name: string; night: string; hidingPlace: number };
  const archiePlaces = ["behind the flower planter", "beside the patio birdbath", "under the patio chair"];
  const archieGifts = [
    { id: "shoreline-page", name: "Forgotten Shoreline Book Page", image: "/images/Hut/Archie-book-pages.png" },
    { id: "salt-grass-bookmark", name: "Pressed Salt-Grass Bookmark", image: "/images/Hut/Archie-bookmark.png" },
    { id: "midnight-candle", name: "Midnight Reading Candle", image: "/images/Hut/Archie-midnight-candle.png" },
    { id: "old-map-fragment", name: "Old Shoreline Map Fragment", image: "/images/Hut/Archie-map-fragment.png" },
  ];
  const [archiePending, setArchiePending] = useState<ArchieGift[]>([]);
  const [archieFound, setArchieFound] = useState<ArchieGift[]>([]);
  const [archieMessage, setArchieMessage] = useState("");
  const [archieSeen, setArchieSeen] = useState(false);
  const [archieReady, setArchieReady] = useState(false);
  const archieAudioRef = useRef<HTMLAudioElement | null>(null);
  const archieKey = "shoreline-archie-visits-v1";
  const saveArchie = (pending: ArchieGift[], found: ArchieGift[], lastNight: string) => {
    try { window.localStorage.setItem(archieKey, JSON.stringify({ pending, found, lastNight })); } catch {}
    setArchiePending(pending);
    setArchieFound(found);
  };
  useEffect(() => {
    const today = new Date();
    const dayKey = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
    const previous = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const eligibleNight = night ? today : previous;
    const nightKey = dayKey(eligibleNight);
    let saved: { pending?: ArchieGift[]; found?: ArchieGift[]; lastNight?: string } = {};
    try { saved = JSON.parse(window.localStorage.getItem(archieKey) || "{}"); } catch {}
    const pending = Array.isArray(saved.pending) ? saved.pending : [];
    const found = Array.isArray(saved.found) ? saved.found : [];
    // Archie visits roughly three nights a week. Unfound gifts stay until collected.
    const dayNumber = Math.floor(new Date(eligibleNight.getFullYear(), eligibleNight.getMonth(), eligibleNight.getDate()).getTime() / 86400000);
    if (saved.lastNight !== nightKey && dayNumber % 7 < 3) {
      const count = pending.length + found.length;
      const gift = archieGifts[count % archieGifts.length];
      pending.push({ ...gift, night: nightKey, hidingPlace: (dayNumber + 700000) % archiePlaces.length });
    }
    const lastNight = saved.lastNight === nightKey || dayNumber % 7 < 3 ? nightKey : (saved.lastNight || nightKey);
    saveArchie(pending, found, lastNight);
    setArchieReady(true);
  }, [night]);
  useEffect(() => {
    if (area !== "patio" || !night) { setArchieSeen(false); return; }
    // Archie is elusive: only occasional sightings, never guaranteed.
    const seen = Math.random() < 0.16;
    setArchieSeen(seen);
    return () => setArchieSeen(false);
  }, [area, night]);
  useEffect(() => () => { archieAudioRef.current?.pause(); }, []);
  const listenForArchie = () => {
    archieAudioRef.current?.pause();
    const audio = new Audio("/audio/Birds/Archie_Owl_Call_Ready.mp3");
    audio.volume = 0.32;
    archieAudioRef.current = audio;
    void audio.play().catch(() => setArchieMessage("Archie's call could not play. Try again."));
    setArchieMessage(archieSeen ? "A soft owl call echoes across the patio. Archie watches quietly from the railing." : "A soft owl call echoes across the patio. Archie remains hidden in the night.");
  };
  const searchArchie = (place: number) => {
    if (night) { setArchieMessage("Archie prefers privacy at night. Search for his gifts after sunrise."); return; }
    const index = archiePending.findIndex(gift => gift.hidingPlace === place);
    if (index < 0) { setArchieMessage("You searched " + archiePlaces[place] + ", but found no gift this time."); return; }
    const gift = archiePending[index];
    const nextPending = archiePending.filter((_, i) => i !== index);
    const saved = (() => { try { return JSON.parse(window.localStorage.getItem(archieKey) || "{}"); } catch { return {}; } })();
    saveArchie(nextPending, [...archieFound, gift], saved.lastNight || "");
    setArchieMessage("You found Archie's " + gift.name + "! It has been added to Archie's keepsake collection.");
  };
  const [fireOn, setFireOn] = useState(true);
  const fireplaceAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = new Audio("/audio/Hut-Fireplace-Crackling-Loop.mp3");
    audio.loop = true;
    audio.volume = 0.2;
    fireplaceAudioRef.current = audio;
    return () => { audio.pause(); audio.removeAttribute("src"); audio.load(); fireplaceAudioRef.current = null; };
  }, []);
  useEffect(() => {
    const audio = fireplaceAudioRef.current;
    if (!audio) return;
    if (area !== "inside" || !fireOn) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [area, fireOn]);
  const toggleFireplace = () => {
    const next = !fireOn;
    setFireOn(next);
    const audio = fireplaceAudioRef.current;
    if (!audio) return;
    if (next && area === "inside") void audio.play().catch(() => {});
    else { audio.pause(); audio.currentTime = 0; }
  };

  const closeRef = useRef<HTMLButtonElement>(null);
  const destinationRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () => { const hour = new Date().getHours(); setNight(hour >= 19 || hour < 6); };
    update();
    try { const flowers = JSON.parse(window.localStorage.getItem("shoreline-patio-flower-box-v1") || "[]"); if (Array.isArray(flowers)) setPatioBoxFlowers(flowers.filter(x => typeof x === "string")); } catch {}
    try { const flowers = JSON.parse(window.localStorage.getItem("shoreline-tidekeeper-flowers-v1") || "[]"); if (Array.isArray(flowers)) setVaseFlowers(flowers.filter(x => typeof x === "string")); } catch {}
    try {
      const stored = JSON.parse(window.localStorage.getItem("shoreline-hut-displays-v1") || "{}");
      if (stored && typeof stored === "object" && !Array.isArray(stored)) {
        const legacyFlower = stored["patio-planter"];
        if (typeof legacyFlower === "string" && ((legacyFlower.startsWith("plant-") && /flower|rose/i.test(ITEMS[legacyFlower]?.name || "")) || (legacyFlower.startsWith("flower-") && /flower|rose|bouquet/i.test(ITEMS[legacyFlower]?.name || "")))) {
          const existing = JSON.parse(window.localStorage.getItem("shoreline-patio-flower-box-v1") || "[]");
          const nextFlowers = Array.isArray(existing) ? existing.filter(x => typeof x === "string") : [];
          if (nextFlowers.length < 6 && nextFlowers.filter(x => x === legacyFlower).length < (state.inventory[legacyFlower] || 0)) nextFlowers.push(legacyFlower);
          setPatioBoxFlowers(nextFlowers);
          window.localStorage.setItem("shoreline-patio-flower-box-v1", JSON.stringify(nextFlowers));
          delete stored["patio-planter"];
          window.localStorage.setItem("shoreline-hut-displays-v1", JSON.stringify(stored));
        }
        setPlacements(stored);
      }
    } catch {}
    const timer = window.setInterval(update, 60000);
    setSelectedSlot(null);
    entranceReadyAt.current = Date.now() + 450;
    closeRef.current?.focus();
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    setMusicOverride(area === "inside" ? "hut" : "hutPatio");
    return () => setMusicOverride(null);
  }, [area, setMusicOverride]);
  const changeArea = (next: Area) => {
    setSelectedSlot(null);
    setShowPatioSounds(false);
    setArea(next);
    window.setTimeout(() => destinationRef.current?.focus(), 0);
  };
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 p-2 sm:p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-label={area === "inside" ? "Your seaside hut" : "Your seaside patio"} className="flex max-h-[98dvh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl bg-[#fff7e9] p-2 sm:p-3 shadow-2xl">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-teal-950">{area === "inside" ? "Your Seaside Hut" : "Oceanfront Patio"}</h2>
          <button ref={closeRef} type="button" onClick={onClose} className="min-h-11 rounded-xl bg-teal-900 px-4 py-2 font-bold text-white">Return to Beach</button>
        </div>
        <p className="sr-only" aria-live="polite">{area === "inside" ? "Inside your hut. Three display shelves, a fireplace, seating, and a door to the patio." : "On your patio overlooking the beach. A door leads back inside."} {night ? "It is nighttime." : "It is daytime."}</p>
        <div className="relative mx-auto w-full shrink-0 overflow-hidden rounded-xl" style={{ aspectRatio: area === "inside" ? "3 / 4" : "2 / 3" }}>
          <Image src={imagePath(area, night)} alt={area === "inside" ? (night ? "Cozy hut interior at night with a glowing fireplace and moonlit ocean beyond the patio door" : "Sunny hut interior with three wooden shelves, fireplace, cozy furniture and a glass door to the patio") : (night ? "Wooden oceanfront patio beneath the moon and lantern light" : "Sunny oceanfront patio with flowers, wind chimes and room for decorations")} fill unoptimized priority sizes="(max-width: 640px) 100vw, 640px" className="object-cover" />
          {area === "inside" && activeCurtains && (
            <div aria-hidden="true" className="pointer-events-none absolute z-[2]" style={{ left: "45%", top: "17%", width: "29%", height: "35%" }}>
              <Image src={`/images/Hut/${activeCurtains.file}${curtainsClosed ? "_Closed" : ""}.png`} alt="" fill unoptimized sizes="220px" className="object-contain" />
            </div>
          )}
          {area === "inside" && fireOn && (
            <div aria-hidden="true" className="pointer-events-none absolute z-[1] overflow-hidden" style={{
              left: night ? "4%" : "1.9%", top: night ? "49.5%" : "47.1%",
              width: night ? "7%" : "6.8%", height: night ? "6.5%" : "6.0%",
              borderRadius: "28% 28% 8% 8%"
            }}>
              <div className="absolute bottom-[4%] left-[6%] h-[35%] w-[88%] rounded-full" style={{
                background: "radial-gradient(ellipse at bottom, rgba(255,184,95,.8), rgba(66,205,221,.35) 50%, transparent 80%)"
              }} />
              {[
                { left: "10%", width: "35%", height: "60%", color: "#51dcd9", delay: "-.2s" },
                { left: "33%", width: "35%", height: "78%", color: "#b5a0f5", delay: "-.9s" },
                { left: "57%", width: "30%", height: "56%", color: "#83c6f5", delay: "-1.4s" },
              ].map((flame, index) => (
                <div key={index} className="hut-magic-flame absolute bottom-[12%] origin-bottom" style={{
                  left: flame.left, width: flame.width, height: flame.height,
                  background: `linear-gradient(to top, #ffd59a, ${flame.color} 55%, transparent)`,
                  borderRadius: "65% 35% 50% 50% / 90% 85% 20% 20%",
                  animationDelay: flame.delay
                }} />
              ))}
              <div className="absolute bottom-[6%] left-[12%] h-[9%] w-[76%] rounded-full bg-amber-200/80 blur-[2px]" />
            </div>
          )}
          <style jsx>{`
            @keyframes hut-magic-flicker {
              0%, 100% { transform: scaleX(.9) scaleY(.86) rotate(-3deg); opacity: .8; }
              50% { transform: scaleX(1.08) scaleY(1.05) rotate(3deg); opacity: 1; }
            }
            .hut-magic-flame { animation: hut-magic-flicker 2.4s ease-in-out infinite alternate; }
            @media (prefers-reduced-motion: reduce) { .hut-magic-flame { animation: none; } }
          `}</style>
          {area === "patio" && night && archieSeen && (
            <button type="button" onClick={listenForArchie} aria-label="Rare sighting: Archie the night owl on the patio railing" className="absolute right-[9%] top-[25%] z-30 flex h-[22%] w-[22%] items-center justify-center rounded-xl drop-shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300">
              <Image src="/images/Birds/Archie-owl.PNG" alt="" fill unoptimized sizes="24vw" className="object-contain" />
            </button>
          )}
          {area === "patio" && visitingBird !== null && !night && (
            <button type="button" onClick={() => { setBirdMessage(patioBirds[visitingBird].name + " sings near the patio birdbath."); playBirdCall(visitingBird); }}
              aria-label={patioBirds[visitingBird].name + " visiting the patio. Listen to bird call"}
              className="absolute left-[12%] top-[48%] z-20 flex h-[12%] w-[16%] items-center justify-center rounded-full drop-shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300">
              <Image src={patioBirds[visitingBird].image} alt="" fill unoptimized sizes="15vw" className="object-contain drop-shadow-lg" />
            </button>
          )}
          {activeSlots.map(slot => {
            const id = placements[slot.id];
            const nightInterior = area === "inside" && night;
            const slotX = nightInterior ? ({"shelf1-left":22,"shelf1-right":34,"shelf2-left":22,"shelf2-right":34,"shelf3-left":22,"shelf3-right":34,"fireplace-mantel":17,"wall":86,"wall-left":86,"wall-right":90,"coffee-table":59,"side-table":98,"sofa-pillow-left":34,"sofa-pillow-right":49,"shell-chair":61} as Record<string, number>)[slot.id] ?? slot.x : slot.x;
            const slotY = nightInterior ? ({"shelf1-left":23,"shelf1-right":24.5,"shelf2-left":30,"shelf2-right":30,"shelf3-left":36.5,"shelf3-right":36.5,"fireplace-mantel":59,"wall":38,"wall-left":29,"wall-right":46,"coffee-table":53,"side-table":62,"sofa-pillow-left":49,"sofa-pillow-right":49,"shell-chair":73} as Record<string, number>)[slot.id] ?? slot.y : slot.y;
            const daytimeAdjustments: Record<string, { x?: number; y?: number }> = {
              "shelf1-left": { x: 21.5, y: 18.4 }, "shelf1-right": { x: 32, y: 19.3 },
              "shelf2-left": { x: 21.5, y: 24.8 }, "shelf2-right": { x: 32, y: 26.1 },
              "shelf3-left": { x: 21.5, y: 31.3 }, "shelf3-right": { x: 32, y: 31.6 },
              "wall": { x: 87, y: 38 }, "wall-left": { x: 86, y: 29 }, "wall-right": { x: 90, y: 46 },
              "fireplace-mantel": { x: 17, y: 59 },
              "sofa-pillow-left": { x: 31, y: 49 }, "sofa-pillow-right": { x: 45, y: 49 },
              "coffee-table": { x: 56.5, y: 53.8 }, "side-table": { x: 96, y: 64 },
            };
            const adjustedX = area === "inside" && !night ? (daytimeAdjustments[slot.id]?.x ?? slotX) : slotX;
            const adjustedY = area === "inside" && !night ? (daytimeAdjustments[slot.id]?.y ?? slotY) : slotY;
            const item = id && (isArrangement(id) ? { id, name: decorName(id), icon: decorIcon(id), isEmoji: false } : ITEMS[id]);
            const smallTableDecor = isTableSlot(slot.id) && /cup|mug|candle|teacup/i.test(item ? item.name : "");
            const decorWidth = isChairSlot(slot.id) ? "24%" : isPillowSlot(slot.id) ? "7.2%" : isWallSlot(slot.id) ? "12%" : smallTableDecor ? "7%" : isTableSlot(slot.id) ? "10%" : "9%";
            const decorHeight = isChairSlot(slot.id) ? "17%" : isPillowSlot(slot.id) ? "5.6%" : isWallSlot(slot.id) ? "10%" : smallTableDecor ? "7%" : isTableSlot(slot.id) ? "8%" : "6%";
            return <button key={slot.id} type="button" onClick={() => openDecoration(slot.id)} aria-label={`${slot.name}, ${item ? item.name : "empty"}, decorate`} className="absolute z-10 flex items-center justify-center rounded-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300" style={{ left: `calc(${adjustedX}% - ${area === "inside" ? decorWidth : "10%"} / 2)`, top: `calc(${adjustedY}% - ${area === "inside" ? decorHeight : "8%"} / 2)`, width: area === "inside" ? decorWidth : slot.id === "patio-fountain" ? "24%" : slot.id.startsWith("patio-chair") ? "22%" : slot.id === "patio-chime" ? "11%" : isWallSlot(slot.id) ? "14%" : isChairSlot(slot.id) ? "22%" : isPillowSlot(slot.id) ? "11%" : slot.id === "side-table" && !night ? "8%" : isTableSlot(slot.id) ? "11%" : "10%", height: area === "inside" ? decorHeight : slot.id === "patio-fountain" ? "23%" : slot.id.startsWith("patio-chair") ? "20%" : slot.id === "patio-chime" ? "14%" : isWallSlot(slot.id) ? "12%" : isChairSlot(slot.id) ? "21%" : isPillowSlot(slot.id) ? "9%" : slot.id === "side-table" && !night ? "7%" : isTableSlot(slot.id) ? "9%" : "6.5%" }}>
              {(item || slot.id === "patio-planter") && <div className={area === "inside" && !night && slot.id === "shelf2-right" ? "h-[85%] w-[85%]" : "h-full w-full"}>{slot.id === "patio-planter" && !item ? <PatioFlowerBox flowers={patioBoxFlowers} /> : item && isArrangement(item.id) && arrangementFor(item.id) ? <ArrangementArt vaseIcon={item.icon} stems={arrangementFor(item.id)!.stems} name={item.name} /> : item ? <DisplayArt key={item.id} icon={item.icon} name={item.name} isEmoji={item.isEmoji} /> : null}</div>}
              <span className="sr-only">{slot.name}</span>
            </button>;
          })}
          {area === "inside" ? (
            <>
              <button type="button" onClick={() => changeArea("patio")} aria-label="Open patio door and go outside" className="absolute left-[71%] top-[20%] h-[36%] w-[27%] rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"><span className="sr-only">Go to Patio</span></button>
              <button type="button" onClick={toggleFireplace} aria-label={fireOn ? "Fireplace, turn fire off" : "Fireplace, turn fire on"} aria-pressed={fireOn} className="absolute left-[1%] top-[43%] h-[13%] w-[13%] rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"><span className="sr-only">Toggle Fireplace</span></button>
            </>
          ) : (
            <button type="button" onClick={() => changeArea("inside")} aria-label="Open hut door and go inside" className="absolute left-[1%] top-[15%] h-[47%] w-[29%] rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"><span className="sr-only">Go Inside</span></button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button ref={destinationRef} type="button" onClick={() => changeArea(area === "inside" ? "patio" : "inside")} className="min-h-11 rounded-xl bg-teal-800 px-3 py-1.5 text-sm font-semibold text-white">{area === "inside" ? "Go to Patio" : "Go Inside"}</button>
          {area === "inside" && <button type="button" onClick={toggleFireplace} aria-pressed={fireOn} className="min-h-11 rounded-xl border border-teal-800 px-3 py-1.5 text-sm font-semibold text-teal-950">{fireOn ? "Turn Fireplace Off" : "Turn Fireplace On"}</button>}
        </div>
        {area === "patio" && <section aria-label="Patio bird visitors" className="mt-2 rounded-xl border border-teal-800/40 p-3 text-sm text-teal-950">
          <p aria-live="polite">{birdMessage || (night ? "The daytime birds are resting." : "Listen for birds visiting the patio during the day.")}</p>
          {visitingBird !== null && !night && <button type="button" onClick={() => playBirdCall(visitingBird)} className="mt-2 min-h-11 rounded-lg border border-teal-800 px-3 py-2 font-semibold">Listen to {patioBirds[visitingBird].name}</button>}
          {!night && birdGift && <button type="button" onClick={collectBirdGift} className="mt-2 min-h-11 rounded-lg bg-teal-800 px-3 py-2 font-semibold text-white">Search near the birdbath for a bird gift</button>}
          {birdGiftMessage && <p role="status" className="mt-2">{birdGiftMessage}</p>}
        </section>}
        {area === "patio" && archieReady && (
          <section aria-labelledby="archie-title" className="mt-2 rounded-xl border border-indigo-300 bg-indigo-50 p-3 text-sm text-indigo-950">
            <h3 id="archie-title" className="text-base font-bold">Archie the Night Owl</h3>
            <p className="mt-1">{night ? "Archie sometimes visits after sunset, but rarely allows himself to be seen. Any gifts he leaves can be searched for in daylight." : "Search the patio for anything Archie may have left overnight. His gifts remain until discovered."}</p>
            {night ? <button type="button" onClick={listenForArchie} className="mt-2 min-h-11 rounded-lg border border-indigo-700 px-3 py-2 font-semibold">Listen for Archie's call</button> : (
              <div className="mt-2 flex flex-wrap gap-2">
                {archiePlaces.map((place, index) => <button key={place} type="button" onClick={() => searchArchie(index)} className="min-h-11 rounded-lg border border-indigo-700 px-3 py-2 font-semibold">Search {place}</button>)}
              </div>
            )}
            {archieMessage && <p className="mt-2" role="status" aria-live="polite">{archieMessage}</p>}
            <p className="mt-2">Archie's keepsakes discovered: {archieFound.length}. Book pages: {archieFound.filter(g => g.id === "shoreline-page").length}. Map fragments: {archieFound.filter(g => g.id === "old-map-fragment").length}.</p>
            {archieFound.length > 0 && <details className="mt-2"><summary className="cursor-pointer font-semibold">View discovered keepsakes</summary><ul className="mt-1 list-inside list-disc">{archieFound.map((gift, index) => <li key={gift.night + index} className="flex items-center gap-2"><Image src={archieGifts.find(item => item.id === gift.id)?.image || "/images/Hut/Archie-book-pages.png"} alt="" width={56} height={56} unoptimized className="h-14 w-14 object-contain" /><span>{gift.name}</span></li>)}</ul></details>}
          </section>
        )}
        {area === "inside" && <span className="sr-only" role="status">Fireplace {fireOn ? "on" : "off"}. Magical colored flames are displayed when the fireplace is on.</span>}
        <button type="button" onClick={() => openDecoration(area === "inside" ? "shelf1-left" : "patio-fountain")} className="mt-2 min-h-11 rounded-xl bg-teal-800 px-4 py-2 font-semibold text-white">{area === "inside" ? "Decorate Your Hut" : "Decorate Your Patio"}</button>
        {area === "patio" && (placements["patio-chime"] || placements["patio-fountain"]) && <button type="button" aria-expanded={showPatioSounds} onClick={() => setShowPatioSounds(v => !v)} className="mt-2 min-h-11 rounded-xl border border-teal-800 px-3 py-1.5 text-sm font-semibold text-teal-950">{showPatioSounds ? "Close Patio Sounds" : "Patio Sounds"}</button>}
        {area === "patio" && showPatioSounds && (placements["patio-chime"] || placements["patio-fountain"]) && <section aria-label="Patio sounds" className="mt-3 rounded-xl border border-teal-800 p-3">
          <h3 className="font-bold text-teal-950">Patio Sounds</h3>
          {placements["patio-chime"] && <>
            <button type="button" onClick={playChime} className="mt-2 min-h-11 rounded-lg bg-teal-800 px-3 text-white">{placements["patio-chime"] === "winter-chimes" ? "Play Winter Chimes" : "Play Wind Chimes"}</button>
            <label className="mt-2 flex items-center gap-2"><input type="checkbox" checked={automaticChimes} onChange={e => setAutomaticChimes(e.target.checked)} /> Occasional breeze sounds</label>
            {placements["patio-chime"] !== "winter-chimes" && <><label htmlFor="chime-style" className="mt-2 block">Wind chime sound</label>
            <select id="chime-style" value={chimeStyle} onChange={e => setChimeStyle(e.target.value as "mixed" | "small" | "bamboo")} className="min-h-11 w-full rounded-lg border p-2">
              <option value="mixed">Mixed chimes</option><option value="small">Small metal chimes</option><option value="bamboo">Bamboo chimes</option>
            </select></>}
          </>}
          {placements["patio-fountain"] && <button type="button" onClick={() => {
            if (fountainOn) {
              fountainAudioRef.current?.pause();
              if (fountainAudioRef.current) fountainAudioRef.current.currentTime = 0;
              setFountainOn(false);
              setSoundMessage("Fountain sound off.");
            } else {
              setFountainOn(true);
              setSoundMessage("Fountain sound on.");
            }
          }} aria-pressed={fountainOn} className="mt-2 min-h-11 rounded-lg border border-teal-800 px-3 text-teal-950">{fountainOn ? "Turn Fountain Sound Off" : "Turn Fountain Sound On"}</button>}
          <p role="status" className="text-sm">{soundMessage}</p>
        </section>}
        {area === "inside" && <section aria-label="Hut window curtains" className="mt-3 rounded-xl border border-teal-200 bg-white p-3">
          <h3 className="font-bold text-teal-950">Window Curtains</h3>
          <p className="text-sm">Current: {activeCurtains ? `${activeCurtains.name}, ${curtainsClosed ? "closed" : "open"}` : "No curtains hung"}.</p>
          <label htmlFor="hut-curtain-style" className="mt-2 block font-medium">Choose curtains from your inventory</label>
          <select id="hut-curtain-style" className="min-h-11 w-full rounded-lg border p-2" value={activeCurtains?.id || ""} onChange={e => saveCurtains(e.target.value, false)}>
            <option value="">No curtains</option>
            {curtainStyles.filter(c => (state.inventory[c.id] || 0) > 0).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="button" disabled={!activeCurtains} aria-pressed={curtainsClosed} onClick={() => saveCurtains(curtainStyle, !curtainsClosed)} className="mt-2 min-h-11 rounded-lg bg-teal-800 px-4 py-2 font-semibold text-white disabled:opacity-50">{curtainsClosed ? "Open Curtains" : "Close Curtains"}</button>
          <p role="status" aria-live="polite" className="mt-2 text-sm">{announcement}</p>
        </section>}
        {selectedSlot && <section role="dialog" aria-label="Choose a decoration" className="mt-3 rounded-xl border border-teal-800 bg-white p-3">
          <h3 className="font-bold text-teal-950">{slots.find(s => s.id === selectedSlot)?.name}</h3>
          <p className="text-sm">Current: {placements[selectedSlot] ? decorName(placements[selectedSlot]) : selectedSlot === "patio-planter" ? "Driftwood flower box" : "Empty"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => moveSlot(-1)} className="min-h-11 rounded-lg border px-3">Move Left</button>
            <button type="button" onClick={() => moveSlot(1)} className="min-h-11 rounded-lg border px-3">Move Right</button>
            <button type="button" onClick={clearSlot} className="min-h-11 rounded-lg border px-3">Remove</button>
            <button type="button" onClick={() => setSelectedSlot(null)} className="min-h-11 rounded-lg bg-teal-900 px-3 text-white">Done</button>
          </div>
          <label htmlFor="hut-slot" className="mt-3 block font-semibold">Display position</label>
          <select id="hut-slot" value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} className="min-h-11 w-full rounded-lg border p-2">{activeSlots.map(slot => <option key={slot.id} value={slot.id}>{slot.name}</option>)}</select>
          {selectedSlot === "patio-planter" && !placements["patio-planter"] && <div className="mt-3 rounded-lg border p-2">
            <h4 className="font-semibold">Driftwood Flower Box</h4>
            <p>Choose up to six flowers from your inventory. Flowers remain in your inventory.</p>
            <p>Currently displayed: {patioBoxFlowers.length ? patioBoxFlowers.map(id => ITEMS[id]?.name || id).join(", ") : "No flowers yet"}</p>
            {flowerOptions.map(([id, count]) => <button key={id} type="button" disabled={patioBoxFlowers.length >= 6 || patioBoxFlowers.filter(x => x === id).length >= count} onClick={() => { savePatioBoxFlowers([...patioBoxFlowers, id]); setAnnouncement(ITEMS[id].name + " added to the patio flower box."); }} className="mb-1 block min-h-11 w-full rounded-lg border p-2 text-left disabled:opacity-50">Add {ITEMS[id].name}</button>)}
            <button type="button" onClick={() => { savePatioBoxFlowers([]); setAnnouncement("Patio flower box cleared."); }} className="min-h-11 rounded-lg border p-2">Remove All Flowers</button>
          </div>}
          <p className="mt-2 text-sm">Choose an owned decoration:</p>
          <div className="mt-2 max-h-52 overflow-y-auto">
            {ownedDecor.filter(([id]) => slotAccepts(selectedSlot, id) && !(selectedSlot === "patio-planter" && isDisplayFlower(id))).map(([id, count]) => <button key={id} type="button" disabled={usedCount(id, selectedSlot) >= count} onClick={() => place(id)} className="mb-1 block min-h-11 w-full rounded-lg border border-slate-300 p-2 text-left text-teal-950 disabled:opacity-50">{ITEMS[id].name} (available: {Math.max(0, count - usedCount(id, selectedSlot))})</button>)}
            {isFlowerSlot(selectedSlot) && availableArrangements.map(a => <button key={a.id} type="button" onClick={() => place("arrangement:" + a.id)} className="mb-1 block min-h-11 w-full rounded-lg border border-slate-300 p-2 text-left text-teal-950">Flower arrangement: {a.name}</button>)}
            {isFlowerSlot(selectedSlot) && state.flowerArrangements.filter(a => usedCount("arrangement:" + a.id) > 0).map(a => <p key={a.id} className="text-sm">{a.name}: displayed at {slots.find(s => placements[s.id] === "arrangement:" + a.id)?.name || "another spot"}</p>)}
            {ownedDecor.length === 0 && availableArrangements.length === 0 && <p>No available decorations in inventory yet.</p>}
            {placements[selectedSlot] === "tidekeeper-vase" && <div className="mt-3 rounded-lg border p-2">
              <h4 className="font-semibold">Flowers in Tidekeeper's Vase</h4>
              <p>{vaseFlowers.length ? vaseFlowers.map(id => ITEMS[id]?.name || id).join(", ") : "Vase is empty."}</p>
              {flowerOptions.map(([id, count]) => <button key={id} type="button" disabled={vaseFlowers.filter(x => x === id).length >= count} onClick={() => { saveVaseFlowers([...vaseFlowers, id]); setAnnouncement(ITEMS[id].name + " added to Tidekeeper's Vase."); }} className="mb-1 block min-h-11 w-full rounded-lg border p-2 text-left disabled:opacity-50">Add {ITEMS[id].name}</button>)}
              <button type="button" onClick={() => { saveVaseFlowers([]); setAnnouncement("Flowers removed from Tidekeeper's Vase."); }} className="min-h-11 rounded-lg border p-2">Remove Flowers</button>
            </div>}
          </div>
          <p role="status" aria-live="polite" className="mt-2 text-sm">{announcement}</p>
        </section>}
      </section>
    </div>
  );
}
