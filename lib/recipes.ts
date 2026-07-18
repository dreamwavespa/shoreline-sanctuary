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

export const DECOR_RECIPES: CraftRecipe[] = [
  {
    id: "beach-umbrella",
    name: "The Beach Umbrella",
    description: "Crafted from driftwood poles and washed-up canvas sails. Provides interactive shade for Snappy and local beach crabs.",
    cost: [
      { itemId: "washed-up-canvas", count: 2 },
      { itemId: "raw-driftwood-arch", count: 2 },
      { itemId: "hemp-thread", count: 1 },
    ],
  },
  {
    id: "picnic-basket",
    name: "The Picnic Basket",
    description: "Woven from dried golden sea oats and lined with a checkered cloth. The primary anchor for seagull trade encounters.",
    cost: [
      { itemId: "dried-sea-oats", count: 4 },
      { itemId: "washed-up-canvas", count: 1 },
      { itemId: "hemp-thread", count: 1 },
    ],
  },
  {
    id: "coastal-salt-lamp",
    name: "The Coastal Salt Lamp",
    description: "A faceted pink salt crystal bonded to a driftwood base, lit from within by a glowing firefly jar.",
    cost: [
      { itemId: "salt-crystal-pink", count: 3 },
      { itemId: "raw-driftwood-planks", count: 1 },
      { itemId: "firefly-jar", count: 1 },
    ],
  },
  {
    id: "woven-sun-hat",
    name: "The Woven Sun Hat",
    description: "Wide-brimmed straw hat woven from dried sea oats, banded with pastel sea roses, and buckled with a shiny soda tab.",
    cost: [
      { itemId: "dried-sea-oats", count: 6 },
      { itemId: "sea-rose-petal", count: 2 },
      { itemId: "shiny-soda-tab", count: 1 },
    ],
  },
];

export const RAFT_RECIPE: CraftRecipe = {
  id: "inflatable-raft",
  name: "Inflatable Rubber Raft",
  description: "Beach balls and recycled rubber strips, lashed to a driftwood oar. Unlocks the Shifting Sandbars beyond the shore.",
  cost: [
    { itemId: "beach-ball", count: 4 },
    { itemId: "recycled-rubber", count: 2 },
    { itemId: "driftwood-oar", count: 1 },
  ],
};

export interface SandArtRecipe {
  id: string;
  name: string;
  description: string;
  cost: { itemId: string; count: number }[];
  outputItemId: string;
}

export const SAND_ART_RECIPES: SandArtRecipe[] = [
  {
    id: "sunset-shoreline",
    name: "Sunset Shoreline",
    description: "Alternating flat blocks of apricot and pink sand in a frosted bottle. Casts a golden-hour glow around nearby blankets.",
    cost: [
      { itemId: "sand-apricot", count: 2 },
      { itemId: "sand-pink", count: 2 },
      { itemId: "empty-glass-bottle", count: 1 },
    ],
    outputItemId: "bottle-sunset-shoreline",
  },
  {
    id: "subaquatic-sandbar",
    name: "Sub-Aquatic Sandbar",
    description: "Teal and apricot sand layered into a rippling wave pattern. Attracts curious sandbar crabs.",
    cost: [
      { itemId: "sand-teal", count: 3 },
      { itemId: "sand-apricot", count: 1 },
      { itemId: "empty-glass-bottle", count: 1 },
    ],
    outputItemId: "bottle-subaquatic-sandbar",
  },
  {
    id: "legendary-tidepool",
    name: "Legendary Tide-Pool Glimmer",
    description: "Pink and teal sand mixed with crushed pearl dust, layered in fine wavy lines. Unlocks a musical chime ambient loop.",
    cost: [
      { itemId: "sand-pink", count: 2 },
      { itemId: "sand-teal", count: 2 },
      { itemId: "pearl-silver", count: 1 },
      { itemId: "empty-glass-bottle", count: 1 },
    ],
    outputItemId: "bottle-legendary-tidepool",
  },
];
