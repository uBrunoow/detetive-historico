import type { PrivateCase } from "@/lib/content/schema";

/**
 * Conferência da linha do tempo (PRD §5.7.3): olha só os marcos-chave e devolve uma
 * pista orientadora, nunca a posição de uma carta. Regras de escolha em DECISOES.md, D6.
 */

export type PlayerOrder = { slots: string[][]; outside: string[] };
export type CheckResult = { kind: "ok" } | { kind: "hint"; text: string };

export function checkTimeline(priv: PrivateCase, player: PlayerOrder, checkNumber: number): CheckResult {
  const pos = new Map<string, number>();
  player.slots.forEach((slot, i) => slot.forEach((id) => pos.set(id, i)));

  const milestones = priv.timelineReference
    .filter((r) => r.isKeyMilestone)
    .sort((a, b) => (a.referenceOrder ?? 0) - (b.referenceOrder ?? 0));

  const missing = milestones.some((m) => !pos.has(m.evidenceId));

  const placedMilestones = milestones.flatMap((m) => (pos.has(m.evidenceId) ? [pos.get(m.evidenceId)!] : []));
  const lo = Math.min(...placedMilestones);
  const hi = Math.max(...placedMilestones);
  const irrelevantBetween =
    placedMilestones.length >= 2 &&
    priv.timelineReference.some((r) => !r.belongsToStory && pos.has(r.evidenceId) && pos.get(r.evidenceId)! >= lo && pos.get(r.evidenceId)! <= hi);

  const inverted = (a: string, b: string) => pos.has(a) && pos.has(b) && pos.get(a)! >= pos.get(b)!;
  const anyInverted = milestones.some((a, i) =>
    milestones.slice(i + 1).some((b) => a.referenceOrder !== b.referenceOrder && inverted(a.evidenceId, b.evidenceId)),
  );

  if (!missing && !irrelevantBetween && !anyInverted) return { kind: "ok" };

  const hints = priv.timelineHints;
  const candidates = [
    missing && hints.filter((h) => h.condition.type === "milestone_missing"),
    irrelevantBetween && hints.filter((h) => h.condition.type === "irrelevant_between_milestones"),
    ...hints
      .flatMap((h) => (h.condition.type === "milestones_inverted" ? [h.condition.pair] : []))
      .filter((pair, i, all) => all.findIndex((p) => p[0] === pair[0] && p[1] === pair[1]) === i)
      .filter(([a, b]) => inverted(a, b))
      .map(([a, b]) =>
        hints.filter((h) => h.condition.type === "milestones_inverted" && h.condition.pair[0] === a && h.condition.pair[1] === b),
      ),
    hints.filter((h) => h.condition.type === "default"),
  ].filter((c): c is typeof hints => Array.isArray(c) && c.length > 0);

  const pool = candidates[0];
  if (!pool) return { kind: "hint", text: "" };
  const upTo = pool.filter((h) => h.level <= checkNumber).sort((a, b) => b.level - a.level);
  const chosen = upTo[0] ?? [...pool].sort((a, b) => a.level - b.level)[0];
  return { kind: "hint", text: chosen.text };
}
