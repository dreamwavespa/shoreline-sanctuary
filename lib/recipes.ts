export interface CookRecipe {
  id: string;
  name: string;
  description: string;
  cost: { itemId: string; count: number }[];
  outputItemId: string;
  outputCount?: number;
  sceneImage?: string;
  station: string;
  season: "Year-round" | "Autumn" | "Winter";
}

export const KITCHEN_RECIPES: CookRecipe[] = [
  {
    id: "golden-pumpkin-bisque",
    name: "Golden Pumpkin Bisque",
    description: "Golden pumpkin simmered with coconut, seaweed, and lemongrass. Warms the tail on breezy autumn evenings.",
    cost: [{ itemId: "golden-island-pumpkin", count: 1 }, { itemId: "coconut", count: 1 }, { itemId: "seaweed-fronds", count: 2 }, { itemId: "wild-lemongrass", count: 1 }],
    outputItemId: "food-golden-pumpkin-bisque",
    station: "Hearth Stockpot",
    season: "Autumn",
  },
  {
    id: "sea-rose-pumpkin-tart",
    name: "Sea Rose Pumpkin Tart",
    description: "Sweet squash, cane, berries, and candied sea-rose petals baked into an autumn centerpiece.",
    cost: [{ itemId: "miniature-sugar-squash", count: 1 }, { itemId: "sea-rose-petal", count: 2 }, { itemId: "sweet-island-cane", count: 1 }, { itemId: "coastal-brambleberry", count: 2 }],
    outputItemId: "food-sea-rose-pumpkin-tart",
    station: "Baking Oven",
    season: "Autumn",
  },
  {
    id: "island-spiced-gingerbread",
    name: "Island Spiced Gingerbread",
    description: "Coastal shapes fragrant with fresh ginger, winter spice bark, sweet cane, and berry sugar.",
    cost: [{ itemId: "dune-ginger", count: 2 }, { itemId: "winter-spice-bark", count: 1 }, { itemId: "sweet-island-cane", count: 2 }, { itemId: "dried-sugar-berries", count: 1 }],
    outputItemId: "food-island-spiced-gingerbread",
    station: "Baking Oven",
    season: "Winter",
  },
  {
    id: "coastal-spiced-cocoa",
    name: "Frothy Coastal Spiced Cocoa",
    description: "Frothy coconut milk steeped with winter bark, beach mint, and dried sugar berries.",
    cost: [{ itemId: "coconut", count: 1 }, { itemId: "winter-spice-bark", count: 1 }, { itemId: "coastal-beach-mint", count: 1 }, { itemId: "dried-sugar-berries", count: 1 }],
    outputItemId: "food-coastal-spiced-cocoa",
    station: "Prep Counter & Teapot",
    season: "Winter",
  },
  {
    id: "dry-sugar-berries",
    name: "Dried Sugar Berries",
    description: "Dry coastal brambleberries beside the warm oven for winter baking and drinks.",
    cost: [{ itemId: "coastal-brambleberry", count: 2 }],
    outputItemId: "dried-sugar-berries",
    station: "Warm Drying Rack",
    season: "Year-round",
  },
  {
    id: "coconut-cream",
    name: "Coconut Cream",
    description: "Crack and settle a coconut in the Cool Pantry to separate its rich cream.",
    cost: [{ itemId: "coconut", count: 1 }],
    outputItemId: "coconut-cream",
    station: "Cool Pantry",
    season: "Year-round",
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
    station: "Hearth Stove",
    season: "Year-round",
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
    station: "Prep Counter & Teapot",
    season: "Year-round",
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
    station: "Heated Stone Slab",
    season: "Year-round",
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
    station: "Campfire Pit",
    season: "Year-round",
  },
  {
    id: "sea-lettuce-wrap",
    name: "Sea Lettuce Garden Wrap",
    description: "Fresh tide-pool sea lettuce folded with coconut cream and a pinch of soothing sea salt.",
    cost: [
      { itemId: "sea-lettuce", count: 1 },
      { itemId: "coconut-cream", count: 1 },
      { itemId: "soothing-sea-salt", count: 1 },
    ],
    outputItemId: "food-sea-lettuce-wrap",
    station: "Prep Counter",
    season: "Year-round",
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
    id: "beach-bag",
    name: "The Beach Bag",
    description: "Washed-up canvas cut into sturdy strips and stitched with hemp thread. Make extra bags to sell to Seaweed.",
    cost: [
      { itemId: "washed-up-canvas", count: 2 },
      { itemId: "hemp-thread", count: 1 },
    ],
  },
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
  {
    id: "shoreline-snow-globe",
    name: "Shoreline Snow Globe",
    description: "A tiny coastal scene sealed beneath clear sea glass, with sea glitter swirling through collected ocean water.",
    cost: [
      { itemId: "raw-driftwood-planks", count: 1 },
      { itemId: "glass-white", count: 2 },
      { itemId: "glitter", count: 1 },
      { itemId: "sea-water", count: 1 },
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
  {
    id: "star-wish",
    name: "Star Wish Bottle",
    description: "Pink, teal, and snow-white sand cradle a captured firefly glow inside a frosted bottle, ready to carry a gentle wish out to sea.",
    cost: [
      { itemId: "sand-pink", count: 1 },
      { itemId: "sand-teal", count: 1 },
      { itemId: "sand-snow-white", count: 1 },
      { itemId: "firefly-jar", count: 1 },
      { itemId: "empty-glass-bottle", count: 1 },
    ],
    outputItemId: "star-wish-bottle",
  },
  {
    id: "beach-bottle",
    name: "Beach in a Bottle",
    description: "Snow-white sand, a small shell, and sea-rose petals resting beneath a shimmer of collected ocean water.",
    cost: [
      { itemId: "sand-snow-white", count: 2 },
      { itemId: "shell-scallop", count: 1 },
      { itemId: "sea-rose-petal", count: 2 },
      { itemId: "sea-water", count: 1 },
      { itemId: "empty-glass-bottle", count: 1 },
    ],
    outputItemId: "beach-bottle",
  },
];
