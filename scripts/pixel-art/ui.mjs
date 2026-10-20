// Ícones de interface em pixel (16×16) e o cursor de lupa.
// Uso: node scripts/pixel-art/ui.mjs
import { Canvas } from "./engine.mjs";

const OUT = "public/art/ui";

/** Desenha a partir de um mapa de caracteres: cada letra é uma cor da paleta. */
function sprite(name, rows, colors, size = 16) {
  const c = new Canvas(size, size, "transparent");
  rows.forEach((row, y) => [...row].forEach((ch, x) => colors[ch] && c.set(x, y, colors[ch])));
  c.savePng(`${OUT}/${name}.png`);
}

const base = { k: "ink", p: "paper", s: "paperShade", m: "manila", w: "wood", l: "woodLight", c: "carbon", v: "violet", V: "violetLight", r: "red", R: "redLight", g: "green", G: "greenLight", y: "lamp", n: "nightLight" };

sprite("lupa", [
  "................",
  "....kkkkk.......",
  "...kpppppk......",
  "..kpcccppyk.....",
  ".kpccppppppk....",
  ".kpcpppppppk....",
  ".kpppppppppk....",
  ".kpppppppppk....",
  "..kpppppppk.....",
  "...kpppppkk.....",
  "....kkkkkwwk....",
  "..........kwwk..",
  "...........kwwk.",
  "............kwwk",
  ".............kk.",
  "................",
], base);

sprite("pasta", [
  "................",
  "................",
  ".kkkkk..........",
  ".kmmmmk.........",
  ".kmmmmmkkkkkkkk.",
  ".kmmmmmmmmmmmmk.",
  ".kmppppppppppmk.",
  ".kmpsssssssspmk.",
  ".kmppppppppppmk.",
  ".kmpsssssssspmk.",
  ".kmmmmmmmmmmmmk.",
  ".kmmmmmmmmmmmmk.",
  ".kmmmmmmmmmmmmk.",
  ".kkkkkkkkkkkkkk.",
  "................",
  "................",
], base);

sprite("regua", [
  "................",
  "................",
  "................",
  "..kk....kk....k.",
  ".kppk..kppk..kp.",
  ".kppk..kppk..kp.",
  "..kk....kk....k.",
  "..k......k....k.",
  "kkkkkkkkkkkkkkkk",
  "kllllllllllllllk",
  "klkllklllkllklk.",
  "klkllllklllllklk",
  "kllllllllllllllk",
  "kkkkkkkkkkkkkkkk",
  "................",
  "................",
], base);

sprite("pena", [
  "................",
  "............kk..",
  "...........kpk..",
  "..........kppk..",
  ".........kpsk...",
  "........kpspk...",
  ".......kpspk....",
  "......kpspk.....",
  ".....kpspk......",
  "....kpspk.......",
  "....kppk........",
  "...kkkk.........",
  "...kk...........",
  "..k...cccccccc..",
  ".k..............",
  "................",
], base);

// Medalhas (16×16): arquivista (caixa de arquivo), cronista (relógio), detetive (lupa com estrela).
sprite("medalha-arquivista", [
  "................",
  ".....kkkkkk.....",
  "....kyyyyyyk....",
  "...kyykkkkyyk...",
  "..kyykmmmmkyyk..",
  "..kykmmmmmmkyk..",
  "..kykmkkkkmkyk..",
  "..kykmmmmmmkyk..",
  "..kykmmmmmmkyk..",
  "..kyykkkkkkyyk..",
  "...kyyyyyyyyk...",
  "....kkyyyykk....",
  ".....krrrrk.....",
  "....krrkkrrk....",
  "....kkk..kkk....",
  "................",
], base);

sprite("medalha-cronista", [
  "................",
  ".....kkkkkk.....",
  "....kyyyyyyk....",
  "...kyykkkkyyk...",
  "..kyykppppkyyk..",
  "..kykppkppppkyk.",
  "..kykppkppppkyk.",
  "..kykppkkkppkyk.",
  "..kykppppppkyk..",
  "..kyykppppkyyk..",
  "...kyykkkkyyk...",
  "....kkyyyykk....",
  ".....kggggk.....",
  "....kggkkggk....",
  "....kkk..kkk....",
  "................",
], base);

sprite("medalha-detetive", [
  "................",
  ".....kkkkkk.....",
  "....kyyyyyyk....",
  "...kyyyvyyyyk...",
  "..kyyyvVvyyyyk..",
  "..kyvvVVVvvyyk..",
  "..kyykVVVkyyyk..",
  "..kyyvVkVvyyyk..",
  "..kyvkyyykvyyk..",
  "..kyyyyyyyyyyk..",
  "...kyyyyyyyyk...",
  "....kkyyyykk....",
  ".....kvvvvk.....",
  "....kvvkkvvk....",
  "....kkk..kkk....",
  "................",
], base);

// Cursor de lupa 32×32 (o ponto quente fica no centro da lente: 12,12).
{
  const c = new Canvas(32, 32, "transparent");
  c.disc(12, 12, 9, "ink");
  c.disc(12, 12, 7, "paper");
  c.dither(7, 7, 11, 11, "paper", "paperShade");
  c.set(8, 9, "lamp");
  c.set(9, 8, "lamp");
  for (let i = 0; i < 9; i++) {
    c.rect(18 + i, 18 + i, 3, 3, "ink");
    c.set(19 + i, 19 + i, "woodLight");
  }
  c.savePng(`${OUT}/cursor-lupa.png`);
}

console.log("Ícones gerados.");
