import React, { useState } from 'react';
import { Zap, Download, Lock, FileCode, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { encryptData, serializeContainer } from '../crypto/container';
import { computeSHA256 } from '../crypto/hashProof';

export const ContainerBuilder: React.FC = () => {
  const [dataInput, setDataInput] = useState(
    'CONFIDENTIAL BACKUP DATA // CIPHER-RESCUE\nAsset Serial: 0x8892-VAULT-2026\nRecovery Token: 9812-4412-8800'
  );
  const generate256BitHexKey = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const [filename, setFilename] = useState('confidential_backup.txt');
  const [passphrase, setPassphrase] = useState(
    '8f4c9a81e32d5b601e847c29ba04f1638d92e5c10fa4b8627e31d904c6e85242'
  );
  const [patternMaskHint, setPatternMaskHint] = useState(
    '8f4c9a81e32d5b601e847c29ba04f1638d92e5c10fa4b8627e31d904c6e852##'
  );
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [generatedContainer, setGeneratedContainer] = useState<{
    bytes: Uint8Array;
    filename: string;
    keyHashChecksum: string;
    plaintextChecksum: string;
  } | null>(null);

  const handleEncrypt = async () => {
    if (!dataInput || !passphrase) return;
    setIsEncrypting(true);

    try {
      const plaintextBytes = new TextEncoder().encode(dataInput);
      const { containerBytes, header } = await encryptData(
        plaintextBytes,
        passphrase,
        filename,
        'text/plain',
        { patternMaskHint }
      );

      setGeneratedContainer({
        bytes: containerBytes,
        filename: filename.endsWith('.cenc') ? filename : `${filename}.cenc`,
        keyHashChecksum: header.keyHashChecksum,
        plaintextChecksum: header.plaintextChecksum,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDownloadContainer = () => {
    if (!generatedContainer) return;
    const blob = new Blob([generatedContainer.bytes as unknown as BlobPart], {
      type: 'application/octet-stream',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generatedContainer.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <Zap className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            ENCRYPTED CONTAINER GENERATOR STUDIO (.CENC)
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Create testable AES-256-GCM encrypted recovery containers with embedded cryptographic headers, salt, authentication tag, and recorded hash checksum proofs for testing the decentralized recovery pool.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 block mb-1.5">
              Data Payload to Encrypt (Text / Document):
            </label>
            <textarea
              rows={6}
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/60 border border-slate-800 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 leading-relaxed"
              placeholder="Enter plaintext to protect..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Target Filename:</label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 text-[11px] font-semibold">256-Bit Cryptographic Key (Hex):</label>
                <button
                  type="button"
                  onClick={() => {
                    const newKey = generate256BitHexKey();
                    setPassphrase(newKey);
                    setPatternMaskHint(newKey.slice(0, 62) + '##');
                  }}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                >
                  Generate Random 256-Bit
                </button>
              </div>
              <input
                type="text"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-800 text-emerald-300 focus:outline-none focus:border-emerald-500 text-xs font-mono break-all"
              />
            </div>
          </div>

          <div className="font-mono text-xs">
            <label className="text-slate-400 block mb-1 font-semibold">
              Pattern Mask Hint (For Mining Pool Discovery):
            </label>
            <input
              type="text"
              value={patternMaskHint}
              onChange={(e) => setPatternMaskHint(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-slate-800 text-amber-300 focus:outline-none focus:border-emerald-500 text-xs"
              placeholder="e.g. MYSECRET-##-KEY"
            />
            <span className="text-[11px] text-slate-500 block mt-1">
              Use <code className="text-amber-400">#</code> for digits (0-9) or <code className="text-amber-400">?</code> for alphanumeric wildcards.
            </span>
          </div>

          <button
            onClick={handleEncrypt}
            disabled={isEncrypting || !dataInput || !passphrase}
            className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Generate Encrypted Container (.cenc)</span>
          </button>
        </div>

        {/* Output Container Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl h-full flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Generated Container Spec
                  </h3>
                </div>
                {generatedContainer && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Ready
                  </span>
                )}
              </div>

              {generatedContainer ? (
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block mb-1">
                      Container Output Name:
                    </span>
                    <span className="text-white font-bold block">{generatedContainer.filename}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block mb-1">
                      Container Size:
                    </span>
                    <span className="text-emerald-400 font-bold block">
                      {generatedContainer.bytes.length} bytes (including CRESCUE1 header)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block mb-1">
                      Target Key Checksum Proof:
                    </span>
                    <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[11px] text-emerald-400 break-all">
                      {generatedContainer.keyHashChecksum}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block mb-1">
                      Plaintext Integrity Checksum:
                    </span>
                    <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[11px] text-slate-300 break-all">
                      {generatedContainer.plaintextChecksum}
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadContainer}
                    className="w-full mt-4 py-2.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .cenc File</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-14 text-slate-500 font-mono text-xs">
                  <Lock className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
                  <p>Configure payload and key, then click generate to create an encrypted container file.</p>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-black/40 border border-slate-800/80 text-[11px] font-mono text-slate-400">
              🔒 The generated container can be loaded into the <strong className="text-slate-200">File Recovery & Decryptor</strong> tab to test real decentralized hash mining recovery!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
