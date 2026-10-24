import { splitSecret } from './shamir';
import { computeSHA256 } from './hashProof';
import { ContainerHeader, serializeContainer } from './container';
import { ScenarioPreset } from '../types';

// Pre-generated realistic encrypted containers and scenario presets

const FINANCIAL_PLAINTEXT = `================================================================================
CONFIDENTIAL AUDIT & ASSET RECONCILIATION REPORT (Q3/Q4)
CLASSIFICATION: RESTRICTED INTERNAL // CIPHER-RESCUE VAULT RESTORED
TIMESTAMP: 2026-10-24 07:42:00 UTC
================================================================================

EXECUTIVE SUMMARY:
- Entity: Apex Quantum Capital Management LLC
- Primary Vault Ledger ID: 0x9948-F8B2-C119
- Treasury Verification Status: RECONCILED WITH ZERO RESIDUAL LOSS

BALANCE BREAKDOWN:
1. Institutional Liquid Reserves: $148,250,920.00 USD (SWIFT: CHASUS33XXX)
2. Cryptographic Treasury (Cold Custody Multi-Sig):
   - Bitcoin (BTC): 3,420.50000000 BTC (Proof of Reserve Block #892,104)
   - Ethereum (ETH): 45,820.00000000 ETH (Staked Validator Quorum)
   - US Treasury Bond Tokenized Bills: $85,000,000.00 Par Value
3. Operational Reserves & Escrow Settlement: $12,410,300.00 USD

AUDITOR ATTESTATION:
"The cryptographic signatures verifying the sovereign assets match all registered
public keys. No unauthorized transfers or integrity compromises were detected."

Chief Cryptographer: Dr. Elena Rostova, PhD
Authorized Key Custodian: A. Vance, Senior Comptroller
================================================================================`;

const GENOME_PLAINTEXT = `================================================================================
PROJECT CRISPR-OMEGA: VECTOR RECOMBINATION PROTOCOL v4.9
INSTITUTE: BIO-SYNTHETIC RESEARCH CONSORTIUM (ZURICH / REYKJAVIK)
RESTRICTED LEVEL 4 BIOMEDICAL DOSSIER
================================================================================

TARGET SEQUENCE SPECIFICATION:
>Cas9_Synthesized_Exon3_Target_HomoSapiens_Chromosome11
ATGGCCCCCAAGAAGAAGCGCAAGGTGGGCATTCACGGCGTGCCCGCCGCCGACCGCAAG
CCCGAGCTGGTGCGCCTGGCCAACGAGATCTTCGGCATCGACGGCCTGGAGATCGTGAAC
CTGGACGGCACCGGCGACACCCCCGAGCTGGTGAAGGAGTTCGTGCACCGCATCAAGCGC
GCCATCAACCACAAGACCAAGTTCGCCACCGTGCTGCGCGAGCTGCTGGACATCGCCCGC
GGCCTGGACAACCGCACCGTGGTCATCAACAGCACCTACCACCACGTGGACATCGTGCTG
TGCGGCGGCGAGACCATCGAGAAGGACCTGGCCGAGGCCCTGCGCCGCCGCGGCTTCGAC

GUIDE RNA DESIGN (gRNA-24B):
- Spacer: 5'-GUCGACUGCACCGCGAUCCG-3'
- PAM Site: 5'-NGG-3' (Optimal binding efficiency: 98.4%)
- Predicted Off-Target Cleavage Score: <0.0012% (Near-Zero Off-Target Risk)

THERAPEUTIC SYNTHESIS PROTOCOL:
Incubation temperature: 37.0°C +/- 0.1°C in isotonic saline buffer.
Electroporation voltage: 1250V, pulse width 20ms, single discharge.
================================================================================`;

const WALLET_PLAINTEXT = `================================================================================
EMERGENCY COLD STORAGE DISASTER RECOVERY MNEMONIC
VAULT SERIAL: TREZOR-TITAN-X-882194
DEPOSIT KEY DERIVATION PATH: m/44'/0'/0'/0
================================================================================

BIP-39 RECOVERY SEED (24 WORDS):
echo timber lunar dynamic marble copper cascade solar
venture crystal puzzle timber flame oxygen canyon matrix
velvet orbit quantum galaxy hammer thunder shield balance

PRIMARY DERIVED VAULT ADDRESSES:
1. Native SegWit (P2WPKH): bc1q8w4q9z7x2e6k5j4l3m2n1p0r9s8t7u6v5w4x3y
2. Taproot (P2TR): bc1p5d76tf20...x99y1q8z

SECURITY PROTOCOL:
Store physical backup in Faraday enclosure. Verify checksum before broadcasting.
================================================================================`;

export function getInitialScenarios(): ScenarioPreset[] {
  const commonSaltHex = '4f89d2a1b903e87c654128f09d2e1b4a';

  // Real-world 256-bit (32-byte, 64-hex char) AES cryptographic keys
  const corpKey = '7f4c9a81e32d5b601e847c29ba04f1638d92e5c10fa4b8627e31d904c6e85242';
  const genomeKey = '9e82b7c410fa45d6e28f319bc704a5e18234db67e012fa983451bc78de9012a4';
  const walletKey = 'e5a190b24cf8173d6e04b9c812a3d4f57890123456789abcdef0123456789042';
  const hardKey = '3d8f2a1b9c0e4576a81234f9e0b5d6c718293a4b5c6d7e8f901234567890ab42';

  // Pre-generate Shamir shards for Scenario 2 (256-bit AES master key)
  const genomeKeyBytes = new TextEncoder().encode(genomeKey);
  const rawShards = splitSecret(genomeKeyBytes, 3, 2);

  const corpKeyHash = computeSHA256(corpKey + ':' + commonSaltHex);
  const genomeKeyHash = computeSHA256(genomeKey + ':' + commonSaltHex);
  const walletKeyHash = computeSHA256(walletKey + ':' + commonSaltHex);

  return [
    {
      id: 'corp_financial',
      title: 'Corporate Financial Vault',
      subtitle: '256-Bit AES-GCM Key (64-Hex) with damaged nonce suffix and intact hash checksum',
      category: 'corporate',
      description: 'Q3 treasury reconciliation document encrypted with a full 256-bit AES key. The 2-digit hex nonce suffix was lost in sector damage. Solved by decentralized pool worker load in seconds.',
      filename: 'financial_audit_2024.cenc',
      algorithm: 'AES-256-GCM (256-Bit Master Key)',
      targetChecksum: corpKeyHash,
      keyMaskHint: '7f4c9a81e32d5b601e847c29ba04f1638d92e5c10fa4b8627e31d904c6e852##',
      recoveryMode: 'pool_mining',
      defaultPassphrase: corpKey,
      samplePlaintext: FINANCIAL_PLAINTEXT,
      filetype: 'text/plain',
    },
    {
      id: 'biotech_genome',
      title: 'CRISPR BioTech Research Dossier',
      subtitle: '2-of-3 Shamir Threshold Quorum across distributed nodes (256-Bit AES Master Key)',
      category: 'biotech',
      description: 'Gene therapy recombination vector data. The 256-bit AES master key was sharded into 3 fragments of 64 hex characters. Node 1 (Zurich) and Node 2 (Reykjavik) are available.',
      filename: 'crispr_vector_data.cenc',
      algorithm: 'AES-256-GCM (256-Bit Shamir Quorum)',
      targetChecksum: genomeKeyHash,
      keyMaskHint: '2-of-3 SHAMIR QUORUM (256-BIT AES MASTER KEY)',
      recoveryMode: 'shamir_shards',
      defaultPassphrase: genomeKey,
      samplePlaintext: GENOME_PLAINTEXT,
      filetype: 'text/plain',
      shards: [
        {
          id: rawShards[0].id,
          dataHex: rawShards[0].dataHex,
          label: 'Shard #1 (Zurich Biome Vault Node)',
          available: true,
        },
        {
          id: rawShards[1].id,
          dataHex: rawShards[1].dataHex,
          label: 'Shard #2 (Reykjavik Secure Storage Node)',
          available: true,
        },
        {
          id: rawShards[2].id,
          dataHex: rawShards[2].dataHex,
          label: 'Shard #3 (Tokyo Secondary Replica - UNRECOVERABLE / OFFLINE)',
          available: false,
        },
      ],
    },
    {
      id: 'cold_wallet',
      title: 'Emergency Cold Storage Vault',
      subtitle: '256-Bit AES Key with corrupted header salt and checksum proof',
      category: 'personal',
      description: 'BIP-39 mnemonic seed words backup protected by a 256-bit symmetric key. Header salt and checksum are recoverable through decentralized worker consensus validation.',
      filename: 'emergency_cold_wallet.cenc',
      algorithm: 'AES-256-GCM (256-Bit Key)',
      targetChecksum: walletKeyHash,
      keyMaskHint: 'e5a190b24cf8173d6e04b9c812a3d4f57890123456789abcdef01234567890##',
      recoveryMode: 'pool_mining',
      defaultPassphrase: walletKey,
      samplePlaintext: WALLET_PLAINTEXT,
      filetype: 'text/plain',
    },
    {
      id: 'hard_recovery_saltless',
      title: 'Stripped Salt Ciphertext (Hard Recovery)',
      subtitle: '256-Bit AES Key with missing salt markers. Decrypts via decentralized brute-force with Plaintext Magic Oracle',
      category: 'corporate',
      description: 'Raw encrypted file with wiped/stripped headers. The decentralized mining pool brute-forces 256-bit candidate keys and salt archetypes against a Known-Plaintext Magic Oracle.',
      filename: 'stripped_confidential_db.bin',
      algorithm: 'AES-256-RAW (256-Bit Key, No Salt Markers)',
      targetChecksum: computeSHA256(hardKey + ':00000000000000000000000000000000'),
      keyMaskHint: '3d8f2a1b9c0e4576a81234f9e0b5d6c718293a4b5c6d7e8f901234567890ab##',
      recoveryMode: 'pool_mining',
      defaultPassphrase: hardKey,
      samplePlaintext: `================================================================================
CONFIDENTIAL ENTERPRISE DATABASE ARCHIVE (HARD RECOVERY RESTORED)
SOURCE: STRIPPED RAW CIPHERTEXT STREAM // NO SALT MARKERS FOUND
STATUS: RECONSTRUCTED VIA DECENTRALIZED POOL BRUTE-FORCE ORACLE
================================================================================

RECORD #001: Apex Strategic Liquidity Reserve: $42,500,000.00 USD
RECORD #002: Master Cold Storage Token Multisig: bc1q98...z2
RECORD #003: Cryptographic Key Protocol: 256-Bit AES-GCM Keystream
RECORD #004: Recovery Diagnostic: Salt Archetype [0x00 * 16 Null-Padding] matched.

ATTESTATION:
"The file payload was successfully decrypted without key derivation salt markers
by testing 256-bit candidate keys across 4 decentralized mining nodes against the ASCII
Plaintext Magic Oracle. All records verified intact."
================================================================================`,
      filetype: 'text/plain',
    },
  ];
}
