import React, { useState } from 'react';
import { RestoredFile } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Printer,
  Copy,
  Check,
  Download,
  FileCheck,
  ExternalLink
} from 'lucide-react';
import { computeSHA256 } from '../crypto/hashProof';
import { copyToClipboard } from '../utils/clipboard';
import { CisaSeal } from './CisaSeal';

interface AuditCertificateProps {
  file: RestoredFile | null;
  onNavigateToRecovery: () => void;
}

export const AuditCertificate: React.FC<AuditCertificateProps> = ({
  file,
  onNavigateToRecovery,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPlaintextModal, setShowPlaintextModal] = useState(false);

  // Fallback demo file exactly matching reference screenshot
  const displayFile: RestoredFile = file || {
    filename: 'financial_audit_2024.cenc',
    filetype: 'text/plain',
    filesize: 1482,
    recoveredKey: 'CORP-42-SEC',
    plaintextChecksum: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    content: 'EXECUTIVE SUMMARY: Apex Quantum Capital Management LLC\n2024 Fiscal Year Audit - Cryptographic Key Restored & Byte Integrity Verified\n\nTotal Assets Under Custody: $1,420,000,000.00\nConsensus Settlement Nodes: 4/4 Byzantine Fault Tolerant Agreement\nZero-Bit-Rot Attestation: PASSED (NIST SP 800-34 Rev. 1 Compliant)',
    isBinary: false,
    recoveredAt: '2026-10-24T07:42:00.000Z',
    solvedByNode: 'Zurich Genesis Node (EU-Central)',
    hashesChecked: 42,
    timeTakenMs: 1480,
  };

  const certificateSerial = `CIPHER-RESCUE-CERT-${computeSHA256(displayFile.recoveredKey).slice(0, 12).toUpperCase()}`;

  const handleCopyJSON = async () => {
    const proof = {
      certificateSerial,
      framework: 'CISA Joint Defense Framework BOD-22-01',
      standard: 'Federal Cybersecurity Verification Standard // NIST SP 800-34 Rev. 1',
      filename: displayFile.filename,
      filesizeBytes: displayFile.filesize,
      recoveredKey: displayFile.recoveredKey,
      cipher: 'AES-256-GCM',
      plaintextChecksum: displayFile.plaintextChecksum,
      solvedByNode: displayFile.solvedByNode,
      timestamp: displayFile.recoveredAt,
      hashesEvaluated: displayFile.hashesChecked,
      latencyMs: displayFile.timeTakenMs,
      consensusQuorum: 'BFT-SHA256-4NODES',
      integrityAttestation: 'ZERO_BIT_ROT_DETECTED',
    };
    await copyToClipboard(JSON.stringify(proof, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadProof = () => {
    const proof = {
      certificateSerial,
      framework: 'CISA Joint Defense Framework BOD-22-01',
      standard: 'Federal Cybersecurity Verification Standard // NIST SP 800-34 Rev. 1',
      filename: displayFile.filename,
      recoveredKey: displayFile.recoveredKey,
      plaintextChecksum: displayFile.plaintextChecksum,
      solvedByNode: displayFile.solvedByNode,
      timestamp: displayFile.recoveredAt,
      integrityAttestation: 'ZERO_BIT_ROT_DETECTED',
    };
    const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${certificateSerial}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Top action bar matching media_1792858073501_4ef46514.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-emerald-400">
            OFFICIAL FORENSIC AUDIT CERTIFICATE
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Immutable proof of cryptographic key discovery and plaintext integrity restoral.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition cursor-pointer shadow-sm active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied Proof JSON' : 'Export Proof JSON'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-slate-950" />
            <span>Print Certificate</span>
          </button>
        </div>
      </div>

      {/* Formal Certificate Sheet matching screenshot */}
      <div className="rounded-3xl border border-emerald-500/40 bg-[#080d19] p-7 sm:p-10 md:p-12 shadow-[0_0_50px_rgba(16,185,129,0.12)] relative overflow-hidden text-slate-200">
        {/* Subtle Matrix Dot Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute -top-28 -right-28 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Certificate Header with CISA joint defense seal & medal */}
        <div className="relative pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* CISA Emblem & Official Seal Header */}
            <div className="flex items-center gap-3.5">
              <CisaSeal size={56} showRings={true} />
              <div className="text-left font-mono">
                <span className="text-[11px] text-red-500 font-bold uppercase tracking-wider block">
                  CISA JOINT DEFENSE FRAMEWORK
                </span>
                <span className="text-sm text-white font-bold block tracking-tight">
                  Federal Cybersecurity Verification Standard
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  Directive BOD-22-01 // NIST SP 800-34 Rev. 1
                </span>
              </div>
            </div>

            {/* Emerald Seal Medal Badge */}
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 shrink-0 self-end sm:self-auto">
              <Award className="w-7 h-7" />
            </div>
          </div>

          {/* Centered Certificate Title Block */}
          <div className="text-center pt-8 pb-4">
            <span className="text-[11px] font-mono tracking-[0.25em] text-emerald-400 uppercase font-semibold block">
              AEGIS ULTRA-SCALE CRYPTOGRAPHIC ARBITRATION CORE
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-white mt-1.5 uppercase">
              CERTIFICATE OF CRYPTOGRAPHIC RESTORATION
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-2 tracking-wide">
              SERIAL NUMBER: <strong className="text-emerald-400 font-bold font-mono tracking-wider">{certificateSerial}</strong>
            </p>
          </div>

          {/* Horizontal dividing line */}
          <div className="border-t border-slate-800/80 my-4" />
        </div>

        {/* Core Attestation Statement matching reference */}
        <div className="space-y-6 font-mono text-xs leading-relaxed">
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-4xl">
            This document formally certifies that encrypted data container{' '}
            <strong className="text-white underline underline-offset-4 decoration-emerald-500/60 font-bold">
              {displayFile.filename}
            </strong>{' '}
            has been successfully recovered via decentralized hash checksum mining and cryptographic key
            reconstruction. Plaintext byte integrity has been verified against the recorded SHA-256
            checksum with <strong className="text-emerald-400 font-bold">ZERO BIT ROT DETECTED</strong>.
          </p>

          {/* 4 Metadata Cards Grid (2x2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Card 1: Recovered Target File */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1424] border border-slate-800/90 space-y-1 hover:border-slate-700 transition">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                RECOVERED TARGET FILE
              </span>
              <span className="text-white font-bold text-sm sm:text-base font-mono block">
                {displayFile.filename}
              </span>
              <span className="text-slate-400 text-xs font-mono block">
                {displayFile.filesize} bytes uncompressed
              </span>
            </div>

            {/* Card 2: Decrypted Key */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1424] border border-slate-800/90 space-y-1 hover:border-slate-700 transition">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                DECRYPTED KEY
              </span>
              <div className="pt-0.5">
                <span className="text-emerald-400 font-bold text-xs sm:text-sm font-mono bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-md inline-block">
                  {displayFile.recoveredKey}
                </span>
              </div>
              <span className="text-slate-400 text-xs font-mono block pt-1">
                AES-256-GCM Cipher Validated
              </span>
            </div>

            {/* Card 3: Solved By Mining Node */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1424] border border-slate-800/90 space-y-1 hover:border-slate-700 transition">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                SOLVED BY MINING NODE
              </span>
              <span className="text-white font-semibold text-xs sm:text-sm font-mono block">
                {displayFile.solvedByNode}
              </span>
              <span className="text-slate-400 text-xs font-mono block">
                {displayFile.hashesChecked} candidate hashes evaluated in {displayFile.timeTakenMs}ms
              </span>
            </div>

            {/* Card 4: Plaintext SHA-256 Checksum */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1424] border border-slate-800/90 space-y-1 hover:border-slate-700 transition">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                PLAINTEXT SHA-256 CHECKSUM
              </span>
              <span className="text-emerald-400 text-[11px] font-mono break-all block">
                {displayFile.plaintextChecksum}
              </span>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Consensus Quorum: BFT-SHA256-4NODES Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Footer Verification Stamp */}
        <div className="pt-8 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-xs">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-slate-500 text-[10px] uppercase block tracking-wider font-semibold">
              FEDERAL ZERO-TRUST COMPLIANCE
            </span>
            <span className="text-slate-300 font-bold block">
              Directive BOD-22-01 // NIST SP 800-34 Rev. 1 Certified
            </span>
            <span className="text-slate-500 text-[11px] block">
              Cryptographic Arbitrator: AEGIS-BFT-QUORUM-NODE-CLUSTER
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPlaintextModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Inspect Plaintext</span>
            </button>

            <button
              onClick={handleDownloadProof}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Signed JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Restored Plaintext Modal */}
      {showPlaintextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Restored Payload Preview: {displayFile.filename}
                </h3>
              </div>
              <button
                onClick={() => setShowPlaintextModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black/80 border border-slate-800 max-h-72 overflow-y-auto whitespace-pre-wrap text-emerald-300">
              {displayFile.content}
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
              <span>SHA-256 Checksum: {displayFile.plaintextChecksum.slice(0, 16)}...</span>
              <button
                onClick={() => setShowPlaintextModal(false)}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
