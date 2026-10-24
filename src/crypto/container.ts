/**
 * Encrypted Container Specifications & Web Crypto Decryption Algorithms
 */

import { computeSHA256 } from './hashProof';

export interface ContainerHeader {
  magic: 'CRESCUE1';
  version: 1;
  algorithm: 'AES-256-GCM' | 'AES-256-CBC';
  filename: string;
  filetype: string;
  filesize: number;
  saltHex: string;
  ivHex: string;
  keyHashChecksum: string; // SHA256(key + ":" + saltHex)
  plaintextChecksum: string; // SHA256 of original unencrypted bytes
  patternMaskHint?: string;
  shamirInfo?: {
    totalShards: number;
    threshold: number;
    availableShards?: Array<{ id: number; dataHex: string }>;
  };
}

export interface EncryptedContainer {
  header: ContainerHeader;
  ciphertextBase64: string;
  rawBytes?: Uint8Array;
}

export function serializeContainer(
  header: ContainerHeader,
  ciphertext: Uint8Array
): Uint8Array {
  const headerJson = JSON.stringify(header);
  const headerBytes = new TextEncoder().encode(headerJson);
  
  // Format:
  // [0..7]: 'CRESCUE1'
  // [8..11]: 4-byte big-endian Header JSON length
  // [12..12+headerLen]: Header JSON UTF-8
  // [remainder]: Ciphertext
  const magicBytes = new TextEncoder().encode('CRESCUE1');
  const buffer = new Uint8Array(8 + 4 + headerBytes.length + ciphertext.length);

  buffer.set(magicBytes, 0);

  const view = new DataView(buffer.buffer);
  view.setUint32(8, headerBytes.length, false);

  buffer.set(headerBytes, 12);
  buffer.set(ciphertext, 12 + headerBytes.length);

  return buffer;
}

export function parseContainer(buffer: Uint8Array): EncryptedContainer {
  if (buffer.length < 12) {
    throw new Error('Container too small: invalid file format');
  }

  const magic = new TextDecoder().decode(buffer.slice(0, 8));
  if (magic !== 'CRESCUE1') {
    throw new Error('Invalid magic identifier: not a CipherRescue container');
  }

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const headerLen = view.getUint32(8, false);

  if (buffer.length < 12 + headerLen) {
    throw new Error('Corrupted container: truncated header block');
  }

  const headerBytes = buffer.slice(12, 12 + headerLen);
  const headerJson = new TextDecoder().decode(headerBytes);
  const header: ContainerHeader = JSON.parse(headerJson);

  const ciphertext = buffer.slice(12 + headerLen);
  
  // Convert ciphertext to base64
  let binary = '';
  const len = ciphertext.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(ciphertext[i]);
  }
  const ciphertextBase64 = typeof btoa !== 'undefined' 
    ? btoa(binary) 
    : Buffer.from(ciphertext).toString('base64');

  return {
    header,
    ciphertextBase64,
    rawBytes: buffer,
  };
}

/**
 * Derives a 256-bit AES key from a passphrase/string and salt
 */
export async function deriveKey(
  passphrase: string,
  saltHex: string
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const salt = new Uint8Array(
    saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 10000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts arbitrary file data with AES-256-GCM
 */
export async function encryptData(
  plaintext: Uint8Array,
  passphrase: string,
  filename: string,
  filetype: string,
  options?: {
    patternMaskHint?: string;
    shamirInfo?: ContainerHeader['shamirInfo'];
  }
): Promise<{ containerBytes: Uint8Array; header: ContainerHeader }> {
  // Generate random 16-byte salt and 12-byte IV
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(salt);
  crypto.getRandomValues(iv);

  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, '0')).join('');
  const ivHex = Array.from(iv).map((b) => b.toString(16).padStart(2, '0')).join('');

  // Key hash checksum for decentralized pool verification
  const keyHashChecksum = computeSHA256(passphrase + ':' + saltHex);
  const plaintextChecksum = computeSHA256(plaintext);

  const key = await deriveKey(passphrase, saltHex);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    plaintext as unknown as BufferSource
  );

  const ciphertext = new Uint8Array(ciphertextBuffer);

  const header: ContainerHeader = {
    magic: 'CRESCUE1',
    version: 1,
    algorithm: 'AES-256-GCM',
    filename,
    filetype,
    filesize: plaintext.length,
    saltHex,
    ivHex,
    keyHashChecksum,
    plaintextChecksum,
    patternMaskHint: options?.patternMaskHint,
    shamirInfo: options?.shamirInfo,
  };

  const containerBytes = serializeContainer(header, ciphertext);
  return { containerBytes, header };
}

/**
 * Decrypts container payload using derived key from passphrase
 */
export async function decryptData(
  container: EncryptedContainer,
  passphrase: string
): Promise<{
  success: boolean;
  plaintext?: Uint8Array;
  checksumValid: boolean;
  error?: string;
}> {
  try {
    const { header, ciphertextBase64 } = container;

    // Verify key against keyHashChecksum first
    const candidateChecksum = computeSHA256(passphrase + ':' + header.saltHex);
    if (candidateChecksum.toLowerCase() !== header.keyHashChecksum.toLowerCase()) {
      return {
        success: false,
        checksumValid: false,
        error: 'Key hash mismatch: Candidate key does not solve the recorded checksum proof.',
      };
    }

    const key = await deriveKey(passphrase, header.saltHex);
    const iv = new Uint8Array(
      header.ivHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    // Decode base64
    const binary = typeof atob !== 'undefined'
      ? atob(ciphertextBase64)
      : Buffer.from(ciphertextBase64, 'base64').toString('binary');
    const ciphertext = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      ciphertext[i] = binary.charCodeAt(i);
    }

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext as unknown as BufferSource
    );

    const plaintext = new Uint8Array(decryptedBuffer);
    const recoveredChecksum = computeSHA256(plaintext);
    const checksumValid = recoveredChecksum.toLowerCase() === header.plaintextChecksum.toLowerCase();

    return {
      success: true,
      plaintext,
      checksumValid,
    };
  } catch (err) {
    return {
      success: false,
      checksumValid: false,
      error: err instanceof Error ? err.message : 'Decryption authentication tag failed.',
    };
  }
}
