/**
 * Shamir's Secret Sharing over Galois Field GF(2^8)
 * Irreducible polynomial: x^8 + x^4 + x^3 + x + 1 (0x11b)
 */

const EXP: number[] = new Array(512);
const LOG: number[] = new Array(256);

// Initialize GF(2^8) tables using generator 3 with Rijndael polynomial 0x11b
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    // Multiply by generator 3 in GF(2^8): (x * 2) ^ x
    let x2 = x << 1;
    if (x2 & 0x100) {
      x2 ^= 0x11b;
    }
    x = x2 ^ x;
  }
  for (let i = 255; i < 512; i++) {
    EXP[i] = EXP[i - 255];
  }
})();

function gfAdd(a: number, b: number): number {
  return a ^ b;
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

function gfDiv(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero in GF(2^8)');
  if (a === 0) return 0;
  return EXP[(LOG[a] - LOG[b] + 255) % 255];
}

export interface KeyShard {
  id: number; // 1-255
  dataHex: string;
}

/**
 * Evaluates polynomial at x using Horner's method in GF(2^8)
 * P(x) = coeffs[0] + coeffs[1]*x + coeffs[2]*x^2 + ...
 */
function evalPoly(coeffs: number[], x: number): number {
  let result = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) {
    result = gfAdd(gfMul(result, x), coeffs[i]);
  }
  return result;
}

/**
 * Splits secret bytes into n shares with a threshold of k shares required to reconstruct.
 */
export function splitSecret(
  secret: Uint8Array,
  totalShards: number,
  threshold: number
): KeyShard[] {
  if (threshold < 2) throw new Error('Threshold must be at least 2');
  if (totalShards < threshold) throw new Error('Total shards must be >= threshold');
  if (totalShards > 255) throw new Error('Total shards cannot exceed 255');

  const shards: KeyShard[] = [];
  const shardBytes: number[][] = Array.from({ length: totalShards }, () => []);

  for (let b = 0; b < secret.length; b++) {
    const secretByte = secret[b];
    const coeffs: number[] = [secretByte];

    // Generate random coefficients for degree (threshold - 1)
    for (let i = 1; i < threshold; i++) {
      let r = 0;
      // In browser or Node
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const arr = new Uint8Array(1);
        crypto.getRandomValues(arr);
        r = arr[0];
      } else {
        r = Math.floor(Math.random() * 256);
      }
      coeffs.push(r);
    }

    // Evaluate for each shard id: 1 to totalShards
    for (let s = 1; s <= totalShards; s++) {
      const y = evalPoly(coeffs, s);
      shardBytes[s - 1].push(y);
    }
  }

  for (let s = 1; s <= totalShards; s++) {
    const hex = shardBytes[s - 1]
      .map((val) => val.toString(16).padStart(2, '0'))
      .join('');
    shards.push({ id: s, dataHex: hex });
  }

  return shards;
}

/**
 * Reconstructs secret bytes from at least threshold number of shards using Lagrange interpolation.
 */
export function combineShards(shards: KeyShard[]): Uint8Array {
  if (shards.length === 0) throw new Error('At least one shard is required');

  const shardLength = shards[0].dataHex.length / 2;
  const decodedShards = shards.map((s) => {
    const bytes: number[] = [];
    for (let i = 0; i < s.dataHex.length; i += 2) {
      bytes.push(parseInt(s.dataHex.slice(i, i + 2), 16));
    }
    return { id: s.id, bytes };
  });

  const secret: number[] = [];

  for (let b = 0; b < shardLength; b++) {
    let secretByte = 0;

    for (let i = 0; i < decodedShards.length; i++) {
      const xi = decodedShards[i].id;
      const yi = decodedShards[i].bytes[b];

      // Compute Lagrange basis polynomial L_i(0) = product( (0 - xj) / (xi - xj) )
      let basis = 1;
      for (let j = 0; j < decodedShards.length; j++) {
        if (i === j) continue;
        const xj = decodedShards[j].id;
        const num = xj; // (0 ^ xj) = xj in GF(2^8)
        const den = gfAdd(xi, xj);
        const term = gfDiv(num, den);
        basis = gfMul(basis, term);
      }

      secretByte = gfAdd(secretByte, gfMul(yi, basis));
    }

    secret.push(secretByte);
  }

  return new Uint8Array(secret);
}
