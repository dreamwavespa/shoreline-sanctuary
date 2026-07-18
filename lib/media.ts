// Centralized hosted-media URLs. Everything here is externally hosted
// (either the original uploaded art/music CDN, or permanent storage for
// sandbox-generated icons/SFX) so the app never depends on local /public
// binaries — keeping the git repo small and Vercel-deploy friendly.

export const SCENES = {
  beachMain: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/1c3db5a6d23b42c79ec40438e941f5f9.webp",
  workshop: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/4e11eb9af2ec492eb4f268cafb498e55.webp",
  lookout: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/80f70eb354a34cd0bab983f9c3abd5f5.webp",
  bottleHero: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/1ca77ceb5abe4d93802a8f1054084720.webp",
  treasureCove: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/24452388c2cd452faddcd564ad7ce3b7.webp",
  shipwreck: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/889fe3393ab54429b2142c95076933a7.webp",
  bucketStates: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/34b8bb2ecc694618b502795eab4d1338.webp",
  jellyfish: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/596ca3a95c864f7598030f0b40088370.webp",
  petBed: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/4944268393dc415281641f0e7b3609ee.webp",
  telescopeStars: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/44fdd245fa1d4e20897ef5e25dc972c1.webp",
  candlesWindow: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/88d4aaacee534acfb62d9a1408baa657.webp",
  seaGlassPendant: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/1dd67dee1a54499d8a8d8894bb498425.webp",
  beachPlumJelly: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/519ce391dce3418bb403204a45701b02.webp",
  shipDeck: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/88a3d842d164410eb5c329c5d68c343a.webp",
  lobsterTrap: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/5e4097ab50cd4607832ed48e13bed7c6.webp",
  sealPontoon: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/908ffd5526974e38b77dfc1fdc4c4032.webp",
  roseBowl: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/9121aeb40725481fa0e3b50a1d82be14.webp",
};

export const MUSIC = {
  beach: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/2272649d13f1496683d46733ff6a4d7b.mp3",
  underwater: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/2922b0a505d240a28037f7b469dd7d87.mp3",
  lighthouse: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/14df5d6b36964c06b401262a8b56b24f.mp3",
  kitchen: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/f7f0c00c5c1d490e95569e0fcb2273d8.mp3",
  deepReefDescent: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/d01cd0e5715348f0b9c41c7ffc94b6cd.mp3",
};

export const PWA_ICONS = {
  icon192: "https://galaxy-prod.tlcdn.com/gen/user_32o6JOgK3frOagwPkyqjrJpmKC3/924154cd-d1da-40d1-bf20-1445c25f0504.png",
  icon512: "https://galaxy-prod.tlcdn.com/gen/user_32o6JOgK3frOagwPkyqjrJpmKC3/c02984e6-d6a6-4ea3-b96a-5115e073bcba.png",
};

const SFX_BASE = "https://static.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3";

export const SFX_FILES: Record<string, string> = {
  seaGlass: `${SFX_BASE}/c3e9dc25-b686-4a2e-a5df-1d177b4ccf30.mp3`,
  driftwood: `${SFX_BASE}/70e1d219-1883-410c-ad85-0b8d12e87266.mp3`,
  pearl: `${SFX_BASE}/52e9f579-14be-49ce-b0f7-ba77b57db8d3.mp3`,
  plastic: `${SFX_BASE}/1bdb7a8e-a8c7-49ed-9ea7-3709bf0b4500.mp3`,
  shell: `${SFX_BASE}/f48416b5-8c60-4262-9c34-325c7f2f8119.mp3`,
  bucketEmpty: `${SFX_BASE}/1282214e-c37f-4ff8-87d5-082629e201d0.mp3`,
  bucketHalf: `${SFX_BASE}/69ff9589-9e45-4f61-9ea7-ca756817a641.mp3`,
  bucketFull: `${SFX_BASE}/44f3aa7c-c126-4865-bf11-4f073d22ad41.mp3`,
  bottleOpen: `${SFX_BASE}/9170bb36-d283-4845-b5e4-fae756fae643.mp3`,
  questComplete: `${SFX_BASE}/dbe6c196-db3e-4a78-b615-b8a5c3c6d3be.mp3`,
  craftSuccess: `${SFX_BASE}/3a6a92e5-28f6-4014-8654-6bb5924ccd69.mp3`,
  
  // ========== PHASE 4 & 5: RESORT EXPANSION SFX ==========
  // Beach Umbrella - Canvas air displacement sweep (120 Hz → 45 Hz)
  umbrellaWhoof: `${SFX_BASE}/resort-umbrella-whoof.mp3`,
  
  // Picnic Basket - Wicker creaking and peg toggle closure
  picnicLatch: `${SFX_BASE}/resort-picnic-latch.mp3`,
  
  // Beach Bag - Heavy canvas duck cloth dragging with item shifts
  bagRustle: `${SFX_BASE}/resort-bag-rustle.mp3`,
  
  // Inflatable Raft - Air pump inflation with rope knot friction
  raftInflate: `${SFX_BASE}/resort-raft-inflate.mp3`,
  
  // Coastal Salt Lamp - Hardwood sanding friction with mineral placement chink
  lampActivate: `${SFX_BASE}/resort-lamp-activate.mp3`,
  
  // Salt Lamp - Base sanding friction
  lampBaseSanding: `${SFX_BASE}/resort-lamp-base-sanding.mp3`,
  
  // Salt Lamp - Crystal placement chink
  lampCrystalPlacement: `${SFX_BASE}/resort-lamp-crystal-placement.mp3`,
  
  // Salt Lamp - Firefly jar living pulse
  lampFireflyHum: `${SFX_BASE}/resort-lamp-firefly-hum.mp3`,
  
  // Woven Sun Hat - Dried straw friction crunching layers
  hatWeave: `${SFX_BASE}/resort-hat-straw-weave.mp3`,
  
  // Sun Hat - Soft leaf band placement brush
  hatBandWrap: `${SFX_BASE}/resort-hat-band-wrap.mp3`,
  
  // Sun Hat - Light-metal buckle secure snap
  hatBuckleClink: `${SFX_BASE}/resort-hat-buckle-clink.mp3`,
};

export const AMBIENCE_LOOP = `${SFX_BASE}/5e767b6a-1923-4961-9398-95e0e66349fa.mp3`;
