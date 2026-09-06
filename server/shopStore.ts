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
const initialShops: ServerShop[] = [];

// Initial Products across Jalpaiguri Shops
const initialProducts: ServerProduct[] = [];

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
