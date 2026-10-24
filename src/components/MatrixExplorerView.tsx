import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  Cpu,
  Lock,
  Globe
} from 'lucide-react';
import {
  generateMatrixConfigIndex,
  MatrixConfigEntry
} from '../crypto/aegisCore';
import { copyToClipboard } from '../utils/clipboard';

export const MatrixExplorerView: React.FC = () => {
  const [configs, setConfigs] = useState<MatrixConfigEntry[]>(generateMatrixConfigIndex());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedExport, setCopiedExport] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const categories = [
    'ALL',
    'Network & Topology',
    'Core Hardware',
    'Cryptography & PBKDF2',
    'Storage & Consensus',
    'CISA & Federal Compliance',
  ];

  const filteredConfigs = configs.filter((c) => {
    const matchesSearch =
      c.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.index.includes(searchTerm) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartEdit = (entry: MatrixConfigEntry) => {
    setEditingIndex(entry.index);
    setEditValue(entry.value);
  };

  const handleSaveEdit = (index: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.index === index ? { ...c, value: editValue } : c))
    );
    setEditingIndex(null);
  };

  const handleApplyPreset = (preset: 'cisa' | 'max_throughput' | 'ultra_pbkdf2') => {
    setConfigs((prev) =>
      prev.map((c) => {
        if (preset === 'cisa') {
          if (c.key === 'AEGIS_CISA_COMPLIANCE_DIRECTIVE_LEVEL') return { ...c, value: 'BOD-22-01_STRICT' };
          if (c.key === 'AEGIS_CRYPTO_ENGINE_HARDWARE_HSM_ENABLED') return { ...c, value: 'TRUE' };
          if (c.key === 'AEGIS_NODE_CONFIG_CORE_SETTING_CONSENSUS_QUORUM_PERCENT') return { ...c, value: '67' };
        } else if (preset === 'max_throughput') {
          if (c.key === 'AEGIS_NODE_CONFIG_CORE_SETTING_THREAD_POOL_SIZE') return { ...c, value: '128' };
          if (c.key === 'AEGIS_NODE_CONFIG_CORE_SETTING_MEMPOOL_SIZE_MB') return { ...c, value: '16384' };
          if (c.key === 'AEGIS_NODE_CONFIG_CORE_SETTING_MAX_CONNECTIONS') return { ...c, value: '50000' };
        } else if (preset === 'ultra_pbkdf2') {
          if (c.key === 'AEGIS_CRYPTO_ENGINE_PBKDF2_ITERATIONS') return { ...c, value: '1000000' };
        }
        return c;
      })
    );
  };

  const handleExportEnv = async () => {
    const envLines = [
      '# ====================================================================',
      '# AEGIS PLATFORM: ULTRA-LARGE SCALE MATRIX CONFIGURATION (2026.4)',
      '# CLASSIFICATION: RESTRICTED // MASTER ENGINEERING DIRECTORY',
      '# ====================================================================',
      '',
      ...configs.map((c) => `# [Index ${c.index}] ${c.description}\n${c.key}=${c.value}`),
    ].join('\n\n');

    await copyToClipboard(envLines);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Banner */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/20 via-slate-900/60 to-purple-950/20 p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white">
                  SYSTEM CONFIGURATION MATRIX (INDEX 00001 - 00200)
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">
                  Section 5 Registry
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Repetitive Extension Protocol • Production Cluster Profiles • CISA Federal Parameters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportEnv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-slate-950 bg-blue-400 hover:bg-blue-300 transition shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              {copiedExport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedExport ? 'Copied .env' : 'Export .env Configuration'}</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The AEGIS Matrix Database maintains granular architectural profiles across consensus ports, thread pool limits, PBKDF2 iterations, hardware HSM modules, zk-SNARK proof circuits, and federal compliance directives.
        </p>
      </div>

      {/* Preset Quick Switches */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>Apply Standard Enterprise Profile:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleApplyPreset('cisa')}
            className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs font-mono font-medium transition cursor-pointer"
          >
            CISA BOD-22-01 Strict Profile
          </button>
          <button
            onClick={() => handleApplyPreset('max_throughput')}
            className="px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/40 text-xs font-mono font-medium transition cursor-pointer"
          >
            Maximum Throughput (128 Threads / 16GB Mempool)
          </button>
          <button
            onClick={() => handleApplyPreset('ultra_pbkdf2')}
            className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 text-xs font-mono font-medium transition cursor-pointer"
          >
            Quantum Resistant (1,000,000 PBKDF2)
          </button>
          <button
            onClick={() => setConfigs(generateMatrixConfigIndex())}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition cursor-pointer"
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search key, index (e.g. 00101), or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Config Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-black/60 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Index</th>
                <th className="py-3 px-4">Parameter Key</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Configured Value</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredConfigs.map((item) => {
                const isEditing = editingIndex === item.index;

                return (
                  <tr key={item.index} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-bold text-amber-400">
                      #{item.index}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white break-all">
                      {item.key}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-slate-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="px-2 py-1 rounded bg-black border border-blue-500 text-blue-300 font-mono text-xs w-36 focus:outline-none"
                        />
                      ) : (
                        <span className="font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                          {item.value}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs">
                      {item.description}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(item.index)}
                            className="px-2 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-[10px] hover:bg-emerald-400 transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] hover:bg-slate-700 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
