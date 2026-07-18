"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ITEMS } from "./items";
import { SFX_FILES } from "./media";
import { QuestDef } from "./quests";

export type Screen = "beach" | "bucket" | "workshop" | "bottles" | "cove" | "lighthouse" | "reef" | "ship" | "sandbars";
export type Zone = "beach" | "lighthouse" | "underwater";

export interface AudioSettings {
  master: number;
  music: number;
  ambience: number;
  musicMuted: boolean;
}

const NET_CUT_TARGET = 8;
const TRAP_PRY_TARGET = 6;
const ELLY_COOLDOWN_MS = 15000;

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
  ellyLastTap: number;
  snappyAwake: boolean;
  snappyFedCount: number;
  trapProgress: number;
  libbyRescued: boolean;
  marshmallowScratchCount: number;
  marshmallowGifted: boolean;
  saltyStreak: number;
  saltyTotalCatches: number;
  foundConstellations: string[];
  picnicBasketPlaced: boolean;
  umbrellaPlaced: boolean;
  hasBeachBag: boolean;
  seagullTraded: boolean;
  seagullTradeCount: number;
  raftInflated: boolean;
  sandbarsUnlocked: boolean;
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
  ellyLastTap: 0,
  snappyAwake: false,
  snappyFedCount: 0,
  trapProgress: 0,
  libbyRescued: false,
  marshmallowScratchCount: 0,
  marshmallowGifted: false,
  saltyStreak: 0,
  saltyTotalCatches: 0,
  foundConstellations: [],
  picnicBasketPlaced: false,
  umbrellaPlaced: false,
  hasBeachBag: false,
  seagullTraded: false,
  seagullTradeCount: 0,
  raftInflated: false,
  sandbarsUnlocked: false,
};

const SCREEN_ZONE: Record<Screen, Zone> = {
  beach: "beach",
  bucket: "beach",
  workshop: "beach",
  bottles: "beach",
  cove: "beach",
  lighthouse: "lighthouse",
  reef: "underwater",
  ship: "beach",
  sandbars: "underwater",
};

const SEAGULL_LOOT_TABLE = ["empty-glass-bottle", "shiny-soda-tab", "glass-purple"];

interface Ctx {
  state: GameState;
  screen: Screen;
  zone: Zone;
  setScreen: (s: Screen) => void;
  collectItem: (itemId: string, opts?: { silent?: boolean }) => void;
  emptyBucket: () => void;
  craft: (recipeId: string, cost: { itemId: string; count: number }[]) => boolean;
  cook: (cost: { itemId: string; count: number }[], outputItemId: string, outputCount?: number) => boolean;
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
  trapPryTarget: number;
  lastToast: string | null;
  tapElly: () => { ok: boolean; secondsLeft?: number };
  feedSnappy: () => boolean;
  pryTrap: () => void;
  tradeWithLibby: (give: { itemId: string; count: number }, get: { itemId: string; count: number }) => boolean;
  scratchMarshmallow: () => void;
  giftMarshmallow: () => boolean;
  throwBallToSalty: () => { thrown: boolean; caught?: boolean };
  addFoundConstellation: (id: string) => void;
  digBeachBag: () => boolean;
  tradeWithSeagull: () => { ok: boolean; snappyDefended?: boolean };
  shooSeagull: () => void;
  feedKelpToBirds: () => boolean;
  splashBirds: () => void;
  ignoreBirds: () => void;
  reinflateRaft: () => void;
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
    return requires.every((r) => (stateRef.current.inventory[r.itemId] || 0) >= r.count);
  };

  const deductCost = (inv: Record<string, number>, cost: { itemId: string; count: number }[]) => {
    for (const c of cost) inv[c.itemId] = (inv[c.itemId] || 0) - c.count;
    return inv;
  };

  const craft = (recipeId: string, cost: { itemId: string; count: number }[]) => {
    if (!hasEnough(cost)) return false;
    setState((s) => {
      const inv = deductCost({ ...s.inventory }, cost);
      if (ITEMS[recipeId]) inv[recipeId] = (inv[recipeId] || 0) + 1;
      const next: GameState = { ...s, inventory: inv, crafted: [...s.crafted, recipeId] };
      if (recipeId === "rowboat-repair") next.rowboatRepaired = true;
      if (recipeId === "beach-umbrella") next.umbrellaPlaced = true;
      if (recipeId === "picnic-basket") next.picnicBasketPlaced = true;
      if (recipeId === "inflatable-raft") {
        next.raftInflated = true;
        next.sandbarsUnlocked = true;
      }
      return next;
    });
    play("craftSuccess");
    toast("Crafted!");
    return true;
  };

  const cook = (cost: { itemId: string; count: number }[], outputItemId: string, outputCount = 1) => {
    if (!hasEnough(cost)) return false;
    setState((s) => {
      const inv = deductCost({ ...s.inventory }, cost);
      inv[outputItemId] = (inv[outputItemId] || 0) + outputCount;
      return { ...s, inventory: inv };
    });
    play("craftSuccess");
    const def = ITEMS[outputItemId];
    toast(def ? `Cooked ${def.name}!` : "Cooked!");
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
      const inv = deductCost({ ...s.inventory }, cost);
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
      const inv = deductCost({ ...s.inventory }, cost);
      return { ...s, inventory: inv, shipRestored: true };
    });
    play("craftSuccess");
    toast("The shipwreck is restored!");
    return true;
  };

  const tapElly = () => {
    const now = Date.now();
    const elapsed = now - stateRef.current.ellyLastTap;
    if (stateRef.current.ellyLastTap && elapsed < ELLY_COOLDOWN_MS) {
      return { ok: false, secondsLeft: Math.ceil((ELLY_COOLDOWN_MS - elapsed) / 1000) };
    }
    setState((s) => {
      const inv = { ...s.inventory };
      inv["luminous-sea-goo"] = (inv["luminous-sea-goo"] || 0) + 1;
      return { ...s, inventory: inv, ellyLastTap: now };
    });
    play("pearl");
    toast("Elly shares some Luminous Sea-Goo! ✨");
    return { ok: true };
  };

  const feedSnappy = () => {
    const cost = [{ itemId: "food-sea-rose-milk", count: 1 }];
    if (!hasEnough(cost)) return false;
    setState((s) => {
      const inv = deductCost({ ...s.inventory }, cost);
      return { ...s, inventory: inv, snappyAwake: true, snappyFedCount: s.snappyFedCount + 1 };
    });
    play("craftSuccess");
    toast("Snappy wakes up, happy and refreshed! 🐢");
    return true;
  };

  const pryTrap = () => {
    setState((s) => {
      if (s.libbyRescued) return s;
      const nextProgress = Math.min(TRAP_PRY_TARGET, s.trapProgress + 1);
      const justFinished = nextProgress >= TRAP_PRY_TARGET;
      const inv = { ...s.inventory };
      if (justFinished) inv["shell-flake-blue"] = (inv["shell-flake-blue"] || 0) + 1;
      return { ...s, trapProgress: nextProgress, libbyRescued: justFinished || s.libbyRescued, inventory: inv };
    });
    const willFinish = stateRef.current.trapProgress + 1 >= TRAP_PRY_TARGET;
    play(willFinish ? "questComplete" : "driftwood");
    toast(willFinish ? "Libby the lobster is free! 🦞" : "Prying the trap...");
  };

  const tradeWithLibby = (give: { itemId: string; count: number }, get: { itemId: string; count: number }) => {
    if (!stateRef.current.libbyRescued) return false;
    if (!hasEnough([give])) return false;
    setState((s) => {
      const inv = { ...s.inventory };
      inv[give.itemId] = (inv[give.itemId] || 0) - give.count;
      inv[get.itemId] = (inv[get.itemId] || 0) + get.count;
      return { ...s, inventory: inv };
    });
    play("shell");
    toast("Libby trades treasures with you!");
    return true;
  };

  const scratchMarshmallow = () => {
    setState((s) => ({ ...s, marshmallowScratchCount: s.marshmallowScratchCount + 1 }));
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(40);
      }
    } catch {}
    play("shell");
    toast("Marshmallow purrs contentedly 🐈");
  };

  const giftMarshmallow = () => {
    const cost = [{ itemId: "food-campfire-marshmallow", count: 1 }];
    if (!hasEnough(cost)) return false;
    setState((s) => {
      const inv = deductCost({ ...s.inventory }, cost);
      return { ...s, inventory: inv, marshmallowGifted: true };
    });
    play("craftSuccess");
    toast("Marshmallow the cat curls up happily by the hearth 🔥");
    return true;
  };

  const throwBallToSalty = () => {
    const cost = [{ itemId: "beach-ball", count: 1 }];
    if (!hasEnough(cost)) return { thrown: false };
    const caught = Math.random() < 0.7;
    setState((s) => {
      const inv = deductCost({ ...s.inventory }, cost);
      const nextStreak = caught ? s.saltyStreak + 1 : 0;
      const nextTotal = caught ? s.saltyTotalCatches + 1 : s.saltyTotalCatches;
      if (caught && nextStreak % 3 === 0) {
        inv["recycled-rubber"] = (inv["recycled-rubber"] || 0) + 1;
        inv["pearl-deepsea"] = (inv["pearl-deepsea"] || 0) + 1;
      }
      return { ...s, inventory: inv, saltyStreak: nextStreak, saltyTotalCatches: nextTotal };
    });
    play(caught ? "questComplete" : "plastic");
    toast(caught ? "Salty catches it! 🦭" : "Salty misses — try again!");
    return { thrown: true, caught };
  };

  const addFoundConstellation = (id: string) => {
    setState((s) => (s.foundConstellations.includes(id) ? s : { ...s, foundConstellations: [...s.foundConstellations, id] }));
  };

  const digBeachBag = () => {
    const cost = [
      { itemId: "dried-sea-oats", count: 3 },
      { itemId: "washed-up-canvas", count: 1 },
    ];
    if (stateRef.current.hasBeachBag) return false;
    if (!hasEnough(cost)) return false;
    setState((s) => {
      const inv = deductCost({ ...s.inventory }, cost);
      inv["beach-bag"] = (inv["beach-bag"] || 0) + 1;
      return { ...s, inventory: inv, hasBeachBag: true };
    });
    play("bagRustle");
    toast("You dig up the buried Beach Bag! 👜");
    return true;
  };

  const tradeWithSeagull = () => {
    if (!stateRef.current.picnicBasketPlaced) return { ok: false };
    const cost = [{ itemId: "coconut-cream", count: 1 }];
    if (!hasEnough(cost)) return { ok: false };
    const snappyDefended = stateRef.current.snappyAwake && Math.random() < 0.35;
    play("seagullSwoop");
    if (snappyDefended) {
      setState((s) => {
        const inv = { ...s.inventory };
        inv["glass-teal"] = (inv["glass-teal"] || 0) + 1;
        return { ...s, inventory: inv, seagullTraded: true };
      });
      toast("Snappy startles the seagull — it drops a Polished Teal Sea Glass and flees! 🐢");
      return { ok: true, snappyDefended: true };
    }
    setState((s) => {
      const inv = deductCost({ ...s.inventory }, cost);
      const loot = SEAGULL_LOOT_TABLE[Math.floor(Math.random() * SEAGULL_LOOT_TABLE.length)];
      inv[loot] = (inv[loot] || 0) + 1;
      return { ...s, inventory: inv, seagullTraded: true, seagullTradeCount: s.seagullTradeCount + 1 };
    });
    toast('Cheeky Seagull: "Kerr-r-r! Excellent doing business, human!" 🕊️');
    return { ok: true, snappyDefended: false };
  };

  const shooSeagull = () => {
    play("plastic");
    toast('Cheeky Seagull: "HRAAAK! Keep your fancy milk!" — it flies off.');
  };

  const feedKelpToBirds = () => {
    const cost = [{ itemId: "food-seaweed-chips", count: 1 }];
    if (!hasEnough(cost)) return false;
    setState((s) => {
      const inv = deductCost({ ...s.inventory }, cost);
      inv["recycled-rubber"] = (inv["recycled-rubber"] || 0) + 1;
      return { ...s, inventory: inv };
    });
    play("craftSuccess");
    toast("The birds fly off to eat — raft integrity maintained! 🛟");
    return true;
  };

  const splashBirds = () => {
    play("plastic");
    toast("A gentle splash sends the birds off to the sandbars.");
  };

  const ignoreBirds = () => {
    setState((s) => ({ ...s, raftInflated: false }));
    play("plastic");
    toast("A gull tugs the valve... the raft sags flat! pffFSSSSSSSSssss...");
  };

  const reinflateRaft = () => {
    setState((s) => ({ ...s, raftInflated: true }));
    play("umbrellaWhoof");
    toast("The raft is re-inflated and ready!");
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
      cook,
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
      trapPryTarget: TRAP_PRY_TARGET,
      lastToast,
      tapElly,
      feedSnappy,
      pryTrap,
      tradeWithLibby,
      scratchMarshmallow,
      giftMarshmallow,
      throwBallToSalty,
      addFoundConstellation,
      digBeachBag,
      tradeWithSeagull,
      shooSeagull,
      feedKelpToBirds,
      splashBirds,
      ignoreBirds,
      reinflateRaft,
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
