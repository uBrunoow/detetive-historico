"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import type { ClosureData } from "@/lib/game/actions";
import { EPOCH_POINTS, ORDER_POINTS, type Result } from "@/lib/game/score";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.closure;
const LETTERS = ["A", "B", "C", "D", "E"];

const reducedMotion = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.reduceMotion === "true");

/** O total sobe de 0 até os pontos, uma vez, com desaceleração. */
function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const instant = reducedMotion();
    const t0 = performance.now() + 300;
    const tick = (now: number) => {
      const k = instant ? 1 : Math.max(0, Math.min(1, (now - t0) / 1100));
      setValue(Math.round(target * (1 - (1 - k) ** 4)));
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

/** Placar do veredito (D21): época 400 + ordem até 600, estrelas, carimbo e a época revelada. */
export function Scoreboard({
  result,
  training,
  official,
  epoch,
  actions,
}: {
  result: Result;
  training: boolean;
  official: Result | null;
  epoch: ClosureData["epoch"];
  actions?: ReactNode;
}) {
  const shown = useCountUp(result.points);
  const perfect = result.points === EPOCH_POINTS + ORDER_POINTS;
  const epochRight = result.breakdown.epoch > 0;
  const orderPct = Math.round((result.breakdown.order / ORDER_POINTS) * 100);
  const kind = perfect ? "perfect" : result.stars >= 2 ? "solved" : "open";
  const heading = perfect ? t.perfect : result.stars >= 2 ? t.solved : t.failed;
  const option = (i: number | null) => (i === null ? t.noEpoch : `${LETTERS[i]}) ${epoch.options[i].title}, ${epoch.options[i].years}`);

  return (
    <section aria-labelledby="placar" className={`relative bg-paper-0 p-5 text-ink px-frame sm:p-8 ${result.stars >= 2 ? "shake-once [animation-delay:1.5s]" : ""}`}>
      <p aria-hidden className="stamp-drop absolute -right-2 -top-4 rotate-[9deg] border-4 border-current bg-paper-0/90 px-3 pb-1 font-pixel text-2xl text-stamp [animation-delay:1.5s] sm:-right-5">
        {t.stamp[kind]}
      </p>
      <h2 id="placar" className="text-center font-title text-4xl leading-none text-stamp sm:text-5xl">
        {heading}
      </h2>

      <p className="mt-4 flex justify-center gap-3" role="img" aria-label={`${result.stars} de 3 estrelas`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="pop-in block w-12 sm:w-14" style={{ animationDelay: `${1.2 + i * 0.25}s` }}>
            <PixelSprite name="star" className={i < result.stars ? "" : "opacity-40 grayscale"} />
          </span>
        ))}
      </p>

      <p className="mt-3 text-center">
        <span aria-hidden className="block font-pixel text-7xl leading-none tabular-nums">
          {shown}
        </span>
        <span className="sr-only">{result.points}</span>
        <span className="font-semibold text-paper-5">{t.points(result.points)}</span>
      </p>

      <dl className="mx-auto mt-6 grid max-w-2xl gap-4">
        <Row label={t.epochRow} badge={epochRight ? t.epochBadge.right : t.epochBadge.wrong} ok={epochRight} points={result.breakdown.epoch} max={EPOCH_POINTS} />
        <Row label={t.orderRow} badge={t.orderBadge(orderPct)} ok={orderPct === 100} points={result.breakdown.order} max={ORDER_POINTS} />
      </dl>

      <div className="mx-auto mt-5 grid max-w-2xl gap-1 text-sm sm:grid-cols-2 sm:gap-4">
        <p>
          <span className="font-bold">{t.yourEpoch}:</span> {option(epoch.chosen)}
        </p>
        <p>
          <span className="font-bold">{t.epochAnswer}:</span> {option(epoch.correct)}
        </p>
      </div>

      <p className="mx-auto mt-5 max-w-prose text-center font-semibold">{t.verdictText(epochRight, perfect)}</p>
      {training && official && (
        <p className="mt-3 text-center font-bold text-stamp">
          {t.training}: {t.officialResult(official.stars, official.points)}
        </p>
      )}
      {actions && <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>}
    </section>
  );
}

function Row({ label, badge, ok, points, max }: { label: string; badge: string; ok: boolean; points: number; max: number }) {
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFill(points / max));
    return () => cancelAnimationFrame(id);
  }, [points, max]);
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1">
      <dt className="flex items-center gap-2 font-bold">
        {label}
        <span className={`px-1.5 pb-0.5 font-pixel text-lg leading-tight text-bone ${ok ? "bg-[#23774a]" : "bg-blood"}`}>{badge}</span>
      </dt>
      <dd className="font-pixel text-2xl leading-none tabular-nums">
        {points} / {max}
      </dd>
      <dd aria-hidden className="col-span-2 h-4 overflow-hidden bg-paper-2 px-frame-flat [--px:2px]">
        <span
          className="block h-full origin-left bg-[repeating-linear-gradient(90deg,var(--amber)_0_12px,var(--amber-lo)_12px_15px)] transition-transform delay-300 duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `scaleX(${fill})` }}
        />
      </dd>
    </div>
  );
}
