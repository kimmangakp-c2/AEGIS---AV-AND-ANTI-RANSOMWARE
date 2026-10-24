import React, { useState, useEffect } from 'react';
import {
  FileLock,
  Cpu,
  ShieldCheck,
  Upload,
  RefreshCw,
  Key,
  Hash,
  AlertTriangle,
  Play,
  Square,
  Sparkles,
  HelpCircle,
  Binary
} from 'lucide-react';
import { getInitialScenarios } from '../crypto/scenarios';
import { ScenarioPreset, RestoredFile } from '../types';
import { globalPoolManager } from '../workers/poolManager';
import { computeSHA256 } from '../crypto/hashProof';
import { HexViewer } from './HexViewer';
import { RestoredDataViewer } from './RestoredDataViewer';
import { serializeContainer, ContainerHeader } from '../crypto/container';
import {
  inspectSaltMarkerVisibility,
  COMMON_SALT_ARCHETYPES,
  MAGIC_ORACLES,
  SaltArchetype,
} from '../crypto/hardRecovery';

interface RecoveryWorkspaceProps {
  onOpenCertificate: (file: RestoredFile) => void;
  onNavigateToShamir?: () => void;
  activeScenarioId?: string;
}

export const RecoveryWorkspace: React.FC<RecoveryWorkspaceProps> = ({
  onOpenCertificate,
  onNavigateToShamir,
  activeScenarioId,
}) => {
  const scenarios = getInitialScenarios();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioPreset>(scenarios[0]);
  const [manualKey, setManualKey] = useState('');
  const [isMining, setIsMining] = useState(false);
  const [miningLogs, setMiningLogs] = useState<string[]>([]);
  const [currentCandidate, setCurrentCandidate] = useState('');
  const [checkedHashes, setCheckedHashes] = useState(0);
  const [restoredFile, setRestoredFile] = useState<RestoredFile | null>(null);
  const [showHexDump, setShowHexDump] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simulated synthetic container bytes for hex viewer
  const [containerBytes, setContainerBytes] = useState<Uint8Array | null>(null);

  // Hard recovery specific state
  const [selectedSaltArchetype, setSelectedSaltArchetype] = useState<SaltArchetype>(COMMON_SALT_ARCHETYPES[0]);
  const [selectedOracleId, setSelectedOracleId] = useState<string>(MAGIC_ORACLES[0].id);
  const [hardRecoveryMode, setHardRecoveryMode] = useState<boolean>(false);
  const [saltDiagnostic, setSaltDiagnostic] = useState<{
    saltVisible: boolean;
    diagnosis: string;
  }>({ saltVisible: true, diagnosis: '' });

  // Load container bytes whenever scenario changes
  useEffect(() => {
    const isHardScenario = selectedScenario.id === 'hard_recovery_saltless';
    setHardRecoveryMode(isHardScenario);

    const saltHex = isHardScenario
      ? selectedSaltArchetype.saltHex
      : '4f89d2a1b903e87c654128f09d2e1b4a';
    const ivHex = '7a8b9c0d1e2f3a4b5c6d7e8f';
    const keyHashChecksum = computeSHA256(
      (selectedScenario.defaultPassphrase || 'KEY') + ':' + saltHex
    );
    const plaintextBytes = new TextEncoder().encode(selectedScenario.samplePlaintext);
    const plaintextChecksum = computeSHA256(plaintextBytes);

    if (isHardScenario) {
      // Create raw ciphertext stream with STRIPPED salt markers (encrypted with target key keystream)
      const correctKeyHash = computeSHA256(
        (selectedScenario.defaultPassphrase || 'HARD-KEY-42') + ':' + saltHex
      );
      const keyBytes = new Uint8Array(
        correctKeyHash.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
      );
      const rawStream = new Uint8Array(plaintextBytes.length);
      for (let i = 0; i < rawStream.length; i++) {
        rawStream[i] = plaintextBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      setContainerBytes(rawStream);
      setSaltDiagnostic({
        saltVisible: false,
        diagnosis:
          'ALERT: Key derivation salt markers are NOT VISIBLE / STRIPPED. Standard header parsing failed. Hard Recovery Brute-Force Oracle required.',
      });
    } else {
      const fakeCiphertext = new Uint8Array(plaintextBytes.length + 16);
      for (let i = 0; i < fakeCiphertext.length; i++) {
        fakeCiphertext[i] = (i * 137 + 73) % 256;
      }

      const header: ContainerHeader = {
        magic: 'CRESCUE1',
        version: 1,
        algorithm: 'AES-256-GCM',
        filename: selectedScenario.filename,
        filetype: selectedScenario.filetype,
        filesize: plaintextBytes.length,
        saltHex,
        ivHex,
        keyHashChecksum,
        plaintextChecksum,
        patternMaskHint: selectedScenario.keyMaskHint,
      };

      const serialized = serializeContainer(header, fakeCiphertext);
      setContainerBytes(serialized);
      setSaltDiagnostic({
        saltVisible: true,
        diagnosis: 'Intact CRESCUE1 container header with verified 16-byte salt marker.',
      });
    }

    setRestoredFile(null);
    setManualKey('');
    setErrorMessage(null);
    setMiningLogs([]);
  }, [selectedScenario, selectedSaltArchetype]);

  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        const bytes = new Uint8Array(buffer);
        setContainerBytes(bytes);

        // Create a custom scenario object
        const customScenario: ScenarioPreset = {
          id: 'custom_' + Date.now(),
          title: file.name,
          subtitle: 'User uploaded container for cryptographic hash analysis',
          category: 'personal',
          description: `Custom encrypted file (${bytes.length} bytes). Inspecting headers and entropy.`,
          filename: file.name,
          algorithm: 'AES-256-GCM',
          targetChecksum: computeSHA256(bytes.slice(0, 32)),
          keyMaskHint: 'CUSTOM-???-2024',
          recoveryMode: 'pool_mining',
          samplePlaintext: 'RESTORED CUSTOM FILE CONTENT FROM ENCRYPTED STREAM',
          filetype: file.type || 'application/octet-stream',
        };

        setSelectedScenario(customScenario);
        setRestoredFile(null);
        setErrorMessage(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Run the Decentralized Mining Pool
  const handleStartMining = async () => {
    if (isMining) return;
    setIsMining(true);
    setErrorMessage(null);

    const isHard = hardRecoveryMode || !saltDiagnostic.saltVisible;
    const saltHex = isHard
      ? selectedSaltArchetype.saltHex
      : '4f89d2a1b903e87c654128f09d2e1b4a';

    if (isHard) {
      const oracleObj = MAGIC_ORACLES.find((o) => o.id === selectedOracleId) || MAGIC_ORACLES[0];
      setMiningLogs([
        `[${new Date().toLocaleTimeString()}] [HARD RECOVERY ENGAGED] Salt markers stripped/missing.`,
        `[${new Date().toLocaleTimeString()}] Testing Salt Archetype: "${selectedSaltArchetype.name}" (${saltHex.slice(0, 16)}...)`,
        `[${new Date().toLocaleTimeString()}] Target Plaintext Oracle: ${oracleObj.name}`,
        `[${new Date().toLocaleTimeString()}] Distributing candidate key mask "${selectedScenario.keyMaskHint}" across 4 mining nodes...`,
      ]);

      const cipherSlice = containerBytes || new Uint8Array(64);
      const result = await globalPoolManager.mineHardRecoveryBruteForce(
        cipherSlice,
        saltHex,
        selectedScenario.keyMaskHint,
        selectedOracleId,
        (checked, candidate, nodeName) => {
          setCheckedHashes(checked);
          setCurrentCandidate(candidate);
          setMiningLogs((prev) => [
            `[${nodeName.split(' ')[0]}] Trial Keystream: ${candidate} (Oracle rejected: non-matching signature)`,
            ...prev.slice(0, 5),
          ]);
        }
      );

      setIsMining(false);

      if (result.success && result.key) {
        setMiningLogs((prev) => [
          `>>> [HARD RECOVERY SUCCESS] Magic Plaintext Oracle MATCHED by ${result.solvingNode?.name}!`,
          `>>> Recovered Master Key: "${result.key}" (Salt Archetype: ${result.saltUsed?.slice(0, 8)}...)`,
          `>>> Decrypted Stream Header: "${result.preview?.slice(0, 36)}..." in ${(result.durationMs / 1000).toFixed(2)}s`,
          ...prev,
        ]);

        const restored: RestoredFile = {
          filename: selectedScenario.filename,
          filetype: selectedScenario.filetype,
          filesize: selectedScenario.samplePlaintext.length,
          recoveredKey: result.key,
          plaintextChecksum: computeSHA256(selectedScenario.samplePlaintext),
          content: selectedScenario.samplePlaintext,
          isBinary: false,
          recoveredAt: new Date().toISOString(),
          solvedByNode: `${result.solvingNode?.name || 'Tokyo Edge Hash Grid'} [Hard Recovery Brute-Force]`,
          hashesChecked: checkedHashes + 1,
          timeTakenMs: result.durationMs,
        };

        setRestoredFile(restored);
        setManualKey(result.key);

        setTimeout(() => {
          document.getElementById('restored-results-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 100);
      } else {
        setErrorMessage(
          'Hard recovery brute-force search space exhausted without oracle match. Try another salt archetype or broader mask.'
        );
      }
      return;
    }

    setMiningLogs([
      `[${new Date().toLocaleTimeString()}] Dispatching job to 4 Decentralized Pool Nodes...`,
      `[${new Date().toLocaleTimeString()}] Target Checksum Proof: ${selectedScenario.targetChecksum.slice(0, 24)}...`,
      `[${new Date().toLocaleTimeString()}] Search Space Mask: "${selectedScenario.keyMaskHint}"`,
    ]);

    const targetHash = computeSHA256(
      (selectedScenario.defaultPassphrase || 'KEY') + ':' + saltHex
    );

    const result = await globalPoolManager.mineKeyForChecksum(
      targetHash,
      saltHex,
      selectedScenario.keyMaskHint,
      (checked, candidate, nodeName) => {
        setCheckedHashes(checked);
        setCurrentCandidate(candidate);
        setMiningLogs((prev) => [
          `[${nodeName.split(' ')[0]}] Tested: ${candidate} (Checksum mismatch: non-zero target delta)`,
          ...prev.slice(0, 5),
        ]);
      }
    );

    setIsMining(false);

    if (result.success && result.key) {
      setMiningLogs((prev) => [
        `>>> [SUCCESS] Checksum SOLVED by ${result.solvingNode?.name}!`,
        `>>> Recovered Cryptographic Key: "${result.key}" in ${(result.durationMs / 1000).toFixed(2)}s`,
        ...prev,
      ]);

      const restored: RestoredFile = {
        filename: selectedScenario.filename,
        filetype: selectedScenario.filetype,
        filesize: selectedScenario.samplePlaintext.length,
        recoveredKey: result.key,
        plaintextChecksum: computeSHA256(selectedScenario.samplePlaintext),
        content: selectedScenario.samplePlaintext,
        isBinary: false,
        recoveredAt: new Date().toISOString(),
        solvedByNode: result.solvingNode?.name || 'Zurich Genesis Node',
        hashesChecked: checkedHashes + 1,
        timeTakenMs: result.durationMs,
      };

      setRestoredFile(restored);
      setManualKey(result.key);

      // Auto-scroll to results card
      setTimeout(() => {
        document.getElementById('restored-results-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } else {
      setErrorMessage('Decentralized search space exhausted without checksum proof match.');
    }
  };

  const handleManualDecrypt = () => {
    if (!manualKey.trim()) {
      setErrorMessage('Please enter a candidate key or run the decentralized pool solver.');
      return;
    }

    if (
      selectedScenario.defaultPassphrase &&
      manualKey.trim() !== selectedScenario.defaultPassphrase
    ) {
      setErrorMessage(
        'Decryption Failed: Authentication tag mismatch. Key does not satisfy integrity checksum.'
      );
      return;
    }

    const restored: RestoredFile = {
      filename: selectedScenario.filename,
      filetype: selectedScenario.filetype,
      filesize: selectedScenario.samplePlaintext.length,
      recoveredKey: manualKey.trim(),
      plaintextChecksum: computeSHA256(selectedScenario.samplePlaintext),
      content: selectedScenario.samplePlaintext,
      isBinary: false,
      recoveredAt: new Date().toISOString(),
      solvedByNode: 'Manual Security Officer Override',
      hashesChecked: 1,
      timeTakenMs: 120,
    };

    setRestoredFile(restored);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Scenario Selector Ribbon */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <FileLock className="w-4 h-4" />
              Target Encrypted Containers
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a lost or corrupted data scenario or upload an encrypted file to initiate cryptographic rescue.
            </p>
          </div>

          <label className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer self-start sm:self-auto">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Upload File (.cenc / .enc)</span>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              aria-label="Upload custom encrypted file"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {scenarios.map((sc) => {
            const isSelected = selectedScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc)}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500/60 bg-emerald-950/20 shadow-md shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
                )}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {sc.category}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold truncate max-w-[120px]">
                    {sc.filename}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white mb-1">{sc.title}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {sc.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Grid: Container Specs & Decentralized Mining Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Header Metadata & Hex Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileLock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">
                    {selectedScenario.filename}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Algorithm: <span className="text-emerald-400 font-semibold">{selectedScenario.algorithm}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHexDump(!showHexDump)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                    showHexDump
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Binary className="w-4 h-4" />
                  <span>{showHexDump ? 'Hide Hex' : 'View Hex'}</span>
                </button>
              </div>
            </div>

            {/* Salt Marker Visibility Diagnostic */}
            <div
              className={`mt-4 p-3.5 rounded-xl border font-mono text-xs flex items-start gap-3 ${
                saltDiagnostic.saltVisible
                  ? 'bg-slate-900/40 border-slate-800 text-slate-300'
                  : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  saltDiagnostic.saltVisible ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
              <div className="space-y-1">
                <span className="font-bold block">
                  {saltDiagnostic.saltVisible
                    ? 'Salt Marker Status: Visible (Standard Mode)'
                    : 'Salt Marker Status: NOT VISIBLE / STRIPPED (Hard Recovery Active)'}
                </span>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  {saltDiagnostic.diagnosis}
                </p>
              </div>
            </div>

            {/* Hard Recovery Options: Salt Archetype & Known Plaintext Oracle */}
            {(!saltDiagnostic.saltVisible || hardRecoveryMode) && (
              <div className="mt-4 p-4 rounded-xl bg-black/60 border border-amber-800/40 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-400 uppercase tracking-wide">
                    Hard Recovery Configuration
                  </span>
                  <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800/40 px-2 py-0.5 rounded">
                    Blind Ciphertext Oracle
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px] font-semibold">
                      Salt Archetype Heuristic:
                    </label>
                    <select
                      value={selectedSaltArchetype.id}
                      onChange={(e) => {
                        const found = COMMON_SALT_ARCHETYPES.find((s) => s.id === e.target.value);
                        if (found) setSelectedSaltArchetype(found);
                      }}
                      className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 text-xs focus:outline-none focus:border-amber-500"
                    >
                      {COMMON_SALT_ARCHETYPES.map((arch) => (
                        <option key={arch.id} value={arch.id}>
                          {arch.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {selectedSaltArchetype.description}
                    </span>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px] font-semibold">
                      Known-Plaintext Magic Byte Oracle:
                    </label>
                    <select
                      value={selectedOracleId}
                      onChange={(e) => setSelectedOracleId(e.target.value)}
                      className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    >
                      {MAGIC_ORACLES.map((ora) => (
                        <option key={ora.id} value={ora.id}>
                          {ora.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Worker nodes validate decrypted bytes against this structure.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Forensic Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 font-mono text-xs">
              <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block mb-1">
                  Recorded Key Hash Checksum (SHA-256)
                </span>
                <span className="text-emerald-400 font-semibold break-all text-[11px]">
                  {selectedScenario.targetChecksum}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block mb-1">
                  Pattern Mask / Search Space Hint
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold tracking-wider">
                    {selectedScenario.keyMaskHint}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    Wildcard solver ready
                  </span>
                </div>
              </div>
            </div>

            {/* Special Callout if Shamir Scenario */}
            {selectedScenario.recoveryMode === 'shamir_shards' && (
              <div className="mt-4 p-4 rounded-xl bg-sky-950/30 border border-sky-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-sky-200 font-mono">
                      Shamir Threshold Quorum (2-of-3) Detected
                    </h4>
                    <p className="text-xs text-sky-300/80 mt-0.5">
                      This container requires polynomial secret reconstruction across distributed node shards.
                    </p>
                  </div>
                </div>

                {onNavigateToShamir && (
                  <button
                    onClick={onNavigateToShamir}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition whitespace-nowrap self-start sm:self-auto cursor-pointer"
                  >
                    Open Shard Studio →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Hex & Entropy View */}
          {showHexDump && (
            <HexViewer data={containerBytes} filename={selectedScenario.filename} />
          )}
        </div>

        {/* Right Col: Decentralized Mining Engine & Key Unlock (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  {!saltDiagnostic.saltVisible || hardRecoveryMode
                    ? 'DECENTRALIZED BRUTE-FORCE ENGINE'
                    : 'DECENTRALIZED SOLVER ENGINE'}
                </h3>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  !saltDiagnostic.saltVisible || hardRecoveryMode
                    ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {!saltDiagnostic.saltVisible || hardRecoveryMode
                  ? 'Hard Recovery Active'
                  : '4 Nodes Ready'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {!saltDiagnostic.saltVisible || hardRecoveryMode
                ? 'Salt markers are not visible. Worker nodes brute-force candidate keys across decentralized pools, evaluating trial decryptions against the Known-Plaintext Magic Oracle.'
                : "Dispatch candidate checksum computation across decentralized mining nodes. Nodes evaluate nonces and candidate hashes in parallel against the container's integrity proof."}
            </p>

            {/* Mining Status / Progress Display */}
            <div className="p-4 rounded-xl bg-black/60 border border-slate-800 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span>Solver State:</span>
                <span
                  className={`font-bold flex items-center gap-1.5 ${
                    isMining ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isMining ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                  {isMining ? 'MINING IN PROGRESS' : 'IDLE / READY'}
                </span>
              </div>

              {isMining && (
                <>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Testing Nonce / Candidate:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded">
                      {currentCandidate || 'Searching...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Candidates Evaluated:</span>
                    <span className="text-slate-200">{checkedHashes.toLocaleString()}</span>
                  </div>
                </>
              )}

              {/* Live Terminal Log */}
              <div className="border-t border-slate-800/80 pt-2 text-[11px] text-slate-400 space-y-1 max-h-32 overflow-y-auto">
                {miningLogs.length === 0 ? (
                  <span className="text-slate-600 italic">
                    Press "Engage Decentralized Pool" to broadcast candidate search...
                  </span>
                ) : (
                  miningLogs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.includes('SUCCESS')
                          ? 'text-emerald-300 font-bold'
                          : log.includes('HARD RECOVERY') || log.includes('Dispatching')
                          ? 'text-amber-300'
                          : 'text-slate-400'
                      }
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-3">
              <button
                onClick={handleStartMining}
                disabled={isMining}
                className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                  isMining
                    ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                    : !saltDiagnostic.saltVisible || hardRecoveryMode
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                {isMining ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Brute-Force In Progress (4 Nodes)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {!saltDiagnostic.saltVisible || hardRecoveryMode
                        ? 'Engage Decentralized Brute-Force Pool'
                        : 'Engage Decentralized Pool'}
                    </span>
                  </>
                )}
              </button>

              {/* Manual Key Input / Decrypt Section */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Or Manual Key Override:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                      placeholder="e.g. CORP-42-SEC"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-slate-800 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <button
                    onClick={handleManualDecrypt}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold transition border border-slate-700 cursor-pointer"
                  >
                    Decrypt
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Restored Data Results Area */}
      {restoredFile && (
        <div id="restored-results-section">
          <RestoredDataViewer
            file={restoredFile}
            onOpenCertificate={() => onOpenCertificate(restoredFile)}
          />
        </div>
      )}
    </div>
  );
};
