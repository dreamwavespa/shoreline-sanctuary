export type ArchieGift = { id: string; name: string; night: string; hidingPlace: number };

export const ARCHIE_STORAGE_KEY = "shoreline-archie-visits-v1";

export const ARCHIE_GIFTS = [
  { id: "shoreline-page", name: "Forgotten Shoreline Book Page", image: "/images/Hut/Archie-book-pages.png" },
  { id: "salt-grass-bookmark", name: "Pressed Salt-Grass Bookmark", image: "/images/Hut/Archie-bookmark.png" },
  { id: "midnight-candle", name: "Midnight Reading Candle", image: "/images/Hut/Archie-midnight-candle.png" },
  { id: "old-map-fragment", name: "Old Shoreline Map Fragment", image: "/images/Hut/Archie-map-fragment.png" },
] as const;
