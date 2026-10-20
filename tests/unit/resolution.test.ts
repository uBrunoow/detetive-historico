import { describe, expect, it } from "vitest";
import { getPrivateCase } from "@/lib/content/private";
import { evaluateAnswer, normalize } from "@/lib/game/answer";
import { checkTimeline } from "@/lib/game/check";
import { compareTimelines } from "@/lib/game/closure";

const priv = await getPrivateCase("demo-biblioteca");
const sol = priv.solution;

describe("avaliação da conclusão", () => {
  it("normaliza acentos, maiúsculas e pontuação", () => {
    expect(normalize("  A Agrimensora, levou o LIVRO! ")).toBe("a agrimensora levou o livro");
    expect(normalize("Medição")).toBe("medicao");
  });

  it("aceita variantes e respostas com palavras diferentes da referência", () => {
    expect(evaluateAnswer(sol, "A agrimensora levou o livro emprestado para fazer a medição.").verdict).toBe("accepted");
    expect(evaluateAnswer(sol, "Dona Helena estava com ele para medir a divisa da fazenda").verdict).toBe("accepted");
    expect(evaluateAnswer(sol, "O Otávio emprestou pra agrimensora").verdict).toBe("accepted");
  });

  it("resposta parcial recebe o feedback previsto para ela", () => {
    const r = evaluateAnswer(sol, "Quem pegou foi a Helena Prado");
    expect(r.verdict).toBe("partial");
    expect(r.feedback).toBe(sol.partialAnswers[0].feedback);
  });

  it("erro comum recebe orientação; negação não dispara o erro", () => {
    const roubo = evaluateAnswer(sol, "Alguém roubou o livro à noite");
    expect(roubo.verdict).toBe("rejected");
    expect(roubo.feedback).toBe(sol.commonErrors[0].feedback);

    const negado = evaluateAnswer(sol, "O livro não foi roubado");
    expect(negado.feedback).not.toBe(sol.commonErrors[0].feedback);
    expect(negado.verdict).toBe("partial");
  });

  it("sem nenhum conceito, usa o feedback padrão de recusa", () => {
    const r = evaluateAnswer(sol, "Não sei o que aconteceu");
    expect(r).toMatchObject({ verdict: "rejected", feedback: sol.defaultRejectedFeedback });
  });
});

describe("conferência da linha do tempo", () => {
  const right = { slots: [["oficio-prefeitura"], ["registro-visitas"], ["bilhete"], ["ata-camara"]], outside: ["jornal-1898"] };
  const hintFor = (type: string, level: number, pair?: [string, string]) =>
    priv.timelineHints.find(
      (h) =>
        h.condition.type === type &&
        h.level === level &&
        (!pair || (h.condition.type === "milestones_inverted" && h.condition.pair.join() === pair.join())),
    )!.text;

  it("marcos na ordem e nada estranho entre eles: confirma sem dizer mais nada", () => {
    expect(checkTimeline(priv, right, 1)).toEqual({ kind: "ok" });
  });

  it("marco faltando tem prioridade", () => {
    const r = checkTimeline(priv, { slots: [["bilhete"], ["registro-visitas"]], outside: [] }, 1);
    expect(r).toEqual({ kind: "hint", text: hintFor("milestone_missing", 1) });
  });

  it("carta fora da história entre os marcos", () => {
    const slots = [["registro-visitas"], ["jornal-1898"], ["bilhete"], ["ata-camara"]];
    expect(checkTimeline(priv, { slots, outside: [] }, 1)).toEqual({
      kind: "hint",
      text: hintFor("irrelevant_between_milestones", 1),
    });
  });

  it("par invertido: dica do nível da conferência, ou a mais alta disponível", () => {
    const slots = [["bilhete"], ["registro-visitas"], ["ata-camara"]];
    const pair: [string, string] = ["registro-visitas", "bilhete"];
    expect(checkTimeline(priv, { slots, outside: [] }, 1)).toEqual({ kind: "hint", text: hintFor("milestones_inverted", 1, pair) });
    expect(checkTimeline(priv, { slots, outside: [] }, 3)).toEqual({ kind: "hint", text: hintFor("milestones_inverted", 2, pair) });
  });

  it("marcos simultâneos contam como fora de ordem", () => {
    const r = checkTimeline(priv, { slots: [["registro-visitas", "bilhete"], ["ata-camara"]], outside: [] }, 1);
    expect(r.kind).toBe("hint");
  });
});

describe("comparação no encerramento", () => {
  it("separa o que ficou coerente, o que diverge e o que foi descartado", () => {
    const r = compareTimelines(priv.timelineReference, {
      slots: [["oficio-prefeitura"], ["bilhete"], ["registro-visitas"], ["ata-camara"]],
      outside: ["jornal-1898", "croqui"],
    });
    expect(r["oficio-prefeitura"]).toBe("ordered");
    expect(r["ata-camara"]).toBe("ordered");
    expect(r.bilhete).toBe("diverges");
    expect(r["registro-visitas"]).toBe("diverges");
    expect(r.croqui).toBe("wronglyOutside");
    expect(r["jornal-1898"]).toBe("correctlyOutside");
    expect(r["recibo-encadernacao"]).toBe("missing");
  });
});
