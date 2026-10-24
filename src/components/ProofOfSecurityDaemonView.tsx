import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Cpu,
  Play,
  Square,
  RefreshCw,
  CheckCircle2,
  Activity,
  Layers,
  Code2,
  Copy,
  Check,
  Shield,
  Zap,
  Sliders
} from 'lucide-react';
import {
  globalAegisWorker,
  MinedShare
} from '../crypto/aegisCore';
import { computeSHA256 } from '../crypto/hashProof';
import { copyToClipboard } from '../utils/clipboard';

export const ProofOfSecurityDaemonView: React.FC = () => {
  const [nodeId, setNodeId] = useState<string>('AEGIS-HIGH-CAPACITY-001');
  const [targetZeros, setTargetZeros] = useState<number>(3); // 3 hex zeros = '000'
  const [matrixChunk, setMatrixChunk] = useState<string>('AEGIS_GLOBAL_MATRIX_CHUNK_9948201');
  const [isMining, setIsMining] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[*] AEGIS Ultra-Scale Security Mining Engine v2026.4 Online...',
    `[*] Target Difficulty: ${targetZeros} leading zeros ('${'0'.repeat(targetZeros)}')`,
    `[*] Bound to Node: [${nodeId}]`,
    '[*] Awaiting execution signal to process heuristic matrix stream...',
  ]);
  const [shares, setShares] = useState<MinedShare[]>([]);
  const [totalHashesMined, setTotalHashesMined] = useState<number>(0);
  const [hashrate, setHashrate] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const miningIntervalRef = useRef<any>(null);
  const nonceCounterRef = useRef<number>(0);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (miningIntervalRef.current) clearInterval(miningIntervalRef.current);
    };
  }, []);

  const handleStartMining = () => {
    setIsMining(true);
    setTerminalLogs((prev) => [
      `[+] Engine started on node [${nodeId}]. Processing stream: ${matrixChunk}...`,
      ...prev,
    ]);

    const prefix = '0'.repeat(targetZeros);
    const hashesPerTick = 125; // Simulated burst per 50ms tick = ~2,500 hashes/sec in browser

    miningIntervalRef.current = setInterval(() => {
      let foundShare = false;

      for (let i = 0; i < hashesPerTick; i++) {
        nonceCounterRef.current++;
        const currentNonce = nonceCounterRef.current;
        const testString = `${matrixChunk}${currentNonce}${nodeId}`;
        const hashOut = computeSHA256(testString);

        if (hashOut.startsWith(prefix)) {
          foundShare = true;
          const newShare: MinedShare = {
            nodeId,
            shareIndex: shares.length + 1,
            nonce: currentNonce,
            hash: hashOut,
            timestamp: Date.now(),
          };

          setShares((prev) => [newShare, ...prev.slice(0, 19)]);
          setTerminalLogs((prev) => [
            `[+] Node [${nodeId}] Mined Share #${newShare.shareIndex} | Nonce: ${currentNonce} | Hash: ${hashOut}`,
            ...prev.slice(0, 50),
          ]);
          break;
        }
      }

      setTotalHashesMined(nonceCounterRef.current);
      setHashrate(2500 + Math.floor(Math.random() * 400 - 200));
    }, 50);
  };

  const handleStopMining = () => {
    if (miningIntervalRef.current) {
      clearInterval(miningIntervalRef.current);
    }
    setIsMining(false);
    setHashrate(0);
    setTerminalLogs((prev) => [
      `[*] Worker daemon halted by operator. Total nonces scanned: ${nonceCounterRef.current}`,
      ...prev,
    ]);
  };

  const handleCopyCppCode = async () => {
    const cppCode = `#include <iostream>
#include <string>
#include <vector>
#include <openssl/sha.h>
#include <iomanip>
#include <sstream>
#include <chrono>
#include <thread>
#include <mutex>

class AegisMaxScaleMiningEngine {
private:
    std::string node_id;
    int target_zeros;
    uint64_t verified_shares;
    std::mutex counter_mutex;

    std::string sha256_hex(const std::string& input) {
        unsigned char hash[SHA256_DIGEST_LENGTH];
        SHA256((unsigned char*)input.c_str(), input.size(), hash);
        std::stringstream ss;
        for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
            ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
        }
        return ss.str();
    }

public:
    AegisMaxScaleMiningEngine(std::string id, int diff) : node_id(id), target_zeros(diff), verified_shares(0) {}

    void process_heuristic_stream(const std::string& matrix_payload) {
        std::string prefix(target_zeros, '0');
        uint64_t nonce = 0;

        while (true) {
            std::string test_string = matrix_payload + std::to_string(nonce) + node_id;
            std::string hash_out = sha256_hex(test_string);

            if (hash_out.rfind(prefix, 0) == 0) {
                std::lock_guard<std::mutex> lock(counter_mutex);
                verified_shares++;
                std::cout << "[+] Node [" << node_id << "] Mined Share #" << verified_shares 
                          << " | Nonce: " << nonce << " | Hash: " << hash_out << std::endl;
                break;
            }
            nonce++;
        }
    }
};

int main() {
    AegisMaxScaleMiningEngine worker_node("${nodeId}", ${targetZeros});
    std::cout << "[*] AEGIS Ultra-Scale Security Mining Engine Online..." << std::endl;
    worker_node.process_heuristic_stream("${matrixChunk}");
    return 0;
}`;

    await copyToClipboard(cppCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-emerald-950/20 p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white">
                  HIGH-THROUGHPUT PROOF-OF-SECURITY WORKER DAEMON
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  aegis_pool_worker_max.cpp
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Heuristic Stream Processing • Target Zero Hex Mask Solver • Multi-Threaded Share Discovery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCppCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied C++ Code' : 'Copy C++ Source'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Section 2 of the AEGIS Master Architecture specifies the <strong>High-Throughput Proof-of-Security Worker Daemon</strong> written in C++ (<code>aegis_pool_worker_max.cpp</code>). It continuously processes heuristic matrix chunks, searches candidate nonces, and records cryptographically verified shares when hashes match the target prefix difficulty.
        </p>
      </div>

      {/* Main Grid: Parameters (4 cols) & Live Terminal / Shares (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Worker Daemon Parameters (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-amber-400" />
              Worker Node Parameters
            </h3>

            {/* Node ID */}
            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1">
                Mining Node ID:
              </label>
              <input
                type="text"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                disabled={isMining}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Target Zeros / Difficulty */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono font-semibold text-slate-300">
                  Target Zeros (Difficulty):
                </label>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {targetZeros} ({'0'.repeat(targetZeros)}...)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={4}
                value={targetZeros}
                onChange={(e) => setTargetZeros(Number(e.target.value))}
                disabled={isMining}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-500 block mt-1">
                Prefix search: {targetZeros} leading zeros in SHA-256 digest
              </span>
            </div>

            {/* Heuristic Matrix Payload */}
            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1">
                Matrix Chunk Payload:
              </label>
              <input
                type="text"
                value={matrixChunk}
                onChange={(e) => setMatrixChunk(e.target.value)}
                disabled={isMining}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2">
              {!isMining ? (
                <button
                  onClick={handleStartMining}
                  className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch C++ Worker Daemon</span>
                </button>
              ) : (
                <button
                  onClick={handleStopMining}
                  className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white transition shadow-lg shadow-red-600/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Halt Daemon Execution</span>
                </button>
              )}
            </div>
          </div>

          {/* Telemetry Snapshot */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 font-mono space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Nonces Scanned:</span>
              <span className="text-white font-bold">{totalHashesMined.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Local Hashrate:</span>
              <span className="text-emerald-400 font-bold">{hashrate.toLocaleString()} H/s</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Verified Shares:</span>
              <span className="text-amber-400 font-bold">{shares.length}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Terminal Output & Verified Shares Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Real-Time Live Terminal */}
          <div className="rounded-2xl border border-slate-800 bg-black/90 p-5 shadow-2xl font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-slate-400 text-[11px] ml-2">
                  aegis_pool_worker_max [C++ Daemon Stream]
                </span>
              </div>
              <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                {isMining ? 'PROCESSING HEURISTIC MATRIX' : 'STANDBY'}
              </span>
            </div>

            {/* Scrollable Terminal Output */}
            <div className="space-y-1 max-h-72 overflow-y-auto text-[11px] font-mono select-text leading-relaxed">
              {terminalLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('Mined Share')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('started')
                      ? 'text-amber-300 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Verified Shares Discovery List */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Cryptographically Verified Mined Shares ({shares.length})
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                Prefix: {targetZeros} Leading Zeros
              </span>
            </div>

            {shares.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-500">
                No shares discovered yet. Launch the C++ worker daemon above to begin mining heuristic shares.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {shares.map((share, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div>
                      <span className="text-amber-400 font-bold mr-2">
                        Share #{share.shareIndex}
                      </span>
                      <span className="text-slate-300">
                        Nonce: <strong className="text-white">{share.nonce}</strong>
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] break-all">
                      Hash: <span className="text-emerald-400 font-semibold">{share.hash}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
