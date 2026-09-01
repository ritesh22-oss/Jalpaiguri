export type ViewType =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'otp'
  | 'profile-onboarding'
  | 'location-permission'
  | 'home'
  | 'discover'
  | 'workers'
  | 'worker-detail'
  | 'worker-request'
  | 'worker-request-tracking'
  | 'offer-services'
  | 'blood'
  | 'blood-request'
  | 'blood-donors'
  | 'medical'
  | 'doctor-detail'
  | 'hospital-detail'
  | 'pharmacy'
  | 'jobs'
  | 'job-detail'
  | 'job-apply'
  | 'post-job'
  | 'vehicle'
  | 'vehicle-request'
  | 'animal'
  | 'rentals'
  | 'rental-detail'
  | 'list-property'
  | 'government'
  | 'businesses'
  | 'business-detail'
  | 'lost-found'
  | 'report-problem'
  | 'report-tracking'
  | 'alerts'
  | 'volunteer'
  | 'messages'
  | 'chat'
  | 'notifications'
  | 'saved'
  | 'profile'
  | 'edit-profile'
  | 'settings'
  | 'admin-dashboard';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | "I don't know";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  bloodGroup?: BloodGroup;
  location: string;
  coordinates?: { lat: number; lng: number };
  avatarUrl?: string;
  isVolunteer?: boolean;
  isBloodDonor?: boolean;
  language: 'English' | 'বাংলা' | 'हिन्दी';
  role?: 'citizen' | 'admin' | 'worker';
  createdAt: string;
}

export interface Worker {
  id: string;
  name: string;
  profession: string;
  category: 'Electrician' | 'Plumber' | 'Carpenter' | 'Painter' | 'Mason' | 'Cook' | 'Cleaner' | 'AC Technician' | 'Mechanic' | 'Other';
  avatarUrl: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  distance: string;
  availability: 'Available Now' | 'Available Today' | 'Busy';
  startingPrice: string;
  phone: string;
  experienceYears: number;
  serviceArea: string;
  skills: string[];
  description: string;
  completedJobs: number;
  reviews?: { author: string; rating: number; date: string; comment: string }[];
}

export interface ServiceRequest {
  id: string;
  workerId?: string;
  workerName?: string;
  serviceCategory: string;
  description: string;
  photoUrl?: string;
  location: string;
  preferredDate: string;
  preferredTime: string;
  budget?: string;
  status: 'Submitted' | 'Provider Reviewing' | 'Accepted' | 'On The Way' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface CivicReport {
  id: string;
  category: 'Road' | 'Streetlight' | 'Garbage' | 'Water' | 'Flooding' | 'Waterlogging' | 'Electricity' | 'Fallen Tree' | 'Traffic';
  location: string;
  description: string;
  photoUrl?: string;
  status: 'Submitted' | 'Under Review' | 'Action Taken' | 'Resolved';
  reportedAt: string;
  upvotes: number;
  hasUpvoted?: boolean;
  timeline: { title: string; time: string; done: boolean }[];
}

export interface LocalAlert {
  id: string;
  title: string;
  category: 'Waterlogging' | 'Road Closure' | 'Flood' | 'Emergency' | 'Electricity' | 'Community';
  area: string;
  timeAgo: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confirmedCount: number;
  userConfirmed?: boolean;
  lat: number;
  lng: number;
  isOfficial?: boolean;
}

export interface BloodDonor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  area: string;
  distance: string;
  availability: 'Available Now' | 'Available' | 'Unavailable';
  lastDonation?: string;
  verified: boolean;
  donationsCount: number;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  hospital: string;
  units: number;
  urgency: 'Immediate (Critical)' | 'Within 24 Hours' | 'Planned';
  contactPerson: string;
  phone: string;
  location: string;
  status: 'Urgent' | 'Assigned' | 'Fulfilled';
  postedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  medicalCentre: string;
  distance: string;
  visitingHours: string;
  verified: boolean;
  rating: number;
  phone: string;
  address: string;
  languages: string[];
}

export interface Hospital {
  id: string;
  name: string;
  distance: string;
  openHours: string;
  is24x7: boolean;
  hasEmergency: boolean;
  hasICU: boolean;
  hasBloodBank: boolean;
  hasAmbulance: boolean;
  departments: string[];
  phone: string;
  address: string;
}

export interface Job {
  id: string;
  title: string;
  employer: string;
  location: string;
  salary: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Daily Wage';
  distance: string;
  postedTime: string;
  description: string;
  requirements: string[];
  phone: string;
}

export interface RentalProperty {
  id: string;
  title: string;
  type: 'Room' | 'Flat' | 'PG' | 'Hostel' | 'Shop';
  rent: string;
  deposit: string;
  area: string;
  distance: string;
  amenities: string[];
  imageUrl: string;
  contact: string;
  description: string;
}

export interface LostFoundItem {
  id: string;
  type: 'Lost' | 'Found';
  category: 'Phone' | 'Wallet' | 'Documents' | 'Bag' | 'Keys' | 'Pet' | 'Other';
  title: string;
  location: string;
  date: string;
  description: string;
  imageUrl?: string;
  contactPreference: string;
  status: 'Open' | 'Resolved';
}

export interface AppNotification {
  id: string;
  type: 'blood' | 'job' | 'service' | 'alert' | 'report' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionView?: ViewType;
  actionParams?: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface WorkerFilterState {
  category: string;
  distance: 'Any' | '< 2 km' | '< 5 km' | '< 10 km';
  availableNowOnly: boolean;
  availableTodayOnly: boolean;
  minRating: number;
}
