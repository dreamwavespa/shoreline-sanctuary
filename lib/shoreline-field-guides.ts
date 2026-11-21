interface BirdEntry {
  id: string;
  name: string;
  image: string;
  where: string;
  note: string;
  calls?: readonly string[];
}

const patio = "Hut patio, during the day";
const birdArt = "/images/Birds/";
const birdAudio = "/audio/Birds/";

export const PATIO_BIRDS = [
  { id: "patio-robin", name: "Robin", image: birdArt + "bird-robin.png", where: patio + ", or on the Woodland Trail",
    note: "Look for a warm rusty breast and listen for a clear, lilting song.", calls: ["/audio/Robin-greeting.mp3"] },
  { id: "patio-blue-jay", name: "Blue Jay", image: birdArt + "bird-bluejay.png", where: patio,
    note: "A blue crest and dark bars across the wings make this visitor easy to recognize.", calls: ["bird-bluejay-1.mp3", "bird-bluejay-2.mp3", "bird-bluejay-3.mp3"].map(file => birdAudio + file) },
  { id: "patio-chickadee", name: "Chickadee", image: birdArt + "bird-chickadee.png", where: patio,
    note: "A small bird with a dark cap, pale cheeks, and a quick, bright call.", calls: [birdAudio + "bird-chickadee-1.mp3"] },
  { id: "patio-goldfinch", name: "Goldfinch", image: birdArt + "bird-goldfinch.png", where: patio,
    note: "Watch for yellow feathers and dark wings near the birdbath.", calls: ["bird-goldfinch-1.mp3", "bird-goldfinch-2.mp3", "bird-goldfinch-3.mp3"].map(file => birdAudio + file) },
  { id: "patio-hummingbird", name: "Hummingbird", image: birdArt + "bird-hummingbird.png", where: patio,
    note: "Look for a tiny bird hovering near the sea glass feeder.", calls: [birdAudio + "bird-hummingbird-1.mp3"] },
  { id: "patio-wren", name: "Wren", image: birdArt + "bird-wren.png", where: patio,
    note: "A little brown visitor with an upright tail and a surprisingly big voice.", calls: ["bird-wren-1.mp3", "bird-wren-2.mp3", "bird-wren-3.mp3"].map(file => birdAudio + file) },
] satisfies BirdEntry[];

export const ARCHIE_BIRD = {
  id: "patio-archie", name: "Archie the Night Owl", image: birdArt + "Archie-owl.PNG",
  where: "Hut patio after dark",
  note: "Listen for a soft hoot. On rare nights Archie perches on the railing, and sometimes he leaves a keepsake to find after sunrise.",
  calls: [birdAudio + "Archie_Owl_Call_Ready.mp3"],
} satisfies BirdEntry;

export const SWAN_BIRD = {
  id: "woodland-swan", name: "Woodland Swan", image: "/images/Robin/woodland-swan.webp",
  where: "Woodland Pond on Coconut Grove’s Woodland Trail",
  note: "A white swan with a long curved neck sometimes glides past the reeds, leaving a soft ripple.",
  calls: [birdAudio + "woodland-swan-call.mp3"],
} satisfies BirdEntry;

export const BEACH_SEAGULL = {
  id: "beach-seagull", name: "Seagull", image: "/images/Beach-seagull.PNG",
  where: "Beside the picnic basket on the beach",
  note: "Look for the gull that visits the picnic basket. You can trade with him or shoo him away until tomorrow.",
} satisfies BirdEntry;

export const BIRD_GUIDE: BirdEntry[] = [
  ...PATIO_BIRDS, ARCHIE_BIRD, SWAN_BIRD, BEACH_SEAGULL,
  { id: "sandy", name: "Sandy the Sandpiper", image: "/images/Beach-Sandy-transparent.png",
    where: "The wet sand at North Beach", note: "Watch Sandy scurry along the waterline, especially after a storm." },
  { id: "penelope", name: "Penelope the Pelican", image: "/images/Beach-Penelope-transparent.png",
    where: "The shoreline and dock pilings", note: "Look for Penelope’s long bill and throat pouch as she watches over the shore." },
];

interface PlantEntry {
  id: string;
  name: string;
  where: string;
  note: string;
  image?: string;
}

const flowerArt = "/images/Flower shop/";
const flowerbed = "Grow in Coconut Grove’s flowerbed";
const imported = "Grow in Coconut Grove from Shelby’s imported island seed packet";

export const PLANT_GUIDE: { title: string; entries: PlantEntry[] }[] = [
  {
    title: "Coastal flowers",
    entries: [
      { id: "sea-rose-petal", name: "Sea Rose", where: "Beach wash-ups", note: "Look for loose petals along the shore. Use them in recipes such as Sea Rose Milk." },
      { id: "flower-beach-rose", name: "Beach Rose", where: flowerbed, image: flowerArt + "beach-rose.png", note: "A broad pink blossom with a golden center. Use the harvested bloom in an arrangement." },
      { id: "flower-sea-holly", name: "Sea Holly", where: flowerbed, image: flowerArt + "sea-holly.png", note: "Blue flower heads sit above pointed bracts." },
      { id: "flower-seaside-daisy", name: "Seaside Daisy", where: flowerbed, image: flowerArt + "seaside-daisy.png", note: "Small daisy flowers with a ring of pale petals." },
      { id: "flower-coastal-sunflower", name: "Coastal Sunflower", where: flowerbed, image: flowerArt + "coastal-sunflower.png", note: "A bright yellow flower with a broad, darker center." },
      { id: "flower-dune-evening-primrose", name: "Dune Evening Primrose", where: flowerbed, image: flowerArt + "dune-evening-primrose.png", note: "A soft yellow bloom for a coastal bouquet." },
      { id: "flower-saltmarsh-mallow", name: "Saltmarsh Mallow", where: flowerbed, image: flowerArt + "saltmarsh-mallow.png", note: "A wide, soft-petaled marsh flower." },
      { id: "flower-sea-morning-glory", name: "Sea Morning Glory", where: flowerbed, image: flowerArt + "sea-morning-glory.png", note: "A trumpet-shaped flower on a trailing vine." },
      { id: "sea-lavender", name: "Sea Lavender", where: "Coconut Grove’s coastal plants", image: flowerArt + "sea-lavender.png", note: "Small purple flowers in sprays. Discovering it also lets you grow it in Coralie’s grotto." },
      { id: "rain-lily-blossom", name: "Rain-Lily", where: "Coconut Grove’s herb thicket after a storm", image: flowerArt + "rain-lily-blossom.png", note: "A rare flower that turns up in wet weather." },
    ],
  },
  {
    title: "Grove trees, herbs, and crops",
    entries: [
      { id: "coconut", name: "Coconut Palm", where: "Coconut Grove’s palms", image: "/images/Baking/Coconut.png", note: "Shake the palm and gather the coconuts that fall into the sand." },
      { id: "orange", name: "Orange Tree", where: "Coconut Grove’s orange tree", image: "/images/Orange-tree.PNG", note: "Pick ripe oranges to use in juice, baking, and other recipes." },
      { id: "coastal-beach-mint", name: "Coastal Beach Mint", where: "Coconut Grove’s herb thicket", note: "Snip its fragrant leaves beside the mossy log." },
      { id: "wild-lemongrass", name: "Wild Lemongrass", where: "Coconut Grove’s herb thicket", note: "Look for long, fragrant blades among the grove herbs." },
      { id: "rosemary", name: "Rosemary", where: "Coconut Grove’s herb thicket", note: "This fragrant herb has slender, needle-like leaves." },
      { id: "cotton-balls", name: "Cotton Plant", where: "Plant Shelby’s cotton seeds in Coconut Grove", image: "/images/Cotton-plant.png", note: "Harvest the soft cotton for stuffing sewing projects." },
      { id: "catnip", name: "Catnip", where: "Plant Shelby’s catnip seeds in Coconut Grove", image: "/images/Catnip-plant.png", note: "This leafy herb can be used in cat toys." },
      { id: "coffee-beans", name: "Coffee Plant", where: "Coconut Grove’s coffee plant", image: "/images/Coffee-plant.png", note: "Harvest beans for the kitchen’s coffee drinks." },
    ],
  },
  {
    title: "Rare and imported blooms",
    entries: [
      { id: "island-vanilla-orchid", name: "Island Vanilla Orchid", where: imported, image: flowerArt + "island-vanilla-orchid.png", note: "A rare orchid that can sprout from an imported mystery seed." },
      { id: "moonmint-leaves", name: "Moonmint", where: imported, note: "A rare herb harvested for its leaves." },
      { id: "tropical-hibiscus", name: "Tropical Hibiscus", where: imported, image: flowerArt + "tropical-hibiscus.png", note: "A large tropical blossom from Shelby’s travels." },
      { id: "honeybell-seed", name: "Golden Honeybell", where: "Follow the bottle clue about sea roses and bees", image: flowerArt + "golden-honeybell.png", note: "A golden flower you can grow from the seed discovered through the clue." },
      { id: "shelldon-moon-tide-blossom", name: "Moon Tide Blossom", where: "Grow Sheldon’s friendship seed in Coconut Grove’s flowerbed", image: flowerArt + "moon-tide-blossom.png", note: "A rare blossom grown from the Moon Tide Seed." },
    ],
  },
  {
    title: "Tide pool and grotto flora",
    entries: [
      { id: "sea-lettuce", name: "Sea Lettuce", where: "Tide pools or Coralie’s underwater garden", note: "Bright green, ruffled fronds that can be harvested for the kitchen." },
      { id: "kelp", name: "Kelp", where: "Shoreline tide pools", note: "Long ribbons of seaweed that sway in the current." },
      { id: "plant-radiant-moonflower", name: "Radiant Moonflower", where: "Coralie’s underwater garden as your friendship grows", image: flowerArt + "radiant-moonflower.png", note: "A silvery flower with a moonlit glow." },
      { id: "plant-twinkle-star-flower", name: "Twinkle Star Flower", where: "Coralie’s underwater garden as your friendship grows", image: flowerArt + "twinkle-star-flower.png", note: "A star-shaped bloom that gives off a gentle twinkle." },
      { id: "plant-glowing-roses", name: "Glowing Roses", where: "Coralie’s underwater garden as your friendship grows", image: flowerArt + "glowing-roses.png", note: "Rare luminous roses from Coralie’s living collection." },
    ],
  },
];
