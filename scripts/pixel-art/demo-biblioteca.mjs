// Gera a arte em pixel do caso de demonstração e da tela inicial.
// Uso: node scripts/pixel-art/demo-biblioteca.mjs
// As cenas são 320×200 (16:10). Os hotspots do case.json usam porcentagens desta grade:
// x% × 3,2 = coluna; y% × 2 = linha.
import { Canvas } from "./engine.mjs";
import { books, floorBoards, lampLight, wainscot, wall } from "./scenery.mjs";

const OUT = "public/cases/demo-biblioteca";
// ---------------------------------------------------------------- Sala de leitura
function salaLeitura() {
  const c = new Canvas(320, 200);
  wall(c, 152);
  // janela alta com noite lá fora
  c.box(110, 14, 30, 40, "night");
  c.vline(125, 15, 38, "ink");
  c.hline(111, 34, 28, "ink");
  c.set(116, 22, "lamp");
  c.set(133, 41, "lamp");
  c.set(131, 20, "paper");
  c.rect(108, 54, 34, 3, "woodLight");
  wainscot(c, 152, 12);
  floorBoards(c, 164);

  // retrato (14%..30% x, 10%..36% y) → x 45..96, y 20..72
  c.box(46, 20, 50, 52, "wood");
  c.box(50, 24, 42, 44, "khaki");
  c.dither(51, 25, 40, 42, "khaki", "wall");
  c.disc(71, 40, 8, "skin");
  c.rect(63, 31, 16, 4, "woodDark"); // cabelo
  c.hline(66, 45, 10, "woodDark"); // bigode
  c.hline(65, 46, 12, "woodDark");
  c.rect(58, 52, 26, 15, "ink");
  c.rect(69, 52, 4, 6, "paper");
  c.box(62, 64, 18, 4, "manila");

  // calendário (46%..56% x, 14%..34% y) → x 147..179, y 28..68
  c.box(148, 28, 31, 40, "paper");
  c.rect(149, 29, 29, 8, "red");
  c.text(150, 31, "MAR", "paper");
  c.text(164, 31, "23", "paper");
  for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) c.rect(151 + k * 4, 41 + r * 6, 2, 2, "wallDark");
  c.ring(158, 54, 3, "carbon");
  c.vline(163, 24, 4, "ink");

  // estante (68%..94% x, 10%..70% y) → x 218..301, y 20..140; base até 152
  c.box(218, 18, 84, 134, "wood");
  c.rect(222, 22, 76, 126, "woodDark");
  for (const y of [50, 80, 110, 140]) c.rect(222, y, 76, 4, "woodLight");
  books(c, 223, 297, 50, 24, 1);
  books(c, 223, 297, 80, 24, 4);
  books(c, 223, 297, 110, 24, 2, [252, 266]); // o vão do Livro de Terras
  c.dither(252, 88, 14, 22, "ink", "woodDark");
  c.box(254, 112, 10, 4, "paper");
  books(c, 223, 297, 140, 26, 6);

  // mesa do bibliotecário: tampo y 132..137, corpo 137..176
  c.rect(30, 132, 108, 6, "woodLight");
  c.hline(30, 132, 108, "ink");
  c.hline(30, 137, 108, "ink");
  c.box(34, 138, 100, 38, "wood");
  // gaveta (12%..26% x, 72%..81% y) → x 38..83, y 144..162
  c.box(40, 145, 42, 16, "woodLight");
  c.rect(59, 151, 4, 4, "manila");
  c.set(61, 156, "ink");
  c.box(88, 145, 40, 26, "woodLight");
  // luminária
  c.rect(62, 108, 4, 24, "ink");
  c.rect(56, 130, 16, 2, "ink");
  c.box(54, 96, 20, 12, "green");
  c.hline(55, 97, 18, "greenLight");
  // papéis (8%..38% x, 56%..69% y) → x 26..122, y 112..138
  c.box(36, 120, 24, 12, "paper");
  for (let k = 0; k < 3; k++) c.hline(38, 123 + k * 3, 18 - k * 4, "wallDark");
  c.box(84, 122, 22, 10, "manila");
  c.box(108, 120, 12, 12, "paper");
  c.ring(114, 126, 4, "ink");
  c.line(114, 126, 114, 123, "ink");
  c.line(114, 126, 116, 127, "ink");

  // púlpito com livro de visitas (44%..62% x, 55%..69% y) → x 141..198, y 110..138
  c.rect(165, 138, 8, 34, "wood");
  c.box(155, 170, 28, 5, "woodLight");
  c.box(142, 130, 54, 8, "woodLight");
  c.box(146, 118, 23, 13, "paper");
  c.box(168, 118, 23, 13, "paper");
  for (let k = 0; k < 3; k++) {
    c.hline(149, 121 + k * 3, 16, "carbon");
    c.hline(171, 121 + k * 3, 14 - k * 3, "carbon");
  }

  lampLight(c, 64, 112, 52);
  c.savePng(`${OUT}/scene-sala-leitura.png`);
}

// ---------------------------------------------------------------- Arquivo dos fundos
function arquivo() {
  const c = new Canvas(320, 200);
  wall(c, 160, "wallDark");
  c.speckle(0, 0, 320, 160, "wall", 5);
  floorBoards(c, 160);
  c.rect(0, 158, 320, 2, "woodLight");

  // prateleiras de pastas (x 8..80, y 24..160); pasta de recibos destacada (6%..22%, 30%..48%) → x 19..70, y 60..96
  c.box(8, 22, 76, 138, "wood");
  c.rect(11, 25, 70, 132, "woodDark");
  for (const y of [56, 100, 128]) c.rect(11, y, 70, 3, "woodLight");
  for (let x = 13; x < 78; x += 10) c.box(x, 30, 9, 26, x % 20 ? "manila" : "khaki");
  for (let x = 13; x < 78; x += 12) c.box(x, 104, 11, 24, x % 24 ? "manila" : "red");
  for (let x = 13; x < 78; x += 16) c.box(x, 132, 15, 25, "khaki");
  c.box(20, 62, 50, 36, "manila");
  c.box(36, 64, 18, 7, "paper");
  c.text(37, 65, "REC", "ink");
  c.hline(24, 78, 40, "woodLight");
  c.hline(24, 84, 32, "woodLight");
  c.hline(24, 90, 36, "woodLight");

  // quadro de avisos (34%..56% x, 10%..36% y) → x 109..179, y 20..72
  c.box(110, 20, 70, 52, "woodLight");
  c.rect(113, 23, 64, 46, "manila");
  c.dither(113, 23, 64, 46, "manila", "woodLight");
  c.box(126, 27, 38, 38, "paper");
  c.text(134, 30, "AVISO", "ink");
  for (let k = 0; k < 5; k++) c.hline(130, 39 + k * 5, 30 - (k % 2) * 6, "wallDark");
  for (const [x, y] of [[128, 28], [161, 28], [128, 62], [161, 62]]) c.rect(x, y, 2, 2, "redLight");

  // chaveiro (62%..70% x, 16%..32% y) → x 198..224, y 32..64
  c.box(200, 34, 22, 4, "woodLight");
  c.set(211, 35, "ink");
  for (const [x, len] of [[204, 18], [211, 22], [218, 14]]) {
    c.ring(x, 42, 2, "manila");
    c.vline(x, 44, len, "manila");
    c.hline(x, 44 + len - 4, 3, "manila");
    c.hline(x, 44 + len - 1, 2, "manila");
  }
  c.box(207, 60, 9, 5, "paper");

  // mesa com croqui (26%..48% x, 58%..72% y) → x 83..154, y 116..144
  c.box(80, 140, 78, 5, "woodLight");
  c.rect(84, 145, 4, 15, "wood");
  c.rect(150, 145, 4, 15, "wood");
  c.box(92, 122, 56, 18, "lamp");
  c.box(88, 120, 6, 22, "paperShade");
  c.box(146, 120, 6, 22, "paperShade");
  c.line(97, 135, 112, 127, "carbon");
  c.line(112, 127, 124, 133, "carbon");
  c.line(124, 133, 141, 125, "carbon");
  for (let x = 98; x < 140; x += 4) c.set(x, 126 + Math.floor((x - 98) / 6), "ink");

  // escrivaninha com ata (54%..70% x, 56%..69% y) → x 173..224, y 112..138
  c.box(170, 136, 60, 5, "woodLight");
  c.box(173, 141, 54, 19, "wood");
  c.box(182, 114, 34, 22, "paper");
  for (let k = 0; k < 5; k++) c.hline(186, 118 + k * 3, 26 - (k === 4 ? 14 : 0), "wallDark");
  c.line(198, 132, 210, 130, "carbon");

  // jornais (76%..92% x, 62%..86% y) → x 243..294, y 124..172
  for (let k = 0; k < 5; k++) c.box(246 + (k % 2) * 2, 164 - k * 8, 46, 8, k % 2 ? "paperShade" : "khaki");
  c.box(246, 124, 46, 18, "paperShade");
  c.text(250, 127, "SERENENSE", "ink");
  c.hline(250, 134, 38, "ink");
  for (let k = 0; k < 3; k++) c.hline(250 + k * 13, 137, 10, "wallDark");

  // lâmpada pendurada
  c.vline(150, 0, 16, "ink");
  c.rect(146, 16, 9, 3, "ink");
  c.disc(150, 21, 3, "lamp");
  lampLight(c, 150, 30, 90);
  c.savePng(`${OUT}/scene-arquivo.png`);
}

// ---------------------------------------------------------------- Capa do caso
function cover() {
  const c = new Canvas(160, 100, "woodDark");
  c.box(20, 6, 120, 94, "wood");
  c.rect(24, 10, 112, 86, "woodDark");
  for (const y of [38, 66]) c.rect(24, y, 112, 3, "woodLight");
  books(c, 25, 134, 38, 24, 1);
  books(c, 25, 134, 66, 24, 3, [70, 86]);
  c.dither(70, 44, 16, 22, "ink", "woodDark");
  books(c, 25, 134, 96, 26, 5);
  lampLight(c, 78, 50, 44);
  c.savePng(`${OUT}/cover.png`);
}

// ---------------------------------------------------------------- Miniaturas das evidências (64×48)
function thumb(name, drawFn) {
  const c = new Canvas(64, 48, "transparent");
  drawFn(c);
  c.savePng(`${OUT}/ev-${name}.png`);
}

function evidenceThumbs() {
  thumb("oficio", (c) => {
    c.box(16, 2, 32, 44, "paper");
    c.hline(20, 7, 24, "ink");
    for (let k = 0; k < 6; k++) c.hline(20, 12 + k * 4, 24 - (k % 3) * 4, "wallDark");
    c.box(30, 34, 15, 8, "paper", "violet");
    c.hline(32, 38, 11, "violet");
  });
  thumb("recibo", (c) => {
    c.box(8, 10, 48, 28, "lamp");
    c.rect(9, 11, 46, 2, "red");
    c.text(11, 15, "RECIBO", "ink");
    for (let k = 0; k < 3; k++) c.hline(11, 23 + k * 4, 30, "wallDark");
    c.box(44, 24, 9, 11, "green", "paper");
  });
  thumb("visitas", (c) => {
    c.box(4, 6, 56, 36, "paper");
    c.vline(32, 6, 36, "paperShade");
    for (let k = 0; k < 6; k++) c.hline(5, 11 + k * 5, 54, "paperShade");
    for (let k = 0; k < 5; k++) {
      c.hline(8, 9 + k * 5, 10, "carbon");
      c.hline(36, 9 + k * 5, 16 - (k % 2) * 5, "carbon");
    }
  });
  thumb("bilhete", (c) => {
    c.box(10, 8, 44, 32, "paper");
    for (let k = 0; k < 4; k++) for (let x = 14; x < 48 - k * 5; x += 3) c.set(x, 14 + k * 5 + (x % 2), "carbon");
    c.text(44, 33, "O.", "carbon");
  });
  thumb("croqui", (c) => {
    c.line(8, 34, 24, 24, "carbon");
    c.line(24, 24, 40, 30, "carbon");
    c.line(40, 30, 56, 14, "carbon");
    for (let x = 10; x < 54; x += 3) c.set(x, 10 + Math.floor((x - 10) / 2), "ink");
    c.disc(18, 16, 2, "wallDark");
  });
  thumb("ata", (c) => {
    c.box(14, 2, 36, 44, "paper");
    c.vline(19, 3, 42, "redLight");
    for (let k = 0; k < 7; k++) c.hline(22, 7 + k * 4, 24 - (k % 2) * 4, "wallDark");
    c.line(22, 40, 30, 38, "carbon");
    c.line(34, 40, 44, 37, "carbon");
  });
  thumb("jornal", (c) => {
    c.box(4, 4, 56, 40, "paperShade");
    c.text(8, 7, "SERENENSE", "ink");
    c.hline(7, 13, 50, "ink");
    for (let col = 0; col < 3; col++) for (let k = 0; k < 6; k++) c.hline(8 + col * 17, 17 + k * 4, 14, "wallDark");
  });
}

// ---------------------------------------------------------------- Tela inicial (320×200)
function title() {
  const c = new Canvas(320, 200, "night");
  // céu com estrelas
  c.dither(0, 0, 320, 70, "night", "nightLight");
  c.rect(0, 0, 320, 40, "night");
  for (const [x, y] of [[20, 12], [64, 30], [140, 8], [210, 22], [260, 10], [300, 34], [95, 50], [180, 44]]) c.set(x, y, "paper");
  c.disc(270, 26, 9, "lamp");
  c.disc(274, 23, 8, "night");
  // prédio do arquivo
  c.box(70, 60, 180, 120, "wallDark");
  c.speckle(71, 61, 178, 118, "wall", 6);
  c.rect(60, 54, 200, 8, "woodDark");
  c.hline(60, 54, 200, "ink");
  c.box(110, 66, 100, 14, "woodDark");
  c.text(126, 70, "ARQUIVO MUNICIPAL", "manila");
  // janelas: uma acesa
  const windows = [[86, 92], [126, 92], [174, 92], [214, 92], [86, 134], [214, 134]];
  windows.forEach(([x, y], i) => {
    c.box(x, y, 22, 28, i === 1 ? "lamp" : "night");
    c.vline(x + 11, y + 1, 26, "ink");
    c.hline(x + 1, y + 13, 20, "ink");
    if (i === 1) {
      c.rect(x + 3, y + 18, 7, 9, "woodLight"); // silhueta de estante
      c.rect(x + 13, y + 6, 6, 4, "green"); // luminária
    }
  });
  // porta
  c.box(146, 140, 28, 40, "wood");
  c.vline(160, 141, 38, "woodDark");
  c.set(156, 160, "manila");
  c.set(164, 160, "manila");
  c.rect(140, 178, 40, 4, "khaki");
  // chão / rua
  c.rect(0, 180, 320, 20, "nightLight");
  c.dither(0, 182, 320, 18, "nightLight", "night");
  // poste
  c.rect(36, 110, 3, 72, "ink");
  c.box(31, 102, 13, 9, "lamp");
  // luz do poste no chão
  for (let x = 14; x < 62; x += 2) c.set(x, 186 + ((x / 2) % 2), "lamp");
  c.savePng("public/art/title.png");
}

salaLeitura();
arquivo();
cover();
evidenceThumbs();
title();
console.log("Arte gerada.");
