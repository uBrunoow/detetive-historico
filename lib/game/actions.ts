"use server";

import { z } from "zod";
import { getPrivateCase } from "@/lib/content/private";
import { getPublicCase } from "@/lib/content/public";
import type { LinkType } from "@/lib/content/schema";
import { evaluateAnswer, normalize, type Verdict } from "./answer";
import { checkTimeline as runCheck, type CheckResult } from "./check";
import { readState, writeState, type GameState } from "./signed-state";

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
    attemptsLeft: Math.max(0, c.conclusion.maxChoices - state.attemptsUsed),
    maxChecks: c.maxTimelineChecks,
    maxAttempts: c.conclusion.maxChoices,
    outcome: state.outcome,
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
  if (state.attemptsUsed >= c.conclusion.maxChoices) return { ok: false, error: "no_attempts", state: view(c, state) };
  // Resposta vazia ou curta demais não consome tentativa.
  if (normalize(answer).split(" ").filter(Boolean).length < 3) return { ok: false, error: "empty", state: view(c, state) };
  // A tela só libera com o mínimo de cartas posicionadas (PRD §5.7.4); o servidor confere de novo.
  const placed = new Set(order.slots.flat().filter((id) => c.evidence.some((e) => e.id === id))).size;
  if (placed < c.minCardsToResolve) return { ok: false, error: "locked", state: view(c, state) };

  const { verdict, feedback } = evaluateAnswer((await getPrivateCase(c.slug)).solution, answer);
  const attemptsUsed = state.attemptsUsed + 1;
  const outcome = verdict === "accepted" ? "solved" : attemptsUsed >= c.conclusion.maxChoices ? "failed" : null;
  const next: GameState = { ...state, attemptsUsed, outcome };
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
