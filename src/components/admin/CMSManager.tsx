import React, { useState, useEffect, useMemo } from 'react';
import {
  db,
  storage,
  isFirebaseConfigured
} from '../../lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  Store, Wrench, PlusSquare, Users, AlertTriangle,
  Plus, Edit2, Trash2, Eye, X, Upload,
  Camera, ArrowRightLeft, Star, Heart,
  Loader2, Sparkles, Search, FileSpreadsheet, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logAdminAction } from '../../utils/adminAudit';

interface CMSItem {
  id: string;
  name?: string;
  title?: string;
  category?: string;
  description?: string;
  phone?: string;
  locality?: string;
  address?: string;
  isVerified?: boolean;
  status?: string;
  featured?: boolean;
  images?: string[];
  thumbnailIndex?: number;
  secondIndex?: number;
  createdAt?: any;
  [key: string]: any;
}

interface CollectionMeta {
  id: string;
  label: string;
  icon: React.ReactNode;
  dbName: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'boolean';
    options?: string[];
    required?: boolean;
    placeholder?: string;
  }[];
}

const COLLECTIONS_META: CollectionMeta[] = [
  {
    id: 'cms_content',
    label: 'Homepage, City & Notices',
    icon: <FileSpreadsheet className="w-4 h-4 text-blue-600" />,
    dbName: 'cms_content',
    fields: [
      {
        name: 'contentType',
        label: 'Content Area',
        type: 'select',
        options: ['Homepage', 'City Information', 'Announcement', 'Government Notice', 'Service Description'],
        required: true
      },
      { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Public-facing heading' },
      { name: 'description', label: 'Content', type: 'textarea', required: true, placeholder: 'Public-facing copy' },
      { name: 'locality', label: 'Area / City (optional)', type: 'text', placeholder: 'e.g. Jalpaiguri Town' },
      { name: 'publishedAt', label: 'Publication date', type: 'text', placeholder: 'YYYY-MM-DD' }
    ]
  },
  {
    id: 'shops',
    label: 'Shops & Merchants',
    icon: <Store className="w-4 h-4" />,
    dbName: 'shops',
    fields: [
      { name: 'name', label: 'Shop Name', type: 'text', required: true, placeholder: 'e.g. Jalpaiguri Variety Store' },
      { name: 'ownerName', label: 'Owner Name', type: 'text', required: true },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: [
          'Clothing', 'Electronics', 'Groceries', 'Stationeries', 'Cafe & Restaurant',
          'Sweet Shop', 'Pharmacy / Medical', 'Saloon & Spa', 'Jewellery', 'Other'
        ],
        required: true
      },
      { name: 'phone', label: 'Contact Phone', type: 'text', required: true },
      { name: 'locality', label: 'Locality / Area', type: 'text', required: true, placeholder: 'e.g. Kadamtala, Rajbari Para' },
      { name: 'pincode', label: 'Pincode', type: 'text', required: true, placeholder: '735101' },
      { name: 'address', label: 'Full Address', type: 'textarea', required: true },
      { name: 'description', label: 'About the Shop', type: 'textarea' },
      { name: 'lat', label: 'Latitude', type: 'number', placeholder: '26.5435' },
      { name: 'lng', label: 'Longitude', type: 'number', placeholder: '88.7196' }
    ]
  },
  {
    id: 'restaurants',
    label: 'Cafes & Dining',
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    dbName: 'restaurants',
    fields: [
      { name: 'name', label: 'Cafe / Restaurant Name', type: 'text', required: true, placeholder: 'e.g. Royal Cafe & Lounge' },
      { name: 'ownerName', label: 'Owner Name', type: 'text' },
      {
        name: 'category',
        label: 'Cuisine Type',
        type: 'select',
        options: [
          'Chinese & Bengali Fusion', 'Mughlai & Biryani', 'South Indian', 'Bakery & Dessert',
          'Cafe & Fast Food', 'Traditional Bengali Thali', 'Multi-Cuisine', 'Other'
        ],
        required: true
      },
      { name: 'phone', label: 'Contact Phone', type: 'text', required: true },
      { name: 'locality', label: 'Locality', type: 'text', required: true },
      { name: 'pincode', label: 'Pincode', type: 'text', placeholder: '735101' },
      { name: 'address', label: 'Full Address', type: 'textarea' },
      { name: 'description', label: 'Description & Specialties', type: 'textarea' },
      { name: 'rating', label: 'Initial Rating', type: 'number' },
      { name: 'timing', label: 'Opening Hours', type: 'text', placeholder: 'e.g. 11:00 AM - 10:30 PM' }
    ]
  },
  {
    id: 'workers',
    label: 'Workers & Service Providers',
    icon: <Wrench className="w-4 h-4" />,
    dbName: 'workers',
    fields: [
      { name: 'name', label: 'Worker Name', type: 'text', required: true },
      {
        name: 'profession',
        label: 'Profession',
        type: 'select',
        options: [
          'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Mason', 'Driver',
          'Toto / Auto Driver', 'Home Tutor', 'Domestic Help', 'Appliance Repair',
          'Gardener', 'AC Repair', 'Mechanic', 'Cook', 'Other'
        ],
        required: true
      },
      { name: 'phone', label: 'Contact Phone', type: 'text', required: true },
      { name: 'locality', label: 'Locality / Service Area', type: 'text', required: true },
      { name: 'experienceYears', label: 'Experience (Years)', type: 'number' },
      { name: 'timing', label: 'Availability / Timings', type: 'text', placeholder: 'e.g. Available Now / 9 AM - 7 PM' },
      { name: 'skills', label: 'Special Skills (comma-separated)', type: 'text' },
      { name: 'description', label: 'About Experience', type: 'textarea', required: true }
    ]
  },
  {
    id: 'doctors',
    label: 'Doctors & Healthcare',
    icon: <PlusSquare className="w-4 h-4 text-rose-500" />,
    dbName: 'doctors',
    fields: [
      { name: 'name', label: 'Doctor Name (with prefix)', type: 'text', required: true, placeholder: 'e.g. Dr. A.K. Roy' },
      {
        name: 'specialty',
        label: 'Specialization',
        type: 'select',
        options: [
          'General Physician', 'Pediatrician', 'Cardiologist', 'Gynecologist',
          'Orthopedic', 'Dermatologist', 'Dentist', 'ENT Specialist', 'Ophthalmologist', 'Other Specialist'
        ],
        required: true
      },
      { name: 'clinicName', label: 'Clinic / Hospital Name', type: 'text', placeholder: 'e.g. Jalpaiguri Healing Touch Clinic' },
      { name: 'qualifications', label: 'Qualifications', type: 'text', placeholder: 'e.g. MBBS, MD' },
      { name: 'phone', label: 'Booking / Contact Phone', type: 'text', required: true },
      { name: 'locality', label: 'Locality', type: 'text', required: true },
      { name: 'address', label: 'Clinic Address', type: 'textarea' },
      { name: 'timing', label: 'Chamber Timing', type: 'text', placeholder: 'e.g. Mon-Sat 4 PM - 8 PM' },
      { name: 'fees', label: 'Consultation Fee (INR)', type: 'number' },
      { name: 'description', label: 'Doctor Profile / Bio', type: 'textarea' }
    ]
  },
  {
    id: 'hospitals',
    label: 'Hospitals & Clinics',
    icon: <PlusSquare className="w-4 h-4 text-emerald-600" />,
    dbName: 'hospitals',
    fields: [
      { name: 'name', label: 'Hospital / Facility Name', type: 'text', required: true },
      { name: 'category', label: 'Facility Type', type: 'select', options: ['Government Hospital', 'Private Hospital', 'Nursing Home', 'Diagnostic Centre', '24x7 Pharmacy'], required: true },
      { name: 'phone', label: 'Emergency / Desk Phone', type: 'text', required: true },
      { name: 'locality', label: 'Locality', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'description', label: 'Facilities & Departments', type: 'textarea' }
    ]
  },
  {
    id: 'transports',
    label: 'Transport Schedules',
    icon: <ArrowRightLeft className="w-4 h-4 text-cyan-600" />,
    dbName: 'transports',
    fields: [
      { name: 'routeName', label: 'Route / Train Name', type: 'text', required: true, placeholder: 'e.g. Jalpaiguri to Siliguri Express' },
      { name: 'type', label: 'Transport Type', type: 'select', options: ['Bus', 'Mini Bus', 'Train', 'Toto / Auto', 'Shared Taxi'], required: true },
      { name: 'operator', label: 'Operator / Agency', type: 'text', placeholder: 'e.g. NBSTC, Indian Railways, Private' },
      { name: 'origin', label: 'Origin Point', type: 'text', required: true, placeholder: 'e.g. Jalpaiguri Town' },
      { name: 'destination', label: 'Destination Point', type: 'text', required: true, placeholder: 'e.g. Siliguri Junction' },
      { name: 'departureTime', label: 'Departure Time', type: 'text', required: true, placeholder: 'e.g. 08:30 AM' },
      { name: 'arrivalTime', label: 'Arrival Time', type: 'text', required: true, placeholder: 'e.g. 10:15 AM' },
      { name: 'fare', label: 'Estimated Fare (INR)', type: 'text', placeholder: 'e.g. ₹50' },
      { name: 'haltMinutes', label: 'Train Halt Minutes (if Rail)', type: 'number' },
      { name: 'stationCode', label: 'Station Code (if Train)', type: 'text' },
      { name: 'stationName', label: 'Boarding Station Name', type: 'text' }
    ]
  },
  {
    id: 'gov_services',
    label: 'Government Portals & Schemes',
    icon: <Users className="w-4 h-4 text-emerald-600" />,
    dbName: 'gov_services',
    fields: [
      { name: 'name', label: 'Service / Scheme Title', type: 'text', required: true },
      {
        name: 'category',
        label: 'Govt Category',
        type: 'select',
        options: [
          'MAIN PORTALS', 'CERTIFICATES', 'LAND & PROPERTY', 'MUNICIPAL SERVICES',
          'RATION & FOOD', 'TRANSPORT', 'UTILITY SERVICES', 'EDUCATION & SCHOLARSHIPS',
          'EMPLOYMENT', 'BUSINESS & TRADE', 'HEALTH & WELFARE', 'AGRICULTURE',
          'COMPLAINTS & GRIEVANCES', 'DEPARTMENT PORTALS', 'GOVERNMENT SCHEMES'
        ],
        required: true
      },
      { name: 'department', label: 'Department / Authority', type: 'text', required: true, placeholder: 'e.g. Dept of Food & Supplies, Govt of WB' },
      { name: 'shortDesc', label: 'Short Description', type: 'textarea', required: true },
      { name: 'portalUrl', label: 'Official Website Link', type: 'text', required: true, placeholder: 'https://...' },
      { name: 'requirements', label: 'Required Documents (comma-separated)', type: 'text', placeholder: 'Aadhaar, Ration Card, Income Certificate' },
      { name: 'stepsToApply', label: 'Steps to Apply (comma-separated)', type: 'text' },
      { name: 'processDays', label: 'Processing Timeline (Days)', type: 'text', placeholder: 'e.g. 15-30 days' }
    ]
  },
  {
    id: 'jobs',
    label: 'Local Jobs Section',
    icon: <Store className="w-4 h-4 text-blue-600" />,
    dbName: 'jobs',
    fields: [
      { name: 'title', label: 'Job Title', type: 'text', required: true, placeholder: 'e.g. Retail Sales Assistant' },
      { name: 'company', label: 'Company / Employer Name', type: 'text', required: true },
      {
        name: 'category',
        label: 'Job Category',
        type: 'select',
        options: [
          'Driver', 'Delivery Partner', 'Retail Sales', 'Office Staff / Clerk',
          'Security Guard', 'Teaching', 'IT / Computer Operator', 'Domestic Support',
          'Accountant', 'Construction / Helper', 'Other'
        ],
        required: true
      },
      { name: 'locality', label: 'Job Location / Locality', type: 'text', required: true },
      { name: 'salary', label: 'Salary Range', type: 'text', required: true, placeholder: 'e.g. ₹10,000 - ₹12,000 / month' },
      { name: 'experience', label: 'Experience Required', type: 'text', placeholder: 'e.g. Freshers welcome or 1+ year' },
      { name: 'phone', label: 'Contact / HR Phone', type: 'text', required: true },
      { name: 'description', label: 'Job Responsibilities & Details', type: 'textarea', required: true }
    ]
  },
  {
    id: 'rentals',
    label: 'Rentals & PG Rooms',
    icon: <Heart className="w-4 h-4 text-pink-500" />,
    dbName: 'rentals',
    fields: [
      { name: 'title', label: 'Rental Title', type: 'text', required: true, placeholder: 'e.g. Single Room PG for Students' },
      { name: 'type', label: 'Rental Type', type: 'select', options: ['Room', 'Flat / Apartment', 'Paying Guest (PG)', 'Commercial Shop', 'Godown / Warehouse'], required: true },
      { name: 'price', label: 'Rent Price (INR / month)', type: 'number', required: true },
      { name: 'locality', label: 'Location / Area', type: 'text', required: true },
      { name: 'pincode', label: 'Pincode', type: 'text' },
      { name: 'phone', label: 'Contact Phone', type: 'text', required: true },
      { name: 'features', label: 'Amenities / Features (comma-separated)', type: 'text', placeholder: 'Wifi, Attached Bath, 24x7 Water, Parking' },
      { name: 'description', label: 'Detailed Description', type: 'textarea', required: true }
    ]
  },
  {
    id: 'local_alerts',
    label: 'Local Alerts & Notices',
    icon: <AlertTriangle className="w-4 h-4" />,
    dbName: 'local_alerts',
    fields: [
      { name: 'title', label: 'Alert Title', type: 'text', required: true, placeholder: 'e.g. Water Logging due to Teesta Discharge' },
      {
        name: 'category',
        label: 'Alert Category',
        type: 'select',
        options: ['Emergency', 'Weather / Rainfall', 'Traffic Diversion', 'Water / Electricity Block', 'Civic Announcement', 'Festival Update'],
        required: true
      },
      { name: 'area', label: 'Affected Area / Locality', type: 'text', required: true },
      { name: 'severity', label: 'Severity Level', type: 'select', options: ['low', 'medium', 'high', 'critical'], required: true },
      { name: 'description', label: 'Detailed Information / Warning', type: 'textarea', required: true },
      { name: 'isOfficial', label: 'Is Official Municipal Notice?', type: 'boolean' }
    ]
  },
  {
    id: 'lost_found',
    label: 'Lost & Found Section',
    icon: <AlertTriangle className="w-4 h-4 text-indigo-500" />,
    dbName: 'lost_found',
    fields: [
      { name: 'title', label: 'Notice Title', type: 'text', required: true, placeholder: 'e.g. Lost Black Leather Wallet' },
      { name: 'type', label: 'Notice Type', type: 'select', options: ['Lost', 'Found'], required: true },
      {
        name: 'itemCategory',
        label: 'Item Type',
        type: 'select',
        options: ['Wallet / Cash', 'Documents / ID Card', 'Mobile Phone / Gadget', 'Bag / Luggage', 'Keys', 'Pet Animal', 'Other Item'],
        required: true
      },
      { name: 'location', label: 'Location Lost / Found', type: 'text', required: true, placeholder: 'e.g. Near Kadamtala Market' },
      { name: 'phone', label: 'Contact Phone', type: 'text', required: true },
      { name: 'description', label: 'Details / Reward / Instructions', type: 'textarea', required: true }
    ]
  },
  {
    id: 'education',
    label: 'Education & Schools',
    icon: <PlusSquare className="w-4 h-4 text-violet-600" />,
    dbName: 'education',
    fields: [
      { name: 'name', label: 'Institution Name', type: 'text', required: true, placeholder: 'e.g. Jalpaiguri Zilla School' },
      { name: 'category', label: 'Institution Category', type: 'select', options: ['School', 'College', 'University', 'Vocational Training', 'Coaching Centre'], required: true },
      { name: 'established', label: 'Established Year', type: 'text', placeholder: 'e.g. 1876' },
      { name: 'phone', label: 'Contact Phone', type: 'text' },
      { name: 'locality', label: 'Locality', type: 'text', required: true },
      { name: 'pincode', label: 'Pincode', type: 'text' },
      { name: 'website', label: 'Website Link', type: 'text' },
      { name: 'courses', label: 'Courses Offered (comma-separated)', type: 'text', placeholder: 'Science, Arts, Commerce, IT' },
      { name: 'overview', label: 'About the Institution', type: 'textarea' }
    ]
  },
  {
    id: 'vehicles',
    label: 'Vehicle Help & Garage',
    icon: <Wrench className="w-4 h-4 text-orange-600" />,
    dbName: 'vehicles',
    fields: [
      { name: 'name', label: 'Garage / Service Name', type: 'text', required: true },
      { name: 'category', label: 'Service Category', type: 'select', options: ['4-Wheeler & Towing', 'Bike & Scooter Specialist', 'Electric Rickshaw Transport', 'Car AC & Wash', 'Other'], required: true },
      { name: 'phone', label: 'Contact Phone', type: 'text', required: true },
      { name: 'locality', label: 'Locality / Area', type: 'text', required: true },
      { name: 'timing', label: 'Operating Timings', type: 'text', placeholder: 'e.g. 24/7 Breakdown or 8 AM - 9 PM' },
      { name: 'description', label: 'About the Service', type: 'textarea' }
    ]
  },
  {
    id: 'animals',
    label: 'Animal & Vet Services',
    icon: <Sparkles className="w-4 h-4 text-purple-600" />,
    dbName: 'animals',
    fields: [
      { name: 'name', label: 'Provider / Clinic Name', type: 'text', required: true, placeholder: 'e.g. Paws & Claws Pet Clinic' },
      { name: 'category', label: 'Service Type', type: 'select', options: ['Veterinary Hospital', 'Private Clinic', 'Animal NGO/Rescue', 'Pet Grooming & Boarding'], required: true },
      { name: 'phone', label: 'Contact Phone', type: 'text', required: true },
      { name: 'locality', label: 'Locality / Area', type: 'text', required: true },
      { name: 'timing', label: 'Chamber Timing', type: 'text', placeholder: 'e.g. 10:00 AM - 8:00 PM' },
      { name: 'address', label: 'Full Clinic Address', type: 'textarea' },
      { name: 'description', label: 'Qualifications / Services Offered', type: 'textarea' }
    ]
  }
];

export const CMSManager: React.FC = () => {
  const { firebaseUser } = useAuth();
  const [selectedMetaId, setSelectedMetaId] = useState<string>('cms_content');
  const [items, setItems] = useState<CMSItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<CMSItem | null>(null);
  const [formFields, setFormFields] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState<string>('');

  // Preview & Delete confirmation modal state
  const [previewItem, setPreviewItem] = useState<CMSItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CMSItem | null>(null);

  // Media states (up to 4 images)
  const [images, setImages] = useState<string[]>(['', '', '', '']);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [thumbnailIndex, setThumbnailIndex] = useState<number>(0);
  const [secondIndex, setSecondIndex] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const activeMeta = useMemo(() => {
    return COLLECTIONS_META.find((m) => m.id === selectedMetaId) || COLLECTIONS_META[0];
  }, [selectedMetaId]);

  // Read Firebase Snapshot in Realtime
  useEffect(() => {
    setLoading(true);
    setItems([]);
    setBanner(null);
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      return;
    }

    try {
      const unsub = onSnapshot(
        collection(db, activeMeta.dbName),
        (snap) => {
          const list: CMSItem[] = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          setItems(list);
          setLoading(false);
        },
        (err) => {
          console.error(`Error loading collection ${activeMeta.dbName}:`, err);
          setBanner({ type: 'error', message: `Failed to load ${activeMeta.label}: ${err.message}` });
          setLoading(false);
        }
      );

      return () => unsub();
    } catch (e: any) {
      setBanner({ type: 'error', message: e?.message || 'Unable to subscribe to collection.' });
      setLoading(false);
    }
  }, [selectedMetaId, activeMeta]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormError('');
    const initialForm: Record<string, any> = {};
    activeMeta.fields.forEach((f) => {
      if (f.type === 'boolean') {
        initialForm[f.name] = activeMeta.dbName === 'local_alerts';
      } else if (f.name === 'pincode') {
        initialForm[f.name] = '735101';
      } else if (f.name === 'lat') {
        initialForm[f.name] = 26.5435;
      } else if (f.name === 'lng') {
        initialForm[f.name] = 88.7196;
      } else {
        initialForm[f.name] = '';
      }
    });
    setFormFields(initialForm);
    setImages(['', '', '', '']);
    setThumbnailIndex(0);
    setSecondIndex(1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CMSItem) => {
    setEditingItem(item);
    setFormError('');
    const initialForm: Record<string, any> = {};
    activeMeta.fields.forEach((f) => {
      const raw = item[f.name];
      if (Array.isArray(raw)) {
        initialForm[f.name] = raw.join(', ');
      } else if (raw !== undefined && raw !== null) {
        initialForm[f.name] = raw;
      } else if (f.name === 'locality' && item.serviceArea) {
        initialForm[f.name] = item.serviceArea;
      } else if (f.name === 'clinicName' && item.clinic) {
        initialForm[f.name] = item.clinic;
      } else if (f.name === 'fees' && item.fee) {
        initialForm[f.name] = item.fee;
      } else {
        initialForm[f.name] = f.type === 'boolean' ? false : '';
      }
    });
    setFormFields(initialForm);

    const existingPhotos: string[] = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : [item.photoUrl || item.avatarUrl || item.primaryPhoto || ''].filter(Boolean);
    const formattedImages = ['', '', '', ''];
    for (let i = 0; i < 4; i++) {
      formattedImages[i] = existingPhotos[i] || '';
    }
    setImages(formattedImages);
    setThumbnailIndex(item.thumbnailIndex !== undefined ? item.thumbnailIndex : 0);
    setSecondIndex(item.secondIndex !== undefined ? item.secondIndex : 1);
    setIsModalOpen(true);
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormFields((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleImageUrlChange = (index: number, url: string) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = url;
      return updated;
    });
  };

  const handleSlotUpload = async (slotIdx: number, file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image must be under 5MB.');
      return;
    }
    setUploadingSlot(slotIdx);
    setFormError('');
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `cms-media/${activeMeta.dbName}/${Date.now()}-${safeName}`;
      const upload = await uploadBytes(ref(storage, path), file, { contentType: file.type });
      const url = await getDownloadURL(upload.ref);
      handleImageUrlChange(slotIdx, url);
    } catch (err: any) {
      setFormError(err?.message || 'Firebase Storage upload failed. You can also paste an image URL.');
    } finally {
      setUploadingSlot(null);
    }
  };

  const normalizeItemStatus = (item: CMSItem): string => {
    const raw = String(item.status || 'Published');
    if (/^(published|verified|approved|active)$/i.test(raw)) return 'Published';
    if (/^(draft|pending)$/i.test(raw)) return 'Draft';
    if (/^(archived|rejected|suspended)$/i.test(raw)) return 'Archived';
    return raw;
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!isFirebaseConfigured || !db) {
      setFormError('Firebase connection is offline.');
      return;
    }

    const missingRequired = activeMeta.fields.filter(
      (f) => f.required && (formFields[f.name] === undefined || formFields[f.name] === null || String(formFields[f.name]).trim() === '')
    );
    if (missingRequired.length > 0) {
      setFormError(`Please fill required fields: ${missingRequired.map((f) => f.label).join(', ')}`);
      return;
    }

    setIsSaving(true);
    try {
      const finalImages = images.map((u) => u.trim()).filter(Boolean);
      const primaryPhoto = finalImages[thumbnailIndex] || finalImages[0] || '';
      const uid = firebaseUser?.uid || 'admin';

      const payload: Record<string, any> = {
        ...formFields,
        images: finalImages,
        thumbnailIndex,
        secondIndex,
        updatedAt: serverTimestamp()
      };

      // Clean number fields so empty strings don't become NaN
      activeMeta.fields.forEach((f) => {
        if (f.type === 'number' && (payload[f.name] === '' || Number.isNaN(Number(payload[f.name])))) {
          delete payload[f.name];
        }
      });

      // Collection-specific schema compliance for Firestore security rules
      if (activeMeta.dbName === 'shops' || activeMeta.dbName === 'restaurants') {
        payload.ownerId = editingItem?.ownerId || uid;
        payload.lat = Number(payload.lat) || 26.5435;
        payload.lng = Number(payload.lng) || 88.7196;
        payload.pincode = String(payload.pincode || '735101');
        payload.address = String(payload.address || payload.locality || 'Jalpaiguri');
        if (primaryPhoto) payload.photoUrl = primaryPhoto;
        if (!editingItem) {
          payload.isVerified = true;
          payload.status = 'verified';
          payload.rating = Number(payload.rating) || 4.8;
          payload.reviewCount = 0;
        }
      } else if (activeMeta.dbName === 'workers') {
        payload.userId = editingItem?.userId || uid;
        payload.category = payload.profession || 'Other';
        payload.serviceArea = payload.locality || 'Jalpaiguri';
        payload.availability = payload.timing || 'Available Now';
        payload.verified = editingItem ? editingItem.verified ?? true : true;
        payload.isVerified = payload.verified;
        if (typeof payload.skills === 'string') {
          payload.skills = payload.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        if (primaryPhoto) payload.avatarUrl = primaryPhoto;
      } else if (activeMeta.dbName === 'doctors') {
        payload.clinic = payload.clinicName || payload.clinic || '';
        payload.fee = payload.fees ? `₹${payload.fees}` : (editingItem?.fee || '');
        payload.verified = editingItem ? editingItem.verified ?? true : true;
        payload.verificationStatus = payload.verified ? 'Verified' : 'Pending';
        payload.isVerified = payload.verified;
        if (primaryPhoto) payload.avatarUrl = primaryPhoto;
      } else if (activeMeta.dbName === 'local_alerts') {
        payload.userId = editingItem?.userId || uid;
        payload.lat = Number(payload.lat) || 26.5435;
        payload.lng = Number(payload.lng) || 88.7196;
        payload.deliveryStatus = 'Published';
        if (!editingItem) {
          payload.createdAt = new Date().toISOString();
          payload.confirmedCount = 0;
          payload.timeAgo = 'Just now';
        }
      }

      if (payload.isVerified === undefined) payload.isVerified = true;
      if (!payload.status && !editingItem) payload.status = 'Published';
      if (payload.featured === undefined) payload.featured = false;

      const labelTitle = payload.name || payload.title || payload.routeName || 'Record';

      if (editingItem) {
        const docRef = doc(db, activeMeta.dbName, editingItem.id);
        await updateDoc(docRef, payload);
        await logAdminAction({
          action: 'CMS Update',
          section: 'CMS',
          targetCollection: activeMeta.dbName,
          targetId: editingItem.id,
          summary: `Updated "${labelTitle}" in ${activeMeta.label}`
        });
        setBanner({ type: 'success', message: `Updated "${labelTitle}" in ${activeMeta.label}.` });
      } else {
        const newId = `${activeMeta.dbName}-${Date.now()}`;
        payload.id = newId;
        if (!payload.createdAt) {
          payload.createdAt = new Date().toISOString();
        }
        await setDoc(doc(db, activeMeta.dbName, newId), payload);
        await logAdminAction({
          action: 'CMS Create',
          section: 'CMS',
          targetCollection: activeMeta.dbName,
          targetId: newId,
          summary: `Created "${labelTitle}" in ${activeMeta.label}`
        });
        setBanner({ type: 'success', message: `Published "${labelTitle}" to ${activeMeta.label}.` });
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      console.error('Error saving content document:', error);
      setFormError(error?.message || 'An error occurred while saving the listing.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (item: CMSItem) => {
    if (!isFirebaseConfigured || !db) return;
    const isShopLike = activeMeta.dbName === 'shops' || activeMeta.dbName === 'restaurants';
    const currentNorm = normalizeItemStatus(item);
    const nextNorm = currentNorm === 'Published' ? 'Draft' : currentNorm === 'Draft' ? 'Archived' : 'Published';
    const nextValue = isShopLike
      ? nextNorm === 'Published' ? 'verified' : nextNorm === 'Draft' ? 'pending' : 'suspended'
      : nextNorm;

    try {
      await updateDoc(doc(db, activeMeta.dbName, item.id), {
        status: nextValue,
        updatedAt: serverTimestamp()
      });
      await logAdminAction({
        action: 'CMS Status Toggle',
        section: 'CMS',
        targetCollection: activeMeta.dbName,
        targetId: item.id,
        summary: `Changed status of ${item.name || item.title || item.id} to ${nextValue}`
      });
      setBanner({ type: 'success', message: `Status updated to ${nextValue}.` });
    } catch (e: any) {
      setBanner({ type: 'error', message: `Status update failed: ${e?.message || 'Permission denied'}` });
    }
  };

  const handleToggleVerified = async (item: CMSItem) => {
    if (!isFirebaseConfigured || !db) return;
    const nextVerified = !(item.isVerified ?? item.verified ?? false);
    const patch: Record<string, any> = { isVerified: nextVerified, updatedAt: serverTimestamp() };
    if (activeMeta.dbName === 'workers' || activeMeta.dbName === 'doctors') {
      patch.verified = nextVerified;
    }
    if (activeMeta.dbName === 'doctors') {
      patch.verificationStatus = nextVerified ? 'Verified' : 'Pending';
    }
    try {
      await updateDoc(doc(db, activeMeta.dbName, item.id), patch);
      setBanner({ type: 'success', message: nextVerified ? 'Marked as Verified.' : 'Marked as Pending review.' });
    } catch (e: any) {
      setBanner({ type: 'error', message: `Verification update failed: ${e?.message || 'Permission denied'}` });
    }
  };

  const handleToggleFeatured = async (item: CMSItem) => {
    if (!isFirebaseConfigured || !db) return;
    const nextFeatured = !item.featured;
    try {
      await updateDoc(doc(db, activeMeta.dbName, item.id), {
        featured: nextFeatured,
        updatedAt: serverTimestamp()
      });
    } catch (e: any) {
      setBanner({ type: 'error', message: `Featured toggle failed: ${e?.message || 'Permission denied'}` });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !isFirebaseConfigured || !db) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteDoc(doc(db, activeMeta.dbName, target.id));
      await logAdminAction({
        action: 'CMS Delete',
        section: 'CMS',
        targetCollection: activeMeta.dbName,
        targetId: target.id,
        summary: `Deleted "${target.name || target.title || target.id}" from ${activeMeta.label}`
      });
      setBanner({ type: 'success', message: `Deleted "${target.name || target.title || target.id}".` });
    } catch (e: any) {
      setBanner({ type: 'error', message: `Delete failed: ${e?.message || 'Permission denied'}` });
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== 'All') {
        if (normalizeItemStatus(item) !== statusFilter) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mainTitle = (item.name || item.title || item.routeName || '').toLowerCase();
        const category = (item.category || item.contentType || item.profession || item.specialty || '').toLowerCase();
        const desc = (item.description || item.shortDesc || item.overview || '').toLowerCase();
        const loc = (item.locality || item.area || item.serviceArea || '').toLowerCase();
        const contact = (item.phone || '').toLowerCase();

        return (
          mainTitle.includes(q) ||
          category.includes(q) ||
          desc.includes(q) ||
          loc.includes(q) ||
          contact.includes(q)
        );
      }

      return true;
    });
  }, [items, searchQuery, statusFilter]);

  return (
    <div className="w-full bg-[#FAF8F5] text-gray-900 space-y-4">
      {banner && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs font-semibold ${
            banner.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{banner.message}</span>
          </div>
          <button onClick={() => setBanner(null)} className="p-1 hover:opacity-70 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: CMS Category Navigation Bar */}
        <div className="bg-white rounded-3xl border border-[#E8E4DA] p-4 shadow-xs space-y-1">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider px-3.5 mb-3">
            CMS Collections
          </h3>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {COLLECTIONS_META.map((meta) => {
              const isSelected = selectedMetaId === meta.id;
              return (
                <button
                  key={meta.id}
                  type="button"
                  onClick={() => setSelectedMetaId(meta.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-[#007AFF] border-l-4 border-[#007AFF] pl-2.5'
                      : 'text-gray-600 hover:bg-[#FAF8F5] hover:text-[#11241C]'
                  }`}
                >
                  <span className={isSelected ? 'text-[#007AFF]' : 'text-gray-500'}>
                    {meta.icon}
                  </span>
                  <span className="truncate">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Primary Content List & Action Control Bar */}
        <div className="lg:col-span-3 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#11241C] flex items-center gap-2 flex-wrap">
                <span>{activeMeta.label}</span>
                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                  {filteredItems.length} records
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Live Firestore collection: <code className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-mono">{activeMeta.dbName}</code>
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold text-xs hover:bg-blue-700 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Listing</span>
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-3xl border border-[#E8E4DA] shadow-xs">
            <div className="flex-1 bg-[#FAF8F5] border border-[#D2CEBE] rounded-full px-4 py-2 flex items-center gap-2.5">
              <Search className="w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder={`Search ${activeMeta.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 focus:outline-none bg-transparent placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500 font-bold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#D2CEBE] text-xs font-bold bg-white text-gray-700"
              >
                <option value="All">All Status</option>
                <option value="Published">Published / Verified</option>
                <option value="Draft">Draft / Pending</option>
                <option value="Archived">Archived / Rejected</option>
              </select>
            </div>
          </div>

          {/* Items Table Display */}
          <div className="bg-white rounded-3xl border border-[#E8E4DA] shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-500 text-xs">
                <Loader2 className="w-8 h-8 animate-spin text-[#007AFF]" />
                <span className="font-bold">Syncing live Firestore collection...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-16 text-center text-gray-500 text-xs">
                No records found in {activeMeta.label}. Click &ldquo;+ Add New Listing&rdquo; to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-[#FAF8F5] border-b border-[#F0ECE1] text-[#55685F] font-bold">
                    <tr>
                      <th className="py-3 px-4">Title / Name</th>
                      <th className="py-3 px-4">Contact & Locality</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0ECE1]">
                    {filteredItems.map((item) => {
                      const itemTitle = item.name || item.title || item.routeName || 'Untitled';
                      const itemLocality = item.locality || item.area || item.serviceArea || item.origin || 'Jalpaiguri';
                      const itemContact = item.phone || item.department || item.publishedAt || '—';
                      const itemStatus = normalizeItemStatus(item);
                      const isVerified = item.isVerified ?? item.verified ?? false;
                      const primaryThumb =
                        (Array.isArray(item.images) && item.images.length > 0
                          ? item.images[item.thumbnailIndex ?? 0] || item.images[0]
                          : '') ||
                        item.photoUrl ||
                        item.avatarUrl;

                      return (
                        <tr key={item.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {primaryThumb ? (
                                <img
                                  src={primaryThumb}
                                  alt={itemTitle}
                                  className="w-10 h-8 object-cover rounded-lg border border-gray-200 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                  <Camera className="w-4 h-4" />
                                </div>
                              )}
                              <div className="max-w-[200px] truncate">
                                <span className="font-bold text-[#11241C] block truncate">{itemTitle}</span>
                                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {item.contentType || item.category || item.profession || item.specialty || activeMeta.label}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-700 block">{itemLocality}</span>
                            <span className="text-[10px] text-gray-500 block font-mono">{itemContact}</span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => void handleToggleStatus(item)}
                              title="Click to cycle status"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer hover:opacity-90 ${
                                itemStatus === 'Published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : itemStatus === 'Draft'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              <span>{item.status || itemStatus}</span>
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => void handleToggleVerified(item)}
                              title="Toggle Verification"
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors ${
                                isVerified
                                  ? 'bg-blue-100 text-[#007AFF] hover:bg-blue-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                            >
                              {isVerified ? 'Verified' : 'Pending'}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => void handleToggleFeatured(item)}
                              title="Toggle Featured Spot"
                              className={`p-1.5 rounded-lg cursor-pointer ${
                                item.featured
                                  ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPreviewItem(item)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                                title="Preview listing"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 cursor-pointer"
                                title="Edit listing detail"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 cursor-pointer"
                                title="Delete listing permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <header className="px-6 py-4 border-b border-[#F0ECE1] flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <h3 className="text-base font-extrabold text-[#11241C]">
                  {previewItem.name || previewItem.title || previewItem.routeName || 'Listing Preview'}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {activeMeta.label} · ID: <span className="font-mono">{previewItem.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-6 space-y-4">
              {Array.isArray(previewItem.images) && previewItem.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {previewItem.images.map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-xl border border-gray-200"
                    />
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {activeMeta.fields.map((f) => {
                  const val = previewItem[f.name];
                  const displayVal = Array.isArray(val) ? val.join(', ') : val === true ? 'Yes' : val === false ? 'No' : String(val || '—');
                  return (
                    <div key={f.name} className={`p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DA] ${f.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                      <span className="block text-[10px] font-bold uppercase text-gray-400">{f.label}</span>
                      <span className="mt-1 block font-semibold text-[#11241C] whitespace-pre-wrap">{displayVal}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = previewItem;
                    setPreviewItem(null);
                    handleOpenEdit(target);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-bold cursor-pointer"
                >
                  Edit This Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-200 space-y-4">
            <h3 className="text-base font-extrabold text-[#11241C]">Confirm Permanent Deletion</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong>{deleteTarget.name || deleteTarget.title || deleteTarget.routeName || deleteTarget.id}</strong> from{' '}
              <span className="font-mono">{activeMeta.dbName}</span>? This cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <header className="px-6 py-5 border-b border-[#F0ECE1] flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <h3 className="text-lg font-extrabold text-[#11241C]">
                  {editingItem ? 'Edit Listing Detail' : `Add New ${activeMeta.label}`}
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Collection Target: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{activeMeta.dbName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleSaveItem} className="p-6 space-y-6">
              {formError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* Core Attributes Panel */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide border-b pb-1">
                  1. Core Attributes & Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeMeta.fields.map((f) => (
                    <div key={f.name} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        {f.label} {f.required && <span className="text-red-500">*</span>}
                      </label>

                      {f.type === 'textarea' ? (
                        <textarea
                          required={f.required}
                          value={formFields[f.name] || ''}
                          onChange={(e) => handleFieldChange(f.name, e.target.value)}
                          placeholder={f.placeholder}
                          rows={3}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#D2CEBE] text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                        />
                      ) : f.type === 'select' ? (
                        <select
                          required={f.required}
                          value={formFields[f.name] || ''}
                          onChange={(e) => handleFieldChange(f.name, e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D2CEBE] text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                        >
                          <option value="">Select Option</option>
                          {f.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : f.type === 'boolean' ? (
                        <div className="flex items-center gap-3 py-2">
                          <input
                            type="checkbox"
                            checked={!!formFields[f.name]}
                            onChange={(e) => handleFieldChange(f.name, e.target.checked)}
                            className="w-4 h-4 rounded text-[#007AFF] border-gray-300 focus:ring-[#007AFF]"
                          />
                          <span className="text-xs text-gray-700 font-bold">{f.label}</span>
                        </div>
                      ) : (
                        <input
                          type={f.type === 'number' ? 'number' : 'text'}
                          required={f.required}
                          value={formFields[f.name] ?? ''}
                          onChange={(e) =>
                            handleFieldChange(
                              f.name,
                              f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
                            )
                          }
                          placeholder={f.placeholder}
                          step={f.type === 'number' ? 'any' : undefined}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D2CEBE] text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Media Manager: 4 Slots & Storage Upload */}
              <div className="space-y-4 pt-2">
                <div className="border-b pb-1 flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                    2. Dynamic Image Gallery (Max 4 Photos)
                  </h4>
                  <span className="text-[10px] text-gray-500 font-medium">Upload from device or paste photo URLs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const url = images[slotIdx];
                    return (
                      <div key={slotIdx} className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DA] flex flex-col justify-between gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-gray-500 uppercase">Slot {slotIdx + 1}</span>
                          {url && (
                            <button
                              type="button"
                              onClick={() => handleImageUrlChange(slotIdx, '')}
                              className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        <div className="aspect-video rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                          {url ? (
                            <img src={url} alt={`Slot ${slotIdx + 1}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-2 text-gray-400">
                              <Camera className="w-5 h-5 mx-auto mb-1 text-gray-300" />
                              <span className="text-[9px]">Empty Slot</span>
                            </div>
                          )}
                        </div>

                        <input
                          type="url"
                          placeholder="Paste image URL..."
                          value={url}
                          onChange={(e) => handleImageUrlChange(slotIdx, e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white border border-[#D2CEBE] text-[10px] focus:outline-none"
                        />

                        <label className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-50 text-[#007AFF] text-[10px] font-bold cursor-pointer hover:bg-blue-100">
                          {uploadingSlot === slotIdx ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3" />
                          )}
                          <span>{uploadingSlot === slotIdx ? 'Uploading...' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => void handleSlotUpload(slotIdx, e.target.files?.[0])}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>

                {/* Priority / Thumbnail Setup */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#E6F4EA]/40 border border-[#C8EADB]">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Primary Thumbnail Photo
                    </label>
                    <select
                      value={thumbnailIndex}
                      onChange={(e) => setThumbnailIndex(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D2CEBE] text-xs font-bold text-gray-700"
                    >
                      <option value={0}>Slot 1 (Highest Priority)</option>
                      <option value={1}>Slot 2</option>
                      <option value={2}>Slot 3</option>
                      <option value={3}>Slot 4</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Secondary Priority Photo
                    </label>
                    <select
                      value={secondIndex}
                      onChange={(e) => setSecondIndex(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#D2CEBE] text-xs font-bold text-gray-700"
                    >
                      <option value={0}>Slot 1</option>
                      <option value={1}>Slot 2 (Recommended 2nd)</option>
                      <option value={2}>Slot 3</option>
                      <option value={3}>Slot 4</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <footer className="pt-4 border-t border-[#F0ECE1] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#007AFF] hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? 'Update Listing' : 'Publish Listing'}</span>
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
