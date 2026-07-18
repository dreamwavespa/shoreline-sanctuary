export interface CookRecipe {
  id: string;
  name: string;
  description: string;
  cost: { itemId: string; count: number }[];
  outputItemId: string;
  outputCount?: number;
  sceneImage?: string;
}

export const KITCHEN_RECIPES: CookRecipe[] = [
  {
    id: "coconut-cream",
    name: "Coconut Cream",
    description: "Crack and settle a coconut in the Cool Pantry to separate its rich cream.",
    cost: [{ itemId: "coconut", count: 1 }],
    outputItemId: "coconut-cream",
  },
  {
    id: "beach-plum-jelly",
    name: "Beach Plum Jelly",
    description: "Simmered on the Hearth Stove until sweet and glossy. Elly the Jellyfish adores this.",
    cost: [
      { itemId: "wild-beach-plum", count: 2 },
      { itemId: "luminous-sea-goo", count: 1 },
      { itemId: "soothing-sea-salt", count: 1 },
    ],
    outputItemId: "food-beach-plum-jelly",
    sceneImage: "beachPlumJelly",
  },
  {
    id: "sea-rose-milk",
    name: "Soothing Sea-Rose Milk",
    description: "Coconut cream steeped with sea rose petals — wakes Snappy right up.",
    cost: [
      { itemId: "coconut-cream", count: 1 },
      { itemId: "sea-rose-petal", count: 1 },
      { itemId: "soothing-sea-salt", count: 1 },
    ],
    outputItemId: "food-sea-rose-milk",
    sceneImage: "roseBowl",
  },
  {
    id: "seaweed-chips",
    name: "Crispy Seaweed Chips",
    description: "Toasted on a heated stone slab until crackly and salty.",
    cost: [
      { itemId: "seaweed-fronds", count: 1 },
      { itemId: "soothing-sea-salt", count: 1 },
    ],
    outputItemId: "food-seaweed-chips",
  },
  {
    id: "campfire-marshmallow",
    name: "Campfire Marshmallow",
    description: "Roasted golden over the campfire pit — Marshmallow the cat can't resist one.",
    cost: [
      { itemId: "coconut-cream", count: 1 },
      { itemId: "wild-beach-plum", count: 1 },
      { itemId: "luminous-sea-goo", count: 1 },
    ],
    outputItemId: "food-campfire-marshmallow",
  },
];

export interface CraftRecipe {
  id: string;
  name: string;
  description: string;
  cost: { itemId: string; count: number }[];
  sceneImage?: string;
}

export const JEWELRY_RECIPES: CraftRecipe[] = [
  {
    id: "sea-glass-pendant",
    name: "Sea Glass Wire Pendant",
    description: "Polished glass wrapped in weathered copper, clasped with driftwood. Gift it to Libby and she'll glow proudly in the dark reef.",
    cost: [
      { itemId: "glass-blue", count: 1 },
      { itemId: "copper-wire", count: 1 },
      { itemId: "raw-driftwood-arch", count: 1 },
    ],
    sceneImage: "seaGlassPendant",
  },
  {
    id: "tidal-pearl-choker",
    name: "The Tidal Pearl Choker",
    description: "Deep reef pearls strung on hemp thread — makes Snappy's shell permanently sparkle when gifted.",
    cost: [
      { itemId: "pearl-deepsea", count: 3 },
      { itemId: "nautilus-flake", count: 2 },
      { itemId: "hemp-thread", count: 1 },
    ],
  },
];

// ========== PHASE 4 & 5: RESORT EXPANSION RECIPES ==========

export const RESORT_RECIPES: CraftRecipe[] = [
  {
    id: "beach-umbrella",
    name: "Beach Umbrella",
    description: "Crafted using driftwood poles and washed-up canvas sails. Provides interactive shade zones for Snappy the Sea Turtle and local beach crabs.",
    cost: [
      { itemId: "raw-driftwood-arch", count: 2 },
      { itemId: "hemp-thread", count: 3 },
      { itemId: "glass-teal", count: 1 },
    ],
  },
  {
    id: "picnic-basket",
    name: "Picnic Basket",
    description: "Positioned on a cozy beach blanket to store crafted consumables like Coconut Milk. Serves as the primary anchor for the Winged Bandit (Seagull Snatch) event loop.",
    cost: [
      { itemId: "hemp-thread", count: 4 },
      { itemId: "raw-driftwood-arch", count: 1 },
      { itemId: "sea-rose-petal", count: 2 },
    ],
  },
  {
    id: "beach-bag",
    name: "Beach Bag",
    description: "Acts as a permanent mobile inventory extension (+10 slots). Discovered buried deep beneath the sand dunes near Snappy the Sea Turtle's primary resting spot.",
    cost: [
      { itemId: "hemp-thread", count: 5 },
      { itemId: "raw-barnacle-wood", count: 2 },
      { itemId: "glass-green", count: 1 },
    ],
  },
];

export const INFLATABLE_RECIPES: CraftRecipe[] = [
  {
    id: "inflatable-raft",
    name: "Inflatable Rubber Raft",
    description: "Press & hold the golden button for 2.5 seconds to fill the progress gauge. Permanently links the workshop to the Shifting Sandbars open-water exploration zone.",
    cost: [
      { itemId: "beach-ball", count: 4 },
      { itemId: "recycled-rubber", count: 2 },
      { itemId: "raw-driftwood-arch", count: 1 },
    ],
  },
];

export const MEDITATIVE_RECIPES: CraftRecipe[] = [
  {
    id: "salt-lamp",
    name: "Coastal Salt Lamp",
    description: "A jagged, geometrically faceted block of pink salt crystal bonded onto a dark driftwood platform, emitting a soothing peach-orange glow.",
    cost: [
      { itemId: "soothing-sea-salt", count: 3 },
      { itemId: "raw-driftwood-arch", count: 1 },
      { itemId: "luminous-sea-goo", count: 1 },
    ],
  },
  {
    id: "woven-sun-hat",
    name: "Woven Sun Hat",
    description: "Wide-brimmed golden straw cosmetic accessory. Equipping expands the evening horizon window by 5 real-world minutes before night sets in, elongating beachcombing runs.",
    cost: [
      { itemId: "seaweed-fronds", count: 6 },
      { itemId: "sea-rose-petal", count: 2 },
      { itemId: "seagull-shiny-soda-tab", count: 1 },
    ],
  },
];

export const SAND_ART_RECIPES: CraftRecipe[] = [
  {
    id: "sand-art-sunset",
    name: "Sunset Shoreline Sand Art",
    description: "Alternating flat blocks of Apricot and Pink Sand. Casts a permanent golden-hour environment color shader overlay around local blankets.",
    cost: [
      { itemId: "soothing-sea-salt", count: 2 }, // Apricot Sand proxy
      { itemId: "sea-rose-petal", count: 2 }, // Pink Sand proxy
      { itemId: "glass-amber", count: 1 },
    ],
  },
  {
    id: "sand-art-sandbar",
    name: "Sub-Aquatic Sandbar Sand Art",
    description: "Teal and Apricot sand with a Barnacle-Encrusted Bottle. Generates a small ripple wave layer in the glass. Attracts following sandbar crabs.",
    cost: [
      { itemId: "glass-teal", count: 3 },
      { itemId: "soothing-sea-salt", count: 1 },
      { itemId: "raw-barnacle-wood", count: 1 },
    ],
  },
  {
    id: "sand-art-tide-pool",
    name: "Legendary Tide-Pool Glimmer",
    description: "Pink Sand, Teal Sand, a Sparkling Golden Pearl, and Turquoise Sealed Bottle. Crushing the pearl at the mortar station mixes sparkling dust into both sand stocks. Unlocks a musical chime ambient loop.",
    cost: [
      { itemId: "sea-rose-petal", count: 2 },
      { itemId: "glass-teal", count: 2 },
      { itemId: "pearl-silver", count: 1 },
      { itemId: "glass-blue", count: 1 },
    ],
  },
];
