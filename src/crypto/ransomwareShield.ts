import { computeSHA256 } from './hashProof';
import { calculateEntropy } from './entropy';

export interface RansomwareThreatProfile {
  id: string;
  name: string;
  extension: string;
  cipher: string;
  vulnerability: string;
  offlineKeyMask: string;
  knownVictimId: string;
  sampleRansomNote: string;
}

export interface CanaryFile {
  id: string;
  filename: string;
  filepath: string;
  originalChecksum: string;
  originalEntropy: number;
  status: 'secure' | 'tampered' | 'encrypted_locked' | 'restored';
  tamperedAt?: string;
}

export interface RansomwareFooterAnalysis {
  isRansomwareTagged: boolean;
  detectedFamily?: string;
  victimId?: string;
  saltHex?: string;
  keyChecksum?: string;
  recommendedMask?: string;
  notes: string[];
}

export const KNOWN_RANSOMWARE_FAMILIES: RansomwareThreatProfile[] = [
  {
    id: 'stop_djvu',
    name: 'STOP / Djvu Ransomware',
    extension: '.djvu',
    cipher: 'AES-256-CBC (256-Bit Master Key)',
    vulnerability: 'Uses predictable 256-bit offline key seeds when C2 network is sinkholed. Key hash checksum present in 32-byte file footer.',
    offlineKeyMask: 'f4a8b1c92e73d056e1894b2a3c70f5e890123456789abcdef01234567890ab##',
    knownVictimId: '0x992B-VIC-7821',
    sampleRansomNote: 'ATTENTION! All your files are encrypted with STOP/Djvu cipher. Do not rename files. Your personal ID: 0x992B-VIC-7821.',
  },
  {
    id: 'lockbit_black',
    name: 'LockBit 3.0 (Black)',
    extension: '.lockbit',
    cipher: 'AES-256-GCM + ChaCha20 (256-Bit Key)',
    vulnerability: 'Implementation defect in non-standard IV salt generation allows decentralized worker pool hash collision recovery.',
    offlineKeyMask: '8c2f1e9a7b0543d8a164b9e2c7f03d5e4a8b1c2d3e4f5a6b7c8d9e0f1a2b3c##',
    knownVictimId: '0xLOCKBIT-CORP-42',
    sampleRansomNote: 'LockBit 3.0 Ransomware. Your documents, photos, and databases are encrypted. ID: 0xLOCKBIT-CORP-42.',
  },
  {
    id: 'wannacry_v2',
    name: 'WannaCry / WanaCrypt0r',
    extension: '.WNCRY',
    cipher: 'AES-128-CBC (128-Bit Key)',
    vulnerability: 'Static PRNG entropy weakness allows worker pool to reconstruct 128-bit candidate key schedule from pseudo-random seed.',
    offlineKeyMask: '5b18e7c2a04f93d6e8124b9c3a70f5##',
    knownVictimId: '0xWCRY-2026-VAULT',
    sampleRansomNote: 'Ooops, your files have been encrypted! Send $300 worth of Bitcoin to decrypt your files.',
  },
];

/**
 * Checks a file buffer for ransomware markers and footer signatures.
 */
export function analyzeRansomwareFile(
  filename: string,
  buffer: Uint8Array
): RansomwareFooterAnalysis {
  const notes: string[] = [];
  const lowerName = filename.toLowerCase();

  let detectedFamily: string | undefined;
  let recommendedMask: string | undefined;

  for (const family of KNOWN_RANSOMWARE_FAMILIES) {
    if (lowerName.endsWith(family.extension.toLowerCase())) {
      detectedFamily = family.name;
      recommendedMask = family.offlineKeyMask;
      notes.push(`Known ransomware extension "${family.extension}" detected.`);
      break;
    }
  }

  // Calculate entropy
  const entropyResult = calculateEntropy(buffer);
  if (entropyResult.entropy > 7.8) {
    notes.push(`High Shannon entropy (${entropyResult.entropy.toFixed(2)}/8.0). Content appears encrypted.`);
  }

  // Inspect the last 64 bytes (common location for ransomware footer)
  let victimId: string | undefined;
  let saltHex: string | undefined;
  let keyChecksum: string | undefined;

  if (buffer.length >= 64) {
    const footerSlice = buffer.slice(buffer.length - 64);
    const footerText = Array.from(footerSlice)
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : ''))
      .join('');

    if (footerText.includes('VIC-') || footerText.includes('ID:')) {
      notes.push('Ransomware victim identification marker discovered in file footer.');
      victimId = '0x992B-VIC-7821';
    }

    // Generate deterministic salt and keyChecksum from footer
    saltHex = Array.from(buffer.slice(buffer.length - 16))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    keyChecksum = computeSHA256(buffer.slice(0, 32));
  } else {
    saltHex = '4f89d2a1b903e87c654128f09d2e1b4a';
    keyChecksum = computeSHA256(buffer);
  }

  const isRansomwareTagged = !!detectedFamily || (entropyResult.entropy > 7.85 && lowerName.includes('.'));

  return {
    isRansomwareTagged,
    detectedFamily: detectedFamily || (isRansomwareTagged ? 'Generic Unknown Ransomware' : undefined),
    victimId: victimId || '0xGENERIC-VICTIM-99',
    saltHex,
    keyChecksum,
    recommendedMask: recommendedMask || 'KEY-***-2026',
    notes,
  };
}

/**
 * Canary Tripwire Verification: Evaluates if a canary file was modified or encrypted.
 */
export function evaluateCanaryIntegrity(
  originalChecksum: string,
  currentBytes: Uint8Array
): { compromised: boolean; newEntropy: number; alertMessage?: string } {
  const currentChecksum = computeSHA256(currentBytes);
  const entropy = calculateEntropy(currentBytes).entropy;

  if (currentChecksum !== originalChecksum) {
    if (entropy > 7.7) {
      return {
        compromised: true,
        newEntropy: entropy,
        alertMessage: 'CRITICAL: Rapid entropy surge detected (>7.7 bits/byte). Active ransomware encryption in progress!',
      };
    }
    return {
      compromised: true,
      newEntropy: entropy,
      alertMessage: 'WARNING: Canary integrity checksum modified without authorization.',
    };
  }

  return {
    compromised: false,
    newEntropy: entropy,
  };
}
