"use client";
import { useState } from "react";
import { useGame } from "@/lib/store";

function Slider({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-amber-900">{label}</span>
        <span className="text-xs text-amber-600">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onInput={(e) => onChange(parseFloat((e.target as HTMLInputElement).value))}
        className="w-full accent-teal-600"
        style={{
          touchAction: "pan-x",
          WebkitAppearance: "none",
          appearance: "none",
          height: 28,
          background: "transparent",
        }}
      />
      {hint && <p className="text-[11px] text-amber-600/80 mt-0.5">{hint}</p>}
    </div>
  );
}

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { state, setAudioSetting, resetProgress } = useGame();
  const { audio } = state;
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <div className="absolute inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="w-full sm:max-w-sm bg-[#fbf3e3] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))", touchAction: "pan-y" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-amber-900">Sound Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-700 text-2xl leading-none px-2"
          >
            &times;
          </button>
        </div>

        <Slider
          label="Master Volume"
          value={audio.master}
          onChange={(v) => setAudioSetting("master", v)}
          hint="Sets the overall volume ceiling for music, ambience, and effects."
        />
        <Slider
          label="Ambience"
          value={audio.ambience}
          onChange={(v) => setAudioSetting("ambience", v)}
          hint="Natural wave wash & wind — keep this up and mute music for a pure beach simulator."
        />
        <Slider
          label="Music"
          value={audio.music}
          onChange={(v) => setAudioSetting("music", v)}
          hint="The adaptive instrumental score, synced to E Major across every zone."
        />

        <button
          type="button"
          onClick={() => setAudioSetting("musicMuted", !audio.musicMuted)}
          className={`w-full mt-2 py-3 rounded-xl font-semibold transition active:scale-[0.98] ${
            audio.musicMuted ? "bg-amber-200 text-amber-800" : "bg-teal-600 text-white"
          }`}
        >
          {audio.musicMuted ? "Music Muted — Tap to Unmute" : "Mute Music"}
        </button>
        <p className="text-[11px] text-amber-600/80 mt-2 mb-5">
          Muting fades the score out gently and leaves tactile collection sounds (glass clinks, shell clicks) untouched.
        </p>

        <div className="border-t border-amber-200 pt-4">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">Progress</h3>
          <p className="text-[11px] text-amber-600/80 mb-3">
            Your game autosaves to this device after every action — nothing to do there. If you ever want a
            clean slate, you can wipe your save below.
          </p>
          {!confirmingReset ? (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="w-full py-3 rounded-xl font-semibold text-red-700 bg-red-50 ring-1 ring-red-200 active:scale-[0.98]"
            >
              Reset Progress &amp; Start Over
            </button>
          ) : (
            <div className="rounded-xl bg-red-50 ring-1 ring-red-200 p-3">
              <p className="text-xs text-red-700 mb-2 font-semibold">
                This permanently erases your inventory, quests, and crafted items. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingReset(false)}
                  className="flex-1 py-2 rounded-lg font-semibold text-amber-800 bg-amber-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetProgress();
                    setConfirmingReset(false);
                    onClose();
                  }}
                  className="flex-1 py-2 rounded-lg font-semibold text-white bg-red-600"
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
