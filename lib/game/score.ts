import type { PrivateCase } from "@/lib/content/schema";
import type { PlayerOrder } from "./check";
import { compareTimelines } from "./closure";
import type { GameState, Result } from "./signed-state";

/** Pontuação do caso (spec "jogo colorido"): função pura, sem cookies nem leitura de arquivos. */
export type ScoreBreakdown = {
  answer: number;
  order: number;
  justification: number;
  epoch: number;
  codes: number;
  pieces: number;
  quiz: number;
  checks: number;
};

/** (cartas "ordered" + "correctlyOutside") ÷ total de cartas da referência. */
export function orderRatio(reference: PrivateCase["timelineReference"], player: PlayerOrder): number {
  if (reference.length === 0) return 0;
  const outcomes = compareTimelines(reference, player);
  const good = Object.values(outcomes).filter((o) => o === "ordered" || o === "correctlyOutside").length;
  return good / reference.length;
}

export function computeResult(input: {
  state: GameState;
  reference: PrivateCase["timelineReference"];
  player: PlayerOrder;
}): Result {
  const { state, reference, player } = input;
  const solved = state.outcome === "solved";
  const ratio = orderRatio(reference, player);
  const { puzzles } = state;

  const breakdown: ScoreBreakdown = {
    answer: solved ? (state.solvedOnChoice === 1 ? 500 : 250) : 0,
    order: Math.round(300 * ratio),
    justification: state.justification === "accepted" ? 150 : state.justification === "partial" ? 75 : 0,
    epoch: puzzles.epoch.firstTryCorrect === true ? 100 : 0,
    codes: 50 * Object.values(puzzles.codes).filter((c) => c.opened && !c.skipped).length,
    pieces: puzzles.pieces === "solved" ? 50 : 0,
    quiz: 25 * Object.values(puzzles.quiz).filter(Boolean).length,
    checks: -25 * state.checksUsed,
  };
  const points = Math.max(0, Object.values(breakdown).reduce((a, b) => a + b, 0));

  let stars: Result["stars"] = 0;
  if (solved) {
    stars = 1;
    if (ratio > 0.7) stars = 2;
    if (state.solvedOnChoice === 1 && ratio === 1 && (state.justification === "accepted" || state.justification === "partial")) stars = 3;
  }
  return { stars, points, breakdown };
}
