"use client";
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
        className="w-full accent-teal-600"
      />
      {hint && <p className="text-[11px] text-amber-600/80 mt-0.5">{hint}</p>}
    </div>
  );
}

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { state, setAudioSetting } = useGame();
  const { audio } = state;

  return (
    <div className="absolute inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="w-full sm:max-w-sm bg-[#fbf3e3] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-amber-900">Sound Settings</h2>
          <button onClick={onClose} className="text-amber-700 text-2xl leading-none px-2">
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
          onClick={() => setAudioSetting("musicMuted", !audio.musicMuted)}
          className={`w-full mt-2 py-2.5 rounded-xl font-semibold transition ${
            audio.musicMuted ? "bg-amber-200 text-amber-800" : "bg-teal-600 text-white"
          }`}
        >
          {audio.musicMuted ? "Music Muted — Tap to Unmute" : "Mute Music"}
        </button>
        <p className="text-[11px] text-amber-600/80 mt-2">
          Muting fades the score out gently and leaves tactile collection sounds (glass clinks, shell clicks) untouched.
        </p>
      </div>
    </div>
  );
}
