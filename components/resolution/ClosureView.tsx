"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useEffect, useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import type { PublicCase } from "@/lib/content/schema";
import { getClosure, type ClosureData } from "@/lib/game/actions";
import { compareTimelines, type CardOutcome } from "@/lib/game/closure";
import { earnedMedals, MEDALS } from "@/lib/game/medals";
import { updateProgress, useHydrated, useProgress } from "@/lib/progress/store";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.closure;

const outcomeStyle: Record<CardOutcome, string> = {
  ordered: "bg-[#e4efdc] text-[#1f3d1c] dark:bg-[#22331f] dark:text-[#d4ecca]",
  correctlyOutside: "bg-[#e4efdc] text-[#1f3d1c] dark:bg-[#22331f] dark:text-[#d4ecca]",
  diverges: "bg-[#f6e3c4] text-[#5a3a0c] dark:bg-[#3a2c14] dark:text-[#f2d9a8]",
  wronglyOutside: "bg-[#f6e3c4] text-[#5a3a0c] dark:bg-[#3a2c14] dark:text-[#f2d9a8]",
  shouldBeOutside: "bg-[#f6e3c4] text-[#5a3a0c] dark:bg-[#3a2c14] dark:text-[#f2d9a8]",
  missing: "bg-paper-2 text-paper-6",
  notPlaced: "bg-paper-2 text-paper-6",
};

/** Encerramento (PRD §6): explicação, linhas lado a lado, datação, descartes, relações e limites. */
export function ClosureView({ caseData }: { caseData: PublicCase }) {
  const [progress] = useProgress(caseData.slug);
  const hydrated = useHydrated();
  const [data, setData] = useState<ClosureData | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    startTransition(async () => {
      try {
        const d = await getClosure(caseData.slug);
        setData(d);
        if (d) updateProgress(caseData.slug, (p) => (p.status === d.outcome ? p : { ...p, status: d.outcome }));
      } catch {
        setFailed(true);
      }
    });
  }, [caseData.slug]);

  if (!hydrated || (data === undefined && !failed)) return <Loading dark />;

  const title = (id: string) => caseData.evidence.find((e) => e.id === id)?.title ?? id;
  const image = (id: string) => caseData.evidence.find((e) => e.id === id)?.image;
  const scene = progress.lastSceneId ?? caseData.startSceneId;

  if (failed || !data) {
    return (
      <Shell caseData={caseData}>
        <p className="mt-8 max-w-xl bg-paper-0 p-5 text-ink px-frame">{failed ? t.error : t.notYet}</p>
        {!failed && (
          <ButtonLink href={`/casos/${caseData.slug}/cena/${scene}`} className="mt-6">
            {t.notYetAction}
          </ButtonLink>
        )}
      </Shell>
    );
  }

  const order = { slots: progress.timeline.slots, outside: progress.timeline.outside };
  const outcomes = compareTimelines(data.reference, order);
  const story = data.reference.filter((r) => r.belongsToStory && r.referenceOrder !== null);
  const refGroups = [...new Set(story.map((r) => r.referenceOrder!))]
    .sort((a, b) => a - b)
    .map((n) => story.filter((r) => r.referenceOrder === n));
  const milestone = new Set(data.reference.filter((r) => r.isKeyMilestone).map((r) => r.evidenceId));
  const notPlaced = data.reference.filter(
    (r) => !order.slots.flat().includes(r.evidenceId) && !order.outside.includes(r.evidenceId),
  );
  const lastAnswer = progress.attempts.at(-1)?.answer;
  const medals = earnedMedals(caseData, progress);

  const Tag = ({ id }: { id: string }) => (
    <span className={`mt-1 inline-block px-1.5 py-0.5 font-pixel text-xs font-bold ${outcomeStyle[outcomes[id]]}`}>
      {t.outcome[outcomes[id]]}
    </span>
  );

  const Card = ({ id, tag }: { id: string; tag?: boolean }) => {
    const img = image(id);
    return (
      <div className="flex items-center gap-3 bg-paper-0 p-2 text-ink px-frame-flat [--px:2px]">
        {img && (
          <span className="relative size-10 shrink-0 overflow-hidden bg-paper-2">
            <Image src={img.src} alt="" fill unoptimized sizes="2.5rem" className="pixelated object-cover" />
          </span>
        )}
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-tight">{title(id)}</span>
          {!tag && milestone.has(id) && <span className="font-pixel text-xs text-stamp">{t.keyMilestone}</span>}
          {tag && <Tag id={id} />}
        </span>
      </div>
    );
  };

  return (
    <Shell caseData={caseData}>
      <div className="mt-6 max-w-3xl bg-paper-0 p-5 text-ink px-frame">
        <p className="font-pixel text-2xl font-bold">{data.outcome === "solved" ? t.solved : t.failed}</p>
        <p className="mt-2">{data.outcome === "solved" ? t.solvedText : t.failedText}</p>
      </div>

      <Section title={t.problem}>
        <p className="font-typed text-lg leading-8">{caseData.question}</p>
        {lastAnswer && (
          <>
            <h3 className="mt-4 font-pixel text-sm font-bold text-paper-5">{t.yourAnswer}</h3>
            <p className="mt-1 whitespace-pre-wrap font-hand text-lg leading-7 text-graphite">{lastAnswer}</p>
          </>
        )}
      </Section>

      <Section title={t.whatHappened}>
        <div className="max-w-prose space-y-3">
          {data.explanation.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="mt-5 max-w-prose border-l-4 border-stamp bg-paper-1 p-4">
          <h3 className="font-pixel text-sm font-bold text-stamp">{t.referenceAnswer}</h3>
          <p className="mt-1">{data.referenceAnswer}</p>
        </div>
      </Section>

      <Section title={t.compare}>
        <p className="max-w-prose text-sm text-paper-5">{t.compareIntro}</p>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-pixel text-lg font-bold">{t.reference}</h3>
            <ol className="mt-3 flex flex-col gap-2">
              {refGroups.map((g, i) => (
                <li key={g[0].evidenceId} className="flex gap-3">
                  <span aria-hidden className="mt-3 w-5 font-pixel text-sm font-bold">
                    {i + 1}
                  </span>
                  <div className="flex flex-1 flex-col gap-1">
                    {g.map((r) => (
                      <Card key={r.evidenceId} id={r.evidenceId} />
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="font-pixel text-lg font-bold">{t.yours}</h3>
            {order.slots.length === 0 ? (
              <p className="mt-3 text-paper-5">{t.emptyYours}</p>
            ) : (
              <ol className="mt-3 flex flex-col gap-2">
                {order.slots.map((slot, i) => (
                  <li key={slot.join("+")} className="flex gap-3">
                    <span aria-hidden className="mt-3 w-5 font-pixel text-sm font-bold">
                      {i + 1}
                    </span>
                    <div className="flex flex-1 flex-col gap-1">
                      {slot.filter((id) => outcomes[id]).map((id) => (
                        <Card key={id} id={id} tag />
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {order.outside.length > 0 && (
              <>
                <h4 className="mt-5 font-pixel text-sm font-bold text-paper-5">{t.yourOutside}</h4>
                <div className="mt-2 flex flex-col gap-1">
                  {order.outside.filter((id) => outcomes[id]).map((id) => (
                    <Card key={id} id={id} tag />
                  ))}
                </div>
              </>
            )}
            {notPlaced.length > 0 && (
              <>
                <h4 className="mt-5 font-pixel text-sm font-bold text-paper-5">{t.youNotPlaced}</h4>
                <div className="mt-2 flex flex-col gap-1">
                  {notPlaced.map((r) => (
                    <Card key={r.evidenceId} id={r.evidenceId} tag />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Section>

      <Section title={t.dating}>
        <dl className="max-w-prose space-y-4">
          {data.reference
            .filter((r) => r.datingClueExplanation)
            .map((r) => (
              <div key={r.evidenceId}>
                <dt className="font-pixel font-bold">{title(r.evidenceId)}</dt>
                <dd className="mt-1">{r.datingClueExplanation}</dd>
              </div>
            ))}
        </dl>
      </Section>

      <Section title={t.outside}>
        <dl className="max-w-prose space-y-4">
          {data.reference
            .filter((r) => !r.belongsToStory)
            .map((r) => (
              <div key={r.evidenceId}>
                <dt className="font-pixel font-bold">{title(r.evidenceId)}</dt>
                <dd className="mt-1">{r.outsideReason}</dd>
              </div>
            ))}
        </dl>
      </Section>

      <Section title={t.relations}>
        <ul className="max-w-prose space-y-4">
          {data.relations.map((r) => (
            <li key={`${r.from}-${r.type}-${r.to}`}>
              <p className="font-pixel font-bold">
                {title(r.from)} <span className="text-stamp">{strings.timeline.linkTypes[r.type]}</span> {title(r.to)}
              </p>
              <p className="mt-1">{r.explanation}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.limits}>
        <p className="max-w-prose text-sm text-paper-5">{t.limitsIntro}</p>
        <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
          {data.sourceLimitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </Section>

      {caseData.references.length > 0 && (
        <Section title={t.references}>
          <ul className="max-w-prose space-y-2 text-sm">
            {caseData.references.map((r) => (
              <li key={r.text}>
                {r.url ? (
                  <a href={r.url} className="underline decoration-2 underline-offset-4" rel="noreferrer" target="_blank">
                    {r.text}
                  </a>
                ) : (
                  r.text
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={t.medals}>
        <ul className="flex flex-wrap gap-6">
          {MEDALS.map((id) => (
            <li key={id} className="flex items-center gap-2">
              <Image
                src={`/art/ui/medalha-${id}.png`}
                alt=""
                width={40}
                height={40}
                unoptimized
                className={`pixelated ${medals[id] ? "" : "opacity-35 grayscale"}`}
              />
              <span>
                <span className="block font-pixel font-bold">{strings.medals[id].name}</span>
                <span className="text-sm text-paper-5">
                  {medals[id] ? strings.levels.earned : strings.levels.notEarned} · {strings.medals[id].description}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <ButtonLink href="/fases" className="mt-6">
          {t.again}
        </ButtonLink>
      </Section>
    </Shell>
  );
}

function Shell({ caseData, children }: { caseData: PublicCase; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-wood text-on-wood">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/fases" className="px-btn px-btn-paper text-base">
          <svg aria-hidden viewBox="0 0 8 8" className="size-4" fill="currentColor" shapeRendering="crispEdges">
            <path d="M5 1h1v1H5zM4 2h1v1H4zM3 3h1v2H3zM4 5h1v1H4zM5 6h1v1H5z" />
          </svg>
          {t.back}
        </Link>
        <p className="font-pixel text-lg font-semibold sm:text-xl">{caseData.title}</p>
      </header>
      <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
        <h1 className="px-title mt-4 text-[clamp(2.25rem,6vw,3.25rem)] leading-none text-[#f0d9a0]">{t.title}</h1>
        {children}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 bg-paper-0 p-5 text-ink px-frame sm:p-7">
      <h2 className="mb-4 font-pixel text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
