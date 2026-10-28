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

describe("enigmas e épocas: coerência entre público e privado", () => {
  it("o caso de base não tem problemas", async () => {
    const { pub, priv } = await load();
    expect(checkCaseBundle(pub, priv)).toEqual([]);
  });

  it("epochAnswer fora das 5 épocas", async () => {
    const { pub, priv } = await load();
    expect(privateCaseSchema.safeParse({ ...priv, epochAnswer: 5 }).success).toBe(false);
    pub.epochOptions = pub.epochOptions.slice(0, 3);
    priv.epochAnswer = 4;
    expect(checkCaseBundle(pub, priv)).toContain("epochAnswer fora das opções");
  });

  it("épocas repetidas", async () => {
    const { pub, priv } = await load();
    pub.epochOptions[1] = { ...pub.epochOptions[0] };
    expect(checkCaseBundle(pub, priv)).toContain(`época duplicada: ${pub.epochOptions[0].title}`);
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

  it("o schema público pede exatamente 5 épocas e recusa os campos que entregavam a época", async () => {
    const { pub } = await load();
    expect(publicCaseSchema.safeParse({ ...pub, epochOptions: pub.epochOptions.slice(0, 4) }).success).toBe(false);
    expect(publicCaseSchema.safeParse({ ...pub, period: "1923" }).success).toBe(false);
  });
});
