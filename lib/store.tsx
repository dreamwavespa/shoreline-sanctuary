"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ITEMS } from "./items";
import { SFX_FILES } from "./media";

export type Screen = "beach" | "bucket" | "workshop" | "bottles";
export type Zone = "beach" | "lighthouse" | "underwater";

export interface AudioSettings {
  master: number;
  music: number;
  ambience: number;
  musicMuted: boolean;
}

interface GameState {
  inventory: Record<string, number>;
  bucketCount: number;
  bucketsFilled: number;
  crafted: string[];
  questProgress: Record<string, boolean>;
  workshopUnlocked: boolean;
  totalCollected: number;
  audio: AudioSettings;
}

const BUCKET_CAPACITY = 20;

const DEFAULT_STATE: GameState = {
  inventory: {},
  bucketCount: 0,
  bucketsFilled: 0,
  crafted: [],
  questProgress: {},
  workshopUnlocked: false,
  totalCollected: 0,
  audio: { master: 0.9, music: 0.8, ambience: 0.7, musicMuted: false },
};

const SCREEN_ZONE: Record<Screen, Zone> = {
  beach: "beach",
  bucket: "beach",
  workshop: "beach",
  bottles: "beach",
};

interface Ctx {
  state: GameState;
  screen: Screen;
  zone: Zone;
  setScreen: (s: Screen) => void;
  collectItem: (itemId: string) => void;
  emptyBucket: () => void;
  craft: (recipeId: string, cost: { itemId: string; count: number }[]) => boolean;
  claimQuest: (questId: string, requires: { itemId: string; count: number }[], rewardItemId?: string, rewardCount?: number) => boolean;
  hasEnough: (requires: { itemId: string; count: number }[]) => boolean;
  play: (key: string) => void;
  setAudioSetting: <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => void;
  bucketCapacity: number;
  lastToast: string | null;
}

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [screen, setScreen] = useState<Screen>("beach");
  const [lastToast, setLastToast] = useState<string | null>(null);
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});
  const loaded = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem("shoreline-save");
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...DEFAULT_STATE, ...parsed, audio: { ...DEFAULT_STATE.audio, ...(parsed.audio || {}) } });
      }
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem("shoreline-save", JSON.stringify(state));
    } catch {}
  }, [state]);

  const play = (key: string) => {
    const src = SFX_FILES[key];
    if (!src) return;
    try {
      let a = audioCache.current[key];
      if (!a) {
        a = new Audio(src);
        audioCache.current[key] = a;
      }
      a.currentTime = 0;
      a.volume = 0.75 * stateRef.current.audio.master;
      void a.play().catch(() => {});
    } catch {}
  };

  const toast = (msg: string) => {
    setLastToast(msg);
    window.setTimeout(() => setLastToast((cur) => (cur === msg ? null : cur)), 2200);
  };

  const collectItem = (itemId: string) => {
    const def = ITEMS[itemId];
    if (!def) return;
    setState((s) => {
      const nextCount = (s.inventory[itemId] || 0) + 1;
      const nextBucket = s.bucketCount + 1;
      const totalCollected = s.totalCollected + 1;
      let bucketsFilled = s.bucketsFilled;
      let bucketCount = nextBucket;
      if (nextBucket >= BUCKET_CAPACITY) {
        bucketsFilled += 1;
        bucketCount = 0;
      }
      return {
        ...s,
        inventory: { ...s.inventory, [itemId]: nextCount },
        bucketCount,
        bucketsFilled,
        totalCollected,
      };
    });
    play(def.sfx);
    toast(`+1 ${def.name}`);
  };

  const emptyBucket = () => {
    play("bucketFull");
  };

  const hasEnough = (requires: { itemId: string; count: number }[]) => {
    return requires.every((r) => (state.inventory[r.itemId] || 0) >= r.count);
  };

  const craft = (recipeId: string, cost: { itemId: string; count: number }[]) => {
    if (!hasEnough(cost)) return false;
    setState((s) => {
      const inv = { ...s.inventory };
      for (const c of cost) inv[c.itemId] = (inv[c.itemId] || 0) - c.count;
      return { ...s, inventory: inv, crafted: [...s.crafted, recipeId] };
    });
    play("craftSuccess");
    toast("Crafted!");
    return true;
  };

  const claimQuest = (
    questId: string,
    requires: { itemId: string; count: number }[],
    rewardItemId?: string,
    rewardCount?: number
  ) => {
    if (state.questProgress[questId]) return false;
    if (!hasEnough(requires)) return false;
    setState((s) => {
      const inv = { ...s.inventory };
      for (const r of requires) inv[r.itemId] = (inv[r.itemId] || 0) - r.count;
      if (rewardItemId) inv[rewardItemId] = (inv[rewardItemId] || 0) + (rewardCount || 1);
      return {
        ...s,
        inventory: inv,
        questProgress: { ...s.questProgress, [questId]: true },
        workshopUnlocked: questId === "glassartisan" ? true : s.workshopUnlocked,
      };
    });
    play("questComplete");
    toast("Quest complete!");
    return true;
  };

  const setAudioSetting = <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
    setState((s) => ({ ...s, audio: { ...s.audio, [key]: value } }));
  };

  const zone = SCREEN_ZONE[screen];

  const value = useMemo(
    () => ({
      state,
      screen,
      zone,
      setScreen,
      collectItem,
      emptyBucket,
      craft,
      claimQuest,
      hasEnough,
      play,
      setAudioSetting,
      bucketCapacity: BUCKET_CAPACITY,
      lastToast,
    }),
    [state, screen, zone, lastToast]
  );

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
