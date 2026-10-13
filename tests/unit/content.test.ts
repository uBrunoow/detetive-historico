import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkCaseBundle } from "@/lib/content/check";
import { listCaseSlugs, readCaseFile } from "@/lib/content/files";
import { getPublicCase, listPublishedCases } from "@/lib/content/public";
import { getPrivateCase } from "@/lib/content/private";
import { privateCaseSchema, publicCaseSchema } from "@/lib/content/schema";

const slugs = await listCaseSlugs();

describe.each(slugs)("caso %s", (slug) => {
  it("tem arquivos válidos e coerentes entre si", async () => {
    const pub = publicCaseSchema.parse(await readCaseFile(slug, "case.json"));
    const priv = privateCaseSchema.parse(await readCaseFile(slug, "solution.json"));
    expect(checkCaseBundle(pub, priv)).toEqual([]);
  });

  it("referencia apenas imagens que existem em public/", async () => {
    const pub = publicCaseSchema.parse(await readCaseFile(slug, "case.json"));
    const srcs = [pub.cover.src, ...pub.scenes.map((s) => s.image.src), ...pub.evidence.map((e) => e.image.src)];
    for (const src of srcs) {
      await expect(readFile(path.join(process.cwd(), "public", src))).resolves.toBeTruthy();
    }
  });
});

describe("separação entre conteúdo público e privado", () => {
  it("o arquivo público rejeita campos que revelam a solução", async () => {
    const pub = (await readCaseFile(slugs[0], "case.json")) as Record<string, unknown>;
    const leaked = { ...pub, evidence: [{ ...(pub.evidence as object[])[0], isKeyMilestone: true }] };
    expect(publicCaseSchema.safeParse(leaked).success).toBe(false);
  });

  it.each(slugs)("o payload público de %s não contém nenhum texto da solução", async (slug) => {
    const pub = await getPublicCase(slug);
    if (!pub) return;
    const priv = await getPrivateCase(slug);
    const payload = JSON.stringify(pub);
    for (const key of ["referenceOrder", "belongsToStory", "isKeyMilestone", "datingClueExplanation", "conceptGroups"]) {
      expect(payload).not.toContain(key);
    }
    for (const secret of privateStrings(priv)) {
      expect(payload, `vazou: "${secret}"`).not.toContain(secret);
    }
  });

  it("lista só casos publicados", async () => {
    const cases = await listPublishedCases();
    expect(cases.every((c) => c.status === "published")).toBe(true);
  });

  it("o módulo privado é marcado como server-only", async () => {
    const src = await readFile(path.join(process.cwd(), "lib/content/private.ts"), "utf8");
    expect(src.startsWith('import "server-only";')).toBe(true);
  });
});

/** Textos longos do arquivo privado: se algum aparecer no público, a solução vazou. */
function privateStrings(value: unknown): string[] {
  if (typeof value === "string") return value.length >= 25 ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(privateStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(privateStrings);
  return [];
}
