// Shelby's shipping manifest — first test order.
// Only IDs already present in lib/items.ts may be used.
export interface ShippingRequirement { itemId: string; count: number }
export interface ShippingOrder {
  id: string;
  title: string;
  description: string;
  requires: ShippingRequirement[];
}
export const SHELBY_SHIPPING_ORDERS: ShippingOrder[] = [
  {
    id: "island-market",
    title: "Island Market Supplies",
    description: "Pack everyday Shoreline finds for a neighboring island market.",
    requires: [
      { itemId: "coconut", count: 3 },
      { itemId: "shell-scallop", count: 2 },
      { itemId: "seaweed-fronds", count: 2 },
    ],
  },
];
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
