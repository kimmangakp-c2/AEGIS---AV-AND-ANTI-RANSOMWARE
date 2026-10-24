import React, { useState } from 'react';
import { Header } from './components/Header';
import { AegisArchitectureView } from './components/AegisArchitectureView';
import { MeshResolverView } from './components/MeshResolverView';
import { EnterpriseRecoveryVaultView } from './components/EnterpriseRecoveryVaultView';
import { ProofOfSecurityDaemonView } from './components/ProofOfSecurityDaemonView';
import { MatrixExplorerView } from './components/MatrixExplorerView';
import { RecoveryWorkspace } from './components/RecoveryWorkspace';
import { MiningPoolView } from './components/MiningPoolView';
import { ShamirCombiner } from './components/ShamirCombiner';
import { ContainerBuilder } from './components/ContainerBuilder';
import { AuditCertificate } from './components/AuditCertificate';
import { RansomwareShieldView } from './components/RansomwareShieldView';
import { RestoredFile } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('architecture');
  const [currentRestoredFile, setCurrentRestoredFile] = useState<RestoredFile | null>(null);

  const handleOpenCertificate = (file: RestoredFile) => {
    setCurrentRestoredFile(file);
    setActiveTab('certificate');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Global Navigation Header */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Tab Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'architecture' && (
          <AegisArchitectureView onNavigateTab={setActiveTab} />
        )}

        {activeTab === 'mesh' && <MeshResolverView />}

        {activeTab === 'vault' && <EnterpriseRecoveryVaultView />}

        {activeTab === 'daemon' && <ProofOfSecurityDaemonView />}

        {activeTab === 'matrix' && <MatrixExplorerView />}

        {activeTab === 'recover' && (
          <RecoveryWorkspace
            onOpenCertificate={handleOpenCertificate}
            onNavigateToShamir={() => setActiveTab('shamir')}
          />
        )}

        {activeTab === 'shield' && <RansomwareShieldView />}

        {activeTab === 'pool' && <MiningPoolView />}

        {activeTab === 'shamir' && <ShamirCombiner />}

        {activeTab === 'builder' && <ContainerBuilder />}

        {activeTab === 'certificate' && (
          <AuditCertificate
            file={currentRestoredFile}
            onNavigateToRecovery={() => setActiveTab('recover')}
          />
        )}
      </main>

      {/* Persistent Bottom Status Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-4 px-4 sm:px-6 lg:px-8 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>AEGIS 2026.4 MAX-SCALE CORE ACTIVE</span>
          </span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="hidden sm:inline">CISA Joint Defense Framework Compliance</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span>AES-256-GCM / PBKDF2 600K</span>
          <span>$AEGISCOIN Metered Ledger</span>
        </div>
      </footer>
    </div>
  );
}
