import React, { useState } from 'react';
import { RestoredFile } from '../types';
import { Download, CheckCircle2, Copy, Check, FileText, Key, Clock, ShieldCheck } from 'lucide-react';

interface RestoredDataViewerProps {
  file: RestoredFile;
  onOpenCertificate: () => void;
}

export const RestoredDataViewer: React.FC<RestoredDataViewerProps> = ({
  file,
  onOpenCertificate,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: file.filetype || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename.replace('.cenc', '') || 'restored_data.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-slate-950 p-6 shadow-2xl relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Success banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-emerald-900/40 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-mono">
                DATA RECOVERY COMPLETE
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                100% SHA-256 MATCH
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Decrypted via key <code className="text-emerald-400 bg-black/40 px-1 py-0.5 rounded font-bold">{file.recoveredKey}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCertificate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Audit Certificate
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Restored File
          </button>
        </div>
      </div>

      {/* Forensic Metadata Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 rounded-lg bg-black/40 border border-slate-800 font-mono text-xs">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Original File</span>
          <span className="text-slate-200 font-medium truncate block">{file.filename}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Solved By</span>
          <span className="text-emerald-400 font-medium truncate block">{file.solvedByNode}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Candidate Checks</span>
          <span className="text-slate-200 font-medium block">{file.hashesChecked.toLocaleString()} hashes</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Mining Time</span>
          <span className="text-slate-200 font-medium block">{(file.timeTakenMs / 1000).toFixed(2)}s</span>
        </div>
      </div>

      {/* Restored Content View */}
      <div className="mt-4">
        <div className="flex items-center justify-between pb-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            RESTORED DATA STREAM (PLAINTEXT)
          </span>
          <span className="text-[11px] text-slate-500">
            SHA-256: {file.plaintextChecksum.slice(0, 16)}...
          </span>
        </div>

        <div className="p-4 rounded-lg bg-black/80 border border-slate-800 font-mono text-xs text-emerald-200/90 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed select-text shadow-inner">
          {file.content}
        </div>
      </div>
    </div>
  );
};
