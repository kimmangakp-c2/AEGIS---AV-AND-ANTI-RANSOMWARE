export interface MiningNode {
  id: string;
  name: string;
  location: string;
  hashrate: number; // in kH/s
  sharesSolved: number;
  status: 'active' | 'mining' | 'solved' | 'idle';
  latencyMs: number;
  uptime: string;
  hardware: string;
}

export interface HashMiningJob {
  targetHash: string;
  saltHex: string;
  patternMask: string;
  difficultyBits?: number;
}

export interface RestoredFile {
  filename: string;
  filetype: string;
  filesize: number;
  recoveredKey: string;
  plaintextChecksum: string;
  content: string; // text or base64
  isBinary: boolean;
  recoveredAt: string;
  solvedByNode: string;
  hashesChecked: number;
  timeTakenMs: number;
}

export interface ScenarioPreset {
  id: string;
  title: string;
  subtitle: string;
  category: 'corporate' | 'biotech' | 'personal';
  description: string;
  filename: string;
  algorithm: string;
  targetChecksum: string;
  keyMaskHint: string;
  recoveryMode: 'pool_mining' | 'shamir_shards' | 'header_repair';
  defaultPassphrase?: string;
  samplePlaintext: string;
  filetype: string;
  shards?: Array<{ id: number; dataHex: string; label: string; available: boolean }>;
}
