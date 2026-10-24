/**
 * Hash Proof of Work & Checksum Solver Algorithms
 */

// Pure TypeScript SHA-256 implementation so it can run synchronously
// in Node.js test runner, Web Workers, or UI threads without external deps.
function sha256Sync(asciiOrBytes: string | Uint8Array): string {
  let bytes: Uint8Array;
  if (typeof asciiOrBytes === 'string') {
    bytes = new TextEncoder().encode(asciiOrBytes);
  } else {
    bytes = asciiOrBytes;
  }

  // Pre-computed constants
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a;
  let H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;

  // Pre-processing
  const bitLength = bytes.length * 8;
  const newLength = ((bytes.length + 8) >> 6) + 1 << 6;
  const padded = new Uint8Array(newLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  // Append length in bits (big-endian 64-bit)
  const view = new DataView(padded.buffer);
  view.setUint32(newLength - 4, bitLength >>> 0);
  view.setUint32(newLength - 8, Math.floor(bitLength / 0x100000000));

  const W = new Uint32Array(64);

  for (let chunk = 0; chunk < newLength; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(chunk + i * 4);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = (W[i - 15] >>> 7 | W[i - 15] << 25) ^ (W[i - 15] >>> 18 | W[i - 15] << 14) ^ (W[i - 15] >>> 3);
      const s1 = (W[i - 2] >>> 17 | W[i - 2] << 15) ^ (W[i - 2] >>> 19 | W[i - 2] << 13) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;

    for (let i = 0; i < 64; i++) {
      const S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H0 = (H0 + a) >>> 0;
    H1 = (H1 + b) >>> 0;
    H2 = (H2 + c) >>> 0;
    H3 = (H3 + d) >>> 0;
    H4 = (H4 + e) >>> 0;
    H5 = (H5 + f) >>> 0;
    H6 = (H6 + g) >>> 0;
    H7 = (H7 + h) >>> 0;
  }

  const hexParts = [H0, H1, H2, H3, H4, H5, H6, H7].map((num) =>
    num.toString(16).padStart(8, '0')
  );
  return hexParts.join('');
}

export function computeSHA256(data: string | Uint8Array): string {
  return sha256Sync(data);
}

export interface MiningJob {
  targetHashChecksum: string; // The SHA-256 checksum recorded in file header
  saltHex: string;
  patternMask: string; // e.g. "CORP-???-KEY" or "ALPHA-***-2024"
  startNonce: number;
  batchSize: number;
}

export interface MiningResult {
  solved: boolean;
  recoveredKey?: string;
  solvedHash?: string;
  noncesScanned: number;
  elapsedMs: number;
}

/**
 * Searches candidate keys matching a pattern or nonce sequence.
 * Tests if sha256(candidate + salt) === targetHashChecksum.
 */
export function solveHashBatch(
  targetHashChecksum: string,
  saltHex: string,
  candidates: string[]
): { found: boolean; key?: string; checkedCount: number } {
  const target = targetHashChecksum.toLowerCase().trim();
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const candidateHash = computeSHA256(candidate + ':' + saltHex);
    if (candidateHash.toLowerCase() === target) {
      return { found: true, key: candidate, checkedCount: i + 1 };
    }
  }
  return { found: false, checkedCount: candidates.length };
}

/**
 * Generates candidate strings from a pattern mask (e.g. "CORP-###-KEY", "ALPHA-???")
 */
export function generateCandidatesFromMask(
  mask: string,
  limit: number = 2000
): string[] {
  const results: string[] = [];
  const wildcardIndices: number[] = [];

  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === '?' || mask[i] === '#' || mask[i] === '*') {
      wildcardIndices.push(i);
    }
  }

  if (wildcardIndices.length === 0) {
    return [mask];
  }

  // If wildcards are 1 to 3 characters, generate exhaustively
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const digitChars = '0123456789';

  function recurse(current: string[], index: number) {
    if (results.length >= limit) return;
    if (index === wildcardIndices.length) {
      results.push(current.join(''));
      return;
    }

    const pos = wildcardIndices[index];
    const maskChar = mask[pos];
    const charset = maskChar === '#' ? digitChars : chars;

    for (let c = 0; c < charset.length; c++) {
      current[pos] = charset[c];
      recurse(current, index + 1);
      if (results.length >= limit) return;
    }
  }

  const initial = mask.split('');
  recurse(initial, 0);
  return results;
}
