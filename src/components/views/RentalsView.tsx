import React, { useState } from 'react';
import {
  ArrowLeft,
  Home as HomeIcon,
  MapPin,
  Phone,
  Bed,
  Bath,
  Plus,
  Search,
  CheckCircle2,
  X,
  Building,
  Tag
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { RentalProperty } from '../../types';

export const RentalsView: React.FC = () => {
  const { goBack } = useNav();
  const { rentals, addRental } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // New property form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<RentalProperty['type']>('Flat');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('₹10,000');
  const [area, setArea] = useState('Kadamtala, Jalpaiguri');
  const [contact, setContact] = useState('+91 98320 ');
  const [description, setDescription] = useState('');

  const types = ['All', 'Flat', 'Room', 'Shop', 'PG', 'Hostel'];

  const filteredRentals = rentals.filter((r) => {
    if (filterType !== 'All' && r.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.area.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handlePostProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rent.trim()) return;

    const formattedRent = rent.startsWith('₹') ? rent : `₹${rent}/mo`;

    const newProperty: RentalProperty = {
      id: 'rent-' + Date.now(),
      title: title.trim(),
      type: type,
      rent: formattedRent,
      deposit: deposit || '1 Month Rent',
      area: area || 'Jalpaiguri',
      distance: '1.0 km',
      amenities: ['Water 24x7', 'Bike Parking', 'Separate Meter'],
      imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&auto=format&fit=crop&q=80',
      contact: contact || '+91 98320 00000',
      description: description || 'Well-maintained space available for rent immediately.'
    };

    addRental(newProperty);
    setIsPostModalOpen(false);
    setTitle('');
    setRent('');
    setDescription('');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 max-w-md mx-auto select-none transition-colors">
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8E4DA]/50 dark:border-white/10 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-[#11241C] dark:text-white tracking-tight">
            Rentals & Properties
          </h1>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="px-3 py-2 rounded-full bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Post Listing</span>
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Search Input */}
        <div className="bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-xs transition-colors">
          <Search className="w-4 h-4 text-[#55685F] dark:text-[#A2B3AA]" />
          <input
            type="text"
            placeholder="Search flats, shops, areas in Jalpaiguri..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#A2B3AA] bg-transparent focus:outline-none"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-[#063B2C] dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#17231E] text-[#11241C] dark:text-white border border-[#D2CEBE] dark:border-white/10 hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Property List */}
        <div className="space-y-3 pt-1">
          {filteredRentals.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#17231E] rounded-3xl p-6 border border-[#E8E4DA] dark:border-white/10 transition-colors">
              <Building className="w-12 h-12 text-[#8C9B93] dark:text-[#A2B3AA] mx-auto mb-3 opacity-60" />
              <h3 className="font-bold text-base text-[#11241C] dark:text-white">No listings found</h3>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-1">
                Be the first to list a room, flat, or commercial space in this area.
              </p>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="mt-4 px-4 py-2 bg-[#063B2C] dark:bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Post Your Property
              </button>
            </div>
          ) : (
            filteredRentals.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-2.5 hover:border-[#063B2C] dark:hover:border-emerald-500 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-400 border border-transparent dark:border-emerald-800/40 px-2 py-0.5 rounded-md inline-block mb-1">
                      {p.type}
                    </span>
                    <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white leading-snug">{p.title}</h3>
                  </div>
                  <span className="font-extrabold text-sm text-[#063B2C] dark:text-emerald-300 bg-[#E6F4EA] dark:bg-emerald-950/60 border border-transparent dark:border-emerald-800/40 px-2.5 py-1 rounded-xl shrink-0">
                    {p.rent}
                  </span>
                </div>

                <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400 shrink-0" />
                  <span>{p.area}</span>
                </p>

                {p.description && (
                  <p className="text-xs text-[#73827B] dark:text-[#A2B3AA] line-clamp-2">{p.description}</p>
                )}

                <div className="pt-2 border-t border-[#F0ECE1] dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#55685F] dark:text-[#A2B3AA]">Deposit: {p.deposit}</span>
                  <button
                    onClick={() => window.location.href = `tel:${p.contact.replace(/\s+/g, '')}`}
                    className="px-4 py-2 rounded-xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact Owner</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Post Property Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17231E] border border-transparent dark:border-white/10 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 transition-colors">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] dark:border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-[#11241C] dark:text-white">List Rental Property</h3>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F3F0E6] dark:bg-[#121E19] flex items-center justify-center text-[#11241C] dark:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostProperty} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spacious 2BHK Flat near Kadamtala"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-[#D2CEBE] dark:border-white/10 bg-white dark:bg-[#121E19] text-[#11241C] dark:text-white rounded-xl p-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full border border-[#D2CEBE] dark:border-white/10 bg-white dark:bg-[#121E19] text-[#11241C] dark:text-white rounded-xl p-3 text-xs font-bold focus:outline-none"
                  >
                    <option value="Flat">Flat</option>
                    <option value="Room">Room</option>
                    <option value="Shop">Shop</option>
                    <option value="PG">PG</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase mb-1">Monthly Rent *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹8,000"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    className="w-full border border-[#D2CEBE] dark:border-white/10 bg-white dark:bg-[#121E19] text-[#11241C] dark:text-white rounded-xl p-3 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase mb-1">Security Deposit</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹15,000"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    className="w-full border border-[#D2CEBE] dark:border-white/10 bg-white dark:bg-[#121E19] text-[#11241C] dark:text-white rounded-xl p-3 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98320 XXXXX"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full border border-[#D2CEBE] dark:border-white/10 bg-white dark:bg-[#121E19] text-[#11241C] dark:text-white rounded-xl p-3 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase mb-1">Area / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. Silpasamiti Para, Jalpaiguri"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full border border-[#D2CEBE] dark:border-white/10 bg-white dark:bg-[#121E19] text-[#11241C] dark:text-white rounded-xl p-3 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11241C] dark:text-white uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Nearby landmarks, floor number, water timing..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-[#D2CEBE] dark:border-white/10 bg-white dark:bg-[#121E19] text-[#11241C] dark:text-white rounded-xl p-3 text-xs font-semibold focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-[#084D3A] active:scale-98 transition-all cursor-pointer"
              >
                Publish Listing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
