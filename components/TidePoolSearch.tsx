"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SCENES } from "@/lib/media";
import { useGame } from "@/lib/store";

interface Discovery {
  id: string;
  name: string;
  icon: string;
  description: string;
  sound: string;
  reward?: "sea-lettuce" | "pearl-silver" | "glitter";
}

const DISCOVERIES: Discovery[] = [
  { id: "rainbow-starfish", name: "Rainbow the Starfish", icon: "🌈", description: "Rainbow rests beneath the clear water, each arm glowing a different color.", sound: "seaGlass" },
  { id: "pip-urchin", name: "Pip the Sea Urchin", icon: "🟣", description: "Pip peeks from a narrow rock hollow, his purple-blue spines moving gently.", sound: "shell" },
  { id: "sparkle-fish", name: "Sparkle the Fish", icon: "🐟", description: "Sparkle swims into a sunbeam. Her silver scales flash with a tiny rainbow shimmer.", sound: "sparkle", reward: "glitter" },
  { id: "barnaby-hermit-crab", name: "Barnaby the Hermit Crab", icon: "🦀", description: "Barnaby scuttles out from behind a stone, carefully carrying his spiral shell.", sound: "shell" },
  { id: "pearl-clam", name: "A Clam with a Pearl", icon: "🦪", description: "A clam opens slowly and offers a loose silver pearl resting beside its shell.", sound: "pearl", reward: "pearl-silver" },
  { id: "sea-anemones", name: "Sea Anemone Garden", icon: "🪸", description: "A garden of pink and coral anemones waves softly with the tide.", sound: "shell" },
  { id: "sea-lettuce-patch", name: "Fresh Sea Lettuce", icon: "🥬", description: "Clean green sea lettuce grows along the rock. You gather only a few loose leaves for the kitchen.", sound: "seaweedCollect", reward: "sea-lettuce" },
];

const AREAS = [
  { id: "sunlit", name: "Sunlit Shallows", clue: "Light dances across a warm, sandy pocket.", icon: "☀️" },
  { id: "crevice", name: "Shaded Rock Crevice", clue: "Something small moves between two smooth stones.", icon: "🪨" },
  { id: "garden", name: "Anemone Garden", clue: "Soft shapes sway below the ripples.", icon: "🪸" },
  { id: "seaweed", name: "Green Seaweed Ledge", clue: "Leafy greens curl around the edge of the pool.", icon: "🌿" },
  { id: "shell", name: "Shell Hollow", clue: "A patterned shell is partly hidden in the sand.", icon: "🐚" },
  { id: "pearl", name: "Quiet Clam Bed", clue: "A pair of shells rests in a patch of clear water.", icon: "🦪" },
  { id: "still", name: "Still-Water Pocket", clue: "The surface is calm enough to reflect the sky.", icon: "💧" },
];

function shuffled<T>(items: readonly T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function TidePoolSearch({ onClose }: { onClose: () => void }) {
  const { state, play, collectItem, addTidePoolDiscovery, completeTidePoolSearch, collectTidePoolShellHollow } = useGame();
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [areaFinds, setAreaFinds] = useState<Record<string, Discovery>>({});
  const [deck, setDeck] = useState<Discovery[]>([]);
  const [lastResult, setLastResult] = useState<{ discovery: Discovery; message: string } | null>(null);
  const [announcement, setAnnouncement] = useState("Begin when you are ready to explore the tide pool.");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lowTide = state.currentForecast?.id === "low-tide";
  const hasBoots = (state.inventory["tide-pool-wading-boots"] || 0) > 0 || state.crafted.includes("tide-pool-wading-boots");
  const [deepFinds, setDeepFinds] = useState<string[]>([]);
  const [deepAnnouncement, setDeepAnnouncement] = useState("The deeper tide pool awaits.");
  const [lastDeepTreasure, setLastDeepTreasure] = useState<string | null>(null);
  const teapotPieces = [
    { id: "shipwreck-teapot-fragment-body-lower", name: "Lower body", image: "Teapot-Fragment-Body-Lower.png" },
    { id: "shipwreck-teapot-fragment-body", name: "Upper body", image: "Teapot-Fragment-Body-Upper.png" },
    { id: "shipwreck-teapot-fragment-spout", name: "Spout", image: "Teapot-Fragment-Spout.png" },
    { id: "shipwreck-teapot-fragment-handle", name: "Handle", image: "Teapot-Fragment-Handle.png" },
    { id: "shipwreck-teapot-fragment-lid", name: "Lid", image: "Teapot-Fragment-Lid.png" },
  ];
  const [teapotSteps, setTeapotSteps] = useState(0);
  const [teapotMessage, setTeapotMessage] = useState("Collect all five pieces, then restore the teapot in order.");
  const teapotRestored = (state.inventory["shipwreck-teapot-restored"] || 0) > 0;
  const allTeapotPieces = teapotPieces.every(piece => (state.inventory[piece.id] || 0) > 0);
  const placeTeapotPiece = (index: number) => {
    if (index !== teapotSteps) {
      setTeapotMessage("That piece does not fit yet. Try " + teapotPieces[teapotSteps].name + " next.");
      return;
    }
    const next = teapotSteps + 1;
    setTeapotSteps(next);
    if (next === teapotPieces.length) {
      if (!teapotRestored) collectItem("shipwreck-teapot-restored", { silent: true });
      setTeapotMessage("The antique teapot is restored! Its golden trim and coral flowers shine again. The restored teapot is now in your inventory.");
      play("craftSuccess");
    } else {
      setTeapotMessage(teapotPieces[index].name + " placed. " + next + " of 5 pieces assembled. Next: " + teapotPieces[next].name + ".");
      play("shell");
    }
  };
  const [glassView, setGlassView] = useState<"Day" | "Night" | "Storm" | "Low-Tide" | "Sunset">("Day");
  const [glassDescription, setGlassDescription] = useState("");
  const glassViews = {
    Day: "Sunlight sparkles on turquoise waves beside the lighthouse.",
    Night: "Moonlight silvers the shoreline while glowing jellyfish drift beneath the stars.",
    Storm: "Storm clouds gather above the waves, and the lighthouse shines through rain.",
    "Low-Tide": "The retreating sea reveals sandbars, tide pools and scattered shells.",
    Sunset: "Golden sunset light warms the beach, lighthouse and cottage.",
  };
  const gazeIntoCrystal = (view: keyof typeof glassViews) => {
    setGlassView(view);
    setGlassDescription(glassViews[view]);
    play("sparkle");
  };
  const barnabyHelped = !!state.questProgress.shellseeker;
  const searchedCount = Object.keys(areaFinds).length;

  const permanentCount = DISCOVERIES.filter((discovery) => state.tidePoolDiscoveries.includes(discovery.id)).length;

  useEffect(() => {
    headingRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const deepTreasures = [
    { id: "recycled-rubber", weight: 38, description: "A clean, reusable rubber strip washed into the rocks." },
    { id: "shipwreck-teapot-fragment-spout", weight: 10, description: "A porcelain spout from an old shipwreck teapot." },
    { id: "shipwreck-teapot-fragment-handle", weight: 10, description: "A curved handle from an old shipwreck teapot." },
    { id: "shipwreck-teapot-fragment-lid", weight: 10, description: "A porcelain teapot lid with a gold seashell finial." },
    { id: "shipwreck-teapot-fragment-body", weight: 10, description: "A piece of the shipwreck teapot's painted body." },
    { id: "shipwreck-teapot-fragment-body-lower", weight: 10, description: "The lower section of a shipwreck teapot." },
    { id: "ancient-tide-crystal", weight: 7, description: "An ancient blue-banded crystal rests beneath a rock." },
    { id: "tidepool-ammonite-fossil", weight: 7, description: "A spiral ammonite fossil is embedded in a smooth pebble." },
    { id: "rainbow-clear-pearl", weight: 4, description: "A nearly invisible pearl reveals a suspended rainbow when it catches the light." },
    { id: "whispering-seashell", weight: 4, description: "An opalescent spiral shell seems to carry the sound of distant waves." },
    { id: "shoreline-looking-glass", weight: 1, description: "A rose quartz crystal reveals a tiny shoreline through its window." },
  ];
  const exploreDeep = (hidden: boolean) => {
    if (!hasBoots || (hidden && !lowTide)) return;
    const pool = deepTreasures.filter(item => item.id !== "shoreline-looking-glass" || ((state.inventory["shoreline-looking-glass"] || 0) === 0 && !deepFinds.includes("shoreline-looking-glass"))).map(item => ({ ...item, weight: item.weight * (hidden && item.id !== "recycled-rubber" ? 2 : 1) }));
    const total = pool.reduce((sum, item) => sum + item.weight, 0);
    let pick = Math.random() * total;
    const found = pool.find(item => (pick -= item.weight) < 0) || pool[0];
    collectItem(found.id, { silent: true });
    const label = found.id === "recycled-rubber" ? "Recycled Rubber Strip" : found.id.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    const result = `${hidden ? "Hidden tide pool" : "Deeper tide pool"}: ${found.description} ${label} added to your inventory.`;
    setDeepFinds(previous => [...previous, found.id]);
    setLastDeepTreasure(found.id);
    setDeepAnnouncement(result);
    play("shell");
  };

  const startSearch = () => {
    setDeck(shuffled(DISCOVERIES));
    setAreaFinds({});
    setLastResult(null);
    setComplete(false);
    setPlaying(true);
    setAnnouncement("Tide-pool search started. Seven areas are ready. Choose any area to search. There is no time limit.");
  };

  const searchArea = (areaId: string) => {
    if (!playing || complete || areaFinds[areaId]) return;
    const discovery = deck[searchedCount];
    if (!discovery) return;

    const nextFinds = { ...areaFinds, [areaId]: discovery };
    const isFinal = Object.keys(nextFinds).length === AREAS.length;
    setAreaFinds(nextFinds);
    addTidePoolDiscovery(discovery.id);
    play(discovery.sound);

    let rewardMessage = "";
    if (discovery.reward === "sea-lettuce") {
      const amount = lowTide ? 2 : 1;
      for (let i = 0; i < amount; i += 1) collectItem("sea-lettuce", { silent: true });
      rewardMessage = ` ${amount} fresh sea lettuce ${amount === 1 ? "leaf was" : "leaves were"} added to the kitchen.`;
    } else if (discovery.reward === "pearl-silver") {
      collectItem("pearl-silver", { silent: true });
      rewardMessage = " The clam's loose silver pearl was added to your collection.";
    } else if (discovery.reward === "glitter") {
      collectItem("glitter", { silent: true });
      rewardMessage = " Sparkle leaves a pinch of harmless Sea Glitter, which was added to your collection.";
    } else if (discovery.id === "barnaby-hermit-crab") {
      rewardMessage = barnabyHelped
        ? " Barnaby proudly shows you the roomy whelk shell you found for him."
        : " Barnaby reminds you that his shell request is waiting on the Bottles tab.";
    }
    if (areaId === "shell") {
      const foundMotherOfPearl = collectTidePoolShellHollow();
      rewardMessage += " An Iridescent Shell was tucked inside the Shell Hollow and has been added to your collection.";
      if (foundMotherOfPearl) rewardMessage += " A rare piece of Mother-of-Pearl was hidden beneath it!";
    }
    setLastResult({ discovery, message: `${discovery.description}${rewardMessage}` });

    if (isFinal) {
      setComplete(true);
      setPlaying(false);
      window.setTimeout(completeTidePoolSearch, 650);
      setAnnouncement(`${discovery.name} discovered. ${discovery.description}${rewardMessage} All seven areas are complete. Tide-Pool Field Notes earned.`);
    } else {
      const remaining = AREAS.length - Object.keys(nextFinds).length;
      setAnnouncement(`${discovery.name} discovered. ${discovery.description}${rewardMessage} ${remaining} ${remaining === 1 ? "area remains" : "areas remain"}.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#042f36]/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="tide-pool-title">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-b from-cyan-50 via-sky-50 to-teal-100 shadow-2xl ring-1 ring-cyan-200">
        <div className="relative h-52 sm:h-64">
          <Image src={SCENES.tidePool} alt="A clear turquoise tide pool with rocky search areas, sea plants, and small marine creatures" fill priority unoptimized sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/80 via-transparent to-black/20" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
            <div>
              <p className="text-sm font-semibold text-cyan-100">Beach Mini-Game</p>
              <h2 id="tide-pool-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold outline-none">🌊 Tide-Pool Search</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-teal-950 ring-1 ring-cyan-200">Close</button>
          </div>
        </div>

        <div className="p-5">
          {!playing && !complete ? (
            <div>
              <p className="text-teal-950">Search seven rocky pockets and record every creature and plant you discover. Nothing is timed, and all living creatures stay safely in their habitat.</p>
              {lowTide && <p className="mt-3 rounded-xl bg-amber-100 p-3 font-semibold text-amber-950 ring-1 ring-amber-300">Maeve forecast an unusually low tide. Sea lettuce gathered during this search is doubled.</p>}
              <button type="button" onClick={startSearch} className="mt-5 w-full rounded-xl bg-teal-700 py-3 font-bold text-white shadow active:bg-teal-800">Begin Tide-Pool Search</button>
              <p className="mt-4 text-center text-sm font-semibold text-teal-800">Field guide: {permanentCount}/{DISCOVERIES.length} discoveries · Searches completed: {state.tidePoolSearchesCompleted}</p>
            </div>
          ) : complete ? (
            <div className="text-center">
              <div className="text-4xl" aria-hidden="true">🌈 🟣 🐟 🦀 🦪 🪸 🥬</div>
              <h3 className="mt-3 text-xl font-bold text-teal-950">Tide-Pool Field Notes Complete!</h3>
              <p className="mt-2 text-teal-800">All seven discoveries are recorded in the Explorer&apos;s Notebook.</p>
              <p className="mt-2 font-semibold text-teal-800">Searches completed: {state.tidePoolSearchesCompleted}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button type="button" onClick={startSearch} className="rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">Search Again</button>
                <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-3 font-bold text-teal-950 ring-1 ring-cyan-300">Return to Beach</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-sm font-semibold text-teal-950">
                <span>Areas searched: {searchedCount}/{AREAS.length}</span>
                <span>Choose any unsearched area</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-cyan-200" role="progressbar" aria-label="Tide-pool search progress" aria-valuemin={0} aria-valuemax={AREAS.length} aria-valuenow={searchedCount}>
                <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${(searchedCount / AREAS.length) * 100}%` }} />
              </div>

              {lastResult && (
                <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-amber-950 shadow-sm ring-1 ring-amber-300">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl" aria-hidden="true">{lastResult.discovery.icon}</span>
                    <div>
                      <p className="font-bold">You found {lastResult.discovery.name}</p>
                      <p className="mt-1 text-sm text-amber-800">{lastResult.message}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {AREAS.map((area) => {
                  const found = areaFinds[area.id];
                  return (
                    <button
                      key={area.id}
                      type="button"
                      disabled={!!found}
                      onClick={() => searchArea(area.id)}
                      aria-label={found ? `${area.name}, searched. Found ${found.name}. ${found.description}` : `${area.name}, unsearched. ${area.clue}`}
                      className={`min-h-32 rounded-2xl p-4 text-left ring-2 transition disabled:opacity-100 ${found ? "bg-white text-teal-950 ring-amber-300" : "bg-teal-700 text-white ring-teal-800 active:bg-teal-800"}`}
                    >
                      <span className="text-3xl" aria-hidden="true">{found ? found.icon : area.icon}</span>
                      <span className="mt-2 block font-bold">{area.name}</span>
                      <span className={`mt-1 block text-sm ${found ? "text-teal-700" : "text-cyan-50"}`}>{found ? `Found: ${found.name}` : area.clue}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <section aria-labelledby="deep-tidepool-heading" className="mt-6 rounded-2xl bg-white/90 p-4 ring-1 ring-teal-200">
            <h3 id="deep-tidepool-heading" className="text-xl font-bold text-teal-950">Deeper Tide Pool Treasures</h3>
            <p className="mt-2 text-teal-900">Search for washed-up recycled rubber, shipwreck teapot pieces, ancient crystals, fossils, rainbow-clear pearls, and the rare Whispering Seashell.</p>
            {!hasBoots ? <p className="mt-2 font-semibold text-teal-900">Craft Tide Pool Wading Boots in the Workshop to unlock deeper exploration.</p> : <>
              <p className="mt-2 text-teal-900">Your reusable wading boots let you explore the deeper rocks safely.</p>
              {lastDeepTreasure && <div className="mt-4 rounded-xl bg-sky-50 p-3 text-center ring-2 ring-cyan-300" aria-label="Latest deeper tide pool treasure">
                <p className="font-bold text-teal-950">Latest treasure found</p>
                {lastDeepTreasure && <Image src={({"recycled-rubber":"/images/TidePool/Recycled-Rubber-Strips.png","shipwreck-teapot-fragment-spout":"/images/TidePool/Teapot-Fragment-Spout.png","shipwreck-teapot-fragment-handle":"/images/TidePool/Teapot-Fragment-Handle.png","shipwreck-teapot-fragment-lid":"/images/TidePool/Teapot-Fragment-Lid.png","shipwreck-teapot-fragment-body":"/images/TidePool/Teapot-Fragment-Body-Upper.png","shipwreck-teapot-fragment-body-lower":"/images/TidePool/Teapot-Fragment-Body-Lower.png","ancient-tide-crystal":"/images/TidePool/Ancient-Tide-Crystal.png","tidepool-ammonite-fossil":"/images/TidePool/Ammonite-Fossil.png","rainbow-clear-pearl":"/images/TidePool/Rainbow-Clear-Pearl.png","whispering-seashell":"/images/TidePool/Whispering-Seashell.png","shoreline-looking-glass":"/images/Looking glass/Shoreline-Looking-Glass-Day.png"})[lastDeepTreasure] ?? "/images/TidePool/Recycled-Rubber-Strips.png"} alt={lastDeepTreasure.replace(/-/g, " ")} width={180} height={180} unoptimized className="mx-auto mt-3 h-36 w-36 object-contain" />}
                <p className="mt-2 font-semibold text-teal-950">{lastDeepTreasure.replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase())}</p>
              </div>}
              <button type="button" onClick={() => exploreDeep(false)} className="mt-3 min-h-11 w-full rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">Search Deeper Tide Pool</button>
              {lowTide && <button type="button" onClick={() => exploreDeep(true)} className="mt-3 min-h-11 w-full rounded-xl bg-indigo-800 px-4 py-3 font-bold text-white">Explore Hidden Pool — Unusually Low Tide</button>}
              <p className="mt-2 text-sm text-teal-800">Deeper finds this visit: {deepFinds.length}. Searches are repeatable; rare treasures are less common.</p>
              <p className="mt-2 font-semibold text-teal-950" role="status" aria-live="polite" aria-atomic="true">{deepAnnouncement}</p>
              {((state.inventory["shoreline-looking-glass"] || 0) > 0 || deepFinds.includes("shoreline-looking-glass")) && <section className="mt-4 space-y-3 rounded-xl bg-rose-50 p-3" aria-labelledby="looking-glass-title">
                <h4 id="looking-glass-title" className="font-bold text-rose-950">Shoreline Looking Glass</h4>
                <Image src={"/images/Looking glass/Shoreline-Looking-Glass-" + glassView + ".png"} alt={"Rose quartz crystal showing the " + glassView.replace("-", " ") + " shoreline"} width={280} height={280} unoptimized className="mx-auto h-48 w-48 object-contain" />
                <p>Gaze through the crystal's polished window to discover a miniature Shoreline Sanctuary.</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["Day", "Night", "Storm", "Low-Tide", "Sunset"] as const).map(view => <button key={view} type="button" onClick={() => gazeIntoCrystal(view)} aria-pressed={glassView === view} className="min-h-11 rounded-lg bg-rose-800 px-3 py-2 font-semibold text-white">{view.replace("-", " ")} View</button>)}
                </div>
                <p role="status" aria-live="polite" aria-atomic="true" className="font-medium text-rose-950">{glassDescription}</p>
              </section>}
              {(state.inventory["whispering-seashell"] || 0) > 0 && <button type="button" onClick={() => { play("oceanWaterSplash"); setDeepAnnouncement("You hold the opalescent Whispering Seashell to your ear and hear the gentle rhythm of the ocean."); }} className="mt-3 min-h-11 w-full rounded-xl border-2 border-teal-800 px-4 py-3 font-bold text-teal-900">Listen to Whispering Seashell</button>}
            </>}
          </section>
          <section aria-labelledby="teapot-restoration-title" className="mt-5 space-y-3 rounded-2xl bg-amber-50 p-4 text-amber-950">
            <h3 id="teapot-restoration-title" className="text-xl font-bold">Shipwreck Teapot Restoration</h3>
            <p>Recover the five porcelain pieces from the deeper tide pool, then put them together in the correct order. Your fragments remain in your collection.</p>
            {teapotRestored ? <>
              <Image src="/images/TidePool/Shipwreck-Teapot-Restored.png" alt="Restored white porcelain teapot decorated with pink flowers, blue waves, and gold trim" width={280} height={280} unoptimized className="mx-auto h-48 w-48 object-contain" />
              <p className="font-bold">Restoration complete! Your antique teapot is in your inventory.</p>
            </> : <>
              <p>Pieces found: {teapotPieces.filter(piece => (state.inventory[piece.id] || 0) > 0).length} of 5.</p>
              <div className="grid grid-cols-2 gap-3">
                {teapotPieces.map((piece, index) => <div key={piece.id} className="rounded-xl bg-white p-2">
                  {(state.inventory[piece.id] || 0) > 0 ? <Image src={"/images/TidePool/" + piece.image} alt={piece.name + " porcelain fragment"} width={120} height={120} unoptimized className="mx-auto h-24 w-24 object-contain" /> : <p className="py-7 text-center">Not found yet</p>}
                  <button type="button" disabled={!allTeapotPieces || index < teapotSteps} onClick={() => placeTeapotPiece(index)} className="mt-2 min-h-11 w-full rounded-lg bg-amber-800 p-2 font-semibold text-white disabled:bg-slate-300 disabled:text-slate-700">{piece.name}{index < teapotSteps ? " — placed" : ""}</button>
                </div>)}
              </div>
              {!allTeapotPieces && <p>Find all five fragments to begin the restoration.</p>}
              <p role="status" aria-live="polite" aria-atomic="true" className="font-semibold">{teapotMessage}</p>
              {allTeapotPieces && <button type="button" onClick={() => { setTeapotSteps(0); setTeapotMessage("Puzzle reset. Begin with the lower body."); }} className="min-h-11 w-full rounded-xl border-2 border-amber-800 p-2 font-semibold">Reset Puzzle</button>}
            </>}
          </section>
          <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
        </div>
      </div>
    </div>
  );
}
