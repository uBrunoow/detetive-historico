// Verifica, depois do `next build`, se algum texto que revela a solução foi parar em
// arquivos que o navegador recebe (JS do cliente, HTML e payloads RSC pré-renderizados).
// Uso: pnpm build && pnpm check:leaks
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const casesDir = path.join(root, "content", "cases");
const targets = [path.join(root, ".next", "static"), path.join(root, ".next", "server", "app")];
const browserFacing = /\.(js|html|rsc|body|txt|json)$/;

function strings(value) {
  if (typeof value === "string") return value.length >= 25 ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const secrets = [];
for (const slug of await readdir(casesDir)) {
  const file = path.join(casesDir, slug, "solution.json");
  if (!(await stat(file).catch(() => null))) continue;
  for (const s of strings(JSON.parse(await readFile(file, "utf8")))) secrets.push({ slug, s });
}

try {
  await stat(path.join(root, ".next"));
} catch {
  console.error("Pasta .next não encontrada. Rode `pnpm build` antes.");
  process.exit(2);
}

let leaks = 0;
let scanned = 0;
for (const dir of targets) {
  for await (const file of walk(dir)) {
    // Bundles de servidor (route.js, page.js do servidor) não vão para o navegador.
    if (dir.endsWith(path.join("server", "app")) && file.endsWith(".js")) continue;
    if (!browserFacing.test(file)) continue;
    scanned++;
    const body = await readFile(file, "utf8");
    for (const { slug, s } of secrets) {
      // O RSC/JSON pode escapar aspas e quebras de linha; comparamos também a forma escapada.
      const escaped = JSON.stringify(s).slice(1, -1);
      if (body.includes(s) || body.includes(escaped)) {
        leaks++;
        console.error(`VAZAMENTO [${slug}] em ${path.relative(root, file)}:\n  "${s.slice(0, 80)}…"`);
      }
    }
  }
}

if (leaks > 0) {
  console.error(`\n${leaks} vazamento(s) encontrados.`);
  process.exit(1);
}
console.log(`Nenhum vazamento: ${secrets.length} textos privados verificados em ${scanned} arquivos enviados ao navegador.`);
