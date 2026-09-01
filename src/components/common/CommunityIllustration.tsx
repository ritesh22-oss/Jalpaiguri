import React from 'react';

export const CommunityIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-[340px] aspect-[4/3] mx-auto flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Soft background glow circles */}
        <circle cx="200" cy="150" r="130" fill="#E8F8F0" opacity="0.8" />
        <circle cx="280" cy="180" r="90" fill="#DEF4E8" opacity="0.6" />

        {/* Map / Route background backdrop */}
        <g opacity="0.35">
          <path d="M120 180L160 210L240 170L300 210" stroke="#10B981" strokeWidth="4" strokeDasharray="6 6" />
          <path d="M140 140L200 170L260 140" stroke="#059669" strokeWidth="3" strokeDasharray="4 4" />
          <circle cx="240" cy="170" r="7" fill="#10B981" />
        </g>

        {/* --- Top Left: Doctor in Circle Avatar --- */}
        <g transform="translate(45, 30)">
          <circle cx="45" cy="45" r="35" fill="#D1FAE5" stroke="#10B981" strokeWidth="2.5" />
          {/* Doctor head */}
          <circle cx="45" cy="35" r="12" fill="#FCD34D" />
          {/* Doctor hair */}
          <path d="M34 32C34 26 40 22 45 22C50 22 56 26 56 32V34H34V32Z" fill="#1E293B" />
          {/* Doctor coat */}
          <path d="M25 68C25 54 33 46 45 46C57 46 65 54 65 68" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
          {/* Stethoscope */}
          <path d="M38 48V58C38 62 52 62 52 58V48" stroke="#059669" strokeWidth="2" fill="none" />
          <circle cx="45" cy="62" r="3" fill="#059669" />
        </g>

        {/* --- Top Center: Chat Bubble --- */}
        <g transform="translate(180, 40)">
          <rect x="0" y="0" width="44" height="28" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M12 28L18 36L24 28" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <rect x="8" y="27.5" width="17" height="2" fill="#FFFFFF" />
          <circle cx="12" cy="14" r="2.5" fill="#94A3B8" />
          <circle cx="22" cy="14" r="2.5" fill="#94A3B8" />
          <circle cx="32" cy="14" r="2.5" fill="#94A3B8" />
        </g>

        {/* --- Top Right: Municipal Building (Pillars, Dome, Flag) --- */}
        <g transform="translate(295, 30)">
          <rect x="10" y="35" width="65" height="40" rx="3" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
          {/* Triangular pediment roof */}
          <path d="M5 35L42.5 16L80 35H5Z" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />
          {/* Columns */}
          <line x1="20" y1="35" x2="20" y2="75" stroke="#64748B" strokeWidth="2.5" />
          <line x1="35" y1="35" x2="35" y2="75" stroke="#64748B" strokeWidth="2.5" />
          <line x1="50" y1="35" x2="50" y2="75" stroke="#64748B" strokeWidth="2.5" />
          <line x1="65" y1="35" x2="65" y2="75" stroke="#64748B" strokeWidth="2.5" />
          {/* Top flag */}
          <line x1="42.5" y1="16" x2="42.5" y2="4" stroke="#475569" strokeWidth="2" />
          <path d="M42.5 4L54 8L42.5 12V4Z" fill="#10B981" />
        </g>

        {/* --- Left Middle: Blood Donor in Chair with Transfusion Stand --- */}
        <g transform="translate(45, 125)">
          {/* Clinic Chair */}
          <path d="M10 50L25 30L45 45L35 75H15L10 50Z" fill="#93C5FD" opacity="0.6" />
          <line x1="15" y1="75" x2="10" y2="90" stroke="#475569" strokeWidth="2.5" />
          <line x1="35" y1="75" x2="40" y2="90" stroke="#475569" strokeWidth="2.5" />

          {/* Blood donor person */}
          {/* Head */}
          <circle cx="35" cy="22" r="9" fill="#FBBF24" />
          <path d="M26 19C26 14 31 11 36 11C41 11 45 14 45 19H26Z" fill="#1E293B" />
          {/* Body */}
          <path d="M25 32L38 35L48 55L32 55Z" fill="#FDE047" />
          {/* Legs */}
          <path d="M32 55L25 80L50 80L55 60" fill="#3B82F6" />
          {/* Arm extended */}
          <path d="M38 35L55 42" stroke="#FBBF24" strokeWidth="4.5" strokeLinecap="round" />

          {/* IV Pole & Blood Bag */}
          <line x1="68" y1="5" x2="68" y2="85" stroke="#64748B" strokeWidth="2" />
          {/* Blood Bag */}
          <rect x="62" y="12" width="12" height="18" rx="4" fill="#EF4444" stroke="#DC2626" strokeWidth="1.5" />
          <circle cx="68" cy="10" r="2" fill="#64748B" />
          {/* Tube */}
          <path d="M68 30C68 45 60 42 55 42" stroke="#EF4444" strokeWidth="1.5" fill="none" />
        </g>

        {/* --- Center: Location Pin on Ground --- */}
        <g transform="translate(185, 120)">
          <path
            d="M15 0C6.7 0 0 6.7 0 15C0 25 15 38 15 38C15 38 30 25 30 15C30 6.7 23.3 0 15 0Z"
            fill="#10B981"
          />
          <circle cx="15" cy="14" r="5" fill="#FFFFFF" />
        </g>

        {/* --- Center Foreground: Two Citizens / Workers Shaking Hands --- */}
        {/* Person 1 (Left - Green Shirt / Local Worker) */}
        <g transform="translate(155, 130)">
          {/* Head */}
          <circle cx="20" cy="18" r="10" fill="#FBBF24" />
          <path d="M11 15C11 9 16 6 22 6C27 6 31 9 31 15H11Z" fill="#1E293B" />
          {/* Torso - Green */}
          <path d="M10 28L30 28L32 68L8 68Z" fill="#34D399" stroke="#059669" strokeWidth="1.5" />
          {/* Pants - Dark Slate */}
          <path d="M8 68L8 115L18 115L19 75L21 75L22 115L32 115L32 68Z" fill="#1E3A8A" />
          {/* Left Arm extended for handshake */}
          <path d="M26 36L48 48" stroke="#34D399" strokeWidth="6" strokeLinecap="round" />
          <path d="M44 46L54 50" stroke="#FBBF24" strokeWidth="4.5" strokeLinecap="round" />
        </g>

        {/* Person 2 (Right - Yellow Shirt / Citizen with Briefcase) */}
        <g transform="translate(205, 130)">
          {/* Head */}
          <circle cx="28" cy="18" r="10" fill="#78350F" />
          <path d="M19 15C19 9 24 6 30 6C35 6 39 9 39 15H19Z" fill="#0F172A" />
          {/* Torso - Yellow */}
          <path d="M18 28L38 28L40 68L16 68Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          {/* Pants - Slate */}
          <path d="M16 68L16 115L26 115L27 75L29 75L30 115L40 115L40 68Z" fill="#334155" />
          {/* Right Arm extended for handshake */}
          <path d="M22 36L0 48" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
          <path d="M4 46L-6 50" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
          {/* Left Arm holding briefcase */}
          <path d="M35 36L44 65" stroke="#FBBF24" strokeWidth="5" strokeLinecap="round" />
          {/* Briefcase */}
          <rect x="38" y="65" width="16" height="13" rx="2" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
          <path d="M43 65V62H49V65" stroke="#92400E" strokeWidth="1.5" fill="none" />
        </g>

        {/* --- Right: Female Professional / Citizen with Document Folder --- */}
        <g transform="translate(285, 140)">
          {/* Head */}
          <circle cx="25" cy="18" r="9" fill="#FBBF24" />
          {/* Hair long */}
          <path d="M15 15C15 8 21 5 27 5C33 5 37 8 37 15V32C37 32 35 25 33 25C31 25 30 30 29 32C29 32 26 25 24 25C22 25 21 30 20 32C19 32 17 26 15 26V15Z" fill="#0F172A" />
          {/* Blouse - White/Mint */}
          <path d="M17 27H33L36 60H14L17 27Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
          {/* Skirt - Green */}
          <path d="M14 60L10 100H40L36 60H14Z" fill="#059669" />
          {/* Legs */}
          <line x1="20" y1="100" x2="20" y2="120" stroke="#FBBF24" strokeWidth="3" />
          <line x1="30" y1="100" x2="30" y2="120" stroke="#FBBF24" strokeWidth="3" />
          {/* Holding Document Folder */}
          <rect x="12" y="38" width="14" height="18" rx="2" fill="#F59E0B" transform="rotate(-15 12 38)" />
        </g>

        {/* --- Bottom Right Potted Plant --- */}
        <g transform="translate(325, 220)">
          <path d="M10 20L14 38H26L30 20H10Z" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
          <path d="M20 20C12 12 10 2 20 0C30 2 28 12 20 20Z" fill="#10B981" />
          <path d="M16 18C10 14 6 6 12 4C18 6 18 14 16 18Z" fill="#34D399" />
          <path d="M24 18C30 14 34 6 28 4C22 6 22 14 24 18Z" fill="#059669" />
        </g>
      </svg>
    </div>
  );
};
