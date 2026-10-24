import React, { useState } from 'react';
import { Database, ShieldCheck, Key, RefreshCw, AlertCircle, CheckCircle2, Split, Layers, Copy, Check } from 'lucide-react';
import { splitSecret, combineShards, KeyShard } from '../crypto/shamir';
import { computeSHA256 } from '../crypto/hashProof';

export const ShamirCombiner: React.FC = () => {
  // Initial 2-of-3 threshold demo matching Scenario 2 (256-bit AES-GCM Master Key)
  const initialSecret = '9e82b7c410fa45d6e28f319bc704a5e18234db67e012fa983451bc78de9012a4';
  const initialShards = splitSecret(new TextEncoder().encode(initialSecret), 3, 2);

  const [activeShards, setActiveShards] = useState<{
    id: number;
    dataHex: string;
    label: string;
    selected: boolean;
    status: 'online' | 'corrupted' | 'custom';
  }[]>([
    {
      id: 1,
      dataHex: initialShards[0].dataHex,
      label: 'Custodian Node Alpha (Zurich Bio-Archive)',
      selected: true,
      status: 'online',
    },
    {
      id: 2,
      dataHex: initialShards[1].dataHex,
      label: 'Storage Node Beta (Reykjavik Vault Cluster)',
      selected: true,
      status: 'online',
    },
    {
      id: 3,
      dataHex: initialShards[2].dataHex,
      label: 'Secondary Replica Gamma (Tokyo - Sector Damaged)',
      selected: false,
      status: 'corrupted',
    },
  ]);

  const [reconstructedKey, setReconstructedKey] = useState<string | null>(null);
  const [reconstructedHex, setReconstructedHex] = useState<string | null>(null);
  const [reconstructionStatus, setReconstructionStatus] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // New Shard Generator State (Full 256-bit AES Key)
  const [newSecretInput, setNewSecretInput] = useState(
    '7f4c9a81e32d5b601e847c29ba04f1638d92e5c10fa4b8627e31d904c6e852a1'
  );
  const [totalShares, setTotalShares] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [generatedShards, setGeneratedShards] = useState<KeyShard[]>([]);

  // Execute Lagrange Interpolation
  const handleReconstruct = () => {
    const selected = activeShards.filter((s) => s.selected);

    if (selected.length < 2) {
      setReconstructionStatus(
        'Threshold Error: Shamir polynomial requires at least k=2 independent shards. Single shard leaks zero information.'
      );
      setReconstructedKey(null);
      return;
    }

    try {
      const shardsForCombine: KeyShard[] = selected.map((s) => ({
        id: s.id,
        dataHex: s.dataHex,
      }));

      const bytes = combineShards(shardsForCombine);
      const decodedText = new TextDecoder().decode(bytes);
      const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');

      setReconstructedKey(decodedText);
      setReconstructedHex(hex);
      setReconstructionStatus(
        `✓ Quorum Satisfied (${selected.length} shards). Master key recovered via GF(2^8) Lagrange interpolation.`
      );
    } catch (err) {
      setReconstructionStatus(
        `Reconstruction failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
      setReconstructedKey(null);
    }
  };

  const handleGenerateShards = () => {
    if (!newSecretInput) return;
    const bytes = new TextEncoder().encode(newSecretInput);
    const shards = splitSecret(bytes, totalShares, threshold);
    setGeneratedShards(shards);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Overview Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <Database className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            SHAMIR'S SECRET SHARING (SSS) QUORUM RECOVERY STUDIO
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Decentralized recovery uses threshold cryptography over Galois Field <code className="text-emerald-400 font-bold">GF(2^8)</code>. Even if servers suffer partial hardware loss, any <strong className="text-slate-200">k-of-n shards</strong> can mathematically restore the master AES-256 decryption key without exposing the key on any single node.
        </p>
      </div>

      {/* Main Quorum Combiner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Shard Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Available Distributed Key Shards (Threshold: 2 of 3)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Selected: <strong className="text-emerald-400">{activeShards.filter((s) => s.selected).length} / 3</strong>
            </span>
          </div>

          <div className="space-y-3">
            {activeShards.map((shard) => (
              <div
                key={shard.id}
                className={`p-4 rounded-xl border transition-all ${
                  shard.selected
                    ? 'border-emerald-500/50 bg-emerald-950/20 shadow-md shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-900/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`shard-${shard.id}`}
                      checked={shard.selected}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setActiveShards((prev) =>
                          prev.map((s) => (s.id === shard.id ? { ...s, selected: checked } : s))
                        );
                      }}
                      className="w-4 h-4 text-emerald-500 rounded bg-black/60 border-slate-700 cursor-pointer"
                    />
                    <label
                      htmlFor={`shard-${shard.id}`}
                      className="text-xs font-mono font-bold text-white cursor-pointer"
                    >
                      Shard ID #{shard.id} — {shard.label}
                    </label>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                      shard.status === 'online'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                        : 'bg-red-950/60 text-red-300 border-red-800/40'
                    }`}
                  >
                    {shard.status === 'online' ? 'Verified Online' : 'Node Corrupted'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-400 break-all select-all">
                  <span className="text-slate-600 mr-2">HEX SHARD:</span>
                  {shard.dataHex}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleReconstruct}
            className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <Split className="w-4 h-4" />
            <span>Execute GF(2^8) Lagrange Recombination</span>
          </button>

          {/* Status Message */}
          {reconstructionStatus && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
                reconstructedKey
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/40 border-red-800 text-red-300'
              }`}
            >
              {reconstructedKey ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{reconstructionStatus}</span>
            </div>
          )}
        </div>

        {/* Recovered Master Key Output (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Recovered Master Key
                  </h3>
                </div>
                {reconstructedKey && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Active Quorum
                  </span>
                )}
              </div>

              {reconstructedKey ? (
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block mb-1">
                      Plaintext Key String:
                    </span>
                    <div className="p-3 rounded-xl bg-black/80 border border-emerald-500/50 text-emerald-300 font-bold text-sm flex items-center justify-between">
                      <span>{reconstructedKey}</span>
                      <button
                        onClick={() => handleCopy(reconstructedKey)}
                        className="text-slate-400 hover:text-emerald-300 cursor-pointer"
                        aria-label="Copy key"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block mb-1">
                      Hex-Encoded Master Key (GF Field Output):
                    </span>
                    <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-[11px] text-slate-300 break-all select-all">
                      {reconstructedHex}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block mb-1">
                      Key Verification SHA-256 Checksum:
                    </span>
                    <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-[11px] text-emerald-400/90 break-all">
                      {computeSHA256(reconstructedKey)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  <Key className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
                  <p>Select at least 2 shards and execute Lagrange recombination to compute the master key.</p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-slate-800/80 text-[11px] font-mono text-slate-400">
              💡 <strong>Cryptographic Principle:</strong> Shamir secret sharing guarantees information-theoretic security. Any $k-1$ shards reveal mathematically zero information about the secret.
            </div>
          </div>
        </div>
      </div>

      {/* Fresh Shard Quorum Generator Studio */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Split className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Create New Shamir Sharded Key Quorum
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Split Any Secret Into Fault-Tolerant Fragments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="md:col-span-1 space-y-1.5">
            <label className="text-slate-400 block font-semibold">Master Secret to Shard:</label>
            <input
              type="text"
              value={newSecretInput}
              onChange={(e) => setNewSecretInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-800 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 block font-semibold">Total Custody Shards (n):</label>
            <select
              value={totalShares}
              onChange={(e) => setTotalShares(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
            >
              {[3, 4, 5, 6, 7].map((num) => (
                <option key={num} value={num}>
                  {num} Distributed Shards
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 block font-semibold">Quorum Threshold (k):</label>
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
            >
              {[2, 3, 4, 5].filter((k) => k <= totalShares).map((num) => (
                <option key={num} value={num}>
                  {num} Required to Reconstruct
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateShards}
          className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700 cursor-pointer flex items-center gap-2"
        >
          <Split className="w-4 h-4 text-emerald-400" />
          <span>Generate Distributed Shards</span>
        </button>

        {generatedShards.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <span className="text-xs font-mono text-emerald-400 font-bold block">
              Generated {generatedShards.length} Shards (Threshold: {threshold}):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
              {generatedShards.map((s) => (
                <div key={s.id} className="p-3 rounded-lg bg-black/60 border border-slate-800 text-[11px]">
                  <span className="text-emerald-400 font-bold block mb-0.5">Shard #{s.id}</span>
                  <span className="text-slate-400 break-all select-all">{s.dataHex}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
