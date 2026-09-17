import { ITEMS, SANDBAR_SPAWN_POOL } from "./items";

/**
 * Coastal Clay is the everyday pottery clay in Shoreline. It is found on the
 * Shifting Sandbars, while Kaiana's White Porcelain Clay remains a friendship
 * reward for advanced pottery.
 */
export const COASTAL_CLAY_ID = "coastal-clay";

if (!ITEMS[COASTAL_CLAY_ID]) {
  ITEMS[COASTAL_CLAY_ID] = {
    id: COASTAL_CLAY_ID,
    name: "Coastal Clay",
    category: "raw",
    icon: "🟤",
    isEmoji: true,
    rarity: "uncommon",
    sfx: "stone",
    artDescription: "A smooth damp lump of natural tan-gray coastal clay gathered near the Sandbar waterline, ready to be shaped into pottery.",
  };
}

// Keep it somewhat uncommon: available year-round, but not on every Sandbar visit.
if (!SANDBAR_SPAWN_POOL.some((entry) => entry.id === COASTAL_CLAY_ID)) {
  SANDBAR_SPAWN_POOL.push({ id: COASTAL_CLAY_ID, weight: 6 });
}
