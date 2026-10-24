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
  { id: "coconut-ice-cream", name: "Coconut Ice Cream", description: "Creamy tropical coconut ice cream.", cost: [{ itemId: "coconut-cream", count: 2 }, { itemId: "kitchen-crushed-ice", count: 1 }], outputItemId: "food-coconut-ice-cream", station: "Ice Cream", season: "Year-round" as const },
  { id: "strawberry-ice-cream", name: "Strawberry Ice Cream", description: "Sweet strawberry ice cream.", cost: [{ itemId: "strawberry", count: 1 }, { itemId: "coconut-cream", count: 1 }, { itemId: "kitchen-crushed-ice", count: 1 }], outputItemId: "food-strawberry-ice-cream", station: "Ice Cream", season: "Year-round" as const },
  { id: "pineapple-ice-cream", name: "Pineapple Ice Cream", description: "Sunny pineapple ice cream.", cost: [{ itemId: "pineapple", count: 1 }, { itemId: "coconut-cream", count: 1 }, { itemId: "kitchen-crushed-ice", count: 1 }], outputItemId: "food-pineapple-ice-cream", station: "Ice Cream", season: "Year-round" as const },
  { id: "chocolate-seashell-ice-cream", name: "Chocolate Seashell Ice Cream", description: "Rich chocolate seashell ice cream.", cost: [{ itemId: "chocolate-seashells", count: 1 }, { itemId: "coconut-cream", count: 1 }, { itemId: "kitchen-crushed-ice", count: 1 }], outputItemId: "food-chocolate-seashell-ice-cream", station: "Ice Cream", season: "Year-round" as const },
  { id: "garden-vegetable-salad", name: "Garden Vegetable Salad", description: "A fresh seaside salad served in a shell-decorated bowl.", cost: [{ itemId: "carrot", count: 1 }, { itemId: "cucumber", count: 1 }, { itemId: "tomato", count: 1 }], outputItemId: "food-garden-vegetable-salad", station: "Salad Bowls", season: "Year-round" as const },
  { id: "spring-herb-salad", name: "Spring Herb Salad", description: "A fresh seaside salad served in a shell-decorated bowl.", cost: [{ itemId: "sea-peas", count: 1 }, { itemId: "coastal-beach-mint", count: 1 }, { itemId: "sea-parsley", count: 1 }], outputItemId: "food-spring-herb-salad", station: "Salad Bowls", season: "Year-round" as const },
  { id: "rainbow-vegetable-salad", name: "Rainbow Vegetable Salad", description: "A fresh seaside salad served in a shell-decorated bowl.", cost: [{ itemId: "carrot", count: 1 }, { itemId: "broccoli", count: 1 }, { itemId: "tomato", count: 1 }], outputItemId: "food-rainbow-vegetable-salad", station: "Salad Bowls", season: "Year-round" as const },
  { id: "tropical-fruit-salad", name: "Tropical Fruit Salad", description: "A fresh seaside salad served in a shell-decorated bowl.", cost: [{ itemId: "pineapple", count: 1 }, { itemId: "mango", count: 1 }, { itemId: "coconut", count: 1 }], outputItemId: "food-tropical-fruit-salad", station: "Salad Bowls", season: "Year-round" as const },
  { id: "coastal-berry-salad", name: "Coastal Berry Salad", description: "A fresh seaside salad served in a shell-decorated bowl.", cost: [{ itemId: "strawberry", count: 1 }, { itemId: "blueberry", count: 1 }, { itemId: "coastal-brambleberry", count: 1 }], outputItemId: "food-coastal-berry-salad", station: "Salad Bowls", season: "Year-round" as const },
  { id: "spring-fruit-medley", name: "Spring Fruit Medley", description: "A fresh seaside salad served in a shell-decorated bowl.", cost: [{ itemId: "strawberry", count: 1 }, { itemId: "raspberry", count: 1 }, { itemId: "wild-beach-plum", count: 1 }], outputItemId: "food-spring-fruit-medley", station: "Salad Bowls", season: "Year-round" as const },
  { id: "seashell-chocolate-cocoa", name: "Seashell Chocolate Cocoa", description: "Silky coastal cocoa with chocolate seashells and vanilla.", cost: [{ itemId: "chocolate-seashells", count: 1 }, { itemId: "coconut-cream", count: 1 }, { itemId: "vanilla", count: 1 }], outputItemId: "food-seashell-chocolate-cocoa", station: "Hot Chocolate Mug", season: "Year-round" as const },
  { id: "toasted-marshmallow-hot-chocolate", name: "Toasted Marshmallow Hot Chocolate", description: "Rich cocoa topped with a golden campfire marshmallow.", cost: [{ itemId: "cocoa-powder", count: 1 }, { itemId: "coconut-cream", count: 1 }, { itemId: "food-campfire-marshmallow", count: 1 }], outputItemId: "food-toasted-marshmallow-hot-chocolate", station: "Hot Chocolate Mug", season: "Year-round" as const },
  { id: "iced-berry-drink", name: "Iced Berry Drink", description: "Fresh berries shaken with crushed ice.", cost: [{ itemId: "strawberry", count: 1 }, { itemId: "blueberry", count: 1 }, { itemId: "kitchen-crushed-ice", count: 1 }], outputItemId: "food-iced-berry-drink", station: "Chilled Drinks", season: "Year-round" as const },
  { id: "frozen-pineapple-drink", name: "Frozen Pineapple Drink", description: "Sweet pineapple blended into an icy island refreshment.", cost: [{ itemId: "pineapple", count: 1 }, { itemId: "coconut-cream", count: 1 }, { itemId: "kitchen-crushed-ice", count: 1 }], outputItemId: "food-frozen-pineapple-drink", station: "Chilled Drinks", season: "Year-round" as const },
  { id: "frosted-coconut-drink", name: "Frosted Coconut Drink", description: "Creamy coconut chilled with crushed ice.", cost: [{ itemId: "coconut-cream", count: 2 }, { itemId: "kitchen-crushed-ice", count: 1 }], outputItemId: "food-frosted-coconut-drink", station: "Chilled Drinks", season: "Year-round" as const },
  { id: "iced-mint-tea", name: "Iced Mint Tea", description: "Cooling mint tea served over crushed ice.", cost: [{ itemId: "coastal-beach-mint", count: 2 }, { itemId: "pure-water", count: 1 }, { itemId: "kitchen-crushed-ice", count: 1 }], outputItemId: "food-iced-mint-tea", station: "Chilled Drinks", season: "Year-round" as const },
  {
    id: "cadence-warm-rose-milk",
    name: "Cadence's Warm Rose Milk",
    description: "A gentle baby-sized bottle of coconut cream warmed with soft sea-rose petals until it turns blush pink.",
    cost: [{ itemId: "coconut-cream", count: 1 }, { itemId: "sea-rose-petal", count: 1 }],
    outputItemId: "food-cadence-warm-rose-milk",
    station: "Prep Counter & Teapot",
    season: "Year-round" as const,
  },
  {
    id: "cadence-sea-pea-puree",
    name: "Steamed Sea Pea Purée",
    description: "Fresh sea peas gently steamed and mashed smooth for Cadence with a splash of pure spring water.",
    cost: [{ itemId: "sea-peas", count: 2 }, { itemId: "pure-water", count: 1 }],
    outputItemId: "food-cadence-sea-pea-puree",
    station: "Hearth Stockpot",
    season: "Year-round" as const,
  },
  {
    id: "cadence-sun-berry-mash",
    name: "Sun-Berry Fruit Mash",
    description: "Wild beach plum and ripe coastal berries crushed into a glossy, naturally sweet fruit mash for Cadence.",
    cost: [{ itemId: "wild-beach-plum", count: 1 }, { itemId: "coastal-brambleberry", count: 2 }],
    outputItemId: "food-cadence-sun-berry-mash",
    station: "Prep Counter",
    season: "Year-round" as const,
  },
  {
    id: "cadence-teething-kelp-cookies",
    name: "Teething Kelp Cookies",
    description: "Tender little coastal cookies baked from flour, seaweed, and coconut cream, pulled early so they stay soft for tiny teeth.",
    cost: [{ itemId: "flour", count: 1 }, { itemId: "seaweed-fronds", count: 1 }, { itemId: "coconut-cream", count: 1 }],
    outputItemId: "food-cadence-teething-kelp-cookie",
    station: "Baking Oven",
    season: "Year-round" as const,
  },
  { id: "pumpkin-seeds", name: "Roasted Pumpkin Seeds", description: "Crunchy roasted pumpkin seeds with a touch of Shoreline sea salt.", cost: [{ itemId: "golden-island-pumpkin", count: 1 }, { itemId: "soothing-sea-salt", count: 1 }], outputItemId: "food-pumpkin-seeds", station: "Warm Drying Rack", season: "Year-round" as const },
  { id: "dried-fruit-medley", name: "Dried Fruit Medley", description: "A sweet medley of dried strawberries, raspberries, and bananas.", cost: [{ itemId: "strawberry", count: 1 }, { itemId: "raspberry", count: 1 }, { itemId: "banana", count: 1 }], outputItemId: "food-dried-fruit-medley", station: "Warm Drying Rack", season: "Year-round" as const },
];
