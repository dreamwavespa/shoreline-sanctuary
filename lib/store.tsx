"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ITEMS } from "./items";
import { SFX_FILES } from "./media";
import { QuestDef } from "./quests";
import { VILLAGERS } from "./villagers";
import { SEAWEED_DISCOVERIES, SELL_PRICES, SHOP_STOCK } from "./shop";

export type Screen = "beach" | "bucket" | "workshop" | "bottles" | "cove" | "lighthouse" | "reef" | "ship" | "sandbars" | "cottage" | "shop";
export type Zone = "beach" | "lighthouse" | "underwater";

export interface WeatherForecast {
  id: "calm" | "low-tide" | "fog" | "wind" | "ship" | "storm";
  icon: string;
  title: string;
  message: string;
  effect: string;
}

export interface AudioSettings {
  master: number;
  music: number;
  ambience: number;
  musicMuted: boolean;
}

const NET_CUT_TARGET = 8;
const TRAP_PRY_TARGET = 6;
const ELLY_COOLDOWN_MS = 15000;

export interface SandcastleFeature {
  label: string;
  icon: string;
}

export interface SavedSandcastle {
  id: string;
  createdAt: number;
  features: Record<string, SandcastleFeature>;
  waveGifts: SandcastleFeature[];
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
  villagerGiftCounts: Record<string, number>;
  notebookDiscovered: Record<string, boolean>;
  notebookSeenCount: number;
  sandcastleGallery: SavedSandcastle[];
  lookoutSightings: string[];
  kettleRecovered: boolean;
  weatherStationUnlocked: boolean;
  currentForecast: WeatherForecast | null;
  stormCleanupAvailable: boolean;
  stormCleanupCompletions: number;
  tidePoolDiscoveries: string[];
  tidePoolSearchesCompleted: number;
  sandDollars: number;
  seaweedDiscoveryPurchases: string[];
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
  villagerGiftCounts: {},
  notebookDiscovered: {},
  notebookSeenCount: 0,
  sandcastleGallery: [],
  lookoutSightings: [],
  kettleRecovered: false,
  weatherStationUnlocked: false,
  currentForecast: null,
  stormCleanupAvailable: false,
  stormCleanupCompletions: 0,
  tidePoolDiscoveries: [],
  tidePoolSearchesCompleted: 0,
  sandDollars: 8,
  seaweedDiscoveryPurchases: [],
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
  cottage: "beach",
  shop: "beach",
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
  play: (key: string, volume?: number) => void;
  playBottleSequence: () => void;
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
  giftVillager: (villagerId: string, itemId: string) => boolean;
  musicOverride: string | null;
  setMusicOverride: (key: string | null) => void;
  notebookOpen: boolean;
  setNotebookOpen: (v: boolean) => void;
  markNotebookSeen: () => void;
  saveSandcastle: (castle: Omit<SavedSandcastle, "id" | "createdAt">) => void;
  addLookoutSighting: (id: string) => void;
  addTidePoolDiscovery: (id: string) => void;
  completeTidePoolSearch: () => void;
  recoverMaevesKettle: () => boolean;
  checkWeather: () => WeatherForecast;
  completeStormCleanup: () => boolean;
  buyFromSeaweed: (itemId: string, discoveryDate?: string) => boolean;
  sellToSeaweed: (itemId: string) => boolean;
}

const GameCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "shoreline-save";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [screen, setScreen] = useState<Screen>("beach");
  const [lastToast, setLastToast] = useState<string | null>(null);
  // Not persisted — a transient "this screen wants a specific track instead
  // of the zone default" signal that AudioEngine is the single owner of
  // actually playing. Screens/tabs must NEVER instantiate their own <audio>
  // element for music, or it plays simultaneously with AudioEngine's track
  // (this was the exact bug that caused Kitchen and the Lobster Trap to
  // double up on music).
  const [musicOverride, setMusicOverride] = useState<string | null>(null);
  const [notebookOpen, setNotebookOpen] = useState(false);
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

  // Sanctuary Explorer's Notebook: the first time the player ever holds an
  // item, permanently log it as "discovered" — even if it's later spent,
  // gifted, or crafted away. This runs once per inventory change and is a
  // no-op once everything currently held has already been logged.
  useEffect(() => {
    setState((s) => {
      let changed = false;
      const notebookDiscovered = { ...s.notebookDiscovered };
      for (const [itemId, count] of Object.entries(s.inventory)) {
        if (count > 0 && !notebookDiscovered[itemId]) {
          notebookDiscovered[itemId] = true;
          changed = true;
        }
      }
      return changed ? { ...s, notebookDiscovered } : s;
    });
  }, [state.inventory]);

  const play = (key: string, volume = 0.75) => {
    const src = SFX_FILES[key];
    if (!src) return;
    try {
      // Detached Audio() elements do not propagate their media events to
      // document. Tell AudioEngine explicitly that an interaction sound is
      // about to play so mobile Safari can keep the background track alive.
      window.dispatchEvent(new Event("shoreline:audio-interaction"));
      let a = audioCache.current[key];
      if (!a) {
        a = new Audio(src);
        audioCache.current[key] = a;
      }
      a.currentTime = 0;
      a.volume = volume * stateRef.current.audio.master;
      void a.play()
        .then(() => window.dispatchEvent(new Event("shoreline:audio-interaction")))
        .catch(() => {});
    } catch {}
  };

  const playBottleSequence = () => {
    const keys = ["bottleGlass", "bottleCork", "bottleParchment"];

    const playStep = (index: number) => {
      if (index >= keys.length) return;

      const key = keys[index];
      const src = SFX_FILES[key];

      if (!src) {
        playStep(index + 1);
        return;
      }

      try {
        window.dispatchEvent(new Event("shoreline:audio-interaction"));
        let a = audioCache.current[key];

        if (!a) {
          a = new Audio(src);
          audioCache.current[key] = a;
        }

        a.pause();
        a.currentTime = 0;
        a.volume = 0.75 * stateRef.current.audio.master;

        const handleEnded = () => {
          a?.removeEventListener("ended", handleEnded);
          window.dispatchEvent(new Event("shoreline:audio-interaction"));
          playStep(index + 1);
        };

        a.addEventListener("ended", handleEnded);

        void a.play().catch(() => {
          a?.removeEventListener("ended", handleEnded);
          playStep(index + 1);
        });
      } catch {
        playStep(index + 1);
      }
    };

    playStep(0);
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
      play(def.sfx, def.sfx === "stone" ? 1 : undefined);
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
      const keeperKettleComplete = quest.id === "keeperkettle";
      return {
        ...s,
        inventory: inv,
        questProgress: { ...s.questProgress, [quest.id]: true },
        workshopUnlocked: quest.unlocksWorkshop ? true : s.workshopUnlocked,
        gameCompleted: quest.id === "grandreunion" ? true : s.gameCompleted,
        weatherStationUnlocked: keeperKettleComplete ? true : s.weatherStationUnlocked,
        currentForecast: keeperKettleComplete
          ? {
              id: "storm",
              icon: "🌦️",
              title: "Clearing after the gale",
              message: "The worst has passed, but the strand below the lighthouse is littered with storm debris.",
              effect: "Storm Cleanup is available at the Weather Station.",
            }
          : s.currentForecast,
        stormCleanupAvailable: keeperKettleComplete ? true : s.stormCleanupAvailable,
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
    play(caught ? "questComplete" : "beachBall");
    toast(caught ? "Salty catches it! 🤭" : "Salty misses — try again!");
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
    toast("The birds fly off to eat — raft integrity maintained! 🴟");
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

  const giftVillager = (villagerId: string, itemId: string) => {
    const villager = VILLAGERS[villagerId];
    if (!villager) return false;
    if (!hasEnough([{ itemId, count: 1 }])) return false;
    setState((s) => {
      const inv = deductCost({ ...s.inventory }, [{ itemId, count: 1 }]);
      const villagerGiftCounts = {
        ...s.villagerGiftCounts,
        [villagerId]: (s.villagerGiftCounts[villagerId] || 0) + 1,
      };
      return { ...s, inventory: inv, villagerGiftCounts };
    });
    const def = ITEMS[itemId];
    const loved = villager.gift.lovedGiftIds.includes(itemId);
    play(loved ? def.sfx : "shell");
    toast(
      loved
        ? `${villager.name} adores the ${def.name}! ${villager.gift.reactionVisual} ✨`
        : `${villager.name} accepts the ${def.name} politely.`
    );
    return true;
  };

  const markNotebookSeen = () => {
    setState((s) => {
      const villagerMet = Object.values(s.villagerGiftCounts).filter((c) => c > 0).length;
      const total = Object.keys(s.notebookDiscovered).length + villagerMet + s.lookoutSightings.length + s.tidePoolDiscoveries.length;
      return { ...s, notebookSeenCount: total };
    });
  };

  const saveSandcastle = (castle: Omit<SavedSandcastle, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      sandcastleGallery: [
        ...s.sandcastleGallery,
        {
          ...castle,
          id: `${Date.now()}-${Math.random()}`,
          createdAt: Date.now(),
        },
      ].slice(-12),
    }));
  };

  const addLookoutSighting = (id: string) => {
    setState((s) => s.lookoutSightings.includes(id)
      ? s
      : { ...s, lookoutSightings: [...s.lookoutSightings, id] }
    );
  };

  const addTidePoolDiscovery = (id: string) => {
    setState((s) => s.tidePoolDiscoveries.includes(id)
      ? s
      : { ...s, tidePoolDiscoveries: [...s.tidePoolDiscoveries, id] }
    );
  };

  const completeTidePoolSearch = () => {
    setState((s) => ({
      ...s,
      tidePoolSearchesCompleted: s.tidePoolSearchesCompleted + 1,
      inventory: {
        ...s.inventory,
        "tide-pool-keepsake": (s.inventory["tide-pool-keepsake"] || 0) + 1,
      },
    }));
    play("questComplete");
    toast("Tide-pool field notes complete! 🌊");
  };

  const recoverMaevesKettle = () => {
    if (stateRef.current.kettleRecovered || stateRef.current.questProgress.keeperkettle) return false;
    setState((s) => ({
      ...s,
      kettleRecovered: true,
      inventory: {
        ...s.inventory,
        "antique-copper-kettle": (s.inventory["antique-copper-kettle"] || 0) + 1,
      },
    }));
    play("questComplete");
    toast("Maeve's copper kettle recovered! 🫖");
    return true;
  };

  const checkWeather = () => {
    const forecasts: WeatherForecast[] = [
      {
        id: "calm",
        icon: "☀️",
        title: "Calm water and high cloud",
        message: "The bay will stay gentle through evening. Good wandering weather, if you keep one eye on the tide.",
        effect: "A peaceful day for exploring every shoreline.",
      },
      {
        id: "low-tide",
        icon: "🪸",
        title: "An unusually low tide",
        message: "The moon is pulling the water far from the rocks. The cove and sandbars may reveal uncommon finds.",
        effect: "A good time to search the cove and sandbars.",
      },
      {
        id: "fog",
        icon: "🌫️",
        title: "Fog before evening",
        message: "A silver bank is gathering beyond the reef. Trust your ears and the lighthouse bell after sunset.",
        effect: "Listen carefully near the reef and lighthouse.",
      },
      {
        id: "wind",
        icon: "💨",
        title: "Northeast wind",
        message: "Marshmallow's ears are turned inland. Driftwood and bottles will ride the tide toward shore.",
        effect: "The wind may carry interesting salvage to the beach.",
      },
      {
        id: "ship",
        icon: "⛵",
        title: "A ship on the afternoon tide",
        message: "Maeve has the vessel's name in her ledger. Its sails should appear beyond the point before supper.",
        effect: "Watch the horizon for visiting traders.",
      },
      {
        id: "storm",
        icon: "⛈️",
        title: "A quick coastal squall",
        message: "Tie down anything light. It will blow hard, pass quickly, and leave work along the strand.",
        effect: "Storm Cleanup is now available.",
      },
    ];
    // Storms are possible, but deliberately uncommon: one storm entry in a
    // weighted set of eight outcomes.
    const weighted = [...forecasts.slice(0, 5), forecasts[0], forecasts[1], forecasts[5]];
    const forecast = weighted[Math.floor(Math.random() * weighted.length)];
    setState((s) => ({
      ...s,
      currentForecast: forecast,
      stormCleanupAvailable: forecast.id === "storm" ? true : s.stormCleanupAvailable,
    }));
    play(forecast.id === "storm" ? "plastic" : "shell");
    return forecast;
  };

  const completeStormCleanup = () => {
    if (!stateRef.current.stormCleanupAvailable) return false;
    setState((s) => ({
      ...s,
      stormCleanupAvailable: false,
      stormCleanupCompletions: s.stormCleanupCompletions + 1,
      inventory: {
        ...s.inventory,
        "raw-driftwood-planks": (s.inventory["raw-driftwood-planks"] || 0) + 1,
        "glass-blue": (s.inventory["glass-blue"] || 0) + 1,
        "shiny-soda-tab": (s.inventory["shiny-soda-tab"] || 0) + 2,
      },
    }));
    play("questComplete");
    toast("The shoreline is safe and tidy again! ✨");
    return true;
  };

  const buyFromSeaweed = (itemId: string, discoveryDate?: string) => {
    const regular = SHOP_STOCK.find((item) => item.itemId === itemId);
    const discovery = SEAWEED_DISCOVERIES.find((item) => item.itemId === itemId);
    const listing = regular || discovery;
    if (!listing || !ITEMS[itemId]) return false;
    if (discoveryDate && stateRef.current.seaweedDiscoveryPurchases.includes(discoveryDate)) return false;
    if (stateRef.current.sandDollars < listing.price) return false;

    setState((s) => ({
      ...s,
      sandDollars: s.sandDollars - listing.price,
      inventory: { ...s.inventory, [itemId]: (s.inventory[itemId] || 0) + 1 },
      seaweedDiscoveryPurchases: discoveryDate
        ? [...s.seaweedDiscoveryPurchases, discoveryDate]
        : s.seaweedDiscoveryPurchases,
    }));
    play("sandDollarCoin");
    toast(`Purchased ${ITEMS[itemId].name}!`);
    return true;
  };

  const sellToSeaweed = (itemId: string) => {
    const price = SELL_PRICES[itemId];
    if (!price || (stateRef.current.inventory[itemId] || 0) < 1) return false;

    setState((s) => ({
      ...s,
      sandDollars: s.sandDollars + price,
      inventory: { ...s.inventory, [itemId]: (s.inventory[itemId] || 0) - 1 },
    }));
    play("sandDollarCoin");
    toast(`Seaweed paid ${price} Sand Dollar${price === 1 ? "" : "s"}.`);
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
      cook,
      claimQuest,
      openChest,
      cutNet,
      restoreShip,
      hasEnough,
      play,
      playBottleSequence,
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
      giftVillager,
      musicOverride,
      setMusicOverride,
      notebookOpen,
      setNotebookOpen,
      markNotebookSeen,
      saveSandcastle,
      addLookoutSighting,
      addTidePoolDiscovery,
      completeTidePoolSearch,
      recoverMaevesKettle,
      checkWeather,
      completeStormCleanup,
      buyFromSeaweed,
      sellToSeaweed,
    }),
    [state, screen, zone, lastToast, musicOverride, notebookOpen]
  );

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
