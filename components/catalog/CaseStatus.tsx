"use client";

import { useHydrated, useProgress } from "@/lib/progress/store";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.catalog;

/** Situação do caso para este navegador, como um carimbo na ficha. */
export function CaseStatus({ slug }: { slug: string }) {
  const [progress] = useProgress(slug);
  const hydrated = useHydrated();
  if (!hydrated) return <span className="inline-block h-7" aria-hidden />;
  const status = progress.status;
  const done = status === "solved" || status === "failed";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-2 px-2 py-0.5 font-pixel text-sm font-bold ${
        done ? "border-stamp text-stamp" : status === "in_progress" ? "border-ink text-ink" : "border-paper-4 text-paper-5"
      }`}
    >
      <span className="sr-only">{t.statusLabel}: </span>
      {t.status[status]}
    </span>
  );
}

export function StartLabel({ slug }: { slug: string }) {
  const [progress] = useProgress(slug);
  const hydrated = useHydrated();
  return <>{hydrated && progress.status !== "not_started" ? strings.briefing.resume : strings.briefing.start}</>;
}
