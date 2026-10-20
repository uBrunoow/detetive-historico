"use client";

import { readProgress } from "./store";

type CaseRef = { slug: string; title: string; startSceneId: string; sceneIds: string[] };

/** Caso em andamento mais recente neste navegador, para o botão "Continuar". */
export function findContinueTarget(cases: CaseRef[]): { href: string; title: string } | null {
  let best: { href: string; title: string; at: string } | null = null;
  for (const c of cases) {
    const p = readProgress(c.slug);
    if (p.status !== "in_progress" || !p.updatedAt) continue;
    if (best && best.at >= p.updatedAt) continue;
    const scene = p.lastSceneId && c.sceneIds.includes(p.lastSceneId) ? p.lastSceneId : c.startSceneId;
    best = { href: `/casos/${c.slug}/cena/${scene}`, title: c.title, at: p.updatedAt };
  }
  return best && { href: best.href, title: best.title };
}
