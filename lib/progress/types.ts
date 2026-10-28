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

export type CheckRecord = {
  /** null = os marcos principais estão coerentes. */
  hint: string | null;
  /** Quantas cartas estavam no lugar nessa conferência (sem dizer quais). */
  tally?: { inPlace: number; total: number };
  at: string;
};

export type CaseProgress = {
  version: 3;
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
  /** Rascunho do veredito: a época marcada (índice em `epochOptions`) antes de fechar o caso. */
  draft: { epochIndex: number | null };
  /** Cadeados de código já abertos (ids dos objetos). */
  unlocked: string[];
  /** Resultado do 1º veredito, copiado para Fases e HUD. Quem conta é o servidor. */
  official: { stars: number; points: number } | null;
  /** Verdadeiro quando o caso foi jogado de novo depois do resultado oficial. */
  practice: boolean;
  lastSceneId: string | null;
  updatedAt: string | null;
};

export const emptyProgress = (): CaseProgress => ({
  version: 3,
  status: "not_started",
  examined: [],
  cards: {},
  notes: "",
  hypotheses: [],
  timeline: { slots: [], outside: [], placements: {}, links: [] },
  checks: [],
  draft: { epochIndex: null },
  unlocked: [],
  official: null,
  practice: false,
  lastSceneId: null,
  updatedAt: null,
});
