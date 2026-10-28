/** Pure rules for the six-piece evidence puzzle. */
export function shuffle(n: number, seed: number): number[] {
  const result = Array.from({ length: Math.max(0, n) }, (_, index) => index);
  let value = Math.abs(Math.trunc(seed)) || 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    value = (value * 1664525 + 1013904223) >>> 0;
    const other = value % (index + 1);
    [result[index], result[other]] = [result[other], result[index]];
  }
  if (result.every((item, index) => item === index) && result.length > 1) {
    [result[0], result[1]] = [result[1], result[0]];
  }
  return result;
}

export function swap(order: number[], a: number, b: number): number[] {
  if (a === b || order[a] === undefined || order[b] === undefined) return [...order];
  const next = [...order];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

export function isSolved(order: number[]): boolean {
  return order.every((piece, index) => piece === index);
}

export function correctCount(order: number[]): number {
  return order.reduce((total, piece, index) => total + (piece === index ? 1 : 0), 0);
}
