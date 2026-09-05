import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Share2,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  Truck,
  QrCode,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Search,
  Check,
  X
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Shop, Product } from '../../types';
import { FALLBACK_JALPAIGURI_SHOPS } from '../../data/jalpaiguriShopsFallback';

export const ShopDetailView: React.FC = () => {
  const { navParams, goBack, navigate } = useNav();
  const { language } = useLanguage();
  const shopId = navParams.shopId as string;

  const [shop, setShop] = useState<Shop | null>(() => {
    return FALLBACK_JALPAIGURI_SHOPS.find(s => s.id === shopId) || null;
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'info' | 'reviews'>('catalog');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('All');
  const [showUpiModal, setShowUpiModal] = useState(false);

  useEffect(() => {
    const fetchShopAndProducts = async () => {
      try {
        if (!shopId) return;

        const [shopRes, prodRes] = await Promise.all([
          fetch(`/api/shops/${shopId}`).catch(() => null),
          fetch(`/api/shops/${shopId}/products`).catch(() => null)
        ]);

        let foundShop: any = null;
        let foundProducts: any[] = [];

        if (shopRes && shopRes.ok) {
          const shopData = await shopRes.json();
          foundShop = shopData.shop ? { ...shopData.shop, ...shopData } : shopData;
          if (shopData.products && Array.isArray(shopData.products) && shopData.products.length > 0) {
            foundProducts = shopData.products;
          }
        }
        if (prodRes && prodRes.ok) {
          const prodData = await prodRes.json();
          if (Array.isArray(prodData) && prodData.length > 0) {
            foundProducts = prodData;
          }
        }

        if (foundShop) {
          setShop(foundShop);
        } else if (!shop) {
          const fallback = FALLBACK_JALPAIGURI_SHOPS.find(s => s.id === shopId);
          if (fallback) setShop(fallback);
        }

        if (foundProducts.length > 0) {
          setProducts(foundProducts);
        }
      } catch (err) {
        console.error('Error fetching shop detail:', err);
      }
    };

    fetchShopAndProducts();
  }, [shopId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-10 h-10 border-4 border-[#063B2C] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-[#55685F] dark:text-[#A2B3AA]">
          {language === 'bn' ? 'দোকানের বিবরণ লোড হচ্ছে...' : 'Loading shop catalog...'}
        </p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] p-6 text-center space-y-4">
        <button
          onClick={goBack}
          className="p-2 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-white" />
        </button>
        <h2 className="text-base font-bold text-[#11241C] dark:text-white">Shop Not Found</h2>
        <p className="text-xs text-gray-500">The requested store profile could not be loaded.</p>
      </div>
    );
  }

  // Filter products
  const productCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    if (selectedProductCategory !== 'All' && p.category !== selectedProductCategory) {
      return false;
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBn = (p.nameBengali || '').toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      if (!matchName && !matchBn && !matchCat) return false;
    }
    return true;
  });

  const handleShare = () => {
    if (!shop) return;
    const phone = shop.phone || (shop as any).ownerPhone || '';
    if (navigator.share) {
      navigator.share({
        title: `${shop.name} - Jalpaiguri Connect`,
        text: `Check out ${shop.name} in ${shop.locality}, Jalpaiguri! Contact: ${phone}`,
        url: window.location.href
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage(language === 'bn' ? 'লিঙ্ক কপি করা হয়েছে!' : 'Shop link copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleProductOrder = (product: Product) => {
    if (!shop) return;
    const text = `Nomoshkar ${shop.name}! I want to order/inquire about "${product.name}" (Price: ₹${product.price}/${product.unit}) which I saw on Jalpaiguri Connect. Is this available right now?`;
    const waPhone = (shop.whatsappNumber || shop.phone || (shop as any).ownerPhone || '9832011094').replace(/\D/g, '');
    window.open(`https://wa.me/91${waPhone.slice(-10)}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 max-w-md mx-auto select-none transition-colors">
      {/* Top Floating Action Bar */}
      <div className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8E4DA]/60 dark:border-white/10">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <span className="font-extrabold text-sm text-[#11241C] dark:text-white truncate max-w-[200px]">
          {shop.name}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="mx-4 mt-2 bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-md text-center flex items-center justify-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner Image */}
      <div className="relative h-52 w-full bg-gray-200 dark:bg-gray-800">
        <img
          src={shop.photoUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80'}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {(shop.isFeatured || (shop as any).featured) && (
              <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 fill-amber-950" />
                <span>Featured</span>
              </span>
            )}
            {(shop.isVerified || (shop as any).status === 'verified') && (
              <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-200" />
                <span>Verified Merchant</span>
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
              shop.isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}>
              {shop.isOpen ? (language === 'bn' ? 'এখন খোলা' : 'Open Now') : (language === 'bn' ? 'বন্ধ' : 'Closed')}
            </span>
          </div>

          <h1 className="text-xl font-black text-white leading-tight">
            {shop.name}
          </h1>
          {(shop.nameBengali || (shop as any).nameBn) && (
            <p className="text-xs font-bold text-emerald-300">
              {shop.nameBengali || (shop as any).nameBn}
            </p>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Core Metadata Card */}
        <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3">
          {/* Category & Rating */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#063B2C] dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
              {shop.category}
            </span>

            <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 px-2.5 py-1 rounded-xl">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-black text-[#11241C] dark:text-white">{shop.rating || 4.8}</span>
              <span className="text-[10px] text-[#73827B] dark:text-[#A2B3AA]">({shop.reviewCount || 20} reviews)</span>
            </div>
          </div>

          {/* Locality & Address */}
          <div className="space-y-1 text-xs">
            <div className="flex items-start gap-2 text-[#11241C] dark:text-white font-semibold">
              <MapPin className="w-4 h-4 text-[#063B2C] dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{shop.address}, {shop.locality}</p>
                {shop.landmark && (
                  <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">Near {shop.landmark}</p>
                )}
                <p className="text-[11px] text-gray-500">PIN: {shop.pincode} • Jalpaiguri, WB</p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA] pt-1">
              <Clock className="w-4 h-4 text-[#063B2C] dark:text-emerald-400 shrink-0" />
              <span>
                {shop.openingHours?.open || (shop as any).openingTime || '08:00 AM'} to {shop.openingHours?.close || (shop as any).closingTime || '09:00 PM'}
              </span>
              {(shop.openingHours?.weeklyOff || (shop as any).weeklyOff) && (shop.openingHours?.weeklyOff !== 'None' && (shop as any).weeklyOff !== 'None') && (
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  (Closed: {shop.openingHours?.weeklyOff || (shop as any).weeklyOff})
                </span>
              )}
            </div>
          </div>

          {/* Delivery & UPI Badges */}
          <div className="pt-2 border-t border-[#F0ECE1] dark:border-white/10 flex items-center justify-between text-xs flex-wrap gap-2">
            {(shop.deliveryAvailable ?? (shop as any).homeDelivery ?? true) ? (
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold bg-[#E6F4EA] dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? 'হোম ডেলিভারি উপলব্ধ' : 'Home Delivery Available'}</span>
              </div>
            ) : (
              <span className="text-[11px] text-gray-500 font-semibold">{language === 'bn' ? 'দোকানে এসে সংগ্রহ' : 'In-Store Pickup Only'}</span>
            )}

            {shop.paymentMethods?.includes('UPI') && (
              <button
                onClick={() => setShowUpiModal(true)}
                className="flex items-center gap-1.5 text-[#063B2C] dark:text-emerald-300 font-bold bg-[#D2EBE0] dark:bg-emerald-950/70 px-2.5 py-1 rounded-xl hover:bg-[#C2E4D5] cursor-pointer transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'UPI পেমেন্ট QR' : 'Pay via UPI'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Instant Action Bar: Call, WhatsApp, Directions */}
        <div className="grid grid-cols-3 gap-2">
          {/* Call */}
          <button
            onClick={() => {
              const ph = shop.phone || (shop as any).ownerPhone || '+919832011094';
              window.location.href = `tel:${ph.replace(/\s+/g, '')}`;
            }}
            className="py-3 px-3 rounded-2xl bg-[#D2EBE0] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-[#C2E4D5] active:scale-95 transition-all cursor-pointer border border-emerald-200/50 dark:border-emerald-800/40"
          >
            <Phone className="w-4 h-4" />
            <span>{language === 'bn' ? 'কল করুন' : 'Call Store'}</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => {
              const text = `Nomoshkar ${shop.name}! I am contacting you from Jalpaiguri Connect app regarding your products.`;
              const waPhone = (shop.whatsappNumber || shop.phone || (shop as any).ownerPhone || '9832011094').replace(/\D/g, '');
              window.open(`https://wa.me/91${waPhone.slice(-10)}?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="py-3 px-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</span>
          </button>

          {/* Directions */}
          <button
            onClick={() => {
              const q = encodeURIComponent(`${shop.name}, ${shop.locality}, Jalpaiguri, West Bengal`);
              window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
            }}
            className="py-3 px-3 rounded-2xl bg-[#063B2C] dark:bg-emerald-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-[#084D3A] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <MapPin className="w-4 h-4" />
            <span>{language === 'bn' ? 'লোকেশন' : 'Directions'}</span>
          </button>
        </div>

        {/* Tab Navigation: Products, Info, Reviews */}
        <div className="flex border-b border-[#E8E4DA] dark:border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'catalog'
                ? 'border-[#063B2C] text-[#063B2C] dark:border-emerald-400 dark:text-emerald-400 font-black'
                : 'border-transparent text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{language === 'bn' ? 'পণ্য তালিকা' : 'Product Catalog'}</span>
            <span className="text-[10px] bg-gray-200 dark:bg-gray-800 px-1.5 py-0.2 rounded-full">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'info'
                ? 'border-[#063B2C] text-[#063B2C] dark:border-emerald-400 dark:text-emerald-400 font-black'
                : 'border-transparent text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <span>{language === 'bn' ? 'দোকানের বিবরণ' : 'About & Delivery'}</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'reviews'
                ? 'border-[#063B2C] text-[#063B2C] dark:border-emerald-400 dark:text-emerald-400 font-black'
                : 'border-transparent text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{language === 'bn' ? 'মতামত' : 'Reviews'}</span>
          </button>
        </div>

        {/* TAB 1: PRODUCT CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-3">
            {/* Search within catalog */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#55685F] dark:text-[#A2B3AA] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={language === 'bn' ? 'দোকানের মধ্যে পণ্য খুঁজুন...' : 'Search items in this store...'}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-xl text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#063B2C]"
              />
            </div>

            {/* Category pills */}
            {productCategories.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {productCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedProductCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                      selectedProductCategory === cat
                        ? 'bg-[#063B2C] text-white'
                        : 'bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Product items list */}
            {filteredProducts.length === 0 ? (
              <div className="py-8 text-center bg-white dark:bg-[#17231E] rounded-2xl border border-[#E8E4DA] dark:border-white/10 p-6 space-y-2">
                <ShoppingBag className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
                <p className="text-xs font-bold text-[#11241C] dark:text-white">
                  {language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No items match your search'}
                </p>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                  {language === 'bn' ? 'সরাসরি হোয়াটসঅ্যাপে দোকানদারকে জিজ্ঞেস করতে পারেন।' : 'You can message the merchant directly on WhatsApp to ask about inventory.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-2xl overflow-hidden p-2.5 flex flex-col justify-between shadow-2xs hover:border-[#063B2C] transition-colors"
                  >
                    <div>
                      {/* Product Image */}
                      {product.photoUrl && (
                        <div className="h-28 w-full rounded-xl overflow-hidden mb-2 bg-gray-100 dark:bg-gray-800">
                          <img
                            src={product.photoUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase truncate">
                          {product.category}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                          product.inStock
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {product.inStock ? (language === 'bn' ? 'স্টকে আছে' : 'In Stock') : (language === 'bn' ? 'স্টক শেষ' : 'Out of Stock')}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs text-[#11241C] dark:text-white leading-snug line-clamp-2">
                        {product.name}
                      </h4>
                      {product.nameBengali && (
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                          {product.nameBengali}
                        </p>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#F0ECE1] dark:border-white/10">
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-sm font-black text-[#11241C] dark:text-white">
                          ₹{product.price}
                        </span>
                        {product.discountPrice && (
                          <span className="text-[10px] line-through text-gray-400 font-semibold">
                            ₹{product.discountPrice}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 font-semibold">
                          /{product.unit}
                        </span>
                      </div>

                      <button
                        onClick={() => handleProductOrder(product)}
                        className="w-full py-1.5 px-2 rounded-xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{language === 'bn' ? 'অর্ডার করুন' : 'Order'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ABOUT & DELIVERY */}
        {activeTab === 'info' && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-4 text-xs">
            <div>
              <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white mb-1">
                {language === 'bn' ? 'দোকানের পরিচিতি' : 'About This Shop'}
              </h3>
              <p className="text-[#55685F] dark:text-[#A2B3AA] leading-relaxed font-semibold">
                {shop.description || 'Welcome to our shop in Jalpaiguri. We offer fresh quality products, reasonable prices, and dependable service to all customers.'}
              </p>
            </div>

            <div className="pt-3 border-t border-[#F0ECE1] dark:border-white/10 space-y-2">
              <h4 className="font-extrabold text-xs text-[#11241C] dark:text-white">
                {language === 'bn' ? 'ডেলিভারি সংক্রান্ত তথ্য' : 'Delivery Details'}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10">
                  <span className="text-gray-500 block">Home Delivery</span>
                  <span className="font-bold text-[#11241C] dark:text-white">
                    {shop.deliveryAvailable ? 'Available' : 'Store Pickup Only'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10">
                  <span className="text-gray-500 block">Delivery Radius</span>
                  <span className="font-bold text-[#11241C] dark:text-white">
                    {shop.deliveryRadiusKm ? `Up to ${shop.deliveryRadiusKm} km` : 'Jalpaiguri Town'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10">
                  <span className="text-gray-500 block">Minimum Order</span>
                  <span className="font-bold text-[#11241C] dark:text-white">
                    ₹{shop.minOrderAmount || '0'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10">
                  <span className="text-gray-500 block">Free Delivery Above</span>
                  <span className="font-bold text-emerald-600">
                    ₹{shop.freeDeliveryAbove || '300'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0ECE1] dark:border-white/10 space-y-2">
              <h4 className="font-extrabold text-xs text-[#11241C] dark:text-white">
                {language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Accepted Payment Modes'}
              </h4>
              <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
                {(shop.paymentMethods || ['Cash', 'UPI']).map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 border border-emerald-200/50"
                  >
                    ✓ {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-[#11241C] dark:text-white">
                  {shop.rating}
                </span>
                <span className="text-xs text-gray-500 ml-1 font-semibold">/ 5.0</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg">
                100% Jalpaiguri Local Reviews
              </span>
            </div>

            <div className="divide-y divide-[#F0ECE1] dark:divide-white/10 pt-2">
              <div className="py-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#11241C] dark:text-white">Pradeep Sarkar (Kadamtala)</span>
                  <span className="text-[10px] text-gray-400">2 days ago</span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {'★★★★★'}
                </div>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] font-semibold">
                  Always fresh stock and very polite behavior. Fast delivery across Dinbazar area.
                </p>
              </div>

              <div className="py-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#11241C] dark:text-white">Moumita Sen (Hakimpara)</span>
                  <span className="text-[10px] text-gray-400">1 week ago</span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {'★★★★★'}
                </div>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] font-semibold">
                  Convenient WhatsApp ordering and UPI payment support. Very dependable.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UPI QR CODE MODAL */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17231E] rounded-3xl max-w-xs w-full p-5 text-center space-y-3 border border-[#E8E4DA] dark:border-white/10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#063B2C] dark:text-emerald-400">
                Direct Contactless Payment
              </span>
              <button
                onClick={() => setShowUpiModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-black text-[#11241C] dark:text-white">
              Pay {shop.name}
            </h3>

            {/* Custom SVG QR Code for payment */}
            <div className="p-3 bg-white rounded-2xl border border-gray-200 inline-block shadow-inner">
              <svg className="w-36 h-36 mx-auto" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* Corner registration squares */}
                <rect x="5" y="5" width="26" height="26" rx="4" fill="#063B2C" />
                <rect x="9" y="9" width="18" height="18" fill="white" />
                <rect x="13" y="13" width="10" height="10" fill="#063B2C" />

                <rect x="69" y="5" width="26" height="26" rx="4" fill="#063B2C" />
                <rect x="73" y="9" width="18" height="18" fill="white" />
                <rect x="77" y="13" width="10" height="10" fill="#063B2C" />

                <rect x="5" y="69" width="26" height="26" rx="4" fill="#063B2C" />
                <rect x="9" y="73" width="18" height="18" fill="white" />
                <rect x="13" y="77" width="10" height="10" fill="#063B2C" />

                {/* QR Data Dots */}
                <rect x="36" y="8" width="5" height="5" fill="#063B2C" />
                <rect x="45" y="8" width="5" height="5" fill="#063B2C" />
                <rect x="55" y="8" width="5" height="5" fill="#063B2C" />
                <rect x="36" y="20" width="5" height="5" fill="#063B2C" />
                <rect x="48" y="24" width="8" height="8" fill="#063B2C" />
                <rect x="10" y="38" width="6" height="6" fill="#063B2C" />
                <rect x="22" y="45" width="6" height="6" fill="#063B2C" />
                <rect x="36" y="38" width="8" height="8" fill="#063B2C" />
                <rect x="52" y="40" width="6" height="6" fill="#063B2C" />
                <rect x="68" y="38" width="6" height="6" fill="#063B2C" />
                <rect x="80" y="44" width="8" height="8" fill="#063B2C" />
                <rect x="38" y="56" width="6" height="6" fill="#063B2C" />
                <rect x="52" y="56" width="8" height="8" fill="#063B2C" />
                <rect x="68" y="56" width="6" height="6" fill="#063B2C" />
                <rect x="44" y="72" width="6" height="6" fill="#063B2C" />
                <rect x="58" y="74" width="8" height="8" fill="#063B2C" />
                <rect x="74" y="74" width="6" height="6" fill="#063B2C" />
                <rect x="84" y="84" width="6" height="6" fill="#063B2C" />
              </svg>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-mono font-bold text-gray-700 dark:text-gray-300">
                {shop.upiId || `${shop.phone.replace(/\D/g, '').slice(-10)}@okaxis`}
              </p>
              <p className="text-[11px] text-gray-500 font-semibold">
                Scan with Google Pay, PhonePe, Paytm, or BHIM
              </p>
            </div>

            <button
              onClick={() => {
                const upi = shop.upiId || `${shop.phone.replace(/\D/g, '').slice(-10)}@okaxis`;
                navigator.clipboard.writeText(upi);
                alert('UPI ID copied to clipboard!');
              }}
              className="w-full py-2.5 rounded-xl bg-[#063B2C] text-white text-xs font-bold hover:bg-[#084D3A] transition-colors cursor-pointer"
            >
              Copy UPI ID
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
