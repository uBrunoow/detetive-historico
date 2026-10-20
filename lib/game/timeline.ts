import type { LinkType, PublicCase } from "@/lib/content/schema";
import type { CardLink, CaseProgress, Certainty, Placement, PlayerTimeline } from "@/lib/progress/types";

/**
 * Regras puras da linha do tempo do jogador (sem React). Tudo funciona por botões,
 * sem arrastar (PRD §5.7.2): pôr, mover antes/depois, juntar como simultâneas,
 * separar, mandar para "fora da história" e devolver ao caderno.
 */

export type CardLocation =
  | { where: "timeline"; slot: number; index: number }
  | { where: "outside" }
  | { where: "notebook" };

export function locate(tl: PlayerTimeline, id: string): CardLocation {
  for (let slot = 0; slot < tl.slots.length; slot++) {
    const index = tl.slots[slot].indexOf(id);
    if (index >= 0) return { where: "timeline", slot, index };
  }
  return tl.outside.includes(id) ? { where: "outside" } : { where: "notebook" };
}

function without(tl: PlayerTimeline, id: string): PlayerTimeline {
  return {
    ...tl,
    slots: tl.slots.map((s) => s.filter((x) => x !== id)).filter((s) => s.length > 0),
    outside: tl.outside.filter((x) => x !== id),
  };
}

function withTimeline(p: CaseProgress, timeline: PlayerTimeline): CaseProgress {
  return { ...p, timeline };
}

function insertSlot(slots: string[][], at: number, slot: string[]): string[][] {
  const i = Math.max(0, Math.min(at, slots.length));
  return [...slots.slice(0, i), slot, ...slots.slice(i)];
}

/** Põe a carta num slot novo na posição `at` (fim, se omitida). Só cartas coletadas. */
export function placeCard(p: CaseProgress, id: string, at = Number.POSITIVE_INFINITY): CaseProgress {
  if (!p.cards[id]) return p;
  const tl = without(p.timeline, id);
  return withTimeline(p, { ...tl, slots: insertSlot(tl.slots, at, [id]) });
}

/**
 * Move a carta uma posição para antes (-1) ou depois (1). Se ela está num grupo
 * de simultâneas, sai do grupo e fica logo antes ou logo depois dele.
 */
export function moveCard(p: CaseProgress, id: string, dir: -1 | 1): CaseProgress {
  const tl = p.timeline;
  const loc = locate(tl, id);
  if (loc.where !== "timeline") return p;
  const slots = tl.slots.map((s) => [...s]);
  if (slots[loc.slot].length > 1) {
    slots[loc.slot] = slots[loc.slot].filter((x) => x !== id);
    return withTimeline(p, { ...tl, slots: insertSlot(slots, dir < 0 ? loc.slot : loc.slot + 1, [id]) });
  }
  const target = loc.slot + dir;
  if (target < 0 || target >= slots.length) return p;
  [slots[loc.slot], slots[target]] = [slots[target], slots[loc.slot]];
  return withTimeline(p, { ...tl, slots });
}

/** Junta a carta ao momento anterior: as duas passam a acontecer ao mesmo tempo. */
export function joinPrevious(p: CaseProgress, id: string): CaseProgress {
  const loc = locate(p.timeline, id);
  if (loc.where !== "timeline" || loc.slot === 0) return p;
  const slots = p.timeline.slots.map((s) => [...s]);
  slots[loc.slot - 1].push(id);
  slots[loc.slot] = slots[loc.slot].filter((x) => x !== id);
  return withTimeline(p, { ...p.timeline, slots: slots.filter((s) => s.length > 0) });
}

/** Tira a carta de um grupo de simultâneas e a põe logo depois dele. */
export function separate(p: CaseProgress, id: string): CaseProgress {
  const loc = locate(p.timeline, id);
  if (loc.where !== "timeline" || p.timeline.slots[loc.slot].length < 2) return p;
  const slots = p.timeline.slots.map((s) => (s.includes(id) ? s.filter((x) => x !== id) : s));
  return withTimeline(p, { ...p.timeline, slots: insertSlot(slots, loc.slot + 1, [id]) });
}

export function moveToOutside(p: CaseProgress, id: string): CaseProgress {
  if (!p.cards[id]) return p;
  const tl = without(p.timeline, id);
  return withTimeline(p, { ...tl, outside: [...tl.outside, id] });
}

export function returnToNotebook(p: CaseProgress, id: string): CaseProgress {
  return withTimeline(p, without(p.timeline, id));
}

const emptyPlacement = (): Placement => ({ certainty: null, reason: "" });

function patchPlacement(p: CaseProgress, id: string, patch: Partial<Placement>): CaseProgress {
  const current = p.timeline.placements[id] ?? emptyPlacement();
  return withTimeline(p, { ...p.timeline, placements: { ...p.timeline.placements, [id]: { ...current, ...patch } } });
}

export function setCertainty(p: CaseProgress, id: string, certainty: Certainty): CaseProgress {
  return patchPlacement(p, id, { certainty });
}

export function setPlacementReason(p: CaseProgress, id: string, reason: string): CaseProgress {
  return patchPlacement(p, id, { reason });
}

export function placementOf(p: CaseProgress, id: string): Placement {
  return p.timeline.placements[id] ?? emptyPlacement();
}

/** Cria uma ligação entre duas cartas coletadas e diferentes; não repete a mesma ligação. */
export function addLink(
  p: CaseProgress,
  link: { from: string; to: string; type: LinkType; explanation: string },
  id = crypto.randomUUID(),
): CaseProgress {
  if (link.from === link.to || !p.cards[link.from] || !p.cards[link.to]) return p;
  const exists = p.timeline.links.some((l) => l.from === link.from && l.to === link.to && l.type === link.type);
  if (exists) return p;
  const created: CardLink = { id, ...link, explanation: link.explanation.trim() };
  return withTimeline(p, { ...p.timeline, links: [...p.timeline.links, created] });
}

export function updateLinkExplanation(p: CaseProgress, id: string, explanation: string): CaseProgress {
  const links = p.timeline.links.map((l) => (l.id === id ? { ...l, explanation } : l));
  return withTimeline(p, { ...p.timeline, links });
}

export function removeLink(p: CaseProgress, id: string): CaseProgress {
  return withTimeline(p, { ...p.timeline, links: p.timeline.links.filter((l) => l.id !== id) });
}

/** Ligações visíveis: as duas pontas estão na linha do tempo ou fora da história. */
export function activeLinks(tl: PlayerTimeline): CardLink[] {
  return tl.links.filter((l) => locate(tl, l.from).where !== "notebook" && locate(tl, l.to).where !== "notebook");
}

export function placedCount(tl: PlayerTimeline): number {
  return tl.slots.reduce((n, s) => n + s.length, 0);
}

/** A resolução é liberada pela quantidade de cartas posicionadas, não pela ordem (PRD §5.7.4). */
export function canResolve(c: PublicCase, p: CaseProgress): boolean {
  return placedCount(p.timeline) >= c.minCardsToResolve;
}

/** Medalha Cronista: linha montada até o mínimo do caso e toda carta posicionada justificada. */
export function everyPlacementJustified(c: PublicCase, p: CaseProgress): boolean {
  const placed = p.timeline.slots.flat();
  return placed.length >= c.minCardsToResolve && placed.every((id) => placementOf(p, id).reason.trim().length > 0);
}
