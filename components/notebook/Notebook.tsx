"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { DocumentSheet } from "@/components/document/DocumentSheet";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { PublicCase } from "@/lib/content/schema";
import {
  addHypothesis,
  collectedCards,
  removeHypothesis,
  setCardNotes,
  setNotebookNotes,
  toggleImportant,
  updateHypothesis,
} from "@/lib/game/notebook";
import { undiscoveredCount } from "@/lib/game/scene";
import { locate } from "@/lib/game/timeline";
import type { CaseProgress } from "@/lib/progress/types";
import { useSettings } from "@/lib/settings/store";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.notebook;
const tv = strings.viewer;

type Tab = keyof typeof t.tabs;
const TABS: Tab[] = ["cards", "notes", "hypotheses"];

type View = { kind: "index" } | { kind: "card"; id: string } | { kind: "source"; id: string };

type Props = {
  caseData: PublicCase;
  progress: CaseProgress;
  update: (fn: (p: CaseProgress) => CaseProgress) => void;
  onClose: () => void;
  titleId: string;
  /** Link para a linha do tempo; omitido quando o caderno já está aberto sobre ela. */
  timelineHref?: string;
  closeLabel?: string;
};

/**
 * Caderno de investigação (PRD §5.6): abre por cima da cena, sem sair do lugar.
 * Três seções separadas: fontes (cartas), anotações e hipóteses.
 */
export function Notebook({ caseData, progress, update, onClose, titleId, timelineHref, closeLabel = t.close }: Props) {
  const [tab, setTab] = useState<Tab>("cards");
  const [view, setView] = useState<View>({ kind: "index" });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const tabsId = useId();
  const cards = collectedCards(caseData, progress);
  const remaining = undiscoveredCount(caseData, progress);

  // Ao trocar de ficha/fonte/índice o foco vai para o título da nova vista.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (view.kind === "index") document.getElementById(`${tabsId}-${tab}`)?.focus();
    else headingRef.current?.focus();
    // Só a troca de vista move o foco; trocar de aba já move pelo teclado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  function openCard(id: string) {
    setTab("cards");
    setView({ kind: "card", id });
  }

  function onTabKey(e: KeyboardEvent<HTMLDivElement>) {
    const i = TABS.indexOf(tab);
    const next =
      e.key === "ArrowRight" ? TABS[(i + 1) % TABS.length] : e.key === "ArrowLeft" ? TABS[(i - 1 + TABS.length) % TABS.length] : null;
    if (!next) return;
    e.preventDefault();
    setTab(next);
    document.getElementById(`${tabsId}-${next}`)?.focus();
  }

  const selected = view.kind !== "index" ? cards.find((c) => c.evidence.id === view.id) : undefined;

  return (
    <div className="bg-manila text-ink">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-5 sm:px-6">
        <h2 id={titleId} className="font-pixel text-2xl font-bold leading-tight">
          {t.title}
        </h2>
        <div className="flex flex-wrap gap-3">
          {timelineHref && (
            <ButtonLink variant="secondary" href={timelineHref}>
              {t.timeline}
            </ButtonLink>
          )}
          <Button variant="primary" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
        <p className="basis-full text-sm">
          {strings.scene.undiscovered(remaining)}
        </p>
      </header>

      {view.kind === "index" ? (
        <>
          <div role="tablist" aria-label={t.sections} onKeyDown={onTabKey} className="flex gap-1 px-4 sm:px-6">
            {TABS.map((id) => {
              const current = tab === id;
              const count = id === "cards" ? cards.length : id === "hypotheses" ? progress.hypotheses.length : null;
              return (
                <button
                  key={id}
                  id={`${tabsId}-${id}`}
                  type="button"
                  role="tab"
                  aria-selected={current}
                  aria-controls={`${tabsId}-${id}-panel`}
                  tabIndex={current ? 0 : -1}
                  onClick={() => setTab(id)}
                  className={`min-h-touch flex-1 px-2 font-pixel text-sm font-semibold sm:flex-none sm:px-4 sm:text-base focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-carbon ${
                    current ? "bg-paper-0" : "bg-manila-deep hover:brightness-105"
                  }`}
                >
                  {t.tabs[id]}
                  {count !== null && <span className="ml-2 opacity-75">{count}</span>}
                </button>
              );
            })}
          </div>
          <div
            role="tabpanel"
            id={`${tabsId}-${tab}-panel`}
            aria-labelledby={`${tabsId}-${tab}`}
            className="min-h-[24rem] bg-paper-0 px-4 py-6 sm:px-6"
          >
            {tab === "cards" && <CardsIndex cards={cards} progress={progress} onOpen={openCard} />}
            {tab === "notes" && <NotesPanel caseData={caseData} progress={progress} update={update} onOpen={openCard} />}
            {tab === "hypotheses" && <HypothesesPanel progress={progress} update={update} />}
          </div>
        </>
      ) : selected ? (
        <div className="bg-paper-0 px-4 py-6 sm:px-6">
          <button
            type="button"
            onClick={() => setView(view.kind === "source" ? { kind: "card", id: view.id } : { kind: "index" })}
            className="px-btn px-btn-paper text-base"
          >
            <svg aria-hidden viewBox="0 0 8 8" className="size-4" fill="currentColor" shapeRendering="crispEdges">
              <path d="M5 1h1v1H5zM4 2h1v1H4zM3 3h1v2H3zM4 5h1v1H4zM5 6h1v1H5z" />
            </svg>
            {view.kind === "source" ? t.backToCard : t.allCards}
          </button>
          {view.kind === "card" ? (
            <CardBack
              entry={selected}
              progress={progress}
              headingRef={headingRef}
              update={update}
              onSource={() => setView({ kind: "source", id: view.id })}
            />
          ) : (
            <SourceView evidence={selected.evidence} headingRef={headingRef} />
          )}
        </div>
      ) : null}
    </div>
  );
}

type Entry = ReturnType<typeof collectedCards>[number];

function TimelineState({ progress, id }: { progress: CaseProgress; id: string }) {
  const where = locate(progress.timeline, id).where;
  return (
    <span className={`font-pixel text-xs font-bold ${where === "notebook" ? "text-paper-5" : "text-stamp"}`}>
      {strings.timeline.status[where]}
    </span>
  );
}

function CardsIndex({ cards, progress, onOpen }: { cards: Entry[]; progress: CaseProgress; onOpen: (id: string) => void }) {
  if (cards.length === 0) return <p className="max-w-prose">{t.empty}</p>;
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] sm:gap-6">
      {cards.map(({ evidence, card }) => (
        <li key={evidence.id}>
          <button
            type="button"
            onClick={() => onOpen(evidence.id)}
            className="group flex h-full w-full flex-col bg-paper-0 text-left px-frame hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-6 focus-visible:outline-carbon"
          >
            <span className="relative block aspect-[4/3] overflow-hidden bg-paper-2">
              <Image src={evidence.image.src} alt="" fill unoptimized sizes="12rem" className="pixelated object-cover" />
              {card.important && (
                <span className="absolute left-1.5 top-1.5 bg-ribbon px-1.5 py-0.5 font-pixel text-xs font-bold text-paper-0">
                  ★ {t.important}
                </span>
              )}
            </span>
            <span className="flex flex-1 flex-col gap-1 p-3">
              <span className="font-pixel text-base font-semibold leading-tight">{evidence.title}</span>
              <span className="text-sm text-paper-5">{evidence.sourceType}</span>
              <span className="mt-auto flex flex-wrap gap-x-2 pt-1">
                <TimelineState progress={progress} id={evidence.id} />
                {card.notes.trim() && <span className="font-pixel text-xs font-bold text-graphite">· {t.withNotes}</span>}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function CardBack({
  entry: { evidence, card },
  progress,
  headingRef,
  update,
  onSource,
}: {
  entry: Entry;
  progress: CaseProgress;
  headingRef: RefObject<HTMLHeadingElement | null>;
  update: Props["update"];
  onSource: () => void;
}) {
  const notesId = useId();
  return (
    <article className="mt-6 grid gap-6 md:grid-cols-[14rem_minmax(0,1fr)]">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-paper-2 px-frame-flat">
          <Image src={evidence.image.src} alt={evidence.image.alt} fill unoptimized sizes="14rem" className="pixelated object-cover" />
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <Button variant="manila" onClick={onSource}>
            {t.fullSource}
          </Button>
          <Button
            variant="secondary"
            aria-pressed={card.important}
            onClick={() => update((p) => toggleImportant(p, evidence.id))}
          >
            <span aria-hidden className={card.important ? "text-ribbon" : "text-paper-4"}>
              ★
            </span>
            {card.important ? t.unmarkImportant : t.markImportant}
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-start justify-between gap-4 border-b-2 border-ink pb-3">
          <h3 ref={headingRef} tabIndex={-1} className="font-pixel text-xl font-bold leading-tight focus:outline-none">
            {evidence.title}
          </h3>
          <span className="shrink-0 bg-paper-2 px-2 py-0.5 font-pixel text-base px-frame-flat">{evidence.code}</span>
        </div>
        <p className="mt-2">
          <TimelineState progress={progress} id={evidence.id} />
        </p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="font-pixel font-bold text-paper-5">{tv.sourceType}</dt>
          <dd>{evidence.sourceType}</dd>
          {evidence.date && (
            <>
              <dt className="font-pixel font-bold text-paper-5">{tv.date}</dt>
              <dd>{evidence.date.label}</dd>
            </>
          )}
          {evidence.author && (
            <>
              <dt className="font-pixel font-bold text-paper-5">{tv.author}</dt>
              <dd>{evidence.author}</dd>
            </>
          )}
          <dt className="font-pixel font-bold text-paper-5">{tv.provenance}</dt>
          <dd>{evidence.provenance}</dd>
        </dl>
        <h4 className="mt-5 font-pixel text-sm font-bold text-paper-5">{tv.description}</h4>
        <p className="mt-1 max-w-prose">{evidence.description}</p>
        <h4 className="mt-4 font-pixel text-sm font-bold text-paper-5">{t.back}</h4>
        <p className="mt-1 max-w-prose">{evidence.back}</p>

        <label htmlFor={notesId} className="mt-6 block font-pixel text-base font-bold">
          {t.cardNotes}
        </label>
        <p id={`${notesId}-hint`} className="text-sm text-paper-5">
          {t.cardNotesHint}
        </p>
        <NotesArea
          id={notesId}
          describedBy={`${notesId}-hint`}
          value={card.notes}
          onChange={(v) => update((p) => setCardNotes(p, evidence.id, v))}
        />
      </div>
    </article>
  );
}

function SourceView({
  evidence,
  headingRef,
}: {
  evidence: Entry["evidence"];
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [settings] = useSettings();
  const [plain, setPlain] = useState(settings.plainLetters);
  const handwritten = ["handwritten", "ledger", "drawing"].includes(evidence.presentation.style);
  return (
    <section className="mt-6">
      <h3 ref={headingRef} tabIndex={-1} className="font-pixel text-xl font-bold focus:outline-none">
        {evidence.title}
      </h3>
      <div className="doc-shadow-desk mt-4 px-4 py-8 sm:px-8">
        <DocumentSheet
          presentation={evidence.presentation}
          transcription={evidence.transcription}
          image={evidence.image}
          plainLetters={plain}
          notesLabel={tv.drawingNotes}
          overlayStamp={{ text: tv.archivedStamp, animate: false }}
        />
        {handwritten && evidence.transcription && (
          <div className="mt-6 text-center">
            <button type="button" aria-pressed={plain} onClick={() => setPlain((p) => !p)} className="px-btn px-btn-paper text-base">
              {plain ? tv.handwriting : tv.plainLetters}
            </button>
          </div>
        )}
      </div>
      <p className="mt-4 max-w-prose text-sm text-paper-5">{tv.caution}</p>
    </section>
  );
}

/** Caixa de anotação em grafite, salva a cada tecla. */
function NotesArea({
  id,
  value,
  onChange,
  describedBy,
  rows = 5,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  describedBy?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      aria-describedby={describedBy}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 block w-full resize-y bg-paper-1 bg-[repeating-linear-gradient(transparent,transparent_calc(1.75rem-1px),var(--paper-3)_calc(1.75rem-1px),var(--paper-3)_1.75rem)] px-3 py-1 font-hand text-lg leading-7 text-graphite px-frame-flat [--px-line:var(--paper-4)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-carbon"
    />
  );
}

function NotesPanel({
  caseData,
  progress,
  update,
  onOpen,
}: {
  caseData: PublicCase;
  progress: CaseProgress;
  update: Props["update"];
  onOpen: (id: string) => void;
}) {
  const id = useId();
  const withNotes = collectedCards(caseData, progress).filter(({ card }) => card.notes.trim());
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <label htmlFor={id} className="font-pixel text-lg font-bold">
          {t.generalNotes}
        </label>
        <p id={`${id}-hint`} className="text-sm text-paper-5">
          {t.generalNotesHint}
        </p>
        <NotesArea
          id={id}
          rows={10}
          describedBy={`${id}-hint`}
          value={progress.notes}
          onChange={(v) => update((p) => setNotebookNotes(p, v))}
        />
      </div>
      <div>
        <h4 className="font-pixel text-lg font-bold">{t.notesOnCards}</h4>
        {withNotes.length === 0 ? (
          <p className="mt-2 text-paper-5">{t.noNotesOnCards}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-4">
            {withNotes.map(({ evidence, card }) => (
              <li key={evidence.id} className="bg-paper-1 p-3 px-frame-flat [--px-line:var(--paper-3)]">
                <button
                  type="button"
                  onClick={() => onOpen(evidence.id)}
                  aria-label={t.openCard(evidence.title)}
                  className="font-pixel text-base font-semibold underline decoration-2 underline-offset-4 hover:text-carbon"
                >
                  {evidence.title}
                </button>
                <p className="mt-1 whitespace-pre-wrap font-hand text-lg leading-7 text-graphite">{card.notes}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function HypothesesPanel({ progress, update }: { progress: CaseProgress; update: Props["update"] }) {
  const [draft, setDraft] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);
  const newId = useId();

  return (
    <div className="max-w-3xl">
      <p className="max-w-prose">{t.hypothesesIntro}</p>

      <form
        className="mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          update((p) => addHypothesis(p, draft));
          setDraft("");
        }}
      >
        <label htmlFor={newId} className="font-pixel text-lg font-bold">
          {t.newHypothesis}
        </label>
        <NotesArea id={newId} rows={3} value={draft} onChange={setDraft} />
        <Button type="submit" className="mt-3" aria-disabled={!draft.trim() || undefined}>
          {t.addHypothesis}
        </Button>
      </form>

      {progress.hypotheses.length === 0 ? (
        <p className="mt-8 text-paper-5">{t.noHypotheses}</p>
      ) : (
        <ol className="mt-8 flex flex-col gap-6">
          {progress.hypotheses.map((h, i) => {
            const fieldId = `${newId}-${h.id}`;
            return (
              <li key={h.id} className="bg-paper-1 p-4 px-frame-flat [--px-line:var(--paper-3)]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <label htmlFor={fieldId} className="font-pixel text-base font-bold">
                    {t.hypothesis(i + 1)}
                  </label>
                  <span className="font-pixel text-xs font-bold uppercase tracking-wide text-stamp">{t.hypothesisTag}</span>
                </div>
                <NotesArea
                  id={fieldId}
                  rows={3}
                  value={h.text}
                  onChange={(v) => update((p) => updateHypothesis(p, h.id, v))}
                />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {confirming === h.id ? (
                    <>
                      <span role="status" className="font-semibold">
                        {t.confirmRemove}
                      </span>
                      <Button
                        variant="primary"
                        onClick={() => {
                          update((p) => removeHypothesis(p, h.id));
                          setConfirming(null);
                          document.getElementById(newId)?.focus();
                        }}
                      >
                        {t.yes}
                      </Button>
                      <Button variant="secondary" autoFocus onClick={() => setConfirming(null)}>
                        {t.no}
                      </Button>
                    </>
                  ) : (
                    <Button variant="secondary" className="text-base" onClick={() => setConfirming(h.id)}>
                      {t.remove}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
