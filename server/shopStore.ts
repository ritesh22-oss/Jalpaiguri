import crypto from 'crypto';
import { apiKeyService } from './apiKeyService';

export interface ServerShop {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  whatsappNumber?: string;
  name: string;
  nameBn?: string;
  category: string;
  categories: string[];
  description: string;
  locality: string;
  address: string;
  landmark?: string;
  pincode: string;
  lat: number;
  lng: number;
  openingTime: string;
  closingTime: string;
  weeklyOff?: string;
  homeDelivery: boolean;
  minOrderAmount?: number;
  deliveryRadiusKm?: number;
  paymentMethods: string[];
  photoUrl?: string;
  insidePhotoUrl?: string;
  logoUrl?: string;
  isVerified: boolean;
  status: 'pending' | 'verified' | 'rejected' | 'suspended';
  featured: boolean;
  isOpen: boolean;
  rating: number;
  reviewCount: number;
  subscriptionPlan: 'free' | 'monthly' | 'yearly';
  subscriptionExpiresAt?: string;
  qrCodeDeepLink: string;
  totalViews: number;
  inquiryClicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServerProduct {
  id: string;
  shopId: string;
  ownerId: string;
  name: string;
  nameBn?: string;
  category: string;
  price: number;
  discountPrice?: number;
  unit: string;
  inStock: boolean;
  photoUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerShopInquiry {
  id: string;
  shopId: string;
  type: 'call' | 'whatsapp' | 'directions' | 'share';
  timestamp: string;
}

export const JALPAIGURI_VALID_PINS = [
  '735101', '735102', '735103', '735121', '735122', '735123',
  '735133', '735134', '735135', '735204', '735209', '735210',
  '735219', '735224', '735225', '735226', '735228'
];

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Initial Verified Jalpaiguri Shops
const initialShops: ServerShop[] = [
  {
    id: 'shop-sen-sweets',
    ownerId: 'owner-sen-1',
    ownerName: 'Alok Sen',
    ownerPhone: '+91 98320 11094',
    ownerEmail: 'sensweets.jpg@gmail.com',
    whatsappNumber: '+91 98320 11094',
    name: 'Sen Sweets & Confectioners',
    nameBn: 'সেন সুইটস ও মিষ্টি ভান্ডার',
    category: 'Bakery & Sweets',
    categories: ['Bakery & Sweets', 'Dairy', 'Snacks'],
    description: 'Serving legendary Jalpaiguri Jolbhora Sandesh, hot Chhanar Payesh, and fresh morning sweets since 1978.',
    locality: 'Kadamtala',
    address: 'Kadamtala Rail Crossing More, Jalpaiguri',
    landmark: 'Near Kadamtala Railway Crossing Gate',
    pincode: '735101',
    lat: 26.5312,
    lng: 88.7291,
    openingTime: '07:30 AM',
    closingTime: '10:00 PM',
    weeklyOff: 'None',
    homeDelivery: true,
    minOrderAmount: 200,
    deliveryRadiusKm: 5,
    paymentMethods: ['Cash', 'UPI', 'Card'],
    photoUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=600&auto=format&fit=crop&q=80',
    insidePhotoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    status: 'verified',
    featured: true,
    isOpen: true,
    rating: 4.9,
    reviewCount: 148,
    subscriptionPlan: 'yearly',
    subscriptionExpiresAt: new Date(Date.now() + 300 * 86400000).toISOString(),
    qrCodeDeepLink: 'jalpaiguri-connect://shop/shop-sen-sweets',
    totalViews: 1240,
    inquiryClicks: 184,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'shop-north-bengal-books',
    ownerId: 'owner-roy-books',
    ownerName: 'Subhasish Roy',
    ownerPhone: '+91 94340 44921',
    ownerEmail: 'nbbooks.jalpaiguri@gmail.com',
    whatsappNumber: '+91 94340 44921',
    name: 'North Bengal Book Store',
    nameBn: 'নর্থ বেঙ্গল বুক স্টোর',
    category: 'Books & Stationery',
    categories: ['Books & Stationery', 'School & College', 'Office Supplies'],
    description: 'All West Bengal Board, CBSE, ICSE textbooks, college guides, art supplies, and high school reference materials.',
    locality: 'Silpasamiti Para',
    address: 'Silpasamiti Para Main Road, Jalpaiguri',
    landmark: 'Opposite Town Club Ground',
    pincode: '735101',
    lat: 26.5255,
    lng: 88.7210,
    openingTime: '09:00 AM',
    closingTime: '08:30 PM',
    weeklyOff: 'Sunday (Half Day)',
    homeDelivery: true,
    minOrderAmount: 150,
    deliveryRadiusKm: 6,
    paymentMethods: ['Cash', 'UPI'],
    photoUrl: 'https://images.unsplash.com/photo-1507842229451-79b1be88688e?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    status: 'verified',
    featured: true,
    isOpen: true,
    rating: 4.7,
    reviewCount: 92,
    subscriptionPlan: 'monthly',
    subscriptionExpiresAt: new Date(Date.now() + 20 * 86400000).toISOString(),
    qrCodeDeepLink: 'jalpaiguri-connect://shop/shop-north-bengal-books',
    totalViews: 940,
    inquiryClicks: 110,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'shop-mediplus-pharmacy',
    ownerId: 'owner-dr-guha',
    ownerName: 'Sandip Guha',
    ownerPhone: '+91 98320 33410',
    ownerEmail: 'mediplus.dbc@gmail.com',
    whatsappNumber: '+91 98320 33410',
    name: 'Jalpaiguri MediPlus Pharmacy',
    nameBn: 'জলপাইগুড়ি মেডিপ্লাস ফার্মেসি',
    category: 'Pharmacy',
    categories: ['Pharmacy', 'Healthcare', 'Baby Care'],
    description: '24x7 emergency medicines, genuine prescription drugs, surgical items, insulin storage, and baby care essentials.',
    locality: 'DBC Road',
    address: 'Hospital More, DBC Road, Jalpaiguri',
    landmark: 'Near Jalpaiguri District Sadar Hospital',
    pincode: '735101',
    lat: 26.5385,
    lng: 88.7245,
    openingTime: '12:00 AM',
    closingTime: '11:59 PM',
    weeklyOff: 'None (24x7 Open)',
    homeDelivery: true,
    minOrderAmount: 100,
    deliveryRadiusKm: 8,
    paymentMethods: ['Cash', 'UPI', 'Card'],
    photoUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    status: 'verified',
    featured: true,
    isOpen: true,
    rating: 4.9,
    reviewCount: 224,
    subscriptionPlan: 'yearly',
    subscriptionExpiresAt: new Date(Date.now() + 280 * 86400000).toISOString(),
    qrCodeDeepLink: 'jalpaiguri-connect://shop/shop-mediplus-pharmacy',
    totalViews: 2150,
    inquiryClicks: 412,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'shop-tara-maa-grocery',
    ownerId: 'owner-debnath',
    ownerName: 'Partha Debnath',
    ownerPhone: '+91 94342 88129',
    ownerEmail: 'taramaa.grocery@gmail.com',
    whatsappNumber: '+91 94342 88129',
    name: 'Tara Maa Grocery & Ration Store',
    nameBn: 'তারা মা ভ্যারাইটি স্টোর ও রেশন সামগ্রী',
    category: 'Grocery',
    categories: ['Grocery', 'Dairy', 'Personal Care', 'Spices'],
    description: 'Daily fresh groceries, premium Tulaipanji & Miniket rice, Fortune oils, Aashirvaad Atta, and Bengali spices at wholesale rates.',
    locality: 'Hakimpara',
    address: 'Hakimpara Club More, Jalpaiguri',
    landmark: 'Near Hakimpara Durga Mandir',
    pincode: '735101',
    lat: 26.5218,
    lng: 88.7180,
    openingTime: '08:00 AM',
    closingTime: '09:30 PM',
    weeklyOff: 'None',
    homeDelivery: true,
    minOrderAmount: 300,
    deliveryRadiusKm: 4,
    paymentMethods: ['Cash', 'UPI'],
    photoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    status: 'verified',
    featured: true,
    isOpen: true,
    rating: 4.8,
    reviewCount: 168,
    subscriptionPlan: 'monthly',
    subscriptionExpiresAt: new Date(Date.now() + 15 * 86400000).toISOString(),
    qrCodeDeepLink: 'jalpaiguri-connect://shop/shop-tara-maa-grocery',
    totalViews: 1480,
    inquiryClicks: 195,
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'shop-roy-hardware',
    ownerId: 'owner-roy-hardware',
    ownerName: 'Manish Roy',
    ownerPhone: '+91 98320 88219',
    whatsappNumber: '+91 98320 88219',
    name: 'Roy Hardware & Electricals',
    nameBn: 'রায় হার্ডওয়্যার ও ইলেকট্রিক্যালস',
    category: 'Hardware',
    categories: ['Hardware', 'Electricals', 'Paints & Tools'],
    description: 'Genuine electrical fittings, wires, LED tubes, plumbing PVC fixtures, Asian Paints, and house construction tools.',
    locality: 'Dinbazar',
    address: 'Dinbazar Wholesale Market, Jalpaiguri',
    landmark: 'Behind Dinbazar Post Office',
    pincode: '735101',
    lat: 26.5410,
    lng: 88.7320,
    openingTime: '08:30 AM',
    closingTime: '09:00 PM',
    weeklyOff: 'Thursday',
    homeDelivery: true,
    minOrderAmount: 500,
    deliveryRadiusKm: 6,
    paymentMethods: ['Cash', 'UPI', 'Card'],
    photoUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    status: 'verified',
    featured: false,
    isOpen: true,
    rating: 4.8,
    reviewCount: 98,
    subscriptionPlan: 'free',
    qrCodeDeepLink: 'jalpaiguri-connect://shop/shop-roy-hardware',
    totalViews: 820,
    inquiryClicks: 84,
    createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'shop-ghosh-dairy',
    ownerId: 'owner-ghosh-dairy',
    ownerName: 'Niranjan Ghosh',
    ownerPhone: '+91 94341 77201',
    whatsappNumber: '+91 94341 77201',
    name: 'Ghosh Dairy Farm & Sweet Hub',
    nameBn: 'ঘোষ ডেয়ারি ও মিষ্টান্ন ভান্ডার',
    category: 'Dairy',
    categories: ['Dairy', 'Bakery & Sweets', 'Fresh Food'],
    description: 'Farm fresh pure cow milk, homemade desi gawa ghee, malai paneer, and authentic Bengali sweet curd.',
    locality: 'Mohitnagar',
    address: 'Mohitnagar More, Jalpaiguri',
    landmark: 'Near Mohitnagar Primary School',
    pincode: '735102',
    lat: 26.5460,
    lng: 88.7480,
    openingTime: '06:00 AM',
    closingTime: '08:30 PM',
    weeklyOff: 'None',
    homeDelivery: true,
    minOrderAmount: 150,
    deliveryRadiusKm: 5,
    paymentMethods: ['Cash', 'UPI'],
    photoUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    status: 'verified',
    featured: true,
    isOpen: true,
    rating: 4.9,
    reviewCount: 120,
    subscriptionPlan: 'monthly',
    subscriptionExpiresAt: new Date(Date.now() + 18 * 86400000).toISOString(),
    qrCodeDeepLink: 'jalpaiguri-connect://shop/shop-ghosh-dairy',
    totalViews: 1110,
    inquiryClicks: 145,
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'shop-paul-bastralaya',
    ownerId: 'owner-paul-cloth',
    ownerName: 'Bikash Paul',
    ownerPhone: '+91 98320 55102',
    whatsappNumber: '+91 98320 55102',
    name: 'Paul Bastralaya & Saree Emporium',
    nameBn: 'পাল বস্ত্রালয় ও শাড়ি কেন্দ্র',
    category: 'Clothing',
    categories: ['Clothing', 'Traditional Wear', 'Kids Wear'],
    description: 'Handloom Cotton Sarees, Tangail, Jamdani, Dhakai, Kurtas, Shirting, and Puja festival specials for family.',
    locality: 'Dinbazar',
    address: 'Dinbazar Cloth Lane, Jalpaiguri',
    landmark: 'Opposite State Bank ATM',
    pincode: '735101',
    lat: 26.5395,
    lng: 88.7305,
    openingTime: '10:00 AM',
    closingTime: '09:00 PM',
    weeklyOff: 'Thursday',
    homeDelivery: false,
    paymentMethods: ['Cash', 'UPI', 'Card'],
    photoUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    status: 'verified',
    featured: false,
    isOpen: true,
    rating: 4.6,
    reviewCount: 79,
    subscriptionPlan: 'free',
    qrCodeDeepLink: 'jalpaiguri-connect://shop/shop-paul-bastralaya',
    totalViews: 650,
    inquiryClicks: 52,
    createdAt: new Date(Date.now() - 55 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'shop-maa-tara-fish',
    ownerId: 'owner-bapi-fish',
    ownerName: 'Bapi Barman',
    ownerPhone: '+91 97330 44190',
    whatsappNumber: '+91 97330 44190',
    name: 'Maa Tara Fresh River Fish & Poultry',
    nameBn: 'মা তারা দেশি নদীর মাছ ও পল্ট্রি',
    category: 'Fresh Meat & Fish',
    categories: ['Fresh Meat & Fish', 'Fresh Food'],
    description: 'Fresh morning Teesta River Boroli fish, live Katla, Rui, Desi Tangra, country chicken, and clean packaged cuts.',
    locality: 'Dinbazar',
    address: 'Dinbazar Fish Shed No. 4, Jalpaiguri',
    landmark: 'Dinbazar Morning Fresh Fish Market',
    pincode: '735101',
    lat: 26.5422,
    lng: 88.7335,
    openingTime: '06:30 AM',
    closingTime: '01:30 PM',
    weeklyOff: 'None',
    homeDelivery: true,
    minOrderAmount: 400,
    deliveryRadiusKm: 5,
    paymentMethods: ['Cash', 'UPI'],
    photoUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&auto=format&fit=crop&q=80',
    isVerified: true,
    status: 'verified',
    featured: true,
    isOpen: true,
    rating: 4.8,
    reviewCount: 94,
    subscriptionPlan: 'monthly',
    subscriptionExpiresAt: new Date(Date.now() + 25 * 86400000).toISOString(),
    qrCodeDeepLink: 'jalpaiguri-connect://shop/shop-maa-tara-fish',
    totalViews: 980,
    inquiryClicks: 168,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initial Products across Jalpaiguri Shops
const initialProducts: ServerProduct[] = [
  // Sen Sweets
  {
    id: 'prod-sen-1',
    shopId: 'shop-sen-sweets',
    ownerId: 'owner-sen-1',
    name: 'Jalpaiguri Special Jolbhora Sandesh',
    nameBn: 'জলপাইগুড়ি স্পেশাল জলভরা সন্দেশ',
    category: 'Bakery & Sweets',
    price: 25,
    discountPrice: 22,
    unit: 'pc',
    inStock: true,
    photoUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=500&auto=format&fit=crop&q=80',
    description: 'Signature Bengali sandesh stuffed with fragrant nolen gur syrup inside.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-sen-2',
    shopId: 'shop-sen-sweets',
    ownerId: 'owner-sen-1',
    name: 'Fresh Sponge Rosogolla (Box of 10)',
    nameBn: 'হাঁড়িভাঙ্গা টাটকা রসগোল্লা (১০টি)',
    category: 'Bakery & Sweets',
    price: 150,
    discountPrice: 130,
    unit: 'box',
    inStock: true,
    photoUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop&q=80',
    description: 'Soft pure chhana rosogollas soaked in light sugar cardamom syrup.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-sen-3',
    shopId: 'shop-sen-sweets',
    ownerId: 'owner-sen-1',
    name: 'Rich Chhanar Payesh',
    nameBn: 'ঘন ছানার পায়েস',
    category: 'Bakery & Sweets',
    price: 240,
    unit: 'kg',
    inStock: true,
    photoUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=500&auto=format&fit=crop&q=80',
    description: 'Traditional slow-simmered milk payesh with tender chhana dumplings.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-sen-4',
    shopId: 'shop-sen-sweets',
    ownerId: 'owner-sen-1',
    name: 'Pure Kaju Barfi Box',
    nameBn: 'কাজু বরফি',
    category: 'Bakery & Sweets',
    price: 450,
    discountPrice: 420,
    unit: 'box (500g)',
    inStock: true,
    description: 'Fine grade Goan cashew paste sweets with edible silver foil.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // North Bengal Book Store
  {
    id: 'prod-nb-1',
    shopId: 'shop-north-bengal-books',
    ownerId: 'owner-roy-books',
    name: 'Classmate Long Notebook (Bundle of 4)',
    nameBn: 'ক্লাসমেট লং খাতা (৪টির প্যাক)',
    category: 'Books & Stationery',
    price: 220,
    discountPrice: 195,
    unit: 'packet',
    inStock: true,
    photoUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=80',
    description: '172 pages ruled spiral/bound notebooks, smooth 70 GSM paper.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-nb-2',
    shopId: 'shop-north-bengal-books',
    ownerId: 'owner-roy-books',
    name: 'WB Board Madhyamik All-in-One Guide',
    nameBn: 'পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদ মাধ্যমিক সহায়িকা',
    category: 'Books & Stationery',
    price: 340,
    discountPrice: 300,
    unit: 'pc',
    inStock: true,
    description: 'Latest updated syllabus edition with solved question papers and model mock tests.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-nb-3',
    shopId: 'shop-north-bengal-books',
    ownerId: 'owner-roy-books',
    name: 'Reynolds Trimax Liquid Pen (Pack of 3)',
    nameBn: 'রেনল্ডস ট্রাইম্যাক্স পেন প্যাক',
    category: 'Books & Stationery',
    price: 150,
    discountPrice: 135,
    unit: 'packet',
    inStock: true,
    description: 'Smooth precision needle-tip gel roller pens for examinations.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // MediPlus Pharmacy
  {
    id: 'prod-med-1',
    shopId: 'shop-mediplus-pharmacy',
    ownerId: 'owner-dr-guha',
    name: 'Dolo 650mg Paracetamol Tablets',
    nameBn: 'ডোলো ৬৫০ প্যারাসিটামল ট্যাবলেট',
    category: 'Pharmacy',
    price: 32,
    discountPrice: 28,
    unit: 'strip (15 tabs)',
    inStock: true,
    description: 'Quick relief for fever, head cold, body aches and inflammation.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-med-2',
    shopId: 'shop-mediplus-pharmacy',
    ownerId: 'owner-dr-guha',
    name: 'Cipla Electral ORS Powder 21.8g',
    nameBn: 'ইলেকট্রাল ওআরএস স্যালাইন',
    category: 'Pharmacy',
    price: 24,
    discountPrice: 22,
    unit: 'packet',
    inStock: true,
    description: 'WHO recommended formula for dehydration, heat stroke and electrolyte restoration.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-med-3',
    shopId: 'shop-mediplus-pharmacy',
    ownerId: 'owner-dr-guha',
    name: 'Accu-Chek Active Blood Glucose Strips',
    nameBn: 'সুগার টেস্ট স্ট্রিপ ৫০টি',
    category: 'Pharmacy',
    price: 990,
    discountPrice: 875,
    unit: 'box (50s)',
    inStock: true,
    description: 'Fast accurate capillary blood sugar test strips for home monitoring.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-med-4',
    shopId: 'shop-mediplus-pharmacy',
    ownerId: 'owner-dr-guha',
    name: 'Betadine Antiseptic Solution 100ml',
    nameBn: 'বেটাডিন অ্যান্টিসেপ্টিক লোশন',
    category: 'Pharmacy',
    price: 110,
    discountPrice: 98,
    unit: 'bottle',
    inStock: true,
    description: '10% Povidone-Iodine topical antiseptic for cuts, burns and wounds.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Tara Maa Grocery
  {
    id: 'prod-gro-1',
    shopId: 'shop-tara-maa-grocery',
    ownerId: 'owner-debnath',
    name: 'Amul Butter 500g',
    nameBn: 'আমুল বাটার ৫০০ গ্রাম',
    category: 'Grocery',
    price: 285,
    discountPrice: 275,
    unit: 'packet',
    inStock: true,
    photoUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80',
    description: 'Pure salted dairy butter, utter butterly delicious.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-gro-2',
    shopId: 'shop-tara-maa-grocery',
    ownerId: 'owner-debnath',
    name: 'Aashirvaad Shudh Chakki Atta 5kg',
    nameBn: 'আশীর্বাদ খাঁটি চক্কি আটা ৫ কেজি',
    category: 'Grocery',
    price: 235,
    discountPrice: 215,
    unit: 'packet',
    inStock: true,
    description: '100% whole wheat grain with natural dietary fibers for soft rotis.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-gro-3',
    shopId: 'shop-tara-maa-grocery',
    ownerId: 'owner-debnath',
    name: 'Fortune Kachi Ghani Pure Mustard Oil 1L',
    nameBn: 'ফরচুন খাঁটি সরষের তেল ১ লিটার',
    category: 'Grocery',
    price: 155,
    discountPrice: 142,
    unit: 'liter',
    inStock: true,
    description: 'Cold pressed strong aroma mustard oil for traditional Bengali cooking.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-gro-4',
    shopId: 'shop-tara-maa-grocery',
    ownerId: 'owner-debnath',
    name: 'Tulaipanji Fragrant Rice 1kg',
    nameBn: 'উত্তরবঙ্গের সুগন্ধি তুলাইপাঞ্জি চাল',
    category: 'Grocery',
    price: 120,
    discountPrice: 110,
    unit: 'kg',
    inStock: true,
    description: 'North Bengal native aromatic grain, ideal for payesh and pulao.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-gro-5',
    shopId: 'shop-tara-maa-grocery',
    ownerId: 'owner-debnath',
    name: 'Maggi 2-Minute Noodles Masala 4-Pack',
    nameBn: 'ম্যাগি মসলা নুডলস ৪ প্যাক',
    category: 'Grocery',
    price: 60,
    discountPrice: 56,
    unit: 'packet',
    inStock: true,
    description: 'Classic instant noodles with savory Indian spice mix.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Ghosh Dairy
  {
    id: 'prod-dairy-1',
    shopId: 'shop-ghosh-dairy',
    ownerId: 'owner-ghosh-dairy',
    name: 'Pure Desi Cow Ghee 500g',
    nameBn: 'খাঁটি দেশি গাওয়া ঘি ৫০০ গ্রাম',
    category: 'Dairy',
    price: 650,
    discountPrice: 620,
    unit: 'jar',
    inStock: true,
    description: 'Traditional bilona churned aromatic clarified butter from pasture cows.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-dairy-2',
    shopId: 'shop-ghosh-dairy',
    ownerId: 'owner-ghosh-dairy',
    name: 'Fresh Malai Paneer 1kg',
    nameBn: 'টাটকা নরম মালাই পনির ১ কেজি',
    category: 'Dairy',
    price: 360,
    discountPrice: 340,
    unit: 'kg',
    inStock: true,
    description: 'Ultra fresh, unpressed tender cottage cheese made every morning.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-dairy-3',
    shopId: 'shop-ghosh-dairy',
    ownerId: 'owner-ghosh-dairy',
    name: 'Sweet Bengali Curd / Mishti Doi Matka',
    nameBn: 'ঐতিহ্যবাহী মাটির হাঁড়ির মিষ্টি দই',
    category: 'Dairy',
    price: 110,
    discountPrice: 95,
    unit: 'pot',
    inStock: true,
    description: 'Caramelized thick clay pot curd, naturally fermented.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Roy Hardware
  {
    id: 'prod-hard-1',
    shopId: 'shop-roy-hardware',
    ownerId: 'owner-roy-hardware',
    name: 'Havells 9W Cool Daylight LED Bulb',
    nameBn: 'হ্যাভেলস ৯ ওয়াট এলইডি বাল্ব',
    category: 'Hardware',
    price: 110,
    discountPrice: 90,
    unit: 'pc',
    inStock: true,
    description: 'Energy efficient B22 pin bulb with 1-year brand replacement guarantee.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-hard-2',
    shopId: 'shop-roy-hardware',
    ownerId: 'owner-roy-hardware',
    name: 'Anchor 3-Pin Extension Cord 4-Socket 3m',
    nameBn: 'অ্যাঙ্কর ৪ সকেট এক্সটেনশন কর্ড',
    category: 'Hardware',
    price: 390,
    discountPrice: 340,
    unit: 'pc',
    inStock: true,
    description: 'Heavy duty surge protected wire with master switch.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Maa Tara Fish
  {
    id: 'prod-fish-1',
    shopId: 'shop-maa-tara-fish',
    ownerId: 'owner-bapi-fish',
    name: 'Teesta River Fresh Boroli Fish (1kg)',
    nameBn: 'তিস্তার তাজা বরোলি মাছ (১ কেজি)',
    category: 'Fresh Meat & Fish',
    price: 700,
    discountPrice: 650,
    unit: 'kg',
    inStock: true,
    description: 'Prized delicacy of North Bengal rivers, caught early morning in the Teesta.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-fish-2',
    shopId: 'shop-maa-tara-fish',
    ownerId: 'owner-bapi-fish',
    name: 'Fresh Hilsa Fish / Padma Ilish (1kg+)',
    nameBn: 'তাজা পদ্মার ইলিশ মাছ (১ কেজি+)',
    category: 'Fresh Meat & Fish',
    price: 1550,
    discountPrice: 1450,
    unit: 'kg',
    inStock: true,
    description: 'Silver rich oily hilsa, cut and descaled on request.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-fish-3',
    shopId: 'shop-maa-tara-fish',
    ownerId: 'owner-bapi-fish',
    name: 'Fresh Desi Country Chicken (Live weight 1kg)',
    nameBn: 'দেশি মুরগি (১ কেজি ওজন)',
    category: 'Fresh Meat & Fish',
    price: 400,
    discountPrice: 380,
    unit: 'kg',
    inStock: true,
    description: 'Free range village poultry, fresh skinless/curry cut.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class ShopStore {
  private shops: ServerShop[] = [...initialShops];
  private products: ServerProduct[] = [...initialProducts];
  private inquiries: ServerShopInquiry[] = [];

  public formatShop(shop: ServerShop): any {
    const phone = shop.ownerPhone || (shop as any).phone || '+91 98320 11094';
    const open = shop.openingTime || '08:00 AM';
    const close = shop.closingTime || '09:00 PM';
    const weeklyOff = shop.weeklyOff || 'None';
    return {
      ...shop,
      phone,
      ownerPhone: phone,
      whatsappNumber: shop.whatsappNumber || phone,
      openingTime: open,
      closingTime: close,
      weeklyOff,
      openingHours: {
        open,
        close,
        weeklyOff
      },
      homeDelivery: Boolean(shop.homeDelivery),
      deliveryAvailable: Boolean(shop.homeDelivery),
      nameBn: shop.nameBn || '',
      nameBengali: shop.nameBn || '',
      isFeatured: Boolean(shop.featured),
      featured: Boolean(shop.featured),
      isVerified: Boolean(shop.isVerified || shop.status === 'verified'),
      rating: typeof shop.rating === 'number' ? shop.rating : 4.8,
      reviewCount: typeof shop.reviewCount === 'number' ? shop.reviewCount : 25,
      distance: (shop as any).distanceText || ((shop as any).distanceKm ? `${(shop as any).distanceKm} km` : '1.2 km'),
      distanceText: (shop as any).distanceText || ((shop as any).distanceKm ? `${(shop as any).distanceKm} km` : '1.2 km'),
      distanceKm: typeof (shop as any).distanceKm === 'number' ? (shop as any).distanceKm : 1.2
    };
  }

  public getAllShops(filters: {
    category?: string;
    openNow?: boolean;
    verifiedOnly?: boolean;
    homeDeliveryOnly?: boolean;
    rating4Only?: boolean;
    search?: string;
    userLat?: number;
    userLng?: number;
  }): any[] {
    let result = [...this.shops];

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.nameBn && s.nameBn.toLowerCase().includes(q)) ||
          s.locality.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.categories.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (filters.category && filters.category !== 'All') {
      result = result.filter(
        (s) => s.category.toLowerCase() === filters.category!.toLowerCase() || s.categories.some((c) => c.toLowerCase() === filters.category!.toLowerCase())
      );
    }

    if (filters.openNow) {
      result = result.filter((s) => s.isOpen);
    }

    if (filters.verifiedOnly) {
      result = result.filter((s) => s.isVerified && s.status === 'verified');
    }

    if (filters.homeDeliveryOnly) {
      result = result.filter((s) => s.homeDelivery);
    }

    if (filters.rating4Only) {
      result = result.filter((s) => s.rating >= 4.0);
    }

    // Distance calculation and sorting
    if (typeof filters.userLat === 'number' && typeof filters.userLng === 'number') {
      const uLat = filters.userLat;
      const uLng = filters.userLng;
      result = result.map((shop) => {
        const dist = haversineDistance(uLat, uLng, shop.lat, shop.lng);
        return {
          ...shop,
          distanceKm: dist,
          distanceText: `${dist} km`
        };
      }).sort((a, b) => {
        // Prioritize verified & featured then distance
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      });
    } else {
      result.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      });
    }

    return result.map((s) => this.formatShop(s));
  }

  public getShopById(id: string): { shop: any; products: ServerProduct[] } | null {
    const shop = this.shops.find((s) => s.id === id);
    if (!shop) return null;
    const formatted = this.formatShop(shop);
    const shopProducts = this.products.filter((p) => p.shopId === id);
    return { shop: formatted, products: shopProducts };
  }

  public getShopsByOwner(ownerId: string): ServerShop[] {
    return this.shops.filter((s) => s.ownerId === ownerId);
  }

  public createShop(data: Partial<ServerShop>): ServerShop {
    const id = `shop-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newShop: ServerShop = {
      id,
      ownerId: data.ownerId || 'unknown-owner',
      ownerName: data.ownerName || 'Jalpaiguri Merchant',
      ownerPhone: data.ownerPhone || '',
      ownerEmail: data.ownerEmail,
      whatsappNumber: data.whatsappNumber || data.ownerPhone,
      name: data.name || 'My Shop',
      nameBn: data.nameBn,
      category: data.category || 'Grocery',
      categories: data.categories || [data.category || 'Grocery'],
      description: data.description || 'Welcome to our shop in Jalpaiguri.',
      locality: data.locality || 'Dinbazar',
      address: data.address || 'Jalpaiguri',
      landmark: data.landmark,
      pincode: data.pincode || '735101',
      lat: Number(data.lat) || 26.5414,
      lng: Number(data.lng) || 88.7196,
      openingTime: data.openingTime || '09:00 AM',
      closingTime: data.closingTime || '09:00 PM',
      weeklyOff: data.weeklyOff || 'None',
      homeDelivery: Boolean(data.homeDelivery),
      minOrderAmount: Number(data.minOrderAmount) || 0,
      deliveryRadiusKm: Number(data.deliveryRadiusKm) || 5,
      paymentMethods: data.paymentMethods && data.paymentMethods.length > 0 ? data.paymentMethods : ['Cash', 'UPI'],
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
      insidePhotoUrl: data.insidePhotoUrl,
      logoUrl: data.logoUrl,
      isVerified: false,
      status: 'pending', // Pending admin verification
      featured: false,
      isOpen: true,
      rating: 5.0,
      reviewCount: 0,
      subscriptionPlan: 'free',
      qrCodeDeepLink: `jalpaiguri-connect://shop/${id}`,
      totalViews: 1,
      inquiryClicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.shops.unshift(newShop);
    return newShop;
  }

  public updateShop(id: string, updates: Partial<ServerShop>, userId: string, isAdmin = false): ServerShop | null {
    const idx = this.shops.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const existing = this.shops[idx];

    if (!isAdmin && existing.ownerId !== userId) {
      throw new Error('Unauthorized: You are not permitted to modify another owner’s shop.');
    }

    // Protect administrative attributes if not admin
    const safeUpdates = { ...updates };
    if (!isAdmin) {
      delete safeUpdates.isVerified;
      delete safeUpdates.status;
      delete safeUpdates.featured;
      delete safeUpdates.subscriptionPlan;
      delete safeUpdates.subscriptionExpiresAt;
    }

    const updated: ServerShop = {
      ...existing,
      ...safeUpdates,
      updatedAt: new Date().toISOString()
    };

    this.shops[idx] = updated;
    return updated;
  }

  public toggleShopOpen(id: string, userId: string, isAdmin = false): ServerShop | null {
    const idx = this.shops.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const existing = this.shops[idx];

    if (!isAdmin && existing.ownerId !== userId) {
      throw new Error('Unauthorized: You can only toggle status for your own shop.');
    }

    const updated = {
      ...existing,
      isOpen: !existing.isOpen,
      updatedAt: new Date().toISOString()
    };
    this.shops[idx] = updated;
    return updated;
  }

  public recordInquiry(shopId: string, type: 'call' | 'whatsapp' | 'directions' | 'share'): void {
    const shop = this.shops.find((s) => s.id === shopId);
    if (shop) {
      shop.inquiryClicks += 1;
      shop.totalViews += 1;
    }
    this.inquiries.push({
      id: `inq-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      shopId,
      type,
      timestamp: new Date().toISOString()
    });
  }

  public incrementShopViews(shopId: string): void {
    const shop = this.shops.find((s) => s.id === shopId);
    if (shop) {
      shop.totalViews += 1;
    }
  }

  // Product Operations
  public searchProducts(query: string, userLat?: number, userLng?: number): Array<ServerProduct & { shop: ServerShop; distanceKm?: number }> {
    const q = (query || '').toLowerCase().trim();
    const matching = this.products.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.nameBn && p.nameBn.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    });

    const result: Array<ServerProduct & { shop: ServerShop; distanceKm?: number }> = [];

    for (const prod of matching) {
      const shop = this.shops.find((s) => s.id === prod.shopId);
      if (shop && shop.status !== 'suspended') {
        let dist = 0;
        if (typeof userLat === 'number' && typeof userLng === 'number') {
          dist = haversineDistance(userLat, userLng, shop.lat, shop.lng);
        }
        result.push({
          ...prod,
          shop,
          distanceKm: dist
        });
      }
    }

    // Sort by inStock first, then distance
    result.sort((a, b) => {
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      return (a.distanceKm || 0) - (b.distanceKm || 0);
    });

    return result;
  }

  public addProduct(data: Partial<ServerProduct>, ownerId: string): ServerProduct {
    const shop = this.shops.find((s) => s.id === data.shopId);
    if (!shop || shop.ownerId !== ownerId) {
      throw new Error('Unauthorized: You can only add products to your own shop.');
    }

    const id = `prod-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`;
    const newProduct: ServerProduct = {
      id,
      shopId: data.shopId!,
      ownerId,
      name: data.name || 'Item',
      nameBn: data.nameBn,
      category: data.category || shop.category || 'Grocery',
      price: Number(data.price) || 0,
      discountPrice: data.discountPrice ? Number(data.discountPrice) : undefined,
      unit: data.unit || 'pc',
      inStock: data.inStock !== false,
      photoUrl: data.photoUrl,
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.products.unshift(newProduct);
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<ServerProduct>, ownerId: string, isAdmin = false): ServerProduct | null {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const existing = this.products[idx];

    if (!isAdmin && existing.ownerId !== ownerId) {
      throw new Error('Unauthorized: You cannot edit products from another shop.');
    }

    const updated: ServerProduct = {
      ...existing,
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : existing.price,
      discountPrice: updates.discountPrice !== undefined ? Number(updates.discountPrice) : existing.discountPrice,
      updatedAt: new Date().toISOString()
    };

    this.products[idx] = updated;
    return updated;
  }

  public deleteProduct(id: string, ownerId: string, isAdmin = false): boolean {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const existing = this.products[idx];

    if (!isAdmin && existing.ownerId !== ownerId) {
      throw new Error('Unauthorized: You cannot delete products from another shop.');
    }

    this.products.splice(idx, 1);
    return true;
  }

  // Smart Shopping List Matcher
  public matchShoppingList(items: string[], userLat?: number, userLng?: number): any[] {
    const cleanItems = items.map((i) => i.toLowerCase().trim()).filter(Boolean);
    if (cleanItems.length === 0) return [];

    const shopMatches = this.shops.map((shop) => {
      const shopProds = this.products.filter((p) => p.shopId === shop.id && p.inStock);
      const matchedProducts: ServerProduct[] = [];
      const missingItems: string[] = [];

      for (const item of cleanItems) {
        const found = shopProds.find(
          (p) =>
            p.name.toLowerCase().includes(item) ||
            (p.nameBn && p.nameBn.toLowerCase().includes(item)) ||
            p.category.toLowerCase().includes(item) ||
            item.includes(p.name.toLowerCase())
        );
        if (found) {
          matchedProducts.push(found);
        } else {
          missingItems.push(item);
        }
      }

      let dist = 0;
      if (typeof userLat === 'number' && typeof userLng === 'number') {
        dist = haversineDistance(userLat, userLng, shop.lat, shop.lng);
      }

      return {
        shop,
        matchedCount: matchedProducts.length,
        totalItems: cleanItems.length,
        matchedProducts,
        missingItems,
        distanceKm: dist,
        distanceText: `${dist} km away`
      };
    });

    // Filter out shops with 0 matches and sort by match count descending, then distance ascending
    return shopMatches
      .filter((m) => m.matchedCount > 0)
      .sort((a, b) => {
        if (b.matchedCount !== a.matchedCount) {
          return b.matchedCount - a.matchedCount;
        }
        return a.distanceKm - b.distanceKm;
      });
  }

  // Subscription plan upgrade
  public subscribeShop(shopId: string, plan: 'monthly' | 'yearly', ownerId: string): ServerShop | null {
    const idx = this.shops.findIndex((s) => s.id === shopId);
    if (idx === -1) return null;
    const existing = this.shops[idx];

    if (existing.ownerId !== ownerId) {
      throw new Error('Unauthorized subscription upgrade.');
    }

    const durationDays = plan === 'yearly' ? 365 : 30;
    const updated: ServerShop = {
      ...existing,
      subscriptionPlan: plan,
      subscriptionExpiresAt: new Date(Date.now() + durationDays * 86400000).toISOString(),
      isVerified: true, // Verified badge activated
      status: 'verified',
      featured: true,
      updatedAt: new Date().toISOString()
    };

    this.shops[idx] = updated;
    return updated;
  }

  // Admin Operations
  public adminGetShops(status?: string): ServerShop[] {
    if (!status || status === 'all') {
      return [...this.shops];
    }
    return this.shops.filter((s) => s.status === status);
  }

  public adminModerateShop(shopId: string, action: 'verify' | 'reject' | 'suspend' | 'feature' | 'unfeature'): ServerShop | null {
    const idx = this.shops.findIndex((s) => s.id === shopId);
    if (idx === -1) return null;
    const existing = this.shops[idx];

    let updated: ServerShop = { ...existing };
    if (action === 'verify') {
      updated.status = 'verified';
      updated.isVerified = true;
    } else if (action === 'reject') {
      updated.status = 'rejected';
      updated.isVerified = false;
      updated.featured = false;
    } else if (action === 'suspend') {
      updated.status = 'suspended';
      updated.isOpen = false;
      updated.featured = false;
    } else if (action === 'feature') {
      updated.featured = true;
    } else if (action === 'unfeature') {
      updated.featured = false;
    }

    updated.updatedAt = new Date().toISOString();
    this.shops[idx] = updated;
    return updated;
  }
}

export const shopStore = new ShopStore();

// AI Smart Product Import (Gemini 3.8 Flash)
export async function extractProductsWithGemini(inputText: string, imageBase64?: string): Promise<Array<{
  name: string;
  nameBn?: string;
  price: number;
  discountPrice?: number;
  unit: string;
  category: string;
}>> {
  const gemini = apiKeyService.getGeminiClient();
  if (!gemini) {
    console.warn('[Gemini AI] GEMINI_API_KEY not configured. Using rule-based extractor.');
    return fallbackExtractProducts(inputText);
  }

  try {
    const prompt = `You are an expert grocery and local merchant catalog extractor in Jalpaiguri, West Bengal, India.
Extract all product items from the provided text or invoice/menu/handwritten price list.
For each product, return:
- name: English title of the product
- nameBn: Bengali title or pronunciation (in Bengali script বাংলা)
- price: standard retail price in INR (number)
- discountPrice: optional discounted price in INR if mentioned (number or null)
- unit: unit of measurement (e.g. 'kg', 'g', 'pc', 'packet', 'liter', 'ml', 'box', 'strip')
- category: one of 'Grocery', 'Pharmacy', 'Bakery & Sweets', 'Hardware', 'Books & Stationery', 'Dairy', 'Clothing', 'Fresh Meat & Fish', 'Personal Care', 'Other'

Return ONLY valid JSON matching this schema:
[
  {
    "name": "Amul Butter 500g",
    "nameBn": "আমুল বাটার ৫০০ গ্রাম",
    "price": 275,
    "discountPrice": 265,
    "unit": "packet",
    "category": "Grocery"
  }
]`;

    const contents: any[] = [];
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      });
    }

    contents.push({
      text: `${prompt}\n\nInput to extract:\n${inputText || 'Extract items from the attached price list image.'}`
    });

    const response = await gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '[]';
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        name: String(item.name || 'Product Item'),
        nameBn: item.nameBn ? String(item.nameBn) : undefined,
        price: Math.max(1, Number(item.price) || 50),
        discountPrice: item.discountPrice ? Number(item.discountPrice) : undefined,
        unit: String(item.unit || 'pc'),
        category: String(item.category || 'Grocery')
      }));
    }
    return fallbackExtractProducts(inputText);
  } catch (err) {
    console.error('[Gemini AI] Product extraction error:', err);
    return fallbackExtractProducts(inputText);
  }
}

// Fallback rule-based extractor if offline or without key
function fallbackExtractProducts(text: string): Array<{
  name: string;
  nameBn?: string;
  price: number;
  discountPrice?: number;
  unit: string;
  category: string;
}> {
  if (!text || !text.trim()) {
    return [
      { name: 'Fresh Item 1', price: 120, unit: 'kg', category: 'Grocery' },
      { name: 'Special Item 2', price: 85, unit: 'packet', category: 'Grocery' }
    ];
  }

  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const items: any[] = [];

  for (const line of lines) {
    // Look for price like ₹100, 100/-, Rs 100, 100
    const priceMatch = line.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:\/|-)?/i);
    const price = priceMatch ? Math.round(parseFloat(priceMatch[1])) : 100;
    const namePart = line.replace(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:\/|-)?/i, '').replace(/[-–:,]/g, ' ').trim();

    if (namePart) {
      items.push({
        name: namePart.slice(0, 50),
        price: price > 0 ? price : 50,
        unit: namePart.toLowerCase().includes('kg') ? 'kg' : namePart.toLowerCase().includes('l') ? 'liter' : 'pc',
        category: 'Grocery'
      });
    }
  }

  return items.length > 0 ? items : [{ name: text.slice(0, 40), price: 100, unit: 'pc', category: 'Grocery' }];
}

// AI Shop Description Generator
export async function generateShopDescriptionWithGemini(name: string, category: string, locality: string): Promise<{
  tagline: string;
  taglineBn: string;
  description: string;
  descriptionBn: string;
}> {
  const gemini = apiKeyService.getGeminiClient();
  const fallback = {
    tagline: `Your trusted ${category} destination in ${locality}, Jalpaiguri.`,
    taglineBn: `${locality}, জলপাইগুড়িতে আপনার বিশ্বস্ত ${category} প্রতিষ্ঠান।`,
    description: `Offering fresh authentic products, personalized customer care, and quick service in ${locality}, Jalpaiguri.`,
    descriptionBn: `জলপাইগুড়ির ${locality} অঞ্চলে খাঁটি ও উন্নত মানের সামগ্রী, সাশ্রয়ী দাম ও নির্ভরযোগ্য সেবা প্রদান করছি।`
  };

  if (!gemini) return fallback;

  try {
    const prompt = `Write a short, professional, and appealing local business tagline and description for a shop in Jalpaiguri, West Bengal, India.
Shop Name: ${name}
Category: ${category}
Locality: ${locality}, Jalpaiguri

Return ONLY valid JSON matching this schema:
{
  "tagline": "Short one-line English slogan",
  "taglineBn": "এক লাইনের বাংলা স্লোগান",
  "description": "2-3 sentences English description highlighting quality and service in Jalpaiguri",
  "descriptionBn": "২-৩ লাইনের প্রফেশনাল ও আকর্ষণীয় বাংলা বিবরণ"
}`;

    const response = await gemini.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: prompt }],
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      tagline: parsed.tagline || fallback.tagline,
      taglineBn: parsed.taglineBn || fallback.taglineBn,
      description: parsed.description || fallback.description,
      descriptionBn: parsed.descriptionBn || fallback.descriptionBn
    };
  } catch (err) {
    console.warn('[Gemini AI] Description generation error:', err);
    return fallback;
  }
}
