export interface FoundBottleMessage {
  id: string;
  text: string;
}

export const FOUND_BOTTLE_MESSAGES: FoundBottleMessage[] = [
  { id: "silver-road", text: "The moon makes a silver road across the water. I hope it leads you somewhere kind." },
  { id: "crystal-bells", text: "If you hear bells beneath the waves, the crystal cave may be closer than it seems." },
  { id: "sea-rose-bees", text: "I planted sea roses above the high-tide line. Please leave one for the bees." },
  { id: "dune-library", text: "A quiet library once stood where the dunes meet the cliffs." },
  { id: "missing-bookmark", text: "The little white lighthouse cat stole my bookmark again." },
  { id: "seaweeds-glass", text: "Seaweed always gives a fair price, but she keeps the prettiest glass for herself." },
  { id: "beach-hut", text: "Somewhere beyond the sandbars is a sheltered place just right for a beach hut." },
  { id: "shopping-list", text: "Tea, lemons, thread, and something special for Marshmallow." },
  { id: "island-drawing", text: "A child drew the island here, with a careful heart around the lighthouse." },
  { id: "hidden-sanctuary", text: "The sanctuary is not marked on maps. It appears when someone needs it." },
];

export const FOUND_BOTTLE_BONUSES = [
  "sea-rose-petal",
  "sea-rose-petal",
  "glitter",
  "shell-scallop",
  "old-coin",
  "old-coin",
  "pearl-silver",
  "star-sand",
];
