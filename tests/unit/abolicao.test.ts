import { describe, expect, it } from "vitest";
import { getPrivateCase } from "@/lib/content/private";
import { getPublicCase } from "@/lib/content/public";
import { evaluateAnswer } from "@/lib/game/answer";
import { checkTimeline } from "@/lib/game/check";

const pub = (await getPublicCase("abolicao"))!;
const priv = await getPrivateCase("abolicao");
const sol = priv.solution;
const ev = (id: string) => pub.evidence.find((e) => e.id === id)!;

describe("caso abolição: fontes", () => {
  it("transcrições conferidas no original", () => {
    expect(ev("lei-aurea").transcription).toContain("Art. 1.° E’ declarada extincta, desde a data desta Lei, a escravidão no Brazil.");
    expect(ev("sexagenarios").transcription).toContain("pelo espaço de tres annos");
    expect(ev("ventre-livre").transcription).toContain("serão considerados de condição livre");
    expect(ev("nabuco").transcription).toContain("o do resgate forçado pelo peculio, e o do sorteio annual");
  });

  it("Nabuco não tem data nem pista do ano no conteúdo público", () => {
    expect(ev("nabuco").date).toBeUndefined();
    expect(JSON.stringify(ev("nabuco"))).not.toContain("1883");
  });
});

describe("caso abolição: conclusão", () => {
  it("aceita gradual + pressão", () => {
    expect(evaluateAnswer(sol, "A escravidão acabou aos poucos e por pressão dos abolicionistas e das fugas").verdict).toBe("accepted");
  });

  it("aceita quando nega a bondade da princesa", () => {
    const r = evaluateAnswer(sol, "Não foi bondade da princesa, foi a pressão dos abolicionistas e aconteceu aos poucos");
    expect(r.verdict).toBe("accepted");
  });

  it("só a lei final é parcial", () => {
    expect(evaluateAnswer(sol, "A princesa Isabel assinou a Lei Áurea em 1888")).toMatchObject({
      verdict: "partial",
      feedback: sol.partialAnswers[0].feedback,
    });
  });

  it("bondade recebe orientação", () => {
    expect(evaluateAnswer(sol, "A princesa Isabel acabou com a escravidão por bondade").feedback).toBe(sol.commonErrors[0].feedback);
  });

  it("Ventre Livre não liberta todos", () => {
    const r = evaluateAnswer(sol, "A lei do Ventre Livre libertou todos os escravos");
    expect(r.verdict).not.toBe("accepted");
    expect(r.feedback).toBe(sol.commonErrors[1].feedback);
  });
});

describe("caso abolição: conferência da linha do tempo", () => {
  const outside = ["lei-1850"];

  it("linha certa confere ok; Nabuco depois de 1885 não gera dica", () => {
    const full = [["ventre-livre"], ["nabuco"], ["sexagenarios"], ["clube-militar"], ["lei-aurea"], ["missa-campal"]];
    expect(checkTimeline(priv, { slots: full, outside }, 1)).toEqual({ kind: "ok" });
    const nabucoLate = [["ventre-livre"], ["sexagenarios"], ["nabuco"], ["lei-aurea"]];
    expect(checkTimeline(priv, { slots: nabucoLate, outside }, 1)).toEqual({ kind: "ok" });
  });

  it("lei de 1850 entre os marcos gera dica", () => {
    const r = checkTimeline(priv, { slots: [["ventre-livre"], ["lei-1850"], ["sexagenarios"], ["lei-aurea"]], outside: [] }, 1);
    const hint = priv.timelineHints.find((h) => h.condition.type === "irrelevant_between_milestones")!;
    expect(r).toEqual({ kind: "hint", text: hint.text });
  });
});
