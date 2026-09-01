import React from 'react';

export const CommunityIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-[340px] aspect-[4/3.1] mx-auto flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 380 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Soft pastel mint background foliage / clouds */}
        <path
          d="M60 140C40 100 80 50 140 55C170 30 230 35 255 70C295 50 340 85 335 130C355 165 340 215 295 225C255 245 190 235 150 230C100 240 50 200 60 140Z"
          fill="#E5F6EE"
          opacity="0.85"
        />

        {/* --- Top Left: Doctor Avatar in Green Circle Badge --- */}
        <g transform="translate(62, 35)">
          <circle cx="34" cy="34" r="28" fill="#E8F7F0" stroke="#34A853" strokeWidth="2" />
          {/* Doctor hair */}
          <path d="M23 24C23 18 28 14 34 14C40 14 45 18 45 24V26H23V24Z" fill="#2D3748" />
          {/* Doctor face */}
          <circle cx="34" cy="26" r="9" fill="#FBD38D" />
          {/* Doctor white coat & green scrubs */}
          <path d="M19 54C19 44 25 37 34 37C43 37 49 44 49 54" fill="#FFFFFF" stroke="#34A853" strokeWidth="1.8" />
          <path d="M28 37L34 45L40 37" fill="#34A853" />
          {/* Stethoscope */}
          <path d="M28 39V47C28 50 40 50 40 47V39" stroke="#34A853" strokeWidth="1.8" fill="none" />
          <circle cx="34" cy="50" r="2.2" fill="#34A853" />
        </g>

        {/* --- Top Center: Chat Bubble --- */}
        <g transform="translate(175, 40)">
          <rect x="0" y="0" width="36" height="22" rx="6" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
          <path d="M10 22L15 28L20 22" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
          <rect x="7" y="21.5" width="14" height="2" fill="#FFFFFF" />
          <line x1="8" y1="7" x2="28" y2="7" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="12" x2="22" y2="12" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* --- Top Right: Government/Civic Hall with Pillars & Flag --- */}
        <g transform="translate(285, 30)">
          {/* Roof Pediment */}
          <path d="M10 28L40 12L70 28H10Z" fill="#CDE9DD" stroke="#3B6554" strokeWidth="1.8" />
          {/* Flagpole & Green Flag */}
          <line x1="40" y1="12" x2="40" y2="3" stroke="#3B6554" strokeWidth="1.5" />
          <path d="M40 3L49 6L40 9V3Z" fill="#22C55E" />
          {/* Entablature beam */}
          <rect x="14" y="28" width="52" height="5" fill="#E2E8F0" stroke="#3B6554" strokeWidth="1.5" />
          {/* Columns */}
          <rect x="18" y="33" width="6" height="25" fill="#FFFFFF" stroke="#3B6554" strokeWidth="1.5" />
          <rect x="31" y="33" width="6" height="25" fill="#FFFFFF" stroke="#3B6554" strokeWidth="1.5" />
          <rect x="44" y="33" width="6" height="25" fill="#FFFFFF" stroke="#3B6554" strokeWidth="1.5" />
          <rect x="56" y="33" width="6" height="25" fill="#FFFFFF" stroke="#3B6554" strokeWidth="1.5" />
          {/* Steps / Base */}
          <rect x="10" y="58" width="60" height="5" fill="#CBD5E1" stroke="#3B6554" strokeWidth="1.5" />
          <rect x="6" y="63" width="68" height="4" fill="#94A3B8" stroke="#3B6554" strokeWidth="1.5" />
        </g>

        {/* --- Background Map with Folded Perspectives & Location Pin --- */}
        <g transform="translate(145, 95)">
          {/* Folded Map Shape */}
          <path
            d="M0 45L30 35L60 45L90 35V95L60 105L30 95L0 105V45Z"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
          {/* Map Grid / Streets */}
          <path d="M10 50L80 75" stroke="#E2E8F0" strokeWidth="4" />
          <path d="M20 90L75 55" stroke="#FDE68A" strokeWidth="5" />
          <path d="M20 90L75 55" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M30 35V95" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="2 2" />
          <path d="M60 45V105" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Central Green Location Pin */}
          <g transform="translate(45, 30)">
            <path
              d="M0 0C-6.5 0 -12 5.5 -12 12C-12 21 0 32 0 32C0 32 12 21 12 12C12 5.5 6.5 0 0 0Z"
              fill="#22C55E"
              stroke="#15803D"
              strokeWidth="1.5"
            />
            <circle cx="0" cy="11" r="4" fill="#FFFFFF" />
            <circle cx="0" cy="11" r="2" fill="#EAB308" />
          </g>
        </g>

        {/* Small verified badge near map */}
        <g transform="translate(295, 115)">
          <circle cx="10" cy="10" r="9" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1.5" />
          <path d="M6 10L9 13L14 7" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* --- Left Middle: Blood Donor sitting in clinic chair with IV bag --- */}
        <g transform="translate(50, 115)">
          {/* Medical Reclining Armchair */}
          <path
            d="M5 60L22 42L42 55L34 85L12 85L5 60Z"
            fill="#BEE3F8"
            stroke="#4299E1"
            strokeWidth="1.8"
          />
          <rect x="18" y="85" width="4" height="15" fill="#718096" />
          <rect x="30" y="85" width="4" height="15" fill="#718096" />
          <line x1="12" y1="100" x2="38" y2="100" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" />

          {/* Blood Donor Person */}
          {/* Hair & Head */}
          <path d="M22 28C22 22 26 18 32 18C37 18 41 22 41 28V30H22V28Z" fill="#1A202C" />
          <circle cx="32" cy="30" r="8" fill="#FBD38D" />
          {/* Yellow T-Shirt */}
          <path d="M22 38L32 40L42 58L26 58Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
          {/* Blue Pants */}
          <path d="M26 58L20 85L44 85L48 62" fill="#2B6CB0" stroke="#1A365D" strokeWidth="1.5" />
          {/* Extended Arm for Donation */}
          <path d="M32 42L48 48" stroke="#FBD38D" strokeWidth="4.5" strokeLinecap="round" />

          {/* IV Pole */}
          <line x1="60" y1="10" x2="60" y2="95" stroke="#718096" strokeWidth="1.8" />
          <path d="M54 10H66" stroke="#718096" strokeWidth="1.8" />
          {/* Blood Bag with Red Cross / Liquid */}
          <rect x="54" y="16" width="12" height="18" rx="4" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
          <rect x="57" y="23" width="6" height="2" fill="#FFFFFF" />
          <rect x="59" y="21" width="2" height="6" fill="#FFFFFF" />
          {/* Tube connecting to donor's arm */}
          <path d="M60 34C60 48 52 46 48 48" stroke="#EF4444" strokeWidth="1.5" fill="none" />
        </g>

        {/* --- Center: Two Citizens / Community Members Shaking Hands --- */}

        {/* Person A (Left - Green Polo / Professional) */}
        <g transform="translate(145, 120)">
          {/* Head & Hair */}
          <path d="M12 18C12 11 18 7 24 7C30 7 34 11 34 18H12Z" fill="#1A202C" />
          <circle cx="23" cy="20" r="8" fill="#FBD38D" />
          {/* Green Shirt */}
          <path d="M10 30L34 30L36 72L8 72Z" fill="#48BB78" stroke="#276749" strokeWidth="1.5" />
          {/* Blue Pants */}
          <path d="M8 72L8 116L18 116L19 80L21 80L22 116L32 116L34 72Z" fill="#2C5282" stroke="#1A365D" strokeWidth="1.5" />
          {/* Arm extending forward to shake */}
          <path d="M26 36L48 48" stroke="#48BB78" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M46 47L56 50" stroke="#FBD38D" strokeWidth="4.5" strokeLinecap="round" />
        </g>

        {/* Person B (Right - Mustard Yellow Shirt / Citizen with Briefcase) */}
        <g transform="translate(205, 120)">
          {/* Head & Curly Hair */}
          <path d="M14 18C14 11 20 7 26 7C32 7 36 11 36 18H14Z" fill="#1A202C" />
          <circle cx="25" cy="20" r="8" fill="#D69E2E" />
          {/* Yellow Shirt */}
          <path d="M12 30L36 30L38 72L10 72Z" fill="#ECC94B" stroke="#B7791F" strokeWidth="1.5" />
          {/* Dark Charcoal Trousers */}
          <path d="M10 72L10 116L20 116L21 80L23 80L24 116L34 116L36 72Z" fill="#2D3748" stroke="#1A202C" strokeWidth="1.5" />
          {/* Handshake Arm extending left */}
          <path d="M18 36L-2 48" stroke="#ECC94B" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M0 47L-8 50" stroke="#D69E2E" strokeWidth="4.5" strokeLinecap="round" />
          {/* Left Arm holding yellow briefcase */}
          <path d="M32 36L42 66" stroke="#ECC94B" strokeWidth="4.5" strokeLinecap="round" />
          {/* Briefcase */}
          <rect x="36" y="66" width="18" height="15" rx="3" fill="#ECC94B" stroke="#B7791F" strokeWidth="1.5" />
          <path d="M42 66V62H48V66" stroke="#B7791F" strokeWidth="1.5" fill="none" />
        </g>

        {/* --- Right: Female Professional with Folder --- */}
        <g transform="translate(285, 130)">
          {/* Long Hair & Face */}
          <path d="M12 18C12 9 19 6 26 6C33 6 38 9 38 18V38C38 38 35 30 33 30C30 30 28 35 27 38C27 38 24 30 22 30C20 30 18 35 17 38C17 38 15 32 12 32V18Z" fill="#1A202C" />
          <circle cx="25" cy="20" r="8" fill="#FBD38D" />
          {/* White Blouse */}
          <path d="M16 30H34L37 60H13L16 30Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Teal / Emerald Skirt */}
          <path d="M13 60L9 98H41L37 60H13Z" fill="#319795" stroke="#234E52" strokeWidth="1.5" />
          {/* Legs */}
          <line x1="20" y1="98" x2="20" y2="118" stroke="#FBD38D" strokeWidth="3" />
          <line x1="30" y1="98" x2="30" y2="118" stroke="#FBD38D" strokeWidth="3" />
          {/* Folder / Document in Hand */}
          <rect x="10" y="38" width="16" height="20" rx="2" fill="#F6AD55" stroke="#DD6B20" strokeWidth="1.5" transform="rotate(-15 10 38)" />
          <line x1="13" y1="44" x2="22" y2="44" stroke="#FFFFFF" strokeWidth="1.5" transform="rotate(-15 13 44)" />
          <line x1="13" y1="48" x2="20" y2="48" stroke="#FFFFFF" strokeWidth="1.5" transform="rotate(-15 13 48)" />
        </g>

        {/* --- Far Right Bottom: Potted Plant --- */}
        <g transform="translate(325, 205)">
          <path d="M8 20L12 36H24L28 20H8Z" fill="#E2E8F0" stroke="#718096" strokeWidth="1.5" />
          {/* Plant Leaves */}
          <path d="M18 20C12 12 10 2 18 0C26 2 24 12 18 20Z" fill="#38A169" stroke="#22543D" strokeWidth="1" />
          <path d="M14 18C9 14 6 7 11 5C16 7 16 14 14 18Z" fill="#48BB78" />
          <path d="M22 18C27 14 30 7 25 5C20 7 20 14 22 18Z" fill="#2F855A" />
        </g>
      </svg>
    </div>
  );
};

