import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/ui/Loading";
import { SceneView } from "@/components/scene/SceneView";
import { getPublicCase, listPublishedCases } from "@/lib/content/public";

export async function generateStaticParams() {
  const cases = await listPublishedCases();
  return cases.flatMap((c) => c.scenes.map((s) => ({ slug: c.slug, sceneId: s.id })));
}

export async function generateMetadata({ params }: PageProps<"/casos/[slug]/cena/[sceneId]">) {
  const { slug, sceneId } = await params;
  const c = await getPublicCase(slug);
  const scene = c?.scenes.find((s) => s.id === sceneId);
  return { title: scene && c ? `${scene.name} — ${c.title}` : undefined };
}

export default function ScenePage({ params }: PageProps<"/casos/[slug]/cena/[sceneId]">) {
  return (
    <Suspense fallback={<Loading dark />}>
      <SceneContent params={params} />
    </Suspense>
  );
}

async function SceneContent({ params }: Pick<PageProps<"/casos/[slug]/cena/[sceneId]">, "params">) {
  const { slug, sceneId } = await params;
  const c = await getPublicCase(slug);
  if (!c || !c.scenes.some((s) => s.id === sceneId)) notFound();
  return <SceneView caseData={c} sceneId={sceneId} />;
}
