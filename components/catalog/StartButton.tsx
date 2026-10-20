"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StartLabel } from "@/components/catalog/CaseStatus";
import { startCase } from "@/lib/game/scene";
import { readProgress, updateProgress } from "@/lib/progress/store";

/** Marca o caso como em andamento e leva à última cena visitada (ou à inicial). */
export function StartButton({ slug, startSceneId, sceneIds }: { slug: string; startSceneId: string; sceneIds: string[] }) {
  const router = useRouter();
  return (
    <Button
      className="px-8 text-lg"
      onClick={() => {
        updateProgress(slug, startCase);
        const last = readProgress(slug).lastSceneId;
        const scene = last && sceneIds.includes(last) ? last : startSceneId;
        router.push(`/casos/${slug}/cena/${scene}`);
      }}
    >
      <StartLabel slug={slug} />
    </Button>
  );
}
