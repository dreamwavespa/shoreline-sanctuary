"use client";

import Image from "next/image";
import { useState } from "react";
import {
  postcardImage, POSTCARD_RECIPIENT_IDS, POSTCARD_RECIPIENTS, RETREAT_POSTCARD_IDS, RETREAT_POSTCARDS,
  type PostcardRecipient, type RetreatPostcardId,
} from "@/lib/retreat-postcards";
import { useGame } from "@/lib/store";

const action = "min-h-11 rounded-lg bg-teal-800 px-3 py-2 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800";
const select = "block min-h-11 w-full rounded-lg border border-teal-700 bg-white px-3 text-slate-900";

function PostcardImage({ id }: { id: RetreatPostcardId }) {
  return <Image src={postcardImage(id)} alt={RETREAT_POSTCARDS[id].alt} width={768} height={512} unoptimized className="h-auto w-full rounded-lg" />;
}

export function RetreatPostcardAlbum() {
  const { state } = useGame();
  const collection = state.retreatPostcards;
  const found = RETREAT_POSTCARD_IDS.filter(id => collection[id]).length;

  return (
    <section aria-label="Island Retreat postcard collection" className="space-y-3">
      <p>{found} of {RETREAT_POSTCARD_IDS.length} postcards collected. Send copies from Seaweed’s Pier Counter.</p>
      <ul className="space-y-2">
        {RETREAT_POSTCARD_IDS.map(id => {
          const card = RETREAT_POSTCARDS[id];
          const sent = collection[id];
          return <li key={id} className="rounded-lg bg-white/80 p-3">
            {sent ? <details className="space-y-2">
              <summary className="cursor-pointer font-semibold">{card.title}</summary>
              <PostcardImage id={id} />
              {!!sent.length && <ul className="space-y-2">
                {sent.map(recipient => <li key={recipient} className="rounded-lg border border-teal-200 bg-teal-50 p-3">
                  <p className="font-semibold">Reply from {POSTCARD_RECIPIENTS[recipient].name}</p>
                  <p>{POSTCARD_RECIPIENTS[recipient].reply}</p>
                </li>)}
              </ul>}
            </details> : <>
              <p className="font-semibold">{card.title}</p>
              <p>Undiscovered. {card.hint}</p>
            </>}
          </li>;
        })}
      </ul>
    </section>
  );
}

export function RetreatPostcardMail() {
  const { state, sendRetreatPostcard } = useGame();
  const [selected, setSelected] = useState<RetreatPostcardId | "">("");
  const [recipient, setRecipient] = useState<PostcardRecipient | "">("");
  const [message, setMessage] = useState("");
  const cards = RETREAT_POSTCARD_IDS.filter(id => state.retreatPostcards[id]);
  const card = selected || cards[0];
  const sent = card ? state.retreatPostcards[card] || [] : [];
  const target = recipient && !sent.includes(recipient) ? recipient : "";

  return (
    <section aria-labelledby="retreat-mail-heading" className="space-y-3 rounded-2xl bg-white p-4 text-slate-900 shadow">
      <h4 id="retreat-mail-heading" className="text-lg font-bold">Postcard Mail</h4>
      {card ? <>
        <p>Send a copy of a postcard you’ve collected. Your original and any replies stay in the Lighthouse Library album.</p>
        <label className="block space-y-1">
          <span className="font-semibold">Postcard</span>
          <select className={select} value={card} onChange={event => {
            setSelected(event.target.value as RetreatPostcardId);
            setRecipient("");
            setMessage("");
          }}>
            {cards.map(id => <option key={id} value={id}>{RETREAT_POSTCARDS[id].title}</option>)}
          </select>
        </label>
        <div className="w-full max-w-sm"><PostcardImage id={card} /></div>
        <label className="block space-y-1">
          <span className="font-semibold">Send to</span>
          <select className={select} value={target} onChange={event => {
            setRecipient(event.target.value as PostcardRecipient | "");
            setMessage("");
          }}>
            <option value="">Choose a recipient</option>
            {POSTCARD_RECIPIENT_IDS.map(id => <option key={id} value={id} disabled={sent.includes(id)}>
              {POSTCARD_RECIPIENTS[id].name}{sent.includes(id) ? " — already sent" : ""}
            </option>)}
          </select>
        </label>
        <button type="button" className={`${action} aria-disabled:opacity-50`} aria-disabled={!target} onClick={() => {
          if (!target || !sendRetreatPostcard(card, target)) return;
          const name = POSTCARD_RECIPIENTS[target].name;
          setMessage(`${target === "seaweed" ? "You left" : "You sent"} “${RETREAT_POSTCARDS[card].title}” ${target === "seaweed" ? "for" : "to"} ${name}. Their reply is in the Lighthouse Library album.`);
          setRecipient("");
        }}>{target === "seaweed" ? "Leave card for Seaweed" : "Send postcard"}</button>
        <p role="status" aria-atomic="true">{message}</p>
      </> : <p>Collect your first postcard at the Island Retreat, then come back to send a copy.</p>}
    </section>
  );
}
