import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Result } from "./score";

/**
 * Contadores do caso e o resultado, guardados num cookie httpOnly assinado
 * (HMAC-SHA256 com GAME_SECRET). Editar o navegador não reabre o veredito nem libera o
 * encerramento; apagar os dados do site recomeça do zero (ver DECISOES.md, D1).
 */
export type PuzzleState = {
  codes: Record<string, { tries: number; opened: boolean; skipped: boolean }>;
  pieces: "solved" | "skipped" | null;
  quiz: Record<string, boolean>; // primeiro resultado por evidência
};
export type { Result };
export type GameState = {
  v: 3;
  slug: string;
  checksUsed: number;
  /** Época escolhida no veredito (índice em `epochOptions`); null antes do veredito. */
  epochChoice: number | null;
  outcome: "solved" | "failed" | null;
  puzzles: PuzzleState;
  official: Result | null; // 1º veredito; nunca apagado por restart
  practice: boolean; // true depois de "Jogar de novo"
  current?: Result | null; // resultado desta partida, gravado no veredito
};

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
const emptyPuzzles = (): PuzzleState => ({ codes: {}, pieces: null, quiz: {} });

export const freshState = (slug: string): GameState => ({
  v: 3,
  slug,
  checksUsed: 0,
  epochChoice: null,
  outcome: null,
  puzzles: emptyPuzzles(),
  official: null,
  practice: false,
});

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
    const state = JSON.parse(Buffer.from(payload, "base64url").toString()) as GameState;
    // Estados das versões 1 e 2 usavam a pontuação antiga (D20): o caso recomeça.
    return state.slug === slug && state.v === 3 ? state : null;
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
