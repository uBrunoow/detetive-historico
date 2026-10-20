"use client";

import Link from "next/link";
import { useId, useRef, useState, useTransition } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import type { PublicCase } from "@/lib/content/schema";
import { submitAnswer } from "@/lib/game/actions";
import { canResolve } from "@/lib/game/timeline";
import { useGameState } from "@/lib/game/use-game-state";
import { useHydrated, useProgress } from "@/lib/progress/store";
import type { AttemptRecord, CaseProgress } from "@/lib/progress/types";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.resolution;

const verdictStyle: Record<AttemptRecord["verdict"], string> = {
  accepted: "border-[#3f7a3a] bg-[#e4efdc] text-[#1f3d1c] dark:bg-[#22331f] dark:text-[#d4ecca]",
  partial: "border-manila-deep bg-paper-1",
  rejected: "border-paper-4 bg-paper-1",
};

/** Tela de conclusão (PRD §5.9): pergunta, linha do tempo como consulta, texto livre e tentativas. */
export function ResolutionView({ caseData }: { caseData: PublicCase }) {
  const [progress, update] = useProgress(caseData.slug);
  const hydrated = useHydrated();
  const game = useGameState(caseData.slug);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const answerId = useId();

  if (!hydrated || (!game.state && !game.failed)) return <Loading dark />;

  const title = (id: string) => caseData.evidence.find((e) => e.id === id)?.title ?? id;
  const slots = progress.timeline.slots.map((s) => s.filter((id) => caseData.evidence.some((e) => e.id === id))).filter((s) => s.length);
  const state = game.state;
  const closed = Boolean(state?.outcome);
  const last = progress.attempts.at(-1);
  const draft = progress.draft;
  const timelineHref = `/casos/${caseData.slug}/linha-do-tempo`;

  function setDraft(patch: Partial<CaseProgress["draft"]>) {
    update((p) => ({ ...p, draft: { ...p.draft, ...patch } }));
  }

  function send() {
    setConfirming(false);
    setNotice("");
    startTransition(async () => {
      try {
        const r = await submitAnswer(caseData.slug, {
          answer: draft.answer,
          order: { slots: progress.timeline.slots, outside: progress.timeline.outside },
          supporting: draft.supporting,
        });
        game.setState(r.state);
        if (!r.ok) {
          setNotice(r.error === "empty" ? t.tooShort : r.error === "locked" ? t.locked(caseData.minCardsToResolve) : "");
          return;
        }
        const record: AttemptRecord = {
          answer: draft.answer.trim(),
          supporting: draft.supporting,
          verdict: r.verdict,
          feedback: r.feedback,
          at: new Date().toISOString(),
        };
        const outcome = r.state.outcome;
        update((p) => ({
          ...p,
          attempts: [...p.attempts, record],
          status: outcome === "solved" ? "solved" : outcome === "failed" ? "failed" : p.status,
        }));
        requestAnimationFrame(() => resultRef.current?.focus());
      } catch {
        setNotice(t.error);
      }
    });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-wood text-on-wood">
      <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href={timelineHref} className="px-btn px-btn-paper text-base">
          <svg aria-hidden viewBox="0 0 8 8" className="size-4" fill="currentColor" shapeRendering="crispEdges">
            <path d="M5 1h1v1H5zM4 2h1v1H4zM3 3h1v2H3zM4 5h1v1H4zM5 6h1v1H5z" />
          </svg>
          {t.back}
        </Link>
        <p className="font-pixel text-lg font-semibold sm:text-xl">{caseData.title}</p>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 sm:px-6">
        <h1 className="px-title mt-4 text-[clamp(2.25rem,6vw,3.25rem)] leading-none text-[#f0d9a0]">{t.title}</h1>

        <section aria-labelledby="res-q" className="doc-sheet mt-6 max-w-3xl px-6 py-5 text-doc-ink">
          <h2 id="res-q" className="font-pixel text-sm font-bold text-doc-faint">
            {t.question}
          </h2>
          <p className="mt-1 font-typed text-lg leading-8">{caseData.question}</p>
        </section>

        {!canResolve(caseData, progress) && !closed ? (
          <div className="mt-8 max-w-xl bg-paper-0 p-5 text-ink px-frame">
            <p>{t.locked(caseData.minCardsToResolve)}</p>
            <ButtonLink href={timelineHref} className="mt-4">
              {t.lockedAction}
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
            <section aria-labelledby="res-tl" className="self-start bg-manila p-4 text-ink px-frame lg:sticky lg:top-4">
              <h2 id="res-tl" className="font-pixel text-lg font-bold">
                {t.yourTimeline}
              </h2>
              <p className="text-sm">{t.timelineHint}</p>
              <ol className="mt-3 flex flex-col gap-2">
                {slots.map((slot, i) => (
                  <li key={slot.join("+")} className="flex gap-3">
                    <span aria-hidden className="mt-2 font-pixel text-sm font-bold">
                      {i + 1}
                    </span>
                    <ul className="flex flex-1 flex-col gap-1">
                      {slot.map((id) => (
                        <li key={id}>
                          <label className="flex min-h-touch cursor-pointer items-center gap-3 bg-paper-0 px-3 py-1.5 px-frame-flat [--px:2px] has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-carbon">
                            <input
                              type="checkbox"
                              disabled={closed}
                              checked={draft.supporting.includes(id)}
                              aria-label={t.supports(title(id))}
                              onChange={(e) =>
                                setDraft({
                                  supporting: e.target.checked
                                    ? [...draft.supporting, id]
                                    : draft.supporting.filter((x) => x !== id),
                                })
                              }
                              className="size-5 accent-ink"
                            />
                            <span className="text-sm font-semibold">{title(id)}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
              {progress.timeline.outside.length > 0 && (
                <p className="mt-3 text-sm">
                  <span className="font-pixel font-bold">{strings.timeline.outside}:</span>{" "}
                  {progress.timeline.outside.map(title).join(", ")}
                </p>
              )}
            </section>

            <div>
              {closed ? (
                <div ref={resultRef} tabIndex={-1} role="status" className="bg-paper-0 p-5 text-ink px-frame focus:outline-none">
                  <p className="font-pixel text-xl font-bold">
                    {state?.outcome === "solved" ? t.verdict.accepted : strings.closure.failed}
                  </p>
                  <p className="mt-2 max-w-prose">{state?.outcome === "solved" ? t.acceptedText : t.failedText}</p>
                  <ButtonLink href={`/casos/${caseData.slug}/encerramento`} className="mt-4">
                    {t.closure}
                  </ButtonLink>
                </div>
              ) : (
                <form
                  className="bg-paper-0 p-5 text-ink px-frame"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (pending) return;
                    // Mesma regra do servidor: menos de 3 palavras não chega a pedir confirmação.
                    if (draft.answer.trim().split(/\s+/).filter(Boolean).length < 3) return setNotice(t.tooShort);
                    setNotice("");
                    setConfirming(true);
                  }}
                >
                  <label htmlFor={answerId} className="font-pixel text-lg font-bold">
                    {t.answer}
                  </label>
                  <p id={`${answerId}-hint`} className="text-sm text-paper-5">
                    {t.answerHint}
                  </p>
                  <textarea
                    id={answerId}
                    rows={7}
                    maxLength={3000}
                    value={draft.answer}
                    aria-describedby={`${answerId}-hint`}
                    onChange={(e) => setDraft({ answer: e.target.value })}
                    className="mt-2 block w-full resize-y bg-paper-1 bg-[repeating-linear-gradient(transparent,transparent_calc(1.75rem-1px),var(--paper-3)_calc(1.75rem-1px),var(--paper-3)_1.75rem)] px-3 py-1 font-hand text-lg leading-7 text-graphite px-frame-flat [--px-line:var(--paper-4)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-carbon"
                  />
                  <p className="mt-3 font-pixel text-base font-semibold">
                    {state ? t.attemptsLeft(state.attemptsLeft, state.maxAttempts) : " "}
                  </p>

                  {confirming ? (
                    <div className="mt-4 border-l-4 border-ribbon bg-paper-1 p-3">
                      <p className="font-semibold">{t.confirm(state?.attemptsLeft ?? 0)}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button type="button" onClick={send}>
                          {t.yes}
                        </Button>
                        <Button type="button" variant="secondary" autoFocus onClick={() => setConfirming(false)}>
                          {t.no}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button type="submit" className="mt-4" aria-disabled={pending || undefined}>
                      {pending ? t.sending : t.submit}
                    </Button>
                  )}
                  <p role="status" className="mt-3 font-semibold text-ribbon">
                    {notice}
                  </p>
                </form>
              )}

              {last && !(closed && last.verdict === "accepted") && (
                <div
                  ref={closed ? undefined : resultRef}
                  tabIndex={-1}
                  role="status"
                  className={`mt-6 border-l-4 p-4 text-ink focus:outline-none ${verdictStyle[last.verdict]}`}
                >
                  <p className="font-pixel text-lg font-bold">{t.verdict[last.verdict]}</p>
                  {last.verdict === "accepted" ? (
                    <p className="mt-1">{t.acceptedText}</p>
                  ) : (
                    <>
                      {last.feedback && <p className="mt-1">{last.feedback}</p>}
                      {!closed && <p className="mt-2 text-sm">{t.keepGoing}</p>}
                    </>
                  )}
                </div>
              )}

              {progress.attempts.length > 0 && (
                <section aria-labelledby="res-hist" className="mt-8">
                  <h2 id="res-hist" className="font-pixel text-lg font-bold">
                    {t.history}
                  </h2>
                  <ol className="mt-3 flex flex-col gap-3">
                    {progress.attempts.map((a, i) => (
                      <li key={a.at} className="bg-paper-0 p-4 text-ink px-frame-flat [--px:2px]">
                        <p className="font-pixel text-sm font-bold text-paper-5">
                          {t.attemptN(i + 1)} · {t.verdict[a.verdict]}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap font-hand text-lg leading-7 text-graphite">{a.answer}</p>
                        {a.supporting.length > 0 && (
                          <p className="mt-1 text-sm text-paper-5">
                            {t.supportingCards}: {a.supporting.map(title).join(", ")}
                          </p>
                        )}
                        {a.feedback && <p className="mt-2 text-sm">{a.feedback}</p>}
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
