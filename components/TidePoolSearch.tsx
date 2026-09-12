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
  const { state, play, collectItem, addTidePoolDiscovery, completeTidePoolSearch } = useGame();
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [areaFinds, setAreaFinds] = useState<Record<string, Discovery>>({});
  const [deck, setDeck] = useState<Discovery[]>([]);
  const [lastResult, setLastResult] = useState<{ discovery: Discovery; message: string } | null>(null);
  const [announcement, setAnnouncement] = useState("Begin when you are ready to explore the tide pool.");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lowTide = state.currentForecast?.id === "low-tide";
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
      collectItem("iridescent-shell", { silent: true });
      rewardMessage += " An Iridescent Shell was tucked inside the Shell Hollow and has been added to your collection.";
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

          <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
        </div>
      </div>
    </div>
  );
}
