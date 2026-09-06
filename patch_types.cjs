const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

const restaurantTypes = `
export type RestaurantCategory = 
  | 'Cafe'
  | 'Restaurant'
  | 'Fast Food'
  | 'Street Food'
  | 'Bakery & Sweets'
  | 'Cloud Kitchen'
  | 'Dhaba'
  | 'Other';

export interface Restaurant {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  phone?: string;
  ownerEmail?: string;
  whatsappNumber?: string;
  name: string;
  nameBn?: string;
  category: RestaurantCategory | string;
  cuisineTypes: string[];
  description: string;
  locality: string;
  address: string;
  landmark?: string;
  pincode: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  distanceText?: string;
  openingTime?: string;
  closingTime?: string;
  openingHours?: { open: string; close: string; weeklyOff?: string };
  weeklyOff?: string;
  homeDelivery?: boolean;
  minOrderAmount?: number;
  paymentMethods: string[];
  upiId?: string;
  photoUrl?: string;
  insidePhotoUrl?: string;
  logoUrl?: string;
  menuPhotoUrl?: string;
  isVerified: boolean;
  status: 'pending' | 'verified' | 'rejected' | 'suspended';
  featured?: boolean;
  isOpen: boolean;
  rating: number;
  reviewCount: number;
  subscriptionPlan: 'free' | 'monthly' | 'yearly';
  subscriptionExpiresAt?: string;
  analytics?: { views?: number; callClicks?: number; whatsappClicks?: number; directionsClicks?: number };
  createdAt: string;
  updatedAt: string;
  menuItemCount?: number;
  subscription?: ShopSubscription;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  ownerId: string;
  name: string;
  nameBn?: string;
  category: string;
  price: number;
  discountPrice?: number;
  isVeg: boolean;
  isEgg: boolean;
  inStock: boolean;
  photoUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

`;

code = code.replace('export interface Product {', restaurantTypes + 'export interface Product {');
fs.writeFileSync('src/types/index.ts', code);
