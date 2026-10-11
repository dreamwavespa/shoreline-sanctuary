// Shelby's shipping manifest — first test order.
// Only IDs already present in lib/items.ts may be used.
export interface ShippingRequirement { itemId: string; count: number }
export interface ShippingOrder {
  id: string;
  title: string;
  description: string;
  requires: ShippingRequirement[];
  rewardItemId: string;
  rewardCount: number;
  sandDollars: number;
}
export const SHELBY_SHIPPING_ORDERS: ShippingOrder[] = [
  {
    id: "island-market",
    title: "Island Market Supplies",
    description: "Pack everyday Shoreline finds for a neighboring island market.",
    rewardItemId: "glass-blue", rewardCount: 2, sandDollars: 5,
    requires: [
      { itemId: "coconut", count: 3 },
      { itemId: "shell-scallop", count: 2 },
      { itemId: "seaweed-fronds", count: 2 },
    ],
  },
  { id: "craft-supplies", title: "Seaside Craft Supplies", description: "Send colorful materials to a coastal workshop.", rewardItemId: "glass-green", rewardCount: 2, sandDollars: 6,
    requires: [{ itemId: "glass-blue", count: 2 }, { itemId: "shell-clam", count: 2 }, { itemId: "driftwood", count: 2 }] },
  { id: "tropical-produce", title: "Tropical Produce Delivery", description: "Stock a neighboring island's fruit stand.", rewardItemId: "glass-blue", rewardCount: 3, sandDollars: 7,
    requires: [{ itemId: "banana", count: 2 }, { itemId: "coconut", count: 3 }] },
  { id: "ocean-research", title: "Ocean Research Supplies", description: "Deliver samples to an island marine research team.", rewardItemId: "glass-green", rewardCount: 3, sandDollars: 8,
    requires: [{ itemId: "seaweed-fronds", count: 3 }, { itemId: "shell-scallop", count: 2 }, { itemId: "shell-clam", count: 1 }] },
  { id: "special-cargo", title: "Special Cargo", description: "A larger assortment for Shelby's distant trade route.", rewardItemId: "glass-blue", rewardCount: 4, sandDollars: 12,
    requires: [{ itemId: "shell-conch", count: 1 }, { itemId: "glass-green", count: 2 }, { itemId: "coconut", count: 2 }] },
];
export function currentShelbyOrder(shipmentCount: number): ShippingOrder {
  return SHELBY_SHIPPING_ORDERS[Math.max(0, shipmentCount || 0) % SHELBY_SHIPPING_ORDERS.length];
}
export function remainingToPack(
  order: ShippingOrder,
  packed: Record<string, number>
): ShippingRequirement[] {
  return order.requires.map(({ itemId, count }) => ({
    itemId,
    count: Math.max(0, count - (packed[itemId] || 0)),
  }));
}
export function isPackageComplete(order: ShippingOrder, packed: Record<string, number>): boolean {
  return remainingToPack(order, packed).every(({ count }) => count === 0);
}
export function canPackItem(
  order: ShippingOrder,
  packed: Record<string, number>,
  inventory: Record<string, number>,
  itemId: string
): boolean {
  const requirement = remainingToPack(order, packed).find((r) => r.itemId === itemId);
  return !!requirement && requirement.count > 0 && (inventory[itemId] || 0) > 0;
}
