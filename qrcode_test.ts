import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import QRCode from "npm:qrcode";
import { base38encode, packPayloadBits } from "./main.ts";

describe("qr coding", () => {
  it("food", () => {
    const packed = packPayloadBits(
      0n,
      0xF00Dn,
      0xCAFEn,
      0n,
      0b00000000n,
      0xF00n,
      20202021n,
    );
    const payload = base38encode(packed);
    expect(payload).toBe("2XMT7R4100KA0648G00");
    QRCode.toString(`MT:${payload}`, { type: "terminal" }).then(
      (qr: string) => {
        console.log(qr);
      },
    );
  });
});
