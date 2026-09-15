import {
  KITCHEN_RECIPES as BASE_KITCHEN_RECIPES,
} from "./recipes-base";

export type { CookRecipe, CraftRecipe, SandArtRecipe } from "./recipes-base";
export {
  JEWELRY_RECIPES,
  DECOR_RECIPES,
  RAFT_RECIPE,
  SAND_ART_RECIPES,
} from "./recipes-base";

export const KITCHEN_RECIPES = [
  ...BASE_KITCHEN_RECIPES,
  {
    id: "cadence-warm-rose-milk",
    name: "Cadence's Warm Rose Milk",
    description: "A gentle baby-sized bottle of coconut cream warmed with soft sea-rose petals until it turns blush pink.",
    cost: [
      { itemId: "coconut-cream", count: 1 },
      { itemId: "sea-rose-petal", count: 1 },
    ],
    outputItemId: "food-cadence-warm-rose-milk",
    station: "Prep Counter & Teapot",
    season: "Year-round" as const,
  },
  {
    id: "cadence-sea-pea-puree",
    name: "Steamed Sea Pea Purée",
    description: "Fresh sea peas gently steamed and mashed smooth for Cadence with a splash of clean water.",
    cost: [
      { itemId: "sea-peas", count: 2 },
      { itemId: "sea-water", count: 1 },
    ],
    outputItemId: "food-cadence-sea-pea-puree",
    station: "Hearth Stockpot",
    season: "Year-round" as const,
  },
  {
    id: "cadence-sun-berry-mash",
    name: "Sun-Berry Fruit Mash",
    description: "Wild beach plum and ripe coastal berries crushed into a glossy, naturally sweet fruit mash for Cadence.",
    cost: [
      { itemId: "wild-beach-plum", count: 1 },
      { itemId: "coastal-brambleberry", count: 2 },
    ],
    outputItemId: "food-cadence-sun-berry-mash",
    station: "Prep Counter",
    season: "Year-round" as const,
  },
  {
    id: "cadence-teething-kelp-cookies",
    name: "Teething Kelp Cookies",
    description: "Tender little coastal cookies baked from flour, seaweed, and coconut cream, pulled early so they stay soft for tiny teeth.",
    cost: [
      { itemId: "flour", count: 1 },
      { itemId: "seaweed-fronds", count: 1 },
      { itemId: "coconut-cream", count: 1 },
    ],
    outputItemId: "food-cadence-teething-kelp-cookie",
    station: "Baking Oven",
    season: "Year-round" as const,
  },
];
