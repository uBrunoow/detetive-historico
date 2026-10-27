"use server";

import { z } from "zod";
import { getPrivateCase } from "@/lib/content/private";
import { getPublicCase } from "@/lib/content/public";
import type { LinkType } from "@/lib/content/schema";
import { evaluateAnswer, normalize, type Verdict } from "./answer";
import { checkTimeline as runCheck, type CheckResult } from "./check";
import { strings } from "@/lib/strings/pt-BR";
import { applyCodeTry, applyEpochGuess, applyPieces, applyQuiz, applySkipCode } from "./puzzles";
import { computeResult } from "./score";
import { freshState, readState, writeState, type GameState, type Result } from "./signed-state";

/**
 * Server Actions do jogo. Cada uma é uma entrada pública (POST): valida tudo o que
 * chega, confere os contadores assinados e devolve só o resultado da regra — nunca a
 * solução, a não ser em `getClosure`, depois que o caso foi encerrado.
 */

const slugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]*$/).max(80);
const idList = z.array(z.string().max(80)).max(60);
const orderSchema = z.strictObject({ slots: z.array(idList.min(1)).max(60), outside: idList });

export type PublicGameState = {
  checksLeft: number;
  attemptsLeft: number;
  maxChecks: number;
  maxAttempts: number;
  outcome: GameState["outcome"];
  choicesLeft: number;
  maxChoices: number;
  practice: boolean;
  official: { stars: number; points: number } | null;
  epochAnswered: boolean;
  openedCodes: string[];
};

async function load(slug: unknown) {
  const s = slugSchema.parse(slug);
  const c = await getPublicCase(s);
  if (!c) throw new Error("Caso inexistente.");
  return { c, state: await readState(s) };
}

function view(c: { maxTimelineChecks: number; conclusion: { maxChoices: number } }, state: GameState): PublicGameState {
  return {
    checksLeft: Math.max(0, c.maxTimelineChecks - state.checksUsed),
    attemptsLeft: Math.max(0, c.conclusion.maxChoices - state.choicesUsed),
    maxChecks: c.maxTimelineChecks,
    maxAttempts: c.conclusion.maxChoices,
    outcome: state.outcome,
    choicesLeft: Math.max(0, c.conclusion.maxChoices - state.choicesUsed),
    maxChoices: c.conclusion.maxChoices,
    practice: state.practice,
    official: state.official ? { stars: state.official.stars, points: state.official.points } : null,
    epochAnswered: state.puzzles.epoch.firstTryCorrect !== null,
    openedCodes: Object.entries(state.puzzles.codes).filter(([, v]) => v.opened).map(([k]) => k),
  };
}

export async function getGameState(slug: string): Promise<PublicGameState> {
  const { c, state } = await load(slug);
  return view(c, state);
}

export type CheckResponse =
  | { ok: true; result: CheckResult; state: PublicGameState }
  | { ok: false; error: "no_checks" | "closed" | "empty"; state: PublicGameState };

export async function checkTimeline(slug: string, order: unknown): Promise<CheckResponse> {
  const { c, state } = await load(slug);
  const player = orderSchema.parse(order);
  if (state.outcome) return { ok: false, error: "closed", state: view(c, state) };
  if (state.checksUsed >= c.maxTimelineChecks) return { ok: false, error: "no_checks", state: view(c, state) };
  if (player.slots.length === 0) return { ok: false, error: "empty", state: view(c, state) };

  const next = { ...state, checksUsed: state.checksUsed + 1 };
  const result = runCheck(await getPrivateCase(c.slug), player, next.checksUsed);
  await writeState(next);
  return { ok: true, result, state: view(c, next) };
}

const answerSchema = z.strictObject({
  answer: z.string().max(3000),
  order: orderSchema,
  supporting: idList,
});

export type AnswerResponse =
  | { ok: true; verdict: Verdict; feedback: string | null; state: PublicGameState }
  | { ok: false; error: "no_attempts" | "closed" | "empty" | "locked"; state: PublicGameState };

export async function submitAnswer(slug: string, input: unknown): Promise<AnswerResponse> {
  const { c, state } = await load(slug);
  const { answer, order } = answerSchema.parse(input);
  if (state.outcome) return { ok: false, error: "closed", state: view(c, state) };
  if (state.choicesUsed >= c.conclusion.maxChoices) return { ok: false, error: "no_attempts", state: view(c, state) };
  // Resposta vazia ou curta demais não consome tentativa.
  if (normalize(answer).split(" ").filter(Boolean).length < 3) return { ok: false, error: "empty", state: view(c, state) };
  // A tela só libera com o mínimo de cartas posicionadas (PRD §5.7.4); o servidor confere de novo.
  const placed = new Set(order.slots.flat().filter((id) => c.evidence.some((e) => e.id === id))).size;
  if (placed < c.minCardsToResolve) return { ok: false, error: "locked", state: view(c, state) };

  const { verdict, feedback } = evaluateAnswer((await getPrivateCase(c.slug)).solution, answer);
  const choicesUsed = state.choicesUsed + 1;
  const outcome = verdict === "accepted" ? "solved" : choicesUsed >= c.conclusion.maxChoices ? "failed" : null;
  // Quem resolve precisa de `solvedOnChoice`, senão a pontuação não conta a resposta.
  const solvedOnChoice = outcome === "solved" ? (choicesUsed === 1 ? 1 : 2) : state.solvedOnChoice;
  const next: GameState = { ...state, choicesUsed, outcome, solvedOnChoice };
  await writeState(next);
  return { ok: true, verdict, feedback, state: view(c, next) };
}

export type ClosureData = {
  outcome: "solved" | "failed";
  referenceAnswer: string;
  explanation: string[];
  sourceLimitations: string[];
  reference: {
    evidenceId: string;
    referenceOrder: number | null;
    belongsToStory: boolean;
    isKeyMilestone: boolean;
    datingClueExplanation?: string;
    outsideReason?: string;
  }[];
  relations: { from: string; to: string; type: LinkType; explanation: string }[];
};

/** O recorte da solução para o encerramento; só sai depois de o caso ser encerrado. */
export async function getClosure(slug: string): Promise<ClosureData | null> {
  const { c, state } = await load(slug);
  if (!state.outcome) return null;
  const priv = await getPrivateCase(c.slug);
  return {
    outcome: state.outcome,
    referenceAnswer: priv.solution.referenceAnswer,
    explanation: priv.solution.explanation,
    sourceLimitations: priv.solution.sourceLimitations,
    reference: priv.timelineReference,
    relations: priv.evidenceRelations,
  };
}

// ---------------------------------------------------------------------------
// Enigmas, escolha final e recomeço
// ---------------------------------------------------------------------------

type Closed = { ok: false; error: "closed"; state: PublicGameState };
type Rejected<E extends string> = { ok: false; error: E; state: PublicGameState };
type PublicCase = NonNullable<Awaited<ReturnType<typeof getPublicCase>>>;

const idSchema = z.string().regex(/^[a-z0-9][a-z0-9-]*$/).max(80);
const indexSchema = z.number().int().min(0).max(9);

function codeLock(c: PublicCase, objectId: string) {
  for (const scene of c.scenes) {
    const obj = scene.objects.find((o) => o.id === objectId);
    if (obj?.unlock && "code" in obj.unlock) return obj.unlock.code;
  }
  throw new Error("Este objeto não tem cadeado de código.");
}

export async function guessEpoch(slug: string, index: number) {
  const { c, state } = await load(slug);
  const i = indexSchema.parse(index);
  if (!c.epochGuess || i >= c.epochGuess.options.length) throw new Error("Palpite de época inválido.");
  if (state.outcome) return { ok: false, error: "closed", state: view(c, state) } as Closed;
  const answer = (await getPrivateCase(c.slug)).epochAnswer;
  if (answer === undefined) throw new Error("Caso sem resposta de época.");
  const { state: next, correct } = applyEpochGuess(state, i, answer);
  await writeState(next);
  return { ok: true as const, correct, hint: correct ? undefined : strings.puzzles.epochHint, state: view(c, next) };
}

export async function tryCode(slug: string, objectId: string, input: string) {
  const { c, state } = await load(slug);
  const oid = idSchema.parse(objectId);
  const text = z.string().max(40).parse(input);
  const lock = codeLock(c, oid);
  if (state.outcome) return { ok: false, error: "closed", state: view(c, state) } as Closed;
  const code = (await getPrivateCase(c.slug)).codes?.[oid];
  if (code === undefined) throw new Error("Cadeado sem código.");
  const r = applyCodeTry(state, oid, text, code);
  if (r.state !== state) await writeState(r.state);
  return {
    ok: true as const,
    opened: r.opened,
    showHint: r.showHint,
    hint: r.showHint ? lock.hint : undefined,
    canSkip: r.canSkip,
    state: view(c, r.state),
  };
}

export async function skipCode(slug: string, objectId: string) {
  const { c, state } = await load(slug);
  const oid = idSchema.parse(objectId);
  codeLock(c, oid);
  if (state.outcome) return { ok: false, error: "closed", state: view(c, state) } as Closed;
  const r = applySkipCode(state, oid);
  if (!r.opened) return { ok: false, error: "not_yet", state: view(c, state) } as Rejected<"not_yet">;
  if (r.state !== state) await writeState(r.state);
  return { ok: true as const, opened: true as const, state: view(c, r.state) };
}

export async function answerQuiz(slug: string, evidenceId: string, index: number) {
  const { c, state } = await load(slug);
  const eid = idSchema.parse(evidenceId);
  const i = indexSchema.parse(index);
  const quiz = c.evidence.find((e) => e.id === eid)?.quiz;
  if (!quiz || i >= quiz.options.length) throw new Error("Pergunta inválida.");
  if (state.outcome) return { ok: false, error: "closed", state: view(c, state) } as Closed;
  const answer = (await getPrivateCase(c.slug)).quizAnswers?.[eid];
  if (!answer) throw new Error("Pergunta sem resposta.");
  const r = applyQuiz(state, eid, i, answer);
  if (r.state !== state) await writeState(r.state);
  return { ok: true as const, correct: r.correct, explanation: r.explanation, state: view(c, r.state) };
}

export async function finishPieces(slug: string, how: "solved" | "skipped") {
  const { c, state } = await load(slug);
  const h = z.enum(["solved", "skipped"]).parse(how);
  if (!c.evidence.some((e) => e.puzzle === "pieces")) throw new Error("Este caso não tem peças para montar.");
  if (state.outcome) return { ok: false, error: "closed", state: view(c, state) } as Closed;
  const next = applyPieces(state, h);
  if (next !== state) await writeState(next);
  return { ok: true as const, state: view(c, next) };
}

const choiceSchema = z.strictObject({
  choiceId: idSchema,
  justification: z.string().max(600),
  order: orderSchema,
});

export type ChoiceResponse =
  | { ok: true; verdict: "correct" | "wrong"; feedback: string | null; state: PublicGameState }
  | { ok: false; error: "closed" | "no_choices"; state: PublicGameState };

const better = (a: GameState["justification"], b: GameState["justification"]) => {
  const rank = { accepted: 2, partial: 1 } as const;
  return (b ? rank[b] : 0) > (a ? rank[a] : 0) ? b : a;
};

export async function submitChoice(slug: string, input: unknown): Promise<ChoiceResponse> {
  const { c, state } = await load(slug);
  const { choiceId, justification, order } = choiceSchema.parse(input);
  if (!c.conclusion.choices.some((x) => x.id === choiceId)) throw new Error("Alternativa inexistente.");
  if (state.outcome) return { ok: false, error: "closed", state: view(c, state) };
  if (state.choicesUsed >= c.conclusion.maxChoices) return { ok: false, error: "no_choices", state: view(c, state) };

  const priv = await getPrivateCase(c.slug);
  const correct = choiceId === priv.choiceAnswer.correctId;
  const choicesUsed = state.choicesUsed + 1;
  let jus = state.justification;
  if (correct && normalize(justification).split(" ").filter(Boolean).length >= 3) {
    const v = evaluateAnswer(priv.solution, justification).verdict;
    if (v === "accepted" || v === "partial") jus = better(jus, v);
  }
  const outcome = correct ? "solved" : choicesUsed >= c.conclusion.maxChoices ? "failed" : null;
  let next: GameState = {
    ...state,
    choicesUsed,
    outcome,
    justification: jus,
    solvedOnChoice: correct ? (choicesUsed === 1 ? 1 : 2) : state.solvedOnChoice,
  };
  if (outcome) {
    const current = computeResult({ state: next, reference: priv.timelineReference, player: order });
    next = { ...next, current, official: next.official ?? (next.practice ? null : current) };
  }
  await writeState(next);
  return { ok: true, verdict: correct ? "correct" : "wrong", feedback: correct ? null : (priv.choiceAnswer.wrongFeedback[choiceId] ?? null), state: view(c, next) };
}

export async function getResult(slug: string): Promise<{ official: Result | null; current: Result | null; practice: boolean }> {
  const { state } = await load(slug);
  return { official: state.official, current: state.outcome ? (state.current ?? null) : null, practice: state.practice };
}

/** Zera o caso, mas guarda o resultado oficial; a nova partida é "treino". */
export async function restartCase(slug: string): Promise<PublicGameState> {
  const { c, state } = await load(slug);
  const next: GameState = { ...freshState(c.slug), official: state.official, practice: true };
  await writeState(next);
  return view(c, next);
}
