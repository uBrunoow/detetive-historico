import type { CaseProgress } from "@/lib/progress/types";
import type { PublicCase, SceneObject } from "@/lib/content/schema";

/** Regras puras de exploração da cena (sem React). */

export function isUnlocked(obj: SceneObject, examined: readonly string[], unlocked: readonly string[] = []): boolean {
  if (obj.type !== "locked") return true;
  if (obj.unlock && "code" in obj.unlock) return unlocked.includes(obj.id);
  const requires = obj.unlock && "requiresExamined" in obj.unlock ? obj.unlock.requiresExamined : [];
  return requires.every((id) => examined.includes(id));
}

export function markExamined(progress: CaseProgress, objectId: string, sceneId: string): CaseProgress {
  const examined = progress.examined.includes(objectId) ? progress.examined : [...progress.examined, objectId];
  return {
    ...progress,
    examined,
    lastSceneId: sceneId,
    status: progress.status === "not_started" ? "in_progress" : progress.status,
  };
}

export function collectEvidence(progress: CaseProgress, evidenceId: string, now = new Date()): CaseProgress {
  if (progress.cards[evidenceId]) return progress;
  return {
    ...progress,
    status: progress.status === "not_started" ? "in_progress" : progress.status,
    cards: { ...progress.cards, [evidenceId]: { collectedAt: now.toISOString(), notes: "", important: false } },
  };
}

export function startCase(progress: CaseProgress): CaseProgress {
  return progress.status === "not_started" ? { ...progress, status: "in_progress" } : progress;
}

/**
 * Fontes ainda sem carta no caderno. Ver uma fonte não basta: só conta quando o jogador a guarda.
 * Conta todas as fontes, não só as relevantes: ver DECISOES.md, D4.
 */
export function undiscoveredCount(c: PublicCase, progress: CaseProgress): number {
  return c.evidence.filter((e) => !progress.cards[e.id]).length;
}
