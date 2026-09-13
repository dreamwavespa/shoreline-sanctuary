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
];

const SHELBY_BLUEPRINTS: TravelingMerchantListing[] = [
  { itemId: "blueprint-marine-biology-lab", price: 30, kind: "blueprint", note: "Future expansion plan for studying Shoreline's marine life." },
  { itemId: "blueprint-smoothie-bar", price: 26, kind: "blueprint", note: "Future expansion plan for a fresh island smoothie bar." },
  { itemId: "blueprint-cadence-nursery", price: 28, kind: "blueprint", note: "Future expansion plan for baby Cadence's cozy nursery." },
];

function localDayNumber(date: Date): number {
  return Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000);
}

function rotate<T>(items: T[], start: number, count: number): T[] {
  return Array.from({ length: Math.min(count, items.length) }, (_, index) => items[(start + index) % items.length]);
}

/** Shelldon brings a varied Sunday market; Shelby unloads one rare plan per docking. */
export function getTravelingMerchantStock(villagerId: string, date = new Date()): TravelingMerchantListing[] {
  const day = localDayNumber(date);
  if (villagerId === "shelldon") {
    const sunday = Math.floor(day / 7);
    return [
      ...rotate(SHELLDON_SEEDS, sunday % SHELLDON_SEEDS.length, 3),
      ...rotate(SHELLDON_FURNITURE, sunday % SHELLDON_FURNITURE.length, 2),
      ...rotate(SHELLDON_GOODS, sunday % SHELLDON_GOODS.length, 2),
    ];
  }
  if (villagerId === "shelby") {
    const docking = Math.floor(day / 4);
    return rotate(SHELBY_BLUEPRINTS, docking % SHELBY_BLUEPRINTS.length, 1);
  }
  return [];
}

