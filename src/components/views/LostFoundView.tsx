import React, { useState, useRef } from 'react';
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
  AlertCircle,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { LostFoundItem } from '../../types';
import { EmptyState } from '../common/EmptyState';

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
  const [imageUrl, setImageUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image is too large. Please select a photo under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

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
      contactPreference: phone || '+91 98320 00000',
      imageUrl: imageUrl || undefined
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setReward('');
    setImageUrl('');
    setUploadError(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 select-none transition-colors duration-200">
      <header className="w-full sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md border-b border-[#E8E4DA]/50 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-extrabold text-[#11241C] dark:text-white tracking-tight">
              Lost & Found
            </h1>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-2 rounded-full bg-[#007AFF] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Item</span>
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Search */}
        <div className="bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-xs">
          <Search className="w-4 h-4 text-[#55685F] dark:text-[#A2B3AA]" />
          <input
            type="text"
            placeholder="Search lost wallets, keys, pets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#73857C] bg-transparent focus:outline-none"
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
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A]'
              }`}
            >
              {f === 'all' ? 'All Items' : f}
            </button>
          ))}
        </div>

        {/* Items List */}
        <div className="space-y-3 pt-1">
          {filteredItems.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title={lostFound.length === 0 ? "No Items Reported" : "No Match Found"}
              description={lostFound.length === 0 
                ? "Jalpaiguri's community lost & found board is empty. Helping neighbors find their belongings starts here."
                : "No lost or found notices match your current search or filter."}
              actionLabel={lostFound.length === 0 ? "Post a Notice" : "Clear Search"}
              onAction={() => {
                if (lostFound.length === 0) {
                  setIsModalOpen(true);
                } else {
                  setFilter('all');
                  setSearch('');
                }
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3 hover:border-[#007AFF] dark:hover:border-blue-500 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Item Image if available */}
                    {item.imageUrl && (
                      <div className="relative w-full h-40 bg-gray-100 dark:bg-black/30 rounded-2xl overflow-hidden mb-2">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.type === 'Lost'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-[#007AFF] dark:text-[#38BDF8]'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] font-semibold text-[#8C9B93] dark:text-[#73857C] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.date}</span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white line-clamp-2">{item.title}</h3>

                    <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#007AFF] dark:text-blue-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </p>

                    {item.description && (
                      <p className="text-xs text-[#73827B] dark:text-gray-300 line-clamp-3 leading-relaxed bg-[#FAF8F5] dark:bg-black/10 p-2.5 rounded-xl border border-[#F0ECE1] dark:border-white/5">{item.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#F0ECE1] dark:border-white/10 flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                      Category: <strong className="text-[#11241C] dark:text-white font-extrabold">{item.category}</strong>
                    </span>
                    <button
                      onClick={() =>
                        (window.location.href = `tel:${item.contactPreference.replace(/\s+/g, '')}`)
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-[#007AFF] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17231E] rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-gray-100 dark:border-white/10 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] dark:border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-[#11241C] dark:text-white">Report Lost or Found Item</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F3F0E6] dark:bg-white/10 flex items-center justify-center text-[#11241C] dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostItem} className="space-y-4">
              {/* Type toggle */}
              <div>
                <label className="block text-xs font-black text-[#11241C] dark:text-gray-300 uppercase mb-1">Status *</label>
                <div className="grid grid-cols-2 gap-2 bg-[#F1F5F9] dark:bg-black/30 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('Lost')}
                    className={`py-2 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                      type === 'Lost' ? 'bg-[#EF4444] text-white shadow-xs' : 'text-[#64748B] dark:text-gray-400'
                    }`}
                  >
                    I Lost Something
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('Found')}
                    className={`py-2 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                      type === 'Found' ? 'bg-[#10B981] text-white shadow-xs' : 'text-[#64748B] dark:text-gray-400'
                    }`}
                  >
                    I Found Something
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#11241C] dark:text-gray-300 uppercase mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Black Leather Wallet with Driving License"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-[#D2CEBE] dark:border-white/10 bg-white dark:bg-[#131F1A] text-[#11241C] dark:text-white rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#11241C] dark:text-gray-300 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border border-[#D2CEBE] dark:border-white/10 bg-white dark:bg-[#131F1A] text-[#11241C] dark:text-white rounded-xl p-3 text-xs font-bold focus:outline-none"
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
                  <label className="block text-xs font-black text-[#11241C] dark:text-gray-300 uppercase mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98320 XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-[#D2CEBE] dark:border-white/10 bg-white dark:bg-[#131F1A] text-[#11241C] dark:text-white rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#11241C] dark:text-gray-300 uppercase mb-1">Location / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Kadamtala Market near Sweet Shop"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-[#D2CEBE] dark:border-white/10 bg-white dark:bg-[#131F1A] text-[#11241C] dark:text-white rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#11241C] dark:text-gray-300 uppercase mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Color, brand markings, reward details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-[#D2CEBE] dark:border-white/10 bg-white dark:bg-[#131F1A] text-[#11241C] dark:text-white rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                ></textarea>
              </div>

              {/* Photo Upload Area */}
              <div className="space-y-2 border-t border-[#E8E4DA] dark:border-white/10 pt-3">
                <label className="block text-xs font-black text-[#11241C] dark:text-gray-300 uppercase">Item Photo</label>
                
                {imageUrl ? (
                  <div className="relative aspect-video rounded-2xl bg-[#FAF8F5] dark:bg-black/30 border border-[#D2CEBE] dark:border-white/10 overflow-hidden flex items-center justify-center group">
                    <img src={imageUrl} alt="Uploaded item" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Remove Photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#D2CEBE] dark:border-white/10 hover:border-[#007AFF] dark:hover:border-blue-500 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-[#FAF8F5] dark:bg-[#131F1A]/50 hover:bg-white dark:hover:bg-[#131F1A] transition-all"
                    >
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Click to upload item photo</span>
                      <span className="text-[10px] text-gray-400">JPEG, PNG or WEBP (Max 5MB)</span>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="h-px bg-gray-200 dark:bg-white/10 flex-1"></span>
                      <span className="text-[10px] uppercase font-bold text-gray-400">OR</span>
                      <span className="h-px bg-gray-200 dark:bg-white/10 flex-1"></span>
                    </div>

                    <input
                      type="url"
                      placeholder="Or paste direct image address URL..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full border border-[#D2CEBE] dark:border-white/10 bg-white dark:bg-[#131F1A] text-[#11241C] dark:text-white rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    />
                  </div>
                )}
                {uploadError && (
                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#007AFF] text-white font-bold text-sm shadow-md hover:bg-blue-700 active:scale-98 transition-all cursor-pointer"
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
