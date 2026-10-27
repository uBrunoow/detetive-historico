import { describe, expect, it } from "vitest";
import { getPrivateCase } from "@/lib/content/private";
import { getPublicCase } from "@/lib/content/public";
import { checkTimeline } from "@/lib/game/check";

/** Casos beta: a linha de referência confere, as alternativas da conclusão estão completas. */
const cases: { slug: string }[] = [
  {
    slug: "caminha",
  },
  {
    slug: "inconfidencia",
  },
  {
    slug: "vargas",
  },
  {
    slug: "revolucao-industrial",
  },
];

describe.each(cases)("caso $slug", ({ slug }) => {
  it("linha de referência confere ok", async () => {
    const priv = await getPrivateCase(slug);
    const story = priv.timelineReference.filter((r) => r.belongsToStory);
    const orders = [...new Set(story.map((r) => r.referenceOrder!))].sort((a, b) => a - b);
    const slots = orders.map((o) => story.filter((r) => r.referenceOrder === o).map((r) => r.evidenceId));
    const outside = priv.timelineReference.filter((r) => !r.belongsToStory).map((r) => r.evidenceId);
    expect(checkTimeline(priv, { slots, outside }, 1)).toEqual({ kind: "ok" });
  });

  it("a alternativa certa existe entre as 4 e cada errada tem orientação", async () => {
    const pub = await getPublicCase(slug);
    const priv = await getPrivateCase(slug);
    const ids = pub!.conclusion.choices.map((c) => c.id);
    expect(ids).toContain(priv.choiceAnswer.correctId);
    for (const id of ids.filter((i) => i !== priv.choiceAnswer.correctId)) {
      expect(priv.choiceAnswer.wrongFeedback[id]?.length).toBeGreaterThan(0);
    }
  });
});
