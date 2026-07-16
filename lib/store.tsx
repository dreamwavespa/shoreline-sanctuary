"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ITEMS } from "./items";
import { SFX_FILES } from "./media";
import { QuestDef } from "./quests";

export type Screen = "beach" | "bucket" | "workshop" | "bottles" | "cove" | "lighthouse" | "reef";
export type Zone = "beach" | "lighthouse" | "underwater";

export interface AudioSettings {
  master: number;
  music: number;
  ambience: number;
  musicMuted: boolean;
}

const NET_CUT_TARGET = 8;

interface GameState {
  inventory: Record<string, number>;
  bucketCount: number;
  bucketsFilled: number;
  crafted: string[];
  questProgress: Record<string, boolean>;
  workshopUnlocked: boolean;
  totalCollected: number;
  audio: AudioSettings;
  rowboatRepaired: boolean;
  chestOpened: boolean;
  hasDivingGear: boolean;
  netProgress: number;
  ghostNetCut: boolean;
  shipRestored: boolean;
  gameCompleted: boolean;
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
  rowboatRepaired: false,
  chestOpened: false,
  hasDivingGear: false,
  netProgress: 0,
  ghostNetCut: false,
  shipRestored: false,
  gameCompleted: false,
};

const SCREEN_ZONE: Record<Screen, Zone> = {
  beach: "beach",
  bucket: "beach",
  workshop: "beach",
  bottles: "beach",
  cove: "beach",
  lighthouse: "lighthouse",
  reef: "underwater",
};

interface Ctx {
  state: GameState;
  screen: Screen;
  zone: Zone;
  setScreen: (s: Screen) => void;
  collectItem: (itemId: string, opts?: { silent?: boolean }) => void;
  emptyBucket: () => void;
  craft: (recipeId: string, cost: { itemId: string; count: number }[]) => boolean;
  claimQuest: (quest: QuestDef) => boolean;
  openChest: (cost: { itemId: string; count: number }[]) => boolean;
  cutNet: () => void;
  restoreShip: (cost: { itemId: string; count: number }[]) => boolean;
  hasEnough: (requires: { itemId: string; count: number }[]) => boolean;
  play: (key: string) => void;
  setAudioSetting: <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => void;
  resetProgress: () => void;
  bucketCapacity: number;
  netCutTarget: number;
  lastToast: string | null;
}

const GameCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "shoreline-save";

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
      const raw = localStorage.getItem(STORAGE_KEY);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  const collectItem = (itemId: string, opts?: { silent?: boolean }) => {
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
    if (!opts?.silent) {
      play(def.sfx);
      toast(`+1 ${def.name}`);
    }
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
      const next: GameState = { ...s, inventory: inv, crafted: [...s.crafted, recipeId] };
      if (recipeId === "rowboat-repair") next.rowboatRepaired = true;
      return next;
    });
    play("craftSuccess");
    toast("Crafted!");
    return true;
  };

  const claimQuest = (quest: QuestDef) => {
    if (state.questProgress[quest.id]) return false;
    if (quest.requiresFlag && !(state as any)[quest.requiresFlag]) return false;
    if (quest.requiresCraft && !state.crafted.includes(quest.requiresCraft)) return false;
    if (quest.requires.length && !hasEnough(quest.requires)) return false;
    setState((s) => {
      const inv = { ...s.inventory };
      for (const r of quest.requires) inv[r.itemId] = (inv[r.itemId] || 0) - r.count;
      if (quest.rewardItemId) inv[quest.rewardItemId] = (inv[quest.rewardItemId] || 0) + (quest.rewardCount || 1);
      return {
        ...s,
        inventory: inv,
        questProgress: { ...s.questProgress, [quest.id]: true },
        workshopUnlocked: quest.unlocksWorkshop ? true : s.workshopUnlocked,
        gameCompleted: quest.id === "grandreunion" ? true : s.gameCompleted,
      };
    });
    play("questComplete");
    toast("Quest complete!");
    return true;
  };

  const openChest = (cost: { itemId: string; count: number }[]) => {
    if (state.chestOpened) return false;
    if (!hasEnough(cost)) return false;
    setState((s) => {
      const inv = { ...s.inventory };
      for (const c of cost) inv[c.itemId] = (inv[c.itemId] || 0) - c.count;
      inv["trophy-map"] = (inv["trophy-map"] || 0) + 1;
      inv["trophy-compass"] = (inv["trophy-compass"] || 0) + 1;
      inv["trophy-diving-gear"] = (inv["trophy-diving-gear"] || 0) + 1;
      return { ...s, inventory: inv, chestOpened: true, hasDivingGear: true };
    });
    play("questComplete");
    toast("Chest opened!");
    return true;
  };

  const cutNet = () => {
    setState((s) => {
      if (s.ghostNetCut) return s;
      const nextProgress = Math.min(NET_CUT_TARGET, s.netProgress + 1);
      const justFinished = nextProgress >= NET_CUT_TARGET;
      return { ...s, netProgress: nextProgress, ghostNetCut: justFinished || s.ghostNetCut };
    });
    const willFinish = stateRef.current.netProgress + 1 >= NET_CUT_TARGET;
    play(willFinish ? "questComplete" : "plastic");
    toast(willFinish ? "Ghost net cleared!" : "Snip!");
  };

  const restoreShip = (cost: { itemId: string; count: number }[]) => {
    if (state.shipRestored) return false;
    if (!state.ghostNetCut) return false;
    if (!hasEnough(cost)) return false;
    setState((s) => {
      const inv = { ...s.inventory };
      for (const c of cost) inv[c.itemId] = (inv[c.itemId] || 0) - c.count;
      return { ...s, inventory: inv, shipRestored: true };
    });
    play("craftSuccess");
    toast("The shipwreck is restored!");
    return true;
  };

  const setAudioSetting = <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
    setState((s) => ({ ...s, audio: { ...s.audio, [key]: value } }));
  };

  const resetProgress = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setState(DEFAULT_STATE);
    setScreen("beach");
    toast("Progress reset");
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
      openChest,
      cutNet,
      restoreShip,
      hasEnough,
      play,
      setAudioSetting,
      resetProgress,
      bucketCapacity: BUCKET_CAPACITY,
      netCutTarget: NET_CUT_TARGET,
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
