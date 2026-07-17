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
