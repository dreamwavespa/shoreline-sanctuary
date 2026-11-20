"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/store";

const letter = "To whoever finds this, I kept the lighthouse in the days when one timber pier was all we had. The map will show you where we walked, and the photograph how we lived. The curved blue shard came from the flower vase on my kitchen sill. As for the big sand dollar, I found it on my first morning here. I hope you still find reasons to stop and look down when you walk the shore. — A keeper of the old light";

const finds = [
  { name: "Antique Vase Sea Glass", position: "50% 0%", description: "A thick, curved piece of aquamarine glass. A spray of painted flowers still shows through its frosted surface." },
  { name: "Old Shoreline Map", position: "100% 0%", description: "A hand-drawn map of the island before the harbor grew. It marks the keeper’s path and a single timber pier. The Lighthouse Library could preserve it when it opens." },
  { name: "Photograph of Old Shoreline", position: "0% 100%", description: "In the sepia photograph, the old wooden pier is barely wide enough for two people. Behind it stands the lighthouse you know today." },
  { name: "Letter from a Former Lighthouse Keeper", position: "50% 100%", description: letter },
  { name: "Ancient Sand Dollar", position: "100% 100%", description: "This palm-sized sand dollar is much larger than the little ones on Shoreline today. A deep five-point star is still visible on its pale, weathered surface." },
];

function CapsuleArt({ position }: { position: string }) {
  return <div aria-hidden="true" className="mx-auto aspect-square w-full max-w-44 bg-no-repeat"
    style={{ backgroundImage: "url('/images/Cove/time-capsule-art.webp')", backgroundSize: "300% 200%", backgroundPosition: position }} />;
}

export function CoveJournalClues() {
  const { state } = useGame();
  if (!(state.inventory["wind-journal"] > 0)) return null;
  return <details className="rounded-xl bg-amber-50 p-4 text-amber-950">
    <summary className="cursor-pointer font-bold">Read the Washed-Up Journal</summary>
    <ol className="mt-3 list-decimal space-y-2 pl-5">
      <li>“I carried the box past the beach, to the little cove where the water goes quiet.”</li>
      <li>“I tucked it beneath a flat stone with a pale stripe. At high tide, you’d walk right past it.”</li>
      <li>“If you find the little key with the worn wave on its handle, bring it back when the tide is out.”</li>
    </ol>
  </details>;
}

export function OldKeepersLetter() {
  const { state } = useGame();
  if (!state.coveTimeCapsuleOpened) {
    if (!(state.inventory["wind-journal"] > 0)) return null;
    return <details className="rounded-xl bg-amber-50 p-4 text-amber-950">
      <summary className="cursor-pointer font-bold">Ask Maeve about the Washed-Up Journal</summary>
      <p className="mt-2">“The tide line in the journal sounds like our Cove. Take the Forgotten Tide Key and look for a pale-striped stone when the weather station forecasts an unusually low tide.”</p>
    </details>;
  }
  return <details className="rounded-xl bg-amber-50 p-4 text-amber-950">
    <summary className="cursor-pointer font-bold">Ask Maeve to share the old keeper’s letter</summary>
    <p className="mt-2">Maeve unfolds the letter beside the teapot and begins to read.</p>
    <blockquote className="mt-2 border-l-2 border-amber-500 pl-3">{letter}</blockquote>
  </details>;
}

export default function CoveTimeCapsule({ search = false }: { search?: boolean }) {
  const { state, openCoveTimeCapsule } = useGame();
  const [message, setMessage] = useState("");
  const openedHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (message.startsWith("The Forgotten Tide Key turns")) openedHeading.current?.focus();
  }, [message]);
  if (!search && !state.coveTimeCapsuleOpened) return null;
  if (search && !state.coveTimeCapsuleOpened && !(state.inventory["tide-trinket-key"] > 0) && !(state.inventory["wind-journal"] > 0)) return null;

  return <section aria-label="Old Shoreline Time Capsule" className="space-y-3 rounded-xl bg-amber-50 p-4 text-amber-950">
    {!state.coveTimeCapsuleOpened ? <>
      <button type="button" className="min-h-12 rounded-lg bg-teal-900 px-4 py-2 font-bold text-white"
        onClick={() => {
          if (!(state.inventory["tide-trinket-key"] > 0)) {
            setMessage("Beneath the striped stone is a copper capsule with a wave-shaped lock. Bring the Forgotten Tide Key to open it.");
          } else if (!openCoveTimeCapsule()) {
            setMessage("Come back when an unusually low tide exposes the striped stone.");
          } else {
            setMessage("The Forgotten Tide Key turns. You opened the Old Shoreline Time Capsule. Five keepsakes are ready to explore.");
          }
        }}>Search beneath the striped stone</button>
    </> : <>
      <h3 ref={openedHeading} tabIndex={-1} className="font-serif text-xl font-bold">Old Shoreline Time Capsule</h3>
      <CapsuleArt position="0% 0%" />
      {finds.map((find) => <details key={find.name} className="rounded-lg bg-white/80 p-3">
        <summary className="cursor-pointer font-semibold">{find.name}</summary>
        <CapsuleArt position={find.position} />
        <p>{find.description}</p>
      </details>)}
    </>}
    <p role="status" aria-atomic="true">{message}</p>
  </section>;
}
