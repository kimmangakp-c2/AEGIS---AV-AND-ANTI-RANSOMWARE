import React, { useEffect, useState } from 'react';
import { Cpu, Server, Activity, ShieldCheck, Zap, Globe, Layers, CheckCircle2, Play, RefreshCw } from 'lucide-react';
import { globalPoolManager, PoolState } from '../workers/poolManager';
import { computeSHA256 } from '../crypto/hashProof';

export const MiningPoolView: React.FC = () => {
  const [poolState, setPoolState] = useState<PoolState>(globalPoolManager.getState());
  const [customChallenge, setCustomChallenge] = useState('VAULT-RESTORE-ALPHA');
  const [challengeTarget, setChallengeTarget] = useState('');
  const [solvingChallenge, setSolvingChallenge] = useState(false);
  const [challengeResult, setChallengeResult] = useState<{
    solved: boolean;
    key?: string;
    node?: string;
    hashes: number;
    timeMs: number;
  } | null>(null);

  useEffect(() => {
    return globalPoolManager.subscribe(setPoolState);
  }, []);

  useEffect(() => {
    if (customChallenge) {
      setChallengeTarget(computeSHA256(customChallenge + ':pool_salt_01'));
    }
  }, [customChallenge]);

  const handleRunCustomSolver = async () => {
    setSolvingChallenge(true);
    setChallengeResult(null);

    const salt = 'pool_salt_01';
    const mask = customChallenge.slice(0, customChallenge.length - 2) + '##';
    const targetHash = computeSHA256(customChallenge + ':' + salt);

    const result = await globalPoolManager.mineKeyForChecksum(targetHash, salt, mask);
    setSolvingChallenge(false);

    if (result.success && result.key) {
      setChallengeResult({
        solved: true,
        key: result.key,
        node: result.solvingNode?.name || 'Tokyo Edge Hash Grid',
        hashes: 100,
        timeMs: result.durationMs,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Pool Header Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Global Hashrate</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {(poolState.totalHashrate / 1000).toFixed(2)} MH/s
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            Aggregated across 4 mining nodes
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Total Solved Nonces</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {poolState.totalNoncesScanned.toLocaleString()}
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            Cryptographic checksum matches
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Block Height</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            #{poolState.currentBlock.toLocaleString()}
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            Average block interval: ~12.4s
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">Consensus Protocol</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            BFT Proof-of-Recovery
          </div>
          <span className="text-[11px] font-mono text-emerald-400 mt-1 block">
            100% Quorum Integrity
          </span>
        </div>
      </div>

      {/* 4 Decentralized Mining Nodes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Server className="w-4 h-4" />
              Decentralized Mining Worker Nodes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Geographically distributed compute nodes mining candidate hash nonces in real-time.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
            4 / 4 Nodes Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {poolState.nodes.map((node) => (
            <div
              key={node.id}
              className={`p-5 rounded-2xl border transition-all ${
                node.status === 'mining'
                  ? 'border-amber-500/50 bg-amber-950/10 shadow-lg shadow-amber-500/10'
                  : node.status === 'solved'
                  ? 'border-emerald-500/60 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      node.status === 'mining'
                        ? 'bg-amber-400 animate-ping'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <h3 className="text-sm font-bold text-white font-mono">{node.name}</h3>
                </div>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  {node.location}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 my-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Hashrate</span>
                  <span className="text-emerald-400 font-bold">{node.hashrate} kH/s</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Shares Solved</span>
                  <span className="text-slate-200 font-semibold">{node.sharesSolved}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Latency</span>
                  <span className="text-slate-200">{node.latencyMs}ms</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/50">
                <span className="text-slate-500 truncate mr-2">{node.hardware}</span>
                <span className="text-emerald-400 font-semibold shrink-0">Uptime: {node.uptime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Hash Checksum Challenge Simulator */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              INTERACTIVE HASH CHALLENGE SIMULATOR
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Real-time SHA-256 Checksum Solver
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Test how decentralized nodes mine candidate nonces to solve target hash checksums. Enter any key string; the simulator masks the last 2 characters and broadcasts the cryptographic challenge to the mining pool.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1.5 font-semibold">
              Input Target Secret / Passphrase:
            </label>
            <input
              type="text"
              value={customChallenge}
              onChange={(e) => setCustomChallenge(e.target.value)}
              placeholder="e.g. SECURE-RESCUE-42"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1.5 font-semibold">
              Computed Target Checksum (SHA-256):
            </label>
            <div className="p-2.5 rounded-xl bg-black/60 border border-slate-800 text-[11px] text-emerald-400/90 break-all select-all">
              {challengeTarget}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-mono text-slate-400">
            Mask search space: <code className="text-amber-400 font-bold">{customChallenge.slice(0, customChallenge.length - 2)}##</code> (100 candidate nonces)
          </span>

          <button
            onClick={handleRunCustomSolver}
            disabled={solvingChallenge || !customChallenge}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
              solvingChallenge
                ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {solvingChallenge ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mining Challenge...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Solve Via Mining Pool</span>
              </>
            )}
          </button>
        </div>

        {/* Challenge Solved Result Banner */}
        {challengeResult && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-emerald-400 font-bold block mb-1">
                ✓ CHECKSUM PROOF SOLVED BY {(challengeResult.node || 'DECENTRALIZED POOL').toUpperCase()}
              </span>
              <span className="text-slate-300">
                Recovered Key: <strong className="text-white bg-black/50 px-2 py-0.5 rounded">{challengeResult.key}</strong>
              </span>
            </div>
            <div className="text-slate-400 text-right">
              <span>Time: {(challengeResult.timeMs / 1000).toFixed(2)}s</span>
              <span className="block text-[11px] text-emerald-400">100% Cryptographic Match</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
