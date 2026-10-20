import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/ui/Loading";
import { StartButton } from "@/components/catalog/StartButton";
import { getPublicCase, listPublishedCases } from "@/lib/content/public";
import { strings } from "@/lib/strings/pt-BR";

const t = strings.briefing;

export async function generateStaticParams() {
  const cases = await listPublishedCases();
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/casos/[slug]">) {
  const c = await getPublicCase((await params).slug);
  return { title: c?.title };
}

export default function BriefingPage({ params }: PageProps<"/casos/[slug]">) {
  return (
    <Suspense fallback={<Loading dark />}>
      <Briefing params={params} />
    </Suspense>
  );
}

async function Briefing({ params }: Pick<PageProps<"/casos/[slug]">, "params">) {
  const c = await getPublicCase((await params).slug);
  if (!c) notFound();

  return (
    <main id="conteudo" className="flex-1 bg-wood px-3 py-6 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/fases"
          className="px-btn px-btn-paper text-base"
        >
          <svg aria-hidden viewBox="0 0 8 8" className="size-4" fill="currentColor" shapeRendering="crispEdges">
            <path d="M5 1h1v1H5zM4 2h1v1H4zM3 3h1v2H3zM4 5h1v1H4zM5 6h1v1H5z" />
          </svg>
          {t.back}
        </Link>

        <article className="doc-sheet mt-8 px-6 pb-10 pt-8 sm:px-12 sm:pb-14 sm:pt-12">
          <div
            role="img"
            aria-label={`Carimbo: ${t.stamp}`}
            className="doc-stamp absolute right-6 top-14 rotate-[-9deg] px-3 py-1 text-lg font-bold uppercase tracking-[0.08em] sm:right-10 sm:top-16"
          >
            {t.stamp}
          </div>
          <p className="border-b-[3px] border-double border-doc-ink pb-2 text-center font-typed text-sm font-bold">
            {c.place} — {c.period}
          </p>
          <h1 className="mt-6 max-w-[85%] font-pixel text-3xl font-bold leading-tight sm:text-4xl">{c.title}</h1>

          <div className="mt-6 max-w-[65ch] space-y-4 font-typed leading-7">
            {c.briefing.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <section aria-labelledby="pergunta" className="mt-8 border-2 border-doc-ink px-5 py-4">
            <h2 id="pergunta" className="font-typed text-sm font-bold text-doc-faint">
              {t.question}
            </h2>
            <p className="mt-1 font-typed text-lg font-bold leading-snug">{c.question}</p>
          </section>

          <section aria-labelledby="intervalo" className="mt-6">
            <h2 id="intervalo" className="font-typed text-sm font-bold text-doc-faint">
              {t.period}
            </h2>
            <ol className="mt-2 border-l-2 border-doc-ink pl-4 font-typed text-sm leading-6">
              <li>{c.timeline.startLabel}</li>
              <li className="mt-2">{c.timeline.endLabel}</li>
            </ol>
          </section>

          <section aria-labelledby="como" className="mt-8">
            <h2 id="como" className="font-typed text-sm font-bold text-doc-faint">
              {t.howTo}
            </h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-base">
              {t.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </section>

          <div className="mt-10">
            <StartButton slug={c.slug} startSceneId={c.startSceneId} sceneIds={c.scenes.map((s) => s.id)} />
          </div>
        </article>
      </div>
    </main>
  );
}
