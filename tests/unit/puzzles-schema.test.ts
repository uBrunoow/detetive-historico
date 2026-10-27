import { describe, expect, it } from "vitest";
import { checkCaseBundle } from "@/lib/content/check";
import { readCaseFile } from "@/lib/content/files";
import { privateCaseSchema, publicCaseSchema, type PrivateCase, type PublicCase } from "@/lib/content/schema";

async function load(): Promise<{ pub: PublicCase; priv: PrivateCase }> {
  return {
    pub: publicCaseSchema.parse(await readCaseFile("demo-biblioteca", "case.json")),
    priv: privateCaseSchema.parse(await readCaseFile("demo-biblioteca", "solution.json")),
  };
}

describe("enigmas e alternativas: coerência entre público e privado", () => {
  it("o caso de base não tem problemas", async () => {
    const { pub, priv } = await load();
    expect(checkCaseBundle(pub, priv)).toEqual([]);
  });

  it("epochGuess sem epochAnswer", async () => {
    const { pub, priv } = await load();
    pub.epochGuess = { question: "Em que ano?", options: ["a", "b", "c", "d"] };
    expect(checkCaseBundle(pub, priv)).toContain("epochGuess sem epochAnswer");
  });

  it("objeto com code sem entrada em codes", async () => {
    const { pub, priv } = await load();
    const scene = pub.scenes[0];
    const obj = scene.objects[0];
    obj.type = "locked";
    obj.unlock = { code: { prompt: "Qual o código?", hint: "Olhe a parede.", inputMode: "numeric" }, lockedMessage: "Trancado." };
    expect(checkCaseBundle(pub, priv)).toContain(`${scene.id}/${obj.id}: cadeado sem código`);
  });

  it("quiz sem quizAnswers", async () => {
    const { pub, priv } = await load();
    const ev = pub.evidence[0];
    ev.quiz = { question: "Quem escreveu?", options: ["a", "b", "c"] };
    expect(checkCaseBundle(pub, priv)).toContain(`${ev.id}: pergunta sem resposta`);
  });

  it("quizAnswers.correct fora de 0..2", async () => {
    const { pub, priv } = await load();
    const ev = pub.evidence[0];
    ev.quiz = { question: "Quem escreveu?", options: ["a", "b", "c"] };
    priv.quizAnswers = { [ev.id]: { correct: 3, explanation: "Porque sim." } };
    expect(checkCaseBundle(pub, priv)).toContain(`${ev.id}: resposta da pergunta fora das opções`);
  });

  it("choiceAnswer.correctId inexistente", async () => {
    const { pub, priv } = await load();
    priv.choiceAnswer.correctId = "nao-existe";
    expect(checkCaseBundle(pub, priv)).toContain("alternativa certa inexistente");
  });

  it("alternativa errada sem feedback", async () => {
    const { pub, priv } = await load();
    const wrong = pub.conclusion.choices.find((c) => c.id !== priv.choiceAnswer.correctId)!;
    delete priv.choiceAnswer.wrongFeedback[wrong.id];
    expect(checkCaseBundle(pub, priv)).toContain(`alternativa ${wrong.id} sem feedback`);
  });

  it("o schema público rejeita choices com 3 itens", async () => {
    const { pub } = await load();
    const bad = { ...pub, conclusion: { ...pub.conclusion, choices: pub.conclusion.choices.slice(0, 3) } };
    expect(publicCaseSchema.safeParse(bad).success).toBe(false);
  });
});
