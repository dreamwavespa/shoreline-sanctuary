import type { SeaGlassSisterReward } from "./seaGlassSisterRewards";

export interface SisterRewardGrantResult {
  inventory: Record<string, number>;
  crafted: string[];
}

const DIRECT_ITEM_IDS: Record<string, string> = {
  "marella-white-moonstone": "white-moonstone",
  "marella-black-moonstone": "black-moonstone",
};

export function applySeaGlassSisterReward(
  reward: SeaGlassSisterReward,
  claimId: string,
  inventory: Record<string, number>,
  crafted: string[]
): SisterRewardGrantResult {
  if (crafted.includes(claimId)) return { inventory, crafted };

  const nextInventory = { ...inventory };
  const nextCrafted = [...crafted, claimId];

  if (reward.kind === "item") {
    const itemId = DIRECT_ITEM_IDS[reward.id] || reward.id;
    nextInventory[itemId] = (nextInventory[itemId] || 0) + 1;
  }

  if (reward.kind !== "item" && !nextCrafted.includes(reward.id)) {
    nextCrafted.push(reward.id);
  }

  return { inventory: nextInventory, crafted: nextCrafted };
}
