export interface TravelingMerchantListing {
  itemId: string;
  price: number;
  note: string;
  kind: "seed" | "furniture" | "item" | "blueprint";
}

const SHELLDON_SEEDS: TravelingMerchantListing[] = [
  { itemId: "seed-beach-rose", price: 4, kind: "seed", note: "A hardy pink rose that thrives beside the dunes." },
  { itemId: "seed-sea-holly", price: 5, kind: "seed", note: "Silvery-blue coastal flowers with striking foliage." },
  { itemId: "seed-seaside-daisy", price: 4, kind: "seed", note: "Cheerful daisies suited to salty sea air." },
  { itemId: "seed-coastal-sunflower", price: 5, kind: "seed", note: "Sunny blooms that brighten a shoreline garden." },
  { itemId: "seed-dune-evening-primrose", price: 6, kind: "seed", note: "Pale blossoms that open toward evening." },
  { itemId: "seed-saltmarsh-mallow", price: 6, kind: "seed", note: "Soft pink flowers for a sheltered wet garden." },
  { itemId: "seed-sea-morning-glory", price: 6, kind: "seed", note: "A trailing vine with delicate morning blooms." },
];

const SHELLDON_FURNITURE: TravelingMerchantListing[] = [
  { itemId: "furniture-beach-chair", price: 12, kind: "furniture", note: "A comfortable chair for quiet afternoons by the water." },
  { itemId: "furniture-bird-bath", price: 15, kind: "furniture", note: "A shallow stone basin for the sanctuary birds." },
  { itemId: "furniture-water-fountain", price: 18, kind: "furniture", note: "A gently trickling fountain for a peaceful garden." },
  { itemId: "furniture-clamshell-cat-bed", price: 20, kind: "furniture", note: "A soft clamshell-shaped bed made especially for Marshmallow." },
];

const SHELLDON_GOODS: TravelingMerchantListing[] = [
  { itemId: "binoculars", price: 10, kind: "item", note: "Useful for watching seabirds and distant ships." },
  { itemId: "flower-vase", price: 8, kind: "item", note: "A sea-glass-colored vase for fresh coastal flowers." },
  { itemId: "picnic-blanket", price: 11, kind: "item", note: "A soft striped blanket for shoreline picnics." },
  { itemId: "seaside-air-pump", price: 18, kind: "item", note: "A rare brass-and-teal pump that fills the sanctuary raft in one use and is never consumed." },
];

const SHELLDON_PANTRY_STAPLES: TravelingMerchantListing[] = [
  { itemId: "winter-spice-bark", price: 5, kind: "item", note: "A bundle of fragrant winter spice bark for gingerbread and cozy cocoa, available year-round at the Sunday market." },
  { itemId: "coffee-beans", price: 4, kind: "item", note: "Freshly roasted coffee beans for the Shoreline coffee recipes. Available at Sheldon’s Sunday market." },
  { itemId: "tea-bags", price: 2, kind: "item", note: "A small packet of tea bags for warming shoreline blends." },
  { itemId: "vanilla", price: 4, kind: "item", note: "Fragrant vanilla for cakes, cookies, and other baked treats." },
  { itemId: "cocoa-powder", price: 4, kind: "item", note: "Rich cocoa powder for chocolate baking and cozy drinks." },
  { itemId: "flour", price: 3, kind: "item", note: "A paper sack of flour for the cottage baking oven." },
  { itemId: "eggs", price: 3, kind: "item", note: "A small carton of fresh eggs for baking." },
];

const SHELBY_BLUEPRINTS: TravelingMerchantListing[] = [
  { itemId: "blueprint-marine-biology-lab", price: 30, kind: "blueprint", note: "Future expansion plan for studying Shoreline's marine life." },
  { itemId: "blueprint-smoothie-bar", price: 26, kind: "blueprint", note: "Future expansion plan for a fresh island smoothie bar." },
  { itemId: "blueprint-cadence-nursery", price: 28, kind: "blueprint", note: "Future expansion plan for baby Cadence's cozy nursery." },
];

/** The three original plans describe rooms that are already accessible in the current game.
 * Keep this registry explicit so future genuinely gated expansions can retain their plans. */
const ALREADY_ACCESSIBLE_AREAS = new Set([
  "blueprint-marine-biology-lab",
  "blueprint-smoothie-bar",
  "blueprint-cadence-nursery",
]);

export interface ShelbyProgress {
  blueprints: string[];
  notebookDiscovered: Record<string, boolean>;
  inventory: Record<string, number>;
}

const SHELBY_CARGO: TravelingMerchantListing[] = [
  { itemId: "pearl-silk-thread", price: 16, kind: "item", note: "Imported silk thread for delicate jewelry." },
  { itemId: "polished-driftwood", price: 10, kind: "item", note: "Beautifully smoothed wood from a distant beach." },
  { itemId: "colored-glass-pieces", price: 11, kind: "item", note: "Bright glass fragments for creative projects." },
  { itemId: "silver-jewelry-wire", price: 18, kind: "item", note: "Fine silver wire for special crafts." },
  { itemId: "imported-island-herb-seeds", price: 15, kind: "item", note: "A rare seed packet to save for a future garden expansion." },
  { itemId: "antique-captains-compass", price: 38, kind: "item", note: "A collectible navigational treasure from an old ship." },
  { itemId: "ship-in-a-bottle", price: 34, kind: "item", note: "A miniature sailing ship preserved in glass." },
  { itemId: "captains-coin", price: 29, kind: "item", note: "A rare commemorative coin from a trading captain." },

  { itemId: "hemp-thread", price: 5, kind: "item", note: "Sturdy thread for shoreline crafts." },
  { itemId: "copper-wire", price: 7, kind: "item", note: "Salvaged wire for jewelry and repairs." },
  { itemId: "raw-driftwood-planks", price: 8, kind: "item", note: "Weathered timber for repairs and special requests." },
  { itemId: "glass-rainbow", price: 14, kind: "item", note: "Rare multicolored sea glass from distant shores." },
  { itemId: "sea-lavender", price: 7, kind: "item", note: "Fragrant flowers for coastal recipes." },
  { itemId: "vanilla", price: 5, kind: "item", note: "Imported vanilla for the cottage kitchen." },
  { itemId: "star-sand", price: 18, kind: "item", note: "A sparkling ingredient for unusual crafts." },
  { itemId: "shell-nautilus", price: 13, kind: "item", note: "An uncommon spiral shell from the trading route." },
  { itemId: "pearl-blue", price: 17, kind: "item", note: "A luminous blue pearl for the collection." },
];

export function isShelbyBlueprintNeeded(itemId: string, progress?: ShelbyProgress): boolean {
  if (ALREADY_ACCESSIBLE_AREAS.has(itemId)) return false;
  if (!progress) return true;
  return !progress.blueprints.includes(itemId) &&
    !progress.notebookDiscovered[itemId] &&
    (progress.inventory[itemId] || 0) === 0;
}

function localDayNumber(date: Date): number {
  return Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000);
}

function rotate<T>(items: T[], start: number, count: number): T[] {
  return Array.from({ length: Math.min(count, items.length) }, (_, index) => items[(start + index) % items.length]);
}

/** Shelldon brings a Sunday market; Shelby rotates imported cargo and any still-needed plans. */
export function getTravelingMerchantStock(villagerId: string, date = new Date(), progress?: ShelbyProgress): TravelingMerchantListing[] {
  const day = localDayNumber(date);
  if (villagerId === "shelldon") {
    const sunday = Math.floor(day / 7);
    return [
      ...SHELLDON_PANTRY_STAPLES,
      ...rotate(SHELLDON_SEEDS, sunday % SHELLDON_SEEDS.length, 3),
      ...rotate(SHELLDON_FURNITURE, sunday % SHELLDON_FURNITURE.length, 2),
      ...rotate(SHELLDON_GOODS, sunday % SHELLDON_GOODS.length, 2),
    ];
  }
  if (villagerId === "shelby") {
    const docking = Math.floor(day / 4);
    const needed = SHELBY_BLUEPRINTS.filter((listing) => isShelbyBlueprintNeeded(listing.itemId, progress));
    // All still-needed plans are offered on every visit; the cargo slots rotate separately.
    const unique = new Set(["antique-captains-compass", "ship-in-a-bottle", "captains-coin"]);
    const eligibleCargo = SHELBY_CARGO.filter((listing) => !unique.has(listing.itemId) ||
      !progress || ((progress.inventory[listing.itemId] || 0) === 0 && !progress.notebookDiscovered[listing.itemId]));
    return [...needed, { itemId: "shelby-sealed-cargo", price: 24, kind: "item", note: "Open at Shelby’s counter for a mystery supply or rare treasure." }, ...rotate(eligibleCargo, docking % Math.max(eligibleCargo.length, 1), 4)];
  }
  return [];
}
