// Motor mínimo de pixel art: desenha numa grade de pixels com paleta fixa e grava PNG.
// Sem dependências: usa zlib do Node. As imagens do jogo são geradas por scripts
// (ver demo-biblioteca.mjs), para que sejam reproduzíveis e fáceis de ajustar.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { deflateSync } from "node:zlib";

/** Paleta do jogo (repartição à luz de luminária). Índice → cor. */
export const PALETTE = {
  ink: "#1a1210", // contorno
  woodDark: "#3a2618",
  wood: "#5a3a22",
  woodLight: "#8a5a32",
  manila: "#c9a25a",
  lamp: "#f0d9a0",
  paper: "#f4f2ea",
  paperShade: "#d9d4c4",
  wallLight: "#b9bfb0",
  wall: "#8e9786",
  wallDark: "#5d6659",
  green: "#2f4a3a",
  greenLight: "#4f7a5e",
  red: "#7a2e2a",
  redLight: "#c0574f",
  violet: "#4a3d8f",
  violetLight: "#7d6cc4",
  carbon: "#2f3f9e",
  khaki: "#8d8a76",
  night: "#141a2b",
  nightLight: "#25304a",
  skin: "#c9a27e",
  transparent: null,
};

function hexToRgba(hex) {
  if (!hex) return [0, 0, 0, 0];
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
}

export class Canvas {
  constructor(w, h, bg = "transparent") {
    this.w = w;
    this.h = h;
    this.px = new Array(w * h).fill(PALETTE[bg] ?? null);
  }

  set(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.px[y * this.w + x] = c === "transparent" ? null : (PALETTE[c] ?? c);
  }

  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
    return this;
  }

  /** Retângulo com contorno de 1 px. */
  box(x, y, w, h, fill, outline = "ink") {
    this.rect(x, y, w, h, outline);
    if (w > 2 && h > 2) this.rect(x + 1, y + 1, w - 2, h - 2, fill);
    return this;
  }

  /** Pontilhado em xadrez entre duas cores (sombra e meio-tom). */
  dither(x, y, w, h, a, b) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, (x + i + y + j) % 2 ? a : b);
    return this;
  }

  /** Pontilhado esparso (1 em 4): textura de parede, poeira. */
  speckle(x, y, w, h, c, step = 4) {
    const half = Math.floor(step / 2);
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        const X = x + i,
          Y = y + j;
        const a = X % step === 0 && Y % step === 0;
        const b = (X + half) % step === 0 && (Y + half) % step === 0;
        if (a || b) this.set(X, Y, c);
      }
    return this;
  }

  hline(x, y, w, c) {
    return this.rect(x, y, w, 1, c);
  }

  vline(x, y, h, c) {
    return this.rect(x, y, 1, h, c);
  }

  line(x0, y0, x1, y1, c) {
    const dx = Math.abs(x1 - x0),
      dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1,
      sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
    return this;
  }

  disc(cx, cy, r, c) {
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r * 0.6) this.set(cx + i, cy + j, c);
    return this;
  }

  ring(cx, cy, r, c) {
    for (let j = -r; j <= r; j++)
      for (let i = -r; i <= r; i++) {
        const d = i * i + j * j;
        if (d <= r * r + r * 0.6 && d >= (r - 1) * (r - 1) + (r - 1) * 0.6) this.set(cx + i, cy + j, c);
      }
    return this;
  }

  /** Texto com a fonte 3×5 (maiúsculas, dígitos e alguns sinais). */
  text(x, y, str, c) {
    let cx = x;
    for (const ch of str.toUpperCase()) {
      const g = FONT[ch] ?? FONT["?"];
      for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (g[j][i] === "#") this.set(cx + i, y + j, c);
      cx += 4;
    }
    return this;
  }

  textWidth(str) {
    return str.length * 4 - 1;
  }

  /** Copia outra tela (sprites), ignorando pixels transparentes. */
  draw(sprite, x, y) {
    for (let j = 0; j < sprite.h; j++)
      for (let i = 0; i < sprite.w; i++) {
        const p = sprite.px[j * sprite.w + i];
        if (p) this.set(x + i, y + j, p);
      }
    return this;
  }

  savePng(path) {
    mkdirSync(dirname(path), { recursive: true });
    const raw = Buffer.alloc((this.w * 4 + 1) * this.h);
    for (let y = 0; y < this.h; y++) {
      raw[y * (this.w * 4 + 1)] = 0;
      for (let x = 0; x < this.w; x++) {
        const [r, g, b, a] = hexToRgba(this.px[y * this.w + x]);
        const o = y * (this.w * 4 + 1) + 1 + x * 4;
        raw[o] = r;
        raw[o + 1] = g;
        raw[o + 2] = b;
        raw[o + 3] = a;
      }
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.w, 0);
    ihdr.writeUInt32BE(this.h, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    writeFileSync(
      path,
      Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk("IHDR", ihdr),
        chunk("IDAT", deflateSync(raw, { level: 9 })),
        chunk("IEND", Buffer.alloc(0)),
      ]),
    );
  }
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

// Fonte 3×5 para letreiros dentro das ilustrações.
const F = (s) => s.split("|");
const FONT = {
  A: F(".#.|#.#|###|#.#|#.#"), B: F("##.|#.#|##.|#.#|##."), C: F(".##|#..|#..|#..|.##"), D: F("##.|#.#|#.#|#.#|##."),
  E: F("###|#..|##.|#..|###"), F: F("###|#..|##.|#..|#.."), G: F(".##|#..|#.#|#.#|.##"), H: F("#.#|#.#|###|#.#|#.#"),
  I: F("###|.#.|.#.|.#.|###"), J: F("..#|..#|..#|#.#|.#."), K: F("#.#|#.#|##.|#.#|#.#"), L: F("#..|#..|#..|#..|###"),
  M: F("#.#|###|###|#.#|#.#"), N: F("##.|#.#|#.#|#.#|#.#"), O: F(".#.|#.#|#.#|#.#|.#."), P: F("##.|#.#|##.|#..|#.."),
  Q: F(".#.|#.#|#.#|##.|.##"), R: F("##.|#.#|##.|#.#|#.#"), S: F(".##|#..|.#.|..#|##."), T: F("###|.#.|.#.|.#.|.#."),
  U: F("#.#|#.#|#.#|#.#|###"), V: F("#.#|#.#|#.#|#.#|.#."), W: F("#.#|#.#|###|###|#.#"), X: F("#.#|#.#|.#.|#.#|#.#"),
  Y: F("#.#|#.#|.#.|.#.|.#."), Z: F("###|..#|.#.|#..|###"), Ç: F(".##|#..|#..|.##|.#."), Ã: F("##.|.#.|#.#|###|#.#"),
  Á: F("..#|.#.|#.#|###|#.#"), É: F("..#|###|##.|#..|###"), Ó: F("..#|.#.|#.#|#.#|.#."), Í: F("..#|###|.#.|.#.|###"),
  0: F("###|#.#|#.#|#.#|###"), 1: F(".#.|##.|.#.|.#.|###"), 2: F("##.|..#|.#.|#..|###"), 3: F("##.|..#|.#.|..#|##."),
  4: F("#.#|#.#|###|..#|..#"), 5: F("###|#..|##.|..#|##."), 6: F(".##|#..|###|#.#|###"), 7: F("###|..#|.#.|.#.|.#."),
  8: F("###|#.#|###|#.#|###"), 9: F("###|#.#|###|..#|##."), " ": F("...|...|...|...|..."), ".": F("...|...|...|...|.#."),
  "-": F("...|...|###|...|..."), "/": F("..#|..#|.#.|#..|#.."), ":": F("...|.#.|...|.#.|..."), "?": F("##.|..#|.#.|...|.#."),
};
