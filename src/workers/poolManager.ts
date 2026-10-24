import { MiningNode } from '../types';
import { computeSHA256, generateCandidatesFromMask } from '../crypto/hashProof';

export interface PoolState {
  nodes: MiningNode[];
  totalHashrate: number;
  totalNoncesScanned: number;
  currentBlock: number;
  isMining: boolean;
  activeCandidate?: string;
  solvedBlock?: {
    nonce: number;
    foundKey: string;
    nodeId: string;
    targetHash: string;
    timestamp: string;
  };
}

export type PoolListener = (state: PoolState) => void;

export class DecentralizedPoolManager {
  private nodes: MiningNode[] = [
    {
      id: 'node-zh',
      name: 'Zurich Genesis Node (EU-Central)',
      location: 'Zurich, Switzerland',
      hashrate: 1420,
      sharesSolved: 84,
      status: 'active',
      latencyMs: 14,
      uptime: '99.98%',
      hardware: 'Dual AMD EPYC 9654 // AVX-512 Vectorized Engine',
    },
    {
      id: 'node-tk',
      name: 'Tokyo Edge Hash Grid (AP-East)',
      location: 'Tokyo, Japan',
      hashrate: 2150,
      sharesSolved: 129,
      status: 'active',
      latencyMs: 42,
      uptime: '99.94%',
      hardware: '4x NVIDIA H100 Tensor Core // CUDA Hash Accelerator',
    },
    {
      id: 'node-rk',
      name: 'Reykjavik Hydro Proof Vault (EU-North)',
      location: 'Reykjavik, Iceland',
      hashrate: 890,
      sharesSolved: 53,
      status: 'active',
      latencyMs: 38,
      uptime: '100.0%',
      hardware: 'Geothermal Compute Cluster // Zero-Carbon ASICs',
    },
    {
      id: 'node-va',
      name: 'Virginia Quorum Validator (US-East)',
      location: 'Ashburn, USA',
      hashrate: 1280,
      sharesSolved: 76,
      status: 'active',
      latencyMs: 18,
      uptime: '99.99%',
      hardware: 'Decentralized Bare-Metal Pool // P2P Consensus Relay',
    },
  ];

  private listeners: Set<PoolListener> = new Set();
  private isMining = false;
  private abortController: AbortController | null = null;
  private totalNoncesScanned = 184920;
  private currentBlock = 894210;
  private activeCandidate = '';

  constructor() {
    this.startBackgroundPulse();
  }

  public subscribe(listener: PoolListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private emit() {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }

  public getState(): PoolState {
    const totalHashrate = this.nodes.reduce((acc, n) => acc + (n.status === 'mining' ? n.hashrate : n.hashrate * 0.4), 0);
    return {
      nodes: [...this.nodes],
      totalHashrate: Math.round(totalHashrate),
      totalNoncesScanned: this.totalNoncesScanned,
      currentBlock: this.currentBlock,
      isMining: this.isMining,
      activeCandidate: this.activeCandidate,
    };
  }

  private startBackgroundPulse() {
    // Occasional simulated network block discovery every 12 seconds
    setInterval(() => {
      if (!this.isMining) {
        this.currentBlock += 1;
        this.totalNoncesScanned += Math.floor(Math.random() * 500) + 120;
        this.emit();
      }
    }, 12000);
  }

  /**
   * Dispatches a cryptographic hash recovery job to the decentralized pool.
   * Tests candidates against target checksum using real SHA-256 rounds.
   */
  public async mineKeyForChecksum(
    targetChecksum: string,
    saltHex: string,
    patternMask: string,
    onProgress?: (checked: number, candidate: string, nodeName: string) => void
  ): Promise<{ success: boolean; key?: string; solvingNode?: MiningNode; durationMs: number }> {
    this.isMining = true;
    this.abortController = new AbortController();
    const startTime = Date.now();

    // Set nodes to mining state
    this.nodes = this.nodes.map((n) => ({ ...n, status: 'mining' }));
    this.emit();

    const candidates = generateCandidatesFromMask(patternMask, 3000);
    const targetClean = targetChecksum.toLowerCase().trim();

    let solvedKey: string | undefined;
    let winningNode: MiningNode | undefined;

    // Distribute candidates across the 4 nodes in chunks
    const chunkSize = 25;
    let checkedCount = 0;

    try {
      for (let i = 0; i < candidates.length; i += chunkSize) {
        if (this.abortController.signal.aborted) {
          break;
        }

        const chunk = candidates.slice(i, i + chunkSize);
        // Cycle active node
        const nodeIndex = Math.floor((i / chunkSize) % this.nodes.length);
        const node = this.nodes[nodeIndex];

        // Process chunk
        for (const candidate of chunk) {
          checkedCount++;
          this.totalNoncesScanned++;
          this.activeCandidate = candidate;

          // Compute real cryptographic hash
          const hash = computeSHA256(candidate + ':' + saltHex);

          if (onProgress && checkedCount % 3 === 0) {
            onProgress(checkedCount, candidate, node.name);
          }

          if (hash.toLowerCase() === targetClean) {
            solvedKey = candidate;
            winningNode = node;
            break;
          }
        }

        if (solvedKey) {
          break;
        }

        this.emit();
        // Give time slice back to event loop for smooth UI rendering
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
    } finally {
      this.isMining = false;
      this.activeCandidate = '';

      if (solvedKey && winningNode) {
        winningNode.sharesSolved += 1;
        winningNode.status = 'solved';
        this.nodes = this.nodes.map((n) =>
          n.id === winningNode?.id ? { ...winningNode, status: 'solved' } : { ...n, status: 'active' }
        );
      } else {
        this.nodes = this.nodes.map((n) => ({ ...n, status: 'active' }));
      }

      this.emit();
    }

    const durationMs = Date.now() - startTime;
    return {
      success: !!solvedKey,
      key: solvedKey,
      solvingNode: winningNode,
      durationMs,
    };
  }

  public abortMining() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.isMining = false;
    this.nodes = this.nodes.map((n) => ({ ...n, status: 'active' }));
    this.emit();
  }

  /**
   * Hard Recovery Brute-Force:
   * When key derivation salt markers are missing/stripped, worker nodes brute-force
   * candidate keys and salt archetypes against a Known-Plaintext Magic Byte Oracle.
   */
  public async mineHardRecoveryBruteForce(
    ciphertext: Uint8Array,
    candidateSalt: string,
    keyMask: string,
    oracleType: string,
    onProgress?: (checked: number, candidate: string, nodeName: string) => void
  ): Promise<{
    success: boolean;
    key?: string;
    saltUsed?: string;
    solvingNode?: MiningNode;
    preview?: string;
    durationMs: number;
  }> {
    this.isMining = true;
    this.abortController = new AbortController();
    const startTime = Date.now();

    this.nodes = this.nodes.map((n) => ({ ...n, status: 'mining' }));
    this.emit();

    const candidates = generateCandidatesFromMask(keyMask, 2000);
    let solvedKey: string | undefined;
    let winningNode: MiningNode | undefined;
    let solvedPreview: string | undefined;

    const chunkSize = 20;
    let checkedCount = 0;

    try {
      for (let i = 0; i < candidates.length; i += chunkSize) {
        if (this.abortController.signal.aborted) {
          break;
        }

        const chunk = candidates.slice(i, i + chunkSize);
        const nodeIndex = Math.floor((i / chunkSize) % this.nodes.length);
        const node = this.nodes[nodeIndex];

        for (const candidate of chunk) {
          checkedCount++;
          this.totalNoncesScanned++;
          this.activeCandidate = candidate;

          // Perform trial decryption against the plaintext oracle
          // We test against the first 64 bytes of ciphertext
          const slice = ciphertext.slice(0, Math.min(ciphertext.length, 64));
          const { trialDecryptionOracle } = await import('../crypto/hardRecovery');
          const result = trialDecryptionOracle(slice, candidate, candidateSalt, oracleType);

          if (onProgress && checkedCount % 4 === 0) {
            onProgress(checkedCount, candidate, node.name);
          }

          if (result.matched) {
            solvedKey = candidate;
            winningNode = node;
            solvedPreview = result.preview;
            break;
          }
        }

        if (solvedKey) {
          break;
        }

        this.emit();
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
    } finally {
      this.isMining = false;
      this.activeCandidate = '';

      if (solvedKey && winningNode) {
        winningNode.sharesSolved += 1;
        winningNode.status = 'solved';
        this.nodes = this.nodes.map((n) =>
          n.id === winningNode?.id ? { ...winningNode, status: 'solved' } : { ...n, status: 'active' }
        );
      } else {
        this.nodes = this.nodes.map((n) => ({ ...n, status: 'active' }));
      }

      this.emit();
    }

    const durationMs = Date.now() - startTime;
    return {
      success: !!solvedKey,
      key: solvedKey,
      saltUsed: candidateSalt,
      solvingNode: winningNode,
      preview: solvedPreview,
      durationMs,
    };
  }
}

export const globalPoolManager = new DecentralizedPoolManager();
