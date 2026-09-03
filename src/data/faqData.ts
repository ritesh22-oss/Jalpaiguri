// Centralized FAQ Knowledge Base for Jalpaiguri Connect
// Standardized schema allowing dynamic updates, instant keywords filtering, and category matching.

export type FAQCategory =
  | 'Getting Started'
  | 'Account'
  | 'Workers'
  | 'Blood Donation'
  | 'Medical'
  | 'Government Services'
  | 'Jobs'
  | 'Emergency'
  | 'Location'
  | 'Privacy & Safety'
  | 'Messages & Notifications';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  keywords: string[];
  lastUpdated: string;
}

export const FAQ_CATEGORIES: ('All' | FAQCategory)[] = [
  'All',
  'Getting Started',
  'Account',
  'Workers',
  'Blood Donation',
  'Medical',
  'Government Services',
  'Jobs',
  'Emergency',
  'Location',
  'Privacy & Safety',
  'Messages & Notifications'
];

export const FAQ_DATA: FAQItem[] = [
  // --- GETTING STARTED ---
  {
    id: 'faq-gs-1',
    question: 'What is Jalpaiguri Connect?',
    answer: 'Jalpaiguri Connect is a dedicated citizen-access and community navigation platform designed specifically for the residents of Jalpaiguri, West Bengal. It brings together verified local tradespeople, blood donors, healthcare directories, emergency services, civic grievance reporting, and verified official government service portals into a single unified mobile hub.',
    category: 'Getting Started',
    keywords: ['what', 'about', 'jalpaiguri connect', 'purpose', 'overview', 'app'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-gs-2',
    question: 'How does Jalpaiguri Connect work?',
    answer: 'The app provides an instant directory and assistance layer. You can find nearby service workers, search specialist doctors, locate registered blood donors, check municipal notices, or navigate directly to official government portals to apply for certificates and welfare schemes. You can also report civic issues (like streetlights or potholes) directly to ward administration.',
    category: 'Getting Started',
    keywords: ['how it works', 'features', 'overview', 'use', 'benefits'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-gs-3',
    question: 'Is Jalpaiguri Connect a government app?',
    answer: 'No. Jalpaiguri Connect is an independent civic technology platform. It is NOT the government, nor does it pretend to be an official municipal authority. For all government applications, certificates, and tax payments, the app serves strictly as a safe navigation bridge directing citizens to genuine, verified government portals (.gov.in, .wb.gov.in, and jalpaigurimunicipality.org).',
    category: 'Getting Started',
    keywords: ['government', 'official', 'municipality', 'agency', 'authority', 'legal'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-gs-4',
    question: 'Which areas are supported?',
    answer: 'Jalpaiguri Connect primarily covers the entire Jalpaiguri Municipal jurisdiction (Wards 1 through 25) as well as adjoining sub-divisions including Kadamtala, Dinbazar, Pandapara, Mohanta Para, Deshbandhu Para, Kotwali, Maynaguri, Rajganj, and Malbazar.',
    category: 'Getting Started',
    keywords: ['areas', 'wards', 'coverage', 'location', 'municipal', 'maynaguri', 'malbazar'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-gs-5',
    question: 'How do I find a service near me?',
    answer: 'On the Home screen, tap on any category like "Workers", "Medical", or "Pharmacies", or tap "Nearby" in the bottom navigation. The app automatically calculates radial distances from your current locality or selected ward and displays closest providers first.',
    category: 'Getting Started',
    keywords: ['find service', 'nearby', 'search', 'distance', 'closest'],
    lastUpdated: 'September 2024'
  },

  // --- ACCOUNT ---
  {
    id: 'faq-acc-1',
    question: 'How do I create an account?',
    answer: 'You can create an account in seconds either by using Google One-Tap Sign-In or via Mobile Number OTP authentication. Tap "Profile" or "Sign In", enter your mobile number or select your Google account, and complete your basic name and locality details.',
    category: 'Account',
    keywords: ['register', 'create account', 'sign up', 'login', 'join'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-acc-2',
    question: 'Can I sign in with Google?',
    answer: 'Yes. Jalpaiguri Connect supports fast, secure Google authentication. Your email address and basic profile picture are synchronized securely without storing any sensitive passwords.',
    category: 'Account',
    keywords: ['google', 'sso', 'gmail', 'sign in', 'oauth'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-acc-3',
    question: 'How does phone OTP login work?',
    answer: 'Enter your 10-digit Indian mobile number (+91). A 6-digit one-time password (OTP) is sent instantly to your phone. Enter the code to verify your identity. If you are using our offline test simulator, an auto-filled OTP is provided on screen for instant testing.',
    category: 'Account',
    keywords: ['otp', 'phone', 'sms', 'verification', 'mobile login', 'code'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-acc-4',
    question: 'How do I change my profile information?',
    answer: 'Go to the "Profile" tab from the bottom navigation and tap "Edit My Profile Manually". You can update your display name, blood group, donor status, locality, and contact details. Tap "Save Changes" to store the updates.',
    category: 'Account',
    keywords: ['edit profile', 'change name', 'update details', 'blood group', 'locality'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-acc-5',
    question: 'How do I log out?',
    answer: 'Open the "Profile" tab, scroll to the bottom of the screen, and tap "Log Out of Jalpaiguri Connect". Your local session credentials will be cleared safely.',
    category: 'Account',
    keywords: ['logout', 'sign out', 'disconnect', 'leave'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-acc-6',
    question: 'What happens if I change my phone number?',
    answer: 'You can edit your phone number in your profile settings, or sign in afresh using your new mobile number and complete the OTP verification. Your previous saved reports and records can be linked to your authenticated account.',
    category: 'Account',
    keywords: ['change phone', 'new number', 'sim change', 'account update'],
    lastUpdated: 'September 2024'
  },

  // --- WORKERS ---
  {
    id: 'faq-wrk-1',
    question: 'How can I find an electrician, plumber, carpenter or other worker?',
    answer: 'From the Home or Discover screen, tap "Workers". You can filter by profession (Electrician, Plumber, Carpenter, Mason, Painter, Appliance Repair) and sort by proximity or rating to see verified contact information and visiting charges.',
    category: 'Workers',
    keywords: ['electrician', 'plumber', 'carpenter', 'mason', 'painter', 'home repair', 'tradesman'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-wrk-2',
    question: 'How can I contact a worker?',
    answer: 'Open the worker’s profile card and tap "Call Worker" for direct phone calling, or tap "Book Service" to submit your service requirement with your preferred date and time.',
    category: 'Workers',
    keywords: ['contact worker', 'call', 'phone number', 'book service', 'hire'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-wrk-3',
    question: 'How can I register as a worker?',
    answer: 'Go to the Profile tab and tap "Join as Worker / Offer Services" (or tap "Offer Services" from the Discover menu). Submit your name, trade specialty, daily/hourly rates, ward location, and upload your Aadhaar/Trade certificate for verification.',
    category: 'Workers',
    keywords: ['register worker', 'offer services', 'join', 'earn', 'technician registration'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-wrk-4',
    question: 'How are workers verified?',
    answer: 'Workers display a "Verified" badge only after their government photo identity (Aadhaar/Voter ID) and address proof have been manually scrutinized and approved by municipal administrative review. Profiles without this check show an "Unverified / Pending Verification" badge.',
    category: 'Workers',
    keywords: ['verification', 'verified worker', 'safety', 'background check', 'id proof'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-wrk-5',
    question: 'Can I report a worker?',
    answer: 'Yes. If a service provider engages in unprofessional conduct, overcharging, or no-shows, open their detail card and tap "Report Service Provider", or use the "Report a Problem" section. Our administrative moderators investigate all complaints.',
    category: 'Workers',
    keywords: ['report worker', 'complaint', 'fraud', 'dispute', 'scam'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-wrk-6',
    question: 'How do reviews and ratings work?',
    answer: 'After completing a service request, citizens can leave a 1 to 5-star rating and written review. Ratings are aggregated into the worker’s public scorecard to help neighbors choose reliable technicians.',
    category: 'Workers',
    keywords: ['reviews', 'ratings', 'feedback', 'stars', 'reputation'],
    lastUpdated: 'September 2024'
  },

  // --- BLOOD DONATION ---
  {
    id: 'faq-bld-1',
    question: 'How can I find a blood donor?',
    answer: 'Tap the red "Help" button in the center of the bottom navigation or select "Blood" from the Home screen. You can filter by blood group (A+, B+, O+, AB+, etc.) and location to see available volunteer donors and local blood banks.',
    category: 'Blood Donation',
    keywords: ['blood donor', 'find blood', 'blood bank', 'a positive', 'b positive', 'o negative'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-bld-2',
    question: 'How can I register as a blood donor?',
    answer: 'Go to the Blood section and tap "Register as Blood Donor". Choose your blood group, provide your general locality in Jalpaiguri, and toggle your availability status. You will receive emergency alerts when someone in your area urgently needs blood.',
    category: 'Blood Donation',
    keywords: ['register blood donor', 'donate blood', 'volunteer donor', 'save lives'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-bld-3',
    question: 'How do emergency blood requests work?',
    answer: 'Tap "Post Emergency Blood Request" in the Blood section. Specify patient name, hospital (e.g. Jalpaiguri Sadar Hospital, North Bengal Medical College), units needed, and contact person. The system broadcasts a high-priority alert to all matched donors in the district.',
    category: 'Blood Donation',
    keywords: ['emergency request', 'urgent blood', 'hospital request', 'broadcast'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-bld-4',
    question: 'Is a donor\'s phone number publicly visible?',
    answer: 'Donors have privacy controls. Your phone number is only made accessible to verified citizens who initiate an emergency contact request, protecting donors from spam and telemarketing.',
    category: 'Blood Donation',
    keywords: ['privacy', 'donor phone', 'spam', 'confidentiality', 'protection'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-bld-5',
    question: 'How can I stop receiving donor requests?',
    answer: 'Open your Profile, edit your details, and switch the "Active Blood Donor" toggle to OFF, or adjust your donation status in the Blood section. You can reactivate whenever you are eligible and willing to donate again.',
    category: 'Blood Donation',
    keywords: ['stop requests', 'pause donation', 'opt out', 'inactive donor'],
    lastUpdated: 'September 2024'
  },

  // --- MEDICAL ---
  {
    id: 'faq-med-1',
    question: 'How can I find a doctor?',
    answer: 'Navigate to "Medical" on the Home screen. Browse our directory of empanelled doctors across specialties including General Medicine, Pediatrics, Cardiology, Orthopedics, and Gynecology with their chamber addresses and visiting timings.',
    category: 'Medical',
    keywords: ['doctor', 'find doctor', 'physician', 'specialist', 'chamber', 'appointment'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-med-2',
    question: 'How can I find a hospital or diagnostic centre?',
    answer: 'In the Medical section, select the "Hospitals & Diagnostics" tab. You will find contact details, emergency casualty numbers, and directions for Jalpaiguri District Sadar Hospital, Super Specialty Hospital, and private pathology labs.',
    category: 'Medical',
    keywords: ['hospital', 'sadar hospital', 'clinic', 'diagnostic', 'pathology', 'x-ray'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-med-3',
    question: 'Can Jalpaiguri Connect diagnose my medical condition?',
    answer: 'NO. Jalpaiguri Connect is strictly an informational directory and navigation platform. The app does NOT provide medical advice, diagnosis, or treatment. Always consult a qualified registered medical practitioner for any health concerns.',
    category: 'Medical',
    keywords: ['diagnosis', 'medical advice', 'disclaimer', 'doctor substitute', 'treatment'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-med-4',
    question: 'How do I contact a medical provider?',
    answer: 'Tap "Call Chamber" or "Call Hospital" directly from the provider’s card. The app opens your phone dialer with the verified official reception number.',
    category: 'Medical',
    keywords: ['call doctor', 'chamber number', 'hospital reception', 'contact medical'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-med-5',
    question: 'What should I do in a medical emergency?',
    answer: 'Immediately dial the official emergency ambulance service at 102 or national emergency helpline 112. Do NOT rely on app messages or asynchronous chat during acute life-threatening situations.',
    category: 'Medical',
    keywords: ['emergency', 'ambulance', '102', '112', 'urgent help', 'casualty'],
    lastUpdated: 'September 2024'
  },

  // --- GOVERNMENT SERVICES ---
  {
    id: 'faq-gov-1',
    question: 'Can I apply for government certificates through Jalpaiguri Connect?',
    answer: 'Jalpaiguri Connect does not process or issue government certificates directly. Instead, it provides a safe, verified gateway. When you tap "Apply Online" on a service card (such as Birth Certificate, Caste Certificate, or Trade License), the app opens the genuine, authorized government portal in a secure window.',
    category: 'Government Services',
    keywords: ['apply certificate', 'government', 'caste certificate', 'birth certificate', 'trade license'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-gov-2',
    question: 'Are the government portals official?',
    answer: 'Yes! Every government service listed in Jalpaiguri Connect undergoes strict URL verification. We only connect to official domains belonging to the Government of West Bengal (.wb.gov.in), Government of India (.gov.in / .nic.in), and the Jalpaiguri Municipality (jalpaigurimunicipality.org). We never link to unverified third-party intermediaries.',
    category: 'Government Services',
    keywords: ['official portal', 'verification', 'genuine url', 'government domain', 'safe link'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-gov-3',
    question: 'Where does the Apply Online button take me?',
    answer: 'Before redirecting, the app shows an "Official Portal Redirection" notice showing the exact official government domain (e.g., edistrict.wb.gov.in, janmamrityutathya.wb.gov.in, or parivahan.gov.in). Tapping "Continue to Official Portal" opens the real government submission form.',
    category: 'Government Services',
    keywords: ['apply online button', 'external link', 'redirect', 'official website'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-gov-4',
    question: 'Can I track my government application?',
    answer: 'Yes. In the "My Government Services" area, you can save your official application or acknowledgment number. Tapping "Track on Official Portal" connects you directly to the department’s official tracking page where your real-time status is displayed.',
    category: 'Government Services',
    keywords: ['track application', 'status', 'acknowledgment number', 'my government services'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-gov-5',
    question: 'How do I verify whether a government link is genuine?',
    answer: 'Look for the green "✓ Official Source" verification badge on each service card. You can also verify the website address in your browser bar: legitimate Indian government sites end in .gov.in or .nic.in, and the municipal portal is jalpaigurimunicipality.org.',
    category: 'Government Services',
    keywords: ['verify link', 'genuine', 'badge', 'official source', 'scam warning'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-gov-6',
    question: 'Why was I redirected to another website?',
    answer: 'To protect your citizen rights and privacy, government applications must be submitted directly to authorized statutory departments. Jalpaiguri Connect never intercepts or stores your government passwords, biometric scans, or confidential certificate records.',
    category: 'Government Services',
    keywords: ['redirect', 'external website', 'data privacy', 'safety', 'why external'],
    lastUpdated: 'September 2024'
  },

  // --- JOBS ---
  {
    id: 'faq-job-1',
    question: 'How can I find local jobs?',
    answer: 'Tap "Jobs" in the Discover or Home view. You can filter vacancies by category (Retail, Hospitality, Office, Driving, Delivery, Teaching) across Jalpaiguri town and surrounding industrial estates.',
    category: 'Jobs',
    keywords: ['jobs', 'employment', 'vacancies', 'local hiring', 'work in jalpaiguri'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-job-2',
    question: 'How can I post a job?',
    answer: 'Business owners and households can tap "Post a Job" in the Jobs section. Enter job title, salary range, qualification requirements, and contact phone number. Listings go live after automated anti-spam review.',
    category: 'Jobs',
    keywords: ['post job', 'hire staff', 'recruiter', 'vacancy posting'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-job-3',
    question: 'How can I apply for a job?',
    answer: 'Open any job card and tap "Call Employer" or "Apply Now". You can share your profile summary or phone number directly with the hiring manager.',
    category: 'Jobs',
    keywords: ['apply job', 'job application', 'contact employer', 'resume'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-job-4',
    question: 'Can I report a suspicious job listing?',
    answer: 'Yes! If an employer demands payment for interviews, security deposits, or engages in fraudulent practices, tap "Report Listing". We ban fraudulent recruiters permanently.',
    category: 'Jobs',
    keywords: ['report job', 'fake job', 'scam', 'fraudulent recruiter', 'security fee'],
    lastUpdated: 'September 2024'
  },

  // --- EMERGENCY ---
  {
    id: 'faq-emg-1',
    question: 'What should I do during an emergency?',
    answer: 'For immediate life, fire, or crime emergencies, call the official government hotlines immediately: Police (100 or 112), Fire (101), Ambulance (102). Jalpaiguri Connect also provides a quick-dial emergency directory on the Home and Emergency views.',
    category: 'Emergency',
    keywords: ['emergency', 'police', 'fire', 'ambulance', 'hotline', '112', '100'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-emg-2',
    question: 'How can I access emergency contacts?',
    answer: 'Tap "Emergency" on the Home screen or in Discover. You will find instant one-tap buttons for Jalpaiguri Kotwali Police Station, Sadar Hospital Emergency, Disaster Management Cell, and Electric Trouble Call Desk.',
    category: 'Emergency',
    keywords: ['emergency contacts', 'kotwali police', 'sadar hospital', 'disaster desk'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-emg-3',
    question: 'How can I submit an emergency request?',
    answer: 'In the Blood or Emergency view, tap "Submit Urgent Request". Provide contact details and location. The alert will be published to active community volunteers and the local alert feed.',
    category: 'Emergency',
    keywords: ['submit emergency', 'urgent request', 'community help'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-emg-4',
    question: 'Does Jalpaiguri Connect replace emergency services?',
    answer: 'NO. Jalpaiguri Connect is not an emergency dispatch operator. It does not replace 112, 100, 101, or 102. In life-threatening emergencies, always dial official emergency services first.',
    category: 'Emergency',
    keywords: ['replace emergency', 'dispatch', 'first responders', 'disclaimer'],
    lastUpdated: 'September 2024'
  },

  // --- LOCATION ---
  {
    id: 'faq-loc-1',
    question: 'Why does Jalpaiguri Connect need my location?',
    answer: 'Location permissions allow the app to calculate accurate distances to nearby electricians, medical clinics, blood donors, and show localized municipal warnings relevant to your neighborhood.',
    category: 'Location',
    keywords: ['location permission', 'gps', 'why location', 'distance calculation'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-loc-2',
    question: 'Can I manually select my location?',
    answer: 'Yes! If you prefer not to share GPS coordinates, tap on the location chip at the top of the Home screen and choose your specific locality or ward (e.g. Kadamtala, Dinbazar, Pandapara) manually.',
    category: 'Location',
    keywords: ['manual location', 'select ward', 'kadamtala', 'dinbazar', 'change area'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-loc-3',
    question: 'Is my exact location publicly visible?',
    answer: 'Never. Your precise GPS coordinates are kept securely on your device and are never broadcast publicly. Only your selected neighborhood/locality name is displayed on public requests.',
    category: 'Location',
    keywords: ['location privacy', 'gps tracking', 'exact address', 'security'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-loc-4',
    question: 'How do I change my location?',
    answer: 'Tap the location pin and neighborhood name at the top of the Home screen. A list of Jalpaiguri municipal localities will appear. Tap any locality to update your vantage point immediately.',
    category: 'Location',
    keywords: ['change location', 'update area', 'switch ward'],
    lastUpdated: 'September 2024'
  },

  // --- PRIVACY & SAFETY ---
  {
    id: 'faq-prv-1',
    question: 'Is my phone number publicly visible?',
    answer: 'No. By default, citizen contact details are shielded. Your phone number is only shared when you explicitly contact a worker or initiate an emergency contact request.',
    category: 'Privacy & Safety',
    keywords: ['phone visible', 'privacy', 'hidden number', 'shield'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-prv-2',
    question: 'How is my personal information protected?',
    answer: 'All data communication is encrypted over HTTPS. Biometric fingerprint credentials use the standard W3C Web Authentication API and never leave your physical device hardware security enclave.',
    category: 'Privacy & Safety',
    keywords: ['data protection', 'encryption', 'security', 'webauthn', 'biometrics'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-prv-3',
    question: 'Can I delete my account?',
    answer: 'Yes. In the Profile settings, you can clear all locally stored profile records, credentials, and saved reports with a single tap on "Clear Stored Data & Log Out".',
    category: 'Privacy & Safety',
    keywords: ['delete account', 'clear data', 'remove profile', 'gdpr', 'privacy rights'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-prv-4',
    question: 'How do I report inappropriate or fraudulent content?',
    answer: 'Tap the "Report" button on any listing, or go to the "Report a Problem" section in the app. Our municipal moderation team reviews citizen reports promptly.',
    category: 'Privacy & Safety',
    keywords: ['report content', 'inappropriate', 'fraud', 'moderation', 'spam'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-prv-5',
    question: 'How do I report a fake worker or business?',
    answer: 'Use the "Report Worker" option on the technician’s detail card. Provide details of the incident. We suspend listings that fail verification or violate community trust.',
    category: 'Privacy & Safety',
    keywords: ['fake worker', 'fraud business', 'impersonator', 'report scam'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-prv-6',
    question: 'How do I report a broken government link?',
    answer: 'On any Government Service card in the Government Services Hub, tap the small "Report incorrect link" button. Our verification team will audit the department’s portal and update the official link.',
    category: 'Privacy & Safety',
    keywords: ['broken link', 'report link', 'outdated url', 'government link report'],
    lastUpdated: 'September 2024'
  },

  // --- MESSAGES & NOTIFICATIONS ---
  {
    id: 'faq-not-1',
    question: 'How do notifications work?',
    answer: 'Notifications deliver real-time updates regarding service bookings, emergency blood requests in your blood group, civic issue resolution statuses from the municipality, and local weather/traffic advisories.',
    category: 'Messages & Notifications',
    keywords: ['notifications', 'alerts', 'push notifications', 'updates'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-not-2',
    question: 'How do I turn notifications off?',
    answer: 'You can adjust notification preferences in the Settings / Profile menu, or manage browser push notification permissions via your browser site settings.',
    category: 'Messages & Notifications',
    keywords: ['turn off notifications', 'disable alerts', 'mute', 'push settings'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-not-3',
    question: 'How do I view previous messages?',
    answer: 'Tap on the Bell / Alerts icon in the bottom navigation bar to review past community alerts, civic notifications, and status tracking updates.',
    category: 'Messages & Notifications',
    keywords: ['previous messages', 'notification history', 'alerts archive'],
    lastUpdated: 'September 2024'
  },
  {
    id: 'faq-not-4',
    question: 'Why am I not receiving notifications?',
    answer: 'Ensure that notification permissions are allowed for this website in your browser settings, and check that "Do Not Disturb" mode is not blocking web notifications on your mobile device.',
    category: 'Messages & Notifications',
    keywords: ['not receiving', 'troubleshoot notifications', 'missing alerts', 'browser permissions'],
    lastUpdated: 'September 2024'
  }
];
