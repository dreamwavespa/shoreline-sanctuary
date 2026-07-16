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
};

export const MUSIC = {
  beach: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/2272649d13f1496683d46733ff6a4d7b.mp3",
  underwater: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/2922b0a505d240a28037f7b469dd7d87.mp3",
  lighthouse: "https://cdn.galaxy.ai/user_32o6JOgK3frOagwPkyqjrJpmKC3/14df5d6b36964c06b401262a8b56b24f.mp3",
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
};

export const AMBIENCE_LOOP = `${SFX_BASE}/009dbc81-bae7-45c7-99b1-5307640cd469.mp3`;
