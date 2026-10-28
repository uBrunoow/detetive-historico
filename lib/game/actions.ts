"use server";

import { z } from "zod";
import { getPrivateCase } from "@/lib/content/private";
import { getPublicCase } from "@/lib/content/public";
import type { LinkType } from "@/lib/content/schema";
import { checkTimeline as runCheck, type CheckResult } from "./check";
import { applyCodeTry, applyPieces, applyQuiz, applySkipCode } from "./puzzles";
import { computeResult, orderRatio, SOLVED_POINTS } from "./score";
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
  maxChecks: number;
  outcome: GameState["outcome"];
  practice: boolean;
  official: { stars: number; points: number } | null;
  openedCodes: string[];
  answeredQuiz: string[];
  pieces: "solved" | "skipped" | null;
};

async function load(slug: unknown) {
  const s = slugSchema.parse(slug);
  const c = await getPublicCase(s);
  if (!c) throw new Error("Caso inexistente.");
  return { c, state: await readState(s) };
}

function view(c: { maxTimelineChecks: number }, state: GameState): PublicGameState {
  return {
    checksLeft: Math.max(0, c.maxTimelineChecks - state.checksUsed),
    maxChecks: c.maxTimelineChecks,
    outcome: state.outcome,
    practice: state.practice,
    official: state.official ? { stars: state.official.stars, points: state.official.points } : null,
    openedCodes: Object.entries(state.puzzles.codes).filter(([, v]) => v.opened).map(([k]) => k),
    answeredQuiz: Object.keys(state.puzzles.quiz),
    pieces: state.puzzles.pieces,
  };
}

export async function getGameState(slug: string): Promise<PublicGameState> {
  const { c, state } = await load(slug);
  return view(c, state);
}

/** Quantas cartas estão no lugar certo (as de fora contam se foram postas fora), nunca quais. */
export type CheckTally = { inPlace: number; total: number };

export type CheckResponse =
  | { ok: true; result: CheckResult; tally: CheckTally; state: PublicGameState }
  | { ok: false; error: "no_checks" | "closed" | "empty"; state: PublicGameState };

export async function checkTimeline(slug: string, order: unknown): Promise<CheckResponse> {
  const { c, state } = await load(slug);
  const player = orderSchema.parse(order);
  if (state.outcome) return { ok: false, error: "closed", state: view(c, state) };
  if (state.checksUsed >= c.maxTimelineChecks) return { ok: false, error: "no_checks", state: view(c, state) };
  if (player.slots.length === 0) return { ok: false, error: "empty", state: view(c, state) };

  const next = { ...state, checksUsed: state.checksUsed + 1 };
  const priv = await getPrivateCase(c.slug);
  const result = runCheck(priv, player, next.checksUsed);
  const tally = { inPlace: Math.round(orderRatio(priv.timelineReference, player) * priv.timelineReference.length), total: priv.timelineReference.length };
  await writeState(next);
  return { ok: true, result, tally, state: view(c, next) };
}

export type ClosureData = {
  outcome: "solved" | "failed";
  epoch: { options: { title: string; years: string }[]; correct: number; chosen: number | null };
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
    epoch: { options: c.epochOptions, correct: priv.epochAnswer, chosen: state.epochChoice },
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

export async function tryCode(slug: string, objectId: string, input: string) {
  const { c, state } = await load(slug);
  const oid = idSchema.parse(objectId);
  const text = z.string().max(40).parse(input);
  const lock = codeLock(c, oid);
  if (state.outcome) return { ok: false, error: "closed", state: view(c, state) } as Closed;
  // Entrada vazia não conta como tentativa.
  if (text.trim() === "") return { ok: false, error: "empty", state: view(c, state) } as Rejected<"empty">;
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

const verdictSchema = z.strictObject({
  epochIndex: z.number().int().min(0).max(4),
  order: orderSchema,
});

export type VerdictResponse =
  | { ok: true; result: Result; state: PublicGameState }
  | { ok: false; error: "closed" | "locked"; state: PublicGameState };

/**
 * O veredito (D21): a época escolhida e a linha do tempo do jogador, de uma vez só.
 * Encerra o caso e calcula os pontos no servidor; a resposta certa só sai em `getClosure`.
 */
export async function submitVerdict(slug: string, input: unknown): Promise<VerdictResponse> {
  const { c, state } = await load(slug);
  const { epochIndex, order } = verdictSchema.parse(input);
  if (state.outcome) return { ok: false, error: "closed", state: view(c, state) };
  // Mesmo mínimo de cartas da tela; o servidor confere de novo e não encerra o caso.
  const placed = new Set(order.slots.flat().filter((id) => c.evidence.some((e) => e.id === id))).size;
  if (placed < c.minCardsToResolve) return { ok: false, error: "locked", state: view(c, state) };

  const priv = await getPrivateCase(c.slug);
  const result = computeResult({ epochCorrect: epochIndex === priv.epochAnswer, reference: priv.timelineReference, player: order });
  const next: GameState = {
    ...state,
    epochChoice: epochIndex,
    outcome: result.points >= SOLVED_POINTS ? "solved" : "failed",
    current: result,
    official: state.official ?? (state.practice ? null : result),
  };
  await writeState(next);
  return { ok: true, result, state: view(c, next) };
}

export async function getResult(slug: string): Promise<{ official: Result | null; current: Result | null; practice: boolean }> {
  const { state } = await load(slug);
  return { official: state.official, current: state.outcome ? (state.current ?? null) : null, practice: state.practice };
}

/** Só depois do encerramento: zera o caso, guarda o resultado oficial e a nova partida é "treino". */
export async function restartCase(slug: string): Promise<{ ok: true; state: PublicGameState } | Rejected<"not_closed">> {
  const { c, state } = await load(slug);
  if (!state.outcome) return { ok: false, error: "not_closed", state: view(c, state) };
  const next: GameState = { ...freshState(c.slug), official: state.official, practice: state.official !== null };
  await writeState(next);
  return { ok: true, state: view(c, next) };
}
