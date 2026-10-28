import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Garante contraste WCAG AA dos pares de tokens usados para texto, nos modos claro e escuro.
const css = await readFile(path.join(process.cwd(), "app/globals.css"), "utf8");

// Um tema só (noir): lê os tokens do :root e resolve var(--outro) até chegar num hex.
function tokens(block: string): Record<string, string> {
  const raw = Object.fromEntries([...block.matchAll(/--([a-z0-9-]+):\s*([^;]+);/gi)].map((m) => [m[1], m[2].trim()]));
  const resolve = (v: string, depth = 0): string | undefined => {
    if (/^#[0-9a-f]{6}$/i.test(v)) return v;
    const ref = v.match(/^var\(--([a-z0-9-]+)\)$/i);
    return ref && depth < 5 && raw[ref[1]] ? resolve(raw[ref[1]], depth + 1) : undefined;
  };
  return Object.fromEntries(Object.entries(raw).flatMap(([k, v]) => (resolve(v) ? [[k, resolve(v)!]] : [])));
}
const root = tokens(css.slice(css.indexOf(":root {"), css.indexOf("@theme")));

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// [texto, fundo, mínimo]
const pairs: [string, string, number][] = [
  ["ink", "paper-0", 4.5],
  ["ink", "paper-1", 4.5],
  ["ink", "paper-2", 4.5],
  ["paper-5", "paper-0", 4.5],
  ["paper-5", "paper-1", 4.5],
  ["graphite", "paper-0", 4.5],
  ["ribbon", "paper-0", 4.5],
  ["ribbon", "paper-1", 4.5],
  ["carbon", "paper-0", 4.5],
  ["carbon", "paper-1", 4.5],
  ["stamp", "paper-0", 4.5],
  ["stamp", "paper-1", 4.5],
  ["ink", "manila", 4.5],
  ["on-wood", "wood", 4.5],
  ["on-wood", "wood-light", 4.5],
  ["paper-4", "paper-0", 3], // bordas de controles (componente não textual)
  ["bone", "night-1", 4.5],
  ["bone", "night-3", 4.5],
  ["mist", "night-2", 4.5],
  ["bone", "blood", 4.5], // botão principal
  ["ink", "amber", 4.5], // botão âmbar, estrelas e escolha
  ["paper-0", "stone", 4.5],
  ["amber", "night-1", 4.5], // pontos e destaques sobre a noite
];

describe.each([["noir", root]])("contraste no tema %s", (_, t) => {
  it.each(pairs)("%s sobre %s ≥ %s", (fg, bg, min) => {
    expect(t[fg], `token ${fg}`).toBeDefined();
    expect(t[bg], `token ${bg}`).toBeDefined();
    expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(min);
  });
});
