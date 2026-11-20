export const SPA_RECIPES = [
  {
    id: "spa-coconut-cream-lotion",
    description: "A soft coconut lotion to smooth on after a warm soak.",
    cost: [{ itemId: "coconut-cream", count: 2 }, { itemId: "beeswax-jar", count: 1 }],
    useLabel: "Apply Coconut Cream Lotion",
    useMessage: "You smooth on the coconut cream lotion after your soak.",
    sound: "craftSuccess",
  },
  {
    id: "spa-watermelon-sugar-scrub",
    description: "A pink watermelon scrub with a little crunch from island sugar cane.",
    cost: [{ itemId: "watermelon", count: 1 }, { itemId: "coconut-cream", count: 1 }, { itemId: "sweet-island-cane", count: 1 }],
    useLabel: "Use Watermelon Sugar Scrub",
    useMessage: "You rinse the watermelon sugar scrub away with warm water.",
    sound: "oceanWaterSplash",
  },
  {
    id: "spa-citrus-lotion",
    description: "A coconut cream lotion scented with lemongrass, lemon, and orange.",
    cost: [{ itemId: "coconut-cream", count: 1 }, { itemId: "wild-lemongrass", count: 1 }, { itemId: "lemon", count: 1 }, { itemId: "orange", count: 1 }],
    useLabel: "Apply Citrus Lotion",
    useMessage: "You smooth on the citrus lotion. Its scent is bright with lemon and orange.",
    sound: "craftSuccess",
  },
  {
    id: "spa-coconut-seashell-soap",
    description: "A shell-shaped bar folded with sea rose petals for a soft pink lather.",
    cost: [{ itemId: "coconut-cream", count: 1 }, { itemId: "beeswax-jar", count: 1 }, { itemId: "sea-rose-petal", count: 2 }],
    useLabel: "Lather Coconut Seashell Soap",
    useMessage: "You lather the seashell soap onto the warm sea sponge. Soap bubbles float across the basin.",
    sound: "oceanWaterSplash",
  },
  {
    id: "spa-vanilla-flower-candle",
    description: "A beeswax candle scented with vanilla, rosemary, sea lavender, and sea rose.",
    cost: [
      { itemId: "beeswax-jar", count: 1 }, { itemId: "rosemary", count: 1 },
      { itemId: "sea-lavender", count: 1 }, { itemId: "sea-rose-petal", count: 2 },
      { itemId: "vanilla", count: 1 },
    ],
  },
] as const;

export type SpaTreatmentId = Extract<(typeof SPA_RECIPES)[number], { useLabel: string }>["id"];
