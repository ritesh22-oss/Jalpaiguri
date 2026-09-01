import { Worker, CivicReport, LocalAlert, BloodDonor, BloodRequest, Doctor, Hospital, Job, RentalProperty, LostFoundItem, AppNotification } from '../types';

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'w1',
    name: 'Ramesh Sarkar',
    profession: 'Electrician',
    category: 'Electrician',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    verified: true,
    rating: 4.8,
    reviewCount: 124,
    distance: '2.5 km',
    availability: 'Available Now',
    startingPrice: '₹300/visit',
    phone: '+91 98320 44102',
    experienceYears: 7,
    serviceArea: 'Kadamtala, Dinbazar & Mohitnagar',
    skills: ['House Wiring', 'Inverter Repair', 'Fan & Light Fitting', 'Short Circuit Fixing', 'MCB Installation'],
    description: 'Certified ITI electrician with 7+ years of experience in Jalpaiguri town. Specializes in emergency repairs, domestic wiring, and inverter installations.',
    completedJobs: 342,
    reviews: [
      { author: 'Subhash Sen', rating: 5, date: '2 days ago', comment: 'Came within 25 minutes to fix main fuse short circuit. Very professional.' },
      { author: 'Priyanka Paul', rating: 5, date: '1 week ago', comment: 'Installed 4 ceiling fans and inverter cabling neatly.' }
    ]
  },
  {
    id: 'w2',
    name: 'Amit Das',
    profession: 'Plumber',
    category: 'Plumber',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    verified: true,
    rating: 4.6,
    reviewCount: 89,
    distance: '4.1 km',
    availability: 'Available Today',
    startingPrice: '₹250/visit',
    phone: '+91 94340 77123',
    experienceYears: 5,
    serviceArea: 'Silpasamiti Para, Pandapara',
    skills: ['Pipe Leakage', 'Water Tank Cleaning', 'Bathroom Fitting', 'Motor Pump Installation'],
    description: 'Expert plumber for water tank cleaning, high pressure PVC piping, leak detection and sanitary fittings.',
    completedJobs: 218,
    reviews: [
      { author: 'Anirban Ghosh', rating: 5, date: '3 days ago', comment: 'Fixed severe bathroom pipe leakage quickly without breaking extra tiles.' }
    ]
  },
  {
    id: 'w3',
    name: 'Bikash Roy',
    profession: 'Carpenter',
    category: 'Carpenter',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    verified: true,
    rating: 4.9,
    reviewCount: 210,
    distance: '1.2 km',
    availability: 'Available Now',
    startingPrice: 'Consultation: Free',
    phone: '+91 97331 88992',
    experienceYears: 12,
    serviceArea: 'Adarpara, DB Road, Station Road',
    skills: ['Custom Furniture', 'Door & Window Repair', 'Modular Kitchen', 'Lock Repair', 'Teak Wood Polishing'],
    description: 'Master carpenter specializing in solid wood craft, modern plywood modular cupboards, sliding doors and restoration.',
    completedJobs: 512,
    reviews: [
      { author: 'Dr. S. Mukherjee', rating: 5, date: 'Yesterday', comment: 'Excellent wardrobe craftsmanship and quick doorstep repair.' }
    ]
  },
  {
    id: 'w4',
    name: 'Sunita Burman',
    profession: 'Home Helper & Cook',
    category: 'Cook',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    verified: true,
    rating: 4.9,
    reviewCount: 165,
    distance: '1.8 km',
    availability: 'Available Today',
    startingPrice: '₹3,500/month',
    phone: '+91 98322 19934',
    experienceYears: 6,
    serviceArea: 'Silpasamiti Para & Kharia',
    skills: ['Bengali & North Indian Cooking', 'Deep House Cleaning', 'Childcare & Elder Support'],
    description: 'Trustworthy and experienced domestic cook and household assistant with verified background and references.',
    completedJobs: 84
  },
  {
    id: 'w5',
    name: 'Ratan Mondal',
    profession: 'AC & Refrigerator Repair',
    category: 'AC Technician',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    verified: true,
    rating: 4.7,
    reviewCount: 94,
    distance: '3.0 km',
    availability: 'Available Now',
    startingPrice: '₹450/service',
    phone: '+91 96471 22849',
    experienceYears: 8,
    serviceArea: 'All Jalpaiguri Town',
    skills: ['Split & Window AC Gas Refill', 'Compressor Repair', 'Refrigerator Cooling Fix', 'Washing Machine PCB'],
    description: 'Fast doorstep technician for cooling appliances with original spare parts guarantee.',
    completedJobs: 310
  }
];

export const INITIAL_CIVIC_REPORTS: CivicReport[] = [
  {
    id: 'JPG-84920',
    category: 'Waterlogging',
    location: 'Paharpur Teesta Embankment Rd, Jalpaiguri',
    description: 'Heavy waterlogging near Paharpur crossing after morning rain. Vehicles getting stuck on the east lane.',
    reportedAt: '18 minutes ago',
    status: 'Under Review',
    upvotes: 24,
    hasUpvoted: true,
    timeline: [
      { title: 'Submitted by Citizen', time: '18 mins ago', done: true },
      { title: 'Municipal Ward Review', time: 'In Progress', done: false },
      { title: 'Drainage Team Dispatched', time: 'Pending', done: false },
      { title: 'Resolved', time: 'Pending', done: false }
    ]
  },
  {
    id: 'JPG-73210',
    category: 'Streetlight',
    location: 'Silpasamiti Para 4th Lane',
    description: 'Three consecutive high-mast streetlights have been completely non-functional for 4 days.',
    reportedAt: '2 hours ago',
    status: 'Submitted',
    upvotes: 12,
    hasUpvoted: false,
    timeline: [
      { title: 'Submitted by Citizen', time: '2 hours ago', done: true },
      { title: 'Electricity Board Review', time: 'Pending', done: false },
      { title: 'Action Taken', time: 'Pending', done: false },
      { title: 'Resolved', time: 'Pending', done: false }
    ]
  },
  {
    id: 'JPG-62190',
    category: 'Garbage',
    location: 'Dinbazar Vegetable Market Gate 2',
    description: 'Overflowing municipal vat causing foul smell and road narrowing.',
    reportedAt: 'Yesterday',
    status: 'Action Taken',
    upvotes: 45,
    hasUpvoted: false,
    timeline: [
      { title: 'Submitted by Citizen', time: 'Yesterday 10:00 AM', done: true },
      { title: 'Municipality Verified', time: 'Yesterday 2:30 PM', done: true },
      { title: 'Cleaning Truck Dispatched', time: 'Today 7:00 AM', done: true },
      { title: 'Resolved', time: 'Pending Final Inspection', done: false }
    ]
  }
];

export const INITIAL_LOCAL_ALERTS: LocalAlert[] = [
  {
    id: 'alt-1',
    title: 'Waterlogging reported',
    category: 'Waterlogging',
    area: 'Paharpur, Jalpaiguri',
    timeAgo: '18 minutes ago',
    severity: 'medium',
    description: 'Water accumulation on NH-27 connector near Paharpur school. Two-wheelers advised to take Teesta Barrage alternate route.',
    confirmedCount: 3,
    userConfirmed: false,
    lat: 26.541,
    lng: 88.729,
    isOfficial: false
  },
  {
    id: 'alt-2',
    title: 'Road Closure - Teesta Bridge Maintenance',
    category: 'Road Closure',
    area: 'Teesta River Bridge, Jalpaiguri',
    timeAgo: '1 hour ago',
    severity: 'high',
    description: 'One lane closed for expansion joint maintenance between 10 AM to 5 PM today.',
    confirmedCount: 19,
    userConfirmed: true,
    lat: 26.535,
    lng: 88.742,
    isOfficial: true
  },
  {
    id: 'alt-3',
    title: 'Electricity Maintenance Shutdown',
    category: 'Electricity',
    area: 'Kadamtala & Adarpara',
    timeAgo: '3 hours ago',
    severity: 'low',
    description: 'WBSEDCL transformer upgrade scheduled today from 1:00 PM to 4:00 PM.',
    confirmedCount: 38,
    userConfirmed: false,
    lat: 26.518,
    lng: 88.718,
    isOfficial: true
  }
];

export const INITIAL_BLOOD_DONORS: BloodDonor[] = [
  {
    id: 'bd-1',
    name: 'Sourav Ganguly (Anonymous ID #29)',
    bloodGroup: 'O+',
    area: 'Kadamtala, Jalpaiguri',
    distance: '1.4 km',
    availability: 'Available Now',
    lastDonation: '4 months ago',
    verified: true,
    donationsCount: 8
  },
  {
    id: 'bd-2',
    name: 'Debojyoti Paul (Anonymous ID #81)',
    bloodGroup: 'A+',
    area: 'Silpasamiti Para',
    distance: '2.1 km',
    availability: 'Available Now',
    lastDonation: '6 months ago',
    verified: true,
    donationsCount: 5
  },
  {
    id: 'bd-3',
    name: 'Rajib Roy (Anonymous ID #14)',
    bloodGroup: 'B+',
    area: 'Mohitnagar',
    distance: '3.5 km',
    availability: 'Available',
    lastDonation: '3 months ago',
    verified: true,
    donationsCount: 11
  },
  {
    id: 'bd-4',
    name: 'Tanushree Bhattacharya (Anonymous ID #92)',
    bloodGroup: 'AB-',
    area: 'Adarpara',
    distance: '2.8 km',
    availability: 'Available Now',
    lastDonation: '5 months ago',
    verified: true,
    donationsCount: 3
  },
  {
    id: 'bd-5',
    name: 'Mousumi Das (Anonymous ID #47)',
    bloodGroup: 'O-',
    area: 'Pandapara',
    distance: '1.9 km',
    availability: 'Available Now',
    lastDonation: '7 months ago',
    verified: true,
    donationsCount: 6
  }
];

export const INITIAL_BLOOD_REQUESTS: BloodRequest[] = [
  {
    id: 'br-1',
    patientName: 'Emergency Patient (Thalassemia Care)',
    bloodGroup: 'O+',
    hospital: 'Jalpaiguri District Hospital Blood Bank',
    units: 2,
    urgency: 'Immediate (Critical)',
    contactPerson: 'Hospital Red Cross Desk',
    phone: '+91 94340 11999',
    location: 'Hospital Road, Jalpaiguri',
    status: 'Urgent',
    postedAt: '25 mins ago'
  },
  {
    id: 'br-2',
    patientName: 'Surgery Case (Ortho)',
    bloodGroup: 'B+',
    hospital: 'Desun / Paramount Hospital',
    units: 1,
    urgency: 'Within 24 Hours',
    contactPerson: 'Family Attendant',
    phone: '+91 98320 55123',
    location: 'DB Road, Jalpaiguri',
    status: 'Urgent',
    postedAt: '2 hours ago'
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Aniruddha Sen',
    specialty: 'General Physician & Diabetologist',
    qualifications: 'MBBS, MD (Medicine)',
    medicalCentre: 'Sen Medicare & Jalpaiguri Town Clinic',
    distance: '1.5 km',
    visitingHours: 'Daily 5:00 PM - 8:30 PM (Sun Closed)',
    verified: true,
    rating: 4.9,
    phone: '+91 94340 55221',
    address: 'Kadamtala Main Road, Near SBI',
    languages: ['Bengali', 'English', 'Hindi']
  },
  {
    id: 'doc-2',
    name: 'Dr. Sharmila Banerjee',
    specialty: 'Cardiologist',
    qualifications: 'MBBS, MD, DM (Cardiology)',
    medicalCentre: 'Heart Care PolyClinic',
    distance: '2.8 km',
    visitingHours: 'Mon, Wed, Fri 4:00 PM - 7:00 PM',
    verified: true,
    rating: 4.8,
    phone: '+91 98322 99441',
    address: 'Club Road, Silpasamiti Para',
    languages: ['Bengali', 'English']
  },
  {
    id: 'doc-3',
    name: 'Dr. Prosenjit Karmakar',
    specialty: 'Pediatrician (Child Specialist)',
    qualifications: 'MBBS, DCH, DNB (Pediatrics)',
    medicalCentre: 'Shishu Kalyan Clinic',
    distance: '2.0 km',
    visitingHours: 'Morning 9:00 AM - 12:00 PM, Evening 6:00 PM - 9:00 PM',
    verified: true,
    rating: 4.9,
    phone: '+91 97330 22189',
    address: 'Near District Hospital Gate 1',
    languages: ['Bengali', 'English', 'Hindi']
  },
  {
    id: 'doc-4',
    name: 'Dr. Subir Ghosh',
    specialty: 'Orthopedic Surgeon',
    qualifications: 'MBBS, MS (Ortho)',
    medicalCentre: 'Bone & Joint Clinic',
    distance: '3.2 km',
    visitingHours: 'Tue, Thu, Sat 5:30 PM - 8:30 PM',
    verified: true,
    rating: 4.7,
    phone: '+91 96470 33811',
    address: 'Dinbazar Medical Complex',
    languages: ['Bengali', 'English']
  }
];

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Jalpaiguri District Hospital',
    distance: '2.4 km away',
    openHours: 'Open 24/7',
    is24x7: true,
    hasEmergency: true,
    hasICU: true,
    hasBloodBank: true,
    hasAmbulance: true,
    departments: ['Emergency Trauma', 'General Medicine', 'Maternity & Child', 'Orthopedics', 'Cardiology ICU', 'Dialysis'],
    phone: '03561-224001',
    address: 'Hospital Road, Jalpaiguri, WB 735101'
  },
  {
    id: 'hosp-2',
    name: 'Kotwali Police Station',
    distance: '3.1 km away',
    openHours: 'Open 24/7',
    is24x7: true,
    hasEmergency: true,
    hasICU: false,
    hasBloodBank: false,
    hasAmbulance: false,
    departments: ['Emergency Dispatch', 'Traffic Control', 'Women Helpdesk', 'Cyber Help'],
    phone: '03561-224100',
    address: 'Court Complex, Jalpaiguri, WB 735101'
  },
  {
    id: 'hosp-3',
    name: 'Jalpaiguri Fire Station',
    distance: '4.5 km away',
    openHours: 'Open 24/7',
    is24x7: true,
    hasEmergency: true,
    hasICU: false,
    hasBloodBank: false,
    hasAmbulance: true,
    departments: ['Fire Rescue', 'Disaster Response Squad', 'Flood Relief'],
    phone: '03561-224101',
    address: 'Station Road, Jalpaiguri'
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'j-1',
    title: 'Retail Store Manager & Billing Executive',
    employer: 'North Bengal Garments Ltd.',
    location: 'Dinbazar Main Market, Jalpaiguri',
    salary: '₹14,000 - ₹18,000 / month',
    jobType: 'Full-time',
    distance: '1.5 km away',
    postedTime: '2 hours ago',
    description: 'Looking for an energetic store billing executive with basic computer/Tally skills and good customer communication.',
    requirements: ['12th Pass or Graduate', 'Basic Computer & Billing knowledge', 'Fluent in Bengali & Hindi'],
    phone: '+91 98320 88219'
  },
  {
    id: 'j-2',
    title: 'Delivery Partner (Bike / Scooty)',
    employer: 'Jalpaiguri Quick Express',
    location: 'Kadamtala Hub, Jalpaiguri',
    salary: '₹15,000 - ₹22,000 + Fuel Allowance',
    jobType: 'Full-time',
    distance: '2.0 km away',
    postedTime: '5 hours ago',
    description: 'Hyperlocal e-commerce package delivery across Jalpaiguri town. Flexible morning and evening shifts.',
    requirements: ['Valid Two-Wheeler Driving Licence', 'Smartphone (Android)', 'Punctual & Polite'],
    phone: '+91 94341 99012'
  },
  {
    id: 'j-3',
    title: 'Front Desk & Patient Coordinator',
    employer: 'Apex Diagnostic Centre',
    location: 'Hospital Road, Jalpaiguri',
    salary: '₹12,000 - ₹15,000 / month',
    jobType: 'Full-time',
    distance: '2.4 km away',
    postedTime: '1 day ago',
    description: 'Managing patient registrations, report dispatch, and telephone appointments in reputed diagnostic laboratory.',
    requirements: ['Graduate in any discipline', 'Good typing speed', 'Polite mannerism'],
    phone: '+91 97330 44211'
  }
];

export const INITIAL_RENTALS: RentalProperty[] = [
  {
    id: 'r-1',
    title: '2 BHK Spacious Semi-Furnished Flat with Balcony',
    type: 'Flat',
    rent: '₹8,500 / month',
    deposit: '₹17,000 (2 months)',
    area: 'Silpasamiti Para, Jalpaiguri',
    distance: '2.1 km away',
    amenities: ['24hr Running Water', 'Bike & Car Parking', 'Inverter Wiring', 'Separate Electric Meter'],
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=80',
    contact: '+91 98320 66543',
    description: 'First floor 2 BHK flat near Silpasamiti Club with quiet surroundings, wide road access and good ventilation.'
  },
  {
    id: 'r-2',
    title: 'Single Independent Room for Students / Working Bachelor',
    type: 'Room',
    rent: '₹3,200 / month',
    deposit: '₹5,000',
    area: 'Mohitnagar College Road',
    distance: '3.8 km away',
    amenities: ['Attached Bathroom', 'Bed & Study Table provided', 'High Speed Wi-Fi included', 'Drinking RO Water'],
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500&auto=format&fit=crop&q=80',
    contact: '+91 94340 88712',
    description: 'Clean room inside peaceful gated house within 5 mins walk to Jalpaiguri Government Engineering College & Polytechnic.'
  }
];

export const INITIAL_LOST_FOUND: LostFoundItem[] = [
  {
    id: 'lf-1',
    type: 'Lost',
    category: 'Wallet',
    title: 'Brown Leather Wallet with Aadhaar & Driving Licence',
    location: 'Dinbazar Auto Stand / Netaji Statue area',
    date: 'Yesterday, approx 4:30 PM',
    description: 'Brown Wildhorn leather wallet containing West Bengal Driving Licence in the name of Debasish Ghosh and some cash.',
    contactPreference: 'Call via App or Police Station desk',
    status: 'Open'
  },
  {
    id: 'lf-2',
    type: 'Found',
    category: 'Keys',
    title: 'Honda Activa Key with Silver Om Keychain',
    location: 'District Sports Ground (Town Club) Pavilion',
    date: 'Today Morning 7:15 AM',
    description: 'Found on the seating bench during morning walk. Deposited with the ground caretaker.',
    contactPreference: 'Verify key number with ground staff',
    status: 'Open'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    type: 'alert',
    title: 'Civic Update in Paharpur',
    message: 'Municipal drainage team has reached Paharpur road for waterlogging clearance.',
    timestamp: '10 mins ago',
    read: false,
    actionView: 'alerts'
  },
  {
    id: 'n-2',
    type: 'blood',
    title: 'Urgent Blood Support (O+)',
    message: 'Emergency request posted at District Hospital Blood Bank.',
    timestamp: '25 mins ago',
    read: false,
    actionView: 'blood'
  },
  {
    id: 'n-3',
    type: 'service',
    title: 'Welcome to Jalpaiguri Connect',
    message: 'Your profile is set up for Jalpaiguri town. Find trusted local help instantly.',
    timestamp: '1 hour ago',
    read: true,
    actionView: 'home'
  }
];
