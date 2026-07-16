"use client";
import { useState } from "react";
import { useGame, Screen } from "@/lib/store";
import BeachScene from "./BeachScene";
import BucketPanel from "./BucketPanel";
import Workshop from "./Workshop";
import BottleQuests from "./BottleQuests";
import CoveScene from "./CoveScene";
import LighthouseScreen from "./LighthouseScreen";
import AudioEngine from "./AudioEngine";
import SettingsModal from "./SettingsModal";

const TABS: { id: Screen; label: string; icon: string }[] = [
  { id: "beach", label: "Beach", icon: "🏖️" },
  { id: "bucket", label: "Bucket", icon: "🪣" },
  { id: "workshop", label: "Workshop", icon: "🔨" },
  { id: "bottles", label: "Bottles", icon: "🍾" },
  { id: "cove", label: "Cove", icon: "🚣" },
  { id: "lighthouse", label: "Lighthouse", icon: "🗼" },
];

export default function GameShell() {
  const { screen, setScreen, lastToast, state } = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lockMsg, setLockMsg] = useState<string | null>(null);

  const isLocked = (id: Screen) => {
    if (id === "cove") return !state.rowboatRepaired;
    if (id === "lighthouse") return !state.chestOpened;
    return false;
  };

  const handleTab = (id: Screen) => {
    if (isLocked(id)) {
      setLockMsg(
        id === "cove"
          ? "Fill your bucket, then repair the rowboat in the Workshop first!"
          : "Open the treasure chest on the Hidden Beach first!"
      );
      window.setTimeout(() => setLockMsg((m) => (m ? null : m)), 2200);
      return;
    }
    setScreen(id);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col bg-[#0b3d3a] overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <AudioEngine />

      <header className="flex items-center justify-between px-4 py-2 bg-[#0b3d3a] text-amber-50">
        <span className="font-serif text-lg tracking-wide">Shoreline Sanctuary</span>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/10 rounded-full px-3 py-1">🪣 {state.bucketsFilled}</span>
          <button
            type="button"
            aria-label="Sound settings"
            onClick={() => setSettingsOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-base"
          >
            ⚙️
          </button>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {screen === "beach" && <BeachScene />}
        {screen === "bucket" && <BucketPanel />}
        {screen === "workshop" && <Workshop />}
        {screen === "bottles" && <BottleQuests />}
        {screen === "cove" && <CoveScene />}
        {screen === "lighthouse" && <LighthouseScreen />}

        {(lastToast || lockMsg) && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded-full shadow-lg animate-fade-in-out z-20 text-center max-w-[85%]">
            {lockMsg || lastToast}
          </div>
        )}

        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      </main>

      <nav
        className="grid grid-cols-6 bg-[#0b3d3a] border-t border-white/10"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {TABS.map((tab) => {
          const locked = isLocked(tab.id);
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => handleTab(tab.id)}
              className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors ${
                screen === tab.id ? "text-amber-300" : locked ? "text-amber-50/30" : "text-amber-50/60"
              }`}
            >
              <span className="text-lg leading-none">{locked ? "🔒" : tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
