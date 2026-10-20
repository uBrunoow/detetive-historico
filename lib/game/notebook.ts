import type { Evidence, PublicCase } from "@/lib/content/schema";
import type { CaseProgress, PlayerCard } from "@/lib/progress/types";

/** Regras puras do caderno de investigação (sem React). */

function patchCard(progress: CaseProgress, evidenceId: string, patch: Partial<PlayerCard>): CaseProgress {
  const card = progress.cards[evidenceId];
  if (!card) return progress;
  return { ...progress, cards: { ...progress.cards, [evidenceId]: { ...card, ...patch } } };
}

export function setCardNotes(progress: CaseProgress, evidenceId: string, notes: string): CaseProgress {
  return patchCard(progress, evidenceId, { notes });
}

export function toggleImportant(progress: CaseProgress, evidenceId: string): CaseProgress {
  const card = progress.cards[evidenceId];
  return card ? patchCard(progress, evidenceId, { important: !card.important }) : progress;
}

export function setNotebookNotes(progress: CaseProgress, notes: string): CaseProgress {
  return { ...progress, notes };
}

/** Cartas coletadas: importantes primeiro, depois na ordem em que foram guardadas. */
export function collectedCards(c: PublicCase, progress: CaseProgress): { evidence: Evidence; card: PlayerCard }[] {
  return c.evidence
    .flatMap((evidence) => {
      const card = progress.cards[evidence.id];
      return card ? [{ evidence, card }] : [];
    })
    .sort(
      (a, b) =>
        Number(b.card.important) - Number(a.card.important) || a.card.collectedAt.localeCompare(b.card.collectedAt),
    );
}

export function addHypothesis(progress: CaseProgress, text: string, now = new Date(), id = crypto.randomUUID()): CaseProgress {
  const trimmed = text.trim();
  if (!trimmed) return progress;
  return { ...progress, hypotheses: [...progress.hypotheses, { id, text: trimmed, createdAt: now.toISOString() }] };
}

export function updateHypothesis(progress: CaseProgress, id: string, text: string): CaseProgress {
  return { ...progress, hypotheses: progress.hypotheses.map((h) => (h.id === id ? { ...h, text } : h)) };
}

export function removeHypothesis(progress: CaseProgress, id: string): CaseProgress {
  return { ...progress, hypotheses: progress.hypotheses.filter((h) => h.id !== id) };
}
