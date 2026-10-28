import type { GameState } from "./signed-state";

/** Regras puras dos enigmas (sem cookies nem arquivos): usadas pelas Server Actions e testadas à parte. */

/** Tira espaços, zeros à esquerda, acentos e maiúsculas: " 01500 " → "1500". */
export function normalizeCode(s: string): string {
  const t = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "");
  return t.replace(/^0+(?=.)/, "");
}

/** Dica a partir da 2ª tentativa, "abrir mesmo assim" a partir da 3ª. */
export function applyCodeTry(
  state: GameState,
  objectId: string,
  input: string,
  code: string,
): { state: GameState; opened: boolean; showHint: boolean; canSkip: boolean } {
  const prev = state.puzzles.codes[objectId] ?? { tries: 0, opened: false, skipped: false };
  if (prev.opened) return { state, opened: true, showHint: false, canSkip: false };
  const opened = normalizeCode(input) === normalizeCode(code);
  const entry = { ...prev, tries: prev.tries + 1, opened };
  return {
    state: { ...state, puzzles: { ...state.puzzles, codes: { ...state.puzzles.codes, [objectId]: entry } } },
    opened,
    showHint: !opened && entry.tries >= 2,
    canSkip: !opened && entry.tries >= 3,
  };
}

/** Abre o cadeado sem pontos; só com 3 tentativas ou mais. */
export function applySkipCode(state: GameState, objectId: string): { state: GameState; opened: boolean } {
  const prev = state.puzzles.codes[objectId] ?? { tries: 0, opened: false, skipped: false };
  if (prev.opened) return { state, opened: true };
  if (prev.tries < 3) return { state, opened: false };
  const entry = { ...prev, opened: true, skipped: true };
  return { state: { ...state, puzzles: { ...state.puzzles, codes: { ...state.puzzles.codes, [objectId]: entry } } }, opened: true };
}

/** O primeiro resultado por evidência é o que vale: responder de novo não muda nem soma. */
export function applyQuiz(
  state: GameState,
  evidenceId: string,
  index: number,
  answer: { correct: number; explanation: string },
): { state: GameState; correct: boolean; explanation: string } {
  const correct = index === answer.correct;
  if (evidenceId in state.puzzles.quiz) return { state, correct, explanation: answer.explanation };
  return {
    state: { ...state, puzzles: { ...state.puzzles, quiz: { ...state.puzzles.quiz, [evidenceId]: correct } } },
    correct,
    explanation: answer.explanation,
  };
}

/** Idempotente: o primeiro resultado gravado vence. */
export function applyPieces(state: GameState, how: "solved" | "skipped"): GameState {
  if (state.puzzles.pieces !== null) return state;
  return { ...state, puzzles: { ...state.puzzles, pieces: how } };
}
