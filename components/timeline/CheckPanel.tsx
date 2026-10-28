"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { checkTimeline, type PublicGameState } from "@/lib/game/actions";
import type { CaseProgress } from "@/lib/progress/types";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.check;

type Props = {
  slug: string;
  progress: CaseProgress;
  update: (fn: (p: CaseProgress) => CaseProgress) => void;
  state: PublicGameState | null;
  onState: (s: PublicGameState) => void;
};

/** Conferência da linha do tempo: limitada, opcional e só com pistas (PRD §5.7.3). */
export function CheckPanel({ slug, progress, update, state, onState }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const last = progress.checks.at(-1);
  const earlier = progress.checks.slice(0, -1);

  function run() {
    setConfirming(false);
    setError("");
    startTransition(async () => {
      try {
        const r = await checkTimeline(slug, { slots: progress.timeline.slots, outside: progress.timeline.outside });
        onState(r.state);
        if (!r.ok) {
          setError(r.error === "empty" ? t.empty : r.error === "no_checks" ? t.none : "");
          return;
        }
        const hint = r.result.kind === "ok" ? null : r.result.text;
        update((p) => ({ ...p, checks: [...p.checks, { hint, tally: r.tally, at: new Date().toISOString() }] }));
      } catch {
        setError(t.error);
      }
    });
  }

  const left = state?.checksLeft ?? 0;

  return (
    <section aria-labelledby="tl-check" className="bg-paper-0 p-4 text-ink px-frame">
      <h2 id="tl-check" className="font-pixel text-lg font-bold">
        {t.title}
      </h2>
      <p className="mt-1 text-sm text-paper-5">{t.intro}</p>
      <p className="mt-3 font-pixel text-base font-semibold">{state ? t.left(left, state.maxChecks) : " "}</p>

      {state && !state.outcome && left > 0 && (
        <div className="mt-3 flex flex-col items-start gap-3">
          {confirming ? (
            <>
              <p className="font-semibold">{t.confirm(left)}</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={run}>{t.yes}</Button>
                <Button variant="secondary" autoFocus onClick={() => setConfirming(false)}>
                  {t.no}
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="manila"
              aria-disabled={pending || progress.timeline.slots.length === 0 || undefined}
              onClick={() => (progress.timeline.slots.length === 0 ? setError(t.empty) : !pending && setConfirming(true))}
            >
              {pending ? t.checking : t.button}
            </Button>
          )}
        </div>
      )}
      {state && left === 0 && <p className="mt-2 text-sm">{t.none}</p>}

      <div role="status" aria-live="polite">
        {error && <p className="mt-3 font-semibold text-ribbon">{error}</p>}
        {last && !pending && (
          <div key={last.at} className="mt-4 bg-paper-1 p-3 px-frame-flat [--px:2px]">
            {last.tally && (
              <p className={`stamp-drop mb-3 inline-block -rotate-6 border-4 border-current px-3 pb-1 font-pixel text-2xl ${last.tally.inPlace === last.tally.total ? "text-[#23774a]" : "text-stamp"}`}>
                {t.tally(last.tally.inPlace, last.tally.total)}
              </p>
            )}
            <p className="font-pixel text-sm font-bold text-stamp">{t.hintLabel}</p>
            <p className="mt-1">{last.hint ?? t.ok}</p>
          </div>
        )}
      </div>

      {earlier.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer font-pixel text-sm font-semibold">{t.history}</summary>
          <ol className="mt-2 flex list-decimal flex-col gap-2 pl-5 text-sm">
            {earlier.map((c) => (
              <li key={c.at}>
                {c.tally && <span className="font-bold">{t.tally(c.tally.inPlace, c.tally.total)}. </span>}
                {c.hint ?? t.ok}
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}
