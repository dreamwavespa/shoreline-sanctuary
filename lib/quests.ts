export interface QuestDef {
  id: string;
  title: string;
  from: string;
  letter: string;
  requires: { itemId: string; count: number }[];
  requiresCraft?: string;
  requiresFlag?: string;
  rewardItemId?: string;
  rewardCount?: number;
  rewardLabel: string;
  unlocksWorkshop?: boolean;
  phase: 1 | 2;
}

export const QUESTS: QuestDef[] = [
  {
    id: "botanist",
    title: "The Wandering Botanist",
    from: "A traveling botanist",
    letter: "Dear Beachkeeper, I am studying the flora of the outer islands, but my supply of soil-enriching materials has run low. I hear the coconuts on your beach are exceptionally nutrient-rich! If you could shake a few down and gather them, I would be eternally grateful.",
    requires: [{ itemId: "coconut", count: 3 }],
    rewardLabel: "Wild Hibiscus Seeds 🌺",
    phase: 1,
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
    phase: 1,
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
    phase: 1,
  },
  {
    id: "glassartisan",
    title: "The Glass Artisan",
    from: "A city mosaic designer",
    letter: "Greetings, Fellow Creator! I design mosaics in the city, but nothing compares to the smooth, frosty beauty of ocean-tumbled sea glass. I am looking for a few pieces of pale-green sea glass to finish my latest window. Could you search the tide line for me?",
    requires: [{ itemId: "glass-green", count: 4 }],
    rewardLabel: "Blueprints for crafting Melodic Wind Chimes",
    unlocksWorkshop: true,
    phase: 1,
  },
  {
    id: "marinebiologist",
    title: "The Marine Biologist",
    from: "A marine biologist studying the reef",
    letter: "Dear Sanctuary Caretaker, I am tracking a highly elusive species of fish called the Rainbow Seahorse. They love to hide near colorful, handmade structures. If you could build a small grotto out of your colorful sea glass, we might just spot one!",
    requires: [],
    requiresCraft: "fish-grotto",
    requiresFlag: "rowboatRepaired",
    rewardItemId: "trophy-nautilus",
    rewardCount: 1,
    rewardLabel: "A highly prized Golden Nautilus Shell",
    phase: 2,
  },
  {
    id: "stargazer",
    title: "The Star-Gazer",
    from: "A distant observatory watcher",
    letter: "To the One Looking Up, I watch the stars from a distant observatory. Sometimes, rare celestial dust falls into the ocean and washes ashore as glowing, neon-colored glass. If you find any of this 'glowing glass', please keep it safe — it holds the light of the stars.",
    requires: [{ itemId: "glass-rainbow", count: 3 }],
    requiresFlag: "rowboatRepaired",
    rewardItemId: "trophy-brass-dial",
    rewardCount: 1,
    rewardLabel: "A Weathered Brass Dial (a vintage shipwreck restoration part)",
    phase: 2,
  },
];
