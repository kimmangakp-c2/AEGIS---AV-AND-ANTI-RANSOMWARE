import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Coins,
  Globe,
  Lock,
  Unlock,
  Radio,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Server,
  FileText
} from 'lucide-react';
import {
  globalAegisMeshResolver,
  MeshLedgerEntry
} from '../crypto/aegisCore';
import { computeSHA256 } from '../crypto/hashProof';

export const MeshResolverView: React.FC = () => {
  const [entries, setEntries] = useState<MeshLedgerEntry[]>(
    globalAegisMeshResolver.getAllLedgerEntries()
  );
  const [selectedUri, setSelectedUri] = useState<string>(entries[0]?.targetUri || '');
  const [subkeyInput, setSubkeyInput] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('enterprise_pool');
  const [walletBalance, setWalletBalance] = useState<number>(
    globalAegisMeshResolver.getWalletBalance('enterprise_pool')
  );

  // Streaming state
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamDurationSec, setStreamDurationSec] = useState<number>(0);
  const [totalCostDeducted, setTotalCostDeducted] = useState<number>(0);
  const [streamedChunks, setStreamedChunks] = useState<string[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // New payload modal state
  const [newUri, setNewUri] = useState<string>('aegis://intel/defense-satellite-09');
  const [newPayload, setNewPayload] = useState<string>('ORBITAL_TELEMETRY: Lat=38.8951 Long=-77.0364 Apogee=35786km Encryption=AES256GCM');
  const [newContentType, setNewContentType] = useState<string>('text/plain');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const streamTimerRef = useRef<any>(null);

  const currentExpectedSubkey = selectedUri
    ? globalAegisMeshResolver.deriveExpectedSubkey(selectedUri)
    : '';

  // Synchronize initial subkey
  useEffect(() => {
    if (selectedUri) {
      setSubkeyInput(globalAegisMeshResolver.deriveExpectedSubkey(selectedUri));
    }
  }, [selectedUri]);

  // Clean up streaming on unmount
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, []);

  const handleStartStream = () => {
    setStreamError(null);
    try {
      // Test first 1 second immediately to validate subkey and balance
      const res = globalAegisMeshResolver.streamUncensoredContent(
        selectedUri,
        subkeyInput,
        walletId,
        1
      );

      setIsStreaming(true);
      setStreamDurationSec(1);
      setTotalCostDeducted(0.005);
      setWalletBalance(globalAegisMeshResolver.getWalletBalance(walletId));
      setStreamedChunks([`[00:01] INGRESS: 512 bytes received | SHA-256 Digest: ${res.digest.slice(0, 16)}...`]);

      // Interval per second
      streamTimerRef.current = setInterval(() => {
        try {
          const nextSecResult = globalAegisMeshResolver.streamUncensoredContent(
            selectedUri,
            subkeyInput,
            walletId,
            1
          );

          setStreamDurationSec((prev) => {
            const nextSec = prev + 1;
            const formattedTime = String(Math.floor(nextSec / 60)).padStart(2, '0') + ':' + String(nextSec % 60).padStart(2, '0');
            setStreamedChunks((prevChunks) => [
              `[${formattedTime}] PACKET #${nextSec}: Verified subkey routing | Rate 0.005 $AEGIS/s`,
              ...prevChunks.slice(0, 20),
            ]);
            return nextSec;
          });

          setTotalCostDeducted((prev) => prev + 0.005);
          setWalletBalance(globalAegisMeshResolver.getWalletBalance(walletId));
        } catch (err: any) {
          clearInterval(streamTimerRef.current);
          setIsStreaming(false);
          setStreamError(err.message || 'Stream halted due to protocol error.');
        }
      }, 1000);
    } catch (err: any) {
      setStreamError(err.message || 'Unable to establish streaming route.');
    }
  };

  const handleStopStream = () => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
    }
    setIsStreaming(false);
  };

  const handleStoreNewPayload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUri || !newPayload) return;

    globalAegisMeshResolver.storeUnlistedTargetPayload(newUri, newPayload, newContentType);
    setEntries(globalAegisMeshResolver.getAllLedgerEntries());
    setSelectedUri(newUri);
    setShowAddModal(false);
  };

  const handleDepositTokens = (amount: number) => {
    const updated = globalAegisMeshResolver.depositWallet(walletId, amount);
    setWalletBalance(updated);
  };

  const selectedEntry = entries.find((e) => e.targetUri === selectedUri);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Banner */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-slate-900/60 to-emerald-950/20 p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white">
                  DECENTRALIZED UNLISTED MESH RESOLUTION & PER-SECOND BILLING
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  Section 4 Daemon
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Cryptographic DNS Subkey Matching • 0.005 $AEGIS/sec Metered Settlement • Censorship-Resistant Stream Delivery
              </p>
            </div>
          </div>

          {/* Wallet Balance Display */}
          <div className="flex items-center gap-3 bg-black/60 border border-purple-500/40 px-4 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block leading-none">
                  Wallet Balance
                </span>
                <span className="text-sm font-mono font-bold text-white">
                  {walletBalance.toFixed(3)} <span className="text-purple-400">$AEGIS</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDepositTokens(50.0)}
              className="text-[11px] font-mono px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 transition cursor-pointer"
            >
              +50 Tokens
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The AEGIS Mesh Resolver dynamically routes unlisted, uncensored payloads across decentralized consensus nodes. Streaming is cryptographically protected by URI-derived DNS subkeys (<code>sha256(&quot;aegis_sub_&quot; + target_uri)[:16]</code>) and settled via high-frequency micro-billing at <strong>0.005 $AEGIS per second</strong>.
        </p>
      </div>

      {/* Main Grid: Control Panel (5 cols) & Stream Output (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Resolver Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                Target URI Routing Configuration
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Store Payload</span>
              </button>
            </div>

            {/* Target URI Select */}
            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5">
                Target Unlisted URI:
              </label>
              <select
                value={selectedUri}
                onChange={(e) => setSelectedUri(e.target.value)}
                disabled={isStreaming}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-purple-300 font-mono text-xs focus:outline-none focus:border-purple-500"
              >
                {entries.map((ent) => (
                  <option key={ent.targetUri} value={ent.targetUri}>
                    {ent.targetUri} ({ent.filesize} bytes)
                  </option>
                ))}
              </select>
            </div>

            {/* Subkey Derivation & Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-slate-300">
                  Cryptographic DNS Subkey:
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  sha256(&quot;aegis_sub_&quot; + uri)[:16]
                </span>
              </div>
              <input
                type="text"
                value={subkeyInput}
                onChange={(e) => setSubkeyInput(e.target.value)}
                disabled={isStreaming}
                placeholder="16-character hex subkey or master_override_key"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-emerald-300 font-mono text-xs focus:outline-none focus:border-purple-500"
              />

              {/* Subkey Quick Helpers */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSubkeyInput(currentExpectedSubkey)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition cursor-pointer"
                >
                  Use Valid Subkey ({currentExpectedSubkey})
                </button>
                <button
                  type="button"
                  onClick={() => setSubkeyInput('master_override_key')}
                  className="px-2 py-1 rounded bg-purple-950/80 hover:bg-purple-900/80 text-purple-300 text-[10px] font-mono border border-purple-800/40 transition cursor-pointer"
                >
                  Master Override Key
                </button>
                <button
                  type="button"
                  onClick={() => setSubkeyInput('bad_fake_subkey_99')}
                  className="px-2 py-1 rounded bg-red-950/60 hover:bg-red-900/60 text-red-300 text-[10px] font-mono border border-red-800/40 transition cursor-pointer"
                >
                  Test Invalid Key
                </button>
              </div>
            </div>

            {/* Wallet Selection */}
            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5">
                Settlement Wallet Account:
              </label>
              <select
                value={walletId}
                onChange={(e) => {
                  setWalletId(e.target.value);
                  setWalletBalance(globalAegisMeshResolver.getWalletBalance(e.target.value));
                }}
                disabled={isStreaming}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="enterprise_pool">enterprise_pool (Corporate Quorum)</option>
                <option value="cisa_federal_defense_fund">cisa_federal_defense_fund (Federal Agency)</option>
                <option value="incident_response_wallet">incident_response_wallet (Emergency Reserve)</option>
              </select>
            </div>

            {/* Error Message */}
            {streamError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs font-mono flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{streamError}</span>
              </div>
            )}

            {/* Stream Action Buttons */}
            <div className="pt-2">
              {!isStreaming ? (
                <button
                  onClick={handleStartStream}
                  className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white transition shadow-lg shadow-purple-600/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Uncensored Stream (0.005 $AEGIS/s)</span>
                </button>
              ) : (
                <button
                  onClick={handleStopStream}
                  className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white transition shadow-lg shadow-red-600/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Halt Stream & Settle Micro-Bill</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Stream Console & Payload Inspection (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Real-Time Metered Telemetry HUD */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-center font-mono">
              <span className="text-[10px] text-slate-500 uppercase block">Active Duration</span>
              <span className="text-xl font-bold text-white">
                {String(Math.floor(streamDurationSec / 60)).padStart(2, '0')}:{String(streamDurationSec % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-center font-mono">
              <span className="text-[10px] text-slate-500 uppercase block">Settled Meter</span>
              <span className="text-xl font-bold text-purple-400">
                {totalCostDeducted.toFixed(3)} <span className="text-xs text-slate-400">$AEGIS</span>
              </span>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-center font-mono">
              <span className="text-[10px] text-slate-500 uppercase block">Stream Health</span>
              <span className={`text-sm font-bold flex items-center justify-center gap-1 mt-1 ${isStreaming ? 'text-emerald-400' : 'text-slate-400'}`}>
                <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                {isStreaming ? 'TRANSMITTING' : 'IDLE'}
              </span>
            </div>
          </div>

          {/* Decrypted Payload Content Viewer */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-white">
                  Resolved Target Payload Stream
                </h4>
              </div>
              {selectedEntry && (
                <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-slate-800">
                  SHA256: {selectedEntry.digest.slice(0, 16)}...
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-black/80 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto min-h-24">
              {isStreaming || totalCostDeducted > 0 ? (
                <div>
                  <div className="text-[10px] text-purple-400 font-semibold mb-2">
                    [UNRESTRICTED INGRESS STREAM • 100% CRYPTOGRAPHIC ATTESTATION]
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-emerald-300">
                    {selectedEntry?.payload || 'No payload detected.'}
                  </p>
                </div>
              ) : (
                <div className="text-slate-500 italic py-6 text-center">
                  Stream is idle. Click &quot;Start Uncensored Stream&quot; above to initiate cryptographic subkey routing and micro-metering.
                </div>
              )}
            </div>
          </div>

          {/* Live Ingress Telemetry Log Feed */}
          <div className="rounded-2xl border border-slate-800 bg-black/60 p-4 font-mono text-xs space-y-2">
            <span className="text-[11px] text-slate-400 font-bold block pb-1 border-b border-slate-800">
              Mesh Ingress Packet Log:
            </span>
            <div className="space-y-1 max-h-40 overflow-y-auto text-[11px]">
              {streamedChunks.length === 0 ? (
                <div className="text-slate-600">Awaiting stream activation...</div>
              ) : (
                streamedChunks.map((chunk, idx) => (
                  <div key={idx} className="text-slate-300">
                    {chunk}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Store New Unlisted Payload */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                Register Unlisted Payload in Mesh
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-mono text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleStoreNewPayload} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Target URI Scheme:</label>
                <input
                  type="text"
                  value={newUri}
                  onChange={(e) => setNewUri(e.target.value)}
                  placeholder="aegis://my-department/payload-01"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-purple-300 font-mono text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Payload Content:</label>
                <textarea
                  rows={4}
                  value={newPayload}
                  onChange={(e) => setNewPayload(e.target.value)}
                  placeholder="Enter confidential unlisted data or base64 binary stream..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono shadow-lg shadow-purple-600/20"
                >
                  Store & Calculate SHA-256
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
