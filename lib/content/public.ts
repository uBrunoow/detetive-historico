import "server-only";
import { listCaseSlugs, readCaseFile } from "./files";
import { publicCaseSchema, type PublicCase } from "./schema";

/**
 * Conteúdo público dos casos: pode ser passado a Client Components.
 * Nada aqui revela a solução (ver `private.ts`).
 */
export async function getPublicCase(slug: string): Promise<PublicCase | null> {
  "use cache";
  const slugs = await listCaseSlugs();
  if (!slugs.includes(slug)) return null;
  const parsed = publicCaseSchema.parse(await readCaseFile(slug, "case.json"));
  return parsed.status === "published" ? parsed : null;
}

export async function listPublishedCases(): Promise<PublicCase[]> {
  "use cache";
  const slugs = await listCaseSlugs();
  const cases = await Promise.all(slugs.map((s) => getPublicCase(s)));
  return cases.filter((c): c is PublicCase => c !== null);
}
