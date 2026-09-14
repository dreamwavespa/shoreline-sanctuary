"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ITEMS } from "./items";
import { SFX_FILES } from "./media";
import { QuestDef } from "./quests";
import { VILLAGERS } from "./villagers";
import { getShopDateKey, SEAWEED_DISCOVERIES, SELL_PRICES, SHOP_STOCK } from "./shop";
import { FOUND_BOTTLE_BONUSES, FOUND_BOTTLE_MESSAGES } from "./bottleFinds";
import { calculateJewelryValue, defaultJewelryName, JEWELRY_KIND_DETAILS, JEWELRY_MATERIAL_IDS, JewelryKind } from "./jewelry";
import { BOO_SAND_IDS, calculateSandBottleValue, CUSTOM_SAND_ACCENT_IDS, CUSTOM_SAND_IDS, defaultSandBottleName, isBooOctober, localDateKey } from "./customSandArt";
import { getScheduleStatus } from "./schedule";
import { getTravelingMerchantStock } from "./travelingMerchants";
import { getOlliInkReward, OLLI_ART_BACKGROUNDS, OLLI_ART_PATTERNS, OLLI_ART_STAMPS, OLLI_INK_IDS, OlliHidingLocation } from "./olli";
import { NOTEBOOK_SECTIONS } from "./notebook";
import { BASIC_SHELL_PATTERNS, defaultPaintedShellName, NOTEBOOK_SHELL_PATTERNS, PAINTABLE_SHELL_IDS, SHELL_PAINT_COLORS, SUNNY_QUEST_PATTERN } from "./shellPainting";

export type Screen = "beach" | "bucket" | "workshop" | "bottles" | "cove" | "lighthouse" | "reef" | "ship" | "sandbars" | "cottage" | "shop" | "grove";
export type Zone = "beach" | "lighthouse" | "underwater";

export interface WeatherForecast {
  id: "calm" | "low-tide" | "fog" | "wind" | "ship" | "storm" | "snow" | "cold";
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
export const MARSHMALLOW_TREAT_COOLDOWN_MS = 30 * 60 * 1000;
export const BEE_VISIT_COOLDOWN_MS = 30 * 60 * 1000;

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

export interface CustomJewelryPiece {
  id: string;
  kind: JewelryKind;
  name: string;
  materials: string[];
  value: number;
  favorite: boolean;
  createdAt: number;
}

export interface CustomSandBottle {
  id: string;
  name: string;
  layers: string[];
  accentId: string | null;
  value: number;
  favorite: boolean;
  createdAt: number;
}

export interface OlliInkPicture {
  id: string;
  name: string;
  inkId: string;
  background: string;
  stamp: string;
  pattern: string;
  createdAt: number;
}

export interface PaintedShell {
  id: string;
  name: string;
  shellId: string;
  color: string;
  pattern: string;
  createdAt: number;
}

interface GameState {
  inventory: Record<string, number>;
  blueprints: string[];
  bucketCount: number;
  bucketsFilled: number;
  crafted: string[];
  questProgress: Record<string, boolean>;
  workshopUnlocked: boolean;
  totalCollected: number;
  audio: AudioSettings;
  rowboatRepaired: boolean;
  chestOpened: boolean;
  chestDailyClaimDate: string;
  chestDailyRewardItemId: string | null;
  hasDivingGear: boolean;
  netProgress: number;
  ghostNetCut: boolean;
  shipRestored: boolean;
  gameCompleted: boolean;
  ellyLastTap: number;
  snappyAwake: boolean;
  snappyFedCount: number;
  snappyChokerGifted: boolean;
  trapProgress: number;
  libbyRescued: boolean;
  marshmallowScratchCount: number;
  marshmallowGifted: boolean;
  marshmallowLastGiftAt: number;
  saltyStreak: number;
  saltyTotalCatches: number;
  foundConstellations: string[];
  picnicBasketPlaced: boolean;
  umbrellaPlaced: boolean;
  hasBeachBag: boolean;
  seagullTraded: boolean;
  seagullTradeCount: number;
  seagullDismissedDate: string;
  raftInflated: boolean;
  raftAirLevel: number;
  sandbarsUnlocked: boolean;
  villagerGiftCounts: Record<string, number>;
  notebookDiscovered: Record<string, boolean>;
  notebookSeenCount: number;
  notebookRewardsClaimed: string[];
  sandcastleGallery: SavedSandcastle[];
  lookoutSightings: string[];
  kettleRecovered: boolean;
  weatherStationUnlocked: boolean;
  currentForecast: WeatherForecast | null;
  stormCleanupAvailable: boolean;
  stormCleanupCompletions: number;
  rainBarrelLevel: number;
  groveNurseryAvailable: boolean;
  groveNurseryCompletions: number;
  groveNurserySeedMisses: number;
  tidePoolDiscoveries: string[];
  tidePoolSearchesCompleted: number;
  motherOfPearlMisses: number;
  penelopeRewardsClaimed: number;
  sandyStormHuntsCompleted: number;
  paintedShells: PaintedShell[];
  kaiBuriedTrades: number;
  mistyTradeDate: string;
  mistyTrades: number;
  mistyFriendshipRewardClaimed: boolean;
  sandDollars: number;
  seaweedDiscoveryPurchases: string[];
  foundBottleMessages: string[];
  customJewelry: CustomJewelryPiece[];
  customSandBottles: CustomSandBottle[];
  booSandClaimDate: string;
  booToolSetDelivered: boolean;
  honeybellStage: number;
  beeWaxClaimDate: string;
  beeLastVisitAt: number;
  beeHoneyMisses: number;
  beeVisits: number;
  coralCultivations: number;
  minaBakes: number;
  bubblesDeliveryDate: string;
  pearlRewardsClaimed: number;
  splashTrades: number;
  olliHidingLocation: OlliHidingLocation | null;
  olliHuntCheckDate: string;
  olliHuntMisses: number;
  olliHuntsCompleted: number;
  olliNotificationPending: boolean;
  olliClueStage: number;
  olliInkPictures: OlliInkPicture[];
  olliRingBestScore: number;
  olliRingRewardDate: string;
}

const BUCKET_CAPACITY = 20;

const DEFAULT_STATE: GameState = {
  inventory: {},
  blueprints: [],
  bucketCount: 0,
  bucketsFilled: 0,
  crafted: [],
  questProgress: {},
  workshopUnlocked: false,
  totalCollected: 0,
  audio: { master: 0.9, music: 0.8, ambience: 0.7, musicMuted: false },
  rowboatRepaired: false,
  chestOpened: false,
  chestDailyClaimDate: "",
  chestDailyRewardItemId: null,
  hasDivingGear: false,
  netProgress: 0,
  ghostNetCut: false,
  shipRestored: false,
  gameCompleted: false,
  ellyLastTap: 0,
  snappyAwake: false,
  snappyFedCount: 0,
  snappyChokerGifted: false,
  trapProgress: 0,
  libbyRescued: false,
  marshmallowScratchCount: 0,
  marshmallowGifted: false,
  marshmallowLastGiftAt: 0,
  saltyStreak: 0,
  saltyTotalCatches: 0,
  foundConstellations: [],
  picnicBasketPlaced: false,
  umbrellaPlaced: false,
  hasBeachBag: false,
  seagullTraded: false,
  seagullTradeCount: 0,
  seagullDismissedDate: "",
  raftInflated: false,
  raftAirLevel: 0,
  sandbarsUnlocked: false,
  villagerGiftCounts: {},
  notebookDiscovered: {},
  notebookSeenCount: 0,
  notebookRewardsClaimed: [],
  sandcastleGallery: [],
  lookoutSightings: [],
  kettleRecovered: false,
  weatherStationUnlocked: false,
  currentForecast: null,
  stormCleanupAvailable: false,
  stormCleanupCompletions: 0,
  rainBarrelLevel: 0,
  groveNurseryAvailable: false,
  groveNurseryCompletions: 0,
  groveNurserySeedMisses: 0,
  tidePoolDiscoveries: [],
  tidePoolSearchesCompleted: 0,
  motherOfPearlMisses: 0,
  penelopeRewardsClaimed: 0,
  sandyStormHuntsCompleted: 0,
  paintedShells: [],
  kaiBuriedTrades: 0,
  mistyTradeDate: "",
  mistyTrades: 0,
  mistyFriendshipRewardClaimed: false,
  sandDollars: 8,
  seaweedDiscoveryPurchases: [],
  foundBottleMessages: [],
  customJewelry: [],
  customSandBottles: [],
  booSandClaimDate: "",
  booToolSetDelivered: false,
  honeybellStage: 0,
  beeWaxClaimDate: "",
  beeLastVisitAt: 0,
  beeHoneyMisses: 0,
  beeVisits: 0,
  coralCultivations: 0,
  minaBakes: 0,
  bubblesDeliveryDate: "",
  pearlRewardsClaimed: 0,
  splashTrades: 0,
  olliHidingLocation: null,
  olliHuntCheckDate: "",
  olliHuntMisses: 2,
  olliHuntsCompleted: 0,
  olliNotificationPending: false,
  olliClueStage: 0,
  olliInkPictures: [],
  olliRingBestScore: 0,
  olliRingRewardDate: "",
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
  grove: "beach",
};

const SEAGULL_LOOT_TABLE = ["sealed-frosted-bottle", "shiny-soda-tab", "glass-purple"];
const DAILY_CHEST_TREASURES = [
  "trophy-map",
  "salvage-spyglass",
  "magnifying-glass",
  "moonstone-moon",
  "carnelian-heart",
  "blueprint-beach-hut",
  "blueprint-library",
  "map-underwater-crystal-cave",
  "pearl-rainbow",
  "pearl-gold",
  "pearl-glow-dark",
  "glass-aquamarine-glow",
  "gold-world-globe",
  "bag-old-coins",
];

const BUBBLES_BONUSES = ["ribbon", "glass-teal", "shiny-soda-tab", "sea-berry"];
const PEARL_FRIENDSHIP_REWARDS = ["pearl-white", "pearl-pink", "mother-of-pearl", "pearl-silver", "pearl-rainbow"];
const PENELOPE_CLEANUP_REWARDS = [
  { itemId: "coconut", count: 2 },
  { itemId: "wild-beach-plum", count: 2 },
  { itemId: "blueberry", count: 3 },
  { itemId: "raspberry", count: 3 },
];
const SANDY_STORM_REWARDS = [
  { itemId: "soothing-sea-salt", count: 2 },
  { itemId: "wild-beach-plum", count: 1 },
  { itemId: "pearl-silver", count: 1 },
];
const KAI_TRADEABLE_SHELL_IDS = ["shell-scallop", "shell-whelk", "shell-cowrie", "shell-clam", "shell-conch", "shell-abalone", "shell-nautilus", "shell-murex", "iridescent-shell"];
const KAI_BURIED_REWARDS = ["moss-agate", "glass-rainbow", "glass-purple", "iridescent-shell", "shell-opal-rare"];
const MISTY_EXCHANGE_REWARDS = ["luminous-sea-goo", "glass-aquamarine-glow", "pearl-glow-dark", "moonstone-moon", "star-sand"];
const SPLASH_TRADE_REWARDS = ["hemp-thread", "copper-wire", "driftwood-oar"];
const SPLASH_STORIES = [
  "Splash once followed a silver school of fish that glittered like a second moon beneath the water.",
  "A tiny fishing boat rang its bell every evening, and the seals learned to clap along with it.",
  "Splash swears the oldest reef fish knows every hidden current between the Sandbars and the lighthouse.",
  "During one calm sunrise, the sea was so still that Splash mistook the clouds below him for another ocean.",
];

interface Ctx {
  state: GameState;
  screen: Screen;
  zone: Zone;
  setScreen: (s: Screen) => void;
  collectItem: (itemId: string, opts?: { silent?: boolean }) => void;
  emptyBucket: () => void;
  craft: (recipeId: string, cost: { itemId: string; count: number }[]) => boolean;
  cook: (cost: { itemId: string; count: number }[], outputItemId: string, outputCount?: number) => boolean;
  bottleRoseMilk: () => boolean;
  claimQuest: (quest: QuestDef) => boolean;
  openChest: (cost: { itemId: string; count: number }[]) => boolean;
  searchChest: () => string | null;
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
  giftSnappyChoker: () => boolean;
  pryTrap: () => void;
  tradeWithLibby: (give: { itemId: string; count: number }, get: { itemId: string; count: number }) => boolean;
  scratchMarshmallow: () => void;
  giftMarshmallow: () => boolean;
  throwBallToSalty: () => { thrown: boolean; caught?: boolean };
  addFoundConstellation: (id: string) => void;
  digBeachBag: () => boolean;
  tradeWithSeagull: () => { ok: boolean; snappyDefended?: boolean; rewardItemId?: string };
  shooSeagull: () => void;
  feedKelpToBirds: () => boolean;
  splashBirds: () => void;
  ignoreBirds: () => number;
  reinflateRaft: (useAirPump?: boolean) => number;
  checkRaftAirLevel: () => number;
  giftVillager: (villagerId: string, itemId: string) => boolean;
  musicOverride: string | null;
  setMusicOverride: (key: string | null) => void;
  notebookOpen: boolean;
  setNotebookOpen: (v: boolean) => void;
  markNotebookSeen: () => void;
  claimNotebookReward: (sectionId: string) => string | null;
  saveSandcastle: (castle: Omit<SavedSandcastle, "id" | "createdAt">) => void;
  addLookoutSighting: (id: string) => void;
  addTidePoolDiscovery: (id: string) => void;
  completeTidePoolSearch: () => void;
  collectTidePoolShellHollow: () => boolean;
  claimPenelopeCleanupReward: () => { itemId: string; count: number } | null;
  completeSandyStormHunt: () => { itemId: string; count: number } | null;
  createPaintedShell: (shellId: string, color: string, pattern: string, name?: string) => PaintedShell | null;
  tradeWithKai: (shellId: string) => string | null;
  tradeWithMisty: (itemId: string) => string | null;
  claimMistyFriendshipReward: () => string | null;
  recoverMaevesKettle: () => boolean;
  checkWeather: () => WeatherForecast;
  completeStormCleanup: () => boolean;
  collectRainBarrelWater: () => boolean;
  completeGroveNursery: () => { ok: boolean; foundSeed: boolean };
  advanceHoneybell: () => { ok: boolean; stage: number };
  visitGroveBees: () => { ok: boolean; wax: boolean; honey: boolean; minutesLeft?: number };
  buyFromSeaweed: (itemId: string, discoveryDate?: string) => boolean;
  buyFromTraveler: (villagerId: "shelldon" | "shelby", itemId: string) => boolean;
  cultivateWithCoral: () => string | null;
  bakeWithMina: () => boolean;
  claimBubblesDelivery: () => { bottleItemId: string; bonusItemId: string } | null;
  claimPearlsFriendshipGift: () => string | null;
  tradeWithSplash: () => { rewardItemId: string; story: string } | null;
  dismissOlliNotification: () => void;
  requestOlliClue: () => void;
  findOlli: (location: OlliHidingLocation) => string | null;
  createOlliInkPicture: (inkId: string, background: string, stamp: string, pattern: string, name?: string) => OlliInkPicture | null;
  completeOlliRingToss: (score: number) => { rewarded: boolean; bestScore: number };
  sellToSeaweed: (itemId: string) => boolean;
  collectSeaWater: () => void;
  inspectFoundBottle: () => { messageId: string; bonusItemId: string | null } | null;
  createCustomJewelry: (kind: JewelryKind, materials: string[], name?: string) => { ok: boolean; piece?: CustomJewelryPiece };
  toggleCustomJewelryFavorite: (pieceId: string) => void;
  sellCustomJewelry: (pieceId: string) => boolean;
  claimBooSand: (itemId: string) => boolean;
  deliverBooToolSet: () => boolean;
  createCustomSandBottle: (layers: string[], accentId?: string | null, name?: string) => { ok: boolean; bottle?: CustomSandBottle };
  toggleCustomSandBottleFavorite: (bottleId: string) => void;
  sellCustomSandBottle: (bottleId: string) => boolean;
}

const GameCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "shoreline-save";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
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
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const inventory = { ...(parsed.inventory || {}) };
        const blueprints = Array.isArray(parsed.blueprints) ? [...parsed.blueprints] : [];
        // Blueprint plans now have their own protected collection instead of
        // appearing among consumable bucket items.
        for (const [itemId, count] of Object.entries(inventory)) {
          if (itemId.startsWith("blueprint-") && Number(count) > 0) {
            if (!blueprints.includes(itemId)) blueprints.push(itemId);
            delete inventory[itemId];
          }
        }
        const crafted = Array.isArray(parsed.crafted) ? parsed.crafted : [];
        // Earlier versions marked the Tidal Pearl Choker as crafted without
        // creating an inventory item. Restore it once so existing players can
        // give Snappy the gift without spending rare materials again.
        if (crafted.includes("tidal-pearl-choker") && !parsed.snappyChokerGifted && (inventory["tidal-pearl-choker"] || 0) < 1) {
          inventory["tidal-pearl-choker"] = 1;
        }
        // Restore the missing physical reward for players who completed the
        // earlier version of Oliver's picnic quest.
        if (parsed.questProgress?.oliverpicnic && (inventory["vintage-beach-blanket"] || 0) < 1) {
          inventory["vintage-beach-blanket"] = 1;
        }
        // Sand Dollars used to exist twice: as a collected shell in the
        // bucket and as separate shop currency. Migrate every loose Sand
        // Dollar into the shared wallet, then remove the duplicate stack.
        const collectedSandDollars = Math.max(0, Number(inventory["shell-sanddollar"]) || 0);
        delete inventory["shell-sanddollar"];
        const sandDollars = Math.max(0, Number(parsed.sandDollars ?? DEFAULT_STATE.sandDollars) || 0) + collectedSandDollars;
        const legacyUnclaimedRain = Math.max(0, (Number(parsed.stormCleanupCompletions) || 0) - (Number(parsed.rainGaugeVialsClaimed) || 0));
        const rainBarrelLevel = Math.min(3, Math.max(0, Number(parsed.rainBarrelLevel ?? legacyUnclaimedRain) || 0));
        setState({
          ...DEFAULT_STATE,
          ...parsed,
          inventory,
          blueprints,
          sandDollars,
          raftAirLevel: parsed.raftAirLevel ?? (parsed.raftInflated ? 3 : 0),
          rainBarrelLevel,
          groveNurseryAvailable: parsed.groveNurseryAvailable ?? parsed.currentForecast?.id === "storm",
          booToolSetDelivered: parsed.booToolSetDelivered ?? (Array.isArray(parsed.customSandBottles) && parsed.customSandBottles.length > 0),
          notebookDiscovered: collectedSandDollars > 0
            ? { ...(parsed.notebookDiscovered || {}), "shell-sanddollar": true }
            : { ...(parsed.notebookDiscovered || {}) },
          audio: { ...DEFAULT_STATE.audio, ...(parsed.audio || {}) },
        });
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [hydrated, state]);

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

  // Check once per local day. Hunts are occasional, but two quiet days
  // guarantee that Olli hides on the third. An active hunt waits indefinitely
  // until the player finds him.
  useEffect(() => {
    if (!hydrated) return;
    const current = stateRef.current;
    const today = localDateKey();
    if (current.olliHidingLocation || current.olliHuntCheckDate === today) return;

    const startsToday = current.olliHuntMisses >= 2 || Math.random() < 0.35;
    if (!startsToday) {
      setState((s) => ({ ...s, olliHuntCheckDate: today, olliHuntMisses: s.olliHuntMisses + 1 }));
      return;
    }

    const available: OlliHidingLocation[] = ["beach", "cottage", "grove"];
    if (current.workshopUnlocked) available.push("workshop");
    if (current.rowboatRepaired) available.push("cove");
    if (current.hasDivingGear) available.push("reef");
    if (current.sandbarsUnlocked) available.push("sandbars");
    if (current.gameCompleted) available.push("ship");
    const location = available[Math.floor(Math.random() * available.length)];
    setState((s) => ({
      ...s,
      olliHidingLocation: location,
      olliHuntCheckDate: today,
      olliHuntMisses: 0,
      olliNotificationPending: true,
      olliClueStage: 0,
    }));
    play("oceanWaterSplash", 0.55);
    window.setTimeout(() => play("sparkle", 0.45), 300);
  }, [hydrated, state.olliHidingLocation, state.olliHuntCheckDate]);

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
      const isSandDollar = itemId === "shell-sanddollar";
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
        inventory: isSandDollar ? s.inventory : { ...s.inventory, [itemId]: nextCount },
        sandDollars: isSandDollar ? s.sandDollars + 1 : s.sandDollars,
        notebookDiscovered: isSandDollar
          ? { ...s.notebookDiscovered, "shell-sanddollar": true }
          : s.notebookDiscovered,
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
    return requires.every((r) =>
      r.itemId === "shell-sanddollar"
        ? stateRef.current.sandDollars >= r.count
        : (stateRef.current.inventory[r.itemId] || 0) >= r.count
    );
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
      const next: GameState = {
        ...s,
        inventory: inv,
        crafted: s.crafted.includes(recipeId) ? s.crafted : [...s.crafted, recipeId],
      };
      if (recipeId === "rowboat-repair") next.rowboatRepaired = true;
      if (recipeId === "beach-umbrella") next.umbrellaPlaced = true;
      if (recipeId === "picnic-basket") next.picnicBasketPlaced = true;
      if (recipeId === "beach-bag") next.hasBeachBag = true;
      if (recipeId === "inflatable-raft") {
        next.raftInflated = true;
        next.raftAirLevel = 3;
        next.sandbarsUnlocked = true;
      }
      return next;
    });
    const craftedItem = ITEMS[recipeId];
    play(craftedItem?.sfx || "craftSuccess");
    toast(craftedItem ? `Crafted ${craftedItem.name}!` : "Crafted!");
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

  const bottleRoseMilk = () => {
    if ((stateRef.current.inventory["food-sea-rose-milk"] || 0) < 1) return false;
    setState((s) => {
      if ((s.inventory["food-sea-rose-milk"] || 0) < 1) return s;
      const inventory = { ...s.inventory };
      inventory["food-sea-rose-milk"] = Math.max(0, (inventory["food-sea-rose-milk"] || 0) - 1);
      inventory["bottled-rose-milk"] = (inventory["bottled-rose-milk"] || 0) + 1;
      return { ...s, inventory };
    });
    play("roseMilkPour", 0.8);
    window.setTimeout(() => play("roseMilkBottle", 0.85), 1250);
    toast("Rose Milk bottled for Seaweed!");
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
      if (quest.id === "sunnyshellpalette") inv["paint-pigment"] = (inv["paint-pigment"] || 0) + 1;
      if (quest.id === "oliverpicnic") inv["glass-teal"] = (inv["glass-teal"] || 0) + 5;
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
        groveNurseryAvailable: keeperKettleComplete ? true : s.groveNurseryAvailable,
      };
    });
    play(quest.id === "sunnyshellpalette" ? "paintPigment" : "questComplete");
    toast("Quest complete!");
    return true;
  };

  const openChest = (cost: { itemId: string; count: number }[]) => {
    if (state.chestOpened) return false;
    if (!hasEnough(cost)) return false;
    setState((s) => {
      const sandDollarCost = cost.find((item) => item.itemId === "shell-sanddollar")?.count || 0;
      const inventoryCost = cost.filter((item) => item.itemId !== "shell-sanddollar");
      const inv = deductCost({ ...s.inventory }, inventoryCost);
      inv["trophy-map"] = (inv["trophy-map"] || 0) + 1;
      inv["trophy-compass"] = (inv["trophy-compass"] || 0) + 1;
      inv["trophy-diving-gear"] = (inv["trophy-diving-gear"] || 0) + 1;
      return { ...s, inventory: inv, sandDollars: s.sandDollars - sandDollarCost, chestOpened: true, hasDivingGear: true };
    });
    play("chestOpen", 0.95);
    window.setTimeout(() => play("questComplete", 0.7), 900);
    toast("Chest opened!");
    return true;
  };

  const searchChest = () => {
    const today = getShopDateKey();
    if (!stateRef.current.chestOpened || stateRef.current.chestDailyClaimDate === today) return null;
    const undiscoveredTreasures = DAILY_CHEST_TREASURES.filter(
      (treasureId) => !stateRef.current.notebookDiscovered[treasureId]
    );
    const treasurePool = undiscoveredTreasures.length ? undiscoveredTreasures : DAILY_CHEST_TREASURES;
    const itemId = treasurePool[Math.floor(Math.random() * treasurePool.length)];
    setState((s) => ({
      ...s,
      inventory: { ...s.inventory, [itemId]: (s.inventory[itemId] || 0) + 1 },
      chestDailyClaimDate: today,
      chestDailyRewardItemId: itemId,
    }));
    play("chestOpen", 0.95);
    window.setTimeout(() => play(ITEMS[itemId].sfx, 0.7), 900);
    toast(`Daily chest treasure: ${ITEMS[itemId].name}!`);
    return itemId;
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

  const giftSnappyChoker = () => {
    if (stateRef.current.snappyChokerGifted || (stateRef.current.inventory["tidal-pearl-choker"] || 0) < 1) return false;
    setState((s) => {
      const inventory = { ...s.inventory };
      inventory["tidal-pearl-choker"] = Math.max(0, (inventory["tidal-pearl-choker"] || 0) - 1);
      return { ...s, inventory, snappyChokerGifted: true };
    });
    play("pearl", 0.85);
    window.setTimeout(() => play("sparkle", 0.65), 450);
    toast("Snappy wears the Tidal Pearl Choker, and his shell begins to sparkle!");
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
    const now = Date.now();
    if (now - stateRef.current.marshmallowLastGiftAt < MARSHMALLOW_TREAT_COOLDOWN_MS) return false;
    if (!hasEnough(cost)) return false;
    setState((s) => {
      const inv = deductCost({ ...s.inventory }, cost);
      return { ...s, inventory: inv, marshmallowGifted: true, marshmallowLastGiftAt: now };
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
    if (!stateRef.current.picnicBasketPlaced || stateRef.current.seagullDismissedDate === localDateKey()) return { ok: false };
    const cost = [{ itemId: "coconut-cream", count: 1 }];
    if (!hasEnough(cost)) return { ok: false };
    const snappyDefended = stateRef.current.snappyAwake && Math.random() < 0.35;
    play("seagullSwoop");
    if (snappyDefended) {
      setState((s) => {
        const inv = { ...s.inventory };
        inv["glass-teal"] = (inv["glass-teal"] || 0) + 1;
        return { ...s, inventory: inv, seagullTraded: true, seagullTradeCount: s.seagullTradeCount + 1 };
      });
      toast("Snappy startles the seagull — it drops a Polished Teal Sea Glass and flees! 🐢");
      return { ok: true, snappyDefended: true, rewardItemId: "glass-teal" };
    }
    const rewardItemId = SEAGULL_LOOT_TABLE[Math.floor(Math.random() * SEAGULL_LOOT_TABLE.length)];
    setState((s) => {
      const inv = deductCost({ ...s.inventory }, cost);
      inv[rewardItemId] = (inv[rewardItemId] || 0) + 1;
      return { ...s, inventory: inv, seagullTraded: true, seagullTradeCount: s.seagullTradeCount + 1 };
    });
    toast(`The seagull trades you ${ITEMS[rewardItemId].name}! 🕊️`);
    return { ok: true, snappyDefended: false, rewardItemId };
  };

  const shooSeagull = () => {
    setState((s) => ({ ...s, seagullDismissedDate: localDateKey() }));
    play("plastic");
    toast('Cheeky Seagull: "HRAAAK!" — it flies off until tomorrow.');
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
    const nextLevel = Math.max(0, stateRef.current.raftAirLevel - 1);
    setState((s) => ({ ...s, raftAirLevel: nextLevel, raftInflated: nextLevel > 0 }));
    play("plastic");
    toast(nextLevel === 0 ? "A gull tugs the valve—the raft is fully deflated." : `A gull bounces away. Raft air is now ${nextLevel} of 3.`);
    return nextLevel;
  };

  const reinflateRaft = (useAirPump = false) => {
    const hasPump = (stateRef.current.inventory["seaside-air-pump"] || 0) > 0;
    const nextLevel = useAirPump && hasPump ? 3 : Math.min(3, stateRef.current.raftAirLevel + 1);
    setState((s) => ({ ...s, raftAirLevel: nextLevel, raftInflated: nextLevel > 0 }));
    play("airPump", useAirPump && hasPump ? 0.9 : 0.65);
    toast(nextLevel === 3 ? "The raft is fully inflated: 3 of 3." : `Raft air increased to ${nextLevel} of 3.`);
    return nextLevel;
  };

  const checkRaftAirLevel = () => {
    const level = stateRef.current.raftAirLevel;
    toast(`Raft air level: ${level} of 3.`);
    return level;
  };

  const giftVillager = (villagerId: string, itemId: string) => {
    const villager = VILLAGERS[villagerId];
    if (!villager) return false;
    if (!hasEnough([{ itemId, count: 1 }])) return false;
    const starWishReturned = villagerId === "angel" && itemId === "star-wish-bottle";
    setState((s) => {
      const inv = deductCost({ ...s.inventory }, [{ itemId, count: 1 }]);
      if (starWishReturned) inv["carnelian"] = (inv["carnelian"] || 0) + 1;
      const villagerGiftCounts = {
        ...s.villagerGiftCounts,
        [villagerId]: (s.villagerGiftCounts[villagerId] || 0) + 1,
      };
      return { ...s, inventory: inv, villagerGiftCounts };
    });
    const def = ITEMS[itemId];
    const loved = villager.gift.lovedGiftIds.includes(itemId);
    play(loved ? def.sfx : "shell");
    if (starWishReturned) window.setTimeout(() => play("pearl", 0.75), 600);
    toast(
      starWishReturned
        ? "Angel carries your Star Wish out to sea and returns with a glowing Deep-Sea Carnelian!"
        : loved
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

  const claimNotebookReward = (sectionId: string) => {
    const current = stateRef.current;
    const section = NOTEBOOK_SECTIONS.find((candidate) => candidate.id === sectionId);
    if (!section?.completionRewardItemId || current.notebookRewardsClaimed.includes(sectionId)) return null;
    const complete = section.entries.every((entry) => {
      if (entry.kind === "item") return Boolean(current.notebookDiscovered[entry.id]);
      if (entry.kind === "sighting") return current.lookoutSightings.includes(entry.id);
      if (entry.kind === "tidepool") return current.tidePoolDiscoveries.includes(entry.id);
      return (current.villagerGiftCounts[entry.id] || 0) > 0;
    });
    if (!complete) return null;
    const itemId = section.completionRewardItemId;
    setState((s) => ({
      ...s,
      notebookRewardsClaimed: [...s.notebookRewardsClaimed, sectionId],
      inventory: { ...s.inventory, [itemId]: (s.inventory[itemId] || 0) + 1 },
    }));
    play(ITEMS[itemId].sfx, 0.8);
    toast(`${ITEMS[itemId].name} added to your inventory!`);
    return itemId;
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

  const collectTidePoolShellHollow = () => {
    const bonus = stateRef.current.motherOfPearlMisses >= 3 || Math.random() < 0.25;
    setState((s) => ({
      ...s,
      motherOfPearlMisses: bonus ? 0 : s.motherOfPearlMisses + 1,
      inventory: {
        ...s.inventory,
        "iridescent-shell": (s.inventory["iridescent-shell"] || 0) + 1,
        ...(bonus ? { "mother-of-pearl": (s.inventory["mother-of-pearl"] || 0) + 1 } : {}),
      },
    }));
    if (bonus) window.setTimeout(() => play("pearl", 0.8), 250);
    return bonus;
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
    const month = new Date().getUTCMonth();
    const isWinter = month === 11 || month <= 1;
    const winterForecasts: WeatherForecast[] = isWinter
      ? [
          {
            id: "snow",
            icon: "❄️",
            title: "A soft coastal snowfall",
            message: "Small flakes are beginning to turn in the lighthouse beam. The paths should stay passable, but the stones may be slick.",
            effect: "Snowflakes are drifting across the weather station.",
          },
          {
            id: "cold",
            icon: "🧊",
            title: "A bright and bitter cold",
            message: "The sky is clear, but frost is silvering every rail. Maeve recommends mittens and something warm from the kitchen.",
            effect: "Frost sparkles along the lighthouse windows.",
          },
        ]
      : [];
    // Storms are possible, but deliberately uncommon: one storm entry in a
    // weighted set of eight outcomes.
    const weighted = [...forecasts.slice(0, 5), forecasts[0], forecasts[1], forecasts[5], ...winterForecasts];
    const forecast = weighted[Math.floor(Math.random() * weighted.length)];
    setState((s) => ({
      ...s,
      currentForecast: forecast,
      stormCleanupAvailable: forecast.id === "storm" ? true : s.stormCleanupAvailable,
      groveNurseryAvailable: forecast.id === "storm" ? true : s.groveNurseryAvailable,
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
      rainBarrelLevel: Math.min(3, s.rainBarrelLevel + 1),
      inventory: {
        ...s.inventory,
        "raw-driftwood-planks": (s.inventory["raw-driftwood-planks"] || 0) + 1,
        "glass-blue": (s.inventory["glass-blue"] || 0) + 1,
        "shiny-soda-tab": (s.inventory["shiny-soda-tab"] || 0) + 2,
        "rescue-balloon": (s.inventory["rescue-balloon"] || 0) + 1,
      },
    }));
    play("questComplete");
    toast("The shoreline is safe and tidy again! ✨");
    return true;
  };

  const collectRainBarrelWater = () => {
    if (stateRef.current.rainBarrelLevel < 3) return false;
    setState((s) => ({
      ...s,
      rainBarrelLevel: 0,
      inventory: {
        ...s.inventory,
        "pure-water": (s.inventory["pure-water"] || 0) + 3,
      },
    }));
    play("liquidBottle");
    toast("Collected 3 Pure Water Vials from Maeve's rain barrel!");
    return true;
  };

  const completeGroveNursery = () => {
    if (!stateRef.current.groveNurseryAvailable) return { ok: false, foundSeed: false };

    const foundSeed = stateRef.current.groveNurserySeedMisses >= 2 || Math.random() < 0.35;
    setState((s) => ({
      ...s,
      groveNurseryAvailable: false,
      groveNurseryCompletions: s.groveNurseryCompletions + 1,
      groveNurserySeedMisses: foundSeed ? 0 : s.groveNurserySeedMisses + 1,
      inventory: {
        ...s.inventory,
        "rare-soil": (s.inventory["rare-soil"] || 0) + 1,
        ...(foundSeed ? { "deep-sea-seed": (s.inventory["deep-sea-seed"] || 0) + 1 } : {}),
      },
    }));
    play(foundSeed ? "sparkle" : "questComplete");
    toast(foundSeed ? "Rare Enriched Soil and a Deep-Sea Seed found!" : "Rare Enriched Soil prepared!");
    return { ok: true, foundSeed };
  };

  const advanceHoneybell = () => {
    const current = stateRef.current;
    const clueFound = current.foundBottleMessages.includes("sea-rose-bees");
    if (!clueFound || current.honeybellStage >= 3) return { ok: false, stage: current.honeybellStage };
    if (current.honeybellStage === 1 && (current.inventory["honeybell-seed"] || 0) < 1) {
      return { ok: false, stage: current.honeybellStage };
    }

    const nextStage = current.honeybellStage + 1;
    setState((s) => {
      const inventory = { ...s.inventory };
      if (s.honeybellStage === 0) inventory["honeybell-seed"] = (inventory["honeybell-seed"] || 0) + 1;
      if (s.honeybellStage === 1) inventory["honeybell-seed"] = Math.max(0, (inventory["honeybell-seed"] || 0) - 1);
      return { ...s, inventory, honeybellStage: Math.min(3, s.honeybellStage + 1) };
    });

    if (nextStage === 1) {
      play("groveItemPickup");
      toast("Golden Honeybell Seed found!");
    } else if (nextStage === 2) {
      play("groveRootPull");
      toast("Golden Honeybell planted beside the sea roses.");
    } else {
      play("beeLanding", 0.75);
      toast("The Honeybell blooms, and the coastal bees return!");
    }
    return { ok: true, stage: nextStage };
  };

  const visitGroveBees = () => {
    const current = stateRef.current;
    if (current.honeybellStage < 3) return { ok: false, wax: false, honey: false };
    const now = Date.now();
    const remaining = Math.max(0, current.beeLastVisitAt + BEE_VISIT_COOLDOWN_MS - now);
    if (remaining > 0) {
      return { ok: false, wax: false, honey: false, minutesLeft: Math.ceil(remaining / 60_000) };
    }

    const dateKey = getShopDateKey();
    const wax = current.beeWaxClaimDate !== dateKey;
    const honey = current.beeHoneyMisses >= 2 || Math.random() < 0.3;
    setState((s) => {
      const inventory = { ...s.inventory };
      if (wax) inventory["beeswax-jar"] = (inventory["beeswax-jar"] || 0) + 1;
      if (honey) inventory["coastal-honey-jar"] = (inventory["coastal-honey-jar"] || 0) + 1;
      return {
        ...s,
        inventory,
        beeWaxClaimDate: wax ? dateKey : s.beeWaxClaimDate,
        beeLastVisitAt: now,
        beeHoneyMisses: honey ? 0 : s.beeHoneyMisses + 1,
        beeVisits: s.beeVisits + 1,
      };
    });
    play("beeLanding", 0.7);
    if (wax || honey) window.setTimeout(() => play("honeyJar", 0.85), 900);
    const rewards = [wax ? "a jar of wax" : "", honey ? "a jar of honey" : ""].filter(Boolean).join(" and ");
    toast(rewards ? `The bees shared ${rewards}!` : "The bees are still filling their honeycomb. Visit again later.");
    return { ok: true, wax, honey };
  };

  const collectSeaWater = () => {
    setState((s) => ({
      ...s,
      inventory: {
        ...s.inventory,
        "sea-water": (s.inventory["sea-water"] || 0) + 1,
      },
    }));
    play("oceanWaterSplash", 0.85);
    toast("Collected 1 Jar of Sea Water at the ocean's edge!");
  };

  const inspectFoundBottle = () => {
    if ((stateRef.current.inventory["sealed-frosted-bottle"] || 0) < 1) return null;
    const unreadMessages = FOUND_BOTTLE_MESSAGES.filter(
      (message) => !stateRef.current.foundBottleMessages.includes(message.id)
    );
    const messagePool = unreadMessages.length ? unreadMessages : FOUND_BOTTLE_MESSAGES;
    const message = messagePool[Math.floor(Math.random() * messagePool.length)];
    const bonusItemId = Math.random() < 0.35
      ? FOUND_BOTTLE_BONUSES[Math.floor(Math.random() * FOUND_BOTTLE_BONUSES.length)]
      : null;

    setState((s) => {
      const inventory = { ...s.inventory };
      inventory["sealed-frosted-bottle"] = Math.max(0, (inventory["sealed-frosted-bottle"] || 0) - 1);
      inventory["empty-glass-bottle"] = (inventory["empty-glass-bottle"] || 0) + 1;
      if (bonusItemId) inventory[bonusItemId] = (inventory[bonusItemId] || 0) + 1;
      return {
        ...s,
        inventory,
        foundBottleMessages: s.foundBottleMessages.includes(message.id)
          ? s.foundBottleMessages
          : [...s.foundBottleMessages, message.id],
      };
    });
    playBottleSequence();
    toast(bonusItemId ? `A message and ${ITEMS[bonusItemId].name} were inside!` : "A message was tucked inside the bottle!");
    return { messageId: message.id, bonusItemId };
  };

  const buyFromSeaweed = (itemId: string, discoveryDate?: string) => {
    const regular = SHOP_STOCK.find((item) => item.itemId === itemId);
    const discovery = SEAWEED_DISCOVERIES.find((item) => item.itemId === itemId);
    const listing = regular || discovery;
    if (!listing || !ITEMS[itemId]) return false;
    if (itemId === "copper-wire" && (!stateRef.current.rowboatRepaired || !stateRef.current.hasDivingGear)) return false;
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

  const buyFromTraveler = (villagerId: "shelldon" | "shelby", itemId: string) => {
    if (!getScheduleStatus(villagerId).available) return false;
    const listing = getTravelingMerchantStock(villagerId).find((candidate) => candidate.itemId === itemId);
    const item = ITEMS[itemId];
    if (!listing || !item || stateRef.current.sandDollars < listing.price) return false;
    if (listing.kind === "blueprint" && stateRef.current.blueprints.includes(itemId)) return false;
    if (itemId === "seaside-air-pump" && (stateRef.current.inventory[itemId] || 0) > 0) return false;

    setState((s) => ({
      ...s,
      sandDollars: s.sandDollars - listing.price,
      blueprints: listing.kind === "blueprint" ? [...s.blueprints, itemId] : s.blueprints,
      inventory: listing.kind === "blueprint"
        ? s.inventory
        : { ...s.inventory, [itemId]: (s.inventory[itemId] || 0) + 1 },
      notebookDiscovered: { ...s.notebookDiscovered, [itemId]: true },
    }));
    play("sandDollarCoin");
    toast(listing.kind === "blueprint" ? `${item.name} added to your Blueprint Collection!` : `Purchased ${item.name} from ${VILLAGERS[villagerId].name}!`);
    return true;
  };

  const cultivateWithCoral = () => {
    const cost = [{ itemId: "coral-bulb", count: 1 }, { itemId: "fertilizer", count: 1 }];
    if (!hasEnough(cost)) return null;
    const nextCultivation = stateRef.current.coralCultivations + 1;
    const rewardItemId = nextCultivation % 3 === 0 ? "bioluminescent-shard" : "sea-berry";
    setState((s) => {
      const inventory = deductCost({ ...s.inventory }, cost);
      inventory[rewardItemId] = (inventory[rewardItemId] || 0) + 1;
      return { ...s, inventory, coralCultivations: s.coralCultivations + 1 };
    });
    play(rewardItemId === "bioluminescent-shard" ? "seaGlass" : "groveBerryPick");
    toast(`Coral cultivated a ${ITEMS[rewardItemId].name}!`);
    return rewardItemId;
  };

  const bakeWithMina = () => {
    const cost = [{ itemId: "kelp", count: 1 }, { itemId: "sea-berry", count: 1 }];
    if (!hasEnough(cost)) return false;
    setState((s) => {
      const inventory = deductCost({ ...s.inventory }, cost);
      inventory["food-kelp-cookie"] = (inventory["food-kelp-cookie"] || 0) + 2;
      return { ...s, inventory, minaBakes: s.minaBakes + 1 };
    });
    play("craftSuccess");
    toast("Mina baked 2 Warm Kelp Cookies!");
    return true;
  };

  const claimBubblesDelivery = () => {
    const today = localDateKey();
    if ((stateRef.current.villagerGiftCounts.bubbles || 0) < 1 || stateRef.current.bubblesDeliveryDate === today) return null;
    const bottleItemId = "sealed-frosted-bottle";
    const bonusItemId = BUBBLES_BONUSES[Math.floor(Math.random() * BUBBLES_BONUSES.length)];
    setState((s) => ({
      ...s,
      bubblesDeliveryDate: today,
      inventory: {
        ...s.inventory,
        [bottleItemId]: (s.inventory[bottleItemId] || 0) + 1,
        [bonusItemId]: (s.inventory[bonusItemId] || 0) + 1,
      },
    }));
    play("oceanWaterSplash");
    toast(`Bubbles delivered a Frosted Bottle and ${ITEMS[bonusItemId].name}!`);
    return { bottleItemId, bonusItemId };
  };

  const claimPearlsFriendshipGift = () => {
    const earnedRewards = Math.floor((stateRef.current.villagerGiftCounts.pearl || 0) / 3);
    if (stateRef.current.pearlRewardsClaimed >= earnedRewards) return null;
    const rewardItemId = PEARL_FRIENDSHIP_REWARDS[stateRef.current.pearlRewardsClaimed % PEARL_FRIENDSHIP_REWARDS.length];
    setState((s) => ({
      ...s,
      pearlRewardsClaimed: s.pearlRewardsClaimed + 1,
      inventory: { ...s.inventory, [rewardItemId]: (s.inventory[rewardItemId] || 0) + 1 },
    }));
    play("pearl");
    toast(`Pearl formed a ${ITEMS[rewardItemId].name} for you!`);
    return rewardItemId;
  };

  const claimPenelopeCleanupReward = () => {
    const earnedRewards = Math.floor((stateRef.current.villagerGiftCounts.penelope || 0) / 3);
    if (stateRef.current.penelopeRewardsClaimed >= earnedRewards) return null;
    const reward = PENELOPE_CLEANUP_REWARDS[stateRef.current.penelopeRewardsClaimed % PENELOPE_CLEANUP_REWARDS.length];
    setState((s) => ({
      ...s,
      penelopeRewardsClaimed: s.penelopeRewardsClaimed + 1,
      inventory: { ...s.inventory, [reward.itemId]: (s.inventory[reward.itemId] || 0) + reward.count },
    }));
    play(ITEMS[reward.itemId].sfx, 0.8);
    toast(`Penelope dropped ${reward.count} ${ITEMS[reward.itemId].name}${reward.count === 1 ? "" : "s"} for you!`);
    return reward;
  };

  const completeSandyStormHunt = () => {
    const current = stateRef.current;
    if (current.sandyStormHuntsCompleted >= current.stormCleanupCompletions) return null;
    const cost = [{ itemId: "trash-plastic", count: 1 }, { itemId: "glass-blue", count: 1 }];
    if (!hasEnough(cost)) return null;
    const reward = SANDY_STORM_REWARDS[current.sandyStormHuntsCompleted % SANDY_STORM_REWARDS.length];
    setState((s) => {
      const inventory = deductCost({ ...s.inventory }, cost);
      inventory[reward.itemId] = (inventory[reward.itemId] || 0) + reward.count;
      return { ...s, inventory, sandyStormHuntsCompleted: s.sandyStormHuntsCompleted + 1, sandDollars: s.sandDollars + 1 };
    });
    play("questComplete", 0.75);
    toast(`Sandy's checklist complete: ${reward.count} ${ITEMS[reward.itemId].name}${reward.count === 1 ? "" : "s"} and 1 Sand Dollar!`);
    return reward;
  };

  const tradeWithKai = (shellId: string) => {
    const current = stateRef.current;
    if (!current.questProgress.kaiburrowsecret || !KAI_TRADEABLE_SHELL_IDS.includes(shellId) || (current.inventory[shellId] || 0) < 3) return null;
    const rewardItemId = KAI_BURIED_REWARDS[current.kaiBuriedTrades % KAI_BURIED_REWARDS.length];
    setState((s) => {
      const inventory = deductCost({ ...s.inventory }, [{ itemId: shellId, count: 2 }]);
      inventory[rewardItemId] = (inventory[rewardItemId] || 0) + 1;
      return { ...s, inventory, kaiBuriedTrades: s.kaiBuriedTrades + 1 };
    });
    play("oceanWaterSplash", 0.55);
    window.setTimeout(() => play(ITEMS[rewardItemId].sfx, 0.8), 300);
    toast(`Pfft! Kai uncovered ${ITEMS[rewardItemId].name}.`);
    return rewardItemId;
  };

  const tradeWithMisty = (itemId: string) => {
    const current = stateRef.current;
    const today = localDateKey();
    if (!getScheduleStatus("misty").available || current.mistyTradeDate === today || !["bioluminescent-shard", "moonstone"].includes(itemId) || (current.inventory[itemId] || 0) < 1) return null;
    const rewardItemId = MISTY_EXCHANGE_REWARDS[current.mistyTrades % MISTY_EXCHANGE_REWARDS.length];
    setState((s) => {
      const inventory = deductCost({ ...s.inventory }, [{ itemId, count: 1 }]);
      inventory[rewardItemId] = (inventory[rewardItemId] || 0) + 1;
      return { ...s, inventory, mistyTradeDate: today, mistyTrades: s.mistyTrades + 1 };
    });
    play("pearl", 0.75);
    window.setTimeout(() => play(ITEMS[rewardItemId].sfx, 0.75), 350);
    toast(`Misty's moonlit current reveals ${ITEMS[rewardItemId].name}.`);
    return rewardItemId;
  };

  const claimMistyFriendshipReward = () => {
    const current = stateRef.current;
    if (!getScheduleStatus("misty").available || current.mistyFriendshipRewardClaimed || (current.villagerGiftCounts.misty || 0) < 3) return null;
    const rewardItemId = "misty-moon-lantern";
    setState((s) => ({
      ...s,
      mistyFriendshipRewardClaimed: true,
      inventory: { ...s.inventory, [rewardItemId]: (s.inventory[rewardItemId] || 0) + 1 },
    }));
    play("pearl", 0.9);
    toast("Misty gives you a softly glowing Moon Jelly Lantern!");
    return rewardItemId;
  };

  const createPaintedShell = (shellId: string, color: string, pattern: string, requestedName?: string) => {
    const current = stateRef.current;
    const patterns = [
      ...BASIC_SHELL_PATTERNS,
      ...(current.questProgress.sunnyshellpalette ? [SUNNY_QUEST_PATTERN] : []),
      ...(current.notebookRewardsClaimed.includes("beachcombing-shells") ? [...NOTEBOOK_SHELL_PATTERNS] : []),
    ];
    if (
      !(PAINTABLE_SHELL_IDS as readonly string[]).includes(shellId) ||
      !(SHELL_PAINT_COLORS as readonly string[]).includes(color) ||
      !patterns.includes(pattern) ||
      (current.inventory[shellId] || 0) < 1 ||
      (current.inventory["paint-pigment"] || 0) < 1
    ) return null;
    const picture: PaintedShell = {
      id: `painted-shell-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: requestedName?.trim().slice(0, 50) || defaultPaintedShellName(ITEMS[shellId].name, pattern),
      shellId,
      color,
      pattern,
      createdAt: Date.now(),
    };
    setState((s) => {
      const inventory = deductCost({ ...s.inventory }, [{ itemId: shellId, count: 1 }, { itemId: "paint-pigment", count: 1 }]);
      inventory["painted-shell"] = (inventory["painted-shell"] || 0) + 1;
      return { ...s, inventory, paintedShells: [...s.paintedShells, picture] };
    });
    play("paintPigment", 0.8);
    window.setTimeout(() => play("sparkle", 0.45), 350);
    toast(`${picture.name} added to Sunny's Painted Shell Gallery!`);
    return picture;
  };

  const tradeWithSplash = () => {
    const cost = [{ itemId: "fresh-reef-fish", count: 1 }];
    if (!hasEnough(cost)) return null;
    const tradeNumber = stateRef.current.splashTrades;
    const rewardItemId = SPLASH_TRADE_REWARDS[tradeNumber % SPLASH_TRADE_REWARDS.length];
    const story = SPLASH_STORIES[tradeNumber % SPLASH_STORIES.length];
    setState((s) => {
      const inventory = deductCost({ ...s.inventory }, cost);
      inventory[rewardItemId] = (inventory[rewardItemId] || 0) + 1;
      return { ...s, inventory, splashTrades: s.splashTrades + 1 };
    });
    play("craftSuccess");
    toast(`Splash traded you ${ITEMS[rewardItemId].name}!`);
    return { rewardItemId, story };
  };

  const dismissOlliNotification = () => {
    setState((s) => ({ ...s, olliNotificationPending: false }));
  };

  const requestOlliClue = () => {
    if (!stateRef.current.olliHidingLocation) return;
    setState((s) => ({
      ...s,
      olliNotificationPending: false,
      olliClueStage: Math.min(2, s.olliClueStage + 1),
    }));
    play("oceanWaterSplash", 0.45);
  };

  const findOlli = (location: OlliHidingLocation) => {
    if (stateRef.current.olliHidingLocation !== location) return null;
    const rewardItemId = getOlliInkReward(stateRef.current.olliHuntsCompleted);
    setState((s) => ({
      ...s,
      olliHidingLocation: null,
      olliNotificationPending: false,
      olliClueStage: 0,
      olliHuntsCompleted: s.olliHuntsCompleted + 1,
      inventory: { ...s.inventory, [rewardItemId]: (s.inventory[rewardItemId] || 0) + 1 },
    }));
    play("oceanWaterSplash", 0.6);
    window.setTimeout(() => play(ITEMS[rewardItemId].sfx, 0.75), 350);
    toast(`You found Olli! He shared ${ITEMS[rewardItemId].name}.`);
    return rewardItemId;
  };

  const createOlliInkPicture = (inkId: string, background: string, stamp: string, pattern: string, requestedName?: string) => {
    const allInkIds = [...OLLI_INK_IDS, "ink-pumpkin-orange"] as string[];
    if (
      !allInkIds.includes(inkId) ||
      !(OLLI_ART_BACKGROUNDS as readonly string[]).includes(background) ||
      !(OLLI_ART_STAMPS as readonly string[]).includes(stamp) ||
      !(OLLI_ART_PATTERNS as readonly string[]).includes(pattern) ||
      (stateRef.current.inventory[inkId] || 0) < 1
    ) return null;
    const picture: OlliInkPicture = {
      id: `olli-art-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: requestedName?.trim().slice(0, 50) || `${stamp} in ${ITEMS[inkId].name}`,
      inkId,
      background,
      stamp,
      pattern,
      createdAt: Date.now(),
    };
    setState((s) => ({
      ...s,
      inventory: { ...s.inventory, [inkId]: Math.max(0, (s.inventory[inkId] || 0) - 1) },
      olliInkPictures: [...s.olliInkPictures, picture],
    }));
    play("paintPigment", 0.8);
    window.setTimeout(() => play("sparkle", 0.45), 450);
    toast(`${picture.name} added to Olli's Ink Gallery!`);
    return picture;
  };

  const completeOlliRingToss = (score: number) => {
    const safeScore = Math.max(0, Math.min(5, Math.floor(score)));
    const today = localDateKey();
    const rewarded = safeScore === 5 && stateRef.current.olliRingRewardDate !== today;
    const bestScore = Math.max(stateRef.current.olliRingBestScore, safeScore);
    setState((s) => ({
      ...s,
      olliRingBestScore: Math.max(s.olliRingBestScore, safeScore),
      olliRingRewardDate: rewarded ? today : s.olliRingRewardDate,
      sandDollars: rewarded ? s.sandDollars + 3 : s.sandDollars,
    }));
    play(safeScore > 0 ? "questComplete" : "oceanWaterSplash", 0.7);
    if (rewarded) toast("Perfect ring toss! Olli awarded 3 Sand Dollars.");
    return { rewarded, bestScore };
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

  const createCustomJewelry = (kind: JewelryKind, materials: string[], requestedName?: string) => {
    const details = JEWELRY_KIND_DETAILS[kind];
    if (!details || materials.length !== details.slots || materials.some((id) => !(JEWELRY_MATERIAL_IDS as readonly string[]).includes(id))) {
      return { ok: false };
    }

    const costCounts: Record<string, number> = { [details.foundationId]: 1 };
    for (const material of materials) costCounts[material] = (costCounts[material] || 0) + 1;
    if (Object.entries(costCounts).some(([itemId, count]) => (stateRef.current.inventory[itemId] || 0) < count)) {
      return { ok: false };
    }

    const cleanName = requestedName?.trim().slice(0, 50) || defaultJewelryName(kind, materials);
    const piece: CustomJewelryPiece = {
      id: `jewelry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind,
      name: cleanName,
      materials: [...materials],
      value: calculateJewelryValue(kind, materials),
      favorite: false,
      createdAt: Date.now(),
    };

    setState((s) => {
      const inventory = { ...s.inventory };
      for (const [itemId, count] of Object.entries(costCounts)) inventory[itemId] = Math.max(0, (inventory[itemId] || 0) - count);
      return { ...s, inventory, customJewelry: [...s.customJewelry, piece] };
    });
    play("craftSuccess");
    toast(`${piece.name} completed!`);
    return { ok: true, piece };
  };

  const toggleCustomJewelryFavorite = (pieceId: string) => {
    setState((s) => ({
      ...s,
      customJewelry: s.customJewelry.map((piece) => piece.id === pieceId ? { ...piece, favorite: !piece.favorite } : piece),
    }));
  };

  const sellCustomJewelry = (pieceId: string) => {
    const piece = stateRef.current.customJewelry.find((candidate) => candidate.id === pieceId);
    if (!piece || piece.favorite) return false;
    setState((s) => ({
      ...s,
      customJewelry: s.customJewelry.filter((candidate) => candidate.id !== pieceId),
      sandDollars: s.sandDollars + piece.value,
    }));
    play("sandDollarCoin");
    toast(`Seaweed paid ${piece.value} Sand Dollars for ${piece.name}.`);
    return true;
  };

  const claimBooSand = (itemId: string) => {
    const today = localDateKey();
    if (!stateRef.current.sandbarsUnlocked || !stateRef.current.booToolSetDelivered || !isBooOctober() || stateRef.current.booSandClaimDate === today || !(BOO_SAND_IDS as readonly string[]).includes(itemId)) return false;
    setState((s) => ({
      ...s,
      booSandClaimDate: today,
      inventory: { ...s.inventory, [itemId]: (s.inventory[itemId] || 0) + 3 },
    }));
    play(ITEMS[itemId].sfx);
    toast(`Boo shared 3 scoops of ${ITEMS[itemId].name}!`);
    return true;
  };

  const deliverBooToolSet = () => {
    if (!stateRef.current.sandbarsUnlocked || stateRef.current.booToolSetDelivered || (stateRef.current.inventory["boo-sand-art-tool-set"] || 0) < 1) return false;
    setState((s) => ({
      ...s,
      booToolSetDelivered: true,
      inventory: { ...s.inventory, "boo-sand-art-tool-set": Math.max(0, (s.inventory["boo-sand-art-tool-set"] || 0) - 1) },
    }));
    play("craftSuccess");
    toast("Boo clicks his new tools together. His Custom Bottle Studio is open!");
    return true;
  };

  const createCustomSandBottle = (layers: string[], accentId: string | null = null, requestedName?: string) => {
    if (layers.length !== 5 || layers.some((id) => !(CUSTOM_SAND_IDS as readonly string[]).includes(id)) || (accentId && !(CUSTOM_SAND_ACCENT_IDS as readonly string[]).includes(accentId))) return { ok: false };
    const costs: Record<string, number> = { "empty-glass-bottle": 1 };
    for (const layer of layers) costs[layer] = (costs[layer] || 0) + 1;
    if (accentId) costs[accentId] = (costs[accentId] || 0) + 1;
    if (Object.entries(costs).some(([itemId, count]) => (stateRef.current.inventory[itemId] || 0) < count)) return { ok: false };
    const bottle: CustomSandBottle = {
      id: `sand-bottle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: requestedName?.trim().slice(0, 50) || defaultSandBottleName(layers),
      layers: [...layers],
      accentId,
      value: calculateSandBottleValue(layers, accentId),
      favorite: false,
      createdAt: Date.now(),
    };
    setState((s) => {
      const inventory = { ...s.inventory };
      for (const [itemId, count] of Object.entries(costs)) inventory[itemId] = Math.max(0, (inventory[itemId] || 0) - count);
      return { ...s, inventory, customSandBottles: [...s.customSandBottles, bottle] };
    });
    play("craftSuccess");
    toast(`${bottle.name} completed!`);
    return { ok: true, bottle };
  };

  const toggleCustomSandBottleFavorite = (bottleId: string) => {
    setState((s) => ({ ...s, customSandBottles: s.customSandBottles.map((bottle) => bottle.id === bottleId ? { ...bottle, favorite: !bottle.favorite } : bottle) }));
  };

  const sellCustomSandBottle = (bottleId: string) => {
    const bottle = stateRef.current.customSandBottles.find((candidate) => candidate.id === bottleId);
    if (!bottle || bottle.favorite) return false;
    setState((s) => ({ ...s, customSandBottles: s.customSandBottles.filter((candidate) => candidate.id !== bottleId), sandDollars: s.sandDollars + bottle.value }));
    play("sandDollarCoin");
    toast(`Seaweed paid ${bottle.value} Sand Dollars for ${bottle.name}.`);
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
      bottleRoseMilk,
      claimQuest,
      openChest,
      searchChest,
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
      giftSnappyChoker,
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
      checkRaftAirLevel,
      giftVillager,
      musicOverride,
      setMusicOverride,
      notebookOpen,
      setNotebookOpen,
      markNotebookSeen,
      claimNotebookReward,
      saveSandcastle,
      addLookoutSighting,
      addTidePoolDiscovery,
      completeTidePoolSearch,
      collectTidePoolShellHollow,
      claimPenelopeCleanupReward,
      completeSandyStormHunt,
      createPaintedShell,
      tradeWithKai,
      tradeWithMisty,
      claimMistyFriendshipReward,
      recoverMaevesKettle,
      checkWeather,
      completeStormCleanup,
      collectRainBarrelWater,
      completeGroveNursery,
      advanceHoneybell,
      visitGroveBees,
      buyFromSeaweed,
      buyFromTraveler,
      cultivateWithCoral,
      bakeWithMina,
      claimBubblesDelivery,
      claimPearlsFriendshipGift,
      tradeWithSplash,
      dismissOlliNotification,
      requestOlliClue,
      findOlli,
      createOlliInkPicture,
      completeOlliRingToss,
      sellToSeaweed,
      collectSeaWater,
      inspectFoundBottle,
      createCustomJewelry,
      toggleCustomJewelryFavorite,
      sellCustomJewelry,
      claimBooSand,
      deliverBooToolSet,
      createCustomSandBottle,
      toggleCustomSandBottleFavorite,
      sellCustomSandBottle,
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
