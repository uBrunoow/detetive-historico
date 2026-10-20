import { describe, expect, it } from "vitest";
import {
  addHypothesis,
  collectedCards,
  removeHypothesis,
  setCardNotes,
  setNotebookNotes,
  toggleImportant,
  updateHypothesis,
} from "@/lib/game/notebook";
import { collectEvidence } from "@/lib/game/scene";
import { getPublicCase } from "@/lib/content/public";
import { emptyProgress } from "@/lib/progress/types";

describe("caderno de investigação", () => {
  it("anota e marca como importante só cartas já coletadas", () => {
    let p = collectEvidence(emptyProgress(), "bilhete");
    p = setCardNotes(p, "bilhete", "fala de uma visita");
    p = toggleImportant(p, "bilhete");
    expect(p.cards.bilhete).toMatchObject({ notes: "fala de uma visita", important: true });

    const same = setCardNotes(p, "recibo", "x");
    expect(same).toBe(p);
    expect(toggleImportant(p, "recibo")).toBe(p);
    expect(toggleImportant(p, "bilhete").cards.bilhete.important).toBe(false);
  });

  it("guarda anotações gerais separadas das cartas", () => {
    const p = setNotebookNotes(emptyProgress(), "voltar ao arquivo");
    expect(p.notes).toBe("voltar ao arquivo");
    expect(p.cards).toEqual({});
  });

  it("lista as cartas coletadas com as importantes primeiro", async () => {
    const c = (await getPublicCase("demo-biblioteca"))!;
    const [a, b, d] = c.evidence.map((e) => e.id);
    let p = collectEvidence(emptyProgress(), a, new Date("2026-01-01T10:00:00Z"));
    p = collectEvidence(p, b, new Date("2026-01-01T10:01:00Z"));
    p = collectEvidence(p, d, new Date("2026-01-01T10:02:00Z"));
    p = toggleImportant(p, d);
    expect(collectedCards(c, p).map((x) => x.evidence.id)).toEqual([d, a, b]);
  });

  it("cria, edita e apaga hipóteses; ignora hipótese vazia", () => {
    let p = addHypothesis(emptyProgress(), "   ");
    expect(p.hypotheses).toHaveLength(0);
    p = addHypothesis(p, "  O bibliotecário escondeu o livro ", new Date("2026-01-01"), "h1");
    expect(p.hypotheses).toEqual([{ id: "h1", text: "O bibliotecário escondeu o livro", createdAt: "2026-01-01T00:00:00.000Z" }]);
    p = updateHypothesis(p, "h1", "Outra ideia");
    expect(p.hypotheses[0].text).toBe("Outra ideia");
    p = removeHypothesis(p, "h1");
    expect(p.hypotheses).toEqual([]);
  });
});
