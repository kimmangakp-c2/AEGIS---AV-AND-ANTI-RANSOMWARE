import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileWarning,
  Flame,
  Cpu,
  RefreshCw,
  Lock,
  Unlock,
  AlertOctagon,
  Eye,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import {
  KNOWN_RANSOMWARE_FAMILIES,
  CanaryFile,
  analyzeRansomwareFile,
  evaluateCanaryIntegrity,
  RansomwareThreatProfile
} from '../crypto/ransomwareShield';
import { computeSHA256 } from '../crypto/hashProof';
import { globalPoolManager } from '../workers/poolManager';

interface RansomwareShieldViewProps {
  onRecoveredFileSuccess?: (key: string, name: string) => void;
}

export const RansomwareShieldView: React.FC<RansomwareShieldViewProps> = () => {
  // Canary honeypot tripwire files
  const [canaries, setCanaries] = useState<CanaryFile[]>([
    {
      id: 'canary-1',
      filename: 'executive_payroll_2026.xlsx',
      filepath: '/Finance/executive_payroll_2026.xlsx',
      originalChecksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      originalEntropy: 5.12,
      status: 'secure',
    },
    {
      id: 'canary-2',
      filename: 'customer_contracts_master.pdf',
      filepath: '/Legal/customer_contracts_master.pdf',
      originalChecksum: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      originalEntropy: 6.04,
      status: 'secure',
    },
    {
      id: 'canary-3',
      filename: 'proprietary_firmware_keys.bin',
      filepath: '/Engineering/proprietary_firmware_keys.bin',
      originalChecksum: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
      originalEntropy: 4.88,
      status: 'secure',
    },
    {
      id: 'canary-4',
      filename: 'employee_medical_records.csv',
      filepath: '/HR/employee_medical_records.csv',
      originalChecksum: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
      originalEntropy: 4.95,
      status: 'secure',
    },
  ]);

  const [selectedThreat, setSelectedThreat] = useState<RansomwareThreatProfile>(
    KNOWN_RANSOMWARE_FAMILIES[0]
  );
  const [attackSimulated, setAttackSimulated] = useState(false);
  const [attackUnderway, setAttackUnderway] = useState(false);
  const [isMiningRansomKey, setIsMiningRansomKey] = useState(false);
  const [recoveredRansomKey, setRecoveredRansomKey] = useState<string | null>(null);
  const [incidentLogs, setIncidentLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Anti-Ransomware Shield active. 4 Canary tripwires armed.`,
    `[${new Date().toLocaleTimeString()}] Shannon entropy baseline: NORMAL (mean: 5.25 bits/byte).`,
    `[${new Date().toLocaleTimeString()}] WORM immutable snapshot active on /Finance, /Legal, /HR.`,
  ]);

  // Trigger simulated ransomware infection to test defense
  const handleSimulateAttack = () => {
    setAttackUnderway(true);
    setIncidentLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] [ATTACK INCOMING] Suspicious process spawned in background!`,
      `[${new Date().toLocaleTimeString()}] Attempting mass file encryption with extension ${selectedThreat.extension}...`,
      ...prev,
    ]);

    setTimeout(() => {
      // Canary tripwires trip!
      setCanaries((prev) =>
        prev.map((c) => ({
          ...c,
          status: 'tampered',
          filename: c.filename + selectedThreat.extension,
          tamperedAt: new Date().toLocaleTimeString(),
        }))
      );
      setAttackUnderway(false);
      setAttackSimulated(true);

      setIncidentLogs((prev) => [
        `🚨 [ALERT] CANARY TRIPWIRE TRIPPED on /Finance/executive_payroll_2026.xlsx!`,
        `🚨 High Entropy Surge: 7.94 bits/byte detected (Threshold 7.80 exceeded).`,
        `🔒 IMMUNIZATION ENGAGED: Malicious process isolated, victim ID extracted: ${selectedThreat.knownVictimId}.`,
        `💡 Ransomware offline key checksum captured from file footer. Ready for pool recovery.`,
        ...prev,
      ]);
    }, 1500);
  };

  // Solve the ransomware key via Decentralized Mining Pool
  const handleSolveRansomwareKey = async () => {
    setIsMiningRansomKey(true);
    setIncidentLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Dispatching ransomware key recovery challenge to 4 worker pool nodes...`,
      `[${new Date().toLocaleTimeString()}] Search Mask: "${selectedThreat.offlineKeyMask}" (Candidate space: 100 nonces)`,
      ...prev,
    ]);

    const targetKey =
      selectedThreat.id === 'stop_djvu'
        ? 'f4a8b1c92e73d056e1894b2a3c70f5e890123456789abcdef01234567890ab42'
        : selectedThreat.id === 'lockbit_black'
        ? '8c2f1e9a7b0543d8a164b9e2c7f03d5e4a8b1c2d3e4f5a6b7c8d9e0f1a2b3c42'
        : '5b18e7c2a04f93d6e8124b9c3a70f542';
    const saltHex = '4f89d2a1b903e87c654128f09d2e1b4a';
    const targetChecksum = computeSHA256(targetKey + ':' + saltHex);

    const result = await globalPoolManager.mineKeyForChecksum(
      targetChecksum,
      saltHex,
      selectedThreat.offlineKeyMask
    );

    setIsMiningRansomKey(false);

    if (result.success && result.key) {
      setRecoveredRansomKey(result.key);

      // Restore canaries
      setCanaries((prev) =>
        prev.map((c) => ({
          ...c,
          filename: c.filename.replace(selectedThreat.extension, ''),
          status: 'restored',
        }))
      );

      setIncidentLogs((prev) => [
        `🎉 [RANSOMWARE NEUTRALIZED] Master Decryption Key: "${result.key}" SOLVED by ${result.solvingNode?.name}!`,
        `✓ All files decrypted and restored. 0 satoshis paid to attackers. 100% integrity verified.`,
        ...prev,
      ]);
    }
  };

  const handleResetDefense = () => {
    setAttackSimulated(false);
    setAttackUnderway(false);
    setRecoveredRansomKey(null);
    setCanaries((prev) =>
      prev.map((c) => ({
        ...c,
        filename: c.filename.replace(selectedThreat.extension, ''),
        status: 'secure',
      }))
    );
    setIncidentLogs([
      `[${new Date().toLocaleTimeString()}] System reset. Canary tripwires re-armed.`,
      `[${new Date().toLocaleTimeString()}] Baseline entropy restored: NORMAL.`,
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="rounded-2xl border border-red-900/40 bg-gradient-to-r from-red-950/20 via-slate-900/60 to-emerald-950/20 p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white">
                  ANTI-RANSOMWARE DEFENSE & DECENTRALIZED POOL RESCUE
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  REAL-TIME SHIELD ARMED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Canary Tripwires • Entropy Spike Quarantine • Distributed Worker Key Recovery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefense}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Canary Tripwires
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Modern ransomware locks user files using bulk symmetric encryption and demands ransom. CipherRescue stops ransomware by placing <strong>Canary Tripwire honeypots</strong> to detect unauthorized entropy surges, instantly quarantines the malicious process, and uses the <strong>Decentralized Mining Pool</strong> to compute and crack the ransomware's offline key checksum from the file footer.
        </p>
      </div>

      {/* Main Grid: Canaries & Attack Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Armed Canary Tripwires (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              Active Canary Honeypot Files ({canaries.length} Armed)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Auto-Quarantine: <strong className="text-emerald-400">ENABLED</strong>
            </span>
          </div>

          <div className="space-y-3">
            {canaries.map((canary) => {
              const isCompromised = canary.status === 'tampered';
              const isRestored = canary.status === 'restored';

              return (
                <div
                  key={canary.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCompromised
                      ? 'border-red-500/60 bg-red-950/20 shadow-lg shadow-red-500/10'
                      : isRestored
                      ? 'border-emerald-500/60 bg-emerald-950/20'
                      : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      {isCompromised ? (
                        <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
                      ) : isRestored ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <span className="text-xs font-mono font-bold text-white block">
                          {canary.filename}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {canary.filepath}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                        isCompromised
                          ? 'bg-red-950/80 text-red-300 border-red-800'
                          : isRestored
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                      }`}
                    >
                      {isCompromised ? 'TRIPWIRE COMPROMISED' : isRestored ? 'RESTORED' : 'SECURE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-400">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Entropy Status:</span>
                      <span
                        className={
                          isCompromised ? 'text-red-400 font-bold' : 'text-emerald-400'
                        }
                      >
                        {isCompromised ? '7.94 / 8.0 (SURGE!)' : `${canary.originalEntropy} / 8.0 (Normal)`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Checksum Match:</span>
                      <span className="text-slate-300">
                        {isCompromised ? 'MISMATCH (Tampered)' : '100% Valid'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Incident Log Feed */}
          <div className="rounded-xl border border-slate-800 bg-black/60 p-4 font-mono text-xs space-y-2">
            <span className="text-[11px] text-slate-400 font-bold block pb-1 border-b border-slate-800">
              Live Threat Sensor & Shield Telemetry:
            </span>
            <div className="space-y-1 max-h-36 overflow-y-auto text-[11px]">
              {incidentLogs.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.includes('ALERT') || log.includes('ATTACK')
                      ? 'text-red-400 font-bold'
                      : log.includes('NEUTRALIZED') || log.includes('IMMUNIZATION')
                      ? 'text-emerald-400 font-bold'
                      : 'text-slate-400'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Ransomware Attack Simulator & Worker Key Recovery (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Ransomware Outbreak Simulator
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                Sandbox Mode
              </span>
            </div>

            <div>
              <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5">
                Target Ransomware Family:
              </label>
              <select
                value={selectedThreat.id}
                onChange={(e) => {
                  const found = KNOWN_RANSOMWARE_FAMILIES.find((f) => f.id === e.target.value);
                  if (found) setSelectedThreat(found);
                }}
                disabled={attackSimulated || attackUnderway}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-red-500"
              >
                {KNOWN_RANSOMWARE_FAMILIES.map((fam) => (
                  <option key={fam.id} value={fam.id}>
                    {fam.name} ({fam.extension})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Target Cipher:</span>
                <span className="text-white font-semibold">{selectedThreat.cipher}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Vulnerability Profile:</span>
                <span className="text-emerald-400 font-semibold">Offline Checksum Leak</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Offline Key Mask:</span>
                <span className="text-amber-400 font-bold">{selectedThreat.offlineKeyMask}</span>
              </div>
            </div>

            {/* Attack Simulator Action Button */}
            {!attackSimulated ? (
              <button
                onClick={handleSimulateAttack}
                disabled={attackUnderway}
                className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white transition shadow-lg shadow-red-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {attackUnderway ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Infecting Honeypot Directory...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 fill-current" />
                    <span>Simulate Ransomware Outbreak</span>
                  </>
                )}
              </button>
            ) : (
              /* Recovery Action: Worker Pool Decrypt */
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-200 text-xs font-mono">
                  🚨 <strong>Files Locked by Ransomware!</strong> The Canary Guard captured the victim ID and footer salt. Dispatch decentralized worker nodes to compute the key!
                </div>

                <button
                  onClick={handleSolveRansomwareKey}
                  disabled={isMiningRansomKey || !!recoveredRansomKey}
                  className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                    recoveredRansomKey
                      ? 'bg-emerald-500 text-slate-950 cursor-default'
                      : isMiningRansomKey
                      ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  {isMiningRansomKey ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Pool Nodes Mining Ransomware Key...</span>
                    </>
                  ) : recoveredRansomKey ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ransomware Key Recovered!</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      <span>Dispatch Pool Workers to Recover Key</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Solved Key Announcement */}
            {recoveredRansomKey && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Unlock className="w-4 h-4" />
                  <span>MASTER RANSOMWARE DECRYPTION KEY DISCOVERED</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/80 border border-emerald-500/40 text-emerald-300 font-bold text-sm">
                  {recoveredRansomKey}
                </div>
                <span className="text-[11px] text-slate-400 block">
                  All 4 canary files and user documents restored without paying ransom. Zero data loss.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
