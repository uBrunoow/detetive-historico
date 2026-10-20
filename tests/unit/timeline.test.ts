import { describe, expect, it } from "vitest";
import { getPublicCase } from "@/lib/content/public";
import { collectEvidence } from "@/lib/game/scene";
import {
  activeLinks,
  addLink,
  canResolve,
  everyPlacementJustified,
  joinPrevious,
  locate,
  moveCard,
  moveToOutside,
  placeCard,
  placedCount,
  removeLink,
  returnToNotebook,
  separate,
  setCertainty,
  setPlacementReason,
} from "@/lib/game/timeline";
import { emptyProgress, type CaseProgress } from "@/lib/progress/types";

function withCards(...ids: string[]): CaseProgress {
  return ids.reduce((p, id) => collectEvidence(p, id), emptyProgress());
}

const slots = (p: CaseProgress) => p.timeline.slots;

describe("linha do tempo do jogador", () => {
  it("só põe cartas coletadas, no fim ou na posição pedida, sem duplicar", () => {
    let p = withCards("a", "b", "c");
    expect(placeCard(p, "x")).toBe(p);
    p = placeCard(p, "a");
    p = placeCard(p, "b");
    p = placeCard(p, "c", 0);
    expect(slots(p)).toEqual([["c"], ["a"], ["b"]]);
    p = placeCard(p, "c");
    expect(slots(p)).toEqual([["a"], ["b"], ["c"]]);
  });

  it("move antes e depois e não passa das pontas", () => {
    let p = placeCard(placeCard(withCards("a", "b"), "a"), "b");
    p = moveCard(p, "b", -1);
    expect(slots(p)).toEqual([["b"], ["a"]]);
    expect(moveCard(p, "b", -1)).toBe(p);
    expect(moveCard(p, "a", 1)).toBe(p);
  });

  it("junta simultâneas, separa, e quem sai de um grupo fica ao lado dele", () => {
    let p = ["a", "b", "c"].reduce((q, id) => placeCard(q, id), withCards("a", "b", "c"));
    expect(joinPrevious(p, "a")).toBe(p);
    p = joinPrevious(p, "b");
    expect(slots(p)).toEqual([["a", "b"], ["c"]]);
    expect(locate(p.timeline, "b")).toEqual({ where: "timeline", slot: 0, index: 1 });

    expect(slots(moveCard(p, "b", -1))).toEqual([["b"], ["a"], ["c"]]);
    expect(slots(moveCard(p, "b", 1))).toEqual([["a"], ["b"], ["c"]]);
    expect(slots(separate(p, "a"))).toEqual([["b"], ["a"], ["c"]]);
    expect(separate(p, "c")).toBe(p);
  });

  it("fora da história e de volta ao caderno, sem perder a justificativa", () => {
    let p = placeCard(withCards("a"), "a");
    p = setPlacementReason(setCertainty(p, "a", "probable"), "a", "o bilhete fala de ontem");
    p = moveToOutside(p, "a");
    expect(slots(p)).toEqual([]);
    expect(p.timeline.outside).toEqual(["a"]);
    p = returnToNotebook(p, "a");
    expect(locate(p.timeline, "a")).toEqual({ where: "notebook" });
    expect(p.timeline.placements.a).toEqual({ certainty: "probable", reason: "o bilhete fala de ontem" });
  });

  it("ligações: entre cartas diferentes, sem repetir, visíveis só com as duas pontas em jogo", () => {
    let p = placeCard(placeCard(withCards("a", "b"), "a"), "b");
    expect(addLink(p, { from: "a", to: "a", type: "caused", explanation: "" })).toBe(p);
    p = addLink(p, { from: "a", to: "b", type: "caused", explanation: " porque sim " }, "l1");
    expect(addLink(p, { from: "a", to: "b", type: "caused", explanation: "de novo" }, "l2")).toBe(p);
    expect(p.timeline.links[0].explanation).toBe("porque sim");
    expect(activeLinks(p.timeline)).toHaveLength(1);
    p = returnToNotebook(p, "b");
    expect(activeLinks(p.timeline)).toHaveLength(0);
    expect(p.timeline.links).toHaveLength(1);
    expect(removeLink(p, "l1").timeline.links).toEqual([]);
  });

  it("libera a resolução pela quantidade de cartas, não pela ordem; Cronista pede justificativas", async () => {
    const c = (await getPublicCase("demo-biblioteca"))!;
    const ids = c.evidence.slice(0, c.minCardsToResolve).map((e) => e.id);
    let p = ids.reduce((q, id) => placeCard(q, id, 0), withCards(...ids));
    expect(placedCount(p.timeline)).toBe(c.minCardsToResolve);
    expect(canResolve(c, p)).toBe(true);
    expect(canResolve(c, returnToNotebook(p, ids[0]))).toBe(false);

    expect(everyPlacementJustified(c, p)).toBe(false);
    p = ids.reduce((q, id) => setPlacementReason(q, id, "por causa da data"), p);
    expect(everyPlacementJustified(c, p)).toBe(true);
  });
});
