import React from 'react';
import { Layers, Zap } from 'lucide-react';
import { CisaSeal } from './CisaSeal';

interface SwirlingNebulaBannerProps {
  onNavigateTab: (tabId: string) => void;
}

/**
 * Recreates the exact high-contrast cybernetic hero banner from the AEGIS blueprint
 * and image_0.png reference using pure SVG fluid mesh gradients, cosmic nebula curves,
 * and vector CISA joint defense seal — 100% vector, without requiring any external raster image.
 */
export const SwirlingNebulaBanner: React.FC<SwirlingNebulaBannerProps> = ({ onNavigateTab }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-red-500/40 bg-black shadow-2xl">
      {/* Dynamic Pure SVG Swirling Red Cosmic Nebula Backdrop */}
      <div className="relative h-60 sm:h-64 md:h-72 w-full overflow-hidden select-none">
        <svg
          viewBox="0 0 1440 400"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <defs>
            {/* Primary Dark Cosmic Field */}
            <radialGradient id="nebulaCore" cx="58%" cy="45%" r="70%">
              <stop offset="0%" stopColor="#881337" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#4c0519" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#1f0208" stopOpacity="1" />
              <stop offset="100%" stopColor="#080204" stopOpacity="1" />
            </radialGradient>

            {/* Crimson Fluid Plasma Stream 1 */}
            <linearGradient id="plasmaWave1" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#be123c" stopOpacity="0.6" />
              <stop offset="75%" stopColor="#881337" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4c0519" stopOpacity="0" />
            </linearGradient>

            {/* Ruby Fluid Plasma Stream 2 */}
            <linearGradient id="plasmaWave2" x1="100%" y1="100%" x2="0%" y2="20%">
              <stop offset="0%" stopColor="#fb7185" stopOpacity="0.65" />
              <stop offset="35%" stopColor="#e11d48" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#9f1239" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>

            {/* Hot White/Amber Plasma Highlight */}
            <radialGradient id="hotSpot" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#9f1239" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Cyber Grid Mask Pattern */}
            <pattern id="cyberMatrixGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="0.8"
              />
              <circle cx="0" cy="0" r="1" fill="rgba(244, 63, 94, 0.2)" />
            </pattern>
          </defs>

          {/* Deep Space Foundation */}
          <rect width="1440" height="400" fill="url(#nebulaCore)" />

          {/* Swirling Fluid Red Plasma Ribbon Layers */}
          <path
            d="M -100 220 
               C 220 120, 480 340, 780 180 
               C 1050 40, 1280 260, 1540 140 
               L 1540 400 L -100 400 Z"
            fill="url(#plasmaWave1)"
          />

          <path
            d="M -50 80 
               C 300 240, 600 60, 920 220 
               C 1200 360, 1380 100, 1540 180 
               L 1540 0 L -50 0 Z"
            fill="url(#plasmaWave2)"
            opacity="0.75"
          />

          <path
            d="M 100 380 
               C 420 260, 680 380, 980 280 
               C 1220 200, 1400 320, 1540 260 
               L 1540 400 L 100 400 Z"
            fill="url(#plasmaWave1)"
            opacity="0.8"
          />

          {/* Core Nebula Swirl Ellipses */}
          <ellipse cx="720" cy="180" rx="420" ry="220" fill="url(#hotSpot)" />
          <ellipse
            cx="680"
            cy="190"
            rx="560"
            ry="160"
            fill="none"
            stroke="rgba(244, 63, 94, 0.3)"
            strokeWidth="1.5"
            transform="rotate(-8 680 190)"
          />
          <ellipse
            cx="680"
            cy="190"
            rx="480"
            ry="110"
            fill="none"
            stroke="rgba(251, 113, 133, 0.2)"
            strokeWidth="1"
            transform="rotate(6 680 190)"
          />

          {/* Cyber matrix grid overlay */}
          <rect width="1440" height="400" fill="url(#cyberMatrixGrid)" />
        </svg>

        {/* Center / Right CISA Joint Defense Vector Seal Embedded in Swirl */}
        <div className="absolute inset-y-0 right-1/4 sm:right-1/3 flex items-center justify-center opacity-85 pointer-events-none transform translate-x-12 sm:translate-x-16">
          <div className="relative">
            {/* Glowing red back-halo */}
            <div className="absolute -inset-8 bg-red-600/30 rounded-full blur-2xl animate-pulse" />
            <CisaSeal size={240} showRings={true} />
          </div>
        </div>

        {/* Gradient dark vignetting to ensure 100% typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />

        {/* Foreground Content: Badges, Titles, Buttons exactly matching reference */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-5 z-10">
          <div className="space-y-2">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm">
                CISA JOINT DEFENSE FRAMEWORK
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-semibold">
                EDITION 2026.4-ENTERPRISE-MAX-SCALE
              </span>
            </div>

            {/* Master Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-mono tracking-tight drop-shadow-md">
              AEGIS PLATFORM ARCHITECTURE
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-300 font-mono max-w-2xl drop-shadow leading-relaxed">
              Ultra-Large Scale Decentralized Mesh Topology, Cryptographic Arbitration Core &amp; $AEGISCOIN Settlement
            </p>
          </div>

          {/* Action Buttons matching screenshot */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <button
              onClick={() => onNavigateTab('matrix')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-semibold flex items-center gap-2 transition cursor-pointer backdrop-blur-md shadow-md active:scale-95"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Matrix 00001-00200</span>
            </button>

            <button
              onClick={() => onNavigateTab('mesh')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-500/30 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>Launch Mesh Resolver</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
