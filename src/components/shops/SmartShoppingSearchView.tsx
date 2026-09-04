import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Sparkles,
  ShoppingBag,
  Store,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronRight,
  Loader2,
  Clock
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Shop, Product } from '../../types';

export const SmartShoppingSearchView: React.FC = () => {
  const { navigate, goBack } = useNav();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'finder' | 'list'>('finder');

  // Finder State
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ shop: Shop; matchingProducts: Product[] }[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Shopping List State
  const [listItems, setListItems] = useState<string[]>([
    'Miniket Rice 5kg',
    'Mustard Oil 1L',
    'Tata Salt 1kg'
  ]);
  const [newItemText, setNewItemText] = useState('');
  const [isMatchingList, setIsMatchingList] = useState(false);
  const [matchedShops, setMatchedShops] = useState<any[]>([]);

  // Search single item
  const handleSearchItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/shops/search-item?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('Failed to search item:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Add item to shopping list
  const handleAddListItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setListItems(prev => [...prev, newItemText.trim()]);
    setNewItemText('');
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setListItems(prev => prev.filter((_, i) => i !== index));
  };

  // Match entire shopping list against shops
  const handleMatchList = async () => {
    if (listItems.length === 0) return;
    setIsMatchingList(true);

    try {
      const res = await fetch('/api/shops/match-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: listItems })
      });

      if (res.ok) {
        const data = await res.json();
        setMatchedShops(data.matches || []);
      }
    } catch (err) {
      console.error('Failed to match shopping list:', err);
    } finally {
      setIsMatchingList(false);
    }
  };

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
              <span>{language === 'bn' ? 'স্মার্ট শপিং' : 'Smart Shopping'}</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </h1>
            <p className="text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA]">
              {language === 'bn' ? 'জলপাইগুড়ির দোকানে পণ্য সন্ধান' : 'Find items in Jalpaiguri stores'}
            </p>
          </div>
        </div>
      </header>

      {/* Tabs: Find Where Available vs My Shopping List */}
      <div className="px-4 pt-3">
        <div className="bg-[#E8E4DA]/40 dark:bg-white/5 p-1 rounded-2xl flex items-center text-xs font-bold">
          <button
            onClick={() => setActiveTab('finder')}
            className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'finder'
                ? 'bg-white dark:bg-[#17231E] text-[#063B2C] dark:text-emerald-400 shadow-xs font-black'
                : 'text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কোথায় পাবেন?' : 'Find Where Available'}</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-white dark:bg-[#17231E] text-[#063B2C] dark:text-emerald-400 shadow-xs font-black'
                : 'text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কেনাকাটার ফর্দ' : 'My Shopping List'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* TAB 1: FIND WHERE AVAILABLE */}
        {activeTab === 'finder' && (
          <div className="space-y-4">
            {/* Search Input */}
            <form onSubmit={handleSearchItem} className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={language === 'bn' ? 'যেকোনো পণ্যের নাম লিখুন (যেমন: Dolo 650, চাল, মিষ্টি)...' : 'Type item name (e.g. Dolo 650, Rice, Mustard Oil)...'}
                className="w-full pl-10 pr-20 py-3 bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-2xl text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#063B2C] shadow-xs"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#063B2C] dark:bg-emerald-600 text-white text-xs font-bold shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
              </button>
            </form>

            {/* Quick Suggestions Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-bold">
              <span className="text-gray-400 shrink-0">Popular:</span>
              {['Rice 5kg', 'Mustard Oil', 'Paracetamol', 'Sandesh', 'Fresh Paneer', 'LED Bulb'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setQuery(chip);
                    setTimeout(() => {
                      fetch(`/api/shops/search-item?q=${encodeURIComponent(chip)}`)
                        .then(r => r.json())
                        .then(d => {
                          setSearchResults(d.results || []);
                          setHasSearched(true);
                        });
                    }, 50);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 text-gray-700 dark:text-gray-300 shrink-0 hover:bg-gray-50 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Results Display */}
            {hasSearched && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#11241C] dark:text-white">
                  <span>
                    Found in {searchResults.length} store{searchResults.length === 1 ? '' : 's'} in Jalpaiguri:
                  </span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="py-8 text-center bg-white dark:bg-[#17231E] rounded-3xl border border-[#E8E4DA] dark:border-white/10 p-6 space-y-2">
                    <Store className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
                    <p className="text-xs font-bold text-[#11241C] dark:text-white">
                      Item currently not listed in digital catalogs
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Try searching a general category (e.g. "Grocery", "Pharmacy") or message nearest local shops directly.
                    </p>
                  </div>
                ) : (
                  searchResults.map(({ shop, matchingProducts }) => (
                    <div
                      key={shop.id}
                      onClick={() => navigate('shop-detail', { shopId: shop.id })}
                      className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-3.5 shadow-2xs hover:border-[#063B2C] transition-all cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-black text-sm text-[#11241C] dark:text-white">
                            {shop.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#55685F] dark:text-[#A2B3AA] font-semibold mt-0.5">
                            <MapPin className="w-3 h-3 text-[#063B2C] dark:text-emerald-400" />
                            <span>{shop.locality}</span>
                            <span>•</span>
                            <span>{shop.distance}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          shop.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {shop.isOpen ? 'Open Now' : 'Closed'}
                        </span>
                      </div>

                      {/* Matching Product Pills */}
                      <div className="space-y-1.5">
                        {matchingProducts.map((p) => (
                          <div
                            key={p.id}
                            className="bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl p-2 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-[#11241C] dark:text-white">{p.name}</p>
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                                {p.inStock ? '✓ In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <span className="font-black text-sm text-[#063B2C] dark:text-emerald-400">
                              ₹{p.price}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="pt-2 border-t border-[#F0ECE1] dark:border-white/10 flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${shop.phone.replace(/\s+/g, '')}`;
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#D2EBE0] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const msg = encodeURIComponent(`Nomoshkar ${shop.name}! Is "${matchingProducts[0]?.name || query}" available right now? Saw on Jalpaiguri Connect.`);
                            const wa = (shop.whatsappNumber || shop.phone).replace(/\D/g, '');
                            window.open(`https://wa.me/91${wa.slice(-10)}?text=${msg}`, '_blank');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp Order</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY SHOPPING LIST */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-[#11241C] dark:text-white">
                {language === 'bn' ? 'আপনার কেনাকাটার ফর্দ' : 'Jalpaiguri Family Shopping List'}
              </h3>
              <p className="text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA]">
                Add your groceries or medicine list. We will match it against local shops to find who has the most items in stock!
              </p>

              {/* Add item input */}
              <form onSubmit={handleAddListItem} className="flex gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="e.g. Amul Butter, Dolo 650, Atta 5kg..."
                  className="flex-1 px-3 py-2 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl text-xs font-semibold text-[#11241C] dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-[#063B2C] dark:bg-emerald-600 text-white text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              {/* Items List */}
              <div className="space-y-1.5 pt-1">
                {listItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-[#11241C] dark:text-white">{item}</span>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-gray-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Match Button */}
              <button
                onClick={handleMatchList}
                disabled={isMatchingList || listItems.length === 0}
                className="w-full py-3 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              >
                {isMatchingList ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Matching against Jalpaiguri shops...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Find Nearest Shop with All Items</span>
                  </>
                )}
              </button>
            </div>

            {/* Matched Shops Results */}
            {matchedShops.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block">
                  ✓ Best Local Stores for Your List:
                </span>

                {matchedShops.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-4 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-sm text-[#11241C] dark:text-white">
                          {m.shop.name}
                        </h4>
                        <p className="text-[11px] font-semibold text-gray-500">
                          {m.shop.locality} • {m.shop.distance}
                        </p>
                      </div>

                      <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg">
                        {m.matchCount} of {listItems.length} items found
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const msg = `Nomoshkar ${m.shop.name}! I would like to order the following items from Jalpaiguri Connect:\n${listItems.map((it, i) => `${i+1}. ${it}`).join('\n')}\nCan you deliver to my address?`;
                        const wa = (m.shop.whatsappNumber || m.shop.phone).replace(/\D/g, '');
                        window.open(`https://wa.me/91${wa.slice(-10)}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Entire List via WhatsApp</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
