// Captura as telas principais para revisão visual.
// Uso: pnpm start -p 3100 (em outro terminal) e node scripts/capture.mjs [baseURL]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const out = ".impeccable/review";
mkdirSync(out, { recursive: true });

const progress = {
  version: 1,
  status: "in_progress",
  examined: ["mesa-bibliotecario", "chaveiro", "gaveta-mesa", "livro-visitas", "rolo-croqui"],
  cards: Object.fromEntries(
    ["bilhete", "croqui", "registro-visitas"].map((id) => [id, { collectedAt: "2026-10-13T20:00:00Z", notes: "", important: false }]),
  ),
  lastSceneId: "sala-leitura",
  updatedAt: "2026-10-13T20:00:00Z",
};

const browser = await chromium.launch();

async function shot(name, { width, height, path, scheme = "light", fullPage = false, before }) {
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, reducedMotion: "reduce" });
  await ctx.addInitScript((p) => {
    try {
      localStorage.setItem("detetive-historico:v1:progress:demo-biblioteca", JSON.stringify(p));
    } catch {}
    const style = document.createElement("style");
    style.textContent = "html{scrollbar-width:none}::-webkit-scrollbar{display:none}";
    document.addEventListener("DOMContentLoaded", () => document.head.appendChild(style));
  }, progress);
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: "networkidle" });
  if (before) await before(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage });
  await ctx.close();
  console.log("ok", name);
}

const D = { width: 1366, height: 800 };
const M = { width: 390, height: 844 };
const open = (label, collect = false) => async (page) => {
  await page.locator(`button[aria-label^="${label}"]`).first().click();
  if (collect) await page.locator("dialog button", { hasText: "Guardar no caderno" }).click();
};

await shot("desktop", { ...D, path: "/" });
await shot("mobile", { ...M, path: "/", fullPage: true });
await shot("desktop-fases", { ...D, path: "/fases", fullPage: true });
await shot("mobile-fases", { ...M, path: "/fases", fullPage: true });
await shot("desktop-briefing", { ...D, path: "/casos/demo-biblioteca", fullPage: true });
await shot("desktop-cena", { ...D, path: "/casos/demo-biblioteca/cena/sala-leitura" });
await shot("desktop-cena-areas", {
  ...D,
  path: "/casos/demo-biblioteca/cena/sala-leitura",
  before: (p) => p.getByRole("button", { name: /Mostrar o que dá/ }).click(),
});
await shot("mobile-cena", { ...M, path: "/casos/demo-biblioteca/cena/arquivo", fullPage: true });
await shot("desktop-oficio", { ...D, path: "/casos/demo-biblioteca/cena/sala-leitura", before: open("Papéis sobre a mesa") });
await shot("desktop-bilhete", { ...D, path: "/casos/demo-biblioteca/cena/sala-leitura", before: open("Gaveta da mesa") });
await shot("desktop-jornal", { ...D, path: "/casos/demo-biblioteca/cena/arquivo", before: open("Pilha de jornais") });
await shot("desktop-visitas-dark", { ...D, path: "/casos/demo-biblioteca/cena/sala-leitura", scheme: "dark", before: open("Livro de visitas") });
await shot("mobile-oficio", { ...M, path: "/casos/demo-biblioteca/cena/sala-leitura", fullPage: false, before: open("Papéis sobre a mesa") });
await shot("desktop-opcoes", { ...D, path: "/opcoes" });
await shot("desktop-como-jogar", { ...D, path: "/como-jogar", fullPage: true });

await browser.close();
