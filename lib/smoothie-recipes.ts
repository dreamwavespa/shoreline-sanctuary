export type SmoothieRecipe = {
  id: string;
  name: string;
  icon: string;
  description: string;
  ingredients: { itemId: string; count: number }[];
};

export const SMOOTHIE_RECIPES: SmoothieRecipe[] = [
  {
    id: "strawberry-banana",
    name: "Strawberry Banana Smoothie",
    icon: "🍓🍌",
    description: "A creamy island favorite made with sweet strawberries and banana.",
    ingredients: [
      { itemId: "strawberry", count: 2 },
      { itemId: "banana", count: 1 },
    ],
  },
  {
    id: "tropical-pineapple",
    name: "Tropical Pineapple Smoothie",
    icon: "🍍🥥",
    description: "Bright pineapple blended with sweet green coconut from the grove.",
    ingredients: [
      { itemId: "pineapple", count: 1 },
      { itemId: "sweet-green-coconut", count: 1 },
    ],
  },
  {
    id: "mixed-berry",
    name: "Mixed Berry Smoothie",
    icon: "🍓🫐",
    description: "A colorful blend of strawberry, blueberry, and raspberry.",
    ingredients: [
      { itemId: "strawberry", count: 1 },
      { itemId: "blueberry", count: 1 },
      { itemId: "raspberry", count: 1 },
    ],
  },
  {
    id: "coastal-berry-mint",
    name: "Coastal Berry Mint Smoothie",
    icon: "🫐🌿",
    description: "Blueberries and raspberries with a refreshing sprig of coastal beach mint.",
    ingredients: [
      { itemId: "blueberry", count: 1 },
      { itemId: "raspberry", count: 1 },
      { itemId: "coastal-beach-mint", count: 1 },
    ],
  },
];
