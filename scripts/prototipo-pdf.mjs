// Gera um PDF com as telas atuais (protótipo de baixa fidelidade).
// Uso: pnpm build && pnpm start -p 3100 (em outro terminal) e node scripts/prototipo-pdf.mjs [saida.pdf]
import { chromium } from "@playwright/test";

const base = "http://localhost:3100";
const outPdf = process.argv[2] ?? "prototipo-telas.pdf";
const KEY = "detetive-historico:v1:progress:demo-biblioteca";
const all = ["oficio-prefeitura", "recibo-encadernacao", "registro-visitas", "bilhete", "croqui", "ata-camara", "jornal-1898"];
const now = "2026-10-13T20:00:00Z";
const card = { collectedAt: now, notes: "", important: false };

const partial = {
  version: 1, status: "in_progress",
  examined: ["mesa-bibliotecario", "chaveiro", "gaveta-mesa", "livro-visitas", "rolo-croqui"],
  cards: Object.fromEntries(["bilhete", "croqui", "registro-visitas"].map((id) => [id, card])),
  notes: "", hypotheses: [], timeline: { slots: [], outside: [], placements: {}, links: [] },
  checks: [], attempts: [], draft: { answer: "", supporting: [] },
  lastSceneId: "sala-leitura", updatedAt: now,
};
const full = {
  ...partial,
  cards: Object.fromEntries(all.map((id) => [id, { ...card, notes: id === "bilhete" ? "Quem escreveu? Letra parecida com a do recibo." : "" }])),
  hypotheses: [{ id: "h1", text: "O livro saiu da biblioteca antes do incêndio.", createdAt: now }],
  timeline: {
    slots: [["oficio-prefeitura"], ["recibo-encadernacao"], ["registro-visitas"], ["ata-camara"]],
    outside: [], placements: { "oficio-prefeitura": { certainty: "certain", reason: "Data no cabeçalho." } }, links: [],
  },
};

const browser = await chromium.launch();
const shots = [];
async function shot(title, desc, { path, progress = partial, before, mobile = false }) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 800 },
    deviceScaleFactor: 1, reducedMotion: "reduce",
  });
  await ctx.addInitScript(([k, p]) => { try { if (p) localStorage.setItem(k, JSON.stringify(p)); } catch {} }, [KEY, progress]);
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: "networkidle" });
  if (before) await before(page);
  await page.waitForTimeout(500);
  const buf = await page.screenshot({ fullPage: !mobile ? false : true });
  shots.push({ title, desc, path, mobile, src: "data:image/png;base64," + buf.toString("base64") });
  await ctx.close();
  console.log("ok", title);
}
const open = (label) => (p) => p.locator(`button[aria-label^="${label}"]`).first().click();
const C = "/casos/demo-biblioteca";

await shot("Tela inicial", "Menu principal do jogo, com acesso a jogar, como jogar, opções e créditos.", { path: "/", progress: null });
await shot("Seleção de fases", "Lista de casos (fases) com status e medalhas.", { path: "/fases" });
await shot("Briefing do caso", "Apresentação do caso: período, lugar, pergunta a investigar.", { path: C });
await shot("Cena: Sala de leitura", "Cenário investigável; o jogador clica nos objetos.", { path: `${C}/cena/sala-leitura` });
await shot("Cena com áreas destacadas", "Ajuda visual mostrando os objetos clicáveis.", {
  path: `${C}/cena/sala-leitura`, before: (p) => p.getByRole("button", { name: /Mostrar o que dá/ }).click(),
});
await shot("Fonte aberta: Ofício", "Visualização de uma fonte histórica, com opção de guardar no caderno.", { path: `${C}/cena/sala-leitura`, before: open("Papéis sobre a mesa") });
await shot("Cena: Arquivo", "Segundo cenário do caso.", { path: `${C}/cena/arquivo` });
await shot("Fonte aberta: Jornal", "Outra fonte histórica encontrada no arquivo.", { path: `${C}/cena/arquivo`, before: open("Pilha de jornais") });
await shot("Caderno de investigação", "Fontes coletadas, anotações e hipóteses do jogador.", {
  path: `${C}/cena/sala-leitura`, progress: full, before: open("Abrir o caderno"),
});
await shot("Linha do tempo", "O jogador ordena as fontes cronologicamente e as relaciona.", { path: `${C}/linha-do-tempo`, progress: full });
await shot("Conclusão", "O jogador responde à pergunta do caso usando as fontes como apoio.", { path: `${C}/conclusao`, progress: full });
await shot("Encerramento", "Tela final do caso. Só abre depois que o jogador conclui o caso ou usa todas as tentativas; aqui aparece o aviso de bloqueio.", { path: `${C}/encerramento`, progress: full });
await shot("Como jogar", "Instruções do jogo.", { path: "/como-jogar" });
await shot("Opções", "Configurações (tamanho do texto, movimento etc.).", { path: "/opcoes" });
await shot("Créditos", "Créditos e referências.", { path: "/creditos" });
await shot("Celular: tela inicial", "Versão responsiva.", { path: "/", progress: null, mobile: true });
await shot("Celular: cena", "Cena no celular.", { path: `${C}/cena/arquivo`, mobile: true });

const date = new Date().toLocaleDateString("pt-BR");
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@page { size: A4 landscape; margin: 12mm; }
body { font-family: system-ui, sans-serif; color: #222; margin: 0; }
.cover { height: 180mm; display: flex; flex-direction: column; justify-content: center; page-break-after: always; }
.cover h1 { font-size: 34pt; margin: 0 0 8px; } .cover p { font-size: 13pt; color: #555; margin: 4px 0; }
.page { page-break-after: always; height: 180mm; display: flex; flex-direction: column; }
.page:last-child { page-break-after: auto; }
h2 { font-size: 16pt; margin: 0 0 2px; } .desc { color: #555; margin: 0 0 6px; font-size: 10.5pt; }
.route { font-family: monospace; color: #888; font-size: 9pt; }
.img { flex: 1; display: flex; justify-content: center; align-items: flex-start; min-height: 0; }
img { max-width: 100%; max-height: 100%; border: 1px solid #ccc; object-fit: contain; }
ol { columns: 2; font-size: 11pt; }
</style></head><body>
<section class="cover"><h1>Detetive Histórico</h1><p>Protótipo de telas — baixa fidelidade</p><p>Estado atual do projeto em ${date}</p>
<ol>${shots.map((s) => `<li>${s.title}</li>`).join("")}</ol></section>
${shots.map((s, i) => `<section class="page"><h2>${i + 1}. ${s.title}</h2><p class="desc">${s.desc} <span class="route">${s.path}</span></p><div class="img"><img src="${s.src}"></div></section>`).join("")}
</body></html>`;
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({ path: outPdf, format: "A4", landscape: true, printBackground: true });
await browser.close();
console.log("PDF:", outPdf);
