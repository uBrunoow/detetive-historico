import type { PrivateCase } from "@/lib/content/schema";
import type { PlayerOrder } from "./check";

/**
 * Comparação da linha do jogador com a de referência, para o encerramento (PRD §6).
 * Mostra aprendizado, não nota: diz o que ficou coerente e onde a ordem diverge.
 */
export type CardOutcome =
  | "ordered" // pertence à história e está em ordem coerente com as outras posicionadas
  | "diverges" // pertence, mas a ordem diverge da referência
  | "wronglyOutside" // pertence, mas foi posta fora da história
  | "missing" // pertence e não foi posicionada
  | "correctlyOutside" // não pertence e foi posta fora
  | "shouldBeOutside" // não pertence, mas está na linha
  | "notPlaced"; // não pertence e ficou no caderno

export function compareTimelines(reference: PrivateCase["timelineReference"], player: PlayerOrder): Record<string, CardOutcome> {
  const pos = new Map<string, number>();
  player.slots.forEach((slot, i) => slot.forEach((id) => pos.set(id, i)));
  const outside = new Set(player.outside);
  const placedStory = reference.filter((r) => r.belongsToStory && pos.has(r.evidenceId));

  const result: Record<string, CardOutcome> = {};
  for (const r of reference) {
    const id = r.evidenceId;
    if (!r.belongsToStory) {
      result[id] = outside.has(id) ? "correctlyOutside" : pos.has(id) ? "shouldBeOutside" : "notPlaced";
      continue;
    }
    if (outside.has(id)) result[id] = "wronglyOutside";
    else if (!pos.has(id)) result[id] = "missing";
    else {
      const mine = pos.get(id)!;
      const clash = placedStory.some((o) => {
        if (o.evidenceId === id || o.referenceOrder === r.referenceOrder) return false;
        const theirs = pos.get(o.evidenceId)!;
        return (o.referenceOrder! < r.referenceOrder!) !== (theirs < mine) || theirs === mine;
      });
      result[id] = clash ? "diverges" : "ordered";
    }
  }
  return result;
}
