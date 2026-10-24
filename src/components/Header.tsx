import React, { useEffect, useState, useRef } from 'react';
import {
  Shield,
  Cpu,
  Activity,
  Database,
  Radio,
  CheckCircle,
  Zap,
  Layers,
  Terminal,
  FolderLock,
  Globe,
  Coins,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { globalPoolManager, PoolState } from '../workers/poolManager';
import { globalAegisMeshResolver } from '../crypto/aegisCore';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [poolState, setPoolState] = useState<PoolState>(globalPoolManager.getState());
  const [walletBalance, setWalletBalance] = useState<number>(
    globalAegisMeshResolver.getWalletBalance('enterprise_pool')
  );
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = globalPoolManager.subscribe(setPoolState);
    const balanceInterval = setInterval(() => {
      setWalletBalance(globalAegisMeshResolver.getWalletBalance('enterprise_pool'));
    }, 1000);
    return () => {
      unsub();
      clearInterval(balanceInterval);
    };
  }, []);

  const tabs = [
    { id: 'architecture', label: 'Master Architecture', icon: Shield },
    { id: 'mesh', label: 'Decentralized Mesh & $AEGIS', icon: Globe },
    { id: 'vault', label: '600k PBKDF2 Vault', icon: FolderLock },
    { id: 'daemon', label: 'C++ Worker Daemon', icon: Terminal },
    { id: 'matrix', label: 'Matrix 00001-00200', icon: Layers },
    { id: 'recover', label: 'File Recovery', icon: Zap },
    { id: 'shield', label: 'Ransomware Shield', icon: Radio },
    { id: 'pool', label: 'Mining Pool', icon: Cpu },
    { id: 'shamir', label: 'Shamir Shards', icon: Database },
    { id: 'builder', label: 'Container Builder', icon: Package },
    { id: 'certificate', label: 'Forensic Audit', icon: CheckCircle },
  ];

  const scrollNav = (direction: 'left' | 'right') => {
    if (navRef.current) {
      navRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="border-b border-emerald-950/60 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50 font-sans">
      {/* Top Telemetry Strip */}
      <div className="border-b border-emerald-900/30 bg-black/70 px-4 py-1.5 text-xs font-mono text-emerald-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>AEGIS MESH: ONLINE</span>
          </span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="hidden sm:flex items-center gap-1 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            BLOCK: <strong className="text-emerald-400">#{poolState.currentBlock.toLocaleString()}</strong>
          </span>
          <span className="hidden md:inline text-slate-700">|</span>
          <span className="hidden md:flex items-center gap-1 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            GLOBAL HASHRATE: <strong className="text-emerald-300">{(poolState.totalHashrate / 1000).toFixed(2)} MH/s</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1 text-amber-300">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            POOL: <strong className="text-white">{walletBalance.toFixed(2)}</strong> $AEGIS
          </span>
          <span className="text-slate-700">•</span>
          <span className="bg-red-950/80 text-red-300 border border-red-700/50 px-2 py-0.5 rounded text-[10px] tracking-wide font-bold">
            CISA BOD-22-01 CERTIFIED
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-700 p-0.5 shadow-lg shadow-emerald-900/30 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white font-mono">
                AEGIS <span className="text-emerald-400">ENTERPRISE</span>
              </h1>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                2026.4 MAX-SCALE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Decentralized Mesh • Cryptographic Recovery • CISA Framework
            </p>
          </div>
        </div>

        {/* Navigation Tabs with scroll buttons */}
        <div className="relative flex items-center min-w-0">
          <nav
            ref={navRef}
            className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 xl:pb-0 scroll-smooth no-scrollbar"
            aria-label="Main Navigation"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
