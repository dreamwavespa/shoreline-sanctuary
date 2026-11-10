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
const imagePath = (area: Area, night: boolean) =>
  area === "inside" && !night ? "/images/Hut/Hut-day-updated.PNG" : `/images/Hut/${area === "inside" ? "Hut" : "Patio"}-${night ? "night" : "day"}.PNG${area === "inside" && night ? "?v=night-hut-refresh-20261108" : ""}`;

export default function HutScene({ onClose }: { onClose: () => void }) {
  const { state, setMusicOverride } = useGame();
  const [area, setArea] = useState<Area>("inside");
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
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
    if (slot === "patio-chime") return /wind.chime/i.test(name);
    if (slot === "patio-lantern") return /lantern/i.test(name);
    if (slot === "patio-planter") return /flower|bouquet|plant|vase/i.test(name);
    return true;
  };
  const isWallSlot = (id: string) => id.startsWith("wall");
  const isPillowSlot = (id: string) => id.startsWith("sofa-pillow");
  const isChairSlot = (id: string) => id === "shell-chair";
  const isPillowDecor = (id: string) => /pillow|cushion/i.test(id + " " + (ITEMS[id]?.name || ""));
  const isChairDecor = (id: string) => /shell.chair|seashell.chair|pearl.shell.chair/i.test(id + " " + (ITEMS[id]?.name || ""));
  const isTableSlot = (id: string) => id.includes("table") || id === "fireplace-mantel";
  const isWallDecor = (id: string) => /paint|artwork|mirror|wall|canvas|portrait/i.test(id + " " + (ITEMS[id]?.name || ""));
  const ownedDecor = Object.entries(state.inventory).filter(([id, count]) =>
    count > 0 && ITEMS[id] && (ITEMS[id].category === "decor" || (id.includes("painting") || id.includes("artwork")))
  ).sort((a, b) => ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name));
  const savePlacement = (next: Record<string, string>) => {
    setPlacements(next);
    try { window.localStorage.setItem("shoreline-hut-displays-v1", JSON.stringify(next)); } catch {}
  };
  const place = (id: string) => {
    if (!selectedSlot) return;
    if (isPatioSlot(selectedSlot) && !patioMatches(selectedSlot, id)) { setAnnouncement("Choose a suitable patio decoration for this position."); return; }
    if (isPillowSlot(selectedSlot) && !isPillowDecor(id)) { setAnnouncement("Choose a pillow or cushion for the sofa."); return; }
    if (isChairSlot(selectedSlot) && !isChairDecor(id)) { setAnnouncement("Choose your seashell chair for this corner."); return; }
    if (isWallSlot(selectedSlot) && !isWallDecor(id)) { setAnnouncement("Choose a painting, mirror, or other wall artwork for this position."); return; }
    const count = state.inventory[id] || 0;
    const usedElsewhere = Object.entries(placements).filter(([slot, item]) => slot !== selectedSlot && item === id).length;
    if (usedElsewhere >= count) { setAnnouncement("All owned copies of that decoration are already displayed."); return; }
    savePlacement({ ...placements, [selectedSlot]: id });
    setAnnouncement(`${ITEMS[id].name} placed on ${slots.find(s => s.id === selectedSlot)?.name}.`);
  };
  const clearSlot = () => {
    if (!selectedSlot) return;
    const next = { ...placements }; delete next[selectedSlot];
    savePlacement(next); setAnnouncement("Decoration returned to available inventory.");
  };
  const moveSlot = (direction: number) => {
    if (!selectedSlot || !placements[selectedSlot]) return;
    const index = slots.findIndex(s => s.id === selectedSlot);
    const nextSlot = slots[index + direction];
    if (!nextSlot || isWallSlot(selectedSlot) !== isWallSlot(nextSlot.id) || isTableSlot(selectedSlot) !== isTableSlot(nextSlot.id) || isPillowSlot(selectedSlot) !== isPillowSlot(nextSlot.id) || isChairSlot(selectedSlot) !== isChairSlot(nextSlot.id) || (isPatioSlot(selectedSlot) && !patioMatches(nextSlot.id, placements[selectedSlot]))) return;
    const next = { ...placements };
    const current = next[selectedSlot], other = next[nextSlot.id];
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
    const choices = chimeStyle === "mixed" ? [...chimeFiles.small, ...chimeFiles.bamboo] : chimeFiles[chimeStyle];
    const filename = choices[Math.floor(Math.random() * choices.length)];
    const audio = new Audio("/audio/Patio/" + filename);
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
    try { const stored = JSON.parse(window.localStorage.getItem("shoreline-hut-displays-v1") || "{}"); if (stored && typeof stored === "object" && !Array.isArray(stored)) setPlacements(stored); } catch {}
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
        <div className="relative mx-auto w-full overflow-hidden rounded-xl" style={{ aspectRatio: area === "inside" ? "3 / 4" : "2 / 3" }}>
          <Image src={imagePath(area, night)} alt={area === "inside" ? (night ? "Cozy hut interior at night with a glowing fireplace and moonlit ocean beyond the patio door" : "Sunny hut interior with three wooden shelves, fireplace, cozy furniture and a glass door to the patio") : (night ? "Wooden oceanfront patio beneath the moon and lantern light" : "Sunny oceanfront patio with flowers, wind chimes and room for decorations")} fill unoptimized priority sizes="(max-width: 640px) 100vw, 640px" className="object-cover" />
          {area === "inside" && fireOn && (
            <div aria-hidden="true" className="pointer-events-none absolute z-[1] overflow-hidden" style={{ left: night ? "4.2%" : "2.8%", top: night ? "49%" : "46.5%", width: "8.3%", height: "7.3%", borderRadius: "18% 18% 10% 10%" }}>
              <div className="absolute inset-x-0 bottom-0 h-[45%] opacity-70" style={{ background: "radial-gradient(ellipse at bottom, rgba(255,193,112,.75), rgba(81,216,230,.28) 55%, transparent 78%)" }} />
              {[
                { left: "6%", width: "43%", height: "69%", delay: "0s", color: "#4fe5e1" },
                { left: "28%", width: "40%", height: "83%", delay: "-.7s", color: "#bd9aff" },
                { left: "56%", width: "35%", height: "67%", delay: "-1.3s", color: "#79b9ff" },
                { left: "37%", width: "25%", height: "53%", delay: "-.3s", color: "#ffe1a0" },
              ].map((flame, index) => (
                <div key={index} className="hut-magic-flame absolute bottom-[7%] origin-bottom" style={{
                  left: flame.left, width: flame.width, height: flame.height,
                  background: `linear-gradient(to top, #ffd49b 0%, ${flame.color} 55%, ${flame.color} 85%, transparent 100%)`,
                  borderRadius: "65% 35% 45% 45% / 90% 80% 25% 25%",
                  filter: "drop-shadow(0 0 2px rgba(124,230,255,.35))",
                  animationDelay: flame.delay,
                }} />
              ))}
              <div className="absolute bottom-[2%] left-[9%] h-[9%] w-[82%] rounded-full bg-amber-200/80 blur-[2px]" />
            </div>
          )}
          <style jsx>{`
            @keyframes hut-magic-flicker {
              0%, 100% { transform: scaleX(.9) scaleY(.86) rotate(-4deg); opacity: .85; }
              45% { transform: scaleX(1.08) scaleY(1.04) rotate(3deg); opacity: 1; }
              75% { transform: scaleX(.96) scaleY(.93) rotate(-2deg); opacity: .9; }
            }
            .hut-magic-flame { animation: hut-magic-flicker 2.4s ease-in-out infinite alternate; }
            @media (prefers-reduced-motion: reduce) { .hut-magic-flame { animation: none; } }
          `}</style>
          {activeSlots.map(slot => {
            const id = placements[slot.id];
            const nightInterior = area === "inside" && night;
            const slotX = nightInterior ? ({"shelf1-left":22,"shelf1-right":34,"shelf2-left":22,"shelf2-right":34,"shelf3-left":22,"shelf3-right":34,"fireplace-mantel":17,"wall":86,"wall-left":86,"wall-right":90,"coffee-table":59,"side-table":98,"sofa-pillow-left":34,"sofa-pillow-right":49,"shell-chair":61} as Record<string, number>)[slot.id] ?? slot.x : slot.x;
            const slotY = nightInterior ? ({"shelf1-left":23,"shelf1-right":24.5,"shelf2-left":30,"shelf2-right":30,"shelf3-left":36.5,"shelf3-right":36.5,"fireplace-mantel":59,"wall":38,"wall-left":29,"wall-right":46,"coffee-table":53,"side-table":62,"sofa-pillow-left":49,"sofa-pillow-right":49,"shell-chair":73} as Record<string, number>)[slot.id] ?? slot.y : slot.y;
            const daytimeAdjustments: Record<string, { x?: number; y?: number }> = {
              "shelf1-left": { x: 21.5, y: 18.4 }, "shelf1-right": { x: 32, y: 19.3 },
              "shelf2-left": { x: 21.5, y: 24.8 }, "shelf2-right": { x: 32, y: 25.2 },
              "shelf3-left": { x: 21.5, y: 31.3 }, "shelf3-right": { x: 32, y: 31.6 },
              "wall": { x: 87, y: 38 }, "wall-left": { x: 86, y: 29 }, "wall-right": { x: 90, y: 46 },
              "fireplace-mantel": { x: 17, y: 59 },
              "sofa-pillow-left": { x: 31, y: 49 }, "sofa-pillow-right": { x: 45, y: 49 },
              "coffee-table": { x: 56.5, y: 53.8 }, "side-table": { x: 96, y: 64 },
            };
            const adjustedX = area === "inside" && !night ? (daytimeAdjustments[slot.id]?.x ?? slotX) : slotX;
            const adjustedY = area === "inside" && !night ? (daytimeAdjustments[slot.id]?.y ?? slotY) : slotY;
            const item = id && ITEMS[id];
            const smallTableDecor = isTableSlot(slot.id) && /cup|mug|candle|teacup/i.test(item ? item.name : "");
            const decorWidth = isChairSlot(slot.id) ? "24%" : isPillowSlot(slot.id) ? "7.2%" : isWallSlot(slot.id) ? "12%" : smallTableDecor ? "7%" : isTableSlot(slot.id) ? "10%" : "9%";
            const decorHeight = isChairSlot(slot.id) ? "17%" : isPillowSlot(slot.id) ? "5.6%" : isWallSlot(slot.id) ? "10%" : smallTableDecor ? "7%" : isTableSlot(slot.id) ? "8%" : "6%";
            return <button key={slot.id} type="button" onClick={() => openDecoration(slot.id)} aria-label={`${slot.name}, ${item ? item.name : "empty"}, decorate`} className="absolute z-10 flex items-center justify-center rounded-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300" style={{ left: `calc(${adjustedX}% - ${area === "inside" ? decorWidth : "10%"} / 2)`, top: `calc(${adjustedY}% - ${area === "inside" ? decorHeight : "8%"} / 2)`, width: area === "inside" ? decorWidth : slot.id === "patio-fountain" ? "24%" : slot.id.startsWith("patio-chair") ? "22%" : slot.id === "patio-chime" ? "11%" : isWallSlot(slot.id) ? "14%" : isChairSlot(slot.id) ? "22%" : isPillowSlot(slot.id) ? "11%" : slot.id === "side-table" && !night ? "8%" : isTableSlot(slot.id) ? "11%" : "10%", height: area === "inside" ? decorHeight : slot.id === "patio-fountain" ? "23%" : slot.id.startsWith("patio-chair") ? "20%" : slot.id === "patio-chime" ? "14%" : isWallSlot(slot.id) ? "12%" : isChairSlot(slot.id) ? "21%" : isPillowSlot(slot.id) ? "9%" : slot.id === "side-table" && !night ? "7%" : isTableSlot(slot.id) ? "9%" : "6.5%" }}>
              {item && <DisplayArt key={item.id} icon={item.icon} name={item.name} isEmoji={item.isEmoji} />}
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
        <span className="sr-only" role="status">Fireplace {fireOn ? "on" : "off"}. Magical colored flames are displayed when the fireplace is on.</span>
        <button type="button" onClick={() => openDecoration(area === "inside" ? "shelf1-left" : "patio-fountain")} className="mt-2 min-h-11 rounded-xl bg-teal-800 px-4 py-2 font-semibold text-white">{area === "inside" ? "Decorate Your Hut" : "Decorate Your Patio"}</button>
        {area === "patio" && (placements["patio-chime"] || placements["patio-fountain"]) && <button type="button" aria-expanded={showPatioSounds} onClick={() => setShowPatioSounds(v => !v)} className="mt-2 min-h-11 rounded-xl border border-teal-800 px-3 py-1.5 text-sm font-semibold text-teal-950">{showPatioSounds ? "Close Patio Sounds" : "Patio Sounds"}</button>}
        {area === "patio" && showPatioSounds && (placements["patio-chime"] || placements["patio-fountain"]) && <section aria-label="Patio sounds" className="mt-3 rounded-xl border border-teal-800 p-3">
          <h3 className="font-bold text-teal-950">Patio Sounds</h3>
          {placements["patio-chime"] && <>
            <button type="button" onClick={playChime} className="mt-2 min-h-11 rounded-lg bg-teal-800 px-3 text-white">Play Wind Chimes</button>
            <label className="mt-2 flex items-center gap-2"><input type="checkbox" checked={automaticChimes} onChange={e => setAutomaticChimes(e.target.checked)} /> Occasional breeze sounds</label>
            <label htmlFor="chime-style" className="mt-2 block">Wind chime sound</label>
            <select id="chime-style" value={chimeStyle} onChange={e => setChimeStyle(e.target.value as "mixed" | "small" | "bamboo")} className="min-h-11 w-full rounded-lg border p-2">
              <option value="mixed">Mixed chimes</option><option value="small">Small metal chimes</option><option value="bamboo">Bamboo chimes</option>
            </select>
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
        {selectedSlot && <section role="dialog" aria-label="Choose a decoration" className="mt-3 rounded-xl border border-teal-800 bg-white p-3">
          <h3 className="font-bold text-teal-950">{slots.find(s => s.id === selectedSlot)?.name}</h3>
          <p className="text-sm">Current: {placements[selectedSlot] && ITEMS[placements[selectedSlot]] ? ITEMS[placements[selectedSlot]].name : "Empty"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => moveSlot(-1)} className="min-h-11 rounded-lg border px-3">Move Left</button>
            <button type="button" onClick={() => moveSlot(1)} className="min-h-11 rounded-lg border px-3">Move Right</button>
            <button type="button" onClick={clearSlot} className="min-h-11 rounded-lg border px-3">Remove</button>
            <button type="button" onClick={() => setSelectedSlot(null)} className="min-h-11 rounded-lg bg-teal-900 px-3 text-white">Done</button>
          </div>
          <label htmlFor="hut-slot" className="mt-3 block font-semibold">Display position</label>
          <select id="hut-slot" value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} className="min-h-11 w-full rounded-lg border p-2">{activeSlots.map(slot => <option key={slot.id} value={slot.id}>{slot.name}</option>)}</select>
          <p className="mt-2 text-sm">Choose an owned decoration:</p>
          <div className="mt-2 max-h-52 overflow-y-auto">
            {ownedDecor.length === 0 ? <p>No decorations in inventory yet.</p> : ownedDecor.filter(([id]) => isWallSlot(selectedSlot) ? isWallDecor(id) : isPillowSlot(selectedSlot) ? isPillowDecor(id) : isChairSlot(selectedSlot) ? isChairDecor(id) : isPatioSlot(selectedSlot) ? patioMatches(selectedSlot, id) : true).map(([id, count]) => <button key={id} type="button" onClick={() => place(id)} className="mb-1 block min-h-11 w-full rounded-lg border border-slate-300 p-2 text-left text-teal-950">{ITEMS[id].name} (owned: {count})</button>)}
          </div>
          <p role="status" aria-live="polite" className="mt-2 text-sm">{announcement}</p>
        </section>}
      </section>
    </div>
  );
}
