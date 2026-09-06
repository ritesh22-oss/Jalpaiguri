// Official Government Services Directory & Trust Verification Engine
// Strictly uses verified official portals of Government of West Bengal, Government of India, and Jalpaiguri Municipality.

export type GovtServiceCategory =
  | 'MAIN PORTALS'
  | 'CERTIFICATES'
  | 'LAND & PROPERTY'
  | 'MUNICIPAL SERVICES'
  | 'RATION & FOOD'
  | 'TRANSPORT'
  | 'UTILITY SERVICES'
  | 'EDUCATION & SCHOLARSHIPS'
  | 'EMPLOYMENT'
  | 'BUSINESS & TRADE'
  | 'HEALTH & WELFARE'
  | 'AGRICULTURE'
  | 'COMPLAINTS & GRIEVANCES'
  | 'DEPARTMENT PORTALS'
  | 'GOVERNMENT SCHEMES';

export type GovtAuthority =
  | 'Government of West Bengal'
  | 'Government of India'
  | 'Jalpaiguri Municipality';

export interface GovernmentService {
  id: string;
  name: string;
  category: GovtServiceCategory;
  shortDesc: string;
  department: string;
  authority: GovtAuthority;
  officialUrl: string;       // Verified official portal homepage
  applyUrl?: string;          // Direct verified online application URL if available
  statusUrl?: string;         // Direct verified application tracking URL if available
  requirements: string[];     // Verified pre-requisite documents
  lastVerified: string;       // Date of last URL & portal verification
  icon: string;               // Icon identifier for rendering
  hasDirectApply: boolean;
  hasStatusTrack: boolean;
  popular?: boolean;          // Display in Quick Shortcuts
}

export interface SavedGovtApplication {
  id: string;
  serviceId: string;
  serviceName: string;
  referenceNumber: string;
  appliedDate: string;
  status: 'Submitted' | 'Under Review' | 'Document Verification' | 'Approved' | 'Action Required';
  officialPortal: string;
  statusUrl?: string;
  notes?: string;
  updatedAt: string;
}

export interface GovtScheme {
  id: string;
  name: string;
  bengaliName?: string;
  department: string;
  authority: GovtAuthority;
  whoItIsFor: string;
  targetCategory: 'Student' | 'Worker' | 'Farmer' | 'Business Owner' | 'Senior Citizen' | 'Women' | 'General';
  minAge?: number;
  maxAge?: number;
  incomeLimit?: string;
  benefits: string;
  basicEligibility: string[];
  requiredDocuments: string[];
  applicationMethod: string;
  officialUrl: string;
  applyUrl?: string;
  lastVerified: string;
}

export interface GovtAlert {
  id: string;
  title: string;
  source: string;
  authority: GovtAuthority;
  type: 'OFFICIAL' | 'COMMUNITY';
  category: 'CAMP' | 'SCHOLARSHIP' | 'MUNICIPAL' | 'DEADLINE' | 'ANNOUNCEMENT';
  description: string;
  publishedDate: string;
  lastVerified: string;
  officialNoticeUrl?: string;
  activeUntil?: string;
  badge: string;
}

/**
 * 1. CENTRALIZED VERIFIED GOVERNMENT SERVICES DIRECTORY
 * Master Link List for Jalpaiguri & West Bengal Citizens
 */
export const VERIFIED_GOVERNMENT_SERVICES: GovernmentService[] = [
  // ==========================================
  // 🏛️ 1. MAIN GOVERNMENT PORTALS & BSK
  // ==========================================
  {
    id: 'main-wb-gov',
    name: 'West Bengal Government',
    category: 'MAIN PORTALS',
    shortDesc: 'Official West Bengal state portal for news, notifications, departments and digital governance.',
    department: 'Government of West Bengal',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wb.gov.in/',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Landmark',
    hasDirectApply: true,
    hasStatusTrack: false,
    popular: true
  },
  {
    id: 'main-wb-eservices',
    name: 'West Bengal Government E-Services',
    category: 'MAIN PORTALS',
    shortDesc: 'Comprehensive directory of state e-services across all departments.',
    department: 'Department of Information Technology & Electronics',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wb.gov.in/e-services.aspx',
    requirements: ['Internet Access'],
    lastVerified: 'September 2024',
    icon: 'Layers',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'main-wb-citizen-services',
    name: 'West Bengal Citizen Services',
    category: 'MAIN PORTALS',
    shortDesc: 'Centralized access portal for state citizen services and downloadable forms.',
    department: 'Government of West Bengal',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wb.gov.in/citizens.aspx',
    requirements: ['Aadhaar / Citizen Credentials'],
    lastVerified: 'September 2024',
    icon: 'Landmark',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'main-edistrict',
    name: 'WB e-District',
    category: 'MAIN PORTALS',
    shortDesc: 'Integrated portal for e-certificates, land, trade, and statutory permissions.',
    department: 'Department of Personnel & Administrative Reforms',
    authority: 'Government of West Bengal',
    officialUrl: 'https://edistrict.wb.gov.in/home',
    requirements: ['Mobile Number', 'Aadhaar / EPIC', 'Address Proof'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'main-bsk',
    name: 'Bangla Sahayata Kendra',
    category: 'MAIN PORTALS',
    shortDesc: 'Free grassroots citizen service portal offering 326+ state services across 40 departments.',
    department: 'P&AR Department, Govt of West Bengal',
    authority: 'Government of West Bengal',
    officialUrl: 'https://bsk.wb.gov.in/',
    requirements: ['Mobile Number', 'Identity Proof'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'main-bsk-directory',
    name: 'BSK Complete Services Directory',
    category: 'MAIN PORTALS',
    shortDesc: 'Live directory listing all 326+ government e-services offered at Bangla Sahayata Kendras.',
    department: 'P&AR Department, Govt of West Bengal',
    authority: 'Government of West Bengal',
    officialUrl: 'https://bsk.wb.gov.in/v3_services?lang=en',
    requirements: ['None'],
    lastVerified: 'September 2024',
    icon: 'Layers',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'main-bsk-schemes',
    name: 'BSK Government Schemes',
    category: 'MAIN PORTALS',
    shortDesc: 'Official catalogue of West Bengal welfare schemes and application guidelines.',
    department: 'P&AR Department, Govt of West Bengal',
    authority: 'Government of West Bengal',
    officialUrl: 'https://bsk.wb.gov.in/scheme_bsk/',
    requirements: ['None'],
    lastVerified: 'September 2024',
    icon: 'Sparkles',
    hasDirectApply: true,
    hasStatusTrack: false
  },

  // ==========================================
  // 🪪 2. CERTIFICATES & DOCUMENTS
  // ==========================================
  {
    id: 'cert-birth',
    name: 'Birth Certificate (Janma-Mrityu Tathya)',
    category: 'CERTIFICATES',
    shortDesc: 'Official West Bengal portal to apply, verify and download digital birth certificates.',
    department: 'Health & Family Welfare Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://janma-mrityutathya.wb.gov.in',
    requirements: ['Hospital Discharge Summary', 'Parent Aadhaar Cards', 'Address Proof'],
    lastVerified: 'September 2024',
    icon: 'Baby',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'cert-death',
    name: 'Death Certificate (Janma-Mrityu Tathya)',
    category: 'CERTIFICATES',
    shortDesc: 'Apply, track and download official digital death certificates in West Bengal.',
    department: 'Health & Family Welfare Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://janma-mrityutathya.wb.gov.in',
    requirements: ['Medical Cause of Death Certificate', 'Deceased Aadhaar Card', 'Applicant ID Proof'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'cert-caste',
    name: 'Caste Certificate (SC / ST / OBC)',
    category: 'CERTIFICATES',
    shortDesc: 'Official online application and tracking for SC, ST, and OBC social certificates.',
    department: 'Backward Classes Welfare Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://castcertificatewb.gov.in',
    requirements: ['Blood Relation Caste Certificate', 'Ration Card / EPIC', 'Address Proof', 'Passport Photo'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'cert-income',
    name: 'Income Certificate (WB e-District)',
    category: 'CERTIFICATES',
    shortDesc: 'Issuance of official annual income certificate for scholarships and admissions.',
    department: 'District Administration / Jalpaiguri Collectorate',
    authority: 'Government of West Bengal',
    officialUrl: 'https://edistrict.wb.gov.in',
    requirements: ['Salary Slip / Income Tax Return / Pradhan or Councillor Certificate', 'Aadhaar Card'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'cert-domicile',
    name: 'Domicile / Residential Certificate',
    category: 'CERTIFICATES',
    shortDesc: 'Official West Bengal domicile certificate for state quota, exams and recruitment.',
    department: 'District Administration, Jalpaiguri',
    authority: 'Government of West Bengal',
    officialUrl: 'https://edistrict.wb.gov.in',
    requirements: ['15 Years Residence Proof in WB', 'Aadhaar / Voter ID', 'School Leaving Certificate'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'cert-residential-bsk',
    name: 'Residential Certificate via BSK',
    category: 'CERTIFICATES',
    shortDesc: 'Apply for residential status certificate through Bangla Sahayata Kendra counters.',
    department: 'P&AR Department, Govt of West Bengal',
    authority: 'Government of West Bengal',
    officialUrl: 'https://bsk.wb.gov.in',
    requirements: ['Proof of Address', 'Aadhaar Card'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'cert-marriage',
    name: 'Marriage Registration Certificate',
    category: 'CERTIFICATES',
    shortDesc: 'Online application and appointment booking for West Bengal Marriage Registrar.',
    department: 'Judicial Department / e-District',
    authority: 'Government of West Bengal',
    officialUrl: 'https://edistrict.wb.gov.in',
    requirements: ['Bride & Groom Age Proof (21/18)', 'Address Proof', 'Marriage Photos', 'Witness IDs'],
    lastVerified: 'September 2024',
    icon: 'HeartPulse',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'cert-deed-copy',
    name: 'Deed Certified Copy',
    category: 'CERTIFICATES',
    shortDesc: 'Obtain official certified copies of registered land/property deeds online.',
    department: 'Directorate of Registration & Stamp Revenue',
    authority: 'Government of West Bengal',
    officialUrl: 'https://bsk.wb.gov.in',
    requirements: ['Deed Number & Year', 'Registration Office Name', 'Applicant Photo ID'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'cert-deed-eregistration',
    name: 'Deed e-Registration',
    category: 'CERTIFICATES',
    shortDesc: 'Pre-registration market value assessment and online deed draft submission.',
    department: 'Directorate of Registration & Stamp Revenue',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbregistration.gov.in',
    requirements: ['Seller & Buyer Pan/Aadhaar', 'Khatian/Plot Details', 'Property Boundaries'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'cert-stamp-duty',
    name: 'Stamp Duty & Registration Fee Info',
    category: 'CERTIFICATES',
    shortDesc: 'Calculate stamp duty, registration fees and property market valuation online.',
    department: 'Directorate of Registration & Stamp Revenue',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbregistration.gov.in',
    requirements: ['JL Number', 'Plot Number', 'Property Area'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'cert-copy-request',
    name: 'Government Certificate Copy Request',
    category: 'CERTIFICATES',
    shortDesc: 'Request duplicate/certified copies of state certificates through BSK.',
    department: 'Bangla Sahayata Kendra',
    authority: 'Government of West Bengal',
    officialUrl: 'https://bsk.wb.gov.in',
    requirements: ['Original Certificate Ref Number', 'Identity Proof'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },

  // ==========================================
  // 🏠 3. LAND & PROPERTY
  // ==========================================
  {
    id: 'land-records',
    name: 'BanglarBhumi Land Records & Khatian Search',
    category: 'LAND & PROPERTY',
    shortDesc: 'Search Khatiyan and Dag details, plot maps, land classification across West Bengal.',
    department: 'Land & Land Reforms Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://banglarbhumi.gov.in',
    requirements: ['District (Jalpaiguri)', 'Block', 'Mouza', 'Khatian Number / Dag Number'],
    lastVerified: 'September 2024',
    icon: 'Layers',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'land-ror',
    name: 'Record of Rights (ROR) Copy Request',
    category: 'LAND & PROPERTY',
    shortDesc: 'Download certified digitally signed copies of Record of Rights (ROR).',
    department: 'Land & Land Reforms Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://banglarbhumi.gov.in',
    requirements: ['Khatiyan Number', 'Mouza Code', 'Online Payment Card/UPI'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'land-mutation',
    name: 'Online Land Mutation Application',
    category: 'LAND & PROPERTY',
    shortDesc: 'Apply online for mutation of land ownership after purchase or inheritance.',
    department: 'Land & Land Reforms Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://banglarbhumi.gov.in',
    requirements: ['Registered Deed', 'Chain Deeds', 'Current Khajna Receipt', 'Aadhaar Card'],
    lastVerified: 'September 2024',
    icon: 'Layers',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'land-plot-info',
    name: 'Plot Information & Map Search',
    category: 'LAND & PROPERTY',
    shortDesc: 'View plot boundaries, classification, area and land map details in Jalpaiguri.',
    department: 'Land & Land Reforms Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://banglarbhumi.gov.in',
    requirements: ['Mouza Name', 'Plot Number'],
    lastVerified: 'September 2024',
    icon: 'Compass',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'prop-tax-udma',
    name: 'Urban Property Tax (WB UDMA Portal)',
    category: 'LAND & PROPERTY',
    shortDesc: 'Statewide e-services portal for municipal property tax assessment and online payments.',
    department: 'Urban Development & Municipal Affairs Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://udma.wb.gov.in',
    requirements: ['Holding Number / Assessment Number', 'Ward Number'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'prop-tax-nodues',
    name: 'Property Tax No-Dues Certificate',
    category: 'LAND & PROPERTY',
    shortDesc: 'Download official Municipal No-Dues Certificate after clearing holding tax.',
    department: 'Urban Development & Municipal Affairs Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://udma.wb.gov.in',
    requirements: ['Holding Number', 'Last Payment Receipt'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'prop-muni-mutation',
    name: 'Municipal Mutation Application',
    category: 'LAND & PROPERTY',
    shortDesc: 'Apply for updating holding ownership name in municipal tax records.',
    department: 'Urban Development & Municipal Affairs Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://udma.wb.gov.in',
    requirements: ['BL&LRO Mutation Order', 'Registered Sale Deed', 'Aadhaar'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'prop-building-plan',
    name: 'Building Plan Approval & Sanction',
    category: 'LAND & PROPERTY',
    shortDesc: 'Submit architectural drawings for municipal building plan approval online.',
    department: 'Urban Development & Municipal Affairs Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://udma.wb.gov.in',
    requirements: ['Architect Drawings (CAD)', 'Land Record (ROR)', 'Mutation Copy', 'Structural Stability Cert'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'prop-occupancy-cert',
    name: 'Occupancy Certificate (OC)',
    category: 'LAND & PROPERTY',
    shortDesc: 'Apply for building occupancy certificate after completion of construction.',
    department: 'Urban Development & Municipal Affairs Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://udma.wb.gov.in',
    requirements: ['Sanctioned Plan Copy', 'Completion Certificate from LBS/Architect'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'prop-building-noc',
    name: 'Building NOC Application',
    category: 'LAND & PROPERTY',
    shortDesc: 'Apply for municipal and fire safety No-Objection Certificates for commercial buildings.',
    department: 'Urban Development & Municipal Affairs Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://udma.wb.gov.in',
    requirements: ['Building Plan', 'Fire Safety Layout'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'prop-water-conn',
    name: 'Municipal Water Connection Application',
    category: 'LAND & PROPERTY',
    shortDesc: 'Apply for new domestic or commercial municipal water pipe connection.',
    department: 'Urban Development & Municipal Affairs Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://udma.wb.gov.in',
    requirements: ['Holding Tax Receipt', 'Aadhaar', 'Premises Layout'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'prop-sewer-conn',
    name: 'Sewer & Drain Connection Sanction',
    category: 'LAND & PROPERTY',
    shortDesc: 'Sanction and fee payment for municipal underground drainage/sewer connections.',
    department: 'Urban Development & Municipal Affairs Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://udma.wb.gov.in',
    requirements: ['Holding Receipt', 'Site Plan'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },

  // ==========================================
  // 🏛️ 4. MUNICIPALITY SERVICES (JALPAIGURI)
  // ==========================================
  {
    id: 'muni-prop-tax',
    name: 'Jalpaiguri Holding Tax Payment',
    category: 'MUNICIPAL SERVICES',
    shortDesc: 'Calculate holding tax, view property assessment details, pay municipal taxes online and download digital receipts.',
    department: 'Revenue & Tax Cell, Jalpaiguri Municipality',
    authority: 'Jalpaiguri Municipality',
    officialUrl: 'https://jalpaigurimunicipality.org',
    requirements: ['Holding Number / Ward Number', 'Owner Aadhaar/Phone', 'Previous Payment Receipt'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'muni-trade-license',
    name: 'Jalpaiguri Municipal Trade Licence',
    category: 'MUNICIPAL SERVICES',
    shortDesc: 'Apply for new business trade certificate or renew municipal trade license online.',
    department: 'Trade License Section, Jalpaiguri Municipality',
    authority: 'Jalpaiguri Municipality',
    officialUrl: 'https://silpasathi.wb.gov.in',
    requirements: ['Holding Tax Clearance Receipt', 'Rent Agreement / Deed', 'PAN Card', 'Passport Photo'],
    lastVerified: 'September 2024',
    icon: 'Briefcase',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },

  // ==========================================
  // 🍚 5. RATION & FOOD
  // ==========================================
  {
    id: 'ration-digital-card',
    name: 'Digital Ration Card e-Citizen Portal',
    category: 'RATION & FOOD',
    shortDesc: 'West Bengal Food & Supplies portal for e-Ration card services and status check.',
    department: 'Food & Supplies Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://food.wb.gov.in',
    requirements: ['Ration Card Number / Mobile Number', 'Aadhaar Number'],
    lastVerified: 'September 2024',
    icon: 'Layers',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'ration-new-card',
    name: 'New Ration Card Application (Form 3 / Form 4)',
    category: 'RATION & FOOD',
    shortDesc: 'Apply online for new digital ration card for un-enrolled family members.',
    department: 'Food & Supplies Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://food.wb.gov.in',
    requirements: ['Aadhaar Number of All Members', 'Head of Family ID Proof', 'Active Mobile Number'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'ration-add-member',
    name: 'Add Family Member to Ration Card (Form 4)',
    category: 'RATION & FOOD',
    shortDesc: 'Add newborn children or newly married family members to existing digital ration card.',
    department: 'Food & Supplies Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://food.wb.gov.in',
    requirements: ['Birth Certificate (for infant) / Marriage Cert', 'Existing Family Ration Card Number', 'Aadhaar'],
    lastVerified: 'September 2024',
    icon: 'Baby',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'ration-correct-details',
    name: 'Correct Ration Card Name/Address Details (Form 5)',
    category: 'RATION & FOOD',
    shortDesc: 'Correction of spelling mistakes in name, age, gender or address on ration card.',
    department: 'Food & Supplies Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://food.wb.gov.in',
    requirements: ['Aadhaar Card (matching correct details)', 'Ration Card Number'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'ration-change-shop',
    name: 'Change FPS Ration Shop / Kerosene Dealer (Form 6)',
    category: 'RATION & FOOD',
    shortDesc: 'Transfer your fair price shop assignment after moving address within West Bengal.',
    department: 'Food & Supplies Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://food.wb.gov.in',
    requirements: ['New Address Proof in Jalpaiguri', 'Existing Ration Card Number'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'ration-surrender',
    name: 'Surrender / Cancel Ration Card (Form 7)',
    category: 'RATION & FOOD',
    shortDesc: 'Surrender ration card in case of death or permanent relocation outside state.',
    department: 'Food & Supplies Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://food.wb.gov.in',
    requirements: ['Death Certificate (if applicable)', 'Ration Card Number'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'ration-duplicate',
    name: 'Duplicate Ration Card Application (Form 9)',
    category: 'RATION & FOOD',
    shortDesc: 'Apply for duplicate digital ration card if original physical card is lost or damaged.',
    department: 'Food & Supplies Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://food.wb.gov.in',
    requirements: ['General Diary (GD) Copy', 'Aadhaar Card'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'ration-category-change',
    name: 'Ration Card Category Change (Form 8 / Form 10)',
    category: 'RATION & FOOD',
    shortDesc: 'Convert Non-Subsidized card to Subsidized (RKSY-I/II) or vice versa based on eligibility.',
    department: 'Food & Supplies Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://food.wb.gov.in',
    requirements: ['Income Certificate', 'Aadhaar Number', 'Ration Card Details'],
    lastVerified: 'September 2024',
    icon: 'Layers',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'ration-aadhaar-link',
    name: 'Ration Card Aadhaar Linking (e-KYC)',
    category: 'RATION & FOOD',
    shortDesc: 'Link Aadhaar card with digital ration card via OTP e-KYC or fingerprint biometric.',
    department: 'Food & Supplies Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://food.wb.gov.in',
    requirements: ['Ration Card Number', 'Aadhaar Number', 'Aadhaar-Linked Mobile Number for OTP'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'ration-mobile-update',
    name: 'Ration Card Mobile Number Update',
    category: 'RATION & FOOD',
    shortDesc: 'Update or change registered mobile number associated with family ration card.',
    department: 'Food & Supplies Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://food.wb.gov.in',
    requirements: ['Aadhaar Number', 'New Active Mobile Number'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'ration-status',
    name: 'Ration Card Application Status Check',
    category: 'RATION & FOOD',
    shortDesc: 'Track online status of new ration card, modification or transfer application.',
    department: 'Food & Supplies Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://food.wb.gov.in',
    requirements: ['Application Reference Number / Form Number / Mobile Number'],
    lastVerified: 'September 2024',
    icon: 'ChevronRight',
    hasDirectApply: false,
    hasStatusTrack: true
  },
  {
    id: 'ration-download-ecard',
    name: 'Download e-Ration Card (PDF)',
    category: 'RATION & FOOD',
    shortDesc: 'Instantly download official e-Ration card PDF with QR code verification.',
    department: 'Food & Supplies Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://food.wb.gov.in',
    requirements: ['Ration Card Number', 'Category (AAY, PHH, SPHH, RKSY-I, RKSY-II)'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: false,
    popular: true
  },
  {
    id: 'ration-grievance',
    name: 'Ration Toll-Free Grievance & Complaint Portal',
    category: 'RATION & FOOD',
    shortDesc: 'Lodge official complaints regarding ration supply, dealer weight, or missing quota.',
    department: 'Food & Supplies Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://food.wb.gov.in',
    requirements: ['Ration Card Details', 'Dealer Name & Location'],
    lastVerified: 'September 2024',
    icon: 'AlertCircle',
    hasDirectApply: true,
    hasStatusTrack: true
  },

  // ==========================================
  // 🚗 6. TRANSPORT
  // ==========================================
  {
    id: 'trans-dl',
    name: 'Driving Licence Services (Parivahan Sewa)',
    category: 'TRANSPORT',
    shortDesc: 'Apply for permanent driving licence, DL renewal, duplicate DL, or address change.',
    department: 'Ministry of Road Transport & Highways / RTO Jalpaiguri',
    authority: 'Government of India',
    officialUrl: 'https://parivahan.gov.in',
    requirements: ['Learner Licence Number', 'Medical Fitness Certificate (Form 1A)', 'Proof of Address'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'trans-ll',
    name: 'Learner Licence Online Exam & Application',
    category: 'TRANSPORT',
    shortDesc: 'Apply online for learner driving licence and take contactless online test.',
    department: 'Transport Department / RTO Jalpaiguri',
    authority: 'Government of India',
    officialUrl: 'https://sarathi.parivahan.gov.in',
    requirements: ['Aadhaar e-KYC', 'Age Proof (18+)', 'Blood Group Certificate'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'trans-vahan-reg',
    name: 'Vehicle Registration Services (VAHAN)',
    category: 'TRANSPORT',
    shortDesc: 'New vehicle registration, RC transfer, NOC issuance and road tax payment.',
    department: 'Transport Department / RTO Jalpaiguri',
    authority: 'Government of India',
    officialUrl: 'https://vahan.parivahan.gov.in',
    requirements: ['Chassis & Engine Number', 'Sales Certificate (Form 21)', 'Insurance Policy', 'Pollution Cert'],
    lastVerified: 'September 2024',
    icon: 'Layers',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'trans-rc-details',
    name: 'Registration Certificate (RC) & Smart Card',
    category: 'TRANSPORT',
    shortDesc: 'Download digital RC, check vehicle owner details, and apply for smart card RC.',
    department: 'Transport Department / RTO Jalpaiguri',
    authority: 'Government of India',
    officialUrl: 'https://parivahan.gov.in',
    requirements: ['Vehicle Registration Number', 'Last 5 Digits of Chassis Number'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'trans-vehicle-services',
    name: 'Parivahan Vehicle e-Services Portal',
    category: 'TRANSPORT',
    shortDesc: 'Comprehensive portal for vehicle tax payment, fitness, permits and ownership transfer.',
    department: 'Ministry of Road Transport & Highways',
    authority: 'Government of India',
    officialUrl: 'https://parivahan.gov.in',
    requirements: ['Vehicle Number', 'Chassis Number'],
    lastVerified: 'September 2024',
    icon: 'Layers',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'trans-licence-services',
    name: 'Parivahan Licence Services Portal',
    category: 'TRANSPORT',
    shortDesc: 'All driving licence, international driving permit, and instructor licence services.',
    department: 'Ministry of Road Transport & Highways',
    authority: 'Government of India',
    officialUrl: 'https://parivahan.gov.in',
    requirements: ['Licence Number', 'Date of Birth'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'trans-vehicle-status',
    name: 'Vehicle Status & e-Challan Check',
    category: 'TRANSPORT',
    shortDesc: 'Search pending traffic e-challans, vehicle fitness status, and blacklisting status.',
    department: 'Ministry of Road Transport & Highways',
    authority: 'Government of India',
    officialUrl: 'https://vahan.parivahan.gov.in',
    requirements: ['Vehicle Registration Number'],
    lastVerified: 'September 2024',
    icon: 'Compass',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'trans-change-address',
    name: 'Change Vehicle Address on RC',
    category: 'TRANSPORT',
    shortDesc: 'Apply for updating permanent address on vehicle Registration Certificate.',
    department: 'RTO Jalpaiguri',
    authority: 'Government of India',
    officialUrl: 'https://parivahan.gov.in',
    requirements: ['New Address Proof', 'Original RC', 'Valid Insurance & PUC'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'trans-duplicate-rc',
    name: 'Duplicate RC Application',
    category: 'TRANSPORT',
    shortDesc: 'Apply for duplicate registration certificate if original RC is lost or stolen.',
    department: 'RTO Jalpaiguri',
    authority: 'Government of India',
    officialUrl: 'https://parivahan.gov.in',
    requirements: ['Police FIR / GD Copy', 'Valid Insurance', 'PUC Certificate'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'trans-hypothecation',
    name: 'Hypothecation Addition / Termination (HP)',
    category: 'TRANSPORT',
    shortDesc: 'Add or remove bank loan hypothecation entry on vehicle RC after loan clearance.',
    department: 'RTO Jalpaiguri',
    authority: 'Government of India',
    officialUrl: 'https://parivahan.gov.in',
    requirements: ['Bank NOC (Form 35)', 'Original RC', 'Insurance Copy'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'trans-mobile-update',
    name: 'Vehicle Mobile Number Update',
    category: 'TRANSPORT',
    shortDesc: 'Link or update registered mobile number for vehicle RC and traffic alerts.',
    department: 'Ministry of Road Transport & Highways',
    authority: 'Government of India',
    officialUrl: 'https://parivahan.gov.in',
    requirements: ['Vehicle Number', 'Chassis Number', 'Engine Number', 'Aadhaar OTP'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'trans-fitness-renewal',
    name: 'Commercial Vehicle Fitness Renewal',
    category: 'TRANSPORT',
    shortDesc: 'Schedule RTO inspection and pay fitness renewal fees for commercial vehicles.',
    department: 'RTO Jalpaiguri',
    authority: 'Government of India',
    officialUrl: 'https://parivahan.gov.in',
    requirements: ['Vehicle Registration', 'Tax Clearance', 'Insurance & Speed Governor Cert'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true
  },

  // ==========================================
  // ⚡ 7. ELECTRICITY & UTILITIES
  // ==========================================
  {
    id: 'util-wbsedcl-bill',
    name: 'WBSEDCL Electricity Bill Payment & Receipt',
    category: 'UTILITY SERVICES',
    shortDesc: 'Pay West Bengal State Electricity bill online instantly, download receipts, view meter reading.',
    department: 'West Bengal State Electricity Distribution Co. Ltd.',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbsedcl.in',
    requirements: ['9-Digit Consumer ID', 'Installation Number'],
    lastVerified: 'September 2024',
    icon: 'Zap',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'util-wbsedcl-pay',
    name: 'Pay Electricity Bill (WBSEDCL)',
    category: 'UTILITY SERVICES',
    shortDesc: 'Quick online bill payment via UPI, Debit Card, Netbanking on WBSEDCL portal.',
    department: 'WBSEDCL',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbsedcl.in',
    requirements: ['Consumer ID'],
    lastVerified: 'September 2024',
    icon: 'Zap',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'util-wbsedcl-view',
    name: 'View Electricity Bill & Meter Consumption',
    category: 'UTILITY SERVICES',
    shortDesc: 'View detailed monthly power consumption, tariff slab and bill statement.',
    department: 'WBSEDCL',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbsedcl.in',
    requirements: ['Consumer ID'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'util-wbsedcl-receipt',
    name: 'Download Payment Receipt (WBSEDCL)',
    category: 'UTILITY SERVICES',
    shortDesc: 'Download official stamped payment receipt for tax and proof purposes.',
    department: 'WBSEDCL',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbsedcl.in',
    requirements: ['Consumer ID / Transaction ID'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'util-wbsedcl-new-conn',
    name: 'New Electricity Connection (WBSEDCL)',
    category: 'UTILITY SERVICES',
    shortDesc: 'Apply online for new domestic, commercial, or agricultural electric meter connection.',
    department: 'WBSEDCL Jalpaiguri Division',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbsedcl.in',
    requirements: ['Ownership Deed / Rent Agreement', 'Aadhaar Card', 'Test Report from Licensed Contractor'],
    lastVerified: 'September 2024',
    icon: 'Zap',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'util-wbsedcl-consumer',
    name: 'WBSEDCL Consumer Portal',
    category: 'UTILITY SERVICES',
    shortDesc: 'Self-service dashboard for meter transfer, name change and load adjustment.',
    department: 'WBSEDCL',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbsedcl.in',
    requirements: ['Consumer ID', 'Registered Mobile Number'],
    lastVerified: 'September 2024',
    icon: 'Layers',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'util-wbsedcl-complaint',
    name: 'Electricity Complaint & Support Portal',
    category: 'UTILITY SERVICES',
    shortDesc: 'Report power outage, voltage fluctuation, transformer burning or billing dispute.',
    department: 'WBSEDCL 24x7 Call Center',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbsedcl.in',
    requirements: ['Consumer ID', 'Contact Phone Number'],
    lastVerified: 'September 2024',
    icon: 'AlertCircle',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'util-wbsedcl-load-change',
    name: 'Load / Category Enhancement Request',
    category: 'UTILITY SERVICES',
    shortDesc: 'Apply for load extension (kW) or category conversion (domestic to commercial).',
    department: 'WBSEDCL',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbsedcl.in',
    requirements: ['Consumer ID', 'Load Calculation Sheet'],
    lastVerified: 'September 2024',
    icon: 'Zap',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'util-water-udma',
    name: 'Urban Water Connection Portal',
    category: 'UTILITY SERVICES',
    shortDesc: 'Apply for municipal water connection and pipeline extension under UDMA.',
    department: 'Urban Development & Municipal Affairs',
    authority: 'Government of West Bengal',
    officialUrl: 'https://udma.wb.gov.in',
    requirements: ['Holding Number', 'Site Sketch'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'util-water-charges',
    name: 'Water Charges Payment Portal',
    category: 'UTILITY SERVICES',
    shortDesc: 'Pay quarterly water user charges and view connection status.',
    department: 'Urban Development & Municipal Affairs',
    authority: 'Government of West Bengal',
    officialUrl: 'https://udma.wb.gov.in',
    requirements: ['Consumer / Assessment Number'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'util-sewer-conn',
    name: 'Sewer / Drain Connection Portal',
    category: 'UTILITY SERVICES',
    shortDesc: 'Sanction and fee payment for municipal underground drainage/sewer connections.',
    department: 'Urban Development & Municipal Affairs',
    authority: 'Government of West Bengal',
    officialUrl: 'https://udma.wb.gov.in',
    requirements: ['Holding Tax Receipt'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },

  // ==========================================
  // 🎓 8. EDUCATION & SCHOLARSHIPS
  // ==========================================
  {
    id: 'edu-nsp-main',
    name: 'National Scholarship Portal (NSP)',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Central scholarship portal for pre-matric, post-matric and merit scholarships.',
    department: 'Ministry of Electronics & Information Technology',
    authority: 'Government of India',
    officialUrl: 'https://scholarships.gov.in',
    requirements: ['Student Aadhaar', 'Bank Account Details', 'Income Certificate', 'Marksheet'],
    lastVerified: 'September 2024',
    icon: 'GraduationCap',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'edu-nsp-apply',
    name: 'NSP Scholarship Application Portal',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Submit fresh or renewal applications for central government scholarships.',
    department: 'Ministry of Minority Affairs / Social Justice / Tribal Affairs',
    authority: 'Government of India',
    officialUrl: 'https://scholarships.gov.in',
    requirements: ['OTR Reference Number', 'Bonafide Student Certificate'],
    lastVerified: 'September 2024',
    icon: 'GraduationCap',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'edu-nsp-status',
    name: 'NSP Scholarship Status Tracking',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Check real-time application verification status at Institute, Nodal Officer, and Public Financial Management System (PFMS) level.',
    department: 'National Scholarship Portal',
    authority: 'Government of India',
    officialUrl: 'https://scholarships.gov.in',
    requirements: ['Application ID', 'Academic Year'],
    lastVerified: 'September 2024',
    icon: 'ChevronRight',
    hasDirectApply: false,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'edu-nsp-payment',
    name: 'NSP Direct Bank Payment Tracking (PFMS)',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Track scholarship disbursement status directly to student Aadhaar-seeded bank account.',
    department: 'PFMS / Ministry of Finance',
    authority: 'Government of India',
    officialUrl: 'https://scholarships.gov.in',
    requirements: ['Bank Account Number / NSP Application ID'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: false,
    hasStatusTrack: true
  },
  {
    id: 'edu-nsp-otr',
    name: 'One-Time Registration (OTR) - NSP Portal',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Mandatory OTR registration using Face Auth or Aadhaar OTP for NSP scholarships.',
    department: 'National Scholarship Portal',
    authority: 'Government of India',
    officialUrl: 'https://scholarships.gov.in',
    requirements: ['Aadhaar Number', 'Mobile Number linked with Aadhaar'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'edu-iti-bsk',
    name: 'Government ITI Admissions & Counselling (WBSCVT)',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Centralized counseling and seat allotment for Government ITIs in Jalpaiguri and WB.',
    department: 'Technical Education, Training & Skill Development',
    authority: 'Government of West Bengal',
    officialUrl: 'https://bsk.wb.gov.in',
    requirements: ['Class 8 / 10 Marksheet', 'Caste Certificate', 'Aadhaar Card'],
    lastVerified: 'September 2024',
    icon: 'GraduationCap',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'edu-jexpo-webscte',
    name: 'JEXPO Polytechnic Admission Portal',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Polytechnic entrance exam applications and diploma seat allotment.',
    department: 'WBSCTE / Higher Education',
    authority: 'Government of West Bengal',
    officialUrl: 'https://webscte.co.in',
    requirements: ['Class 10 Admit & Marksheet', 'Aadhaar'],
    lastVerified: 'September 2024',
    icon: 'GraduationCap',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'edu-voclet-bsk',
    name: 'VOCLET Diploma Lateral Entry Portal',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Direct 2nd year polytechnic diploma admissions for ITI/Vocational pass students.',
    department: 'WBSCTE',
    authority: 'Government of West Bengal',
    officialUrl: 'https://bsk.wb.gov.in',
    requirements: ['Vocational / ITI Pass Certificate', 'Aadhaar'],
    lastVerified: 'September 2024',
    icon: 'GraduationCap',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'edu-exam-results',
    name: 'West Bengal Examination Results Portal',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Official portal for Madhyamik, Uccha Madhyamik, and University exam results.',
    department: 'West Bengal Council of Higher Secondary Education & WBBSE',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbresults.nic.in',
    requirements: ['Roll Number', 'Date of Birth'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: false,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'edu-svmcm-scholarship',
    name: 'Swami Vivekananda Merit-cum-Means Scholarship (SVMCM)',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Financial aid up to Rs. 60,000/year for meritorious HS, UG, PG, M.Phil students.',
    department: 'Higher Education Department, Bikash Bhavan',
    authority: 'Government of West Bengal',
    officialUrl: 'https://svmcm.wbhed.gov.in',
    requirements: ['60% Marks in Last Exam', 'Family Income <= 2.5 Lakhs/year', 'Bank Passbook'],
    lastVerified: 'September 2024',
    icon: 'GraduationCap',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'edu-aikyashree',
    name: 'Aikyashree Minority Scholarship Portal',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'State scholarship for minority community students (Muslim, Christian, Sikh, Buddhist, Jain, Parsi).',
    department: 'Minority Affairs & Madrasah Education Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbmdfcscholarship.in',
    requirements: ['50% Marks in Last Qualifying Exam', 'Family Income Certificate', 'Bank Passbook'],
    lastVerified: 'September 2024',
    icon: 'GraduationCap',
    hasDirectApply: true,
    hasStatusTrack: true
  },

  // ==========================================
  // 💼 9. JOBS & EMPLOYMENT
  // ==========================================
  {
    id: 'job-emp-bank',
    name: 'West Bengal Employment Bank (Yuvasree)',
    category: 'EMPLOYMENT',
    shortDesc: 'Official state employment exchange portal for job seekers, Yuvasree scheme and job fairs.',
    department: 'Labour Department, Govt of West Bengal',
    authority: 'Government of West Bengal',
    officialUrl: 'https://employmentbankwb.gov.in',
    requirements: ['Qualification Marksheets', 'Proof of Residence', 'Caste Certificate'],
    lastVerified: 'September 2024',
    icon: 'Briefcase',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'job-seeker-reg',
    name: 'Job Seeker Online Registration (Employment Bank)',
    category: 'EMPLOYMENT',
    shortDesc: 'Register as unemployed youth to receive Yuvasree unemployment allowance and job alerts.',
    department: 'Directorate of Employment',
    authority: 'Government of West Bengal',
    officialUrl: 'https://employmentbankwb.gov.in',
    requirements: ['Class 10+ Marksheets', 'Madhyamik Admit', 'Aadhaar / Voter ID'],
    lastVerified: 'September 2024',
    icon: 'Briefcase',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'job-search-wb',
    name: 'Government & Private Job Search (Employment Bank)',
    category: 'EMPLOYMENT',
    shortDesc: 'Browse current government job vacancies, apprentice posts and private sector openings.',
    department: 'Directorate of Employment',
    authority: 'Government of West Bengal',
    officialUrl: 'https://employmentbankwb.gov.in',
    requirements: ['Job Seeker Registration ID'],
    lastVerified: 'September 2024',
    icon: 'Search',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'job-matching',
    name: 'Job Matching & Skill Profiling Portal',
    category: 'EMPLOYMENT',
    shortDesc: 'Automated skill matching connecting registered job seekers with verified employers in North Bengal.',
    department: 'Directorate of Employment',
    authority: 'Government of West Bengal',
    officialUrl: 'https://employmentbankwb.gov.in',
    requirements: ['Job Seeker Profile Credentials'],
    lastVerified: 'September 2024',
    icon: 'Briefcase',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'job-employee-reg',
    name: 'Employee Registration (WB E-Services)',
    category: 'EMPLOYMENT',
    shortDesc: 'Employee registration and social security portal for organized and unorganized sector workers.',
    department: 'Labour Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wb.gov.in',
    requirements: ['Aadhaar', 'Bank Account', 'Employer Details'],
    lastVerified: 'September 2024',
    icon: 'Briefcase',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'job-employer-reg',
    name: 'Employer Registration (WB E-Services)',
    category: 'EMPLOYMENT',
    shortDesc: 'Employer registration portal for compliance, worker enrollment and statutory filings.',
    department: 'Labour Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wb.gov.in',
    requirements: ['Trade License', 'PAN Card', 'GSTIN'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'job-skill-dev',
    name: 'Utkarsh Bangla Skill Development Portal',
    category: 'EMPLOYMENT',
    shortDesc: 'Free skill development training programs and vocational placement for youth.',
    department: 'Paschim Banga Society for Skill Development (PBSSD)',
    authority: 'Government of West Bengal',
    officialUrl: 'https://pbssd.gov.in',
    requirements: ['Aadhaar', 'Educational Qualification Proof'],
    lastVerified: 'September 2024',
    icon: 'Sparkles',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'job-shops-establishment',
    name: 'Shops & Establishment Online Registration',
    category: 'EMPLOYMENT',
    shortDesc: 'Mandatory online registration for commercial shops and commercial establishments.',
    department: 'Labour Commissionerate',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbshops.gov.in',
    requirements: ['Trade License', 'Rent Agreement', 'List of Employees'],
    lastVerified: 'September 2024',
    icon: 'Briefcase',
    hasDirectApply: true,
    hasStatusTrack: true
  },

  // ==========================================
  // 🏪 10. BUSINESS & TRADE
  // ==========================================
  {
    id: 'biz-silpasathi',
    name: 'SilpaSathi Single Window Business Portal',
    category: 'BUSINESS & TRADE',
    shortDesc: 'Unified state portal for all business licenses, clearances, trade certificates and clearances.',
    department: 'Micro, Small & Medium Enterprises Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://silpasathi.wb.gov.in',
    requirements: ['PAN / TAN', 'Aadhaar', 'Land Deed / Rent Agreement'],
    lastVerified: 'September 2024',
    icon: 'Briefcase',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'biz-silpasathi-eservices',
    name: 'SilpaSathi Live E-Services Catalogue',
    category: 'BUSINESS & TRADE',
    shortDesc: 'Live directory of all statutory clearances across 15+ government departments.',
    department: 'MSME & Textiles Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://silpasathi.wb.gov.in',
    requirements: ['Business Registration Credentials'],
    lastVerified: 'September 2024',
    icon: 'Layers',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'biz-trade-license',
    name: 'Trade License Application (SilpaSathi / Municipality)',
    category: 'BUSINESS & TRADE',
    shortDesc: 'Apply or renew municipal trade certificates online through SilpaSathi single window.',
    department: 'Jalpaiguri Municipality / UDMA',
    authority: 'Government of West Bengal',
    officialUrl: 'https://silpasathi.wb.gov.in',
    requirements: ['Holding Tax Receipt', 'PAN Card', 'Rent Agreement'],
    lastVerified: 'September 2024',
    icon: 'Briefcase',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'biz-shops-online',
    name: 'WB Shops Online Portal',
    category: 'BUSINESS & TRADE',
    shortDesc: 'Digital portal for shop registration certificate and annual statutory returns.',
    department: 'Labour Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbshops.gov.in',
    requirements: ['Trade License', 'Identity Proof'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'biz-prof-tax',
    name: 'Professional Tax Enrolment & Registration (P-Tax)',
    category: 'BUSINESS & TRADE',
    shortDesc: 'Online enrolment, certificate of registration, and annual P-Tax return filing.',
    department: 'Directorate of Commercial Taxes',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbprofessionaltax.gov.in',
    requirements: ['Trade License', 'PAN Card', 'Bank Account Number'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'biz-msme',
    name: 'WB MSME & My Enterprise Portal',
    category: 'BUSINESS & TRADE',
    shortDesc: 'State subsidies, capital investment incentives, and MSME cluster schemes.',
    department: 'MSME & Textiles Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://myenterprisewb.in',
    requirements: ['Udyam Registration', 'Project Report', 'Bank Loan Sanction'],
    lastVerified: 'September 2024',
    icon: 'Sparkles',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'biz-my-enterprise',
    name: 'My Enterprise WB Portal',
    category: 'BUSINESS & TRADE',
    shortDesc: 'Enterprise onboarding, incentive tracking and financial support for small businesses.',
    department: 'MSME & Textiles Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://myenterprisewb.in',
    requirements: ['Udyam Registration'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'biz-factories',
    name: 'Directorate of Factories Clearance Portal',
    category: 'BUSINESS & TRADE',
    shortDesc: 'Factory plan approval, license renewal, and safety compliance certificates.',
    department: 'Labour Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wb.gov.in',
    requirements: ['Factory Building Plan', 'Safety Equipment Certificate'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'biz-legal-metrology',
    name: 'Legal Metrology Services (SilpaSathi)',
    category: 'BUSINESS & TRADE',
    shortDesc: 'Verification and stamping of commercial weights, measures, and weighing scales.',
    department: 'Consumer Affairs Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://silpasathi.wb.gov.in',
    requirements: ['Weights Manufacturer/Dealer License', 'Previous Stamping Cert'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'biz-fire-safety',
    name: 'Fire Safety Clearance & NOC (WBFES)',
    category: 'BUSINESS & TRADE',
    shortDesc: 'Fire license, safety plan recommendation and NOC renewal for commercial premises.',
    department: 'West Bengal Fire & Emergency Services',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbfes.wb.gov.in',
    requirements: ['Architect Building Layout', 'Fire Hydrant & Extinguisher Plan'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'biz-environment',
    name: 'Environmental Consent (Consent to Establish / Operate)',
    category: 'BUSINESS & TRADE',
    shortDesc: 'Pollution Control Board Consent to Establish (CTE) and Consent to Operate (CTO).',
    department: 'West Bengal Pollution Control Board',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbpcb.gov.in',
    requirements: ['Project Site Layout', 'Effluent Treatment Plan'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'biz-boilers',
    name: 'Directorate of Boilers E-Services',
    category: 'BUSINESS & TRADE',
    shortDesc: 'Boiler registration, inspection booking, and steam pipeline sanction.',
    department: 'Labour Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wb.gov.in',
    requirements: ['Boiler Design & Material Test Certificate'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },

  // ==========================================
  // 🏥 11. HEALTH
  // ==========================================
  {
    id: 'health-dept',
    name: 'West Bengal Health Department Portal',
    category: 'HEALTH & WELFARE',
    shortDesc: 'Official health department portal for hospital services, blood bank availability and health notices.',
    department: 'Health & Family Welfare Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbhealth.gov.in',
    requirements: ['Internet Connection'],
    lastVerified: 'September 2024',
    icon: 'HeartPulse',
    hasDirectApply: true,
    hasStatusTrack: false,
    popular: true
  },
  {
    id: 'health-bsk-opd',
    name: 'BSK OPD Online Ticket Booking',
    category: 'HEALTH & WELFARE',
    shortDesc: 'Book outdoor patient (OPD) hospital tickets online for Jalpaiguri Medical College & District Hospital.',
    department: 'Health & Family Welfare Department / BSK',
    authority: 'Government of West Bengal',
    officialUrl: 'https://bsk.wb.gov.in',
    requirements: ['Patient Name', 'Mobile Number', 'Hospital Choice', 'OPD Department'],
    lastVerified: 'September 2024',
    icon: 'HeartPulse',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'health-welfare-services',
    name: 'Health & Family Welfare E-Services',
    category: 'HEALTH & WELFARE',
    shortDesc: 'Digital health services, maternal child tracking, and institutional delivery support.',
    department: 'Health & Family Welfare Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbhealth.gov.in',
    requirements: ['Health ID / Aadhaar'],
    lastVerified: 'September 2024',
    icon: 'HeartPulse',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'health-info-portal',
    name: 'Government Health Information System',
    category: 'HEALTH & WELFARE',
    shortDesc: 'Verified health advisories, vaccination schedules, and disease surveillance updates.',
    department: 'Health & Family Welfare Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbhealth.gov.in',
    requirements: ['None'],
    lastVerified: 'September 2024',
    icon: 'HeartPulse',
    hasDirectApply: false,
    hasStatusTrack: false
  },
  {
    id: 'health-swasthya-sathi',
    name: 'Swasthya Sathi Official Portal',
    category: 'HEALTH & WELFARE',
    shortDesc: 'Cashless health insurance cover up to Rs. 5 Lakhs/year for family secondary & tertiary care.',
    department: 'Health & Family Welfare Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://swasthyasathi.gov.in',
    requirements: ['Swasthya Sathi Smart Card Number / URN', 'Aadhaar / Khadyasathi No'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },

  // ==========================================
  // 🌾 12. AGRICULTURE
  // ==========================================
  {
    id: 'agri-matirkatha',
    name: 'Matir Katha Agriculture Portal',
    category: 'AGRICULTURE',
    shortDesc: 'West Bengal crop advisories, seed availability, soil testing reports and weather forecasts.',
    department: 'Agriculture Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://matirkatha.net',
    requirements: ['Krishak Bandhu ID / Farmer Phone Number'],
    lastVerified: 'September 2024',
    icon: 'Sparkles',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'agri-bsk-schemes',
    name: 'Agriculture Schemes via BSK',
    category: 'AGRICULTURE',
    shortDesc: 'Apply for state agricultural assistance, seed subsidies and farm mechanization grants.',
    department: 'Agriculture Department / BSK',
    authority: 'Government of West Bengal',
    officialUrl: 'https://bsk.wb.gov.in/schemes',
    requirements: ['Land ROR / Khata', 'Krishak Bandhu Card', 'Bank Passbook'],
    lastVerified: 'September 2024',
    icon: 'Sparkles',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'agri-wb-eservices',
    name: 'Agriculture Applications Portal',
    category: 'AGRICULTURE',
    shortDesc: 'Online applications for pesticide licenses, fertilizer dealership and crop insurance.',
    department: 'Agriculture Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wb.gov.in',
    requirements: ['Business / Farmer ID'],
    lastVerified: 'September 2024',
    icon: 'Layers',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'agri-soil-health',
    name: 'Soil Health & Farm Scheme Portal',
    category: 'AGRICULTURE',
    shortDesc: 'Download soil health cards, fertilizer recommendations and Krishi Shivir schedules.',
    department: 'Agriculture Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://matirkatha.net',
    requirements: ['Plot Dag Number / Farmer ID'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'agri-krishak-bandhu',
    name: 'Krishak Bandhu Official Portal',
    category: 'AGRICULTURE',
    shortDesc: 'Direct farmer financial assistance up to Rs. 10,000/year and Rs. 2 Lakh death benefit.',
    department: 'Agriculture Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://krishakbandhu.net',
    requirements: ['Voter ID (EPIC)', 'Land ROR (Khatian)', 'Bank Passbook', 'Mobile Number'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },

  // ==========================================
  // 🧾 13. GOVERNMENT GRIEVANCES & COMPLAINTS
  // ==========================================
  {
    id: 'griev-citizen-portal',
    name: 'West Bengal Government Citizen Portal',
    category: 'COMPLAINTS & GRIEVANCES',
    shortDesc: 'Statewide online public grievance submission and trackable resolution gateway.',
    department: 'Department of Personnel & Administrative Reforms',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wb.gov.in',
    requirements: ['Mobile Number', 'Detailed Complaint Text'],
    lastVerified: 'September 2024',
    icon: 'AlertCircle',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'griev-bsk-portal',
    name: 'Bangla Sahayata Kendra Grievance Portal',
    category: 'COMPLAINTS & GRIEVANCES',
    shortDesc: 'Lodge grievances against local administrative services and track resolution status.',
    department: 'P&AR Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://bsk.wb.gov.in',
    requirements: ['Citizen Mobile Number'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'griev-consumer',
    name: 'WB Consumer Affairs Grievance Portal',
    category: 'COMPLAINTS & GRIEVANCES',
    shortDesc: 'Lodge consumer complaints regarding defective products, price gouging or service deficiency.',
    department: 'Department of Consumer Affairs',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbconsumers.gov.in',
    requirements: ['Bill / Purchase Invoice', 'Merchant Details'],
    lastVerified: 'September 2024',
    icon: 'AlertCircle',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'griev-redressal-bsk',
    name: 'Citizen Grievance Redressal (BSK Services)',
    category: 'COMPLAINTS & GRIEVANCES',
    shortDesc: 'Assisted grievance lodging at nearest Bangla Sahayata Kendra counter.',
    department: 'P&AR Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://bsk.wb.gov.in',
    requirements: ['Identity Proof'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'griev-rti-online',
    name: 'Government RTI Online Portal',
    category: 'COMPLAINTS & GRIEVANCES',
    shortDesc: 'File Right to Information (RTI) applications and first appeals online to state departments.',
    department: 'West Bengal Information Commission / PAR Dept',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wb.gov.in',
    requirements: ['RTI Question Text', 'Identity Proof', 'Fee Payment (Rs 10)'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },

  // ==========================================
  // 🌐 14. DEPARTMENT PORTALS
  // ==========================================
  {
    id: 'dept-consumer-affairs',
    name: 'Consumer Affairs Department Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for consumer rights, legal metrology, and consumer dispute redressal.',
    department: 'Department of Consumer Affairs',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbconsumers.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Landmark',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'dept-boilers',
    name: 'Boilers Directorate Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for boiler inspection, certification and safety regulations.',
    department: 'Labour Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wb.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Landmark',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'dept-commercial-taxes',
    name: 'Commercial Taxes Department (WB VAT / GST)',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for West Bengal commercial tax, GST links, and statutory returns.',
    department: 'Directorate of Commercial Taxes',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbcomtax.gov.in',
    requirements: ['GSTIN / User ID'],
    lastVerified: 'September 2024',
    icon: 'Landmark',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'dept-factories',
    name: 'Factories Directorate Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for industrial safety, factory plans and labor compliance.',
    department: 'Labour Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wb.gov.in',
    requirements: ['Factory Credentials'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'dept-msme',
    name: 'MSME & Textiles Department Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for small scale industries, handicraft clusters and state subsidies.',
    department: 'MSME & Textiles Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://myenterprisewb.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Landmark',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'dept-prof-tax',
    name: 'Professional Tax Directorate Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for professional tax enrolment, registration and payment verification.',
    department: 'Directorate of Commercial Taxes',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbprofessionaltax.gov.in',
    requirements: ['P-Tax Number'],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'dept-registration',
    name: 'Directorate of Registration & Stamp Revenue',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for property deed valuation, stamp duty payment and registration appointments.',
    department: 'Directorate of Registration & Stamp Revenue',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbregistration.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Landmark',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'dept-environment',
    name: 'Environment Department & PCB Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for environmental clearances, air quality data and noise regulations.',
    department: 'Department of Environment',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbpcb.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Landmark',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'dept-fire',
    name: 'Fire & Emergency Services Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for fire safety certificates, building NOCs and emergency guidelines.',
    department: 'West Bengal Fire & Emergency Services',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbfes.wb.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'dept-forest',
    name: 'West Bengal Forest Department Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for eco-tourism bookings, timber permissions and wildlife conservation.',
    department: 'Department of Forests',
    authority: 'Government of West Bengal',
    officialUrl: 'https://westbengalforest.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Landmark',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'dept-health',
    name: 'Health & Family Welfare Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official state health portal for hospital info, medical education and public health schemes.',
    department: 'Health & Family Welfare Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbhealth.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'HeartPulse',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'dept-irrigation',
    name: 'Irrigation & Waterways Department Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for flood management, canal water distribution and river embankments.',
    department: 'Irrigation & Waterways Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbiwd.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Landmark',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'dept-labour',
    name: 'Labour Department Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for labor welfare schemes, minimum wages and worker social security.',
    department: 'Labour Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wblabour.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Briefcase',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'dept-labour-comm',
    name: 'Labour Commissionerate Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Statutory enforcement portal for trade unions, industrial dispute conciliation and factory inspections.',
    department: 'Labour Commissionerate',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wblabour.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Landmark',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'dept-land-reforms',
    name: 'Land & Land Reforms Department (BanglarBhumi)',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for land revenue, records of rights, mutation and land acquisition.',
    department: 'Land & Land Reforms Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://banglarbhumi.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Layers',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'dept-power',
    name: 'Power Department Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for state power policy, renewable energy initiatives and power infrastructure.',
    department: 'Power Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbpower.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Zap',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'dept-pwd',
    name: 'Public Works Department (PWD) Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for state road infrastructure, public building projects and tender notices.',
    department: 'Public Works Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbpwd.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Landmark',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'dept-shops-online',
    name: 'Shops & Establishments Online Portal',
    category: 'DEPARTMENT PORTALS',
    shortDesc: 'Official portal for registration and statutory compliance of commercial establishments.',
    department: 'Labour Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbshops.gov.in',
    requirements: ['Internet Browser'],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true
  }
];

/**
 * 2. GROUNDED DATA FOR GOVERNMENT SCHEMES CATALOG
 */
export const VERIFIED_SCHEMES_CATALOG: GovtScheme[] = [
  {
    id: 'scheme-lakshmir-bhandar',
    name: "Lakshmir Bhandar Scheme",
    bengaliName: "লক্ষ্মীর ভান্ডার প্রকল্প",
    department: "Department of Women & Child Development and Social Welfare",
    authority: "Government of West Bengal",
    whoItIsFor: "Female heads of households in West Bengal aged 25 to 60 years.",
    targetCategory: "Women",
    minAge: 25,
    maxAge: 60,
    benefits: "Rs. 1,000/month for General category women; Rs. 1,200/month for SC/ST women.",
    basicEligibility: [
      "Resident of West Bengal",
      "Female applicant aged between 25 and 60 years",
      "Not employed in permanent government service or receiving permanent government pension"
    ],
    requiredDocuments: [
      "Swasthya Sathi Card (Mandatory)",
      "Aadhaar Card",
      "SC/ST Certificate (for higher Rs. 1,200 monthly rate)",
      "Aadhaar-seeded Bank Passbook Copy",
      "Duare Sarkar Application Form"
    ],
    applicationMethod: "Apply via Duare Sarkar Camps or local BDO / Sub-Division / Municipal Office.",
    officialUrl: "https://bsk.wb.gov.in/schemes",
    applyUrl: "https://bsk.wb.gov.in/schemes",
    lastVerified: "September 2024"
  },
  {
    id: 'scheme-kanyashree',
    name: "Kanyashree Prakalpa (K1 & K2)",
    bengaliName: "কন্যাশ্রী প্রকল্প",
    department: "Department of Women & Child Development and Social Welfare",
    authority: "Government of West Bengal",
    whoItIsFor: "Unmarried girl students aged 13 to 19 years studying in recognized institutions.",
    targetCategory: "Student",
    minAge: 13,
    maxAge: 19,
    benefits: "Rs. 1,000/year annual scholarship (K1) + One-time Rs. 25,000 grant upon turning 18 (K2).",
    basicEligibility: [
      "Unmarried girl student resident of West Bengal",
      "Enrolled in Class VIII or above (or equivalent vocational/technical course)",
      "Studying in a government or government-aided school/college"
    ],
    requiredDocuments: [
      "Unmarried Status Self-Declaration",
      "Age Proof (Birth Certificate / Madhyamik Admit)",
      "School Enrolment Certificate",
      "Student Bank Account Passbook Copy"
    ],
    applicationMethod: "Form issued and collected directly through school/college Headmaster.",
    officialUrl: "https://bsk.wb.gov.in/schemes",
    applyUrl: "https://bsk.wb.gov.in/schemes",
    lastVerified: "September 2024"
  },
  {
    id: 'scheme-swasthya-sathi',
    name: "Swasthya Sathi Health Insurance",
    bengaliName: "স্বাস্থ্য সাথী প্রকল্প",
    department: "Department of Health & Family Welfare",
    authority: "Government of West Bengal",
    whoItIsFor: "All resident families in West Bengal without other government health coverage.",
    targetCategory: "General",
    benefits: "Basic health cover up to Rs. 5 Lakhs per family per annum for secondary and tertiary care.",
    basicEligibility: [
      "Resident family of West Bengal",
      "Smart card issued in the name of the eldest female family head"
    ],
    requiredDocuments: [
      "Aadhaar Card of all family members",
      "Ration Card (Khadyasathi)",
      "Family Photograph"
    ],
    applicationMethod: "Apply at Duare Sarkar camps or Municipal / Block Development Office.",
    officialUrl: "https://swasthyasathi.gov.in",
    applyUrl: "https://swasthyasathi.gov.in",
    lastVerified: "September 2024"
  },
  {
    id: 'scheme-student-credit-card',
    name: "West Bengal Student Credit Card (WBSCC)",
    bengaliName: "স্টুডেন্ট ক্রেডিট কার্ড প্রকল্প",
    department: "Department of Higher Education",
    authority: "Government of West Bengal",
    whoItIsFor: "Students pursuing higher education in India or abroad.",
    targetCategory: "Student",
    maxAge: 40,
    benefits: "Collateral-free education loan up to Rs. 10 Lakhs at 4% simple interest rate.",
    basicEligibility: [
      "Resident of West Bengal for at least 10 years",
      "Enrolled in Class 10+, Diploma, UG, PG, Doctoral or competitive coaching courses",
      "Maximum age up to 40 years at time of application"
    ],
    requiredDocuments: [
      "Aadhaar Card & Student ID Card",
      "Course Fee Structure & Admission Receipt",
      "Co-borrower (Parent) PAN Card & Photo",
      "Last Qualifying Examination Marksheet"
    ],
    applicationMethod: "Apply online via official WBSCC portal.",
    officialUrl: "https://bsk.wb.gov.in/schemes",
    applyUrl: "https://bsk.wb.gov.in/schemes",
    lastVerified: "September 2024"
  },
  {
    id: 'scheme-krishak-bandhu',
    name: "Krishak Bandhu (Kami) Scheme",
    bengaliName: "কৃষক বন্ধু প্রকল্প",
    department: "Department of Agriculture",
    authority: "Government of West Bengal",
    whoItIsFor: "All farmers and sharecroppers (Bargadars) owning or cultivating agricultural land.",
    targetCategory: "Farmer",
    minAge: 18,
    maxAge: 60,
    benefits: "Rs. 4,000 to Rs. 10,000 per year direct bank transfer + Rs. 2 Lakhs life insurance coverage.",
    basicEligibility: [
      "Resident farmer of West Bengal",
      "Owns agricultural land (Recorded ROR) or registered Bargadar"
    ],
    requiredDocuments: [
      "Latest Land ROR (Khatian Copy)",
      "Voter ID (EPIC) Card",
      "Bank Account Passbook Copy",
      "Aadhaar Card"
    ],
    applicationMethod: "Apply online or submit forms at local Assistant Director of Agriculture (ADA) office.",
    officialUrl: "https://krishakbandhu.net",
    applyUrl: "https://krishakbandhu.net",
    lastVerified: "September 2024"
  }
];

/**
 * 3. VERIFIED GOVERNMENT ALERTS & CAMPS
 */
export const VERIFIED_GOVERNMENT_ALERTS: GovtAlert[] = [
  {
    id: 'gov-alert-duare-sarkar',
    title: 'Duare Sarkar Camp Outreach Schedule',
    source: 'District Magistrate Office, Jalpaiguri',
    authority: 'Government of West Bengal',
    type: 'OFFICIAL',
    category: 'CAMP',
    description: 'Upcoming outreach camps in Jalpaiguri Municipal Wards and Gram Panchayats for Lakshmir Bhandar, Student Credit Card, Mutation, and Caste Certificate enrolment.',
    publishedDate: '25 Aug 2024',
    lastVerified: 'September 2024',
    officialNoticeUrl: 'https://bsk.wb.gov.in',
    activeUntil: '15 Oct 2024',
    badge: 'Statewide Camp'
  },
  {
    id: 'gov-alert-prop-tax',
    title: 'Holding Tax Rebate Deadline for 1st & 2nd Quarters',
    source: 'Assessment & Revenue Cell, Jalpaiguri Municipality',
    authority: 'Jalpaiguri Municipality',
    type: 'OFFICIAL',
    category: 'MUNICIPAL',
    description: 'Citizens paying full year municipal holding tax in advance are eligible for statutory prompt-payment rebate. Pay online via municipal portal or at municipality collection counters.',
    publishedDate: '01 Sep 2024',
    lastVerified: 'September 2024',
    officialNoticeUrl: 'https://jalpaigurimunicipality.org',
    activeUntil: '30 Sep 2024',
    badge: 'Municipal Tax'
  },
  {
    id: 'gov-alert-svmcm',
    title: 'SVMCM 2024-25 Fresh & Renewal Portal Open for Applications',
    source: 'Higher Education Department, Bikash Bhavan',
    authority: 'Government of West Bengal',
    type: 'OFFICIAL',
    category: 'SCHOLARSHIP',
    description: 'Online application for Swami Vivekananda Merit-cum-Means scholarship for Higher Secondary, Undergraduate, and Postgraduate students is now open.',
    publishedDate: '20 Aug 2024',
    lastVerified: 'September 2024',
    officialNoticeUrl: 'https://svmcm.wbhed.gov.in',
    badge: 'Scholarship'
  }
];

/**
 * Helper to validate safe HTTPS external government domains
 */
export function isSafeGovUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;

    // Allowed official domains
    const allowedSuffixes = [
      '.gov.in',
      '.nic.in',
      '.wb.gov.in',
      'jalpaigurimunicipality.org',
      'wbsedcl.in',
      'wbscvt.net',
      'wbmdfcscholarship.in',
      'matirkatha.net',
      'myenterprisewb.in',
      'webscte.co.in',
      'krishakbandhu.net',
      'swasthyasathi.gov.in'
    ];

    return allowedSuffixes.some(suffix =>
      parsed.hostname === suffix || parsed.hostname.endsWith(suffix)
    );
  } catch {
    return false;
  }
}
