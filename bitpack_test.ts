import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import {
  base38encode,
  base38encodeChunk
} from "./main.ts";

function reverseBytes(number: bigint, count: number) {
  let result = 0n;
  while (count) {
    result = number & 0xffn | (result << 8n);
    number = number >> 8n;
    count--;
  }

  return result;
}

function packBits(
  version: bigint,
  vendorId: bigint,
  productId: bigint,
  flow: bigint,
  discovery: bigint,
  discriminator: bigint,
  passcode: bigint,
) {
  let packed = version;
  packed = vendorId << 3n | packed;
  packed = productId << 19n | packed;
  packed = flow << 35n | packed;
  packed = discovery << 37n | packed;
  packed = discriminator << 45n | packed;
  packed = passcode << 57n | packed;
  return packed;
}

describe("bitpacking", () => {
  it("vendor", () => {
    const result = 0x3333n << 3n | 0b000n;
    expect(result.toString(16)).toBe("19998");
    expect(result.toString(2)).toBe("11001100110011000");
  });
  it("product", () => {
    const result = 0xccccn << 19n | 0x19998n;
    expect(result.toString(16)).toBe("666619998");
    expect(result.toString(2)).toBe("11001100110011000011001100110011000");
  });
  it("flow", () => {
    const result = 0b00n << 35n | 0x666619998n;
    expect(result.toString(16)).toBe("666619998");
    expect(result.toString(2)).toBe("11001100110011000011001100110011000");
  });
  it("discovery", () => {
    const result = 0b00000000n << 37n | 0x666619998n;
    expect(result.toString(16)).toBe("666619998");
    expect(result.toString(2)).toBe("11001100110011000011001100110011000");
  });
  it("discriminator", () => {
    const result = 0x669n << 45n | 0x666619998n;
    expect(result.toString(16)).toBe("cd200666619998");
    expect(result.toString(2)).toBe("11001101001000000000011001100110011000011001100110011000");
  });
  it("passcode", () => {
    const result = 0x3ffffffn << 57n | 0xcd200666619998n;
    expect(result.toString(16)).toBe("7fffffecd200666619998");
    expect(result.toString(2)).toBe("11111111111111111111111111011001101001000000000011001100110011000011001100110011000");
  });
  it("packs test bits", () => {
    const result = packBits(0b0n, 0x3333n, 0xccccn, 0n, 0n, 0x669n, 0x3ffffffn);
    expect(result.toString(16)).toBe("7fffffecd200666619998");
    expect(result.toString(2)).toBe("11111111111111111111111111011001101001000000000011001100110011000011001100110011000");
    expect(result.toString(2).length).toBe(83);
    let reversed = reverseBytes(result, 11);
    expect(reversed.toString(16)).toBe("989961660620cdfeffff07");
  });
  it("packs food bits", () => {
    const result = packBits(0n, 0xF00Dn, 0xCAFEn, 0n, 0b00000000n, 0xF00n, 20202021n);
    expect(result.toString(16)).toBe("268844be0000657f78068");
    expect(result.toString(2)).toBe("1001101000100001000100101111100000000000000000011001010111111101111000000001101000");
    expect(result.toString(2).length).toBe(82);
    let reversed = reverseBytes(result, 11);
    expect(reversed.toString(16)).toBe("6880f7570600e04b846802");
  });
  it("encodes", () => {
    const result = packBits(0n, 0xF00Dn, 0xCAFEn, 0n, 0b00000000n, 0xF00n, 20202021n);
    let reversed = reverseBytes(result, 11);
    reversed = reversed >> 64n & 0xffffffn;
    expect(reversed).toBe(0x6880f7n);
    let number = ((reversed & 0xffn) << 16n) | ((reversed >> 16n) & 0xffn) | (reversed & 0xff00n)
    expect(number).toBe(0xf78068n);
    expect(base38encodeChunk(number)).toBe("2XMT7");
  })
  it("encodes as well", () => {
    const result = packBits(0n, 0xF00Dn, 0xCAFEn, 0n, 0b00000000n, 0xF00n, 20202021n);
    expect(result).toBe(0x268844be0000657f78068n);
    let payload = base38encode(result);
    expect(payload).toBe("2XMT7R4100KA0648G00");
  })
});
