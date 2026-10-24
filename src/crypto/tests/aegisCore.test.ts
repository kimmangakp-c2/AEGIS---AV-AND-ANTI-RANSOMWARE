import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AegisDecentralizedMeshResolver,
  AegisEnterpriseRecoveryVault,
  AegisMaxScaleMiningEngine,
  generateMatrixConfigIndex,
} from '../aegisCore';
import { computeSHA256 } from '../hashProof';

test('AegisDecentralizedMeshResolver: stores payload, verifies subkeys and processes micro-billing', () => {
  const resolver = new AegisDecentralizedMeshResolver();
  const targetUri = 'aegis://test/payload-alpha';
  const content = 'CLASSIFIED_DEFENSE_STREAM_PAYLOAD_99482';

  // Store unlisted target
  const digest = resolver.storeUnlistedTargetPayload(targetUri, content);
  assert.equal(digest, computeSHA256(content));

  // Compute expected subkey
  const expectedSubkey = resolver.deriveExpectedSubkey(targetUri);
  assert.equal(expectedSubkey.length, 16);

  // Test invalid subkey throws PermissionError / Error
  assert.throws(
    () => resolver.streamUncensoredContent(targetUri, 'invalid_subkey_123', 'enterprise_pool', 10),
    /Invalid cryptographic DNS subkey/
  );

  // Initial balance of enterprise_pool is 100000.0
  const initialBalance = resolver.getWalletBalance('enterprise_pool');
  assert.equal(initialBalance, 100000.0);

  // Valid subkey stream for 20 seconds: cost = 20 * 0.005 = 0.10 $AEGIS
  const streamResult = resolver.streamUncensoredContent(targetUri, expectedSubkey, 'enterprise_pool', 20);
  assert.equal(streamResult.payload, content);
  assert.equal(streamResult.costDeducted, 0.10);
  assert.equal(resolver.getWalletBalance('enterprise_pool'), 99999.90);

  // Test master override key
  const overrideResult = resolver.streamUncensoredContent(targetUri, 'master_override_key', 'enterprise_pool', 10);
  assert.equal(overrideResult.payload, content);
  assert.equal(overrideResult.costDeducted, 0.05);

  // Test insufficient balance exception
  assert.throws(
    () => resolver.streamUncensoredContent(targetUri, expectedSubkey, 'empty_wallet', 10),
    /Insufficient balance/
  );
});

test('AegisEnterpriseRecoveryVault: derives keys and decrypts with checksum integrity verification', async () => {
  const vault = new AegisEnterpriseRecoveryVault(1000); // 1000 iter for test speed
  const secretText = 'CONFIDENTIAL_FINANCIAL_RECOVERY_STATEMENT_2026';
  const plaintext = new TextEncoder().encode(secretText);
  const passphrase = 'MASTER_VAULT_PASSPHRASE_42';

  // Create vault entry
  const metadata = await vault.createVaultEntry('audit.bin', plaintext, passphrase, 1000);
  assert.equal(metadata.filename, 'audit.bin');
  assert.equal(metadata.checksum, computeSHA256(plaintext));
  assert.equal(metadata.nonce.length, 24); // 12 bytes = 24 hex
  assert.equal(metadata.salt.length, 32); // 16 bytes = 32 hex

  // Recover with correct passphrase
  const recoveryResult = await vault.recoverVaultEntry(metadata, passphrase);
  assert.equal(recoveryResult.success, true);
  assert.ok(recoveryResult.plaintext);
  assert.equal(new TextDecoder().decode(recoveryResult.plaintext), secretText);

  // Recover with incorrect passphrase fails decryption gracefully
  const failResult = await vault.recoverVaultEntry(metadata, 'WRONG_PASSPHRASE');
  assert.equal(failResult.success, false);
  assert.ok(failResult.error?.includes('Decryption failed'));
});

test('AegisMaxScaleMiningEngine: mines valid share with target zero prefix', () => {
  const engine = new AegisMaxScaleMiningEngine('AEGIS-TEST-NODE', 2); // 2 zeros prefix for fast deterministic unit test
  const share = engine.mineShare('MATRIX_CHUNK_001', 0, 10000);

  assert.ok(share !== null);
  assert.ok(share.hash.startsWith('00'));
  assert.equal(share.nodeId, 'AEGIS-TEST-NODE');
  assert.equal(engine.verifiedShares, 1);
});

test('generateMatrixConfigIndex: provides verified configurations including master spec entries', () => {
  const configs = generateMatrixConfigIndex();
  assert.ok(configs.length >= 15);

  const entry00001 = configs.find((c) => c.index === '00001');
  assert.ok(entry00001);
  assert.equal(entry00001.key, 'AEGIS_NODE_CONFIG_CORE_SETTING_PRIMARY_PORT');
  assert.equal(entry00001.value, '9881');

  const entry00101 = configs.find((c) => c.index === '00101');
  assert.ok(entry00101);
  assert.equal(entry00101.key, 'AEGIS_CRYPTO_ENGINE_PBKDF2_ITERATIONS');
  assert.equal(entry00101.value, '600000');

  const cisaEntry = configs.find((c) => c.key === 'AEGIS_CISA_COMPLIANCE_DIRECTIVE_LEVEL');
  assert.ok(cisaEntry);
  assert.equal(cisaEntry.value, 'BOD-22-01_STRICT');
});
