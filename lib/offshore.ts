export interface OffshoreProgress {
  labAccess: boolean;
  photos: string[];
  cabinet: string[];
  tests: number;
  expedition: boolean;
  voyage: null | { kind: 'sail' | 'raft'; step: number };
  dives: number;
}
export const DEFAULT_OFFSHORE: OffshoreProgress = { labAccess: false, photos: [], cabinet: [], tests: 0, expedition: false, voyage: null, dives: 0 };
export const SIGHTINGS = ['A humpback whale lifts its tail beside the port rail.', 'Dolphins ride the bow wake.', 'A whale breaches beyond the starboard rail.'];
export const SPECIMENS = ['cave-calcite', 'polished-enhydro', 'included-quartz', 'glowing-fluorite', 'tidal-heart'];
export type OffshoreAction = { type: 'charter' | 'sail' | 'raft'; materials?: boolean } | { type: 'photo' | 'salvage' | 'return' | 'distill' | 'test' | 'expedition' } | { type: 'dive'; chamber: number; uv: boolean } | { type: 'polish' | 'display' | 'carve'; item: string };
interface BaseState { inventory: Record<string, number>; sandDollars: number; hasDivingGear: boolean; rowboatRepaired: boolean; offshore: OffshoreProgress }
export function advanceOffshore<T extends BaseState>(s: T, action: OffshoreAction): { state: T; message: string; sound: string } {
  const o = { ...DEFAULT_OFFSHORE, ...s.offshore };
  const inventory = { ...s.inventory };
  let coins = s.sandDollars;
  const have = (id: string) => (inventory[id] || 0) > 0;
  const add = (id: string, n = 1) => { inventory[id] = (inventory[id] || 0) + n; };
  const fail = (message: string) => ({ state: s, message, sound: '' });
  let message = '', sound = 'offshorelab';
  if (action.type === 'charter') {
    if (!s.hasDivingGear) return fail('Find the basic Diving Gear in the cove treasure chest first.');
    if (o.labAccess) return fail('Your research charter is already cleared.');
    const ready = o.photos.length >= 3;
    if (!ready && coins < 20) return fail('The charter costs 20 Sand Dollars, or photograph all three wildlife sightings for free readiness clearance.');
    if (!ready) coins -= 20;
    o.labAccess = true; message = 'Waverly welcomes you aboard. Your permanent research clearance is ready.'; sound = 'offshoredock';
  } else if (action.type === 'sail' || action.type === 'raft') {
    if (!s.rowboatRepaired) return fail('Repair the rowboat to reach the cove dock first.');
    if (o.voyage) return fail('Finish or end your current voyage first.');
    const material = action.type === 'sail' ? 'shell-scallop' : 'raw-driftwood-arch';
    const cost = action.type === 'sail' ? 3 : 2;
    if (action.materials) {
      if ((inventory[material] || 0) < 3) return fail('You need three of the listed materials.');
      add(material, -3);
    } else { if (coins < cost) return fail('You need more Sand Dollars for this fare.'); coins -= cost; }
    o.voyage = { kind: action.type, step: 0 }; message = action.type === 'sail' ? SIGHTINGS[0] : 'A weathered plank floats beside the raft. Scoop it aboard.'; sound = 'offshoresailing';
  } else if (action.type === 'photo' || action.type === 'salvage') {
    if (!o.voyage || o.voyage.kind !== (action.type === 'photo' ? 'sail' : 'raft')) return fail('Board the matching voyage at the cove dock first.');
    const step = o.voyage.step;
    if (action.type === 'photo') {
      const photo = `wildlife-${step}`;
      if (!o.photos.includes(photo)) o.photos = [...o.photos, photo];
      coins += 2; message = 'Photo saved to Maeve’s album. Earned 2 Sand Dollars.';
    } else { const item = ['raw-driftwood-planks', 'sealed-frosted-bottle', 'mystery-liquid'][step]; add(item); coins += 1; message = 'Salvage stored in your inventory. Earned 1 Sand Dollar.'; }
    o.voyage = step === 2 ? null : { ...o.voyage, step: step + 1 };
    message += o.voyage ? (action.type === 'photo' ? ` ${SIGHTINGS[step + 1]}` : ' Another find is ready to collect.') : ' The boat returns to the cove dock.';
    sound = o.voyage ? 'sandDollarCoin' : 'offshoredock';
  } else if (action.type === 'return') { o.voyage = null; message = 'Returned to the cove dock. Your finds are safe; the fare is not refunded.'; sound = 'offshoredock';
  } else {
    if (!o.labAccess || !s.hasDivingGear) return fail('Obtain research clearance at the reef first.');
    if (action.type === 'dive') {
      if (![1,2,3].includes(action.chamber)) return fail('Choose a cave chamber.');
      if (action.chamber >= 2 && !have('deep-fins')) return fail('The Siphon Trench requires Weighted Belt & Deep Fins from Seaweed.');
      if (action.chamber === 3 && (!have('reserve-tank') || !have('uv-dive-torch') || !action.uv)) return fail('The Abyssal Hearth requires fins, reserve tank, and the UV torch switched on.');
      const pool = action.chamber === 1 ? ['cave-calcite', 'rough-enhydro'] : action.chamber === 2 ? ['included-quartz'] : ['glowing-fluorite', 'tidal-heart'];
      const item = pool[o.dives % pool.length]; add(item); o.dives += 1;
      message = `Collected ${item.replaceAll('-', ' ')}. You surface safely beside the research ship.`; sound = 'offshorechip';
    } else if (action.type === 'distill') {
      if (!have('sea-water')) return fail('Collect a Jar of Sea Water at the beach first.');
      add('sea-water', -1); add('pure-water'); add('soothing-sea-salt'); message = 'Walter distills one jar into a Pure Water Vial and Soothing Sea Salt, ready for existing recipes.'; sound = 'offshorestill';
    } else if (action.type === 'test') {
      if (!have('mystery-liquid')) return fail('Find a Mystery Liquid Sample during a raft salvage voyage.');
      add('mystery-liquid', -1); add('empty-glass-bottle'); o.tests++; coins += 3; message = 'Waverly identifies harmless mineral-rich seawater. Bottle returned; research bounty: 3 Sand Dollars.';
    } else if (action.type === 'polish' || action.type === 'carve') {
      const input = action.type === 'polish' ? 'rough-enhydro' : 'glowing-fluorite';
      const output = action.type === 'polish' ? 'polished-enhydro' : action.item;
      if (action.type === 'carve' && !['crystal-walrus','crystal-dolphin'].includes(output)) return fail('Choose a walrus or dolphin sculpture.');
      if (!have(input)) return fail(`You need ${input.replaceAll('-', ' ')} from the caves.`);
      add(input,-1);add(output);message = action.type === 'polish' ? 'Walter polishes a clear window into the enhydro crystal. Ancient water shimmers inside.' : 'Walter carves a glowing animal sculpture. Keep it in your inventory or sell it to Seaweed.'; sound = action.type === 'polish' ? 'offshorepolish' : 'offshorecarve';
    } else if (action.type === 'display') {
      if (!SPECIMENS.includes(action.item) || o.cabinet.includes(action.item)) return fail('That specimen is already displayed or is not part of this collection.');
      if (!have(action.item)) return fail('Collect or polish this specimen first.');
      add(action.item,-1);o.cabinet = [...o.cabinet,action.item];message = action.item === 'tidal-heart' ? 'The Tidal Heart is gifted to Waverly. Its ancient water reveals an Arctic current. The final shelf opens and the northern expedition is cleared.' : 'Specimen placed safely in Waverly’s cabinet.';
    } else if (action.type === 'expedition') {
      if (!o.cabinet.includes('tidal-heart')) return fail('Gift the Tidal Heart to Waverly to clear the northern expedition.');
      o.expedition = true; message = 'Maeve sounds the farewell horn. Seaweed delivers warm woolens. The research ship sails beneath the aurora toward drifting ice. The winter adventure is still to come; you can return to Shoreline.'; sound = 'offshoresailing';
    }
  }
  return { state: { ...s, inventory, sandDollars: coins, offshore: o }, message, sound };
}
