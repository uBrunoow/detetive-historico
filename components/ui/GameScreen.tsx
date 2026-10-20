import Link from "next/link";
import type { ReactNode } from "react";

/** Moldura das telas de menu: tampo de madeira, título pixel e botão de voltar. */
export function GameScreen({
  title,
  backHref = "/",
  backLabel,
  children,
}: {
  title: string;
  backHref?: string;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <main id="conteudo" className="doc-shadow-desk flex min-h-dvh flex-1 flex-col text-on-wood">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-8 sm:pt-10">
        <Link href={backHref} className="px-btn px-btn-paper text-base">
          <svg aria-hidden viewBox="0 0 8 8" className="pixelated size-4" fill="currentColor" shapeRendering="crispEdges">
            <path d="M5 1h1v1H5zM4 2h1v1H4zM3 3h1v2H3zM4 5h1v1H4zM5 6h1v1H5z" />
          </svg>
          {backLabel}
        </Link>
        <h1 className="px-title mt-8 text-[clamp(2.25rem,6vw,3.5rem)] leading-none text-[#f0d9a0]">{title}</h1>
        {children}
      </div>
    </main>
  );
}
