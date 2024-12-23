// https://en.wikipedia.org/wiki/Verhoeff_algorithm

const multiplication = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const inverse = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

const permutation = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

export function generateVerhoeffChecksum(code: string) {

  let checksum = 0;
  const digits = code.concat("0").split("").map(Number).reverse();

  for (let i = 0; i < digits.length; i++) {
    const n = digits[i];
    const k = permutation[i % 8][n];
    checksum = multiplication[checksum][k];
    // console.log(i, n, k, checksum);
  }

  return inverse[checksum];
}


// concatenation of four numbers
// - 1-digit number for version, vendor/product id present flag, and 2 ms-bits of discriminator
// - 5-digit number for next 2 ms-bits of discriminator and 14 ls-bits of passcode
// - 4-digit number for 13 ms-bits of passcode
// - 1-digit number for Verhoeff checksum
export function generateManualPairingCode(discriminator: number, passcode: number): string {
  const first = discriminator >> 10;
  const two_to_six = ((discriminator & 0x300) << 6) | (passcode & 0x3FFF);
  const seven_to_ten = passcode >> 14;
  return first.toString() + two_to_six.toString() + seven_to_ten.toString();
}

export function base38encode(number: bigint): string {
  let result = "";
  for (let i = 11; i > 0; i -= 3) {
    const chunk = number & 0xffffffn;
    switch (i) {
      case 1:
        result += base38encodeChunk(chunk, 2);
        break;
      case 2:
        result += base38encodeChunk(chunk, 4);
        break;
      default:
        result += base38encodeChunk(chunk, 5);
        break;
    }
    number = number >> 24n;
  }
  return result
}

export function base38encodeChunk(chunk: bigint, len: number = 5): string {
  const base38 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-.";
  let result = "";
  while (chunk > 0) {
    const remainder = Number(chunk % 38n);
    result += base38[remainder];
    chunk = chunk / 38n;
  }
  return result + "0".repeat(len - result.length);
}