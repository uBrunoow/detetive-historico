import { describe, expect, it } from "vitest";
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

  it("uma fonte vista conta como descoberta mesmo antes de ir para o caderno", () => {
    const p = markExamined(emptyProgress(), "mesa-bibliotecario", "sala-leitura");
    expect(undiscoveredCount(c, p)).toBe(c.evidence.length - 1);
  });

  it("gaveta examinada ainda trancada não revela o bilhete", () => {
    const p = markExamined(emptyProgress(), "gaveta-mesa", "sala-leitura");
    expect(undiscoveredCount(c, p)).toBe(c.evidence.length);
  });
});
