import React, { useState } from 'react';
import {
  Globe,
  Radio,
  Zap,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  RefreshCw,
  Terminal,
  FileCode,
  ShieldCheck,
  ArrowRight,
  Server
} from 'lucide-react';
import { computeSHA256 } from '../crypto/hashProof';

interface CensoredDnsTarget {
  id: string;
  domain: string;
  ispRedirectUrl: string;
  censorReason: string;
  unlistedPayload: string;
  rrsigKeyTag: number;
}

const CENSORED_TARGETS: CensoredDnsTarget[] = [
  {
    id: 'target-1',
    domain: 'whistleblower-financial-truth.corp',
    ispRedirectUrl: 'http://302-regulatory-redirect.isp-warning.gov/blocked',
    censorReason: 'Court Order Directive 992: Domain removed from central ICANN authoritative root zone.',
    unlistedPayload: 'EXECUTIVE UNLISTED AUDIT LEDGER 2026: Offshore Cayman Island Entity #9924-B holds 1.4B $AEGIS unlisted liquidity escrow. Consensus validated by 4/4 BFT nodes.',
    rrsigKeyTag: 48921,
  },
  {
    id: 'target-2',
    domain: 'defense-orbital-telemetry.io',
    ispRedirectUrl: 'http://nxdomain-sinkhole.isp.net/error-404',
    censorReason: 'Regional BGP Hijacking: DNS query injected with phony NXDOMAIN response.',
    unlistedPayload: 'RAW ORBITAL TELEMETRY STREAM: SatID=AEGIS-SAT-08 Freq=14.24GHz Lat=31.2304 Long=121.4737 Encryption=AES256GCM Status=PRISTINE_NO_REDIRECT',
    rrsigKeyTag: 52190,
  },
  {
    id: 'target-3',
    domain: 'biotech-crispr-unredacted.net',
    ispRedirectUrl: 'http://isp-content-filter.internal/blocked-category',
    censorReason: 'Corporate ISP Content Inspection: Filtered for proprietary trade secret disclosures.',
    unlistedPayload: 'GENOME EXPERIMENT PHASE-4 UNREDACTED: CRISPR Target locus verified on human beta-globin gene. 0% off-target mutations across 10,000 cell cultures.',
    rrsigKeyTag: 61402,
  },
];

export const DnssecKeyMiningUnlistingSection: React.FC = () => {
  const [selectedTarget, setSelectedTarget] = useState<CensoredDnsTarget>(CENSORED_TARGETS[0]);
  const [targetHashrate, setTargetHashrate] = useState<number>(45.2); // MH/s
  const [miningStatus, setMiningStatus] = useState<'idle' | 'mining' | 'unlisted'>('idle');
  const [minedKsk, setMinedKsk] = useState<string | null>(null);
  const [minedSubkey, setMinedSubkey] = useState<string | null>(null);
  const [miningLogs, setMiningLogs] = useState<string[]>([
    '[*] DNSSEC Key Mining & Redirect Unlisting Engine Standby.',
    '[*] Ready to calculate DNS cryptographic subkeys and bypass ISP DNS redirects.',
  ]);

  const handleStartMining = () => {
    setMiningStatus('mining');
    const domain = selectedTarget.domain;
    const subkey = computeSHA256(`aegis_sub_${domain}`).slice(0, 16);

    setMiningLogs([
      `[*] Initializing DNSSEC Key-Signing Key (KSK) mining loop for domain: ${domain}...`,
      `[+] Target Hashrate Allocated: ${targetHashrate.toFixed(1)} MH/s across 4 consensus rigs.`,
      `[+] Detecting ISP Redirect: ${selectedTarget.ispRedirectUrl}`,
      `[*] Calculating SHA-256 nonces for RRSIG key-tag #${selectedTarget.rrsigKeyTag}...`,
    ]);

    setTimeout(() => {
      // Simulate mining discovery
      const kskHash = computeSHA256(`DNSSEC_KSK_${domain}_TAG_${selectedTarget.rrsigKeyTag}_NONCE_88421`);
      setMinedKsk(kskHash);
      setMinedSubkey(subkey);
      setMiningStatus('unlisted');

      setMiningLogs((prev) => [
        `🎉 [DNSSEC KSK MINED] Key: 0x${kskHash.slice(0, 24)}... (Verified in 1.84s)`,
        `✓ Cryptographic Subkey Derived: "${subkey}"`,
        `✓ ISP 302 / NXDOMAIN Redirect Bypassed successfully!`,
        `✓ Querying AEGIS Immutable Ledger for unlisted snapshot...`,
        `✨ [SUCCESS] Pristine unlisted payload retrieved without removed listings in response!`,
        ...prev,
      ]);
    }, 1800);
  };

  const handleReset = () => {
    setMiningStatus('idle');
    setMinedKsk(null);
    setMinedSubkey(null);
    setMiningLogs([
      '[*] System reset. Standby for next DNS unlisting operation.',
    ]);
  };

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-slate-900/80 p-6 sm:p-8 shadow-2xl space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold font-mono text-white uppercase tracking-wider">
              DNSSEC Key Mining &amp; DNS Redirect Unlisting Engine
            </h2>
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold uppercase">
              Bypass 302 / NXDOMAIN
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Bypass recursive ISP DNS redirection, seize proof-of-security DNSSEC KSK keys, and extract unlisted data streams.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-black/50 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            Hashrate: <strong className="text-purple-400">{targetHashrate.toFixed(1)} MH/s</strong>
          </div>
          <div className="bg-black/50 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            Quorum: <strong className="text-emerald-400">67% BFT</strong>
          </div>
        </div>
      </div>

      {/* Target Selector & Status Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Target Selection */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5">
              Select Censored / Redirected Domain Target:
            </label>
            <select
              value={selectedTarget.id}
              onChange={(e) => {
                const found = CENSORED_TARGETS.find((t) => t.id === e.target.value);
                if (found) {
                  setSelectedTarget(found);
                  setMiningStatus('idle');
                  setMinedKsk(null);
                  setMinedSubkey(null);
                }
              }}
              disabled={miningStatus === 'mining'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-slate-800 text-purple-300 font-mono text-xs focus:outline-none focus:border-purple-500"
            >
              {CENSORED_TARGETS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.domain} (KeyTag #{t.rrsigKeyTag})
                </option>
              ))}
            </select>
          </div>

          {/* Standard ISP State Box */}
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Standard ISP Recursive DNS Resolution (Censored)</span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">
              <strong>Intercept:</strong> {selectedTarget.ispRedirectUrl}
            </p>
            <p className="text-[11px] text-red-300/80 font-mono">
              <strong>Interference Type:</strong> {selectedTarget.censorReason}
            </p>
          </div>

          {/* Mining Trigger */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleStartMining}
              disabled={miningStatus === 'mining'}
              className={`flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                miningStatus === 'mining'
                  ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 active:scale-95'
              }`}
            >
              {miningStatus === 'mining' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                  <span>Mining DNSSEC Subkey (45.2 MH/s)...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Mine DNSSEC Key &amp; Unlist Request</span>
                </>
              )}
            </button>

            {miningStatus === 'unlisted' && (
              <button
                onClick={handleReset}
                className="px-3.5 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono text-xs"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Terminal & Resolved Unlisted Data */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-black/80 border border-slate-800 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5 text-purple-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>DNSSEC Mining Terminal</span>
              </span>
              <span>Rate: {targetHashrate} MH/s</span>
            </div>

            <div className="h-36 overflow-y-auto space-y-1 text-[11px] text-slate-300 pr-1">
              {miningLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('SUCCESS') || log.includes('MINED')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('Redirect')
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Unlisted Response Container */}
          {miningStatus === 'unlisted' && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Unlisted Snapshot Restored (Zero Removed Listings)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Subkey: {minedSubkey}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-black/70 border border-emerald-900/50 font-mono text-xs text-emerald-300 select-all">
                {selectedTarget.unlistedPayload}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span>DNSSEC KSK: 0x{minedKsk?.slice(0, 16)}...</span>
                <span className="text-emerald-400 font-semibold">Integrity Verified: 100% Match</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
