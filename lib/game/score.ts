import type { PrivateCase } from "@/lib/content/schema";
import type { PlayerOrder } from "./check";
import { compareTimelines } from "./closure";

/** Pontuação do veredito (DECISOES.md, D21): época 400 + ordem até 600; 1000 = 100%. Função pura. */
export type ScoreBreakdown = { epoch: number; order: number };
export type Result = { stars: 0 | 1 | 2 | 3; points: number; breakdown: ScoreBreakdown };

export const EPOCH_POINTS = 400;
export const ORDER_POINTS = 600;
/** A partir daqui o caso conta como resolvido (2 estrelas). */
export const SOLVED_POINTS = 600;

/** (cartas "ordered" + "correctlyOutside") ÷ total de cartas da referência. */
export function orderRatio(reference: PrivateCase["timelineReference"], player: PlayerOrder): number {
  if (reference.length === 0) return 0;
  const outcomes = compareTimelines(reference, player);
  const good = Object.values(outcomes).filter((o) => o === "ordered" || o === "correctlyOutside").length;
  return good / reference.length;
}

export function computeResult(input: {
  epochCorrect: boolean;
  reference: PrivateCase["timelineReference"];
  player: PlayerOrder;
}): Result {
  const breakdown: ScoreBreakdown = {
    epoch: input.epochCorrect ? EPOCH_POINTS : 0,
    order: Math.round(ORDER_POINTS * orderRatio(input.reference, input.player)),
  };
  const points = breakdown.epoch + breakdown.order;
  const stars: Result["stars"] = points === EPOCH_POINTS + ORDER_POINTS ? 3 : points >= SOLVED_POINTS ? 2 : points > 0 ? 1 : 0;
  return { stars, points, breakdown };
}
