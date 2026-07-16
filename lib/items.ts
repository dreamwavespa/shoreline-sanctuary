export type ItemCategory = "shell" | "glass" | "pearl" | "raw" | "trash" | "special";

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  icon: string; // hosted URL or emoji
  isEmoji?: boolean;
  rarity: "common" | "uncommon" | "rare";
  sfx: string; // key in SFX map
}

const ICON_BASE = "https://galaxy-prod.tlcdn.com/gen/user_32o6JOgK3frOagwPkyqjrJpmKC3";

export const ITEMS: Record<string, ItemDef> = {
  "shell-nautilus": { id: "shell-nautilus", name: "Nautilus Shell", category: "shell", icon: `${ICON_BASE}/604cb7e3-03ed-411d-97fa-2435e8340fc7.png`, rarity: "uncommon", sfx: "shell" },
  "shell-scallop": { id: "shell-scallop", name: "Scallop Shell", category: "shell", icon: `${ICON_BASE}/e93500d7-8dea-48fa-ad4b-f8bd6439708f.png`, rarity: "common", sfx: "shell" },
  "shell-conch": { id: "shell-conch", name: "Conch Shell", category: "shell", icon: `${ICON_BASE}/43715411-ab07-442e-ae82-563d96c4cc45.png`, rarity: "uncommon", sfx: "shell" },
  "shell-murex": { id: "shell-murex", name: "Murex Shell", category: "shell", icon: `${ICON_BASE}/2cab5259-19a6-4b08-a175-a8a7a2646ceb.png`, rarity: "uncommon", sfx: "shell" },
  "shell-sanddollar": { id: "shell-sanddollar", name: "Sand Dollar", category: "shell", icon: `${ICON_BASE}/12326b57-598d-4ff9-8ec7-407c080ebcf2.png`, rarity: "uncommon", sfx: "shell" },
  "shell-abalone": { id: "shell-abalone", name: "Abalone Shell", category: "shell", icon: `${ICON_BASE}/76cd3095-2306-4a8f-829e-1fbf9bb0a9c3.png`, rarity: "rare", sfx: "shell" },
  "shell-whelk": { id: "shell-whelk", name: "Whelk Shell", category: "shell", icon: `${ICON_BASE}/da1c27b7-a6e7-47de-aea3-ade498f4d32f.png`, rarity: "common", sfx: "shell" },
  "shell-cowrie": { id: "shell-cowrie", name: "Cowrie Shell", category: "shell", icon: `${ICON_BASE}/f876bd27-5332-4e32-b174-4ab56b519762.png`, rarity: "common", sfx: "shell" },
  "shell-clam": { id: "shell-clam", name: "Clam Shell", category: "shell", icon: `${ICON_BASE}/a8a74f62-b113-4ea5-a259-e9d8654703fd.png`, rarity: "common", sfx: "shell" },
  "glass-green": { id: "glass-green", name: "Green Sea Glass", category: "glass", icon: `${ICON_BASE}/b469048c-74c8-4265-b076-1f081c1ba385.png`, rarity: "common", sfx: "seaGlass" },
  "glass-white": { id: "glass-white", name: "White Sea Glass", category: "glass", icon: `${ICON_BASE}/6479472d-3bfb-4905-a536-d94b17b5e631.png`, rarity: "common", sfx: "seaGlass" },
  "glass-amber": { id: "glass-amber", name: "Amber Sea Glass", category: "glass", icon: `${ICON_BASE}/047ee23e-a777-4f76-a312-e408300cc882.png`, rarity: "uncommon", sfx: "seaGlass" },
  "glass-teal": { id: "glass-teal", name: "Teal Sea Glass", category: "glass", icon: `${ICON_BASE}/365c437b-d5b7-44c3-b331-7558435b3399.png`, rarity: "common", sfx: "seaGlass" },
  "glass-blue": { id: "glass-blue", name: "Blue Sea Glass", category: "glass", icon: `${ICON_BASE}/e7d71bb8-f182-4445-8b58-85c07a4bca7e.png`, rarity: "uncommon", sfx: "seaGlass" },
  "glass-pink": { id: "glass-pink", name: "Pink Sea Glass", category: "glass", icon: `${ICON_BASE}/fb533d3a-55e8-4605-b065-13cb622e0a81.png`, rarity: "uncommon", sfx: "seaGlass" },
  "glass-purple": { id: "glass-purple", name: "Purple Sea Glass", category: "glass", icon: `${ICON_BASE}/9ab8c913-a4cc-4cfc-add6-902eb0f92334.png`, rarity: "rare", sfx: "seaGlass" },
  "glass-red": { id: "glass-red", name: "Red Sea Glass", category: "glass", icon: `${ICON_BASE}/92b75a7e-aa9d-4f9f-81b7-fb10a4757fae.png`, rarity: "rare", sfx: "seaGlass" },
  "glass-rainbow": { id: "glass-rainbow", name: "Neon Sea Glass", category: "glass", icon: `${ICON_BASE}/605fd387-dc66-4d00-a7ff-4c5dc2a2a61a.png`, rarity: "rare", sfx: "seaGlass" },
  "pearl-silver": { id: "pearl-silver", name: "Silver Pearl", category: "pearl", icon: `${ICON_BASE}/15fd4c4e-8171-41fc-af4a-ffbccf85b4c3.png`, rarity: "rare", sfx: "pearl" },
  "pearl-pink": { id: "pearl-pink", name: "Pink Pearl", category: "pearl", icon: `${ICON_BASE}/f57a5872-f3e3-4d96-98b8-9f94c880333b.png`, rarity: "rare", sfx: "pearl" },
  "pearl-black": { id: "pearl-black", name: "Black Pearl", category: "pearl", icon: `${ICON_BASE}/1a48a630-bf7c-4308-98e3-ffe384577709.png`, rarity: "rare", sfx: "pearl" },
  "pearl-green": { id: "pearl-green", name: "Green Pearl", category: "pearl", icon: `${ICON_BASE}/7d9cd5d1-d5e6-40eb-b483-e3c49d6db93d.png`, rarity: "rare", sfx: "pearl" },
  "pearl-amber": { id: "pearl-amber", name: "Amber Pearl", category: "pearl", icon: `${ICON_BASE}/da3aff0c-ec75-41e1-a20f-c4f495ef888f.png`, rarity: "rare", sfx: "pearl" },
  "pearl-blue": { id: "pearl-blue", name: "Blue Pearl", category: "pearl", icon: `${ICON_BASE}/d799fd60-32fa-4c8c-a8ec-a2f60ab6c392.png`, rarity: "rare", sfx: "pearl" },
  "raw-driftwood-arch": { id: "raw-driftwood-arch", name: "Driftwood", category: "raw", icon: `${ICON_BASE}/0f39c941-3590-4858-9c41-36498d6a0a6c.png`, rarity: "common", sfx: "driftwood" },
  "raw-driftwood-planks": { id: "raw-driftwood-planks", name: "Weathered Plank", category: "raw", icon: `${ICON_BASE}/eb0500d4-6d90-40d7-9de5-97e94423a255.png`, rarity: "uncommon", sfx: "driftwood" },
  "raw-barnacle-wood": { id: "raw-barnacle-wood", name: "Barnacled Wood", category: "raw", icon: `${ICON_BASE}/2831f0ac-862c-4fb8-8036-0a7a74df36f6.png`, rarity: "uncommon", sfx: "driftwood" },
  "raw-stone": { id: "raw-stone", name: "Smooth Stone", category: "raw", icon: `${ICON_BASE}/a05a5d04-c254-4f79-9ed8-cbda421fdcd0.png`, rarity: "common", sfx: "driftwood" },
  "raw-pebbles": { id: "raw-pebbles", name: "Pebbles", category: "raw", icon: `${ICON_BASE}/33471acf-63cc-4452-958a-fc867d37b401.png`, rarity: "common", sfx: "driftwood" },
  "coconut": { id: "coconut", name: "Coconut", category: "raw", icon: "🥥", isEmoji: true, rarity: "common", sfx: "driftwood" },
  "trash-plastic": { id: "trash-plastic", name: "Plastic Debris", category: "trash", icon: "🗑️", isEmoji: true, rarity: "common", sfx: "plastic" },
  "trophy-map": { id: "trophy-map", name: "Old Nautical Map", category: "special", icon: "🗺️", isEmoji: true, rarity: "rare", sfx: "questComplete" },
  "trophy-compass": { id: "trophy-compass", name: "Brass Compass", category: "special", icon: "🧭", isEmoji: true, rarity: "rare", sfx: "questComplete" },
  "trophy-diving-gear": { id: "trophy-diving-gear", name: "Diving Gear", category: "special", icon: "🤿", isEmoji: true, rarity: "rare", sfx: "questComplete" },
  "trophy-nautilus": { id: "trophy-nautilus", name: "Golden Nautilus Shell", category: "special", icon: "🐚", isEmoji: true, rarity: "rare", sfx: "pearl" },
  "trophy-brass-dial": { id: "trophy-brass-dial", name: "Weathered Brass Dial", category: "special", icon: "🕰️", isEmoji: true, rarity: "rare", sfx: "questComplete" },
};

export const BEACH_SPAWN_POOL: { id: string; weight: number }[] = [
  { id: "shell-scallop", weight: 12 },
  { id: "shell-whelk", weight: 10 },
  { id: "shell-cowrie", weight: 10 },
  { id: "shell-clam", weight: 8 },
  { id: "shell-conch", weight: 6 },
  { id: "shell-nautilus", weight: 5 },
  { id: "shell-sanddollar", weight: 5 },
  { id: "shell-murex", weight: 4 },
  { id: "shell-abalone", weight: 2 },
  { id: "glass-green", weight: 10 },
  { id: "glass-white", weight: 9 },
  { id: "glass-teal", weight: 8 },
  { id: "glass-amber", weight: 6 },
  { id: "glass-blue", weight: 6 },
  { id: "glass-pink", weight: 5 },
  { id: "glass-purple", weight: 3 },
  { id: "glass-red", weight: 3 },
  { id: "glass-rainbow", weight: 1 },
  { id: "raw-driftwood-arch", weight: 8 },
  { id: "raw-driftwood-planks", weight: 5 },
  { id: "raw-barnacle-wood", weight: 5 },
  { id: "raw-stone", weight: 8 },
  { id: "raw-pebbles", weight: 8 },
  { id: "coconut", weight: 6 },
  { id: "trash-plastic", weight: 10 },
  { id: "pearl-silver", weight: 1 },
  { id: "pearl-pink", weight: 1 },
  { id: "pearl-blue", weight: 1 },
];

export const COVE_SPAWN_POOL: { id: string; weight: number }[] = [
  { id: "shell-sanddollar", weight: 12 },
  { id: "shell-abalone", weight: 8 },
  { id: "shell-nautilus", weight: 6 },
  { id: "glass-purple", weight: 10 },
  { id: "glass-red", weight: 8 },
  { id: "glass-rainbow", weight: 6 },
  { id: "glass-blue", weight: 8 },
  { id: "glass-pink", weight: 8 },
  { id: "pearl-silver", weight: 6 },
  { id: "pearl-pink", weight: 6 },
  { id: "pearl-black", weight: 5 },
  { id: "pearl-green", weight: 5 },
  { id: "pearl-amber", weight: 5 },
  { id: "pearl-blue", weight: 6 },
  { id: "raw-driftwood-planks", weight: 4 },
];

function rollFrom(pool: { id: string; weight: number }[]): string {
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const entry of pool) {
    if (r < entry.weight) return entry.id;
    r -= entry.weight;
  }
  return pool[0].id;
}

export function rollSpawn(): string {
  return rollFrom(BEACH_SPAWN_POOL);
}

export function rollCoveSpawn(): string {
  return rollFrom(COVE_SPAWN_POOL);
}
