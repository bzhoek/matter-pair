import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";

function appendReversed(number: bigint, append: bigint, count: number) {
  while (count) {
    number = (number << 1n) | (append & 1n);
    append = append >> 1n;
    count--;
  }

  return number;
}

describe("bitpacking", () => {
  it("version", () => {
    const result = appendReversed(0n, 0b011n, 3);
    expect(result).toBe(0b110n);
  });
  it("vendor", () => {
    const result = appendReversed(0b110n, 0x3333n,16);
    expect(result.toString(16)).toBe("6cccc");
    expect(result.toString(2)).toBe("1101100110011001100");
  });
  it("product", () => {
    const result = appendReversed(0x6ccccn, 0xccccn,16);
    expect(result.toString(16)).toBe("6cccc3333");
  });
  it("flow", () => {
    const result = appendReversed(0x6cccc3333n, 0n,2);
    expect(result.toString(2)).toBe("1101100110011001100001100110011001100");
    expect(result.toString(16)).toBe("1b3330cccc");
  });
  it("discovery", () => {
    const result = appendReversed(0x1b3330ccccn, 0n,8);
    expect(result.toString(2)).toBe("110110011001100110000110011001100110000000000");
    expect(result.toString(16)).toBe("1b3330cccc00");
  });
  it("discriminator", () => {
    const result = appendReversed(0x1b3330cccc00n, 0x699n,12);
    expect(result.toString(2)).toBe("110110011001100110000110011001100110000000000100110010110");
    expect(result.toString(16)).toBe("1b3330cccc00996");
  });
  it("passcode", () => {
    const result = appendReversed(0x1b3330cccc00996n, 0x5ffffffn,27);
    expect(result.toString(2)).toBe("110110011001100110000110011001100110000000000100110010110111111111111111111111111101");
    expect(result.toString(16)).toBe("d99986666004cb7fffffd");
  });
  it("padding", () => {
    const result = appendReversed(0xd99986666004cb7fffffdn, 0x0n,4);
    expect(result.toString(2)).toBe("1101100110011001100001100110011001100000000001001100101101111111111111111111111111010000");
    expect(result.toString(2).length).toBe(88);
    expect(result.toString(16)).toBe("d99986666004cb7fffffd0");
  });
});
