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
import { checkTimeline, getClosure, getResult, restartCase, submitVerdict, tryCode } from "@/lib/game/actions";

const slug = "demo-biblioteca";
const perfect = {
  slots: [["oficio-prefeitura"], ["recibo-encadernacao"], ["registro-visitas"], ["bilhete"], ["croqui"], ["ata-camara"]],
  outside: ["jornal-1898"],
};
const partial = { slots: [["oficio-prefeitura"], ["recibo-encadernacao"], ["registro-visitas"], ["bilhete"]], outside: [] };

async function epochs() {
  const right = (await getPrivateCase(slug)).epochAnswer;
  return { right, wrong: (right + 1) % 5 };
}

beforeEach(() => jar.clear());

describe("submitVerdict / getResult / getClosure / restartCase", () => {
  it("época certa e ordem perfeita: 1000, 3 estrelas, resolvido e oficial gravado", async () => {
    const { right } = await epochs();
    const r = await submitVerdict(slug, { epochIndex: right, order: perfect });
    expect(r).toMatchObject({ ok: true, result: { points: 1000, stars: 3 }, state: { outcome: "solved" } });
    const res = await getResult(slug);
    expect(res.official).toEqual(res.current);
  });

  it("ordem perfeita com a época errada fica em 600, sem 100%", async () => {
    const { wrong } = await epochs();
    const r = await submitVerdict(slug, { epochIndex: wrong, order: perfect });
    expect(r).toMatchObject({ ok: true, result: { points: 600, breakdown: { epoch: 0, order: 600 } } });
  });

  it("antes do veredito o encerramento não sai; depois traz a época certa e a escolhida", async () => {
    const { right, wrong } = await epochs();
    expect(await getClosure(slug)).toBeNull();
    await submitVerdict(slug, { epochIndex: wrong, order: partial });
    const closure = await getClosure(slug);
    expect(closure?.epoch).toMatchObject({ correct: right, chosen: wrong });
    expect(closure?.epoch.options).toHaveLength(5);
  });

  it("pontuação baixa encerra como em aberto (failed), com os pontos", async () => {
    const { wrong } = await epochs();
    const r = await submitVerdict(slug, { epochIndex: wrong, order: partial });
    expect(r).toMatchObject({ ok: true, state: { outcome: "failed" } });
    expect((await getResult(slug)).official!.points).toBeGreaterThan(0);
  });

  it("recusa época fora de A a E", async () => {
    await expect(submitVerdict(slug, { epochIndex: 5, order: perfect })).rejects.toThrow();
    await expect(submitVerdict(slug, { epochIndex: -1, order: perfect })).rejects.toThrow();
  });

  it("depois de encerrado, novo veredito não muda nada", async () => {
    const { right, wrong } = await epochs();
    await submitVerdict(slug, { epochIndex: right, order: perfect });
    const r = await submitVerdict(slug, { epochIndex: wrong, order: partial });
    expect(r).toMatchObject({ ok: false, error: "closed", state: { outcome: "solved" } });
  });

  it("com poucas cartas o veredito é recusado e o caso continua aberto", async () => {
    const { right } = await epochs();
    const r = await submitVerdict(slug, { epochIndex: right, order: { slots: [["bilhete"]], outside: [] } });
    expect(r).toMatchObject({ ok: false, error: "locked", state: { outcome: null } });
  });

  it("Jogar de novo zera o caso, mantém o oficial e o treino não o sobrescreve", async () => {
    const { right, wrong } = await epochs();
    await submitVerdict(slug, { epochIndex: wrong, order: partial });
    const official = (await getResult(slug)).official!;
    const s = await restartCase(slug);
    expect(s).toMatchObject({ ok: true, state: { outcome: null, practice: true, official: { stars: official.stars, points: official.points } } });
    expect((await getResult(slug)).current).toBeNull();
    await submitVerdict(slug, { epochIndex: right, order: perfect });
    const res = await getResult(slug);
    expect(res.current!.points).toBe(1000);
    expect(res.official).toEqual(official);
    expect(res.practice).toBe(true);
  });

  it("a conferência conta quantas cartas estão no lugar, sem dizer quais", async () => {
    const ok = await checkTimeline(slug, perfect);
    expect(ok).toMatchObject({ ok: true, tally: { inPlace: 7, total: 7 } });
    const some = await checkTimeline(slug, partial);
    expect(some).toMatchObject({ ok: true, tally: { inPlace: 4, total: 7 } });
    expect(Object.keys((some as { tally: object }).tally)).toEqual(["inPlace", "total"]);
  });

  it("recomeçar com o caso aberto é recusado", async () => {
    const r = await restartCase(slug);
    expect(r).toMatchObject({ ok: false, error: "not_closed", state: { outcome: null } });
  });

  it("código vazio não conta como tentativa", async () => {
    const r = await tryCode(slug, "cadeado-teste", "   ");
    expect(r).toMatchObject({ ok: false, error: "empty" });
    const a = await tryCode(slug, "cadeado-teste", "1");
    const b = await tryCode(slug, "cadeado-teste", "2");
    expect(a).toMatchObject({ showHint: false });
    expect(b).toMatchObject({ showHint: true, hint: "dica" });
  });
});
