import test from 'node:test';
import assert from 'node:assert/strict';
import { splitSecret, combineShards } from '../shamir';
import { calculateEntropy } from '../entropy';
import { computeSHA256, generateCandidatesFromMask, solveHashBatch } from '../hashProof';
import { serializeContainer, parseContainer, ContainerHeader } from '../container';
import { analyzeRansomwareFile, evaluateCanaryIntegrity } from '../ransomwareShield';
import { inspectSaltMarkerVisibility, trialDecryptionOracle, MAGIC_ORACLES } from '../hardRecovery';

test('Shamir SSS: splits and reconstructs secret with threshold', () => {
  // Real-world 256-bit (32-byte) AES master key
  const secretText = '9e82b7c410fa45d6e28f319bc704a5e18234db67e012fa983451bc78de9012a4';
  const secretBytes = new TextEncoder().encode(secretText);

  // 3 shares, threshold 2
  const shards = splitSecret(secretBytes, 3, 2);
  assert.equal(shards.length, 3);
  assert.ok(shards[0].dataHex.length > 0);

  // Reconstruct using share 1 and share 2
  const reconstructed12 = combineShards([shards[0], shards[1]]);
  assert.equal(new TextDecoder().decode(reconstructed12), secretText);

  // Reconstruct using share 2 and share 3
  const reconstructed23 = combineShards([shards[1], shards[2]]);
  assert.equal(new TextDecoder().decode(reconstructed23), secretText);

  // Reconstruct using share 1 and share 3
  const reconstructed13 = combineShards([shards[0], shards[2]]);
  assert.equal(new TextDecoder().decode(reconstructed13), secretText);
});

test('Entropy analysis calculates correct Shannon entropy and classifications', () => {
  // Plain ASCII text has lower entropy
  const plainText = new TextEncoder().encode('AAAAABBBBBCCCCCDDDDDEEEEE');
  const plainAnalysis = calculateEntropy(plainText);
  assert.ok(plainAnalysis.entropy < 3.0, 'Repeated ASCII text should have low entropy');

  // Pseudo-random bytes have high entropy (~7.5 to 8.0)
  const randomBytes = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    randomBytes[i] = (i * 37 + 19) % 256;
  }
  const randomAnalysis = calculateEntropy(randomBytes);
  assert.ok(randomAnalysis.entropy > 7.9, 'Uniform byte spread should have near 8.0 entropy');
  assert.equal(randomAnalysis.classification, 'encrypted');
});

test('Hash Proof: SHA256 and pattern mask solver with 256-bit cryptographic keys', () => {
  // Full 256-bit AES cryptographic key
  const key = '7f4c9a81e32d5b601e847c29ba04f1638d92e5c10fa4b8627e31d904c6e85242';
  const salt = 'a1b2c3d4e5f60718';
  const targetHash = computeSHA256(key + ':' + salt);

  assert.equal(targetHash.length, 64);

  // Generate candidates from 256-bit mask with 2 wildcard hex digits
  const mask = '7f4c9a81e32d5b601e847c29ba04f1638d92e5c10fa4b8627e31d904c6e852##';
  const candidates = generateCandidatesFromMask(mask, 100);
  assert.equal(candidates.length, 100);
  assert.ok(candidates.includes(key));

  const result = solveHashBatch(targetHash, salt, candidates);
  assert.equal(result.found, true);
  assert.equal(result.key, key);
});

test('Container: serialization and deserialization roundtrip', () => {
  const header: ContainerHeader = {
    magic: 'CRESCUE1',
    version: 1,
    algorithm: 'AES-256-GCM',
    filename: 'test_doc.pdf',
    filetype: 'application/pdf',
    filesize: 1024,
    saltHex: '0102030405060708090a0b0c0d0e0f10',
    ivHex: '112233445566778899aabbcc',
    keyHashChecksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    plaintextChecksum: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    patternMaskHint: '7f4c9a81e32d5b601e847c29ba04f1638d92e5c10fa4b8627e31d904c6e852##',
  };

  const fakeCiphertext = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0xca, 0xfe]);
  const serialized = serializeContainer(header, fakeCiphertext);

  assert.ok(serialized.length > 20);

  const parsed = parseContainer(serialized);
  assert.equal(parsed.header.magic, 'CRESCUE1');
  assert.equal(parsed.header.filename, 'test_doc.pdf');
  assert.equal(parsed.header.keyHashChecksum, header.keyHashChecksum);
  assert.equal(parsed.header.patternMaskHint, header.patternMaskHint);
});

test('Ransomware Shield: detects known ransomware extensions and canary tripwire alerts', () => {
  // Simulated locked file
  const fakeLockedBytes = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    fakeLockedBytes[i] = (i * 71 + 33) % 256;
  }
  const analysis = analyzeRansomwareFile('financial_records.xlsx.djvu', fakeLockedBytes);
  assert.equal(analysis.isRansomwareTagged, true);
  assert.equal(analysis.detectedFamily, 'STOP / Djvu Ransomware');
  assert.equal(
    analysis.recommendedMask,
    'f4a8b1c92e73d056e1894b2a3c70f5e890123456789abcdef01234567890ab##'
  );

  // Canary tripwire test
  const originalCanary = new TextEncoder().encode('CANARY_TRIPWIRE_INTEGRITY_TOKEN_001');
  const originalChecksum = computeSHA256(originalCanary);

  // Normal check: not compromised
  const cleanResult = evaluateCanaryIntegrity(originalChecksum, originalCanary);
  assert.equal(cleanResult.compromised, false);

  // Tampered high-entropy check: compromised with alert
  const tamperedResult = evaluateCanaryIntegrity(originalChecksum, fakeLockedBytes);
  assert.equal(tamperedResult.compromised, true);
  assert.ok(tamperedResult.alertMessage?.includes('CRITICAL'));
});

test('Hard Recovery: detects missing salt markers and validates plaintext magic oracle', () => {
  // Test raw ciphertext with stripped salt markers
  const rawStrippedBytes = new Uint8Array([0x8f, 0x12, 0xa9, 0xb3, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]);
  const visibility = inspectSaltMarkerVisibility(rawStrippedBytes);
  assert.equal(visibility.saltVisible, false);
  assert.ok(visibility.diagnosis.includes('STRIPPED or NOT VISIBLE'));

  // Test Magic Oracle: PDF header
  const pdfOracle = MAGIC_ORACLES.find((o) => o.id === 'pdf')!;
  const validPdfHeader = new TextEncoder().encode('%PDF-1.7 header');
  assert.equal(pdfOracle.validator(validPdfHeader), true);
  assert.equal(pdfOracle.validator(rawStrippedBytes), false);

  // Test Magic Oracle: Printable text
  const textOracle = MAGIC_ORACLES.find((o) => o.id === 'text')!;
  const validText = new TextEncoder().encode('Hello, this is restored confidential data.');
  assert.equal(textOracle.validator(validText), true);
  assert.equal(textOracle.validator(rawStrippedBytes), false);
});
