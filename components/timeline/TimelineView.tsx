"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Notebook } from "@/components/notebook/Notebook";
import { CheckPanel } from "@/components/timeline/CheckPanel";
import { LinksPanel } from "@/components/timeline/LinksPanel";
import { PlacedCard } from "@/components/timeline/PlacedCard";
import { Dialog } from "@/components/ui/Dialog";
import { Loading } from "@/components/ui/Loading";
import type { PublicCase } from "@/lib/content/schema";
import {
  activeLinks,
  addLink,
  joinPrevious,
  locate,
  moveCard,
  moveToOutside,
  placeCard,
  placedCount,
  placementOf,
  removeLink,
  returnToNotebook,
  separate,
  setCertainty,
  setPlacementReason,
  updateLinkExplanation,
} from "@/lib/game/timeline";
import { useGameState } from "@/lib/game/use-game-state";
import { useHydrated, useProgress } from "@/lib/progress/store";
import type { CaseProgress } from "@/lib/progress/types";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.timeline;

const field =
  "block min-h-touch w-full bg-paper-1 px-3 text-base px-frame-flat [--px:2px] [--px-line:var(--paper-4)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-carbon";

/**
 * Linha do tempo do jogador (PRD §5.7.2). Vertical em todas as larguras, para caber
 * no celular e ser lida de cima para baixo; tudo se faz por botões e teclado.
 */
export function TimelineView({ caseData }: { caseData: PublicCase }) {
  const [progress, update] = useProgress(caseData.slug);
  const hydrated = useHydrated();
  const [message, setMessage] = useState("");
  const [notebookOpen, setNotebookOpen] = useState(false);
  const notebookTitleId = useId();
  const focusNext = useRef<string | null>(null);
  const game = useGameState(caseData.slug);

  const evidence = useMemo(() => new Map(caseData.evidence.map((e) => [e.id, e])), [caseData]);
  const titleOf = (id: string) => evidence.get(id)?.title ?? id;

  // Depois de mover uma carta, o foco segue a carta (ou o controle equivalente).
  useEffect(() => {
    if (!focusNext.current) return;
    document.getElementById(focusNext.current)?.focus();
    focusNext.current = null;
  }, [progress]);

  if (!hydrated) return <Loading dark />;

  const tl = progress.timeline;
  // Ignora ids que não existem mais no caso (conteúdo editado depois de salvo).
  const slots = tl.slots.map((s) => s.filter((id) => evidence.has(id))).filter((s) => s.length > 0);
  const outside = tl.outside.filter((id) => evidence.has(id));
  const unplaced = caseData.evidence.filter((e) => progress.cards[e.id] && locate(tl, e.id).where === "notebook");
  const inPlay = [...slots.flat(), ...outside].map((id) => ({ id, title: titleOf(id) }));
  const links = activeLinks(tl);
  const placed = placedCount(tl);
  const sceneId =
    progress.lastSceneId && caseData.scenes.some((s) => s.id === progress.lastSceneId)
      ? progress.lastSceneId
      : caseData.startSceneId;
  const collectedAny = caseData.evidence.some((e) => progress.cards[e.id]);

  function describe(next: CaseProgress, id: string) {
    const loc = locate(next.timeline, id);
    if (loc.where === "outside") return t.announce.outside(titleOf(id));
    if (loc.where === "notebook") return t.announce.notebook(titleOf(id));
    if (next.timeline.slots[loc.slot].length > 1) return t.announce.joined(titleOf(id), loc.slot + 1);
    return t.announce.placed(titleOf(id), loc.slot + 1, next.timeline.slots.length);
  }

  /** Aplica uma regra, anuncia o resultado e diz para onde vai o foco. */
  function act(id: string, rule: (p: CaseProgress) => CaseProgress, focusId: string) {
    const next = rule(progress);
    if (next === progress) {
      setMessage(t.announce.edge(titleOf(id)));
      return;
    }
    focusNext.current = focusId;
    update(() => next);
    setMessage(describe(next, id));
  }

  return (
    <div className="flex min-h-dvh flex-col bg-wood">
      <header className="text-on-wood">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link href={`/casos/${caseData.slug}/cena/${sceneId}`} className="px-btn px-btn-paper text-base">
            <svg aria-hidden viewBox="0 0 8 8" className="size-4" fill="currentColor" shapeRendering="crispEdges">
              <path d="M5 1h1v1H5zM4 2h1v1H4zM3 3h1v2H3zM4 5h1v1H4zM5 6h1v1H5z" />
            </svg>
            {t.backToScene}
          </Link>
          <p className="order-last basis-full font-pixel text-lg font-semibold leading-snug sm:order-none sm:min-w-0 sm:flex-1 sm:basis-auto sm:truncate sm:text-xl">
            {caseData.title}
          </p>
          <button
            type="button"
            onClick={() => setNotebookOpen(true)}
            aria-label={strings.notebook.openLabel(Object.keys(progress.cards).length)}
            className="px-btn ml-auto text-base"
          >
            <Image src="/art/ui/pasta.png" alt="" width={24} height={24} unoptimized className="pixelated" />
            {strings.notebook.open}
          </button>
        </div>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 sm:px-6">
        <h1 className="px-title mt-4 text-[clamp(2.25rem,6vw,3.25rem)] leading-none text-[#f0d9a0]">{t.title}</h1>
        <p className="mt-4 max-w-2xl text-on-wood">{t.intro}</p>
        <p className="mt-2 max-w-2xl text-sm text-on-wood/85">{t.yours}</p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <p className="inline-block bg-manila px-4 py-2 font-pixel text-base font-semibold text-ink px-frame-flat">
            {t.resolveProgress(placed, caseData.minCardsToResolve)}
          </p>
          {placed >= caseData.minCardsToResolve && (
            <Link href={`/casos/${caseData.slug}/conclusao`} className="px-btn px-btn-ink text-base">
              {strings.resolution.open}
            </Link>
          )}
        </div>

        <p role="status" aria-live="polite" className="sr-only">
          {message}
        </p>

        {!collectedAny ? (
          <p className="mt-10 max-w-xl bg-paper-0 p-5 text-ink px-frame">{t.noCards}</p>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <section aria-labelledby="tl-strip">
              <h2 id="tl-strip" className="sr-only">
                {t.strip}
              </h2>
              <p className="inline-block bg-ribbon px-3 py-1 font-pixel text-base font-bold text-paper-0">
                {t.start}: {caseData.timeline.startLabel}
              </p>
              {slots.length === 0 ? (
                <p className="my-4 border-l-4 border-dashed border-manila py-6 pl-6 text-on-wood">{t.emptyStrip}</p>
              ) : (
                <ol className="my-2 border-l-4 border-manila">
                  {slots.map((slot, i) => (
                    <li key={slot.join("+")} className="relative py-4 pl-6 sm:pl-10">
                      <span
                        aria-hidden
                        className="absolute -left-[0.95rem] top-7 grid size-7 place-items-center bg-manila font-pixel text-sm font-bold text-ink px-frame-flat [--px:2px]"
                      >
                        {i + 1}
                      </span>
                      <span className="sr-only">{t.position(i + 1)}</span>
                      {slot.length > 1 ? (
                        <div className="border-4 border-dashed border-manila p-3 sm:p-4">
                          <p className="mb-3 font-pixel text-base font-bold text-[#f0d9a0]">{t.simultaneous}</p>
                          <ul className="flex flex-col gap-6">
                            {slot.map((id) => (
                              <li key={id}>{renderCard(id, i, true)}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        renderCard(slot[0], i, false)
                      )}
                    </li>
                  ))}
                </ol>
              )}
              <p className="inline-block bg-ribbon px-3 py-1 font-pixel text-base font-bold text-paper-0">
                {t.end}: {caseData.timeline.endLabel}
              </p>
            </section>

            <aside className="flex flex-col gap-8 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:self-start lg:overflow-y-auto lg:p-2">
              <section aria-labelledby="tl-notebook" className="bg-manila p-4 text-ink px-frame">
                <h2 id="tl-notebook" className="font-pixel text-lg font-bold">
                  {t.notebook}
                </h2>
                <p className="text-sm">{t.notebookHint}</p>
                {unplaced.length === 0 ? (
                  <p className="mt-3 text-sm">{t.notebookEmpty}</p>
                ) : (
                  <ul className="mt-4 flex flex-col gap-4">
                    {unplaced.map((e) => (
                      <li key={e.id} className="bg-paper-0 p-3 px-frame-flat [--px:2px]">
                        <div className="flex items-center gap-3">
                          <span className="relative size-12 shrink-0 overflow-hidden bg-paper-2">
                            <Image src={e.image.src} alt="" fill unoptimized sizes="3rem" className="pixelated object-cover" />
                          </span>
                          <h3 id={`tl-${e.id}-nb`} tabIndex={-1} className="font-pixel text-base font-semibold leading-tight focus:outline-none">
                            {e.title}
                          </h3>
                        </div>
                        <form
                          className="mt-3 flex flex-wrap items-end gap-2"
                          onSubmit={(ev) => {
                            ev.preventDefault();
                            const where = new FormData(ev.currentTarget).get("at");
                            const at = where === "end" ? Number.POSITIVE_INFINITY : Number(where);
                            act(e.id, (p) => placeCard(p, e.id, at), `tl-${e.id}-title`);
                          }}
                        >
                          <label className="min-w-0 flex-1">
                            <span className="sr-only">{t.placeWhere(e.title)}</span>
                            <select name="at" defaultValue="end" className={field}>
                              <option value="end">{t.atEnd}</option>
                              {slots.length > 0 && <option value="0">{t.atStart}</option>}
                              {slots.map((s, i) => (
                                <option key={s.join("+")} value={i + 1}>
                                  {t.after_(s.map(titleOf).join(" + "))}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button type="submit" className="px-btn px-btn-ink text-base">
                            {t.place}
                          </button>
                        </form>
                        <button
                          type="button"
                          onClick={() => act(e.id, (p) => moveToOutside(p, e.id), `tl-${e.id}-out`)}
                          className="px-btn px-btn-paper mt-3 text-base"
                        >
                          {t.toOutside}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <CheckPanel
                slug={caseData.slug}
                progress={progress}
                update={update}
                state={game.state}
                onState={game.setState}
              />

              <section aria-labelledby="tl-outside" className="bg-paper-2 p-4 text-ink px-frame [background-image:repeating-linear-gradient(-45deg,transparent_0_10px,rgb(0_0_0/0.04)_10px_20px)]">
                <h2 id="tl-outside" className="font-pixel text-lg font-bold">
                  {t.outside}
                </h2>
                <p className="text-sm text-paper-5">{t.outsideHint}</p>
                {outside.length === 0 ? (
                  <p className="mt-3 text-sm text-paper-5">{t.outsideEmpty}</p>
                ) : (
                  <ul className="mt-4 flex flex-col gap-4">
                    {outside.map((id) => (
                      <li key={id} className="bg-paper-0 p-3 px-frame-flat [--px:2px]">
                        <h3 id={`tl-${id}-out`} tabIndex={-1} className="font-pixel text-base font-semibold leading-tight line-through decoration-ribbon decoration-2 focus:outline-none">
                          {titleOf(id)}
                        </h3>
                        <label htmlFor={`tl-${id}-outreason`} className="mt-2 block text-sm text-paper-5">
                          {t.outsideReason}
                        </label>
                        <textarea
                          id={`tl-${id}-outreason`}
                          rows={2}
                          value={placementOf(progress, id).reason}
                          onChange={(ev) => update((p) => setPlacementReason(p, id, ev.target.value))}
                          className={`${field} mt-1 resize-y py-1.5 font-hand text-lg leading-7 text-graphite`}
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => act(id, (p) => placeCard(p, id), `tl-${id}-title`)}
                            className="px-btn px-btn-paper text-base"
                          >
                            {t.toTimeline}
                          </button>
                          <button
                            type="button"
                            onClick={() => act(id, (p) => returnToNotebook(p, id), `tl-${id}-nb`)}
                            className="px-btn px-btn-paper text-base"
                          >
                            {t.toNotebook}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </aside>

            <div className="lg:col-span-2">
              <LinksPanel
                cards={inPlay}
                links={links}
                titleOf={titleOf}
                onAdd={(link) => {
                  const next = addLink(progress, link);
                  if (next === progress) return false;
                  update(() => next);
                  setMessage(t.announce.linked);
                  return true;
                }}
                onExplain={(id, text) => update((p) => updateLinkExplanation(p, id, text))}
                onRemove={(id) => {
                  update((p) => removeLink(p, id));
                  setMessage(t.announce.unlinked);
                }}
              />
            </div>
          </div>
        )}
      </main>

      <Dialog open={notebookOpen} onClose={() => setNotebookOpen(false)} labelledBy={notebookTitleId} className="max-w-6xl">
        <Notebook
          caseData={caseData}
          progress={progress}
          update={update}
          onClose={() => setNotebookOpen(false)}
          titleId={notebookTitleId}
          closeLabel={strings.notebook.backToTimeline}
        />
      </Dialog>
    </div>
  );

  function renderCard(id: string, slotIndex: number, grouped: boolean) {
    const e = evidence.get(id)!;
    const solo = !grouped;
    return (
      <PlacedCard
        evidence={e}
        placement={placementOf(progress, id)}
        grouped={grouped}
        canMoveUp={grouped || slotIndex > 0}
        canMoveDown={grouped || slotIndex < slots.length - 1}
        canJoin={solo && slotIndex > 0}
        links={links.filter((l) => l.from === id || l.to === id)}
        titleOf={titleOf}
        onMove={(dir) => act(id, (p) => moveCard(p, id, dir), `tl-${id}-${dir < 0 ? "up" : "down"}`)}
        onJoin={() => act(id, (p) => joinPrevious(p, id), `tl-${id}-title`)}
        onSeparate={() => act(id, (p) => separate(p, id), `tl-${id}-title`)}
        onOutside={() => act(id, (p) => moveToOutside(p, id), `tl-${id}-out`)}
        onNotebook={() => act(id, (p) => returnToNotebook(p, id), `tl-${id}-nb`)}
        onCertainty={(c) => update((p) => setCertainty(p, id, c))}
        onReason={(reason) => update((p) => setPlacementReason(p, id, reason))}
      />
    );
  }
}
