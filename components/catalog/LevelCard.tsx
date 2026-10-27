"use client";

import Image from "next/image";
import Link from "next/link";
import type { PublicCase } from "@/lib/content/schema";
import { earnedMedals, MEDALS } from "@/lib/game/medals";
import { useHydrated, useProgress } from "@/lib/progress/store";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.catalog;
const tl = strings.levels;

/** Uma fase: pasta de arquivo com capa em pixel, dados do caso, situação e medalhas. */
export function LevelCard({ c }: { c: PublicCase }) {
  const [progress] = useProgress(c.slug);
  const hydrated = useHydrated();
  const medals = earnedMedals(c, progress);
  const status = hydrated ? progress.status : "not_started";

  return (
    <article className="group relative flex h-full flex-col bg-paper-0 text-ink px-frame">
      {/* aba da pasta */}
      <div aria-hidden className="absolute -top-5 left-4 h-5 w-28 bg-paper-0 px-frame-flat" />
      <div className="relative aspect-[16/10] overflow-hidden bg-paper-6">
        <Image src={c.cover.src} alt={c.cover.alt} fill unoptimized className="pixelated object-cover" />
        {(c.tutorial || c.beta) && (
          <p className="absolute left-2 top-2 bg-paper-0 px-2 py-0.5 font-pixel text-sm font-semibold text-stamp px-frame-flat">
            {c.tutorial ? t.tutorial : t.beta}
          </p>
        )}
        <p className="absolute bottom-2 right-2 bg-paper-0 px-2 py-0.5 font-pixel text-sm font-semibold px-frame-flat">
          <span className="sr-only">{t.statusLabel}: </span>
          {t.status[status]}
        </p>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h2 className="font-pixel text-xl font-semibold leading-tight">
          <Link
            href={`/casos/${c.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-has-[:focus-visible]:underline"
          >
            {c.title}
          </Link>
        </h2>
        <p className="mt-2 text-paper-5">{c.question}</p>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="font-pixel text-paper-5">{t.period}</dt>
            <dd>{c.period}</dd>
          </div>
          <div>
            <dt className="font-pixel text-paper-5">{t.place}</dt>
            <dd>{c.place}</dd>
          </div>
          <div>
            <dt className="font-pixel text-paper-5">{t.difficultyLabel}</dt>
            <dd>{t.difficulty[c.difficulty]}</dd>
          </div>
          <div>
            <dt className="font-pixel text-paper-5">{t.durationLabel}</dt>
            <dd>{t.duration(c.durationMinutes)}</dd>
          </div>
        </dl>

        <div className="mt-auto pt-5">
          <h3 className="font-pixel text-sm text-paper-5">{tl.medals}</h3>
          <ul className="mt-2 flex flex-wrap gap-3">
            {MEDALS.map((id) => {
              const won = hydrated && medals[id];
              const m = strings.medals[id];
              return (
                <li key={id} title={m.description} className="flex items-center gap-1.5 text-sm">
                  <Image
                    src={`/art/ui/medalha-${id}.png`}
                    alt=""
                    width={32}
                    height={32}
                    unoptimized
                    className={`pixelated ${won ? "" : "opacity-35 grayscale"}`}
                  />
                  <span className={won ? "font-semibold" : "text-paper-5"}>
                    {m.name}
                    <span className="sr-only">
                      : {won ? tl.earned : tl.notEarned}. {m.description}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </article>
  );
}
