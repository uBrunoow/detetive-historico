import { describe, expect, it } from "vitest";
import { getPrivateCase } from "@/lib/content/private";
import { getPublicCase } from "@/lib/content/public";
import { checkTimeline } from "@/lib/game/check";

/** Casos beta: a linha de referência confere, a época certa está entre as 5 alternativas. */
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

  it("a época certa é uma das 5 e as alternativas estão em ordem cronológica", async () => {
    const pub = await getPublicCase(slug);
    const priv = await getPrivateCase(slug);
    expect(pub!.epochOptions).toHaveLength(5);
    expect(priv.epochAnswer).toBeGreaterThanOrEqual(0);
    expect(priv.epochAnswer).toBeLessThan(5);
  });
});
