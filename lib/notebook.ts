// Sanctuary Explorer's Notebook — data module.
// Source: "Shoreline Sanctuary: Explorer's Notebook Design Blueprint" design doc.
//
// The notebook is a warm, tactile scrapbook journal that tracks the player's
// discoveries across four sections. Two kinds of entries are tracked:
//   - "item"    — an item id (see lib/items.ts). Marked discovered the first
//                 time the player ever holds one in their inventory.
//   - "villager" — a villager id (see lib/villagers.ts). Marked discovered
//                 the first time the player gifts that villager (reusing
//                 lib/store.tsx's existing villagerGiftCounts tracking).

export type NotebookEntryKind = "item" | "villager";

export interface NotebookEntry {
  id: string;
  kind: NotebookEntryKind;
  /** Handwritten-log flavor text shown in the right-hand column. */
  note: string;
}

export interface NotebookSection {
  id: string;
  title: string;
  /** Villager id whose portrait anchors the top-right of the page. */
  anchorVillagerId: string;
  entries: NotebookEntry[];
  completionReward: string;
}

export const NOTEBOOK_SECTIONS: NotebookSection[] = [
  {
    id: "gems-restorations",
    title: "Gems & Restorations",
    anchorVillagerId: "kaiana",
    completionReward: "Crystal Display Case (Furniture Item)",
    entries: [
      { id: "moonstone", kind: "item", note: "Washes ashore glowing faintly under a full moon." },
      { id: "carnelian", kind: "item", note: "Found after a Star Wish returns — warm glow, energy for the cottage." },
      { id: "moss-agate", kind: "item", note: "Near Kai the Clam in the Tide Pools. Green fern-like veins inside clear stone." },
      { id: "tarnished-compass", kind: "item", note: "Pulled from the old shipwreck, waiting to be restored." },
      { id: "locket", kind: "item", note: "An antique locket, salt-worn but still hinged." },
      { id: "trophy-compass", kind: "item", note: "From the locked chest on the Hidden Beach." },
      { id: "display-mariners-compass", kind: "item", note: "Secluded Cove, from a rusty chest. Carefully repaired by Kaiana — still points home." },
      { id: "firefly-jar", kind: "item", note: "A glowing lantern, hand-caught at dusk." },
    ],
  },
  {
    id: "wildlife-sightings",
    title: "Wildlife & Sightings",
    anchorVillagerId: "penelope",
    completionReward: "Golden Feather (Crafts Special Wish Bottle)",
    entries: [
      { id: "sandy", kind: "villager", note: "Sandy the Sandpiper — scurries the intertidal zone after every storm." },
      { id: "kai", kind: "villager", note: "Kai the Clam — hides beneath wet sand with a gentle pfft-squirt." },
      { id: "sunny", kind: "villager", note: "Sunny the Starfish — lounges on the Tide Pool stones." },
      { id: "coral", kind: "villager", note: "Coral the Seahorse — tends the Underwater Village gardens." },
      { id: "mina", kind: "villager", note: "Mina the Manatee — bakes in her kelp kitchen." },
      { id: "bubbles", kind: "villager", note: "Bubbles the Dolphin — delivers Message Bottles and mystery gifts." },
      { id: "pearl", kind: "villager", note: "Pearl the Oyster — formed slowly over days of friendship." },
      { id: "splash", kind: "villager", note: "Splash the Seal — tells whimsical fishing tales." },
      { id: "shelldon", kind: "villager", note: "Shelldon the Giant Sea Turtle — visits on \"Shelldon Sundays.\"" },
      { id: "shelby", kind: "villager", note: "Shelby the Crab Captain — arrives with the trading ship." },
      { id: "misty", kind: "villager", note: "Misty the Moon Jellyfish — only seen on full moon nights." },
      { id: "angel", kind: "villager", note: "Angel the Angelfish — returns Star Wish Bottles from the sea." },
    ],
  },
  {
    id: "beachcombing-shells",
    title: "Beachcombing & Shells",
    anchorVillagerId: "sunny",
    completionReward: "Pastel Shell Paint Patterns",
    entries: [
      { id: "shell-scallop", kind: "item", note: "Common along the tideline, ridged like a fan." },
      { id: "shell-whelk", kind: "item", note: "Smooth and spiraled — hermit crabs love these." },
      { id: "shell-cowrie", kind: "item", note: "Glossy and small, warm to the touch." },
      { id: "shell-clam", kind: "item", note: "Paired halves, often found still hinged." },
      { id: "shell-conch", kind: "item", note: "Hold it to your ear — you'll swear you hear the tide." },
      { id: "shell-murex", kind: "item", note: "Spiky and dramatic, a diver's favorite find." },
      { id: "shell-sanddollar", kind: "item", note: "Bleached pale by the sun and surf." },
      { id: "shell-abalone", kind: "item", note: "Iridescent on the inside — rare and treasured." },
      { id: "iridescent-shell", kind: "item", note: "Catches the light like a tiny rainbow." },
      { id: "shell-opal-rare", kind: "item", note: "Kai's secret burrow trade — vanishingly rare." },
      { id: "glass-white", kind: "item", note: "Frosted sea glass swatch — Melody's favorite." },
      { id: "glass-teal", kind: "item", note: "Deep ocean teal, polished smooth by the surf." },
      { id: "glass-rainbow", kind: "item", note: "Neon-bright — said to hold the light of falling stars." },
    ],
  },
  {
    id: "cottage-chronicle",
    title: "Cottage Chronicle",
    anchorVillagerId: "melody",
    completionReward: "Unlocks the full 4-part Island Melody track",
    entries: [
      { id: "melody", kind: "villager", note: "Stage 1 — Melody's Sunlit Jewelry Parlor welcomes you home." },
      { id: "coralie", kind: "villager", note: "Stage 2 — Coralie's Bioluminescent Grotto blooms below." },
      { id: "marella", kind: "villager", note: "Stage 3 — Marella's Celestial Observatory opens above." },
      { id: "kaiana", kind: "villager", note: "Stage 4 — Kaiana's Antique Restoration Studio, tucked in the attic." },
    ],
  },
];
