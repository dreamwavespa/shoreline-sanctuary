export interface ShopStockItem {
  itemId: string;
  price: number;
  note: string;
}

export interface SeaweedDiscovery extends ShopStockItem {
  title: string;
  story: string;
}

export const SHOP_STOCK: ShopStockItem[] = [
  { itemId: "food-beach-plum-jelly", price: 4, note: "A sweet shoreline favorite." },
  { itemId: "food-seaweed-chips", price: 3, note: "Crisp, salty, and packed by Seaweed." },
  { itemId: "soothing-sea-salt", price: 3, note: "Useful in the kitchen and workshop." },
  { itemId: "glass-blue", price: 6, note: "A polished cobalt piece from deeper water." },
  { itemId: "shell-abalone", price: 7, note: "An iridescent shell for crafting or gifting." },
  { itemId: "tarnished-compass", price: 10, note: "A small brass compass awaiting restoration." },
];

export const SELL_PRICES: Record<string, number> = {
  "raw-driftwood-arch": 1,
  "raw-driftwood-planks": 2,
  "raw-barnacle-wood": 2,
  "raw-stone": 1,
  "raw-pebbles": 1,
  "wild-beach-plum": 2,
  "seaweed-fronds": 1,
  "sea-lettuce": 2,
  "shell-scallop": 1,
  "shell-whelk": 2,
  "shell-cowrie": 2,
  "shell-clam": 1,
  "shell-conch": 3,
  "shell-abalone": 4,
  "glass-green": 2,
  "glass-white": 2,
  "glass-teal": 3,
  "glass-amber": 3,
  "glass-blue": 4,
  "glass-pink": 4,
  "glass-purple": 5,
  "food-beach-plum-jelly": 3,
  "food-seaweed-chips": 2,
  "food-sea-lettuce-wrap": 4,
  "bottle-sunset-shoreline": 5,
  "bottle-subaquatic-sandbar": 6,
};

export const SEAWEED_DISCOVERIES: SeaweedDiscovery[] = [
  {
    itemId: "moonstone",
    price: 12,
    title: "Moonlit Pocket Stone",
    note: "A silvery stone for Maeve or a special display.",
    story: "Seaweed found it beneath a ledge just as the morning tide turned.",
  },
  {
    itemId: "bioluminescent-shard",
    price: 14,
    title: "Deep-Water Glimmer",
    note: "A glowing shard recovered beyond the reef.",
    story: "It flashed blue inside a narrow rock hollow and lit Seaweed's whole dive bag.",
  },
  {
    itemId: "salvage-porcelain-cup",
    price: 13,
    title: "Blue Harbor Teacup",
    note: "Delicate old porcelain with a painted wave border.",
    story: "Seaweed spotted its blue pattern through a veil of swaying kelp.",
  },
  {
    itemId: "shell-opal-rare",
    price: 15,
    title: "Opal Tide Shell",
    note: "A rare shell that shines pink, blue, and pearl white.",
    story: "A gentle current rolled it right across Seaweed's paws at sunrise.",
  },
];

export function getTodaysDiscovery(date = new Date()): SeaweedDiscovery {
  const dateKey = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
  let hash = 0;
  for (const char of dateKey) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return SEAWEED_DISCOVERIES[hash % SEAWEED_DISCOVERIES.length];
}

export function getShopDateKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}
