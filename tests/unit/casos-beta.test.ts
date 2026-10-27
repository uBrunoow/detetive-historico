import { describe, expect, it } from "vitest";
import { getPrivateCase } from "@/lib/content/private";
import { evaluateAnswer } from "@/lib/game/answer";
import { checkTimeline } from "@/lib/game/check";

/** Casos beta: a linha de referência confere, a resposta de referência é aceita e um erro comum orienta. */
const cases: { slug: string; answer: string; wrong: string }[] = [
  {
    slug: "caminha",
    answer: "Pero Vaz de Caminha escreveu ao rei contando a chegada da frota de Cabral em 1500",
    wrong: "Colombo achou uma terra vazia",
  },
  {
    slug: "inconfidencia",
    answer: "Eles planejavam uma revolta contra a derrama e Tiradentes foi enforcado",
    wrong: "Eles roubaram o ouro",
  },
  {
    slug: "vargas",
    answer: "Getúlio Vargas criou a CLT e o voto feminino, mas também fez uma ditadura",
    wrong: "Foi o imperador",
  },
  {
    slug: "revolucao-industrial",
    answer: "As fábricas com máquinas a vapor exploravam o trabalho das crianças",
    wrong: "Foi a internet",
  },
];

describe.each(cases)("caso $slug", ({ slug, answer, wrong }) => {
  it("linha de referência confere ok", async () => {
    const priv = await getPrivateCase(slug);
    const story = priv.timelineReference.filter((r) => r.belongsToStory);
    const orders = [...new Set(story.map((r) => r.referenceOrder!))].sort((a, b) => a - b);
    const slots = orders.map((o) => story.filter((r) => r.referenceOrder === o).map((r) => r.evidenceId));
    const outside = priv.timelineReference.filter((r) => !r.belongsToStory).map((r) => r.evidenceId);
    expect(checkTimeline(priv, { slots, outside }, 1)).toEqual({ kind: "ok" });
  });

  it("aceita a resposta de referência e uma resposta curta de aluno", async () => {
    const sol = (await getPrivateCase(slug)).solution;
    expect(evaluateAnswer(sol, sol.referenceAnswer).verdict).toBe("accepted");
    expect(evaluateAnswer(sol, answer).verdict).toBe("accepted");
  });

  it("erro comum recebe orientação, não aceite", async () => {
    const sol = (await getPrivateCase(slug)).solution;
    const r = evaluateAnswer(sol, wrong);
    expect(r.verdict).not.toBe("accepted");
    expect(sol.commonErrors.map((e) => e.feedback)).toContain(r.feedback);
  });
});
