import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { decode, encode, freshState } from "@/lib/game/signed-state";

describe("estado assinado", () => {
  it("lê de volta o que assinou", () => {
    const s = { ...freshState("demo"), epochChoice: 3, checksUsed: 1 };
    expect(decode(encode(s), "demo")).toEqual(s);
  });

  it("recusa estado adulterado, de outro caso ou malformado", () => {
    const token = encode({ ...freshState("demo"), checksUsed: 4 });
    const [, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ ...freshState("demo"), checksUsed: 0 })).toString("base64url");
    expect(decode(`${forged}.${sig}`, "demo")).toBeNull();
    expect(decode(token, "outro")).toBeNull();
    expect(decode("lixo", "demo")).toBeNull();
  });

  const signV1 = (state: object) => {
    const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
    const secret = process.env.GAME_SECRET && process.env.GAME_SECRET !== "troque-por-um-valor-aleatorio" ? process.env.GAME_SECRET : "detetive-historico-segredo-de-desenvolvimento";
    return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
  };

  it("tokens das versões antigas (v1 e v2) recomeçam o caso do zero", () => {
    expect(decode(signV1({ v: 1, slug: "demo", checksUsed: 1, attemptsUsed: 1, outcome: "solved" }), "demo")).toBeNull();
    expect(decode(signV1({ ...freshState("demo"), v: 2, choicesUsed: 1 }), "demo")).toBeNull();
  });
});
