/**
 * Jalpaiguri Connect - Category & Landmark Architectural Illustrations
 * 
 * Provides bespoke, authentic Bengal architectural & landscape SVG illustrations
 * tailored strictly to Jalpaiguri landmarks and civic categories.
 * 
 * Used as the definitive Level 4 fallback (and Level 2 curated database art)
 * ensuring that NO PLACE CARD EVER APPEARS WITHOUT AN IMAGE.
 */

import { ExplorePlaceCategory } from '../types';

// Encodes SVG into safe, optimized data URI
function svgToDataUri(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString.trim())}`;
}

// 1. Healthcare: North Bengal Clinical Pavilion, Ambulance Bay & Palms
const HEALTHCARE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="hcSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0E382B"/>
      <stop offset="60%" stop-color="#1B4D3E"/>
      <stop offset="100%" stop-color="#2D6A4F"/>
    </linearGradient>
    <linearGradient id="hcBldg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F4EFE6"/>
      <stop offset="100%" stop-color="#E8E1D5"/>
    </linearGradient>
    <linearGradient id="hcRed" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E63946"/>
      <stop offset="100%" stop-color="#D62828"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="800" height="500" fill="url(#hcSky)"/>
  
  <!-- Distant Tea Hills & Mist -->
  <path d="M0 320 Q 200 280, 400 310 T 800 290 L 800 500 L 0 500 Z" fill="#154334" opacity="0.7"/>
  <path d="M0 350 Q 260 310, 520 340 T 800 330 L 800 500 L 0 500 Z" fill="#1E5643"/>
  
  <!-- Ground -->
  <rect y="380" width="800" height="120" fill="#123B2E"/>
  <rect y="400" width="800" height="100" fill="#0C2920"/>

  <!-- Hospital Main Block (Colonial North Bengal Style) -->
  <rect x="220" y="160" width="360" height="230" rx="6" fill="url(#hcBldg)"/>
  <!-- Central Pediment / Triangular Roof -->
  <polygon points="400,100 200,160 600,160" fill="#C85A32"/>
  <polygon points="400,115 220,160 580,160" fill="#E07A5F"/>

  <!-- Pillars / Veranda -->
  <rect x="260" y="180" width="16" height="210" fill="#DDD5C7"/>
  <rect x="320" y="180" width="16" height="210" fill="#DDD5C7"/>
  <rect x="464" y="180" width="16" height="210" fill="#DDD5C7"/>
  <rect x="524" y="180" width="16" height="210" fill="#DDD5C7"/>

  <!-- Red Cross Emblem on Central Gable -->
  <circle cx="400" cy="142" r="18" fill="#FFFFFF"/>
  <rect x="395" y="130" width="10" height="24" rx="2" fill="url(#hcRed)"/>
  <rect x="388" y="137" width="24" height="10" rx="2" fill="url(#hcRed)"/>

  <!-- Windows Grid -->
  <g fill="#2C4C3E" opacity="0.85">
    <rect x="240" y="200" width="35" height="45" rx="3"/>
    <rect x="290" y="200" width="35" height="45" rx="3"/>
    <rect x="340" y="200" width="35" height="45" rx="3"/>
    <rect x="425" y="200" width="35" height="45" rx="3"/>
    <rect x="475" y="200" width="35" height="45" rx="3"/>
    <rect x="525" y="200" width="35" height="45" rx="3"/>

    <rect x="240" y="270" width="35" height="45" rx="3"/>
    <rect x="290" y="270" width="35" height="45" rx="3"/>
    <rect x="340" y="270" width="35" height="45" rx="3"/>
    <rect x="425" y="270" width="35" height="45" rx="3"/>
    <rect x="475" y="270" width="35" height="45" rx="3"/>
    <rect x="525" y="270" width="35" height="45" rx="3"/>
  </g>

  <!-- Emergency Ambulance Bay Entry -->
  <path d="M375 330 A 25 25 0 0 1 425 330 L 425 390 L 375 390 Z" fill="#1C2E24"/>

  <!-- Betel Nut & Palm Trees characteristic of Jalpaiguri -->
  <path d="M120 400 Q 130 260, 115 150" stroke="#5A3E28" stroke-width="8" fill="none"/>
  <ellipse cx="115" cy="140" rx="55" ry="30" fill="#2D6A4F"/>
  <ellipse cx="125" cy="135" rx="45" ry="25" fill="#40916C"/>
  <ellipse cx="100" cy="145" rx="40" ry="20" fill="#52B788"/>

  <path d="M680 410 Q 670 280, 690 170" stroke="#5A3E28" stroke-width="7" fill="none"/>
  <ellipse cx="690" cy="160" rx="50" ry="28" fill="#2D6A4F"/>
  <ellipse cx="700" cy="155" rx="40" ry="22" fill="#52B788"/>

  <!-- Ambient Municipal Badge -->
  <g transform="translate(40, 40)">
    <rect width="180" height="34" rx="17" fill="#0C2920" opacity="0.85"/>
    <circle cx="20" cy="17" r="7" fill="#52B788"/>
    <text x="36" y="22" fill="#E8E1D5" font-family="system-ui, sans-serif" font-size="12" font-weight="600" letter-spacing="0.5">JALPAIGURI HEALTHCARE</text>
  </g>
</svg>`;

// 2. Heritage & Tourism: Rajbari Palace, Lake Dighi, Water Lilies & Teesta Skies
const HERITAGE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="herSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#D97706"/>
      <stop offset="35%" stop-color="#F59E0B"/>
      <stop offset="70%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#FEF3C7"/>
    </linearGradient>
    <linearGradient id="lakeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="40%" stop-color="#0F766E"/>
      <stop offset="100%" stop-color="#042F2E"/>
    </linearGradient>
    <linearGradient id="palaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#9A3412"/>
      <stop offset="100%" stop-color="#7C2D12"/>
    </linearGradient>
  </defs>
  
  <rect width="800" height="500" fill="url(#herSky)"/>
  
  <!-- Distant Golden Sun -->
  <circle cx="580" cy="180" r="55" fill="#FEF08A" opacity="0.9"/>
  
  <!-- Baikunthapur Palace Heritage Silhouette -->
  <g fill="url(#palaceGrad)">
    <!-- Main Palace Body -->
    <rect x="180" y="200" width="440" height="120" rx="3"/>
    <!-- Grand Royal Domed Tower -->
    <rect x="360" y="140" width="80" height="70"/>
    <path d="M350 140 C 350 80, 450 80, 450 140 Z"/>
    <rect x="396" y="65" width="8" height="20" fill="#FCD34D"/>
    <!-- Left Pavilions -->
    <rect x="220" y="165" width="55" height="40"/>
    <path d="M215 165 C 215 125, 280 125, 280 165 Z"/>
    <!-- Right Pavilions -->
    <rect x="525" y="165" width="55" height="40"/>
    <path d="M520 165 C 520 125, 585 125, 585 165 Z"/>
    
    <!-- Royal Arches & Jharokhas -->
    <g fill="#FBBF24" opacity="0.8">
      <path d="M380 230 A 20 20 0 0 1 420 230 L 420 310 L 380 310 Z"/>
      <path d="M310 240 A 15 15 0 0 1 340 240 L 340 300 L 310 300 Z"/>
      <path d="M460 240 A 15 15 0 0 1 490 240 L 490 300 L 460 300 Z"/>
      <path d="M240 250 A 12 12 0 0 1 264 250 L 264 295 L 240 295 Z"/>
      <path d="M536 250 A 12 12 0 0 1 560 250 L 560 295 L 536 295 Z"/>
    </g>
  </g>

  <!-- Palace Shoreline & Ghat Steps -->
  <rect x="140" y="315" width="520" height="15" fill="#431407"/>
  <rect x="100" y="325" width="600" height="12" fill="#5A2411"/>

  <!-- Rajbari Dighi Historic Royal Lake -->
  <rect y="335" width="800" height="165" fill="url(#lakeGrad)"/>

  <!-- Shimmering Water Reflections -->
  <g fill="#FCD34D" opacity="0.3">
    <ellipse cx="400" cy="355" rx="90" ry="3"/>
    <ellipse cx="400" cy="375" rx="140" ry="3"/>
    <ellipse cx="400" cy="405" rx="80" ry="2"/>
    <ellipse cx="580" cy="360" rx="40" ry="3"/>
    <ellipse cx="580" cy="380" rx="30" ry="2"/>
  </g>

  <!-- Lotus Leaves on Dighi Surface -->
  <g fill="#065F46">
    <ellipse cx="220" cy="430" rx="38" ry="12"/>
    <ellipse cx="280" cy="450" rx="30" ry="10"/>
    <ellipse cx="620" cy="440" rx="42" ry="14"/>
    <circle cx="235" cy="425" r="7" fill="#F43F5E"/>
    <circle cx="635" cy="435" r="9" fill="#F43F5E"/>
  </g>

  <!-- Heritage Category Header -->
  <g transform="translate(40, 40)">
    <rect width="180" height="34" rx="17" fill="#451A03" opacity="0.85"/>
    <circle cx="20" cy="17" r="7" fill="#F59E0B"/>
    <text x="36" y="22" fill="#FEF3C7" font-family="system-ui, sans-serif" font-size="12" font-weight="600" letter-spacing="0.5">JALPAIGURI HERITAGE</text>
  </g>
</svg>`;

// 3. Commercial & Markets: Dinbazar Traditional Bengal Stalls & Awnings
const COMMERCIAL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="mktSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#064E3B"/>
      <stop offset="50%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#10B981"/>
    </linearGradient>
    <linearGradient id="awn1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#DC2626"/>
      <stop offset="50%" stop-color="#FEF08A"/>
      <stop offset="100%" stop-color="#DC2626"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="url(#mktSky)"/>

  <!-- Market Architecture Silhouette -->
  <rect x="80" y="150" width="640" height="230" fill="#F3F4F6"/>
  <rect x="80" y="140" width="640" height="15" fill="#1F2937"/>

  <!-- Traditional Terracotta Roof Line -->
  <polygon points="400,90 60,150 740,150" fill="#B45309"/>

  <!-- Market Stalls & Striped Awnings -->
  <g transform="translate(100, 240)">
    <!-- Stall 1 -->
    <path d="M0,0 L160,0 L180,45 L-20,45 Z" fill="#DC2626"/>
    <path d="M20,0 L60,0 L70,45 L30,45 Z" fill="#FEF08A"/>
    <path d="M100,0 L140,0 L150,45 L110,45 Z" fill="#FEF08A"/>
    <rect x="0" y="45" width="160" height="100" fill="#E5E7EB"/>
    <rect x="15" y="65" width="130" height="50" rx="4" fill="#9CA3AF"/>
  </g>

  <g transform="translate(320, 240)">
    <!-- Stall 2 -->
    <path d="M0,0 L160,0 L180,45 L-20,45 Z" fill="#2563EB"/>
    <path d="M20,0 L60,0 L70,45 L30,45 Z" fill="#FFFFFF"/>
    <path d="M100,0 L140,0 L150,45 L110,45 Z" fill="#FFFFFF"/>
    <rect x="0" y="45" width="160" height="100" fill="#E5E7EB"/>
    <rect x="15" y="65" width="130" height="50" rx="4" fill="#9CA3AF"/>
  </g>

  <g transform="translate(540, 240)">
    <!-- Stall 3 -->
    <path d="M0,0 L160,0 L180,45 L-20,45 Z" fill="#059669"/>
    <path d="M20,0 L60,0 L70,45 L30,45 Z" fill="#FEF08A"/>
    <path d="M100,0 L140,0 L150,45 L110,45 Z" fill="#FEF08A"/>
    <rect x="0" y="45" width="160" height="100" fill="#E5E7EB"/>
    <rect x="15" y="65" width="130" height="50" rx="4" fill="#9CA3AF"/>
  </g>

  <!-- Ground / Pavement -->
  <rect y="380" width="800" height="120" fill="#374151"/>
  <rect y="400" width="800" height="100" fill="#1F2937"/>

  <!-- Festive Hanging Market Lanterns -->
  <g stroke="#F59E0B" stroke-width="2">
    <line x1="160" y1="180" x2="160" y2="220"/>
    <circle cx="160" cy="225" r="10" fill="#EF4444"/>
    <line x1="380" y1="180" x2="380" y2="220"/>
    <circle cx="380" cy="225" r="10" fill="#F59E0B"/>
    <line x1="600" y1="180" x2="600" y2="220"/>
    <circle cx="600" cy="225" r="10" fill="#10B981"/>
  </g>

  <!-- Category Tag -->
  <g transform="translate(40, 40)">
    <rect width="180" height="34" rx="17" fill="#064E3B" opacity="0.85"/>
    <circle cx="20" cy="17" r="7" fill="#10B981"/>
    <text x="36" y="22" fill="#D1FAE5" font-family="system-ui, sans-serif" font-size="12" font-weight="600" letter-spacing="0.5">JALPAIGURI MARKETS</text>
  </g>
</svg>`;

// 4. Transport: Jalpaiguri Town Station, Clock Tower & Toto Stands
const TRANSPORT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="trSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="60%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <linearGradient id="stnBrick" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#991B1B"/>
      <stop offset="100%" stop-color="#7F1D1D"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="url(#trSky)"/>

  <!-- Station Platform & Main Building (Heritage Brick) -->
  <rect x="140" y="220" width="520" height="150" rx="4" fill="url(#stnBrick)"/>

  <!-- Heritage Clock Tower -->
  <rect x="350" y="110" width="100" height="120" fill="#7F1D1D"/>
  <polygon points="400,60 340,110 460,110" fill="#B91C1C"/>
  <circle cx="400" cy="150" r="22" fill="#FEF3C7" stroke="#1E293B" stroke-width="4"/>
  <!-- Clock Hands -->
  <line x1="400" y1="150" x2="400" y2="136" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
  <line x1="400" y1="150" x2="410" y2="150" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>

  <!-- Station Canopies -->
  <polygon points="120,220 360,220 380,240 100,240" fill="#FBBF24"/>
  <polygon points="420,220 680,220 700,240 440,240" fill="#FBBF24"/>

  <!-- Veranda Arches -->
  <g fill="#1E293B">
    <path d="M180 270 A 20 20 0 0 1 220 270 L 220 370 L 180 370 Z"/>
    <path d="M260 270 A 20 20 0 0 1 300 270 L 300 370 L 260 370 Z"/>
    <path d="M500 270 A 20 20 0 0 1 540 270 L 540 370 L 500 370 Z"/>
    <path d="M580 270 A 20 20 0 0 1 620 270 L 620 370 L 580 370 Z"/>
  </g>

  <!-- Platform & Railway Tracks -->
  <rect y="370" width="800" height="30" fill="#64748B"/>
  <rect y="400" width="800" height="100" fill="#0F172A"/>

  <!-- Railway Track Lines -->
  <line x1="0" y1="430" x2="800" y2="430" stroke="#94A3B8" stroke-width="4"/>
  <line x1="0" y1="460" x2="800" y2="460" stroke="#94A3B8" stroke-width="4"/>
  <!-- Sleepers -->
  <g stroke="#334155" stroke-width="6">
    <line x1="100" y1="420" x2="100" y2="470"/>
    <line x1="200" y1="420" x2="200" y2="470"/>
    <line x1="300" y1="420" x2="300" y2="470"/>
    <line x1="400" y1="420" x2="400" y2="470"/>
    <line x1="500" y1="420" x2="500" y2="470"/>
    <line x1="600" y1="420" x2="600" y2="470"/>
    <line x1="700" y1="420" x2="700" y2="470"/>
  </g>

  <!-- Category Tag -->
  <g transform="translate(40, 40)">
    <rect width="180" height="34" rx="17" fill="#0F172A" opacity="0.85"/>
    <circle cx="20" cy="17" r="7" fill="#FBBF24"/>
    <text x="36" y="22" fill="#FEF3C7" font-family="system-ui, sans-serif" font-size="12" font-weight="600" letter-spacing="0.5">JALPAIGURI TRANSIT</text>
  </g>
</svg>`;

// 5. Education & Civic: JGEC & Municipality Neoclassical Hall
const EDUCATION_CIVIC_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="edSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="70%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#93C5FD"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="url(#edSky)"/>

  <!-- Academic Green Lawns -->
  <rect y="360" width="800" height="140" fill="#15803D"/>
  <rect y="390" width="800" height="110" fill="#166534"/>

  <!-- Neoclassical Academic Campus Facade -->
  <rect x="180" y="190" width="440" height="180" fill="#F8FAFC"/>
  <!-- Grand Front Gable -->
  <polygon points="400,100 160,190 640,190" fill="#E2E8F0"/>
  <polygon points="400,115 190,190 610,190" fill="#CBD5E1"/>

  <!-- Grand Pillars (Ionic/Corinthian Style) -->
  <g fill="#94A3B8">
    <rect x="230" y="190" width="20" height="170" rx="3"/>
    <rect x="290" y="190" width="20" height="170" rx="3"/>
    <rect x="350" y="190" width="20" height="170" rx="3"/>
    <rect x="430" y="190" width="20" height="170" rx="3"/>
    <rect x="490" y="190" width="20" height="170" rx="3"/>
    <rect x="550" y="190" width="20" height="170" rx="3"/>
  </g>

  <!-- Emblem / Ashok Chakra Motif on Center -->
  <circle cx="400" cy="155" r="18" fill="#1E3A8A"/>
  <circle cx="400" cy="155" r="14" fill="#FFFFFF"/>
  <circle cx="400" cy="155" r="4" fill="#1E3A8A"/>

  <!-- Central Oak Entryway -->
  <path d="M380 280 A 20 20 0 0 1 420 280 L 420 360 L 380 360 Z" fill="#1E293B"/>

  <!-- Category Tag -->
  <g transform="translate(40, 40)">
    <rect width="180" height="34" rx="17" fill="#1E3A8A" opacity="0.85"/>
    <circle cx="20" cy="17" r="7" fill="#60A5FA"/>
    <text x="36" y="22" fill="#EFF6FF" font-family="system-ui, sans-serif" font-size="12" font-weight="600" letter-spacing="0.5">EDUCATION &amp; CIVIC</text>
  </g>
</svg>`;

// 6. Fuel & Utilities: Clean Energy Canopy, Pumps & Green Landscaping
const FUEL_UTILITIES_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="flSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#047857"/>
      <stop offset="60%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#34D399"/>
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="url(#flSky)"/>

  <!-- Modern Station Canopy -->
  <rect x="120" y="150" width="560" height="50" rx="8" fill="#EA580C"/>
  <rect x="140" y="190" width="520" height="15" fill="#C2410C"/>

  <!-- Heavy Steel Support Columns -->
  <rect x="250" y="205" width="30" height="180" fill="#E2E8F0"/>
  <rect x="520" y="205" width="30" height="180" fill="#E2E8F0"/>

  <!-- Dispensing Fuel Islands -->
  <g transform="translate(225, 290)">
    <rect x="0" y="0" width="80" height="95" rx="6" fill="#1E293B"/>
    <rect x="10" y="15" width="60" height="35" rx="3" fill="#22C55E"/>
    <circle cx="25" cy="65" r="6" fill="#EA580C"/>
    <circle cx="55" cy="65" r="6" fill="#3B82F6"/>
  </g>

  <g transform="translate(495, 290)">
    <rect x="0" y="0" width="80" height="95" rx="6" fill="#1E293B"/>
    <rect x="10" y="15" width="60" height="35" rx="3" fill="#22C55E"/>
    <circle cx="25" cy="65" r="6" fill="#EA580C"/>
    <circle cx="55" cy="65" r="6" fill="#3B82F6"/>
  </g>

  <!-- Driveway Pavement -->
  <rect y="380" width="800" height="120" fill="#334155"/>
  <rect y="405" width="800" height="95" fill="#1E293B"/>

  <!-- Category Tag -->
  <g transform="translate(40, 40)">
    <rect width="180" height="34" rx="17" fill="#1E293B" opacity="0.85"/>
    <circle cx="20" cy="17" r="7" fill="#F97316"/>
    <text x="36" y="22" fill="#FFEDD5" font-family="system-ui, sans-serif" font-size="12" font-weight="600" letter-spacing="0.5">FUEL &amp; UTILITIES</text>
  </g>
</svg>`;

// Map Category to corresponding artistic vector SVG data URI
export function getCategoryIllustrationUri(category: ExplorePlaceCategory | string): string {
  switch (category) {
    case 'Healthcare':
      return svgToDataUri(HEALTHCARE_SVG);
    case 'Heritage & Tourism':
      return svgToDataUri(HERITAGE_SVG);
    case 'Commercial & Markets':
      return svgToDataUri(COMMERCIAL_SVG);
    case 'Transport':
      return svgToDataUri(TRANSPORT_SVG);
    case 'Education & Civic':
      return svgToDataUri(EDUCATION_CIVIC_SVG);
    case 'Fuel & Utilities':
      return svgToDataUri(FUEL_UTILITIES_SVG);
    default:
      return svgToDataUri(HERITAGE_SVG);
  }
}
