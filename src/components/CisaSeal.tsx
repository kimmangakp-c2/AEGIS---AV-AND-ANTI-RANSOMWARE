import React from 'react';

interface CisaSealProps {
  size?: number;
  className?: string;
  showRings?: boolean;
}

/**
 * Pure SVG vector CISA Joint Defense & Federal Cybersecurity Verification Seal.
 * Recreates the authentic seal with eagle silhouette, cyber grid, antenna tower,
 * and high-contrast dark-ops styling without requiring any external bitmap image.
 */
export const CisaSeal: React.FC<CisaSealProps> = ({
  size = 56,
  className = '',
  showRings = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="CISA Cybersecurity and Infrastructure Security Agency Seal"
    >
      <svg
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
        className="overflow-visible drop-shadow-lg"
      >
        <defs>
          {/* Crimson / Red outer ring gradient */}
          <linearGradient id="cisaRedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>

          {/* Deep cyber blue center gradient */}
          <radialGradient id="cisaBlueCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          {/* Golden metallic border gradient */}
          <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#713f12" />
          </linearGradient>

          {/* Emerald accent */}
          <linearGradient id="emeraldTrace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Outer concentric pulsing ring if enabled */}
        {showRings && (
          <circle
            cx="100"
            cy="100"
            r="98"
            fill="none"
            stroke="rgba(239, 68, 68, 0.3)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}

        {/* Outer Red Ring */}
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="url(#cisaRedGradient)"
          stroke="url(#goldBorder)"
          strokeWidth="3"
        />

        {/* Outer Gold Rope / Beaded Circle Accent */}
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke="rgba(254, 240, 138, 0.4)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Arc Text: CYBERSECURITY & INFRASTRUCTURE */}
        <path
          id="textArcTop"
          d="M 28 100 A 72 72 0 0 1 172 100"
          fill="none"
          stroke="none"
        />
        <text
          fill="#ffffff"
          fontSize="10"
          fontWeight="800"
          letterSpacing="1.8"
          fontFamily="monospace"
        >
          <textPath href="#textArcTop" startOffset="50%" textAnchor="middle">
            CYBERSECURITY &amp; INFRASTRUCTURE
          </textPath>
        </text>

        {/* Arc Text: SECURITY AGENCY */}
        <path
          id="textArcBottom"
          d="M 172 100 A 72 72 0 0 1 28 100"
          fill="none"
          stroke="none"
        />
        <text
          fill="#fef08a"
          fontSize="9.5"
          fontWeight="800"
          letterSpacing="2.2"
          fontFamily="monospace"
        >
          <textPath href="#textArcBottom" startOffset="50%" textAnchor="middle">
            SECURITY AGENCY
          </textPath>
        </text>

        {/* Inner Gold / White Divider Ring */}
        <circle
          cx="100"
          cy="100"
          r="66"
          fill="url(#cisaBlueCore)"
          stroke="url(#goldBorder)"
          strokeWidth="2.5"
        />

        {/* Cyber Grid Lat/Long inside Inner Circle */}
        <g stroke="rgba(56, 189, 248, 0.25)" strokeWidth="0.75" fill="none">
          <ellipse cx="100" cy="100" rx="54" ry="24" />
          <ellipse cx="100" cy="100" rx="54" ry="46" />
          <line x1="46" y1="100" x2="154" y2="100" />
          <line x1="100" y1="46" x2="100" y2="154" />
          <line x1="68" y1="58" x2="132" y2="142" strokeDasharray="2 2" />
          <line x1="132" y1="58" x2="68" y2="142" strokeDasharray="2 2" />
        </g>

        {/* Concentric Radar / Transmission Waves from Central Tower */}
        <g stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" fill="none">
          <circle cx="100" cy="115" r="14" strokeDasharray="3 2" />
          <circle cx="100" cy="115" r="24" strokeDasharray="4 3" />
          <circle cx="100" cy="115" r="34" strokeDasharray="3 4" />
        </g>

        {/* Communications Antenna Tower */}
        <path
          d="M 97 146 L 103 146 L 102 110 L 98 110 Z"
          fill="#94a3b8"
          stroke="#475569"
          strokeWidth="0.5"
        />
        <path
          d="M 94 146 L 100 115 L 106 146"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1.2"
        />
        <line x1="96" y1="132" x2="104" y2="132" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="97" y1="122" x2="103" y2="122" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="100" cy="110" r="3" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />

        {/* Polished Cyber Eagle Head Profile */}
        <g id="eagleProfile">
          {/* Eagle Head Silhouette */}
          <path
            d="M 85 82 
               C 85 70, 96 60, 114 62 
               C 126 63, 138 72, 142 82 
               C 145 88, 148 94, 153 96 
               C 146 98, 138 98, 132 94 
               C 128 92, 122 96, 116 100 
               C 108 106, 96 106, 88 102 
               C 82 98, 85 90, 85 82 Z"
            fill="#e2e8f0"
            stroke="#1e293b"
            strokeWidth="1.2"
          />

          {/* Eagle Beak */}
          <path
            d="M 132 94 
               C 144 95, 155 96, 153 103 
               C 150 108, 140 109, 134 105 
               C 130 102, 128 98, 132 94 Z"
            fill="#fbbf24"
            stroke="#b45309"
            strokeWidth="0.8"
          />

          {/* Eagle Eye */}
          <circle cx="120" cy="78" r="3.2" fill="#0f172a" />
          <circle cx="121" cy="77" r="1.2" fill="#38bdf8" />

          {/* Integrated Circuit Traces across Eagle Feathers */}
          <path
            d="M 94 80 L 105 80 L 110 86 M 92 90 L 102 90 L 107 97 M 98 72 L 106 72"
            fill="none"
            stroke="#0284c7"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="110" cy="86" r="1.2" fill="#38bdf8" />
          <circle cx="107" cy="97" r="1.2" fill="#38bdf8" />
        </g>

        {/* Federal Star Badges on Left and Right of Outer Ring */}
        <polygon
          points="20,100 22,94 28,94 23,90 25,84 20,88 15,84 17,90 12,94 18,94"
          fill="#fef08a"
          transform="translate(4, 0)"
        />
        <polygon
          points="180,100 182,94 188,94 183,90 185,84 180,88 175,84 177,90 172,94 178,94"
          fill="#fef08a"
          transform="translate(-4, 0)"
        />
      </svg>
    </div>
  );
};
