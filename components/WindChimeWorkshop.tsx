"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ITEMS } from "@/lib/items";
import { useGame } from "@/lib/store";

interface ChimePiece {
  id: string;
  itemId: string;
  toneName: string;
  frequency: number;
  colorClass: string;
  shapeClass: string;
}

const CHIME_PIECES: ChimePiece[] = [
  { id: "green-glass", itemId: "glass-green", toneName: "bright G", frequency: 783.99, colorClass: "bg-emerald-500", shapeClass: "rounded-[45%_35%_50%_30%]" },
  { id: "blue-glass", itemId: "glass-blue", toneName: "clear E", frequency: 659.25, colorClass: "bg-sky-500", shapeClass: "rounded-[35%_50%_32%_48%]" },
  { id: "amber-glass", itemId: "glass-amber", toneName: "warm C", frequency: 523.25, colorClass: "bg-amber-500", shapeClass: "rounded-[50%_30%_45%_38%]" },
  { id: "scallop", itemId: "shell-scallop", toneName: "soft A", frequency: 440, colorClass: "bg-rose-200", shapeClass: "rounded-t-full rounded-b-lg" },
  { id: "sand-dollar", itemId: "shell-sanddollar", toneName: "ringing D", frequency: 587.33, colorClass: "bg-stone-100", shapeClass: "rounded-full" },
  { id: "conch", itemId: "shell-conch", toneName: "deep F", frequency: 349.23, colorClass: "bg-orange-200", shapeClass: "rounded-[55%_35%_50%_25%]" },
];

const MIN_PIECES = 3;
const MAX_PIECES = 5;

export default function WindChimeWorkshop({ onClose }: { onClose: () => void }) {
  const { state } = useGame();
  const [arrangement, setArrangement] = useState<ChimePiece[]>([]);
  const [announcement, setAnnouncement] = useState("Choose at least three shells or pieces of sea glass for your wind chime.");
  const [playingSequence, setPlayingSequence] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<number[]>([]);
  const activeGainsRef = useRef<GainNode[]>([]);

  useEffect(() => {
    headingRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      audioContextRef.current?.close().catch(() => {});
    };
  }, [onClose]);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => {});
    }
    return audioContextRef.current;
  };

  const playTone = (piece: ChimePiece, announce = true) => {
    const context = getAudioContext();
    const now = context.currentTime;
    const masterLevel = Math.max(0.0001, state.audio.master * 0.22);
    const gain = context.createGain();
    const primary = context.createOscillator();
    const shimmer = context.createOscillator();

    primary.type = piece.itemId.startsWith("shell-") ? "sine" : "triangle";
    primary.frequency.setValueAtTime(piece.frequency, now);
    shimmer.type = "sine";
    shimmer.frequency.setValueAtTime(piece.frequency * 2.01, now);
    gain.gain.setValueAtTime(masterLevel, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);

    primary.connect(gain);
    shimmer.connect(gain);
    gain.connect(context.destination);
    activeGainsRef.current.push(gain);
    primary.onended = () => {
      activeGainsRef.current = activeGainsRef.current.filter((activeGain) => activeGain !== gain);
    };
    primary.start(now);
    shimmer.start(now);
    primary.stop(now + 1.3);
    shimmer.stop(now + 1.3);
    if (announce) setAnnouncement(`${ITEMS[piece.itemId].name}: ${piece.toneName} tone.`);
  };

  const stopSequence = (announce = true) => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    const context = audioContextRef.current;
    if (context) {
      activeGainsRef.current.forEach((gain) => {
        gain.gain.cancelScheduledValues(context.currentTime);
        gain.gain.setValueAtTime(0.0001, context.currentTime);
      });
      activeGainsRef.current = [];
    }
    setPlayingSequence(false);
    if (announce) setAnnouncement("Finished chime playback stopped.");
  };

  const addPiece = (piece: ChimePiece) => {
    if (arrangement.length >= MAX_PIECES) {
      setAnnouncement(`The chime is full. Remove a piece before adding ${ITEMS[piece.itemId].name}.`);
      return;
    }
    const next = [...arrangement, piece];
    setArrangement(next);
    playTone(piece, false);
    setAnnouncement(`${ITEMS[piece.itemId].name} added in position ${next.length}. ${MAX_PIECES - next.length} spaces remain.`);
  };

  const removePiece = (index: number) => {
    const piece = arrangement[index];
    setArrangement((current) => current.filter((_, pieceIndex) => pieceIndex !== index));
    setAnnouncement(`${ITEMS[piece.itemId].name} removed.`);
  };

  const movePiece = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= arrangement.length) return;
    const next = [...arrangement];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setArrangement(next);
    setAnnouncement(`${ITEMS[next[nextIndex].itemId].name} moved to position ${nextIndex + 1}.`);
  };

  const playFinishedChime = () => {
    if (arrangement.length < MIN_PIECES) {
      setAnnouncement(`Add ${MIN_PIECES - arrangement.length} more ${arrangement.length === MIN_PIECES - 1 ? "piece" : "pieces"} before playing the finished chime.`);
      return;
    }
    stopSequence(false);
    setPlayingSequence(true);
    setAnnouncement(`Playing your finished chime: ${arrangement.map((piece) => ITEMS[piece.itemId].name).join(", ")}.`);
    arrangement.forEach((piece, index) => {
      const timer = window.setTimeout(() => playTone(piece, false), index * 360);
      timersRef.current.push(timer);
    });
    const finishTimer = window.setTimeout(() => {
      setPlayingSequence(false);
      setAnnouncement("Finished chime playback complete.");
      timersRef.current = [];
    }, arrangement.length * 360 + 1300);
    timersRef.current.push(finishTimer);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#18343a]/95 px-3 py-5" role="dialog" aria-modal="true" aria-labelledby="wind-chime-title">
      <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-b from-amber-50 to-cyan-50 p-5 shadow-2xl ring-1 ring-amber-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-700">Workshop Mini-Game</p>
            <h2 id="wind-chime-title" ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-bold text-amber-950 outline-none">🎐 Wind Chime Workshop</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-4 py-2 font-semibold text-amber-950 ring-1 ring-amber-300">Close</button>
        </div>

        <p className="mt-4 text-amber-950">Choose three to five pieces. Tap any hanging piece to hear its tone, then arrange the tones until your chime sounds just right.</p>

        <section aria-labelledby="piece-tray-heading" className="mt-5">
          <h3 id="piece-tray-heading" className="font-bold text-amber-950">Shell and Sea Glass Tray</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CHIME_PIECES.map((piece) => (
              <div key={piece.id} className="rounded-xl bg-white/90 p-3 text-center ring-1 ring-amber-200">
                <Image src={ITEMS[piece.itemId].icon} alt="" width={46} height={46} unoptimized className="mx-auto h-12 w-12 object-contain" />
                <p className="mt-1 text-sm font-bold text-amber-950">{ITEMS[piece.itemId].name}</p>
                <p className="text-xs text-amber-700">{piece.toneName}</p>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <button type="button" onClick={() => playTone(piece)} className="rounded-lg bg-cyan-100 px-2 py-2 text-xs font-bold text-teal-900">Hear</button>
                  <button type="button" disabled={arrangement.length >= MAX_PIECES} onClick={() => addPiece(piece)} className="rounded-lg bg-teal-700 px-2 py-2 text-xs font-bold text-white disabled:bg-teal-200 disabled:text-teal-700">Add</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="chime-arrangement-heading" className="mt-5 rounded-2xl bg-sky-100/80 p-4 ring-1 ring-sky-200">
          <div className="flex items-center justify-between gap-3">
            <h3 id="chime-arrangement-heading" className="font-bold text-sky-950">Your Chime</h3>
            <span className="text-sm font-semibold text-sky-800">{arrangement.length}/{MAX_PIECES} pieces</span>
          </div>

          <div className="relative mt-4 min-h-52 overflow-x-auto rounded-2xl bg-gradient-to-b from-sky-200 to-white px-3 pb-4 pt-8">
            <div aria-hidden="true" className="absolute left-5 right-5 top-7 h-4 rounded-full bg-amber-800 shadow" />
            {arrangement.length ? (
              <div className="relative z-10 flex min-w-max items-start justify-center gap-3 px-2">
                {arrangement.map((piece, index) => (
                  <div key={`${piece.id}-${index}`} className="flex w-24 flex-col items-center">
                    <div aria-hidden="true" className="h-10 w-px bg-stone-600" style={{ height: `${38 + index * 7}px` }} />
                    <button
                      type="button"
                      onClick={() => playTone(piece)}
                      aria-label={`Position ${index + 1}, ${ITEMS[piece.itemId].name}, ${piece.toneName}. Play tone.`}
                      className={`h-16 w-14 border-4 border-white/70 shadow-lg ${piece.colorClass} ${piece.shapeClass}`}
                    />
                    <p className="mt-2 text-center text-xs font-bold text-sky-950">{index + 1}. {ITEMS[piece.itemId].name}</p>
                    <div className="mt-2 grid grid-cols-3 gap-1">
                      <button type="button" disabled={index === 0} onClick={() => movePiece(index, -1)} aria-label={`Move ${ITEMS[piece.itemId].name} left`} className="rounded bg-white px-2 py-1 text-sm font-bold text-sky-900 disabled:opacity-30">←</button>
                      <button type="button" onClick={() => removePiece(index)} aria-label={`Remove ${ITEMS[piece.itemId].name}`} className="rounded bg-white px-2 py-1 text-sm font-bold text-red-700">×</button>
                      <button type="button" disabled={index === arrangement.length - 1} onClick={() => movePiece(index, 1)} aria-label={`Move ${ITEMS[piece.itemId].name} right`} className="rounded bg-white px-2 py-1 text-sm font-bold text-sky-900 disabled:opacity-30">→</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="pt-16 text-center text-sm text-sky-800">Your selected pieces will hang here.</p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" disabled={arrangement.length < MIN_PIECES || playingSequence} onClick={playFinishedChime} className="rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:bg-teal-200 disabled:text-teal-700">{playingSequence ? "Playing Chime…" : "Play Finished Chime"}</button>
            <button type="button" disabled={!playingSequence} onClick={() => stopSequence()} className="rounded-xl bg-white px-4 py-3 font-bold text-sky-900 ring-1 ring-sky-300 disabled:opacity-45">Stop Sound</button>
          </div>
        </section>

        <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      </div>
    </div>
  );
}
