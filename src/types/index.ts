export type ViewType =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'phone-auth'
  | 'otp'
  | 'profile-onboarding'
  | 'profile-setup'
  | 'location-permission'
  | 'home'
  | 'nearby'
  | 'discover'
  | 'workers'
  | 'worker-detail'
  | 'worker-request'
  | 'worker-request-tracking'
  | 'offer-services'
  | 'emergency'
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
  | 'admin-dashboard'
  | 'ai-chat'
  | 'maps-explorer'
  | 'safety-sos'
  | 'sexual-violence-support'
  | 'outside-area'
  | 'location-permission-required'
  | 'faq';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | "I don't know";

export type LocationStatus =
  | 'idle'
  | 'detecting'
  | 'permission_request'
  | 'found'
  | 'permission_denied'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'error'
  | 'manual';

export interface UserLocation {
  name: string;
  locality: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  pincode?: string;
  road?: string;
  lat: number;
  lng: number;
  isApproximate?: boolean;
  accuracy?: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  locationSource?: 'gps' | 'manual' | 'simulated';
  updatedAt?: string;
}

export interface ServiceRegion {
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

export type NearbyCategoryType =
  | 'All'
  | 'Workers'
  | 'Medical'
  | 'Blood'
  | 'Jobs'
  | 'Shops'
  | 'Vehicle'
  | 'Animal'
  | 'Rentals'
  | 'Services';

export type DistanceFilterType = 'Within 1 km' | 'Within 3 km' | 'Within 5 km' | 'Within 10 km' | 'Any distance';

export interface NearbyItem {
  id: string;
  name: string;
  category: NearbyCategoryType;
  subcategory: string;
  area: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  distanceText?: string;
  verified?: boolean;
  availability?: string;
  openStatus?: string;
  rating?: number;
  reviewCount?: number;
  startingPrice?: string;
  salary?: string;
  rent?: string;
  phone?: string;
  imageUrl?: string;
  description?: string;
  primaryActionLabel: string;
  targetView: ViewType;
  targetParams?: Record<string, any>;
}

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
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  locationSource?: 'gps' | 'manual';
  locationUpdatedAt?: string;
  serviceAreaStatus?: 'inside' | 'outside';
  avatarUrl?: string;
  isVolunteer?: boolean;
  isBloodDonor?: boolean;
  language: 'English' | 'বাংলা' | 'हिन्दी';
  role?: 'citizen' | 'admin' | 'worker';
  fingerprintEnrolled?: boolean;
  fingerprintCredentialId?: string;
  createdAt: string;
}

export type EmergencyEventType = 'SAFETY_SOS' | 'MEDICAL_EMERGENCY' | 'ACCIDENT' | 'TEST_SIMULATION';

export interface EmergencyEvent {
  id: string;
  user_id: string;
  userName?: string;
  event_type: EmergencyEventType;
  created_at: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  city: string;
  district?: string;
  state: string;
  status: 'ACTIVE' | 'CANCELLED' | 'RESOLVED' | 'TEST_SIMULATION';
  isTestMode?: boolean;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
  resolved_at?: string | null;
  device_status?: string;
  alerts_sent_trusted?: boolean;
  alerts_sent_nearby?: boolean;
  nearby_recipients_count?: number;
}

export interface EmergencyAlertRecipient {
  id: string;
  event_id: string;
  recipient_user_id: string;
  recipient_type: 'TRUSTED_CONTACT' | 'NEARBY_COMMUNITY';
  sent_at: string;
  delivered_at?: string | null;
  read_at?: string | null;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: 'Parent' | 'Sibling' | 'Spouse' | 'Child' | 'Friend' | 'Guardian' | 'Other';
  isEmergencyAlertContact: boolean;
  addedAt: string;
}

export interface SafetySettings {
  shakeToSosEnabled: boolean;
  instantSosEnabled: boolean;
  nearbyAlertsEnabled: boolean;
  nearbyAlertRadiusKm: 0.5 | 1 | 2 | 5;
  locationSharingEnabled: boolean;
  emergencyNotificationSound: boolean;
  hasSeenSafetyDisclaimer: boolean;
}

export interface PrivateIncidentNote {
  id: string;
  referenceNumber: string;
  date: string;
  time: string;
  approximateLocation: string;
  category: 'Immediate Danger' | 'Harassment' | 'Assault' | 'Stalking' | 'Domestic Violence' | 'Other';
  notes: string;
  createdAt: string;
  isEncryptedLocally: boolean;
}

// Internal municipal administrator access verification (strictly private, never exposed to UI)
export const PREDEFINED_ADMIN_EMAIL = 'riteshganguly0911@gmail.com';

const AUTHORIZED_ADMIN_EMAILS: readonly string[] = [
  'r36728659@gmail.com',
  PREDEFINED_ADMIN_EMAIL,
  'riteshganguly0911@gamil.com' // Handle common domain typo securely
];

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.includes(normalized);
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
  experienceYears?: number;
  experience?: string;
  location?: string;
  bio?: string;
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

export type CivicCategory =
  | 'Road'
  | 'Streetlight'
  | 'Garbage'
  | 'Water'
  | 'Flooding'
  | 'Electricity'
  | 'Drainage'
  | 'Sewage'
  | 'Footpath'
  | 'Traffic Signal'
  | 'Public Toilet'
  | 'Illegal Dumping'
  | 'Park / Public Space'
  | 'Tree / Fallen Tree'
  | 'Stray Animal'
  | 'Other';

export type CivicReportStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Action Taken';

export type CivicSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface CivicReport {
  id: string;
  userId?: string;
  category: CivicCategory | string;
  location: string;
  locality?: string;
  city?: string;
  district?: string;
  state?: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
  description: string;
  photoUrl?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  severity?: CivicSeverity;
  landmark?: string;
  nearbyArea?: string;
  noticedWhen?: string;
  aiAssisted?: boolean;
  status: CivicReportStatus;
  reportedAt: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  upvotes: number;
  hasUpvoted?: boolean;
  officialResponse?: string;
  timeline: { title: string; time: string; done: boolean; desc?: string }[];
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
  clinic?: string;
  distance: string;
  visitingHours: string;
  timing?: string;
  fee?: string;
  experience?: string;
  avatarUrl?: string;
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
  company?: string;
  location: string;
  salary: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Daily Wage';
  type?: string;
  distance: string;
  postedTime: string;
  postedAt?: string;
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

export type ExplorePlaceCategory =
  | 'All'
  | 'Healthcare'
  | 'Heritage & Tourism'
  | 'Commercial & Markets'
  | 'Transport'
  | 'Education & Civic'
  | 'Fuel & Utilities';

export interface ExplorePlaceItem {
  id: string;
  placeId: string; // Official Google Place ID (e.g., ChIJ...)
  name: string;
  category: ExplorePlaceCategory;
  subcategory: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  rating: number;
  userRatingCount: number;
  googleMapsUri: string;
  photoResourceName?: string;
  photoUrl?: string | null;
  photoAttribution?: string;
  openStatus?: string;
  phone?: string;
  description?: string;
  features?: string[];
  distanceKm?: number;
  distanceText?: string;
}

