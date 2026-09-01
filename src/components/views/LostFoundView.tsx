import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  HelpCircle,
  MapPin,
  Clock,
  Plus,
  Phone,
  Tag,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { LostFoundItem } from '../../types';

export const LostFoundView: React.FC = () => {
  const { goBack } = useNav();
  const { lostFound, reportLostFound } = useApp();
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Lost' | 'Found'>('Lost');
  const [category, setCategory] = useState<LostFoundItem['category']>('Wallet');
  const [location, setLocation] = useState('Kadamtala, Jalpaiguri');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('+91 98320 ');
  const [reward, setReward] = useState('');

  const filteredItems = lostFound.filter((item) => {
    if (filter !== 'all' && item.type.toLowerCase() !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handlePostItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    reportLostFound({
      type,
      category,
      title: title.trim(),
      location: location || 'Jalpaiguri',
      date: 'Just now',
      description: description || (reward ? `Reward offered: ${reward}` : 'Please contact if found.'),
      contactPreference: phone || '+91 98320 00000'
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setReward('');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 max-w-md mx-auto select-none">
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8E4DA]/50">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white border border-[#E8E4DA] flex items-center justify-center text-[#11241C] shadow-sm hover:bg-[#F3F0E6] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-[#11241C] tracking-tight">
            Lost & Found
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-2 rounded-full bg-[#063B2C] hover:bg-[#084D3A] text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Report Item</span>
        </button>
      </header>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="bg-white border border-[#D2CEBE] rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-xs">
          <Search className="w-4 h-4 text-[#55685F]" />
          <input
            type="text"
            placeholder="Search lost wallets, keys, pets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold text-[#11241C] placeholder:text-[#8C9B93] focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {['all', 'lost', 'found'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                filter === f
                  ? 'bg-[#063B2C] text-white shadow-xs'
                  : 'bg-white border border-[#D2CEBE] text-[#11241C]'
              }`}
            >
              {f === 'all' ? 'All Items' : f}
            </button>
          ))}
        </div>

        {/* Items List */}
        <div className="space-y-3 pt-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl p-6 border border-[#E8E4DA]">
              <HelpCircle className="w-12 h-12 text-[#8C9B93] mx-auto mb-3 opacity-60" />
              <h3 className="font-bold text-base text-[#11241C]">No items reported</h3>
              <p className="text-xs text-[#55685F] mt-1">
                Lost an item or found someone's belonging? Post a notice for Jalpaiguri citizens.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 bg-[#063B2C] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Post Notice
              </button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E8E4DA] rounded-3xl p-4 shadow-xs space-y-2.5 hover:border-[#063B2C] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      item.type === 'Lost'
                        ? 'bg-[#FFEBEA] text-[#D9383A]'
                        : 'bg-[#E6F4EA] text-[#063B2C]'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-[11px] font-semibold text-[#8C9B93] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.date}</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-[#11241C]">{item.title}</h3>

                <p className="text-xs text-[#55685F] flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#063B2C] shrink-0" />
                  <span>{item.location}</span>
                </p>

                {item.description && (
                  <p className="text-xs text-[#73827B]">{item.description}</p>
                )}

                <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#55685F]">
                    Category: <strong className="text-[#11241C]">{item.category}</strong>
                  </span>
                  <button
                    onClick={() =>
                      (window.location.href = `tel:${item.contactPreference.replace(/\s+/g, '')}`)
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-[#063B2C] hover:bg-[#084D3A] text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] pb-3">
              <h3 className="font-extrabold text-base text-[#11241C]">Report Lost or Found Item</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F3F0E6] flex items-center justify-center text-[#11241C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostItem} className="space-y-3.5">
              {/* Type toggle */}
              <div>
                <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">Status *</label>
                <div className="grid grid-cols-2 gap-2 bg-[#F1F5F9] p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('Lost')}
                    className={`py-2 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                      type === 'Lost' ? 'bg-[#EF4444] text-white shadow-xs' : 'text-[#64748B]'
                    }`}
                  >
                    I Lost Something
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('Found')}
                    className={`py-2 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                      type === 'Found' ? 'bg-[#10B981] text-white shadow-xs' : 'text-[#64748B]'
                    }`}
                  >
                    I Found Something
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Black Leather Wallet with Driving License"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-[#D2CEBE] rounded-xl p-3 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border border-[#D2CEBE] rounded-xl p-3 text-xs font-bold"
                  >
                    <option value="Wallet">Wallet</option>
                    <option value="Phone">Phone</option>
                    <option value="Documents">Documents</option>
                    <option value="Keys">Keys</option>
                    <option value="Pet">Pet</option>
                    <option value="Bag">Bag</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98320 XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-[#D2CEBE] rounded-xl p-3 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">Location / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Kadamtala Market near Sweet Shop"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-[#D2CEBE] rounded-xl p-3 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11241C] uppercase mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Color, brand markings, reward details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-[#D2CEBE] rounded-xl p-3 text-xs font-semibold"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#063B2C] text-white font-bold text-sm shadow-md hover:bg-[#084D3A] active:scale-98 transition-all cursor-pointer"
              >
                Post Community Notice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
