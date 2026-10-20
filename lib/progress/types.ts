import type { LinkType } from "@/lib/content/schema";

/** Estado do jogador para um caso. Guardado no navegador (ver DECISOES.md, D1). */
export type CaseStatus = "not_started" | "in_progress" | "solved" | "failed";

export type PlayerCard = {
  collectedAt: string;
  notes: string;
  important: boolean;
};

/** Interpretação do jogador. Nunca é apresentada como fato (PRD §5.6). */
export type Hypothesis = {
  id: string;
  text: string;
  createdAt: string;
};

/** Grau de certeza que o jogador atribui à posição de uma carta (PRD §5.7.2). */
export type Certainty = "certain" | "probable" | "uncertain";

/** Justificativa do jogador para uma carta na linha do tempo ou fora da história. */
export type Placement = {
  certainty: Certainty | null;
  reason: string;
};

/** Ligação entre duas cartas, com o tipo e a explicação escritos pelo jogador. */
export type CardLink = {
  id: string;
  from: string;
  to: string;
  type: LinkType;
  explanation: string;
};

/**
 * Linha do tempo do jogador. `slots` está em ordem cronológica; cada slot é um
 * grupo de cartas que aconteceram ao mesmo tempo (quase sempre uma só).
 * Cartas que não estão nem em `slots` nem em `outside` continuam no caderno.
 */
export type PlayerTimeline = {
  slots: string[][];
  outside: string[];
  /** Guardadas mesmo quando a carta volta ao caderno, para não perder o que o jogador escreveu. */
  placements: Record<string, Placement>;
  links: CardLink[];
};

/** Histórico local, só para mostrar ao jogador. Quem conta é o servidor (lib/game/signed-state.ts). */
export type AttemptRecord = {
  answer: string;
  supporting: string[];
  verdict: "accepted" | "partial" | "rejected";
  feedback: string | null;
  at: string;
};

export type CheckRecord = {
  /** null = os marcos principais estão coerentes. */
  hint: string | null;
  at: string;
};

export type CaseProgress = {
  version: 1;
  status: CaseStatus;
  /** Objetos de cena já examinados (ids). */
  examined: string[];
  /** Cartas coletadas, por id da evidência. */
  cards: Record<string, PlayerCard>;
  /** Anotações gerais do caderno, fora de qualquer carta. */
  notes: string;
  hypotheses: Hypothesis[];
  timeline: PlayerTimeline;
  checks: CheckRecord[];
  attempts: AttemptRecord[];
  /** Rascunho da conclusão, para não perder o texto ao sair da tela. */
  draft: { answer: string; supporting: string[] };
  lastSceneId: string | null;
  updatedAt: string | null;
};

export const emptyProgress = (): CaseProgress => ({
  version: 1,
  status: "not_started",
  examined: [],
  cards: {},
  notes: "",
  hypotheses: [],
  timeline: { slots: [], outside: [], placements: {}, links: [] },
  checks: [],
  attempts: [],
  draft: { answer: "", supporting: [] },
  lastSceneId: null,
  updatedAt: null,
});
