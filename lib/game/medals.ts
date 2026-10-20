import type { PublicCase } from "@/lib/content/schema";
import type { CaseProgress } from "@/lib/progress/types";
import { everyPlacementJustified } from "./timeline";

/**
 * Medalhas pedagógicas: reconhecem o processo de investigação (explorar,
 * justificar, concluir), nunca velocidade nem acerto de primeira (PRD §6, §4).
 */
export type MedalId = "arquivista" | "cronista" | "detetive";
export const MEDALS: MedalId[] = ["arquivista", "cronista", "detetive"];

export function earnedMedals(c: PublicCase, p: CaseProgress): Record<MedalId, boolean> {
  return {
    arquivista: c.evidence.every((e) => Boolean(p.cards[e.id])),
    cronista: everyPlacementJustified(c, p),
    detetive: p.status === "solved",
  };
}
