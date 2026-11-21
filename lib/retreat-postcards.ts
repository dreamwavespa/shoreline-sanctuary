export const RETREAT_POSTCARDS = {
  "a-seat-by-the-sea": {
    title: "A Seat by the Sea",
    hint: "Have a welcome drink at the Shore Lounge.",
    alt: "A berry smoothie on a wicker table beside a chair, with wisteria and turquoise sea beyond.",
  },
  "shells-in-the-sand": {
    title: "Shells in the Sand",
    hint: "Save a seashell pattern with at least one shell.",
    alt: "A spiral of colorful seashells on the sand at sunset.",
  },
  "jasmine-at-sea-glass-spa": {
    title: "Jasmine at Sea Glass Spa",
    hint: "Take home a crystal bowl from Sea Glass Spa.",
    alt: "Jasmine, a white poodle with a lavender bow, rests beside the soaking basin and a bowl of crystals.",
  },
  "the-moonlight-crossing": {
    title: "The Moonlight Crossing",
    hint: "Sail back to the Cove from the retreat after dark.",
    alt: "A lantern-lit boat leaves the island pier under a full moon.",
  },
};

const CARD_DIRECTORY = "/images/retreat/postcards";

export const POSTCARD_RECIPIENTS = {
  shelby: { name: "Shelby", reply: "Your card caught up with me while I was sorting cargo aboard. I tucked it by the cabin window for the next crossing." },
  shelddon: { name: "Shelldon", reply: "Your postcard found me at my next harbor. I slipped it into my traveling journal beside a pressed leaf." },
  seaweed: { name: "Seaweed", reply: "I found your postcard waiting at the pier counter. It has a spot beside the tide chart where I can see it between sailings." },
};

export type RetreatPostcardId = keyof typeof RETREAT_POSTCARDS;
export type PostcardRecipient = keyof typeof POSTCARD_RECIPIENTS;
export type RetreatPostcards = Partial<Record<RetreatPostcardId, PostcardRecipient[]>>;

export const RETREAT_POSTCARD_IDS = Object.keys(RETREAT_POSTCARDS) as RetreatPostcardId[];
export const POSTCARD_RECIPIENT_IDS = Object.keys(POSTCARD_RECIPIENTS) as PostcardRecipient[];
export const RETREAT_PATTERN_SHELLS = ["shell-scallop", "shell-conch", "shell-cowrie"];
export const RETREAT_SHELL_PATTERN_KEY = "shoreline-island-retreat-shell-pattern";

export function postcardImage(id: RetreatPostcardId) {
  return `${CARD_DIRECTORY}/${id}.webp`;
}

export function readRetreatPostcards(raw: unknown): RetreatPostcards {
  const collection: RetreatPostcards = {};
  if (!raw || typeof raw !== "object") return collection;
  for (const id of RETREAT_POSTCARD_IDS) {
    const sent = (raw as Record<string, unknown>)[id];
    if (Array.isArray(sent)) collection[id] = POSTCARD_RECIPIENT_IDS.filter(recipient => sent.includes(recipient));
  }
  return collection;
}

export function readRetreatShellPattern(storage: Storage): unknown {
  try { return JSON.parse(storage.getItem(RETREAT_SHELL_PATTERN_KEY) ?? "null"); }
  catch { return null; }
}
