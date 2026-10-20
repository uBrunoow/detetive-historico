import type { PrivateCase } from "@/lib/content/schema";

/**
 * Avaliação da conclusão escrita (PRD §5.9). Só regras editoriais: variantes aceitas,
 * grupos de conceitos, respostas parciais e erros comuns. Roda só no servidor, mas é
 * pura para poder ser testada.
 */

export type Verdict = "accepted" | "partial" | "rejected";

/** Minúsculas, sem acentos nem pontuação, espaços simples. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const NEGATIONS = new Set(["nao", "nem", "sem", "nunca", "jamais"]);

/**
 * Posições (índice da palavra) onde o termo aparece. Termo de uma palavra com 5 letras
 * ou mais também casa com o começo de uma palavra ("agrimensor" → "agrimensora");
 * expressões de várias palavras precisam aparecer inteiras.
 */
function occurrences(words: string[], term: string): number[] {
  const parts = normalize(term).split(" ").filter(Boolean);
  if (parts.length === 0) return [];
  const found: number[] = [];
  for (let i = 0; i + parts.length <= words.length; i++) {
    const hit =
      parts.length === 1
        ? words[i] === parts[0] || (parts[0].length >= 5 && words[i].startsWith(parts[0]))
        : parts.every((p, k) => words[i + k] === p);
    if (hit) found.push(i);
  }
  return found;
}

/** Ocorrência afirmativa: sem "não", "nem", "sem"… nas três palavras anteriores. */
function affirmed(words: string[], term: string): boolean {
  return occurrences(words, term).some((i) => !words.slice(Math.max(0, i - 3), i).some((w) => NEGATIONS.has(w)));
}

export function evaluateAnswer(
  solution: PrivateCase["solution"],
  text: string,
): { verdict: Verdict; feedback: string | null; matchedGroups: string[] } {
  const norm = normalize(text);
  const words = norm.split(" ").filter(Boolean);

  if (solution.acceptedVariants.some((v) => normalize(v) === norm)) {
    return { verdict: "accepted", feedback: null, matchedGroups: solution.conceptGroups.map((g) => g.id) };
  }

  const matchedGroups = solution.conceptGroups
    .filter((g) => g.synonyms.some((s) => occurrences(words, s).length > 0))
    .map((g) => g.id);

  if (matchedGroups.length >= solution.minGroupsToAccept) {
    return { verdict: "accepted", feedback: null, matchedGroups };
  }

  const notAccepted: Verdict = matchedGroups.length > 0 ? "partial" : "rejected";

  const error = solution.commonErrors.find((e) => e.triggers.some((t) => affirmed(words, t)));
  if (error) return { verdict: notAccepted, feedback: error.feedback, matchedGroups };

  const partial = solution.partialAnswers.find((p) => p.requiredGroups.every((g) => matchedGroups.includes(g)));
  if (partial) return { verdict: "partial", feedback: partial.feedback, matchedGroups };

  if (matchedGroups.length > 0) return { verdict: "partial", feedback: solution.defaultPartialFeedback, matchedGroups };
  return { verdict: "rejected", feedback: solution.defaultRejectedFeedback, matchedGroups };
}
