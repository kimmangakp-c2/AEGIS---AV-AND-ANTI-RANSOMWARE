/**
 * Cryptographic Entropy & Container Header Analysis
 */

export interface EntropyAnalysis {
  entropy: number; // 0.0 to 8.0 Shannon entropy (bits per byte)
  byteDistribution: number[]; // frequency of each byte 0-255 normalized
  classification: 'plaintext' | 'compressed' | 'encrypted' | 'sparse_or_corrupted';
  magicSignature?: string;
  notes: string[];
}

export function calculateEntropy(data: Uint8Array): EntropyAnalysis {
  if (!data || data.length === 0) {
    return {
      entropy: 0,
      byteDistribution: new Array(256).fill(0),
      classification: 'sparse_or_corrupted',
      notes: ['Buffer is empty'],
    };
  }

  const counts = new Uint32Array(256);
  for (let i = 0; i < data.length; i++) {
    counts[data[i]]++;
  }

  let entropy = 0;
  const len = data.length;
  const byteDistribution = new Array(256);

  for (let i = 0; i < 256; i++) {
    const p = counts[i] / len;
    byteDistribution[i] = p;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  // Detect magic signatures in first 16 bytes
  const headerSlice = data.slice(0, Math.min(16, data.length));
  let magicSignature: string | undefined;
  const notes: string[] = [];

  const magicHex = Array.from(headerSlice)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const asciiHeader = Array.from(headerSlice)
    .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
    .join('');

  if (asciiHeader.startsWith('CRESCUE1')) {
    magicSignature = 'CipherRescue Container v1 (AES-256-GCM)';
    notes.push('Valid CipherRescue encrypted format detected.');
  } else if (asciiHeader.startsWith('Salted__')) {
    magicSignature = 'OpenSSL Salted Container';
    notes.push('OpenSSL encrypted format (PBKDF2/EVP key derivation required).');
  } else if (magicHex.startsWith('504b0304')) {
    magicSignature = 'ZIP / Office Archive (PKzip)';
    notes.push('Standard Zip archive magic bytes.');
  } else if (magicHex.startsWith('25504446')) {
    magicSignature = 'Adobe PDF Document (%PDF)';
    notes.push('Unencrypted or standard PDF header.');
  } else if (magicHex.startsWith('ffd8ff')) {
    magicSignature = 'JPEG Image (JFIF/EXIF)';
  } else if (magicHex.startsWith('89504e47')) {
    magicSignature = 'PNG Image';
  } else if (magicHex.startsWith('377abcaf271c')) {
    magicSignature = '7-Zip Compressed Container';
  }

  let classification: EntropyAnalysis['classification'] = 'plaintext';
  if (entropy > 7.9) {
    classification = 'encrypted';
    notes.push('Extremely uniform byte distribution (>7.9 bits/byte). Strong cipher output characteristic.');
  } else if (entropy > 7.2) {
    classification = 'compressed';
    notes.push('High entropy (>7.2 bits/byte). Typical of compressed streams or structured encrypted blocks.');
  } else if (entropy < 4.0) {
    classification = 'sparse_or_corrupted';
    notes.push('Low entropy (<4.0 bits/byte). Contains repeated sequences, zero padding, or plaintext headers.');
  } else {
    classification = 'plaintext';
    notes.push('Moderate entropy. Characteristic of human-readable plaintext, ASCII, or JSON.');
  }

  return {
    entropy: Number(entropy.toFixed(4)),
    byteDistribution,
    classification,
    magicSignature,
    notes,
  };
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
