"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ARCHIE_BIRD, BIRD_GUIDE, PLANT_GUIDE } from "@/lib/shoreline-field-guides";
import { useGame } from "@/lib/store";

const book = "rounded-lg bg-white/80 p-3 ring-1 ring-amber-200";
const summary = "cursor-pointer rounded font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900";

function GuideArt({ src }: { src: string }) {
  return <Image src={src} alt="" width={128} height={128} unoptimized className="my-2 h-24 w-24 object-contain" />;
}

export default function ShorelineFieldGuides({ hasArchieKeepsakes }: { hasArchieKeepsakes: boolean }) {
  const { state } = useGame();
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => () => {
    const sound = audio.current;
    audio.current = null;
    sound?.pause();
  }, []);

  const recordedBird = (id: string) => !!state.notebookDiscovered[id]
    || (id === ARCHIE_BIRD.id && hasArchieKeepsakes)
    || (id === "patio-robin" && (state.robinNestingStage > 0 || state.robinNestingCompleted.length > 0));
  const recordedPlant = (id: string) => !!state.notebookDiscovered[id] || (state.inventory[id] ?? 0) > 0;
  const birdsRecorded = BIRD_GUIDE.filter(bird => recordedBird(bird.id)).length;
  const plants = PLANT_GUIDE.flatMap(group => group.entries);
  const plantsRecorded = plants.filter(plant => recordedPlant(plant.id)).length;

  const stopCall = () => {
    const sound = audio.current;
    audio.current = null;
    sound?.pause();
    setPlaying(null);
    setAnnouncement("");
  };

  const playCall = (id: string, name: string, src: string) => {
    stopCall();
    const sound = new Audio(src);
    audio.current = sound;
    sound.volume = state.audio.master * 0.65;
    setPlaying(id);
    setAnnouncement(`Playing the call for ${name}.`);
    sound.onended = () => { if (audio.current === sound) stopCall(); };
    void sound.play().catch(() => {
      if (audio.current !== sound) return;
      stopCall();
      setAnnouncement(`The call for ${name} could not play. Try again.`);
    });
  };

  return (
    <>
      <details className={book} onToggle={event => { if (!event.currentTarget.open) stopCall(); }}>
        <summary className={summary}>Birds of Shoreline ({birdsRecorded}/{BIRD_GUIDE.length} recorded)</summary>
        <div className="mt-2 space-y-2">
          <p className="text-sm">Read the entries and listen to sample calls. Meeting birds around Shoreline records them here.</p>
          {BIRD_GUIDE.map(bird => {
            const call = bird.calls?.[0];
            return (
              <details key={bird.id} name="library-bird-entry" className="rounded-lg bg-amber-50 p-3"
                onToggle={event => { if (!event.currentTarget.open && playing === bird.id) stopCall(); }}>
                <summary className={summary}>{bird.name} · {recordedBird(bird.id) ? "Recorded" : "To find"}</summary>
                <GuideArt src={bird.image} />
                <p className="text-sm"><strong>Where to look</strong> {bird.where}.</p>
                <p className="text-sm">{bird.note}</p>
                {call && (
                  <>
                    <button type="button" className="mt-2 min-h-11 rounded-lg bg-amber-900 px-3 py-2 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-900"
                      onClick={() => playing === bird.id ? stopCall() : playCall(bird.id, bird.name, call)}>
                      {playing === bird.id ? `Stop call for ${bird.name}` : `Listen to the call for ${bird.name}`}
                    </button>
                    <p className="text-sm" role="status">{announcement}</p>
                  </>
                )}
              </details>
            );
          })}
        </div>
      </details>
      <details className={book}>
        <summary className={summary}>Plants of Shoreline ({plantsRecorded}/{plants.length} recorded)</summary>
        <div className="mt-2 space-y-2">
          <p className="text-sm">Look up where to find or grow each plant. Your earlier finds count toward the guide.</p>
          {PLANT_GUIDE.map(group => (
            <details key={group.title} className="rounded-lg bg-amber-50 p-3">
              <summary className={summary}>{group.title}</summary>
              <div className="mt-2 space-y-2">
                {group.entries.map(plant => (
                  <details key={plant.id} name="library-plant-entry" className="rounded-lg bg-white p-2">
                    <summary className={summary}>{plant.name} · {recordedPlant(plant.id) ? "Recorded" : "To find"}</summary>
                    {plant.image && <GuideArt src={plant.image} />}
                    <p className="mt-1 text-sm"><strong>Where to look</strong> {plant.where}.</p>
                    <p className="text-sm">{plant.note}</p>
                  </details>
                ))}
              </div>
            </details>
          ))}
        </div>
      </details>
    </>
  );
}
