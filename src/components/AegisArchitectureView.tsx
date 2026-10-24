import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Cpu,
  Coins,
  FileCode,
  Terminal,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  Server,
  Zap,
  Download,
  AlertTriangle,
  Building2,
  Sliders,
  ShieldCheck,
  Check,
  Activity
} from 'lucide-react';
import { SwirlingNebulaBanner } from './SwirlingNebulaBanner';
import { CisaSeal } from './CisaSeal';

interface AegisArchitectureViewProps {
  onNavigateTab: (tabId: string) => void;
}

export const AegisArchitectureView: React.FC<AegisArchitectureViewProps> = ({ onNavigateTab }) => {
  const [activeSpecSection, setActiveSpecSection] = useState<'topology' | 'worker' | 'vault' | 'mesh' | 'matrix' | 'endpoint'>('topology');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* CISA Strategic Federal Header Banner - 100% vector SVG without external bitmap image */}
      <SwirlingNebulaBanner onNavigateTab={onNavigateTab} />

      {/* 4-Tier Interactive Mesh Topology Visualization (Section 1) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Section 1: Distributed Mesh Topology & Node Hierarchy
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Synchronized global infrastructure supporting millions of active endpoints and thousands of proof-of-security clusters.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-black/40 px-3 py-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            Classification: RESTRICTED // MASTER DIRECTORY
          </span>
        </div>

        {/* Tier Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tier 1: Endpoint Agents */}
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-3 relative overflow-hidden group hover:border-blue-500/60 transition">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold tracking-wider">
                Tier 1 • Client Mesh
              </span>
              <h3 className="text-sm font-mono font-bold text-white mt-0.5">
                Endpoint Agents
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Millions of distributed nodes across Windows, macOS, Linux, iOS & Android collecting real-time threat heuristic vectors.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Status: ACTIVE</span>
              <span className="text-blue-400 font-bold">1.4M+ Nodes</span>
            </div>
          </div>

          {/* Tier 2: Mining Pool Nodes */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-3 relative overflow-hidden group hover:border-amber-500/60 transition">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold tracking-wider">
                Tier 2 • Consensus Grid
              </span>
              <h3 className="text-sm font-mono font-bold text-white mt-0.5">
                Proof-of-Security Nodes
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Thousands of high-throughput worker daemons executing SHA-256 heuristic mining and threat matrix verification.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <button
                onClick={() => onNavigateTab('daemon')}
                className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Daemon Runner</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <span className="text-amber-400 font-bold">4,820 Nodes</span>
            </div>
          </div>

          {/* Tier 3: Cryptographic Arbitration Core */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-3 relative overflow-hidden group hover:border-emerald-500/60 transition">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                Tier 3 • Cryptographic Core
              </span>
              <h3 className="text-sm font-mono font-bold text-white mt-0.5">
                Arbitration Core
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                AES-256-GCM + PBKDF2 (600,000 iterations) + dynamic Merkle root state verification with 67% BFT consensus quorum.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <button
                onClick={() => onNavigateTab('vault')}
                className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Recovery Vault</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <span className="text-emerald-400 font-bold">Merkle Depth 32</span>
            </div>
          </div>

          {/* Tier 4: $AEGISCOIN Ledger */}
          <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-3 relative overflow-hidden group hover:border-purple-500/60 transition">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-purple-400 font-semibold tracking-wider">
                Tier 4 • Settlement Engine
              </span>
              <h3 className="text-sm font-mono font-bold text-white mt-0.5">
                $AEGISCOIN Metered Ledger
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Sub-second micro-token settlement (0.005 $AEGIS/sec) for uncensored routing, unlisted data streams, and automated billing.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <button
                onClick={() => onNavigateTab('mesh')}
                className="text-purple-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Mesh Resolver</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <span className="text-purple-400 font-bold">0.005 $AEGIS/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Master Specification Modules Browser */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              AEGIS Architecture Specification Sections
            </h2>
          </div>

          {/* Section Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'topology', label: '1. Mesh Topology' },
              { id: 'worker', label: '2. C++ Worker Daemon' },
              { id: 'vault', label: '3. 600k PBKDF2 Vault' },
              { id: 'mesh', label: '4. DNS & Micro-Billing' },
              { id: 'matrix', label: '5. Config Matrix 00001-00200' },
              { id: 'endpoint', label: '6. Endpoint Defense & Device Panel' },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSpecSection(sec.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer ${
                  activeSpecSection === sec.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Spec Content */}
        {activeSpecSection === 'topology' && (
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold text-emerald-400">
              1. Massive Distributed Mesh Topology & Consensus Hierarchy
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The AEGIS architecture scales globally across millions of active endpoints and thousands of high-throughput data centers. Each node maintains a real-time ledger of threat heuristic vectors, consensus hashes, and cryptographic subkeys.
            </p>
            <div className="p-4 rounded-xl bg-black/60 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
              <pre className="text-emerald-400">{`┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        AEGIS ULTRA-SCALED MESH ARCHITECTURE                            │
├─────────────────────────────────────┬──────────────────────────────────────────────────┤
│    Endpoint Agents (Millions)       │      Mining Pool Consensus Nodes (Thousands)    │
│ (Windows, macOS, Linux, iOS, Android)│      (Proof-of-Security & Threat Matrix Verification) │
└──────────────────┬──────────────────┴────────────────────────┬─────────────────────────┘
                   │                                           │
                   ▼                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Distributed Cryptographic Arbitration Core                      │
│            (AES-256-GCM + PBKDF2 + Dynamic Merkle Root State Verification)            │
└─────────────────────────────────────┬──────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                  $AEGISCOIN High-Throughput Metered Ledger                             │
│        (Sub-Second Settlement for Uncensored Routing & Unlisted Data Streams)          │
└────────────────────────────────────────────────────────────────────────────────────────┘`}</pre>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('pool')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <span>View Mining Pool Quorum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {activeSpecSection === 'worker' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono font-bold text-amber-400">
                  2. High-Throughput Proof-of-Security Worker Daemon (`aegis_pool_worker_max.cpp`)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-threaded C++ mining daemon calculating nonces for heuristic matrix chunk verification.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('daemon')}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-amber-500/30 transition cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Open Live Daemon Simulator</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-black/70 border border-slate-800 font-mono text-xs overflow-x-auto max-h-80">
              <pre className="text-slate-300">{`#include <iostream>
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
};`}</pre>
            </div>
          </div>
        )}

        {activeSpecSection === 'vault' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono font-bold text-emerald-400">
                  3. Ransomware Memory Inspection & Recovery Suite (`AegisEnterpriseRecoveryVault`)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  PBKDF2HMAC (600,000 iterations), AES-256-GCM authenticated decryption & SHA-256 checksum verification.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('vault')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-emerald-500/30 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Launch Enterprise Vault</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-black/70 border border-slate-800 font-mono text-xs overflow-x-auto max-h-80">
              <pre className="text-emerald-300/90">{`class AegisEnterpriseRecoveryVault:
    def __init__(self, iterations: int = 600000):
        self.iterations = iterations

    def derive_key_from_passphrase(self, passphrase: str, salt: bytes) -> bytes:
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=self.iterations,
        )
        return kdf.derive(passphrase.encode('utf-8'))

    def batch_recover_directory(self, vault_metadata_path: str, passphrase: str, destination_dir: str) -> bool:
        # Decrypts AESGCM ciphertext and validates SHA256 integrity checksum
        key = self.derive_key_from_passphrase(passphrase, salt)
        aesgcm = AESGCM(key)
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)

        if hashlib.sha256(plaintext).hexdigest() != expected_hash:
            print("[-] Integrity Error: Derived payload checksum mismatch.")
            return False
        return True`}</pre>
            </div>
          </div>
        )}

        {activeSpecSection === 'mesh' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono font-bold text-purple-400">
                  4. Decentralized Unlisted Mesh Resolution & Per-Second Billing (`AegisDecentralizedMeshResolver`)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cryptographic DNS subkey matching (`aegis_sub_{target_uri}`) and 0.005 $AEGIS/sec token settlement.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('mesh')}
                className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-purple-500/30 transition cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Open Mesh Console</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-black/70 border border-slate-800 font-mono text-xs overflow-x-auto max-h-80">
              <pre className="text-purple-300/90">{`class AegisDecentralizedMeshResolver:
    def __init__(self):
        self.state_ledger: Dict[str, dict] = {}
        self.wallet_balances: Dict[str, float] = {"enterprise_pool": 100000.0}

    def store_unlisted_target_payload(self, target_uri: str, payload: bytes) -> str:
        digest = hashlib.sha256(payload).hexdigest()
        self.state_ledger[target_uri] = {"timestamp": time.time(), "payload": payload, "digest": digest}
        return digest

    def stream_uncensored_content(self, target_uri: str, subkey: str, wallet_id: str, duration_sec: int) -> Optional[bytes]:
        expected_subkey = hashlib.sha256(f"aegis_sub_{target_uri}".encode()).hexdigest()[:16]
        if subkey != expected_subkey and subkey != "master_override_key":
            raise PermissionError("Invalid cryptographic DNS subkey for target routing.")

        cost = duration_sec * 0.005  # $AEGIS token rate per second
        self.wallet_balances[wallet_id] -= cost
        return self.state_ledger[target_uri]["payload"]`}</pre>
            </div>
          </div>
        )}

        {activeSpecSection === 'matrix' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono font-bold text-blue-400">
                  5. Repetitive Extension Protocol (Matrix Configuration Index 00001 - 00200)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Production node system profiles, cryptographic limits, and CISA federal compliance parameters.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('matrix')}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-blue-500/30 transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Explore Full Matrix Registry</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-black/70 border border-slate-800 font-mono text-xs space-y-1.5 text-slate-300">
              <div className="text-emerald-400 font-bold">• AEGIS_NODE_CONFIG_CORE_SETTING_PRIMARY_PORT = 9881</div>
              <div className="text-emerald-400 font-bold">• AEGIS_NODE_CONFIG_CORE_SETTING_THREAD_POOL_SIZE = 64</div>
              <div className="text-emerald-400 font-bold">• AEGIS_NODE_CONFIG_CORE_SETTING_MEMPOOL_SIZE_MB = 8192</div>
              <div className="text-emerald-400 font-bold">• AEGIS_NODE_CONFIG_CORE_SETTING_CONSENSUS_QUORUM_PERCENT = 67</div>
              <div className="text-amber-400 font-bold">• AEGIS_CRYPTO_ENGINE_PBKDF2_ITERATIONS = 600000</div>
              <div className="text-amber-400 font-bold">• AEGIS_CRYPTO_ENGINE_CIPHER_ALGORITHM = AES-256-GCM</div>
              <div className="text-amber-400 font-bold">• AEGIS_CRYPTO_ENGINE_ZERO_KNOWLEDGE_PROOF_ENGINE = SNARK</div>
              <div className="text-purple-400 font-bold">• AEGISCOIN_METERED_BILLING_RATE_PER_SEC = 0.005 $AEGIS</div>
            </div>
          </div>
        )}

        {activeSpecSection === 'endpoint' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono font-bold text-red-400">
                  6. Section 7: Malwarebytes-Inspired Endpoint Protection & Device Panel
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time threat heuristics, honeypot tripwires, hardware overlay guard, and instant unblock engine.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('shield')}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-red-500/30 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open Endpoint Shield</span>
              </button>
            </div>

            {/* Interactive Device Panel Mockup from Blueprint Section 7 */}
            <div className="rounded-2xl border border-slate-700 bg-slate-900/90 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 ml-2">AEGIS Endpoint Shield // Device Node: WORKSTATION-ALPHA-01</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  REAL-TIME SHIELD ARMED
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-bold text-sm">Anti-Ransomware</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    4 Canary honeypots monitored. Shannon entropy baseline 5.25 bits/byte.
                  </p>
                  <span className="text-[10px] text-emerald-400 font-bold block">Status: PROTECTED</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-blue-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Activity className="w-5 h-5" />
                    <span className="font-bold text-sm">Overlay Guard</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    TrustZone hardware compositing blocks touch-jacking and invisible overlays.
                  </p>
                  <span className="text-[10px] text-blue-400 font-bold block">Status: ACTIVE ENCLAVE</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Zap className="w-5 h-5" />
                    <span className="font-bold text-sm">Mesh Unblock</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Censorship-resistant TCP/UDP tunneling via $AEGIS micro-tokens.
                  </p>
                  <span className="text-[10px] text-purple-400 font-bold block">Status: 0.005 $AEGIS/SEC</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CISA Incident Response & Federal Playbook Compliance Card */}
      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/20 via-slate-900 to-black p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-black/60 border border-red-500/40 p-1 shrink-0 overflow-hidden flex items-center justify-center">
            <CisaSeal size={50} showRings={false} />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <span>CISA Incident Response & Federal Readiness Standard</span>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] uppercase">
                Zero-Trust BFT
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              In accordance with CISA Binding Operational Directive 22-01 and NIST SP 800-34 Rev. 1, all recovery operations generate immutable forensic audit certificates with SHA-256 attestation and zero bit-rot verification.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('certificate')}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider shrink-0 transition shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer"
        >
          <Building2 className="w-4 h-4" />
          <span>Forensic Audit Standard</span>
        </button>
      </div>
    </div>
  );
};

