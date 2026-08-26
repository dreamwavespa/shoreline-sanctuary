// Shoreline Sanctuary — Villager & Sea Glass Sister Roster
// Added: mermaid Sea Glass Sisters, shoreline/underwater residents, traveling
// merchants, the Master Gift Reaction System, and the Cottage Harmony Engine.
// Source: "Shoreline New Characters — gift reactions & visuals" design doc.

export type VillagerGroup =
  | "sea-glass-sister"
  | "shoreline-resident"
  | "underwater-village"
  | "traveling-special";

export interface GiftReaction {
  /** Item ids (see lib/items.ts) this villager loves receiving. */
  lovedGiftIds: string[];
  /** Short description of the SFX + visual reaction played on gifting. */
  reactionSfx: string;
  reactionVisual: string;
  /**
   * When this villager is disliked-gifted or maxed out on a duplicate,
   * the game should suggest re-gifting to one of these villager ids instead.
   */
  redirectTo: string[];
}

export interface SoundSignature {
  instrumentation: string;
  movementSfx: string;
}

export interface VillagerDef {
  id: string;
  name: string;
  title: string;
  group: VillagerGroup;
  personality: string;
  palette?: string;
  role: string;
  behavior?: string;
  gameplay: string;
  schedule?: string;
  location: string;
  gift: GiftReaction;
  soundSignature?: SoundSignature;
  /** Cottage room this villager occupies, for the Sea Glass Sisters. */
  cottageRoomId?: string;
  imageUrl?: string;
}

export const VILLAGERS: Record<string, VillagerDef> = {
  // ── The Sea Glass Sisters ───────────────────────────────────────────
  melody: {
    id: "melody",
    name: "Melody",
    title: "The Collector & Jeweler",
    group: "sea-glass-sister",
    personality: "Cheerful, artistic, constantly singing, and warm & welcoming.",
    palette: "Sunset peach & aqua",
    role: "Crafts wearable jewelry and hanging cottage chimes from collected sea glass.",
    gameplay:
      "Accepts sea glass, shells, pearls, and driftwood. Crafts wearable jewelry and hanging cottage cosmetics.",
    location: "Melody's Sunlit Jewelry Parlor (Cottage — Ground Floor)",
    cottageRoomId: "jewelry-parlor",
    gift: {
      lovedGiftIds: ["glass-white", "pearl-pink", "shiny-soda-tab"],
      reactionSfx: "swish-tink chimes",
      reactionVisual: "Peach Hearts",
      redirectTo: ["mina", "splash"],
    },
    soundSignature: {
      instrumentation: "Finger-picked acoustic guitar + high-frequency glass marimba",
      movementSfx: "Light swish-tink of sea glass beads",
    },
  },
  marella: {
    id: "marella",
    name: "Marella",
    title: "The Seer of the Tides",
    group: "sea-glass-sister",
    personality: "Calm, deeply serene, and tied to the ancient ocean rhythms.",
    palette: "Midnight blue & moonlight",
    role: "Interprets tides, weather, moon phases, and rare fish spawns.",
    gameplay: "Offers poetic hints rather than direct answers.",
    location: "Marella's Celestial Observatory (Cottage — Upper Floor)",
    cottageRoomId: "celestial-observatory",
    gift: {
      lovedGiftIds: ["moonstone", "star-wish-bottle", "bioluminescent-shard"],
      reactionSfx: "whoosh-shhh pads",
      reactionVisual: "Silvery Moonlight",
      redirectTo: ["kaiana"],
    },
    soundSignature: {
      instrumentation: "Ambient pad synths + pulsing moonlit harp",
      movementSfx: "Weightless whoosh-shhh",
    },
  },
  coralie: {
    id: "coralie",
    name: "Coralie",
    title: "The Sanctuary Botanist",
    group: "sea-glass-sister",
    personality: "Very nurturing, gentle, and deeply attached to ocean plant life.",
    palette: "Emerald green & auburn",
    role: "Tends the glowing gardens around the cottage.",
    gameplay: "Unlocks custom underwater garden and island flora decorating.",
    location: "Coralie's Bioluminescent Grotto (Cottage — Sunken Level)",
    cottageRoomId: "bioluminescent-grotto",
    gift: {
      lovedGiftIds: ["coral-bulb", "sea-berry", "fertilizer"],
      reactionSfx: "shhh-splash water",
      reactionVisual: "Emerald Leaves",
      redirectTo: ["melody"],
    },
    soundSignature: {
      instrumentation: "Warm wooden marimba + plucked acoustic bass",
      movementSfx: "Soft shhh-splash of leafy fronds",
    },
  },
  kaiana: {
    id: "kaiana",
    name: "Kaiana",
    title: "The Master Restorer",
    group: "sea-glass-sister",
    personality: "Elegant, poised, mysterious, and a master artisan.",
    palette: "Sapphire blue & antique gold",
    role: "Polishes broken compasses, rusty lanterns, and old jewelry into pristine collectibles.",
    gameplay: "Unlocked via deep diving.",
    location: "Kaiana's Antique Restoration Studio (Cottage — Attic Level)",
    cottageRoomId: "restoration-studio",
    gift: {
      lovedGiftIds: ["tarnished-compass", "locket", "carnelian"],
      reactionSfx: "glide-shimmer chimes",
      reactionVisual: "Diamond Flashes",
      redirectTo: ["coralie"],
    },
    soundSignature: {
      instrumentation: "Solo cello + crystalline bell chimes",
      movementSfx: "Smooth glide-shimmer",
    },
  },

  // ── Shoreline Residents & Eco-Allies ────────────────────────
  sandy: {
    id: "sandy",
    name: "Sandy",
    title: "the Sandpiper",
    group: "shoreline-resident",
    personality: "Energetic, curious, always on the move.",
    role: "Scavenger Hunt Guide",
    behavior: "Scurries along the wet sand in the intertidal zone.",
    gameplay:
      "After storms, offers zero-stress checklists (e.g., finding frosted sea glass or clearing tangled line).",
    location: "Intertidal Zone / North Beach",
    gift: {
      lovedGiftIds: ["shiny-soda-tab", "glass-blue", "trophy-map"],
      reactionSfx: 'Water Squirt ("Pfft!")',
      reactionVisual: "Blue Bubbles",
      redirectTo: ["kai"],
    },
  },
  kai: {
    id: "kai",
    name: "Kai",
    title: "the Clam",
    group: "shoreline-resident",
    personality: "Shy, secretive, generous once befriended.",
    role: "Buried Sand Treasures",
    behavior: 'Hidden beneath wet sand, marked by a gentle squirt animation ("pfft-squirt!").',
    gameplay: "Trading duplicate shiny shells rewards players with rare buried stones and glass.",
    location: "Tide Pools",
    gift: {
      lovedGiftIds: ["shiny-soda-tab", "glass-blue", "trophy-compass"],
      reactionSfx: 'Water Squirt ("Pfft!")',
      reactionVisual: "Blue Bubbles",
      redirectTo: ["sandy"],
    },
  },
  sunny: {
    id: "sunny",
    name: "Sunny",
    title: "the Starfish",
    group: "shoreline-resident",
    personality: "Playful, colorful, artistically minded.",
    role: "Shell Customization & Artistry",
    behavior: "Lounges on stones in the Tide Pools.",
    gameplay: "Unlocks shell-painting options (pastel paints, wave patterns, iridescent finishes).",
    location: "Tide Pools",
    gift: {
      lovedGiftIds: ["paint-pigment", "shell-scallop", "glitter"],
      reactionSfx: "Xylophone Spin",
      reactionVisual: "Rainbow Paint Cloud",
      redirectTo: ["splash"],
    },
  },
  penelope: {
    id: "penelope",
    name: "Penelope",
    title: "the Pelican",
    group: "shoreline-resident",
    personality: "Watchful, caring, quietly heroic.",
    role: "Eco-Cleanup Incentive",
    behavior: "Perches on dock pilings watching the shoreline.",
    gameplay:
      "Clearing plastic rings and catching floating balloons fills her heart meter, causing her to drop rare food items (coconuts, wild berries).",
    location: "Dock Pilings",
    gift: {
      lovedGiftIds: ["trash-plastic", "rescue-balloon"],
      reactionSfx: "Wing Flap, Drops Food Item",
      reactionVisual: "Heart Meter Fill",
      redirectTo: ["melody"],
    },
  },

  // ── Underwater Village ──────────────────────────────
  coral: {
    id: "coral",
    name: "Coral",
    title: "the Seahorse",
    group: "underwater-village",
    personality: "Diligent, gentle, green-thumbed.",
    role: "Underwater Gardener",
    gameplay: "Helps players plant and cultivate underwater botanical gardens, trading rare glowing flora.",
    location: "Underwater Village",
    gift: {
      lovedGiftIds: ["coral-bulb", "fertilizer", "bioluminescent-shard"],
      reactionSfx: "Water Sprinkles, Leaf Particles",
      reactionVisual: "Water Sprinkles",
      redirectTo: ["mina", "splash"],
    },
  },
  mina: {
    id: "mina",
    name: "Mina",
    title: "the Manatee",
    group: "underwater-village",
    personality: "Gentle baker, loves to decorate for parties.",
    role: "Kelp Kitchen Baker & Party Planner",
    gameplay:
      "Bakes seaweed breads and kelp cookies using gathered ocean ingredients; hosts celebratory ship parties.",
    location: "Underwater Village — Mina's Kitchen",
    gift: {
      lovedGiftIds: ["sea-berry", "kelp", "coconut-cream"],
      reactionSfx: "Oven Chime, Heart Flour Bubbles",
      reactionVisual: "Heart Flour Bubbles",
      redirectTo: ["melody", "pearl"],
    },
  },
  bubbles: {
    id: "bubbles",
    name: "Bubbles",
    title: "the Dolphin",
    group: "underwater-village",
    personality: "Speedy, friendly, always delivering good news.",
    role: "Island Messenger & Courier",
    gameplay: "Guides Message Bottles directly to the shoreline and delivers mystery gifts.",
    location: "Underwater Village",
    gift: {
      lovedGiftIds: ["star-wish-bottle", "shiny-soda-tab", "ribbon"],
      reactionSfx: "High-Speed Dolphin Spin & Splash",
      reactionVisual: "Dolphin Spin",
      redirectTo: ["kaiana", "kai"],
    },
  },
  pearl: {
    id: "pearl",
    name: "Pearl",
    title: "the Oyster",
    group: "underwater-village",
    personality: "Patient, quietly luminous, formed over time.",
    role: "Fine Pearl & Jewelry Crafter",
    gameplay: "Formed over days of friendship and shell-gifting; produces flawless pearls and fine jewelry.",
    location: "Underwater Village",
    gift: {
      lovedGiftIds: ["iridescent-shell", "mother-of-pearl", "soothing-sea-salt"],
      reactionSfx: "Harp Arpeggio",
      reactionVisual: "Rainbow Pearl Glow",
      redirectTo: ["coralie"],
    },
  },
  splash: {
    id: "splash",
    name: "Splash",
    title: "the Seal",
    group: "underwater-village",
    personality: "Whimsical storyteller, loves a good fishing tale.",
    role: "Fisherman & Storyteller",
    gameplay: "Trades harvested fish for craft items and shares whimsical fishing tales.",
    location: "Underwater Village",
    gift: {
      lovedGiftIds: ["driftwood-oar", "empty-glass-bottle"],
      reactionSfx: "Flipper Claps, Accordion Shanty",
      reactionVisual: "Flipper Claps",
      redirectTo: ["melody"],
    },
  },

  // ── Traveling & Special Characters ──────────────────────────
  shelldon: {
    id: "shelldon",
    name: "Shelldon",
    title: "the Giant Sea Turtle",
    group: "traveling-special",
    personality: "Old and wise, unhurried.",
    role: "Traveling Merchant",
    schedule: 'Visits once a week ("Shelldon Sundays")',
    gameplay: "Sells exotic seeds, rare furniture, and deep-sea shells.",
    location: "Trading Dock",
    gift: {
      lovedGiftIds: ["deep-sea-seed", "rare-soil"],
      reactionSfx: "Shell Gold Sparkle, Resonant Wood-Chime",
      reactionVisual: "Shell Gold Sparkle",
      redirectTo: ["mina"],
    },
  },
  shelby: {
    id: "shelby",
    name: "Shelby",
    title: "the Crab Captain",
    group: "traveling-special",
    personality: "Old, wise, arrives with the trading ship.",
    role: "Traveling Merchant",
    schedule: "Arrives when the Trading Ship docks",
    gameplay: "Rotates rare goods, master structural blueprints, and foreign trinkets.",
    location: "Trading Dock",
    gift: {
      lovedGiftIds: ["ship-chart", "spyglass-lens"],
      reactionSfx: 'Claw Clicks ("Clack!"), Brass Ship Bell',
      reactionVisual: "Claw Clicks",
      redirectTo: ["coralie"],
    },
  },
  misty: {
    id: "misty",
    name: "Misty",
    title: "the Moon Jellyfish",
    group: "traveling-special",
    personality: "Ethereal, fleeting, only seen under the right sky.",
    role: "Traveling Merchant",
    schedule: "Appears exclusively during Full Moon nights",
    gameplay: "Trades bioluminescent shards and glowing crafting materials.",
    location: "Open Water, Full Moon nights only",
    gift: {
      lovedGiftIds: ["bioluminescent-shard", "moonstone"],
      reactionSfx: "Neon-Cyan Pulse, Glass Harmonica",
      reactionVisual: "Neon-Cyan Pulse",
      redirectTo: ["kaiana", "kai"],
    },
  },
  angel: {
    id: "angel",
    name: "Angel",
    title: "the Angelfish",
    group: "traveling-special",
    personality: "Hopeful, generous, magical.",
    role: "The Wish Granter",
    gameplay:
      "Retrieves Star Wish Bottles released into the sea and returns with desired rare materials or wildlife event triggers.",
    location: "Open Water",
    gift: {
      lovedGiftIds: ["star-wish-bottle", "kelp-resin", "pure-water"],
      reactionSfx: "Golden Wish Glow, Twinkling Star Harp",
      reactionVisual: "Golden Wish Glow",
      redirectTo: [],
    },
  },
};

export const SEA_GLASS_SISTER_IDS = ["melody", "marella", "coralie", "kaiana"] as const;

export function getVillagersByGroup(group: VillagerGroup): VillagerDef[] {
  return Object.values(VILLAGERS).filter((v) => v.group === group);
}

// ── Sea Glass Cottage — Room Progression ────────────────────────
export interface CottageRoomDef {
  id: string;
  name: string;
  levelLabel: string;
  ownerId: string;
  description: string;
  station: string;
  imageUrl: string;
}

export const COTTAGE_ROOMS: CottageRoomDef[] = [
  {
    id: "jewelry-parlor",
    name: "Melody's Sunlit Jewelry Parlor",
    levelLabel: "Ground Floor (Level 1)",
    ownerId: "melody",
    description:
      "Frosted peach/teal sea-glass windows, driftwood workbench, shell wind-chime wall, woven daybed.",
    station: "Jewelry & Decor Customization Workbench",
    imageUrl:
      "https://galaxy-prod.tlcdn.com/gen/922c12b0d37c49ff93045d1f92125efe.png",
  },
  {
    id: "bioluminescent-grotto",
    name: "Coralie's Bioluminescent Grotto",
    levelLabel: "Sunken Level (Level 0)",
    ownerId: "coralie",
    description:
      "Indoor trickling stream, living pink/teal coral archway, stone seed nursery bench, seagrass hammock.",
    station: "Botanical Propagation Bench",
    imageUrl:
      "https://galaxy-prod.tlcdn.com/gen/a4182601590d47b78212819c700c94ce.png",
  },
  {
    id: "celestial-observatory",
    name: "Marella's Celestial Observatory",
    levelLabel: "Upper Floor (Level 2)",
    ownerId: "marella",
    description:
      "Indigo glass dome skylight, glowing tide orb pedestal, star-charm canopy bed, water-reflecting basin.",
    station: "Tide Orb & Event Altar",
    imageUrl:
      "https://galaxy-prod.tlcdn.com/gen/14f65012810542d38ca3f3a43e146d65.png",
  },
  {
    id: "restoration-studio",
    name: "Kaiana's Antique Restoration Studio",
    levelLabel: "Attic Level (Level 3)",
    ownerId: "kaiana",
    description:
      "Dark oak beams with brass lanterns, heavy wood workbench, velvet display cabinets, glass skylight.",
    station: "Artifact Restoration Station",
    imageUrl:
      "https://galaxy-prod.tlcdn.com/gen/284acd12747b437c87a18c402e6b30f9.png",
  },
];

// ── Cottage Harmony Engine ────────────────────────────────
// Background music dynamically layers in as sisters are reunited.
export interface CottageHarmonyLayer {
  sisterCount: 1 | 2 | 3 | 4;
  triggerSisterId: string;
  description: string;
}

export const COTTAGE_HARMONY_LAYERS: CottageHarmonyLayer[] = [
  {
    sisterCount: 1,
    triggerSisterId: "melody",
    description: "Acoustic Guitar & Glass Marimba.",
  },
  {
    sisterCount: 2,
    triggerSisterId: "coralie",
    description: "Adds Wooden Marimba & Plucked Bass.",
  },
  {
    sisterCount: 3,
    triggerSisterId: "marella",
    description: "Adds Ethereal Ambient Pads & Moonlit Harp.",
  },
  {
    sisterCount: 4,
    triggerSisterId: "kaiana",
    description: "Unlocks the Full 4-Part Master Orchestral Harmony.",
  },
];

// ── Bubbles' Bottle Post — Unboxing Sequence ────────────────────
export const BOTTLE_UNBOXING_SFX_SEQUENCE = [
  'WetCork Vacuum Release ("POP!")',
  'Glass-Clinking Scroll Release ("tink-slide")',
  'Crisp Parchment Unfurling ("crrrk-unfold")',
];
