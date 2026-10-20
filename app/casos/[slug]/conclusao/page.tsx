import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ResolutionView } from "@/components/resolution/ResolutionView";
import { Loading } from "@/components/ui/Loading";
import { getPublicCase, listPublishedCases } from "@/lib/content/public";
import { strings } from "@/lib/strings/pt-BR";

export async function generateStaticParams() {
  const cases = await listPublishedCases();
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/casos/[slug]/conclusao">) {
  const c = await getPublicCase((await params).slug);
  return { title: c ? `${strings.resolution.title} — ${c.title}` : undefined };
}

export default function Page({ params }: PageProps<"/casos/[slug]/conclusao">) {
  return (
    <Suspense fallback={<Loading dark />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Pick<PageProps<"/casos/[slug]/conclusao">, "params">) {
  const c = await getPublicCase((await params).slug);
  if (!c) notFound();
  return <ResolutionView caseData={c} />;
}
