export const CRYSTAL_BOWL_ITEM = "sea-glass-spa-crystal-bowl";

export const BOWL_STYLES = {
  ivory: { name: "Ivory", rim: "#f8ebd4", glaze: "#d6ad83" },
  seafoam: { name: "Seafoam", rim: "#d4f7e9", glaze: "#559993" },
  lavender: { name: "Lavender", rim: "#f0dff9", glaze: "#9479ae" },
};

export const BOWL_CRYSTALS = {
  "tumbled-stone-clear-quartz": 659.25,
  "tumbled-stone-ocean-jasper": 523.25,
  "tumbled-stone-amethyst": 783.99,
  "tumbled-stone-moonstone": 880,
  "tumbled-stone-rainbow-fluorite": 987.77,
  "cave-calcite": 587.33,
  "rough-enhydro": 622.25,
  "included-quartz": 698.46,
  "glowing-fluorite": 1046.50,
  "polished-enhydro": 739.99,
};

export type BowlStyle = keyof typeof BOWL_STYLES;
export type BowlCrystal = keyof typeof BOWL_CRYSTALS;
export type CrystalBowl = {
  style: BowlStyle;
  slots: (BowlCrystal | null)[];
};

export const BOWL_POSITIONS = ["Left", "Center", "Right"];
export const CRYSTAL_IDS = Object.keys(BOWL_CRYSTALS) as BowlCrystal[];

export function readCrystalBowl(value: unknown): CrystalBowl | null {
  if (!value || typeof value !== "object" || !("style" in value) || !("slots" in value)) return null;
  const { style, slots } = value;
  if (typeof style !== "string" || !Object.hasOwn(BOWL_STYLES, style) || !Array.isArray(slots) ||
      slots.length !== BOWL_POSITIONS.length || !slots.some(Boolean) ||
      !slots.every(id => id === null || (typeof id === "string" && Object.hasOwn(BOWL_CRYSTALS, id)))) return null;
  return { style: style as BowlStyle, slots: [...slots] };
}
