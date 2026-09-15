"use client";
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useGame } from '@/lib/store';
import { ITEMS } from '@/lib/items';
import { SIGHTINGS, SPECIMENS, type OffshoreAction } from '@/lib/offshore';
const button = 'min-h-12 rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white disabled:bg-slate-200 disabled:text-slate-600 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-500';
const card = 'rounded-2xl bg-white p-4 text-slate-900 shadow space-y-3';
function Art({ name, alt }: { name: string; alt: string }) { return <Image src={`/images/offshore/${name}.jpg`} alt={alt} width={1000} height={560} unoptimized className="w-full rounded-xl object-cover" />; }
export function OffshoreEntry({ kind }: { kind: 'lab' | 'dock' }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return <section className={`${card} m-4`}>
    <h2 className="text-xl font-bold">{kind === 'lab' ? 'Waverly’s Marine Research Ship' : 'Cove Dock'}</h2>
    <p>{kind === 'lab' ? 'Visit Waverly, Walter, and the crystal caves beneath the reef.' : 'Seaweed’s pier counter offers wildlife photography and inshore salvage voyages.'}</p>
    <button ref={trigger} type="button" className={button} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Close' : kind === 'lab' ? 'Visit the Marine Lab' : 'Walk to the Dock'}</button>
    {open && <OffshorePanel kind={kind} onClose={() => { setOpen(false); trigger.current?.focus(); }} />}
  </section>;
}
function OffshorePanel({ kind, onClose }: { kind: 'lab' | 'dock'; onClose: () => void }) {
  const { state, offshoreAction, buyFromSeaweed, play } = useGame();
  const [message, setMessage] = useState({ text: '', revision: 0 });
  const [area, setArea] = useState('lab');
  const [chamber, setChamber] = useState(1);
  const [uv, setUv] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const announce = (text: string) => setMessage(s => ({ text, revision: s.revision + 1 }));
  const act = (action: OffshoreAction) => announce(offshoreAction(action));
  const o = state.offshore;
  const count = (id: string) => state.inventory[id] || 0;
  const buy = (id: string) => announce(buyFromSeaweed(id) ? `${ITEMS[id].name} purchased.` : 'You need more Sand Dollars.');
  return <div className="space-y-4 border-t border-teal-200 pt-4">
    <h3 ref={heading} tabIndex={-1} className="text-xl font-bold focus:outline-none">{kind === 'dock' ? 'Seaweed’s Pier Counter' : 'Marine Lab & The Benthic Pocket'}</h3>
    <p>Wallet: {state.sandDollars} Sand Dollars</p>
    <p role="status" aria-live="polite" aria-atomic="true" className="rounded-xl bg-teal-50 p-3"><span key={message.revision}>{message.text || 'Choose an activity. There are no timed controls.'}</span></p>
    {kind === 'dock' ? <>
      {o.voyage ? <section className={card}>
        <h4 className="text-lg font-bold">{o.voyage.kind === 'sail' ? 'White Sailboat · Wildlife Watch' : 'Inshore Raft · Flotsam Sweep'}</h4>
        <p>Stop {o.voyage.step + 1} of 3</p>
        <p>{o.voyage.kind === 'sail' ? SIGHTINGS[o.voyage.step] : ['A weathered plank floats beside you.', 'A sealed frosted bottle bobs in the current.', 'A small bottle holds an unfamiliar liquid for Waverly to test.'][o.voyage.step]}</p>
        <button type="button" className={button} onClick={() => act({ type: o.voyage?.kind === 'sail' ? 'photo' : 'salvage' })}>{o.voyage.kind === 'sail' ? 'Take Wildlife Photo · Earn 2 Sand Dollars' : 'Collect Salvage · Earn 1 Sand Dollar'}</button>
        <button type="button" className={button} onClick={() => act({ type: 'return' })}>End Voyage and Return to Dock</button>
      </section> : <div className="grid gap-4 md:grid-cols-2">
        <section className={card}><h4 className="font-bold">White Sailboat</h4><p>Three peaceful whale and dolphin sightings. Each photo earns 2 Sand Dollars and joins Maeve’s album.</p><button type="button" className={button} onClick={() => act({ type: 'sail' })}>Board · 3 Sand Dollars</button><button type="button" className={button} onClick={() => act({ type: 'sail', materials: true })}>Trade 3 Scallop Shells for Passage ({count('shell-scallop')} owned)</button></section>
        <section className={card}><h4 className="font-bold">Inshore Salvage Raft</h4><p>A hired raft for collecting flotsam. Your personal sandbar raft remains available for its existing activities.</p><button type="button" className={button} onClick={() => act({ type: 'raft' })}>Board · 2 Sand Dollars</button><button type="button" className={button} onClick={() => act({ type: 'raft', materials: true })}>Trade 3 Driftwood for Passage ({count('raw-driftwood-arch')} owned)</button></section>
      </div>}
      <section className={card}><h4 className="font-bold">Maeve’s Wildlife Album · {o.photos.length}/3</h4>{SIGHTINGS.map((s,i) => <p key={s}>{o.photos.includes(`wildlife-${i}`) ? 'Photographed: ' : 'Not yet photographed: '}{s}</p>)}<p>Photograph all three sightings for Waverly’s free research clearance. Access her ship through the Reef.</p></section>
    </> : !o.labAccess ? <section className={card}>
      <Art name="waverly" alt="Waverly in her wooden ship laboratory, examining a specimen beside a brass-trimmed cabinet." />
      <p>“Welcome! Bring a full wildlife album and your diving gear, or book Seaweed’s permanent research charter for 20 Sand Dollars.”</p>
      <p>Wildlife album: {o.photos.length}/3. Basic diving gear: {state.hasDivingGear ? 'ready' : 'needed'}.</p>
      <button type="button" className={button} onClick={() => act({ type: 'charter' })}>{o.photos.length >= 3 ? 'Request Free Readiness Clearance' : 'Book Research Charter · 20 Sand Dollars'}</button>
    </section> : <>
      <nav aria-label="Research ship activities" className="flex flex-wrap gap-2">{[['lab','Waverly’s Lab'],['walter','Walter’s Raft'],['caves','Crystal Caves'],['cabinet','Specimen Cabinet']].map(([id,label]) => <button type="button" key={id} className={button} aria-pressed={area === id} onClick={() => { setArea(id); if(id === 'walter') play('offshorewalter'); }}>{label}</button>)}</nav>
      {area === 'lab' && <section className={card}><Art name="waverly" alt="Dr. Waverly studies a crystal in her cozy marine laboratory." /><h4 className="font-bold">Dr. Waverly · Marine Biologist</h4><p>“Ancient water inside a crystal! Imagine the currents it remembers.” Waverly studies wildlife, unusual liquids, and minerals from the reef.</p><p>Mystery samples: {count('mystery-liquid')}. Completed tests: {o.tests}.</p><button type="button" className={button} disabled={!count('mystery-liquid')} onClick={() => act({type:'test'})}>Test Mystery Liquid · Earn 3 Sand Dollars</button><p>Find samples during the dock’s raft voyages. Existing sealed bottle messages still open in your bucket.</p></section>}
      {area === 'walter' && <section className={card}><Art name="walter" alt="Walter the walrus rests under a striped awning beside his copper still and shelves of polished crystals." /><h4 className="font-bold">Walter · Arctic Artisan</h4><p>Patient and warm-hearted, Walter distills seawater and shapes crystals with the tips of his tusks.</p><p>Sea Water: {count('sea-water')} · Rough Enhydro: {count('rough-enhydro')} · Fluorite: {count('glowing-fluorite')}</p><div className="flex flex-wrap gap-2"><button type="button" className={button} disabled={!count('sea-water')} onClick={() => act({type:'distill'})}>Distill 1 Sea Water → 1 Pure Water + 1 Sea Salt</button><button type="button" className={button} disabled={!count('rough-enhydro')} onClick={() => act({type:'polish',item:'rough-enhydro'})}>Polish 1 Rough Enhydro</button>{['walrus','dolphin'].map(animal => <button type="button" key={animal} className={button} disabled={!count('glowing-fluorite')} onClick={() => act({type:'carve',item:`crystal-${animal}`})}>Carve Crystal {animal} · 1 Fluorite</button>)}</div></section>}
      {area === 'caves' && <section className={card}><h4 className="font-bold">The Benthic Pocket</h4>{state.blueprints.includes('map-underwater-crystal-cave') || count('map-underwater-crystal-cave') ? <p>Your treasure-chest cave map matches Waverly’s survey: the passage lies directly beneath the ship.</p> : <p>Waverly shares her survey of the caves beneath the ship. The treasure-chest cave map describes this same place.</p>}<label className="block">Choose a chamber<select className="block w-full rounded-lg border p-3" value={chamber} onChange={e => setChamber(Number(e.target.value))}><option value={1}>1 · The Luminous Arch</option><option value={2}>2 · The Siphon Trench</option><option value={3}>3 · The Abyssal Hearth</option></select></label><Art name={['arch','trench','hearth'][chamber-1]} alt={['Sunlight streams into an underwater cavern with pale mineral veins.','Cyan anemones glow along dark stone arches in the Siphon Trench.','Purple and blue crystals illuminate the deep Abyssal Hearth.'][chamber-1]} /><p>{['Basic diving gear required. Find Calcite and Rough Enhydro.','Weighted Belt & Deep Fins required. Find Sand-Included Quartz.','Fins, reserve tank, and UV torch required. Find Glowing Fluorite and the Tidal Heart.'][chamber-1]}</p><label className="flex items-center gap-3"><input type="checkbox" checked={uv} disabled={!count('uv-dive-torch')} onChange={e => setUv(e.target.checked)} />Switch on ultraviolet light {count('uv-dive-torch') ? '' : '(purchase torch first)'}</label>{uv && <p>The ultraviolet beam reveals vivid mineral fluorescence.</p>}<button type="button" className={button} onClick={() => act({type:'dive',chamber,uv})}>Explore Chamber and Collect a Specimen</button></section>}
      {area === 'cabinet' && <section className={card}><Art name="cabinet" alt="A brass-trimmed specimen cabinet filled with colorful minerals in the research cabin." /><h4 className="font-bold">Waverly’s Specimen Cabinet · {o.cabinet.length}/5</h4>{SPECIMENS.map(id => <div key={id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2"><p>{ITEMS[id].name} · {o.cabinet.includes(id) ? 'Displayed' : `${count(id)} in inventory`}</p><button type="button" className={button} disabled={o.cabinet.includes(id) || !count(id)} onClick={() => act({type:'display',item:id})}>{id === 'tidal-heart' ? 'Gift Tidal Heart' : `Display ${ITEMS[id].name}`}</button></div>)}{o.cabinet.includes('tidal-heart') && <><Art name="heart" alt="The clear Tidal Heart crystal holds ancient water beneath a shaft of light." /><p>The final shelf is open. Waverly traces the trapped water to a northern current.</p><button type="button" className={button} onClick={() => act({type:'expedition'})}>View Northern Expedition Farewell</button></>}{o.expedition && <p>Maeve’s horn bids farewell as Seaweed delivers woolens. The ship heads toward ice and aurora skies. The winter adventure is still to come; Shoreline remains open to explore.</p>}</section>}
    </>}
    <section className={card}><h4 className="font-bold">Seaweed’s Deep Dive Gear</h4><p>Permanent equipment, also available at Seaweed &amp; Salt.</p>{[['uv-dive-torch',25],['deep-fins',45],['reserve-tank',75]].map(([id,price]) => <button type="button" key={id} className={`${button} m-1`} disabled={!!count(String(id)) || state.sandDollars < Number(price)} onClick={() => buy(String(id))}>{ITEMS[id].name} · {count(String(id)) ? 'Owned' : `${price} Sand Dollars`}</button>)}</section>
    <button type="button" className={button} onClick={onClose}>Return to {kind === 'dock' ? 'Cove' : 'Reef'}</button>
  </div>;
}
