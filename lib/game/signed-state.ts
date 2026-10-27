import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { ScoreBreakdown } from "./score";

/**
 * Contadores de conferências e tentativas e o resultado do caso, guardados num cookie
 * httpOnly assinado (HMAC-SHA256 com GAME_SECRET). Editar o navegador não reabre
 * tentativas nem libera o encerramento; apagar os dados do site recomeça do zero
 * (ver DECISOES.md, D1).
 */
export type PuzzleState = {
  epoch: { tries: number; firstTryCorrect: boolean | null }; // null = ainda não respondeu
  codes: Record<string, { tries: number; opened: boolean; skipped: boolean }>;
  pieces: "solved" | "skipped" | null;
  quiz: Record<string, boolean>; // primeiro resultado por evidência
};
export type Result = { stars: 0 | 1 | 2 | 3; points: number; breakdown: ScoreBreakdown };
export type GameState = {
  v: 2;
  slug: string;
  checksUsed: number;
  choicesUsed: number;
  outcome: "solved" | "failed" | null;
  solvedOnChoice: 1 | 2 | null;
  justification: "accepted" | "partial" | null; // a melhor
  puzzles: PuzzleState;
  official: Result | null; // 1ª conclusão; nunca apagado por restart
  practice: boolean; // true depois de "Jogar de novo"
  current?: Result | null; // resultado desta partida, gravado no encerramento
};

type GameStateV1 = { v: 1; slug: string; checksUsed: number; attemptsUsed: number; outcome: "solved" | "failed" | null };

const DEV_SECRET = "detetive-historico-segredo-de-desenvolvimento";
const ONE_YEAR = 60 * 60 * 24 * 365;

function secret(): string {
  const s = process.env.GAME_SECRET;
  if (s && s !== "troque-por-um-valor-aleatorio") return s;
  if (process.env.NODE_ENV === "production") throw new Error("Defina GAME_SECRET (veja .env.example).");
  return DEV_SECRET;
}

const mac = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");
const cookieName = (slug: string) => `dh_${slug}`;
const emptyPuzzles = (): PuzzleState => ({ epoch: { tries: 0, firstTryCorrect: null }, codes: {}, pieces: null, quiz: {} });

export const freshState = (slug: string): GameState => ({
  v: 2,
  slug,
  checksUsed: 0,
  choicesUsed: 0,
  outcome: null,
  solvedOnChoice: null,
  justification: null,
  puzzles: emptyPuzzles(),
  official: null,
  practice: false,
});

function fromV1(old: GameStateV1): GameState {
  const solved = old.outcome === "solved";
  return {
    ...freshState(old.slug),
    checksUsed: old.checksUsed,
    outcome: old.outcome,
    official: solved
      ? { stars: 1, points: 500, breakdown: { answer: 500, order: 0, justification: 0, epoch: 0, codes: 0, pieces: 0, quiz: 0, checks: 0 } }
      : null,
  };
}

export function encode(state: GameState): string {
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `${payload}.${mac(payload)}`;
}

/** Devolve o estado se a assinatura confere e é deste caso; senão, null. */
export function decode(token: string, slug: string): GameState | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(mac(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const state = JSON.parse(Buffer.from(payload, "base64url").toString()) as GameState | GameStateV1;
    if (state.slug !== slug) return null;
    if (state.v === 1) return fromV1(state);
    return state.v === 2 ? state : null;
  } catch {
    return null;
  }
}

export async function readState(slug: string): Promise<GameState> {
  const token = (await cookies()).get(cookieName(slug))?.value;
  return (token && decode(token, slug)) || freshState(slug);
}

export async function writeState(state: GameState): Promise<void> {
  (await cookies()).set(cookieName(state.slug), encode(state), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
}
