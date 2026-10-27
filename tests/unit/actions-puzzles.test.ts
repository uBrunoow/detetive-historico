import { beforeEach, describe, expect, it, vi } from "vitest";

// Cookie jar em memória no lugar de `next/headers`.
const jar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (n: string) => (jar.has(n) ? { name: n, value: jar.get(n)! } : undefined),
    set: (n: string, v: string) => void jar.set(n, v),
  }),
}));

// O caso de teste ganha um cadeado de código em memória.
vi.mock("@/lib/content/public", async (orig) => {
  const m = await orig<typeof import("@/lib/content/public")>();
  return {
    ...m,
    getPublicCase: async (slug: string) => {
      const c = await m.getPublicCase(slug);
      if (!c) return c;
      const copy = structuredClone(c);
      copy.scenes[0].objects[0].id = "cadeado-teste";
      copy.scenes[0].objects[0].unlock = { code: { prompt: "?", hint: "dica", inputMode: "numeric" }, lockedMessage: "trancado" };
      return copy;
    },
  };
});
vi.mock("@/lib/content/private", async (orig) => {
  const m = await orig<typeof import("@/lib/content/private")>();
  return {
    ...m,
    getPrivateCase: async (slug: string) => {
      const p = await m.getPrivateCase(slug);
      return { ...p, codes: { "cadeado-teste": "1500" } };
    },
  };
});

import { getPrivateCase } from "@/lib/content/private";
import { getPublicCase } from "@/lib/content/public";
import { getResult, restartCase, submitChoice, tryCode } from "@/lib/game/actions";

const slug = "demo-biblioteca";
const order = { slots: [["oficio-prefeitura"], ["recibo-encadernacao"], ["registro-visitas"], ["bilhete"]], outside: [] };

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
    expect(s).toMatchObject({ ok: true, state: { outcome: null, choicesLeft: 2, practice: true, official: { stars: official.stars, points: official.points } } });
    expect((await getResult(slug)).current).toBeNull();
    await submitChoice(slug, { choiceId: wrong, justification: "", order });
    await submitChoice(slug, { choiceId: wrong, justification: "", order });
    const res = await getResult(slug);
    expect(res.official).toEqual(official);
    expect(res.current?.stars).toBe(0);
    expect(res.practice).toBe(true);
  });

  it("recomeçar com o caso aberto é recusado e não apaga nada", async () => {
    const { wrong } = await ids();
    await submitChoice(slug, { choiceId: wrong, justification: "", order });
    const r = await restartCase(slug);
    expect(r).toMatchObject({ ok: false, error: "not_closed", state: { outcome: null, choicesLeft: 1 } });
    expect((await getResult(slug)).practice).toBe(false);
  });

  it("1ª conclusão errada também grava o oficial (0 estrelas, pontos aparecem)", async () => {
    const { wrong } = await ids();
    await submitChoice(slug, { choiceId: wrong, justification: "", order });
    await submitChoice(slug, { choiceId: wrong, justification: "", order });
    const res = await getResult(slug);
    expect(res.official).toMatchObject({ stars: 0 });
    expect(res.official!.points).toBeGreaterThan(0);
  });

  it("com poucas cartas a escolha é recusada e não é gasta", async () => {
    const { right } = await ids();
    const r = await submitChoice(slug, { choiceId: right, justification: "", order: { slots: [["bilhete"]], outside: [] } });
    expect(r).toMatchObject({ ok: false, error: "locked", state: { outcome: null, choicesLeft: 2 } });
  });

  it("código vazio não conta como tentativa", async () => {
    const r = await tryCode(slug, "cadeado-teste", "   ");
    expect(r).toMatchObject({ ok: false, error: "empty" });
    const a = await tryCode(slug, "cadeado-teste", "1");
    const b = await tryCode(slug, "cadeado-teste", "2");
    expect(a).toMatchObject({ showHint: false });
    expect(b).toMatchObject({ showHint: true, hint: "dica" });
  });

  it("treino melhor que o oficial não o sobrescreve", async () => {
    const { right, wrong } = await ids();
    await submitChoice(slug, { choiceId: wrong, justification: "", order });
    await submitChoice(slug, { choiceId: wrong, justification: "", order });
    const official = (await getResult(slug)).official!;
    expect(official.stars).toBe(0);
    expect(await restartCase(slug)).toMatchObject({ ok: true, state: { practice: true } });
    await submitChoice(slug, { choiceId: right, justification: "", order });
    const res = await getResult(slug);
    expect(res.current!.points).toBeGreaterThan(official.points);
    expect(res.official).toEqual(official);
  });
});
