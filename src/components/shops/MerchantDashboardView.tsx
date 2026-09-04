import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Store,
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
  QrCode
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Shop, Product } from '../../types';

export const MerchantDashboardView: React.FC = () => {
  const { navigate, goBack, navParams } = useNav();
  const { user, firebaseUser } = useAuth();
  const { language } = useLanguage();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'analytics' | 'subscription'>('products');

  // New product form modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductNameBn, setNewProductNameBn] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('General');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductDiscount, setNewProductDiscount] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('piece');
  const [newProductInStock, setNewProductInStock] = useState(true);
  const [newProductPhoto, setNewProductPhoto] = useState('');
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // AI Smart Import Modal
  const [showAiImportModal, setShowAiImportModal] = useState(false);
  const [importRawText, setImportRawText] = useState('');
  const [isExtractingAi, setIsExtractingAi] = useState(false);
  const [extractedProducts, setExtractedProducts] = useState<any[]>([]);
  const [isSavingExtracted, setIsSavingExtracted] = useState(false);

  // Subscription Modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgradingPlan, setIsUpgradingPlan] = useState(false);

  // Fetch shop for current user
  const fetchMerchantShop = async () => {
    try {
      setLoading(true);
      const currentShopId = navParams.shopId || localStorage.getItem('jpg_current_shop_id');

      let targetShop: Shop | null = null;

      if (currentShopId) {
        const res = await fetch(`/api/shops/${currentShopId}`);
        if (res.ok) {
          targetShop = await res.json();
        }
      }

      if (!targetShop) {
        // Find by ownerId or fallback to first shop
        const allRes = await fetch('/api/shops');
        if (allRes.ok) {
          const allShops: Shop[] = await allRes.json();
          const userId = user?.id || firebaseUser?.uid;
          targetShop = allShops.find(s => s.ownerId === userId) || allShops[0] || null;
        }
      }

      if (targetShop) {
        setShop(targetShop);
        // Fetch products
        const pRes = await fetch(`/api/shops/${targetShop.id}/products`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setProducts(pData);
        }
      }
    } catch (err) {
      console.error('Error fetching merchant data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantShop();
  }, []);

  // Toggle Live Shop Open/Close
  const handleToggleShopOpen = async () => {
    if (!shop) return;
    const newStatus = !shop.isOpen;
    setShop({ ...shop, isOpen: newStatus });

    try {
      await fetch(`/api/shops/${shop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: newStatus })
      });
    } catch (e) {
      console.warn('Failed to update shop status');
    }
  };

  // Toggle Product Stock status
  const handleToggleProductStock = async (product: Product) => {
    const updatedStock = !product.inStock;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, inStock: updatedStock } : p));

    try {
      await fetch(`/api/shops/${shop?.id}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: updatedStock })
      });
    } catch (e) {
      console.warn('Failed to update product stock');
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setProducts(prev => prev.filter(p => p.id !== productId));

    try {
      await fetch(`/api/shops/${shop?.id}/products/${productId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Failed to delete product');
    }
  };

  // Add Product Form Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !newProductName.trim() || !newProductPrice) return;

    setIsSubmittingProduct(true);
    try {
      const res = await fetch(`/api/shops/${shop.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName,
          nameBengali: newProductNameBn || undefined,
          category: newProductCategory,
          price: parseFloat(newProductPrice) || 0,
          discountPrice: newProductDiscount ? parseFloat(newProductDiscount) : undefined,
          unit: newProductUnit,
          inStock: newProductInStock,
          photoUrl: newProductPhoto || undefined
        })
      });

      if (res.ok) {
        const created = await res.json();
        setProducts(prev => [created, ...prev]);
        setShowAddProductModal(false);
        // Reset form
        setNewProductName('');
        setNewProductNameBn('');
        setNewProductPrice('');
        setNewProductDiscount('');
        setNewProductPhoto('');
      }
    } catch (err) {
      console.error('Failed to add product:', err);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // AI Extract Products
  const handleRunAiExtraction = async () => {
    if (!importRawText.trim()) return;
    setIsExtractingAi(true);

    try {
      const res = await fetch('/api/ai/extract-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: importRawText })
      });

      if (res.ok) {
        const data = await res.json();
        setExtractedProducts(data.products || []);
      }
    } catch (err) {
      console.error('AI extraction failed:', err);
    } finally {
      setIsExtractingAi(false);
    }
  };

  // Save all extracted products
  const handleSaveAllExtracted = async () => {
    if (!shop || extractedProducts.length === 0) return;
    setIsSavingExtracted(true);

    try {
      const res = await fetch(`/api/shops/${shop.id}/products/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: extractedProducts })
      });

      if (res.ok) {
        const saved = await res.json();
        setProducts(prev => [...saved, ...prev]);
        setShowAiImportModal(false);
        setExtractedProducts([]);
        setImportRawText('');
        alert(`Successfully imported ${saved.length} products to your shop catalog!`);
      }
    } catch (err) {
      console.error('Failed to batch save products:', err);
    } finally {
      setIsSavingExtracted(false);
    }
  };

  // Upgrade Subscription Plan
  const handleUpgradePlan = async () => {
    if (!shop) return;
    setIsUpgradingPlan(true);

    try {
      const res = await fetch(`/api/shops/${shop.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan })
      });

      if (res.ok) {
        const data = await res.json();
        setShop(prev => prev ? { ...prev, isFeatured: true } : null);
        setShowUpgradeModal(false);
        alert(`Congratulations! Your shop has been upgraded to ${selectedPlan.toUpperCase()} Merchant Pro! Priority ranking & verified badge are now active.`);
      }
    } catch (err) {
      console.error('Failed to upgrade subscription:', err);
    } finally {
      setIsUpgradingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-10 h-10 border-4 border-[#063B2C] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-[#55685F] dark:text-[#A2B3AA]">
          Loading Merchant Hub...
        </p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] p-6 text-center space-y-4">
        <button onClick={goBack} className="p-2 rounded-full bg-white dark:bg-[#17231E]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Store className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-base font-black text-[#11241C] dark:text-white">No Shop Found</h2>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">
          You haven't registered a shop on Jalpaiguri Connect yet.
        </p>
        <button
          onClick={() => navigate('add-shop')}
          className="px-4 py-2.5 rounded-xl bg-[#063B2C] text-white text-xs font-bold cursor-pointer"
        >
          + Register Your Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 max-w-md mx-auto select-none transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#0F1A15]/95 backdrop-blur-md px-4 py-3 border-b border-[#E8E4DA]/60 dark:border-white/10 transition-colors flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-base font-black text-[#11241C] dark:text-white leading-tight flex items-center gap-1.5">
              <span>{shop.name}</span>
            </h1>
            <p className="text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA]">
              Merchant Control Hub • {shop.locality}
            </p>
          </div>
        </div>

        {/* Live Open/Closed Toggle */}
        <button
          onClick={handleToggleShopOpen}
          className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
            shop.isOpen
              ? 'bg-emerald-500 text-white'
              : 'bg-rose-500 text-white'
          }`}
          title="Click to toggle store open/closed status"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <span>{shop.isOpen ? 'Store Open' : 'Store Closed'}</span>
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Quick Analytics Summary Strip */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-white dark:bg-[#17231E] p-2.5 rounded-2xl border border-[#E8E4DA] dark:border-white/10 shadow-2xs">
            <span className="text-[10px] text-gray-500 block font-semibold">Store Views</span>
            <span className="text-sm font-black text-[#11241C] dark:text-white">
              {shop.analytics?.views || 148}
            </span>
          </div>

          <div className="bg-white dark:bg-[#17231E] p-2.5 rounded-2xl border border-[#E8E4DA] dark:border-white/10 shadow-2xs">
            <span className="text-[10px] text-gray-500 block font-semibold">Calls</span>
            <span className="text-sm font-black text-emerald-600">
              {shop.analytics?.callClicks || 24}
            </span>
          </div>

          <div className="bg-white dark:bg-[#17231E] p-2.5 rounded-2xl border border-[#E8E4DA] dark:border-white/10 shadow-2xs">
            <span className="text-[10px] text-gray-500 block font-semibold">WhatsApp</span>
            <span className="text-sm font-black text-emerald-600">
              {shop.analytics?.whatsappClicks || 39}
            </span>
          </div>

          <div className="bg-white dark:bg-[#17231E] p-2.5 rounded-2xl border border-[#E8E4DA] dark:border-white/10 shadow-2xs">
            <span className="text-[10px] text-gray-500 block font-semibold">Products</span>
            <span className="text-sm font-black text-[#11241C] dark:text-white">
              {products.length}
            </span>
          </div>
        </div>

        {/* AI Smart Import Hero Card */}
        <div className="bg-gradient-to-r from-[#E6F4EA] to-[#D5EADB] dark:from-[#132B22] dark:to-[#0C1E18] border border-emerald-300/60 dark:border-emerald-800/50 rounded-3xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                AI Powered Feature
              </span>
            </div>
            <h3 className="text-xs font-black text-[#11241C] dark:text-white">
              Smart Product Import
            </h3>
            <p className="text-[11px] font-semibold text-[#44554E] dark:text-[#A2B3AA] max-w-[210px] leading-tight">
              Paste your raw bill, price list or catalog. Gemini AI auto-extracts names, prices & categories.
            </p>
          </div>

          <button
            onClick={() => setShowAiImportModal(true)}
            className="px-3 py-2 rounded-xl bg-[#063B2C] dark:bg-emerald-600 text-white text-xs font-black shadow-xs hover:bg-[#084D3A] active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            Import with AI
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E8E4DA] dark:border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'products'
                ? 'border-[#063B2C] text-[#063B2C] dark:border-emerald-400 dark:text-emerald-400 font-black'
                : 'border-transparent text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'subscription'
                ? 'border-[#063B2C] text-[#063B2C] dark:border-emerald-400 dark:text-emerald-400 font-black'
                : 'border-transparent text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pro Plan & Badge</span>
          </button>
        </div>

        {/* TAB 1: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#11241C] dark:text-white">
                Live Store Inventory
              </span>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#063B2C] dark:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Single Item</span>
              </button>
            </div>

            {products.length === 0 ? (
              <div className="py-8 text-center bg-white dark:bg-[#17231E] rounded-3xl border border-[#E8E4DA] dark:border-white/10 p-6 space-y-2">
                <Package className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
                <p className="text-xs font-bold text-[#11241C] dark:text-white">
                  No products added yet
                </p>
                <p className="text-[11px] text-gray-500">
                  Add items manually or use the AI Smart Product Import to populate your shop instantly.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {product.photoUrl ? (
                        <img
                          src={product.photoUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-[#11241C] dark:text-white leading-tight truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                          <span className="font-black text-[#063B2C] dark:text-emerald-400">
                            ₹{product.price}
                          </span>
                          <span className="text-gray-400 font-semibold">/{product.unit}</span>
                          <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-white/5 px-1.5 py-0.2 rounded">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Stock Toggle */}
                      <button
                        onClick={() => handleToggleProductStock(product)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                          product.inStock
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                        title="Click to toggle stock status"
                      >
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
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
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Current Tier</span>
                <h3 className="text-base font-black text-[#11241C] dark:text-white flex items-center gap-1.5">
                  <span>{shop.isFeatured ? 'Merchant Pro (Featured)' : 'Starter Merchant Plan'}</span>
                  {shop.isFeatured && (
                    <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-md">
                      PRO ACTIVE
                    </span>
                  )}
                </h3>
              </div>

              <ShieldCheck className="w-8 h-8 text-[#063B2C] dark:text-emerald-400" />
            </div>

            <div className="space-y-2 text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct customer WhatsApp ordering</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Contactless UPI QR code payment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited product catalog listings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Gemini AI Smart Product Extraction</span>
              </div>
            </div>

            {/* Upgrade banner if not featured */}
            {!shop.isFeatured ? (
              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-black/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 fill-amber-600" />
                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">
                    Upgrade to Merchant Pro (₹149/mo)
                  </h4>
                </div>
                <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 leading-snug">
                  Get Top Priority Ranking in Jalpaiguri Search, Verified Gold Merchant Badge, and 4x customer visibility.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Upgrade to Pro Now
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Your shop has Priority Search Placement and Verified Merchant Status in Jalpaiguri.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD SINGLE PRODUCT */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17231E] rounded-3xl max-w-sm w-full p-5 space-y-3 border border-[#E8E4DA] dark:border-white/10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-[#11241C] dark:text-white">
                Add Product to Catalog
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Miniket Rice (5kg Bag)"
                  className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">Bengali Name (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={newProductNameBn}
                  onChange={(e) => setNewProductNameBn(e.target.value)}
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
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="260"
                    className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#11241C] dark:text-white mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={newProductDiscount}
                    onChange={(e) => setNewProductDiscount(e.target.value)}
                    placeholder="240"
                    className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#11241C] dark:text-white mb-1">Unit</label>
                  <select
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
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
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    placeholder="e.g. Grocery"
                    className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">Photo URL (ঐচ্ছিক)</label>
                <input
                  type="url"
                  value={newProductPhoto}
                  onChange={(e) => setNewProductPhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={newProductInStock}
                  onChange={(e) => setNewProductInStock(e.target.checked)}
                  className="w-4 h-4 accent-[#063B2C]"
                />
                <label htmlFor="inStockCheck" className="font-bold text-[#11241C] dark:text-white">
                  Available in stock immediately
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E4DA] dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-5 py-2 rounded-xl bg-[#063B2C] text-white text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  {isSubmittingProduct ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AI SMART PRODUCT IMPORT */}
      {showAiImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17231E] rounded-3xl max-w-md w-full p-5 space-y-3 border border-[#E8E4DA] dark:border-white/10 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-[#11241C] dark:text-white">
                  AI Smart Product Import
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
                Paste any supplier invoice, handwritten list, or raw menu text below. Gemini 2.5 will structure it automatically into product name, Bengali title, price, unit and category!
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
                    className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold underline cursor-pointer"
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
                className="w-full py-2.5 rounded-xl bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isExtractingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Products with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract & Preview Items</span>
                  </>
                )}
              </button>

              {/* Extracted preview table */}
              {extractedProducts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#F0ECE1] dark:border-white/10">
                  <span className="font-black text-xs text-emerald-800 dark:text-emerald-400 block">
                    ✓ {extractedProducts.length} Items Extracted Successfully:
                  </span>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {extractedProducts.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <p className="font-bold text-[#11241C] dark:text-white">{item.name}</p>
                          <span className="text-[10px] text-gray-500">{item.category} • {item.unit}</span>
                        </div>
                        <span className="font-black text-emerald-700 dark:text-emerald-400">
                          ₹{item.price}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSaveAllExtracted}
                    disabled={isSavingExtracted}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    {isSavingExtracted ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save All to My Shop Catalog</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17231E] rounded-3xl max-w-sm w-full p-5 space-y-4 border border-[#E8E4DA] dark:border-white/10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-[#11241C] dark:text-white">
                Choose Merchant Plan
              </h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-[#063B2C] bg-[#E6F4EA] dark:bg-emerald-950/60'
                    : 'border-[#E8E4DA] dark:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-[#11241C] dark:text-white">Monthly Pro</span>
                  <span className="font-black text-sm text-[#063B2C] dark:text-emerald-400">₹149 / month</span>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">
                  Verified Gold Merchant Badge, Priority Search Ranking, Analytics.
                </p>
              </div>

              <div
                onClick={() => setSelectedPlan('yearly')}
                className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan === 'yearly'
                    ? 'border-[#063B2C] bg-[#E6F4EA] dark:bg-emerald-950/60'
                    : 'border-[#E8E4DA] dark:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-sm text-[#11241C] dark:text-white">Yearly Ultra</span>
                    <span className="ml-2 text-[10px] font-bold bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded">
                      SAVE 27%
                    </span>
                  </div>
                  <span className="font-black text-sm text-[#063B2C] dark:text-emerald-400">₹1,299 / year</span>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">
                  2 Months Free, Homepage Featured Storefront, Physical QR Standee delivered.
                </p>
              </div>
            </div>

            <button
              onClick={handleUpgradePlan}
              disabled={isUpgradingPlan}
              className="w-full py-3 rounded-2xl bg-[#063B2C] hover:bg-[#084D3A] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              {isUpgradingPlan ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Confirm Subscription & Activate</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
