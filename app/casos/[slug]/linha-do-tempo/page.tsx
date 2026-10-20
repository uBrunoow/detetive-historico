import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TimelineView } from "@/components/timeline/TimelineView";
import { Loading } from "@/components/ui/Loading";
import { getPublicCase, listPublishedCases } from "@/lib/content/public";
import { strings } from "@/lib/strings/pt-BR";

export async function generateStaticParams() {
  const cases = await listPublishedCases();
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/casos/[slug]/linha-do-tempo">) {
  const c = await getPublicCase((await params).slug);
  return { title: c ? `${strings.timeline.title} — ${c.title}` : undefined };
}

export default function TimelinePage({ params }: PageProps<"/casos/[slug]/linha-do-tempo">) {
  return (
    <Suspense fallback={<Loading dark />}>
      <TimelineContent params={params} />
    </Suspense>
  );
}

async function TimelineContent({ params }: Pick<PageProps<"/casos/[slug]/linha-do-tempo">, "params">) {
  const c = await getPublicCase((await params).slug);
  if (!c) notFound();
  return <TimelineView caseData={c} />;
}
