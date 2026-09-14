"use client";

import { useState } from "react";
import { ITEMS } from "@/lib/items";
import { BASIC_SHELL_PATTERNS, NOTEBOOK_SHELL_PATTERNS, PAINTABLE_SHELL_IDS, SHELL_PAINT_COLORS, SUNNY_QUEST_PATTERN } from "@/lib/shellPainting";
import { useGame } from "@/lib/store";

const COLOR_CLASSES: Record<string, string> = {
  "Coral Pink": "text-pink-500",
  "Sea-Glass Teal": "text-teal-600",
  "Sunny Yellow": "text-amber-400",
  "Soft Lavender": "text-purple-500",
};

export default function ShellPaintingStudio({ onClose }: { onClose: () => void }) {
  const { state, createPaintedShell } = useGame();
  const availableShells = PAINTABLE_SHELL_IDS.filter((id) => (state.inventory[id] || 0) > 0);
  const patterns = [
    ...BASIC_SHELL_PATTERNS,
    ...(state.questProgress.sunnyshellpalette ? [SUNNY_QUEST_PATTERN] : []),
    ...(state.notebookRewardsClaimed.includes("beachcombing-shells") ? [...NOTEBOOK_SHELL_PATTERNS] : []),
  ];
  const [shellId, setShellId] = useState<string>(availableShells[0] || "");
  const [color, setColor] = useState<string>(SHELL_PAINT_COLORS[0]);
  const [pattern, setPattern] = useState<string>(BASIC_SHELL_PATTERNS[0]);
  const [name, setName] = useState("");
  const [announcement, setAnnouncement] = useState("Sunny’s Shell Painting Studio opened.");

  const save = () => {
    const painted = createPaintedShell(shellId, color, pattern, name);
    if (!painted) {
      setAnnouncement("Choose an available shell and make sure you have one Paint Pigment.");
      return;
    }
    setAnnouncement(`${painted.name} was saved in Sunny’s Painted Shell Gallery.`);
    setName("");
    if ((state.inventory[shellId] || 0) <= 1) setShellId(availableShells.find((id) => id !== shellId) || "");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sky-950/90 p-4" role="dialog" aria-modal="true" aria-labelledby="shell-paint-title" aria-describedby="shell-paint-description" onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}>
      <div className="mx-auto max-w-2xl rounded-3xl bg-[#fff8e8] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700">Workshop Crafting Activity</p>
            <h1 id="shell-paint-title" className="font-serif text-2xl font-bold text-sky-950">⭐ Sunny’s Shell Painting Studio</h1>
          </div>
          <button type="button" autoFocus onClick={onClose} className="rounded-xl bg-sky-100 px-4 py-2 font-bold text-sky-950">Close</button>
        </div>
        <p id="shell-paint-description" className="mt-2 text-sm text-sky-800">Choose a shell, color, and pattern. No drawing or dragging is required. Each finished shell uses one shell and one Paint Pigment.</p>
        <p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm font-semibold text-teal-800">{announcement}</p>

        <div className="mt-4 rounded-3xl bg-gradient-to-br from-cyan-100 via-white to-pink-100 p-6 text-center shadow-inner ring-1 ring-sky-200" role="img" aria-label={`Preview of ${shellId ? ITEMS[shellId].name : "a shell"}, painted ${color} with the ${pattern} pattern`}>
          <p className={`text-7xl ${COLOR_CLASSES[color]}`} aria-hidden="true">🐚</p>
          <p className="mt-3 rounded-full bg-white/75 px-3 py-1 text-sm font-bold text-sky-950">{pattern}</p>
        </div>

        <ChoiceGroup title="Shell" value={shellId} options={[...availableShells]} label={(id) => `${ITEMS[id].name} (${state.inventory[id] || 0})`} onChange={setShellId} empty="Collect a scallop, whelk, cowrie, clam, conch, or abalone shell first." />
        <ChoiceGroup title="Paint Color" value={color} options={[...SHELL_PAINT_COLORS]} label={(value) => value} onChange={setColor} />
        <ChoiceGroup title="Pattern" value={pattern} options={patterns} label={(value) => value} onChange={setPattern} />

        {!state.questProgress.sunnyshellpalette && <p className="mt-3 rounded-xl bg-amber-100 p-3 text-xs font-semibold text-amber-900">Complete Sunny’s Shell Palette Bottle quest to unlock Pastel Wave.</p>}
        {!state.notebookRewardsClaimed.includes("beachcombing-shells") && <p className="mt-2 rounded-xl bg-purple-100 p-3 text-xs font-semibold text-purple-900">Complete the Beachcombing &amp; Shells Notebook page to collect two more pastel patterns.</p>}

        <label htmlFor="painted-shell-name" className="mt-4 block text-sm font-bold text-sky-950">Shell name (optional)</label>
        <input id="painted-shell-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={50} placeholder="Sunny can name it for you" className="mt-1 min-h-12 w-full rounded-xl border border-sky-300 bg-white px-3 text-sky-950" />
        <button type="button" disabled={!shellId || (state.inventory["paint-pigment"] || 0) < 1} onClick={save} className="mt-4 min-h-12 w-full rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:bg-slate-300 disabled:text-slate-600">Paint and Save Shell · Pigment: {state.inventory["paint-pigment"] || 0}</button>

        <section className="mt-6" aria-labelledby="painted-shell-gallery-heading">
          <h2 id="painted-shell-gallery-heading" className="font-serif text-xl font-bold text-sky-950">Sunny’s Painted Shell Gallery</h2>
          {state.paintedShells.length === 0 ? <p className="mt-2 text-sm text-sky-700">Your first painted shell will appear here.</p> : (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {state.paintedShells.map((shell) => (
                <article key={shell.id} className="rounded-2xl bg-white p-4 text-center shadow ring-1 ring-sky-200">
                  <p className={`text-4xl ${COLOR_CLASSES[shell.color]}`} aria-hidden="true">🐚</p>
                  <h3 className="mt-2 text-sm font-bold text-sky-950">{shell.name}</h3>
                  <p className="text-[11px] text-sky-800">{ITEMS[shell.shellId].name} · {shell.color} · {shell.pattern}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ChoiceGroup({ title, value, options, label, onChange, empty }: {
  title: string;
  value: string;
  options: string[];
  label: (value: string) => string;
  onChange: (value: string) => void;
  empty?: string;
}) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-bold text-sky-950">{title}</legend>
      {options.length === 0 ? <p className="mt-1 text-sm text-sky-700">{empty}</p> : (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {options.map((option) => <button key={option} type="button" aria-pressed={value === option} onClick={() => onChange(option)} className={`min-h-11 rounded-xl px-3 py-2 text-sm font-semibold ring-1 ${value === option ? "bg-sky-700 text-white ring-sky-800" : "bg-white text-sky-900 ring-sky-200"}`}>{label(option)}</button>)}
        </div>
      )}
    </fieldset>
  );
}
