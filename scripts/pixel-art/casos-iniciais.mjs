// Gera a arte em pixel dos casos beta: caminha, inconfidencia, vargas e revolucao-industrial.
// Uso: node scripts/pixel-art/casos-iniciais.mjs
// Versão de baixa fidelidade: as quatro cenas usam a mesma planta de sala (320×200),
// com os objetos clicáveis sempre nas mesmas caixas. No case.json, hotspot% = coluna ÷ 3,2 e linha ÷ 2:
//   A janela/quadro (16, 20, 64, 60)   B quadro central (104, 24, 64, 48)   I parede direita (240, 20, 48, 52)
//   C mesa esq. (52, 106, 36, 24)      D mesa dir. (92, 108, 36, 22)        E gaveta (36, 146, 44, 18)
//   F móvel (176, 116, 48, 52)         G móvel grande (236, 80, 72, 96)     H chave (196, 36, 24, 32)
import { Canvas } from "./engine.mjs";
import { books, floorBoards, lampLight, wainscot, wall } from "./scenery.mjs";

const SKY = "#9cc3d9";
const SEA = "#3f6f8f";
const GOLD = "#e0b23a";
const BRICK = "#8a4a36";

// ---------------------------------------------------------------- peças comuns

function room(c, base) {
  wall(c, 160, base);
  wainscot(c, 160, 12);
  floorBoards(c, 172);
}

/** Mesa com tampo em y 128 e a gaveta da caixa E. */
function desk(c) {
  c.rect(24, 128, 120, 5, "woodLight");
  c.hline(24, 128, 120, "ink");
  c.hline(24, 132, 120, "ink");
  c.box(28, 133, 112, 39, "wood");
  c.box(37, 147, 42, 16, "woodLight");
  c.rect(56, 152, 4, 4, "manila");
  c.set(58, 157, "ink");
  c.box(88, 147, 44, 22, "woodLight");
}

/** Só o contorno (box com "transparent" apagaria o que está dentro). */
function outline(c, x, y, w, h, color) {
  c.hline(x, y, w, color);
  c.hline(x, y + h - 1, w, color);
  c.vline(x, y, h, color);
  c.vline(x + w - 1, y, h, color);
}

function frame(c, x, y, w, h, color = "wood") {
  c.box(x, y, w, h, color);
  c.rect(x + 2, y + 2, w - 4, h - 4, "ink");
}

/** Folha com linhas de texto (manuscrita = linhas tortas). */
function sheet(c, x, y, w, h, lines, paper = "paper", ink = "wallDark", hand = false) {
  c.box(x, y, w, h, paper);
  for (let k = 0; k < lines; k++) {
    const yy = y + 4 + k * 3;
    if (yy > y + h - 3) break;
    const len = w - 6 - ((k * 5) % 7);
    if (hand) for (let i = 0; i < len; i += 2) c.set(x + 3 + i, yy + ((i + k) % 3 === 0 ? 1 : 0), ink);
    else c.hline(x + 3, yy, len, ink);
  }
}

function lawSheet(c, x, y, w, h, lines) {
  c.box(x, y, w, h, "paper");
  c.disc(x + Math.floor(w / 2), y + 5, 2, "manila");
  c.hline(x + 4, y + 10, w - 8, "ink");
  for (let k = 0; k < lines; k++) c.hline(x + 4, y + 14 + k * 4, w - 8 - (k % 3) * 5, "wallDark");
}

function seal(c, x, y) {
  c.disc(x, y, 3, "red");
  c.disc(x, y, 1, "redLight");
}

function scroll(c, x, y, w, h) {
  c.box(x, y, w, h, "lamp");
  c.box(x - 2, y - 2, w + 4, 4, "manila");
  c.box(x - 2, y + h - 2, w + 4, 4, "manila");
  for (let k = 0; k < Math.floor((h - 10) / 4); k++) c.hline(x + 3, y + 5 + k * 4, w - 6 - (k % 2) * 4, "woodLight");
}

function caravel(c, x, y) {
  c.rect(x, y + 6, 14, 3, "woodDark");
  c.rect(x + 2, y + 9, 10, 1, "woodDark");
  c.vline(x + 7, y - 4, 10, "ink");
  c.box(x + 3, y - 3, 9, 7, "paper");
  c.vline(x + 7, y - 2, 5, "red");
  c.hline(x + 5, y, 5, "red");
}

function tree(c, x, y, color = "green") {
  c.vline(x, y, 6, "woodDark");
  c.disc(x, y - 1, 3, color);
}

function parrot(c, x, y) {
  c.rect(x, y, 2, 3, "greenLight");
  c.set(x + 2, y, "red");
  c.set(x, y + 3, "red");
}

function flagMG(c, x, y, w, h) {
  c.box(x, y, w, h, "paper");
  const cx = x + Math.floor(w / 2);
  const top = y + 4;
  const th = h - 9;
  for (let j = 0; j < th; j++) {
    const half = Math.round((j * (w * 0.35)) / th / 1);
    c.hline(cx - Math.floor(half / 2), top + j, Math.max(1, half), "red");
  }
}

function blueBooklet(c, x, y) {
  c.box(x, y, 14, 18, "carbon");
  c.hline(x + 3, y + 5, 8, "lamp");
  c.disc(x + 7, y + 11, 2, "lamp");
}

function clockFace(c, x, y, hour) {
  c.disc(x, y, 6, "paper");
  c.ring(x, y, 6, "ink");
  c.vline(x, y - 4, 4, "ink");
  const a = (hour / 12) * Math.PI * 2;
  c.line(x, y, x + Math.round(Math.sin(a) * 3), y - Math.round(Math.cos(a) * 3), "red");
}

function heads(c, x, y, w, rows, skins = ["#c9a27e", "#8a5f3e", "#a87a55", "#6b4a32"]) {
  for (let r = 0; r < rows; r++)
    for (let i = 0; i < w; i += 3) {
      const X = x + i + (r % 2);
      const Y = y + r * 3;
      c.rect(X, Y + 1, 2, 2, skins[(i + r) % skins.length]);
      if ((i + r) % 3 === 0) c.rect(X, Y, 2, 1, "ink");
      c.rect(X, Y + 3, 2, 1, (i + r) % 2 ? "woodDark" : "khaki");
    }
}

function chimneys(c, x, y, w, h) {
  for (let i = 0; i < 4; i++) {
    const cx = x + 4 + i * Math.floor(w / 4);
    const ch = h - 6 - (i % 2) * 8;
    c.box(cx, y + h - ch, 5, ch, BRICK);
    for (let s = 0; s < 4; s++) c.disc(cx + 2 + s * 2, y + h - ch - 3 - s * 3, 2 + (s % 2), s % 2 ? "wallLight" : "khaki");
  }
}

function steamEngine(c, x, y) {
  c.box(x, y + 10, 24, 18, "khaki"); // caldeira
  c.box(x + 26, y, 8, 28, "wallDark"); // cilindro
  c.line(x + 30, y, x + 44, y - 6, "ink"); // balancim
  c.box(x + 2, y + 28, 32, 4, "woodDark");
  c.disc(x + 8, y + 22, 3, "redLight"); // fogo
}

function coalSack(c, x, y) {
  c.box(x, y, 12, 12, "khaki");
  c.rect(x + 2, y - 2, 8, 3, "ink");
}

function hammer(c, x, y) {
  c.line(x, y + 14, x + 10, y + 2, "woodLight");
  c.box(x + 6, y - 2, 10, 5, "wallDark");
}

function streetHouses(c, x, y, w, h) {
  c.rect(x, y, w, h, "khaki");
  for (let i = 0; i < w; i += 10) {
    c.box(x + i, y + 8, 10, h - 8, i % 20 ? BRICK : "woodLight");
    c.rect(x + i + 3, y + 12, 3, 4, "night");
  }
  chimneys(c, x, y - 12, w, 22);
}

function savePair(slug, name, draw, w = 64, h = 48) {
  const c = new Canvas(w, h, "transparent");
  draw(c);
  c.savePng(`public/cases/${slug}/${name}.png`);
}

function cover(slug, draw) {
  const c = new Canvas(160, 100, "woodDark");
  draw(c);
  c.savePng(`public/cases/${slug}/cover.png`);
}

// ---------------------------------------------------------------- Caso 1: Torre do Tombo, 1773 (vela)
function caminha() {
  const slug = "caminha";
  const c = new Canvas(320, 200);
  room(c, "wallDark");
  desk(c);
  // A janela-tejo: rio com caravela
  c.box(16, 20, 64, 60, "woodLight");
  c.rect(19, 23, 58, 30, SKY);
  c.rect(19, 53, 58, 24, SEA);
  for (let x = 22; x < 74; x += 7) c.hline(x, 60 + (x % 3) * 4, 4, "wallLight");
  caravel(c, 40, 46);
  c.vline(47, 23, 54, "woodLight");
  // B mapa-parede
  c.box(104, 24, 64, 48, "wood");
  c.rect(107, 27, 58, 42, "lamp");
  c.rect(107, 27, 20, 42, SEA);
  c.rect(127, 30, 34, 36, "greenLight");
  for (const [x, y] of [[133, 38], [143, 48], [153, 40], [138, 58], [151, 58]]) tree(c, x, y, "red");
  parrot(c, 146, 33);
  parrot(c, 157, 50);
  // C folhas-mesa · D caderno-mesa
  sheet(c, 54, 108, 22, 20, 5, "lamp", "woodDark", true);
  sheet(c, 66, 112, 20, 16, 4, "lamp", "woodDark", true);
  sheet(c, 96, 110, 28, 18, 4, "lamp", "woodDark", true);
  caravel(c, 108, 116);
  // vela
  c.box(134, 116, 5, 12, "paper");
  c.rect(136, 112, 1, 4, "lamp");
  // F arca
  c.box(178, 132, 44, 36, "wood");
  c.box(176, 124, 48, 10, "woodLight");
  c.rect(180, 140, 36, 2, "manila");
  c.rect(196, 134, 6, 8, "manila");
  // G estante
  c.box(240, 84, 64, 90, "wood");
  c.rect(243, 87, 58, 84, "woodDark");
  for (const y of [112, 140]) c.rect(243, y, 58, 3, "woodLight");
  books(c, 244, 300, 112, 22, 2);
  books(c, 244, 300, 140, 24, 5);
  books(c, 244, 300, 170, 26, 7);
  // Cadeado representado pelo objeto da cena; não desenhar chaves.
  // I pergaminho-selo
  scroll(c, 250, 26, 28, 40);
  seal(c, 264, 62);
  lampLight(c, 136, 112, 80);
  c.savePng(`public/cases/${slug}/scene-arquivo.png`);

  cover(slug, (c) => {
    c.rect(0, 0, 160, 60, "wallDark");
    c.box(90, 8, 60, 44, "wood");
    c.rect(93, 11, 54, 38, SEA);
    caravel(c, 112, 26);
    c.rect(0, 60, 160, 40, "wood");
    c.hline(0, 60, 160, "ink");
    sheet(c, 24, 36, 50, 56, 14, "lamp", "woodDark", true);
  });
  savePair(slug, "ev-tordesilhas", (c) => {
    scroll(c, 18, 6, 28, 36);
    seal(c, 32, 38);
  });
  savePair(slug, "ev-partida", (c) => {
    sheet(c, 14, 2, 36, 44, 12, "lamp", "woodDark", true);
    caravel(c, 34, 30);
  });
  savePair(slug, "ev-monte-pascoal", (c) => {
    c.rect(2, 2, 60, 26, SKY);
    c.rect(2, 28, 60, 18, SEA);
    c.disc(36, 30, 14, "green");
    c.rect(20, 30, 32, 16, SEA);
    c.rect(2, 26, 60, 3, "greenLight");
    caravel(c, 12, 30);
  });
  savePair(slug, "ev-habitantes", (c) => {
    sheet(c, 6, 2, 36, 44, 12, "lamp", "woodDark", true);
    c.line(48, 6, 48, 40, "woodLight");
    c.line(48, 6, 56, 23, "paperShade");
    c.line(56, 23, 48, 40, "paperShade");
    c.line(44, 30, 60, 14, "woodDark");
    c.rect(52, 40, 2, 6, "red");
  });
  savePair(slug, "ev-missa-cruz", (c) => {
    c.rect(2, 2, 60, 28, SKY);
    c.rect(2, 30, 60, 16, "lamp");
    for (const x of [6, 12, 52, 58]) tree(c, x, 24);
    c.rect(31, 8, 3, 32, "woodDark");
    c.rect(24, 14, 17, 3, "woodDark");
  });
  savePair(slug, "ev-terra-brasilis", (c) => {
    c.rect(2, 2, 60, 44, "lamp");
    c.rect(2, 2, 16, 44, SEA);
    c.rect(18, 4, 42, 40, "greenLight");
    for (const [x, y] of [[24, 14], [34, 24], [46, 12], [52, 30], [28, 36]]) tree(c, x, y, "red");
    parrot(c, 40, 8);
    parrot(c, 54, 20);
    c.rect(38, 34, 2, 4, "#8a5f3e");
  });
}

// ---------------------------------------------------------------- Caso 2: museu em Ouro Preto
function inconfidencia() {
  const slug = "inconfidencia";
  const c = new Canvas(320, 200);
  room(c, "wallLight");
  desk(c);
  // A retrato
  c.box(26, 20, 44, 60, "woodLight");
  c.rect(29, 23, 38, 54, "khaki");
  c.disc(48, 42, 8, "#c9a27e");
  c.rect(40, 32, 17, 4, "woodDark");
  c.rect(42, 48, 13, 6, "woodDark"); // barba
  c.rect(34, 58, 30, 19, "ink");
  // B pergaminho-quadro
  frame(c, 104, 24, 64, 48, "woodLight");
  scroll(c, 116, 30, 40, 36);
  seal(c, 136, 62);
  // vitrine sobre a mesa (C livro, D bandeira)
  outline(c, 50, 104, 80, 26, "paperShade");
  c.box(56, 116, 14, 12, "paper");
  c.box(69, 116, 14, 12, "paper");
  for (let k = 0; k < 3; k++) c.hline(58, 119 + k * 3, 10, "wallDark");
  sheet(c, 96, 110, 28, 18, 0, "lamp");
  c.line(104, 124, 110, 113, "red");
  c.line(110, 113, 116, 124, "red");
  c.hline(104, 124, 13, "red");
  // F cofre com ouro
  c.box(178, 128, 44, 40, "khaki");
  c.box(182, 132, 36, 32, "wallDark");
  c.ring(200, 148, 5, "khaki");
  c.box(186, 118, 26, 10, GOLD);
  c.hline(188, 120, 22, "lamp");
  // G oratório
  c.box(244, 86, 56, 88, "woodLight");
  c.box(250, 98, 44, 60, "wood");
  c.disc(272, 98, 22, "woodLight");
  c.rect(250, 98, 44, 2, "woodLight");
  c.rect(270, 112, 4, 30, GOLD);
  c.rect(262, 120, 20, 4, GOLD);
  // Cadeado representado pelo objeto da cena; não desenhar chaves.
  // I bandeira de MG
  c.vline(242, 18, 56, "woodDark");
  flagMG(c, 244, 22, 44, 32);
  c.savePng(`public/cases/${slug}/scene-museu.png`);

  cover(slug, (c) => {
    c.rect(0, 0, 160, 60, "wallLight");
    flagMG(c, 96, 8, 52, 38);
    c.rect(0, 60, 160, 40, "wood");
    c.hline(0, 60, 160, "ink");
    c.box(30, 50, 50, 16, GOLD);
    c.hline(33, 53, 44, "lamp");
    c.text(46, 72, "1/5", "lamp");
  });
  savePair(slug, "ev-quinto", (c) => {
    c.box(8, 14, 48, 16, GOLD);
    c.hline(11, 17, 42, "lamp");
    c.disc(32, 22, 4, "manila");
    c.text(26, 36, "1/5", "ink");
  });
  savePair(slug, "ev-cartas-chilenas", (c) => {
    sheet(c, 4, 6, 28, 36, 10, "paper", "woodDark", true);
    sheet(c, 31, 6, 28, 36, 10, "paper", "woodDark", true);
    c.vline(31, 6, 36, "paperShade");
  });
  savePair(slug, "ev-bandeira-plano", (c) => {
    c.box(8, 4, 48, 40, "lamp");
    c.line(20, 32, 32, 10, "red");
    c.line(32, 10, 44, 32, "red");
    c.hline(20, 32, 25, "red");
    c.hline(14, 38, 36, "woodDark");
  });
  savePair(slug, "ev-denuncia", (c) => {
    c.box(8, 8, 48, 32, "paper");
    c.line(8, 8, 32, 26, "paperShade");
    c.line(55, 8, 32, 26, "paperShade");
    seal(c, 32, 28);
  });
  savePair(slug, "ev-sentenca", (c) => {
    scroll(c, 16, 6, 32, 36);
    seal(c, 32, 38);
  });
  savePair(slug, "ev-bandeira-mg", (c) => flagMG(c, 6, 6, 52, 36));
}

// ---------------------------------------------------------------- Caso 4: gabinete no Catete, 1954
function vargas() {
  const slug = "vargas";
  const c = new Canvas(320, 200);
  room(c, "green");
  c.speckle(0, 0, 320, 160, "greenLight", 6);
  desk(c);
  // A janela com cortinas
  c.box(16, 20, 64, 60, "woodLight");
  c.rect(19, 23, 58, 54, SKY);
  c.rect(19, 56, 58, 21, "wallLight");
  c.rect(19, 23, 12, 54, "red");
  c.rect(65, 23, 12, 54, "red");
  c.vline(47, 23, 54, "woodLight");
  // B quadro: grupo na sacada
  frame(c, 104, 24, 64, 48, "manila");
  c.rect(107, 27, 58, 42, "wallLight");
  c.rect(107, 50, 58, 3, "paper");
  for (let i = 0; i < 5; i++) {
    c.disc(116 + i * 10, 40, 3, "#c9a27e");
    c.rect(113 + i * 10, 36, 7, 2, "ink");
    c.rect(114 + i * 10, 44, 5, 6, i === 2 ? "khaki" : "ink");
  }
  heads(c, 108, 56, 56, 4);
  // C folha datilografada · D jornal oficial
  sheet(c, 56, 108, 26, 20, 5, "paper", "ink");
  c.line(64, 125, 76, 123, "carbon");
  c.box(94, 114, 32, 14, "paperShade");
  c.text(97, 116, "DIARIO", "ink");
  c.hline(96, 123, 28, "wallDark");
  // F arquivo de metal + carteira azul
  c.box(180, 124, 40, 44, "khaki");
  for (const y of [130, 144, 158]) {
    c.box(184, y, 32, 11, "wallLight");
    c.rect(197, y + 4, 6, 2, "ink");
  }
  blueBooklet(c, 192, 106);
  // G rádio
  c.box(244, 92, 56, 80, "woodLight");
  c.box(250, 100, 44, 34, "wood");
  for (let y = 102; y < 132; y += 3) c.hline(252, y, 40, "woodDark");
  c.box(254, 140, 36, 10, "lamp");
  c.vline(266, 141, 8, "red");
  c.disc(258, 160, 3, "woodDark");
  c.disc(286, 160, 3, "woodDark");
  // Cadeado representado pelo objeto da cena; não desenhar chaves.
  // I texto emoldurado
  frame(c, 242, 20, 46, 52, "manila");
  lawSheet(c, 248, 25, 34, 42, 6);
  lampLight(c, 140, 116, 60);
  c.savePng(`public/cases/${slug}/scene-gabinete.png`);

  cover(slug, (c) => {
    c.rect(0, 0, 160, 60, "green");
    c.speckle(0, 0, 160, 60, "greenLight", 5);
    c.rect(0, 60, 160, 40, "wood");
    c.hline(0, 60, 160, "ink");
    sheet(c, 50, 30, 44, 60, 14, "paper", "ink");
    c.line(58, 84, 80, 82, "carbon");
    blueBooklet(c, 108, 70);
    c.box(14, 34, 28, 34, "woodLight");
    for (let y = 38; y < 56; y += 3) c.hline(17, y, 22, "woodDark");
  });
  savePair(slug, "ev-constituicao-1891", (c) => lawSheet(c, 16, 2, 32, 44, 7));
  savePair(slug, "ev-posse-1930", (c) => {
    c.rect(2, 2, 60, 44, "wallLight");
    c.rect(2, 22, 60, 3, "paper");
    for (let i = 0; i < 4; i++) {
      c.disc(14 + i * 12, 12, 3, "#c9a27e");
      c.rect(11 + i * 12, 8, 7, 2, "ink");
      c.rect(12 + i * 12, 16, 5, 6, i === 1 ? "khaki" : "ink");
    }
    heads(c, 3, 28, 58, 5);
  });
  savePair(slug, "ev-codigo-eleitoral", (c) => {
    c.box(4, 4, 36, 40, "paperShade");
    c.text(7, 7, "DIARIO", "ink");
    for (let k = 0; k < 6; k++) c.hline(7, 16 + k * 4, 30, "wallDark");
    c.box(42, 22, 18, 20, "woodLight");
    c.rect(47, 22, 8, 2, "ink");
    c.box(47, 12, 8, 10, "paper");
  });
  savePair(slug, "ev-constituicao-1937", (c) => {
    lawSheet(c, 16, 2, 32, 44, 6);
    outline(c, 26, 30, 22, 9, "red");
    c.hline(29, 34, 16, "red");
  });
  savePair(slug, "ev-clt", (c) => {
    lawSheet(c, 6, 2, 32, 44, 6);
    blueBooklet(c, 42, 22);
  });
  savePair(slug, "ev-carta-testamento", (c) => {
    sheet(c, 14, 2, 36, 44, 12, "paper", "ink");
    c.line(22, 42, 40, 40, "carbon");
  });
}

// ---------------------------------------------------------------- Caso 5: arquivo de biblioteca em Manchester
function revolucaoIndustrial() {
  const slug = "revolucao-industrial";
  const c = new Canvas(320, 200);
  room(c, "wall");
  c.rect(0, 0, 320, 160, BRICK);
  for (let y = 0; y < 160; y += 6) {
    c.hline(0, y, 320, "woodDark");
    for (let x = (y / 6) % 2 ? 0 : 8; x < 320; x += 16) c.vline(x, y, 6, "woodDark");
  }
  desk(c);
  // A janela com chaminés
  c.box(16, 20, 64, 60, "woodLight");
  c.rect(19, 23, 58, 54, "khaki");
  chimneys(c, 19, 35, 58, 42);
  c.vline(47, 23, 54, "woodLight");
  // B quadro: desenho da máquina
  frame(c, 104, 24, 64, 48, "wood");
  c.rect(107, 27, 58, 42, "lamp");
  steamEngine(c, 112, 34);
  // C papéis · D livro grosso
  sheet(c, 54, 110, 22, 18, 4, "paper", "wallDark");
  sheet(c, 64, 114, 22, 14, 3, "paper", "wallDark");
  c.box(96, 116, 30, 12, "green");
  c.rect(98, 118, 26, 8, "paper");
  c.hline(96, 121, 30, "green");
  // F caixote com pastas
  c.box(178, 132, 44, 36, "woodLight");
  for (let i = 0; i < 4; i++) c.box(182 + i * 9, 120, 8, 14, i % 2 ? "manila" : "paperShade");
  c.hline(180, 150, 40, "woodDark");
  // G maquete de tear
  c.box(244, 104, 56, 8, "wood");
  c.box(244, 150, 56, 8, "wood");
  c.box(244, 104, 6, 70, "woodDark");
  c.box(294, 104, 6, 70, "woodDark");
  for (let x = 252; x < 292; x += 3) c.vline(x, 112, 38, "paper");
  c.box(250, 128, 44, 5, "woodLight");
  // Cadeado representado pelo objeto da cena; não desenhar chaves.
  // I pasta azul num prego
  c.set(264, 22, "ink");
  c.line(264, 22, 252, 32, "ink");
  c.line(264, 22, 276, 32, "ink");
  c.box(246, 32, 36, 40, "carbon");
  c.box(252, 40, 24, 8, "paper");
  lampLight(c, 140, 110, 50);
  c.savePng(`public/cases/${slug}/scene-biblioteca.png`);

  cover(slug, (c) => {
    c.rect(0, 0, 160, 66, "khaki");
    chimneys(c, 4, 6, 150, 60);
    c.rect(0, 66, 160, 34, "wood");
    c.hline(0, 66, 160, "ink");
    steamEngine(c, 56, 58);
  });
  savePair(slug, "ev-watt-patente", (c) => {
    c.rect(2, 2, 60, 44, "lamp");
    steamEngine(c, 6, 10);
    coalSack(c, 46, 30);
  });
  savePair(slug, "ev-ludd", (c) => {
    sheet(c, 6, 6, 32, 36, 9, "paper", "ink", true);
    c.line(6, 6, 14, 14, "paperShade");
    hammer(c, 42, 18);
  });
  savePair(slug, "ev-sadler", (c) => {
    sheet(c, 4, 2, 32, 44, 12, "paperShade", "ink");
    clockFace(c, 48, 14, 5);
    clockFace(c, 48, 34, 9);
  });
  savePair(slug, "ev-factory-act", (c) => {
    lawSheet(c, 4, 2, 32, 44, 6);
    c.disc(50, 14, 4, "#c9a27e");
    c.rect(45, 9, 11, 3, "ink");
    c.rect(46, 18, 9, 16, "ink");
    c.box(40, 22, 7, 9, "manila");
  });
  savePair(slug, "ev-chadwick", (c) => streetHouses(c, 2, 16, 60, 30));
  savePair(slug, "ev-clt-brasil", (c) => {
    lawSheet(c, 6, 2, 32, 44, 6);
    blueBooklet(c, 42, 22);
  });
}

caminha();
inconfidencia();
vargas();
revolucaoIndustrial();
console.log("Arte dos casos beta gerada.");
