import { beforeEach, describe, expect, it, vi } from "vitest";

// Cookie jar em memória no lugar de `next/headers`.
const jar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (n: string) => (jar.has(n) ? { name: n, value: jar.get(n)! } : undefined),
    set: (n: string, v: string) => void jar.set(n, v),
  }),
}));

import { getPrivateCase } from "@/lib/content/private";
import { getPublicCase } from "@/lib/content/public";
import { getResult, restartCase, submitChoice } from "@/lib/game/actions";

const slug = "demo-biblioteca";
const order = { slots: [], outside: [] };

async function ids() {
  const c = (await getPublicCase(slug))!;
  const p = await getPrivateCase(slug);
  const wrong = c.conclusion.choices.find((x) => x.id !== p.choiceAnswer.correctId)!.id;
  return { right: p.choiceAnswer.correctId, wrong };
}

beforeEach(() => jar.clear());

describe("submitChoice / getResult / restartCase", () => {
  it("certa na 1ª encerra com solvedOnChoice 1 e grava o resultado oficial", async () => {
    const { right } = await ids();
    const r = await submitChoice(slug, { choiceId: right, justification: "", order });
    expect(r).toMatchObject({ ok: true, verdict: "correct", feedback: null });
    const res = await getResult(slug);
    expect(res.current?.breakdown.answer).toBe(500);
    expect(res.official).toEqual(res.current);
  });

  it("errada dá orientação, não revela a certa, e esgota em failed", async () => {
    const { wrong } = await ids();
    const a = await submitChoice(slug, { choiceId: wrong, justification: "", order });
    expect(a).toMatchObject({ ok: true, verdict: "wrong", state: { outcome: null, choicesLeft: 1 } });
    expect(typeof (a as { feedback: unknown }).feedback).toBe("string");
    expect((await getResult(slug)).current).toBeNull();
    const b = await submitChoice(slug, { choiceId: wrong, justification: "", order });
    expect(b).toMatchObject({ ok: true, state: { outcome: "failed" } });
    expect((await getResult(slug)).current?.stars).toBe(0);
  });

  it("certa na 2ª vale 250", async () => {
    const { right, wrong } = await ids();
    await submitChoice(slug, { choiceId: wrong, justification: "", order });
    await submitChoice(slug, { choiceId: right, justification: "", order });
    expect((await getResult(slug)).current?.breakdown.answer).toBe(250);
  });

  it("recusa alternativa inexistente e justificativa gigante", async () => {
    await expect(submitChoice(slug, { choiceId: "nao-existe", justification: "", order })).rejects.toThrow();
    const { right } = await ids();
    await expect(submitChoice(slug, { choiceId: right, justification: "x".repeat(601), order })).rejects.toThrow();
  });

  it("depois de encerrado, nova escolha não muda nada", async () => {
    const { right, wrong } = await ids();
    await submitChoice(slug, { choiceId: right, justification: "", order });
    const r = await submitChoice(slug, { choiceId: wrong, justification: "", order });
    expect(r).toMatchObject({ ok: false, error: "closed", state: { outcome: "solved" } });
  });

  it("Jogar de novo zera o caso, mantém o oficial e o treino não o sobrescreve", async () => {
    const { right, wrong } = await ids();
    await submitChoice(slug, { choiceId: right, justification: "", order });
    const official = (await getResult(slug)).official!;
    const s = await restartCase(slug);
    expect(s).toMatchObject({ outcome: null, choicesLeft: 2, practice: true, official: { stars: official.stars, points: official.points } });
    expect((await getResult(slug)).current).toBeNull();
    await submitChoice(slug, { choiceId: wrong, justification: "", order });
    await submitChoice(slug, { choiceId: wrong, justification: "", order });
    const res = await getResult(slug);
    expect(res.official).toEqual(official);
    expect(res.current?.stars).toBe(0);
    expect(res.practice).toBe(true);
  });
});
