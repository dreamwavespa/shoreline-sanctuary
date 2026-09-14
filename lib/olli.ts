export type OlliHidingLocation = "beach" | "workshop" | "cove" | "reef" | "ship" | "sandbars" | "cottage" | "grove";

export interface OlliHidingPlace {
  screen: OlliHidingLocation;
  firstClue: string;
  secondClue: string;
  finalClue: string;
  searchLabel: string;
  visualPosition: string;
}

export const OLLI_HIDING_PLACES: Record<OlliHidingLocation, OlliHidingPlace> = {
  beach: {
    screen: "beach",
    firstClue: "Olli can hear waves sliding over warm sand.",
    secondClue: "He is close to driftwood and the waterline.",
    finalClue: "Search behind the driftwood on the main Beach.",
    searchLabel: "Something behind the beach driftwood is shimmering strangely. Search there.",
    visualPosition: "left-[16%] top-[28%]",
  },
  workshop: {
    screen: "workshop",
    firstClue: "Olli smells paint, salt, and freshly cut wood.",
    secondClue: "Tiny suction-cup marks cross a busy worktable.",
    finalClue: "Search beside the paint jars in the Workshop.",
    searchLabel: "A paint jar seems to have eight little arms. Search beside it.",
    visualPosition: "right-[14%] top-[24%]",
  },
  cove: {
    screen: "cove",
    firstClue: "Olli is somewhere quiet, sheltered, and full of unusual treasures.",
    secondClue: "He can hear a rowboat knocking gently against rock.",
    finalClue: "Search inside the colorful rock hollow at the Hidden Cove.",
    searchLabel: "The colorful rock hollow blinks. Search inside it.",
    visualPosition: "left-[22%] top-[34%]",
  },
  reef: {
    screen: "reef",
    firstClue: "Olli is somewhere cool, colorful, and beneath the surface.",
    secondClue: "He is matching his skin to living coral.",
    finalClue: "Search among the coral in the Reef.",
    searchLabel: "One piece of coral is breathing. Search the shimmering coral.",
    visualPosition: "right-[20%] top-[36%]",
  },
  ship: {
    screen: "ship",
    firstClue: "Olli hears music, laughter, and boards creaking beneath him.",
    secondClue: "A coiled rope on the party deck has too many loops.",
    finalClue: "Search beside the rope on the Community Ship.",
    searchLabel: "The coil of rope wiggles like tentacles. Search beside it.",
    visualPosition: "right-[18%] top-[31%]",
  },
  sandbars: {
    screen: "sandbars",
    firstClue: "Olli is surrounded by shifting sand and shallow water.",
    secondClue: "He is admiring a newly built castle.",
    finalClue: "Search near the Sandcastle Gallery on the Sandbars.",
    searchLabel: "A sandcastle has two curious eyes. Search beside it.",
    visualPosition: "left-[24%] top-[42%]",
  },
  cottage: {
    screen: "cottage",
    firstClue: "Olli is somewhere cozy, with treasures displayed indoors.",
    secondClue: "He has disguised himself as a colorful decoration.",
    finalClue: "Search among the decorations in the Sea Glass Cottage.",
    searchLabel: "A cottage decoration quietly changes color. Search behind it.",
    visualPosition: "right-[16%] top-[29%]",
  },
  grove: {
    screen: "grove",
    firstClue: "Olli can hear leaves rustling above a sandy path.",
    secondClue: "He is hiding where fruit and flowers grow near the sea.",
    finalClue: "Search beneath the broad leaves in the Coconut Grove.",
    searchLabel: "A broad green leaf has suction cups underneath. Search there.",
    visualPosition: "left-[18%] top-[33%]",
  },
};

export const OLLI_INK_IDS = [
  "ink-midnight-blue",
  "ink-seaglass-teal",
  "ink-coral-pink",
  "ink-seaweed-green",
  "ink-pearl-shimmer",
] as const;

export const OLLI_ART_BACKGROUNDS = ["Sunset Shore", "Moonlit Water", "Sea Glass Paper", "Sandy Cove"] as const;
export const OLLI_ART_STAMPS = ["Shell", "Fish", "Wave", "Paw Print", "Tentacles", "Flower", "Star", "Marshmallow Silhouette"] as const;
export const OLLI_ART_PATTERNS = ["Gentle Swirls", "Bubble Dots", "Rolling Waves", "Suction-Cup Rings"] as const;

export function getOlliInkReward(completedHunts: number, date = new Date()): string {
  const october = date.getMonth() === 9;
  const pool = october ? [...OLLI_INK_IDS, "ink-pumpkin-orange"] : [...OLLI_INK_IDS];
  return pool[completedHunts % pool.length];
}

export function getOlliClue(location: OlliHidingLocation, stage: number): string {
  const place = OLLI_HIDING_PLACES[location];
  return stage <= 0 ? place.firstClue : stage === 1 ? place.secondClue : place.finalClue;
}
