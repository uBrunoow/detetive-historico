"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import { StarRating } from "@/components/ui/StarRating";
import type { PublicCase } from "@/lib/content/schema";
import { readProgress, useHydrated } from "@/lib/progress/store";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.levels;
const c9 = strings.catalog;

// Alturas dos alfinetes no quadro (% da altura), em zigue-zague como no mockup.
const HEIGHTS = [74, 62, 70, 54, 66, 50, 62, 46];

/**
 * Quadro de casos (telas largas): um alfinete por caso sobre a cidade à noite, ligados por
 * um barbante vermelho, e o dossiê do caso escolhido ao lado. No celular, a página mostra os cards.
 */
export function CaseBoard({ cases }: { cases: PublicCase[] }) {
  const hydrated = useHydrated();
  const [selected, setSelected] = useState(0);
  const official = (slug: string) => (hydrated ? readProgress(slug).official : null);
  const n = cases.length;
  // O tutorial não conta: o primeiro caso de verdade é o "Caso 1".
  const numberOf = (i: number) => cases.slice(0, i + 1).filter((x) => !x.tutorial).length;
  const points = cases.map((_, i) => ({ x: 6 + (i * 58) / Math.max(1, n - 1), y: HEIGHTS[i % HEIGHTS.length] }));
  const c = cases[selected];
  const done = official(c.slug);

  return (
    <section aria-label={t.board} className="relative mt-6 hidden h-[31rem] lg:block">
      <PixelSprite name="skyline" className="absolute inset-x-0 bottom-0 w-full opacity-90" />
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <polyline
          pathLength={1}
          points={points.map((p) => `${p.x},${p.y - 9}`).join(" ")}
          fill="none"
          stroke="var(--blood-hi)"
          strokeWidth={3}
          vectorEffect="non-scaling-stroke"
          className="board-string"
        />
      </svg>
      <ul>
        {cases.map((item, i) => {
          const res = official(item.slug);
          return (
            <li key={item.slug} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${points[i].x}%`, top: `${points[i].y}%` }}>
              <button
                type="button"
                aria-pressed={i === selected}
                aria-label={item.tutorial ? t.tutorialLabel(item.title, res?.stars ?? null) : t.caseLabel(numberOf(i), item.title, res?.stars ?? null)}
                onClick={() => setSelected(i)}
                className="group grid min-w-touch justify-items-center gap-1"
              >
                {res && (
                  <span aria-hidden className="flex gap-0.5 drop-shadow-[0_2px_0_rgb(0_0_0/0.6)]">
                    {[0, 1, 2].map((k) => (
                      <PixelSprite key={k} name="star" className={`w-5 ${k < res.stars ? "" : "opacity-40 grayscale"}`} />
                    ))}
                  </span>
                )}
                <span className="bg-paper-0 px-2 pb-1 pt-0.5 font-pixel text-xl leading-none text-ink px-frame-flat [--px:2px] group-aria-pressed:bg-amber">
                  {item.tutorial ? c9.tutorial : t.caseN(numberOf(i))}
                </span>
                <PixelSprite
                  name={res ? "pinDone" : "pin"}
                  className={`w-9 transition-transform duration-200 group-hover:-translate-y-2 ${i === selected ? "sprite-bob -translate-y-2" : ""}`}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <article key={c.slug} className="pop-in absolute -top-2 right-0 w-[22rem] rotate-1 bg-paper-0 p-4 text-ink px-frame">
        <PixelSprite name="pin" className="absolute -top-5 left-1/2 w-8 -translate-x-1/2" />
        <div className="relative aspect-[2/1] overflow-hidden bg-paper-6 px-frame-flat [--px:2px]">
          <Image src={c.cover.src} alt={c.cover.alt} fill unoptimized sizes="22rem" className="pixelated object-cover sepia-[.25]" />
        </div>
        <h2 className="mt-3 font-title text-3xl leading-none text-stamp">{c.title}</h2>
        <p className="mt-2 line-clamp-3 text-base leading-snug">{c.summary}</p>
        <p className="mt-2 text-sm font-bold text-paper-5">
          {c.place} · {c9.difficulty[c.difficulty]} · {c9.duration(c.durationMinutes)} · {t.sources(c.evidence.length)}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <Link href={`/casos/${c.slug}`} className="px-btn px-btn-ink px-btn-call text-xl">
            {t.open}
          </Link>
          {done && (
            <span className="flex items-center gap-2 font-bold">
              <StarRating stars={done.stars} />
              {done.points} pts
            </span>
          )}
        </div>
      </article>
    </section>
  );
}
