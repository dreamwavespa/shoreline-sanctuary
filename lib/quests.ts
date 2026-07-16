export interface QuestDef {
  id: string;
  title: string;
  from: string;
  letter: string;
  requires: { itemId: string; count: number }[];
  rewardItemId?: string;
  rewardCount?: number;
  rewardLabel: string;
  unlocksWorkshop?: boolean;
}

export const QUESTS: QuestDef[] = [
  {
    id: "botanist",
    title: "The Wandering Botanist",
    from: "A traveling botanist",
    letter: "Dear Beachkeeper, I am studying the flora of the outer islands, but my supply of soil-enriching materials has run low. I hear the coconuts on your beach are exceptionally nutrient-rich! If you could shake a few down and gather them, I would be eternally grateful.",
    requires: [{ itemId: "coconut", count: 3 }],
    rewardLabel: "Wild Hibiscus Seeds 🌺",
  },
  {
    id: "shellseeker",
    title: "A Cozy Shell-Seeker",
    from: "Barnaby the hermit crab",
    letter: "Hello Friend, I am a little hermit crab named Barnaby writing from a windy sandbar nearby. My current shell is getting dreadfully tight! If you find a smooth, spiraled whelk shell on your shore, could you set it aside for me?",
    requires: [{ itemId: "shell-whelk", count: 1 }],
    rewardItemId: "pearl-pink",
    rewardCount: 1,
    rewardLabel: "A sparkling Pink Pearl",
  },
  {
    id: "harbormaster",
    title: "The Harbor Master",
    from: "The Harbor Master",
    letter: "To the Shoreline Sanctuary, our shipping lanes are getting cluttered with floating debris. If you could help me recycle some of the plastic clutter clogging up your shoreline, it would help the whole bay breathe a little easier.",
    requires: [{ itemId: "trash-plastic", count: 5 }],
    rewardItemId: "raw-driftwood-planks",
    rewardCount: 1,
    rewardLabel: "A Weathered Boat Plank (keep this rare salvage for later)",
  },
  {
    id: "glassartisan",
    title: "The Glass Artisan",
    from: "A city mosaic designer",
    letter: "Greetings, Fellow Creator! I design mosaics in the city, but nothing compares to the smooth, frosty beauty of ocean-tumbled sea glass. I am looking for a few pieces of pale-green sea glass to finish my latest window. Could you search the tide line for me?",
    requires: [{ itemId: "glass-green", count: 4 }],
    rewardLabel: "Blueprints for crafting Melodic Wind Chimes",
    unlocksWorkshop: true,
  },
];
