import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, updateDoc, setDoc, addDoc, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  ArrowLeft,
  Coffee,
  Plus,
  Package,
  Sparkles,
  TrendingUp,
  Phone,
  MessageSquare,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Upload,
  FileText,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Check,
  ChevronRight,
  BarChart3,
  QrCode,
  Save,
  Camera,
  Truck,
  ExternalLink
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Restaurant, MenuItem, RestaurantSubscription } from '../../types';

export const RestaurantDashboardView: React.FC = () => {
  const { navigate, goBack, navParams } = useNav();
  const { user, firebaseUser } = useAuth();
  const { language } = useLanguage();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menuItems' | 'profile' | 'subscription'>('menuItems');

  // Edit Restaurant Profile State (for Complete Later)
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOpenTime, setEditOpenTime] = useState('08:00 AM');
  const [editCloseTime, setEditCloseTime] = useState('09:30 PM');
  const [editWeeklyOff, setEditWeeklyOff] = useState('None');
  const [editDeliveryAvailable, setEditDeliveryAvailable] = useState(true);
  const [editDeliveryRadius, setEditDeliveryRadius] = useState('3.5');
  const [editMinOrder, setEditMinOrder] = useState('200');
  const [editUpiId, setEditUpiId] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editLandmark, setEditLandmark] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [isGeneratingAiBio, setIsGeneratingAiBio] = useState(false);

  // New menuItem form modal
  const [showAddMenuItemModal, setShowAddMenuItemModal] = useState(false);
  const [newMenuItemName, setNewMenuItemName] = useState('');
  const [newMenuItemNameBn, setNewMenuItemNameBn] = useState('');
  const [newMenuItemCategory, setNewMenuItemCategory] = useState('General');
  const [newMenuItemPrice, setNewMenuItemPrice] = useState('');
  const [newMenuItemDiscount, setNewMenuItemDiscount] = useState('');
  const [newMenuItemUnit, setNewMenuItemUnit] = useState('piece');
  const [newMenuItemInStock, setNewMenuItemInStock] = useState(true);

  const [newMenuItemIsVeg, setNewMenuItemIsVeg] = useState(true);
  const [newMenuItemIsEgg, setNewMenuItemIsEgg] = useState(false);

  const [newMenuItemPhoto, setNewMenuItemPhoto] = useState('');
  const [isSubmittingMenuItem, setIsSubmittingMenuItem] = useState(false);

  // AI Smart Import Modal
  const [showAiImportModal, setShowAiImportModal] = useState(false);
  const [importRawText, setImportRawText] = useState('');
  const [isExtractingAi, setIsExtractingAi] = useState(false);
  const [extractedMenuItems, setExtractedMenuItems] = useState<any[]>([]);
  const [isSavingExtracted, setIsSavingExtracted] = useState(false);

  // Subscription Modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgradingPlan, setIsUpgradingPlan] = useState(false);

  // Fetch restaurant for current user
  const fetchRestaurantOwnerRestaurant = async () => {
    try {
      setLoading(true);
      const currentRestaurantId = navParams.restaurantId || localStorage.getItem('jpg_current_restaurant_id');

      let targetRestaurant: Restaurant | null = null;

      if (currentRestaurantId) {
        const restaurantDoc = await getDoc(doc(db, 'restaurants', currentRestaurantId));
        if (restaurantDoc.exists()) {
          targetRestaurant = { id: restaurantDoc.id, ...restaurantDoc.data() } as Restaurant;
        }
      }

      if (!targetRestaurant) {
        const userId = user?.id || firebaseUser?.uid;
        if (userId) {
          const q = query(collection(db, 'restaurants'), where('ownerId', '==', userId));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            targetRestaurant = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Restaurant;
          }
        }
      }

      if (targetRestaurant) {
        setRestaurant(targetRestaurant);
        // Initialize profile edit states
        setEditPhotoUrl(targetRestaurant.photoUrl || '');
        setEditDescription(targetRestaurant.description || '');
        setEditOpenTime(targetRestaurant.openingHours?.open || '08:00 AM');
        setEditCloseTime(targetRestaurant.openingHours?.close || '09:30 PM');
        setEditWeeklyOff(targetRestaurant.openingHours?.weeklyOff || 'None');
        setEditDeliveryAvailable(Boolean(targetRestaurant.deliveryAvailable));
        setEditDeliveryRadius(String(targetRestaurant.deliveryRadiusKm || '3.5'));
        setEditMinOrder(String(targetRestaurant.minOrderAmount || '200'));
        setEditUpiId(targetRestaurant.upiId || '');
        setEditPhone(targetRestaurant.phone || '');
        setEditWhatsapp(targetRestaurant.whatsappNumber || targetRestaurant.phone || '');
        setEditAddress(targetRestaurant.address || '');
        setEditLandmark(targetRestaurant.landmark || '');

        // Fetch menuItems
        const menuItemsQ = query(collection(db, 'restaurants', targetRestaurant.id, 'menuItems'));
        const pSnapshot = await getDocs(menuItemsQ);
        const pData = pSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as MenuItem[];
        setMenuItems(pData);
      }
    } catch (err) {
      console.error('Error fetching restaurantOwner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantOwnerRestaurant();
  }, []);

  // Toggle Live Restaurant Open/Close
  const handleToggleRestaurantOpen = async () => {
    if (!restaurant) return;
    const newStatus = !restaurant.isOpen;
    setRestaurant({ ...restaurant, isOpen: newStatus });

    try {
      await updateDoc(doc(db, 'restaurants', restaurant.id), { isOpen: newStatus });
    } catch (e) {
      console.warn('Failed to update restaurant status');
    }
  };

  // Toggle MenuItem Stock status
  const handleToggleMenuItemStock = async (menuItem: MenuItem) => {
    if (!restaurant) return;
    const updatedStock = !menuItem.inStock;
    setMenuItems(prev => prev.map(p => p.id === menuItem.id ? { ...p, inStock: updatedStock } : p));

    try {
      await updateDoc(doc(db, 'restaurants', restaurant.id, 'menuItems', menuItem.id), { inStock: updatedStock });
    } catch (e) {
      console.warn('Failed to update menuItem stock');
    }
  };

  // Delete menuItem
  const handleDeleteMenuItem = async (menuItemId: string) => {
    if (!restaurant) return;
    if (!confirm('Are you sure you want to delete this menuItem?')) return;
    setMenuItems(prev => prev.filter(p => p.id !== menuItemId));

    try {
      await deleteDoc(doc(db, 'restaurants', restaurant.id, 'menuItems', menuItemId));
    } catch (e) {
      console.warn('Failed to delete menuItem');
    }
  };

  // Add MenuItem Form Submit
  const handleAddMenuItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant || !newMenuItemName.trim() || !newMenuItemPrice) return;

    setIsSubmittingMenuItem(true);
    try {
      const payload = {
        name: newMenuItemName,
        nameBengali: newMenuItemNameBn || undefined,
        category: newMenuItemCategory,
        price: parseFloat(newMenuItemPrice) || 0,
        discountPrice: newMenuItemDiscount ? parseFloat(newMenuItemDiscount) : undefined,
      isVeg: newMenuItemIsVeg,
      isEgg: newMenuItemIsEgg,
        unit: newMenuItemUnit,
        inStock: newMenuItemInStock,
        photoUrl: newMenuItemPhoto || undefined,
        restaurantId: restaurant.id,
        ownerId: restaurant.ownerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'restaurants', restaurant.id, 'menuItems'), payload);
      const created = { id: docRef.id, ...payload } as MenuItem;
      
      setMenuItems(prev => [created, ...prev]);
      setShowAddMenuItemModal(false);
      // Reset form
      setNewMenuItemName('');
      setNewMenuItemNameBn('');
      setNewMenuItemPrice('');
      setNewMenuItemDiscount('');
      setNewMenuItemPhoto('');
    } catch (err) {
      console.error('Failed to add menuItem:', err);
    } finally {
      setIsSubmittingMenuItem(false);
    }
  };

  // AI Extract MenuItems
  const handleRunAiExtraction = async () => {
    if (!importRawText.trim()) return;
    setIsExtractingAi(true);

    try {
      const res = await fetch('/api/ai/extract-menuItems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: importRawText })
      });

      if (res.ok) {
        const data = await res.json();
        setExtractedMenuItems(data.menuItems || []);
      }
    } catch (err) {
      console.error('AI extraction failed:', err);
    } finally {
      setIsExtractingAi(false);
    }
  };

  // Save all extracted menuItems
  const handleSaveAllExtracted = async () => {
    if (!restaurant || extractedMenuItems.length === 0) return;
    setIsSavingExtracted(true);

    try {
      const saved: MenuItem[] = [];
      for (const prod of extractedMenuItems) {
        const payload = {
          ...prod,
          restaurantId: restaurant.id,
          ownerId: restaurant.ownerId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, 'restaurants', restaurant.id, 'menuItems'), payload);
        saved.push({ id: docRef.id, ...payload });
      }

      setMenuItems(prev => [...saved, ...prev]);
      setShowAiImportModal(false);
      setExtractedMenuItems([]);
      setImportRawText('');
      alert(`Successfully imported ${saved.length} menuItems to your restaurant catalog!`);
    } catch (err) {
      console.error('Failed to batch save menuItems:', err);
    } finally {
      setIsSavingExtracted(false);
    }
  };

  // Upgrade Subscription Plan
  const handleUpgradePlan = async () => {
    if (!restaurant) return;
    setIsUpgradingPlan(true);

    try {
      // Create payment/order securely through backend (Simulated Razorpay flow)
      const res = await fetch(`/api/restaurants/${restaurant.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Simulating the Razorpay checkout overlay experience
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const newSubscription: RestaurantSubscription = {
           ...restaurant.subscription,
           plan: selectedPlan as 'monthly' | 'yearly',
           status: 'active' as const,
           subscriptionStartedAt: new Date().toISOString(),
           subscriptionEndsAt: new Date(Date.now() + (selectedPlan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
           billingCycle: selectedPlan as 'monthly' | 'yearly'
        };

        // Securely update the source of truth in Firestore
        try {
          const restaurantRef = doc(db, 'restaurants', restaurant.id);
          await updateDoc(restaurantRef, {
            isFeatured: true,
            subscription: newSubscription
          });
        } catch (dbErr) {
          console.error("Failed to update Firestore:", dbErr);
          // Optional: handle Firestore write failure
        }
        
        // Update local state
        setRestaurant(prev => prev ? { 
          ...prev, 
          isFeatured: true,
          subscription: newSubscription
        } : null);
        
        setShowUpgradeModal(false);
        
        // Show success screen (we use alert for simplicity here, but a dedicated modal could be used)
        alert(`🎉 Welcome to MYJPG Premium! Your ${selectedPlan} Premium plan is now active.`);
      } else {
        alert('Payment initiation failed. Please try again.');
      }
    } catch (err) {
      console.error('Failed to upgrade subscription:', err);
    } finally {
      setIsUpgradingPlan(false);
    }
  };

  // Save Restaurant Profile Changes (Complete the rest later)
  const handleSaveRestaurantProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    setIsSavingProfile(true);
    setProfileSaveSuccess(false);

    try {
      const updatePayload = {
        photoUrl: editPhotoUrl.trim() || restaurant.photoUrl,
        description: editDescription.trim(),
        openingHours: {
          open: editOpenTime || '08:00 AM',
          close: editCloseTime || '09:30 PM',
          weeklyOff: editWeeklyOff !== 'None' ? editWeeklyOff : undefined
        },
        deliveryAvailable: editDeliveryAvailable,
        deliveryRadiusKm: editDeliveryAvailable ? parseFloat(editDeliveryRadius) || 3.5 : 0,
        minOrderAmount: editDeliveryAvailable ? parseFloat(editMinOrder) || 0 : 0,
        upiId: editUpiId.trim() || undefined,
        phone: editPhone.trim() || restaurant.phone,
        whatsappNumber: editWhatsapp.trim() || editPhone.trim() || restaurant.whatsappNumber,
        address: editAddress.trim() || restaurant.address,
        landmark: editLandmark.trim() || restaurant.landmark,
        ownerId: restaurant.ownerId
      };

      await updateDoc(doc(db, 'restaurants', restaurant.id), updatePayload);
      const updated = { ...restaurant, ...updatePayload } as Restaurant;
      setRestaurant(updated);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Error saving restaurant profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // AI Auto-generate Restaurant Bio
  const handleGenerateAiBioInDashboard = async () => {
    if (!restaurant) return;
    setIsGeneratingAiBio(true);
    try {
      const res = await fetch('/api/ai/generate-restaurant-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: restaurant.name,
          category: restaurant.category,
          locality: restaurant.locality,
          subcategories: restaurant.subcategories || []
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.description) {
          setEditDescription(data.description);
        }
      } else {
        setEditDescription(
          `Welcome to ${restaurant.name}! Trusted ${restaurant.category.toLowerCase()} store in ${restaurant.locality}, Jalpaiguri. Offering authentic local goods, dedicated customer care, and quick service for all neighborhood families.`
        );
      }
    } catch {
      setEditDescription(
        `Welcome to ${restaurant.name}! Trusted ${restaurant.category.toLowerCase()} store in ${restaurant.locality}, Jalpaiguri. Offering authentic local goods, dedicated customer care, and quick service for all neighborhood families.`
      );
    } finally {
      setIsGeneratingAiBio(false);
    }
  };

  const isPremiumActive = Boolean(
    restaurant?.subscription && (
      (restaurant.subscription.status === 'active' && (restaurant.subscription.plan === 'monthly' || restaurant.subscription.plan === 'yearly')) ||
      (restaurant.subscription.status === 'trial')
    )
  );

  const isTrial = restaurant?.subscription?.status === 'trial';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-10 h-10 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-[#55685F] dark:text-[#A2B3AA]">
          Loading RestaurantOwner Hub...
        </p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] p-6 text-center space-y-4">
        <button onClick={goBack} className="p-2 rounded-full bg-white dark:bg-[#0F172A]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Coffee className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-base font-black text-[#11241C] dark:text-white">No Restaurant Found</h2>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">
          You haven't registered a restaurant on MYJPG yet.
        </p>
        <button
          onClick={() => navigate('add-restaurant')}
          className="px-4 py-2.5 rounded-xl bg-[#007AFF] text-white text-xs font-bold cursor-pointer"
        >
          + Register Your Restaurant Now
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] pb-28 max-w-md mx-auto select-none transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#0B132B]/95 backdrop-blur-md px-4 py-3 border-b border-[#E8E4DA]/60 dark:border-white/10 transition-colors flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-base font-black text-[#11241C] dark:text-white leading-tight flex items-center gap-1.5">
              <span>{restaurant.name}</span>
            </h1>
            <p className="text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA]">
              RestaurantOwner Control Hub • {restaurant.locality}
            </p>
          </div>
        </div>

        {/* Live Open/Closed Toggle */}
        <button
          onClick={handleToggleRestaurantOpen}
          className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
            restaurant.isOpen
              ? 'bg-blue-500 text-white'
              : 'bg-rose-500 text-white'
          }`}
          title="Click to toggle store open/closed status"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <span>{restaurant.isOpen ? 'Store Open' : 'Store Closed'}</span>
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Premium Upgrade Banner */}
        <div className="bg-gradient-to-r from-gray-900 to-[#11241C] dark:from-[#1E293B] dark:to-[#0F172A] rounded-2xl p-4 shadow-md flex items-center justify-between border border-gray-700 dark:border-gray-800">
          <div className="space-y-1">
            <h3 className="text-white text-xs font-black flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {restaurant.subscription?.plan === 'monthly' || restaurant.subscription?.plan === 'yearly' ? 'Premium RestaurantOwner' : 'Free Trial Plan'}
            </h3>
            {restaurant.subscription?.status === 'trial' ? (
              <p className="text-[10px] font-semibold text-gray-300">
                {Math.max(0, Math.ceil((new Date(restaurant.subscription.trialEndsAt || new Date().toISOString()).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days remaining
              </p>
            ) : restaurant.subscription?.plan === 'monthly' || restaurant.subscription?.plan === 'yearly' ? (
              <p className="text-[10px] font-semibold text-gray-300">
                Active until {new Date(restaurant.subscription.subscriptionEndsAt || new Date().toISOString()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            ) : (
              <p className="text-[10px] font-semibold text-rose-400">
                Plan Expired
              </p>
            )}
          </div>
          <button 
            onClick={() => { setActiveTab('subscription'); window.scrollTo(0, document.body.scrollHeight); }}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-[#11241C] font-black text-xs rounded-xl shadow-sm hover:from-amber-300 hover:to-amber-500 active:scale-95 transition-all cursor-pointer border border-amber-300 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade Plan
          </button>
        </div>

        {/* Quick Analytics Summary Strip */}
        <div className="relative grid grid-cols-4 gap-2 text-center overflow-hidden rounded-2xl">
          {!isPremiumActive && (
            <div className="absolute inset-0 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-[1.5px] z-10 flex items-center justify-center border border-[#E8E4DA] dark:border-white/10 rounded-2xl">
               <div className="text-center px-4">
                 <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black px-2 py-0.5 rounded-md uppercase inline-block mb-1">Locked</div>
                 <p className="text-xs font-bold text-[#11241C] dark:text-white">Upgrade to view store analytics</p>
               </div>
            </div>
          )}
          <div className="bg-white dark:bg-[#0F172A] p-2.5 rounded-2xl border border-[#E8E4DA] dark:border-white/10 shadow-2xs">
            <span className="text-[10px] text-gray-500 block font-semibold">Store Views</span>
            <span className="text-sm font-black text-[#11241C] dark:text-white">
              {restaurant.analytics?.views || 148}
            </span>
          </div>

          <div className="bg-white dark:bg-[#0F172A] p-2.5 rounded-2xl border border-[#E8E4DA] dark:border-white/10 shadow-2xs">
            <span className="text-[10px] text-gray-500 block font-semibold">Calls</span>
            <span className="text-sm font-black text-blue-600">
              {restaurant.analytics?.callClicks || 24}
            </span>
          </div>

          <div className="bg-white dark:bg-[#0F172A] p-2.5 rounded-2xl border border-[#E8E4DA] dark:border-white/10 shadow-2xs">
            <span className="text-[10px] text-gray-500 block font-semibold">WhatsApp</span>
            <span className="text-sm font-black text-blue-600">
              {restaurant.analytics?.whatsappClicks || 39}
            </span>
          </div>

          <div className="bg-white dark:bg-[#0F172A] p-2.5 rounded-2xl border border-[#E8E4DA] dark:border-white/10 shadow-2xs">
            <span className="text-[10px] text-gray-500 block font-semibold">MenuItems</span>
            <span className="text-sm font-black text-[#11241C] dark:text-white">
              {menuItems.length}
            </span>
          </div>
        </div>

        {/* AI Smart Import Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] dark:from-[#132B22] dark:to-[#0C1E18] border border-blue-300/60 dark:border-blue-800/50 rounded-3xl p-4 shadow-xs flex items-center justify-between gap-3">
          {!isPremiumActive && (
            <div className="absolute inset-0 bg-[#eff6ff]/90 dark:bg-[#132B22]/90 backdrop-blur-[2px] z-10 flex items-center justify-center">
               <div className="text-center px-4">
                 <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black px-2 py-0.5 rounded-md uppercase inline-block mb-1">Locked</div>
                 <p className="text-xs font-bold text-blue-900 dark:text-blue-100">AI menuItem import is a premium feature.</p>
               </div>
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-700 dark:text-blue-300" />
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 dark:text-blue-300">
                AI Powered Feature
              </span>
            </div>
            <h3 className="text-xs font-black text-[#11241C] dark:text-white">
              Smart MenuItem Import
            </h3>
            <p className="text-[11px] font-semibold text-[#44554E] dark:text-[#A2B3AA] max-w-[210px] leading-tight">
              Paste your raw bill, price list or catalog. Gemini AI auto-extracts names, prices & categories.
            </p>
          </div>

          <button
            onClick={() => setShowAiImportModal(true)}
            className="px-3 py-2 rounded-xl bg-[#007AFF] dark:bg-blue-600 text-white text-xs font-black shadow-xs hover:bg-[#084D3A] active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all shrink-0 cursor-pointer"
          >
            Import with AI
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E8E4DA] dark:border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('menuItems')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'menuItems'
                ? 'border-[#007AFF] text-[#007AFF] dark:border-blue-400 dark:text-blue-400 font-black'
                : 'border-transparent text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>MenuItems ({menuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'profile'
                ? 'border-[#007AFF] text-[#007AFF] dark:border-blue-400 dark:text-blue-400 font-black'
                : 'border-transparent text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Profile & Hours</span>
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'subscription'
                ? 'border-[#007AFF] text-[#007AFF] dark:border-blue-400 dark:text-blue-400 font-black'
                : 'border-transparent text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pro Plan</span>
          </button>
        </div>

        {/* TAB 1: PRODUCT MANAGEMENT */}
        {activeTab === 'menuItems' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#11241C] dark:text-white">
                Live Menu Inventory
              </span>
              <button
                onClick={() => setShowAddMenuItemModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#007AFF] dark:bg-blue-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Single Item</span>
              </button>
            </div>

            {menuItems.length === 0 ? (
              <div className="py-8 text-center bg-white dark:bg-[#0F172A] rounded-3xl border border-[#E8E4DA] dark:border-white/10 p-6 space-y-2">
                <Package className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
                <p className="text-xs font-bold text-[#11241C] dark:text-white">
                  No menuItems added yet
                </p>
                <p className="text-[11px] text-gray-500">
                  Add items manually or use the AI Smart MenuItem Import to populate your restaurant instantly.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {menuItems.map((menuItem) => (
                  <div
                    key={menuItem.id}
                    className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {menuItem.photoUrl ? (
                        <img
                          src={menuItem.photoUrl}
                          alt={menuItem.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-[#11241C] dark:text-white leading-tight truncate">
                          {menuItem.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                          <span className="font-black text-[#007AFF] dark:text-blue-400">
                            ₹{menuItem.price}
                          </span>
                          <span className="text-gray-400 font-semibold">/{menuItem.unit}</span>
                          <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-white/5 px-1.5 py-0.2 rounded">
                            {menuItem.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Stock Toggle */}
                      <button
                        onClick={() => handleToggleMenuItemStock(menuItem)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                          menuItem.inStock
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                        title="Click to toggle stock status"
                      >
                        {menuItem.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteMenuItem(menuItem.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRO PLAN & SUBSCRIPTION */}
        {activeTab === 'subscription' && (
          <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Subscription Status</span>
                <h3 className="text-base font-black text-[#11241C] dark:text-white flex items-center gap-1.5 mt-0.5">
                  {restaurant.subscription?.plan === 'monthly' || restaurant.subscription?.plan === 'yearly' ? (
                    <>
                      <span>MYJPG Premium</span>
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                        {restaurant.subscription.plan}
                      </span>
                    </>
                  ) : restaurant.subscription?.status === 'trial' ? (
                    <>
                      <span>MYJPG Free Trial</span>
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                        TRIAL
                      </span>
                    </>
                  ) : (
                    <span>Premium Expired</span>
                  )}
                </h3>
                
                {restaurant.subscription?.status === 'trial' && restaurant.subscription.trialEndsAt && (
                   <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                     {Math.max(0, Math.ceil((new Date(restaurant.subscription.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days remaining
                   </p>
                )}
                {(restaurant.subscription?.plan === 'monthly' || restaurant.subscription?.plan === 'yearly') && restaurant.subscription.subscriptionEndsAt && (
                   <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                     Active until {new Date(restaurant.subscription.subscriptionEndsAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                   </p>
                )}
                {restaurant.subscription?.status === 'expired' && (
                   <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
                     Upgrade to unlock premium restaurantOwner tools.
                   </p>
                )}
              </div>
              <ShieldCheck className="w-8 h-8 text-[#2563EB] dark:text-[#38BDF8]" />
            </div>

            {restaurant.subscription?.status === 'trial' && (
              <div className="p-4 bg-blue-50 dark:bg-[#111C35] border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2563EB] dark:text-[#38BDF8]" />
                  <h4 className="text-xs font-black text-[#1D4ED8] dark:text-[#E0F2FE]">
                    Enjoy your free restaurantOwner access
                  </h4>
                </div>
                <p className="text-[11px] font-semibold text-blue-800 dark:text-blue-200 leading-snug">
                  You have full access to all premium restaurantOwner tools during your trial. Grow your business!
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs shadow-xs cursor-pointer active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all"
                >
                  Upgrade Plan
                </button>
              </div>
            )}
            
            {(restaurant.subscription?.plan === 'monthly' || restaurant.subscription?.plan === 'yearly') && (
              <div className="p-4 bg-blue-50 dark:bg-[#111C35] border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-blue-900 dark:text-blue-100">
                  You are enjoying MYJPG Premium benefits.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full py-2.5 rounded-xl bg-white dark:bg-white/10 text-[#2563EB] dark:text-[#38BDF8] border border-blue-200 dark:border-blue-800 font-black text-xs shadow-xs cursor-pointer hover:bg-blue-50 transition-all"
                >
                  Manage Plan
                </button>
              </div>
            )}

            {restaurant.subscription?.status === 'expired' && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <h4 className="text-xs font-black text-rose-900 dark:text-rose-200">
                    Your free restaurantOwner period has ended
                  </h4>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs shadow-xs cursor-pointer active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all"
                >
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPLETE PROFILE & STORE SETTINGS */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveRestaurantProfile} className="space-y-4">
            {/* Completion Status & View Live Coffee */}
            <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 block uppercase">Restaurant Status</span>
                  <h3 className="text-sm font-black text-[#11241C] dark:text-white">
                    {restaurant.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('restaurant-detail', { restaurantId: restaurant.id })}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 text-xs font-bold text-[#007AFF] dark:text-blue-400 flex items-center gap-1 hover:bg-gray-100 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View in App</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-1">
                  <span>Profile Strength</span>
                  <span className="text-blue-600 dark:text-blue-400 font-black">
                    {restaurant.photoUrl && restaurant.description ? '95%' : '65%'}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#007AFF] dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: restaurant.photoUrl && restaurant.description ? '95%' : '65%' }}
                  />
                </div>
              </div>

              {profileSaveSuccess && (
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/40 rounded-xl text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Restaurant profile updated successfully!</span>
                </div>
              )}
            </div>

            {/* Photos & Coffeefront Image */}
            <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#007AFF] dark:text-blue-400" />
                <h4 className="text-xs font-black text-[#11241C] dark:text-white">
                  Storefront Photo (দোকানের ছবি)
                </h4>
              </div>

              {editPhotoUrl && (
                <div className="relative rounded-2xl overflow-hidden h-32 border border-gray-200 dark:border-white/10">
                  <img
                    src={editPhotoUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={editPhotoUrl}
                  onChange={(e) => setEditPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl text-xs font-semibold text-[#11241C] dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Description & AI Auto-Write */}
            <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#11241C] dark:text-white">
                  Restaurant Bio / Description (পরিচিতি)
                </h4>
                <button
                  type="button"
                  onClick={handleGenerateAiBioInDashboard}
                  disabled={isGeneratingAiBio}
                  className="text-[10px] font-bold text-blue-800 dark:text-blue-300 bg-[#eff6ff] dark:bg-blue-950/70 hover:bg-[#dbeafe] px-2.5 py-1 rounded-lg border border-blue-300/50 flex items-center gap-1 cursor-pointer"
                >
                  {isGeneratingAiBio ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Writing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>AI Rewrite</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Describe your specialties, freshness guarantee, or famous offerings in Jalpaiguri..."
                className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl text-xs font-semibold text-[#11241C] dark:text-white focus:outline-none"
              />
            </div>

            {/* Operating Hours & Days */}
            <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#007AFF] dark:text-blue-400" />
                <h4 className="text-xs font-black text-[#11241C] dark:text-white">
                  Operating Hours & Weekly Off
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">Opens At</label>
                  <input
                    type="text"
                    value={editOpenTime}
                    onChange={(e) => setEditOpenTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-bold text-[#11241C] dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">Closes At</label>
                  <input
                    type="text"
                    value={editCloseTime}
                    onChange={(e) => setEditCloseTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-bold text-[#11241C] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">Weekly Off Day</label>
                <select
                  value={editWeeklyOff}
                  onChange={(e) => setEditWeeklyOff(e.target.value)}
                  className="w-full px-2.5 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl text-xs font-bold text-[#11241C] dark:text-white focus:outline-none"
                >
                  <option value="None">None (Open 7 Days)</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                </select>
              </div>
            </div>

            {/* Delivery & UPI */}
            <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#007AFF] dark:text-blue-400" />
                <h4 className="text-xs font-black text-[#11241C] dark:text-white">
                  Delivery & Payments
                </h4>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] dark:bg-white/5 rounded-xl border border-gray-200/50 dark:border-white/10">
                <span className="text-xs font-bold text-[#11241C] dark:text-white">Home Delivery Available</span>
                <input
                  type="checkbox"
                  checked={editDeliveryAvailable}
                  onChange={(e) => setEditDeliveryAvailable(e.target.checked)}
                  className="w-4 h-4 accent-[#007AFF]"
                />
              </div>

              {editDeliveryAvailable && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">Max Radius (km)</label>
                    <input
                      type="text"
                      value={editDeliveryRadius}
                      onChange={(e) => setEditDeliveryRadius(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-bold text-[#11241C] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">Min Order (₹)</label>
                    <input
                      type="text"
                      value={editMinOrder}
                      onChange={(e) => setEditMinOrder(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-bold text-[#11241C] dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-0.5">
                  RestaurantOwner UPI ID (for QR payment)
                </label>
                <input
                  type="text"
                  value={editUpiId}
                  onChange={(e) => setEditUpiId(e.target.value)}
                  placeholder="e.g. 9832012345@okaxis"
                  className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl text-xs font-semibold text-[#11241C] dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full py-3 rounded-2xl bg-[#007AFF] dark:bg-blue-600 hover:bg-[#084D3A] text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Updates</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* MODAL 1: ADD SINGLE PRODUCT */}
      {showAddMenuItemModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl max-w-sm w-full p-5 space-y-3 border border-[#E8E4DA] dark:border-white/10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-[#11241C] dark:text-white">
                Add MenuItem to Catalog
              </h3>
              <button
                onClick={() => setShowAddMenuItemModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMenuItemSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">MenuItem Name *</label>
                <input
                  type="text"
                  required
                  value={newMenuItemName}
                  onChange={(e) => setNewMenuItemName(e.target.value)}
                  placeholder="e.g. Miniket Rice (5kg Bag)"
                  className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">Bengali Name (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={newMenuItemNameBn}
                  onChange={(e) => setNewMenuItemNameBn(e.target.value)}
                  placeholder="যেমন: মিনিকেট চাল"
                  className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#11241C] dark:text-white mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newMenuItemPrice}
                    onChange={(e) => setNewMenuItemPrice(e.target.value)}
                    placeholder="260"
                    className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#11241C] dark:text-white mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={newMenuItemDiscount}
                    onChange={(e) => setNewMenuItemDiscount(e.target.value)}
                    placeholder="240"
                    className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#11241C] dark:text-white mb-1">Unit</label>
                  <select
                    value={newMenuItemUnit}
                    onChange={(e) => setNewMenuItemUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                  >
                    <option value="piece">piece (টি)</option>
                    <option value="kg">kg (কেজি)</option>
                    <option value="gm">gm (গ্রাম)</option>
                    <option value="litre">litre (লিটার)</option>
                    <option value="packet">packet (প্যাকেট)</option>
                    <option value="box">box (বাক্স)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#11241C] dark:text-white mb-1">Category</label>
                  <input
                    type="text"
                    value={newMenuItemCategory}
                    onChange={(e) => setNewMenuItemCategory(e.target.value)}
                    placeholder="e.g. Grocery"
                    className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">Photo URL (ঐচ্ছিক)</label>
                <input
                  type="url"
                  value={newMenuItemPhoto}
                  onChange={(e) => setNewMenuItemPhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={newMenuItemInStock}
                  onChange={(e) => setNewMenuItemInStock(e.target.checked)}
                  className="w-4 h-4 accent-[#007AFF]"
                />
                <label htmlFor="inStockCheck" className="font-bold text-[#11241C] dark:text-white">
                  Available in stock immediately
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMenuItemModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E4DA] dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMenuItem}
                  className="px-5 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  {isSubmittingMenuItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save MenuItem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AI SMART PRODUCT IMPORT */}
      {showAiImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl max-w-md w-full p-5 space-y-3 border border-[#E8E4DA] dark:border-white/10 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-800 dark:text-blue-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-[#11241C] dark:text-white">
                  AI Smart MenuItem Import
                </h3>
              </div>
              <button
                onClick={() => setShowAiImportModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 text-xs">
              <p className="text-[#55685F] dark:text-[#A2B3AA] font-semibold">
                Paste any supplier invoice, handwritten list, or raw menu text below. Gemini 2.5 will structure it automatically into menuItem name, Bengali title, price, unit and category!
              </p>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#11241C] dark:text-white">Raw Inventory / Bill Text</label>
                  <button
                    type="button"
                    onClick={() => {
                      setImportRawText(`1. Aashirvaad Atta 5kg - Rs 235
2. Fortune Mustard Oil 1Ltr - Rs 142 (discount 138)
3. Tata Salt 1kg - Rs 28
4. Sugar 1kg - Rs 44
5. Amul Butter 100g - Rs 58`);
                    }}
                    className="text-[10px] text-blue-700 dark:text-blue-400 font-bold underline cursor-pointer"
                  >
                    Load Sample List
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={importRawText}
                  onChange={(e) => setImportRawText(e.target.value)}
                  placeholder="Paste inventory text here..."
                  className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-mono text-xs font-semibold text-[#11241C] dark:text-white focus:outline-none"
                />
              </div>

              <button
                onClick={handleRunAiExtraction}
                disabled={isExtractingAi || !importRawText.trim()}
                className="w-full py-2.5 rounded-xl bg-[#007AFF] dark:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isExtractingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting MenuItems with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract & Preview Items</span>
                  </>
                )}
              </button>

              {/* Extracted preview table */}
              {extractedMenuItems.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#F0ECE1] dark:border-white/10">
                  <span className="font-black text-xs text-blue-800 dark:text-blue-400 block">
                    ✓ {extractedMenuItems.length} Items Extracted Successfully:
                  </span>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {extractedMenuItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <p className="font-bold text-[#11241C] dark:text-white">{item.name}</p>
                          <span className="text-[10px] text-gray-500">{item.category} • {item.unit}</span>
                        </div>
                        <span className="font-black text-blue-700 dark:text-blue-400">
                          ₹{item.price}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSaveAllExtracted}
                    disabled={isSavingExtracted}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    {isSavingExtracted ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save All to My Restaurant Catalog</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PRO PLAN UPGRADE */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-[#F8FBFF] dark:bg-[#020617] overflow-y-auto">
          <div className="min-h-screen pb-10">
            <div className="sticky top-0 bg-[#F8FBFF]/90 dark:bg-[#020617]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between z-10 border-b border-blue-100 dark:border-white/10">
               <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-10 h-10 rounded-full bg-white dark:bg-[#0B1224] border border-blue-100 dark:border-white/10 flex items-center justify-center text-[#0F172A] dark:text-white shadow-xs"
               >
                 <ArrowLeft className="w-5 h-5" />
               </button>
            </div>
            
            <div className="px-5 pt-4 pb-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#38BDF8] mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                 <Coffee className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-[#0F172A] dark:text-white">
                Grow Your Restaurant with MYJPG Premium
              </h3>
              <p className="text-xs text-[#0F172A]/70 dark:text-gray-400 mt-2 font-medium max-w-xs mx-auto">
                More visibility. Better tools. More ways to reach local customers.
              </p>
            </div>

            <div className="px-4 space-y-4 max-w-md mx-auto">
              {/* Yearly Plan (Best Value) */}
              <div
                onClick={() => setSelectedPlan('yearly')}
                className={`relative p-5 rounded-3xl border-2 cursor-pointer transition-all ${
                  selectedPlan === 'yearly'
                    ? 'border-[#2563EB] bg-white dark:bg-[#111C35] shadow-lg shadow-blue-500/10'
                    : 'border-blue-100 dark:border-white/10 bg-white/50 dark:bg-[#0B1224]'
                }`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#2563EB] to-[#38BDF8] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  BEST VALUE
                </div>
                
                <div className="text-center mt-2 border-b border-blue-50 dark:border-white/5 pb-4">
                  <h4 className="font-extrabold text-[#0F172A] dark:text-white text-lg">MYJPG Premium Yearly</h4>
                  <div className="mt-2 flex items-baseline justify-center gap-1">
                     <span className="font-black text-2xl text-[#2563EB] dark:text-[#38BDF8]">₹4,999</span>
                     <span className="text-xs text-gray-500 font-semibold">/ year</span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-500 mt-1">≈ ₹417/month</p>
                  <p className="text-[11px] font-bold text-[#1D4ED8] dark:text-[#38BDF8] bg-blue-50 dark:bg-blue-900/30 inline-block px-2 py-1 rounded-lg mt-2">
                    Save ₹1,001 compared with 12 monthly payments
                  </p>
                </div>
                
                {selectedPlan === 'yearly' && (
                  <button
                    onClick={handleUpgradePlan}
                    disabled={isUpgradingPlan}
                    className="w-full mt-4 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-sm flex items-center justify-center shadow-md cursor-pointer"
                  >
                    {isUpgradingPlan ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upgrade for ₹4,999/year'}
                  </button>
                )}
              </div>

              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`p-5 rounded-3xl border-2 cursor-pointer transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-[#2563EB] bg-white dark:bg-[#111C35] shadow-lg shadow-blue-500/10'
                    : 'border-blue-100 dark:border-white/10 bg-white/50 dark:bg-[#0B1224]'
                }`}
              >
                <div className="flex justify-between items-start border-b border-blue-50 dark:border-white/5 pb-3">
                  <div>
                    <span className="bg-blue-100 text-[#1D4ED8] dark:bg-blue-900/50 dark:text-[#38BDF8] text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                      FLEXIBLE
                    </span>
                    <h4 className="font-extrabold text-[#0F172A] dark:text-white text-base mt-1.5">MYJPG Premium Monthly</h4>
                  </div>
                  <div className="text-right">
                     <span className="font-black text-xl text-[#2563EB] dark:text-[#38BDF8] block">₹500</span>
                     <span className="text-[10px] text-gray-500 font-semibold">/ month</span>
                  </div>
                </div>
                
                {selectedPlan === 'monthly' && (
                  <button
                    onClick={handleUpgradePlan}
                    disabled={isUpgradingPlan}
                    className="w-full mt-4 py-3.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-sm flex items-center justify-center shadow-md cursor-pointer"
                  >
                    {isUpgradingPlan ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upgrade for ₹500/month'}
                  </button>
                )}
              </div>
              
              {/* Premium Features List */}
              <div className="bg-white dark:bg-[#111C35] rounded-3xl p-5 border border-blue-100 dark:border-white/10 mt-6">
                 <h4 className="font-black text-sm text-[#0F172A] dark:text-white mb-4">What's included in Premium:</h4>
                 <div className="grid grid-cols-1 gap-2.5 text-[11px] font-semibold text-[#0F172A]/80 dark:text-gray-300">
                    <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" /> Enhanced restaurant visibility</div>
                    <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" /> Priority placement in local searches</div>
                    <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" /> Unlimited menuItem/catalogue management</div>
                    <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" /> MenuItem price and stock updates</div>
                    <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" /> Upload PDF/JPG catalogues</div>
                    <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" /> AI-assisted catalogue extraction</div>
                    <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" /> Customer enquiry management</div>
                    <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" /> Restaurant announcements & promotions</div>
                    <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" /> Advanced restaurant analytics & insights</div>
                 </div>
              </div>

              {/* Mobile-Friendly Comparison */}
              <div className="bg-white dark:bg-[#111C35] rounded-3xl p-5 border border-blue-100 dark:border-white/10 mt-4 mb-8">
                <h4 className="font-black text-sm text-[#0F172A] dark:text-white mb-4 text-center">Plan Comparison</h4>
                <div className="space-y-0 text-[11px] font-medium">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                     <span className="text-[#0F172A] dark:text-gray-300">Restaurant Profile</span>
                     <div className="flex items-center gap-4 text-center font-bold">
                       <span className="w-10 text-gray-400">Free</span>
                       <span className="w-10 text-[#2563EB]">Pro</span>
                     </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                     <span className="text-[#0F172A] dark:text-gray-300">Basic MenuItem Listing</span>
                     <div className="flex items-center gap-4 text-center">
                       <Check className="w-10 h-3 text-gray-400" />
                       <Check className="w-10 h-3 text-[#2563EB]" />
                     </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                     <span className="text-[#0F172A] dark:text-gray-300">Customer Enquiries</span>
                     <div className="flex items-center gap-4 text-center">
                       <Check className="w-10 h-3 text-gray-400" />
                       <Check className="w-10 h-3 text-[#2563EB]" />
                     </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                     <span className="text-[#0F172A] dark:text-gray-300">Advanced Catalogue</span>
                     <div className="flex items-center gap-4 text-center">
                       <span className="w-10 text-gray-300">—</span>
                       <Check className="w-10 h-3 text-[#2563EB]" />
                     </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                     <span className="text-[#0F172A] dark:text-gray-300">Advanced Analytics</span>
                     <div className="flex items-center gap-4 text-center">
                       <span className="w-10 text-gray-300">—</span>
                       <Check className="w-10 h-3 text-[#2563EB]" />
                     </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                     <span className="text-[#0F172A] dark:text-gray-300">Featured Restaurant Status</span>
                     <div className="flex items-center gap-4 text-center">
                       <span className="w-10 text-gray-300">—</span>
                       <Check className="w-10 h-3 text-[#2563EB]" />
                     </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
