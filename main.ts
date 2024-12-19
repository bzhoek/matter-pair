// concatenation of three numbers
// - 1-digit number for version, vendor/product id present flag, and 2 ms-bits of discriminator
// - 5-digit number for next 2 ms-bits of discriminator and 14 ls-bits of passcode
// - 4-digit number for 13 ms-bits of passcode
export function generateManualPairingCode(discriminator: number, passcode: number): string {
  const first = discriminator >> 10;
  const two_to_six = ((discriminator & 0x300) << 6) | (passcode & 0x3FFF);
  const seven_to_ten = passcode >> 14;
  return first.toString() + two_to_six.toString() + seven_to_ten.toString();
}