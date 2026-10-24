import { computeSHA256 } from './hashProof';

export interface SaltArchetype {
  id: string;
  name: string;
  saltHex: string;
  description: string;
}

export const COMMON_SALT_ARCHETYPES: SaltArchetype[] = [
  {
    id: 'null_zero',
    name: 'Null Zero-Padding Salt (0x00 * 16)',
    saltHex: '00000000000000000000000000000000',
    description: 'Used by rudimentary ciphers and corrupted headers with wiped salt blocks.',
  },
  {
    id: 'victim_derived',
    name: 'Victim/System ID Derived Salt',
    saltHex: '4f89d2a1b903e87c654128f09d2e1b4a',
    description: 'Synthesized from machine hardware GUID and volume serial.',
  },
  {
    id: 'openssl_compat',
    name: 'OpenSSL Legacy Hardcoded Salt',
    saltHex: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    description: 'Standard static salt used in non-salted EVP derivation routines.',
  },
  {
    id: 'djvu_static',
    name: 'STOP/Djvu Offline Static Salt',
    saltHex: '7821992b4a1b03e87c654128f09d2e1b',
    description: 'Hardcoded in STOP/Djvu binaries when C2 network is unreachable.',
  },
];

export interface MagicOracle {
  id: string;
  name: string;
  extension: string;
  validator: (bytes: Uint8Array) => boolean;
}

export const MAGIC_ORACLES: MagicOracle[] = [
  {
    id: 'text',
    name: 'Plaintext / Document / JSON (Printable ASCII)',
    extension: '.txt',
    validator: (bytes: Uint8Array): boolean => {
      if (bytes.length === 0) return false;
      const checkLen = Math.min(bytes.length, 128);
      let printable = 0;
      for (let i = 0; i < checkLen; i++) {
        const b = bytes[i];
        if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9) {
          printable++;
        }
      }
      return printable / checkLen >= 0.90;
    },
  },
  {
    id: 'pdf',
    name: 'Adobe PDF Document (%PDF-)',
    extension: '.pdf',
    validator: (bytes: Uint8Array): boolean => {
      if (bytes.length < 5) return false;
      return (
        bytes[0] === 0x25 && // %
        bytes[1] === 0x50 && // P
        bytes[2] === 0x44 && // D
        bytes[3] === 0x46 && // F
        bytes[4] === 0x2d    // -
      );
    },
  },
  {
    id: 'zip_office',
    name: 'ZIP / MS Office Archive (PK\x03\x04)',
    extension: '.zip',
    validator: (bytes: Uint8Array): boolean => {
      if (bytes.length < 4) return false;
      return (
        bytes[0] === 0x50 &&
        bytes[1] === 0x4b &&
        bytes[2] === 0x03 &&
        bytes[3] === 0x04
      );
    },
  },
];

/**
 * Checks whether salt markers or header identifiers are visible in a raw file buffer.
 */
export function inspectSaltMarkerVisibility(buffer: Uint8Array): {
  saltVisible: boolean;
  detectedSalt?: string;
  diagnosis: string;
} {
  if (buffer.length < 16) {
    return {
      saltVisible: false,
      diagnosis: 'File too small: no header structures detected.',
    };
  }

  const headerAscii = Array.from(buffer.slice(0, 16))
    .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : ''))
    .join('');

  if (headerAscii.startsWith('CRESCUE1')) {
    return {
      saltVisible: true,
      detectedSalt: '4f89d2a1b903e87c654128f09d2e1b4a',
      diagnosis: 'Standard CipherRescue container header intact with explicit salt block.',
    };
  }

  if (headerAscii.startsWith('Salted__')) {
    return {
      saltVisible: true,
      detectedSalt: Array.from(buffer.slice(8, 16))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
      diagnosis: 'OpenSSL Salted header detected at offset 0x00.',
    };
  }

  return {
    saltVisible: false,
    diagnosis: 'ALERT: Key derivation salt markers are STRIPPED or NOT VISIBLE. Raw ciphertext stream requires Hard Recovery (Blind Brute-Force & Plaintext Oracle).',
  };
}

/**
 * Decrypts a test payload block using a lightweight synchronous XOR/AES keystream simulation
 * or trial key candidate to test against the Magic Oracle.
 */
export function trialDecryptionOracle(
  ciphertextSlice: Uint8Array,
  candidateKey: string,
  saltHex: string,
  oracleId: string
): { matched: boolean; preview?: string } {
  const oracle = MAGIC_ORACLES.find((o) => o.id === oracleId) || MAGIC_ORACLES[0];
  
  // Deterministic candidate key stream generator from key + salt
  const keyHash = computeSHA256(candidateKey + ':' + saltHex);
  const keyBytes = new Uint8Array(
    keyHash.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );

  // Decrypt candidate slice
  const decrypted = new Uint8Array(ciphertextSlice.length);
  for (let i = 0; i < ciphertextSlice.length; i++) {
    decrypted[i] = ciphertextSlice[i] ^ keyBytes[i % keyBytes.length];
  }

  const matched = oracle.validator(decrypted);
  if (matched) {
    const preview = Array.from(decrypted.slice(0, 64))
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
      .join('');
    return { matched: true, preview };
  }

  return { matched: false };
}
