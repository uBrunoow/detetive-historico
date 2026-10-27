import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { decode, encode, freshState } from "@/lib/game/signed-state";

describe("estado assinado", () => {
  it("lê de volta o que assinou", () => {
    const s = { ...freshState("demo"), choicesUsed: 2, checksUsed: 1 };
    expect(decode(encode(s), "demo")).toEqual(s);
  });

  it("recusa estado adulterado, de outro caso ou malformado", () => {
    const token = encode({ ...freshState("demo"), choicesUsed: 4 });
    const [, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ ...freshState("demo"), choicesUsed: 0 })).toString("base64url");
    expect(decode(`${forged}.${sig}`, "demo")).toBeNull();
    expect(decode(token, "outro")).toBeNull();
    expect(decode("lixo", "demo")).toBeNull();
  });

  const signV1 = (state: object) => {
    const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
    const secret = process.env.GAME_SECRET && process.env.GAME_SECRET !== "troque-por-um-valor-aleatorio" ? process.env.GAME_SECRET : "detetive-historico-segredo-de-desenvolvimento";
    return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
  };

  it("converte um token v1 resolvido em v2 com resultado oficial", () => {
    const s = decode(signV1({ v: 1, slug: "demo", checksUsed: 1, attemptsUsed: 1, outcome: "solved" }), "demo");
    expect(s).toMatchObject({ v: 2, slug: "demo", checksUsed: 1, choicesUsed: 0, outcome: "solved", practice: false });
    expect(s?.official).toEqual({
      stars: 1,
      points: 500,
      breakdown: { answer: 500, order: 0, justification: 0, epoch: 0, codes: 0, pieces: 0, quiz: 0, checks: 0 },
    });
    expect(s?.puzzles).toEqual(freshState("demo").puzzles);
  });

  it("token v1 sem desfecho vira v2 sem resultado oficial", () => {
    const s = decode(signV1({ v: 1, slug: "demo", checksUsed: 0, attemptsUsed: 1, outcome: null }), "demo");
    expect(s?.official).toBeNull();
    expect(s?.outcome).toBeNull();
  });
});
