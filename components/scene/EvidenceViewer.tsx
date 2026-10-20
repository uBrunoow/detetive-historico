"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DocumentSheet } from "@/components/document/DocumentSheet";
import { Button } from "@/components/ui/Button";
import type { Evidence } from "@/lib/content/schema";
import { useSettings } from "@/lib/settings/store";
import { strings } from "@/lib/strings/pt-BR";

type Props = {
  evidence: Evidence;
  collected: boolean;
  onCollect: () => void;
  onClose: () => void;
  titleId: string;
};

const t = strings.viewer;

/** A fonte em cima da mesa, à esquerda; a ficha de catálogo, à direita. */
export function EvidenceViewer({ evidence, collected, onCollect, onClose, titleId }: Props) {
  const [settings] = useSettings();
  const [plain, setPlain] = useState(settings.plainLetters);
  const [justCollected, setJustCollected] = useState(false);
  const collectedRef = useRef<HTMLParagraphElement>(null);

  // O botão some ao guardar: o foco vai para a confirmação, e não se perde.
  useEffect(() => {
    if (justCollected && collected) collectedRef.current?.focus();
  }, [justCollected, collected]);
  const statusId = useId();
  const handwritten = ["handwritten", "ledger", "drawing"].includes(evidence.presentation.style);

  return (
    <div className="grid md:grid-cols-[minmax(0,1.25fr)_minmax(18rem,1fr)]">
      <section aria-label={t.source} className="doc-shadow-desk px-4 py-8 sm:px-8 sm:py-10">

        <DocumentSheet
          presentation={evidence.presentation}
          transcription={evidence.transcription}
          image={evidence.image}
          plainLetters={plain}
          notesLabel={t.drawingNotes}
          overlayStamp={collected ? { text: t.archivedStamp, animate: justCollected } : undefined}
        />
        {handwritten && evidence.transcription && (
          <div className="mt-6 text-center">
            <button
              type="button"
              aria-pressed={plain}
              onClick={() => setPlain((p) => !p)}
              className="px-btn px-btn-paper text-base"
            >
              {plain ? t.handwriting : t.plainLetters}
            </button>
          </div>
        )}
      </section>

      <section aria-labelledby={titleId} className="flex flex-col bg-paper-0 px-5 py-6 sm:px-7">
        <div className="flex items-start justify-between gap-4 border-b-2 border-ink pb-3">
          <h2 id={titleId} className="font-pixel text-xl font-bold leading-tight">
            {evidence.title}
          </h2>
          <span className="shrink-0 bg-paper-2 px-2 py-0.5 font-pixel text-base px-frame-flat" title="Código de procedência">
            {evidence.code}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="font-pixel font-bold text-paper-5">{t.sourceType}</dt>
          <dd>{evidence.sourceType}</dd>
          {evidence.date && (
            <>
              <dt className="font-pixel font-bold text-paper-5">{t.date}</dt>
              <dd>{evidence.date.label}</dd>
            </>
          )}
          {evidence.author && (
            <>
              <dt className="font-pixel font-bold text-paper-5">{t.author}</dt>
              <dd>{evidence.author}</dd>
            </>
          )}
          <dt className="font-pixel font-bold text-paper-5">{t.provenance}</dt>
          <dd>{evidence.provenance}</dd>
        </dl>

        <h3 className="mt-5 font-pixel text-sm font-bold text-paper-5">{t.description}</h3>
        <p className="mt-1 max-w-prose">{evidence.description}</p>

        <p className="mt-5 border-t border-dashed border-paper-4 pt-3 text-sm text-paper-5">{t.caution}</p>

        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:flex-wrap">
          {collected ? (
            <p
              ref={collectedRef}
              tabIndex={-1}
              className="inline-flex min-h-touch items-center gap-2 px-4 font-pixel text-lg font-semibold text-stamp px-frame-flat [--px-line:var(--stamp)]"
            >
              <svg aria-hidden viewBox="0 0 8 8" className="size-5" fill="currentColor" shapeRendering="crispEdges">
                <path d="M1 4h1v1H1zM2 5h1v1H2zM3 6h1v1H3zM4 5h1v1H4zM5 4h1v1H5zM6 3h1v1H6zM7 2h1v1H7z" />
              </svg>
              {t.collected}
            </p>
          ) : (
            <Button
              onClick={() => {
                setJustCollected(true);
                onCollect();
              }}
              aria-describedby={statusId}
            >
              {t.collect}
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            {t.close}
          </Button>
        </div>
        <p id={statusId} role="status" className="sr-only">
          {collected ? t.collectedAnnouncement(evidence.title) : ""}
        </p>
      </section>
    </div>
  );
}
