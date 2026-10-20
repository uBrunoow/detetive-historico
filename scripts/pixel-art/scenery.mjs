// Peças de cenário compartilhadas pelos scripts de arte dos casos.
export const BOOK_COLORS = ["red", "green", "manila", "violet", "woodLight", "khaki", "redLight", "greenLight"];

export function wall(c, h, base = "wall") {
  c.rect(0, 0, c.w, h, base);
  c.speckle(0, 0, c.w, h, "wallDark", 6);
}

export function floorBoards(c, y) {
  c.rect(0, y, c.w, c.h - y, "wood");
  for (let row = y; row < c.h; row += 8) {
    c.hline(0, row, c.w, "woodDark");
    const off = ((row - y) / 8) % 2 ? 20 : 0;
    for (let x = off; x < c.w; x += 40) c.vline(x, row, 8, "woodDark");
  }
  c.dither(0, y + 1, c.w, 2, "woodDark", "wood");
}

export function wainscot(c, y, h) {
  c.rect(0, y, c.w, h, "woodLight");
  c.hline(0, y, c.w, "ink");
  c.hline(0, y + 1, c.w, "manila");
  for (let x = 6; x < c.w; x += 26) c.box(x, y + 4, 20, h - 6, "wood", "woodDark");
}

/** Fileira de lombadas de livros entre x0 e x1, com o topo variando. */
export function books(c, x0, x1, yBottom, hMax, seed = 1, gap = null) {
  let x = x0;
  let i = seed;
  while (x < x1) {
    const w = 4 + ((i * 7) % 4);
    if (x + w > x1) break;
    if (gap && x + w > gap[0] && x < gap[1]) {
      x = gap[1];
      continue;
    }
    const h = hMax - ((i * 5) % 6);
    const color = BOOK_COLORS[i % BOOK_COLORS.length];
    c.box(x, yBottom - h, w, h, color);
    c.hline(x + 1, yBottom - h + 3, w - 2, "lamp");
    if (i % 3 === 0) c.hline(x + 1, yBottom - 4, w - 2, "manila");
    x += w;
    i++;
  }
}

/** Luz da luminária: clareia as cores em faixas (luz "em degraus"), sem cobrir objetos. */
export function lampLight(c, cx, cy, r) {
  const P = {
    wallDark: "#5d6659", wall: "#8e9786", wallLight: "#b9bfb0", warm: "#d6d2b4",
    wood: "#5a3a22", woodLight: "#8a5a32", woodDark: "#3a2618", lampWood: "#a8743e",
  };
  const shift = {
    [P.wallDark]: [P.wall, P.wallLight],
    [P.wall]: [P.wallLight, P.warm],
    [P.wallLight]: [P.warm, P.warm],
    [P.woodDark]: [P.wood, P.wood],
    [P.wood]: [P.woodLight, P.woodLight],
    [P.woodLight]: [P.woodLight, P.lampWood],
  };
  const out = c.px.slice();
  for (let y = Math.max(0, cy - r); y < Math.min(c.h, cy + r); y++)
    for (let x = Math.max(0, cx - r); x < Math.min(c.w, cx + r); x++) {
      const d = Math.hypot(x - cx, (y - cy) * 1.15) / r;
      if (d > 1) continue;
      const cur = c.px[y * c.w + x];
      const s = shift[cur];
      if (!s) continue;
      // borda da luz pontilhada, miolo cheio
      if (d < 0.5) out[y * c.w + x] = s[1];
      else if (d < 0.78 || (x + y) % 2 === 0) out[y * c.w + x] = s[0];
    }
  c.px = out;
}
