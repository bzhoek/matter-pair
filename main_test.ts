import { assertEquals } from "@std/assert";
import { generateManualPairingCode } from "./main.ts";

// https://github.com/project-chip/connectedhomeip/issues/34567
// version < 8 (3 bits)
// 4-msb of discriminator < 4096 (4 of 12 bits)
// passcode < 134,217,727 (27 bits)

Deno.test(function generateTest() {
  const passCode = 20202021;
  const discriminator = 3840;
  const pairingCode = generateManualPairingCode(discriminator, passCode);
  assertEquals("3497011233", pairingCode);
});

Deno.test(function stepsTest() {
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
