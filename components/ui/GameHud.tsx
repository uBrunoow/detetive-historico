import Link from "next/link";
import type { ReactNode } from "react";

export function GameHud({
  backHref = "/",
  backLabel,
  title,
  right,
}: {
  backHref?: string;
  backLabel: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <header className="relative z-10 mb-8 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <Link href={backHref} className="px-btn px-btn-paper w-fit text-base">
        <span aria-hidden>←</span>
        {backLabel}
      </Link>
      <h1 className="px-title text-4xl leading-none sm:text-5xl">{title}</h1>
      {right && <div className="flex items-center justify-start gap-3 sm:justify-end">{right}</div>}
    </header>
  );
}
