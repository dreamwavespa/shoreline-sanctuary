export interface SeaGlassSisterReward {
  gifts: 3 | 6 | 9 | 12;
  id: string;
  name: string;
  description: string;
  kind: "item" | "recipe" | "crafting-unlock" | "plant-unlock" | "sand-unlock" | "bottle-unlock";
}

export const SEA_GLASS_SISTER_REWARDS: Record<string, SeaGlassSisterReward[]> = {
  melody: [
    { gifts: 3, id: "white-moonstone", name: "White Moonstone", description: "A luminous pale moonstone selected by Melody for fine jewelry.", kind: "item" },
    { gifts: 6, id: "recipe-custom-locket", name: "Custom Locket Recipe", description: "Permanently unlocks Melody's custom locket crafting recipe.", kind: "recipe" },
    { gifts: 9, id: "black-moonstone", name: "Black Moonstone", description: "A rare midnight moonstone for special jewelry designs.", kind: "item" },
    { gifts: 12, id: "invisible-sea-glass-setting", name: "Invisible Sea-Glass Setting", description: "Melody teaches her master technique for arranging sea glass with the supporting setting nearly hidden.", kind: "crafting-unlock" },
  ],
  marella: [
    { gifts: 3, id: "marella-white-moonstone", name: "White Moonstone", description: "A moonlit stone from Marella's celestial collection.", kind: "item" },
    { gifts: 6, id: "moon-shaped-sand-bottle", name: "Moon-Shaped Sand Art Bottle", description: "Permanently unlocks a crescent-moon bottle shape for custom sand art.", kind: "bottle-unlock" },
    { gifts: 9, id: "marella-black-moonstone", name: "Black Moonstone", description: "A midnight moonstone tied to Marella's observatory.", kind: "item" },
    { gifts: 12, id: "sand-moonlight-silver", name: "Moonlight Silver Sand", description: "Permanently unlocks shimmering silver sand for custom sand art.", kind: "sand-unlock" },
  ],
  coralie: [
    { gifts: 3, id: "sea-foam-sponges", name: "Sea-Foam Sponges", description: "Soft natural sea sponges gathered from Coralie's garden waters.", kind: "item" },
    { gifts: 6, id: "plant-radiant-moonflower", name: "Radiant Moonflower", description: "Permanently unlocks a silvery moonlit flower for Coralie's Underwater Garden.", kind: "plant-unlock" },
    { gifts: 9, id: "plant-twinkle-star-flower", name: "Twinkle Star Flower", description: "Permanently unlocks a star-shaped flower with a gentle twinkling glow.", kind: "plant-unlock" },
    { gifts: 12, id: "plant-glowing-roses", name: "Glowing Roses", description: "Permanently unlocks Coralie's rare luminous roses for the Underwater Garden.", kind: "plant-unlock" },
  ],
  kaiana: [
    { gifts: 3, id: "white-porcelain-clay", name: "White Porcelain Clay", description: "Kaiana shares a fine white porcelain clay for delicate artisan work. Ordinary coastal clay remains a future Sandbar discovery.", kind: "item" },
    { gifts: 6, id: "sand-blush-pearl", name: "Blush Pearl Sand", description: "Permanently unlocks a softly shimmering pearl-pink sand for custom sand art.", kind: "sand-unlock" },
    { gifts: 9, id: "recipe-porcelain-tea-set", name: "Porcelain Tea Set Recipe", description: "Permanently unlocks Kaiana's advanced porcelain tea-set craft.", kind: "recipe" },
    { gifts: 12, id: "sea-diamond", name: "Sea Diamond", description: "An exceptionally rare ocean gemstone from Kaiana, saved for a future masterwork, jewelry centerpiece, or display treasure.", kind: "item" },
  ],
};

export const SEA_GLASS_SISTER_IDS = Object.keys(SEA_GLASS_SISTER_REWARDS);
export const SEA_GLASS_SISTER_MILESTONES = [3, 6, 9, 12] as const;

export function getNextSeaGlassSisterReward(villagerId: string, giftCount: number) {
  return SEA_GLASS_SISTER_REWARDS[villagerId]?.find((reward) => reward.gifts > giftCount) || null;
}

export function getEarnedSeaGlassSisterRewards(villagerId: string, giftCount: number) {
  return (SEA_GLASS_SISTER_REWARDS[villagerId] || []).filter((reward) => reward.gifts <= giftCount);
}

export function sisterRewardClaimId(villagerId: string, gifts: number) {
  return `sea-glass-sister-reward:${villagerId}:${gifts}`;
}
