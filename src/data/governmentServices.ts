// Official Government Services Directory & Trust Verification Engine
// Strictly uses verified official portals of Government of West Bengal, Government of India, and Jalpaiguri Municipality.

export type GovtServiceCategory =
  | 'MUNICIPAL SERVICES'
  | 'CERTIFICATES'
  | 'LAND & PROPERTY'
  | 'TRANSPORT'
  | 'UTILITY SERVICES'
  | 'EDUCATION & SCHOLARSHIPS'
  | 'HEALTH & WELFARE'
  | 'EMPLOYMENT'
  | 'LAND & CITIZEN SERVICES'
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
 * Source of truth for Jalpaiguri citizens.
 */
export const VERIFIED_GOVERNMENT_SERVICES: GovernmentService[] = [
  // --- MUNICIPAL SERVICES ---
  {
    id: 'muni-prop-tax',
    name: 'Property / Holding Tax Assessment & Payment',
    category: 'MUNICIPAL SERVICES',
    shortDesc: 'Calculate holding tax, view property assessment details, pay municipal taxes online and download digital receipts.',
    department: 'Revenue & Tax Cell, Jalpaiguri Municipality',
    authority: 'Jalpaiguri Municipality',
    officialUrl: 'https://jalpaigurimunicipality.org',
    applyUrl: 'https://wbdma.gov.in',
    statusUrl: 'https://jalpaigurimunicipality.org',
    requirements: [
      'Ward Number and Holding Number',
      'Previous Municipal Property Tax Receipt',
      'Assessment ID / Mutation Certificate',
      'Valid Mobile Number for SMS confirmation'
    ],
    lastVerified: 'September 2024',
    icon: 'Building2',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'muni-trade-license',
    name: 'Trade License & Renewal (e-District)',
    category: 'MUNICIPAL SERVICES',
    shortDesc: 'Issuance and renewal of Trade Certificates / Licenses for shops, commercial establishments, and micro-enterprises.',
    department: 'Commerce & Industry Cell, Urban Development & Municipal Affairs',
    authority: 'Government of West Bengal',
    officialUrl: 'https://edistrict.wb.gov.in',
    applyUrl: 'https://edistrict.wb.gov.in/PACE/login.do',
    statusUrl: 'https://edistrict.wb.gov.in/PACE/trackApplication.do',
    requirements: [
      'Rent Agreement or Property Tax Receipt of business premises',
      'Identity Proof (Aadhaar / Voter ID)',
      'Fire Safety Certificate (where mandated for hazardous or high-occupancy units)',
      'Partnership deed / Trade declaration if applicable'
    ],
    lastVerified: 'September 2024',
    icon: 'FileCheck',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'muni-water-conn',
    name: 'Municipal Drinking Water Connection',
    category: 'MUNICIPAL SERVICES',
    shortDesc: 'Apply for domestic or commercial pipe-line water connection from Jalpaiguri Municipality supply grid.',
    department: 'Water Supply Department, Jalpaiguri Municipality',
    authority: 'Jalpaiguri Municipality',
    officialUrl: 'https://jalpaigurimunicipality.org',
    applyUrl: 'https://jalpaigurimunicipality.org',
    statusUrl: 'https://jalpaigurimunicipality.org',
    requirements: [
      'Proof of land ownership / Holding tax updated receipt',
      'Site plan showing pipeline proximity',
      'Applicant Aadhaar card copy',
      'Plumbing layout diagram'
    ],
    lastVerified: 'September 2024',
    icon: 'Droplets',
    hasDirectApply: true,
    hasStatusTrack: false
  },
  {
    id: 'muni-bldg-permit',
    name: 'Building & Development Permit / Plan Sanction',
    category: 'MUNICIPAL SERVICES',
    shortDesc: 'Submission and statutory approval of residential and commercial building construction plans.',
    department: 'Engineering & PWD Cell, Jalpaiguri Municipality',
    authority: 'Jalpaiguri Municipality',
    officialUrl: 'https://wbdma.gov.in',
    applyUrl: 'https://edistrict.wb.gov.in',
    statusUrl: 'https://edistrict.wb.gov.in',
    requirements: [
      'Deed copy / Recorded RoR (Porcha)',
      'Structural drawings certified by LBS (Licensed Building Surveyor)',
      'Soil test report (for multi-storey buildings)',
      'Up-to-date Municipal Tax clearance'
    ],
    lastVerified: 'September 2024',
    icon: 'Hammer',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'muni-occupancy',
    name: 'Occupancy Certificate (OC)',
    category: 'MUNICIPAL SERVICES',
    shortDesc: 'Verification of construction compliance and statutory grant of building occupancy clearance.',
    department: 'Building Department, Jalpaiguri Municipality',
    authority: 'Jalpaiguri Municipality',
    officialUrl: 'https://wbdma.gov.in',
    applyUrl: 'https://edistrict.wb.gov.in',
    requirements: [
      'Sanctioned Building Plan Copy',
      'Completion Certificate signed by Em內anelled Architect / LBS',
      'Fire Safety NOC (if building height exceeds prescribed threshold)'
    ],
    lastVerified: 'August 2024',
    icon: 'CheckSquare',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'muni-mutation',
    name: 'Municipal Holding Mutation',
    category: 'MUNICIPAL SERVICES',
    shortDesc: 'Transfer or record of ownership name change in Jalpaiguri Municipality municipal holding records.',
    department: 'Assessment & Revenue Cell',
    authority: 'Jalpaiguri Municipality',
    officialUrl: 'https://jalpaigurimunicipality.org',
    applyUrl: 'https://edistrict.wb.gov.in',
    statusUrl: 'https://edistrict.wb.gov.in',
    requirements: [
      'Registered Title Deed copy',
      'Updated BL&LRO Land Mutation Porcha',
      'Previous owner holding tax clearance receipt',
      'Affidavit of succession / death certificate if inheriting'
    ],
    lastVerified: 'September 2024',
    icon: 'FileText',
    hasDirectApply: true,
    hasStatusTrack: true
  },

  // --- CERTIFICATES ---
  {
    id: 'cert-birth',
    name: 'Birth Certificate (Janma-Mrityu Tathya)',
    category: 'CERTIFICATES',
    shortDesc: 'Online application, delayed registration, verification, and digital certificate download with QR code.',
    department: 'Department of Health & Family Welfare',
    authority: 'Government of West Bengal',
    officialUrl: 'https://janmamrityutathya.wb.gov.in',
    applyUrl: 'https://janmamrityutathya.wb.gov.in',
    statusUrl: 'https://janmamrityutathya.wb.gov.in/track-application',
    requirements: [
      'Discharge certificate from hospital / nursing home / Jalpaiguri Sadar Hospital',
      'Identity proof of parents (Aadhaar / Voter ID)',
      'Marriage certificate of parents (where available)',
      'Magistrate order (if registration is delayed over 1 year)'
    ],
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
    shortDesc: 'Apply for municipal death record, cause-of-death certification, and digital certificate download.',
    department: 'Department of Health & Family Welfare',
    authority: 'Government of West Bengal',
    officialUrl: 'https://janmamrityutathya.wb.gov.in',
    applyUrl: 'https://janmamrityutathya.wb.gov.in',
    statusUrl: 'https://janmamrityutathya.wb.gov.in/track-application',
    requirements: [
      'Institutional death report from hospital or attending physician',
      'Crematorium / Burial ground receipt',
      'Aadhaar / Voter ID of deceased & applicant',
      'Affidavit if delayed beyond 30 days'
    ],
    lastVerified: 'September 2024',
    icon: 'FileHeart',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'cert-caste',
    name: 'Caste Certificate (SC / ST / OBC)',
    category: 'CERTIFICATES',
    shortDesc: 'Statutory certificate for Scheduled Caste, Scheduled Tribe, and Other Backward Classes.',
    department: 'Backward Classes Welfare Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://castcertificatewb.gov.in',
    applyUrl: 'https://castcertificatewb.gov.in',
    statusUrl: 'https://castcertificatewb.gov.in/view-status/',
    requirements: [
      'Blood relation caste certificate or ancestral documentary proof pre-1971 / 1950',
      'Proof of permanent citizenship in West Bengal',
      'Income certificate for OBC applicants seeking Non-Creamy Layer (NCL)',
      'Aadhaar Card, Epic Card & 2 Passport Photos'
    ],
    lastVerified: 'September 2024',
    icon: 'ShieldCheck',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'cert-income',
    name: 'Income Certificate (e-District WB)',
    category: 'CERTIFICATES',
    shortDesc: 'Official income proof issued by SDO / BDO for scholarships, admissions, bank loans, and welfare benefits.',
    department: 'Department of Personnel & Administrative Reforms / SDO Jalpaiguri',
    authority: 'Government of West Bengal',
    officialUrl: 'https://edistrict.wb.gov.in',
    applyUrl: 'https://edistrict.wb.gov.in/PACE/login.do',
    statusUrl: 'https://edistrict.wb.gov.in/PACE/trackApplication.do',
    requirements: [
      'Salary slip / Form 16 / ITR or Pradhan / Councillor income certificate',
      'Residential proof of Jalpaiguri address',
      'Aadhaar / Voter ID of earner and applicant',
      'Recent passport-size photograph'
    ],
    lastVerified: 'September 2024',
    icon: 'BadgePercent',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'cert-domicile',
    name: 'Domicile / Residential Certificate',
    category: 'CERTIFICATES',
    shortDesc: 'Formal certificate attesting continuous residency in Jalpaiguri / West Bengal for recruitment and admissions.',
    department: 'District Administration, Jalpaiguri / SDO Office',
    authority: 'Government of West Bengal',
    officialUrl: 'https://edistrict.wb.gov.in',
    applyUrl: 'https://edistrict.wb.gov.in/PACE/login.do',
    statusUrl: 'https://edistrict.wb.gov.in/PACE/trackApplication.do',
    requirements: [
      'Minimum 10-15 years residential proof in West Bengal',
      'Land records / School leaving certificate / ROR',
      'Voter Card / Aadhaar Card of parents & applicant',
      'Passport size photographs'
    ],
    lastVerified: 'September 2024',
    icon: 'Home',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'cert-ews',
    name: 'Economically Weaker Section (EWS) Certificate',
    category: 'CERTIFICATES',
    shortDesc: 'Reservation certificate for general category citizens meeting prescribed family income and asset criteria.',
    department: 'Backward Classes & SDO Office Jalpaiguri',
    authority: 'Government of West Bengal',
    officialUrl: 'https://edistrict.wb.gov.in',
    applyUrl: 'https://edistrict.wb.gov.in',
    statusUrl: 'https://edistrict.wb.gov.in',
    requirements: [
      'Annual family gross income verification under Rs. 8 Lakhs',
      'Land & residential property holding declarations',
      'Aadhaar, PAN & Income Tax returns of all family members',
      'Local enquiry verification report'
    ],
    lastVerified: 'August 2024',
    icon: 'FileBadge',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'cert-disability',
    name: 'Disability Certificate & UDID Card',
    category: 'CERTIFICATES',
    shortDesc: 'National Unique Disability ID (UDID) issued by Department of Empowerment of Persons with Disabilities.',
    department: 'Ministry of Social Justice and Empowerment',
    authority: 'Government of India',
    officialUrl: 'https://www.swavlambancard.gov.in',
    applyUrl: 'https://www.swavlambancard.gov.in/pwd/application',
    statusUrl: 'https://www.swavlambancard.gov.in/pwd/trackapplication',
    requirements: [
      'Medical assessment report from Jalpaiguri District Hospital Medical Board',
      'Full body photograph showing disability',
      'Proof of identity and address (Aadhaar Card)'
    ],
    lastVerified: 'September 2024',
    icon: 'HeartHandshake',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'cert-marriage',
    name: 'Marriage Registration (WB Registration)',
    category: 'CERTIFICATES',
    shortDesc: 'Notice of intended marriage and issuance of official legal marriage certificate under Special / Hindu Marriage Acts.',
    department: 'Directorate of Registration & Stamp Revenue',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbregistration.gov.in',
    applyUrl: 'https://wbregistration.gov.in',
    statusUrl: 'https://wbregistration.gov.in',
    requirements: [
      'Age proof of bride (21+) and groom (21+)',
      'Address proof of both parties',
      'Passport photographs and declaration of marital status',
      'Identity documents of three witnesses'
    ],
    lastVerified: 'August 2024',
    icon: 'Users',
    hasDirectApply: true,
    hasStatusTrack: true
  },

  // --- LAND & PROPERTY ---
  {
    id: 'land-ror',
    name: 'Record of Rights (ROR / Porcha)',
    category: 'LAND & PROPERTY',
    shortDesc: 'View digitized Khatian & Plot information, download certified copy of Porcha online via Banglarbhumi.',
    department: 'Land & Land Reforms and Refugee Relief & Rehabilitation Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://banglarbhumi.gov.in',
    applyUrl: 'https://banglarbhumi.gov.in/BanglarBhumi/KnowYourProperty',
    statusUrl: 'https://banglarbhumi.gov.in/BanglarBhumi/RequestGRN',
    requirements: [
      'District (Jalpaiguri), Block / Municipality, and Mouza name',
      'Khatian Number or Plot (Dag) Number',
      'User login account on Banglarbhumi portal'
    ],
    lastVerified: 'September 2024',
    icon: 'Map',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'land-mutation',
    name: 'Online Land Mutation (BL&LRO)',
    category: 'LAND & PROPERTY',
    shortDesc: 'Apply for record-of-rights transfer after purchase, inheritance, or gift deed in Jalpaiguri district.',
    department: 'Land & Land Reforms Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://banglarbhumi.gov.in',
    applyUrl: 'https://banglarbhumi.gov.in',
    statusUrl: 'https://banglarbhumi.gov.in/BanglarBhumi/MutationStatus',
    requirements: [
      'Registered Deed Number, Volume, and Year of Registration',
      'Current paid land revenue (Khajna) receipt',
      'Seller and buyer Aadhaar & mobile numbers',
      'Chain deeds (if applicable)'
    ],
    lastVerified: 'September 2024',
    icon: 'Layers',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'land-deed-copy',
    name: 'Certified Copy of Registered Deed',
    category: 'LAND & PROPERTY',
    shortDesc: 'Search index records and download digitally certified copies of property deeds registered in Jalpaiguri DSR / ADSR.',
    department: 'Directorate of Registration and Stamp Revenue',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbregistration.gov.in',
    applyUrl: 'https://wbregistration.gov.in',
    statusUrl: 'https://wbregistration.gov.in',
    requirements: [
      'Deed number, registration office (e.g. Jalpaiguri Sadar, Malbazar, Maynaguri)',
      'Year of registration',
      'Names of buyer, seller, or donor'
    ],
    lastVerified: 'September 2024',
    icon: 'FileSearch',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'land-valuation',
    name: 'Property Valuation & Stamp Duty Calculator',
    category: 'LAND & PROPERTY',
    shortDesc: 'Compute government market valuation, applicable stamp duty and registration fees before land / flat registration.',
    department: 'Directorate of Registration and Stamp Revenue',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbregistration.gov.in',
    applyUrl: 'https://wbregistration.gov.in/(S(1))/MarketValue.aspx',
    requirements: [
      'Plot / Dag Number, Mouza, JL Number',
      'Land classification (Bastu, Danga, Sali, etc.)',
      'Road proximity & structure details'
    ],
    lastVerified: 'September 2024',
    icon: 'Calculator',
    hasDirectApply: true,
    hasStatusTrack: false
  },

  // --- TRANSPORT ---
  {
    id: 'trans-dl',
    name: 'Driving Licence (Learner & Permanent)',
    category: 'TRANSPORT',
    shortDesc: 'Apply for LL test slot, new permanent Driving Licence, renewal or addition of class at RTO Jalpaiguri (WB-72).',
    department: 'Ministry of Road Transport & Highways / Transport Dept WB',
    authority: 'Government of India',
    officialUrl: 'https://parivahan.gov.in',
    applyUrl: 'https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do',
    statusUrl: 'https://sarathi.parivahan.gov.in/sarathiservice/applViewStatus.do',
    requirements: [
      'Age proof (School admit, Birth Certificate, or Passport)',
      'Address proof (Aadhaar Card / Voter ID)',
      'Medical Certificate (Form 1A for commercial / 40+ years)',
      'Learner License Number (for permanent driving test)'
    ],
    lastVerified: 'September 2024',
    icon: 'Compass',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'trans-rc',
    name: 'Vehicle Registration Certificate (RC) & Transfer',
    category: 'TRANSPORT',
    shortDesc: 'Vahan Citizen Services for RC duplicate, ownership transfer, hypothecation termination, and fitness cert.',
    department: 'Ministry of Road Transport & Highways / RTO Jalpaiguri',
    authority: 'Government of India',
    officialUrl: 'https://parivahan.gov.in',
    applyUrl: 'https://vahan.parivahan.gov.in/vahaneservice/',
    statusUrl: 'https://vahan.parivahan.gov.in/vahaneservice/vahan/ui/appl_status/form_Appl_Status.xhtml',
    requirements: [
      'Registration Number & Chassis Last 5 Digits',
      'Valid Vehicle Insurance Policy',
      'Valid Pollution Under Control (PUC) Certificate',
      'PAN Card / Form 60 & Aadhaar of owner'
    ],
    lastVerified: 'September 2024',
    icon: 'Car',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'trans-mobile-update',
    name: 'Update Mobile in Parivahan (DL / RC)',
    category: 'TRANSPORT',
    shortDesc: 'Link or update mobile number on your Driving Licence or Vehicle Registration for receiving traffic and renewal alerts.',
    department: 'Transport Department / Parivahan Sewa',
    authority: 'Government of India',
    officialUrl: 'https://parivahan.gov.in',
    applyUrl: 'https://sarathi.parivahan.gov.in/sarathiservice/mobUpdate.do',
    requirements: [
      'Driving Licence Number / Vehicle Registration Number',
      'Date of Birth',
      'Aadhaar linked mobile for OTP verification'
    ],
    lastVerified: 'August 2024',
    icon: 'Smartphone',
    hasDirectApply: true,
    hasStatusTrack: false
  },

  // --- UTILITY SERVICES ---
  {
    id: 'util-wbsedcl-pay',
    name: 'WBSEDCL Electricity Bill Payment & Receipts',
    category: 'UTILITY SERVICES',
    shortDesc: 'Pay domestic and commercial power bills, view payment history, and download official payment receipts.',
    department: 'West Bengal State Electricity Distribution Company Limited (WBSEDCL)',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbsedcl.in',
    applyUrl: 'https://www.wbsedcl.in/ebill/',
    statusUrl: 'https://www.wbsedcl.in/ebill/',
    requirements: [
      '9-Digit Consumer ID',
      'Installation Number (from monthly paper bill)',
      'Active Net Banking / UPI / Debit Card'
    ],
    lastVerified: 'September 2024',
    icon: 'Zap',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'util-wbsedcl-new',
    name: 'WBSEDCL New Electricity Connection',
    category: 'UTILITY SERVICES',
    shortDesc: 'Apply online for new low & medium voltage electric meter connection or load extension.',
    department: 'West Bengal State Electricity Distribution Co. Ltd.',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbsedcl.in',
    applyUrl: 'https://www.wbsedcl.in/newconnection/',
    statusUrl: 'https://www.wbsedcl.in/newconnection/',
    requirements: [
      'Passport size photo of applicant',
      'Proof of legal occupation of premises (Rent agreement or Deed / Tax receipt)',
      'Way-leave permission / No-objection if pole passes through third-party land',
      'Test report from a licensed electrical contractor'
    ],
    lastVerified: 'September 2024',
    icon: 'Plug',
    hasDirectApply: true,
    hasStatusTrack: true
  },

  // --- EDUCATION & SCHOLARSHIPS ---
  {
    id: 'edu-oasis',
    name: 'OASIS Scholarship (SC / ST / OBC)',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Pre-matric and post-matric government scholarships for backward classes students studying in school/college.',
    department: 'Backward Classes Welfare Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://oasis.gov.in',
    applyUrl: 'https://oasis.gov.in/apps/v2/index.php',
    statusUrl: 'https://oasis.gov.in/apps/v2/pages/track_application.php',
    requirements: [
      'Digitized Caste Certificate number in student name',
      'Annual family income certificate issued by competent authority',
      'Previous year mark sheet & institutional verification',
      'Bank passbook photocopy (Aadhaar seeded single account)'
    ],
    lastVerified: 'September 2024',
    icon: 'GraduationCap',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'edu-svmcm',
    name: 'Swami Vivekananda Merit-cum-Means (SVMCM)',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'High-value scholarship for meritorious students pursuing Higher Secondary, UG, PG, Medical, and Engineering.',
    department: 'Higher Education Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://svmcm.wbhed.gov.in',
    applyUrl: 'https://svmcm.wbhed.gov.in',
    statusUrl: 'https://svmcm.wbhed.gov.in/page/track_applicant.php',
    requirements: [
      'Minimum 60% aggregate in qualifying examination (Madhyamik / HS / Degree)',
      'Family annual income ceiling not exceeding Rs. 2.5 Lakhs',
      'Admission fee receipt of recognized West Bengal institution',
      'Bank details with IFSC code'
    ],
    lastVerified: 'September 2024',
    icon: 'Award',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'edu-aikyashree',
    name: 'Aikyashree Minority Scholarship',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Scholarships for minority community students (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) in West Bengal.',
    department: 'Minorities’ Development and Finance Corporation',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbmdfcscholarship.in',
    applyUrl: 'https://wbmdfcscholarship.in',
    statusUrl: 'https://wbmdfcscholarship.in/track-application',
    requirements: [
      'Domiciliary status of West Bengal',
      'Minority community self-declaration',
      'Income certificate under specified limit',
      'Mark sheet of last examination'
    ],
    lastVerified: 'August 2024',
    icon: 'BookOpen',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'edu-iti',
    name: 'Government ITI Admissions (WBSCVT)',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Centralized counselling and admissions to Government ITIs across Jalpaiguri and West Bengal.',
    department: 'Technical Education, Training & Skill Development Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbscvt.net',
    applyUrl: 'https://wbscvt.net',
    statusUrl: 'https://wbscvt.net',
    requirements: [
      'Class 8th / 10th pass certificate & mark sheet',
      'Aadhaar card of candidate',
      'Caste / EWS certificate if claiming reservation'
    ],
    lastVerified: 'August 2024',
    icon: 'Wrench',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'edu-utkarsh',
    name: 'Utkarsh Bangla Skill Development (PBSSD)',
    category: 'EDUCATION & SCHOLARSHIPS',
    shortDesc: 'Free government vocational training, certification, and placement assistance for youth in Jalpaiguri district.',
    department: 'Paschim Banga Society for Skill Development',
    authority: 'Government of West Bengal',
    officialUrl: 'https://pbssd.gov.in',
    applyUrl: 'https://pbssd.gov.in',
    requirements: [
      'Minimum age 18 years',
      'Educational qualifications depending on trade',
      'Aadhaar & bank account details'
    ],
    lastVerified: 'August 2024',
    icon: 'Briefcase',
    hasDirectApply: true,
    hasStatusTrack: false
  },

  // --- HEALTH & WELFARE ---
  {
    id: 'hlth-swasthya',
    name: 'Swasthya Sathi Cashless Health Scheme',
    category: 'HEALTH & WELFARE',
    shortDesc: 'Universal health protection scheme providing cashless hospitalization up to Rs. 5 Lakh per family per annum.',
    department: 'Health & Family Welfare Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://swasthyasathi.gov.in',
    applyUrl: 'https://swasthyasathi.gov.in',
    statusUrl: 'https://swasthyasathi.gov.in/KnowYourStatus.aspx',
    requirements: [
      'Ration card / Aadhaar details of family members',
      'Eldest woman of household designated as principal cardholder',
      'Duare Sarkar / Block Health office application form'
    ],
    lastVerified: 'September 2024',
    icon: 'HeartPulse',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'hlth-kanyashree',
    name: 'Kanyashree Prakalpa (K1 & K2)',
    category: 'HEALTH & WELFARE',
    shortDesc: 'Annual scholarship (K1) and one-time grant of Rs. 25,000 (K2) to promote education and prevent child marriage of girls.',
    department: 'Department of Women & Child Development and Social Welfare',
    authority: 'Government of West Bengal',
    officialUrl: 'https://www.wbkanyashree.gov.in',
    applyUrl: 'https://www.wbkanyashree.gov.in',
    statusUrl: 'https://www.wbkanyashree.gov.in/track-application',
    requirements: [
      'Unmarried girl student aged 13-18 (K1) or 18-19 (K2)',
      'Enrolled in recognized school, college, or university in West Bengal',
      'Student independent bank account details and Aadhaar'
    ],
    lastVerified: 'September 2024',
    icon: 'Sparkles',
    hasDirectApply: false,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'hlth-rupashree',
    name: 'Rupashree Prakalpa (Marriage Assistance)',
    category: 'HEALTH & WELFARE',
    shortDesc: 'One-time government financial grant of Rs. 25,000 for economically stressed families on daughter marriage.',
    department: 'Department of Women & Child Development',
    authority: 'Government of West Bengal',
    officialUrl: 'https://wbrupashree.gov.in',
    applyUrl: 'https://wbrupashree.gov.in',
    statusUrl: 'https://wbrupashree.gov.in/track-status',
    requirements: [
      'Woman aged 18+ years at proposed time of marriage',
      'Proposed groom aged 21+ years',
      'Annual family income ceiling below Rs. 1.5 Lakhs',
      'Invitation card / Marriage notice proof'
    ],
    lastVerified: 'August 2024',
    icon: 'Heart',
    hasDirectApply: false,
    hasStatusTrack: true
  },

  // --- EMPLOYMENT ---
  {
    id: 'emp-bank',
    name: 'Employment Bank West Bengal (Yuvasree)',
    category: 'EMPLOYMENT',
    shortDesc: 'Registration of job seekers, Yuvasree unemployment assistance scheme, and state government job notices.',
    department: 'Directorate of Employment, Labour Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://employmentbankwb.gov.in',
    applyUrl: 'https://employmentbankwb.gov.in/jobseeker_registration.php',
    statusUrl: 'https://employmentbankwb.gov.in/track_status.php',
    requirements: [
      'Age between 18 to 45 years',
      'Educational certificates & mark sheets',
      'Proof of residence in West Bengal',
      'Caste / Disability certificate if applicable'
    ],
    lastVerified: 'September 2024',
    icon: 'Briefcase',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'emp-psc',
    name: 'West Bengal Public Service Commission (WBPSC)',
    category: 'EMPLOYMENT',
    shortDesc: 'Official recruitment portal for WBCS (Exe), West Bengal Audit & Accounts, and civil gazetted posts.',
    department: 'Public Service Commission, West Bengal',
    authority: 'Government of West Bengal',
    officialUrl: 'https://psc.wb.gov.in',
    applyUrl: 'https://psc.wb.gov.in',
    statusUrl: 'https://psc.wb.gov.in',
    requirements: [
      'One Time Registration (OTR) profile',
      'Graduation certificate from recognized university',
      'Scanned photograph and signature as per prescribed pixel sizes'
    ],
    lastVerified: 'September 2024',
    icon: 'Landmark',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'emp-police',
    name: 'West Bengal Police Recruitment Board (WBPRB)',
    category: 'EMPLOYMENT',
    shortDesc: 'Recruitment notifications, online admit cards, and results for WB Police Constables and Sub-Inspectors.',
    department: 'West Bengal Police Recruitment Board, Home & Hill Affairs',
    authority: 'Government of West Bengal',
    officialUrl: 'https://prb.wb.gov.in',
    applyUrl: 'https://prb.wb.gov.in',
    statusUrl: 'https://prb.wb.gov.in',
    requirements: [
      'Secondary (Madhyamik) or Higher Secondary pass certificate',
      'Age and physical measurement standards (PMT / PET)',
      'Domicile of West Bengal and ability to speak/read Bengali'
    ],
    lastVerified: 'September 2024',
    icon: 'Shield',
    hasDirectApply: true,
    hasStatusTrack: true
  },

  // --- GOVERNMENT SCHEMES ---
  {
    id: 'schm-duare-sarkar',
    name: 'Duare Sarkar Outreach Camps Portal',
    category: 'GOVERNMENT SCHEMES',
    shortDesc: 'Doorstep public delivery camps for 36+ state welfare schemes including Lakshmir Bhandar, Swasthya Sathi & Khas Zamin.',
    department: 'Chief Minister’s Office & District Administration Jalpaiguri',
    authority: 'Government of West Bengal',
    officialUrl: 'https://duaresarkar.wb.gov.in',
    applyUrl: 'https://duaresarkar.wb.gov.in',
    statusUrl: 'https://duaresarkar.wb.gov.in',
    requirements: [
      'Aadhaar Card of applicant',
      'Khata / Bank account passbook',
      'Color passport size photos',
      'Active mobile number'
    ],
    lastVerified: 'September 2024',
    icon: 'Tent',
    hasDirectApply: true,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'schm-lakshmir-bhandar',
    name: 'Lakshmir Bhandar Basic Income Scheme',
    category: 'GOVERNMENT SCHEMES',
    shortDesc: 'Monthly financial assistance of Rs. 1,000 (General) and Rs. 1,200 (SC/ST) directly into female household bank accounts.',
    department: 'Department of Women & Child Development',
    authority: 'Government of West Bengal',
    officialUrl: 'https://duaresarkar.wb.gov.in',
    applyUrl: 'https://duaresarkar.wb.gov.in',
    requirements: [
      'Female citizen aged between 25 and 60 years',
      'Swasthya Sathi card',
      'Aadhaar Card linked with single bank account',
      'SC/ST Certificate (for higher entitlement)'
    ],
    lastVerified: 'September 2024',
    icon: 'Coins',
    hasDirectApply: false,
    hasStatusTrack: true,
    popular: true
  },
  {
    id: 'schm-krishak-bandhu',
    name: 'Krishak Bandhu (Farmers Welfare & Death Benefit)',
    category: 'GOVERNMENT SCHEMES',
    shortDesc: 'Financial support up to Rs. 10,000/year for agricultural input + Rs. 2 Lakh insurance on farmer demise.',
    department: 'Department of Agriculture',
    authority: 'Government of West Bengal',
    officialUrl: 'https://krishakbandhu.wb.gov.in',
    applyUrl: 'https://krishakbandhu.wb.gov.in',
    statusUrl: 'https://krishakbandhu.wb.gov.in',
    requirements: [
      'RoR (Porcha) in farmer name or recorded tenant document',
      'Voter Card & Aadhaar Card',
      'Bank passbook photocopy showing IFSC'
    ],
    lastVerified: 'September 2024',
    icon: 'Sprout',
    hasDirectApply: true,
    hasStatusTrack: true
  },
  {
    id: 'schm-bsk',
    name: 'Bangla Sahayata Kendra (BSK) Single Window',
    category: 'GOVERNMENT SCHEMES',
    shortDesc: 'Free-of-cost citizen facilitation centers established across Jalpaiguri BDO, SDO, and Municipality offices.',
    department: 'Personnel & Administrative Reforms Department',
    authority: 'Government of West Bengal',
    officialUrl: 'https://bsk.wb.gov.in',
    applyUrl: 'https://bsk.wb.gov.in',
    statusUrl: 'https://bsk.wb.gov.in',
    requirements: [
      'Citizen can walk into nearest BSK with required documents for free digital application assistance'
    ],
    lastVerified: 'September 2024',
    icon: 'Building',
    hasDirectApply: true,
    hasStatusTrack: false,
    popular: true
  }
];

/**
 * 2. SCHEMES DISCOVERY DATABASE
 * Grounded data for the "Find Government Schemes" interactive wizard.
 */
export const VERIFIED_SCHEMES_CATALOG: GovtScheme[] = [
  {
    id: 'sch-lakshmi',
    name: 'Lakshmir Bhandar',
    bengaliName: 'লক্ষ্মীর ভাণ্ডার',
    department: 'Women & Child Development and Social Welfare',
    authority: 'Government of West Bengal',
    whoItIsFor: 'Women heads of household aged 25 to 60 years in West Bengal.',
    targetCategory: 'Women',
    minAge: 25,
    maxAge: 60,
    incomeLimit: 'Any household where woman is not a permanent government employee / pensioner',
    benefits: 'Monthly direct bank transfer of Rs. 1,000 for General category and Rs. 1,200 for SC/ST category.',
    basicEligibility: [
      'Female citizen of West Bengal aged 25–60 years',
      'Must possess a Swasthya Sathi card',
      'Must not be employed in regular government service or receiving fixed pension'
    ],
    requiredDocuments: [
      'Swasthya Sathi Card photocopy',
      'Aadhaar Card copy',
      'SC/ST Certificate (if claiming Rs. 1,200/mo benefit)',
      'Bank passbook copy (account must be in beneficiary single name)'
    ],
    applicationMethod: 'Duare Sarkar outreach camp or nearest BDO / Jalpaiguri Municipality office.',
    officialUrl: 'https://duaresarkar.wb.gov.in',
    lastVerified: 'September 2024'
  },
  {
    id: 'sch-swasthya',
    name: 'Swasthya Sathi',
    bengaliName: 'স্বাস্থ্য সাথী',
    department: 'Health & Family Welfare Department',
    authority: 'Government of West Bengal',
    whoItIsFor: 'All families residing in West Bengal.',
    targetCategory: 'General',
    benefits: 'Cashless indoor hospital treatment up to Rs. 5 Lakh per year per family across empanelled hospitals.',
    basicEligibility: [
      'Family must be resident of West Bengal',
      'Card issued in the name of the eldest female member of the family'
    ],
    requiredDocuments: [
      'Ration Card / Family member Aadhaar cards',
      'Recent family group photograph'
    ],
    applicationMethod: 'Apply at Duare Sarkar camp or Block Development Office (BDO).',
    officialUrl: 'https://swasthyasathi.gov.in',
    lastVerified: 'September 2024'
  },
  {
    id: 'sch-svmcm',
    name: 'Swami Vivekananda Merit-cum-Means Scholarship',
    bengaliName: 'স্বামী বিবেকানন্দ স্কলারশিপ',
    department: 'Higher Education Department',
    authority: 'Government of West Bengal',
    whoItIsFor: 'Meritorious students of Jalpaiguri from economically backward families.',
    targetCategory: 'Student',
    incomeLimit: 'Family gross annual income under Rs. 2,50,000',
    benefits: 'Rs. 1,000 to Rs. 5,000 per month depending on academic level (HS, UG, PG, Engg, Med).',
    basicEligibility: [
      'Minimum 60% marks in Madhyamik or last qualifying exam',
      'Enrolled in regular courses in West Bengal institutions',
      'Annual family income not exceeding Rs. 2.5 Lakhs'
    ],
    requiredDocuments: [
      'Mark sheet of last qualifying examination',
      'Income certificate from SDO / BDO / Municipality Executive Officer',
      'Bank passbook first page copy',
      'Admission fee receipt'
    ],
    applicationMethod: '100% online through SVMCM portal.',
    officialUrl: 'https://svmcm.wbhed.gov.in',
    lastVerified: 'September 2024'
  },
  {
    id: 'sch-krishak',
    name: 'Krishak Bandhu (Assured Income & Insurance)',
    bengaliName: 'কৃষক বন্ধু',
    department: 'Department of Agriculture',
    authority: 'Government of West Bengal',
    whoItIsFor: 'All farmers and recorded sharecroppers (Bargadars) in West Bengal.',
    targetCategory: 'Farmer',
    minAge: 18,
    maxAge: 60,
    benefits: 'Direct financial assistance up to Rs. 10,000 annually in two installments (Kharif and Rabi) + Rs. 2 Lakh death benefit.',
    basicEligibility: [
      'Cultivable land in farmer name or recorded Bargadar (sharecropper)',
      'Resident farmer of West Bengal'
    ],
    requiredDocuments: [
      'Land Record (Porcha / RoR)',
      'Voter ID card (EPIC) & Aadhaar card',
      'Bank passbook with IFSC code'
    ],
    applicationMethod: 'Assistant Director of Agriculture (ADA) office or Duare Sarkar camps.',
    officialUrl: 'https://krishakbandhu.wb.gov.in',
    lastVerified: 'September 2024'
  },
  {
    id: 'sch-kanyashree',
    name: 'Kanyashree Prakalpa (K1 & K2)',
    bengaliName: 'কন্যাশ্রী প্রকল্প',
    department: 'Women & Child Development and Social Welfare',
    authority: 'Government of West Bengal',
    whoItIsFor: 'Unmarried girl students in schools/colleges aged 13 to 19 years.',
    targetCategory: 'Student',
    minAge: 13,
    maxAge: 19,
    benefits: 'Annual scholarship of Rs. 1,000 (K1) and one-time grant of Rs. 25,000 on turning 18 (K2).',
    basicEligibility: [
      'Unmarried girl student',
      'Enrolled in recognized educational institution in West Bengal'
    ],
    requiredDocuments: [
      'Birth Certificate',
      'Declaration of marital status (Unmarried)',
      'Student bank passbook in her own name',
      'Institutional enrolment certificate'
    ],
    applicationMethod: 'Through the head of the student’s school or college.',
    officialUrl: 'https://www.wbkanyashree.gov.in',
    lastVerified: 'September 2024'
  },
  {
    id: 'sch-yuvasree',
    name: 'Yuvasree (Employment Assistance Scheme)',
    bengaliName: 'যুবশ্রী প্রকল্প',
    department: 'Labour Department',
    authority: 'Government of West Bengal',
    whoItIsFor: 'Unemployed youth enrolled in West Bengal Employment Bank.',
    targetCategory: 'Worker',
    minAge: 18,
    maxAge: 45,
    benefits: 'Monthly financial assistance of Rs. 1,500 to support skill training and employment preparation.',
    basicEligibility: [
      'Unemployed citizen registered in Employment Bank',
      'Passed at least Class 8th',
      'Must not have taken assistance/loan under another state self-employment scheme'
    ],
    requiredDocuments: [
      'Employment Bank Enrolment Slip',
      'Educational certificates',
      'Aadhaar card and Bank passbook'
    ],
    applicationMethod: 'Online through Employment Bank portal, followed by physical document submission at Jalpaiguri Employment Exchange.',
    officialUrl: 'https://employmentbankwb.gov.in',
    lastVerified: 'September 2024'
  },
  {
    id: 'sch-puro-pension',
    name: 'Old Age & Disability Pension (NSAP / Jai Bangla)',
    bengaliName: 'জয় বাংলা পেনশন',
    department: 'Department of Women & Child Development',
    authority: 'Government of West Bengal',
    whoItIsFor: 'Senior citizens aged 60+ or persons with severe disabilities.',
    targetCategory: 'Senior Citizen',
    minAge: 60,
    benefits: 'Monthly social security pension of Rs. 1,000 directly credited to bank account.',
    basicEligibility: [
      'Age 60 years or above',
      'Resident of West Bengal',
      'BPL / family income below state poverty threshold'
    ],
    requiredDocuments: [
      'Age proof (Voter ID / Aadhaar card / School certificate)',
      'Income certificate from BDO or Municipality',
      'Bank passbook copy'
    ],
    applicationMethod: 'Submit Form-P at Jalpaiguri Municipality or BDO Office.',
    officialUrl: 'https://wb.gov.in',
    lastVerified: 'September 2024'
  }
];

/**
 * 3. VERIFIED GOVERNMENT CITIZEN ALERTS & NOTICES
 * Explicitly separated: OFFICIAL notices from authorized departments only.
 */
export const VERIFIED_GOVERNMENT_ALERTS: GovtAlert[] = [
  {
    id: 'gov-alert-duare',
    title: 'Duare Sarkar 2024-25 Phase Announced Across Jalpaiguri Wards',
    source: 'District Magistrate Office & Jalpaiguri Municipality',
    authority: 'Government of West Bengal',
    type: 'OFFICIAL',
    category: 'CAMP',
    description: 'Special outreach camps for on-the-spot enrollment in Lakshmir Bhandar, Swasthya Sathi, Student Credit Card, and Land Mutation. Check ward calendar for specific camp venues.',
    publishedDate: '15 Aug 2024',
    lastVerified: 'September 2024',
    officialNoticeUrl: 'https://duaresarkar.wb.gov.in',
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
  },
  {
    id: 'gov-alert-trade',
    title: 'Online Simplified Trade Certificate Issuance through e-District',
    source: 'Urban Development & Municipal Affairs Department',
    authority: 'Government of West Bengal',
    type: 'OFFICIAL',
    category: 'MUNICIPAL',
    description: 'Micro and small traders in Jalpaiguri Municipality can now avail auto-renewal certificates instantly without physical inspection for non-hazardous categories.',
    publishedDate: '10 Jul 2024',
    lastVerified: 'September 2024',
    officialNoticeUrl: 'https://edistrict.wb.gov.in',
    badge: 'Trade Portal'
  }
];

/**
 * Helper to validate safe HTTPS external government domains
 */
export function isSafeGovUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;

    // Allowed official domains
    const allowedSuffixes = [
      '.gov.in',
      '.nic.in',
      '.wb.gov.in',
      'jalpaigurimunicipality.org',
      'wbsedcl.in',
      'wbscvt.net',
      'wbmdfcscholarship.in'
    ];

    return allowedSuffixes.some(suffix =>
      parsed.hostname === suffix || parsed.hostname.endsWith(suffix)
    );
  } catch {
    return false;
  }
}
