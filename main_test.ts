import { assertEquals } from "@std/assert";
import {
  base38encodeChunk,
  generateManualPairingCode,
  generateVerhoeffChecksum
} from "./main.ts";
import { expect } from "jsr:@std/expect/expect";

Deno.test(function generateTest() {
  const passCode = 20202021;
  const discriminator = 3840;
  const pairingCode = generateManualPairingCode(discriminator, passCode);
  assertEquals("3497011233", pairingCode);
});

Deno.test(function checksumTest() {
  const result = generateVerhoeffChecksum("236");
  assertEquals(3, result);
});

// https://github.com/project-chip/connectedhomeip/issues/34567
// version < 8 (3 bits)
// 4-msb of discriminator < 4096 (4 of 12 bits)
// passcode < 134,217,727 (27 bits)
Deno.test(function encodingStepsTest() {
  const passCode = 20202021;
  assertEquals("1001101000100001000100101", passCode.toString(2));
  const discriminator = 3840;
  assertEquals("111100000000", discriminator.toString(2));
  const first = discriminator >> 10;
  assertEquals("11", first.toString(2));
  assertEquals("1100000000", (discriminator & 0x300).toString(2));
  assertEquals("1100000000", (discriminator & 0b1100000000).toString(2));
  assertEquals("1100000000000000", ((discriminator & 0x300) << 6).toString(2));
  assertEquals("1000100101", (passCode & 0x3FFF).toString(2));
  assertEquals("1000100101", (passCode & 0b11111111111111).toString(2));
  const two_to_six = ((discriminator & 0x300) << 6) | (passCode & 0x3FFF);
  assertEquals("1100001000100101", two_to_six.toString(2));
  const seven_to_ten = passCode >> 14;
  assertEquals("10011010001", seven_to_ten.toString(2));
  const pairingCode = first.toString() + two_to_six.toString() + seven_to_ten.toString();
  assertEquals("3497011233", pairingCode);
});

Deno.test(function packedBinaryQrCodeTest() {
  let packed = BigInt(0);
  const vendorId = BigInt(0xF00D);
  packed = (packed << 16n) | vendorId;
  assertEquals("1111000000001101", vendorId.toString(2));
  assertEquals("1111000000001101", packed.toString(2));
  const productId = BigInt(0xCAFE);
  packed = (packed << 16n) | productId;
  assertEquals(                "1100101011111110", productId.toString(2));
  assertEquals("11110000000011011100101011111110", packed.toString(2));
  const commissioning = 0b00n;
  packed = (packed << 2n) | commissioning;
  const discovery = 0b00000000n;
  packed = (packed << 8n) | discovery;
  assertEquals("111100000000110111001010111111100000000000", packed.toString(2));
  const discriminator = 3840n;
  packed = (packed << 12n) | discriminator;
  assertEquals("111100000000110111001010111111100000000000111100000000", packed.toString(2));
  const passCode = 20202021n;
  packed = (packed << 27n) | passCode;
  assertEquals("111100000000110111001010111111100000000000111100000000001001101000100001000100101", packed.toString(2));
  packed = packed << 4n;
  assertEquals("1111000000001101110010101111111000000000001111000000000010011010001000010001001010000", packed.toString(2));
  assertEquals(85, packed.toString(2).length);
  let reversed = passCode;
  reversed = (reversed << 12n) | discriminator;
  reversed = (reversed << 8n) | discovery;
  reversed = (reversed << 2n) | commissioning;
  reversed = (reversed << 16n) | productId;
  reversed = (reversed << 16n) | vendorId;
  reversed = reversed << 3n; // version
  expect(reversed).toBe(0x268844be0000657f78068n);
  assertEquals("1001101000100001000100101111100000000000000000011001010111111101111000000001101000", reversed.toString(2));
  const chunk = reversed & 0xFFFFFFn;
  assertEquals("2XMT7", base38encodeChunk(chunk));
});