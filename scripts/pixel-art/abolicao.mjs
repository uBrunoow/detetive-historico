// Gera a arte em pixel do caso "A lei de dois artigos" (abolição, 1871–1888).
// Uso: node scripts/pixel-art/abolicao.mjs
// Cenas 320×200. Os comentários "(x, y, w, h)" são as caixas dos objetos clicáveis:
// no case.json, hotspot% = coluna ÷ 3,2 e linha ÷ 2.
// Regra do caso: só lugares e objetos; nenhuma cena de violência nem corpos de pessoas escravizadas.
import { Canvas } from "./engine.mjs";
import { books, floorBoards, lampLight, wainscot, wall } from "./scenery.mjs";

const OUT = "public/cases/abolicao";
const SKY = "#9cc3d9";
const SKIN = ["#6b4a32", "#c9a27e", "#8a5f3e", "#4e3424", "#a87a55"];

/** Bandeirolas de festa numa linha levemente curva. */
function bunting(c, x0, x1, y, sag = 4) {
  const colors = ["red", "manila", "green", "paper", "violetLight"];
  for (let x = x0, k = 0; x < x1; x += 6, k++) {
    const t = (x - x0) / (x1 - x0);
    const yy = y + Math.round(Math.sin(t * Math.PI) * sag);
    c.hline(x, yy, 6, "ink");
    for (let j = 0; j < 4; j++) c.hline(x + 1 + Math.floor(j / 2), yy + 1 + j, 4 - j, colors[k % colors.length]);
  }
}

/** Multidão vista de longe: fileiras de cabeças e chapéus, sem rostos. */
function crowd(c, x, y, w, rows) {
  for (let r = 0; r < rows; r++)
    for (let i = 0; i < w; i += 3) {
      const X = x + i + (r % 2);
      const Y = y + r * 3;
      c.rect(X, Y + 1, 2, 2, SKIN[(i + r * 3) % SKIN.length]);
      if ((i + r) % 4 === 0) c.rect(X, Y, 2, 1, "ink"); // chapéu
      c.rect(X, Y + 3, 2, 1, (i + r) % 3 ? "woodDark" : "paperShade"); // roupa
    }
}

/** Altar ao ar livre com toldo e cruz pequena. */
function altar(c, cx, y) {
  c.rect(cx - 10, y - 10, 20, 2, "paper"); // toldo
  c.vline(cx - 9, y - 8, 10, "woodLight");
  c.vline(cx + 8, y - 8, 10, "woodLight");
  c.box(cx - 7, y - 2, 14, 6, "paper");
  c.vline(cx, y - 8, 5, "manila");
  c.hline(cx - 1, y - 7, 3, "manila");
}

/** Folha de lei impressa: brasão, título e linhas de texto. */
function lawSheet(c, x, y, w, h, lines) {
  c.box(x, y, w, h, "paper");
  c.disc(x + Math.floor(w / 2), y + 5, 2, "manila");
  c.hline(x + 4, y + 10, w - 8, "ink");
  for (let k = 0; k < lines; k++) c.hline(x + 4, y + 14 + k * 4, w - 8 - (k % 3) * 5, "wallDark");
}

/** Retrato emoldurado (busto simples, sem caricatura). */
function portrait(c, x, y, skin, beard) {
  c.box(x, y, 36, 48, "woodLight");
  c.box(x + 3, y + 3, 30, 42, "khaki");
  c.dither(x + 4, y + 4, 28, 40, "khaki", "wallDark");
  const cx = x + 18;
  c.disc(cx, y + 18, 7, skin);
  c.rect(cx - 7, y + 10, 15, 4, "ink"); // cabelo
  if (beard) c.rect(cx - 5, y + 22, 11, 4, "ink");
  c.rect(x + 6, y + 30, 24, 14, "ink"); // paletó
  c.rect(cx - 2, y + 30, 5, 6, "paper"); // colarinho
  c.hline(cx - 1, y + 33, 3, "ink"); // gravata
}

// ---------------------------------------------------------------- Redação do jornal (dia)
function redacao() {
  const c = new Canvas(320, 200);
  wall(c, 160, "wallLight");
  c.speckle(0, 0, 320, 160, "wall", 6);
  wainscot(c, 160, 12);
  floorBoards(c, 172);

  // janela-rua (16, 20, 64, 60): rua em festa
  c.box(16, 20, 64, 60, "woodLight");
  c.rect(19, 23, 58, 54, SKY);
  c.rect(19, 56, 58, 21, "khaki"); // casario do outro lado da rua
  for (let x = 22; x < 74; x += 10) c.box(x, 60, 6, 8, "night");
  bunting(c, 19, 77, 30, 5);
  bunting(c, 19, 77, 42, 3);
  c.vline(47, 23, 54, "woodLight");
  c.rect(14, 80, 68, 3, "woodLight");

  // parede-recortes (104, 24, 64, 48): ilustração da missa campal
  c.box(104, 24, 64, 48, "wood");
  c.rect(107, 27, 58, 42, SKY);
  c.rect(107, 50, 58, 19, "greenLight");
  altar(c, 136, 44);
  crowd(c, 108, 50, 56, 6);
  c.box(126, 72, 20, 4, "paper"); // legenda
  c.vline(136, 20, 4, "ink");

  // mesa-redator (24, 108, 120, 34): folha impressa curta + tinteiro
  c.rect(24, 128, 120, 5, "woodLight");
  c.hline(24, 128, 120, "ink");
  c.hline(24, 132, 120, "ink");
  c.box(28, 133, 112, 39, "wood");
  lawSheet(c, 56, 110, 26, 18, 1);
  c.box(92, 114, 30, 14, "paperShade"); // outros papéis
  for (let k = 0; k < 3; k++) c.hline(95, 117 + k * 3, 22, "wallDark");
  c.box(128, 120, 7, 8, "ink");
  c.rect(130, 118, 3, 2, "night");
  c.line(133, 120, 138, 110, "paper"); // pena

  // gaveta-redacao (36, 146, 44, 18): gaveta com fechadura
  c.box(37, 147, 42, 16, "woodLight");
  c.rect(56, 152, 4, 4, "manila");
  c.set(58, 157, "ink");
  c.box(88, 147, 44, 22, "woodLight");

  // pilha-jornais (176, 128, 44, 40): "CIDADE DO RIO"
  for (let k = 0; k < 4; k++) c.box(177 + (k % 2) * 2, 160 - k * 6, 40, 7, k % 2 ? "paperShade" : "paper");
  c.box(176, 128, 44, 16, "paper");
  c.text(186, 130, "CIDADE", "ink");
  c.text(186, 136, "DO RIO", "ink");
  c.hline(178, 142, 40, "ink");

  // prelo (236, 80, 72, 96): prensa tipográfica
  c.box(240, 84, 8, 90, "woodDark");
  c.box(296, 84, 8, 90, "woodDark");
  c.box(238, 80, 68, 8, "wood");
  c.box(268, 88, 8, 24, "khaki"); // parafuso
  c.line(250, 96, 294, 96, "khaki");
  c.box(250, 112, 48, 8, "wood"); // placa
  c.box(246, 132, 56, 10, "woodLight"); // mesa da prensa
  c.box(252, 126, 44, 6, "paper");
  c.box(236, 170, 72, 6, "woodDark");

  c.savePng(`${OUT}/scene-redacao.png`);
}

// ---------------------------------------------------------------- Escritório do advogado (luminária)
function escritorio() {
  const c = new Canvas(320, 200);
  wall(c, 168, "wallDark");
  c.speckle(0, 0, 320, 168, "wall", 5);
  floorBoards(c, 168);
  c.rect(0, 166, 320, 2, "woodLight");

  // estante (18, 28, 110, 140)
  c.box(18, 28, 110, 140, "wood");
  c.rect(21, 31, 104, 134, "woodDark");
  for (const y of [80, 120, 160]) c.rect(21, y, 104, 4, "woodLight");
  // colecao-1850 (24, 36, 30, 44) · colecao-1871 (58, 36, 30, 44) · colecao-1885 (92, 36, 30, 44)
  for (const [x, color, year] of [[24, "red", "1850"], [58, "green", "1871"], [92, "violet", "1885"]]) {
    c.box(x + 2, 38, 26, 42, color);
    c.hline(x + 3, 42, 24, "manila");
    c.hline(x + 3, 75, 24, "manila");
    c.text(x + 8, 50, "LEIS", "manila");
    c.text(x + 8, 58, year, "manila");
  }
  books(c, 22, 124, 120, 30, 3);
  books(c, 22, 124, 160, 30, 6);

  // mesa: tampo y 132, corpo até o chão
  c.rect(132, 132, 104, 5, "woodLight");
  c.hline(132, 132, 104, "ink");
  c.hline(132, 136, 104, "ink");
  c.box(138, 137, 92, 31, "wood");
  c.box(142, 142, 40, 12, "woodLight");
  // livro-nabuco (140, 112, 48, 22): livro aberto
  c.box(146, 120, 18, 12, "paper");
  c.box(163, 120, 18, 12, "paper");
  c.vline(163, 120, 12, "paperShade");
  for (let k = 0; k < 3; k++) {
    c.hline(148, 123 + k * 3, 13, "wallDark");
    c.hline(166, 123 + k * 3, 12 - k * 3, "wallDark");
  }
  c.rect(145, 131, 37, 1, "red"); // capa
  // luminária
  c.rect(206, 110, 3, 22, "ink");
  c.rect(201, 130, 13, 2, "ink");
  c.box(198, 100, 18, 10, "green");
  c.hline(199, 101, 16, "greenLight");

  // chaveiro (204, 96, 18, 28) — fica acima da luminária, na parede
  c.box(206, 72, 14, 4, "woodLight");
  c.ring(213, 81, 2, "manila");
  c.vline(213, 83, 10, "manila");
  c.hline(213, 89, 3, "manila");
  c.hline(213, 92, 2, "manila");
  c.box(208, 94, 10, 5, "paper");

  // retrato-gama (232, 24, 36, 48) · retrato-reboucas (276, 24, 36, 48)
  portrait(c, 232, 24, "#5a3c28", true);
  portrait(c, 276, 24, "#6b4a32", true);

  // poltrona
  c.box(250, 130, 44, 30, "red");
  c.box(246, 118, 52, 14, "red");
  c.rect(252, 160, 4, 8, "woodDark");
  c.rect(288, 160, 4, 8, "woodDark");

  lampLight(c, 207, 116, 70);
  c.savePng(`${OUT}/scene-escritorio.png`);
}

// ---------------------------------------------------------------- Capa (160×100)
function cover() {
  const c = new Canvas(160, 100, "woodDark");
  c.rect(0, 0, 160, 60, "wall");
  c.speckle(0, 0, 160, 60, "wallLight", 5);
  bunting(c, 0, 160, 6, 6);
  bunting(c, 0, 160, 20, 4);
  c.rect(0, 60, 160, 40, "wood");
  c.hline(0, 60, 160, "ink");
  lawSheet(c, 56, 40, 48, 50, 2);
  c.text(64, 70, "13.5.1888", "ink");
  c.savePng(`${OUT}/cover.png`);
}

// ---------------------------------------------------------------- Miniaturas das cartas (64×48)
function thumb(name, drawFn) {
  const c = new Canvas(64, 48, "transparent");
  drawFn(c);
  c.savePng(`${OUT}/ev-${name}.png`);
}

function evidenceThumbs() {
  thumb("lei-1850", (c) => lawSheet(c, 16, 2, 32, 44, 7));
  thumb("ventre-livre", (c) => lawSheet(c, 16, 2, 32, 44, 6));
  thumb("sexagenarios", (c) => lawSheet(c, 16, 2, 32, 44, 8));
  thumb("lei-aurea", (c) => {
    lawSheet(c, 16, 2, 32, 44, 2);
    c.line(22, 38, 40, 36, "carbon"); // assinatura
  });
  thumb("nabuco", (c) => {
    c.box(4, 8, 28, 34, "paper");
    c.box(31, 8, 28, 34, "paper");
    c.vline(31, 8, 34, "paperShade");
    for (let k = 0; k < 6; k++) {
      c.hline(7, 13 + k * 4, 21, "wallDark");
      c.hline(35, 13 + k * 4, 20 - (k % 2) * 6, "wallDark");
    }
    c.rect(3, 42, 57, 2, "red");
  });
  thumb("clube-militar", (c) => {
    c.box(8, 8, 48, 32, "paper");
    c.line(8, 8, 32, 26, "paperShade");
    c.line(55, 8, 32, 26, "paperShade");
    c.disc(32, 28, 4, "red");
    c.disc(32, 28, 2, "redLight");
  });
  thumb("missa-campal", (c) => {
    c.rect(2, 2, 60, 44, SKY);
    c.rect(2, 22, 60, 24, "greenLight");
    altar(c, 32, 18);
    crowd(c, 3, 24, 58, 7);
  });
}

redacao();
escritorio();
cover();
evidenceThumbs();
console.log("Arte do caso da abolição gerada.");
