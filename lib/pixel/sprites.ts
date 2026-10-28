/**
 * Sprites do noir 16-bit (mockup aprovado em 28/10/2026). Cada letra é uma cor da paleta e
 * cada string é uma linha de pixels; "." é transparente. Arte original, desenhada aqui.
 */
export const PALETTE: Record<string, string> = {
  k: "#120c18", // contorno
  h: "#4a3a5c", // chapéu
  H: "#33283f", // sombra da aba
  b: "#a3202e", // fita do chapéu, gravata
  s: "#e8b896", // pele
  S: "#c48f6c",
  e: "#120c18", // olhos
  c: "#8c6a44", // sobretudo
  C: "#5e4630",
  w: "#e9e0cc", // camisa
  g: "#bfe9ff", // lente
  y: "#e8a93a", // ouro, âmbar
  Y: "#ffd27a",
  o: "#9c6618",
  p: "#2b2338", // calça
  r: "#a3202e",
  R: "#c8323c",
  t: "#1a1530", // silhuetas
  T: "#120e24",
  n: "#3a2a24", // madeira escura
  N: "#4d382e",
  B: "#2a2436", // pedra
  m: "#1e1a2a",
  q: "#ffd27a", // janela acesa
  Q: "#3a3456",
  f: "#8e86b0", // nuvem, neblina
  F: "#6b6390",
  l: "#f1e6c8", // lua
  L: "#cdbf9b",
};

export type Rows = readonly string[];

export const detective: Rows = [
  "......kkkkkk........",
  ".....khhhhhhk.......",
  ".....khhhhhhk.......",
  ".....kbbbbbbk.......",
  "...kkhhhhhhhhkk.....",
  "...kkkkkkkkkkkk.....",
  ".....kHHHHHHk.......",
  ".....ksessesk.......",
  ".....kssssssk..kkk..",
  "......kSSSSk..kgwgk.",
  "....kkcwbbwckkkggwk.",
  "...kcccwbbwccckkkk..",
  "...kcCcwwwwcCcss....",
  "...kcCccyyccCck.....",
  "...kcCccccccCck.....",
  "...kcCccccccCck.....",
  "...kCCcCCCCcCCk.....",
  "....kpppkpppk.......",
  "...kkkkk.kkkkk......",
  "..kkkkkk.kkkkkk.....",
];

export const face: Rows = [
  "...kkkkkkkk...",
  "..khhhhhhhhk..",
  "..kbbbbbbbbk..",
  "kkhhhhhhhhhhkk",
  ".kkkkkkkkkkkk.",
  "..kHHHHHHHHk..",
  "..ksesssessk..",
  "..ksssssssSk..",
  "..ksssSSsssk..",
  "...kSssssSk...",
  "....kSSSSk....",
  "..kccwbbwcck..",
  ".kcCcwbbwcCck.",
  ".kcCcwwwwcCck.",
];

export const coin: Rows = ["..kkkk..", ".kyYYyk.", "kyYyyoyk", "kyYyyoyk", "kyYyyoyk", "kyYyyoyk", ".kyooyk.", "..kkkk.."];

export const moon: Rows = [
  "....lllll...",
  "..llllll....",
  ".lllLll.....",
  ".llll.......",
  "lllL........",
  "llll........",
  "llll........",
  "lllL........",
  "lllll.......",
  ".llllL......",
  ".lllllll....",
  "..llllllll..",
  "....lllll...",
];

export const star: Rows = [
  "......kk......",
  ".....kyyk.....",
  ".....kyyk.....",
  "....kyYyyk....",
  "kkkkkyYyykkkkk",
  "kyyyyYYyyyyyyk",
  ".kyyyYyyyyyok.",
  "..kyyyyyyyok..",
  "...kyyyyyok...",
  "...kyyokyyok..",
  "..kyyok.kyyok.",
  "..kyok...kyok.",
  ".kkk.......kkk",
];

export const cloud: Rows = [
  "..........fffff...............",
  "........fffffffff.............",
  "...ffff.ffffffffff...ffff.....",
  "..fffffffffffffffffffffffff...",
  ".ffffffffffffffffffffffffffff.",
  "ffffffffffffffffffffffffffffff",
  "FffffffffffffffffffffffffffffF",
  ".FFFFFFffffffffffffffffFFFFF..",
  "....FFFFFFFFFFFFFFFFFFFF......",
];

export const bat: Rows = ["k.........k", "kk..k.k..kk", "kkk.kkk.kkk", ".kkkkkkkkk.", "..kk...kk.."];

export const pin: Rows = ["..kkkk..", ".kRRRrk.", "kRwRRrrk", "kRRRRrrk", ".krrrrk.", "..kkkk..", "...kk...", "...kf...", "...kf...", "....k..."];
export const pinDone: Rows = pin.map((r) => r.replace(/R/g, "Y").replace(/r/g, "y"));

export const lamp: Rows = [
  ".kkkkk.",
  "kqqqqqk",
  "kqYqqqk",
  "kqqqqqk",
  ".kkkkk.",
  "...k...",
  ...Array.from({ length: 18 }, () => "..kmk.."),
  ".kmmmk.",
  "kmmmmmk",
];

export const fog: Rows = (() => {
  const rows: string[] = [];
  for (let y = 0; y < 10; y++) {
    let row = "";
    for (let x = 0; x < 260; x++) {
      const top = 4 + Math.round(2.5 * Math.sin(x / 9) + 1.5 * Math.sin(x / 4.3));
      row += y >= top ? "f" : ".";
    }
    rows.push(row);
  }
  return rows;
})();

export const pines: Rows = (() => {
  const W = 120;
  const H = 34;
  const grid = Array.from({ length: H }, () => Array<string>(W).fill("."));
  for (const [cx, h] of [[8, 30], [20, 24], [30, 33], [44, 20], [58, 28], [72, 22], [86, 31], [100, 18], [112, 26]]) {
    for (let y = 0; y < h; y++) {
      const half = Math.floor((y + 2) / 2.4) + (y % 6 === 5 ? -1 : 0);
      for (let x = cx - half; x <= cx + half; x++) if (x >= 0 && x < W) grid[H - h + y][x] = x < cx ? "T" : "t";
    }
  }
  return grid.map((r) => r.join(""));
})();

type Box = (x0: number, y0: number, x1: number, y1: number, c: string) => void;
const canvas = (w: number, h: number) => {
  const grid = Array.from({ length: h }, () => Array<string>(w).fill("."));
  const box: Box = (x0, y0, x1, y1, c) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y][x] = c;
  };
  return { box, rows: () => grid.map((r) => r.join("")) };
};

/** Prédio do arquivo à noite: pedra escura e uma janela acesa com alguém dentro. */
export const archive: Rows = (() => {
  const { box, rows } = canvas(96, 64);
  box(30, 4, 66, 9, "k");
  box(31, 5, 65, 8, "n");
  box(8, 10, 88, 14, "k");
  box(9, 11, 87, 13, "N");
  box(12, 15, 84, 63, "k");
  box(13, 15, 83, 63, "Q");
  for (let y = 17; y < 63; y += 4) box(13, y, 83, y, "B");
  box(32, 17, 64, 23, "k");
  box(33, 18, 63, 22, "o");
  for (const x of [18, 34, 54, 70]) {
    box(x, 28, x + 8, 38, "k");
    box(x + 1, 29, x + 7, 37, "m");
  }
  box(55, 29, 61, 37, "q");
  box(57, 32, 59, 37, "k");
  box(58, 31, 58, 31, "k");
  box(40, 44, 56, 63, "k");
  box(41, 45, 55, 63, "n");
  box(48, 45, 48, 63, "k");
  box(46, 54, 46, 55, "y");
  box(50, 54, 50, 55, "y");
  for (const x of [18, 70]) {
    box(x, 46, x + 8, 56, "k");
    box(x + 1, 47, x + 7, 55, "m");
  }
  return rows();
})();
/** Janela que acende e apaga no arquivo (classe .win-flicker). */
export const archiveLights = [{ x: 19, y: 47, w: 7, h: 9, color: "#ffd27a", delay: -3 }];

/** Cidade à noite; as janelas acesas piscam em tempos diferentes. Semente fixa: igual no servidor e no cliente. */
export const { skyline, skylineLights } = (() => {
  const W = 160;
  const H = 46;
  const grid = Array.from({ length: H }, () => Array<string>(W).fill("."));
  const lights: { x: number; y: number; w: number; h: number; color: string; delay: number }[] = [];
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  let x = 0;
  while (x < W) {
    const w = 8 + Math.floor(rnd() * 10);
    const h = 12 + Math.floor(rnd() * 30);
    const c = rnd() > 0.5 ? "t" : "T";
    for (let yy = H - h; yy < H; yy++) for (let xx = x; xx < Math.min(W, x + w); xx++) grid[yy][xx] = yy === H - h ? "Q" : c;
    for (let wy = H - h + 3; wy < H - 2; wy += 4)
      for (let wx = x + 2; wx < x + w - 2; wx += 3)
        if (rnd() > 0.72) lights.push({ x: wx, y: wy, w: 1, h: 2, color: rnd() > 0.3 ? "#ffd27a" : "#e8a93a", delay: -Number((rnd() * 9).toFixed(1)) });
    x += w + (rnd() > 0.7 ? 1 : 0);
  }
  return { skyline: grid.map((r) => r.join("")) as Rows, skylineLights: lights };
})();

/** Junta pixels vizinhos da mesma cor em retângulos (menos nós no SVG). */
export function toRects(rows: Rows): { x: number; y: number; w: number; fill: string }[] {
  const out: { x: number; y: number; w: number; fill: string }[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let run = 1;
      while (row[x + run] === ch) run++;
      if (ch !== "." && PALETTE[ch]) out.push({ x, y, w: run, fill: PALETTE[ch] });
      x += run;
    }
  });
  return out;
}

export const SPRITES = { detective, face, coin, moon, star, cloud, bat, pin, pinDone, lamp, fog, pines, archive, skyline } as const;
export type SpriteName = keyof typeof SPRITES;
export const SPRITE_LIGHTS: Partial<Record<SpriteName, typeof archiveLights>> = { archive: archiveLights, skyline: skylineLights };
