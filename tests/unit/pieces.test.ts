import { describe, expect, it } from "vitest";
import { correctCount, isSolved, shuffle, swap } from "@/lib/game/pieces";

describe("peças", () => {
  it("embaralha sem devolver a solução", () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const order = shuffle(6, seed);
      expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5]);
      expect(isSolved(order)).toBe(false);
    }
  });

  it("resolve com uma troca", () => {
    expect(isSolved(swap([1, 0, 2, 3, 4, 5], 0, 1))).toBe(true);
  });

  it("conta as peças que estão no lugar", () => {
    expect(correctCount([0, 2, 1, 3, 4, 5])).toBe(4);
  });
});
