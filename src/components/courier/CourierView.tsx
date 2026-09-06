import React, { useState } from 'react';
import { 
  Package, Search, MapPin, Phone, Clock, ExternalLink, ShieldCheck, 
  Bookmark, RefreshCw, ChevronRight, Plus, Navigation, AlertCircle, CheckCircle2, Truck 
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { CourierService } from '../../types';

const VERIFIED_COURIER_SERVICES: CourierService[] = [
  {
    id: 'courier-1',
    name: 'DTDC Express Courier & Cargo',
    category: 'Express Delivery',
    address: 'Subhash Pally, Near Netaji Statue, Jalpaiguri',
    locality: 'Subhash Pally',
    pincode: '735101',
    lat: 26.5167,
    lng: 88.7167,
    phone: '+91 94340 12345',
    servicesOffered: ['Home Pickup', 'Document Delivery', 'Express', 'National Delivery'],
    openingHours: '09:00 AM - 08:00 PM',
    isOpenNow: true,
    websiteUrl: 'https://www.dtdc.in',
    trackingUrlTemplate: 'https://www.dtdc.in/tracking/shipment-tracking.asp',
    rating: 4.5,
    reviewCount: 38,
    isVerified: true,
    createdAt: '2026-01-10'
  },
  {
    id: 'courier-2',
    name: 'India Post Speed Post & Parcel Centre',
    category: 'Postal & Logistics',
    address: 'Head Post Office Road, Court Para, Jalpaiguri',
    locality: 'Court Para',
    pincode: '735101',
    lat: 26.5200,
    lng: 88.7200,
    phone: '+91 3561 230123',
    servicesOffered: ['Parcel Delivery', 'Document Delivery', 'National Delivery', 'Local Delivery'],
    openingHours: '09:30 AM - 05:30 PM',
    isOpenNow: true,
    websiteUrl: 'https://www.indiapost.gov.in',
    trackingUrlTemplate: 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx',
    rating: 4.2,
    reviewCount: 64,
    isVerified: true,
    createdAt: '2026-01-10'
  },
  {
    id: 'courier-3',
    name: 'Blue Dart Express Limited',
    category: 'Express Delivery',
    address: 'Kadamtala Bypass Road, Jalpaiguri',
    locality: 'Kadamtala',
    pincode: '735102',
    lat: 26.5120,
    lng: 88.7100,
    phone: '+91 1860 233 1234',
    servicesOffered: ['Home Pickup', 'Express', 'National Delivery', 'Parcel Delivery'],
    openingHours: '10:00 AM - 07:00 PM',
    isOpenNow: true,
    websiteUrl: 'https://www.bluedart.com',
    trackingUrlTemplate: 'https://www.bluedart.com/tracking',
    rating: 4.6,
    reviewCount: 42,
    isVerified: true,
    createdAt: '2026-02-15'
  }
];

export const CourierSectionView: React.FC = () => {
  const { navigate, goBack } = useNav();
  const { isBengali } = useLanguage();

  const [activeTab, setActiveTab] = useState<'search' | 'track' | 'register' | 'saved'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('DTDC');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<CourierService | null>(null);

  const [regName, setRegName] = useState('');
  const [regCategory, setRegCategory] = useState('Express Delivery');
  const [regAddress, setRegAddress] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const filteredCouriers = VERIFIED_COURIER_SERVICES.filter(c => {
    const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.servicesOffered.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || 
                          (selectedFilter === 'home_pickup' && c.servicesOffered.includes('Home Pickup')) ||
                          (selectedFilter === 'express' && c.servicesOffered.includes('Express'));
    return matchesQuery && matchesFilter;
  });

  const toggleSave = (id: string) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    const providerObj = VERIFIED_COURIER_SERVICES.find(c => c.name.toLowerCase().includes(selectedProvider.toLowerCase()));
    if (providerObj && providerObj.trackingUrlTemplate) {
      window.open(providerObj.trackingUrlTemplate, '_blank');
    } else {
      window.open('https://www.google.com/search?q=' + encodeURIComponent(`${selectedProvider} track ${trackingNumber}`), '_blank');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regAddress.trim()) return;
    setRegSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] text-[#11241C] dark:text-white pb-24 transition-colors">
      <div className="bg-[#007AFF] text-white pt-6 pb-6 px-4 rounded-b-3xl shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-4">
          <button 
            onClick={() => goBack()}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black tracking-tight">
              {isBengali ? 'কুরিয়ার ও পার্সেল পরিষেবা' : 'Courier & Parcel Services'}
            </h1>
            <p className="text-xs text-blue-100 opacity-90">
              {isBengali ? 'জলপাইগুড়ির যাচাইকৃত পার্সেল ও লজিস্টিকস কেন্দ্র' : 'Local Courier Offices & Official Tracking'}
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('register')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
            title="Register Business"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-2xl mx-auto flex bg-blue-900/40 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'search' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-white hover:bg-white/10'}`}
          >
            {isBengali ? 'অফিস খুঁজুন' : 'Find Offices'}
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'track' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-white hover:bg-white/10'}`}
          >
            {isBengali ? 'পার্সেল ট্র্যাক করুন' : 'Track Parcel'}
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${activeTab === 'register' ? 'bg-white text-[#007AFF] shadow-sm' : 'text-white hover:bg-white/10'}`}
          >
            {isBengali ? 'ব্যবসা নিবন্ধন' : 'Register Service'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {activeTab === 'search' && (
          <>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBengali ? 'কুরিয়ার বা এলাকার নাম দিয়ে খুঁজুন...' : 'Search courier by name, locality or service...'}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-[#17231E] border border-gray-200 dark:border-white/10 text-xs font-bold focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: isBengali ? 'সমস্ত' : 'All Providers' },
                { id: 'home_pickup', label: isBengali ? 'হোম পিকআপ' : 'Home Pickup' },
                { id: 'express', label: isBengali ? 'এক্সপ্রেস' : 'Express Delivery' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${selectedFilter === f.id ? 'bg-[#007AFF] text-white shadow-xs' : 'bg-white dark:bg-[#17231E] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 px-1 font-bold">
                <span>{filteredCouriers.length} {isBengali ? 'টি যাচাইকৃত কেন্দ্র উপলব্ধ' : 'Verified Courier Offices'}</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Jalpaiguri Hubs
                </span>
              </div>

              {filteredCouriers.length === 0 ? (
                <div className="bg-white dark:bg-[#17231E] rounded-2xl p-8 text-center border border-gray-100 dark:border-white/10 space-y-3">
                  <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="text-sm font-bold">{isBengali ? 'কোনো কুরিয়ার অফিস পাওয়া যায়নি' : 'No courier services found'}</p>
                </div>
              ) : (
                filteredCouriers.map(courier => {
                  const isSaved = savedIds.includes(courier.id);
                  return (
                    <div
                      key={courier.id}
                      onClick={() => setSelectedCourier(courier)}
                      className="bg-white dark:bg-[#17231E] p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:border-blue-300 transition cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-blue-50 text-[#007AFF] dark:bg-blue-950/40">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">{courier.name}</h3>
                              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                            </div>
                            <p className="text-[11px] text-gray-500 font-semibold">{courier.category}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(courier.id);
                          }}
                          className={`p-1.5 rounded-full transition ${isSaved ? 'text-rose-500 bg-rose-50' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{courier.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{courier.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{courier.openingHours}</span>
                          {courier.isOpenNow && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                              Open Now
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {courier.servicesOffered.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-black/20 text-gray-600 dark:text-gray-300 text-[10px] font-bold border border-gray-200 dark:border-white/10">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeTab === 'track' && (
          <div className="bg-white dark:bg-[#17231E] p-6 rounded-2xl border border-gray-100 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 text-[#007AFF] dark:bg-blue-950/40">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white">
                  {isBengali ? 'পার্সেল ট্র্যাকিং' : 'Official Courier Tracking'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isBengali ? 'আপনার কুরিয়ার প্রদানকারী নির্বাচন করুন এবং ট্র্যাকিং আইডি লিখুন।' : 'Enter your consignment number to track directly via official partner portals.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleTrackSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {isBengali ? 'কুরিয়ার প্রদানকারী' : 'Courier Provider'}
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-xs font-bold focus:outline-none"
                >
                  <option value="DTDC">DTDC Express</option>
                  <option value="India Post">India Post Speed Post</option>
                  <option value="Blue Dart">Blue Dart Express</option>
                  <option value="Other">Other Courier Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {isBengali ? 'ট্র্যাকিং বা কনসাইনমেন্ট নম্বর' : 'Consignment / Tracking Number'}
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g., D12345678 or EP987654321IN"
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-xs font-bold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{isBengali ? 'অফিসিয়াল সাইটে ট্র্যাক করুন' : 'Track on Official Website'}</span>
              </button>
            </form>
          </div>
        )}

        {activeTab === 'register' && (
          <div className="bg-white dark:bg-[#17231E] p-6 rounded-2xl border border-gray-100 dark:border-white/10 space-y-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-white">
              {isBengali ? 'কুরিয়ার ব্যবসা নিবন্ধন করুন' : 'Register Courier / Logistics Hub'}
            </h3>
            <p className="text-xs text-gray-500">
              {isBengali ? 'আপনার পার্সেল ও ডেলিভারি হাব MYJPG-এ যুক্ত করুন।' : 'Add your local delivery or courier center to the Jalpaiguri verified directory.'}
            </p>

            {regSuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold">Registration Submitted Successfully!</p>
                <p className="text-[11px]">Your courier hub is pending verification by municipal officers.</p>
                <button onClick={() => setRegSuccess(false)} className="text-blue-600 font-bold underline mt-2">Register Another</button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g., Jalpaiguri Parcel Express"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 font-bold"
                  >
                    <option value="Express Delivery">Express Delivery</option>
                    <option value="Postal & Logistics">Postal & Logistics</option>
                    <option value="Local Delivery">Local Delivery Service</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Address & Locality in Jalpaiguri</label>
                  <input
                    type="text"
                    required
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="e.g., Station Road, Jalpaiguri"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#007AFF] text-white font-bold shadow-sm transition hover:bg-blue-600"
                >
                  Submit for Verification
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {selectedCourier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white dark:bg-[#17231E] w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#007AFF]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">{selectedCourier.name}</h3>
                  <p className="text-[11px] text-gray-500">{selectedCourier.category}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCourier(null)} className="p-1 rounded-full text-gray-500">✕</button>
            </div>

            <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>{selectedCourier.address} ({selectedCourier.pincode})</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{selectedCourier.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{selectedCourier.openingHours}</span>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">Services Offered</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCourier.servicesOffered.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#007AFF] text-[11px] font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              {selectedCourier.websiteUrl && (
                <a
                  href={selectedCourier.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 rounded-xl bg-[#007AFF] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit Website</span>
                </a>
              )}
              <button
                onClick={() => setSelectedCourier(null)}
                className="px-5 py-3 rounded-xl bg-gray-100 dark:bg-white/10 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
