import { describe, expect, it, vi } from "vitest";
import { collectEvidence, isUnlocked, markExamined, startCase } from "@/lib/game/scene";
import { emptyProgress } from "@/lib/progress/types";
import type { SceneObject } from "@/lib/content/schema";

const gaveta: SceneObject = {
  id: "gaveta",
  type: "locked",
  label: "Gaveta",
  hotspot: { x: 0, y: 0, w: 10, h: 10 },
  evidenceId: "bilhete",
  unlock: { requiresExamined: ["chaveiro"], lockedMessage: "Trancada." },
};

describe("exploração da cena", () => {
  it("objeto bloqueado só abre depois de examinar o que a condição pede", () => {
    expect(isUnlocked(gaveta, [])).toBe(false);
    expect(isUnlocked(gaveta, ["chaveiro"])).toBe(true);
  });

  it("cadeado de código só abre quando o objeto está em unlocked", () => {
    const cofre = { ...gaveta, id: "cofre", unlock: { code: { prompt: "Código?", hint: "Dica.", inputMode: "numeric" as const }, lockedMessage: "Trancado." } };
    expect(isUnlocked(cofre, ["chaveiro"])).toBe(false);
    expect(isUnlocked(cofre, [], ["cofre"])).toBe(true);
  });

  it("examinar marca o objeto uma vez só e inicia o caso", () => {
    let p = markExamined(emptyProgress(), "chaveiro", "arquivo");
    p = markExamined(p, "chaveiro", "arquivo");
    expect(p.examined).toEqual(["chaveiro"]);
    expect(p.status).toBe("in_progress");
    expect(p.lastSceneId).toBe("arquivo");
  });

  it("coletar a mesma evidência duas vezes não duplica nem apaga anotações", () => {
    let p = collectEvidence(emptyProgress(), "bilhete");
    p = { ...p, cards: { bilhete: { ...p.cards.bilhete, notes: "importante" } } };
    expect(collectEvidence(p, "bilhete").cards.bilhete.notes).toBe("importante");
  });

  it("começar o caso não desfaz um caso concluído", () => {
    expect(startCase({ ...emptyProgress(), status: "solved" }).status).toBe("solved");
  });
});

describe("fontes não descobertas", async () => {
  const { getPublicCase } = await import("@/lib/content/public");
  const { undiscoveredCount } = await import("@/lib/game/scene");
  const c = (await getPublicCase("demo-biblioteca"))!;

  it("começa com todas as fontes", () => {
    expect(undiscoveredCount(c, emptyProgress())).toBe(c.evidence.length);
  });

  it("fonte só examinada, sem carta coletada, ainda conta como não guardada", () => {
    const p = markExamined(emptyProgress(), "mesa-bibliotecario", "sala-leitura");
    expect(undiscoveredCount(c, p)).toBe(c.evidence.length);
  });

  it("gaveta examinada trancada e chaveiro depois, sem coletar o bilhete: ainda falta ao menos uma", () => {
    let p = markExamined(emptyProgress(), "gaveta-mesa", "sala-leitura");
    p = markExamined(p, "chaveiro", "sala-leitura");
    expect(undiscoveredCount(c, p)).toBeGreaterThanOrEqual(1);
  });

  it("cada carta coletada reduz o contador em um", () => {
    const p = collectEvidence(emptyProgress(), c.evidence[0].id);
    expect(undiscoveredCount(c, p)).toBe(c.evidence.length - 1);
  });

  it("gaveta examinada ainda trancada não revela o bilhete", () => {
    const p = markExamined(emptyProgress(), "gaveta-mesa", "sala-leitura");
    expect(undiscoveredCount(c, p)).toBe(c.evidence.length);
  });
});

describe("progresso v3", () => {
  it("emptyProgress é v3 com os campos novos vazios", () => {
    const p = emptyProgress();
    expect(p.version).toBe(3);
    expect(p.draft).toEqual({ epochIndex: null });
    expect(p.unlocked).toEqual([]);
    expect(p.official).toBeNull();
    expect(p.practice).toBe(false);
  });

  it("progresso v1 salvo migra sem perder cartas e linha do tempo", async () => {
    const { readProgress } = await import("@/lib/progress/store");
    const v1 = {
      ...emptyProgress(),
      version: 1,
      examined: ["a"],
      cards: { bilhete: { collectedAt: "2026-01-01", notes: "n", important: true } },
      timeline: { slots: [["bilhete"]], outside: [], placements: {}, links: [] },
    };
    const store = new Map<string, string>([["detetive-historico:v1:progress:x", JSON.stringify(v1)]]);
    vi.stubGlobal("window", {
      localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) },
    });
    const p = readProgress("x");
    vi.unstubAllGlobals();
    expect(p.version).toBe(3);
    expect(p.cards.bilhete.notes).toBe("n");
    expect(p.timeline.slots).toEqual([["bilhete"]]);
    expect(p.examined).toEqual(["a"]);
    expect(p.unlocked).toEqual([]);
    expect(p.official).toBeNull();
    expect(p.practice).toBe(false);
  });

  it("progresso v2 resolvido volta a em andamento, sem o resultado antigo nem as escolhas", async () => {
    const { readProgress } = await import("@/lib/progress/store");
    const v2 = {
      ...emptyProgress(),
      version: 2,
      status: "solved",
      cards: { bilhete: { collectedAt: "2026-01-01", notes: "", important: false } },
      attempts: [{ choiceId: "a", justification: "", verdict: "correct", feedback: null, at: "2026-01-01" }],
      draft: { choiceId: "a", justification: "porque sim" },
      official: { stars: 3, points: 1100 },
    };
    const store = new Map<string, string>([["detetive-historico:v1:progress:w", JSON.stringify(v2)]]);
    vi.stubGlobal("window", {
      localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) },
    });
    const p = readProgress("w");
    vi.unstubAllGlobals();
    expect(p).toMatchObject({ version: 3, status: "in_progress", official: null, draft: { epochIndex: null } });
    expect(p).not.toHaveProperty("attempts");
    expect(Object.keys(p.cards)).toEqual(["bilhete"]);
  });

  it("resetProgress mantém o resultado oficial só quando pedido", async () => {
    const { resetProgress, readProgress, updateProgress } = await import("@/lib/progress/store");
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) },
    });
    updateProgress("y", (p) => ({ ...p, examined: ["a"], official: { stars: 2, points: 900 } }));
    resetProgress("y", true);
    expect(readProgress("y")).toMatchObject({ examined: [], official: { stars: 2, points: 900 }, practice: true });
    resetProgress("y", false);
    expect(readProgress("y")).toMatchObject({ official: null, practice: false });
    resetProgress("z", true);
    expect(readProgress("z").practice).toBe(false);
    vi.unstubAllGlobals();
  });
});
