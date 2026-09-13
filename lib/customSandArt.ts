import { ITEMS } from "./items";

export const CUSTOM_SAND_IDS = [
  "sand-pink",
  "sand-teal",
  "sand-apricot",
  "sand-snow-white",
  "sand-pumpkin-orange",
  "sand-candy-corn-swirl",
] as const;

export const CUSTOM_SAND_ACCENT_IDS = [
  "shell-scallop", "shell-cowrie", "shell-whelk", "shell-clam",
  "pearl-pink", "pearl-white", "pearl-yellow", "pearl-purple", "pearl-orange",
  "glass-green", "glass-blue", "glass-purple", "glass-rainbow",
] as const;

export const BOO_SAND_IDS = ["sand-pumpkin-orange", "sand-candy-corn-swirl"] as const;

export function isBooOctober(date = new Date()): boolean {
  return date.getMonth() === 9;
}

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isMirroredSandDesign(layers: string[]): boolean {
  return layers.length === 5 && layers.every((layer, index) => layer === layers[4 - index]);
}

export function calculateSandBottleValue(layers: string[], accentId: string | null): number {
  const seasonalLayers = layers.filter((id) => (BOO_SAND_IDS as readonly string[]).includes(id)).length;
  const uniqueLayers = new Set(layers).size;
  const accent = accentId ? ITEMS[accentId] : null;
  const accentValue = accent ? (accent.rarity === "rare" ? 3 : accent.rarity === "uncommon" ? 2 : 1) : 0;
  return Math.min(16, 6 + Math.min(3, uniqueLayers - 1) + seasonalLayers + accentValue + (isMirroredSandDesign(layers) ? 2 : 0));
}

export function defaultSandBottleName(layers: string[]): string {
  const first = ITEMS[layers[0]]?.name.replace(/ Sand$/, "") || "Shoreline";
  return `${first} Tide Bottle`;
}
