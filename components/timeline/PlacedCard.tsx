"use client";

import Image from "next/image";
import type { Evidence } from "@/lib/content/schema";
import type { CardLink, Certainty, Placement } from "@/lib/progress/types";
import { strings } from "@/lib/strings/pt-BR";
import { Dialog } from "@/components/ui/Dialog";
import { DocumentSheet } from "@/components/document/DocumentSheet";
import { useId, useState } from "react";

const t = strings.timeline;
const CERTAINTIES: Certainty[] = ["certain", "probable", "uncertain"];

type Props = {
  evidence: Evidence;
  placement: Placement;
  grouped: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canJoin: boolean;
  links: CardLink[];
  titleOf: (id: string) => string;
  onMove: (dir: -1 | 1) => void;
  onJoin: () => void;
  onSeparate: () => void;
  onOutside: () => void;
  onNotebook: () => void;
  onCertainty: (c: Certainty) => void;
  onReason: (reason: string) => void;
  open: boolean;
  onToggle: () => void;
  position: number;
};

const arrowUp = "M3 1h2v1h1v1h1v1H5v3H3V4H1V3h1V2h1z";
const arrowDown = "M3 1h2v3h2v1H6v1H5v1H3V6H2V5H1V4h2z";

/** Uma carta na linha do tempo: certeza, justificativa, ligações e ações por botão. */
export function PlacedCard(p: Props) {
  const { evidence: e, placement } = p;
  const id = `tl-${e.id}`;
  const dialogId = useId();
  const [sourceOpen, setSourceOpen] = useState(false);
  return (
    <article aria-labelledby={`${id}-title`} className="bg-paper-0 p-2 text-ink px-frame sm:p-3">
      <div className="flex min-h-[56px] items-center gap-3">
        <span className="relative h-9 w-12 shrink-0 overflow-hidden bg-paper-2 px-frame-flat [--px:2px]">
          <Image src={e.image.src} alt="" fill unoptimized sizes="3rem" className="pixelated object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 id={`${id}-title`} tabIndex={-1} className="truncate text-base font-bold leading-tight focus:outline-none">
            {e.title}
          </h3>
          <p className="truncate text-xs text-paper-5">{e.date?.label ?? t.noDate}</p>
        </div>
        <span aria-label={t.positionLabel(e.title)} className="font-pixel text-sm font-bold">{p.position}</span>
        <button type="button" className="px-btn px-btn-paper text-sm" aria-expanded={p.open} onClick={p.onToggle}>
          {p.open ? t.closeCard : t.openCard}
        </button>
      </div>
      {p.open && <div className="mt-3 border-t-2 border-paper-3 pt-3">
        <fieldset>
          <legend className="font-pixel text-sm font-bold text-paper-5">{t.certainty}</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {CERTAINTIES.map((c) => (
              <label
                key={c}
                className="inline-flex min-h-touch cursor-pointer items-center gap-1.5 bg-paper-1 px-3 text-sm px-frame-flat [--px:2px] [--px-line:var(--paper-4)] has-checked:bg-ink has-checked:text-paper-0 has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-carbon"
              >
                <input
                  type="radio"
                  name={`${id}-certainty`}
                  value={c}
                  checked={placement.certainty === c}
                  onChange={() => p.onCertainty(c)}
                  className="sr-only"
                />
                <span className="font-pixel font-semibold">{t.certaintyOptions[c].label}</span>
                <span className="hidden opacity-80 sm:inline">— {t.certaintyOptions[c].hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label htmlFor={`${id}-reason`} className="mt-3 block font-pixel text-sm font-bold text-paper-5">
          {t.reason}
        </label>
        <textarea
          id={`${id}-reason`}
          rows={2}
          value={placement.reason}
          placeholder={t.reasonHint}
          onChange={(ev) => p.onReason(ev.target.value)}
          className="mt-1 block w-full resize-y bg-paper-1 px-3 py-1.5 font-hand text-lg leading-7 text-graphite placeholder:font-sans placeholder:text-sm placeholder:text-paper-5 px-frame-flat [--px:2px] [--px-line:var(--paper-4)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-carbon"
        />

        {p.links.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1 text-sm">
            {p.links.map((l) => (
              <li key={l.id} className="text-graphite">
                <span aria-hidden>↔ </span>
                {t.linkLabel(p.titleOf(l.from), t.linkTypes[l.type], p.titleOf(l.to))}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-start gap-3">
          <button
            id={`${id}-up`}
            type="button"
            aria-label={t.moveUp(e.title)}
            aria-disabled={!p.canMoveUp || undefined}
            onClick={() => p.canMoveUp && p.onMove(-1)}
            className="px-btn px-btn-paper px-3 text-base"
          >
            <svg aria-hidden viewBox="0 0 8 8" className="size-4" fill="currentColor" shapeRendering="crispEdges">
              <path d={arrowUp} />
            </svg>
            {t.before}
          </button>
          <button
            id={`${id}-down`}
            type="button"
            aria-label={t.moveDown(e.title)}
            aria-disabled={!p.canMoveDown || undefined}
            onClick={() => p.canMoveDown && p.onMove(1)}
            className="px-btn px-btn-paper px-3 text-base"
          >
            <svg aria-hidden viewBox="0 0 8 8" className="size-4" fill="currentColor" shapeRendering="crispEdges">
              <path d={arrowDown} />
            </svg>
            {t.after}
          </button>
          <details className="group/more">
            <summary className="px-btn px-btn-paper list-none px-3 text-base [&::-webkit-details-marker]:hidden">
              {t.more}
              <span aria-hidden className="transition-transform group-open/more:rotate-180">▾</span>
            </summary>
            <div className="mt-3 flex flex-col items-start gap-3">
              {p.grouped ? (
                <button type="button" onClick={p.onSeparate} className="px-btn px-btn-paper text-base">
                  {t.separate}
                </button>
              ) : (
                p.canJoin && (
                  <button type="button" onClick={p.onJoin} className="px-btn px-btn-paper text-base">
                    {t.joinPrevious}
                  </button>
                )
              )}
              <button type="button" onClick={p.onOutside} className="px-btn px-btn-paper text-base">
                {t.toOutside}
              </button>
              <button type="button" onClick={p.onNotebook} className="px-btn px-btn-paper text-base">
                {t.toNotebook}
              </button>
              <button type="button" onClick={() => setSourceOpen(true)} className="px-btn px-btn-paper text-base">
                {t.viewSource}
              </button>
            </div>
          </details>
        </div>
      </div>}
      <Dialog open={sourceOpen} onClose={() => setSourceOpen(false)} labelledBy={dialogId}>
        <div className="p-4"><h2 id={dialogId} className="sr-only">{t.viewSource}: {e.title}</h2><DocumentSheet presentation={e.presentation} transcription={e.transcription} image={e.image} /></div>
      </Dialog>
    </article>
  );
}
