"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ShorelineFieldGuides from "./ShorelineFieldGuides";
import { AQUARIUM_SPECIES } from "@/lib/aquarium";
import { ARCHIE_GIFTS, ARCHIE_STORAGE_KEY, type ArchieGift } from "@/lib/archie";
import { RetreatPostcardAlbum } from "./RetreatPostcards";
import { postcardImage } from "@/lib/retreat-postcards";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";
import { CoveJournalClues, OldKeepersLetter, OldShorelineArchive, OldShorelineMapArt } from "./CoveTimeCapsule";

const objects = [
  { id: "history", name: "Old Shoreline Bookcase", bounds: [2, 17, 28, 36] },
  { id: "science", name: "Waverly’s Science Books", bounds: [69, 16, 29, 25] },
  { id: "conch", name: "Echo Conch Listening Shelf", bounds: [69, 43, 28, 11] },
  { id: "journal", name: "Journal Cabinet", bounds: [40, 51, 23, 18] },
  { id: "nook", name: "Reading Chair and Side Table", bounds: [0, 55, 38, 25] },
  { id: "postcards", name: "Retreat Postcard Album", bounds: [43, 75, 22, 13] },
  { id: "cadence", name: "Cadence’s Picture Book Basket", bounds: [70, 60, 29, 17] },
] as const;

type LibraryObject = (typeof objects)[number];

const bookPages = [
  "Little Ducky sits by the shore. Along comes a wave. Splish, splash!",
  "Little Ducky bobs past a shell. A sleepy crab waves one tiny claw. Hello, Ducky!",
  "The tide rolls Little Ducky home. Cadence tucks him under her blanket. Goodnight, Ducky.",
];
const pageText = "Before the dock had lanterns, the keeper carried a candle down to the timber pier. From his boat, the ferryman knew he was home as soon as he saw it.";
const button = "min-h-11 rounded-lg bg-amber-900 px-3 py-2 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900 disabled:opacity-50";
const objectFocus = "absolute z-10 rounded-xl hover:ring-2 hover:ring-inset hover:ring-amber-200 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-white focus-visible:ring-2 focus-visible:ring-slate-900";

function KeepsakeArt({ src, className }: { src: string; className: string }) {
  return <Image src={src} alt="" width={160} height={160} unoptimized className={className} />;
}

export default function LighthouseLibrary({ isNight, onBack }: { isNight: boolean; onBack: () => void }) {
  const { state } = useGame();
  const [selected, setSelected] = useState<LibraryObject | null>(null);
  const [found, setFound] = useState<ArchieGift[]>([]);
  const [candleLit, setCandleLit] = useState(false);
  const [page, setPage] = useState(0);
  const [audioMessage, setAudioMessage] = useState("");
  const roomHeading = useRef<HTMLHeadingElement>(null);
  const panelHeading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const has = (id: string) => (state.inventory[id] ?? 0) > 0;
  const hasConch = has("celeste-echo-conch");
  const hasCharm = has("orion-star-charm");
  const conchArt = ITEMS["celeste-echo-conch"].icon;
  const charmArt = ITEMS["orion-star-charm"].icon;
  const candle = ARCHIE_GIFTS.find(gift => gift.id === "midnight-candle")!;
  const gifts = ARCHIE_GIFTS.map(gift => ({ ...gift, count: found.filter(item => item?.id === gift.id).length })).filter(gift => gift.count > 0);
  const hasCandle = gifts.some(gift => gift.id === candle.id);
  const fish = AQUARIUM_SPECIES.filter(species => state.discoveredAquariumFish.includes(species.id));
  const winterKeepsakes = ["winter-silver-snowflake-key", "winter-golden-shell-key", "winter-crystal-seal"].filter(has);

  useEffect(() => {
    roomHeading.current?.focus();
    try {
      const saved = JSON.parse(window.localStorage.getItem(ARCHIE_STORAGE_KEY) || "{}");
      if (Array.isArray(saved?.found)) setFound(saved.found);
    } catch {}
    return () => audio.current?.pause();
  }, []);

  useEffect(() => {
    if (selected && !dialog.current?.open) {
      dialog.current?.showModal();
      panelHeading.current?.focus();
    }
  }, [selected]);

  const closePanel = () => {
    audio.current?.pause();
    setAudioMessage("");
    setSelected(null);
    trigger.current?.focus();
  };

  const listen = () => {
    const sound = audio.current ?? new Audio("/audio/listen-to-shell/waves.mp3");
    audio.current = sound;
    sound.pause();
    sound.currentTime = 0;
    sound.volume = state.audio.master;
    setAudioMessage("Listening to the Echo Conch.");
    void sound.play().catch(() => {
      if (dialog.current?.open) setAudioMessage("The sound could not play. Select Listen to the Echo Conch to try again.");
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-[#fbf3e3] pb-24 text-amber-950">
      <h1 ref={roomHeading} tabIndex={-1} className="sr-only">Lighthouse Library</h1>
      <div className="relative mx-auto w-full max-w-xl">
        <Image
          src={isNight ? "/images/Lighthouse/library-night.webp" : "/images/Lighthouse/library-day.webp"}
          alt="" width={1024} height={1536} unoptimized className="block h-auto w-full"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {state.coveTimeCapsuleOpened && (
            <div className="absolute left-[11%] top-[35%] w-[12%] -rotate-6"><OldShorelineMapArt /></div>
          )}
          {hasConch && <KeepsakeArt src={conchArt} className="absolute left-[76%] top-[43%] h-[7%] w-[14%] object-contain drop-shadow-md" />}
          {hasCandle && (
            <KeepsakeArt src={candle.image} className={`absolute left-[25%] top-[56%] h-[6%] w-[8%] object-contain ${candleLit ? "drop-shadow-[0_0_10px_#fbbf24]" : ""}`} />
          )}
          {hasCharm && <KeepsakeArt src={charmArt} className="absolute left-[30%] top-[58%] h-[4%] w-[7%] object-contain drop-shadow-[0_0_8px_#fde68a]" />}
        </div>
        {objects.map(object => {
          const [left, top, width, height] = object.bounds;
          return (
            <button key={object.id} type="button" aria-label={object.name} aria-haspopup="dialog" title={object.name}
              className={objectFocus} style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
              onClick={event => { trigger.current = event.currentTarget; setSelected(object); }}>
              {object.id === "postcards" && <span aria-hidden="true" className="pointer-events-none mx-auto block w-[80%] rotate-[-8deg] rounded-md border-2 border-amber-100 bg-amber-950 p-1 shadow-lg">
                <Image src={postcardImage("a-seat-by-the-sea")} alt="" width={112} height={74} unoptimized className="w-full rounded-sm" />
              </span>}
            </button>
          );
        })}
      </div>
      <div className="mx-auto max-w-xl px-4 py-3">
        <button type="button" className={button} onClick={onBack}>Return to the Lighthouse Living Room</button>
      </div>

      <dialog ref={dialog} aria-labelledby="library-object-heading" onClose={closePanel}
        className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-[#fbf3e3] p-0 text-amber-950 shadow-xl backdrop:bg-slate-950/75">
        {selected && (
          <>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-[#fbf3e3] p-4">
              <h2 id="library-object-heading" ref={panelHeading} tabIndex={-1} className="font-serif text-xl font-bold">{selected.name}</h2>
              <button type="button" className={button} onClick={() => dialog.current?.close()}>Close</button>
            </div>
            <div className="space-y-3 px-4 pb-4">
              {selected.id === "history" && <>
                <details className="rounded-lg bg-white/80 p-3">
                  <summary className="cursor-pointer font-semibold">Before the Harbor</summary>
                  <p className="mt-2">The first keeper followed a narrow path between the lighthouse and a single timber pier. By evening, close to shore, you could hear the boards rise and settle against the tide.</p>
                </details>
                <OldShorelineArchive />
              </>}
              {selected.id === "science" && <>
                <ShorelineFieldGuides hasArchieKeepsakes={gifts.length > 0} />
                <details className="rounded-lg bg-white/80 p-3">
                  <summary className="cursor-pointer font-semibold">Reef Conservation</summary>
                  <p className="mt-2">Waverly’s field note: A restored reef needs small shelters as much as open water. Look for fish between the rocks and among the seagrass.</p>
                </details>
                <h3 className="font-semibold">Reef Fish Field Guide</h3>
                {fish.length === 0 && <p>Explore the restored reef to add your first fish to this guide.</p>}
                {fish.map(species => (
                  <details key={species.id} className="rounded-lg bg-white/80 p-3">
                    <summary className="cursor-pointer font-semibold">{species.name}</summary>
                    <KeepsakeArt src={species.imageSrc} className="my-2 h-20 w-20 object-contain" />
                    <p>{state.raisedAquariumFish.includes(species.id) ? species.careNote : "Waverly has identified this species. Raise a juvenile at the marine lab to unlock her care notes."}</p>
                  </details>
                ))}
              </>}
              {selected.id === "conch" && (hasConch ? <>
                <p>Celeste’s pale shell holds the sound of a wave rising, washing over the shore, and drawing away again.</p>
                <button type="button" className={button} onClick={listen}>Listen to the Echo Conch</button>
                <p role="status">{audioMessage}</p>
              </> : <p>This velvet cradle has a place for the Echo Conch, a friendship gift from Celeste.</p>)}
              {selected.id === "journal" && <>
                {has("wind-journal") ? <CoveJournalClues /> : <p>A space is reserved for the Washed-Up Journal. Look for it among the beach wash-ups.</p>}
                <OldKeepersLetter />
                {has("tide-trinket-key") && !state.coveTimeCapsuleOpened && <p>The Forgotten Tide Key can open the capsule beneath the striped stone in the Cove.</p>}
                {winterKeepsakes.length > 0 && <ul className="list-disc pl-5">
                  {winterKeepsakes.map(id => <li key={id}>{ITEMS[id].name}</li>)}
                </ul>}
              </>}
              {selected.id === "nook" && <>
                {gifts.length === 0 && <p>Check the Hut patio after sunrise for keepsakes left by Archie.</p>}
                {gifts.map(gift => <details key={gift.id} className="rounded-lg bg-white/80 p-3">
                  <summary className="cursor-pointer font-semibold">{gift.name}{gift.count > 1 ? ` (×${gift.count})` : ""}</summary>
                  <KeepsakeArt src={gift.image} className="my-2 h-24 w-24 object-contain" />
                  {gift.id === "shoreline-page" && <p>{pageText}</p>}
                  {gift.id === "salt-grass-bookmark" && <p>A blade of salt grass is pressed between two pieces of translucent paper.</p>}
                  {gift.id === "old-map-fragment" && <p>The torn corner shows a footpath leading down from the lighthouse.</p>}
                  {gift.id === "midnight-candle" && <button type="button" className={button} aria-pressed={candleLit} onClick={() => setCandleLit(lit => !lit)}>Light the Midnight Reading Candle</button>}
                </details>)}
                {hasCharm && <p>Orion’s Star Charm casts a gold glow across the table.</p>}
              </>}
              {selected.id === "postcards" && <RetreatPostcardAlbum />}
              {selected.id === "cadence" && <>
                <h3 className="font-serif text-lg font-bold">Goodnight, Little Ducky</h3>
                <div role="status" aria-atomic="true">
                  <p className="text-sm">Page {page + 1} of {bookPages.length}</p>
                  <p className="mt-1">{bookPages[page]}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={button} disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous page</button>
                  <button type="button" className={button} disabled={page === bookPages.length - 1} onClick={() => setPage(value => value + 1)}>Next page</button>
                </div>
              </>}
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
