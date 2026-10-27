import { describe, expect, it } from "vitest";
import { applyCodeTry, applyEpochGuess, applyPieces, applyQuiz, applySkipCode, normalizeCode } from "@/lib/game/puzzles";
import { freshState } from "@/lib/game/signed-state";

const s0 = () => freshState("x");

describe("normalizeCode", () => {
  it("tira espaços e zeros à esquerda", () => {
    expect(normalizeCode(" 01500 ")).toBe("1500");
    expect(normalizeCode("1 500")).toBe("1500");
    expect(normalizeCode("000")).toBe("0");
    expect(normalizeCode(" Ágora ")).toBe("agora");
  });
});

describe("applyCodeTry", () => {
  it("dica só a partir da 2ª tentativa e pular só na 3ª", () => {
    const a = applyCodeTry(s0(), "o", "1499", "1500");
    expect([a.opened, a.showHint, a.canSkip]).toEqual([false, false, false]);
    const b = applyCodeTry(a.state, "o", "1498", "1500");
    expect([b.opened, b.showHint, b.canSkip]).toEqual([false, true, false]);
    const c = applyCodeTry(b.state, "o", "1497", "1500");
    expect([c.opened, c.showHint, c.canSkip]).toEqual([false, true, true]);
  });
  it("aceita com espaços e zeros à esquerda", () => {
    expect(applyCodeTry(s0(), "o", " 1500 ", "1500").opened).toBe(true);
    expect(applyCodeTry(s0(), "o", "01500", "1500").opened).toBe(true);
    expect(applyCodeTry(s0(), "o", " 01500 ", "1500").state.puzzles.codes.o.opened).toBe(true);
  });
  it("skip só com 3 tentativas e não pontua", () => {
    expect(applySkipCode(s0(), "o").opened).toBe(false);
    let st = s0();
    for (const t of ["1", "2", "3"]) st = applyCodeTry(st, "o", t, "9").state;
    const r = applySkipCode(st, "o");
    expect(r.opened).toBe(true);
    expect(r.state.puzzles.codes.o).toMatchObject({ opened: true, skipped: true });
  });
});

describe("applyQuiz", () => {
  const ans = { correct: 1, explanation: "porque sim" };
  it("responder duas vezes não sobrescreve o primeiro resultado", () => {
    const a = applyQuiz(s0(), "ev", 0, ans);
    expect(a.correct).toBe(false);
    const b = applyQuiz(a.state, "ev", 1, ans);
    expect(b.correct).toBe(true);
    expect(b.state.puzzles.quiz.ev).toBe(false);
    expect(Object.values(b.state.puzzles.quiz).filter(Boolean)).toHaveLength(0);
  });
});

describe("applyEpochGuess", () => {
  it("errado e depois certo: firstTryCorrect continua false", () => {
    const a = applyEpochGuess(s0(), 0, 2);
    expect(a.correct).toBe(false);
    const b = applyEpochGuess(a.state, 2, 2);
    expect(b.correct).toBe(true);
    expect(b.state.puzzles.epoch).toEqual({ tries: 2, firstTryCorrect: false });
  });
});

describe("applyPieces", () => {
  it("o primeiro resultado vence", () => {
    const a = applyPieces(s0(), "skipped");
    expect(applyPieces(a, "solved").puzzles.pieces).toBe("skipped");
    expect(applyPieces(applyPieces(s0(), "solved"), "skipped").puzzles.pieces).toBe("solved");
  });
});
