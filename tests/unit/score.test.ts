import { describe, expect, it } from "vitest";
import { computeResult, orderRatio } from "@/lib/game/score";
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

describe("orderRatio", () => {
  it("linha completa com a carta de fora fora vale 1", () => expect(orderRatio(caminha, full)).toBe(1));
  it("só duas cartas na ordem vale 2/6", () =>
    expect(orderRatio(caminha, line(["partida", "monte-pascoal"]))).toBeCloseTo(2 / 6, 10));
});

describe("computeResult (D21: época 400 + ordem até 600)", () => {
  it("época certa e ordem perfeita: 1000 e 3 estrelas", () => {
    const r = computeResult({ epochCorrect: true, reference: caminha, player: full });
    expect(r).toEqual({ stars: 3, points: 1000, breakdown: { epoch: 400, order: 600 } });
  });

  it("época certa e ordem 4/6: 800 e 2 estrelas", () => {
    const r = computeResult({ epochCorrect: true, reference: caminha, player: line(["partida", "monte-pascoal", "habitantes", "missa-cruz"]) });
    expect(r.breakdown).toEqual({ epoch: 400, order: 400 });
    expect(r.stars).toBe(2);
  });

  it("ordem perfeita sem a época: 600 e 2 estrelas, nunca 100%", () => {
    const r = computeResult({ epochCorrect: false, reference: caminha, player: full });
    expect(r).toEqual({ stars: 2, points: 600, breakdown: { epoch: 0, order: 600 } });
  });

  it("só a época: 400 e 1 estrela", () => {
    const r = computeResult({ epochCorrect: true, reference: caminha, player: line([]) });
    expect(r).toEqual({ stars: 1, points: 400, breakdown: { epoch: 400, order: 0 } });
  });

  it("nada certo: 0 pontos e 0 estrelas", () => {
    const r = computeResult({ epochCorrect: false, reference: caminha, player: line([]) });
    expect(r).toEqual({ stars: 0, points: 0, breakdown: { epoch: 0, order: 0 } });
  });

  it("arredonda a ordem: 2 de 3 vale 400", () => {
    const r = computeResult({ epochCorrect: false, reference: ref(3), player: line(["c1", "c2"]) });
    expect(r.breakdown.order).toBe(400);
  });
});
