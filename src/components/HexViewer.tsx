import React, { useMemo, useState } from 'react';
import { calculateEntropy, formatBytes } from '../crypto/entropy';
import { Binary, Sparkles, AlertCircle } from 'lucide-react';

interface HexViewerProps {
  data: Uint8Array | null;
  filename?: string;
}

export const HexViewer: React.FC<HexViewerProps> = ({ data, filename }) => {
  const [maxBytes, setMaxBytes] = useState(256);

  const analysis = useMemo(() => {
    if (!data || data.length === 0) return null;
    return calculateEntropy(data);
  }, [data]);

  const hexLines = useMemo(() => {
    if (!data) return [];
    const lines = [];
    const slice = data.slice(0, maxBytes);
    for (let i = 0; i < slice.length; i += 16) {
      const chunk = slice.slice(i, i + 16);
      const offset = i.toString(16).padStart(8, '0');
      const hexBytes = [];
      let ascii = '';

      for (let j = 0; j < 16; j++) {
        if (j < chunk.length) {
          const byte = chunk[j];
          hexBytes.push(byte.toString(16).padStart(2, '0'));
          ascii += byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '·';
        } else {
          hexBytes.push('  ');
          ascii += ' ';
        }
      }

      lines.push({ offset, hexBytes, ascii });
    }
    return lines;
  }, [data, maxBytes]);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center text-slate-500">
        <Binary className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-400" />
        <p className="text-sm">No binary data loaded for hexadecimal inspection.</p>
      </div>
    );
  }

  const entropyPercentage = analysis ? Math.min(100, (analysis.entropy / 8.0) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-lg">
      {/* Header telemetry */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-semibold text-slate-200">
            {filename || 'PAYLOAD_STREAM'} // HEX DUMP
          </span>
          <span className="text-xs font-mono text-slate-500">
            ({formatBytes(data.length)})
          </span>
        </div>

        {/* Entropy Badge */}
        {analysis && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">SHANNON ENTROPY:</span>
              <span
                className={`font-bold ${
                  analysis.entropy > 7.8
                    ? 'text-emerald-400'
                    : analysis.entropy > 6.0
                    ? 'text-amber-400'
                    : 'text-sky-400'
                }`}
              >
                {analysis.entropy.toFixed(4)} / 8.0000
              </span>
            </div>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  analysis.entropy > 7.8 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${entropyPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Analysis Notes Bar */}
      {analysis && (
        <div className="px-4 py-2 border-b border-slate-800/50 bg-slate-900/30 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">CLASSIFICATION:</span>
            <span className="uppercase px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
              {analysis.classification}
            </span>
            {analysis.magicSignature && (
              <span className="text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {analysis.magicSignature}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">VIEW LIMIT:</span>
            <button
              onClick={() => setMaxBytes(maxBytes === 256 ? 1024 : 256)}
              className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              {maxBytes === 256 ? 'Show 1KB' : 'Show 256B'}
            </button>
          </div>
        </div>
      )}

      {/* Hex Grid */}
      <div className="p-4 font-mono text-xs overflow-x-auto max-h-80 bg-black/60 select-text">
        <div className="min-w-[560px]">
          <div className="text-slate-600 mb-2 pb-1 border-b border-slate-800/50 flex text-[11px]">
            <span className="w-24">OFFSET</span>
            <span className="flex-1 tracking-wider">
              00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F
            </span>
            <span className="w-36 text-right">ASCII DECODE</span>
          </div>

          {hexLines.map((line, idx) => (
            <div key={idx} className="flex hover:bg-slate-900/50 rounded py-0.5 px-1 leading-5">
              <span className="w-24 text-slate-500 font-semibold">{line.offset}</span>
              <div className="flex-1 font-mono tracking-normal text-slate-300 flex">
                <span className="mr-3">
                  {line.hexBytes.slice(0, 8).map((byte, bIdx) => (
                    <span
                      key={bIdx}
                      className={`inline-block mr-1.5 ${
                        idx === 0 && bIdx < 8
                          ? 'text-emerald-400 font-bold bg-emerald-950/40 rounded px-0.5'
                          : byte === '00'
                          ? 'text-slate-600'
                          : 'text-slate-300'
                      }`}
                    >
                      {byte}
                    </span>
                  ))}
                </span>
                <span>
                  {line.hexBytes.slice(8, 16).map((byte, bIdx) => (
                    <span
                      key={bIdx}
                      className={`inline-block mr-1.5 ${
                        byte === '00' ? 'text-slate-600' : 'text-slate-300'
                      }`}
                    >
                      {byte}
                    </span>
                  ))}
                </span>
              </div>
              <span className="w-36 text-right text-slate-400 border-l border-slate-800/60 pl-3">
                {line.ascii}
              </span>
            </div>
          ))}

          {data.length > maxBytes && (
            <div className="text-center py-2 text-slate-500 text-[11px]">
              ... {formatBytes(data.length - maxBytes)} remaining in stream ...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
