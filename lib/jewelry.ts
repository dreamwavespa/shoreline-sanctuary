import { ITEMS } from "./items";

export type JewelryKind = "necklace" | "bracelet" | "earrings";

export const JEWELRY_KIND_DETAILS: Record<JewelryKind, { label: string; slots: number; foundationId: string; foundationLabel: string }> = {
  necklace: { label: "Necklace", slots: 6, foundationId: "hemp-thread", foundationLabel: "1 Hemp Thread" },
  bracelet: { label: "Bracelet", slots: 5, foundationId: "hemp-thread", foundationLabel: "1 Hemp Thread" },
  earrings: { label: "Earrings", slots: 4, foundationId: "copper-wire", foundationLabel: "1 Copper Wire" },
};

export const JEWELRY_MATERIAL_IDS = [
  "pearl-silver", "pearl-pink", "pearl-black", "pearl-green", "pearl-amber", "pearl-blue",
  "pearl-yellow", "pearl-purple", "pearl-orange", "pearl-rainbow", "pearl-gold", "pearl-glow-dark",
  "pearl-deepsea", "mother-of-pearl",
  "glass-green", "glass-white", "glass-amber", "glass-teal", "glass-blue", "glass-pink", "glass-purple", "glass-red", "glass-rainbow", "glass-aquamarine-glow",
  "shell-scallop", "shell-whelk", "shell-cowrie", "shell-clam", "shell-conch", "shell-abalone", "shell-nautilus", "shell-murex", "shell-opal-rare", "iridescent-shell",
  "raw-stone", "raw-pebbles", "moonstone", "moss-agate", "carnelian",
] as const;

export function materialValue(itemId: string): number {
  const item = ITEMS[itemId];
  if (!item) return 0;
  return item.rarity === "rare" ? 3 : item.rarity === "uncommon" ? 2 : 1;
}

export function isSymmetricalDesign(kind: JewelryKind, materials: string[]): boolean {
  if (kind === "earrings" && materials.length === 4) {
    return materials[0] === materials[2] && materials[1] === materials[3];
  }
  return materials.every((material, index) => material === materials[materials.length - 1 - index]);
}

export function calculateJewelryValue(kind: JewelryKind, materials: string[]): number {
  const base = kind === "bracelet" ? 3 : 4;
  const materialTotal = materials.reduce((sum, itemId) => sum + materialValue(itemId), 0);
  return base + materialTotal + (isSymmetricalDesign(kind, materials) ? 2 : 0);
}

export function defaultJewelryName(kind: JewelryKind, materials: string[]): string {
  const firstName = ITEMS[materials[0]]?.name.replace(/ Pearl| Sea Glass| Shell/, "") || "Shoreline";
  const label = JEWELRY_KIND_DETAILS[kind].label;
  return `${firstName} Tide ${label}`;
}
