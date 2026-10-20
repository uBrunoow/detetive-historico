"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { LinkType } from "@/lib/content/schema";
import type { CardLink } from "@/lib/progress/types";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.timeline;
const TYPES = Object.keys(t.linkTypes) as LinkType[];

type Props = {
  /** Cartas em jogo (na linha do tempo ou fora da história), na ordem em que aparecem. */
  cards: { id: string; title: string }[];
  links: CardLink[];
  titleOf: (id: string) => string;
  onAdd: (link: { from: string; to: string; type: LinkType; explanation: string }) => boolean;
  onExplain: (id: string, explanation: string) => void;
  onRemove: (id: string) => void;
};

const field =
  "mt-1 block min-h-touch w-full bg-paper-1 px-3 text-base px-frame-flat [--px:2px] [--px-line:var(--paper-4)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-carbon";

/** Ligações entre cartas: tipo + explicação, ancoradas na linha do tempo (PRD §5.7.2). */
export function LinksPanel({ cards, links, titleOf, onAdd, onExplain, onRemove }: Props) {
  const uid = useId();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState<LinkType>("caused");
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");

  // Mantém a escolha válida quando cartas entram ou saem do jogo.
  const fromId = cards.some((c) => c.id === from) ? from : (cards[0]?.id ?? "");
  const toId = cards.some((c) => c.id === to) ? to : (cards[1]?.id ?? "");

  return (
    <section aria-labelledby={`${uid}-h`} className="bg-paper-0 p-4 text-ink px-frame sm:p-6">
      <h2 id={`${uid}-h`} className="font-pixel text-xl font-bold">
        {t.links}
      </h2>
      <p className="mt-1 max-w-prose text-sm text-paper-5">{t.linksHint}</p>

      {cards.length < 2 ? (
        <p className="mt-4">{t.linksNeedTwo}</p>
      ) : (
        <form
          className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr]"
          onSubmit={(e) => {
            e.preventDefault();
            if (fromId === toId) return setError(t.linkSame);
            const ok = onAdd({ from: fromId, to: toId, type, explanation });
            if (!ok) return setError(t.linkExists);
            setError("");
            setExplanation("");
          }}
        >
          <div>
            <label htmlFor={`${uid}-from`} className="font-pixel text-sm font-bold text-paper-5">
              {t.linkFrom}
            </label>
            <select id={`${uid}-from`} value={fromId} onChange={(e) => setFrom(e.target.value)} className={field}>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-type`} className="font-pixel text-sm font-bold text-paper-5">
              {t.linkType}
            </label>
            <select id={`${uid}-type`} value={type} onChange={(e) => setType(e.target.value as LinkType)} className={field}>
              {TYPES.map((k) => (
                <option key={k} value={k}>
                  {t.linkTypes[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-to`} className="font-pixel text-sm font-bold text-paper-5">
              {t.linkTo}
            </label>
            <select id={`${uid}-to`} value={toId} onChange={(e) => setTo(e.target.value)} className={field}>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label htmlFor={`${uid}-exp`} className="font-pixel text-sm font-bold text-paper-5">
              {t.linkExplanation}
            </label>
            <textarea
              id={`${uid}-exp`}
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className={`${field} resize-y py-1.5 font-hand text-lg leading-7 text-graphite`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 md:col-span-3">
            <Button type="submit">{t.addLink}</Button>
            <p role="status" className="font-semibold text-ribbon">
              {error}
            </p>
          </div>
        </form>
      )}

      {links.length === 0 ? (
        <p className="mt-6 text-paper-5">{t.noLinks}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {links.map((l) => {
            const label = t.linkLabel(titleOf(l.from), t.linkTypes[l.type], titleOf(l.to));
            return (
              <li key={l.id} className="bg-paper-1 p-3 px-frame-flat [--px:2px] [--px-line:var(--paper-3)]">
                <label htmlFor={`${uid}-${l.id}`} className="font-pixel text-base font-semibold">
                  {titleOf(l.from)} <span className="text-stamp">{t.linkTypes[l.type]}</span> {titleOf(l.to)}
                </label>
                <textarea
                  id={`${uid}-${l.id}`}
                  rows={2}
                  value={l.explanation}
                  onChange={(e) => onExplain(l.id, e.target.value)}
                  className={`${field} resize-y bg-paper-0 py-1.5 font-hand text-lg leading-7 text-graphite`}
                />
                <button
                  type="button"
                  aria-label={`${t.removeLink}: ${label}`}
                  onClick={() => onRemove(l.id)}
                  className="px-btn px-btn-paper mt-3 text-base"
                >
                  {t.removeLink}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
