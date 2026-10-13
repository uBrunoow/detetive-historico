import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

/** Pasta onde vivem os casos. Cada subpasta é um caso (`content/cases/<slug>/`). */
export const CASES_DIR = path.join(process.cwd(), "content", "cases");

export async function listCaseSlugs(): Promise<string[]> {
  const entries = await readdir(CASES_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

export async function readCaseFile(slug: string, file: "case.json" | "solution.json"): Promise<unknown> {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error(`slug inválido: ${slug}`);
  const raw = await readFile(path.join(CASES_DIR, slug, file), "utf8");
  return JSON.parse(raw) as unknown;
}
