import { describe, expect, it } from "vitest";
import { computeResult, orderRatio } from "@/lib/game/score";
import { freshState, type GameState } from "@/lib/game/signed-state";
import type { PlayerOrder } from "@/lib/game/check";

const ref = (n: number, outside: string[] = []) => [
  ...Array.from({ length: n }, (_, i) => ({ evidenceId: `c${i + 1}`, referenceOrder: i + 1, belongsToStory: true, isKeyMilestone: false })),
  ...outside.map((id) => ({ evidenceId: id, referenceOrder: null, belongsToStory: false, isKeyMilestone: false })),
];
const line = (ids: string[], outside: string[] = []): PlayerOrder => ({ slots: ids.map((i) => [i]), outside });

const caminha = [
  { evidenceId: "partida", referenceOrder: 1, belongsToStory: true, isKeyMilestone: true },
  { evidenceId: "monte-pascoal", referenceOrder: 2, belongsToStory: true, isKeyMilestone: true },
  { evidenceId: "habitantes", referenceOrder: 3, belongsToStory: true, isKeyMilestone: false },
  { evidenceId: "missa-cruz", referenceOrder: 4, belongsToStory: true, isKeyMilestone: false },
  { evidenceId: "terra-brasilis", referenceOrder: 5, belongsToStory: true, isKeyMilestone: false },
  { evidenceId: "tordesilhas", referenceOrder: null, belongsToStory: false, isKeyMilestone: false },
];
const full = line(["partida", "monte-pascoal", "habitantes", "missa-cruz", "terra-brasilis"], ["tordesilhas"]);

const base = (over: Partial<GameState> = {}): GameState => ({ ...freshState("caminha"), outcome: "solved", solvedOnChoice: 1, ...over });

describe("orderRatio", () => {
  it("linha completa com a carta de fora fora vale 1", () => expect(orderRatio(caminha, full)).toBe(1));
  it("só duas cartas na ordem vale 2/6", () =>
    expect(orderRatio(caminha, line(["partida", "monte-pascoal"]))).toBeCloseTo(2 / 6, 10));
});

describe("computeResult", () => {
  it("soma tudo na melhor jogada: 1100 e 3 estrelas", () => {
    const state = base({
      checksUsed: 1,
      justification: "partial",
      puzzles: {
        epoch: { tries: 1, firstTryCorrect: true },
        codes: { a: { tries: 1, opened: true, skipped: false }, b: { tries: 3, opened: true, skipped: true } },
        pieces: "solved",
        quiz: { q1: true, q2: true, q3: false },
      },
    });
    const r = computeResult({ state, reference: caminha, player: full });
    expect(r.points).toBe(1100);
    expect(r.stars).toBe(3);
    expect(r.breakdown).toEqual({ answer: 500, order: 300, justification: 75, epoch: 100, codes: 50, pieces: 50, quiz: 50, checks: -25 });
  });

  it("2ª escolha com ordem 0,8: answer 250, order 240, 2 estrelas", () => {
    const player = line(["c1", "c2", "c3", "c4"]);
    const r = computeResult({ state: base({ solvedOnChoice: 2 }), reference: ref(5), player });
    expect(r.breakdown.answer).toBe(250);
    expect(r.breakdown.order).toBe(240);
    expect(r.stars).toBe(2);
  });

  it("ordem 0,7 exata fica com 1 estrela", () => {
    const r = computeResult({ state: base(), reference: ref(10), player: line(["c1", "c2", "c3", "c4", "c5", "c6", "c7"]) });
    expect(r.stars).toBe(1);
    expect(r.breakdown.order).toBe(210);
  });

  it("3 estrelas pedem justificativa", () => {
    const r = computeResult({ state: base(), reference: caminha, player: full });
    expect(r.stars).toBe(2);
  });

  it("não resolvido: 0 estrelas, answer 0, o resto soma", () => {
    const r = computeResult({ state: base({ outcome: "failed", solvedOnChoice: null }), reference: caminha, player: full });
    expect(r.stars).toBe(0);
    expect(r.breakdown.answer).toBe(0);
    expect(r.points).toBe(300);
  });

  it("nunca abaixo de 0", () => {
    const r = computeResult({ state: base({ outcome: "failed", solvedOnChoice: null, checksUsed: 50 }), reference: caminha, player: line([]) });
    expect(r.points).toBe(0);
  });

  it("sem enigmas zera os itens de enigma", () => {
    const r = computeResult({ state: base(), reference: caminha, player: full });
    expect(r.breakdown).toMatchObject({ epoch: 0, codes: 0, pieces: 0, quiz: 0 });
  });
});
