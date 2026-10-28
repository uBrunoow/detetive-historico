"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type KeyboardEvent } from "react";
import { NightSky } from "@/components/pixel/NightSky";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import type { PublicCase } from "@/lib/content/schema";
import { submitVerdict } from "@/lib/game/actions";
import { ORDER_POINTS } from "@/lib/game/score";
import { useGameState } from "@/lib/game/use-game-state";
import { useHydrated, useProgress } from "@/lib/progress/store";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.resolution;
const LETTERS = ["A", "B", "C", "D", "E"];

/**
 * Veredito (DECISOES.md, D21), igual ao mockup aprovado: parte 1, a época (blocos A a E);
 * parte 2, a ordem (pegar a pista na bandeja e prender no barbante). "Conferir ordem" fecha o
 * caso: o carimbo mostra quantas estão no lugar e a tela segue para o resultado.
 * Pistas que ficam na bandeja contam como "fora da história".
 */
export function ResolutionView({ caseData }: { caseData: PublicCase }) {
  const [progress, update] = useProgress(caseData.slug);
  const hydrated = useHydrated();
  const game = useGameState(caseData.slug);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<"epoch" | "order">("epoch");
  const [held, setHeld] = useState<string | null>(null);
  const [lane, setLane] = useState<(string | null)[] | null>(null);
  const [tally, setTally] = useState<{ inPlace: number; total: number } | null>(null);
  const [notice, setNotice] = useState("");
  const blocks = useRef<(HTMLButtonElement | null)[]>([]);
  const state = game.state;
  if (!hydrated || !state) return <Loading dark />;

  const slotsCount = caseData.evidence.length;
  const collected = caseData.evidence.filter((e) => progress.cards[e.id]).map((e) => e.id);
  // A linha começa com a ordem que o jogador já montou (na linha do tempo ou numa visita anterior).
  const placedBefore = progress.timeline.slots.flat().filter((id) => collected.includes(id));
  const current: (string | null)[] = lane ?? Array.from({ length: slotsCount }, (_, i) => placedBefore[i] ?? null);
  const tray = collected.filter((id) => !current.includes(id));
  const placedCount = current.filter(Boolean).length;
  const selected = progress.draft.epochIndex;
  const evidence = (id: string) => caseData.evidence.find((e) => e.id === id)!;
  const closed = Boolean(state.outcome);
  const sceneHref = `/casos/${caseData.slug}/cena/${progress.lastSceneId ?? caseData.startSceneId}`;

  const choose = (i: number) => update((p) => ({ ...p, draft: { epochIndex: i } }));

  // Grupo de rádio: as setas andam pelos blocos e já escolhem (padrão ARIA).
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    // Parte do bloco com foco (ou do escolhido): com o foco no A e nada escolhido, → vai para o B.
    const focused = blocks.current.findIndex((el) => el === document.activeElement);
    const from = focused >= 0 ? focused : (selected ?? 0);
    const next = (from + dir + LETTERS.length) % LETTERS.length;
    choose(next);
    blocks.current[next]?.focus();
  }

  // Grava a ordem no progresso, para a linha do tempo e as próximas visitas.
  function commit(next: (string | null)[]) {
    setLane(next);
    update((p) => ({
      ...p,
      timeline: {
        ...p.timeline,
        slots: next.filter((id): id is string => Boolean(id)).map((id) => [id]),
        outside: p.timeline.outside.filter((id) => !next.includes(id)),
      },
    }));
  }

  function clickSlot(i: number) {
    const next = [...current];
    if (held) {
      const from = next.indexOf(held);
      const prev = next[i];
      if (from >= 0) next[from] = null;
      next[i] = held;
      setHeld(prev && prev !== held ? prev : null);
      commit(next);
    } else if (next[i]) {
      setHeld(next[i]);
      next[i] = null;
      commit(next);
    }
  }

  function check() {
    if (selected === null) return setStep("epoch");
    startTransition(async () => {
      try {
        const r = await submitVerdict(caseData.slug, {
          epochIndex: selected,
          order: { slots: current.filter((id): id is string => Boolean(id)).map((id) => [id]), outside: tray },
        });
        game.setState(r.state);
        if (!r.ok) return setNotice(r.error === "locked" ? t.locked(caseData.minCardsToResolve) : "");
        setTally({ inPlace: Math.round((r.result.breakdown.order / ORDER_POINTS) * slotsCount), total: slotsCount });
        update((p) => ({
          ...p,
          timeline: { ...p.timeline, outside: [...new Set([...p.timeline.outside, ...tray])] },
          status: r.state.outcome === "solved" ? "solved" : "failed",
          official: r.state.official ?? p.official,
        }));
        setTimeout(() => router.push(`/casos/${caseData.slug}/encerramento`), 1400);
      } catch {
        setNotice(t.error);
      }
    });
  }

  const hud = (label: string) => (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Link href={sceneHref} className="px-btn px-btn-paper text-base">
          <span aria-hidden>←</span>
          {t.backToScene}
        </Link>
        <span className="font-pixel text-2xl text-bone sm:text-3xl">{label}</span>
      </div>
      <span className="flex items-center gap-2 font-pixel text-3xl tabular-nums">
        <PixelSprite name="coin" className="coin-spin w-7" />
        <span aria-hidden>
          {collected.length}/{slotsCount}
        </span>
        <span className="sr-only">{strings.scene.sourcesFound(collected.length, slotsCount)}</span>
      </span>
    </header>
  );

  return (
    <main id="conteudo" className="game-world iris-open flex min-h-dvh flex-1 flex-col text-bone">
      <NightSky moon={step === "epoch"} rain={false} />
      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-5 sm:px-8">
        {closed && !tally ? (
          <>
            {hud(caseData.title)}
            <div className="mt-10 max-w-xl bg-paper-0 p-5 text-ink px-frame">
              <p className="font-title text-3xl text-stamp">{t.closedTitle}</p>
              <Link href={`/casos/${caseData.slug}/encerramento`} className="px-btn px-btn-ink mt-4">
                {t.closure}
              </Link>
            </div>
          </>
        ) : collected.length < caseData.minCardsToResolve ? (
          <>
            {hud(caseData.title)}
            <div className="mt-10 max-w-xl bg-paper-0 p-5 text-ink px-frame">
              <p>{t.needSources(caseData.minCardsToResolve)}</p>
              <Link href={sceneHref} className="px-btn mt-4">
                {t.backToScene}
              </Link>
            </div>
          </>
        ) : step === "epoch" ? (
          <section key="epoch" aria-labelledby="epoca" className="iris-open">
            {hud(t.epochStep)}
            <div className="mt-8 text-center">
              <h1 id="epoca" className="px-title text-4xl leading-none sm:text-6xl">
                {t.epochTitle}
              </h1>
              <p className="mx-auto mt-3 max-w-prose font-semibold text-mist">{t.epochHint}</p>
            </div>
            <div role="radiogroup" aria-label={t.epochGroup} onKeyDown={onKeyDown} className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {caseData.epochOptions.map((o, i) => (
                <button
                  key={o.title}
                  ref={(el) => {
                    blocks.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected === i}
                  aria-label={t.epochOption(LETTERS[i], o.title, o.years)}
                  tabIndex={selected === i || (selected === null && i === 0) ? 0 : -1}
                  onClick={() => choose(i)}
                  className="group grid min-h-touch grid-cols-[4.5rem_1fr] items-center gap-4 text-left lg:grid-cols-1 lg:justify-items-center lg:text-center"
                >
                  <span aria-hidden className="epoch-block relative grid size-[4.5rem] place-items-center font-pixel text-5xl lg:size-28 lg:text-7xl" style={{ animationDelay: `${-i * 0.5}s` }}>
                    {LETTERS[i]}
                  </span>
                  <span className="block w-full bg-paper-0 p-3 text-ink px-frame-flat group-aria-checked:bg-amber">
                    <span className="block font-pixel text-2xl leading-none text-stamp">
                      {LETTERS[i]}) {o.years}
                    </span>
                    <span className="mt-1 block text-sm font-bold leading-snug">{o.title}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <Rules />
              <Button className="px-btn-call text-2xl" disabled={selected === null} onClick={() => setStep("order")}>
                {t.confirmEpoch}
              </Button>
            </div>
          </section>
        ) : (
          <section key="order" aria-labelledby="ordem" className="iris-open">
            {hud(t.orderStep)}
            <h1 id="ordem" className="px-title mt-8 text-4xl leading-none sm:text-5xl">
              {t.orderTitle}
            </h1>
            <p className="mt-2 max-w-prose font-semibold text-mist">{t.orderHint}</p>

            <div className="relative mt-8">
              <div className="mb-3 flex justify-between font-pixel text-xl text-mist">
                <span>{strings.timeline.start}</span>
                <span>{strings.timeline.end}</span>
              </div>
              <ol className="relative grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6 lg:before:absolute lg:before:-inset-x-3 lg:before:top-1/2 lg:before:h-1 lg:before:bg-blood-hi">
                {current.map((id, i) => {
                  const ev = id ? evidence(id) : null;
                  return (
                    <li key={i} className="relative">
                      <button
                        type="button"
                        onClick={() => clickSlot(i)}
                        aria-label={ev ? t.slotFilled(i + 1, ev.title) : t.slotEmpty(i + 1)}
                        className={`relative block min-h-36 w-full p-2 text-left text-ink ${
                          ev ? "pop-in bg-paper-0 px-frame [--px:2px]" : held ? "slot-ready" : "bg-white/5 shadow-[inset_0_0_0_2px_rgb(241_230_200/0.35)]"
                        }`}
                      >
                        <span className="absolute -left-2 -top-3 z-10 min-w-8 bg-blood px-1.5 pb-0.5 text-center font-pixel text-xl leading-tight text-bone">{i + 1}</span>
                        {ev && (
                          <>
                            <span className="relative block aspect-[4/3] overflow-hidden bg-paper-2">
                              <Image src={ev.image.src} alt="" fill unoptimized sizes="12rem" className="pixelated object-cover" />
                            </span>
                            <span className="mt-1 block truncate text-sm font-bold">{ev.title}</span>
                          </>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
              {tally && (
                <p
                  role="status"
                  className={`stamp-drop absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -rotate-6 whitespace-nowrap border-[5px] border-current bg-paper-1 px-6 pb-2 font-pixel text-4xl shadow-[0_12px_24px_rgb(0_0_0/0.5)] sm:text-6xl ${
                    tally.inPlace === tally.total ? "text-[#23774a]" : "text-stamp"
                  }`}
                >
                  {strings.check.tally(tally.inPlace, tally.total)}
                </p>
              )}
            </div>

            <div className="mt-10 grid gap-4 bg-paper-0 p-5 text-ink px-frame">
              <div className="flex flex-wrap items-center gap-4">
                <h2 className="font-title text-3xl text-stamp">{t.trayTitle}</h2>
                <p aria-live="polite" className="min-w-48 flex-1 font-semibold text-paper-5">
                  {held ? t.holding(evidence(held).title) : placedCount >= caseData.minCardsToResolve ? t.readyToCheck : t.pickHint}
                </p>
                <Button
                  variant="secondary"
                  className="text-base"
                  onClick={() => {
                    setHeld(null);
                    commit(Array(slotsCount).fill(null));
                  }}
                >
                  {t.restart}
                </Button>
                <Button className="px-btn-call text-2xl" disabled={pending || Boolean(tally) || placedCount < caseData.minCardsToResolve} onClick={check}>
                  {pending ? t.sending : t.checkOrder}
                </Button>
              </div>
              <p className="text-sm text-paper-5">{t.outsideHint}</p>
              <ul className="grid min-h-16 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {tray.map((id) => {
                  const ev = evidence(id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        aria-pressed={held === id}
                        onClick={() => setHeld(held === id ? null : id)}
                        className={`grid w-full grid-cols-[45%_1fr] items-center gap-2 bg-[#fbf4df] p-2 text-left px-frame-flat [--px:2px] transition-transform hover:-translate-y-1 hover:-rotate-1 aria-pressed:-translate-y-1.5 aria-pressed:bg-amber ${held === id ? "card-held" : ""}`}
                      >
                        <span className="relative block aspect-[4/3] overflow-hidden bg-paper-2">
                          <Image src={ev.image.src} alt="" fill unoptimized sizes="6rem" className="pixelated object-cover" />
                        </span>
                        <span className="text-sm font-bold leading-tight">{ev.title}</span>
                      </button>
                    </li>
                  );
                })}
                {held && !tray.includes(held) && (
                  <li>
                    <button type="button" onClick={() => setHeld(null)} className="px-btn px-btn-paper w-full text-base">
                      {t.putBack}
                    </button>
                  </li>
                )}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => setStep("epoch")} className="px-btn px-btn-paper text-base">
                  {t.changeEpoch(selected === null ? "?" : LETTERS[selected])}
                </button>
                <Link href={`/casos/${caseData.slug}/linha-do-tempo`} className="font-semibold text-carbon underline underline-offset-4">
                  {t.fullTimeline}
                </Link>
              </div>
              <p role="status" aria-live="polite" className="font-semibold text-ribbon">
                {notice}
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Rules() {
  return (
    <div className="w-full max-w-md bg-paper-0 p-5 text-ink px-frame">
      <h2 className="font-title text-2xl text-stamp">{t.rulesTitle}</h2>
      <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-6 gap-y-1">
        {t.rules.map((r, i) => (
          <div key={r.label} className={`contents ${i === t.rules.length - 1 ? "text-stamp" : ""}`}>
            <dt className="font-semibold">{r.label}</dt>
            <dd className="text-right font-pixel text-2xl leading-none">{r.points}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
