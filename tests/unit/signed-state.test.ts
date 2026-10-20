import { describe, expect, it } from "vitest";
import { decode, encode, freshState } from "@/lib/game/signed-state";

describe("estado assinado", () => {
  it("lê de volta o que assinou", () => {
    const s = { ...freshState("demo"), attemptsUsed: 2, checksUsed: 1 };
    expect(decode(encode(s), "demo")).toEqual(s);
  });

  it("recusa estado adulterado, de outro caso ou malformado", () => {
    const token = encode({ ...freshState("demo"), attemptsUsed: 4 });
    const [, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ ...freshState("demo"), attemptsUsed: 0 })).toString("base64url");
    expect(decode(`${forged}.${sig}`, "demo")).toBeNull();
    expect(decode(token, "outro")).toBeNull();
    expect(decode("lixo", "demo")).toBeNull();
  });
});
