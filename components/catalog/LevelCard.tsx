"use client";

import Image from "next/image";
import Link from "next/link";
import type { PublicCase } from "@/lib/content/schema";
import { useHydrated, useProgress } from "@/lib/progress/store";
import { StarRating } from "@/components/ui/StarRating";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.catalog;

/** Uma fase: capa, pergunta, metadados e resultado oficial em estrelas. */
export function LevelCard({ c }: { c: PublicCase }) {
  const [progress] = useProgress(c.slug);
  const hydrated = useHydrated();
  const status = hydrated ? progress.status : "not_started";

  return (
    <article className="group relative flex h-full flex-col bg-paper-0 text-ink px-frame">
      <div className="relative aspect-[16/10] overflow-hidden bg-paper-6">
        <Image src={c.cover.src} alt={c.cover.alt} fill unoptimized className="pixelated object-cover" />
        <p className="absolute bottom-2 right-2 bg-paper-0 px-2 py-0.5 font-pixel text-sm font-semibold px-frame-flat">
          <span className="sr-only">{t.statusLabel}: </span>
          {t.status[status]}
        </p>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h2 className="font-title text-2xl leading-tight">
          <Link
            href={`/casos/${c.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-has-[:focus-visible]:underline"
          >
            {c.title}
          </Link>
        </h2>
        <p className="mt-2 text-paper-5">{c.question}</p>

        <p className="mt-3 text-sm font-bold text-paper-5">
          {c.place} · {t.difficulty[c.difficulty]} · {t.duration(c.durationMinutes)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <StarRating stars={hydrated ? progress.official?.stars ?? 0 : 0} />
          {hydrated && progress.official && <span className="font-bold text-sun">{progress.official.points} pts</span>}
        </div>
      </div>
    </article>
  );
}
