export interface SeaGlassSisterReward {
  gifts: 3 | 6 | 9 | 12;
  name: string;
  description: string;
  kind: "item" | "recipe" | "crafting-unlock";
}

export const SEA_GLASS_SISTER_REWARDS: Record<string, SeaGlassSisterReward[]> = {
  melody: [
    { gifts: 3, name: "White Moonstone", description: "A pale moonstone selected by Melody for fine jewelry.", kind: "item" },
    { gifts: 6, name: "Custom Locket Recipe", description: "Unlocks Melody's custom locket crafting recipe.", kind: "recipe" },
    { gifts: 9, name: "Black Moonstone", description: "A rare dark moonstone for special jewelry designs.", kind: "item" },
    { gifts: 12, name: "Master Jeweler Reward", description: "Reserved for Melody's future signature jewelry reward.", kind: "crafting-unlock" },
  ],
  marella: [
    { gifts: 3, name: "White Moonstone", description: "A moonlit stone from Marella's celestial collection.", kind: "item" },
    { gifts: 6, name: "Moon-Shaped Sand Art Bottle", description: "Unlocks a crescent-moon bottle shape for custom sand art.", kind: "crafting-unlock" },
    { gifts: 9, name: "Black Moonstone", description: "A midnight moonstone tied to Marella's observatory.", kind: "item" },
    { gifts: 12, name: "Moonlight Silver Sand", description: "A permanent shimmering silver sand for custom sand art.", kind: "item" },
  ],
  coralie: [
    { gifts: 3, name: "Sea-Foam Sponges", description: "Soft natural sea sponges gathered from Coralie's garden waters.", kind: "item" },
    { gifts: 6, name: "Rare Garden Plant", description: "A special plant for Coralie's underwater garden collection.", kind: "item" },
    { gifts: 9, name: "Rare Planting Material", description: "A special planting material for advanced garden projects.", kind: "item" },
    { gifts: 12, name: "Bioluminescent Garden Plant", description: "A rare glowing plant for the underwater garden.", kind: "item" },
  ],
  kaiana: [
    { gifts: 3, name: "Artisan Clay", description: "Special crafting clay from Kaiana; ordinary coastal clay will later be discoverable at the Sandbar.", kind: "item" },
    { gifts: 6, name: "Sea-Glass Aqua Sand", description: "A permanent rare aqua sand for custom sand art.", kind: "item" },
    { gifts: 9, name: "Pearl Blush Sand", description: "A softly shimmering pearl-pink sand for custom bottles.", kind: "item" },
    { gifts: 12, name: "Bioluminescent Sand", description: "A rare glowing sand for advanced sand-art designs.", kind: "item" },
  ],
};

export function getNextSeaGlassSisterReward(villagerId: string, giftCount: number) {
  return SEA_GLASS_SISTER_REWARDS[villagerId]?.find((reward) => reward.gifts > giftCount) || null;
}
